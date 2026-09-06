import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  Building, 
  Phone, 
  Percent, 
  ShieldCheck, 
  ArrowRight, 
  CornerDownLeft, 
  Sparkles, 
  AlertCircle, 
  RefreshCw,
  HelpCircle,
  Clock,
  Info
} from 'lucide-react';
import { apiService } from '../../services/api';

interface AuthPortalProps {
  initialMode?: 'signin' | 'signup' | 'complete_profile';
  onSuccess: (user: any, token: string) => void;
  onCancel: () => void;
  prefilledEmail?: string;
}

export function AuthPortal({ initialMode = 'signin', onSuccess, onCancel, prefilledEmail = '' }: AuthPortalProps) {
  const [mode, setMode] = React.useState<'signin' | 'signup' | 'otp' | 'complete_profile' | 'forgot_password' | 'reset_password_otp' | 'reset_password_submit'>(initialMode);
  
  // General form states
  const [email, setEmail] = React.useState(prefilledEmail);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [businessName, setBusinessName] = React.useState('');
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [gstin, setGstin] = React.useState('');
  
  // Verification states
  const [otpCode, setOtpCode] = React.useState('');
  const [devOtp, setDevOtp] = React.useState<string | null>(null);
  
  // Loading & error feedback
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Sync initialMode and prefilledEmail props
  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [initialMode, prefilledEmail]);

  // Synchronize or load the latest OTP in development/emulated mode
  React.useEffect(() => {
    const syncOtp = () => {
      const code = localStorage.getItem("_dev_latest_otp");
      if (code) {
        setDevOtp(code);
      }
    };
    if (mode === 'otp') {
      syncOtp();
    }
    window.addEventListener("dev-otp-received", syncOtp);
    return () => {
      window.removeEventListener("dev-otp-received", syncOtp);
    };
  }, [mode]);

  // Listen for Google OAuth message events
  React.useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      const isAllowedOrigin = 
        origin.includes('onrender.com') || 
        origin.endsWith('.vercel.app') || 
        origin.endsWith('.run.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1');
      
      if (!isAllowedOrigin) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { user, accessToken } = event.data;
        if (accessToken) {
          localStorage.setItem("_hyperlocal_access_token", accessToken);
        }
        if (user && user.registrationCompleted === false) {
          setEmail(user.email);
          setSuccessMessage("Google profile verified! Please complete your registration by choosing a secure password.");
          setErrorMessage(null);
          setMode('complete_profile');
        } else {
          setSuccessMessage("Google authentication successful! Logging you in...");
          setErrorMessage(null);
          setTimeout(() => {
            onSuccess(user, accessToken);
          }, 800);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
        setErrorMessage(event.data.error || "Google authentication was cancelled or failed.");
        setSuccessMessage(null);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
    };
  }, [onSuccess]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await apiService.getGoogleAuthUrl();
      if (res && res.url) {
        const popup = window.open(
          res.url,
          'google_oauth_popup',
          'width=500,height=600,status=no,toolbar=no,menubar=no,location=no'
        );

        if (!popup) {
          setErrorMessage("Popup was blocked by your browser. Please allow popups for this site to complete Google Sign-In.");
        } else {
          setSuccessMessage("Please complete Google authentication in the popup window.");
        }
      } else {
        setErrorMessage("Could not initialize Google authentication. Please try again.");
      }
    } catch (err: any) {
      console.error("Google Sign-In initialization error:", err);
      setErrorMessage("Failed to start Google Sign-In. Please use email/password instead.");
    } finally {
      setLoading(false);
    }
  };

  // Clear messages on transition
  const handleSwitchMode = (targetMode: 'signin' | 'signup' | 'otp') => {
    setMode(targetMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setDevOtp(null);
  };

  // Sign In Submit Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please fill out both email and password fields.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await apiService.login({ email, password });
      if (response && response.success) {
        onSuccess(response.user, response.accessToken);
      }
    } catch (err: any) {
      console.error("Login failure:", err);
      const errData = err.response?.data;
      
      if (errData?.requiresVerification) {
        // Unverified user. Transfer to OTP verification sequence.
        setErrorMessage(null);
        setSuccessMessage(`Welcome back! Your email requires validation. We've initialized a verification sequence.`);
        setMode('otp');
        if (errData?.otp) {
          setDevOtp(errData.otp);
        }
      } else {
        setErrorMessage(errData?.message || err.message || "Invalid credentials. Please attempt sign in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submit Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !ownerName || !businessName) {
      setErrorMessage("Required fields (*标记) are missing. Please complete the details.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      email,
      password,
      businessName,
      ownerName,
      mobileNumber: mobileNumber || undefined,
      gstin: gstin || undefined
    };

    try {
      const response = await apiService.register(payload);
      if (response && response.success) {
        setSuccessMessage(`Verification OTP dispatched to ${email}. Please enter it below to complete registration.`);
        setMode('otp');
        if (response.otp) {
          setDevOtp(response.otp);
        }
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const errData = err.response?.data;
      setErrorMessage(errData?.message || err.message || "Failed to complete signup request.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Submit Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage("Please enter a valid verification code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await apiService.verifyOtp({
        email,
        otp: otpCode,
        actionType: 'register'
      });

      if (response && response.success) {
        setSuccessMessage("Account verified and registered successfully!");
        setTimeout(() => {
          onSuccess(response.user, response.accessToken);
        }, 800);
      }
    } catch (err: any) {
      console.error("OTP validation error:", err);
      const errData = err.response?.data;
      setErrorMessage(errData?.message || err.message || "Incorrect verification code. Please request a new OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const response = await apiService.resendOtp(email);
      if (response && response.success) {
        setSuccessMessage(`A fresh verification OTP has been triggered for ${email}.`);
        if (response.otp) {
          setDevOtp(response.otp);
        }
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      const errData = err.response?.data;
      setErrorMessage(errData?.message || err.message || "Failed to trigger fresh OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Complete Google Registration Profile Handler
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMessage("Please enter and confirm your secure password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiService.completeRegistration({ email, password });
      if (response && response.success) {
        setSuccessMessage("Account fully registered! Redirecting you to the merchant workspace dashboard...");
        setTimeout(() => {
          onSuccess(response.user, response.accessToken);
        }, 800);
      }
    } catch (err: any) {
      console.error("Complete registration failure:", err);
      const errData = err.response?.data;
      setErrorMessage(errData?.message || err.message || "Failed to finalize account password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Form Handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your registered merchant email address.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiService.forgotPassword(email);
      if (response && response.success) {
        setSuccessMessage(response.message || "A secure reset-password OTP has been dispatched to your email address.");
        setMode('reset_password_otp');
        if (response.otp) {
          setDevOtp(response.otp);
        }
      }
    } catch (err: any) {
      console.error("Forgot password failure:", err);
      const errData = err.response?.data;
      setErrorMessage(errData?.message || err.message || "Failed to dispatch reset instructions.");
    } finally {
      setLoading(false);
    }
  };

  // Verify Forgot Password OTP Handler
  const handleVerifyResetOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMessage("Please enter the verification OTP code.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiService.verifyOtp({ email, otp: otpCode, actionType: "RESET" });
      if (response && response.success) {
        setSuccessMessage("Verification successful! Please choose a new secure password below.");
        setMode('reset_password_submit');
      }
    } catch (err: any) {
      console.error("Forgot password OTP verification failure:", err);
      const errData = err.response?.data;
      setErrorMessage(errData?.message || err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Reset Handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMessage("Please enter and confirm your new secure password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await apiService.resetPassword({ email, password });
      if (response && response.success) {
        setSuccessMessage("Success! Your password was successfully reset. You may now login using your new credentials.");
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error("Password reset update failure:", err);
      const errData = err.response?.data;
      setErrorMessage(errData?.message || err.message || "Failed to update security credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]" id="auth-main-card">
      
      {/* Left Branding Sidebar */}
      <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-left" id="auth-branding-sidebar">
        <div className="absolute top-[20%] right-[-10%] w-[200px] h-[200px] bg-indigo-600/15 rounded-full blur-[50px]" />
        
        <div className="relative z-10 space-y-6">
          {/* Logo */}
          <div onClick={onCancel} className="flex items-center gap-2.5 cursor-pointer select-none group" id="brand-logo-back">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5 text-indigo-200" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest text-indigo-400 uppercase leading-none block">Hyperlocal</span>
              <h2 className="text-sm font-extrabold text-white tracking-tight">ADPULSE</h2>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="text-xl font-bold font-sans tracking-tight text-white leading-snug">
              Secure Local Merchant Ecosystem
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Create campaigns targeting custom corridors, generate localized copies using smart interfaces, and drive real incremental foot traffic to your physical storefront.
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Database Secured</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              All credentials and onboarding profiles are persistent. Your draft states save automatically on-the-fly.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 hidden lg:block">
          <p className="text-[10px] text-slate-500 font-bold font-mono">
            SECURE MERCH PORTAL V2.4 // SSL ENCRYPTED
          </p>
        </div>
      </div>

      {/* Right Interactive Form Area */}
      <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white text-left" id="auth-form-content">
        
        {/* Toggle tabs for main signin/signup */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-max mb-8 border border-slate-200/50" id="auth-tab-row">
            <button
              type="button"
              onClick={() => handleSwitchMode('signin')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-sign-in"
            >
              Sign In Account
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('signup')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-sign-up"
            >
              Register Account
            </button>
          </div>
        )}

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-rose-50 border border-rose-100/50 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 font-medium leading-normal"
              id="auth-error-banner"
            >
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100/50 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 font-medium leading-normal"
              id="auth-success-banner"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SIGN IN FORM --- */}
        {mode === 'signin' && (
          <div className="space-y-4" id="form-sign-in-container">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500 font-semibold">Enter your credentials to manage your marketing dashboards.</p>
            </div>

            {/* Google Primary Sign In Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer hover:border-slate-300 disabled:opacity-50"
                id="btn-google-login"
              >
                <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Premium Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or continue with email</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in" id="form-sign-in">
              <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@yourdomain.com"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold shadow-xs"
                    id="input-login-email"
                  />
                </div>
                <p className="text-[10px] text-slate-400 flex items-start gap-1.5 mt-1 leading-normal" id="login-email-otp-spam-reminder">
                  <Info className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                  <span>Didn't receive the OTP? Please check your <strong>spam</strong> or <strong>junk</strong> folders.</span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold shadow-xs"
                    id="input-login-password"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                id="btn-login-submit"
              >
                {loading ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Authenticate Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
                <span>Return to Landing Home</span>
              </button>
            </div>
          </form>
        </div>
        )}

        {/* --- SIGN UP FORM --- */}
        {mode === 'signup' && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1" id="form-sign-up-container">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Get Started Instantly</h2>
              <p className="text-xs text-slate-500 font-semibold">Join the secure network and map your storefront in minutes.</p>
            </div>

            {/* Google Primary Sign Up Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer hover:border-slate-300 disabled:opacity-50"
                id="btn-google-signup"
              >
                <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign Up with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or manual registration</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4" id="form-sign-up">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Owner's Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold"
                    id="input-register-owner"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Registered Entity Name *</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Hyperlocal Organics Ltd"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold"
                    id="input-register-business"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Business Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shop@hyperlocal.co"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold"
                    id="input-register-email"
                  />
                </div>
                <p className="text-[10px] text-slate-400 flex items-start gap-1.5 mt-1 leading-normal" id="register-email-otp-spam-reminder">
                  <Info className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                  <span>If the OTP does not arrive within 30 seconds, please check your spam folder.</span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Contact Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold"
                    id="input-register-phone"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">GSTIN Entity Code (Optional)</label>
                <div className="relative">
                  <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="27AAAAA1111A1Z1"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold uppercase"
                    id="input-register-gstin"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password123!"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold"
                    id="input-register-password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                id="btn-register-submit"
              >
                {loading ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Generate Security OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
                <span>Return to Landing Home</span>
              </button>
            </div>
          </form>
        </div>
        )}

        {/* --- OTP VERIFICATION SEQUENCE --- */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4" id="form-otp-validation">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security Check</h2>
              <p className="text-xs text-slate-500 font-semibold">We have triggered a transaction validation code to <span className="font-bold text-indigo-600">{email}</span>.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">6-Digit Verification PIN</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold font-mono text-center tracking-widest text-slate-700"
                    id="input-verification-otp"
                  />
                </div>
              </div>

              {/* Developer OTP Auto-Display Bypass helper */}
              {devOtp && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-xl space-y-1.5" id="dev-otp-indicator">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>Dev Environment Sandbox OTP Detected</span>
                  </div>
                  <p className="text-[11px] font-medium text-amber-850">
                    Use PIN code <code className="font-bold text-slate-900 bg-amber-200 px-1 py-0.5 rounded leading-none text-xs tracking-wider">{devOtp}</code> to bypass or verify automatically into the database.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtpCode(devOtp)}
                    className="text-[10px] font-black text-amber-800 underline hover:text-amber-950 block text-left"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                id="btn-otp-verify"
              >
                {loading ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Verify PIN Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200"
                id="btn-otp-resend"
              >
                <span>Resend OTP SMS/Email</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
              >
                <CornerDownLeft className="h-3.5 w-3.5" />
                <span>Return to registration profile setup</span>
              </button>
            </div>
          </form>
        )}

        {/* --- COMPLETE GOOGLE REGISTRATION PROFILE SETUP --- */}
        {mode === 'complete_profile' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4 animate-fade-in" id="form-complete-profile">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Secure Your Account</h2>
              <p className="text-xs text-slate-500 font-semibold">Please set a password to finalize registration. Subsequent logins must use this password.</p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set secure password"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold shadow-xs"
                    id="input-complete-password"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm secure password"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold shadow-xs"
                    id="input-complete-confirm-password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                id="btn-complete-submit"
              >
                {loading ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Complete Account Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* --- FORGOT PASSWORD VIEW --- */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-fade-in" id="form-forgot-password">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recover Credentials</h2>
              <p className="text-xs text-slate-500 font-semibold">Provide your registered email address to dispatch an identity verification OTP.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@yourdomain.com"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold shadow-xs"
                    id="input-forgot-email"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                id="btn-forgot-submit"
              >
                {loading ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200 cursor-pointer"
              >
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        )}

        {/* --- RESET PASSWORD OTP VERIFICATION VIEW --- */}
        {mode === 'reset_password_otp' && (
          <form onSubmit={handleVerifyResetOtpSubmit} className="space-y-4 animate-fade-in" id="form-reset-otp">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Identity Verification</h2>
              <p className="text-xs text-slate-500 font-semibold">We have triggered a verification PIN code to <span className="font-bold text-indigo-600">{email}</span>.</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">6-Digit PIN Code</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold font-mono text-center tracking-widest text-slate-700"
                    id="input-reset-otp"
                  />
                </div>
              </div>

              {/* Sandbox Bypass Code display */}
              {devOtp && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-xl space-y-1.5" id="dev-otp-indicator">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>Dev Environment Sandbox OTP Detected</span>
                  </div>
                  <p className="text-[11px] font-medium text-amber-850">
                    Use PIN code <code className="font-bold text-slate-900 bg-amber-200 px-1 py-0.5 rounded leading-none text-xs tracking-wider">{devOtp}</code> to verify immediately.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOtpCode(devOtp)}
                    className="text-[10px] font-black text-amber-800 underline hover:text-amber-950 block text-left"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                id="btn-verify-reset-otp"
              >
                {loading ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200 cursor-pointer"
              >
                <span>Back</span>
              </button>
            </div>
          </form>
        )}

        {/* --- CREATE NEW PASSWORD VIEW --- */}
        {mode === 'reset_password_submit' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fade-in" id="form-reset-submit">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Password</h2>
              <p className="text-xs text-slate-500 font-semibold">Choose a secure, easy to remember password for future credentials access.</p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold shadow-xs"
                    id="input-new-password"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold shadow-xs"
                    id="input-confirm-new-password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                id="btn-submit-reset"
              >
                {loading ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Update Password & Log In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        
      </div>

    </div>
  );
}
