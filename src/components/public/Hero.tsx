import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Network } from 'lucide-react';

interface HeroProps {
  onNavigate: (view: string) => void;
  isLoggedIn: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, isLoggedIn }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Sacred Inscription */}
            <div className="inline-block text-amber-400/90 font-serif text-sm tracking-widest font-semibold px-3 py-1 bg-amber-500/10 rounded border border-amber-500/20">
              Bismillahir Rahmanir Rahim
            </div>

            {/* Brand Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-serif leading-[1.1]">
              INNOVA<span className="text-amber-400">.GLOBAL</span>
            </h1>

            {/* Tagline */}
            <p className="text-sm sm:text-base font-mono tracking-widest text-amber-300 font-semibold uppercase">
              CONNECT • LEARN • GROW
            </p>

            {/* Sub-headline */}
            <h2 className="text-xl sm:text-2xl text-neutral-300 font-medium">
              Smart Digital Network Platform
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Empowering next-generation digital contributors with decentralized daily micro-task verification, structured network synergy, and verified instant mobile banking settlements.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isLoggedIn ? (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-sm rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  ENTER MEMBER DASHBOARD
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('register')}
                    className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 font-bold text-sm rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    CREATE ACCOUNT
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('login')}
                    className="w-full sm:w-auto px-7 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-amber-500/50 font-semibold text-sm rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    LOGIN
                  </button>
                </>
              )}
            </div>

            {/* Trust Markers */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Root Core 000001 Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Network className="w-4 h-4 text-amber-400" />
                Zero Demo Data
              </span>
            </div>
          </div>

          {/* Right Visual Image Block */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 group">
              <img
                src="/src/assets/images/hero_digital_network_1791432539809.jpg"
                alt="INNOVA.GLOBAL Smart Digital Network"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 p-4 bg-neutral-950/80 backdrop-blur-md rounded-xl border border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-amber-400">NETWORK NODE ENGINE</p>
                    <p className="text-sm font-semibold text-neutral-200">Decentralized High-Yield Pipeline</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
