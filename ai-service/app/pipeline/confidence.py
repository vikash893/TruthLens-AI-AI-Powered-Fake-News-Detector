from typing import List
from app.models.schemas import (
    RankedEvidenceItem,
    EvidenceRelationship,
    ConfidenceFactors,
    ConfidenceLabel
)

class ConfidenceEngine:
    """Stage 8: Calibrated Multi-Factor Evidence Confidence Estimation"""

    def calculate_confidence(
        self,
        claim_text: str,
        evidence_items: List[RankedEvidenceItem],
        is_verifiable: bool
    ) -> ConfidenceFactors:
        """Computes transparent, multi-factor confidence from empirical retrieval signals."""

        if not is_verifiable or not evidence_items:
            return ConfidenceFactors(
                independent_sources_count=0,
                primary_sources_count=0,
                source_agreement_ratio=0.0,
                directness_score=0.0,
                recency_factor=0.0,
                evidence_coverage=0.0,
                calculated_confidence_score=0.0,
                confidence_label=ConfidenceLabel.VERY_LOW,
                calibration_notes="Zero verifiable external evidence retrieved."
            )

        # 1. Independent domains
        domains = set(item.domain for item in evidence_items if item.domain)
        independent_sources_count = len(domains)

        # 2. Primary sources
        primary_sources_count = sum(1 for item in evidence_items if item.is_primary_source)

        # 3. Source agreement ratio
        support_items = [i for i in evidence_items if i.evidence_relationship == EvidenceRelationship.SUPPORTS]
        refute_items = [i for i in evidence_items if i.evidence_relationship == EvidenceRelationship.REFUTES]
        context_items = [i for i in evidence_items if i.evidence_relationship == EvidenceRelationship.CONTEXT]

        total_conclusive = len(support_items) + len(refute_items)
        if total_conclusive > 0:
            majority_count = max(len(support_items), len(refute_items))
            agreement_ratio = majority_count / total_conclusive
        else:
            agreement_ratio = 0.0 # No conclusive stance; contextual evidence only

        # 4. Directness
        direct_count = sum(1 for item in evidence_items if item.directness == "direct")
        directness_score = direct_count / max(1, len(evidence_items))

        # 5. Evidence Coverage
        high_rel_count = sum(1 for item in evidence_items if item.final_rank_score >= 0.50)
        coverage_score = min(1.0, high_rel_count / max(1, min(3, len(evidence_items))))

        # Calibrated Empirical Multi-factor Formula:
        # Score = 0.30 * SourceFactor + 0.20 * PrimaryFactor + 0.25 * AgreementRatio + 0.15 * Directness + 0.10 * Coverage
        source_factor = min(1.0, independent_sources_count / 3.0)
        primary_factor = 1.0 if primary_sources_count > 0 else 0.0
        recency_factor = 0.85

        score = (
            0.30 * source_factor +
            0.20 * primary_factor +
            0.25 * agreement_ratio +
            0.15 * directness_score +
            0.10 * coverage_score
        )

        # If zero conclusive items (only contextual or mentions), cap confidence at 0.30 LOW
        if total_conclusive == 0:
            score = min(0.30, score * 0.5)

        score = round(float(min(0.98, max(0.0, score))), 2)

        # Assign calibrated qualitative labels
        if score >= 0.70 and independent_sources_count >= 2 and total_conclusive >= 2:
            label = ConfidenceLabel.HIGH
            notes = f"High confidence based on {independent_sources_count} independent sources with {round(agreement_ratio*100)}% agreement."
        elif score >= 0.45 and total_conclusive >= 1:
            label = ConfidenceLabel.MEDIUM
            notes = f"Moderate confidence: {independent_sources_count} source(s) identified with direct relevance."
        elif score >= 0.20:
            label = ConfidenceLabel.LOW
            notes = "Low confidence: Evidence is sparse, indirect, or contextual without multiple independent confirmations."
        else:
            label = ConfidenceLabel.VERY_LOW
            notes = "Very low confidence: Available evidence is insufficient for robust verification."

        return ConfidenceFactors(
            independent_sources_count=independent_sources_count,
            primary_sources_count=primary_sources_count,
            source_agreement_ratio=round(float(agreement_ratio), 2),
            directness_score=round(float(directness_score), 2),
            recency_factor=recency_factor,
            evidence_coverage=round(float(coverage_score), 2),
            calculated_confidence_score=score,
            confidence_label=label,
            calibration_notes=notes
        )

confidence_engine = ConfidenceEngine()
