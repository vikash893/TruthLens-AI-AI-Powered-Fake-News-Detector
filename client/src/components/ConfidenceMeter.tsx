import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { IConfidenceFactors, ConfidenceLabel } from '../types';

interface ConfidenceMeterProps {
  score: number; // 0 to 1
  label: ConfidenceLabel;
  factors?: IConfidenceFactors;
  showBreakdown?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  label,
  factors,
  showBreakdown = true
}) => {
  const percentage = Math.round(score * 100);

  const getMeterColor = () => {
    if (score >= 0.75) return 'bg-emerald-500';
    if (score >= 0.50) return 'bg-sky-500';
    if (score >= 0.30) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getBadgeStyle = () => {
    switch (label) {
      case 'HIGH':
        return 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800';
      case 'MEDIUM':
        return 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800';
      case 'LOW':
        return 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800';
      default:
        return 'text-slate-700 bg-slate-50 dark:text-slate-300 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Evidence Confidence
          </span>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getBadgeStyle()}`}>
          {label} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ${getMeterColor()}`}
          style={{ width: `${Math.max(5, percentage)}%` }}
        />
      </div>

      {showBreakdown && factors && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <div className="flex justify-between items-center">
            <span>Independent Sources:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {factors.independentSourcesCount} domain{factors.independentSourcesCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Primary Documentation:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {factors.primarySourcesCount > 0 ? 'Available' : 'Secondary reporting only'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Source Corroboration Agreement:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.round(factors.sourceAgreementRatio * 100)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Directness:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
              {factors.directnessScore >= 0.5 ? 'Direct factual quotes' : 'Contextual references'}
            </span>
          </div>

          {factors.calibrationNotes && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 bg-slate-50 dark:bg-slate-950 p-2 rounded">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>{factors.calibrationNotes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
