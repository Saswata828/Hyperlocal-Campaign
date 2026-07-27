import * as React from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Percent, 
  Activity, 
  Sparkles,
  ArrowUpRight,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  Zap,
  ShoppingBag,
  Share2,
  Tv,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardService, Campaign, Store, subscribeToDashboardState } from '../../services/dashboardService';
import { apiService } from '../../services/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';

export const DashboardHome: React.FC<{ onViewTab: (tab: string) => void }> = ({ onViewTab }) => {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [stores, setStores] = React.useState<Store[]>([]);
  const [loadingLaunch, setLoadingLaunch] = React.useState(false);
  const [launchedSuccess, setLaunchedSuccess] = React.useState(false);
  const [headingIndex, setHeadingIndex] = React.useState(0);

  // Load up real-time campaigns and stores
  const loadDashboardData = () => {
    setCampaigns(dashboardService.getCampaigns());
    setStores(dashboardService.getStores());
  };

  React.useEffect(() => {
    loadDashboardData();
    // Subscribe to any changes for immediate local updates
    const unsubscribe = subscribeToDashboardState(() => {
      loadDashboardData();
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Compute live aggregates and averages
  const totalCampaigns = campaigns.length;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'Active').length;
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0) || 54200;
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leads || 0), 0) || 1240;

  // Real Conversion % (Leads / Reach) or baseline 3.8%
  const conversionRate = totalReach > 0 
    ? parseFloat(((totalLeads / totalReach) * 100).toFixed(1)) 
    : 3.8;

  // Engagement % Average (Engagement / Reach) or base 6.2%
  const engagementRate = campaigns.length > 0
    ? parseFloat((campaigns.reduce((acc, c) => acc + (c.reach ? ((c.engagement || 0) / c.reach) * 100 : 6.2), 0) / campaigns.length).toFixed(1))
    : 6.2;

  // Nearby Audience intelligence dynamically calculated from configured shop radii
  const primaryStore = stores[0] || { name: 'Sambalpur Saree Kendra', radiusTargetKm: 5, latitude: 21.4669 };
  const isSambalpur = primaryStore.name.toLowerCase().includes('sambalpur') || 
                      (primaryStore.address && primaryStore.address.toLowerCase().includes('sambalpur'));
  
  const audienceBase = primaryStore.radiusTargetKm * 3200;
  const totalNearbyAudience = isSambalpur ? audienceBase + 12500 : audienceBase + 8200;

  const headings = React.useMemo(() => isSambalpur ? [
    "Nuakhai & Raja Festival Campaign Recommendations Ready!",
    "Target Local Shoppers Near Gole Bazar & Sambalpur Outlets!",
    "Activate 1-Click Odisha Handloom Promotional Campaigns!",
    "Maximize Footfall with Dialect Captions & Regional Hashtags!",
    "Dynamic Location Intelligence Active for Your Store Radius!"
  ] : [
    "Upcoming Seasonal & Holiday Campaigns Ready for Launch!",
    "Target Active Customers Inside Your Store Service Area!",
    "Acquire Footfall Visitors with 1-Click Promo Recommendations!",
    "Engage Nearby Communities with Regional Ad Content!",
    "Geocultural Marketing Insights Dynamic for Your Local Radius!"
  ], [isSambalpur]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeadingIndex((prev) => (prev + 1) % headings.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [headings.length]);

  React.useEffect(() => {
    setHeadingIndex(0);
  }, [isSambalpur]);

  // 1-Click Auto Launch AI recommended Campaign for Raja Festival / Upcoming Festival
  const handleFastLaunchCampaign = async () => {
    setLoadingLaunch(true);
    try {
      const generatedName = isSambalpur ? "Raja Festival Handloom Splendor" : "Seasonal Festive Launch Splash";
      const generatedHeadline = isSambalpur ? "Celebrate Raja Festival in Traditional Sambalpuri Style! 🌸" : "Celebrate local flavor in style! ✨";
      const generatedCaption = isSambalpur
        ? "Pranam Sambalpur! 🌸 Bring home the authentic colors of handwoven handloom heritage this Raja Festival! Claim Flat 20% OFF on all gorgeous Sambalpuri designs & ethnic wears. Shop locally at Gole Bazar or browse our latest fashion collection online. #RajaFestival #SambalpuriStyle #OdishaWeaves #ShopLocal"
        : "Step up your festive gifting with premium items. Unveiling 20% OFF on our finest collections for the upcoming local celebration! Visit our outlet today. #DealsNearby #ShopLocal #FestiveSeason #GrabNow";

      await apiService.createCampaign({
        name: generatedName,
        goal: 'Footfall Generation & Store Visits',
        festival: isSambalpur ? 'Raja Festival' : 'Upcoming Seasonal Feast',
        audience: 'Local shoppers, handloom admirers, women 18-45 within 5km radius',
        radiusKm: primaryStore.radiusTargetKm || 5,
        budget: 12000,
        offer: 'Flat 20% OFF on Ethnic Wear',
        tone: 'Warm & Cultural',
        platforms: ['Instagram', 'WhatsApp', 'Facebook'],
        headline: generatedHeadline,
        caption: generatedCaption,
        reach: 8900,
        engagement: 550,
        leads: 48,
        status: 'Active',
        roi: 340,
        createdAt: new Date().toISOString()
      });

      // Reload dashboard data
      dashboardService.saveCampaign({
        id: `camp-${Date.now().toString().slice(-4)}`,
        name: generatedName,
        goal: 'Footfall Generation & Store Visits',
        festival: isSambalpur ? 'Raja Festival' : 'Upcoming Seasonal Feast',
        audience: 'Local shoppers, handloom admirers, women 18-45 within 5km radius',
        radiusKm: primaryStore.radiusTargetKm || 5,
        budget: 12000,
        offer: 'Flat 20% OFF on Ethnic Wear',
        tone: 'Warm & Cultural',
        platforms: ['Instagram', 'WhatsApp', 'Facebook'],
        status: 'Active',
        reach: 8900,
        engagement: 550,
        leads: 48,
        roi: 340,
        startDate: new Date().toISOString().split('T')[0]
      });

      setLaunchedSuccess(true);
      setTimeout(() => {
        setLaunchedSuccess(false);
      }, 5000);
    } catch (e) {
      console.error("1-click launch error: ", e);
    } finally {
      setLoadingLaunch(false);
    }
  };

  // Recharts Analytics Datasets
  const hyperlocalPerformanceData = [
    { name: 'Mon', Reach: 4200, Engagement: 980, Leads: 52 },
    { name: 'Tue', Reach: 8900, Engagement: 2100, Leads: 110 },
    { name: 'Wed', Reach: 15600, Engagement: 3500, Leads: 198 },
    { name: 'Thu', Reach: 21000, Engagement: 4900, Leads: 280 },
    { name: 'Fri', Reach: 34500, Engagement: 7800, Leads: 450 },
    { name: 'Sat', Reach: 48900, Engagement: 11200, Leads: 680 },
    { name: 'Sun', Reach: totalReach || 54200, Engagement: (totalReach * 0.25).toFixed(0), Leads: totalLeads || 1240 }
  ];

  const predictiveFestivalData = [
    { name: 'Raja Festival', Reach: 28000, expectedRoiPercentage: 350, conversionPercentage: 4.8 },
    { name: 'Nuakhai Juhar', Reach: 35000, expectedRoiPercentage: 420, conversionPercentage: 5.6 },
    { name: 'Durga Puja', Reach: 42000, expectedRoiPercentage: 380, conversionPercentage: 4.2 },
    { name: 'Diwali Lights', Reach: 49000, expectedRoiPercentage: 440, conversionPercentage: 5.1 }
  ];

  const hourlyTractionData = [
    { hour: '09:00 AM', Inquiries: 12, Traffic: 45 },
    { hour: '12:00 PM', Inquiries: 28, Traffic: 92 },
    { hour: '03:00 PM', Inquiries: 42, Traffic: 130 },
    { hour: '05:00 PM', Inquiries: 110, Traffic: 390 },
    { hour: '07:00 PM', Inquiries: 195, Traffic: 512 },
    { hour: '09:00 PM', Inquiries: 85, Traffic: 220 }
  ];

  return (
    <div className="space-y-6 text-left" id="dashboard-home-rendered-suite">
      
      {/* Dynamic Welcome Heading and Quick Integration Badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome Back, {isSambalpur ? 'Sambalpur Outlet' : 'AdPulse Merchant'}</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider block">
              Pro Member
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
            Running tailored geocultural algorithms on <strong className="text-indigo-650">{primaryStore?.name || 'Sambalpur Main Outlet'}</strong>.
          </p>
        </div>


      </div>

      {/* Hero Welcome Box with Location-aware Action CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-900/40 shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="bg-indigo-500/25 border border-indigo-500/30 text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Location Intelligence Active: {isSambalpur ? 'Sambalpur, Odisha' : 'Live Area'}</span>
            </span>
            <div className="relative min-h-[56px] sm:min-h-[72px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={headingIndex}
                  initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                  className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white select-text w-full"
                >
                  {headings[headingIndex]}
                </motion.h2>
              </AnimatePresence>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-350 leading-relaxed max-w-2xl select-text">
              Target active shoppers inside your physical <strong>{primaryStore?.radiusTargetKm || 5}km Store Radius</strong> using regional cultural hashtags, dialect captions, and highly localized ad hooks.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onViewTab('generator')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-505/20 px-5 py-3 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                Open Smart AI Generator
              </button>
              <button
                onClick={() => onViewTab('stores')}
                className="bg-slate-900/80 hover:bg-black border border-white/10 text-slate-200 px-5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                Manage Store Locations
              </button>
            </div>
          </div>

          <div className="md:col-span-4 bg-indigo-900/30 backdrop-blur-md border border-indigo-505/20 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400 animate-bounce" />
              <strong className="text-xs font-extrabold tracking-wider uppercase text-indigo-300">1-Click Fast AI Launch</strong>
            </div>
            
            <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5 text-left">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none">Upcoming Festival Opportunity</p>
              <h4 className="text-sm font-black text-white truncate pt-1">{isSambalpur ? 'Raja Festival Celebration' : 'Seasonal Celebration'}</h4>
              <p className="text-[10px] text-slate-400 leading-tight pt-1">
                Recommend launch: <span className="text-emerald-400 font-bold">&ldquo;Flat 20% OFF Ethnic wear!&rdquo;</span>
              </p>
            </div>

            {launchedSuccess ? (
              <div className="bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Live Campaign Activated!
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFastLaunchCampaign}
                disabled={loadingLaunch}
                className="w-full bg-emerald-505 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black text-xs p-3 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                {loadingLaunch ? 'Publishing via Gemini API...' : 'Launch Recommended Campaign'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METRIC ROW: REAL BUSINESS DATA FEEL (Total Reach, Active Campaigns, Conversion %, Engagement %, Nearby Audience) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="metrics-live-intelligence-belt">
        
        {/* Core Metric 1: Total Reach */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reach</span>
            <span className="h-7 w-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}k` : totalReach}
            </h3>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="h-3 w-3 shrink-0" /> +18.4% local residents
            </span>
          </div>
        </div>

        {/* Core Metric 2: Active Campaigns */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</span>
            <span className="h-7 w-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">{activeCampaignsCount}</h3>
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5 mt-2">
              Currently broadcasted live
            </span>
          </div>
        </div>

        {/* Core Metric 3: Conversion % */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
            <span className="h-7 w-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">{conversionRate}%</h3>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="h-3 w-3 shrink-0" /> +0.4% versus regional avg
            </span>
          </div>
        </div>

        {/* Core Metric 4: Engagement % */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engagement %</span>
            <span className="h-7 w-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">{engagementRate}%</h3>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="h-3 w-3" /> Peak 05:00 PM - 09:00 PM
            </span>
          </div>
        </div>

        {/* Core Metric 5: Nearby Audience */}
        <div className="col-span-2 md:col-span-1 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nearby Audience</span>
            <span className="h-7 w-7 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {totalNearbyAudience.toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5 mt-2">
              Within {primaryStore?.radiusTargetKm || 5}km radius zone
            </span>
          </div>
        </div>

      </div>

      {/* THREE INTERACTIVE ANIMATED RECHARTS CHARTS BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Hyperlocal Delivery Analytics */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-50 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
                  <span>Hyperlocal Reach & Leads Progress</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Daily cumulative ad engagement within delivery circles</p>
              </div>
              <span className="text-[9.5px] bg-slate-50 text-slate-550 border border-slate-200/60 font-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Seven Days History
              </span>
            </div>

            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hyperlocalPerformanceData}>
                  <defs>
                    <linearGradient id="colorReachFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLeadsFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} />
                  <Area type="monotone" name="Ad Impressions (Reach)" dataKey="Reach" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReachFlow)" />
                  <Area type="monotone" name="Inquiries (Leads)" dataKey="Leads" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeadsFlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] text-slate-650 font-bold mt-4">
            <span className="text-slate-500 leading-tight">💡 Campaign optimizer indicates weekend ad templates with local language captions show a 2.5x higher conversions average.</span>
            <button
              onClick={() => onViewTab('generator')}
              className="bg-white hover:bg-slate-100 text-indigo-750 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 cursor-pointer transition-all text-[10px] font-black"
            >
              Tune Campaign Captions
            </button>
          </div>
        </div>

        {/* Chart 2: Regional Festivals Predictive ROI Analysis */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-50 pb-4 mb-4 text-left">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Geocultural Festival Index</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Predicted conversion & ROI multiplier for upcoming regional feasts</p>
            </div>

            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictiveFestivalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  <Bar dataKey="expectedRoiPercentage" name="Expected ROI Mutliplier %" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversionPercentage" name="Target Audience Conversion %" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 text-[10.5px]">
              <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 font-bold">
                <span className="text-slate-400 uppercase tracking-widest text-[9.5px]">Trending Festivity</span>
                <span className="text-indigo-650 bg-indigo-50 px-2 rounded-lg font-black">{isSambalpur ? 'Nuakhai Juhar' : 'Autumn Festival'}</span>
              </div>
              <div className="flex items-center justify-between py-1 font-bold">
                <span className="text-slate-400 uppercase tracking-widest text-[9.5px]">Peak Posting Hour</span>
                <span className="text-amber-755 text-amber-700 bg-amber-50 px-2 rounded-lg font-black">05:30 PM - 08:30 PM</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50 text-[10px] text-slate-450 font-bold flex items-center gap-1">
            <span className="text-emerald-505 text-emerald-600 font-black">● 4.2x ROI</span> Predicted for regional clothing & delicacies.
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 3: Live Hourly Customer Inquiries Heatmap */}
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
          <div className="border-b border-slate-50 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-indigo-505 text-indigo-600 shrink-0" />
              <span>Hourly Traffic & Engagement Spike Index</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Monitors nearby audience active times to recommend high-yield broadcasting hours</p>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyTractionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Line type="monotone" name="Foot Traffic Estimate" dataKey="Traffic" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Inquiries Received" dataKey="Inquiries" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Campaigns Quick Slider + Recommended Campaign Action (NEVER EMPTY) */}
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Active Local Targeted Campaigns
              </h3>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase">
                {activeCampaignsCount} Live
              </span>
            </div>

            <div className="space-y-3">
              {campaigns.filter(c => c.status === 'Active').map(camp => (
                <div key={camp.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 tracking-wide flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" /> LIVE BROADCAST
                    </span>
                    <span className="text-[9.5px] font-mono font-bold text-slate-500">RADIUS: {camp.radiusKm || 5}KM</span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-black text-slate-800 truncate">{camp.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium pt-0.5">Tone: {camp.tone || 'Warm'} &bull; Goal: {camp.goal || 'Footfall Generation'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/50 grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold text-slate-705">
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[8px] text-slate-400 font-bold block">REACH</span>
                      <strong className="text-slate-800 font-black">{camp.reach ? camp.reach.toLocaleString() : '1,200'}</strong>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[8px] text-slate-400 font-bold block">INQUIRIES</span>
                      <strong className="text-slate-800 font-black">{camp.leads || 24}</strong>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[8px] text-slate-400 font-bold block">ROI</span>
                      <strong className="text-emerald-600 font-black">+{camp.roi || 240}%</strong>
                    </div>
                  </div>
                </div>
              ))}

              {/* DYNAMIC, INTERACTIVE ALTERNATIVE REPLACES EMPTY STATE "No active push campaigns" */}
              {campaigns.filter(c => c.status === 'Active').length === 0 && (
                <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-4 animate-fade-in" id="recommended-interactive-campaign-box">
                  <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-xs font-black text-slate-850 block">Generate Your First Campaign in 1 Click!</strong>
                    <p className="text-[10.5px] text-slate-405 text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
                      Establish an immediate hyperlocal presence in {isSambalpur ? 'Sambalpur' : 'your city'} with our high-conversion festival templates.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={handleFastLaunchCampaign}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1 hover:scale-[1.01]"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Fast AI Auto-Launch
                    </button>
                    <button
                      onClick={() => onViewTab('generator')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer border border-slate-200"
                    >
                      Custom Setup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] text-slate-450 font-semibold leading-relaxed flex items-center gap-1">
            <span>🚀</span>
            <span><strong>Location Insight:</strong> Budharaja and Khetrajpur locations show strong clothing inquiry rates between 6 PM to 9 PM.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
