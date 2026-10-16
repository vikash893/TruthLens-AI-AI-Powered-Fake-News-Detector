import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Github, FileText, Lock, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                TL
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                TruthLens AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              An evidence-first fact-checking assistant designed to extract verifiable factual claims, retrieve corroborating and contradictory sources, and provide transparent uncertainty estimates.
            </p>
            <div className="inline-block px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              Core Doctrine: <strong>Evidence first, verdict second.</strong>
            </div>
          </div>

          {/* Research & Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Platform & Research
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/methodology" className="hover:text-brand-600 transition-colors">
                  Methodology & Pipeline
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-brand-600 transition-colors">
                  Submit Verification
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors">
                  Verification Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimers & Ethics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Ethics & Privacy
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/privacy" className="hover:text-brand-600 transition-colors">
                  Privacy Policy & Retention
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block leading-normal">
                  Not a substitute for professional legal, medical, or financial judgment.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} TruthLens AI. College Major Project & Research Prototype.
          </div>
          <div className="text-[11px] text-slate-400">
            Modular MERN + Python AI Microservice Architecture
          </div>
        </div>
      </div>
    </footer>
  );
};
