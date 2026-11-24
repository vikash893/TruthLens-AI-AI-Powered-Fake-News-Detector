import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Scale,
  BrainCircuit,
  Lock,
  Globe2,
  FileCheck2,
  Cpu,
  ArrowRight,
  Database,
  CheckCircle2,
  ScanText,
  Layers,
  Sparkles,
  Zap,
  Terminal,
  Activity
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-14 space-y-20">
      {/* ================= HERO SECTION ================= */}
      <div className="relative text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 text-xs font-black border border-brand-200 dark:border-brand-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>ABOUT TRUTHLENS AI PLATFORM</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Pioneering Evidence-Grounded Verification with Multi-Modal RAG
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          TruthLens AI is an open, verifiable intelligence architecture engineered to dismantle digital misinformation,
          isolate claims from screenshots and articles, and anchor final verdicts in primary source citations.
        </p>
      </div>

      {/* ================= RAG ARCHITECTURE SPOTLIGHT ================= */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 space-y-10">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">
            Core Technology
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            How RAG (Retrieval-Augmented Generation) Works for Screenshots & Text
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Unlike traditional generative LLMs that hallucinate from static weights, TruthLens strictly separates retrieval from synthesis:
          </p>
        </div>

        {/* 4-Step RAG Interactive Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-sm">
              <ScanText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">STAGE 1</span>
            <h4 className="text-sm font-bold text-white">OCR & Ingestion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts text from screenshots, strips HTML noise from URLs, and normalizes unicode characters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-black text-sm">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">STAGE 2</span>
            <h4 className="text-sm font-bold text-white">Claim Decomposition</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstructs noisy text into individual testable propositions, dates, numerical values, and named entities.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-sm">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">STAGE 3</span>
            <h4 className="text-sm font-bold text-white">Dual-Source Retrieval</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queries the live internet (DuckDuckGo/wire services) and cross-references internal curated ground-truth benchmarks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-sm">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">STAGE 4</span>
            <h4 className="text-sm font-bold text-white">Stance Prediction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reranks retrieved passages, tags evidence as SUPPORTS / REFUTES, and outputs final prediction with confidence score.
            </p>
          </div>
        </div>
      </div>

      {/* ================= CORE PILLARS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Evidence First, Verdict Second</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We reject arbitrary single-number "truth percentages". Every claim is backed by verified excerpts,
            direct outbound citations, and explicit caveats regarding missing context.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Continuous Live Web Grounding</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our multi-query retriever queries live reporting and international fact-checking syndicates (IFCN, Snopes, Reuters)
            to detect emerging hoaxes as they propagate.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-brand-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Strict Privacy & Zero-Retention</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            SSRF-safe network proxies, untrusted sandbox document parsing, and session-scoped memory prevent
            user queries from leaking or training external closed models.
          </p>
        </div>
      </div>

      {/* ================= AUTHORITY RELIABILITY TIERS ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Provenance Standards</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Source Reliability Tier Hierarchy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every retrieved URL and citation is weighted through a 4-tier provenance filter:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px] uppercase">
                TIER 1 • PRIMARY STATUTORY & WIRE
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Weight: 1.0</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Government gazettes, statutory bodies (Election Commission of India, WHO, CDC, NASA), academic peer-reviewed archives (PubMed, arXiv), and global wire services (Reuters, AP).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black text-[10px] uppercase">
                TIER 2 • CERTIFIED FACT CHECKERS
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Weight: 0.85</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              IFCN-signatory fact-checking networks (Snopes, Poynter, FactCheck.org, Full Fact) and national newspapers of record with public correction policies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-[10px] uppercase">
                TIER 3 • GENERAL WEB & BLOGS
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Weight: 0.50</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Commercial digital media, independent editorial blogs, and community forums. Treated as secondary context unless corroborated by Tier 1 or 2 sources.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-black text-[10px] uppercase">
                TIER 4 • KNOWN DISINFORMATION & SATIRE
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Weight: 0.0 (Flagged)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Domains repeatedly flagged for fabricating viral content, satire outlets without clear labels, and unverified phishing aggregators.
            </p>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CTA ================= */}
      <div className="p-10 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white text-center space-y-5 shadow-xl shadow-brand-500/20">
        <h2 className="text-3xl font-black">Experience Verifiable Truth in Action</h2>
        <p className="text-xs sm:text-sm text-brand-100 max-w-xl mx-auto leading-relaxed">
          Paste any viral claim, upload a screenshot, or submit an article URL to test the TruthLens RAG engine.
        </p>
        <div className="pt-2">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-brand-700 font-extrabold text-xs hover:bg-slate-100 transition-all shadow-md hover:scale-105"
          >
            <span>Launch Analysis Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
