import * as React from 'react';
import { getApiUrl } from '../../services/api';
import {
  Facebook,
  Instagram,
  MessageCircle,
  MapPin,
  Sparkles,
  Check,
  AlertCircle,
  Trash2,
  Link2,
  Unlink,
  Info,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiService } from '../../services/api';



export interface SocialConnection {
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'google';
  connected: boolean;
  name?: string;
  accountId?: string;
  connectedAt?: string;
  lastSynced?: string;
  avatar?: string;
  configRequired?: string;
}

export const ConnectedAccounts: React.FC = () => {
  const [connections, setConnections] = React.useState<SocialConnection[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [activeTab, setActiveTab] = React.useState<'links' | 'developer' | 'diagnostics'>('links');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [alert, setAlert] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Facebook OAuth Diagnostic Telemetry State
  const [diagData, setDiagData] = React.useState<any>(null);
  const [diagLoading, setDiagLoading] = React.useState<boolean>(false);
  const [diagError, setDiagError] = React.useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setDiagLoading(true);
    setDiagError(null);
    try {
      const res = await fetch(getApiUrl('/api/social/debug-status'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status} Unauthorized`);
      }
      const data = await res.json();
      setDiagData(data.audit || null);
    } catch (err: any) {
      setDiagError(err.message || 'Failed to load diagnostic metrics');
    } finally {
      setDiagLoading(false);
    }
  };

  // Developer custom credential fields (encrypted on backend)
  const [devConfig, setDevConfig] = React.useState({
    facebookPageId: '',
    facebookAccessToken: '',
    instagramBusinessId: '',
    whatsappPhoneId: '',
    whatsappAccessToken: '',
    googleLocationId: '',
    googleAccessToken: ''
  });

  // Popup tracking ref for window message event cleanup
  const activePopupRef = React.useRef<{ window: Window | null; timer: any }>({ window: null, timer: null });

  const isAllowedOrigin = (origin: string) => {
    if (!origin) return false;
    if (origin === window.location.origin) return true;
    try {
      const originHost = new URL(origin).hostname;
      return (
        originHost === window.location.hostname ||
        originHost === 'localhost' ||
        originHost === '127.0.0.1' ||
        originHost.endsWith('.onrender.com') ||
        originHost.endsWith('.vercel.app')
      );
    } catch (e) {
      return false;
    }
  };

  const fetchConnections = async (isRetry = false) => {
    console.log(`[LOADING DEBUG] fetchConnections(isRetry=${isRetry}) called — setting loading=true`);
    setLoading(true);
    try {
      const data = await apiService.getSocialConnections();
      console.log('[LOADING DEBUG] fetchConnections: getSocialConnections() resolved, setting connections');
      if (data && Array.isArray(data.connections)) {
        setConnections(data.connections);
        if (data.credentials) {
          setDevConfig(prev => ({
            ...prev,
            ...data.credentials
          }));
        }
      } else {
        setConnections([
          { platform: 'facebook', connected: false },
          { platform: 'instagram', connected: false },
          { platform: 'whatsapp', connected: false },
          { platform: 'google', connected: false }
        ]);
      }
    } catch (err: any) {
      const httpStatus = (err as any)?.response?.status ?? 'NO_RESPONSE';
      console.error(`[LOADING DEBUG] fetchConnections(isRetry=${isRetry}) FAILED — HTTP ${httpStatus}:`, err?.message);
      if (!isRetry) {
        console.log("[COLD START RETRY] Retrying connections fetch in 2s for backend wakeup...");
        setTimeout(() => fetchConnections(true), 2000);
        return;
      }
      showAlert('error', 'Unable to connect to backend server. Render service may be waking up from sleep mode.');
      setConnections([
        { platform: 'facebook', connected: false },
        { platform: 'instagram', connected: false },
        { platform: 'whatsapp', connected: false },
        { platform: 'google', connected: false }
      ]);
    } finally {
      console.log(`[LOADING DEBUG] fetchConnections(isRetry=${isRetry}) finally — setting loading=false`);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchConnections();

    // Handler for postMessage events emitted by OAuth callback popup
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (!isAllowedOrigin(event.origin)) {
        return;
      }

      const { type, platform, error } = event.data || {};

      if (type === 'OAUTH_AUTH_SUCCESS') {
        console.log('[OAUTH DEBUG] Step A: OAUTH_AUTH_SUCCESS message received from origin:', event.origin, '| platform:', platform);

        // Clear interval FIRST so the popup-closed polling cannot double-fire
        if (activePopupRef.current.timer) {
          clearInterval(activePopupRef.current.timer);
          activePopupRef.current.timer = null;
          console.log('[OAUTH DEBUG] Step B: Popup polling interval cleared by message handler');
        }
        if (activePopupRef.current.window && !activePopupRef.current.window.closed) {
          activePopupRef.current.window.close();
          activePopupRef.current.window = null;
        }

        setActionLoading(null);
        console.log('[OAUTH DEBUG] Step C: setActionLoading(null) called');

        // Refresh real social connections from backend — use simple call, no setLoading
        console.log('[OAUTH DEBUG] Step D: Calling apiService.getSocialConnections(). Current loading state will NOT be touched.');
        try {
          const freshData = await apiService.getSocialConnections();
          console.log('[OAUTH DEBUG] Step E: getSocialConnections() resolved:', JSON.stringify(freshData)?.slice(0, 200));
          if (freshData && Array.isArray(freshData.connections)) {
            setConnections(freshData.connections);
            console.log('[OAUTH DEBUG] Step F: setConnections() called with', freshData.connections.length, 'entries');
          } else {
            console.warn('[OAUTH DEBUG] Step E-WARN: freshData.connections is not an array:', freshData);
          }
        } catch (e: any) {
          const httpStatus = (e as any)?.response?.status ?? 'NO_RESPONSE';
          console.error(`[OAUTH DEBUG] Step E-FAIL: getSocialConnections() threw HTTP ${httpStatus}:`, e?.message);
          // IMPORTANT: Do NOT call fetchConnections() here — it sets loading=true and enters a
          // retry cycle which causes the spinner to re-appear after OAuth completion.
          // The backend already saved the connection during the OAuth callback.
          // Instead, schedule a single silent retry after 3 seconds without touching loading state.
          console.log('[OAUTH DEBUG] Step E-RETRY: Scheduling silent retry in 3s without loading spinner...');
          setTimeout(async () => {
            try {
              const retryData = await apiService.getSocialConnections();
              console.log('[OAUTH DEBUG] Step E-RETRY-OK: Silent retry resolved:', retryData?.connections?.length, 'connections');
              if (retryData && Array.isArray(retryData.connections)) {
                setConnections(retryData.connections);
              }
            } catch (retryErr: any) {
              console.error('[OAUTH DEBUG] Step E-RETRY-FAIL: Silent retry also failed:', retryErr?.message);
              // Give up silently — backend connection was already saved; user can refresh manually
            }
          }, 3000);
        }

        const platformName = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Social';
        showAlert('success', `${platformName} account connected successfully!`);
      } else if (type === 'OAUTH_AUTH_CANCEL') {
        if (activePopupRef.current.timer) {
          clearInterval(activePopupRef.current.timer);
          activePopupRef.current.timer = null;
        }
        if (activePopupRef.current.window && !activePopupRef.current.window.closed) {
          activePopupRef.current.window.close();
          activePopupRef.current.window = null;
        }
        setActionLoading(null);
        showAlert('error', 'OAuth authorization was cancelled.');
      } else if (type === 'OAUTH_AUTH_FAILURE') {
        if (activePopupRef.current.timer) {
          clearInterval(activePopupRef.current.timer);
          activePopupRef.current.timer = null;
        }
        if (activePopupRef.current.window && !activePopupRef.current.window.closed) {
          activePopupRef.current.window.close();
          activePopupRef.current.window = null;
        }
        setActionLoading(null);
        showAlert('error', error || 'OAuth authorization failed.');
      }
    };

    window.addEventListener('message', handleOAuthMessage);

    // Expose global checkLoginState for Meta login button callbacks
    (window as any).checkLoginState = () => {
      if (typeof window !== 'undefined' && (window as any).FB) {
        (window as any).FB.getLoginStatus((response: any) => {
          if (response && response.status === 'connected' && response.authResponse?.accessToken) {
            fetch(getApiUrl('/api/social/connect-direct'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
              },
              body: JSON.stringify({
                facebookAccessToken: response.authResponse.accessToken
              })
            })
              .then(res => res.json())
              .then(() => {
                showAlert('success', 'Facebook account paired successfully!');
                fetchConnections();
              });
          }
        });
      }
    };

    // Auto-check existing Facebook login status via JS SDK
    if (typeof window !== 'undefined' && (window as any).FB) {
      try {
        (window as any).FB.getLoginStatus((response: any) => {
          if (response && response.status === 'connected' && response.authResponse?.accessToken) {
            fetch(getApiUrl('/api/social/connect-direct'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
              },
              body: JSON.stringify({
                facebookAccessToken: response.authResponse.accessToken
              })
            }).then(() => fetchConnections());
          }
        });
      } catch (err) {
        console.warn('FB.getLoginStatus check skipped:', err);
      }
    }

    return () => {
      window.removeEventListener('message', handleOAuthMessage);
      if (activePopupRef.current.timer) {
        clearInterval(activePopupRef.current.timer);
      }
    };
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Standard Popup-Based OAuth Flow
  const handleOAuthConnect = async (platform: string) => {
    setActionLoading(platform);

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup synchronously immediately on click to prevent browser popup blockers
    const popup = window.open('about:blank', `Connect ${platform}`, `width=${width},height=${height},left=${left},top=${top}`);

    try {
      // 1. Fetch OAuth URL from server
      const res = await fetch(getApiUrl(`/api/social/oauth-url?platform=${platform}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        }
      });
      if (!res.ok) {
        if (popup) popup.close();
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Could not fetch OAuth URL');
      }
      const { url, isSandbox } = await res.json();

      const targetUrl = isSandbox ? `/auth/social-sandbox?platform=${platform}` : url;

      if (targetUrl) {
        if (popup) popup.location.href = targetUrl;

        if (activePopupRef.current.timer) {
          clearInterval(activePopupRef.current.timer);
        }
        activePopupRef.current.window = popup;

        const checkTimer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkTimer);
            // Only take action if OAUTH_AUTH_SUCCESS message handler has NOT already
            // cleared the timer. If it was already cleared, the message handler already
            // handled state refresh — do not double-fire fetchConnections().
            if (activePopupRef.current.timer === checkTimer) {
              console.log('[OAUTH DEBUG] Popup closed detected by interval (no message handler fired yet)');
              activePopupRef.current.timer = null;
              activePopupRef.current.window = null;
              setActionLoading(null);
              fetchConnections();
            } else {
              console.log('[OAUTH DEBUG] Popup closed detected by interval, but message handler already handled it — skipping duplicate refresh');
            }
          }
        }, 1000);

        activePopupRef.current.timer = checkTimer;
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to initiate social connection.');
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!window.confirm(`Are you sure you want to disconnect your ${platform} integration?`)) return;
    setActionLoading(platform);
    try {
      const res = await fetch(getApiUrl('/api/social/disconnect'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        },
        body: JSON.stringify({ platform })
      });
      if (res.ok) {
        showAlert('success', `Successfully disconnected ${platform} account.`);
        fetchConnections();
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (err: any) {
      showAlert('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshToken = async (platform: string) => {
    setActionLoading(platform);
    try {
      const res = await fetch(getApiUrl('/api/social/refresh-token'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        },
        body: JSON.stringify({ platform })
      });
      if (res.ok) {
        const data = await res.json();
        showAlert('success', data.message || `Successfully refreshed ${platform} access token.`);
        fetchConnections();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to refresh token');
      }
    } catch (err: any) {
      showAlert('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveDeveloperKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('save-keys');
    try {
      const res = await fetch(getApiUrl('/api/social/connect-direct'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        },
        body: JSON.stringify(devConfig)
      });
      if (res.ok) {
        showAlert('success', 'Production developer credentials stored securely (AES-256 encrypted).');
        fetchConnections();
      } else {
        throw new Error('Failed to save credentials');
      }
    } catch (err: any) {
      showAlert('error', err.message);
    } finally {
      setActionLoading('save-keys');
      setTimeout(() => setActionLoading(null), 1000);
    }
  };

  const getPlatformDetails = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return {
          title: 'Facebook Pages',
          icon: Facebook,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          desc: 'Publish interactive flyer updates, local festival campaign offers, and boost geographic post engagement.'
        };
      case 'instagram':
        return {
          title: 'Instagram Business',
          icon: Instagram,
          color: 'text-pink-600',
          bg: 'bg-pink-50',
          border: 'border-pink-100',
          desc: 'Share high-contrast visual posters, local store carousels, and stories to nearby demographics.'
        };
      case 'whatsapp':
        return {
          title: 'WhatsApp Business',
          icon: MessageCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          desc: 'Broadcast direct messaging templates, customer order alerts, and local marketing plans with map links.'
        };
      case 'google':
        return {
          title: 'Google Business Profile',
          icon: MapPin,
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          desc: 'Publish local Google Search updates, discount events, and sync directions directly to your physical store location.'
        };
      default:
        return {
          title: 'Unknown',
          icon: Link2,
          color: 'text-slate-500',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          desc: ''
        };
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="connected-accounts-suite">

      {/* Page Title Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-indigo-600" />
          <span>Connected Channels & Security Suite</span>
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Securely link your official social handles and retail profiles using secure OAuth 2.0. Credentials are encrypted on our servers using enterprise AES-256 keys.
        </p>
      </div>

      {/* Alert Feedbacks */}
      {alert && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-fade-in ${alert.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          id="social-accounts-alert-banner"
        >
          {alert.type === 'success' ? <Check className="h-4.5 w-4.5" /> : <AlertCircle className="h-4.5 w-4.5" />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Segment TabsSwitcher */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit gap-1">
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'links'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <Link2 className="h-3.5 w-3.5 inline mr-1 text-indigo-600" /> Connected Accounts ({connections.filter(c => c.connected).length})
        </button>
        <button
          onClick={() => setActiveTab('developer')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'developer'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <Sliders className="h-3.5 w-3.5 inline mr-1 text-emerald-600" /> Production Developer Keys
        </button>
        <button
          onClick={() => {
            setActiveTab('diagnostics');
            fetchDiagnostics();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'diagnostics'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <Sparkles className="h-3.5 w-3.5 inline mr-1 text-purple-600" /> Facebook OAuth Diagnostics
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3" key="loader">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
            <strong className="text-xs text-slate-500">Decrypting key ring and loading credentials...</strong>
          </div>
        ) : activeTab === 'links' ? (
          <motion.div
            key="links-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {connections.map((conn) => {
              const details = getPlatformDetails(conn.platform);
              const PlatformIcon = details.icon;

              return (
                <div
                  key={conn.platform}
                  className={`bg-white border rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden ${conn.connected ? 'border-indigo-150 ring-1 ring-indigo-50' : 'border-slate-100'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        {conn.connected && conn.avatar ? (
                          <div className="relative h-12 w-12 rounded-2xl overflow-hidden border-2 border-indigo-100 ring-2 ring-indigo-50 shadow-xs shrink-0 select-none">
                            <img
                              src={conn.avatar}
                              alt={`${details.title} avatar`}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute bottom-0 right-0 bg-slate-900 p-0.5 rounded-br-xl rounded-tl-md text-white flex items-center justify-center border-t border-l border-white/20">
                              <PlatformIcon className="h-2.5 w-2.5" />
                            </span>
                          </div>
                        ) : (
                          <span className={`h-11 w-11 rounded-2xl ${details.bg} flex items-center justify-center shadow-xs`}>
                            <PlatformIcon className={`h-6 w-6 ${details.color}`} />
                          </span>
                        )}
                        {conn.connected && (
                          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                        )}
                      </div>

                      {conn.connected ? (
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
                          <Check className="h-3 w-3" /> Connected
                        </span>
                      ) : conn.configRequired ? (
                        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full select-none">
                          ⚠️ {conn.configRequired}
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-full select-none">
                          Disconnected
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-950">{details.title}</h3>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">{details.desc}</p>
                    </div>

                    {conn.connected && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[10.5px] font-bold text-slate-700 space-y-1 shadow-inner">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Linked Name:</span>
                          <span className="text-slate-900 truncate max-w-[150px]">{conn.name || 'Connected Page'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Account ID:</span>
                          <span className="text-slate-900 font-mono text-[9px]">{conn.accountId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Sync Date:</span>
                          <span className="text-slate-500">{conn.connectedAt ? new Date(conn.connectedAt).toLocaleDateString() : 'Today'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Last Synced:</span>
                          <span className="text-slate-500 font-mono text-[9px]">{conn.lastSynced ? new Date(conn.lastSynced).toLocaleTimeString() : 'A moment ago'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {conn.connected ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRefreshToken(conn.platform)}
                          disabled={actionLoading === conn.platform}
                          className="flex-1 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-600 border border-indigo-150 font-black text-[11px] py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-xs select-none"
                        >
                          {actionLoading === conn.platform ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5" /> Refresh Token
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDisconnect(conn.platform)}
                          disabled={actionLoading === conn.platform}
                          className="flex-1 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-600 font-extrabold text-[11px] py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 select-none"
                        >
                          {actionLoading === conn.platform ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Unlink className="h-3.5 w-3.5" /> Disconnect
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOAuthConnect(conn.platform)}
                        disabled={actionLoading === conn.platform}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow select-none"
                      >
                        {actionLoading === conn.platform ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Link2 className="h-3.5 w-3.5 text-indigo-400" /> Connect via OAuth 2.0
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : activeTab === 'developer' ? (
          <motion.div
            key="developer-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs max-w-2xl"
          >
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 mb-5">
              <span className="bg-indigo-50 p-2 rounded-xl text-indigo-600 block shrink-0">
                <Settings className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Direct API Credentials configuration</h3>
                <h2 className="text-sm font-black text-slate-850 mt-0.5">Enterprise Key Configuration</h2>
                <p className="text-[11.5px] text-slate-405 text-slate-400 font-semibold leading-normal mt-1">
                  Instead of default sandbox redirects, paste your official Meta Graph tokens, WhatsApp phoneIDs, or Google API client credentials directly below. These values override OAuth handshakes for production deployment.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDeveloperKeys} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Facebook Section */}
                <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                  <strong className="text-[10px] uppercase font-black text-blue-600 tracking-widest block flex items-center gap-1">
                    <Facebook className="h-3.5 w-3.5" /> Facebook Page
                  </strong>
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <label className="text-[9.5px] font-black text-slate-500">Facebook Page ID</label>
                      <input
                        type="text"
                        value={devConfig.facebookPageId}
                        onChange={e => setDevConfig({ ...devConfig, facebookPageId: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="e.g. 1092837465"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9.5px] font-black text-slate-500">Page Access Token</label>
                      <input
                        type="password"
                        value={devConfig.facebookAccessToken}
                        onChange={e => setDevConfig({ ...devConfig, facebookAccessToken: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="EAABW..."
                      />
                    </div>
                  </div>
                </div>

                {/* Instagram Section */}
                <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                  <strong className="text-[10px] uppercase font-black text-pink-600 tracking-widest block flex items-center gap-1">
                    <Instagram className="h-3.5 w-3.5" /> Instagram Business Account
                  </strong>
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <label className="text-[9.5px] font-black text-slate-500">IG Business Account ID</label>
                      <input
                        type="text"
                        value={devConfig.instagramBusinessId}
                        onChange={e => setDevConfig({ ...devConfig, instagramBusinessId: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="e.g. 17841400293847"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 block pt-1.5 leading-tight">Instagram Business accounts are bound to your Facebook Page Access Token configured during OAuth flow.</span>
                  </div>
                </div>

                {/* WhatsApp Section */}
                <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                  <strong className="text-[10px] uppercase font-black text-emerald-600 tracking-widest block flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Cloud API
                  </strong>
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <label className="text-[9.5px] font-black text-slate-500">Phone Number ID</label>
                      <input
                        type="text"
                        value={devConfig.whatsappPhoneId}
                        onChange={e => setDevConfig({ ...devConfig, whatsappPhoneId: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="e.g. 1092837465"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9.5px] font-black text-slate-500">System User Access Token</label>
                      <input
                        type="password"
                        value={devConfig.whatsappAccessToken}
                        onChange={e => setDevConfig({ ...devConfig, whatsappAccessToken: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="EAABW..."
                      />
                    </div>
                  </div>
                </div>

                {/* Google My Business Section */}
                <div className="space-y-3.5 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                  <strong className="text-[10px] uppercase font-black text-rose-600 tracking-widest block flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Google My Business Profile
                  </strong>
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <label className="text-[9.5px] font-black text-slate-500">Google Location ID</label>
                      <input
                        type="text"
                        value={devConfig.googleLocationId}
                        onChange={e => setDevConfig({ ...devConfig, googleLocationId: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="accounts/123/locations/456"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9.5px] font-black text-slate-500">OAuth Access / Refresh Token</label>
                      <input
                        type="password"
                        value={devConfig.googleAccessToken}
                        onChange={e => setDevConfig({ ...devConfig, googleAccessToken: e.target.value })}
                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                        placeholder="ya29.a0AfH..."
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Encrypted via AES-256</span>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading === 'save-keys'}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs px-5 py-3 rounded-2xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  {actionLoading === 'save-keys' ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Save Production Credentials
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        ) : activeTab === 'diagnostics' ? (
          <motion.div
            key="diagnostics-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span>Facebook OAuth Diagnostics</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Real-time Graph API audit telemetry for your active Meta Login session.
                  </p>
                </div>
                <button
                  onClick={fetchDiagnostics}
                  disabled={diagLoading}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${diagLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
                </button>
              </div>

              {diagLoading ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
                  <span className="text-xs text-slate-500 font-bold">Querying Meta Graph API telemetry audit...</span>
                </div>
              ) : diagError ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-bold space-y-1">
                  <strong>⚠️ Diagnostic Query Failed:</strong>
                  <p className="font-medium text-rose-700">{diagError}</p>
                </div>
              ) : !diagData || diagData.status ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 text-xs font-semibold space-y-2">
                  <strong className="font-black text-amber-950 text-sm">ℹ️ No OAuth Audit Attempt Logged Yet</strong>
                  <p>
                    You haven't initiated a Facebook Login attempt in this user session yet, or your backend server was restarted.
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Click <strong>"Connect with Facebook"</strong> in the Connected Accounts tab above, complete Meta authorization, and then click <strong>"Refresh Telemetry"</strong> here to inspect live Graph API responses.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">OAuth Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${(diagData.pageCount || diagData.discoveredPagesCount) > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <strong className="text-sm font-black text-slate-900">
                          {(diagData.pageCount || diagData.discoveredPagesCount) > 0 ? 'Connected' : 'Assets Pending'}
                        </strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Facebook User ID</span>
                      <strong className="text-xs font-black text-slate-900 block truncate">
                        {diagData.facebookUserId || 'N/A'}
                      </strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Token Validity</span>
                      <strong className="text-xs font-black text-slate-900 block">
                        {diagData.tokenValid ? '✅ Valid (Active)' : '❌ Invalid / Expired'}
                      </strong>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Discovered Pages</span>
                      <strong className="text-sm font-black text-indigo-600 block">
                        {diagData.pageCount ?? diagData.discoveredPagesCount ?? 0} Facebook Page(s)
                      </strong>
                    </div>
                  </div>

                  {/* Granted Meta Permissions */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Granted Meta Permissions</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {diagData.grantedPermissions && diagData.grantedPermissions.length > 0 ? (
                        diagData.grantedPermissions.map((perm: string) => (
                          <span key={perm} className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold px-2.5 py-1 rounded-lg">
                            ✓ {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                          ⚠️ No granted permissions logged in token audit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Token Debug & Granular Scopes */}
                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs font-mono space-y-2 overflow-x-auto">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] font-sans border-b border-slate-800 pb-2">
                      <span>META GRAPH API TOKEN TELEMETRY AUDIT</span>
                      <span>App ID: {diagData.tokenAppId || '1684531366178928'}</span>
                    </div>
                    <div><span className="text-indigo-400">User Email:</span> {diagData.email}</div>
                    <div><span className="text-indigo-400">Token Type:</span> {diagData.tokenType || 'USER'}</div>
                    <div><span className="text-indigo-400">Token Scopes:</span> [{(diagData.tokenScopes || []).join(', ')}]</div>
                    {diagData.granularScopes && diagData.granularScopes.length > 0 && (
                      <div>
                        <span className="text-indigo-400">Granular Business Selections:</span>
                        <pre className="text-[10px] text-emerald-300 mt-1 whitespace-pre-wrap">
                          {JSON.stringify(diagData.granularScopes, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Discovered Pages List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Discovered Manageable Assets</h3>
                    {diagData.discoveredPages && diagData.discoveredPages.length > 0 ? (
                      <div className="space-y-2">
                        {diagData.discoveredPages.map((pg: any) => (
                          <div key={pg.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <strong className="text-xs font-black text-slate-900">{pg.name}</strong>
                              <div className="text-[10px] font-medium text-slate-500 flex items-center gap-3">
                                <span>Page ID: <code className="font-mono bg-slate-200 px-1 rounded text-slate-800">{pg.id}</code></span>
                                <span>Page Token: {pg.hasAccessToken ? '✅ Active' : '❌ Missing'}</span>
                                {pg.instagramConnected && (
                                  <span className="text-pink-600 font-bold">📸 Instagram Professional Linked</span>
                                )}
                              </div>
                            </div>
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2.5 py-1 rounded-full">
                              {pg.type || 'Live Page'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-semibold text-rose-800 space-y-1">
                        <strong>⚠️ Zero Facebook Pages Returned by Meta API</strong>
                        <p className="text-[11px] text-rose-700">
                          {diagData.lastErrorMessage || 'No Facebook Pages were returned for this authorized session. Please verify that your Facebook account is an Admin/Editor of the Page and that you selected the Page during the Meta consent dialog.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
};
