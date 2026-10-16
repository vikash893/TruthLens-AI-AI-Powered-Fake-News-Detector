import React from 'react';
import { Lock, Shield, Eye, Database, Trash2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>SECURITY & RETENTION</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy & Untrusted Input Safeguards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Last updated: October 2026 • TruthLens AI Architecture
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-600" />
            <span>1. Untrusted Input Handling</span>
          </h3>
          <p>
            All user-submitted content, retrieved external web passages, and uploaded documents are handled strictly as <strong>untrusted data</strong>. Instructions, prompts, or executable code embedded within analyzed content are never evaluated by server environments or allowed to alter system instructions.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            <span>2. Server-Side Request Forgery (SSRF) Defenses</span>
          </h3>
          <p>
            When a user provides a web URL for analysis, TruthLens resolves the destination hostname to its canonical IP before executing HTTP requests. Requests targeting loopback (127.0.0.1, localhost), private RFC 1918 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), and link-local cloud metadata endpoints (169.254.169.254) are rejected immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-600" />
            <span>3. Data Retention & Temporary Storage</span>
          </h3>
          <p>
            Temporary files uploaded for OCR or PDF parsing are stored in isolated server directories and automatically deleted immediately following claim extraction. Analysis reports can be permanently deleted by the owning user at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-brand-600" />
            <span>4. Account Deletion & Right to Erasure</span>
          </h3>
          <p>
            Authenticated users retain complete control over their saved reports and history. When an analysis report is deleted, all associated claim extractions and evidence records are cascadingly removed from the persistent database.
          </p>
        </section>
      </div>
    </div>
  );
};
