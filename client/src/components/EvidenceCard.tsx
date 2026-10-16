import React from 'react';
import { ExternalLink, CheckCircle, XCircle, Info, Bookmark, Calendar, Globe } from 'lucide-react';
import { IEvidence, EvidenceRelationship } from '../types';

interface EvidenceCardProps {
  evidence: IEvidence;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  const getRelationshipBadge = (rel: EvidenceRelationship) => {
    switch (rel) {
      case 'SUPPORTS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> SUPPORTS
          </span>
        );
      case 'REFUTES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> REFUTES / CONTRADICTS
          </span>
        );
      case 'CONTEXT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Info className="w-3.5 h-3.5" /> CONTEXTUAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            MENTION
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {getRelationshipBadge(evidence.evidenceRelationship)}
          {evidence.isPrimarySource && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              PRIMARY SOURCE
            </span>
          )}
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {evidence.reliabilityTier}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Retrieved: {new Date(evidence.retrievedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Title with link */}
      <a
        href={evidence.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-1.5 text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mb-2"
      >
        <span className="group-hover:underline">{evidence.sourceTitle}</span>
        <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-brand-600 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>

      {/* Publisher & Domain */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <Globe className="w-3.5 h-3.5" />
        <span className="font-medium text-slate-700 dark:text-slate-300">{evidence.publisher || evidence.domain}</span>
        <span>•</span>
        <span className="font-mono text-[11px]">{evidence.domain}</span>
      </div>

      {/* Direct Quote Excerpt */}
      <div className="bg-slate-50 dark:bg-slate-950/70 border-l-3 border-brand-500 p-3 rounded-r-lg mb-3">
        <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
          "{evidence.excerpt}"
        </p>
      </div>

      {/* Relevance rationale */}
      {evidence.explanationOfRelevance && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Analysis:</span>
          <span>{evidence.explanationOfRelevance}</span>
        </div>
      )}
    </div>
  );
};
