import * as React from 'react';
import { 
  Target, 
  Map, 
  TrendingUp, 
  Users, 
  Sparkles, 
  ArrowRight, 
  MousePointer, 
  MapPin, 
  CheckCircle, 
  Lock, 
  Coins, 
  Share2, 
  PhoneCall, 
  ExternalLink,
  Smartphone,
  BarChart3,
  Flame,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onLaunchPortal: (mode?: 'login' | 'register') => void;
}

export function LandingPage({ onLaunchPortal }: LandingPageProps) {
  const [scrollY, setScrollY] = React.useState(0);
  const [radius, setRadius] = React.useState<number>(1000); // 500 | 1000 | 1500 meters
  const [ticketValue, setTicketValue] = React.useState<number>(45); // Average transaction value
  const [customerClickRate, setCustomerClickRate] = React.useState<number>(5.5); // Local Ad CTR%
  const [simulationCategory, setSimulationCategory] = React.useState<'cafe' | 'boutique' | 'gym' | 'pharmacy'>('cafe');
  const [adVariant, setAdVariant] = React.useState<number>(0);

  // Monitor scroll height for dynamic navbar blurs & interactive scroll animations
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Total page height scroll progress tracker
  const [scrollProgress, setScrollProgress] = React.useState(0);
  React.useEffect(() => {
    const handleScrollProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  // Map simulated hotspots for each radius
  const hotspotsData = {
    500: { customers: 1240, activeCrowds: 'High density near Central Station', estimatedReaches: '3,800 impacts' },
    1000: { customers: 4890, activeCrowds: 'High density near Main Plaza and Tech Hub', estimatedReaches: '14,200 impacts' },
    1500: { customers: 9810, activeCrowds: 'Expansive radius covering City Park, 4 Tech Campuses & Metro West', estimatedReaches: '34,500 impacts' }
  };

  const adCopyTemplates = {
    cafe: [
      { text: "☕ Fresh espresso aromatic roast just pulled at Blue Cup Roasthouse! Mention 'MAPS' for 15% off next 40 mins.", tag: "Flash Promotion", ctr: "8.4%" },
      { text: "🌧️ Rainy day special: Free warm mini-croissant with every medium mocha. Only 450m from you!", tag: "Hyperlocal Weather Alert", ctr: "9.2%" }
    ],
    boutique: [
      { text: "👗 Velvet & Lace Boutique: Hand-finished boutique wear restocked! 15 exclusive jackets left. Drop inside!", tag: "Scarcity Drive", ctr: "7.1%" },
      { text: "👜 Flash 2-hour sale on weekend handbags! We are right next to the Starbucks on 4th Ave.", tag: "Local Radius Boost", ctr: "6.8%" }
    ],
    gym: [
      { text: "🏋️ Local Gym Pass: Free 3-day premium guest code for block neighbors. Active for next 2 hours!", tag: "Community Offer", ctr: "5.9%" },
      { text: "💪 Post-work sweat? Fast track circuit classes starting at 5:30 & 6:30. Claim active spot.", tag: "Time-Sensitive Trigger", ctr: "6.2%" }
    ],
    pharmacy: [
      { text: "🌱 Direct Care Wellness: Organic premium health sets 20% off. Local delivery inside 1.5km!", tag: "Regional Wellness", ctr: "4.9%" },
      { text: "🧴 Free expert skin analysis today. Skip lines, book with local counselor instantly.", tag: "Expert Advisory", ctr: "5.1%" }
    ]
  };

  // ROI Calculator Calculations
  const calculatedStats = React.useMemo(() => {
    const baseRegionalPop = radius === 500 ? 12000 : radius === 1000 ? 38000 : 85000;
    // Click through and in-store conversion simulation
    const simulatedClicks = Math.floor(baseRegionalPop * (customerClickRate / 100));
    const simulatedFootTraffic = Math.floor(simulatedClicks * 0.18); // 18% of clickers drop inside
    const estimatedNewRevenue = simulatedFootTraffic * ticketValue;
    return {
      clicks: simulatedClicks,
      footSpike: simulatedFootTraffic,
      revenue: estimatedNewRevenue
    };
  }, [radius, ticketValue, customerClickRate]);

  // Utility to scroll smoothly to section ID
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-800 min-h-screen relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-900" id="landing-main-root">
      
      {/* SCROLL DEPTH PROGRESS STRIPE */}
      <div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-emerald-500 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
        id="scroll-marker-strip"
      />

      {/* FLOATING STICKY HEADER */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrollY > 20 
            ? 'bg-white/85 backdrop-blur-md shadow-md py-3.5 border-b border-slate-200/60' 
            : 'bg-transparent py-5'
        }`}
        id="landing-sticky-navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo and descriptor */}
          <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-950 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Target className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-indigo-700 uppercase leading-none block">Hyperlocal</span>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">AD PULSE</h2>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
            <button 
              onClick={() => scrollToSection('features-section')} 
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              Technology
            </button>
            <button 
              onClick={() => scrollToSection('radar-simulation-section')} 
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              Interactive Radar
            </button>
            <button 
              onClick={() => scrollToSection('roi-model-section')} 
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              ROI Estimator
            </button>
            <button 
              onClick={() => scrollToSection('trust-clients-section')} 
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              Success Stories
            </button>
          </nav>

          {/* Nav Actions CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onLaunchPortal('login')}
              className="px-4.5 py-2 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-black cursor-pointer transition-all"
            >
              Merchant Sign In
            </button>
            <button 
              onClick={() => onLaunchPortal('register')}
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Partner Onboarding</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* PRIMARY DESIGNED HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-radial-gradient from-white via-slate-50 to-indigo-50/20 overflow-hidden" id="hero-hero-section">
        {/* Abstract background blobs */}
        <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] opacity-80 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column Text block */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              {/* Sparkle Tag */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold leading-none select-none"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                <span>Next-Gen Store Traffic Driver</span>
              </motion.div>

              {/* Title Header */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] whitespace-pre-line"
              >
                Drive Active Local Customers{'\n'}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-750 to-indigo-900">
                  Straight to Your Registers
                </span>
              </motion.h1>

              {/* Tagline Paragraph */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl leading-relaxed"
              >
                Stop burning marketing budget on generic digital noise. **Hyperlocal Ad Pulse** gives brick-and-mortar merchants the ability to configure regional ad radius circles, deploy generative high-converting copy in seconds, and track incremental physical foot traffic automatically.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3"
              >
                <button 
                  onClick={() => onLaunchPortal('register')}
                  className="px-7 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Launch Merchant Console</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </button>

                <button 
                  onClick={() => scrollToSection('radar-simulation-section')}
                  className="px-6 py-4 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <span>Interactive Map Demo</span>
                </button>
              </motion.div>

              {/* Mini trust checklist */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 border-t border-slate-200/60"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Setup standard in 4 mins</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Staging JWT auth ready</span>
                </div>
              </motion.div>

            </div>

            {/* Right Column: Visual Mockup Showcase / Live Activity Sandbox */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
              id="hero-dashboard-mockup"
            >
              {/* Decorative radial pulsing outline */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-80 animate-pulse pointer-events-none" />

              <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl relative border border-slate-800 text-left overflow-hidden">
                {/* Simulated Menu Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                  <div className="px-3 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-bold font-mono text-slate-400">
                    AD_SYS_SIMULATION: ON_CHAIN
                  </div>
                </div>

                {/* Dashboard stats showcase */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
                    <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Merchant Store Target Area</p>
                    <div className="flex items-center justify-between mt-1">
                      <h4 className="text-lg font-black text-white">Central Market Sq. • Grid 4</h4>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">
                        1.5km Radius Active
                      </span>
                    </div>
                  </div>

                  {/* High visual widgets grid */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Localized Click-through</span>
                      <p className="text-2xl font-black text-white mt-1">8.94%</p>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <TrendingUp className="h-3 w-3 shrink-0" /> +238% industry base
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Local Audience Size</span>
                      <p className="text-2xl font-black text-white mt-1">14,240 <span className="text-xs text-slate-400">units</span></p>
                      <span className="text-[10px] text-indigo-400 font-bold">12 Active Micro-regions</span>
                    </div>
                  </div>

                  {/* Live Active ad rendering simulation box */}
                  <div className="bg-indigo-950/80 rounded-2xl p-4 border border-indigo-500/20 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-400 fill-amber-400" /> Active Generating Draft
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold">DISPATCH READY</span>
                    </div>
                    <p className="text-xs text-indigo-50 leading-relaxed font-semibold italic">
                      "Hungry shoppers inside Central Plaza Mall: Take a quick 3-min walk down to Blue Cup Bistro. Mention code RADAR for a hot artisanal croissant on us!"
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-indigo-300/80 pt-2 border-t border-indigo-900/40">
                      <span>Targeting: Consumers within 400m</span>
                      <span>CTR Forecast: Excellent (9.4%)</span>
                    </div>
                  </div>
                </div>

                {/* Simulated telemetry code tag */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>SSL STATE: ESTABLISHED</span>
                  <span>MERCHANT_ID: AUTH_PENDING</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID / TARGET AREA (SCROLL EFFECT FEATURE HIGHLIGHTS) */}
      <section className="py-20 bg-white relative border-y border-slate-200/50" id="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Enterprise Technology</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Complete Retail Campaign Stack Built for Map Conversion
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base">
              Say goodbye to complicated marketing tools that require media agencies. Our streamlined local merchant tool suite acts instantly.
            </p>
          </div>

          {/* Features Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature Line 1: Ultra precision mapping */}
            <div className="bg-slate-50 rounded-2xl p-6.5 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-350 text-left group">
              <div className="h-12 w-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hyperlocal Map Radiuses</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Define narrow geographic corridors on maps (500m to 1.5km squares) right around your store doors. Restrict campaigns exclusively to active local devices already inside.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:gap-3 transition-all cursor-pointer" onClick={() => scrollToSection('radar-simulation-section')}>
                <span>Test dynamic circle radar</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature Line 2: Copy generator */}
            <div className="bg-slate-50 rounded-2xl p-6.5 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-350 text-left group">
              <div className="h-12 w-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">One-Click GenAI Ad Copy</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Instantly generate high CTR copy variants specifically tuned to trigger intense local shopping urge. Input your industry, select target tone, and let our simulator produce click-ready copy.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:gap-3 transition-all cursor-pointer" onClick={() => scrollToSection('radar-simulation-section')}>
                <span>Mock customized copy generator</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Feature Line 3: Direct Analytics */}
            <div className="bg-slate-50 rounded-2xl p-6.5 border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all duration-350 text-left group">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Foot Traffic Uplift Math</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Measure physical store walk-ins and dynamic spend increments through smart coupon code checkouts. Know exactly what local block brought the premium margins today.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:gap-3 transition-all cursor-pointer" onClick={() => scrollToSection('roi-model-section')}>
                <span>Simulate your store ROI potential</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* DYNAMIC SCROLL RADAR MAP SECTION (INTERACTIVE DEMO) */}
      <section className="py-20 bg-slate-50 overflow-hidden relative" id="radar-simulation-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Box: Controls & Dynamic Radar Data Read */}
            <div className="lg:col-span-5 text-left space-y-6">
              
              <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                <MapPin className="h-3 w-3" /> Live Simulator Sandbox
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Simulate Your Store's Interactive Radar Radius
              </h2>
              
              <p className="text-slate-600 text-sm leading-relaxed">
                Click a distance threshold below. Watch the radius bubble expand covering physical blocks, dynamically compiling counts of immediate localized shoppers, and forecasting geographic CTR performance metrics!
              </p>

              {/* Radius Control Selector Buttons */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Select Radius Parameter:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 1500].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadius(r)}
                      className={`py-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                        radius === r 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100Scale' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {r} Meters ({r === 500 ? '0.5km' : r === 1000 ? '1.0km' : '1.5km'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Hotspot Readout statistics panel */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">Interactive Feedback Report</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Estimated Live Users</span>
                    <p className="text-xl font-black text-slate-800">{hotspotsData[radius as 500 | 1000 | 1500].customers} People</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Target Hits Forecast</span>
                    <p className="text-xl font-black text-indigo-700">{hotspotsData[radius as 500 | 1000 | 1500].estimatedReaches}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">High Crowd Hotspots Covered</span>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{hotspotsData[radius as 500 | 1000 | 1500].activeCrowds}</p>
                </div>
              </div>

            </div>

            {/* Right Box: Dynamic Radar Visual Mapping Board */}
            <div className="lg:col-span-7 relative">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
                
                {/* Simulated Map Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800 z-10">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Map className="h-4 w-4 text-indigo-400 animate-pulse" /> 地理 Location Grounding Simulator
                  </span>
                  <span className="font-mono text-[10px] font-semibold bg-indigo-950 text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-900/40">
                    LAT_LNG: 12.9716, 77.5946
                  </span>
                </div>

                {/* Simulated Geographic Grid with radar circles */}
                <div className="absolute inset-x-0 top-18 bottom-12 flex items-center justify-center pointer-events-none">
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-70" />
                  
                  {/* Outer Map Road graphics representation */}
                  <div className="absolute w-[80%] h-0.5 bg-slate-800/20 top-1/2 left-0" />
                  <div className="absolute h-[80%] w-0.5 bg-slate-800/20 left-1/2 top-0" />
                  <div className="absolute w-[60%] h-0.5 bg-slate-800/20 top-[30%] rotate-12" />
                  <div className="absolute w-[60%] h-0.5 bg-slate-800/20 top-[70%] -rotate-12" />

                  {/* Pulsing beacon center (Your Retail Store!) */}
                  <div className="absolute h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center animate-ping z-10" />
                  <div className="absolute h-4 w-4 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center z-20 shadow-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                  </div>
                  <div className="absolute translate-y-6 text-[10px] font-bold text-indigo-200 tracking-wide uppercase bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 z-20">
                    YOUR MERCHANT HUB
                  </div>

                  {/* Dynamic radius indicator bubble - Animates with state */}
                  <div 
                    className="absolute rounded-full border border-indigo-500 bg-indigo-500/10 flex items-center justify-center transition-all duration-500 ease-out z-0"
                    style={{
                      width: radius === 500 ? '160px' : radius === 1000 ? '300px' : '440px',
                      height: radius === 500 ? '160px' : radius === 1000 ? '300px' : '440px'
                    }}
                  >
                    <div className="text-[10px] font-mono select-none text-indigo-300 font-bold bg-slate-950/90 px-2 py-0.5 rounded border border-indigo-500/30 scale-90 translate-y-12">
                      Target Boundary: {radius}m
                    </div>
                  </div>

                  {/* Local Consumers Dots (Hotspot cluster nodes inside bubble) */}
                  <div className="absolute -translate-y-14 -translate-x-12 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-950 animate-bounce cursor-help" />
                  <div className="absolute translate-y-16 translate-x-14 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-950" />
                  <div className="absolute -translate-y-4 translate-x-20 h-2 w-2 rounded-full bg-emerald-400/80 border border-slate-950" />
                  
                  {/* External cluster outside of narrow radiuses */}
                  <div className="absolute -translate-y-36 translate-x-32 h-2 w-2 rounded-full bg-amber-400/60 border border-slate-950" style={{ opacity: radius < 1500 ? 0.3 : 1 }} />
                  <div className="absolute translate-y-32 -translate-x-36 h-2 w-2 rounded-full bg-amber-400/60 border border-slate-950" style={{ opacity: radius < 1500 ? 0.3 : 1 }} />
                </div>

                {/* Simulation Control Toolbar inside map */}
                <div className="mt-auto relative z-10 bg-slate-950/90 p-3 rounded-2xl border border-slate-800/80 grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400 font-bold leading-none">
                  <div className="p-1 border-r border-slate-850">
                    <span className="text-indigo-400 block mb-1">STATION</span>
                    <p className="text-white text-[11px]">Online (500m)</p>
                  </div>
                  <div className="p-1 border-r border-slate-850">
                    <span className="text-indigo-400 block mb-1">PLAZA MALL</span>
                    <p className="text-white text-[11px]">Online (1km)</p>
                  </div>
                  <div className="p-1 border-r border-slate-850">
                    <span className="text-indigo-400 block mb-1">CAMPUSES</span>
                    <p className="text-white text-[11px]">{radius >= 1500 ? 'Captured' : 'Out of range'}</p>
                  </div>
                  <div className="p-1">
                    <span className="text-indigo-400 block mb-1">CITY PARK</span>
                    <p className="text-white text-[11px]">{radius >= 1500 ? 'Captured' : 'Out of range'}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* SIMULATED AD COPY GENERATOR SPOTLIGHT ROW */}
          <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-widest bg-indigo-50 px-2.5 py-1 rounded">Instantly Generated Creative Copy</span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Copywriter Simulator</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                Select your industry style target below to instantly inspect forecasted click-rates on active local consumer hardware screens.
              </p>

              {/* Simulation Selectors */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { id: 'cafe', label: '☕ Café / Bistro' },
                  { id: 'boutique', label: '👗 Boutique Wear' },
                  { id: 'gym', label: '🏋️ Fitness Centric' },
                  { id: 'pharmacy', label: '🌱 Wellness Store' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSimulationCategory(item.id as any);
                      setAdVariant(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      simulationCategory === item.id 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-350'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Toggle template variant */}
              <div className="flex items-center gap-2 pt-1 text-slate-500 text-xs">
                <span>Variant Toggle:</span>
                <button 
                  onClick={() => setAdVariant(0)}
                  className={`px-2.5 py-1 rounded text-[10px] font-extrabold border cursor-pointer ${adVariant === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  Version A
                </button>
                <button 
                  onClick={() => setAdVariant(1)}
                  className={`px-2.5 py-1 rounded text-[10px] font-extrabold border cursor-pointer ${adVariant === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  Version B
                </button>
              </div>
            </div>

            {/* Simulated Smartphone Creative View */}
            <div className="lg:col-span-6">
              <div className="w-full max-w-sm mx-auto bg-slate-950 rounded-[36px] p-3.5 border-4 border-slate-700 shadow-xl relative overflow-hidden">
                {/* Smartphone ear speaker */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-slate-700 rounded-b-2xl z-20 flex items-center justify-center">
                  <span className="w-8 h-1 bg-slate-800 rounded-full" />
                </div>

                <div className="bg-slate-900 rounded-[28px] p-4 pt-8 min-h-[220px] text-left flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle map backdrop simulating mobile app overlay */}
                  <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-slate-900 to-indigo-950/30 -z-10" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">🎯</div>
                      <div>
                        <span className="text-[10px] text-indigo-300 block font-bold leading-none tracking-wide">Sponsored Nearby Offer</span>
                        <p className="text-[9px] text-slate-400 font-mono leading-none mt-0.5">Dispatched within {radius}m radius</p>
                      </div>
                    </div>

                    {/* Copied output text body */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-white leading-relaxed font-medium">
                      "{adCopyTemplates[simulationCategory][adVariant].text}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded">
                      🏷️ {adCopyTemplates[simulationCategory][adVariant].tag}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                      CTR Forecast: {adCopyTemplates[simulationCategory][adVariant].ctr}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RETAIL INCREMENTAL REVENUE ESTIMATOR (SLIDERS WORKSPACE) */}
      <section className="py-20 bg-white relative" id="roi-model-section">
        {/* Subtle decorative circles */}
        <div className="absolute top-20 right-[-10%] w-[350px] h-[350px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Calculated Growth Estimates</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interactive Revenue Math: See Your Store's Local Lift
            </h2>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">
              Adjust transaction indicators and click forecast limits below. Discover how targeting narrow corridors around your physical doors increases retail traffic and ROI.
            </p>
          </div>

          {/* Interactive Calculator Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left Box: Controls & Parameter Modifiers */}
            <div className="lg:col-span-6 bg-slate-50 border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 text-left flex flex-col justify-between">
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-950">Configure Store Performance Factors</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Our algorithm processes physical radius statistics to output projected walk-ins. Slide coordinates to match your typical daily averages.
                </p>
              </div>

              {/* Sliders Container */}
              <div className="space-y-6">
                
                {/* Parameter 1: Ticket Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Average Transaction Spend Limit:</span>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-extrabold">
                      ${ticketValue} USD
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={ticketValue}
                    onChange={(e) => setTicketValue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold font-mono">
                    <span>$10 Min</span>
                    <span>$100 Avg Spend</span>
                    <span>$200 Max</span>
                  </div>
                </div>

                {/* Parameter 2: Click-through CTR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Estimated Local CTR (Pulse Level):</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-extrabold">
                      {customerClickRate}% CTR
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="1.5"
                    max="15"
                    step="0.5"
                    value={customerClickRate}
                    onChange={(e) => setCustomerClickRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold font-mono">
                    <span>1.5% Standard Industry</span>
                    <span>8.5% Pulse Level Optimized</span>
                    <span>15% Max Peak Out</span>
                  </div>
                </div>

                {/* Grid Parameter Indicator for Radius */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Assumed Target Hub Perimeter:</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{radius} Meters ({radius === 1500 ? '1.5km Max Coverage' : radius === 1000 ? '1.0km Mid' : '0.5km Inner'})</p>
                  </div>
                  <button 
                    onClick={() => setRadius(r => r === 1500 ? 500 : r === 1000 ? 1500 : 1000)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg cursor-pointer hover:bg-indigo-100 flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" /> Toggle
                  </button>
                </div>

              </div>

              {/* Verified Math Footnote */}
              <div className="pt-4 border-t border-slate-200/60 text-[10.5px] font-medium text-slate-400 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> Secure staging simulator calculation is purely client-side.
              </div>

            </div>

            {/* Right Box: Dynamic Output Mathematical Cards Grid */}
            <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-6 sm:p-8 text-left text-white flex flex-col justify-between border border-slate-800">
              
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">Projected Business Uplift Forecast</span>
                <h3 className="text-xl font-bold text-white tracking-tight">Est. Monthly Incremental Foot Traffic Lift</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Applying the conservative conversion multipliers of 18% store-walk-ins from dynamic localized clicks, here are your mathematical projections:
                </p>
              </div>

              {/* Numbers Showcase Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                
                {/* Click Metrics Card */}
                <div className="bg-slate-950/70 py-4 px-5 rounded-2xl border border-slate-800 text-left">
                  <div className="flex items-center gap-2 text-indigo-400 mb-1">
                    <MousePointer className="h-4 w-4 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Localized Click Counts</span>
                  </div>
                  <p className="text-3xl font-black text-white">{calculatedStats.clicks.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">High-affinity local screens hit</span>
                </div>

                {/* Foot Traffic Metric Card */}
                <div className="bg-slate-950/70 py-4 px-5 rounded-2xl border border-slate-800 text-left">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider">In-Store Visitors</span>
                  </div>
                  <p className="text-3xl font-black text-white">+{calculatedStats.footSpike.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Estimated store entries block</span>
                </div>

              </div>

              {/* Large Metric Panel: Estimated Revenue Uplift */}
              <div className="p-5.5 bg-gradient-to-tr from-indigo-900 to-indigo-950 rounded-2xl border border-indigo-500/25 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-30 pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <Coins className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" /> Anticipated Monthly Net Margin Spike
                    </span>
                    <p className="text-4xl font-black text-white tracking-tight">
                      ${calculatedStats.revenue.toLocaleString()} <span className="text-xs text-indigo-200">USD</span>
                    </p>
                    <span className="text-[10.5px] text-indigo-200/80 font-semibold block">Based on an average of ${ticketValue} typical ticket checkout checkouts</span>
                  </div>
                  
                  <button 
                    onClick={() => onLaunchPortal('register')}
                    className="self-start sm:self-auto px-4 py-3 bg-white text-indigo-800 font-black text-xs rounded-xl shadow-md hover:bg-indigo-50 cursor-pointer shrink-0 transition-all flex items-center gap-1"
                  >
                    <span>Claim Local Area</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Terminal Signature */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between items-center leading-none">
                <span>FORMULS_VAL: TRFC_SIMULATION_V1.9</span>
                <span>STATUS: CALIBRATED</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* RETAIL MERCHANT TESTIMONIALS / PROOF GRID (SUCCESS STORIES) */}
      <section className="py-20 bg-slate-50 relative border-t border-slate-200/60" id="trust-clients-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Enterprise Merchant Proof</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Thousands of Active Retail Store Fronts Trust Ad Pulse
            </h2>
            <p className="text-slate-600 font-semibold text-sm sm:text-base">
              See how localized micro-radius campaigns triggered huge incremental margins without raising advertisement spending caps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Story 1 */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
              <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                "We set up a tight 500m campaign around our specialty bakery during quiet Tuesdays. By targeting office workers getting lunch with an active 2-for-1 cookie coupon, storefront queues instantly doubled! The direct maps grounding APIs allowed seamless local targeting."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center text-xs">
                  KB
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Kavitha B. • Owner</h5>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Artisan Sugar Crusts</span>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
              <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                "Running a multi-location fitness studio meant targeting regional prospects was high-cost. Ad Pulse let us establish highly specific 1km circles centered directly on physical neighborhood communities. Our weekly class signup rates rocketed by over 140%!"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center text-xs">
                  MH
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Marc H. • General Administrator</h5>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Apex Circuit Studios</span>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
              <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                "Ad Pulse has made local digital media accessible. Running instant, localized promos directly from my cell phone means we never burn cash on unmeasured reach. Our foot traffic numbers are at and above record highs month over month."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 font-black flex items-center justify-center text-xs">
                  SN
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Sonia N. • Marketing Director</h5>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Flora & Bloom Boutique</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION (GRID SECTOR INTERACTION LINK TO LOGIN/REGISTER) */}
      <section className="py-24 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white relative overflow-hidden" id="final-cta-block">
        
        {/* Decorative background grid and blurs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-700 rounded-full blur-[140px] opacity-40 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-indigo-100 text-xs font-semibold backdrop-blur-md select-none">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-200" />
            <span>Spring Boot and Security Staging Sandbox Ready</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12]">
            Ready to Dominate Your Store's Local Radius?
          </h2>

          <p className="text-indigo-150 font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Register your active business identifier, configure your high-performing AI marketing copy parameters, and start driving hyperlocal store foot-traffic today. Secure email OTP verification included.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            
            <button
              onClick={() => onLaunchPortal('register')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-900 hover:bg-indigo-50 font-black text-sm rounded-xl shadow-lg hover:shadow-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Onboard Partner Store</span>
              <ArrowRight className="h-4 w-4 text-indigo-900 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onLaunchPortal('login')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-950/85 hover:bg-slate-900/80 text-white border border-indigo-500/30 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4 text-indigo-400" />
              <span>Sign In Merchant Terminal</span>
            </button>

          </div>

          {/* Secure SSL notice badges */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-[10.5px] font-bold text-indigo-200/50 uppercase tracking-widest select-none">
            <span>🛡️ SSL Secure Cryptography</span>
            <span>•</span>
            <span>📝 JWT Header Payload Valid</span>
            <span>•</span>
            <span>•</span>
            <span>🗺️ MAPS GROUNDING CALIBRATED</span>
          </div>

        </div>
      </section>

      {/* FOOTER METADATA NOTICES */}
      <footer className="bg-slate-950 py-10 border-t border-slate-900 text-center select-none text-xs text-slate-500 font-semibold space-y-2">
        <p className="flex items-center justify-center gap-2">
          <Target className="h-4 w-4 text-indigo-500" />
          <span>© 2026 Hyperlocal Ad Pulse Inc. All simulated rights reserved.</span>
        </p>
        <p className="text-[10px] text-slate-600 leading-normal max-w-xl mx-auto px-4">
          This system functions as a high-precision digital mockup simulating localized merchant campaigns on regional consumer hardware devices. Built using fully integrated TSX components and animated with React Motion limits.
        </p>
      </footer>

    </div>
  );
}
