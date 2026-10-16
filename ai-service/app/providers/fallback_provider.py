from typing import Dict, Any, List
from app.providers.base import BaseLLMProvider
from app.models.schemas import (
    ExtractedClaim,
    RankedEvidenceItem,
    AssessmentStatus,
    EvidenceRelationship
)

class FallbackProvider(BaseLLMProvider):
    """Deterministic, rule-based evidence synthesis provider requiring no external API keys."""

    async def synthesize_assessment(
        self,
        claim: ExtractedClaim,
        evidence: List[RankedEvidenceItem]
    ) -> Dict[str, Any]:
        if not claim.is_verifiable:
            return {
                "assessment_status": AssessmentStatus.NOT_VERIFIABLE.value,
                "explanation": "This statement represents a subjective judgment, future prediction, or personal expression that cannot be verified against historical or empirical facts.",
                "caveats": ["Subjective claims lack verifiable empirical ground truth."],
                "missing_context": "Objective measurements or factual assertions are missing.",
                "unresolved_questions": ["What specific factual metrics could substantiate this opinion?"]
            }

        if not evidence:
            caveats = ["Absence of evidence in the search index does not disprove the claim."]
            if claim.claim_type == "allegation":
                caveats.append("This claim involves an unverified allegation or political demand.")
            return {
                "assessment_status": AssessmentStatus.INSUFFICIENT_EVIDENCE.value,
                "explanation": "No credible external reporting or documentation was found regarding this claim. Following our 'evidence first' doctrine, the system leaves this claim unverified rather than assuming it is false.",
                "caveats": caveats,
                "missing_context": "Primary documents or independent confirmations are unavailable.",
                "unresolved_questions": ["Did an official announcement take place through an unindexed channel?"]
            }

        support_items = [e for e in evidence if e.evidence_relationship == EvidenceRelationship.SUPPORTS]
        refute_items = [e for e in evidence if e.evidence_relationship == EvidenceRelationship.REFUTES]
        context_items = [e for e in evidence if e.evidence_relationship == EvidenceRelationship.CONTEXT]

        # Determine status based on corroborating vs refuting signals
        if len(refute_items) > 0 and len(support_items) == 0:
            status = AssessmentStatus.REFUTED.value
            explanation = (
                f"Retrieved reporting from {refute_items[0].publisher or refute_items[0].domain} "
                f"directly refutes or debunks the claim: '{refute_items[0].snippet[:140]}...'"
            )
            caveats = ["Check for ongoing updates if official investigations or statements are active."]
            missing_context = "The claim omits public debunking and official corrections."
            unresolved = []

        elif len(support_items) > 0 and len(refute_items) == 0:
            status = AssessmentStatus.SUPPORTED.value
            if claim.claim_type == "allegation":
                explanation = (
                    f"Retrieved documentation from {support_items[0].publisher or support_items[0].domain} "
                    f"corroborates that this allegation or political demand was officially made: '{support_items[0].snippet[:140]}...'"
                )
                caveats = [
                    "This claim is verified as a public statement/demand made by the group. The underlying allegations have not been independently proven and remain contested."
                ]
            else:
                explanation = (
                    f"Retrieved documentation from {support_items[0].publisher or support_items[0].domain} "
                    f"supports this claim: '{support_items[0].snippet[:140]}...'"
                )
                caveats = ["Verification depends on the continued accuracy of the cited reporting."]
            missing_context = None
            unresolved = []

        elif len(support_items) > 0 and len(refute_items) > 0:
            status = AssessmentStatus.MIXED.value
            explanation = (
                f"Sources present conflicting conclusions. While {support_items[0].publisher or support_items[0].domain} "
                f"reports corroborating details, {refute_items[0].publisher or refute_items[0].domain} notes conflicting evidence or exceptions."
            )
            caveats = [
                "Credible sources disagree on the exact scope, figures, or implementation details."
            ]
            missing_context = "Specific eligibility criteria or revised statistical datasets."
            unresolved = ["Which dataset reflects the final finalized official figures?"]

        elif len(context_items) > 0:
            status = AssessmentStatus.OUT_OF_CONTEXT.value
            explanation = (
                f"Retrieved sources show the claim references real events or figures, but omits essential qualifiers: "
                f"'{context_items[0].snippet[:140]}...'"
            )
            caveats = ["The statement takes genuine numbers or events out of their original context."]
            missing_context = "Crucial context regarding timeline or conditions was omitted."
            unresolved = ["What full parameters governed the original statement?"]

        else:
            status = AssessmentStatus.INSUFFICIENT_EVIDENCE.value
            explanation = "Retrieved sources mention related entities or topics, but do not provide direct confirmation or refutation."
            caveats = ["Sources lack direct corroboration for the specific numbers or assertion."]
            missing_context = "Direct statements or primary documentation."
            unresolved = ["Are primary records available from official authorities?"]

        # Ensure allegation caveats are always attached for allegation claims
        if claim.claim_type == "allegation":
            allegation_note = "This claim involves an allegation or political demand. The underlying allegations have not been independently proven and remain contested."
            if not any("allegation" in c.lower() for c in caveats):
                caveats.append(allegation_note)

        return {
            "assessment_status": status,
            "explanation": explanation,
            "caveats": caveats,
            "missing_context": missing_context,
            "unresolved_questions": unresolved
        }
