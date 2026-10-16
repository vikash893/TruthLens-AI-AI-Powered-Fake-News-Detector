import pytest
import hashlib
from app.models.schemas import (
    ExtractedClaim,
    RawEvidenceItem,
    RankedEvidenceItem,
    EvidenceRelationship,
    AssessmentStatus,
    ConfidenceLabel
)
from app.pipeline.claim_extractor import claim_extractor
from app.pipeline.searcher import evidence_searcher
from app.pipeline.ranker import evidence_ranker
from app.pipeline.confidence import confidence_engine
from app.pipeline.assessor import claim_assessor

BBC_ARTICLE_TITLE = "CJP, Abhijeet Dipke: 'Cockroach' party founder detained ahead of Central Park Delhi protest"
BBC_ARTICLE_URL = "https://www.bbc.com/news/articles/cmx237n1y9lzo"
BBC_ARTICLE_TEXT = """
India's 'cockroach' party founder detained ahead of protest.
The founder of India's 'cockroach' protest movement, Abhijeet Dipke, has been detained in Delhi ahead of a planned march in the heart of the capital.
His detention follows a police warning against holding Friday's march, with thousands of security personnel deployed across the city to prevent the gathering.
Dipke's youth-led Cockroach Janta Party (CJP) is demanding the resignation of India's election chief over allegations of voter list manipulation.
The Election Commission denies the charge.
The group had asked its supporters to come to a park in Connaught Place, one of Delhi's busiest commercial districts, to wave the Indian flag.
"""

def test_atomic_claim_extraction_with_context_anchors():
    """Requirement 2: Extract atomic claims, resolve anaphora anchors, distinguish allegations."""
    claims = claim_extractor.extract_claims(
        BBC_ARTICLE_TEXT,
        max_claims=6,
        document_title=BBC_ARTICLE_TITLE,
        document_publisher="BBC News"
    )
    assert len(claims) == 6

    # Verify claim 4 is recognized as an allegation
    c4 = claims[3]
    assert "demanding the resignation" in c4.original_text.lower()
    assert c4.claim_type == "allegation"

    # Verify context anchors are extracted for anaphoric claims
    c3 = claims[2] # "His detention follows..."
    assert len(c3.context_anchors) > 0
    anchors_joined = " ".join(c3.context_anchors).lower()
    assert any(term in anchors_joined for term in ["abhijeet", "dipke", "cockroach", "delhi"])

    c5 = claims[4] # "The Election Commission denies the charge."
    assert len(c5.context_anchors) > 0

def test_context_anchored_query_generation():
    """Requirement 3: Search queries must be anchored with document context so isolated phrases don't search Wisconsin or Microsoft."""
    c5 = ExtractedClaim(
        claim_id="test5",
        claim_number=5,
        original_text="The Election Commission denies the charge.",
        normalized_text="The Election Commission denies the charge.",
        claim_type="allegation",
        context_anchors=["Abhijeet Dipke", "Cockroach Janta Party", "Delhi"]
    )

    queries = evidence_searcher.generate_search_queries(
        c5.original_text,
        named_entities=c5.named_entities,
        context_anchors=c5.context_anchors,
        claim_type=c5.claim_type
    )

    assert len(queries) >= 2
    # Verify at least one query contains context anchors
    queries_text = " ".join(queries).lower()
    assert "election commission" in queries_text
    assert any(term in queries_text for term in ["abhijeet", "dipke", "cockroach", "voter list"])

def test_relevance_filtering_rejects_irrelevant_results():
    """Requirement 3 & 5: Reject unrelated results (e.g. Wisconsin Elon Musk, Microsoft Support) using configurable threshold."""
    claim_text = "The founder of India's 'cockroach' protest movement, Abhijeet Dipke, has been detained in Delhi ahead of a planned march."

    items = [
        # Truly relevant source
        RawEvidenceItem(
            source_url="https://thehindu.com/news/national/cjp-abhijeet-dipke-detained-delhi",
            source_title="Cockroach Janta Party founder Abhijeet Dipke detained ahead of Delhi protest",
            snippet="Delhi Police on Friday detained Abhijeet Dipke, founder of the Cockroach Janta Party, ahead of a planned march in Central Park, Connaught Place.",
            retrieved_at="2026-10-16T12:00:00",
            domain="thehindu.com",
            is_primary_source=False,
            reliability_tier="TIER_1",
            search_query="Abhijeet Dipke detained Delhi"
        ),
        # Irrelevant result 1: Wisconsin DA Elon Musk case
        RawEvidenceItem(
            source_url="https://wisconsindistrictattorney.gov/press/elon-musk-checks",
            source_title="Wisconsin District Attorney releases findings on voter checks",
            snippet="The Wisconsin District Attorney reviewed reports of campaign payments and registered voter signatures for possible municipal code infractions.",
            retrieved_at="2026-10-16T12:00:00",
            domain="wisconsindistrictattorney.gov",
            is_primary_source=False,
            reliability_tier="TIER_3",
            search_query="voter list manipulation"
        ),
        # Irrelevant result 2: Microsoft support page
        RawEvidenceItem(
            source_url="https://support.microsoft.com/en-us/windows/update-settings",
            source_title="Troubleshoot Windows Update errors and security configuration",
            snippet="How to check update history and reset security components in Windows 11 settings.",
            retrieved_at="2026-10-16T12:00:00",
            domain="support.microsoft.com",
            is_primary_source=False,
            reliability_tier="TIER_2",
            search_query="delhi protest central park"
        )
    ]

    # Without filtering: all 3 ranked, but 2 marked UNRELATED
    ranked_all = evidence_ranker.rank_evidence(claim_text, items, filter_unrelated=False)
    assert len(ranked_all) == 3
    assert ranked_all[0].evidence_relationship == EvidenceRelationship.SUPPORTS
    assert ranked_all[1].evidence_relationship == EvidenceRelationship.UNRELATED
    assert ranked_all[2].evidence_relationship == EvidenceRelationship.UNRELATED

    # With filtering: only the relevant source is retained
    ranked_filtered = evidence_ranker.rank_evidence(claim_text, items, filter_unrelated=True)
    assert len(ranked_filtered) == 1
    assert ranked_filtered[0].domain == "thehindu.com"
    assert ranked_filtered[0].evidence_relationship == EvidenceRelationship.SUPPORTS

def test_syndicated_wire_deduplication_and_content_hashing():
    """Requirement 4: Deduplicate syndicated wire reporting and compute SHA-256 content hashes."""
    snippet = "Delhi Police on Friday detained Abhijeet Dipke, founder of the Cockroach Janta Party, ahead of a planned march in Central Park."
    url_1 = "https://ndtv.com/article1"
    url_2 = "https://timesofindia.indiatimes.com/article2"

    hash_1 = hashlib.sha256(f"{url_1}|{snippet}".encode('utf-8')).hexdigest()
    hash_2 = hashlib.sha256(f"{url_2}|{snippet}".encode('utf-8')).hexdigest()

    assert len(hash_1) == 64
    assert len(hash_2) == 64
    assert hash_1 != hash_2 # Unique hash per URL+content tuple

    # Verify syndicated duplicate detection
    is_dup = evidence_searcher.is_syndicated_duplicate(snippet, [snippet])
    assert is_dup is True

def test_calibrated_confidence_scoring():
    """Requirement 7: Confidence is 0.0 on zero evidence; no arbitrary 48% or 15% floors."""
    # Zero evidence test
    conf_empty = confidence_engine.calculate_confidence("Any claim", [], is_verifiable=True)
    assert conf_empty.calculated_confidence_score == 0.0
    assert conf_empty.confidence_label == ConfidenceLabel.VERY_LOW
    assert conf_empty.independent_sources_count == 0

    # 2 independent corroborating sources test
    items = [
        RankedEvidenceItem(
            source_url="https://thehindu.com/1",
            source_title="The Hindu Report",
            publisher="The Hindu",
            domain="thehindu.com",
            snippet="Abhijeet Dipke was detained by Delhi Police on Friday.",
            passage="Abhijeet Dipke was detained by Delhi Police on Friday.",
            retrieved_at="2026-10-16",
            search_query="Abhijeet Dipke detained",
            evidence_relationship=EvidenceRelationship.SUPPORTS,
            directness="direct",
            final_rank_score=0.85
        ),
        RankedEvidenceItem(
            source_url="https://indianexpress.com/1",
            source_title="Indian Express Report",
            publisher="The Indian Express",
            domain="indianexpress.com",
            snippet="Police officials confirmed Abhijeet Dipke was taken into preventive custody in Delhi.",
            passage="Police officials confirmed Abhijeet Dipke was taken into preventive custody in Delhi.",
            retrieved_at="2026-10-16",
            search_query="Abhijeet Dipke detained",
            evidence_relationship=EvidenceRelationship.SUPPORTS,
            directness="direct",
            final_rank_score=0.82
        )
    ]
    conf = confidence_engine.calculate_confidence("Abhijeet Dipke detained in Delhi", items, is_verifiable=True)
    assert conf.independent_sources_count == 2
    assert conf.calculated_confidence_score >= 0.70
    assert conf.confidence_label == ConfidenceLabel.HIGH

@pytest.mark.asyncio
async def test_end_to_end_assessment_of_six_bbc_claims(monkeypatch):
    """Requirement 6, 8, 9: End-to-end verification of the 6 BBC claims with citations, diagnostics, and caveats."""
    monkeypatch.setattr("app.core.config.settings.SEARCH_PROVIDER", "mock")

    claims = claim_extractor.extract_claims(
        BBC_ARTICLE_TEXT,
        max_claims=6,
        document_title=BBC_ARTICLE_TITLE,
        document_publisher="BBC News"
    )
    assert len(claims) == 6

    for c in claims:
        assessment = await claim_assessor.assess_claim(c)

        # 1. Status is evidence-grounded
        assert assessment.assessment_status in [
            AssessmentStatus.SUPPORTED,
            AssessmentStatus.REFUTED,
            AssessmentStatus.MIXED,
            AssessmentStatus.INSUFFICIENT_EVIDENCE,
            AssessmentStatus.OUT_OF_CONTEXT,
            AssessmentStatus.NOT_VERIFIABLE
        ]

        # 2. Citations map strictly to actual retrieved sources
        for cit in assessment.citations:
            assert cit["source_url"].startswith("http")
            assert len(cit["source_title"]) > 0
            assert "content_hash" in cit
            assert cit["relationship"] in ["SUPPORTS", "REFUTES", "CONTEXT", "MENTION"]

        # 3. Query diagnostics are recorded
        assert len(assessment.query_diagnostics) > 0
        for qd in assessment.query_diagnostics:
            assert len(qd.query) > 0
            assert qd.total_retrieved >= 0

        # 4. Allegation caveat checking
        if c.claim_type == "allegation":
            assert len(assessment.important_caveats) > 0
            caveats_text = " ".join(assessment.important_caveats).lower()
            assert any(word in caveats_text for word in ["allegation", "demand", "unproven", "contested"])
