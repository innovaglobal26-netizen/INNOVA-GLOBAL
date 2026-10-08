import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Hero } from './components/public/Hero';
import { LiveStats } from './components/public/LiveStats';
import { PackagesSection } from './components/public/PackagesSection';
import { PowerNetworkSection } from './components/public/PowerNetworkSection';
import { HowItWorksSection } from './components/public/HowItWorksSection';
import { AboutSection } from './components/public/AboutSection';
import { ContactSection } from './components/public/ContactSection';
import { LegalModals } from './components/public/LegalModals';
import { NotificationsModal } from './components/common/NotificationsModal';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { MemberDashboard } from './components/member/MemberDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { ProductionVerificationModal } from './components/verification/ProductionVerificationModal';
import { authService } from './services/auth/authService';
import { dbStore } from './services/db/store';
import { Profile, Package } from './types';
import { ShieldCheck, Award } from 'lucide-react';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(
    authService.getCurrentProfile()
  );
  const [activeView, setActiveView] = useState<string>('home');
  const [stats, setStats] = useState(dbStore.getPublicStats());
  const [packages, setPackages] = useState(dbStore.getPackages());
  const [notifications, setNotifications] = useState(
    dbStore.getNotifications(currentProfile?.innova_id)
  );

  // Modals
  const [legalModalType, setLegalModalType] = useState<
    'privacy' | 'terms' | 'earnings' | null
  >(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  // Sync state with subscriptions
  useEffect(() => {
    const unsubAuth = authService.subscribe((profile) => {
      setCurrentProfile(profile);
      if (profile && (activeView === 'login' || activeView === 'register')) {
        setActiveView('dashboard');
      }
    });

    const unsubDB = dbStore.subscribe(() => {
      setStats(dbStore.getPublicStats());
      setPackages(dbStore.getPackages());
      setNotifications(dbStore.getNotifications(currentProfile?.innova_id));
    });

    return () => {
      unsubAuth();
      unsubDB();
    };
  }, [currentProfile, activeView]);

  const handleRefresh = () => {
    setStats(dbStore.getPublicStats());
    setPackages(dbStore.getPackages());
    if (currentProfile) {
      const refreshed = dbStore.getProfileByInnovaId(currentProfile.innova_id);
      if (refreshed) setCurrentProfile(refreshed);
      setNotifications(dbStore.getNotifications(currentProfile.innova_id));
    }
  };

  const handleLogout = () => {
    authService.logout();
    setActiveView('home');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans">
      {/* Top Header */}
      <Header
        currentProfile={currentProfile}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onLogout={handleLogout}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadCount={unreadNotifsCount}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* PUBLIC HOME VIEW */}
        {activeView === 'home' && (
          <>
            <Hero
              onNavigate={(view) => setActiveView(view)}
              isLoggedIn={Boolean(currentProfile)}
            />
            <LiveStats stats={stats} />
            <PackagesSection
              packages={packages}
              onSelectPackage={(pkg: Package) => {
                if (currentProfile) {
                  setActiveView('dashboard');
                } else {
                  setActiveView('register');
                }
              }}
            />
            <PowerNetworkSection />
            <HowItWorksSection onNavigate={(view) => setActiveView(view)} />
            <AboutSection />
            <ContactSection />
          </>
        )}

        {/* PUBLIC ABOUT VIEW */}
        {activeView === 'about' && (
          <div className="py-12">
            <AboutSection />
          </div>
        )}

        {/* PUBLIC NETWORK VIEW */}
        {activeView === 'network' && (
          <div className="py-12">
            <PowerNetworkSection />
          </div>
        )}

        {/* PUBLIC PACKAGES VIEW */}
        {activeView === 'packages' && (
          <div className="py-12">
            <PackagesSection
              packages={packages}
              onSelectPackage={() => {
                setActiveView(currentProfile ? 'dashboard' : 'register');
              }}
            />
          </div>
        )}

        {/* PUBLIC HOW IT WORKS VIEW */}
        {activeView === 'how-it-works' && (
          <div className="py-12">
            <HowItWorksSection onNavigate={(view) => setActiveView(view)} />
          </div>
        )}

        {/* PUBLIC CONTACT VIEW */}
        {activeView === 'contact' && (
          <div className="py-12">
            <ContactSection />
          </div>
        )}

        {/* AUTH: LOGIN */}
        {activeView === 'login' && (
          <LoginForm
            onSuccess={(profile) => {
              setCurrentProfile(profile);
              setActiveView('dashboard');
            }}
            onNavigateToRegister={() => setActiveView('register')}
          />
        )}

        {/* AUTH: REGISTER */}
        {activeView === 'register' && (
          <RegisterForm
            onSuccess={(profile) => {
              setCurrentProfile(profile);
              setActiveView('dashboard');
            }}
            onNavigateToLogin={() => setActiveView('login')}
          />
        )}

        {/* MEMBER DASHBOARD */}
        {activeView === 'dashboard' && currentProfile && (
          <MemberDashboard
            profile={currentProfile}
            onRefresh={handleRefresh}
            onNavigateToAdmin={
              currentProfile.innova_id === '000001'
                ? () => setActiveView('admin')
                : undefined
            }
          />
        )}

        {/* ROOT ADMIN PANEL (Only accessible by 000001) */}
        {activeView === 'admin' && currentProfile && (
          <AdminPanel
            currentProfile={currentProfile}
            onNavigateToMemberDashboard={() => setActiveView('dashboard')}
            onRefresh={handleRefresh}
          />
        )}
      </main>

      {/* Production Verification Fast-Trigger Sticky Button in Bottom Right */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setVerificationModalOpen(true)}
          className="px-3.5 py-2 bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-mono font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer hover:scale-105"
          title="Run Production System Audit Checklist"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>PRODUCTION VERIFICATION</span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        onOpenLegal={(type) => setLegalModalType(type)}
        onNavigate={(view) => setActiveView(view)}
      />

      {/* Legal Modals */}
      <LegalModals
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Notifications Modal */}
      {notificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setNotificationsOpen(false)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Production Verification E2E Audit Modal */}
      {verificationModalOpen && (
        <ProductionVerificationModal
          onClose={() => setVerificationModalOpen(false)}
        />
      )}
    </div>
  );
}
