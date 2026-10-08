import React from 'react';
import { DEFAULT_SITE_SETTINGS } from '../../config/site';
import { Send, Youtube, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (type: 'privacy' | 'terms' | 'earnings') => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate }) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800/80 pt-16 pb-12 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-serif font-bold text-base">
                IN
              </div>
              <span className="font-serif tracking-widest text-lg font-bold text-neutral-100">
                INNOVA<span className="text-amber-400">.GLOBAL</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Smart Digital Network Platform. Designed with institutional precision for digital task verification, network collaboration, and peer-to-peer growth.
            </p>
            <div className="pt-2 text-xs font-mono text-amber-400/90 tracking-wider">
              CONNECT · LEARN · GROW
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-200 tracking-wider uppercase mb-4 font-mono">
              Platform Architecture
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Live Ecosystem
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('network')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Power Network Structure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('packages')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Verified Tier Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Workflow & Task Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-200 tracking-wider uppercase mb-4 font-mono">
              Compliance & Policy
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  Privacy Policy <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  Terms & Conditions <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('earnings')}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  Reward & Earning Disclosure <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Official Help Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Official Verification Channels */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-200 tracking-wider uppercase mb-4 font-mono">
              Official Channels
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href={DEFAULT_SITE_SETTINGS.telegram_channel}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 hover:text-amber-400 transition-all"
              >
                <Send className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">Telegram Channel (Official)</span>
              </a>

              <a
                href={DEFAULT_SITE_SETTINGS.telegram_group}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 hover:text-amber-400 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Community Group</span>
              </a>

              <a
                href={DEFAULT_SITE_SETTINGS.youtube_channel}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-500/40 hover:text-red-400 transition-all"
              >
                <Youtube className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate">YouTube: @PowerNetwork7X</span>
              </a>

              <div className="pt-2 text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Support/bKash: {DEFAULT_SITE_SETTINGS.support_number}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} INNOVA.GLOBAL. All rights reserved.</p>
          <p className="font-mono text-[11px]">
            Root Core: 000001 · Enterprise High-Availability
          </p>
        </div>
      </div>
    </footer>
  );
};
