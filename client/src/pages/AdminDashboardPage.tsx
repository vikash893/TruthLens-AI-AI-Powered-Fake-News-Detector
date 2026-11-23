import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Trash2,
  Lock,
  Unlock,
  Activity,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Globe,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { api } from '../api/client';
import { IAdminMetrics, IAdminUser, IActivityLog } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<IAdminMetrics | null>(null);
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [logs, setLogs] = useState<IActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // User Management State
  const [userSearch, setUserSearch] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Add Admin Modal State
  const [addAdminOpen, setAddAdminOpen] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [creatingAdmin, setCreatingAdmin] = useState<boolean>(false);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);

  // Logs State
  const [logCategory, setLogCategory] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState<string>('');
  const [refreshingLogs, setRefreshingLogs] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsRes, usersRes, logsRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers({ search: userSearch, filter: userFilter }),
        api.getAdminLogs({ category: logCategory, search: logSearch })
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data.metrics);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.data.users);
      }
      if (logsRes.data.success) {
        setLogs(logsRes.data.data.logs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userFilter, logCategory]);

  const handleRefresh = async () => {
    setRefreshingLogs(true);
    await fetchData();
    setRefreshingLogs(false);
  };

  // Real-time Block / Unblock User
  const handleToggleBlock = async (targetUser: IAdminUser) => {
    const newStatus = !targetUser.isBlocked;
    const confirmMsg = newStatus
      ? `Are you sure you want to BLOCK ${targetUser.email}? They will immediately be denied access.`
      : `Unblock ${targetUser.email} and restore access?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingUserId(targetUser.id);
    try {
      const res = await api.toggleUserBlock(targetUser.id, newStatus);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, isBlocked: newStatus } : u))
        );
        setActionSuccess(`User ${targetUser.email} successfully ${newStatus ? 'blocked' : 'unblocked'}.`);
        setTimeout(() => setActionSuccess(null), 4000);
        // Refresh metrics and logs
        api.getAdminMetrics().then((m) => m.data.success && setMetrics(m.data.data.metrics));
        api.getAdminLogs({ category: logCategory }).then((l) => l.data.success && setLogs(l.data.data.logs));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Real-time Delete User
  const handleDeleteUser = async (targetUser: IAdminUser) => {
    if (!window.confirm(`PERMANENT ACTION: Are you sure you want to delete user ${targetUser.email}?`)) {
      return;
    }

    setUpdatingUserId(targetUser.id);
    try {
      const res = await api.deleteUser(targetUser.id);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
        setActionSuccess(`User ${targetUser.email} permanently removed.`);
        setTimeout(() => setActionSuccess(null), 4000);
        api.getAdminMetrics().then((m) => m.data.success && setMetrics(m.data.data.metrics));
        api.getAdminLogs({ category: logCategory }).then((l) => l.data.success && setLogs(l.data.data.logs));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Add Another Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPassword) {
      setCreateAdminError('Please fill out all fields.');
      return;
    }

    setCreatingAdmin(true);
    setCreateAdminError(null);
    try {
      const res = await api.createAdmin({
        name: adminName,
        email: adminEmail,
        password: adminPassword
      });

      if (res.data.success) {
        setAddAdminOpen(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        setActionSuccess(`Admin account created for ${adminEmail}.`);
        setTimeout(() => setActionSuccess(null), 4000);
        fetchData();
      }
    } catch (err: any) {
      setCreateAdminError(err.message || 'Failed to create admin.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrative Control Center
            </span>
            <span className="text-xs text-slate-400">Live Real-Time Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            System Admin & User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor real-time metrics, audit user activity logs, block/delete users, and provision administrators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/dashboard"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4 text-brand-600" />
            <span>Switch to User Dashboard</span>
          </Link>

          <button
            onClick={() => setAddAdminOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Another Admin</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshingLogs}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Refresh All Real-Time Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingLogs ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= PROPER DASHBOARD METRICS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics?.totalUsers ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Registered platform users</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold">Active Users</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {metrics?.activeUsers ?? 0}
          </div>
          <span className="text-[10px] text-emerald-600/70">Unrestricted accounts</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-semibold">Blocked Users</span>
            <UserX className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300">
            {metrics?.blockedUsers ?? 0}
          </div>
          <span className="text-[10px] text-rose-600/70">Suspended from login</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-xs font-semibold">Admin Team</span>
            <KeyRound className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
            {metrics?.adminUsers ?? 0}
          </div>
          <span className="text-[10px] text-purple-600/70">Privileged access</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Analyses</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics?.totalAnalyses ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">
            +{metrics?.recentAnalyses24h ?? 0} in last 24h
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Fake Claims Caught</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {metrics?.refutedFakeCount ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">
            vs {metrics?.supportedGoodCount ?? 0} true
          </span>
        </div>
      </div>

      {/* ================= USER MANAGEMENT SECTION ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              Real-Time User Directory & Access Control
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Block or delete users in real time. Blocked users are immediately forbidden from accessing resources.
            </p>
          </div>

          {/* User Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                placeholder="Search name or email..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
              {['all', 'active', 'blocked', 'admin'].map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    userFilter === f
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 dark:bg-slate-950/60 text-slate-400 uppercase text-[10px] font-black border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Analyses</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-4 text-right">Real-Time Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-brand-600 font-extrabold flex items-center justify-center">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.isBlocked
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {u.isBlocked ? (
                          <>
                            <UserX className="w-3 h-3" /> Blocked
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" /> Active
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {u.analysisCount || 0}
                    </td>

                    <td className="py-3.5 px-3 text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Real-time Block/Unblock Button */}
                        <button
                          onClick={() => handleToggleBlock(u)}
                          disabled={Boolean(updatingUserId === u.id || (user && user.id === u.id))}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                            u.isBlocked
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                          } disabled:opacity-40`}
                          title={u.isBlocked ? 'Restore user access' : 'Suspend / block user access'}
                        >
                          {u.isBlocked ? (
                            <>
                              <Unlock className="w-3 h-3" /> Unblock
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" /> Block
                            </>
                          )}
                        </button>

                        {/* Real-time Delete User Button */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={Boolean(updatingUserId === u.id || (user && user.id === u.id))}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors disabled:opacity-40"
                          title="Delete user permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= REAL-TIME ACTIVITY LOGS SECTION ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Real-Time Audit Logs Created by Users
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live chronological stream of analyses run, authentications, URL requests, and administrative actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                placeholder="Search logs..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
              {['ALL', 'AUTH', 'ANALYSIS', 'USER_MANAGEMENT'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLogCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    logCategory === cat
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Logs Feed */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log._id}
                className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 max-w-2xl">
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider shrink-0 ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {log.action}
                  </span>

                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200">
                      <span>{log.userName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({log.userEmail})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.createdAt).toLocaleTimeString()} • {new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No audit logs recorded for this category yet.
            </div>
          )}
        </div>
      </div>

      {/* ================= ADD ANOTHER ADMIN MODAL ================= */}
      {addAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Add Another Administrator
                </h3>
              </div>
              <button
                onClick={() => setAddAdminOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {createAdminError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600">
                {createAdminError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Senior Editor / Lead Auditor"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin.colleague@truthlens.ai"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddAdminOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creatingAdmin ? 'Creating Admin...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
