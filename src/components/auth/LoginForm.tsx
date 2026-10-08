import React, { useState } from 'react';
import { authService } from '../../services/auth/authService';
import { Profile } from '../../types';
import { ROOT_ADMIN_MOBILE } from '../../config/site';
import { Lock, Phone, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (profile: Profile) => void;
  onNavigateToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToRegister,
}) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Root provisioning state if needed
  const [showProvisionRoot, setShowProvisionRoot] = useState(false);
  const [rootPassword, setRootPassword] = useState('');
  const [rootConfirmPassword, setRootConfirmPassword] = useState('');
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  const isRootProvisioned = authService.isRootAccountProvisioned();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profile = await authService.login(mobile, password);
      onSuccess(profile);
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      // If root account is not yet provisioned and the admin tries to log in
      if (mobile.trim() === ROOT_ADMIN_MOBILE && !isRootProvisioned) {
        setShowProvisionRoot(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProvisionRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rootPassword !== rootConfirmPassword) {
      setError('Root account passwords do not match');
      return;
    }
    if (rootPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const profile = await authService.provisionRootAccount(rootPassword);
      setProvisionSuccess(true);
      setTimeout(() => {
        onSuccess(profile);
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to provision Root Admin');
    } finally {
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
            Platform Member Login
          </h2>
          <p className="text-xs text-neutral-400">
            Enter your registered mobile number and password. Root Admin (000001) and normal members log in through this same portal.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {provisionSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Root Account (000001) successfully provisioned! Logging in...</span>
          </div>
        )}

        {/* Regular Login Form */}
        {!showProvisionRoot ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 01313213083"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm placeholder:text-neutral-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Helper for Root Admin Provisioning if not done */}
            {!isRootProvisioned && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMobile(ROOT_ADMIN_MOBILE);
                    setShowProvisionRoot(true);
                  }}
                  className="text-xs text-amber-400/90 hover:text-amber-300 underline font-mono cursor-pointer"
                >
                  First-Time Root Admin Setup (000001)? Click here
                </button>
              </div>
            )}
          </form>
        ) : (
          /* Secure Root Admin Initial Setup Modal/Form */
          <form onSubmit={handleProvisionRoot} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-neutral-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>ROOT ADMIN (000001) PROVISIONING</span>
              </div>
              <p>Mobile: <strong className="text-white font-mono">{ROOT_ADMIN_MOBILE}</strong></p>
              <p className="text-[11px] text-neutral-400">
                Set the master secure password for Root Member + Root Admin 000001. Passwords are never stored in plaintext.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
                Create Root Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={rootPassword}
                onChange={(e) => setRootPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
                Confirm Root Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter root password"
                value={rootConfirmPassword}
                onChange={(e) => setRootConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm focus:outline-none font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProvisionRoot(false)}
                className="w-1/3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Provisioning...' : 'Complete Root Setup'}
              </button>
            </div>
          </form>
        )}

        {/* Bottom Nav to Register */}
        <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
          Don't have an account yet?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
