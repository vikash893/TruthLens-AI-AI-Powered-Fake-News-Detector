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
                recency_factor=0.5,
                evidence_coverage=0.0,
                calculated_confidence_score=0.15,
                confidence_label=ConfidenceLabel.VERY_LOW,
                calibration_notes="No verifiable claim or zero relevant external evidence retrieved."
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
            agreement_ratio = 0.5 # Ambiguous / contextual evidence only

        # 4. Directness
        direct_count = sum(1 for item in evidence_items if item.directness == "direct")
        directness_score = direct_count / max(1, len(evidence_items))

        # 5. Evidence Coverage
        # Check if high-ranking evidence items exist (final rank score >= 0.5)
        high_rel_count = sum(1 for item in evidence_items if item.final_rank_score >= 0.50)
        coverage_score = min(1.0, high_rel_count / max(1, min(3, len(evidence_items))))

        # Weighted calculation
        # Independent sources factor: 3 or more independent sources gives 1.0
        source_factor = min(1.0, independent_sources_count / 3.0)
        primary_factor = 1.0 if primary_sources_count > 0 else 0.55
        recency_factor = 0.85 # baseline for recently fetched web results

        score = (
            0.25 * source_factor +
            0.20 * primary_factor +
            0.25 * agreement_ratio +
            0.15 * directness_score +
            0.15 * coverage_score
        )
        score = round(float(min(0.98, max(0.10, score))), 2)

        # Assign calibrated label
        if score >= 0.75 and independent_sources_count >= 2:
            label = ConfidenceLabel.HIGH
            notes = f"High confidence based on {independent_sources_count} independent sources with {round(agreement_ratio*100)}% agreement."
        elif score >= 0.50:
            label = ConfidenceLabel.MEDIUM
            notes = f"Moderate confidence: {independent_sources_count} source(s) identified with direct relevance."
        elif score >= 0.30:
            label = ConfidenceLabel.LOW
            notes = "Low confidence: Evidence is sparse, indirect, or exhibits noticeable disagreement."
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
