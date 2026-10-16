import re
from typing import Dict, List
from app.models.schemas import ClaimCategory

class ClaimClassifier:
    """Stage 3: Claim Classification into Domains/Topics"""

    CATEGORY_KEYWORDS: Dict[str, List[str]] = {
        ClaimCategory.POLITICS.value: [
            "government", "president", "minister", "parliament", "congress", "senate",
            "election", "vote", "voters", "ballot", "policy", "democrat", "republican",
            "legislation", "prime minister", "governor", "diplomacy", "treaty", "sanctions"
        ],
        ClaimCategory.HEALTH.value: [
            "vaccine", "vaccination", "virus", "cancer", "disease", "hospital", "doctor",
            "medicine", "fda", "who", "cdc", "infection", "clinical trial", "drug",
            "treatment", "symptoms", "health", "fatality", "pandemic", "dosage", "cure"
        ],
        ClaimCategory.SCIENCE.value: [
            "nasa", "space", "astronomy", "physics", "quantum", "planet", "telescope",
            "artificial intelligence", "algorithm", "robotics", "mars", "satellite",
            "dna", "genetic", "lab", "experiment", "discovery", "breakthrough"
        ],
        ClaimCategory.FINANCE.value: [
            "inflation", "economy", "gdp", "stock", "stocks", "market", "interest rate",
            "central bank", "federal reserve", "billion", "million", "dollar", "tax",
            "subsidy", "prices", "unemployment", "recession", "bank", "crypto", "bitcoin"
        ],
        ClaimCategory.CRIME.value: [
            "police", "arrest", "court", "judge", "illegal", "crime", "murder", "robbery",
            "investigation", "fraud", "scam", "jail", "prison", "fbi", "guilty", "lawsuit"
        ],
        ClaimCategory.ENVIRONMENT.value: [
            "climate change", "global warming", "emissions", "carbon", "temperature",
            "wildfire", "hurricane", "flood", "drought", "biodiversity", "renewable",
            "solar", "wind energy", "deforestation", "pollution", "ice cap"
        ],
        ClaimCategory.EDUCATION.value: [
            "school", "university", "college", "student", "teacher", "curriculum",
            "tuition", "degree", "education", "campus", "scholarship", "exam", "grading"
        ]
    }

    def classify(self, text: str) -> str:
        text_lower = text.lower()
        scores: Dict[str, int] = {}

        for category, keywords in self.CATEGORY_KEYWORDS.items():
            matches = 0
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    matches += 1
            if matches > 0:
                scores[category] = matches

        if not scores:
            return ClaimCategory.GENERAL.value

        # Return category with highest matching keywords
        best_category = max(scores, key=scores.get)
        if scores[best_category] >= 1:
            return best_category
        return ClaimCategory.OTHER.value

classifier = ClaimClassifier()
