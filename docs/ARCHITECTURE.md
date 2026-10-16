# TruthLens AI — System Architecture & Data Flow

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    User["End User (Browser / Mobile)"] --> React["React 18 + Vite Frontend (Port 5173)"]
    React -->|REST API / HTTP-only Cookies| Express["Node.js Express Backend (Port 5000)"]
    
    subgraph Express_Services["Express Application Layer"]
        Auth["Auth Controller (JWT / bcrypt)"]
        SSRF["SSRF Guard & URL Scraper"]
        DocParser["PDF & OCR Parsers"]
        Orchestrator["Analysis Orchestration Service"]
    end
    
    Express --> Express_Services
    Express_Services -->|Mongoose ODM| Mongo[("MongoDB Persistence Layer (Port 27017)")]
    
    Orchestrator -->|Internal REST API| FastAPI["Python AI/ML Microservice (Port 8000)"]
    
    subgraph AI_Pipeline["8-Stage AI/ML Pipeline"]
        S1["Stage 1: Preprocessor & LangDetect"]
        S2["Stage 2: Claim Extractor & Verifiability"]
        S3["Stage 3: Classifier (Domains)"]
        S4["Stage 4: Semantic Embeddings (Cosine Store)"]
        S5["Stage 5: Multi-query Search & Provenance Registry"]
        S6["Stage 6: Stance Detection & Contradiction Mining"]
        S7["Stage 7: Evidence-Grounded LLM Synthesis"]
        S8["Stage 8: Calibrated Confidence Engine"]
    end
    
    FastAPI --> S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7 --> S8
    S5 <--> ExternalWeb["External Web / Trusted Sources Registry"]
    S7 <--> OptionalLLM["LLM Provider (Gemini / OpenAI / Fallback)"]
```

## 2. Core Principles
1. **Evidence First, Verdict Second:** Conclusions are strictly derived from retrieved evidence. If no sources exist, claims are marked `INSUFFICIENT_EVIDENCE` rather than assumed false.
2. **Untrusted Data Isolation:** User inputs, crawled websites, and uploaded documents are handled as untrusted text. No instructions within them are executed.
3. **Calibrated Confidence:** Transparent, multi-factor scoring based on independent domain counts, primary evidence, agreement consensus, and directness.

## 3. Database Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ANALYSIS : submits
    USER ||--o{ FEEDBACK : provides
    ANALYSIS ||--|{ CLAIM : decomposes_into
    ANALYSIS ||--o{ EVIDENCE : links
    CLAIM ||--|{ EVIDENCE : corroborated_by
    CLAIM ||--o{ FEEDBACK : receives

    USER {
        string _id PK
        string name
        string email
        string passwordHash
        string role
        array savedReports
    }

    ANALYSIS {
        string _id PK
        string userId FK
        string inputType
        string originalInput
        string extractedText
        string overallSummary
        string status
        int totalClaimsCount
        int supportedClaimsCount
        int refutedClaimsCount
    }

    CLAIM {
        string _id PK
        string analysisId FK
        int claimNumber
        string originalText
        string assessmentStatus
        string assessmentExplanation
        string confidenceLabel
        float confidenceScore
        array caveats
    }

    EVIDENCE {
        string _id PK
        string claimId FK
        string analysisId FK
        string sourceUrl
        string sourceTitle
        string publisher
        string domain
        string excerpt
        string evidenceRelationship
        float finalRankScore
        boolean isPrimarySource
    }
```
