import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "TruthLens AI Microservice"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    INTERNAL_API_SECRET: Optional[str] = os.getenv("INTERNAL_API_SECRET", "dev-secret-internal-truthlens")
    
    # Search configuration
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "duckduckgo") # duckduckgo, mock, serper, tavily
    SERPER_API_KEY: Optional[str] = os.getenv("SERPER_API_KEY", None)
    TAVILY_API_KEY: Optional[str] = os.getenv("TAVILY_API_KEY", None)
    MAX_SEARCH_RESULTS: int = int(os.getenv("MAX_SEARCH_RESULTS", "6"))
    SEARCH_TIMEOUT: int = int(os.getenv("SEARCH_TIMEOUT", "8"))
    
    # LLM Provider configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "fallback") # fallback, gemini, openai, ollama
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Embedding & Reranking
    EMBEDDING_BACKEND: str = os.getenv("EMBEDDING_BACKEND", "tfidf") # tfidf or sentence_transformers
    
    # Crawler and URL safety
    MAX_PAGE_CONTENT_BYTES: int = 250000 # 250 KB
    HTTP_USER_AGENT: str = "TruthLensBot/1.0 (+https://truthlens.ai/bot)"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
