import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Calendar, FileText, ArrowRight, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const SavedReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = async () => {
    try {
      const res = await api.getProfile();
      if (res.data.success && res.data.data.user) {
        setSavedReports(res.data.data.user.savedReports || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load saved reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (analysisId: string) => {
    try {
      await api.toggleBookmark(analysisId);
      setSavedReports((prev) => prev.filter((r) => r.analysisId?._id !== analysisId && r.analysisId !== analysisId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove bookmark.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading saved bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Saved Reports Archive
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Your bookmarked verification reports with personal research notes.
        </p>
      </div>

      {savedReports.length > 0 ? (
        <div className="space-y-4">
          {savedReports.map((item, idx) => {
            const report = item.analysisId;
            if (!report || typeof report !== 'object') return null;

            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 uppercase">
                      {report.inputType}
                    </span>
                    <span className="text-xs text-slate-400">
                      Saved {new Date(item.savedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemove(report._id)}
                    className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <Link
                  to={`/results/${report._id}`}
                  className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 block"
                >
                  {report.overallSummary || 'Verification Report'}
                </Link>

                {item.notes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                      Private Research Notes:
                    </span>
                    <p className="italic">{item.notes}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/results/${report._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <span>Inspect Full Verification Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Bookmarked Reports
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bookmark important verification reports from the results dashboard to review them with private notes here.
          </p>
        </div>
      )}
    </div>
  );
};
