import React, { useState, useEffect } from 'react';
import { MobileShell } from './components/common/MobileShell';
import { Header } from './components/common/Header';
import { BottomNav, ActiveTab } from './components/common/BottomNav';
import { DashboardView } from './components/features/DashboardView';
import { TransactionsView } from './components/features/TransactionsView';
import { AccountsView } from './components/features/AccountsView';
import { AnalyticsView } from './components/features/AnalyticsView';
import { BudgetView } from './components/features/BudgetView';
import { GoalsView } from './components/features/GoalsView';
import { BillsView } from './components/features/BillsView';
import { DebtView } from './components/features/DebtView';
import { InvestmentView } from './components/features/InvestmentView';
import { NetWorthView } from './components/features/NetWorthView';
import { AffordabilityView } from './components/features/AffordabilityView';
import { LuxAICopilot } from './components/features/LuxAICopilot';
import { MonthlyReviewView } from './components/features/MonthlyReviewView';
import { ProfileView } from './components/features/ProfileView';
import { DesignSystemShowcase } from './components/features/DesignSystemShowcase';
import { SmartAddModal } from './components/features/SmartAddModal';
import { LicenseActivationModal } from './components/license/LicenseActivationModal';
import { LicenseAdminModal } from './components/license/LicenseAdminModal';
import { LicenseStatusScreen } from './components/license/LicenseStatusScreen';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { OfflineSyncCenterModal } from './components/features/OfflineSyncCenterModal';
import { NotificationCenterModal } from './components/features/NotificationCenterModal';
import { notificationEngine } from './utils/notificationEngine';

// Auth Components
import { SplashScreen } from './components/auth/SplashScreen';
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { ForgotPasswordScreen } from './components/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './components/auth/ResetPasswordScreen';
import { OnboardingScreen } from './components/auth/OnboardingScreen';
import { SecurityScreen } from './components/features/SecurityScreen';

import { auth } from './utils/auth';
import { storage } from './utils/storage';
import { Bell, X, CheckCircle } from 'lucide-react';

import { FinanceEngineTestRunner } from './components/features/FinanceEngineTestRunner';
import { FinancialDatabaseViewer } from './components/features/FinancialDatabaseViewer';

type AppScreen =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot-pass'
  | 'reset-pass'
  | 'onboarding'
  | 'app'
  | 'security';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [resetFlowData, setResetFlowData] = useState<{ email: string; code: string }>({ email: '', code: '' });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isSmartAddOpen, setIsSmartAddOpen] = useState(false);
  const [smartAddMode, setSmartAddMode] = useState<'text' | 'ocr' | 'manual'>('text');
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState(false);
  const [, setTick] = useState(0);

  const currentUser = auth.getCurrentUser() || storage.getState().user;

  // Run initial automated system alert scan
  useEffect(() => {
    notificationEngine.runSystemScan();
  }, []);

  // Subscribe to storage changes for reactive re-renders
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const handleSplashFinish = () => {
    if (auth.isAuthenticated()) {
      setScreen('app');
    } else {
      setScreen('welcome');
    }
  };

  const handleAuthSuccess = () => {
    const user = auth.getCurrentUser();
    if (!user?.financialContext) {
      setScreen('onboarding');
    } else {
      setScreen('app');
    }
  };

  const handleGoogleAuth = async () => {
    await auth.loginWithGoogle({
      name: 'Fitri Handayani',
      email: 'fitrihandayani.cloud99@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    handleAuthSuccess();
  };

  const handleDemoAccess = async () => {
    await auth.login('fitrihandayani.cloud99@gmail.com', 'password123');
    setScreen('app');
  };

  const state = storage.getState();
  const unreadNotifs = state.notifications.filter((n) => !n.isRead);

  const handleOpenSmartAdd = (mode: 'text' | 'ocr' | 'manual' = 'text') => {
    setSmartAddMode(mode);
    setIsSmartAddOpen(true);
  };

  const handleMarkAllRead = () => {
    state.notifications.forEach((n) => storage.markNotificationAsRead(n.id));
  };

  // Render Auth Flows outside MobileShell
  if (screen === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onNavigateLogin={() => setScreen('login')}
        onNavigateRegister={() => setScreen('register')}
        onGoogleAuth={handleGoogleAuth}
        onDemoAccess={handleDemoAccess}
      />
    );
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onBack={() => setScreen('welcome')}
        onSuccess={handleAuthSuccess}
        onNavigateRegister={() => setScreen('register')}
        onNavigateForgotPassword={() => setScreen('forgot-pass')}
        onGoogleAuth={handleGoogleAuth}
      />
    );
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onBack={() => setScreen('welcome')}
        onSuccess={handleAuthSuccess}
        onNavigateLogin={() => setScreen('login')}
        onGoogleAuth={handleGoogleAuth}
      />
    );
  }

  if (screen === 'forgot-pass') {
    return (
      <ForgotPasswordScreen
        onBack={() => setScreen('login')}
        onNavigateReset={(email, code) => {
          setResetFlowData({ email, code });
          setScreen('reset-pass');
        }}
      />
    );
  }

  if (screen === 'reset-pass') {
    return (
      <ResetPasswordScreen
        initialEmail={resetFlowData.email}
        initialCode={resetFlowData.code}
        onBack={() => setScreen('forgot-pass')}
        onSuccess={() => setScreen('login')}
      />
    );
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen onComplete={() => setScreen('app')} />;
  }

  // Main App Flow inside MobileShell
  return (
    <MobileShell>
      <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F7F6F2] font-sans">
        {/* PWA Install Banner */}
        <PWAInstallBanner />

        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadNotifsCount={unreadNotifs.length}
          onOpenNotifs={() => setIsNotifOpen(true)}
          onOpenSyncCenter={() => setIsSyncCenterOpen(true)}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 max-w-md mx-auto w-full">
          {screen === 'security' ? (
            <SecurityScreen onBack={() => setScreen('app')} />
          ) : (
            <>
              {activeTab === 'home' && (
                <DashboardView
                  setActiveTab={setActiveTab}
                  onOpenSmartAdd={() => handleOpenSmartAdd('text')}
                  onOpenScanReceipt={() => handleOpenSmartAdd('ocr')}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView onOpenSmartAdd={() => handleOpenSmartAdd('text')} />
              )}

              {activeTab === 'accounts' && <AccountsView />}

              {activeTab === 'analytics' && <AnalyticsView />}

              {activeTab === 'budget' && <BudgetView />}

              {activeTab === 'goals' && <GoalsView />}

              {activeTab === 'bills' && <BillsView />}

              {activeTab === 'debt' && <DebtView />}

              {activeTab === 'investments' && <InvestmentView />}

              {activeTab === 'networth' && <NetWorthView />}

              {activeTab === 'affordability' && <AffordabilityView />}

              {activeTab === 'copilot' && <LuxAICopilot />}

              {activeTab === 'reports' && <MonthlyReviewView />}

              {activeTab === 'design-system' && <DesignSystemShowcase />}

              {activeTab === 'database' && <FinancialDatabaseViewer />}

              {activeTab === 'test-suite' && <FinanceEngineTestRunner />}

              {activeTab === 'profile' && (
                <ProfileView
                  setActiveTab={setActiveTab}
                  onOpenLicenseActivation={() => setIsLicenseModalOpen(true)}
                  onNavigateSecurity={() => setScreen('security')}
                  onLogout={() => setScreen('welcome')}
                />
              )}

              {activeTab === 'admin' && (
                <LicenseStatusScreen
                  currentUser={currentUser}
                  onOpenActivationModal={() => setIsLicenseModalOpen(true)}
                  onOpenAdminModal={() => setIsAdminModalOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSmartAdd={() => handleOpenSmartAdd('text')}
        />

        {/* Smart Add / OCR Modal */}
        <SmartAddModal
          isOpen={isSmartAddOpen}
          onClose={() => setIsSmartAddOpen(false)}
          defaultMode={smartAddMode}
        />

        {/* License Activation Modal */}
        <LicenseActivationModal
          isOpen={isLicenseModalOpen}
          onClose={() => setIsLicenseModalOpen(false)}
          currentUser={currentUser}
          onActivationSuccess={(result) => {
            auth.updateProfileDetails({
              licenseKey: result.licenseKey || '',
              licenseStatus: result.status || 'ACTIVE',
              licensePlan: result.plan || 'VIP_LIFETIME',
            });
            setIsLicenseModalOpen(false);
          }}
          onOpenAdminPanel={() => {
            setIsLicenseModalOpen(false);
            setIsAdminModalOpen(true);
          }}
        />

        {/* License Admin Panel Modal */}
        <LicenseAdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />

        {/* Notification & Preferences Center Modal */}
        <NotificationCenterModal
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          setActiveTab={setActiveTab}
        />

        {/* Offline Sync & Conflict Resolution Modal */}
        <OfflineSyncCenterModal
          isOpen={isSyncCenterOpen}
          onClose={() => setIsSyncCenterOpen(false)}
        />
      </div>
    </MobileShell>
  );
}
