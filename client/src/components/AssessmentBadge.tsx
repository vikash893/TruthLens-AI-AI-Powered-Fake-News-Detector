import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, AlertCircle, EyeOff } from 'lucide-react';
import { AssessmentStatus } from '../types';

interface BadgeProps {
  status: AssessmentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const AssessmentBadge: React.FC<BadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const configs: Record<
    AssessmentStatus,
    { label: string; icon: any; bg: string; text: string; border: string }
  > = {
    SUPPORTED: {
      label: 'SUPPORTED',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800'
    },
    REFUTED: {
      label: 'REFUTED',
      icon: XCircle,
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800'
    },
    MIXED: {
      label: 'MIXED / QUALIFIED',
      icon: AlertTriangle,
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800'
    },
    INSUFFICIENT_EVIDENCE: {
      label: 'INSUFFICIENT EVIDENCE',
      icon: HelpCircle,
      bg: 'bg-slate-100 dark:bg-slate-800/60',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700'
    },
    OUT_OF_CONTEXT: {
      label: 'OUT OF CONTEXT',
      icon: AlertCircle,
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-300 dark:border-orange-800'
    },
    NOT_VERIFIABLE: {
      label: 'NOT VERIFIABLE (OPINION)',
      icon: EyeOff,
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-800'
    }
  };

  const cfg = configs[status] || configs.INSUFFICIENT_EVIDENCE;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} tracking-wide transition-all`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{cfg.label}</span>
    </span>
  );
};
