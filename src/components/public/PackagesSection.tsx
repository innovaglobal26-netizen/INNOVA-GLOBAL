import React from 'react';
import { Package } from '../../types';
import { Check, Zap, Sparkles, Crown } from 'lucide-react';

interface PackagesSectionProps {
  packages: Package[];
  onSelectPackage: (pkg: Package) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  onSelectPackage,
}) => {
  return (
    <section className="py-20 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Network Tier Structure
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-100">
            Official Platform Packages
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Choose your activation tier to participate in daily digital network micro-task verification cycles. All tiers operate under standardized protocol parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const isPopular = pkg.name === 'PLUS';
            const isPro = pkg.name === 'PRO';

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all border ${
                  isPopular
                    ? 'bg-neutral-900 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-[11px] rounded-full uppercase tracking-wider font-mono shadow-md">
                    Recommended Tier
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif font-bold text-xl text-neutral-100 tracking-wide">
                      {pkg.name}
                    </span>
                    {isPro ? (
                      <Crown className="w-5 h-5 text-amber-400" />
                    ) : isPopular ? (
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Zap className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold font-mono text-white tabular-nums">
                      ৳{pkg.price}
                    </span>
                    <span className="text-xs text-neutral-400 ml-2 font-mono">
                      / {pkg.duration_days} days validity
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-3.5 pt-4 border-t border-neutral-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Daily Tasks</span>
                      <span className="font-mono text-neutral-200 font-semibold">
                        {pkg.tasks_per_day} tasks / day
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Task Duration</span>
                      <span className="font-mono text-neutral-200 font-semibold">
                        ~{pkg.task_duration_seconds} seconds
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Configured Daily Yield</span>
                      <span className="font-mono text-amber-400 font-bold">
                        ৳{pkg.daily_reward} / day
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Total 15-Day Yield Potential</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        ৳{pkg.daily_reward * pkg.duration_days}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Referral Eligibility</span>
                      <span className="font-mono text-neutral-300">Level 1 - 3 Enabled</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Settlement Speed</span>
                      <span className="font-mono text-neutral-300">Daily Ledger Credit</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => onSelectPackage(pkg)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:border-amber-500/40'
                    }`}
                  >
                    Select {pkg.name} Tier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
