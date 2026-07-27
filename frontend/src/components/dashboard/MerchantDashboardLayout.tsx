import * as React from 'react';
import { 
  Target, 
  Sparkles, 
  Store, 
  Bookmark, 
  BarChart4, 
  Send, 
  Settings as SettingsIcon, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Search, 
  ChevronDown, 
  Calendar, 
  Flame, 
  ShoppingBag,
  BellRing,
  Menu,
  X,
  UserCheck,
  Navigation,
  MapPin,
  TrendingUp,
  Zap,
  Activity,
  ArrowRight,
  RotateCw,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardService, DashboardNotification, Campaign } from '../../services/dashboardService';
import { DashboardHome } from './DashboardHome';
import { AiCampaignGenerator } from './AiCampaignGenerator';
import { StoreManagement } from './StoreManagement';
import { ProductManagement } from './ProductManagement';
import { CampaignManagement } from './CampaignManagement';
import { FestivalAnalytics } from './FestivalAnalytics';
import { SocialPublishing } from './SocialPublishing';
import { AnalyticsReports } from './AnalyticsReports';
import { SettingsPage } from './SettingsPage';
import { HelpSupport } from './HelpSupport';
import { OnboardingWizard } from './OnboardingWizard';
import { ConnectedAccounts } from './ConnectedAccounts';
import { PublishHistory } from './PublishHistory';
import { apiService } from '../../services/api';

interface LayoutProps {
  currentUser: any;
  onLogout: () => void;
  onUpdateUser?: (updatedUser: any) => void;
}

export const MerchantDashboardLayout: React.FC<LayoutProps> = ({ currentUser, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');
  const [notifications, setNotifications] = React.useState<DashboardNotification[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isOnboardingNeeded, setIsOnboardingNeeded] = React.useState<boolean>(() => {
    if (currentUser?.onboarded === true || currentUser?.onboardingCompleted === true || currentUser?.onboardingStep === 'completed') {
      return false;
    }
    return localStorage.getItem('_onboarding_completed') !== 'true';
  });

  // Autofill states for campaign cross-routing
  const [generatorPreFill, setGeneratorPreFill] = React.useState<{
    name: string;
    offer: string;
    audience: string;
  } | null>(null);

  // Geolocation & Hyperlocal trends state
  const [geoLoading, setGeoLoading] = React.useState(false);
  const [geoError, setGeoError] = React.useState<string | null>(null);
  const [nearbyTrends, setNearbyTrends] = React.useState<any>(null);
  const [isRadarExpanded, setIsRadarExpanded] = React.useState(true);
  const [userStoresList, setUserStoresList] = React.useState<any[]>([]);

  const fetchTrendsForCoords = async (lat: number, lng: number) => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const data = await apiService.getNearbyTrends(lat, lng);
      if (data && data.success) {
        setNearbyTrends(data);
      } else {
        setGeoError("Failed to fetch trends for these coordinates.");
      }
    } catch (err: any) {
      console.error("Error fetching nearby trends:", err);
      setGeoError(err.message || "Unable to retrieve hyperlocal trend analysis from the server.");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchTrendsForCoords(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation access notice/blocked:", error.message || error);
        let errorMsg = "Please grant location access to enable hyperlocal trends.";
        if (error.code === 1) { // PERMISSION_DENIED
          errorMsg = "Location permission denied. Try our high-fidelity location simulation presets!";
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          errorMsg = "Location information is unavailable.";
        } else if (error.code === 3) { // TIMEOUT
          errorMsg = "Location request timed out.";
        }
        setGeoError(errorMsg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const fetchNotifs = () => {
    setNotifications(dashboardService.getNotifications());
  };

  React.useEffect(() => {
    fetchNotifs();

    // Check actual backend completed state to allow existing members to automatically bypass step-by-step wizard
    apiService.getOnboardingStatus()
      .then((res: any) => {
        if (res && res.success) {
          if (res.completed) {
            setIsOnboardingNeeded(false);
            localStorage.setItem('_onboarding_completed', 'true');
          } else {
            // Uncompleted onboarding from DB state leads to gating only if there is no local complete override
            if (localStorage.getItem('_onboarding_completed') !== 'true') {
              setIsOnboardingNeeded(true);
            }
          }
        }
      })
      .catch((err: any) => {
        console.warn("[DashboardLayout] Could not check onboarding completeness status:", err);
      });

    // Fetch stores to provide intelligent simulated GPS fallbacks
    apiService.getStores()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setUserStoresList(res);
        } else if (res && Array.isArray(res.stores)) {
          setUserStoresList(res.stores);
        }
      })
      .catch((err: any) => {
        console.warn("[DashboardLayout] Could not retrieve user stores for GPS fallback:", err);
      });
  }, [currentUser]);

  const handleMarkAllRead = () => {
    dashboardService.markAllAsRead();
    fetchNotifs();
  };

  const handleAutofillCampaign = (name: string, offer: string, audience: string) => {
    setGeneratorPreFill({ name, offer, audience });
    setActiveTab('generator');
  };

  const handleViewTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Sidebar item list config
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart4 },
    { id: 'generator', label: 'AI Campaign Generator', icon: Sparkles, badge: 'AI' },
    { id: 'management', label: 'Campaign Management', icon: Target },
    { id: 'stores', label: 'Store Management', icon: Store },
    { id: 'products', label: 'Product Management', icon: ShoppingBag },
    { id: 'festivals', label: 'Festival Analytics', icon: Flame, badge: 'New' },
    { id: 'publishing', label: 'Social Media Publishing', icon: Send },
    { id: 'connections', label: 'Connected Accounts', icon: ShieldCheck, badge: 'OAuth' },
    { id: 'history', label: 'Publish History', icon: Clock },
    { id: 'analytics', label: 'Analytics & Reports', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isOnboardingNeeded) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-0 sm:p-4 md:p-6" id="gated-onboarding-wrapper">
        <OnboardingWizard 
          currentUser={currentUser} 
          onOnboardingComplete={() => {
            setIsOnboardingNeeded(false);
            fetchNotifs();
          }} 
          onLogout={onLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex text-slate-800 font-sans" id="merchant-dashboard-core-viewport">
      
      {/* 1. LEFT SIDEBAR: Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 p-5 shrink-0 justify-between select-none">
        <div className="space-y-6">
          
          {/* Platform brand logo card */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight leading-none">AdPulse AI</h2>
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest block mt-1">Hyperlocal SaaS</span>
            </div>
          </div>

          {/* Sidebar Menu Item list */}
          <nav className="space-y-1 select-none">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-805'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4.5 w-4.5" />
                    <span
                      style={item.id === 'connections' ? { textAlign: 'justify', whiteSpace: 'nowrap' } : undefined}
                      className={item.id === 'connections' ? 'whitespace-nowrap' : ''}
                    >
                      {item.label}
                    </span>
                  </span>
                  {item.badge && (
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${isActive ? 'bg-white text-indigo-700' : 'bg-slate-800 text-indigo-400'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Logout triggers */}
        <div className="pt-4 border-t border-slate-800 select-none">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-450 hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
            id="btn-sidebar-logout"
          >
            <LogOut className="h-4.5 w-4.5 text-rose-500" />
            <span>Sign Out Session</span>
          </button>
        </div>

      </aside>

      {/* 2. MOBILE TOP SIDEBAR NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] lg:hidden select-none">
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-64 max-w-xs h-full bg-slate-900 text-slate-300 p-5 flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                {/* Brand close row */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 h-8 w-8 rounded-lg flex items-center justify-center text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-black text-white">AdPulse Portal</span>
                  </div>

                  <button 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile sidebar navs list */}
                <nav className="space-y-1">
                  {sidebarItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleViewTab(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold ${
                          isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </nav>

              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-950/20 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>

            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN WORKSPACE VIEWPORT LAYER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP COMPONENT NAVBAR CONTAINER */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between select-none shrink-0 relative z-[100]">
          
          {/* Search bar + Mobile hamburger toggle */}
          <div className="flex items-center gap-4 flex-grow max-w-md">
            
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            {/* Simulated Desktop Search */}
            <div className="hidden sm:flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 w-full bg-slate-50 border border-slate-105 rounded-xl text-slate-450 text-xs font-semibold relative">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Lookup campaign status, coordinates, invoices..."
                className="bg-transparent border-none outline-none text-xs text-slate-750 font-semibold w-full placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right profile links notifications elements */}
          <div className="flex items-center gap-3.5">
            
            {/* Notification alert bells widget with floating tags */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifDropdownOpen(!isNotifDropdownOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className={`p-2.5 rounded-full hover:bg-slate-50 border transition-all cursor-pointer relative ${
                  unreadCount > 0 ? 'bg-indigo-50/50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-150 text-slate-500'
                }`}
                id="btn-top-navbar-notifications"
              >
                <Bell className="h-4 w-4 animate-swing" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN NOTIFS FEED BOX */}
              <AnimatePresence>
                {isNotifDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-150 rounded-3xl p-4 shadow-2xl z-50 text-left">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                      <div>
                        <h4 className="text-[11.5px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
                          <BellRing className="h-3.5 w-3.5 text-indigo-600" /> Notifications Feed
                        </h4>
                        <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">{unreadCount} unread messages</span>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[9.5px] text-indigo-600 hover:underline font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 max-h-[240px] overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-2.5 rounded-xl border ${notif.read ? 'bg-white border-slate-50 text-slate-600' : 'bg-indigo-50/20 border-indigo-100 text-slate-800'} text-[11px]`}>
                          <div className="flex items-center justify-between">
                            <strong className="font-extrabold truncate w-[75%] block">{notif.title}</strong>
                            <span className="text-[8px] text-slate-400 font-bold font-mono whitespace-nowrap">{notif.timestamp}</span>
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-55 mt-1 font-medium">{notif.message}</p>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                          No alerts recorded today.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar User Dropdowns */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1 px-2.5 rounded-full border border-slate-150 hover:bg-slate-50 transition-all cursor-pointer"
                id="btn-top-navbar-profile"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                  {currentUser.ownerName ? currentUser.ownerName.charAt(0) : 'M'}
                </div>
                <div className="text-left hidden sm:block">
                  <h5 className="text-[10px] font-extrabold text-slate-800 leading-tight">
                    {currentUser.ownerName || 'Pooja Sen'}
                  </h5>
                  <span className="text-[9px] text-indigo-600 font-bold leading-tight block">Partner Admin</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>

              {/* PROFILE DROPDOWN MENU */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-150 rounded-2xl p-2 shadow-2xl z-50 text-left select-none">
                    <div className="px-3.5 py-2 border-b border-slate-50 text-slate-800">
                      <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider block">Connected Enterprise</span>
                      <strong className="text-xs font-bold leading-tight truncate block mt-0.5" title={currentUser.businessName}>
                        {currentUser.businessName}
                      </strong>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4 text-indigo-500" /> Check Settings
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Sign out Session
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </header>

        {/* WORKSPACE MIDDLE BODY SCROLL VESSEL */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: 3, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -3, opacity: 0 }}
              className="w-full"
            >
              
              {activeTab === 'dashboard' && (
                <DashboardHome onViewTab={handleViewTab} />
              )}
              
              {activeTab === 'generator' && (
                <div className="space-y-6">
                  {/* Consistent Tab Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="text-left">
                      <h3 className="text-base font-bold text-slate-800">AI Campaign Copilot & Generator</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Design and broadcast high-impact localized social media advertisements using geoculturally calibrated AI models</p>
                    </div>
                  </div>

                  {/* Hyperlocal Trends Radar Widget */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm select-none" id="hyperlocal-trends-radar-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-4 gap-3">
                      <div className="flex items-start gap-3 text-left">
                        <div className="relative shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Navigation className={`h-5.5 w-5.5 ${geoLoading ? 'animate-spin' : ''}`} />
                          </div>
                          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 flex-wrap">
                            <span>Hyperlocal Trends Radar</span>
                            <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              GPS Connected
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-normal">
                            Fetch real-time browser coordinates to identify regional demand spikes and optimize local ad distributions.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsRadarExpanded(!isRadarExpanded)}
                        className="self-end sm:self-auto p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0"
                        id="btn-toggle-radar-collapse"
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isRadarExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {isRadarExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          {/* Location Controls & Simulators */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50/50 p-4 border border-slate-100 rounded-2xl mb-4">
                            <div className="md:col-span-5 space-y-2 text-center">
                              <button
                                onClick={handleGetCurrentLocation}
                                disabled={geoLoading}
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer w-full justify-center"
                                id="btn-trigger-gps-scan"
                              >
                                {geoLoading ? (
                                  <RotateCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Navigation className="h-4 w-4" />
                                )}
                                <span>Scan My GPS Location</span>
                              </button>
                              <span className="text-[9px] text-slate-400 font-extrabold block">
                                Prompts secure browser Geolocation permission
                              </span>
                            </div>

                            <div className="hidden md:block md:col-span-1 text-center font-bold text-[10px] text-slate-400 uppercase">
                              Or
                            </div>

                            <div className="md:col-span-6 space-y-2 text-left">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                High-Fidelity Location Presets
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  onClick={() => fetchTrendsForCoords(20.2961, 85.8245)}
                                  disabled={geoLoading}
                                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 text-slate-700 hover:text-indigo-700 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <MapPin className="h-3 w-3 text-rose-500" />
                                  Bhubaneswar, OD
                                </button>
                                <button
                                  onClick={() => fetchTrendsForCoords(19.0025, 72.8273)}
                                  disabled={geoLoading}
                                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 text-slate-700 hover:text-indigo-700 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <MapPin className="h-3 w-3 text-blue-500" />
                                  Mumbai, MH
                                </button>
                                <button
                                  onClick={() => fetchTrendsForCoords(12.9716, 77.5946)}
                                  disabled={geoLoading}
                                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 text-slate-700 hover:text-indigo-700 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <MapPin className="h-3 w-3 text-emerald-500" />
                                  Bengaluru, KA
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Error block if GPS permissions / timeout failures */}
                          {geoError && (
                            <div className="p-4 bg-amber-50 border border-amber-200 text-slate-800 rounded-2xl text-xs mb-4 text-left space-y-3" id="radar-error-banner">
                              <div className="flex items-start gap-2 text-amber-800">
                                <span className="text-sm font-bold shrink-0">⚠️</span>
                                <div className="space-y-1">
                                  <p className="font-extrabold text-amber-900">{geoError}</p>
                                  <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                                    Browser security policies within nested sandboxed iframes can restrict direct GPS hardware scans. You can instantly bypass this restriction by clicking below to run a high-fidelity simulated satellite GPS scan!
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/60">
                                <button
                                  onClick={() => fetchTrendsForCoords(20.2961, 85.8245)}
                                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  Simulate GPS: Bhubaneswar Hub
                                </button>
                                <button
                                  onClick={() => fetchTrendsForCoords(19.0025, 72.8273)}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  Simulate GPS: Mumbai Hub
                                </button>
                                {userStoresList && userStoresList.length > 0 && userStoresList.map((store, sIdx) => {
                                  const latVal = typeof store.latitude === 'number' ? store.latitude : parseFloat(store.latitude);
                                  const lngVal = typeof store.longitude === 'number' ? store.longitude : parseFloat(store.longitude);
                                  if (!isNaN(latVal) && !isNaN(lngVal)) {
                                    return (
                                      <button
                                        key={sIdx}
                                        onClick={() => fetchTrendsForCoords(latVal, lngVal)}
                                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                                      >
                                        Simulate GPS: {store.name || "My Store"}
                                      </button>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          )}

                          {/* Loading scanning visualizer */}
                          {geoLoading && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4" id="radar-scanning-loader">
                              <div className="relative">
                                <div className="h-16 w-16 rounded-full border border-indigo-500/30 animate-ping absolute inset-0" />
                                <div className="h-16 w-16 rounded-full border-2 border-indigo-600 flex items-center justify-center text-indigo-600 bg-indigo-50/30 relative z-10">
                                  <Navigation className="h-6 w-6 animate-spin" />
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">Querying Hyperlocal Trends Database</span>
                                <span className="text-[10px] text-slate-400 font-bold block mt-1">Evaluating regional densities, active buyer demands, and competitor ad bids...</span>
                              </div>
                            </div>
                          )}

                          {/* Results Panel */}
                          {nearbyTrends && !geoLoading && (
                            <div className="space-y-4 text-left animate-fade-in" id="radar-trends-results">
                              {/* Location Metas */}
                              <div className="flex flex-wrap items-center justify-between bg-slate-900 text-white p-4 rounded-2xl gap-3">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-5 w-5 text-amber-400 shrink-0 animate-bounce" />
                                  <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Identified Market Hub</span>
                                    <strong className="text-sm font-black tracking-tight">{nearbyTrends.locationName}</strong>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-5 w-5 text-indigo-400 shrink-0" />
                                  <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Estimated Foot Traffic</span>
                                    <span className="bg-slate-800 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded border border-slate-700 block mt-0.5">
                                      {nearbyTrends.footTraffic}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Matrix Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search Surges */}
                                <div className="border border-slate-150 p-4 rounded-2xl bg-white space-y-2.5">
                                  <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" /> Search Demand Surge
                                  </h4>
                                  <div className="space-y-1.5">
                                    {nearbyTrends.localSearchSurge.map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                                        <span className="font-bold text-slate-700 truncate w-[70%]">{item.keyword}</span>
                                        <span className="bg-emerald-100 text-emerald-800 font-black text-[9.5px] px-1.5 py-0.5 rounded-md">
                                          {item.change}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Competitor Ad bidding */}
                                <div className="border border-slate-150 p-4 rounded-2xl bg-white space-y-2.5">
                                  <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
                                    <Activity className="h-4 w-4 text-indigo-500" /> Competitor Ad Density
                                  </h4>
                                  <div className="space-y-1.5">
                                    {nearbyTrends.competitorBidding.map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                                        <span className="font-bold text-slate-700 truncate">{item.category}</span>
                                        <div className="text-right whitespace-nowrap shrink-0">
                                          <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded mr-1">
                                            {item.density} Bid
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-black">{item.averageBid}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Local Events */}
                                <div className="border border-slate-150 p-4 rounded-2xl bg-white space-y-2.5">
                                  <h4 className="text-[10.5px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
                                    <Calendar className="h-4 w-4 text-amber-500" /> Local Gatherings
                                  </h4>
                                  <div className="space-y-1.5">
                                    {nearbyTrends.events.map((item: any, idx: number) => (
                                      <div key={idx} className="text-xs p-2 bg-slate-50 rounded-xl space-y-1">
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="font-black text-slate-700 truncate w-[70%]">{item.name}</span>
                                          <span className="text-[9px] font-bold text-indigo-600 font-mono whitespace-nowrap">{item.date}</span>
                                        </div>
                                        <span className="text-[9.5px] font-bold text-slate-400 block uppercase">
                                          Impact: {item.impact}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* AI Recommended Strategy */}
                              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <Zap className="h-5.5 w-5.5 fill-emerald-600 stroke-none" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block">Recommended Hyperlocal Strategy</span>
                                    <h4 className="text-xs font-black text-slate-800 tracking-tight mt-0.5">
                                      {nearbyTrends.recommendedCampaign.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-600 font-semibold mt-1 leading-relaxed">
                                      {nearbyTrends.recommendedCampaign.description}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-black text-emerald-700 uppercase">
                                      <span>Estimated Target Reach:</span>
                                      <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded font-extrabold text-[9px] tracking-wide">
                                        {nearbyTrends.recommendedCampaign.potentialReach}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleAutofillCampaign(
                                    nearbyTrends.recommendedCampaign.title,
                                    nearbyTrends.recommendedCampaign.description,
                                    `Proximity target audience inside ${nearbyTrends.locationName}`
                                  )}
                                  className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                                >
                                  <span>Autofill AI Generator</span>
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Default state when radar is open but not yet loaded */}
                          {!nearbyTrends && !geoLoading && (
                            <div className="py-10 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3 bg-slate-50/20">
                              <Navigation className="h-10 w-10 text-slate-300 animate-pulse" />
                              <div className="text-center max-w-sm px-4">
                                <span className="text-xs font-black text-slate-700 block">No GPS Scanning Activity Registered</span>
                                <span className="text-[10px] text-slate-400 font-semibold mt-1 block leading-normal">
                                  Click "Scan My GPS Location" above to query your real browser position, or choose a regional hotspot to simulate immediate results.
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AiCampaignGenerator 
                    onCampaignSaved={fetchNotifs} 
                    preFill={generatorPreFill}
                    onClearPrefill={() => setGeneratorPreFill(null)}
                  />
                </div>
              )}

              {activeTab === 'management' && (
                <CampaignManagement onRefresh={fetchNotifs} onViewTab={handleViewTab} />
              )}

              {activeTab === 'stores' && (
                <StoreManagement />
              )}

              {activeTab === 'products' && (
                <ProductManagement />
              )}

              {activeTab === 'festivals' && (
                <FestivalAnalytics onAutofillCampaign={handleAutofillCampaign} />
              )}

              {activeTab === 'publishing' && (
                <SocialPublishing />
              )}

              {activeTab === 'connections' && (
                <ConnectedAccounts />
              )}

              {activeTab === 'history' && (
                <PublishHistory />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsReports />
              )}

              {activeTab === 'settings' && (
                <SettingsPage currentUser={currentUser} onUpdateUser={onUpdateUser} />
              )}

              {activeTab === 'support' && (
                <HelpSupport />
              )}

            </motion.div>
          </AnimatePresence>

        </main>

      </div>

    </div>
  );
};
