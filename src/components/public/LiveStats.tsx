import React from 'react';
import { Users, UserCheck, CreditCard, Banknote } from 'lucide-react';

interface LiveStatsProps {
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalJoining: number;
    totalVerifiedEarnings: number;
  };
}

export const LiveStats: React.FC<LiveStatsProps> = ({ stats }) => {
  return (
    <section className="py-12 bg-neutral-900/50 border-y border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Real-Time Platform State
          </p>
          <h3 className="text-2xl font-serif font-bold text-neutral-100">
            Live Public Platform Statistics
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Authoritative transactional ledger values directly from backend storage.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Members */}
          <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 hover:border-amber-500/30 transition-all text-center">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Total Members
            </p>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-neutral-100 mt-1 tabular-nums">
              {stats.totalMembers}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">Verified registrations</p>
          </div>

          {/* Active Members */}
          <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 hover:border-emerald-500/30 transition-all text-center">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Active Members
            </p>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 mt-1 tabular-nums">
              {stats.activeMembers}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">Activated packages</p>
          </div>

          {/* Total Joining */}
          <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 hover:border-amber-500/30 transition-all text-center">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Total Joining
            </p>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-neutral-100 mt-1 tabular-nums">
              ৳{stats.totalJoining.toLocaleString()}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">Settled activation volume</p>
          </div>

          {/* Total Verified Earnings */}
          <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 hover:border-amber-500/30 transition-all text-center">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Banknote className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Total Verified Earnings
            </p>
            <p className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 mt-1 tabular-nums">
              ৳{stats.totalVerifiedEarnings.toLocaleString()}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">Ledger credited payouts</p>
          </div>
        </div>
      </div>
    </section>
  );
};
