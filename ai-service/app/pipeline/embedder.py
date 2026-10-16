import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.core.logger import logger
from app.core.config import settings

class SemanticEmbedder:
    """Stage 4: Semantic Embeddings & Similarity Matching"""

    def __init__(self):
        self.backend = settings.EMBEDDING_BACKEND
        self.st_model = None

        if self.backend == "sentence_transformers":
            try:
                from sentence_transformers import SentenceTransformer
                self.st_model = SentenceTransformer("all-MiniLM-L6-v2")
                logger.info("Loaded SentenceTransformer model all-MiniLM-L6-v2")
            except Exception as e:
                logger.warning(f"SentenceTransformers failed to load ({e}). Falling back to TF-IDF.")
                self.backend = "tfidf"

        # TF-IDF subword and character n-gram vectorizer for robust vocabulary-independent similarity
        self.vectorizer = TfidfVectorizer(
            analyzer='word',
            ngram_range=(1, 3),
            min_df=1,
            sublinear_tf=True
        )

    def compute_similarity(self, query: str, documents: List[str]) -> List[float]:
        """Calculates cosine similarity scores between query and document list."""
        if not documents:
            return []

        if self.st_model is not None:
            try:
                q_emb = self.st_model.encode([query])
                d_emb = self.st_model.encode(documents)
                sims = cosine_similarity(q_emb, d_emb)[0]
                return [float(s) for s in sims]
            except Exception as e:
                logger.warning(f"SentenceTransformer inference failed: {e}. Using TF-IDF fallback.")

        # TF-IDF Fallback
        corpus = [query] + documents
        try:
            tfidf_matrix = self.vectorizer.fit_transform(corpus)
            query_vec = tfidf_matrix[0:1]
            doc_vecs = tfidf_matrix[1:]
            sims = cosine_similarity(query_vec, doc_vecs)[0]
            return [float(s) for s in sims]
        except Exception as e:
            logger.error(f"Error computing TF-IDF similarity: {e}")
            return [0.0] * len(documents)

class VectorStore:
    """In-memory vector & passage metadata store for claims and evidence items."""

    def __init__(self):
        self.records: List[Dict[str, Any]] = []
        self.embedder = SemanticEmbedder()

    def add_record(self, record_id: str, text: str, metadata: Dict[str, Any]):
        self.records.append({
            "id": record_id,
            "text": text,
            "metadata": metadata
        })

    def search(self, query: str, top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        if not self.records:
            return []

        docs = [r["text"] for r in self.records]
        sims = self.embedder.compute_similarity(query, docs)

        scored = list(zip(self.records, sims))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

embedder = SemanticEmbedder()
