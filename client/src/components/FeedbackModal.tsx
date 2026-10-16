import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  claimId?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  claimId
}) => {
  const [feedbackType, setFeedbackType] = useState<string>('wrong_assessment');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length < 5) {
      setError('Please provide at least 5 characters describing the issue.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitFeedback({
        analysisId,
        claimId,
        feedbackType,
        description
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Thank You!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your report has been logged to assist benchmark evaluation and model improvement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Report Discrepancy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Notice an inaccurate extraction, missing counter-evidence, or flawed assessment? Let us know.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discrepancy Category
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="wrong_assessment">Incorrect Assessment Status</option>
                <option value="missing_contradiction">Missing Crucial Contradictory Evidence</option>
                <option value="irrelevant_source">Irrelevant Source Cited</option>
                <option value="incorrect_extraction">Flawed Claim Segmentation / Distortion</option>
                <option value="broken_link">Broken Source Link</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Explanation & Citations (Optional URL)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe why this assessment or evidence requires revision..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
