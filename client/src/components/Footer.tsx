import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Globe, Lock, BookOpen, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-brand-500/20">
                TL
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                TruthLens <span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              An evidence-first fact-checking platform that combines live internet cross-examination,
              internal ground-truth benchmarks, stance classification, and transparent citation provenance.
            </p>
            <div className="inline-block px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              Core Doctrine: <strong>Evidence first, verdict second.</strong>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Explore & Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-brand-600 transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-brand-600 transition-colors">Fact-Check (URL & Text)</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-600 transition-colors">About TruthLens AI</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-600 transition-colors">Contact & Support</Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-brand-600 transition-colors">8-Stage Methodology</Link>
              </li>
            </ul>
          </div>

          {/* Access & Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Portals & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/login" className="hover:text-brand-600 transition-colors">Unified Login Portal</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors">User Dashboard</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy & Data Ethics</Link>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block leading-normal mt-2">
                  Integrated with verified IFCN fact-checkers & primary wire services.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} TruthLens AI System. Evidence-Driven Fact-Checking Network.
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by Multi-Source Semantic Reranking & Web Cross-Examination
          </div>
        </div>
      </div>
    </footer>
  );
};
