import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Lock,
  Database,
  Layers,
  Activity,
  Cpu
} from 'lucide-react';
import { AssessmentBadge } from '../components/AssessmentBadge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickInput, setQuickInput] = useState<string>('');
  const [demoClaimIndex, setDemoClaimIndex] = useState<number>(0);

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate('/analyze', { state: { initialText: quickInput.trim() } });
  };

  const demoClaims = [
    {
      claim: "Election Commission systematically deleted millions of voters without statutory notification.",
      status: "REFUTED" as const,
      explanation: "Categorically refuted by the Election Commission of India. Statutory roll revisions include audited multi-party scrutiny under Rule 10-26 of Registration of Electors Rules.",
      source: "Election Commission / The Hindu / Independent Audit",
      domain: "eci.gov.in",
      url: "https://eci.gov.in",
      confidence: "HIGH (95%)",
      caveat: "Draft voter lists were published with public claims and objections windows."
    },
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
      source: "Associated Press / Independent Verification",
      domain: "apnews.com",
      url: "https://apnews.com",
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
      <section className="relative overflow-hidden pt-10 md:pt-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>AI-POWERED REAL-TIME FAKE NEWS & CLAIM DETECTOR</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Search The Internet.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600">
              Compare All News.
            </span>
            <br />
            Uncover Grounded Truth.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Deconstruct viral statements, news links, and documents. TruthLens searches the internet in real time,
            cross-references internal trained benchmarks, and displays every fake, good, and contextual response with complete citations.
          </p>

          {/* Interactive Fast-Check Input Bar */}
          <form onSubmit={handleQuickVerify} className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500/30 dark:border-brand-500/40 shadow-xl shadow-brand-500/10 focus-within:border-brand-500 transition-all">
              <div className="flex items-center gap-2.5 w-full px-3 py-1.5">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Paste a viral claim, headline, or article URL (e.g., https://...)"
                  className="w-full text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm whitespace-nowrap shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-3">
              <span>Try: <em>"Apollo moon landing fake"</em></span>
              <span>•</span>
              <span><em>"Vaccine microchip 5G"</em></span>
              <span>•</span>
              <span><em>"Election commission voter list"</em></span>
            </div>
          </form>
        </div>
      </section>

      {/* Authority Sources Bar */}
      <section className="border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Cross-Referenced Against Curated Global Authority Sources
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Reuters Wire</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Associated Press</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> World Health Org (WHO)</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Election Commission (ECI)</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Snopes / IFCN</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> PubMed & Science Direct</span>
          </div>
        </div>
      </section>

      {/* 4 Input Modalities */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Universal Verification Modalities
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Submit forwarded social media text, article URLs, screenshots, or documents for end-to-end evidence corroboration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-brand-500/50 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Text & Forwarded Claims</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste forwarded messages, political statements, or viral social captions for atomic claim extraction.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-brand-500/50 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Live URL & Web Articles</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              SSRF-safe scraper extracts readable news articles and checks claims against independent global reporting.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-brand-500/50 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Screenshots & OCR</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Optical character recognition extracts claim text from image files, with user verification before analysis.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-brand-500/50 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">PDF & Official Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload reports or press releases with memory-safe text extraction and untrusted handling.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Report */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold tracking-wider uppercase mb-1">
                Live Demonstration Report
              </div>
              <h3 className="text-xl font-bold">Interactive Evidence & Final Prediction Explorer</h3>
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

      {/* Quick Links Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Learn About Our Technology</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore the 8-stage NLP pipeline, evidence extraction algorithms, and zero-hallucination design that powers TruthLens AI.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
            >
              <span>Read About Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Need Support or Partnerships?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Get in touch with our fact-checking research team for API integration, feedback submissions, or questions.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
            >
              <span>Contact Our Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
