import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth/authService';
import { Profile } from '../../types';
import { User, Phone, Lock, GitBranch, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterFormProps {
  onSuccess: (profile: Profile) => void;
  onNavigateToLogin: () => void;
  initialReferralId?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateToLogin,
  initialReferralId,
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralId, setReferralId] = useState(initialReferralId || '000001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for ?ref=000001
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setReferralId(refParam);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Please enter your full legal name (minimum 3 characters)');
      return;
    }

    const cleanMobile = mobile.trim();
    if (!/^01[3-9]\d{8}$/.test(cleanMobile)) {
      setError('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017xxxxxxxx)');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!referralId.trim()) {
      setError('Referral ID is required. Use "000001" if you do not have a sponsor.');
      return;
    }

    setLoading(true);

    try {
      const profile = await authService.register({
        full_name: fullName,
        mobile: cleanMobile,
        password,
        confirm_password: confirmPassword,
        referred_by_id: referralId.trim(),
      });

      setSuccessInfo(
        `Account created successfully! Your unique INNOVA ID is ${profile.innova_id}. Transitioning to activation payment...`
      );

      setTimeout(() => {
        onSuccess(profile);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check the inputs.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-neutral-950 font-serif font-bold text-xl shadow-md shadow-amber-500/10">
            IN
          </div>
          <h2 className="text-2xl font-serif font-bold text-neutral-100">
            Create Member Account
          </h2>
          <p className="text-xs text-neutral-400">
            Join the INNOVA.GLOBAL Smart Digital Network. Sequential ID will be assigned upon submission.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successInfo}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                placeholder="e.g. Parvez Ahmed"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
              Mobile Number (11-Digits)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                placeholder="e.g. 01712345678"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Referral ID */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Sponsor / Referral ID</span>
              <span className="text-[10px] text-amber-400 font-sans normal-case">Default: 000001 (Root)</span>
            </label>
            <div className="relative">
              <GitBranch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                required
                placeholder="000001"
                value={referralId}
                onChange={(e) => setReferralId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-amber-400 font-mono text-sm placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
              Password (Min 6 Characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="Re-type password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing Registration...' : 'CREATE ACCOUNT'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Navigation to Login */}
        <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
          Already registered?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
          >
            Sign in to existing account
          </button>
        </div>
      </div>
    </div>
  );
};
