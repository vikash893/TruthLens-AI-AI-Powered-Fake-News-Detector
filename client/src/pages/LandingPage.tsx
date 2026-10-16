import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  FileText,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Scale,
  ExternalLink,
  Lock
} from 'lucide-react';
import { AssessmentBadge } from '../components/AssessmentBadge';

export const LandingPage: React.FC = () => {
  const [demoClaimIndex, setDemoClaimIndex] = useState<number>(0);

  const demoClaims = [
    {
      claim: "The Ministry of Energy yesterday confirmed a new regulatory framework that cuts residential electricity tariffs by 40%.",
      status: "SUPPORTED" as const,
      explanation: "Corroborated by official gazette publication and verified energy ministry decree #402/2026.",
      source: "Reuters / Energy Ministry Gazette",
      domain: "reuters.com",
      url: "https://reuters.com",
      confidence: "HIGH (88%)",
      caveat: "Applies to primary residential connections consuming under 300 kWh/month."
    },
    {
      claim: "Every single citizen in the country will automatically receive cash energy grants unconditionally.",
      status: "REFUTED" as const,
      explanation: "Official regulatory terms contradict this viral claim. Subsidies are income-targeted and capped.",
      source: "Full Fact / Independent Verification",
      domain: "fullfact.org",
      url: "https://fullfact.org",
      confidence: "HIGH (91%)",
      caveat: "Exaggerated from a specific pilot program for low-income brackets."
    },
    {
      claim: "The electricity program was drafted following secret unrecorded meetings in an underground bunker in Atlantis.",
      status: "INSUFFICIENT_EVIDENCE" as const,
      explanation: "No credible documentation or empirical records exist. The system does not assume false without proof.",
      source: "No verified sources indexed",
      domain: "unindexed",
      url: "#",
      confidence: "VERY LOW (15%)",
      caveat: "Absence of proof in search index does not disprove historical non-indexed events."
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EVIDENCE FIRST, VERDICT SECOND</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Transparent Misinformation Verification{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600">
              Grounded in Hard Evidence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            TruthLens AI decomposes viral statements, news links, and screenshots into atomic claims, retrieves independent evidence from trusted sources, and presents transparent citations with calibrated uncertainty.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Analyze Content Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
            >
              <span>Read Methodology</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Input Types Feature Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Four Controlled Input Modalities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Submit forwarded social media text, article links, screenshots, or documents for end-to-end evidence corroboration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">Text & Statements</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste forwarded messages, political statements, or viral social captions for atomic claim extraction.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">URL & Web Articles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              SSRF-safe scraper extracts readable news articles and checks claims against independent reporting.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">Screenshots & OCR</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Optical character recognition extracts claim text from image files, with user verification before analysis.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">PDF & Documents</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload reports or press releases up to 20 pages with memory-safe text extraction and untrusted handling.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Report (Required) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold tracking-wider uppercase mb-1">
                Demonstration Verification Report
              </div>
              <h3 className="text-xl font-bold">Interactive Evidence Explorer</h3>
            </div>
            <div className="text-xs text-slate-400">
              Select a claim to inspect its evidence breakdown:
            </div>
          </div>

          {/* Claim Selector Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {demoClaims.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setDemoClaimIndex(idx)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  demoClaimIndex === idx
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Claim #{idx + 1}: {item.status}
              </button>
            ))}
          </div>

          {/* Active Demo Claim Card */}
          {(() => {
            const active = demoClaims[demoClaimIndex];
            return (
              <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-400">CLAIM #{demoClaimIndex + 1}</span>
                  <AssessmentBadge status={active.status} size="md" />
                </div>

                <h4 className="text-lg font-bold text-white">
                  "{active.claim}"
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {active.explanation}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Primary Citation:</span>
                    <a
                      href={active.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>{active.source}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Calibrated Confidence:</span>
                    <span className="font-bold text-slate-200">{active.confidence}</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-3 text-xs text-amber-300 border border-amber-900/40">
                  <strong>Caveat:</strong> {active.caveat}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Methodology & Limitations */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Scientific Transparency & Ethical Principles
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Unlike black-box generative chatbots, TruthLens AI cannot independently synthesize facts from memory. Every claim verdict must be directly matched to retrieved external passages or explicitly flagged as <strong>INSUFFICIENT_EVIDENCE</strong>.
        </p>
        <div className="pt-2">
          <Link
            to="/methodology"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Explore our 8-Stage NLP & Retrieval Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
