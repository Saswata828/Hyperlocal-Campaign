import * as React from 'react';
import { Loader2, CheckCircle2, User, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

interface GoogleMockChooserPageProps {
  onSuccess: (user: any, token: string) => void;
}

export function GoogleMockChooserPage({ onSuccess }: GoogleMockChooserPageProps) {
  const [loadingEmail, setLoadingEmail] = React.useState<string | null>(null);
  const [customEmail, setCustomEmail] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  const accounts = [
    {
      name: 'Saswata Mishra',
      email: 'saswatamishra828@gmail.com',
      avatarColor: 'bg-emerald-600',
      initials: 'SM',
      tag: 'Primary Merchant'
    },
    {
      name: 'Jane Doe',
      email: 'merchant@hyperlocal.ai',
      avatarColor: 'bg-indigo-600',
      initials: 'JD',
      tag: 'Demo Merchant'
    }
  ];

  const handleSelectAccount = async (targetEmail: string) => {
    setLoadingEmail(targetEmail);
    try {
      // Authenticate via login with owner auto-recovery
      const res = await apiService.login({
        email: targetEmail,
        password: 'password'
      });

      if (res && res.success) {
        const payload = {
          type: 'OAUTH_AUTH_SUCCESS',
          user: res.user,
          accessToken: res.accessToken
        };

        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, '*');
          window.close();
        } else {
          onSuccess(res.user, res.accessToken);
        }
      } else {
        // Fallback demo login
        const demoRes = await apiService.demoLogin();
        if (demoRes && demoRes.success) {
          const payload = {
            type: 'OAUTH_AUTH_SUCCESS',
            user: { ...demoRes.user, email: targetEmail },
            accessToken: demoRes.accessToken
          };
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(payload, '*');
            window.close();
          } else {
            onSuccess(payload.user, payload.accessToken);
          }
        }
      }
    } catch (err) {
      console.error('Mock Google sign in failed:', err);
      // Even on error, issue fallback token for demonstration
      const fallbackToken = 'mock-google-token-' + Date.now();
      const fallbackUser = {
        id: 2,
        name: targetEmail.split('@')[0],
        email: targetEmail,
        businessName: 'AdPulse Dev Labs',
        role: 'MERCHANT',
        onboarded: true,
        onboardingStep: 'completed'
      };
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'OAUTH_AUTH_SUCCESS',
          user: fallbackUser,
          accessToken: fallbackToken
        }, '*');
        window.close();
      } else {
        onSuccess(fallbackUser, fallbackToken);
      }
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEmail.trim()) {
      handleSelectAccount(customEmail.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center p-4 font-sans text-slate-900" id="google-mock-chooser-page">
      <div className="bg-white w-full max-w-[440px] rounded-[28px] p-8 sm:p-10 shadow-lg border border-slate-200/60 flex flex-col items-center">
        {/* Google G Logo */}
        <div className="mb-5 flex justify-center">
          <svg className="h-8 w-8" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        </div>

        <h1 className="text-[22px] font-normal text-slate-800 text-center tracking-tight mb-1">
          Choose an account
        </h1>
        <p className="text-xs text-slate-500 text-center mb-6">
          to continue to <span className="font-semibold text-indigo-600">Hyperlocal Ad Pulse</span>
        </p>

        {/* Account Selection List */}
        <div className="w-full rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 mb-5 bg-white shadow-2xs">
          {accounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={loadingEmail !== null}
              onClick={() => handleSelectAccount(acc.email)}
              className="w-full px-4 py-3.5 text-left hover:bg-slate-50/80 active:bg-slate-100 flex items-center justify-between transition-colors cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-9 w-9 rounded-full ${acc.avatarColor} text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                  {acc.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {acc.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {acc.email}
                  </div>
                </div>
              </div>
              {loadingEmail === acc.email ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
              ) : (
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 px-2 py-0.5 rounded-full shrink-0 transition-colors">
                  {acc.tag}
                </span>
              )}
            </button>
          ))}

          {/* Use Another Account Action */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 transition-colors cursor-pointer text-xs font-medium text-slate-700"
            >
              <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <span>Use another Google account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3 bg-slate-50/70 space-y-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customEmail.trim() || loadingEmail !== null}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg shadow-xs"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed max-w-[340px]">
          To continue, Google will share your name, email address, and profile picture with Hyperlocal Campaign Platform.
        </p>
      </div>
    </div>
  );
}
