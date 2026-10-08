export type AccountStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PENDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type PaymentMethod = 'bKash' | 'Nagad';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export type LedgerEntryType =
  | 'TASK'
  | 'REFERRAL_BONUS'
  | 'MONTHLY_REWARD'
  | 'AUTHORIZED_ADJUSTMENT'
  | 'WITHDRAWAL_DEDUCTION';

export interface Profile {
  id: string; // uuid
  auth_user_id?: string;
  innova_id: string; // e.g. "000001", "000002"
  full_name: string;
  mobile: string;
  avatar_url?: string;
  account_status: AccountStatus;
  referred_by_id?: string | null; // innova_id of upline
  joining_date: string;
  activated_at?: string;
  withdrawal_method?: PaymentMethod;
  withdrawal_account_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string; // STARTER, PLUS, PRO
  price: number; // 200, 300, 400
  duration_days: number; // 15
  tasks_per_day: number; // 12
  task_duration_seconds: number; // 20
  daily_reward: number; // 50, 100, 150
  is_active: boolean;
  description?: string;
  created_at: string;
}

export interface PackagePurchase {
  id: string;
  member_id: string; // profile id
  innova_id: string;
  package_id: string;
  package_name: string;
  price: number;
  activation_date?: string;
  expiry_date?: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REJECTED' | 'CANCELLED';
  payment_method?: PaymentMethod;
  transaction_id?: string;
  sender_number?: string;
  screenshot_url?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  innova_id: string;
  member_name: string;
  member_mobile: string;
  payment_method: PaymentMethod;
  amount: number;
  transaction_id: string;
  sender_number: string;
  screenshot_url?: string;
  status: PaymentStatus;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  reward_amount: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  member_id: string;
  innova_id: string;
  task_id: string;
  cycle_date: string; // YYYY-MM-DD
  start_time: string;
  completion_time: string;
  status: 'COMPLETED';
  reward_amount: number;
  reward_status: 'CREDITED';
  created_at: string;
}

export interface EarningLedger {
  id: string;
  member_id: string;
  innova_id: string;
  amount: number;
  type: LedgerEntryType;
  reference_id?: string;
  description: string;
  status: 'VERIFIED' | 'PENDING' | 'CANCELLED';
  created_at: string;
}

export interface ReferralRecord {
  id: string;
  upline_innova_id: string;
  downline_innova_id: string;
  generation: 1 | 2 | 3;
  created_at: string;
}

export interface BonusRule {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  requirement_description: string;
  is_active: boolean;
  created_at: string;
}

export interface BonusRecord {
  id: string;
  member_id: string;
  innova_id: string;
  bonus_rule_id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface MonthlyRewardRule {
  id: string;
  title: string;
  direct_partners_required: number;
  team_required: number;
  reward_amount: number;
  eligibility_period_days: number;
  is_active: boolean;
  created_at: string;
}

export interface MonthlyRewardRecord {
  id: string;
  member_id: string;
  innova_id: string;
  rule_id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface Withdrawal {
  id: string;
  member_id: string;
  innova_id: string;
  member_name: string;
  amount: number;
  payment_method: PaymentMethod;
  account_number: string;
  user_note?: string;
  status: WithdrawalStatus;
  admin_notes?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  target_innova_id: string; // 'ALL' or specific innova_id
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  website_name: string;
  tagline: string;
  support_number: string;
  bkash_number: string;
  nagad_number: string;
  telegram_group: string;
  telegram_channel: string;
  youtube_channel: string;
  support_telegram: string;
  min_withdrawal_amount: number;
  activation_fee: number;
  referral_reward_amount: number;
  withdrawal_wait_minutes: number;
}

export interface AdminLog {
  id: string;
  admin_innova_id: string;
  action_type: string;
  target_id?: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface MemberFinancialSummary {
  today_earnings: number;
  active_balance: number;
  total_earnings: number;
  active_package: PackagePurchase | null;
  active_packages: PackagePurchase[];
  all_purchased_packages: PackagePurchase[];
  tasks_today_completed: number;
  tasks_today_remaining: number;
  total_withdrawals_paid: number;
}
