import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  Search,
  Scale,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  GitBranch,
  Layers
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const stages = [
    {
      num: 1,
      title: 'Text Preprocessing & Boundary Segmentation',
      desc: 'Whitespace normalization, semantic punctuation protection (abbreviations like Dr., U.S., percentages, decimals), and character/n-gram language identification.'
    },
    {
      num: 2,
      title: 'Claim Extraction & Verifiability Filtering',
      desc: 'Atomic claim decomposition splitting compound clauses. Distinguishes verifiable empirical assertions from subjective opinions, future predictions, satire, and questions.'
    },
    {
      num: 3,
      title: 'Topic & Domain Categorization',
      desc: 'Categorizes extracted claims across Politics & Government, Health & Medicine, Science, Finance, Crime, Environment, Education, and General News.'
    },
    {
      num: 4,
      title: 'Semantic Vector Embeddings & Similarity Matching',
      desc: 'Generates dense vector representations using subword n-gram vectorization and cosine similarity to match paraphrased reporting (e.g. "40% reduction" vs "fell by two-fifths").'
    },
    {
      num: 5,
      title: 'Multi-Query Search & Trusted Source Ranking',
      desc: 'Executes targeted queries with entity anchors, counter-queries, and cross-checks against a curated registry of primary datasets, wire services, and IFCN fact-checkers.'
    },
    {
      num: 6,
      title: 'Stance Detection & Contradiction Mining',
      desc: 'Analyzes retrieved passages for explicit corroboration, contextual nuances, or debunking signals (e.g. "disproved", "denied", "misleading", "no evidence").'
    },
    {
      num: 7,
      title: 'Evidence-Grounded Synthesis & Anti-Hallucination',
      desc: 'Constrains language model reasoning strictly to retrieved passages with untrusted prompt injection defense. Unsupported or hallucinated citations are programmatically rejected.'
    },
    {
      num: 8,
      title: 'Multi-Factor Calibrated Confidence Engine',
      desc: 'Evaluates empirical retrieval factors: number of independent domains, primary source presence, agreement ratio, and directness to assign HIGH, MEDIUM, LOW, or VERY LOW confidence.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SCIENTIFIC ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          System Methodology & NLP Architecture
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Detailed documentation of TruthLens AI's modular pipeline, empirical confidence calibration, and algorithmic guardrails against hallucinated citations.
        </p>
      </div>

      {/* Core Doctrine */}
      <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Scale className="w-5 h-5 text-brand-400" />
          <span>The Core Doctrine: Evidence First, Verdict Second</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Traditional generative AI models frequently hallucinate plausible-sounding answers, nonexistent citations, fabricated publication dates, and unsupported percentages. TruthLens AI fundamentally separates retrieval from verdict formulation: an LLM is never allowed to act as an ungrounded oracle. Every verdict must map directly to retrieved external source passages.
        </p>
        <div className="p-3 bg-white/10 rounded-xl text-xs text-brand-200">
          <strong>Key Rule:</strong> If no reliable evidence is retrieved, the system returns <code className="bg-black/30 px-1.5 py-0.5 rounded text-white">INSUFFICIENT_EVIDENCE</code> rather than fabricating an assumption of falsity.
        </div>
      </div>

      {/* 8-Stage Pipeline Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-brand-600" />
          <span>The 8-Stage Processing Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {stages.map((st) => (
            <div
              key={st.num}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-extrabold text-sm flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
                {st.num}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{st.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Calibration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Calibrated Multi-Factor Confidence Metric
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Instead of producing arbitrary LLM probabilities such as "97% true", TruthLens calculates a deterministic confidence factor based on measurable empirical signals:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Independent Domains (25%)
            </span>
            <span>Measures distinct publisher netlocs reporting on the claim.</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Primary Sources (20%)
            </span>
            <span>Boosts confidence when official gazettes, court decrees, or peer-reviewed journals are present.</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Source Agreement (25%)
            </span>
            <span>Corroboration consensus ratio between supporting and contradicting passages.</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Directness & Coverage (30%)
            </span>
            <span>Direct numerical/entity matches vs indirect contextual mentions.</span>
          </div>
        </div>
      </div>

      {/* Known Limitations */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6 sm:p-8 space-y-3">
        <h3 className="text-base font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>Known Limitations & Operational Boundaries</span>
        </h3>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
          <li>
            <strong>Temporal Indexing Lag:</strong> Breaking news events developing in real time may take several minutes to hours before official corroboration or authoritative fact-checks appear in search indices.
          </li>
          <li>
            <strong>Paywalled or Offline Archives:</strong> Specialized academic journals or local offline records not indexed in public web search cannot be retrieved.
          </li>
          <li>
            <strong>OCR Limitations:</strong> Low-resolution, blurry, or distorted images may yield incomplete text extractions. Users must review and confirm extracted text before submission.
          </li>
          <li>
            <strong>No Substitute for Professional Judgment:</strong> TruthLens AI is designed as a research assistance tool for fact-checkers, students, and citizens, and does not replace medical, legal, or financial professionals.
          </li>
        </ul>
      </div>
    </div>
  );
};
