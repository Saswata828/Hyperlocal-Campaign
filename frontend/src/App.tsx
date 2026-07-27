import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target } from 'lucide-react';
import { LandingPage } from './components/landing/LandingPage';
import { MerchantDashboardLayout } from './components/dashboard/MerchantDashboardLayout';
import { AuthPortal } from './components/auth/AuthPortal';
import { GoogleCallbackPage } from './components/auth/GoogleCallbackPage';
import { apiService } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = React.useState<any>(() => {
    const stored = localStorage.getItem('_hyperlocal_mock_session');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [view, setView] = React.useState<'landing' | 'auth_screen' | 'dashboard' | 'google_callback'>(() => {
    const path = window.location.pathname;
    if (path === '/auth/google/callback' || path === '/auth/google/callback/') {
      return 'google_callback';
    }
    if (path === '/dashboard' || path === '/dashboard/') {
      return currentUser ? 'dashboard' : 'landing';
    }
    return currentUser ? 'dashboard' : 'landing';
  });

  const [initialAuthMode, setInitialAuthMode] = React.useState<'signin' | 'signup' | 'complete_profile'>('signin');
  const [prefilledEmail, setPrefilledEmail] = React.useState('');

  React.useEffect(() => {
    // Sync view with URL paths initially
    const path = window.location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') {
      if (!currentUser) {
        window.history.replaceState({}, document.title, '/');
        setView('landing');
      }
    }

    const handleExpired = () => {
      console.warn("[App] Unauthorized session expired event received. Logging out...");
      handleLogout();
    };

    window.addEventListener('unauthorized-session-expired', handleExpired);
    return () => {
      window.removeEventListener('unauthorized-session-expired', handleExpired);
    };
  }, [currentUser]);

  const handleLaunchPortal = (mode?: 'login' | 'register') => {
    setInitialAuthMode(mode === 'register' ? 'signup' : 'signin');
    setPrefilledEmail('');
    setView('auth_screen');
  };

  const handleCompleteProfileRequired = (email: string, token: string) => {
    setPrefilledEmail(email);
    localStorage.setItem('_hyperlocal_access_token', token);
    setInitialAuthMode('complete_profile');
    setView('auth_screen');
  };

  const handleAuthSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('_hyperlocal_mock_session', JSON.stringify(user));
    localStorage.setItem('_logged_user_email', user.email);
    localStorage.setItem('_hyperlocal_access_token', token);
    window.history.replaceState({}, document.title, '/dashboard');
    setView('dashboard');
  };

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('_hyperlocal_mock_session', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    localStorage.removeItem('_hyperlocal_mock_session');
    localStorage.removeItem('_logged_user_email');
    localStorage.removeItem('_onboarding_completed');
    window.history.replaceState({}, document.title, '/');
    setView('landing');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col font-sans selection:bg-indigo-500/10 selection:text-indigo-900" id="main-auth-container">
      <AnimatePresence mode="wait">
        {view === 'google_callback' ? (
          <GoogleCallbackPage
            onSuccess={handleAuthSuccess}
            onCompleteProfileRequired={handleCompleteProfileRequired}
            onCancel={() => setView('landing')}
          />
        ) : view === 'dashboard' && currentUser ? (
          <MerchantDashboardLayout 
            key="dashboard-block"
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onUpdateUser={handleUpdateUser}
          />
        ) : view === 'auth_screen' ? (
          <motion.div
            key="auth-portal-block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 self-stretch min-h-[100dvh]"
            id="auth-routing-frame"
          >
            <AuthPortal 
              initialMode={initialAuthMode}
              prefilledEmail={prefilledEmail}
              onSuccess={handleAuthSuccess}
              onCancel={() => setView('landing')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="landing-page-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <LandingPage
              onLaunchPortal={handleLaunchPortal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
