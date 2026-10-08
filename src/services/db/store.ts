import {
  Profile,
  Package,
  PackagePurchase,
  Payment,
  PaymentMethod,
  Task,
  TaskCompletion,
  EarningLedger,
  ReferralRecord,
  Withdrawal,
  NotificationItem,
  SiteSettings,
  AdminLog,
  MemberFinancialSummary,
  AccountStatus,
} from '../../types';
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_PACKAGES,
  ROOT_ADMIN_INNOVA_ID,
  ROOT_ADMIN_MOBILE,
} from '../../config/site';
import { supabase, isSupabaseConfigured } from '../supabase/client';

// Local storage key for persistent state backing when offline or synchronizing
const STORAGE_KEY = 'innova_global_db_v1';

interface DBState {
  profiles: Profile[];
  packages: Package[];
  packagePurchases: PackagePurchase[];
  payments: Payment[];
  tasks: Task[];
  taskCompletions: TaskCompletion[];
  earningLedger: EarningLedger[];
  referrals: ReferralRecord[];
  withdrawals: Withdrawal[];
  notifications: NotificationItem[];
  siteSettings: SiteSettings;
  adminLogs: AdminLog[];
  nextInnovaSeq: number;
}

const DEFAULT_TASKS: Task[] = [
  { id: 'task-01', title: 'Smart Network Verification', description: 'Analyze platform network metrics and affirm verified throughput', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 1, created_at: new Date().toISOString() },
  { id: 'task-02', title: 'Cloud Traffic Routing Test', description: 'Execute digital traffic packet routing validation and latency check', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 2, created_at: new Date().toISOString() },
  { id: 'task-03', title: 'Security Certificate Check', description: 'Audit SSL/TLS handshake latency and digital trust parameters', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 3, created_at: new Date().toISOString() },
  { id: 'task-04', title: 'Decentralized Cache Ping', description: 'Validate distributed cache cluster availability and freshness score', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 4, created_at: new Date().toISOString() },
  { id: 'task-05', title: 'Micro-Service Heartbeat Check', description: 'Synchronize health check heartbeats for core processing modules', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 5, created_at: new Date().toISOString() },
  { id: 'task-06', title: 'Database Replica Sync Verification', description: 'Inspect replication lag across geo-distributed replica clusters', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 6, created_at: new Date().toISOString() },
  { id: 'task-07', title: 'API Gateway Bandwidth Metering', description: 'Review network packet throughput constraints and QoS limits', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 7, created_at: new Date().toISOString() },
  { id: 'task-08', title: 'Encryption Header Audit', description: 'Verify cipher block chaining integrity on outbound transactions', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 8, created_at: new Date().toISOString() },
  { id: 'task-09', title: 'Event Log Ingestion Review', description: 'Inspect telemetry logging pipeline and buffer flush thresholds', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 9, created_at: new Date().toISOString() },
  { id: 'task-10', title: 'Worker Thread Affinity Verification', description: 'Audit runtime worker node memory distribution parameters', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 10, created_at: new Date().toISOString() },
  { id: 'task-11', title: 'Rate Limiter State Assessment', description: 'Test token bucket replenishment rates and overflow boundaries', duration_seconds: 20, reward_amount: 4.16, is_active: true, order_index: 11, created_at: new Date().toISOString() },
  { id: 'task-12', title: 'System Integrity Final Consensus', description: 'Aggregate daily network consensus proofs for final reward commit', duration_seconds: 20, reward_amount: 4.24, is_active: true, order_index: 12, created_at: new Date().toISOString() },
];

// Memory fallback if running in Node.js
const memoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      return memoryStorage[key] || null;
    } catch {
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      memoryStorage[key] = value;
    } catch {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
  },
};

function loadInitialState(): DBState {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // REQUIREMENT 1: Keep ONLY Root Member 000001. Strip all test/demo members 000002+
      const rootProfile = (parsed.profiles || []).find((p: Profile) => p.innova_id === ROOT_ADMIN_INNOVA_ID);
      const profiles: Profile[] = rootProfile ? [rootProfile] : [];
      const nextSeq = rootProfile ? 2 : 1;

      return {
        profiles,
        packages: parsed.packages || INITIAL_PACKAGES.map((p) => ({ ...p, created_at: new Date().toISOString() })),
        packagePurchases: (parsed.packagePurchases || []).filter((p: PackagePurchase) => p.innova_id === ROOT_ADMIN_INNOVA_ID),
        payments: (parsed.payments || []).filter((p: Payment) => p.innova_id === ROOT_ADMIN_INNOVA_ID),
        tasks: parsed.tasks || DEFAULT_TASKS,
        taskCompletions: (parsed.taskCompletions || []).filter((t: TaskCompletion) => t.innova_id === ROOT_ADMIN_INNOVA_ID),
        earningLedger: (parsed.earningLedger || []).filter((l: EarningLedger) => l.innova_id === ROOT_ADMIN_INNOVA_ID),
        referrals: [],
        withdrawals: (parsed.withdrawals || []).filter((w: Withdrawal) => w.innova_id === ROOT_ADMIN_INNOVA_ID),
        notifications: (parsed.notifications || []).filter((n: NotificationItem) => n.target_innova_id === ROOT_ADMIN_INNOVA_ID || n.target_innova_id === 'ALL'),
        siteSettings: {
          ...DEFAULT_SITE_SETTINGS,
          ...(parsed.siteSettings || {}),
          referral_reward_amount: 30, // ৳30 configured referral reward
          withdrawal_wait_minutes: 10, // 10 minutes backend rule
        },
        adminLogs: parsed.adminLogs || [],
        nextInnovaSeq: nextSeq,
      };
    }
  } catch {
    // ignore parse error and use default
  }

  // Pure clean state with NO fake members, 0 stats
  return {
    profiles: [],
    packages: INITIAL_PACKAGES.map((p) => ({ ...p, created_at: new Date().toISOString() })),
    packagePurchases: [],
    payments: [],
    tasks: DEFAULT_TASKS,
    taskCompletions: [],
    earningLedger: [],
    referrals: [],
    withdrawals: [],
    notifications: [],
    siteSettings: DEFAULT_SITE_SETTINGS,
    adminLogs: [],
    nextInnovaSeq: 1,
  };
}

class Store {
  private state: DBState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadInitialState();
  }

  private persist() {
    try {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // storage unavailable
    }
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- STATS (ZERO DEMO DATA RULE) ---
  public getPublicStats() {
    const totalMembers = this.state.profiles.length;
    const activeMembers = this.state.profiles.filter((p) => p.account_status === 'ACTIVE').length;
    const totalJoining = this.state.payments
      .filter((p) => p.status === 'APPROVED')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalVerifiedEarnings = this.state.earningLedger
      .filter((l) => l.status === 'VERIFIED' && l.amount > 0)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalMembers,
      activeMembers,
      totalJoining,
      totalVerifiedEarnings,
    };
  }

  // --- SITE SETTINGS ---
  public getSiteSettings(): SiteSettings {
    return this.state.siteSettings;
  }

  public updateSiteSettings(adminInnovaId: string, settings: Partial<SiteSettings>): SiteSettings {
    this.assertRootAdmin(adminInnovaId);
    this.state.siteSettings = { ...this.state.siteSettings, ...settings };
    this.logAdminAction(adminInnovaId, 'UPDATE_SITE_SETTINGS', undefined, JSON.stringify(settings));
    this.persist();
    return this.state.siteSettings;
  }

  // --- INNOVA ID GENERATION (000001, 000002, ...) ---
  public generateNextInnovaId(mobile: string): string {
    // Root Admin exact rule: 01313213083 is always 000001
    if (mobile === ROOT_ADMIN_MOBILE) {
      return ROOT_ADMIN_INNOVA_ID;
    }

    // Sequence safety
    let seq = this.state.nextInnovaSeq;
    if (seq === 1 && !this.state.profiles.some((p) => p.innova_id === ROOT_ADMIN_INNOVA_ID)) {
      // If sequence is at 1, but this is a regular member registering first, advance sequence to 2
      seq = 2;
    }

    // Find next available sequence
    while (this.state.profiles.some((p) => p.innova_id === String(seq).padStart(6, '0'))) {
      seq++;
    }

    this.state.nextInnovaSeq = seq + 1;
    this.persist();
    return String(seq).padStart(6, '0');
  }

  // --- MEMBER PROFILE MANAGEMENT ---
  public getProfiles(): Profile[] {
    return [...this.state.profiles];
  }

  public getProfileByInnovaId(innovaId: string): Profile | undefined {
    return this.state.profiles.find((p) => p.innova_id === innovaId);
  }

  public getProfileByMobile(mobile: string): Profile | undefined {
    return this.state.profiles.find((p) => p.mobile === mobile);
  }

  public createProfile(data: {
    full_name: string;
    mobile: string;
    referred_by_id?: string | null;
    account_status?: AccountStatus;
  }): Profile {
    // Duplicate check
    const existing = this.getProfileByMobile(data.mobile);
    if (existing) {
      throw new Error('An account with this mobile number already exists');
    }

    // Referral ID validation
    const isRootAccount = data.mobile === ROOT_ADMIN_MOBILE;
    if (!isRootAccount) {
      if (!data.referred_by_id) {
        throw new Error('Referral ID is required for member registration');
      }
      const upline = this.getProfileByInnovaId(data.referred_by_id);
      if (!upline && data.referred_by_id !== ROOT_ADMIN_INNOVA_ID) {
        throw new Error(`Referral ID "${data.referred_by_id}" does not exist`);
      }
    }

    const innovaId = this.generateNextInnovaId(data.mobile);
    const now = new Date().toISOString();

    const profile: Profile = {
      id: crypto.randomUUID(),
      innova_id: innovaId,
      full_name: data.full_name.trim(),
      mobile: data.mobile.trim(),
      account_status: data.account_status || 'PENDING_PAYMENT',
      referred_by_id: isRootAccount ? null : data.referred_by_id || null,
      joining_date: now,
      created_at: now,
      updated_at: now,
    };

    this.state.profiles.push(profile);

    // Setup referral generations if upline exists
    if (profile.referred_by_id) {
      this.buildReferralGenerations(profile.innova_id, profile.referred_by_id);
    }

    // If root admin is created, log provisioning
    if (isRootAccount) {
      this.logAdminAction(profile.innova_id, 'PROVISION_ROOT_ACCOUNT', profile.id, 'Root account 000001 initialized');
    }

    // In-app welcome notification
    this.addNotification({
      target_innova_id: profile.innova_id,
      title: 'Welcome to INNOVA.GLOBAL',
      message: `Your INNOVA ID is ${profile.innova_id}. Complete account activation to unlock daily tasks and earning channels.`,
    });

    this.persist();
    return profile;
  }

  public updateProfileAvatar(innovaId: string, avatarUrl: string | null): Profile {
    const profile = this.getProfileByInnovaId(innovaId);
    if (!profile) throw new Error('Profile not found');
    profile.avatar_url = avatarUrl || undefined;
    profile.updated_at = new Date().toISOString();
    this.persist();

    // Persist to Supabase if connected
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('profiles')
        .update({ avatar_url: profile.avatar_url || null, updated_at: profile.updated_at })
        .eq('innova_id', innovaId)
        .then();
    }

    return profile;
  }

  public saveWithdrawalAccount(
    innovaId: string,
    method: PaymentMethod,
    accountNumber: string
  ): Profile {
    const profile = this.getProfileByInnovaId(innovaId);
    if (!profile) throw new Error('Member not found');

    const cleanNum = accountNumber.trim();
    if (!cleanNum || !/^01[3-9]\d{8}$/.test(cleanNum)) {
      throw new Error('Please provide a valid 11-digit Bangladeshi mobile account number (e.g. 017xxxxxxxx)');
    }

    profile.withdrawal_method = method;
    profile.withdrawal_account_number = cleanNum;
    profile.updated_at = new Date().toISOString();
    this.persist();

    // Persist to Supabase if connected
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('profiles')
        .update({
          withdrawal_method: method,
          withdrawal_account_number: cleanNum,
          updated_at: profile.updated_at,
        })
        .eq('innova_id', innovaId)
        .then();
    }

    return profile;
  }

  public updateProfileStatus(adminInnovaId: string, targetInnovaId: string, status: AccountStatus): Profile {
    this.assertRootAdmin(adminInnovaId);
    const profile = this.getProfileByInnovaId(targetInnovaId);
    if (!profile) throw new Error('Profile not found');

    profile.account_status = status;
    profile.updated_at = new Date().toISOString();
    this.logAdminAction(adminInnovaId, 'UPDATE_MEMBER_STATUS', profile.id, `Status set to ${status}`);
    this.persist();

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('profiles')
        .update({ account_status: status, updated_at: profile.updated_at })
        .eq('innova_id', targetInnovaId)
        .then();
    }

    return profile;
  }

  // --- REFERRAL GENERATIONS ---
  private buildReferralGenerations(downlineId: string, directUplineId: string) {
    const now = new Date().toISOString();
    // Gen 1
    this.state.referrals.push({
      id: crypto.randomUUID(),
      upline_innova_id: directUplineId,
      downline_innova_id: downlineId,
      generation: 1,
      created_at: now,
    });

    // Gen 2
    const upline1 = this.getProfileByInnovaId(directUplineId);
    if (upline1?.referred_by_id) {
      this.state.referrals.push({
        id: crypto.randomUUID(),
        upline_innova_id: upline1.referred_by_id,
        downline_innova_id: downlineId,
        generation: 2,
        created_at: now,
      });

      // Gen 3
      const upline2 = this.getProfileByInnovaId(upline1.referred_by_id);
      if (upline2?.referred_by_id) {
        this.state.referrals.push({
          id: crypto.randomUUID(),
          upline_innova_id: upline2.referred_by_id,
          downline_innova_id: downlineId,
          generation: 3,
          created_at: now,
        });
      }
    }
  }

  public getReferralMetrics(innovaId: string) {
    const gen1 = this.state.referrals.filter((r) => r.upline_innova_id === innovaId && r.generation === 1);
    const gen2 = this.state.referrals.filter((r) => r.upline_innova_id === innovaId && r.generation === 2);
    const gen3 = this.state.referrals.filter((r) => r.upline_innova_id === innovaId && r.generation === 3);

    const referralEarnings = this.state.earningLedger
      .filter((l) => l.innova_id === innovaId && l.type === 'REFERRAL_BONUS' && l.status === 'VERIFIED')
      .reduce((sum, l) => sum + l.amount, 0);

    return {
      directPartners: gen1.length,
      totalTeam: gen1.length + gen2.length + gen3.length,
      gen1Count: gen1.length,
      gen2Count: gen2.length,
      gen3Count: gen3.length,
      totalReferralIncome: referralEarnings,
    };
  }

  // --- PAYMENTS & ACTIVATION ---
  public submitPayment(data: {
    innova_id: string;
    payment_method: 'bKash' | 'Nagad';
    amount: number;
    transaction_id: string;
    sender_number: string;
    screenshot_url?: string;
  }): Payment {
    const profile = this.getProfileByInnovaId(data.innova_id);
    if (!profile) throw new Error('Member not found');

    // Duplicate transaction id check
    const existingTrx = this.state.payments.find(
      (p) => p.transaction_id.toLowerCase() === data.transaction_id.trim().toLowerCase()
    );
    if (existingTrx) {
      throw new Error(`Transaction ID "${data.transaction_id}" has already been submitted`);
    }

    const now = new Date().toISOString();
    const payment: Payment = {
      id: crypto.randomUUID(),
      member_id: profile.id,
      innova_id: profile.innova_id,
      member_name: profile.full_name,
      member_mobile: profile.mobile,
      payment_method: data.payment_method,
      amount: data.amount,
      transaction_id: data.transaction_id.trim(),
      sender_number: data.sender_number.trim(),
      screenshot_url: data.screenshot_url,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    };

    this.state.payments.push(payment);
    profile.account_status = 'PAYMENT_PENDING';
    profile.updated_at = now;

    // In-app notification
    this.addNotification({
      target_innova_id: profile.innova_id,
      title: 'Payment Submitted',
      message: `Your activation payment of ৳${data.amount} (TrxID: ${data.transaction_id}) is under review by Root Admin.`,
    });

    this.persist();
    return payment;
  }

  public approvePayment(adminInnovaId: string, paymentId: string): Payment {
    this.assertRootAdmin(adminInnovaId);
    const payment = this.state.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');

    // Idempotency: avoid duplicate approval
    if (payment.status === 'APPROVED') {
      return payment;
    }

    const profile = this.getProfileByInnovaId(payment.innova_id);
    if (!profile) throw new Error('Associated member not found');

    const now = new Date().toISOString();
    payment.status = 'APPROVED';
    payment.reviewed_by = adminInnovaId;
    payment.reviewed_at = now;
    payment.updated_at = now;

    // Activate member
    profile.account_status = 'ACTIVE';
    profile.activated_at = now;
    profile.updated_at = now;

    // Persist to Supabase if connected
    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('profiles')
        .update({ account_status: 'ACTIVE', updated_at: now })
        .eq('innova_id', profile.innova_id)
        .then();
    }

    // Provision Starter package purchase
    this.createPackagePurchase(profile.id, profile.innova_id, 'pkg-starter', 'STARTER', payment.amount);

    // Referral commission payout to Gen 1 upline (Configured ৳30)
    if (profile.referred_by_id) {
      const upline = this.getProfileByInnovaId(profile.referred_by_id);
      if (upline && upline.account_status === 'ACTIVE') {
        const alreadyCredited = this.state.earningLedger.some(
          (l) => l.reference_id === payment.id && l.type === 'REFERRAL_BONUS'
        );
        if (!alreadyCredited) {
          const referralBonus = this.state.siteSettings.referral_reward_amount || 30;
          this.creditLedger({
            member_id: upline.id,
            innova_id: upline.innova_id,
            amount: referralBonus,
            type: 'REFERRAL_BONUS',
            reference_id: payment.id,
            description: `Direct Referral Activation Reward from Member ${profile.innova_id}`,
          });

          this.addNotification({
            target_innova_id: upline.innova_id,
            title: 'Referral Bonus Credited',
            message: `৳${referralBonus} referral bonus received from new partner ${profile.innova_id}!`,
          });
        }
      }
    }

    // In-app notification for the newly approved member
    this.addNotification({
      target_innova_id: profile.innova_id,
      title: 'Account Activated',
      message: 'Your payment has been verified. STARTER Package is now active. Daily tasks unlocked!',
    });

    this.logAdminAction(adminInnovaId, 'APPROVE_PAYMENT', payment.id, `Payment approved for member ${profile.innova_id}`);
    this.persist();
    return payment;
  }

  public rejectPayment(adminInnovaId: string, paymentId: string, reason?: string): Payment {
    this.assertRootAdmin(adminInnovaId);
    const payment = this.state.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');

    if (payment.status === 'REJECTED') {
      return payment;
    }

    const profile = this.getProfileByInnovaId(payment.innova_id);
    const now = new Date().toISOString();
    payment.status = 'REJECTED';
    payment.admin_notes = reason || 'Payment details could not be verified.';
    payment.reviewed_by = adminInnovaId;
    payment.reviewed_at = now;
    payment.updated_at = now;

    if (profile && profile.account_status !== 'ACTIVE') {
      profile.account_status = 'REJECTED';
      profile.updated_at = now;
    }

    if (profile) {
      this.addNotification({
        target_innova_id: profile.innova_id,
        title: 'Payment Verification Failed',
        message: `Your activation payment was rejected: ${payment.admin_notes}. Please contact official support.`,
      });
    }

    this.logAdminAction(adminInnovaId, 'REJECT_PAYMENT', payment.id, `Payment rejected: ${payment.admin_notes}`);
    this.persist();
    return payment;
  }

  public getPayments(): Payment[] {
    return [...this.state.payments];
  }

  public getMemberPayments(innovaId: string): Payment[] {
    return this.state.payments.filter((p) => p.innova_id === innovaId);
  }

  // --- PACKAGES & PURCHASES ---
  public getPackages(): Package[] {
    return [...this.state.packages];
  }

  public createPackage(adminInnovaId: string, pkgData: Omit<Package, 'created_at'>): Package {
    this.assertRootAdmin(adminInnovaId);
    const existing = this.state.packages.find((p) => p.id === pkgData.id || p.name.toUpperCase() === pkgData.name.trim().toUpperCase());
    if (existing) {
      throw new Error(`A package with name "${pkgData.name}" already exists`);
    }

    const pkg: Package = {
      ...pkgData,
      name: pkgData.name.trim().toUpperCase(),
      created_at: new Date().toISOString(),
    };
    this.state.packages.push(pkg);
    this.logAdminAction(adminInnovaId, 'CREATE_PACKAGE', pkg.id, `Created package ${pkg.name} (৳${pkg.price})`);
    this.persist();
    return pkg;
  }

  public updatePackage(adminInnovaId: string, pkg: Package): Package {
    this.assertRootAdmin(adminInnovaId);
    const idx = this.state.packages.findIndex((p) => p.id === pkg.id);
    if (idx === -1) {
      this.state.packages.push(pkg);
    } else {
      // Historical purchases retain their original recorded price, duration, and details
      this.state.packages[idx] = {
        ...this.state.packages[idx],
        ...pkg,
      };
    }
    this.logAdminAction(adminInnovaId, 'UPDATE_PACKAGE', pkg.id, `Package ${pkg.name} updated. Historical purchases preserved.`);
    this.persist();
    return pkg;
  }

  public togglePackageActive(adminInnovaId: string, packageId: string): Package {
    this.assertRootAdmin(adminInnovaId);
    const pkg = this.state.packages.find((p) => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    pkg.is_active = !pkg.is_active;
    this.logAdminAction(
      adminInnovaId,
      'TOGGLE_PACKAGE_STATUS',
      pkg.id,
      `Package ${pkg.name} is now ${pkg.is_active ? 'ACTIVE' : 'INACTIVE'}`
    );
    this.persist();
    return pkg;
  }

  public createPackagePurchase(
    memberId: string,
    innovaId: string,
    pkgId: string,
    pkgName: string,
    price: number
  ): PackagePurchase {
    const pkg = this.state.packages.find((p) => p.id === pkgId);
    const durationDays = pkg?.duration_days || 15;
    const now = new Date();
    const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const purchase: PackagePurchase = {
      id: crypto.randomUUID(),
      member_id: memberId,
      innova_id: innovaId,
      package_id: pkgId,
      package_name: pkgName,
      price: price,
      activation_date: now.toISOString(),
      expiry_date: expiry.toISOString(),
      status: 'ACTIVE',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    // Keep existing active packages active (never overwrite one package with another)
    this.state.packagePurchases.push(purchase);
    this.persist();
    return purchase;
  }

  public requestPackagePurchase(data: {
    innova_id: string;
    package_id: string;
    payment_method: PaymentMethod;
    sender_number: string;
    transaction_id: string;
    screenshot_url?: string;
  }): PackagePurchase {
    const profile = this.getProfileByInnovaId(data.innova_id);
    if (!profile) throw new Error('Member profile not found');
    if (profile.account_status !== 'ACTIVE') {
      throw new Error('Your account must be ACTIVE to purchase additional packages');
    }

    const pkg = this.state.packages.find((p) => p.id === data.package_id);
    if (!pkg) throw new Error('Selected package not found');
    if (!pkg.is_active) throw new Error('This package tier is currently not accepting new activations');

    const cleanTrx = data.transaction_id.trim();
    if (!cleanTrx || cleanTrx.length < 6) {
      throw new Error('Please enter a valid Transaction ID');
    }

    // Duplicate check
    const existingPaymentTrx = this.state.payments.some(
      (p) => p.transaction_id.toLowerCase() === cleanTrx.toLowerCase()
    );
    const existingPkgTrx = this.state.packagePurchases.some(
      (p) => p.transaction_id && p.transaction_id.toLowerCase() === cleanTrx.toLowerCase()
    );
    if (existingPaymentTrx || existingPkgTrx) {
      throw new Error(`Transaction ID "${cleanTrx}" has already been submitted`);
    }

    const now = new Date().toISOString();
    const purchase: PackagePurchase = {
      id: crypto.randomUUID(),
      member_id: profile.id,
      innova_id: profile.innova_id,
      package_id: pkg.id,
      package_name: pkg.name,
      price: pkg.price,
      status: 'PENDING',
      payment_method: data.payment_method,
      sender_number: data.sender_number.trim(),
      transaction_id: cleanTrx,
      screenshot_url: data.screenshot_url,
      created_at: now,
      updated_at: now,
    };

    this.state.packagePurchases.push(purchase);

    this.addNotification({
      target_innova_id: profile.innova_id,
      title: 'Package Order Submitted',
      message: `Your purchase order for ${pkg.name} (৳${pkg.price}, TrxID: ${cleanTrx}) is under review by Root Admin.`,
    });

    this.persist();
    return purchase;
  }

  public approvePackagePurchase(adminInnovaId: string, purchaseId: string): PackagePurchase {
    this.assertRootAdmin(adminInnovaId);
    const purchase = this.state.packagePurchases.find((p) => p.id === purchaseId);
    if (!purchase) throw new Error('Package purchase order not found');

    if (purchase.status === 'ACTIVE') {
      return purchase;
    }

    const pkg = this.state.packages.find((p) => p.id === purchase.package_id);
    const durationDays = pkg?.duration_days || 15;
    const now = new Date();
    const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    purchase.status = 'ACTIVE';
    purchase.activation_date = now.toISOString();
    purchase.expiry_date = expiry.toISOString();
    purchase.reviewed_by = adminInnovaId;
    purchase.reviewed_at = now.toISOString();
    purchase.updated_at = now.toISOString();

    this.addNotification({
      target_innova_id: purchase.innova_id,
      title: 'Package Activated!',
      message: `${purchase.package_name} Package (৳${purchase.price}) is now Active for ${durationDays} days! Daily tasks yield unlocked.`,
    });

    this.logAdminAction(
      adminInnovaId,
      'APPROVE_PACKAGE_PURCHASE',
      purchase.id,
      `Approved ${purchase.package_name} package for member ${purchase.innova_id}`
    );

    this.persist();
    return purchase;
  }

  public rejectPackagePurchase(adminInnovaId: string, purchaseId: string, reason?: string): PackagePurchase {
    this.assertRootAdmin(adminInnovaId);
    const purchase = this.state.packagePurchases.find((p) => p.id === purchaseId);
    if (!purchase) throw new Error('Package purchase order not found');

    const now = new Date().toISOString();
    purchase.status = 'REJECTED';
    purchase.admin_notes = reason || 'Payment details could not be verified.';
    purchase.reviewed_by = adminInnovaId;
    purchase.reviewed_at = now;
    purchase.updated_at = now;

    this.addNotification({
      target_innova_id: purchase.innova_id,
      title: 'Package Order Rejected',
      message: `Your package purchase order for ${purchase.package_name} was rejected: ${purchase.admin_notes}.`,
    });

    this.logAdminAction(
      adminInnovaId,
      'REJECT_PACKAGE_PURCHASE',
      purchase.id,
      `Rejected ${purchase.package_name} package order: ${purchase.admin_notes}`
    );

    this.persist();
    return purchase;
  }

  public purchasePackage(innovaId: string, pkgId: string): PackagePurchase {
    const profile = this.getProfileByInnovaId(innovaId);
    if (!profile) throw new Error('Member profile not found');
    if (profile.account_status !== 'ACTIVE') {
      throw new Error('Your account must be ACTIVE to activate packages');
    }

    const pkg = this.state.packages.find((p) => p.id === pkgId);
    if (!pkg) throw new Error('Selected package not found');

    const purchase = this.createPackagePurchase(
      profile.id,
      profile.innova_id,
      pkg.id,
      pkg.name,
      pkg.price
    );

    this.addNotification({
      target_innova_id: innovaId,
      title: 'Package Activated',
      message: `${pkg.name} Package (৳${pkg.price}) has been successfully activated for 15 days!`,
    });

    return purchase;
  }

  public getActivePackages(innovaId: string): PackagePurchase[] {
    const now = new Date();
    return this.state.packagePurchases.filter(
      (p) => p.innova_id === innovaId && p.status === 'ACTIVE' && new Date(p.expiry_date || '') > now
    );
  }

  public getActivePackage(innovaId: string): PackagePurchase | null {
    const activeList = this.getActivePackages(innovaId);
    return activeList.length > 0 ? activeList[activeList.length - 1] : null;
  }

  public getAllMemberPackages(innovaId: string): PackagePurchase[] {
    return this.state.packagePurchases.filter((p) => p.innova_id === innovaId);
  }

  public getAllPackagePurchases(): PackagePurchase[] {
    return [...this.state.packagePurchases];
  }

  // --- TASKS & TASK COMPLETIONS ---
  public getTasks(): Task[] {
    return [...this.state.tasks];
  }

  public getTodayTaskCompletions(innovaId: string): TaskCompletion[] {
    const today = new Date().toISOString().split('T')[0];
    return this.state.taskCompletions.filter(
      (c) => c.innova_id === innovaId && c.cycle_date === today
    );
  }

  public completeDailyTask(innovaId: string, taskId: string, startTime: string): {
    completion: TaskCompletion;
    ledger: EarningLedger;
  } {
    const profile = this.getProfileByInnovaId(innovaId);
    if (!profile) throw new Error('Member not found');
    if (profile.account_status !== 'ACTIVE') {
      throw new Error('Only active members can execute and claim daily task rewards');
    }

    const activePkg = this.getActivePackage(innovaId);
    if (!activePkg) {
      throw new Error('You do not have an active package. Please activate a package first.');
    }

    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const today = new Date().toISOString().split('T')[0];
    const alreadyDone = this.state.taskCompletions.some(
      (c) => c.innova_id === innovaId && c.task_id === taskId && c.cycle_date === today
    );
    if (alreadyDone) {
      throw new Error('This task has already been completed for today\'s 24-hour cycle');
    }

    const todayCount = this.getTodayTaskCompletions(innovaId).length;
    if (todayCount >= 12) {
      throw new Error('You have already completed all 12 tasks allocated for today');
    }

    const now = new Date().toISOString();
    const reward = task.reward_amount;

    const completion: TaskCompletion = {
      id: crypto.randomUUID(),
      member_id: profile.id,
      innova_id: innovaId,
      task_id: taskId,
      cycle_date: today,
      start_time: startTime,
      completion_time: now,
      status: 'COMPLETED',
      reward_amount: reward,
      reward_status: 'CREDITED',
      created_at: now,
    };

    this.state.taskCompletions.push(completion);

    // Authoritative ledger credit
    const ledger = this.creditLedger({
      member_id: profile.id,
      innova_id: profile.innova_id,
      amount: reward,
      type: 'TASK',
      reference_id: completion.id,
      description: `Daily Micro-Task Completion: ${task.title}`,
    });

    this.persist();
    return { completion, ledger };
  }

  // --- FINANCIAL LEDGER & BALANCES ---
  public creditLedger(data: {
    member_id: string;
    innova_id: string;
    amount: number;
    type: 'TASK' | 'REFERRAL_BONUS' | 'MONTHLY_REWARD' | 'AUTHORIZED_ADJUSTMENT' | 'WITHDRAWAL_DEDUCTION';
    reference_id?: string;
    description: string;
  }): EarningLedger {
    const entry: EarningLedger = {
      id: crypto.randomUUID(),
      member_id: data.member_id,
      innova_id: data.innova_id,
      amount: data.amount,
      type: data.type,
      reference_id: data.reference_id,
      description: data.description,
      status: 'VERIFIED',
      created_at: new Date().toISOString(),
    };
    this.state.earningLedger.push(entry);
    this.persist();
    return entry;
  }

  public getMemberFinancialSummary(innovaId: string): MemberFinancialSummary {
    const today = new Date().toISOString().split('T')[0];

    const todayEarnings = this.state.earningLedger
      .filter((l) => l.innova_id === innovaId && l.status === 'VERIFIED' && l.created_at.startsWith(today))
      .reduce((sum, l) => sum + l.amount, 0);

    const totalCredits = this.state.earningLedger
      .filter((l) => l.innova_id === innovaId && l.status === 'VERIFIED' && l.amount > 0)
      .reduce((sum, l) => sum + l.amount, 0);

    // Deductions: withdrawals that are pending, approved, or paid
    const withdrawalDebits = this.state.withdrawals
      .filter((w) => w.innova_id === innovaId && w.status !== 'REJECTED')
      .reduce((sum, w) => sum + w.amount, 0);

    const activeBalance = Math.max(0, Number((totalCredits - withdrawalDebits).toFixed(2)));

    const totalWithdrawalsPaid = this.state.withdrawals
      .filter((w) => w.innova_id === innovaId && w.status === 'PAID')
      .reduce((sum, w) => sum + w.amount, 0);

    const todayCompletions = this.getTodayTaskCompletions(innovaId);
    const activePackages = this.getActivePackages(innovaId);
    const allPurchasedPackages = this.getAllMemberPackages(innovaId);
    const activePackage = activePackages.length > 0 ? activePackages[activePackages.length - 1] : null;

    return {
      today_earnings: Number(todayEarnings.toFixed(2)),
      active_balance: activeBalance,
      total_earnings: Number(totalCredits.toFixed(2)),
      active_package: activePackage,
      active_packages: activePackages,
      all_purchased_packages: allPurchasedPackages,
      tasks_today_completed: todayCompletions.length,
      tasks_today_remaining: Math.max(0, 12 - todayCompletions.length),
      total_withdrawals_paid: totalWithdrawalsPaid,
    };
  }

  public getLedger(): EarningLedger[] {
    return [...this.state.earningLedger];
  }

  public getMemberLedger(innovaId: string): EarningLedger[] {
    return this.state.earningLedger.filter((l) => l.innova_id === innovaId);
  }

  // --- WITHDRAWALS ---
  public getWithdrawalEligibility(innovaId: string): {
    eligible: boolean;
    reason?: string;
    remainingSeconds?: number;
    waitMinutes: number;
  } {
    const profile = this.getProfileByInnovaId(innovaId);
    const waitMinutes = this.state.siteSettings.withdrawal_wait_minutes ?? 10;
    if (!profile) return { eligible: false, reason: 'Profile not found', waitMinutes };
    if (profile.account_status !== 'ACTIVE') {
      return { eligible: false, reason: 'Account must be ACTIVE to request a withdrawal', waitMinutes };
    }

    const baseTime = profile.activated_at
      ? new Date(profile.activated_at).getTime()
      : new Date(profile.joining_date).getTime();
    const elapsedSeconds = (Date.now() - baseTime) / 1000;
    const requiredSeconds = waitMinutes * 60;

    if (elapsedSeconds < requiredSeconds) {
      const remainingSeconds = Math.ceil(requiredSeconds - elapsedSeconds);
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      return {
        eligible: false,
        reason: `Withdrawal requirement has not yet been completed. You must wait ${waitMinutes} minutes after activation. Time remaining: ${mins}m ${secs}s.`,
        remainingSeconds,
        waitMinutes,
      };
    }

    const existingWithdrawals = this.getMemberWithdrawals(innovaId);
    if (existingWithdrawals.length > 0) {
      const last = existingWithdrawals[0];
      const elapsedSinceLast = (Date.now() - new Date(last.created_at).getTime()) / 1000;
      if (elapsedSinceLast < requiredSeconds) {
        const remainingSeconds = Math.ceil(requiredSeconds - elapsedSinceLast);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        return {
          eligible: false,
          reason: `Withdrawal cooldown active. You must wait ${waitMinutes} minutes between requests. Time remaining: ${mins}m ${secs}s.`,
          remainingSeconds,
          waitMinutes,
        };
      }
    }

    const fin = this.getMemberFinancialSummary(innovaId);
    const minAmount = this.state.siteSettings.min_withdrawal_amount || 300;
    if (fin.active_balance < minAmount) {
      return {
        eligible: false,
        reason: `Minimum balance of ৳${minAmount} required. Current verified active balance is ৳${fin.active_balance}.`,
        waitMinutes,
      };
    }

    return { eligible: true, waitMinutes };
  }

  public requestWithdrawal(data: {
    innova_id: string;
    amount: number;
    payment_method: 'bKash' | 'Nagad';
    account_number: string;
    user_note?: string;
  }): Withdrawal {
    const profile = this.getProfileByInnovaId(data.innova_id);
    if (!profile) throw new Error('Member not found');
    if (profile.account_status !== 'ACTIVE') {
      throw new Error('Only active members are eligible to request withdrawals');
    }

    const minAmount = this.state.siteSettings.min_withdrawal_amount || 300;
    if (data.amount < minAmount) {
      throw new Error(`Minimum withdrawal amount is ৳${minAmount}`);
    }

    const fin = this.getMemberFinancialSummary(data.innova_id);
    if (fin.active_balance < data.amount) {
      throw new Error(
        `Insufficient available balance. Available: ৳${fin.active_balance}, Requested: ৳${data.amount}`
      );
    }

    // Enforce 10-minute waiting eligibility requirement on the backend (Requirement 7)
    const eligibility = this.getWithdrawalEligibility(data.innova_id);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || 'Withdrawal requirement has not yet been completed.');
    }

    const now = new Date().toISOString();

    // Persist saved withdrawal account onto member profile (Requirement 6)
    profile.withdrawal_method = data.payment_method;
    profile.withdrawal_account_number = data.account_number.trim();
    profile.updated_at = now;

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from('profiles')
        .update({
          withdrawal_method: data.payment_method,
          withdrawal_account_number: data.account_number.trim(),
          updated_at: now,
        })
        .eq('innova_id', data.innova_id)
        .then();
    }

    const withdrawal: Withdrawal = {
      id: crypto.randomUUID(),
      member_id: profile.id,
      innova_id: profile.innova_id,
      member_name: profile.full_name,
      amount: data.amount,
      payment_method: data.payment_method,
      account_number: data.account_number.trim(),
      user_note: data.user_note,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    };

    this.state.withdrawals.unshift(withdrawal);

    this.addNotification({
      target_innova_id: profile.innova_id,
      title: 'Withdrawal Request Placed',
      message: `Your withdrawal request of ৳${data.amount} to ${data.payment_method} (${data.account_number}) is awaiting review by Root Admin.`,
    });

    this.persist();
    return withdrawal;
  }

  public getWithdrawals(): Withdrawal[] {
    return [...this.state.withdrawals];
  }

  public getMemberWithdrawals(innovaId: string): Withdrawal[] {
    return this.state.withdrawals.filter((w) => w.innova_id === innovaId);
  }

  public updateWithdrawalStatus(
    adminInnovaId: string,
    withdrawalId: string,
    status: 'APPROVED' | 'REJECTED' | 'PAID',
    adminNotes?: string
  ): Withdrawal {
    this.assertRootAdmin(adminInnovaId);
    const withdrawal = this.state.withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal) throw new Error('Withdrawal not found');

    const now = new Date().toISOString();
    withdrawal.status = status;
    withdrawal.admin_notes = adminNotes;
    withdrawal.reviewed_at = now;
    withdrawal.updated_at = now;

    this.addNotification({
      target_innova_id: withdrawal.innova_id,
      title: `Withdrawal ${status}`,
      message: `Your withdrawal of ৳${withdrawal.amount} has been marked as ${status}.${adminNotes ? ' Note: ' + adminNotes : ''}`,
    });

    this.logAdminAction(adminInnovaId, 'UPDATE_WITHDRAWAL_STATUS', withdrawal.id, `Status updated to ${status}`);
    this.persist();
    return withdrawal;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(innovaId?: string): NotificationItem[] {
    if (!innovaId) return [...this.state.notifications];
    return this.state.notifications.filter(
      (n) => n.target_innova_id === 'ALL' || n.target_innova_id === innovaId
    );
  }

  public addNotification(data: {
    target_innova_id: string;
    title: string;
    message: string;
  }): NotificationItem {
    const item: NotificationItem = {
      id: crypto.randomUUID(),
      target_innova_id: data.target_innova_id,
      title: data.title,
      message: data.message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.state.notifications.unshift(item);
    this.persist();
    return item;
  }

  public markNotificationRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.persist();
    }
  }

  // --- ADMIN LOGS ---
  public getAdminLogs(adminInnovaId: string): AdminLog[] {
    this.assertRootAdmin(adminInnovaId);
    return [...this.state.adminLogs];
  }

  private logAdminAction(adminInnovaId: string, actionType: string, targetId?: string, details?: string) {
    this.state.adminLogs.unshift({
      id: crypto.randomUUID(),
      admin_innova_id: adminInnovaId,
      action_type: actionType,
      target_id: targetId,
      details: details || '',
      created_at: new Date().toISOString(),
    });
  }

  // --- ROOT ADMIN SECURITY ENFORCEMENT ---
  public isRootAdmin(innovaId: string): boolean {
    return innovaId === ROOT_ADMIN_INNOVA_ID;
  }

  public assertRootAdmin(innovaId: string) {
    if (innovaId !== ROOT_ADMIN_INNOVA_ID) {
      throw new Error('403 Forbidden: Root Admin (000001) authorization required.');
    }
  }
}

export const dbStore = new Store();
