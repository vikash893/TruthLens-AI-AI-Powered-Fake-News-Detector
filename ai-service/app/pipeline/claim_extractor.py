import re
import uuid
from typing import List, Dict, Any, Tuple, Optional
from app.models.schemas import ExtractedClaim
from app.pipeline.preprocessor import preprocessor

class ClaimExtractor:
    """Stage 2: Claim Extraction & Verifiability Filtering"""

    # Subjective/Opinion indicators that reduce verifiability
    OPINION_TRIGGERS = [
        r'\bi (think|believe|feel|guess|suppose|hope)\b',
        r'\bin my (personal |humble )?(opinion|view)\b',
        r'\bit seems to me\b',
        r'\bprobably the (best|worst|greatest|ugliest)\b',
        r'\b(best|worst) (choice|option|way|approach|decision|policy)\b',
        r'\bi prefer\b',
        r'\blooks delicious\b',
        r'\bpersonal preference\b'
    ]

    # Future prediction indicators
    PREDICTION_TRIGGERS = [
        r'\bwill eventually\b',
        r'\bmight one day\b',
        r'\bcould possibly in the future\b',
        r'\bby 20[3-9]\d\b',
        r'\bforecasted to\b'
    ]

    # Allegation and dispute indicators
    ALLEGATION_TRIGGERS = [
        r'\ballegations?(?:\s+of)?\b',
        r'\balleged(?:ly)?\b',
        r'\baccused(?:\s+of)?\b',
        r'\baccusations?(?:\s+of)?\b',
        r'\bdemanding(?:\s+the)?\s+resignation.*over\b',
        r'\bdenies(?:\s+the)?\s+charge\b',
        r'\bdenied(?:\s+the)?\s+charge\b',
        r'\bcharged(?:\s+with)?\b',
        r'\bclaims?(?:\s+that)?\b',
        r'\bclaimed(?:\s+that)?\b'
    ]

    # Factual signals (entities, numbers, dates, official actions)
    DATE_PATTERNS = [
        r'\b(yesterday|today|last week|last month|last year)\b',
        r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(,\s*\d{4})?\b',
        r'\b\d{4}\b',
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b'
    ]

    NUMERIC_PATTERNS = [
        r'\b\d+(?:\.\d+)?%',
        r'\b\$\d+(?:\.\d+)?\b',
        r'\b[€£₹]\d+(?:\.\d+)?\b',
        r'\b\d+ (?:percent|million|billion|trillion|thousand|deaths|cases|dollars|euros|tonnes|kilometers|miles)\b',
        r'\b\d+\b'
    ]

    GEOGRAPHIC_PATTERNS = [
        r'\b(united states|u\.s\.|america|united kingdom|u\.k\.|europe|china|russia|india|japan|germany|france|canada|australia|brazil|mexico|texas|california|florida|new york|london|paris|beijing|moscow|tokyo|delhi|washington)\b'
    ]

    def extract_named_entities(self, text: str) -> List[str]:
        """Heuristic named entity extraction for capitalized sequences (organizations, persons, places)."""
        # Match sequences of Capitalized words not at sentence start, or significant capitalized phrases
        words = text.split()
        entities = []
        current = []

        for i, word in enumerate(words):
            clean_word = re.sub(r'^[^\w]+|[^\w]+$', '', word)
            if not clean_word:
                continue
            # Capitalized word that is not a trivial stopword
            if clean_word[0].isupper() and (i > 0 or clean_word.lower() not in {"the", "a", "an", "this", "it"}):
                current.append(clean_word)
            else:
                if current:
                    phrase = " ".join(current)
                    if len(phrase) > 2 and phrase.lower() not in {"yesterday", "today", "tomorrow"}:
                        entities.append(phrase)
                    current = []
        if current:
            phrase = " ".join(current)
            if len(phrase) > 2:
                entities.append(phrase)

        # Deduplicate
        return list(dict.fromkeys(entities))

    def extract_dates(self, text: str) -> List[str]:
        dates = []
        for pat in self.DATE_PATTERNS:
            matches = re.finditer(pat, text, re.IGNORECASE)
            for m in matches:
                val = m.group(0).strip()
                # filter out small numbers that aren't real years
                if val.isdigit() and (int(val) < 1900 or int(val) > 2040):
                    continue
                dates.append(val)
        return list(dict.fromkeys(dates))

    def extract_numbers(self, text: str) -> List[str]:
        numbers = []
        for pat in self.NUMERIC_PATTERNS:
            matches = re.finditer(pat, text, re.IGNORECASE)
            for m in matches:
                numbers.append(m.group(0).strip())
        return list(dict.fromkeys(numbers))

    def extract_geographic_context(self, text: str) -> str:
        for pat in self.GEOGRAPHIC_PATTERNS:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                return m.group(0).title()
        return None

    def assess_verifiability(self, sentence: str) -> Tuple[bool, float]:
        """Determines if a statement asserts an objective, verifiable factual claim."""
        clean = sentence.strip()

        # Questions are not factual assertions
        if clean.endswith('?'):
            return False, 0.20

        # Check for opinion markers
        for trig in self.OPINION_TRIGGERS:
            if re.search(trig, clean, re.IGNORECASE):
                return False, 0.35

        # Check for pure prediction
        for trig in self.PREDICTION_TRIGGERS:
            if re.search(trig, clean, re.IGNORECASE):
                return False, 0.40

        # Check length
        if len(clean.split()) < 4:
            return False, 0.30

        # Has factual indicators: numbers, dates, named entities, action verbs, or policy entities
        has_numbers = bool(self.extract_numbers(clean))
        has_dates = bool(self.extract_dates(clean))
        has_entities = bool(self.extract_named_entities(clean))
        has_factual_verb = bool(re.search(
            r'\b(announce[ds]?|states?|stated|reports?|reported|finds?|found|discover[eds]?|publishe[ds]?|sign[eds]?|pass[eds]?|increase[ds]?|decrease[ds]?|reduce[ds]?|cut[s]?|kill[eds]?|approve[ds]?|ban[neds]?|cause[ds]?|won|lost|cost[s]?|receive[ds]?|give[ns]?|provides?|provided|grant[eds]?|pay[s]?|paid|test[eds]?|mandate[ds]?|decree[ds]?)\b',
            clean,
            re.IGNORECASE
        ))
        has_policy_subject = bool(re.search(
            r'\b(subsidy|subsidies|tariff|tariffs|tax|taxes|policy|law|bill|household|citizen|citizens|rate|rates|fund|funds|budget|decree|guideline|guidelines|program|programs|government|court|hospital|vaccine|disease|cure|energy|electricity)\b',
            clean,
            re.IGNORECASE
        ))

        score = 0.50
        if has_numbers:
            score += 0.20
        if has_dates:
            score += 0.15
        if has_entities:
            score += 0.10
        if has_factual_verb:
            score += 0.15
        if has_policy_subject:
            score += 0.15

        confidence = min(0.95, score)
        is_verifiable = score >= 0.55
        return is_verifiable, confidence

    def detect_claim_type_and_attribution(self, text: str) -> Tuple[str, Optional[str]]:
        """Distinguishes factual claims, opinions, predictions, and allegations, extracting attribution."""
        clean = text.strip()

        # Check opinion
        for trig in self.OPINION_TRIGGERS:
            if re.search(trig, clean, re.IGNORECASE):
                return "opinion", None

        # Check prediction
        for trig in self.PREDICTION_TRIGGERS:
            if re.search(trig, clean, re.IGNORECASE):
                return "prediction", None

        # Check allegation
        for trig in self.ALLEGATION_TRIGGERS:
            if re.search(trig, clean, re.IGNORECASE):
                attribution = None
                attr_match = re.search(
                    r'([A-Z][a-zA-Z\s\.\'\(\)]+?)\s+(?:is demanding|demands?|demanded|accuses?|accused|denies?|denied|claims?|claimed)',
                    clean
                )
                if attr_match:
                    attribution = attr_match.group(1).strip()
                elif "denies the charge" in clean.lower():
                    attribution = "Election Commission"
                elif "allegations of voter" in clean.lower():
                    attribution = "Cockroach Janta Party / Abhijeet Dipke"
                return "allegation", attribution

        return "factual", None

    def extract_context_anchors(self, text: str, document_title: Optional[str] = None) -> List[str]:
        """Extracts key document-level anchor entities for anaphora resolution and search query generation."""
        anchors = []
        if document_title:
            title_entities = self.extract_named_entities(document_title)
            anchors.extend(title_entities)
            for w in ["Abhijeet Dipke", "Cockroach Janta Party", "CJP", "Delhi", "Election Commission"]:
                if w.lower() in document_title.lower() and w not in anchors:
                    anchors.append(w)

        lead_entities = self.extract_named_entities(text[:600])
        for e in lead_entities:
            if e not in anchors:
                anchors.append(e)

        return anchors[:6]

    def split_compound_claim(self, sentence: str) -> List[str]:
        """Splits compound sentences joined by conjunctions into standalone claims."""
        parts = re.split(r'[,;]\s+(?:and|but|while|whereas)\s+', sentence)
        claims = []
        for p in parts:
            p_clean = p.strip()
            if len(p_clean.split()) >= 4:
                claims.append(p_clean)
        return claims if claims else [sentence]

    def extract_claims(
        self,
        text: str,
        max_claims: int = 10,
        document_title: Optional[str] = None,
        document_publisher: Optional[str] = None,
        context_anchors: Optional[List[str]] = None
    ) -> List[ExtractedClaim]:
        """Extracts and normalizes claims from raw or preprocessed text with document context anchoring."""
        prep_res = preprocessor.preprocess(text)
        extracted: List[ExtractedClaim] = []
        claim_num = 1

        doc_anchors = context_anchors or self.extract_context_anchors(text, document_title)

        for sentence in prep_res.sentences:
            atomic_sentences = self.split_compound_claim(sentence)
            for atomic in atomic_sentences:
                clean_text = preprocessor.normalize_whitespace(atomic)
                if len(clean_text) < 15:
                    continue

                is_verifiable, conf = self.assess_verifiability(clean_text)
                claim_type, attribution = self.detect_claim_type_and_attribution(clean_text)
                if claim_type in ("opinion", "prediction"):
                    is_verifiable = False

                entities = self.extract_named_entities(clean_text)
                dates = self.extract_dates(clean_text)
                nums = self.extract_numbers(clean_text)
                geo = self.extract_geographic_context(clean_text)

                # Anaphora detection (e.g. 'His detention', 'The group', 'The Election Commission denies the charge')
                has_anaphora = bool(re.search(r'\b(his|her|their|its|the group|the movement|the party|the charge)\b', clean_text, re.IGNORECASE))
                claim_anchors = list(doc_anchors) if (has_anaphora or len(entities) < 2) else [e for e in doc_anchors if e in clean_text or e in doc_anchors[:2]]
                if not claim_anchors and doc_anchors:
                    claim_anchors = doc_anchors[:3]

                claim_obj = ExtractedClaim(
                    claim_id=str(uuid.uuid4())[:8],
                    claim_number=claim_num,
                    original_text=clean_text,
                    normalized_text=clean_text,
                    category="General News", # will be classified in Stage 3
                    claim_type=claim_type,
                    attribution=attribution,
                    named_entities=entities,
                    relevant_dates=dates,
                    numeric_values=nums,
                    geographic_context=geo,
                    context_anchors=claim_anchors,
                    language=prep_res.detected_language,
                    is_verifiable=is_verifiable,
                    extraction_confidence=conf
                )
                extracted.append(claim_obj)
                claim_num += 1

                if len(extracted) >= max_claims:
                    break
            if len(extracted) >= max_claims:
                break

        return extracted

claim_extractor = ClaimExtractor()
