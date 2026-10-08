import React from 'react';
import { UserPlus, CreditCard, CheckCircle2, Wallet, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onNavigate: (view: string) => void;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Create Account',
      desc: 'Register with your verified 11-digit mobile number and upline Referral ID (Root ID: 000001). Sequential INNOVA ID is assigned.',
      icon: UserPlus,
    },
    {
      step: '02',
      title: 'Submit Activation',
      desc: 'Send the ৳200 initial activation fee via official bKash or Nagad (01313213083), enter TrxID, and upload receipt screenshot.',
      icon: CreditCard,
    },
    {
      step: '03',
      title: 'Execute Daily Tasks',
      desc: 'Complete 12 daily micro-tasks (~20 seconds each) in your Member Dashboard. Rewards are credited directly to your financial ledger.',
      icon: CheckCircle2,
    },
    {
      step: '04',
      title: 'Withdraw Earnings',
      desc: 'Request withdrawals directly to your bKash or Nagad personal wallet once minimum threshold (৳300) is reached.',
      icon: Wallet,
    },
  ];

  return (
    <section className="py-20 bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Lifecycle & Operation
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-100">
            How INNOVA.GLOBAL Works
          </h2>
          <p className="text-sm text-neutral-400">
            Four clear steps from registration to verified daily payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 relative group hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-amber-400/80">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-200 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-800/60 flex items-center text-xs text-amber-400/80 font-mono">
                  <span>Verified Step</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-70" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            Start Account Registration
          </button>
        </div>
      </div>
    </section>
  );
};
