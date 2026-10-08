import React from 'react';
import { X, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'earnings' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-amber-400" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-amber-400" />}
            {type === 'earnings' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            <h3 className="text-base font-bold text-neutral-100 font-serif">
              {type === 'privacy' && 'INNOVA.GLOBAL Privacy Policy'}
              {type === 'terms' && 'Terms and Conditions'}
              {type === 'earnings' && 'Reward & Earning Disclosure'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-300 leading-relaxed font-sans">
          {type === 'privacy' && (
            <>
              <p>
                <strong>1. Information Collection:</strong> INNOVA.GLOBAL collects member full names, 11-digit mobile numbers, sequential INNOVA IDs, and voluntary transaction verification receipts solely for account security, verification, and transactional reward routing.
              </p>
              <p>
                <strong>2. Data Protection:</strong> We employ cryptographic hashing and Row Level Security (RLS) within our PostgreSQL storage framework. Passwords are never stored in plaintext and are never visible to administrators.
              </p>
              <p>
                <strong>3. Screenshot Storage:</strong> Payment transaction screenshots uploaded during activation are stored in secure storage buckets and accessible solely by the account owner and authorized root administrators for auditing.
              </p>
              <p>
                <strong>4. Third-Party Sharing:</strong> We do not sell, rent, or trade your personal information to third-party telemarketers or external advertising networks.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                <strong>1. Acceptance of Terms:</strong> By registering an account with INNOVA.GLOBAL, you agree to comply with our community network standards, multi-generation guidelines, and security requirements.
              </p>
              <p>
                <strong>2. Account Integrity:</strong> Each individual member is permitted one unique mobile number. Automated scripting, API packet manipulation, or unauthorized task bot activities are strictly prohibited and result in permanent account suspension.
              </p>
              <p>
                <strong>3. Activation & Packages:</strong> The initial ৳200 fee activates platform membership and initiates the STARTER package duration. Tier upgrades are subject to verified administrative ledger settlement.
              </p>
              <p>
                <strong>4. Root Admin Authority:</strong> Root Admin 000001 maintains sole administrative authority for verifying payment receipts, managing platform liquidity, and enforcing anti-fraud protocols.
              </p>
            </>
          )}

          {type === 'earnings' && (
            <>
              <p>
                <strong>1. Task-Contingent Rewards:</strong> Earnings generated through INNOVA.GLOBAL are strictly contingent upon active tier package ownership and genuine completion of daily micro-tasks (~20 seconds each).
              </p>
              <p>
                <strong>2. No Guaranteed Income:</strong> INNOVA.GLOBAL does not offer passive or guaranteed financial returns without task execution. Rewards are distributed directly based on active participant verification work.
              </p>
              <p>
                <strong>3. Referral Synergy:</strong> Multi-generation referral bonuses are earned when direct partners and downline members successfully activate packages and engage with daily cycles.
              </p>
              <p>
                <strong>4. Withdrawal Terms:</strong> Withdrawals require a verified minimum ledger balance of ৳300 and are disbursed to genuine Bangladeshi mobile banking accounts (bKash/Nagad).
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
