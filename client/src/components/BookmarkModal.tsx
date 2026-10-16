import React, { useState } from 'react';
import { X, Bookmark, Check } from 'lucide-react';
import { api } from '../api/client';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  initialNotes?: string;
  onBookmarkChanged: (isBookmarked: boolean) => void;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  initialNotes = '',
  onBookmarkChanged
}) => {
  const [notes, setNotes] = useState<string>(initialNotes);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.toggleBookmark(analysisId, notes);
      onBookmarkChanged(res.data.data.isBookmarked);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save bookmark.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Bookmark Analysis
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Save this report to your private saved reports archive and attach personal research notes.
        </p>

        {error && (
          <div className="p-2.5 mb-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Private Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Discussed in thesis defense, follow up on 2026 fiscal figures..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Bookmark'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
