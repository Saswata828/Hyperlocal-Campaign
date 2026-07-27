import * as React from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface GoogleCallbackPageProps {
  onSuccess: (user: any, token: string) => void;
  onCompleteProfileRequired: (email: string, token: string) => void;
  onCancel: () => void;
}

export function GoogleCallbackPage({ onSuccess, onCompleteProfileRequired, onCancel }: GoogleCallbackPageProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState('Verifying Google authorization code...');

  React.useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const err = params.get('error') || params.get('error_description');

      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      if (!code) {
        setError('No authorization code received from Google. Please try logging in again.');
        setLoading(false);
        return;
      }

      try {
        setStatus('Exchanging authentication token with secure backend...');
        const response = await apiService.exchangeGoogleCode(code);
        
        if (response && response.success) {
          setStatus('Authentication successful! Finalizing your session...');
          
          const user = response.user;
          const token = response.accessToken;

          setTimeout(() => {
            window.history.replaceState({}, document.title, '/dashboard');
            if (user && user.registrationCompleted === false) {
              onCompleteProfileRequired(user.email, token);
            } else {
              onSuccess(user, token);
            }
          }, 1000);
        } else {
          setError(response?.message || 'Token exchange failed. Secure backend rejected the code.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        setError(err.message || 'Unable to establish connection with secure authentication server.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [onSuccess, onCompleteProfileRequired]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500/10" id="google-callback-root">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6" id="google-callback-card">
        {/* Brand / Logo */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4" id="loading-state">
            <div className="flex justify-center">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight animate-pulse">Authenticating with Google</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                {status}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4" id="error-state">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Authentication Failed</h2>
              <p className="text-xs text-rose-600 font-semibold leading-relaxed p-3 bg-rose-50/50 rounded-2xl max-w-sm mx-auto">
                {error}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  window.history.replaceState({}, document.title, '/');
                  onCancel();
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Return to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4" id="success-state">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Access Granted</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                {status}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
