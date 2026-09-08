import * as React from 'react';
import { 
  Sparkles, 
  Store, 
  MapPin, 
  Target, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  Sliders, 
  Compass, 
  Phone, 
  Clock, 
  Search, 
  Locate, 
  AlertCircle,
  HelpCircle,
  Zap,
  Building,
  ShieldCheck,
  Send,
  Users,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  DollarSign,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  LogOut,
  SlidersHorizontal,
  Flame,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { apiService } from '../../services/api';
import { StoreMap } from './StoreMap';

interface OnboardingWizardProps {
  currentUser: any;
  onOnboardingComplete: () => void;
  onLogout?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ 
  currentUser, 
  onOnboardingComplete,
  onLogout 
}) => {
  const [step, setStep] = React.useState(1);
  const [loadingStatus, setLoadingStatus] = React.useState(true);
  const [savingProgress, setSavingProgress] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [successText, setSuccessText] = React.useState<string | null>(null);

  // STEP 1: Business Information
  const [businessName, setBusinessName] = React.useState(currentUser?.businessName || '');
  const [category, setCategory] = React.useState('Clothing');
  const [description, setDescription] = React.useState('');
  const [gstNumber, setGstNumber] = React.useState('');
  const [website, setWebsite] = React.useState('');

  // STEP 2: Store Information
  const [storeName, setStoreName] = React.useState('');
  const [storeAddress, setStoreAddress] = React.useState('');
  const [contactNumber, setContactNumber] = React.useState(currentUser?.mobileNumber || '');
  const [openingHours, setOpeningHours] = React.useState('10:00 AM - 09:30 PM');
  const [storeType, setStoreType] = React.useState<'Single Store' | 'Multiple Stores'>('Single Store');

  // STEP 3: Store Location Setup (OpenStreetMap + Leaflet)
  const [latitude, setLatitude] = React.useState(21.4669); // Default placeholder
  const [longitude, setLongitude] = React.useState(83.9812);
  const [radiusTargetKm, setRadiusTargetKm] = React.useState(5);
  const [searchQuery, setSearchQuery] = React.useState('');

  // STEP 4: Target Audience
  const [ageGroups, setAgeGroups] = React.useState<string[]>(['25-34', '35-44']);
  const [gender, setGender] = React.useState<string>('All');
  const [customerTypes, setCustomerTypes] = React.useState<string[]>(['Local Residents', 'Professionals']);

  // STEP 5: Social Media Setup
  const [instagramUrl, setInstagramUrl] = React.useState('');
  const [facebookUrl, setFacebookUrl] = React.useState('');
  const [whatsappNumber, setWhatsappNumber] = React.useState('');
  const [twitterUrl, setTwitterUrl] = React.useState('');

  // STEP 6: Marketing Preferences
  const [campaignGoal, setCampaignGoal] = React.useState('Increase Sales');
  const [budgetRange, setBudgetRange] = React.useState('₹5,000 - ₹10,000');
  const [campaignTone, setCampaignTone] = React.useState('Friendly');

  // STEP 7: AI Business Analysis
  const [aiAnalysis, setAiAnalysis] = React.useState<{
    businessSummary: string;
    suggestedCampaignTypes: Array<{ name: string; description: string }>;
    recommendedAudience: string;
    recommendedFestivals: string[];
    suggestedOfferStrategy: string;
    marketingReadinessScore: number;
  } | null>(null);

  // Predefined Categories
  const categoriesList = [
    'Clothing', 'Electronics', 'Grocery', 'Restaurant', 
    'Beauty', 'Pharmacy', 'Furniture', 'Mobile Store', 
    'Bakery', 'Other'
  ];

  // Predefined Audience Metadata
  const allAgeGroups = ['18-24', '25-34', '35-44', '45+'];
  const allGenders = ['Male', 'Female', 'All'];
  const allCustomerTypes = ['Students', 'Professionals', 'Families', 'Local Residents'];

  // Restore draft state when components mounts
  React.useEffect(() => {
    async function restoreDraft() {
      try {
        const res = await apiService.getOnboardingStatus();
        if (res && res.success && res.state) {
          const s = res.state;
          if (s.business) {
            setBusinessName(s.business.businessName || '');
            setCategory(s.business.category || 'Clothing');
            setDescription(s.business.description || '');
            setGstNumber(s.business.gstNumber || '');
            setWebsite(s.business.website || '');
          }
          if (s.store) {
            setStoreName(s.store.storeName || '');
            setStoreAddress(s.store.storeAddress || '');
            setContactNumber(s.store.contactNumber || '');
            setOpeningHours(s.store.openingHours || '');
            setStoreType(s.store.storeType || 'Single Store');
            if (s.store.storeAddress) {
              setSearchQuery(s.store.storeAddress);
            }
          } else {
            // Pre-fill store name from business name by default
            setStoreName(s.business?.businessName || currentUser?.businessName || '');
          }
          if (s.location && s.location.latitude && s.location.longitude) {
            setLatitude(s.location.latitude);
            setLongitude(s.location.longitude);
            setRadiusTargetKm(s.location.radiusKm || 5);
          }
          if (s.audience) {
            setAgeGroups(s.audience.ageGroups || []);
            setGender(s.audience.gender || 'All');
            setCustomerTypes(s.audience.customerTypes || []);
          }
          if (s.social) {
            setInstagramUrl(s.social.instagram || '');
            setFacebookUrl(s.social.facebook || '');
            setWhatsappNumber(s.social.whatsApp || '');
            setTwitterUrl(s.social.twitter || '');
          }
          if (s.preferences) {
            setCampaignGoal(s.preferences.campaignGoal || 'Increase Sales');
            setBudgetRange(s.preferences.budgetRange || '₹5,000 - ₹10,000');
            setCampaignTone(s.preferences.tone || 'Friendly');
          }
          if (s.aiAnalysis) {
            setAiAnalysis(s.aiAnalysis);
          }
          // Set to active step from backend status if not completed
          if (res.step && !res.completed) {
            setStep(res.step);
          }
        }
      } catch (err) {
        console.warn("[ONBOARDING] No previous draft state resolved or auth pending.", err);
      } finally {
        setLoadingStatus(false);
      }
    }
    restoreDraft();
  }, [currentUser]);

  const [searchingLocation, setSearchingLocation] = React.useState(false);

  // Dynamic OpenStreetMap Geocoding with Regional Offline Fallback
  const geocodeAddress = async (queryText: string, updateAddress = false) => {
    if (!queryText || !queryText.trim()) return;
    const clean = queryText.trim();
    setSearchingLocation(true);

    // Queries to attempt in order: full string, then sub-parts (e.g. area + city)
    const queriesToTry = [clean];
    const parts = clean.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      queriesToTry.push(parts.slice(1).join(', '));
      if (parts.length > 2) {
        queriesToTry.push(parts.slice(parts.length - 2).join(', '));
      }
      queriesToTry.push(parts[parts.length - 1]);
    }

    // 1. Instant Curated Dictionary Matching for Regional Hubs & Verified Odisha Cities
    const q = clean.toLowerCase();
    const knownLocations: Record<string, [number, number]> = {
      'bherampur': [19.3150, 84.7941],
      'berhampur': [19.3150, 84.7941],
      'brahmapur': [19.3150, 84.7941],
      'behrampur': [19.3150, 84.7941],
      'madanpur': [20.2380, 85.7231],
      'badaraghunathpur': [20.2344, 85.7272],
      'jatni': [20.1610, 85.7067],
      'khurda': [20.1817, 85.6212],
      'gita': [20.2380, 85.7231],
      'bhubaneswar': [20.2961, 85.8245],
      'cuttack': [20.4625, 85.8828],
      'puri': [19.8135, 85.8312],
      'rourkela': [22.2604, 84.8536],
      'balasore': [21.4934, 86.9135],
      'sambalpur': [21.4669, 83.9812],
      'budharaja': [21.4821, 83.9788],
      'shastri': [21.4641, 83.9772],
      'khetrajpur': [21.4883, 83.9610],
      'gole bazar': [21.4691, 83.9834],
      'delhi': [28.6139, 77.2090],
      'connaught place': [28.6304, 77.2177],
      'new delhi': [28.6139, 77.2090],
      'noida': [28.5355, 77.3910],
      'gurgaon': [28.4595, 77.0266],
      'gurugram': [28.4595, 77.0266],
      'mumbai': [19.0760, 72.8777],
      'bandra': [19.0596, 72.8295],
      'andheri': [19.1136, 72.8697],
      'kolkata': [22.5726, 88.3639],
      'salt lake': [22.5868, 88.4178],
      'howrah': [22.5958, 88.2636],
      'bengaluru': [12.9716, 77.5946],
      'bangalore': [12.9716, 77.5946],
      'indiranagar': [12.9784, 77.6408],
      'koramangala': [12.9352, 77.6245],
      'whitefield': [12.9698, 77.7500],
      'hyderabad': [17.3850, 78.4867],
      'hitech city': [17.4474, 78.3762],
      'secunderabad': [17.4399, 78.4983],
      'chennai': [13.0827, 80.2707],
      'pune': [18.5204, 73.8567],
      'ahmedabad': [23.0225, 72.5714],
      'jaipur': [26.9124, 75.7873],
      'lucknow': [26.8467, 80.9462],
      'patna': [25.5941, 85.1376],
      'ranchi': [23.3441, 85.3096],
      'chandigarh': [30.7333, 76.7794],
      'indore': [22.7196, 75.8577],
      'bhopal': [23.2599, 77.4126],
      'surat': [21.1702, 72.8311],
      'nagpur': [21.1458, 79.0882],
      'visakhapatnam': [17.6868, 83.2185]
    };

    for (const [key, coords] of Object.entries(knownLocations)) {
      if (q.includes(key)) {
        setLatitude(coords[0]);
        setLongitude(coords[1]);
        setSuccessText(`Map location pinned to ${clean}!`);
        setTimeout(() => setSuccessText(null), 3000);
        setSearchingLocation(false);
        return;
      }
    }

    // 2. Try Backend Geocoding Proxy (server-side, zero CORS issues)
    try {
      const proxyRes = await apiService.geocodeLocation(clean);
      if (proxyRes && proxyRes.success && proxyRes.latitude && proxyRes.longitude) {
        setLatitude(proxyRes.latitude);
        setLongitude(proxyRes.longitude);
        if (updateAddress && !storeAddress) {
          setStoreAddress(proxyRes.displayName || clean);
        }
        setSuccessText(`Map location pinned to ${clean}!`);
        setTimeout(() => setSuccessText(null), 3000);
        setSearchingLocation(false);
        return;
      }
    } catch (err) {
      console.warn("[GEOCODE] Backend proxy attempt bypassed:", err);
    }

    // 3. Query Photon OpenStreetMap API (Free public CORS for client browsers)
    for (const qStr of queriesToTry) {
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(qStr)}&limit=1`;
        const res = await axios.get(photonUrl, { timeout: 4000 });
        if (res.data?.features && res.data.features.length > 0) {
          const feat = res.data.features[0];
          const coords = feat.geometry?.coordinates;
          if (coords && coords.length >= 2) {
            const lng = coords[0];
            const lat = coords[1];
            if (!isNaN(lat) && !isNaN(lng)) {
              setLatitude(lat);
              setLongitude(lng);
              const label = [feat.properties?.name, feat.properties?.city, feat.properties?.state].filter(Boolean).join(', ');
              if (updateAddress && !storeAddress && label) {
                setStoreAddress(label);
              }
              setSuccessText(`Map location pinned to ${qStr}!`);
              setTimeout(() => setSuccessText(null), 3500);
              setSearchingLocation(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn(`[GEOCODE] Photon failed for "${qStr}":`, err);
      }
    }

    // 4. Query Open-Meteo Geocoding API (Open browser CORS fallback)
    for (const qStr of queriesToTry) {
      try {
        const mainPart = qStr.split(',')[0].trim();
        const meteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(mainPart)}&count=1&language=en&format=json`;
        const res = await axios.get(meteoUrl, { timeout: 4000 });
        if (res.data?.results && res.data.results.length > 0) {
          const top = res.data.results[0];
          const lat = parseFloat(top.latitude);
          const lng = parseFloat(top.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            setLatitude(lat);
            setLongitude(lng);
            setSuccessText(`Map location pinned to ${top.name}!`);
            setTimeout(() => setSuccessText(null), 3500);
            setSearchingLocation(false);
            return;
          }
        }
      } catch (err) {
        console.warn(`[GEOCODE] Open-Meteo failed for "${qStr}":`, err);
      }
    }

    setSuccessText("Could not resolve location automatically. You can click on the map, edit coordinates directly, or use Auto-GPS.");
    setTimeout(() => setSuccessText(null), 4000);
    setSearchingLocation(false);
  };

  const triggerMapSearch = () => {
    if (!searchQuery.trim()) return;
    geocodeAddress(searchQuery, true);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorText("Geolocation not supported by this browser.");
      return;
    }
    setSearchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setSuccessText(`GPS coordinates resolved: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setTimeout(() => setSuccessText(null), 3500);
        setSearchingLocation(false);
      },
      (err) => {
        console.warn("GPS Geolocation error:", err);
        setErrorText("Could not detect device GPS. Please type your city/area in the search box.");
        setTimeout(() => setErrorText(null), 4000);
        setSearchingLocation(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // STEP BY STEP SAVE ROUTINES
  const handleSaveBusiness = async () => {
    if (!businessName.trim() || !category) {
      setErrorText("Business Name and Niche Category are required.");
      return;
    }
    setErrorText(null);
    setSavingProgress(true);
    try {
      await apiService.saveOnboardingBusiness({
        businessName,
        category,
        description,
        gstNumber,
        website
      });
      
      // Auto-set store name on next step if empty
      if (!storeName) {
        setStoreName(businessName);
      }
      setStep(2);
    } catch (err: any) {
      setErrorText(err.message || "Failed to save business credentials.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSaveStore = async () => {
    if (!storeName.trim() || !storeAddress.trim()) {
      setErrorText("Store Name and Physical Address are required.");
      return;
    }
    setErrorText(null);
    setSavingProgress(true);
    try {
      await apiService.saveOnboardingStore({
        storeName,
        storeAddress,
        contactNumber,
        openingHours,
        storeType
      });

      // Synchronize address into Step 3 location & trigger geocode
      if (storeAddress.trim()) {
        setSearchQuery(storeAddress.trim());
        geocodeAddress(storeAddress.trim());
      }

      setStep(3);
    } catch (err: any) {
      setErrorText(err.message || "Failed to save store details.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSaveLocation = async () => {
    setErrorText(null);
    setSavingProgress(true);
    try {
      await apiService.saveOnboardingLocation({
        latitude,
        longitude,
        radiusKm: radiusTargetKm
      });
      setStep(4);
    } catch (err: any) {
      setErrorText(err.message || "Failed to save target coordinates.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSaveAudience = async () => {
    if (ageGroups.length === 0) {
      setErrorText("Select at least one targeted Age Group.");
      return;
    }
    if (customerTypes.length === 0) {
      setErrorText("Select at least one customer type profile.");
      return;
    }
    setErrorText(null);
    setSavingProgress(true);
    try {
      await apiService.saveOnboardingAudience({
        ageGroups,
        gender,
        customerTypes
      });
      setStep(5);
    } catch (err: any) {
      setErrorText(err.message || "Failed to save age/gender demographics.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSaveSocial = async () => {
    setErrorText(null);
    setSavingProgress(true);
    try {
      await apiService.saveOnboardingSocial({
        instagram: instagramUrl,
        facebook: facebookUrl,
        whatsApp: whatsappNumber,
        twitter: twitterUrl
      });
      setStep(6);
    } catch (err: any) {
      setErrorText(err.message || "Failed to save social handle URLs.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleSavePreferencesAndAnalyze = async () => {
    setErrorText(null);
    setSavingProgress(true);
    try {
      // Step 6 Save triggers Deep SWOT Analysis with Gemini AI
      const res = await apiService.saveOnboardingPreferences({
        campaignGoal,
        budgetRange,
        tone: campaignTone
      });
      if (res && res.aiAnalysis) {
        setAiAnalysis(res.aiAnalysis);
      }
      setStep(7);
    } catch (err: any) {
      setErrorText(err.message || "Engine computation failed. Check internet coordinates.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleTriggerFinalSubmit = async () => {
    setErrorText(null);
    setSavingProgress(true);
    try {
      await apiService.completeOnboarding();
      localStorage.setItem('_onboarding_completed', 'true');
      onOnboardingComplete();
    } catch (err: any) {
      setErrorText(err.message || "Failed to synchronize profile completeness.");
    } finally {
      setSavingProgress(false);
    }
  };

  const toggleAgeGroup = (val: string) => {
    setAgeGroups(prev => 
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const toggleCustomerType = (val: string) => {
    setCustomerTypes(prev => 
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  // Step names helper
  const wizardSteps = [
    { num: 1, label: 'Business Profile', desc: 'Category & website' },
    { num: 2, label: 'Store Logistics', desc: 'Timings & contacts' },
    { num: 3, label: 'Store Location', desc: 'OSM Leaflet Coordinates' },
    { num: 4, label: 'Target Audience', desc: 'Age groups & genders' },
    { num: 5, label: 'Social Channels', desc: 'Instagram & WhatsApp' },
    { num: 6, label: 'Campaign Intent', desc: 'Goals & budgets' },
    { num: 7, label: 'AI SWOT Audit', desc: 'Gemini cognitive score' },
    { num: 8, label: 'Get Unleashed', desc: 'Welcome launcher' }
  ];

  if (loadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 max-w-sm mx-auto" id="onboarding-loading-screen">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Merchant Setup Draft...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto" id="wizard-onboarding-screen">
      <div className="bg-white w-full max-w-5xl rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-0 md:h-[680px]" id="wizard-onboarding-card">
        
        {/* Left Side: Onboarding Map/Brand Sidebar Panel */}
        <div className="md:w-76 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between shrink-0 select-none text-left border-r border-indigo-900/40">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-500/20 max-w-max p-2 rounded-xl border border-indigo-500/20 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-tight leading-none">Hyperlocal AI</h3>
                <span className="text-[9.5px] text-indigo-300 uppercase tracking-widest font-black mt-1.5 block">Enterprise Merchant Onboarding</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-extrabold block">Steps Roadmap</span>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {wizardSteps.map((item) => {
                  const isPassed = step > item.num;
                  const isActive = step === item.num;
                  return (
                    <div key={item.num} className="flex items-start gap-2.5 py-0.5">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center font-extrabold text-[9px] shrink-0 transition-all ${
                        isPassed 
                          ? 'bg-emerald-500 text-white' 
                          : isActive 
                            ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/40 scale-105' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {isPassed ? <Check className="h-2.5 w-2.5" /> : item.num}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className={`text-[11px] font-bold leading-none truncate ${isActive ? 'text-white' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</p>
                        <p className={`text-[9.5px] truncate ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-950 space-y-3">
            <div className="bg-slate-900/40 border border-indigo-900/30 rounded-xl p-2.5 flex items-center gap-2 text-[10px] text-indigo-200">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="leading-tight font-medium">Automatic draft auto-saving is active across steps.</span>
            </div>
            
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full bg-slate-900 hover:bg-rose-950/30 border border-rose-900/30 font-extrabold text-[10px] text-rose-450 hover:text-rose-400 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="h-3 w-3" /> Stop Onboarding & Exit
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Step Contents Canvas */}
        <div className="flex-1 flex flex-col justify-between bg-slate-50 p-6 sm:p-8 relative text-left">
          
          {/* Action notices banner */}
          <div className="absolute top-4 right-6 flex items-center gap-2 select-none z-10 text-[9px] font-black tracking-widest text-emerald-600">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>CLOUD SYNC ACTIVE</span>
          </div>

          <div className="overflow-y-auto flex-grow max-h-[500px] pr-2 scrollbar-thin">
            
            {/* Display validation or system alert banners */}
            {errorText && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-800 text-xs font-semibold mb-4 animate-fade-in" id="onboarding-error-banner">
                <AlertCircle className="h-4 w-4 text-rose-650 shrink-0 mt-0.5" />
                <span>{errorText}</span>
              </div>
            )}
            {successText && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-emerald-800 text-xs font-semibold mb-4 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successText}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              
              {/* STEP 1: BUSINESS PROFILE */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Step 01 of 08 — Business Base</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Tell Us About Your Enterprise</h2>
                    <p className="text-xs text-slate-500 leading-normal font-medium">Configure your core corporate metadata to align marketing presets and secure localized retail catalogs.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Registered Business Name *</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold shadow-xs" 
                            placeholder="e.g. Sambalpur Saree House"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Niche Category *</label>
                        <select
                          className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold shadow-xs"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          {categoriesList.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Business Description</label>
                      <textarea
                        rows={2.5}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold shadow-xs resize-none"
                        placeholder="Describe your primary goods, specialized items, or brand history..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">GSTIN Identification Number (Optional)</label>
                        <div className="relative">
                          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input 
                            type="text" 
                            maxLength={15}
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold font-mono text-slate-700 uppercase" 
                            placeholder="e.g. 21AAAAA1111A1Z1"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Corporate Website (Optional)</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input 
                            type="url" 
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700" 
                            placeholder="e.g. https://www.boutiquewebsite.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: STORE INFORMATION */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Step 02 of 08 — Store Logistics</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Configure Physical Store Outlet</h2>
                    <p className="text-xs text-slate-500 leading-normal font-medium">Define your store's commercial settings, opening hours, and direct hotline contact details for hyperlocal ads.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Outlet Name *</label>
                        <div className="relative">
                          <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold" 
                            placeholder="e.g. Sambalpur Saree Kendra (Main Branch)"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hotline Contact Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="tel" 
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold" 
                            placeholder="e.g. +91 94370 12345"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Store physical Address *</label>
                      <textarea
                        rows={2}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold shadow-xs resize-none"
                        placeholder="e.g. Plot No. 120, Gole Bazar, Near GPO, Sambalpur, Odisha, 768001"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Opening & Closing Hours *</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="text" 
                            className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold" 
                            value={openingHours}
                            onChange={(e) => setOpeningHours(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Operational Scale Outlet Type *</label>
                        <div className="grid grid-cols-2 gap-3.5">
                          <button
                            type="button"
                            onClick={() => setStoreType('Single Store')}
                            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                              storeType === 'Single Store' 
                                ? 'bg-indigo-550 border-indigo-600 text-indigo-700 bg-indigo-50' 
                                : 'bg-white border-slate-200 text-slate-650 hover:border-slate-300'
                            }`}
                          >
                            Single Store
                          </button>
                          <button
                            type="button"
                            onClick={() => setStoreType('Multiple Stores')}
                            className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                              storeType === 'Multiple Stores' 
                                ? 'bg-indigo-550 border-indigo-600 text-indigo-700 bg-indigo-50' 
                                : 'bg-white border-slate-200 text-slate-650 hover:border-slate-300'
                            }`}
                          >
                            Multiple Outlets
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: STORE MAP LOCATION PINNING */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Step 03 of 08 — Location Radar</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pinpoint Map & Target Radius</h2>
                    <p className="text-xs text-slate-500 leading-normal font-medium">Verify your exact global coordinate parameters with our integrated map so local customers can view campaign promotions with high proximity precision.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Maps Controls Column */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Search Location Landmark</label>
                        <div className="flex gap-1.5">
                          <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input 
                              type="text" 
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl pl-9 pr-3 py-2 text-xs font-semibold" 
                              placeholder="e.g. Badaraghunathpur, Bhubaneswar or Connaught Place, Delhi"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && triggerMapSearch()}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={triggerMapSearch}
                            disabled={searchingLocation}
                            className="bg-indigo-600 text-white text-[10px] font-black px-3.5 py-2 rounded-xl hover:bg-indigo-700 cursor-pointer text-center disabled:opacity-60 flex items-center justify-center min-w-[54px]"
                          >
                            {searchingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Set"}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={searchingLocation}
                          className="bg-slate-200 text-slate-705 text-[10px] font-black px-3.5 py-2 rounded-xl hover:bg-slate-300 flex items-center justify-center gap-1.5 flex-grow cursor-pointer disabled:opacity-60"
                        >
                          {searchingLocation ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                          ) : (
                            <Locate className="h-3.5 w-3.5 text-indigo-600" />
                          )}
                          Auto-GPS Detect Location
                        </button>
                      </div>

                      {/* Coordinates Readout & Direct Manual Coordinates Input */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                        <div>
                          <label className="text-[8.5px] text-slate-500 block font-black uppercase mb-1 tracking-wider">Latitude (Manual/GPS)</label>
                          <input
                            type="number"
                            step="any"
                            value={latitude}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setLatitude(val);
                            }}
                            className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:outline-none rounded-lg px-2.5 py-1 text-slate-900 font-mono font-bold text-xs"
                            placeholder="e.g. 20.2961"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] text-slate-500 block font-black uppercase mb-1 tracking-wider">Longitude (Manual/GPS)</label>
                          <input
                            type="number"
                            step="any"
                            value={longitude}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) setLongitude(val);
                            }}
                            className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:outline-none rounded-lg px-2.5 py-1 text-slate-900 font-mono font-bold text-xs"
                            placeholder="e.g. 85.8245"
                          />
                        </div>
                      </div>

                      {/* Sweep Radius Selector tool */}
                      <div className="bg-indigo-50/60 border border-indigo-200/50 p-3.5 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block">Active Proximity Radius</label>
                          <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-black">{radiusTargetKm} km</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={50}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-605"
                          value={radiusTargetKm}
                          onChange={(e) => setRadiusTargetKm(Number(e.target.value))}
                        />
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                          <span>1 km</span>
                          <span>25 km</span>
                          <span>50 km</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive OSM map panel */}
                    <div className="lg:col-span-7 h-[260px] bg-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
                      <StoreMap
                        center={{ lat: latitude, lng: longitude }}
                        radiusKm={radiusTargetKm}
                        onLocationChange={(lat, lng) => {
                          setLatitude(lat);
                          setLongitude(lng);
                        }}
                        interactive={true}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: TARGET AUDIENCE GENDER, AGE, AND CLIENTELE TYPE */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Step 04 of 08 — Intended Clientele</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Define Demographics Target Profile</h2>
                    <p className="text-xs text-slate-500 leading-normal font-medium">Design your targeting persona group so our regional ad distribution networks target only high-likelihood shoppers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    
                    {/* Genders List Toggle */}
                    <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-2.5 text-left shadow-xs">
                      <strong className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Gender Targeting Preference</strong>
                      <div className="flex flex-col gap-2">
                        {allGenders.map(g => {
                          const active = gender === g;
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGender(g)}
                              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                                active 
                                  ? 'bg-indigo-50 border-indigo-400 text-indigo-700' 
                                  : 'bg-white border-slate-150 hover:bg-slate-50'
                              }`}
                            >
                              <span>{g} Demographics Only</span>
                              {active && <Check className="h-4.5 w-4.5 text-indigo-605" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Age Groups Multi-select */}
                    <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-2.5 text-left shadow-xs">
                      <strong className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Targeted Age Groups (Select Multi)</strong>
                      <div className="grid grid-cols-2 gap-2.5">
                        {allAgeGroups.map(grp => {
                          const active = ageGroups.includes(grp);
                          return (
                            <button
                              key={grp}
                              type="button"
                              onClick={() => toggleAgeGroup(grp)}
                              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                active 
                                  ? 'bg-indigo-50 border-indigo-400 text-indigo-700' 
                                  : 'bg-white border-slate-150 hover:border-slate-200'
                              }`}
                            >
                              {grp} Years Old
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Customer Type Multi select */}
                  <div className="bg-white border border-slate-200/85 p-5 rounded-3xl space-y-3.5 text-left shadow-xs">
                    <strong className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Hyperlocal Customer Segments (Select Multi)</strong>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {allCustomerTypes.map(type => {
                        const active = customerTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleCustomerType(type)}
                            className={`p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all cursor-pointer ${
                              active 
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-500/10' 
                                : 'bg-white border-slate-150 hover:border-slate-200'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* STEP 5: SOCIAL MEDIA INTEGRATIONS */}
              {step === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Step 05 of 08 — Connect Channels</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Social Media & Communication Handles</h2>
                    <p className="text-xs text-slate-500 leading-normal font-medium">Link your business handles (Optional) to facilitate fast multi-platform posting, automated WhatsApp notifications, and Instagram templates.</p>
                  </div>

                  <div className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Instagram */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10.5px] font-extrabold text-indigo-905 flex items-center gap-1.5 leading-none">
                          <Instagram className="h-4.5 w-4.5 text-pink-500" /> Instagram Username URL
                        </label>
                        <input
                          type="url"
                          className="w-full bg-white border border-slate-200 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold"
                          placeholder="e.g. https://instagram.com/shopname"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                        />
                      </div>

                      {/* Facebook */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10.5px] font-extrabold text-indigo-905 flex items-center gap-1.5 leading-none">
                          <Facebook className="h-4.5 w-4.5 text-blue-605" /> Facebook Business Page
                        </label>
                        <input
                          type="url"
                          className="w-full bg-white border border-slate-200 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold"
                          placeholder="e.g. https://facebook.com/shopname"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* WhatsApp Business */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10.5px] font-extrabold text-indigo-905 flex items-center gap-1.5 leading-none">
                          <Send className="h-4.5 w-4.5 text-emerald-500" /> WhatsApp Business Hotline
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold"
                          placeholder="e.g. +919437055555"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                        />
                      </div>

                      {/* Twitter */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10.5px] font-extrabold text-indigo-905 flex items-center gap-1.5 leading-none">
                          <Twitter className="h-4.5 w-4.5 text-slate-800" /> X / Twitter Handle
                        </label>
                        <input
                          type="url"
                          className="w-full bg-white border border-slate-200 focus:outline-none rounded-xl px-3 py-2.5 text-xs font-semibold"
                          placeholder="e.g. https://x.com/shopname"
                          value={twitterUrl}
                          onChange={(e) => setTwitterUrl(e.target.value)}
                        />
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: MARKETING CAMPAIGN PREFERENCES */}
              {step === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Step 06 of 08 — Campaign Intent</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Select Marketing Campaign Budgets & Goals</h2>
                    <p className="text-xs text-slate-500 leading-normal font-medium">Configure commercial desires. Submitting this triggers Gemini AI to synthesize localized festival analysis and marketing readiness score reports.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    
                    {/* Goals List */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left space-y-2.5">
                      <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Campaign Goals</strong>
                      {['Increase Sales', 'Brand Awareness', 'Lead Generation', 'Customer Retention'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCampaignGoal(g)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            campaignGoal === g 
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-705' 
                              : 'bg-white border-slate-100 hover:border-slate-350 text-slate-650'
                          }`}
                        >
                          <span>{g}</span>
                          {campaignGoal === g && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />}
                        </button>
                      ))}
                    </div>

                    {/* Budgets List */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left space-y-2.5">
                      <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-mono">Monthly Budget Target</strong>
                      {['₹1,000 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000+'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudgetRange(b)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            budgetRange === b 
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-750' 
                              : 'bg-white border-slate-100 hover:border-slate-350 text-slate-650'
                          }`}
                        >
                          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-lime-600" /> {b}</span>
                          {budgetRange === b && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />}
                        </button>
                      ))}
                    </div>

                    {/* Preferred Tone */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left space-y-2.5">
                      <strong className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ad Tone Style</strong>
                      {['Professional', 'Friendly', 'Luxury', 'Viral'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCampaignTone(t)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            campaignTone === t 
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-705' 
                              : 'bg-white border-slate-100 hover:border-slate-350 text-slate-650'
                          }`}
                        >
                          <span>{t} Branding Voice</span>
                          {campaignTone === t && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />}
                        </button>
                      ))}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* STEP 7: AI BUSINESS ANALYSIS AND MARKETING READINESS PANEL */}
              {step === 7 && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 max-w-max">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-650 animate-bounce" /> STEP 07: Gemini AI Cognitive Synthesis
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">AI SWOT & Marketing Readiness Curation</h2>
                    <p className="text-xs text-slate-500 leading-normal font-medium">Our generative core evaluated your geocultural location elements, category keywords, and budget constraints to formulate these live suggestions.</p>
                  </div>

                  {aiAnalysis ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      
                      {/* Left: Score Board Gauge */}
                      <div className="lg:col-span-4 bg-gradient-to-br from-indigo-950 to-slate-950 text-white rounded-3xl p-5 flex flex-col justify-between space-y-4">
                        <div className="text-center space-y-2">
                          <span className="text-[8.5px] text-indigo-400 font-extrabold uppercase tracking-widest">Calculated Readiness</span>
                          
                          {/* Circle radial gauge */}
                          <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle 
                                cx="56" 
                                cy="56" 
                                r="48" 
                                className="text-indigo-900" 
                                strokeWidth="8" 
                                stroke="currentColor" 
                                fill="transparent" 
                              />
                              <circle 
                                cx="56" 
                                cy="56" 
                                r="48" 
                                className="text-emerald-405" 
                                strokeWidth="8" 
                                strokeDasharray={301.6}
                                strokeDashoffset={301.6 - (301.6 * (aiAnalysis.marketingReadinessScore || 85)) / 100}
                                strokeLinecap="round"
                                stroke="url(#gradient-emerald)" 
                                fill="transparent" 
                              />
                              <defs>
                                <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-white">{aiAnalysis.marketingReadinessScore}%</span>
                              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none">EXCELLENT</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left space-y-1">
                          <span className="text-[9px] text-indigo-300 font-black flex items-center gap-1 uppercase">
                            <Award className="h-3.5 w-3.5 text-amber-400" /> Executive Position
                          </span>
                          <p className="text-[10.5px] text-slate-300 leading-normal font-medium">Your business has extreme localized strength. Hyperlocal sweep radius displays low competitor densities.</p>
                        </div>
                      </div>

                      {/* Right: Rich AI SWOT tabs */}
                      <div className="lg:col-span-8 flex flex-col justify-between space-y-3.5">
                        
                        {/* Summary */}
                        <div className="bg-white border border-slate-150 p-4 rounded-2xl text-left space-y-1 shadow-xs">
                          <strong className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Positioning Summary</strong>
                          <p className="text-xs text-slate-700 leading-relaxed font-semibold">{aiAnalysis.businessSummary}</p>
                        </div>

                        {/* Suggested campaign types */}
                        <div className="bg-white border border-slate-150 p-4 rounded-2xl text-left space-y-2 shadow-xs">
                          <strong className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Recommended AI Campaigns</strong>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {aiAnalysis.suggestedCampaignTypes?.map((c, i) => (
                              <div key={i} className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-xl space-y-1">
                                <strong className="text-[11.5px] font-black text-indigo-950 block">{c.name}</strong>
                                <p className="text-[10px] text-slate-550 leading-snug font-medium">{c.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Festivals list */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="bg-white border border-slate-150 p-3.5 rounded-2xl text-left shadow-xs">
                            <strong className="text-[9px] font-black text-slate-450 uppercase block flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-rose-500 animate-pulse" /> Optimal Festivals
                            </strong>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {aiAnalysis.recommendedFestivals?.map((f, i) => (
                                <span key={i} className="bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-white border border-slate-150 p-3.5 rounded-2xl text-left shadow-xs">
                            <strong className="text-[9px] font-black text-slate-450 uppercase block flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5 text-indigo-500" /> Suggested Tactics
                            </strong>
                            <p className="text-[10px] text-slate-600 font-semibold leading-relaxed mt-1 truncate" title={aiAnalysis.suggestedOfferStrategy}>
                              {aiAnalysis.suggestedOfferStrategy}
                            </p>
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-2">
                      <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">Generating analytical summaries. Proceed to continue.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 8: WELCOME DASHBOARD INCLUSION */}
              {step === 8 && (
                <motion.div
                  key="step-8"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-5 text-center py-4"
                >
                  <div className="h-16 w-16 bg-emerald-50 border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Welcome aboard, {currentUser?.ownerName || 'Merchant'}! 🎉</h2>
                    <p className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">Business Profile Synced & Formulated Successfully</p>
                    <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
                      Your hyperlocal shop boundary maps, contact logistics, targeted age group personas, and customized Gemini SWOT campaign guidelines are stored securely. 
                    </p>
                  </div>

                  {/* High Fidelity Summary card */}
                  <div className="max-w-xl mx-auto bg-white border border-slate-205 rounded-3xl p-5 space-y-3 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 text-left divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Outlets Synchronized</span>
                      <strong className="text-xs text-slate-800 block flex items-center gap-1.5">
                        <Store className="h-4 w-4 text-indigo-600" /> {storeName || businessName}
                      </strong>
                      <span className="text-[10px] text-slate-450 block truncate leading-tight flex items-center gap-1"><MapPin className="h-3 w-3 text-rose-500" /> {storeAddress || 'Sambalpur headquarters'}</span>
                    </div>

                    <div className="pt-3 md:pt-0 md:pl-4 space-y-2 text-left">
                      <span className="text-[9px] font-black text-slate-440 uppercase tracking-widest block">AI Presets Established</span>
                      <div className="space-y-1">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-extrabold mr-1 block max-w-max">Goal: {campaignGoal}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-extrabold block max-w-max">Ready score: {aiAnalysis?.marketingReadinessScore || 85}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-450 font-bold max-w-sm mx-auto uppercase tracking-wider block leading-tight">Click below to gain instant access to interactive sales charts, multi-platform publishing handles, and AI copy rewrites!</p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Stepper Wizard Control Navigation Footer */}
          <div className="border-t border-slate-100 pt-5 mt-4 flex items-center justify-between select-none">
            
            {step > 1 && step < 7 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1 bg-white hover:bg-slate-55 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Previous Step
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1) handleSaveBusiness();
                  else if (step === 2) handleSaveStore();
                  else if (step === 3) handleSaveLocation();
                  else if (step === 4) handleSaveAudience();
                  else if (step === 5) handleSaveSocial();
                }}
                disabled={savingProgress}
                className="bg-indigo-605 hover:bg-indigo-700 bg-indigo-600 text-white disabled:bg-slate-205 disabled:text-slate-400 inline-flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              >
                {savingProgress ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-slate-200 border-t-white animate-spin" /> Saving Draft...
                  </span>
                ) : (
                  <span>Next Step</span>
                )}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : step === 6 ? (
              <button
                type="button"
                onClick={handleSavePreferencesAndAnalyze}
                disabled={savingProgress}
                className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-black shadow-md shadow-indigo-100 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {savingProgress ? (
                  <span className="flex items-center gap-1.5 font-bold animate-pulse">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-200 border-t-white animate-spin shrink-0" /> Launching Gemini SWOT Analysis...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">Trigger Gemini SWOT Analysis <Sparkles className="h-4 w-4 text-indigo-200" /></span>
                )}
              </button>
            ) : step === 7 ? (
              <div className="flex w-full justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> Edit Preferences
                </button>
                <button
                  type="button"
                  onClick={() => setStep(8)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 px-6 py-2.5 rounded-xl text-xs font-black shadow-md shadow-emerald-100 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <span>Verify Profile Summary</span> <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTriggerFinalSubmit}
                disabled={savingProgress}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:scale-[1.01] text-white inline-flex items-center gap-1 px-6 py-3.5 rounded-xl text-xs font-black shadow-lg cursor-pointer transition-transform duration-150"
              >
                {savingProgress ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-200 border-t-white animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">Unleash Hyperlocal Dashboard <LayoutDashboard className="h-4.5 w-4.5" /></span>
                )}
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
