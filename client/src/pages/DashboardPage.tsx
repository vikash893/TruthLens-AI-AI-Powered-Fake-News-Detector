import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../api/client';
import { IDashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboard();
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading verification metrics from database...</p>
      </div>
    );
  }

  const distribution = stats?.distribution || {
    SUPPORTED: 0,
    REFUTED: 0,
    MIXED: 0,
    INSUFFICIENT_EVIDENCE: 0,
    OUT_OF_CONTEXT: 0,
    NOT_VERIFIABLE: 0
  };

  const pieData = [
    { name: 'Supported', value: distribution.SUPPORTED || 0, color: '#10b981' },
    { name: 'Refuted', value: distribution.REFUTED || 0, color: '#ef4444' },
    { name: 'Mixed', value: distribution.MIXED || 0, color: '#f59e0b' },
    { name: 'Insufficient', value: distribution.INSUFFICIENT_EVIDENCE || 0, color: '#6b7280' },
    { name: 'Out of Context', value: distribution.OUT_OF_CONTEXT || 0, color: '#f97316' },
    { name: 'Not Verifiable', value: distribution.NOT_VERIFIABLE || 0, color: '#8b5cf6' }
  ].filter((d) => d.value > 0);

  const topicData = stats?.topicBreakdown || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Verification Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time empirical metrics aggregated from database records.
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>TOTAL ANALYSES</span>
            <LayoutDashboard className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats?.totalAnalyses || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total items processed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>CLAIMS VERIFIED</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats?.totalClaimsChecked || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Atomic claims extracted</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>SUPPORTED CLAIMS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {distribution.SUPPORTED || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Backed by primary records</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>REFUTED CLAIMS</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {distribution.REFUTED || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Contradicted by evidence</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Assessment Status Distribution
            </h3>
            <span className="text-xs text-slate-400">Empirical breakdown</span>
          </div>

          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No claims verified yet. Submit content to populate distribution chart.
            </div>
          )}
        </div>

        {/* Frequently Analyzed Topics Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Frequently Analyzed Topics
            </h3>
            <span className="text-xs text-slate-400">Domain categorization</span>
          </div>

          {topicData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              No topic categories recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Analyses List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Verifications
            </h3>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentAnalyses.map((item) => (
              <Link
                key={item._id}
                to={`/results/${item._id}`}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors group"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                      {item.inputType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-brand-600">
                    {item.overallSummary || 'Verification completed.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {item.totalClaimsCount} claims
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No analyses recorded yet. Use the New Analysis button above to begin fact-checking.
          </div>
        )}
      </div>
    </div>
  );
};
