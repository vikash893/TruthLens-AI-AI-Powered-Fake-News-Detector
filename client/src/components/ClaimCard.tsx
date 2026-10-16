import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Scale,
  Sparkles,
  ArrowRight,
  Search
} from 'lucide-react';
import { IClaim } from '../types';
import { AssessmentBadge } from './AssessmentBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { EvidenceCard } from './EvidenceCard';

interface ClaimCardProps {
  claim: IClaim;
  onOpenFeedback: (claimId: string) => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onOpenFeedback }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'supporting' | 'contradicting' | 'context'>('all');

  const evidenceList = claim.evidence || [];
  const supporting = evidenceList.filter((e) => e.evidenceRelationship === 'SUPPORTS');
  const contradicting = evidenceList.filter((e) => e.evidenceRelationship === 'REFUTES');
  const context = evidenceList.filter((e) => ['CONTEXT', 'MENTION'].includes(e.evidenceRelationship));

  const filteredEvidence =
    activeTab === 'supporting'
      ? supporting
      : activeTab === 'contradicting'
      ? contradicting
      : activeTab === 'context'
      ? context
      : evidenceList;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Banner / Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              CLAIM #{claim.claimNumber}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
              {claim.category}
            </span>
            {claim.claimType === 'allegation' && (
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                Allegation / Claim
              </span>
            )}
            {claim.claimType === 'prediction' && (
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                Prediction
              </span>
            )}
            {claim.claimType === 'opinion' && (
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-800">
                Opinion
              </span>
            )}
            {!claim.isVerifiable && (
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                Subjective / Non-verifiable
              </span>
            )}
            {claim.attribution && (
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                Attribution: {claim.attribution}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AssessmentBadge status={claim.assessmentStatus} size="md" />
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={expanded ? 'Collapse claim details' : 'Expand claim details'}
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Claim Text */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">
          "{claim.originalText}"
        </h3>

        {/* Source Article Context */}
        {claim.sourceArticleReporting && (
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-3 flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Article Reporting Context:</span>
            <span>{claim.sourceArticleReporting}</span>
          </div>
        )}

        {/* Explanation */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {claim.assessmentExplanation}
        </p>

        {/* Quick Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {supporting.length} Supporting
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {contradicting.length} Contradicting
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {context.length} Contextual
            </span>
          </div>

          <button
            onClick={() => onOpenFeedback(claim._id)}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Report Discrepancy</span>
          </button>
        </div>
      </div>

      {/* Expandable Section */}
      {expanded && (
        <div className="p-5 bg-slate-50/50 dark:bg-slate-950/30 space-y-5">
          {/* Grid: Confidence & Explainability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calibrated Confidence */}
            <ConfidenceMeter
              score={claim.confidenceScore}
              label={claim.confidenceLabel}
              factors={claim.confidenceFactors}
            />

            {/* Explainability Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Why This Assessment?
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  {supporting.length > 0 && contradicting.length === 0 && (
                    <p>
                      <strong>Evidence Grounding:</strong> Retrieved reporting directly corroborated the primary details without identified published retractions or official refutations.
                    </p>
                  )}
                  {contradicting.length > 0 && (
                    <p>
                      <strong>Contradictory Evidence Identified:</strong> Credible independent sources explicitly contested or disproved key figures or assertions made in this statement.
                    </p>
                  )}
                  {supporting.length === 0 && contradicting.length === 0 && (
                    <p>
                      <strong>Insufficient Documentation:</strong> Following our core doctrine (<em>"evidence first, verdict second"</em>), we do not assume an unsubstantiated claim is false without verification proof.
                    </p>
                  )}

                  {claim.missingContext && (
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                      <strong>Missing Context:</strong> {claim.missingContext}
                    </div>
                  )}
                </div>
              </div>

              {claim.unresolvedQuestions && claim.unresolvedQuestions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Open Question:</span>{' '}
                  {claim.unresolvedQuestions[0]}
                </div>
              )}
            </div>
          </div>

          {/* Caveats */}
          {claim.caveats && claim.caveats.length > 0 && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Important Caveats & Scope Limitations:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {claim.caveats.map((cav, idx) => (
                  <li key={idx}>{cav}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Search Query Diagnostics */}
          {claim.queryDiagnostics && claim.queryDiagnostics.length > 0 && (
            <div className="bg-slate-100/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold mb-2 text-slate-800 dark:text-slate-200">
                <Search className="w-4 h-4 text-blue-500" />
                <span>Search Diagnostics & Query Execution Log ({claim.queryDiagnostics.length} queries executed):</span>
              </div>
              <div className="space-y-1.5">
                {claim.queryDiagnostics.map((qd, qIdx) => (
                  <div key={qIdx} className="p-2 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">"{qd.query}"</span>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Retrieved: <strong className="text-slate-700 dark:text-slate-300">{qd.totalRetrieved}</strong></span>
                      <span>Retained: <strong className="text-emerald-600 dark:text-emerald-400">{qd.relevantRetained}</strong></span>
                      <span>Filtered: <strong className="text-rose-600 dark:text-rose-400">{qd.filteredOut}</strong></span>
                      {qd.reason && <span className="text-amber-600 italic">({qd.reason})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Comparison Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Retrieved Sources & Evidence ({evidenceList.length})
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All ({evidenceList.length})
                </button>
                <button
                  onClick={() => setActiveTab('supporting')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'supporting'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  Supporting ({supporting.length})
                </button>
                <button
                  onClick={() => setActiveTab('contradicting')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'contradicting'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                  }`}
                >
                  Contradicting ({contradicting.length})
                </button>
                <button
                  onClick={() => setActiveTab('context')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'context'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                  }`}
                >
                  Context ({context.length})
                </button>
              </div>
            </div>

            {/* Evidence Cards List */}
            {filteredEvidence.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredEvidence.map((ev, idx) => (
                  <EvidenceCard key={ev._id || idx} evidence={ev} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No evidence items match the selected filter tab.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
