import React, { useState, useEffect } from 'react';
import { PaymentMethod, Profile } from '../../types';
import { withdrawalService } from '../../services/withdrawals/withdrawalService';
import { memberService } from '../../services/member/memberService';
import { X, Wallet, AlertCircle, CheckCircle2, ArrowRight, Clock, Save, ShieldAlert } from 'lucide-react';

interface WithdrawalModalProps {
  profile: Profile;
  innovaId: string;
  activeBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  profile,
  innovaId,
  activeBalance,
  onClose,
  onSuccess,
}) => {
  // Initialize with saved withdrawal credentials if available
  const [amount, setAmount] = useState<number>(300);
  const [method, setMethod] = useState<PaymentMethod>(profile.withdrawal_method || 'bKash');
  const [accountNumber, setAccountNumber] = useState(profile.withdrawal_account_number || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Account Save state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  // 10-minute eligibility timer state
  const [eligibility, setEligibility] = useState(() =>
    memberService.getWithdrawalEligibility(innovaId)
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(eligibility.remainingSeconds || 0);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = memberService.getWithdrawalEligibility(innovaId);
      setEligibility(current);
      setSecondsLeft(current.remainingSeconds || 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [innovaId]);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accountNumber.trim() || !/^01[3-9]\d{8}$/.test(accountNumber.trim())) {
      setError('Please provide a valid 11-digit Bangladeshi mobile account number (e.g. 017xxxxxxxx)');
      return;
    }

    setSavingAccount(true);
    try {
      memberService.saveWithdrawalAccount(innovaId, method, accountNumber.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to save withdrawal account');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < 300) {
      setError('Minimum withdrawal amount is ৳300');
      return;
    }
    if (amount > activeBalance) {
      setError(`Requested amount (৳${amount}) exceeds available active balance (৳${activeBalance})`);
      return;
    }
    if (!accountNumber.trim() || !/^01[3-9]\d{8}$/.test(accountNumber.trim())) {
      setError('Please provide a valid 11-digit Bangladeshi mobile account number');
      return;
    }

    if (!eligibility.eligible) {
      setError(eligibility.reason || 'Withdrawal eligibility requirement has not yet been completed.');
      return;
    }

    setLoading(true);
    try {
      withdrawalService.requestWithdrawal({
        innova_id: innovaId,
        amount,
        payment_method: method,
        account_number: accountNumber.trim(),
        user_note: note.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Withdrawal request failed');
      setLoading(false);
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                Disbursement Portal
              </span>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                Withdraw Verified Earnings
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Balance Display */}
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400">Available Verified Balance:</span>
          <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            ৳{activeBalance.toFixed(2)}
          </span>
        </div>

        {/* 10-Minute Waiting Requirement Notice (Requirement 7) */}
        {!eligibility.eligible && secondsLeft > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-300">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-200">
                10-Minute Security Eligibility Period Active
              </p>
              <p className="text-neutral-300 leading-relaxed">
                The withdrawal requirement has not yet been completed. Protocol security requires a 10-minute waiting period following account activation/withdrawal before placing a new disbursement request.
              </p>
              <div className="pt-1 font-mono font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <span>Time Remaining:</span>
                <span className="bg-amber-400/20 px-2 py-0.5 rounded text-amber-300">
                  {mins}m {secs < 10 ? `0${secs}` : secs}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Saved Withdrawal Account Box (Requirement 6) */}
        <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Saved Withdrawal Wallet (bKash / Nagad)</span>
            </span>
            {saveSuccess && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Supabase!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex gap-1.5 sm:col-span-1">
              <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  method === 'bKash'
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                bKash
              </button>
              <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  method === 'Nagad'
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500 font-bold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                Nagad
              </button>
            </div>

            <input
              type="text"
              placeholder="e.g. 017xxxxxxxx"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-100 focus:outline-none focus:border-amber-500 sm:col-span-1"
            />

            <button
              type="button"
              onClick={handleSaveAccount}
              disabled={savingAccount || !accountNumber.trim()}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              {savingAccount ? 'Saving...' : 'Save Wallet'}
            </button>
          </div>
          <p className="text-[10px] text-neutral-500">
            Your saved wallet number persists permanently in Supabase for all upcoming withdrawal requests.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-neutral-100">Withdrawal Placed!</h4>
            <p className="text-xs text-neutral-400">
              Your withdrawal request of ৳{amount} to {method} ({accountNumber}) is awaiting Root Admin review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider flex justify-between">
                <span>Withdrawal Amount (৳)</span>
                <span className="text-neutral-500 font-normal">Min: ৳300</span>
              </label>
              <input
                type="number"
                min="300"
                step="50"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-sm font-mono focus:outline-none"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase tracking-wider">
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Personal bKash number"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-neutral-100 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || activeBalance < 300 || !eligibility.eligible}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Submitting...'
              ) : !eligibility.eligible ? (
                `Waiting Period: ${mins}m ${secs}s Remaining`
              ) : (
                <>
                  <span>Submit Withdrawal (৳{amount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
