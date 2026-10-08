import React from 'react';
import { DEFAULT_SITE_SETTINGS } from '../../config/site';
import { Phone, Send, Youtube, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section className="py-20 bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Verified Support
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-100">
            Official Contact & Payment Information
          </h2>
          <p className="text-sm text-neutral-400">
            Please note: INNOVA.GLOBAL operates exclusively with the designated official accounts below. Never send funds to any unauthorized number.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* bKash & Nagad Official Number */}
          <div className="p-6 bg-neutral-900/80 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                Official Merchant / Personal
              </span>
              <h3 className="text-xl font-bold text-neutral-100 font-mono mt-1">
                {DEFAULT_SITE_SETTINGS.support_number}
              </h3>
            </div>
            <div className="space-y-1.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>bKash (Send Money / Cash-In): <strong>{DEFAULT_SITE_SETTINGS.bkash_number}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Nagad (Send Money / Cash-In): <strong>{DEFAULT_SITE_SETTINGS.nagad_number}</strong></span>
              </div>
            </div>
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] text-neutral-400">
              Initial account activation fee: <strong className="text-neutral-200">৳200</strong>
            </div>
          </div>

          {/* Official Telegram Channels */}
          <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">
                Telegram Network
              </span>
              <h3 className="text-lg font-bold text-neutral-100 mt-1">
                Official Groups & Channels
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <a
                href={DEFAULT_SITE_SETTINGS.telegram_channel}
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-sky-500/40 text-neutral-300 hover:text-sky-400 transition-colors"
              >
                📢 Official Channel: @powernetwork7xofficialchannel
              </a>
              <a
                href={DEFAULT_SITE_SETTINGS.telegram_group}
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 hover:text-emerald-400 transition-colors"
              >
                👥 Official Group Community
              </a>
              <a
                href={DEFAULT_SITE_SETTINGS.support_telegram}
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 hover:text-amber-400 transition-colors"
              >
                👤 Owner Direct Desk: @PARVEZ_OWNER_7X
              </a>
            </div>
          </div>

          {/* Official YouTube & Broadcasting */}
          <div className="p-6 bg-neutral-900/80 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
              <Youtube className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-red-400 uppercase tracking-wider">
                Official YouTube
              </span>
              <h3 className="text-lg font-bold text-neutral-100 mt-1">
                PowerNetwork 7X Broadcast
              </h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Watch step-by-step account activation guides, daily micro-task walkthroughs, and platform announcements.
            </p>
            <a
              href={DEFAULT_SITE_SETTINGS.youtube_channel}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <Youtube className="w-4 h-4" />
              Subscribe @PowerNetwork7X
            </a>
          </div>
        </div>

        {/* Anti-Fraud Disclaimer Notice */}
        <div className="mt-10 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-neutral-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block mb-0.5">Official Security Warning:</strong>
            INNOVA.GLOBAL will never request your account password, ask for payments outside 01313213083, or promise unrealistic returns without task completion. Protect your credentials at all times.
          </div>
        </div>
      </div>
    </section>
  );
};
