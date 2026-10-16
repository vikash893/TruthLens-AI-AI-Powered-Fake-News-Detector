# TruthLens AI — Architecture & Implementation Plan

## 1. Executive Summary
**TruthLens AI** is an evidence-based misinformation analyzer that prioritizes factual verification through transparent source retrieval, claim extraction, and cross-source corroboration. The architecture enforces the core doctrine: **"Evidence first, verdict second."**

```
+-------------------------------------------------------------+
|                      React 18 + Vite UI                     |
|  (Tailwind CSS, TypeScript, Lucide Icons, Recharts Analytics) |
+------------------------------+------------------------------+
                               | REST API (JSON / Cookies)
                               v
+-------------------------------------------------------------+
|                     Express.js Backend                      |
|  - Auth (JWT, bcrypt, rate-limit, helmet, CORS)             |
|  - SSRF-safe URL scraper & Multer File Uploads              |
|  - Analysis Orchestrator & Job State Machine                |
|  - MongoDB (Mongoose models: User, Analysis, Claim, etc.)   |
|  - Export, Bookmark, Private Notes, Feedback API            |
+------------------------------+------------------------------+
                               | HTTP Microservice API
                               v
+-------------------------------------------------------------+
|                  FastAPI AI/ML Microservice                 |
|  - Stage 1: Text Preprocessing & Language Detection         |
|  - Stage 2: Claim Extraction (NER, Verifiability Filtering)  |
|  - Stage 3: Claim Categorization (Zero-shot / Rule-based)   |
|  - Stage 4: Semantic Embeddings (SentenceTransformers)      |
|  - Stage 5: Multi-query Search & Trusted-Source Ranking      |
|  - Stage 6: Evidence-Grounded Assessment & Contradiction    |
|  - Stage 7: LLM Synthesis with Anti-Hallucination Guardrails |
|  - Stage 8: Calibrated Multi-factor Confidence Metric        |
+-------------------------------------------------------------+
```

## 2. Directory Structure

```text
truthlens-ai/
|-- client/                     # Vite + React + TypeScript Frontend
|   |-- src/
|   |   |-- api/                # Centralized Axios client & endpoints
|   |   |-- components/         # Common UI: Navbar, Footer, Badge, Card, Modal, Loader, etc.
|   |   |-- context/            # AuthContext, ThemeContext
|   |   |-- hooks/              # Custom hooks (useAnalysis, useAuth, etc.)
|   |   |-- pages/              # Landing, Dashboard, NewAnalysis, AnalysisDetail, History, etc.
|   |   |-- types/              # TypeScript definitions for Claim, Evidence, Analysis, User
|   |   |-- utils/              # Formatters, helpers, confidence color maps
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- package.json
|   |-- tailwind.config.js
|   `-- vite.config.ts
|-- server/                     # Node.js + Express.js Backend
|   |-- src/
|   |   |-- config/             # DB connection, env config, constants
|   |   |-- controllers/        # Auth, Analysis, Claim, User, Feedback controllers
|   |   |-- middleware/         # Auth guard, Rate limiting, Error handler, Upload, SSRF
|   |   |-- models/             # Mongoose schemas (User, Analysis, Claim, Evidence, Source, Feedback)
|   |   |-- routes/             # Versioned express routers (/api/v1/...)
|   |   |-- services/           # AI service client, URL fetcher, Document parser, OCR service
|   |   |-- utils/              # SSRF validator, logger, response formatter
|   |   `-- app.ts / index.ts
|   |-- tests/                  # Automated integration & unit tests (Jest/Supertest)
|   |-- package.json
|   `-- tsconfig.json
|-- ai-service/                 # Python FastAPI AI/ML Microservice
|   |-- app/
|   |   |-- api/                # FastAPI routers (/v1/extract-claims, /v1/assess, etc.)
|   |   |-- core/               # Config, logging, settings
|   |   |-- models/             # Pydantic schemas (ClaimRequest, AssessmentResult, etc.)
|   |   |-- pipeline/           # 8-stage modular processing pipeline
|   |   |   |-- preprocessor.py
|   |   |   |-- claim_extractor.py
|   |   |   |-- classifier.py
|   |   |   |-- embedder.py
|   |   |   |-- searcher.py
|   |   |   |-- ranker.py
|   |   |   |-- assessor.py
|   |   |   `-- confidence.py
|   |   |-- providers/          # LLM Provider abstraction (Gemini, OpenAI, Ollama, Fallback)
|   |   `-- main.py
|   |-- tests/                  # Pytest test cases
|   |-- evaluate.py             # Quantitative evaluation benchmark script
|   `-- requirements.txt
|-- docs/                       # Architecture, API Specs, Security, Evaluation docs
|-- docker-compose.yml          # Full multi-container orchestration
|-- README.md                   # Complete documentation and setup manual
`-- .gitignore
```

## 3. Database Schema (Mongoose / MongoDB)
- **User**: `name`, `email`, `passwordHash`, `role`, `preferences` (`theme`, `defaultProvider`), timestamps.
- **Analysis**: `userId` (optional/guest), `inputType` (`text`, `url`, `image`, `document`), `originalInput`, `extractedText`, `language`, `overallSummary`, `status` (`pending`, `processing`, `completed`, `failed`), `processingStage`, `metadata`, timestamps.
- **Claim**: `analysisId`, `claimNumber`, `originalText`, `normalizedText`, `category`, `namedEntities`, `relevantDates`, `numericValues`, `isVerifiable`, `assessmentStatus` (`SUPPORTED`, `REFUTED`, `MIXED`, `INSUFFICIENT_EVIDENCE`, `OUT_OF_CONTEXT`, `NOT_VERIFIABLE`), `assessmentExplanation`, `confidenceLabel` (`HIGH`, `MEDIUM`, `LOW`, `VERY_LOW`), `confidenceScore` (0.0 to 1.0), `confidenceFactors`, `contradictingSummary`, `supportingSummary`, `caveats`, timestamps.
- **Evidence**: `claimId`, `sourceId`, `sourceUrl`, `sourceTitle`, `publisher`, `publicationDate`, `retrievedAt`, `excerpt`, `excerptType` (`direct_quote`, `snippet`, `passage`), `relevanceScore`, `evidenceRelationship` (`SUPPORTS`, `REFUTES`, `CONTEXT`, `MENTION`), `directness` (`direct`, `indirect`), timestamps.
- **Source**: `canonicalUrl`, `domain`, `publisher`, `title`, `sourceType`, `isPrimarySource`, `reliabilityTier`, `language`, timestamps.
- **Feedback**: `userId`, `analysisId`, `claimId`, `feedbackType`, `description`, timestamps.

## 4. Phased Implementation Roadmap
- [x] Architecture, system contracts, and repository scaffolding
- [ ] Phase 1: AI/ML Python Microservice foundation (FastAPI, Pydantic, modular pipeline, embedder, claim extractor, retriever, trusted sources, assessor, confidence engine, LLM abstraction with fallback)
- [ ] Phase 2: Express Backend (Node.js/TypeScript, Mongoose schemas, Auth, SSRF-safe URL extractor, PDF/OCR handlers, Analysis orchestrator, unit/integration tests)
- [ ] Phase 3: React Frontend (Vite + TypeScript + Tailwind, Auth flow, 4-way input forms, live processing view, rich Results Dashboard, Evidence comparison, Explainability panel, History & Bookmarks)
- [ ] Phase 4: Integration, End-to-End verification, OCR & Document processing, Evaluation benchmarks (`evaluate.py`)
- [ ] Phase 5: Docker compose, documentation (README, architecture diagrams, security, user guide)
