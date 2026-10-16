import pytest
import asyncio
from app.pipeline.preprocessor import preprocessor
from app.pipeline.claim_extractor import claim_extractor
from app.pipeline.classifier import classifier
from app.pipeline.embedder import embedder
from app.pipeline.searcher import evidence_searcher
from app.pipeline.ranker import evidence_ranker
from app.pipeline.confidence import confidence_engine
from app.pipeline.assessor import claim_assessor
from app.models.schemas import (
    RawEvidenceItem,
    RankedEvidenceItem,
    EvidenceRelationship,
    AssessmentStatus,
    ConfidenceLabel
)

def test_preprocessor_whitespace_and_language():
    text = "   This   is   a test   with  multiple spaces. \u00a0 And non-breaking space.  "
    prep = preprocessor.preprocess(text)
    assert "  " not in prep.normalized_text
    assert prep.detected_language == "en"
    assert prep.sentence_count >= 1

def test_sentence_splitting_with_abbreviations():
    text = "Dr. Smith met with Sen. Johnson in the U.S. capital yesterday. They discussed bill H.R. 402."
    sentences = preprocessor.split_sentences(text)
    # Shouldn't split at Dr. or Sen. or U.S.
    assert len(sentences) == 2

def test_claim_extraction_and_verifiability():
    text = "The government announced a new policy yesterday. It will reduce electricity prices by 40%, and every household will receive a subsidy."
    claims = claim_extractor.extract_claims(text)
    assert len(claims) >= 2
    
    # Check numbers and dates
    found_percentage = any("40%" in c.numeric_values for c in claims)
    assert found_percentage is True

    # Test opinion non-verifiability
    opinion = "In my opinion, this policy is probably the worst decision ever."
    op_claims = claim_extractor.extract_claims(opinion)
    if op_claims:
        assert op_claims[0].is_verifiable is False

def test_classifier_categories():
    assert classifier.classify("New clinical trial cures cancer with vaccine") == "Health & Medicine"
    assert classifier.classify("Central bank raised interest rates to combat inflation") == "Finance & Economics"
    assert classifier.classify("NASA telescope discovers new exoplanet in deep space") == "Science & Technology"
    assert classifier.classify("Police arrest suspect in downtown fraud investigation") == "Crime & Public Safety"

def test_trusted_source_registry():
    src_who = evidence_searcher.registry.lookup("https://www.who.int/news/item/test")
    assert src_who["is_primary_source"] is True
    assert src_who["reliability_tier"] == "TIER_1"

    src_reuters = evidence_searcher.registry.lookup("https://reuters.com/world/article")
    assert src_reuters["reliability_tier"] == "TIER_1"

def test_evidence_ranking_and_stance():
    claim = "Electricity prices will fall by 40%"
    items = [
        RawEvidenceItem(
            source_url="https://reuters.com/energy",
            source_title="Energy tariffs reduced by 40 percent officially confirmed",
            snippet="Officials confirmed electricity prices will fall by 40% starting next month.",
            retrieved_at="2026-10-16T12:00:00",
            domain="reuters.com",
            is_primary_source=False,
            reliability_tier="TIER_1",
            search_query="test"
        ),
        RawEvidenceItem(
            source_url="https://apnews.com/factcheck",
            source_title="Fact Check: Claims of free electricity are false and debunked",
            snippet="Claims that electricity prices will fall by 40% are false, debunked, and misleading.",
            retrieved_at="2026-10-16T12:00:00",
            domain="apnews.com",
            is_primary_source=False,
            reliability_tier="TIER_1",
            search_query="test"
        )
    ]
    ranked = evidence_ranker.rank_evidence(claim, items)
    assert len(ranked) == 2
    assert ranked[0].evidence_relationship == EvidenceRelationship.SUPPORTS
    assert ranked[1].evidence_relationship == EvidenceRelationship.REFUTES
    assert ranked[0].directness == "direct"

def test_confidence_engine_calibration():
    claim = "Electricity prices cut by 40%"
    # 2 independent sources
    items = [
        RankedEvidenceItem(
            source_url="https://reuters.com/1",
            source_title="Reuters Title",
            domain="reuters.com",
            snippet="40% electricity cut",
            passage="40% electricity cut",
            retrieved_at="2026-10-16",
            search_query="q",
            evidence_relationship=EvidenceRelationship.SUPPORTS,
            directness="direct",
            final_rank_score=0.8
        ),
        RankedEvidenceItem(
            source_url="https://bbc.com/1",
            source_title="BBC Title",
            domain="bbc.com",
            snippet="Confirmed 40% tariff reduction",
            passage="Confirmed 40% tariff reduction",
            retrieved_at="2026-10-16",
            search_query="q",
            evidence_relationship=EvidenceRelationship.SUPPORTS,
            directness="direct",
            final_rank_score=0.75
        )
    ]
    conf = confidence_engine.calculate_confidence(claim, items, is_verifiable=True)
    assert conf.independent_sources_count == 2
    assert conf.confidence_label in [ConfidenceLabel.HIGH, ConfidenceLabel.MEDIUM]
    assert conf.calculated_confidence_score >= 0.50

def test_insufficient_evidence_never_assumes_false():
    claim = "Secret event happened with zero records"
    conf = confidence_engine.calculate_confidence(claim, [], is_verifiable=True)
    assert conf.confidence_label == ConfidenceLabel.VERY_LOW
    assert conf.independent_sources_count == 0

@pytest.mark.asyncio
async def test_claim_assessor_full_pipeline(monkeypatch):
    monkeypatch.setattr("app.core.config.settings.SEARCH_PROVIDER", "mock")
    claims = claim_extractor.extract_claims("The Ministry of Energy yesterday confirmed a new regulatory framework that will reduce electricity prices by 40%.")
    assert len(claims) >= 1
    assessment = await claim_assessor.assess_claim(claims[0])
    assert assessment.assessment_status in [AssessmentStatus.SUPPORTED, AssessmentStatus.MIXED, AssessmentStatus.INSUFFICIENT_EVIDENCE]
    assert len(assessment.citations) > 0
    assert assessment.confidence.calculated_confidence_score > 0
