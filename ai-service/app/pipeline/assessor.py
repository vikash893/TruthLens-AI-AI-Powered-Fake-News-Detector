from typing import List, Dict, Any
from app.models.schemas import (
    ExtractedClaim,
    RankedEvidenceItem,
    ClaimAssessment,
    AssessmentStatus,
    EvidenceRelationship
)
from app.pipeline.searcher import evidence_searcher
from app.pipeline.ranker import evidence_ranker
from app.pipeline.confidence import confidence_engine
from app.providers.fallback_provider import FallbackProvider
from app.providers.gemini_provider import GeminiProvider
from app.core.config import settings
from app.core.logger import logger

class ClaimAssessor:
    """Stage 6 & 7: Claim Assessment and Evidence Synthesis Orchestrator"""

    def __init__(self):
        if settings.LLM_PROVIDER == "gemini":
            self.provider = GeminiProvider()
        else:
            self.provider = FallbackProvider()

    def validate_citations(
        self,
        citations: List[Dict[str, Any]],
        available_evidence: List[RankedEvidenceItem]
    ) -> List[Dict[str, Any]]:
        """Strictly validates citations against retrieved evidence to prevent hallucinations."""
        valid_urls = set(e.source_url for e in available_evidence)
        sanitized = []
        for c in citations:
            url = c.get("source_url") or c.get("url")
            if url and url in valid_urls:
                sanitized.append(c)
        return sanitized

    async def assess_claim(
        self,
        claim: ExtractedClaim,
        evidence_items: List[RankedEvidenceItem] = None
    ) -> ClaimAssessment:
        """Runs full assessment on a single claim against evidence."""
        # 1. Retrieve evidence if not provided
        query_diags = []
        if evidence_items is None:
            raw_items = evidence_searcher.search_evidence_for_claim(
                claim.original_text,
                claim.named_entities,
                context_anchors=claim.context_anchors,
                claim_type=claim.claim_type,
                max_results=settings.MAX_SEARCH_RESULTS
            )
            ranked_evidence = evidence_ranker.rank_evidence(claim.original_text, raw_items, filter_unrelated=True)
            query_diags = list(evidence_searcher.last_diagnostics)
        else:
            ranked_evidence = evidence_items

        # 2. Partition into supporting, contradicting, and contextual
        supporting = [e for e in ranked_evidence if e.evidence_relationship == EvidenceRelationship.SUPPORTS]
        contradicting = [e for e in ranked_evidence if e.evidence_relationship == EvidenceRelationship.REFUTES]
        neutral = [e for e in ranked_evidence if e.evidence_relationship in (EvidenceRelationship.CONTEXT, EvidenceRelationship.MENTION)]

        # 3. Synthesize assessment
        synth_result = await self.provider.synthesize_assessment(claim, ranked_evidence)

        # Parse assessment status safely
        raw_status = synth_result.get("assessment_status", "INSUFFICIENT_EVIDENCE")
        try:
            status = AssessmentStatus(raw_status)
        except ValueError:
            status = AssessmentStatus.INSUFFICIENT_EVIDENCE

        # 4. Citations list strictly from retrieved evidence
        citations = []
        for e in ranked_evidence:
            citations.append({
                "source_title": e.source_title,
                "source_url": e.source_url,
                "publisher": e.publisher,
                "domain": e.domain,
                "relationship": e.evidence_relationship.value if hasattr(e.evidence_relationship, "value") else str(e.evidence_relationship),
                "is_primary_source": e.is_primary_source,
                "content_hash": e.content_hash,
                "excerpt_type": e.excerpt_type.value if hasattr(e.excerpt_type, "value") else str(e.excerpt_type)
            })

        # 5. Calculate calibrated confidence
        confidence_factors = confidence_engine.calculate_confidence(
            claim.original_text,
            ranked_evidence,
            claim.is_verifiable
        )

        return ClaimAssessment(
            claim_id=claim.claim_id,
            claim_text=claim.original_text,
            claim_type=claim.claim_type,
            attribution=claim.attribution,
            source_article_reporting=f"Original article reporting: '{claim.original_text}'",
            assessment_status=status,
            explanation=synth_result.get("explanation", "Assessment completed based on available evidence."),
            confidence=confidence_factors,
            supporting_evidence=supporting,
            contradicting_evidence=contradicting,
            neutral_context_evidence=neutral,
            important_caveats=synth_result.get("caveats", []),
            citations=citations,
            missing_context=synth_result.get("missing_context"),
            unresolved_questions=synth_result.get("unresolved_questions", []),
            query_diagnostics=query_diags
        )

claim_assessor = ClaimAssessor()
