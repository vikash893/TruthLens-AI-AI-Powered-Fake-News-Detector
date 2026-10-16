from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class AssessmentStatus(str, Enum):
    SUPPORTED = "SUPPORTED"
    REFUTED = "REFUTED"
    MIXED = "MIXED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    OUT_OF_CONTEXT = "OUT_OF_CONTEXT"
    NOT_VERIFIABLE = "NOT_VERIFIABLE"

class ConfidenceLabel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    VERY_LOW = "VERY_LOW"

class EvidenceRelationship(str, Enum):
    SUPPORTS = "SUPPORTS"
    REFUTES = "REFUTES"
    CONTEXT = "CONTEXT"
    MENTION = "MENTION"
    UNRELATED = "UNRELATED"

class ClaimType(str, Enum):
    FACTUAL = "factual"
    ALLEGATION = "allegation"
    OPINION = "opinion"
    PREDICTION = "prediction"

class ExcerptType(str, Enum):
    DIRECT_QUOTE = "direct_quote"
    SNIPPET = "snippet"
    PASSAGE = "passage"

class ClaimCategory(str, Enum):
    POLITICS = "Politics & Government"
    HEALTH = "Health & Medicine"
    SCIENCE = "Science & Technology"
    FINANCE = "Finance & Economics"
    CRIME = "Crime & Public Safety"
    ENVIRONMENT = "Environment & Climate"
    EDUCATION = "Education"
    GENERAL = "General News"
    OTHER = "Other"

# Request & Response Models

class LanguageDetectionRequest(BaseModel):
    text: str

class LanguageDetectionResponse(BaseModel):
    language: str
    confidence: float
    is_supported: bool

class PreprocessRequest(BaseModel):
    text: str

class PreprocessResponse(BaseModel):
    original_text: str
    normalized_text: str
    detected_language: str
    sentence_count: int
    sentences: List[str]

class ExtractedClaim(BaseModel):
    claim_id: str
    claim_number: int
    original_text: str
    normalized_text: str
    category: str = "General News"
    claim_type: str = "factual"
    attribution: Optional[str] = None
    named_entities: List[str] = Field(default_factory=list)
    relevant_dates: List[str] = Field(default_factory=list)
    numeric_values: List[str] = Field(default_factory=list)
    geographic_context: Optional[str] = None
    context_anchors: List[str] = Field(default_factory=list)
    language: str = "en"
    is_verifiable: bool = True
    extraction_confidence: float = 0.85

class ClaimExtractRequest(BaseModel):
    text: str
    max_claims: int = 10
    document_title: Optional[str] = None
    document_publisher: Optional[str] = None

class ClaimExtractResponse(BaseModel):
    claims: List[ExtractedClaim]
    total_extracted: int
    verifiable_count: int

class RawEvidenceItem(BaseModel):
    source_url: str
    source_title: str
    publisher: Optional[str] = None
    publication_date: Optional[str] = None
    snippet: str
    retrieved_at: str
    domain: str
    is_primary_source: bool = False
    reliability_tier: str = "TIER_3"
    relevance_score: float = 0.5
    search_query: str
    content_hash: Optional[str] = None

class QueryDiagnostic(BaseModel):
    query: str
    total_retrieved: int = 0
    relevant_retained: int = 0
    filtered_out: int = 0
    reason: Optional[str] = None

class EvidenceSearchRequest(BaseModel):
    claim_text: str
    named_entities: List[str] = Field(default_factory=list)
    context_anchors: List[str] = Field(default_factory=list)
    max_results: int = 6

class EvidenceSearchResponse(BaseModel):
    claim_text: str
    queries_executed: List[str]
    items: List[RawEvidenceItem]
    total_found: int
    diagnostics: List[QueryDiagnostic] = Field(default_factory=list)

class RankedEvidenceItem(RawEvidenceItem):
    passage: str
    excerpt_type: ExcerptType = ExcerptType.SNIPPET
    evidence_relationship: EvidenceRelationship = EvidenceRelationship.CONTEXT
    semantic_score: float = 0.0
    keyword_score: float = 0.0
    provenance_score: float = 0.0
    final_rank_score: float = 0.0
    directness: str = "indirect" # direct or indirect
    explanation_of_relevance: str = ""

class EvidenceRankRequest(BaseModel):
    claim_text: str
    evidence_items: List[RawEvidenceItem]

class EvidenceRankResponse(BaseModel):
    ranked_evidence: List[RankedEvidenceItem]

class ConfidenceFactors(BaseModel):
    independent_sources_count: int
    primary_sources_count: int
    source_agreement_ratio: float # 0.0 to 1.0
    directness_score: float # 0.0 to 1.0
    recency_factor: float # 0.0 to 1.0
    evidence_coverage: float # 0.0 to 1.0
    calculated_confidence_score: float # 0.0 to 1.0
    confidence_label: ConfidenceLabel
    calibration_notes: str

class ClaimAssessment(BaseModel):
    claim_id: str
    claim_text: str
    claim_type: str = "factual"
    attribution: Optional[str] = None
    source_article_reporting: Optional[str] = None
    assessment_status: AssessmentStatus
    explanation: str
    confidence: ConfidenceFactors
    supporting_evidence: List[RankedEvidenceItem] = Field(default_factory=list)
    contradicting_evidence: List[RankedEvidenceItem] = Field(default_factory=list)
    neutral_context_evidence: List[RankedEvidenceItem] = Field(default_factory=list)
    important_caveats: List[str] = Field(default_factory=list)
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    missing_context: Optional[str] = None
    unresolved_questions: List[str] = Field(default_factory=list)
    query_diagnostics: List[QueryDiagnostic] = Field(default_factory=list)

class ClaimAssessRequest(BaseModel):
    claim: ExtractedClaim
    ranked_evidence: List[RankedEvidenceItem]

class FullAnalysisRequest(BaseModel):
    content: str
    input_type: str = "text" # text, url, image, document
    source_url: Optional[str] = None
    title: Optional[str] = None
    publisher: Optional[str] = None
    publication_date: Optional[str] = None
    max_claims: int = 6

class FullAnalysisResponse(BaseModel):
    content_type: str
    detected_language: str
    total_claims_extracted: int
    verifiable_claims_count: int
    supported_claims_count: int
    refuted_claims_count: int
    mixed_claims_count: int
    insufficient_evidence_count: int
    overall_summary: str
    claims: List[ClaimAssessment]
    created_at: str
