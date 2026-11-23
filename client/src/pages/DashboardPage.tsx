import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Search,
  Globe,
  FileText,
  Bookmark,
  History,
  User,
  Info,
  PhoneCall,
  LogOut,
  ChevronRight,
  Database,
  ExternalLink,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { api } from '../api/client';
import { IDashboardStats, IAnalysis } from '../types';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active section in user dashboard
  const [activeTab, setActiveTab] = useState<'overview' | 'quick_verify' | 'knowledge_base' | 'trusted_sources'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Fast Fact-Check Input State
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [inputText, setInputText] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboard();
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleFastVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);

    if (inputType === 'text' && !inputText.trim()) {
      setVerifyError('Please enter some text or news statement to verify.');
      return;
    }
    if (inputType === 'url' && !inputUrl.trim()) {
      setVerifyError('Please enter a valid news article URL.');
      return;
    }

    setVerifying(true);
    try {
      if (inputType === 'text') {
        const res = await api.analyzeText(inputText.trim());
        if (res.data.success && res.data.data.analysis) {
          navigate(`/results/${res.data.data.analysis._id}`, {
            state: { report: res.data.data }
          });
        }
      } else {
        const res = await api.analyzeUrl(inputUrl.trim());
        if (res.data.success && res.data.data.analysis) {
          navigate(`/results/${res.data.data.analysis._id}`, {
            state: { report: res.data.data }
          });
        }
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Analysis failed. Please check input and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const distribution = stats?.distribution || {
    SUPPORTED: 0,
    REFUTED: 0,
    MIXED: 0,
    INSUFFICIENT_EVIDENCE: 0,
    OUT_OF_CONTEXT: 0,
    NOT_VERIFIABLE: 0
  };

  const pieData = [
    { name: 'Supported', value: distribution.SUPPORTED || 0, color: '#10b981' },
    { name: 'Refuted (Fake)', value: distribution.REFUTED || 0, color: '#ef4444' },
    { name: 'Mixed / Context', value: (distribution.MIXED || 0) + (distribution.OUT_OF_CONTEXT || 0), color: '#f59e0b' },
    { name: 'Insufficient Evidence', value: (distribution.INSUFFICIENT_EVIDENCE || 0) + (distribution.NOT_VERIFIABLE || 0), color: '#64748b' }
  ].filter((d) => d.value > 0);

  const topicData = stats?.topicBreakdown || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Features Sidebar Menu</span>
        </button>
        <span className="text-[11px] font-semibold text-brand-600 capitalize">
          {user ? `${user.name} (${user.role})` : 'User Dashboard'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ================= USER DASHBOARD SIDEBAR ================= */}
        <aside
          className={`lg:col-span-1 ${
            sidebarOpen ? 'block' : 'hidden lg:block'
          } space-y-6`}
        >
          {/* User Profile Card in Sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-brand-500/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {user?.name || 'Verified Analyst'}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@truthlens.ai'}</p>
                <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 uppercase">
                  {user?.role || 'user'} account
                </span>
              </div>
            </div>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-between transition-colors hover:bg-purple-100"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Dashboard
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Website Features Navigation Links */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-1 text-xs font-semibold">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Core Features & Tools
            </div>

            <button
              onClick={() => {
                setActiveTab('overview');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'overview'
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-brand-500" />
                Analytics Overview
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setActiveTab('quick_verify');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'quick_verify'
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-emerald-500" />
                Live Fact-Check (Text / URL)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <Link
              to="/analyze"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-blue-500" />
                Full Modal Analysis Studio
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/history"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-purple-500" />
                Verification History
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/saved"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-amber-500" />
                Saved Reports & Bookmarks
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={() => {
                setActiveTab('knowledge_base');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'knowledge_base'
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-indigo-500" />
                Internal Training Benchmark
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setActiveTab('trusted_sources');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                activeTab === 'trusted_sources'
                  ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-teal-500" />
                Authoritative Sources
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800/80 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Account & Info
            </div>

            <Link
              to="/profile"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400" />
                My Profile & Preferences
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/about"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-slate-400" />
                About TruthLens
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/contact"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-slate-400" />
                Contact & Support
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors pt-2"
            >
              <span className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4" />
                Sign Out
              </span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD CONTENT AREA ================= */}
        <main className="lg:col-span-3 space-y-8">
          {/* Top In-Place Fact-Check Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  Instant Web & Internal Data Verification
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter any text statement or paste any internet URL. Our engine searches the web, cross-checks training data, and generates a grounded verdict.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    inputType === 'text'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Text Statement
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    inputType === 'url'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Internet URL
                </button>
              </div>
            </div>

            {verifyError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleFastVerify} className="space-y-3">
              {inputType === 'text' ? (
                <div>
                  <textarea
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter claim or news text to cross-check across the internet... (e.g., 'Election commission voter list manipulation Abhijeet Dipke', 'Apollo moon landing was faked')"
                    className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste full news article URL (e.g. https://thehindu.com/news/national/...)"
                    className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-slate-400">
                  Cross-checks: <strong>DuckDuckGo Live Search + Internal Benchmarks + Trusted Tiers</strong>
                </span>
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Against Internet & Data...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Live Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Conditional View: Knowledge Base Explorer */}
          {activeTab === 'knowledge_base' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-500" />
                    Internal Ground-Truth Training Benchmarks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pre-curated factual propositions and indexed viral disinformation benchmarks for high-precision comparison.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Back to Overview
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    title: 'Electoral Integrity & Roll Revisions',
                    keywords: 'voter, election commission, manipulation, dipke, cockroach',
                    verdict: 'REFUTED',
                    desc: 'Statutory ECI guidelines, Form 6/7/8 claims and objections audit trails contradict arbitrary mass deletion claims.'
                  },
                  {
                    title: 'Vaccine Microchip & 5G Conspiracy',
                    keywords: 'vaccine, microchip, 5g, nanobot, tracking',
                    verdict: 'REFUTED',
                    desc: 'Biological chemical composition confirmed by WHO, FDA, EMA; zero microelectronic or tracking components.'
                  },
                  {
                    title: 'Apollo Moon Landings Authenticity',
                    keywords: 'moon, landing, hoax, apollo, fake, hollywood',
                    verdict: 'REFUTED',
                    desc: 'Definitively established by Lunar Laser Ranging retroreflectors, 382kg rock samples, and Soviet telemetry.'
                  },
                  {
                    title: 'Anthropogenic Climate Change Science',
                    keywords: 'climate, global warming, hoax, temperature, co2',
                    verdict: 'REFUTED',
                    desc: 'Over 99% peer-reviewed consensus and multi-national atmospheric sensors confirm warming trends.'
                  }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {item.verdict}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{item.desc}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Keywords: {item.keywords}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditional View: Trusted Sources Directory */}
          {activeTab === 'trusted_sources' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-teal-500" />
                    Trusted Sources Registry
                  </h3>
                  <p className="text-xs text-slate-500">
                    Domain reliability tiers used to weight evidence ranking during web retrieval.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Back to Overview
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                {[
                  { domain: 'who.int', name: 'World Health Organization', tier: 'TIER_1', primary: true },
                  { domain: 'reuters.com', name: 'Reuters Wire Service', tier: 'TIER_1', primary: false },
                  { domain: 'apnews.com', name: 'Associated Press', tier: 'TIER_1', primary: false },
                  { domain: 'eci.gov.in', name: 'Election Commission of India', tier: 'TIER_1', primary: true },
                  { domain: 'snopes.com', name: 'Snopes Fact Check', tier: 'TIER_2', primary: false },
                  { domain: 'fullfact.org', name: 'Full Fact UK', tier: 'TIER_2', primary: false }
                ].map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {s.tier}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block">{s.domain}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {s.primary ? 'Primary Statutory Authority' : 'Independent IFCN / Wire'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400">Total Analyses</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {stats?.totalAnalyses ?? 0}
              </div>
              <span className="text-[11px] text-slate-400">Analyses run by user</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400">Claims Checked</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {stats?.totalClaimsChecked ?? 0}
              </div>
              <span className="text-[11px] text-slate-400">Empirical propositions</span>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Fake / Refuted</span>
              <div className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-300">
                {distribution.REFUTED || 0}
              </div>
              <span className="text-[11px] text-rose-500/80">Debunked assertions</span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Supported / True</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
                {distribution.SUPPORTED || 0}
              </div>
              <span className="text-[11px] text-emerald-500/80">Corroborated by sources</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-brand-600" />
                Assessment Verdict Distribution
              </h3>
              {pieData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                  No verified claims in database yet. Try running an analysis above!
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart className="w-4 h-4 text-indigo-600" />
                Topic & Category Distribution
              </h3>
              {topicData.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                  Topic data will automatically populate as content is analyzed.
                </div>
              )}
            </div>
          </div>

          {/* Recent User Analyses List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Recent Fact-Checks & Verifications
              </h3>
              <Link to="/history" className="text-xs font-bold text-brand-600 hover:underline">
                View All History
              </Link>
            </div>

            {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {stats.recentAnalyses.map((item: any) => (
                  <Link
                    key={item._id}
                    to={`/results/${item._id}`}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 uppercase text-slate-600 dark:text-slate-400">
                          {item.inputType}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {item.overallSummary || 'Verification completed against retrieved sources.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ✓ {item.supportedClaimsCount || 0}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">/</span>
                        <span className="text-rose-600 dark:text-rose-400">
                          ✗ {item.refutedClaimsCount || 0}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent analyses. Enter a text or URL above to begin your first verification!
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
