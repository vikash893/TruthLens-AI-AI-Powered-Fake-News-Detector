import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Globe,
  Image as ImageIcon,
  Upload,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';
import { api } from '../api/client';

type Tab = 'text' | 'url' | 'image' | 'document';

export const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('text');

  // Text Tab State
  const [text, setText] = useState<string>('');

  // URL Tab State
  const [url, setUrl] = useState<string>('');

  // Image Tab State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Document Tab State
  const [docFile, setDocFile] = useState<File | null>(null);

  // General Loading & Error State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTexts = [
    {
      label: 'Energy Policy & Subsidy',
      content:
        'The Ministry of Energy yesterday confirmed a new regulatory framework that will reduce electricity prices by 40%. The policy decree states every household will receive a subsidy.'
    },
    {
      label: 'Health / Miracle Treatment',
      content:
        'Medical researchers have released an unapproved 100% cure that completely eliminates all human cancer without any side effects.'
    },
    {
      label: 'Compound Political Statement',
      content:
        'The government announced a new electricity discount of 40%, and every single citizen in the country will automatically receive cash grants.'
    }
  ];

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length < 10) {
      setError('Please provide at least 10 characters of content to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeText(text);
      navigate(`/results/${res.data.data.analysis._id}`, { state: { report: res.data.data } });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze text content.');
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid publicly accessible article URL.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.analyzeUrl(url);
      navigate(`/results/${res.data.data.analysis._id}`, { state: { report: res.data.data } });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch and analyze URL.');
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please select an image screenshot to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await api.analyzeImage(formData);
      navigate(`/results/${res.data.data.analysis._id}`, { state: { report: res.data.data } });
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from image.');
      setLoading(false);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile(file);
      setError(null);
    }
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setError('Please select a document file (PDF or TXT) to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      const res = await api.analyzeDocument(formData);
      navigate(`/results/${res.data.data.analysis._id}`, { state: { report: res.data.data } });
    } catch (err: any) {
      setError(err.message || 'Failed to parse document text.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          New Fact-Check Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Submit content through any of the four verified input channels below. All extracted claims are cross-checked against external sources.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl">
        <button
          onClick={() => { setActiveTab('text'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'text'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text & Statement</span>
        </button>

        <button
          onClick={() => { setActiveTab('url'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'url'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Article URL</span>
        </button>

        <button
          onClick={() => { setActiveTab('image'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'image'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Screenshot (OCR)</span>
        </button>

        <button
          onClick={() => { setActiveTab('document'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'document'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Document (PDF/TXT)</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* TAB 1: TEXT */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Paste Content or Viral Claim
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {text.length} / 30,000 characters
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Paste news claim, forwarded WhatsApp message, tweet text, or factual statement here..."
                className="w-full text-sm p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>

            {/* Quick Samples */}
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Or try a demonstration example:
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleTexts.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setText(sample.content)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {text && (
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={loading || text.length < 10}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Claims...</span>
                  </>
                ) : (
                  <>
                    <span>Extract & Verify Claims</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Public News Article or Post URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news/article-headline"
                className="w-full text-sm p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-brand-500" />
              <div>
                <strong>SSRF Protection & Safety Notice:</strong> The destination URL will be resolved and strictly validated to prevent SSRF attacks. Internal IP addresses, private subnets, localhost, and metadata servers are automatically rejected.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading || !url}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Fetching & Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Fetch Article & Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: IMAGE / SCREENSHOT */}
        {activeTab === 'image' && (
          <form onSubmit={handleImageSubmit} className="space-y-5">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Uploaded screenshot"
                    className="max-h-60 mx-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 object-contain"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xs text-slate-500">{imageFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Click to browse or drag and drop screenshot
                  </div>
                  <div className="text-xs text-slate-400">
                    Supports JPG, PNG, and WebP (Max 5 MB)
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Optical Character Recognition Notice:</strong> OCR extracts visible textual claims for verification. OCR extraction does NOT attest to screenshot authenticity or detect pixel manipulations.
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading || !imageFile}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Running OCR & Verification...</span>
                  </>
                ) : (
                  <>
                    <span>Run OCR & Verify Claims</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: DOCUMENT */}
        {activeTab === 'document' && (
          <form onSubmit={handleDocSubmit} className="space-y-5">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors">
              {docFile ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <span>{docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDocFile(null)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Click to select PDF or TXT file
                  </div>
                  <div className="text-xs text-slate-400">
                    Maximum 20 pages, 10 MB file size
                  </div>
                  <input
                    type="file"
                    accept=".pdf, .txt, text/plain, application/pdf"
                    onChange={handleDocChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading || !docFile}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting & Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Text & Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
