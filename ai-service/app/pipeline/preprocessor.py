import re
from typing import List, Tuple
from app.models.schemas import PreprocessResponse

class TextPreprocessor:
    """Stage 1: Text Preprocessing & Sentence Segmentation"""

    # Common honorifics and abbreviations to avoid false sentence splits
    ABBREVIATIONS = {
        "mr.", "mrs.", "ms.", "dr.", "prof.", "gen.", "rep.", "sen.",
        "u.s.", "u.k.", "u.n.", "e.u.", "gov.", "corp.", "inc.", "ltd.",
        "approx.", "vs.", "jan.", "feb.", "mar.", "apr.", "jun.", "jul.",
        "aug.", "sep.", "sept.", "oct.", "nov.", "dec.", "a.m.", "p.m.",
        "i.e.", "e.g.", "no.", "vol."
    }

    def __init__(self):
        pass

    def normalize_whitespace(self, text: str) -> str:
        """Normalizes irregular whitespace while preserving semantic punctuation."""
        if not text:
            return ""
        # Replace non-breaking spaces and irregular tabs
        clean = text.replace('\u00a0', ' ').replace('\u200b', '')
        # Collapse multiple spaces or tabs into a single space
        clean = re.sub(r'[ \t]+', ' ', clean)
        # Collapse excessive newlines (> 2) to 2
        clean = re.sub(r'\n{3,}', '\n\n', clean)
        return clean.strip()

    def detect_language(self, text: str) -> Tuple[str, float]:
        """Simple and fast language detection based on character sets and common stopwords."""
        if not text or len(text.strip()) == 0:
            return "en", 1.0

        # Check for non-Latin scripts
        has_cyrillic = bool(re.search(r'[\u0400-\u04FF]', text))
        has_arabic = bool(re.search(r'[\u0600-\u06FF]', text))
        has_devanagari = bool(re.search(r'[\u0900-\u097F]', text))
        has_cjk = bool(re.search(r'[\u4E00-\u9FFF]', text))
        has_spanish = bool(re.search(r'[¿¡áéíóúñ]', text, re.IGNORECASE))

        if has_cyrillic:
            return "ru", 0.95
        if has_arabic:
            return "ar", 0.95
        if has_devanagari:
            return "hi", 0.95
        if has_cjk:
            return "zh", 0.95
        if has_spanish:
            return "es", 0.85

        # Default to English with calibrated confidence
        return "en", 0.92

    def split_sentences(self, text: str) -> List[str]:
        """Sentence splitter that protects numbers, percentages, dates, and abbreviations."""
        normalized = self.normalize_whitespace(text)
        if not normalized:
            return []

        # Split on line breaks first if they represent distinct paragraph blocks
        paragraphs = [p.strip() for p in normalized.split('\n') if p.strip()]
        all_sentences: List[str] = []

        for p in paragraphs:
            # Tokenize potential sentences by punctuation followed by space and capital letter
            raw_splits = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'\(\[])', p)
            current_buffer = ""

            for chunk in raw_splits:
                if not chunk.strip():
                    continue

                if current_buffer:
                    last_word = current_buffer.strip().split()[-1].lower()
                    if last_word in self.ABBREVIATIONS or re.search(r'\b[A-Za-z]\.$', last_word):
                        # This was an abbreviation (like "Dr." or "U.S."), merge back
                        current_buffer += " " + chunk
                        continue
                    else:
                        all_sentences.append(current_buffer.strip())
                        current_buffer = chunk
                else:
                    current_buffer = chunk

            if current_buffer:
                all_sentences.append(current_buffer.strip())

        return [s for s in all_sentences if len(s) > 5]

    def preprocess(self, text: str) -> PreprocessResponse:
        """Full Stage 1 execution."""
        clean_text = self.normalize_whitespace(text)
        lang, conf = self.detect_language(clean_text)
        sentences = self.split_sentences(clean_text)

        return PreprocessResponse(
            original_text=text,
            normalized_text=clean_text,
            detected_language=lang,
            sentence_count=len(sentences),
            sentences=sentences
        )

preprocessor = TextPreprocessor()
