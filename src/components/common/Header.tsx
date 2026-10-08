import React, { useState } from 'react';
import { Profile } from '../../types';
import {
  ShieldCheck,
  Bell,
  LogOut,
  User,
  LayoutDashboard,
  Menu,
  X,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentProfile: Profile | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  activeView,
  onNavigate,
  onLogout,
  onOpenNotifications,
  unreadCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRootAdmin = currentProfile?.innova_id === '000001';

  const navLinks = [
    { label: 'Home', view: 'home' },
    { label: 'About', view: 'about' },
    { label: 'Power Network', view: 'network' },
    { label: 'Packages', view: 'packages' },
    { label: 'How It Works', view: 'how-it-works' },
    { label: 'Contact', view: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate(currentProfile ? 'dashboard' : 'home')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-neutral-950 font-bold font-serif text-lg shadow-md shadow-amber-500/10">
              IN
            </div>
            <div>
              <span className="font-serif tracking-widest text-lg font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">
                INNOVA<span className="text-amber-400">.GLOBAL</span>
              </span>
              <p className="text-[10px] tracking-wider text-neutral-400 -mt-1 font-mono">
                CONNECT · LEARN · GROW
              </p>
            </div>
          </button>

          {/* Desktop Nav Links (Public or Contextual) */}
          <nav className="hidden lg:flex items-center gap-6">
            {!currentProfile &&
              navLinks.map((link) => (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
                  className={`text-sm transition-colors cursor-pointer ${
                    activeView === link.view
                      ? 'text-amber-400 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {link.label}
                </button>
              ))}

            {currentProfile && (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`text-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeView === 'dashboard'
                      ? 'text-amber-400 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                {/* Root Admin Only Switch Button */}
                {isRootAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                      activeView === 'admin'
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-sm shadow-amber-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ADMIN PANEL
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-3">
            {currentProfile ? (
              <>
                {/* Notification Bell */}
                <button
                  onClick={onOpenNotifications}
                  className="relative p-2 text-neutral-400 hover:text-amber-400 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Profile Badge */}
                <div
                  onClick={() => onNavigate('dashboard')}
                  className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs flex items-center justify-center font-mono font-bold">
                    {currentProfile.avatar_url ? (
                      <img
                        src={currentProfile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentProfile.innova_id.slice(-2)
                    )}
                  </div>
                  <div className="text-left text-xs">
                    <span className="text-neutral-200 font-medium block truncate max-w-[100px]">
                      {currentProfile.full_name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      ID: {currentProfile.innova_id}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-lg transition-colors cursor-pointer"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
                >
                  CREATE ACCOUNT
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-neutral-900/95 border-b border-neutral-800 px-4 pt-2 pb-6 space-y-2 backdrop-blur-lg">
          {!currentProfile &&
            navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => {
                  onNavigate(link.view);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg ${
                  activeView === link.view
                    ? 'text-amber-400 bg-neutral-800 font-semibold'
                    : 'text-neutral-300 hover:bg-neutral-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}

          {currentProfile && (
            <>
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 mb-2">
                <p className="text-xs text-neutral-400 font-mono">Member ID: {currentProfile.innova_id}</p>
                <p className="text-sm font-semibold text-neutral-100">{currentProfile.full_name}</p>
                <p className="text-xs text-neutral-400">{currentProfile.mobile}</p>
              </div>

              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                Member Dashboard
              </button>

              {isRootAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg flex items-center gap-2 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Root Admin Panel (000001)
                </button>
              )}

              <button
                onClick={() => {
                  onOpenNotifications();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}

          {!currentProfile && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-neutral-100 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                LOGIN
              </button>
              <button
                onClick={() => {
                  onNavigate('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg"
              >
                CREATE ACCOUNT
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
