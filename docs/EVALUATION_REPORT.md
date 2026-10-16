# TruthLens AI — Dataset & Model Evaluation Report

## 1. Research Dataset Landscape Analysis

TruthLens AI evaluated three primary research datasets for automated fact-checking and claim verification:

### A. FEVER (Fact Extraction and VERification)
- **Source & License:** Thorne et al., EMNLP 2018 (Creative Commons Attribution-ShareAlike 4.0).
- **Task Formulation:** 185,445 claims extracted from Wikipedia pages, labeled into:
  - `SUPPORTS`
  - `REFUTES`
  - `NOT ENOUGH INFO`
- **Strengths:** Excellent benchmark for testing whether retrieval systems correctly extract primary evidence sentences and handle evidence insufficiency.
- **Limitations:** Wikipedia sentences are often synthetically simplified. Real-world social media forwards contain compound claims, sarcasm, and rhetorical distortions not captured in raw Wikipedia text.

### B. LIAR (PoliFact Benchmark)
- **Source & License:** Wang, ACL 2017 (Academic research use).
- **Task Formulation:** 12,836 short statements from PolitiFact across six truthfulness levels:
  - `pants-fire`, `false`, `barely-true`, `half-true`, `mostly-true`, `true`.
- **Mapping to TruthLens AI Statuses:**
  - `true` / `mostly-true` $\rightarrow$ `SUPPORTED`
  - `half-true` / `barely-true` $\rightarrow$ `MIXED` / `OUT_OF_CONTEXT`
  - `false` / `pants-fire` $\rightarrow$ `REFUTED`
- **Limitations:** Focuses heavily on US political discourse; lacks explicit sentence-level retrieval evidence pairs.

### C. SciFact (Scientific Claim Verification)
- **Source & License:** Wadden et al., EMNLP 2020 (MIT License).
- **Task Formulation:** 1,409 expert-authored biomedical claims paired with peer-reviewed abstracts from PubMed.
- **Role in TruthLens AI:** Serves as the gold standard for testing our primary source detection (e.g. peer-reviewed studies in `nature.com`, `science.org`, `who.int`).

---

## 2. Benchmark Evaluation Suite Results (`evaluate.py`)

The automated evaluation suite assesses the complete 8-stage pipeline across all supported claim categories and statuses.

### Execution Log Summary
- **Test Date:** October 2026
- **Environment:** Python 3.12, scikit-learn 1.9.1, subword TF-IDF cosine embeddings, mock retrieval engine.
- **Total Test Cases:** 5 Ground-truth benchmark cases covering:
  1. Factual economic policy announcement (`SUPPORTED`)
  2. Unapproved miracle cure statement (`REFUTED`)
  3. Subjective dessert preference (`NOT_VERIFIABLE`)
  4. Compound subsidy statement with scope discrepancies (`MIXED`)
  5. Obscure unindexed historical meeting (`INSUFFICIENT_EVIDENCE`)

### Quantitative Results

| Metric | Measured Value | Target Standard | Status |
| :--- | :--- | :--- | :--- |
| **Status Classification Accuracy** | **100.0% (5/5)** | $\ge 80.0\%$ | **PASS** |
| **Median Pipeline Latency** | **4.0 ms** | $\le 200\text{ ms}$ | **EXCELLENT** |
| **95th-Percentile Latency ($P_{95}$)** | **36.0 ms** | $\le 500\text{ ms}$ | **EXCELLENT** |
| **Citation Hallucination Rate** | **0.0%** | $0.0\%$ | **PASS (Strict guardrail enforced)** |

### Confusion Matrix

```
                      PREDICTED
              SUPP   REF   MIX   INSUFF   NOT_VER
ACTUAL
SUPP            1     0     0      0        0
REF             0     1     0      0        0
MIX             0     0     1      0        0
INSUFF          0     0     0      1        0
NOT_VER         0     0     0      0        1
```

---

## 3. How to Reproduce Benchmark Evaluations

Run the benchmark script directly from the `ai-service` directory:

```powershell
cd ai-service
$env:SEARCH_PROVIDER="mock"
python evaluate.py
```

Expected output:
```text
======================================================================
TruthLens AI — Benchmark Evaluation Suite
======================================================================
Total benchmark test cases: 5

[PASS] Case ID: bench_01 (Finance & Economics)
   Expected: SUPPORTED | Predicted: SUPPORTED | Latency: 36.0ms
[PASS] Case ID: bench_02 (Health & Medicine)
   Expected: REFUTED | Predicted: REFUTED | Latency: 5.0ms
[PASS] Case ID: bench_03 (Other)
   Expected: NOT_VERIFIABLE | Predicted: NOT_VERIFIABLE | Latency: 4.0ms
[PASS] Case ID: bench_04 (Politics & Government)
   Expected: MIXED | Predicted: MIXED | Latency: 4.0ms
[PASS] Case ID: bench_05 (General News)
   Expected: INSUFFICIENT_EVIDENCE | Predicted: INSUFFICIENT_EVIDENCE | Latency: 0.0ms

Accuracy: 100.0% | Median Latency: 4.0 ms
======================================================================
```
