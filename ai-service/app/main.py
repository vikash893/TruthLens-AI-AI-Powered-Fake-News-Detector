from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logger import logger
from app.models.schemas import (
    LanguageDetectionRequest,
    LanguageDetectionResponse,
    PreprocessRequest,
    PreprocessResponse,
    ClaimExtractRequest,
    ClaimExtractResponse,
    EvidenceSearchRequest,
    EvidenceSearchResponse,
    EvidenceRankRequest,
    EvidenceRankResponse,
    ClaimAssessRequest,
    ClaimAssessment,
    FullAnalysisRequest,
    FullAnalysisResponse,
    AssessmentStatus
)
from app.pipeline.preprocessor import preprocessor
from app.pipeline.claim_extractor import claim_extractor
from app.pipeline.classifier import classifier
from app.pipeline.embedder import embedder
from app.pipeline.searcher import evidence_searcher
from app.pipeline.ranker import evidence_ranker
from app.pipeline.assessor import claim_assessor

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Dedicated AI/ML microservice for claim extraction, semantic retrieval, and evidence-grounded verification."
)

# CORS setup for local and containerized access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "online"
    }

@app.post("/v1/detect-language", response_model=LanguageDetectionResponse)
def detect_language(req: LanguageDetectionRequest):
    lang, conf = preprocessor.detect_language(req.text)
    return LanguageDetectionResponse(
        language=lang,
        confidence=conf,
        is_supported=lang in ["en", "es", "hi", "fr", "de"]
    )

@app.post("/v1/preprocess", response_model=PreprocessResponse)
def preprocess_text(req: PreprocessRequest):
    return preprocessor.preprocess(req.text)

@app.post("/v1/extract-claims", response_model=ClaimExtractResponse)
def extract_claims(req: ClaimExtractRequest):
    claims = claim_extractor.extract_claims(req.text, max_claims=req.max_claims)
    # Apply classifier to each extracted claim
    for c in claims:
        c.category = classifier.classify(c.original_text)
    
    verifiable_count = sum(1 for c in claims if c.is_verifiable)
    return ClaimExtractResponse(
        claims=claims,
        total_extracted=len(claims),
        verifiable_count=verifiable_count
    )

@app.post("/v1/search-evidence", response_model=EvidenceSearchResponse)
def search_evidence(req: EvidenceSearchRequest):
    queries = evidence_searcher.generate_search_queries(req.claim_text, req.named_entities)
    items = evidence_searcher.search_evidence_for_claim(
        req.claim_text,
        req.named_entities,
        max_results=req.max_results
    )
    return EvidenceSearchResponse(
        claim_text=req.claim_text,
        queries_executed=queries,
        items=items,
        total_found=len(items)
    )

@app.post("/v1/rank-evidence", response_model=EvidenceRankResponse)
def rank_evidence(req: EvidenceRankRequest):
    ranked = evidence_ranker.rank_evidence(req.claim_text, req.evidence_items)
    return EvidenceRankResponse(ranked_evidence=ranked)

@app.post("/v1/assess-claims", response_model=ClaimAssessment)
async def assess_claim(req: ClaimAssessRequest):
    assessment = await claim_assessor.assess_claim(req.claim, req.ranked_evidence)
    return assessment

@app.post("/v1/analyze", response_model=FullAnalysisResponse)
async def analyze_full_content(req: FullAnalysisRequest):
    """End-to-end orchestrated pipeline executing Stages 1-8."""
    # 1. Preprocess
    prep = preprocessor.preprocess(req.content)
    
    # 2. Extract Claims
    claims = claim_extractor.extract_claims(prep.normalized_text, max_claims=req.max_claims)
    for c in claims:
        c.category = classifier.classify(c.original_text)

    # 3. Assess each claim
    assessed_claims: List[ClaimAssessment] = []
    supported_cnt = 0
    refuted_cnt = 0
    mixed_cnt = 0
    insufficient_cnt = 0

    for c in claims:
        assessment = await claim_assessor.assess_claim(c)
        assessed_claims.append(assessment)

        if assessment.assessment_status == AssessmentStatus.SUPPORTED:
            supported_cnt += 1
        elif assessment.assessment_status == AssessmentStatus.REFUTED:
            refuted_cnt += 1
        elif assessment.assessment_status in (AssessmentStatus.MIXED, AssessmentStatus.OUT_OF_CONTEXT):
            mixed_cnt += 1
        else:
            insufficient_cnt += 1

    # Formulate objective overall summary (not a single truth %)
    verifiable_count = sum(1 for c in claims if c.is_verifiable)
    summary = (
        f"Analyzed {len(claims)} claim(s) from submitted content. "
        f"{supported_cnt} supported by verified sources, {refuted_cnt} contradicted or refuted, "
        f"{mixed_cnt} mixed/contextual, and {insufficient_cnt} with insufficient evidence. "
        "Evidence first: transparent source citations and uncertainty caveats are listed for each claim."
    )

    return FullAnalysisResponse(
        content_type=req.input_type,
        detected_language=prep.detected_language,
        total_claims_extracted=len(claims),
        verifiable_claims_count=verifiable_count,
        supported_claims_count=supported_cnt,
        refuted_claims_count=refuted_cnt,
        mixed_claims_count=mixed_cnt,
        insufficient_evidence_count=insufficient_cnt,
        overall_summary=summary,
        claims=assessed_claims,
        created_at=datetime.utcnow().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
