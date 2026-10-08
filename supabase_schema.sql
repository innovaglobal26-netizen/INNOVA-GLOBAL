-- ====================================================================
-- INNOVA.GLOBAL — PostgreSQL & Supabase Production Schema Definition
-- Project Ref: emnnltbzxzdutnisvzni.supabase.co
-- ====================================================================

-- 1. Create INNOVA ID Sequence
CREATE SEQUENCE IF NOT EXISTS innova_id_seq START WITH 1 INCREMENT BY 1;

-- Function to format sequential 6-digit INNOVA ID: 000001, 000002, etc.
CREATE OR REPLACE FUNCTION generate_innova_id()
RETURNS text AS $$
DECLARE
    next_val bigint;
BEGIN
    next_val := nextval('innova_id_seq');
    RETURN lpad(next_val::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    innova_id VARCHAR(10) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    avatar_url TEXT,
    account_status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (account_status IN ('PENDING_PAYMENT', 'PAYMENT_PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'DEACTIVATED')),
    referred_by_id VARCHAR(10) REFERENCES public.profiles(innova_id),
    joining_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_innova_id ON public.profiles(innova_id);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by_id);

-- 3. Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    duration_days INT NOT NULL DEFAULT 15,
    tasks_per_day INT NOT NULL DEFAULT 12,
    task_duration_seconds INT NOT NULL DEFAULT 20,
    daily_reward NUMERIC(12, 2) NOT NULL DEFAULT 50,
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Initial Packages if not present
INSERT INTO public.packages (id, name, price, duration_days, tasks_per_day, task_duration_seconds, daily_reward, is_active, description)
VALUES 
  ('pkg-starter', 'STARTER', 200, 15, 12, 20, 50, true, 'Starter package with 12 daily tasks and ৳50 daily yield'),
  ('pkg-plus', 'PLUS', 300, 15, 12, 20, 100, true, 'Plus package with 12 daily tasks and ৳100 daily yield'),
  ('pkg-pro', 'PRO', 400, 15, 12, 20, 150, true, 'Pro package with 12 daily tasks and ৳150 daily yield')
ON CONFLICT (id) DO NOTHING;

-- 4. Package Purchases Table
CREATE TABLE IF NOT EXISTS public.package_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    innova_id VARCHAR(10) NOT NULL REFERENCES public.profiles(innova_id),
    package_id TEXT NOT NULL REFERENCES public.packages(id),
    package_name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    activation_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expiry_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_package_purchases_member ON public.package_purchases(member_id, status);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    innova_id VARCHAR(10) NOT NULL REFERENCES public.profiles(innova_id),
    member_name TEXT NOT NULL,
    member_mobile VARCHAR(20) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bKash', 'Nagad')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    transaction_id TEXT NOT NULL UNIQUE,
    sender_number VARCHAR(20) NOT NULL,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_notes TEXT,
    reviewed_by VARCHAR(10),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_innova_id ON public.payments(innova_id);

-- 6. Daily Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 20,
    reward_amount NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Standard Tasks
INSERT INTO public.tasks (id, title, description, duration_seconds, reward_amount, is_active, order_index)
VALUES
  ('task-01', 'Smart Network Verification', 'Analyze platform network metrics and affirm verified throughput', 20, 4.16, true, 1),
  ('task-02', 'Cloud Traffic Routing Test', 'Execute digital traffic packet routing validation and latency check', 20, 4.16, true, 2),
  ('task-03', 'Security Certificate Check', 'Audit SSL/TLS handshake latency and digital trust parameters', 20, 4.16, true, 3),
  ('task-04', 'Decentralized Cache Ping', 'Validate distributed cache cluster availability and freshness score', 20, 4.16, true, 4),
  ('task-05', 'Micro-Service Heartbeat Check', 'Synchronize health check heartbeats for core processing modules', 20, 4.16, true, 5),
  ('task-06', 'Database Replica Sync Verification', 'Inspect replication lag across geo-distributed replica clusters', 20, 4.16, true, 6),
  ('task-07', 'API Gateway Bandwidth Metering', 'Review network packet throughput constraints and QoS limits', 20, 4.16, true, 7),
  ('task-08', 'Encryption Header Audit', 'Verify cipher block chaining integrity on outbound transactions', 20, 4.16, true, 8),
  ('task-09', 'Event Log Ingestion Review', 'Inspect telemetry logging pipeline and buffer flush thresholds', 20, 4.16, true, 9),
  ('task-10', 'Worker Thread Affinity Verification', 'Audit runtime worker node memory distribution parameters', 20, 4.16, true, 10),
  ('task-11', 'Rate Limiter State Assessment', 'Test token bucket replenishment rates and overflow boundaries', 20, 4.16, true, 11),
  ('task-12', 'System Integrity Final Consensus', 'Aggregate daily network consensus proofs for final reward commit', 20, 4.24, true, 12)
ON CONFLICT (id) DO NOTHING;

-- 7. Task Completions Table (Enforces single completion per cycle date per user)
CREATE TABLE IF NOT EXISTS public.task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    innova_id VARCHAR(10) NOT NULL REFERENCES public.profiles(innova_id),
    task_id TEXT NOT NULL REFERENCES public.tasks(id),
    cycle_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMPTZ NOT NULL,
    completion_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    reward_amount NUMERIC(12, 2) NOT NULL CHECK (reward_amount >= 0),
    reward_status TEXT NOT NULL DEFAULT 'CREDITED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_member_task_cycle UNIQUE (member_id, task_id, cycle_date)
);

CREATE INDEX IF NOT EXISTS idx_task_comp_date ON public.task_completions(member_id, cycle_date);

-- 8. Earning Ledger Table (Authoritative Financial Source of Truth)
CREATE TABLE IF NOT EXISTS public.earning_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    innova_id VARCHAR(10) NOT NULL REFERENCES public.profiles(innova_id),
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('TASK', 'REFERRAL_BONUS', 'MONTHLY_REWARD', 'AUTHORIZED_ADJUSTMENT', 'WITHDRAWAL_DEDUCTION')),
    reference_id TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (status IN ('VERIFIED', 'PENDING', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_earning_ledger_member ON public.earning_ledger(member_id, status);

-- 9. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upline_innova_id VARCHAR(10) NOT NULL REFERENCES public.profiles(innova_id),
    downline_innova_id VARCHAR(10) NOT NULL REFERENCES public.profiles(innova_id),
    generation SMALLINT NOT NULL CHECK (generation IN (1, 2, 3)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_referral_pair UNIQUE (upline_innova_id, downline_innova_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_upline ON public.referrals(upline_innova_id, generation);

-- 10. Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    innova_id VARCHAR(10) NOT NULL REFERENCES public.profiles(innova_id),
    member_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 300),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bKash', 'Nagad')),
    account_number VARCHAR(20) NOT NULL,
    user_note TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID')),
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_innova ON public.withdrawals(innova_id);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_innova_id VARCHAR(10) NOT NULL, -- 'ALL' or specific innova_id
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifs_target ON public.notifications(target_innova_id, is_read);

-- 12. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default settings
INSERT INTO public.site_settings (key, value)
VALUES ('main_config', '{
  "website_name": "INNOVA.GLOBAL",
  "tagline": "CONNECT • LEARN • GROW",
  "support_number": "01313213083",
  "bkash_number": "01313213083",
  "nagad_number": "01313213083",
  "telegram_group": "https://t.me/+kOclYClnM0NmYzc1",
  "telegram_channel": "https://t.me/powernetwork7xofficialchannel",
  "youtube_channel": "https://www.youtube.com/@PowerNetwork7X",
  "support_telegram": "https://t.me/PARVEZ_OWNER_7X",
  "min_withdrawal_amount": 300,
  "activation_fee": 200
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 13. Admin Logs Table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_innova_id VARCHAR(10) NOT NULL,
    action_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is Root Admin '000001'
CREATE OR REPLACE FUNCTION is_root_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE auth_user_id = auth.uid() 
        AND innova_id = '000001'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Root admin sees all; members see self and upline/downlines
CREATE POLICY "Public profiles can be viewed by root admin" ON public.profiles
    FOR ALL USING (is_root_admin());

CREATE POLICY "Members view their own profile" ON public.profiles
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Members update their own profile" ON public.profiles
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Payments: Only root admin or payment owner
CREATE POLICY "Root admin manages payments" ON public.payments
    FOR ALL USING (is_root_admin());

CREATE POLICY "Members view their own payments" ON public.payments
    FOR SELECT USING (member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Members insert their own payments" ON public.payments
    FOR INSERT WITH CHECK (member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Withdrawals: Only root admin or withdrawal owner
CREATE POLICY "Root admin manages withdrawals" ON public.withdrawals
    FOR ALL USING (is_root_admin());

CREATE POLICY "Members view their own withdrawals" ON public.withdrawals
    FOR SELECT USING (member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Members insert their own withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Ledger: Read own records, root admin full access
CREATE POLICY "Root admin manages ledger" ON public.earning_ledger
    FOR ALL USING (is_root_admin());

CREATE POLICY "Members read own ledger" ON public.earning_ledger
    FOR SELECT USING (member_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Packages, Tasks, Site Settings: Public readable, root admin writable
CREATE POLICY "Anyone read active packages" ON public.packages
    FOR SELECT USING (true);
CREATE POLICY "Root admin manages packages" ON public.packages
    FOR ALL USING (is_root_admin());

CREATE POLICY "Anyone read active tasks" ON public.tasks
    FOR SELECT USING (true);
CREATE POLICY "Root admin manages tasks" ON public.tasks
    FOR ALL USING (is_root_admin());

CREATE POLICY "Anyone read site settings" ON public.site_settings
    FOR SELECT USING (true);
CREATE POLICY "Root admin manages site settings" ON public.site_settings
    FOR ALL USING (is_root_admin());

-- Notifications: Target is ALL or user's innova_id
CREATE POLICY "Members read their notifications" ON public.notifications
    FOR SELECT USING (
        target_innova_id = 'ALL' OR 
        target_innova_id IN (SELECT innova_id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
        is_root_admin()
    );

CREATE POLICY "Root admin manages notifications" ON public.notifications
    FOR ALL USING (is_root_admin());

-- Admin logs: Strictly root admin only
CREATE POLICY "Only root admin accesses admin logs" ON public.admin_logs
    FOR ALL USING (is_root_admin());
