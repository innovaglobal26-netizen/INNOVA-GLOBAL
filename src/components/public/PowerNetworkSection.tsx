import React from 'react';
import { Network, GitBranch, Layers, Shield, Cpu, RefreshCw } from 'lucide-react';

export const PowerNetworkSection: React.FC = () => {
  return (
    <section className="py-20 bg-neutral-900/40 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Grid Image */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950">
              <img
                src="/src/assets/images/power_network_grid_1791432550920.jpg"
                alt="Power Network Multi-Tier Architecture"
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-neutral-950/80 backdrop-blur-md rounded-xl border border-neutral-800">
                <p className="text-xs font-mono text-amber-400">POWER NETWORK 7X</p>
                <p className="text-xs text-neutral-300">Synchronized Multi-Generation Synergy Topology</p>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="inline-block text-xs font-mono uppercase tracking-widest text-amber-400 px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              Synergy Architecture
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-100">
              The Power Network Infrastructure
            </h2>

            <p className="text-sm text-neutral-400 leading-relaxed">
              INNOVA.GLOBAL introduces a structured network layer designed to align decentralized participant engagement with micro-task verification cycles. Each activated node reinforces platform throughput while generating verified ledger-backed yields.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-200">3-Tier Depth Generation</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Structured Generation 1, 2, and 3 referral relations tracked with PostgreSQL relational integrity.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-200">Server-Side Validation</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Zero client-side spoofing. Every micro-task requires timed duration execution and database consensus.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-200">Daily 24H Cycles</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Anti-duplication locks prevent multiple claims per cycle, guaranteeing fair token distribution across all members.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-200">Root Admin 000001 Security</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Row Level Security (RLS) and cryptographic isolation ensure private member data and screenshots remain protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
