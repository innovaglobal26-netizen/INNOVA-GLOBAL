import React, { useState, useRef } from 'react';
import { Profile, Task, Package, PackagePurchase } from '../../types';
import { memberService } from '../../services/member/memberService';
import { taskService } from '../../services/tasks/taskService';
import { storageService } from '../../services/storage/storageService';
import { authService } from '../../services/auth/authService';
import { PaymentActivationCard } from './PaymentActivationCard';
import { TaskRunnerModal } from './TaskRunnerModal';
import { WithdrawalModal } from './WithdrawalModal';
import { PackagePurchaseModal } from './PackagePurchaseModal';
import {
  User,
  ShieldCheck,
  Wallet,
  Coins,
  TrendingUp,
  Package as PackageIcon,
  CheckCircle2,
  Play,
  Copy,
  Share2,
  Users,
  GitBranch,
  ArrowUpRight,
  Clock,
  AlertCircle,
  FileText,
  Camera,
  Trash2,
  Loader2,
  Zap,
  Crown,
  Sparkles,
} from 'lucide-react';

interface MemberDashboardProps {
  profile: Profile;
  onRefresh: () => void;
  onNavigateToAdmin?: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  profile,
  onRefresh,
  onNavigateToAdmin,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [purchasingPackage, setPurchasingPackage] = useState<Package | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'packages' | 'team' | 'ledger'>('tasks');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [packageActionMessage, setPackageActionMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const financialSummary = memberService.getFinancialSummary(profile.innova_id);
  const activePackages = memberService.getActivePackages(profile.innova_id);
  const allPurchasedPackages = memberService.getAllPurchasedPackages(profile.innova_id);
  const availablePackages = memberService.getAvailablePackages().filter((p) => p.is_active);
  const referralMetrics = memberService.getReferralMetrics(profile.innova_id);
  const tasks = taskService.getTasks();
  const todayCompletions = taskService.getTodayCompletions(profile.innova_id);
  const ledger = memberService.getLedger(profile.innova_id);

  const isRootAdmin = profile.innova_id === '000001';
  const isAccountActive = profile.account_status === 'ACTIVE';

  const referralLink = `${window.location.origin}/?ref=${profile.innova_id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join INNOVA.GLOBAL',
        text: `Join my team on INNOVA.GLOBAL with Referral ID ${profile.innova_id}!`,
        url: referralLink,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Profile picture must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const publicUrl = await storageService.uploadProfilePicture(profile.innova_id, file);
      const updated = memberService.updateAvatar(profile.innova_id, publicUrl);
      authService.updateCurrentProfile(updated);
      onRefresh();
    } catch (err: any) {
      setAvatarError(err?.message || 'Failed to update profile picture');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    const updated = memberService.updateAvatar(profile.innova_id, null);
    authService.updateCurrentProfile(updated);
    onRefresh();
  };

  const handleOpenPackagePurchase = (pkg: Package) => {
    setPurchasingPackage(pkg);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Root Admin Switch Banner (Shown ONLY if INNOVA ID === '000001') */}
      {isRootAdmin && onNavigateToAdmin && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-600/15 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                ROOT ADMIN CORE AUTHORIZATION
                <span className="text-[10px] font-mono bg-amber-400 text-neutral-950 px-2 py-0.5 rounded font-bold">
                  000001
                </span>
              </h3>
              <p className="text-xs text-neutral-300">
                You are logged in as Root Member + Root Admin. Access administrative controls, approvals, and logs anytime.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToAdmin}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            OPEN ADMIN PANEL
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Overview Card (Same for 000001, 000002, 000003, ...) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Picture with Upload & Change Controls */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-700 text-neutral-950 font-serif font-bold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 border-2 border-neutral-700">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{profile.full_name.charAt(0)}</span>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />

            {/* Upload Trigger Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110"
              title="Change Profile Picture"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-100">
                {profile.full_name}
              </h1>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider ${
                  profile.account_status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {profile.account_status}
              </span>

              {profile.avatar_url && (
                <button
                  onClick={handleRemoveAvatar}
                  className="text-[11px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1 cursor-pointer ml-2"
                >
                  <Trash2 className="w-3 h-3" /> Remove Picture
                </button>
              )}
            </div>

            <p className="text-xs text-neutral-400 font-mono">
              INNOVA ID: <strong className="text-amber-400 text-sm">{profile.innova_id}</strong> · Mobile: {profile.mobile}
            </p>
            <p className="text-[11px] text-neutral-500">
              Joined on {new Date(profile.joining_date).toLocaleDateString()} · Upline:{' '}
              {profile.referred_by_id || 'Root System (Direct)'}
            </p>

            {avatarError && (
              <p className="text-[11px] text-red-400 pt-1">{avatarError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowWithdrawalModal(true)}
            disabled={!isAccountActive || financialSummary.active_balance < 300}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs rounded-xl border border-neutral-700 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            WITHDRAW FUNDS
          </button>
        </div>
      </div>

      {/* Account Activation Gate (if not ACTIVE) */}
      {!isAccountActive && (
        <PaymentActivationCard profile={profile} onPaymentSubmitted={onRefresh} />
      )}

      {/* Financial Balance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Earnings */}
        <div className="bg-neutral-900/80 p-5 sm:p-6 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-mono uppercase">Today's Earnings</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-neutral-100 tabular-nums">
            ৳{financialSummary.today_earnings.toFixed(2)}
          </p>
          <p className="text-[11px] text-neutral-500">Credited since 00:00 UTC</p>
        </div>

        {/* Active Balance */}
        <div className="bg-neutral-900/80 p-5 sm:p-6 rounded-2xl border border-amber-500/30 space-y-2 shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span className="font-mono uppercase font-semibold">Active Balance</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tabular-nums">
            ৳{financialSummary.active_balance.toFixed(2)}
          </p>
          <p className="text-[11px] text-neutral-400">Available for withdrawal</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-neutral-900/80 p-5 sm:p-6 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-mono uppercase">Total Earnings</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
            ৳{financialSummary.total_earnings.toFixed(2)}
          </p>
          <p className="text-[11px] text-neutral-500">Cumulative verified ledger</p>
        </div>

        {/* Active Packages Count */}
        <div className="bg-neutral-900/80 p-5 sm:p-6 rounded-2xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="font-mono uppercase">Active Packages</span>
            <PackageIcon className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl sm:text-2xl font-serif font-bold text-neutral-100">
            {activePackages.length > 0
              ? `${activePackages.length} Package${activePackages.length > 1 ? 's' : ''}`
              : 'None Active'}
          </p>
          <p className="text-[11px] text-neutral-400 font-mono">
            {activePackages.length > 0
              ? activePackages.map((p) => p.package_name).join(', ')
              : 'Requires activation'}
          </p>
        </div>
      </div>

      {/* Multiple Active Packages Detailed Overview Banner */}
      {activePackages.length > 0 && (
        <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageIcon className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold text-neutral-200 uppercase tracking-wider">
                Active Tier Holdings ({activePackages.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('packages')}
              className="text-xs text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
            >
              Manage / Add Packages &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-neutral-100">
                      {pkg.package_name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Price: ৳{pkg.price} · Expires: {new Date(pkg.expiry_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-400 font-semibold">
                  12 Tasks/day
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Hub Navigation Tabs */}
      <div className="border-b border-neutral-800 flex items-center gap-6 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Play className="w-4 h-4" />
          Daily Micro-Tasks (12)
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'packages'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          My Packages & Catalog
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'team'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Team & Referrals
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Financial Ledger
        </button>
      </div>

      {/* TAB 1: DAILY MICRO-TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {!isAccountActive && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Daily micro-tasks require an active package. Complete your ৳200 activation payment above to unlock rewards.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => {
              const isCompleted = todayCompletions.some((c) => c.task_id === task.id);

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-neutral-950/40 border-neutral-800/80 opacity-70'
                      : 'bg-neutral-900 border-neutral-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        Task #{task.order_index}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{task.duration_seconds}s
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-neutral-100">
                      {task.title}
                    </h4>

                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase font-mono">Yield Reward</p>
                      <p className="text-sm font-bold font-mono text-amber-400">
                        ৳{task.reward_amount.toFixed(2)}
                      </p>
                    </div>

                    {isCompleted ? (
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedTask(task)}
                        disabled={!isAccountActive || activePackages.length === 0}
                        className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY PACKAGES & AVAILABLE CATALOG */}
      {activeTab === 'packages' && (
        <div className="space-y-8">
          {packageActionMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{packageActionMessage}</span>
            </div>
          )}

          {/* Section A: Currently Owned Packages */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                My Purchased Packages
              </h3>
              <p className="text-xs text-neutral-400">
                All packages you have activated. Multiple packages are held concurrently without overwriting.
              </p>
            </div>

            {allPurchasedPackages.length === 0 ? (
              <div className="p-8 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-center text-xs text-neutral-500">
                You have not activated any packages yet. Complete account activation to unlock starter packages or choose a tier below.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPurchasedPackages.map((pkg) => {
                  const isStillActive =
                    pkg.status === 'ACTIVE' && Boolean(pkg.expiry_date && new Date(pkg.expiry_date) > new Date());
                  const isPending = pkg.status === 'PENDING';
                  const isRejected = pkg.status === 'REJECTED';

                  return (
                    <div
                      key={pkg.id}
                      className={`p-6 rounded-2xl border transition-all space-y-4 ${
                        isStillActive
                          ? 'bg-neutral-900 border-amber-500/40 shadow-lg'
                          : isPending
                          ? 'bg-neutral-900/90 border-sky-500/40'
                          : 'bg-neutral-950/40 border-neutral-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className={`w-5 h-5 ${isStillActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                          <h4 className="font-serif font-bold text-lg text-neutral-100">
                            {pkg.package_name}
                          </h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isStillActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : isRejected
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {isStillActive ? 'ACTIVE' : isPending ? 'PENDING APPROVAL' : pkg.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono text-neutral-300">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Tier Price:</span>
                          <span className="text-white font-bold">৳{pkg.price}</span>
                        </div>
                        {pkg.activation_date && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Activated:</span>
                            <span>{new Date(pkg.activation_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {pkg.expiry_date && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Expires:</span>
                            <span className="text-amber-400 font-bold">
                              {new Date(pkg.expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {pkg.transaction_id && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">TrxID:</span>
                            <span className="text-neutral-300 font-mono">{pkg.transaction_id}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                        {isStillActive
                          ? 'Active — 12 daily micro-tasks yield enabled.'
                          : isPending
                          ? 'Payment verification under review by Root Admin.'
                          : 'Package expired or inactive.'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Available Package Catalog from Database */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Activate Additional Tier Packages
              </h3>
              <p className="text-xs text-neutral-400">
                Active members can purchase any tier. Each package adds its own separate active record and daily earning allocation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePackages.map((p) => (
                <div
                  key={p.id}
                  className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-lg text-neutral-100">{p.name}</span>
                      <span className="font-mono font-bold text-amber-400 text-xl">৳{p.price}</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {p.duration_days} days validity · {p.tasks_per_day} daily tasks · ৳{p.daily_reward} daily reward allocation.
                    </p>
                    {p.description && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenPackagePurchase(p)}
                    disabled={!isAccountActive}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Activate {p.name} (৳{p.price})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM & REFERRALS */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Unique Link Card */}
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Your Unique Sponsor Referral Link
              </h3>
              <p className="text-xs text-neutral-400">
                Share this link with your partners. When they register with your ID ({profile.innova_id}) and activate, you receive direct and generation yields.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full sm:flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 text-xs font-mono focus:outline-none"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleShareLink}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
              <p className="text-[11px] text-neutral-400 uppercase font-mono">Direct Partners</p>
              <p className="text-2xl font-mono font-bold text-neutral-100 mt-1">
                {referralMetrics.directPartners}
              </p>
              <p className="text-[10px] text-neutral-500">Generation 1</p>
            </div>

            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
              <p className="text-[11px] text-neutral-400 uppercase font-mono">Total Team</p>
              <p className="text-2xl font-mono font-bold text-neutral-100 mt-1">
                {referralMetrics.totalTeam}
              </p>
              <p className="text-[10px] text-neutral-500">Gen 1 + 2 + 3</p>
            </div>

            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
              <p className="text-[11px] text-neutral-400 uppercase font-mono">Generation 2 & 3</p>
              <p className="text-2xl font-mono font-bold text-neutral-100 mt-1">
                {referralMetrics.gen2Count + referralMetrics.gen3Count}
              </p>
              <p className="text-[10px] text-neutral-500">Indirect Downline</p>
            </div>

            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
              <p className="text-[11px] text-neutral-400 uppercase font-mono">Referral Income</p>
              <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
                ৳{referralMetrics.totalReferralIncome.toFixed(2)}
              </p>
              <p className="text-[10px] text-neutral-500">Total verified bonuses</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-100 font-serif">
              Authoritative Member Ledger Records
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Total Records: {ledger.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 font-mono border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      No financial transactions recorded yet. Complete micro-tasks or refer partners to generate entries.
                    </td>
                  </tr>
                ) : (
                  ledger.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 text-neutral-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-200 font-sans max-w-xs truncate">
                        {item.description}
                      </td>
                      <td className="p-3.5 text-right font-bold tabular-nums whitespace-nowrap text-amber-400">
                        +৳{item.amount.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Micro-Task Runner Modal */}
      {selectedTask && (
        <TaskRunnerModal
          innovaId={profile.innova_id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onCompleted={() => {
            setSelectedTask(null);
            onRefresh();
          }}
        />
      )}

      {/* Withdrawal Request Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          profile={profile}
          innovaId={profile.innova_id}
          activeBalance={financialSummary.active_balance}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={() => {
            setShowWithdrawalModal(false);
            onRefresh();
          }}
        />
      )}

      {/* Package Purchase / Activation Modal */}
      {purchasingPackage && (
        <PackagePurchaseModal
          pkg={purchasingPackage}
          profile={profile}
          onClose={() => setPurchasingPackage(null)}
          onSuccess={() => {
            setPurchasingPackage(null);
            setPackageActionMessage(`Activation order for ${purchasingPackage.name} submitted! Awaiting Root Admin verification.`);
            setTimeout(() => setPackageActionMessage(null), 4000);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
