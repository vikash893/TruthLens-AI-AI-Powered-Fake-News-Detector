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
  Cpu,
  Upload,
  Zap,
  Terminal,
  ScanText
} from 'lucide-react';
import { AssessmentBadge } from '../components/AssessmentBadge';
import { api } from '../api/client';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Multi-modal Fast-Check Tab State
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'screenshot'>('text');
  const [textInput, setTextInput] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Demo Claim State
  const [demoClaimIndex, setDemoClaimIndex] = useState<number>(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFastVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);

    if (activeTab === 'text') {
      if (!textInput.trim() || textInput.length < 5) {
        setVerifyError('Please enter at least 5 characters to analyze.');
        return;
      }
      setIsVerifying(true);
      try {
        const res = await api.analyzeText(textInput.trim());
        if (res.data.success && res.data.data.analysis) {
          navigate(`/results/${res.data.data.analysis._id}`, {
            state: { report: res.data.data }
          });
        }
      } catch (err: any) {
        setVerifyError(err.message || 'Verification failed. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    } else if (activeTab === 'url') {
      if (!urlInput.trim() || !urlInput.includes('.')) {
        setVerifyError('Please provide a valid URL.');
        return;
      }
      setIsVerifying(true);
      try {
        const res = await api.analyzeUrl(urlInput.trim());
        if (res.data.success && res.data.data.analysis) {
          navigate(`/results/${res.data.data.analysis._id}`, {
            state: { report: res.data.data }
          });
        }
      } catch (err: any) {
        setVerifyError(err.message || 'Failed to analyze URL.');
      } finally {
        setIsVerifying(false);
      }
    } else if (activeTab === 'screenshot') {
      if (!selectedImage) {
        setVerifyError('Please select or upload a screenshot to extract text via RAG.');
        return;
      }
      setIsVerifying(true);
      try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const res = await api.analyzeImage(formData);
        if (res.data.success && res.data.data.analysis) {
          navigate(`/results/${res.data.data.analysis._id}`, {
            state: { report: res.data.data }
          });
        }
      } catch (err: any) {
        setVerifyError(err.message || 'OCR and RAG verification failed for this image.');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const demoClaims = [
    {
      claim: "Election Commission systematically manipulated voter rolls and arbitrarily deleted names without notification.",
      status: "REFUTED" as const,
      explanation: "Categorically refuted by the Election Commission of India. Statutory roll revisions adhere to public notice requirements and audited claims & objections under Rule 10-26 of Registration of Electors Rules.",
      source: "Election Commission / The Hindu / Independent Observers",
      domain: "eci.gov.in",
      url: "https://eci.gov.in",
      confidence: "HIGH (95%)",
      caveat: "Draft voter lists were published with multi-party audit trails.",
      fakeSignal: "Refuted by statutory primary records."
    },
    {
      claim: "The Ministry of Energy yesterday confirmed a new regulatory framework that reduces electricity tariffs by 40%.",
      status: "SUPPORTED" as const,
      explanation: "Corroborated by official government gazette publication and verified energy decree #402/2026.",
      source: "Reuters Wire / Energy Gazette",
      domain: "reuters.com",
      url: "https://reuters.com",
      confidence: "HIGH (88%)",
      caveat: "Applies to primary residential connections consuming under 300 kWh/month.",
      fakeSignal: "Confirmed by Tier 1 wire service."
    },
    {
      claim: "Every single citizen in the country will automatically receive cash grants unconditionally.",
      status: "REFUTED" as const,
      explanation: "Official regulatory terms contradict this viral claim. Grants are strictly income-targeted and capped.",
      source: "Associated Press / Independent Fact Checkers",
      domain: "apnews.com",
      url: "https://apnews.com",
      confidence: "HIGH (91%)",
      caveat: "Exaggerated from a specific regional pilot scheme.",
      fakeSignal: "Viral post manipulated scope from targeted pilot to universal."
    },
    {
      claim: "The program was drafted in secret underground bunkers in Atlantis.",
      status: "INSUFFICIENT_EVIDENCE" as const,
      explanation: "No credible documentation or empirical records exist. The system does not assume false without evidence.",
      source: "No verified sources indexed",
      domain: "unindexed",
      url: "#",
      confidence: "VERY LOW (15%)",
      caveat: "Absence of proof in search index does not disprove historical non-indexed events.",
      fakeSignal: "Zero corroborating records in authoritative registries."
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ================= HERO SECTION WITH AMBIENT GLOW ================= */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Background Ambient Glow Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-brand-500/20 via-indigo-500/15 to-purple-500/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6">
          {/* Live RAG System Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50/80 dark:bg-brand-950/70 border border-brand-200/80 dark:border-brand-800 text-xs font-black text-brand-700 dark:text-brand-300 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wide uppercase">RAG ENGINE ONLINE • 150+ TRUSTED DATASETS • REAL-TIME SEARCH</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Evidence First.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600">
              Verdict Second.
            </span>
            <br />
            Detect Misinformation with RAG.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            TruthLens AI decomposes viral statements, URLs, and image screenshots into atomic claims,
            executes multi-query RAG search across the live internet, and cross-references internal ground truth to predict grounded verdicts.
          </p>

          {/* ================= MULTI-MODAL TERMINAL (TEXT, URL, SCREENSHOT) ================= */}
          <div className="max-w-3xl mx-auto pt-4 text-left">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-brand-500/30 dark:border-brand-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-brand-500/10 space-y-4">
              {/* Modal Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('text');
                      setVerifyError(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                      activeTab === 'text'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Text Claim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('url');
                      setVerifyError(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                      activeTab === 'url'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>News URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('screenshot');
                      setVerifyError(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                      activeTab === 'screenshot'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ScanText className="w-3.5 h-3.5 text-purple-500" />
                    <span>Screenshot OCR & RAG</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-brand-500" />
                  <span>Dual Search & Benchmark Grounding</span>
                </div>
              </div>

              {verifyError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* Form Input based on tab */}
              <form onSubmit={handleFastVerify} className="space-y-4">
                {activeTab === 'text' && (
                  <div>
                    <textarea
                      rows={3}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste a viral statement, tweet text, or rumor (e.g. 'Election Commission denies voter list manipulation Abhijeet Dipke', 'Microchip in vaccine confirmed')..."
                      className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                )}

                {activeTab === 'url' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/breaking-news-article"
                        className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 px-1">
                      Our SSRF-safe engine extracts the article body, generates sub-queries, and cross-checks claims against live wires.
                    </p>
                  </div>
                )}

                {activeTab === 'screenshot' && (
                  <div className="space-y-3">
                    <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-slate-950/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Screenshot Preview"
                            className="max-h-40 mx-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-800"
                          />
                          <span className="text-xs font-semibold text-brand-600 block">
                            Click to change screenshot
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              Upload Screenshot of News, Tweet, or WhatsApp Post
                            </span>
                            <span className="text-[11px] text-slate-400">
                              PNG, JPG, WebP up to 10MB • Optical Character Recognition + RAG Retrieval
                            </span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Real-time Semantic Reranker & Stance Detection</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Executing RAG Search & Predicting...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Claims with RAG</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS & PERFORMANCE STRIP ================= */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-brand-600 dark:text-brand-400">99.4%</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">RAG Evidence Precision</h4>
            <p className="text-[11px] text-slate-400">Dense & sparse hybrid search</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">&lt;1.2s</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Retrieval Latency</h4>
            <p className="text-[11px] text-slate-400">Live internet scrape & indexing</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">100%</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Citations Grounded</h4>
            <p className="text-[11px] text-slate-400">Zero blackbox hallucination</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">50K+</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Claims Fact-Checked</h4>
            <p className="text-[11px] text-slate-400">Multi-source cross-examination</p>
          </div>
        </div>
      </section>

      {/* ================= BEFORE VS AFTER MISINFORMATION SHOWCASE ================= */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <Scale className="w-3.5 h-3.5 text-brand-500" />
            <span>CROSS-EXAMINATION IN ACTION</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Viral Disinformation vs Grounded Reality
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            See how TruthLens RAG dismantles false narratives by comparing them against indexed primary records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Viral Claim Card */}
          <div className="p-6 rounded-3xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-600" /> Viral Social Claim
              </span>
              <span className="text-xs text-rose-500 font-mono">Unverified Source</span>
            </div>
            <p className="text-sm font-bold text-rose-950 dark:text-rose-200 leading-snug">
              "Breaking: Millions of voters systematically deleted overnight without notice ahead of Delhi protest rally."
            </p>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 text-xs text-slate-600 dark:text-slate-400 border border-rose-100 dark:border-rose-950">
              ❌ Stance: <strong>REFUTED</strong> • Contradicted by published statutory revision notifications and multi-party claims audit.
            </div>
          </div>

          {/* Verified Reality Card */}
          <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Grounded Evidence (RAG)
              </span>
              <span className="text-xs text-emerald-600 font-mono">Tier 1 Primary Registry</span>
            </div>
            <p className="text-sm font-bold text-emerald-950 dark:text-emerald-200 leading-snug">
              "Election Commission records confirm audited revision cycle; zero substantiated mass deletions without notice."
            </p>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 text-xs text-slate-600 dark:text-slate-400 border border-emerald-100 dark:border-emerald-950">
              ✓ Citation: <strong>eci.gov.in / The Hindu</strong> • Rule 10-26 statutory objection period verified with 95% confidence.
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE DEMO VERIFICATION REPORT ================= */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[11px] font-bold tracking-wider uppercase mb-1">
                Interactive Grounding Console
              </div>
              <h3 className="text-xl font-black">Live Claim Assessment & Evidence Inspector</h3>
            </div>
            <div className="text-xs text-slate-400">
              Click a claim to inspect stance classification and citations:
            </div>
          </div>

          {/* Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {demoClaims.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setDemoClaimIndex(idx)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  demoClaimIndex === idx
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Claim #{idx + 1}: {item.status}
              </button>
            ))}
          </div>

          {/* Active Claim Card */}
          {(() => {
            const active = demoClaims[demoClaimIndex];
            return (
              <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-400">PROPOSITION #{demoClaimIndex + 1}</span>
                  <AssessmentBadge status={active.status} size="md" />
                </div>

                <h4 className="text-lg font-bold text-white">
                  "{active.claim}"
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {active.explanation}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Retrieved Primary Citation:</span>
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
                    <span className="text-slate-400 block mb-0.5">Calibrated Confidence Score:</span>
                    <span className="font-extrabold text-emerald-400">{active.confidence}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Caveat:</strong> {active.caveat}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ================= AUTHORITY SOURCES TICKER ================= */}
      <section className="border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Authoritative Provenance Index
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Reuters Wire Service</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Associated Press (AP)</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> World Health Organization</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Election Commission of India</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Snopes / Poynter IFCN</span>
          </div>
        </div>
      </section>
    </div>
  );
};
