import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Calendar,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { IAnalysis } from '../types';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<IAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.listAnalyses({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      if (res.data.success) {
        setAnalyses(res.data.data.analyses);
        setTotalPages(res.data.data.pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this analysis report?')) {
      return;
    }

    try {
      await api.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and review your previous factual verification reports.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords or claim text..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading history records...</p>
        </div>
      ) : analyses.length > 0 ? (
        <div className="space-y-3">
          {analyses.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 uppercase">
                    {item.inputType}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  to={`/results/${item._id}`}
                  className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 block line-clamp-2"
                >
                  "{item.originalInput}"
                </Link>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {item.overallSummary || 'Verification completed.'}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {item.totalClaimsCount} Claims
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    {item.supportedClaimsCount} Supported
                  </span>
                </div>

                <Link
                  to={`/results/${item._id}`}
                  className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="View Report"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Analyses Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== 'all'
              ? 'No reports match your search query or status filter.'
              : 'You haven\'t analyzed any claims yet. Submit your first claim to get started.'}
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
          >
            <span>Analyze Now</span>
          </Link>
        </div>
      )}
    </div>
  );
};
