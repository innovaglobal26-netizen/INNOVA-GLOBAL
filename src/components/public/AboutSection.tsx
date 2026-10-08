import React from 'react';
import { Target, Award, Users, Compass } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-neutral-900/30 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
            About Our Mission
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-100">
            Smart Digital Network Platform
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            INNOVA.GLOBAL was conceived to bridge digital opportunities with disciplined, verified micro-tasks. Our platform combines cutting-edge architecture with transparent peer rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-200">Our Vision</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              To cultivate the most trustworthy digital earning community in Bangladesh, supported by genuine blockchain-inspired task consensus.
            </p>
          </div>

          <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-200">Integrity First</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Zero fake figures, zero mock dashboards. Every Taka in your active balance is backed by an audited ledger entry.
            </p>
          </div>

          <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-200">Community Growth</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Earn through personal micro-tasks and build a flourishing multi-generation network team with transparent percentage yields.
            </p>
          </div>

          <div className="p-6 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-200">Continuous Evolution</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Constant upgrades in security, fast mobile banking transactions, and scalable cloud infrastructure to support unlimited members.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
