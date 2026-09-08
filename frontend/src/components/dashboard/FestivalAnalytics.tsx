import * as React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  ArrowUpRight, 
  Flame, 
  Award,
  Radar as RadarIcon,
  MapPin,
  Sliders,
  Tag,
  Copy,
  Check,
  Layers,
  Activity,
  Clock,
  Share2,
  Compass,
  Users,
  RefreshCw,
  ShoppingBag,
  Zap,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardService, FestivalInsight, Store } from '../../services/dashboardService';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface FestivalAnalyticsProps {
  onAutofillCampaign: (fest: string, offer: string, aud: string) => void;
}

export const FestivalAnalytics: React.FC<FestivalAnalyticsProps> = ({ onAutofillCampaign }) => {
  const [festivals, setFestivals] = React.useState<FestivalInsight[]>([]);
  const [selectedFestId, setSelectedFestId] = React.useState<string>('fest-nuakhai');
  const [stores, setStores] = React.useState<Store[]>([]);
  const [selectedRadiusKm, setSelectedRadiusKm] = React.useState<number>(5);
  const [regionFilter, setRegionFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [isScanning, setIsScanning] = React.useState<boolean>(false);
  const [hasCopiedTags, setHasCopiedTags] = React.useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = React.useState<string>("Just now");

  // Load registered stores & festival catalog
  React.useEffect(() => {
    const festList = dashboardService.getFestivals();
    setFestivals(festList);
    
    const storeList = dashboardService.getStores();
    setStores(storeList);

    if (storeList && storeList.length > 0) {
      const primary = storeList[0];
      if (primary.radiusTargetKm) {
        setSelectedRadiusKm(primary.radiusTargetKm);
      }
      // Auto-detect regional affinity
      const addr = (primary.address || '').toLowerCase();
      const sName = (primary.name || '').toLowerCase();
      if (addr.includes('sambalpur') || addr.includes('odisha') || addr.includes('bhubaneswar') || sName.includes('sambalpur')) {
        setRegionFilter('Odisha & East');
        setSelectedFestId('fest-nuakhai');
      }
      if (primary.category) {
        setCategoryFilter(primary.category);
      }
    }
  }, []);

  const primaryStore = stores[0] || {
    name: 'My Local Outlet',
    address: 'Configured Store Coordinates',
    category: 'Fashion & Apparel',
    radiusTargetKm: 5
  };

  // Filter festivals based on region and category
  const filteredFestivals = React.useMemo(() => {
    return festivals.filter(f => {
      const matchRegion = regionFilter === 'all' || f.region === 'All India' || f.region === regionFilter;
      const matchCategory = categoryFilter === 'all' || !f.categoryFit || f.categoryFit.some(cat => 
        cat.toLowerCase().includes(categoryFilter.toLowerCase()) || categoryFilter.toLowerCase().includes(cat.toLowerCase())
      );
      return matchRegion && matchCategory;
    });
  }, [festivals, regionFilter, categoryFilter]);

  // Selected festival fallback
  const selectedFest = React.useMemo(() => {
    return festivals.find(f => f.id === selectedFestId) || filteredFestivals[0] || festivals[0];
  }, [festivals, selectedFestId, filteredFestivals]);

  // Trigger interactive radar pulse scan
  const handleTriggerRadarScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  };

  // 1-Click Copy Hashtags
  const handleCopyHashtags = () => {
    if (selectedFest && selectedFest.trendingHashtags) {
      navigator.clipboard.writeText(selectedFest.trendingHashtags.join(' '));
      setHasCopiedTags(true);
      setTimeout(() => setHasCopiedTags(false), 2000);
    }
  };

  // Dynamic audience calculation based on radius slider and festival multiplier
  const estimatedAudience = Math.round(
    selectedRadiusKm * 18500 * (selectedFest ? (selectedFest.engagementMultiplier || 2.5) / 2 : 1.3)
  );
  const geofenceAreaSqKm = (Math.PI * selectedRadiusKm * selectedRadiusKm).toFixed(1);

  // Dynamic 5-Axis Radar Data comparing Local Baseline vs Festive Surge
  const radarData = React.useMemo(() => {
    const scores = selectedFest?.radarScores || {
      visualClicks: 90,
      whatsappShares: 85,
      storeFootfall: 88,
      leadConversion: 82,
      urgencyRate: 86
    };

    // Radius factor introduces realistic distance dampening/expansion
    const radiusMultiplier = selectedRadiusKm <= 5 ? 1.05 : selectedRadiusKm <= 10 ? 1.0 : 0.94;

    return [
      { subject: 'Local Search Surge', Baseline: 45, FestivalSurge: Math.min(100, Math.round(scores.visualClicks * radiusMultiplier)), fullMark: 100 },
      { subject: 'WhatsApp Shares', Baseline: 38, FestivalSurge: Math.min(100, Math.round(scores.whatsappShares * radiusMultiplier)), fullMark: 100 },
      { subject: 'In-Store Footfall Intent', Baseline: 52, FestivalSurge: Math.min(100, Math.round(scores.storeFootfall * radiusMultiplier)), fullMark: 100 },
      { subject: 'Direct Inquiries & Leads', Baseline: 40, FestivalSurge: Math.min(100, Math.round(scores.leadConversion * radiusMultiplier)), fullMark: 100 },
      { subject: 'Urgent Same-Day Delivery', Baseline: 35, FestivalSurge: Math.min(100, Math.round(scores.urgencyRate * radiusMultiplier)), fullMark: 100 }
    ];
  }, [selectedFest, selectedRadiusKm]);

  // Channel surge benchmark distribution
  const channelSurgeData = [
    { channel: 'WhatsApp Broadcasts', lift: '+52%', index: 92 },
    { channel: 'Meta Reels & Ads', lift: '+74%', index: 96 },
    { channel: 'Google Search / Maps', lift: '+61%', index: 88 },
    { channel: 'Local Direct Visits', lift: '+85%', index: 98 }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in" id="festival-analytics-tab-view">
      
      {/* Top Header & Live Radar Ping Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-900/40 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-indigo-500/25 border border-indigo-500/30 text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider inline-flex items-center gap-1.5 text-indigo-200">
                <RadarIcon className={`h-3.5 w-3.5 text-indigo-400 ${isScanning ? 'animate-spin' : 'animate-pulse'}`} />
                <span>Hyperlocal Trends Radar</span>
              </span>
              <span className="bg-emerald-500/20 border border-emerald-500/30 text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide inline-flex items-center gap-1 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Geo-Signals Active
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Festival Analytics & Regional Intent Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-medium">
              Real-time geocultural predictive telemetry. Scan footfall surges, regional dialect search momentum, and festival conversion spikes across your physical store radius.
            </p>
          </div>

          {/* Quick Scanner Telemetry Box */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Monitored Geofence</span>
              <strong className="text-sm font-black text-white block truncate max-w-[180px]">
                {primaryStore.name || 'Main Retail Outlet'}
              </strong>
              <span className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-indigo-400" /> {selectedRadiusKm}km Active Radius &bull; Last Scan: {lastScanTime}
              </span>
            </div>

            <button
              onClick={handleTriggerRadarScan}
              disabled={isScanning}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-60 shrink-0"
              title="Refresh radar coordinates and consumer demand signals"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Geofence Radius Controller & Dynamic Filters Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
          
          {/* Radius Geofence Tuner */}
          <div className="w-full lg:w-auto flex-1 max-w-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                <span>Geofence Store Radius:</span>
                <span className="text-indigo-600 text-sm font-black font-mono ml-1">{selectedRadiusKm} km</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold font-mono">
                Covering {geofenceAreaSqKm} sq. km
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={selectedRadiusKm}
              onChange={(e) => setSelectedRadiusKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
              <span>1 km (Hyperlocal Walk-in)</span>
              <span>5 km (Standard Town)</span>
              <span>15 km (Suburban Ring)</span>
              <span>25 km (Metro Corridor)</span>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between sm:justify-start">
            <div className="bg-indigo-50/70 border border-indigo-100 px-3.5 py-2 rounded-2xl text-left">
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider block">Estimated Local Reach</span>
              <strong className="text-base font-black text-indigo-950">{estimatedAudience.toLocaleString()}</strong>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 px-3.5 py-2 rounded-2xl text-left">
              <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider block">Festive Footfall Intent</span>
              <strong className="text-base font-black text-emerald-950">
                {selectedFest ? `${selectedFest.engagementMultiplier}x Multiplier` : '3.0x'}
              </strong>
            </div>
          </div>

        </div>

        {/* Region & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">Region:</span>
            {[
              { id: 'all', label: 'All India' },
              { id: 'Odisha & East', label: 'Odisha & East' },
              { id: 'North', label: 'North' },
              { id: 'West', label: 'West' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRegionFilter(r.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  regionFilter === r.id 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Category Vertical Dropdown */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Vertical:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Retail Categories</option>
              <option value="Fashion & Apparel">Fashion & Apparel</option>
              <option value="Jewelry">Jewelry & Filigree</option>
              <option value="Food & Sweets">Food & Sweets</option>
              <option value="Grocery">Grocery & Provisions</option>
              <option value="Electronics">Electronics & Appliances</option>
              <option value="Beauty & Salon">Beauty, Salon & Henna</option>
            </select>
          </div>

        </div>
      </div>

      {/* Festival Cards Horizontal Selectable Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredFestivals.map(fest => {
          const isSelected = selectedFest?.id === fest.id;
          return (
            <button
              key={fest.id}
              onClick={() => setSelectedFestId(fest.id)}
              className={`p-4.5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white border-transparent shadow-lg shadow-indigo-200 scale-[1.01]'
                  : 'bg-white border-slate-150 text-slate-800 hover:border-indigo-300 hover:bg-slate-50/80 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className={`h-4 w-4 ${isSelected ? 'text-indigo-200' : 'text-indigo-600'}`} />
                    <span className={`text-[10px] font-black uppercase font-mono tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {fest.date}
                    </span>
                  </div>

                  {fest.daysRemaining !== undefined && (
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : fest.daysRemaining <= 15 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      {fest.daysRemaining <= 15 ? `In ${fest.daysRemaining} days` : `In ${fest.daysRemaining}d`}
                    </span>
                  )}
                </div>

                <div className="mt-3.5">
                  <h4 className="text-sm font-black tracking-tight leading-tight line-clamp-1">{fest.name}</h4>
                  {fest.regionalName && (
                    <p className={`text-[10px] font-bold mt-0.5 truncate ${isSelected ? 'text-indigo-150' : 'text-slate-400'}`}>
                      {fest.regionalName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold">
                <span className={`flex items-center gap-1 font-extrabold ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  <span>+{fest.historicalRoi}% ROI</span>
                </span>
                <span className={`text-[9.5px] px-2 py-0.5 rounded-lg ${isSelected ? 'bg-indigo-500/40 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {fest.region}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Intelligence & Interactive Radar Section */}
      {selectedFest && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Details Workspace (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            
            {/* Festival Header and 1-Click Launch Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {selectedFest.region} Intelligence &bull; {selectedFest.date}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2 flex items-center gap-2 tracking-tight">
                  <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                  <span>{selectedFest.name}</span>
                </h3>
                {selectedFest.regionalName && (
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{selectedFest.regionalName}</p>
                )}
              </div>

              <button
                onClick={() => onAutofillCampaign(
                  `${selectedFest.name} Local Boost`,
                  selectedFest.recommendedOffer,
                  `${selectedFest.trendingProducts[0] || 'Local shoppers'} within ${selectedRadiusKm}km`
                )}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Draft Campaign in Copilot</span>
              </button>
            </div>

            {/* Cultural Context & Peak Shopping Window */}
            {selectedFest.culturalHook && (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-1 text-xs">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block">
                  Cultural Context & Footfall Narrative
                </span>
                <p className="text-slate-700 font-semibold leading-relaxed">
                  {selectedFest.culturalHook}
                </p>
                {selectedFest.peakWindow && (
                  <p className="text-[11px] font-black text-indigo-700 pt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Peak Buying Surge Window: {selectedFest.peakWindow}
                  </p>
                )}
              </div>
            )}

            {/* Recommended Offer Promo Box */}
            <div className="bg-gradient-to-r from-indigo-50 via-indigo-50/60 to-purple-50 p-5 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">
                Recommended Local Retail Offer Promo
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                {selectedFest.recommendedOffer}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Empirical historical sales data shows this hook delivers a <strong>{selectedFest.engagementMultiplier}x multiplier lift</strong> in local inquiries and customer walk-ins.
              </p>
            </div>

            {/* Grid 2x2: Trending Goods & Trending Regional Hashtags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Trending In-Demand Products */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Top In-Demand Products</span>
                </span>
                
                <div className="space-y-2">
                  {selectedFest.trendingProducts.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs font-extrabold text-slate-800 bg-white p-2 rounded-xl border border-slate-100">
                      <span className="h-5 w-5 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-[10px] font-mono font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Hashtag Cloud */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Trending Local Hashtags</span>
                    </span>

                    <button
                      onClick={handleCopyHashtags}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy all hashtags to clipboard"
                    >
                      {hasCopiedTags ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(selectedFest.trendingHashtags || ['#LocalFest', '#DealsNearby', '#ShopLocal']).map((tag, i) => (
                      <span 
                        key={i} 
                        className="bg-white text-slate-700 border border-slate-200 text-[10.5px] font-bold px-2.5 py-1 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-semibold pt-2">
                  🔥 Search frequency up +320% in nearby radius.
                </p>
              </div>

            </div>

            {/* GenAI Strategic Tip Banner */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-200 flex items-start gap-3.5 shadow-sm">
              <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <span className="text-[9.5px] font-black text-indigo-300 uppercase tracking-widest block">
                  AdPulse GenAI Hyperlocal Execution Tip
                </span>
                <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                  {selectedFest.aiTip}
                </p>
              </div>
            </div>

          </div>

          {/* Right Visual Trends Radar & Surge Benchmarks (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 5-Axis Interactive Radar Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center space-y-4">
              <div className="text-left space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <RadarIcon className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Channel Surge Radar</span>
                  </h4>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-black px-2 py-0.5 rounded-full uppercase">
                    5-Axis Index
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-medium">
                  Comparing standard regional baseline (Blue) against <strong className="text-indigo-600">{selectedFest.name}</strong> demand spike (Purple).
                </p>
              </div>

              {/* Recharts Radar Visualization */}
              <div className="h-[280px] w-full flex items-center justify-center font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" fontSize={9} stroke="#64748b" tick={{ fill: '#475569', fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} stroke="#cbd5e1" />
                    <Radar 
                      name="Baseline Demand" 
                      dataKey="Baseline" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.12} 
                    />
                    <Radar 
                      name={`${selectedFest.name} Surge`} 
                      dataKey="FestivalSurge" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.35} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: 11, 
                        borderRadius: 14, 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontWeight: 'bold'
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-5 text-[10.5px] font-bold pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> Baseline Activity
                </span>
                <span className="flex items-center gap-1.5 text-indigo-600 font-black">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block" /> Festive Surge Volume
                </span>
              </div>
            </div>

            {/* Channel Surge Lift Benchmarks */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Channel Conversion Lift</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  Near {primaryStore.name || 'Store'}
                </span>
              </div>

              <div className="space-y-2.5">
                {channelSurgeData.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">{item.channel}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Predicted conversion index</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        {item.lift} Lift
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onAutofillCampaign(
                    `${selectedFest.name} Festive Boost Drive`,
                    selectedFest.recommendedOffer,
                    selectedFest.trendingProducts[0] || 'Local consumers'
                  )}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <span>Launch 1-Click Festive Campaign</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
