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
  CheckCircle2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800">
          <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>About TruthLens AI System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Pioneering Evidence-Grounded Verification for the Digital Era
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          TruthLens AI is an open, verifiable intelligence platform designed to dismantle misinformation,
          detect deepfake narratives, and anchor truth in verifiable primary source citations.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Evidence-First Methodology</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We reject arbitrary "truth percentages". Every claim assessment is accompanied by primary source citations,
            verbatim excerpts, and transparent confidence calibration factors.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Web & Knowledge Cross-Check</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our engine cross-checks claims against live global reporting, international fact-checking syndicates (IFCN),
            and curated internal ground-truth databases.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Privacy & Ethical AI</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Rigorous SSRF filtering, ephemeral memory execution, strict role-based access, and complete audit
            transparency ensure user data is never harvested or weaponized.
          </p>
        </div>
      </div>

      {/* 8-Stage Verification Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Under The Hood</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            The 8-Stage Verification Architecture
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            How raw text, URLs, screenshots, and documents are transformed into grounded verifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              num: '01',
              title: 'Ingestion & Normalization',
              desc: 'Cleans HTML, parses PDF tokens, runs OCR on screenshots, and strips tracking metadata.'
            },
            {
              num: '02',
              title: 'Claim Extraction',
              desc: 'Isolates distinct verifiable empirical propositions using transformer attention maps.'
            },
            {
              num: '03',
              title: 'Context Anchoring',
              desc: 'Identifies entities, locations, dates, and baseline reporting attribution.'
            },
            {
              num: '04',
              title: 'Multi-Query Search',
              desc: 'Executes targeted search queries across live web and internal fact registries.'
            },
            {
              num: '05',
              title: 'Evidence Ranking',
              desc: 'Scores semantic alignment, domain reliability tiers, and wire syndication overlap.'
            },
            {
              num: '06',
              title: 'Stance Classification',
              desc: 'Categorizes evidence as SUPPORTS, REFUTES, or CONTEXT using NLI cross-encoders.'
            },
            {
              num: '07',
              title: 'Confidence Calibration',
              desc: 'Calculates agreement ratios, primary source weight, recency, and coverage scores.'
            },
            {
              num: '08',
              title: 'Synthesis & Citations',
              desc: 'Generates transparent assessments with explicit caveats and direct outbound links.'
            }
          ].map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5"
            >
              <span className="text-xs font-black text-brand-600 dark:text-brand-400">{step.num}</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Source Reliability Tiers */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Authority & Reliability Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                TIER 1 • PRIMARY & WIRE
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Government gazettes, statutory bodies (e.g. Election Commissions, WHO, CDC), academic repositories (PubMed, arXiv), and global wire services (Reuters, AP).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
                TIER 2 • CERTIFIED FACT CHECKERS
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              IFCN-certified fact-checking organizations (Snopes, PolitiFact, FactCheck.org) and established investigative news outlets with public correction policies.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-center space-y-4 shadow-lg shadow-brand-500/20">
        <h2 className="text-2xl font-black">Experience Verifiable Truth</h2>
        <p className="text-xs sm:text-sm text-brand-100 max-w-xl mx-auto">
          Test any news claim, viral URL, or document right now with TruthLens AI.
        </p>
        <div className="pt-2">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md"
          >
            <span>Start Analysis Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
