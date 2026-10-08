import React, { useState } from 'react';
import { Profile, Payment, Withdrawal, Package, Task, SiteSettings, AdminLog } from '../../types';
import { adminService } from '../../services/admin/adminService';
import { dbStore } from '../../services/db/store';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package as PackageIcon,
  CheckSquare,
  Wallet,
  FileSpreadsheet,
  Megaphone,
  Settings,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Send,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

interface AdminPanelProps {
  currentProfile: Profile;
  onNavigateToMemberDashboard: () => void;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentProfile,
  onNavigateToMemberDashboard,
  onRefresh,
}) => {
  // Enforce Section 14 & 55: Root Admin Security Rule
  if (currentProfile.innova_id !== '000001') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">403 Access Denied</h2>
          <p className="text-xs text-neutral-300">
            Root Admin access is strictly restricted to INNOVA ID: <strong>000001</strong>. Normal member accounts are prohibited from accessing administrative tables and control panels.
          </p>
          <button
            onClick={onNavigateToMemberDashboard}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl"
          >
            Return to Member Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'members'
    | 'payments'
    | 'withdrawals'
    | 'packages'
    | 'announcements'
    | 'settings'
    | 'logs'
  >('dashboard');

  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('ALL');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('ALL');
  const [announcementSent, setAnnouncementSent] = useState(false);

  // Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(dbStore.getSiteSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Manual ledger adjustment modal state
  const [adjMemberId, setAdjMemberId] = useState('');
  const [adjAmount, setAdjAmount] = useState<number>(0);
  const [adjDescription, setAdjDescription] = useState('');
  const [adjMessage, setAdjMessage] = useState<string | null>(null);

  const stats = dbStore.getPublicStats();
  const allMembers = adminService.getAllMembers('000001');
  const allPayments = adminService.getAllPayments('000001');
  const allWithdrawals = adminService.getAllWithdrawals('000001');
  const allPackages = dbStore.getPackages();
  const adminLogs = adminService.getAdminLogs('000001');

  const pendingPayments = allPayments.filter((p) => p.status === 'PENDING');
  const pendingWithdrawals = allWithdrawals.filter((w) => w.status === 'PENDING');

  const filteredMembers = allMembers.filter((m) => {
    const matchesSearch =
      m.innova_id.includes(memberSearch) ||
      m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.mobile.includes(memberSearch);
    const matchesFilter =
      memberStatusFilter === 'ALL' || m.account_status === memberStatusFilter;
    return matchesSearch && matchesFilter;
  });

  const handleApprovePayment = (id: string) => {
    try {
      adminService.approvePayment('000001', id);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = (id: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      adminService.rejectPayment('000001', id, reason || undefined);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to reject payment');
    }
  };

  const handleUpdateWithdrawal = (id: string, status: 'APPROVED' | 'REJECTED' | 'PAID') => {
    const note = prompt(`Enter notes for marking withdrawal as ${status} (optional):`);
    try {
      adminService.updateWithdrawalStatus('000001', id, status, note || undefined);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to update withdrawal');
    }
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;

    adminService.sendAnnouncement(
      '000001',
      announcementTitle.trim(),
      announcementMessage.trim(),
      announcementTarget.trim()
    );

    setAnnouncementTitle('');
    setAnnouncementMessage('');
    setAnnouncementSent(true);
    setTimeout(() => setAnnouncementSent(false), 3000);
    onRefresh();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminService.updateSiteSettings('000001', siteSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    onRefresh();
  };

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      adminService.manualFinancialAdjustment(
        '000001',
        adjMemberId.trim(),
        adjAmount,
        adjDescription.trim()
      );
      setAdjMessage('Adjustment credited successfully!');
      setAdjMemberId('');
      setAdjAmount(0);
      setAdjDescription('');
      setTimeout(() => setAdjMessage(null), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Adjustment failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Switch Back */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-neutral-100 flex items-center gap-2">
              ROOT ADMIN CONTROL CENTER
              <span className="text-xs px-2 py-0.5 rounded bg-amber-400 text-neutral-950 font-mono font-bold">
                000001
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Direct PostgreSQL & Storage Management Console · INNOVA.GLOBAL High-Availability Core
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToMemberDashboard}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:border-amber-500/40 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Member Dashboard
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payments {pendingPayments.length > 0 && `(${pendingPayments.length})`}
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Withdrawals {pendingWithdrawals.length > 0 && `(${pendingWithdrawals.length})`}
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'members'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Members ({allMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'packages'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          Packages ({allPackages.length})
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcements
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          Site Settings
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Admin Logs ({adminLogs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
              <p className="text-xs font-mono text-neutral-400 uppercase">Total Members</p>
              <p className="text-3xl font-mono font-bold text-neutral-100">{stats.totalMembers}</p>
            </div>
            <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
              <p className="text-xs font-mono text-neutral-400 uppercase">Active Members</p>
              <p className="text-3xl font-mono font-bold text-emerald-400">{stats.activeMembers}</p>
            </div>
            <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
              <p className="text-xs font-mono text-neutral-400 uppercase">Pending Payments</p>
              <p className="text-3xl font-mono font-bold text-amber-400">{pendingPayments.length}</p>
            </div>
            <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
              <p className="text-xs font-mono text-neutral-400 uppercase">Pending Withdrawals</p>
              <p className="text-3xl font-mono font-bold text-sky-400">{pendingWithdrawals.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
              <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
                Total Activation Inflow (৳)
              </h3>
              <p className="text-3xl font-mono font-bold text-amber-400">
                ৳{stats.totalJoining.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-400">
                Settled through official bKash/Nagad: {siteSettings.support_number}
              </p>
            </div>

            <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
              <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
                Total Verified Ledger Outflow (৳)
              </h3>
              <p className="text-3xl font-mono font-bold text-emerald-400">
                ৳{stats.totalVerifiedEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-400">
                Total verified micro-task + referral rewards ledger credits
              </p>
            </div>
          </div>

          {/* Quick Manual Financial Adjustment Tool */}
          <div className="p-6 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 font-serif">
              Manual Authorized Ledger Adjustment
            </h3>
            <p className="text-xs text-neutral-400">
              Only Root Admin 000001 can credit adjustments directly to a member's ledger. Action is audited.
            </p>

            {adjMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 rounded-xl">
                {adjMessage}
              </div>
            )}

            <form onSubmit={handleManualAdjustment} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder="Target INNOVA ID (e.g. 000002)"
                value={adjMemberId}
                onChange={(e) => setAdjMemberId(e.target.value)}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs font-mono focus:outline-none"
              />
              <input
                type="number"
                required
                placeholder="Amount (৳)"
                value={adjAmount || ''}
                onChange={(e) => setAdjAmount(Number(e.target.value))}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs font-mono focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Audit description reason"
                value={adjDescription}
                onChange={(e) => setAdjDescription(e.target.value)}
                className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Apply Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS REVIEW */}
      {activeTab === 'payments' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Membership Activation Payments
              </h3>
              <p className="text-xs text-neutral-400">
                Inspect TrxID, sender number, and screenshot. Approval activates the member and starter package atomically.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">
              {pendingPayments.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 font-mono border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">TrxID / Sender</th>
                  <th className="p-3.5">Receipt</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono text-neutral-300">
                {allPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">
                      No payment submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  allPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-neutral-100 block">{p.member_name}</span>
                        <span className="text-amber-400 text-[11px]">ID: {p.innova_id}</span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-semibold">
                        <span
                          className={
                            p.payment_method === 'bKash' ? 'text-pink-400' : 'text-orange-400'
                          }
                        >
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-amber-400 font-bold">
                        ৳{p.amount}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="text-neutral-100 block font-bold">{p.transaction_id}</span>
                        <span className="text-neutral-500 text-[11px]">{p.sender_number}</span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {p.screenshot_url ? (
                          <button
                            onClick={() => setSelectedScreenshot(p.screenshot_url || null)}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded flex items-center gap-1 cursor-pointer text-[11px]"
                          >
                            <Eye className="w-3 h-3" /> View Receipt
                          </button>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">No image</span>
                        )}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {p.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprovePayment(p.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPayment(p.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold cursor-pointer transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WITHDRAWALS REVIEW */}
      {activeTab === 'withdrawals' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Member Withdrawal Requests
              </h3>
              <p className="text-xs text-neutral-400">
                Verify member available ledger balance before marking paid.
              </p>
            </div>
            <span className="text-xs font-mono text-sky-400 font-bold">
              {pendingWithdrawals.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 font-mono border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Wallet Number</th>
                  <th className="p-3.5">Note</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono text-neutral-300">
                {allWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">
                      No withdrawal requests placed yet.
                    </td>
                  </tr>
                ) : (
                  allWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-neutral-100 block">{w.member_name}</span>
                        <span className="text-amber-400 text-[11px]">ID: {w.innova_id}</span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-amber-400 font-bold">
                        ৳{w.amount}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-semibold">
                        <span
                          className={
                            w.payment_method === 'bKash' ? 'text-pink-400' : 'text-orange-400'
                          }
                        >
                          {w.payment_method}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-bold text-neutral-200">
                        {w.account_number}
                      </td>
                      <td className="p-3.5 font-sans text-neutral-400 max-w-xs truncate">
                        {w.user_note || '—'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : w.status === 'APPROVED'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : w.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {w.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleUpdateWithdrawal(w.id, 'PAID')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleUpdateWithdrawal(w.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">{w.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MEMBERS DIRECTORY */}
      {activeTab === 'members' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-base font-bold text-neutral-100 font-serif">
              Registered Platform Members
            </h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by ID, name, or phone..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
                />
              </div>

              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                <option value="REJECTED">REJECTED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 font-mono border-y border-neutral-800">
                <tr>
                  <th className="p-3.5">INNOVA ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Upline ID</th>
                  <th className="p-3.5">Joining Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono text-neutral-300">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">
                      No members matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-amber-400">{m.innova_id}</td>
                      <td className="p-3.5 font-sans font-semibold text-neutral-100">{m.full_name}</td>
                      <td className="p-3.5">{m.mobile}</td>
                      <td className="p-3.5 text-neutral-400">{m.referred_by_id || 'ROOT'}</td>
                      <td className="p-3.5 text-neutral-400">
                        {new Date(m.joining_date).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.account_status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {m.account_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {m.innova_id !== '000001' && (
                          <div className="flex items-center justify-end gap-1.5">
                            {m.account_status !== 'ACTIVE' && (
                              <button
                                onClick={() => {
                                  adminService.updateMemberStatus('000001', m.innova_id, 'ACTIVE');
                                  onRefresh();
                                }}
                                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] cursor-pointer"
                              >
                                Activate
                              </button>
                            )}
                            {m.account_status !== 'SUSPENDED' && (
                              <button
                                onClick={() => {
                                  adminService.updateMemberStatus('000001', m.innova_id, 'SUSPENDED');
                                  onRefresh();
                                }}
                                className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PACKAGES CONFIGURATION */}
      {activeTab === 'packages' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-neutral-100 font-serif">
              Platform Packages Configuration
            </h3>
            <p className="text-xs text-neutral-400">
              Manage tier pricing, daily task allocation, and configured daily rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold font-serif text-neutral-100">{pkg.name}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400">৳{pkg.price}</span>
                </div>

                <div className="space-y-2 text-xs font-mono text-neutral-400">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-neutral-200">{pkg.duration_days} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasks per day:</span>
                    <span className="text-neutral-200">{pkg.tasks_per_day}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Task Duration:</span>
                    <span className="text-neutral-200">~{pkg.task_duration_seconds}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Reward:</span>
                    <span className="text-amber-400 font-bold">৳{pkg.daily_reward}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 font-sans">{pkg.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: IN-APP ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-neutral-100 font-serif">
              Broadcast In-App Announcement
            </h3>
            <p className="text-xs text-neutral-400">
              Send global updates or targeted messages directly to member dashboards.
            </p>
          </div>

          {announcementSent && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Announcement dispatched successfully!</span>
            </div>
          )}

          <form onSubmit={handleSendAnnouncement} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                Target Audience
              </label>
              <select
                value={announcementTarget}
                onChange={(e) => setAnnouncementTarget(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none"
              >
                <option value="ALL">All Registered Members (Global Broadcast)</option>
                {allMembers
                  .filter((m) => m.innova_id !== '000001')
                  .map((m) => (
                    <option key={m.id} value={m.innova_id}>
                      {m.innova_id} - {m.full_name} ({m.mobile})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                Announcement Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Daily Network Protocol Maintenance"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                Message Body
              </label>
              <textarea
                required
                rows={4}
                placeholder="Enter notice details for platform members..."
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send Notification
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-neutral-100 font-serif">
              Master Platform Settings
            </h3>
            <p className="text-xs text-neutral-400">
              Update official payment numbers, support lines, and Telegram links. Values update live.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Platform settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                  Website Name
                </label>
                <input
                  type="text"
                  value={siteSettings.website_name}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, website_name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                  Tagline
                </label>
                <input
                  type="text"
                  value={siteSettings.tagline}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                  Support / Payment Number
                </label>
                <input
                  type="text"
                  value={siteSettings.support_number}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, support_number: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                  bKash Number
                </label>
                <input
                  type="text"
                  value={siteSettings.bkash_number}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, bkash_number: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                  Telegram Channel URL
                </label>
                <input
                  type="text"
                  value={siteSettings.telegram_channel}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, telegram_channel: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 uppercase">
                  Telegram Group URL
                </label>
                <input
                  type="text"
                  value={siteSettings.telegram_group}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, telegram_group: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
            >
              Save Site Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: ADMIN AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Immutable Administrative Audit Logs
              </h3>
              <p className="text-xs text-neutral-400">
                All sensitive actions taken by Root Admin 000001 are permanently recorded.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Total Log Entries: {adminLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-400 border-y border-neutral-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Admin ID</th>
                  <th className="p-3.5">Target</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {adminLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500 font-sans">
                      No admin operations logged yet.
                    </td>
                  </tr>
                ) : (
                  adminLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 text-neutral-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="p-3.5 text-amber-400 font-bold whitespace-nowrap">
                        {log.action_type}
                      </td>
                      <td className="p-3.5 text-neutral-200">{log.admin_innova_id}</td>
                      <td className="p-3.5 text-neutral-400">{log.target_id || '—'}</td>
                      <td className="p-3.5 font-sans text-neutral-300">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenshot Preview Lightbox Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-100">
                Authorized Payment Receipt Screenshot
              </h4>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-neutral-950">
              <img
                src={selectedScreenshot}
                alt="Receipt Screenshot"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
