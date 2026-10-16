import re
from typing import List, Tuple
from app.models.schemas import (
    RawEvidenceItem,
    RankedEvidenceItem,
    EvidenceRelationship,
    ExcerptType
)
from app.pipeline.embedder import embedder
from app.core.config import settings

class EvidenceRanker:
    """Stage 5b: Evidence Ranking, Stance Detection & Directness Evaluation"""

    REFUTING_CUES = [
        r'\b(false|misleading|debunked|hoax|untrue|fabricated|distorted|incorrect|inaccurate|no evidence|myth|disproved|denied|unfounded|bogus|unsubstantiated|refute|refuted|refutes)\b'
    ]

    SUPPORTING_CUES = [
        r'\b(confirmed|verified|true|officially announced|proves|corroborates|shows that|established|valid|authenticated|passed the law|signed into law|published data|announced|stated|reported|revealed|agreed|approved|found that|decreed|signed|concluded|records show|according to|data indicates|effective from|passed the bill|implemented|published|decree|regulations|detained|detention|custody|preventive custody|arrest|arrested|preventive detention|deployed|security personnel|warning|denies|denied|rejects|rejected|demanding|demanded|called on|urged supporters)\b'
    ]

    QUALIFYING_CUES = [
        r'\b(however|although|partially|only applies to|with exceptions|misrepresented|missing context|exaggerated)\b'
    ]

    def compute_keyword_score(self, claim_text: str, snippet: str) -> float:
        """Calculates token overlap and entity matching between claim and evidence."""
        claim_words = set(re.findall(r'\b[a-zA-Z0-9]{3,}\b', claim_text.lower()))
        snippet_words = set(re.findall(r'\b[a-zA-Z0-9]{3,}\b', snippet.lower()))

        if not claim_words or not snippet_words:
            return 0.1

        overlap = len(claim_words.intersection(snippet_words))
        return min(1.0, overlap / max(1, len(claim_words)))

    def detect_stance(self, claim_text: str, snippet: str, keyword_score: float = 0.0, semantic_score: float = 0.0) -> Tuple[EvidenceRelationship, str]:
        """Classifies evidence relationship to claim and extracts rationale."""
        snippet_lower = snippet.lower()
        claim_lower = claim_text.lower()

        # Extract content words from claim (excluding short stop words)
        stop_words = {"this", "that", "with", "from", "have", "been", "were", "what", "when", "where", "which", "will", "would", "could", "should", "about", "into", "over", "after", "the", "and", "for"}
        claim_content_words = [w for w in re.findall(r'\b[a-zA-Z0-9%]+\b', claim_lower) if len(w) >= 3 and w not in stop_words]

        # Break snippet into sentence units
        sentences = re.split(r'(?<=[.!?])\s+', snippet_lower)

        refute_matches = 0
        refute_targeted = False
        support_matches = 0
        support_targeted = False
        qualify_matches = 0

        # 1. Relevance threshold check: separate relevance filtering from stance classification
        combined_rel = max(keyword_score, (0.45 * semantic_score) + (0.55 * keyword_score))
        if combined_rel < settings.MIN_RELEVANCE_THRESHOLD and keyword_score < 0.20:
            return EvidenceRelationship.UNRELATED, f"Passage does not meet minimum relevance threshold ({combined_rel:.2f} < {settings.MIN_RELEVANCE_THRESHOLD:.2f})."

        for sent in sentences:
            # Check refuting cues
            has_refute_cue = any(re.search(pat, sent) for pat in self.REFUTING_CUES)
            if has_refute_cue:
                refute_matches += 1
                overlap = sum(1 for w in claim_content_words if w in sent)
                if overlap >= 2 or (len(claim_content_words) > 0 and overlap / len(claim_content_words) >= 0.35):
                    refute_targeted = True

            # Check supporting cues (only if sentence is not refuting)
            has_support_cue = (not has_refute_cue) and any(re.search(pat, sent) for pat in self.SUPPORTING_CUES)
            if has_support_cue:
                support_matches += 1
                overlap = sum(1 for w in claim_content_words if w in sent)
                if overlap >= 2 or (len(claim_content_words) > 0 and overlap / len(claim_content_words) >= 0.25):
                    support_targeted = True

            # Check qualifying cues
            has_qualify_cue = any(re.search(pat, sent) for pat in self.QUALIFYING_CUES)
            if has_qualify_cue:
                qualify_matches += 1

        if refute_targeted:
            return EvidenceRelationship.REFUTES, "Passage contains explicit refutation, debunking, or contradiction keywords regarding the claim."
        elif qualify_matches > 0 and (support_targeted or keyword_score >= 0.25):
            return EvidenceRelationship.CONTEXT, "Passage introduces critical nuances, scope limitations, or contextual qualifications."
        elif support_targeted or (support_matches > 0 and (keyword_score >= 0.20 or semantic_score >= 0.30)):
            return EvidenceRelationship.SUPPORTS, "Passage independently corroborates the reported events, official announcements, or assertions."
        elif refute_matches > 0 and not support_targeted:
            return EvidenceRelationship.CONTEXT, "Passage discusses related disputes or nuances without directly disproving this claim."
        elif support_matches > 0:
            return EvidenceRelationship.SUPPORTS, "Passage corroborates the reported events or details."
        else:
            return EvidenceRelationship.CONTEXT, "Passage provides background context and surrounding circumstances without directly affirming or refuting the claim."

    def evaluate_directness(self, claim_text: str, snippet: str) -> str:
        """Checks if evidence addresses key numerical/entity anchors directly."""
        claim_numbers = re.findall(r'\b\d+(?:\.\d+)?%?\b', claim_text)
        if claim_numbers:
            for num in claim_numbers:
                if num in snippet:
                    return "direct"

        words = [w for w in claim_text.lower().split() if len(w) > 4]
        if words:
            matching = [w for w in words if w in snippet.lower()]
            if len(matching) / len(words) >= 0.4:
                return "direct"

        return "indirect"

    def rank_evidence(
        self,
        claim_text: str,
        items: List[RawEvidenceItem],
        filter_unrelated: bool = True
    ) -> List[RankedEvidenceItem]:
        """Reranks evidence items using semantic similarity, keyword overlap, and provenance, filtering unrelated items."""
        if not items:
            return []

        snippets = [item.snippet for item in items]
        semantic_scores = embedder.compute_similarity(claim_text, snippets)

        ranked_items: List[RankedEvidenceItem] = []

        for idx, item in enumerate(items):
            sem_score = semantic_scores[idx] if idx < len(semantic_scores) else 0.5
            kw_score = self.compute_keyword_score(claim_text, item.snippet)

            # Provenance score
            prov_score = 0.5
            if item.reliability_tier == "TIER_1":
                prov_score = 0.90
            elif item.reliability_tier == "TIER_2":
                prov_score = 0.75
            if item.is_primary_source:
                prov_score = min(1.0, prov_score + 0.10)

            # Weighted final ranking score (multi-signal)
            final_rank = (0.45 * sem_score) + (0.35 * kw_score) + (0.20 * prov_score)

            relationship, rationale = self.detect_stance(claim_text, item.snippet, kw_score, sem_score)

            # If filtering unrelated items, skip them
            if filter_unrelated and relationship == EvidenceRelationship.UNRELATED:
                continue

            directness = self.evaluate_directness(claim_text, item.snippet)

            ranked_item = RankedEvidenceItem(
                source_url=item.source_url,
                source_title=item.source_title,
                publisher=item.publisher,
                publication_date=item.publication_date,
                snippet=item.snippet,
                passage=item.snippet,
                excerpt_type=ExcerptType.SNIPPET,
                retrieved_at=item.retrieved_at,
                domain=item.domain,
                is_primary_source=item.is_primary_source,
                reliability_tier=item.reliability_tier,
                relevance_score=item.relevance_score,
                search_query=item.search_query,
                content_hash=item.content_hash,
                evidence_relationship=relationship,
                semantic_score=round(float(sem_score), 3),
                keyword_score=round(float(kw_score), 3),
                provenance_score=round(float(prov_score), 3),
                final_rank_score=round(float(final_rank), 3),
                directness=directness,
                explanation_of_relevance=rationale
            )
            ranked_items.append(ranked_item)

        # Sort descending by final rank score
        ranked_items.sort(key=lambda x: x.final_rank_score, reverse=True)
        return ranked_items

evidence_ranker = EvidenceRanker()
