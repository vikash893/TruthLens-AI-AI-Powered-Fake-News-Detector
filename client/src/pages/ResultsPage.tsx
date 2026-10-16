import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Bookmark,
  Share2,
  Filter,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Calendar,
  Globe,
  Printer
} from 'lucide-react';
import { api } from '../api/client';
import { IAnalysis, IClaim, AssessmentStatus } from '../types';
import { ClaimCard } from '../components/ClaimCard';
import { FeedbackModal } from '../components/FeedbackModal';
import { BookmarkModal } from '../components/BookmarkModal';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [analysis, setAnalysis] = useState<IAnalysis | null>(null);
  const [claims, setClaims] = useState<IClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'number' | 'confidence'>('number');

  // Modals
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>(undefined);
  const [bookmarkOpen, setBookmarkOpen] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  useEffect(() => {
    // If state passed from navigation, use it immediately
    if (location.state && location.state.report) {
      setAnalysis(location.state.report.analysis);
      setClaims(location.state.report.claims);
      setLoading(false);
      return;
    }

    if (!id) return;

    const fetchReport = async () => {
      try {
        const res = await api.getAnalysis(id);
        if (res.data.success && res.data.data) {
          setAnalysis(res.data.data.analysis);
          setClaims(res.data.data.claims);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve analysis report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, location.state]);

  const handleOpenFeedback = (claimId: string) => {
    setSelectedClaimId(claimId);
    setFeedbackOpen(true);
  };

  const filteredClaims = claims.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.assessmentStatus === statusFilter;
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (sortOption === 'confidence') {
      return b.confidenceScore - a.confidenceScore;
    }
    return a.claimNumber - b.claimNumber;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Loading Verification Report...
        </h2>
        <p className="text-xs text-slate-400">
          Fetching claims, stance relationships, and provenance citations.
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Report Not Found
        </h2>
        <p className="text-xs text-slate-500">{error || 'This report may have been deleted or requires authentication.'}</p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Start New Analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarkOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isBookmarked ? 'Bookmarked' : 'Save Report'}</span>
          </button>

          <a
            href={`/api/v1/analyses/${analysis._id}/export?format=html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </a>

          <a
            href={`/api/v1/analyses/${analysis._id}/export?format=json`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </a>
        </div>
      </div>

      {/* Analysis Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 uppercase">
                Input: {analysis.inputType}
              </span>
              <span className="text-xs text-slate-400">
                Language: <strong className="text-slate-600 dark:text-slate-300 uppercase">{analysis.language}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Evidence-Based Verification Report
            </h1>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Analyzed on {new Date(analysis.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Overall Findings Summary */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Overall Evidence Findings
          </h4>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {analysis.overallSummary || 'Verification completed against retrieved external sources.'}
          </p>
        </div>

        {/* Breakdown Metric Badges */}
        {/* Breakdown Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 block mb-0.5 font-medium">Extracted Claims</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {analysis.totalClaimsCount}
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-0.5 font-medium">Supported</span>
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {analysis.supportedClaimsCount}
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-rose-100 dark:border-rose-950/40 bg-rose-50/40 dark:bg-rose-950/20 text-center">
            <span className="text-xs text-rose-600 dark:text-rose-400 block mb-0.5 font-medium">Contradicted</span>
            <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">
              {analysis.refutedClaimsCount}
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-amber-100 dark:border-amber-950/40 bg-amber-50/40 dark:bg-amber-950/20 text-center">
            <span className="text-xs text-amber-600 dark:text-amber-400 block mb-0.5 font-medium">Mixed / Context</span>
            <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              {analysis.mixedClaimsCount}
            </span>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">Unverified / Insufficient</span>
            <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">
              {analysis.insufficientClaimsCount || 0}
            </span>
          </div>
        </div>

        {/* Submitted Content Preview */}
        <details className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <summary className="cursor-pointer font-semibold hover:text-brand-600">
            View Analyzed Raw Input Text
          </summary>
          <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {analysis.extractedText}
          </div>
        </details>
      </div>

      {/* Claims Filter and Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Filter Claims:
          </span>
          <div className="flex flex-wrap gap-1">
            {['ALL', 'SUPPORTED', 'REFUTED', 'MIXED', 'INSUFFICIENT_EVIDENCE', 'NOT_VERIFIABLE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e: any) => setSortOption(e.target.value)}
            className="text-xs p-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="number">Claim Order (#1, #2...)</option>
            <option value="confidence">Highest Confidence</option>
          </select>
        </div>
      </div>

      {/* Render Claim Cards */}
      <div className="space-y-6">
        {sortedClaims.length > 0 ? (
          sortedClaims.map((claim) => (
            <ClaimCard
              key={claim._id}
              claim={claim}
              onOpenFeedback={handleOpenFeedback}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
            No claims match status filter "{statusFilter}".
          </div>
        )}
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        analysisId={analysis._id}
        claimId={selectedClaimId}
      />

      <BookmarkModal
        isOpen={bookmarkOpen}
        onClose={() => setBookmarkOpen(false)}
        analysisId={analysis._id}
        onBookmarkChanged={(bookmarked) => setIsBookmarked(bookmarked)}
      />
    </div>
  );
};
