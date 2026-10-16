from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.models.schemas import RankedEvidenceItem, ExtractedClaim

class BaseLLMProvider(ABC):
    """Abstract interface for LLM synthesis providers."""

    @abstractmethod
    async def synthesize_assessment(
        self,
        claim: ExtractedClaim,
        evidence: List[RankedEvidenceItem]
    ) -> Dict[str, Any]:
        """Synthesize evidence-grounded assessment for a single claim."""
        pass
