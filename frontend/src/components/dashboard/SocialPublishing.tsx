import * as React from 'react';
import { apiService } from '../../services/api';
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Twitter,
  Smartphone, 
  Wifi, 
  Calendar, 
  Sliders, 
  Bot, 
  Check, 
  RotateCw,
  Send,
  Sparkles,
  Palette,
  UploadCloud,
  Download,
  Users,
  Clock,
  Layout,
  ArrowRight,
  AlertCircle,
  Trash2,
  HelpCircle,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduledPost {
  id: string;
  channels: string[];
  caption: string;
  mediaUrl: string;
  scheduledTime: string;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
}

export const SocialPublishing: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = React.useState<'designer' | 'broadcasting'>('designer');

  // Multi-channel publishing connections status from DB
  const [connections, setConnections] = React.useState({
    facebookConnected: false,
    instagramConnected: false,
    whatsappConnected: false,
    gmbConnected: false
  });
  const [loadingConnections, setLoadingConnections] = React.useState(true);

  // Broadcast settings
  const [caption, setCaption] = React.useState(
    '✨ Celebrate the local heritage and festive spirit in traditional elegance! Enjoy flat 20% OFF on our hand-loomed apparel collection. Bring home regional pride this season! 🌸 #EthnicHandloom #ShopLocal #FestiveVibes'
  );
  
  const [scheduledDate, setScheduledDate] = React.useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30); // Default to 30 mins from now
    return d.toISOString().slice(0, 16);
  });
  const [selectedChannels, setSelectedChannels] = React.useState<Record<string, boolean>>({
    facebook: true,
    instagram: true,
    whatsapp: false,
    google: false
  });

  const [imgUrl, setImgUrl] = React.useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop&q=80');
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishedSuccess, setPublishedSuccess] = React.useState(false);
  const [publishedResults, setPublishedResults] = React.useState<any>(null);
  const [errorLog, setErrorLog] = React.useState<string | null>(null);

  // Scheduled posts queue
  const [scheduledPosts, setScheduledPosts] = React.useState<ScheduledPost[]>([]);
  const [loadingScheduled, setLoadingScheduled] = React.useState(false);

  // AI Poster Generator Configs
  const [posterTemplate, setPosterTemplate] = React.useState<'cultural' | 'minimalist' | 'retro' | 'electric'>('cultural');
  const [businessName, setBusinessName] = React.useState('Elite Saree Kendra');
  const [posterHeadline, setPosterHeadline] = React.useState('FLAT 20% OFF');
  const [posterSubtext, setPosterSubtext] = React.useState('Exclusive Regional Handloom Festival Collection Celebration');
  const [posterBgColor, setPosterBgColor] = React.useState('#4f46e5');
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);

  // Load connection status and scheduled posts on mount
  const fetchConnectionsAndPosts = async () => {
    setLoadingConnections(true);
    try {
      const connData = await apiService.getSocialConnections();
      if (connData && connData.connections) {
        const connArr = connData.connections || [];
        const fbConn = connArr.find((c: any) => c.platform === 'facebook')?.connected || false;
        const igConn = connArr.find((c: any) => c.platform === 'instagram')?.connected || false;
        const waConn = connArr.find((c: any) => c.platform === 'whatsapp')?.connected || false;
        const gmbConn = connArr.find((c: any) => c.platform === 'google')?.connected || false;

        setConnections({
          facebookConnected: fbConn,
          instagramConnected: igConn,
          whatsappConnected: waConn,
          gmbConnected: gmbConn
        });

        // Sync selected channels checkbox state to what is connected
        setSelectedChannels({
          facebook: fbConn,
          instagram: igConn,
          whatsapp: waConn,
          google: gmbConn
        });
      }

      setLoadingScheduled(true);
      const campaigns = await apiService.getCampaigns();
      if (Array.isArray(campaigns)) {
        const scheduledOnes = campaigns
          .filter((c: any) => c.status === 'Scheduled')
          .map((c: any) => ({
            id: c.id,
            channels: c.platforms || [],
            caption: c.generatedCaption || c.caption || '',
            mediaUrl: c.bannerUrl || '',
            scheduledTime: c.scheduledDate || c.startDate || '',
            status: 'PENDING' as const
          }));
        setScheduledPosts(scheduledOnes);
      }
    } catch (err) {
      console.error("Failed to load publishing credentials/posts:", err);
    } finally {
      setLoadingConnections(false);
      setLoadingScheduled(false);
    }
  };

  React.useEffect(() => {
    fetchConnectionsAndPosts();
  }, []);

  const handlePublishNow = async () => {
    const activeChannels = Object.keys(selectedChannels).filter(k => selectedChannels[k]);
    if (activeChannels.length === 0) {
      setErrorLog("Please select at least one channel to publish your campaign.");
      return;
    }

    setIsPublishing(true);
    setErrorLog(null);
    setPublishedSuccess(false);
    setPublishedResults(null);

    try {
      const data = await apiService.publishSocial({
        campaignId: `camp-pub-${Date.now()}`,
        caption,
        headline: posterHeadline,
        platforms: activeChannels,
        bannerUrl: currentProductImage
      });

      if (data && data.success) {
        setPublishedSuccess(true);
        setPublishedResults(data.results || {});
        setErrorLog(null);
      } else {
        setErrorLog(data?.error || data?.message || "Failed to publish campaign to selected channels.");
      }
    } catch (err: any) {
      setErrorLog(err.response?.data?.message || err.message || "Failed to publish campaign to Meta APIs.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedulePost = async () => {
    const activeChannels = Object.keys(selectedChannels).filter(k => selectedChannels[k]);
    if (activeChannels.length === 0) {
      setErrorLog("Please select at least one channel to schedule your campaign.");
      return;
    }

    setErrorLog(null);
    try {
      const data = await apiService.scheduleSocial({
        campaignId: `camp-sch-${Date.now()}`,
        caption,
        headline: posterHeadline,
        platforms: activeChannels,
        scheduledDate,
        bannerUrl: currentProductImage
      });

      if (data && data.success) {
        const campaigns = await apiService.getCampaigns();
        if (Array.isArray(campaigns)) {
          const scheduledOnes = campaigns
            .filter((c: any) => c.status === 'Scheduled')
            .map((c: any) => ({
              id: c.id,
              channels: c.platforms || [],
              caption: c.generatedCaption || c.caption || '',
              mediaUrl: c.bannerUrl || '',
              scheduledTime: c.scheduledDate || c.startDate || '',
              status: 'PENDING' as const
            }));
          setScheduledPosts(scheduledOnes);
        }
        alert("Campaign successfully scheduled in our automated background posting registry!");
      } else {
        setErrorLog(data?.error || data?.message || "Failed to schedule broadcast.");
      }
    } catch (err: any) {
      setErrorLog(err.response?.data?.message || err.message || "Failed to contact scheduling server.");
    }
  };

  // Drag-and-drop file uploader events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setUploadedImage(resultStr);
          setImgUrl(resultStr); // Sync phone preview
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setUploadedImage(resultStr);
          setImgUrl(resultStr); // Sync phone preview
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentProductImage = uploadedImage || imgUrl;

  const getPosterStyles = () => {
    switch (posterTemplate) {
      case 'cultural':
        return {
          bg: 'bg-indigo-950',
          borderColor: 'border-amber-500',
          textColor: 'text-amber-100',
          headlineColor: 'text-amber-400',
          fontClass: 'font-serif',
          accentBorder: 'border-amber-500/30',
          accentBg: 'bg-amber-950/40'
        };
      case 'minimalist':
        return {
          bg: 'bg-slate-50',
          borderColor: 'border-slate-800',
          textColor: 'text-slate-900',
          headlineColor: 'text-slate-950',
          fontClass: 'font-sans',
          accentBorder: 'border-slate-200',
          accentBg: 'bg-slate-100'
        };
      case 'retro':
        return {
          bg: 'bg-orange-50',
          borderColor: 'border-emerald-800',
          textColor: 'text-emerald-950',
          headlineColor: 'text-orange-600',
          fontClass: 'font-sans font-bold',
          accentBorder: 'border-emerald-200',
          accentBg: 'bg-orange-100'
        };
      case 'electric':
        return {
          bg: 'bg-slate-900',
          borderColor: 'border-indigo-500',
          textColor: 'text-slate-100',
          headlineColor: 'text-pink-500',
          fontClass: 'font-mono',
          accentBorder: 'border-indigo-900',
          accentBg: 'bg-indigo-950/70'
        };
    }
  };

  const posterTheme = getPosterStyles();

  // Simulated Download Action
  const [downloading, setDownloading] = React.useState(false);
  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      const link = document.createElement('a');
      link.href = currentProductImage;
      link.download = `AdPulse_Creative_${businessName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="social-suite-canvas">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-105 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layout className="h-6 w-6 text-indigo-650 text-indigo-600" />
            <span>Smart Ad-Creative Center & Social Hub</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Generate stunning campaign banners, analyze target audience characteristics, and auto-publish cross-platform in seconds.
          </p>
        </div>

        {/* Tab switcher buttons with high-fidelity styles */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('designer')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'designer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 inline mr-1 text-indigo-600" /> AI Poster Designer
          </button>
          <button
            onClick={() => setActiveSubTab('broadcasting')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeSubTab === 'broadcasting'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="h-3.5 w-3.5 inline mr-1 text-emerald-600" /> Social Broadcasting
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: INTERACTIVE AI POSTER DESIGNER */}
        {activeSubTab === 'designer' && (
          <motion.div
            key="designer-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Design Inputs Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4.5">
                
                <strong className="text-[10px] font-black text-slate-400 tracking-widest uppercase block border-b border-slate-50 pb-2">Poster Layout Controls</strong>

                {/* Templates Selector Carousel */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5 text-indigo-500" /> Creative Theme Template
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cultural', name: 'Geocultural Elegant', desc: 'Gold & Indigo festive trim' },
                      { id: 'minimalist', name: 'Swiss Modern', desc: 'Stark geometric typography' },
                      { id: 'retro', name: 'Heritage Retro', desc: 'Warm cream & drop shadows' },
                      { id: 'electric', name: 'Neon Cyber', desc: 'Vibrant neon outlines' }
                    ].map((temp) => (
                      <button
                        key={temp.id}
                        onClick={() => setPosterTemplate(temp.id as any)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          posterTemplate === temp.id
                            ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/10'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <strong className="text-[11px] font-black block text-slate-800">{temp.name}</strong>
                        <span className="text-[9px] text-slate-400 block tracking-tight pt-0.5 leading-none">{temp.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customizable Headline Inputs */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Custom Outlet Title</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-550"
                      placeholder="Outlet Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Main Target Headline</label>
                    <input
                      type="text"
                      value={posterHeadline}
                      onChange={(e) => setPosterHeadline(e.target.value)}
                      className="w-full text-xs font-black p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-550"
                      placeholder="e.g. FLAT 20% OFF"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Promo Subtext / Details</label>
                    <textarea
                      rows={2}
                      value={posterSubtext}
                      onChange={(e) => setPosterSubtext(e.target.value)}
                      className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-550 resize-none"
                      placeholder="Ad info details..."
                    />
                  </div>
                </div>

                {/* Drag-and-drop Image Uploader */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Add Product Graphic/Image</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-4.5 text-center transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                      dragActive 
                        ? 'border-indigo-500 bg-indigo-50/25' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <UploadCloud className="h-7 w-7 text-slate-400 mb-1.5" />
                    <strong className="text-[10px] font-black text-slate-700 block text-center leading-tight">Drag and drop file here</strong>
                    <span className="text-[9px] text-slate-400 block pt-0.5 leading-none">or tap to select images</span>
                  </div>
                </div>

                {/* Preset Fast Banners Auto-filler */}
                <button
                  type="button"
                  onClick={() => {
                    setBusinessName("Elite Saree Kendra");
                    setPosterHeadline("FLAT 20% OFF");
                    setPosterSubtext("Exclusive Regional Handloom Festival Collection Celebration");
                    setUploadedImage(null);
                    setImgUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop&q=80");
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black p-2.5 rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  Reset to Local Festive Template
                </button>

              </div>
            </div>

            {/* Poster Canvas Preview Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-center flex flex-col items-center justify-center">
                
                <strong className="text-[10px] font-black text-slate-400 tracking-widest uppercase block border-b border-slate-50 pb-2 mb-4 self-stretch text-left">Real-Time Graphic Canvas</strong>

                {/* Renders real simulated CSS banner poster */}
                <div 
                  id="adpulse-poster-renderer" 
                  className={`w-[320px] h-[320px] rounded-3xl p-5 border-4 flex flex-col justify-between text-left relative overflow-hidden shadow-xl select-none ${posterTheme?.bg} ${posterTheme?.borderColor} ${posterTheme?.fontClass}`}
                >
                  {/* Subtle graphical background highlights */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* HEADER AREA */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <strong className={`text-[9.5px] uppercase tracking-widest leading-none block font-semibold ${posterTheme?.textColor}`}>{businessName}</strong>
                      <span className="text-[7.5px] font-black uppercase text-amber-500 tracking-widest mt-0.5 block leading-none">Hyperlocal AI Creative</span>
                    </div>
                    <div className="bg-indigo-600/35 backdrop-blur-md border border-white/10 rounded-lg p-1 text-[8px] font-extrabold text-white flex items-center gap-1 leading-none uppercase select-none">
                      <Sparkles className="h-2.5 w-2.5 text-amber-300" /> Live
                    </div>
                  </div>

                  {/* HIGH RESOLUTION PRODUCT IMAGE INSIDE CANVAS */}
                  <div className="h-32 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-slate-950/20 relative my-2 select-none shadow">
                    <img 
                      src={currentProductImage} 
                      alt="Banner product details" 
                      className="w-full h-full object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/80 border border-white/10 text-white rounded-lg p-1 text-[7.5px] uppercase font-black tracking-widest leading-none">
                      Festive Special
                    </div>
                  </div>

                  {/* PROMOTION HEADLINE & BOTTOM DESCRIPTION */}
                  <div className="relative z-10 pt-1 text-center bg-slate-950/15 backdrop-blur-xs p-2 rounded-xl border border-white/5">
                    <h3 className={`text-xl font-extrabold leading-none ${posterTheme?.headlineColor} tracking-tight select-text`}>
                      {posterHeadline}
                    </h3>
                    <p className={`text-[8.5px] leading-snug mt-1 font-semibold ${posterTheme?.textColor} select-text`}>
                      {posterSubtext}
                    </p>
                  </div>

                  {/* Dynamic footer */}
                  <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[7px] text-slate-400 font-semibold select-none">
                    <span>Target Delivery Circle: 5km Radius</span>
                    <span>Broadcasting via AdPulse AdNet</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 self-stretch mt-1">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-2xl shadow-md cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
                  >
                    {downloading ? (
                      <>
                        <RotateCw className="h-3.5 w-3.5 animate-spin" /> compiling layers...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" /> Save High-Res Poster
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubTab('broadcasting');
                      setCaption(
                        `✨ Beautiful Ad Alert! ${posterHeadline} at ${businessName}! ${posterSubtext}. Claim local coupons in bio now! ✨`
                      );
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black p-3 rounded-2xl cursor-pointer shadow-md inline-flex items-center gap-1"
                  >
                    Publish This Poster <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* AI Audience Suggestions HUD Panel Column */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-900/40 rounded-3xl p-5 shadow-md space-y-4.5 text-left">
                
                <div className="flex items-center gap-2 border-b border-indigo-900/40 pb-3">
                  <span className="bg-indigo-600/25 p-1.5 border border-indigo-500/20 rounded-lg">
                    <Bot className="h-4.5 w-4.5 text-indigo-400" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider leading-none">AI Guided Suggestions</h4>
                    <span className="text-[8.5px] font-bold text-indigo-300 uppercase block tracking-widest mt-0.5">Optimized Targeting</span>
                  </div>
                </div>

                {/* AI Demographics suggestions block */}
                <div className="space-y-3.5 text-[10.5px]">
                  
                  <div className="space-y-1">
                    <span className="text-indigo-300 font-extrabold uppercase tracking-widest text-[8px] flex items-center gap-1">
                      <Users className="h-3 w-3" /> Recommended Demographics
                    </span>
                    <p className="font-bold text-slate-200">
                      Females aged 18-45 residing within 5km radius of your retail address. High affinity for cultural couture.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-indigo-300 font-extrabold uppercase tracking-widest text-[8px] flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Best Scheduling Times
                    </span>
                    <strong className="text-slate-100 block">05:30 PM - 08:30 PM</strong>
                    <p className="text-slate-400 text-[9.5px]">
                      Predicted audience engagement rises by 4.2x during evening strolls and market visits.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-indigo-300 font-extrabold uppercase tracking-widest text-[8px] flex items-center gap-1">
                      <Smartphone className="h-3 w-3" /> Dialect Suggestion
                    </span>
                    <p className="font-semibold text-slate-300">
                      Include cultural phrases matching your regional calendar to trigger intense community connection and offline shop footfall.
                    </p>
                  </div>

                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-[9px] text-indigo-200 font-semibold leading-relaxed">
                  🚀 <strong>ROI Predictor:</strong> Launching this poster with a WhatsApp broadcasting campaign is projected to drive 120-180 store visits.
                </div>

              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: SOCIAL BROADCASTING CONNECTIONS */}
        {activeSubTab === 'broadcasting' && (
          <motion.div
            key="broadcasting-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left drafting options */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              
              <div className="border-b border-slate-50 pb-3">
                <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-widest">Platform Connections & Drafting Suite</h3>
                <p className="text-[11px] text-slate-400 font-medium">Link institutional profiles to synchronize automated broadcasts with location radius targeting alerts</p>
              </div>

              {/* Status Warning if no channels linked */}
              {!connections.facebookConnected && !connections.instagramConnected && !connections.whatsappConnected && !connections.gmbConnected && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold">
                    <p className="font-black">No connected accounts active!</p>
                    <p className="mt-1 text-amber-700">Please go to the <strong className="underline">Connected Accounts</strong> tab in your sidebar to pair Facebook, Instagram, or WhatsApp via OAuth 2.0 before broadcasting.</p>
                  </div>
                </div>
              )}

              {/* Connected channels selector list */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Target Channels Selector</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* FACEBOOK */}
                  <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    connections.facebookConnected ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Facebook className="h-5 w-5 text-blue-600" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate">Facebook Page</h4>
                        <span className="text-[9px] font-bold block mt-0.5 text-slate-400">
                          {connections.facebookConnected ? '● Synchronized Feed' : '✕ Not Paired'}
                        </span>
                      </div>
                    </div>
                    {connections.facebookConnected && (
                      <input
                        type="checkbox"
                        checked={selectedChannels.facebook}
                        onChange={() => setSelectedChannels(p => ({ ...p, facebook: !p.facebook }))}
                        className="h-4.5 w-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    )}
                  </div>

                  {/* INSTAGRAM */}
                  <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    connections.instagramConnected ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-9 w-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                        <Instagram className="h-5 w-5 text-pink-600" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate">Instagram Business</h4>
                        <span className="text-[9px] font-bold block mt-0.5 text-slate-400">
                          {connections.instagramConnected ? '● Ready to Publish' : '✕ Not Paired'}
                        </span>
                      </div>
                    </div>
                    {connections.instagramConnected && (
                      <input
                        type="checkbox"
                        checked={selectedChannels.instagram}
                        onChange={() => setSelectedChannels(p => ({ ...p, instagram: !p.instagram }))}
                        className="h-4.5 w-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    )}
                  </div>

                  {/* WHATSAPP */}
                  <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    connections.whatsappConnected ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <MessageCircle className="h-5 w-5 text-emerald-605 text-emerald-600" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate">WhatsApp Business API</h4>
                        <span className="text-[9px] font-bold block mt-0.5 text-slate-400">
                          {connections.whatsappConnected ? '● Sandbox Connected' : '✕ Not Paired'}
                        </span>
                      </div>
                    </div>
                    {connections.whatsappConnected && (
                      <input
                        type="checkbox"
                        checked={selectedChannels.whatsapp}
                        onChange={() => setSelectedChannels(p => ({ ...p, whatsapp: !p.whatsapp }))}
                        className="h-4.5 w-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    )}
                  </div>

                  {/* GOOGLE PROFILE */}
                  <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    connections.gmbConnected ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Globe className="h-5 w-5 text-indigo-600" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate">Google Business Profile</h4>
                        <span className="text-[9px] font-bold block mt-0.5 text-slate-400">
                          {connections.gmbConnected ? '● Profile Active' : '✕ Not Paired'}
                        </span>
                      </div>
                    </div>
                    {connections.gmbConnected && (
                      <input
                        type="checkbox"
                        checked={selectedChannels.google}
                        onChange={() => setSelectedChannels(p => ({ ...p, google: !p.google }))}
                        className="h-4.5 w-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    )}
                  </div>

                </div>
              </div>

              {/* Broadcast input caption fields */}
              <div className="space-y-4">
                
                <div className="space-y-1.5 select-text">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Ad Broadcaster Copy Caption</label>
                    <button
                      type="button"
                      onClick={() => setCaption(
                        `✨ Handloom Heritage Exclusive! Purchase any 2 Ethnic Saree Suits and get your 3rd outfit completely free! Collect custom giftbox packages today at ${businessName}. 🌸 #SambalpurHandloom #OdishaCouture #LocalBrand`
                      )}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Bot className="h-3.5 w-3.5" /> Re-Draft using AI
                    </button>
                  </div>
                  
                  <textarea
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full p-3.5 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-xs font-semibold text-slate-800 outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Graphic Creative Mock Image Link (Auto-Synced with Designer)</label>
                  <input
                    type="text"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-xl text-[11px] font-mono outline-none text-slate-600"
                  />
                </div>

                {/* ERROR FEEDBACK HUD */}
                {errorLog && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-650 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-extrabold">Detailed Error Logs:</strong>
                      <p className="mt-0.5 font-semibold leading-normal">{errorLog}</p>
                    </div>
                  </div>
                )}

                {/* SUCCESS FEEDBACK HUD */}
                {publishedSuccess && publishedResults && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-2xl space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-600" />
                      <strong className="text-xs font-black text-emerald-900">Synchronized Broadcaster Success Report!</strong>
                    </div>
                    <div className="text-[10.5px] font-semibold text-emerald-800 space-y-1 pl-6">
                      {Object.keys(publishedResults).map(platform => (
                        <p key={platform}>
                          • <strong className="capitalize">{platform}</strong>: {publishedResults[platform]?.status === 'simulated' ? '✓ API Sandbox Verified Successful Delivery' : '✓ Live Posted successfully'} (ID: {publishedResults[platform]?.postId})
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-505 text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Post Scheduler
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleSchedulePost}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black py-2.5 rounded-xl border border-slate-200 transition-colors"
                    >
                      Schedule Campaign Post
                    </button>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={handlePublishNow}
                      disabled={isPublishing}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black text-xs py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer h-12"
                    >
                      {isPublishing ? (
                        <>
                          <RotateCw className="h-4 w-4 animate-spin" />
                          <span>Publishing live...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Publish Multi-Channel Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* SCHEDULED QUEUE HUD LIST */}
              <div className="pt-4 border-t border-slate-100 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-indigo-600" /> Upcoming Scheduled Broadcast Queue
                  </h4>
                  <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                    {scheduledPosts.length} Queued
                  </span>
                </div>

                {loadingScheduled ? (
                  <p className="text-[10px] text-slate-400 italic">Reading scheduler registry...</p>
                ) : scheduledPosts.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <p className="text-[10.5px] text-slate-500 font-semibold">No scheduled campaign broadcasts in queue.</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Setup a calendar schedule date above to test recurring weekly auto-posts.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scheduledPosts.map((post) => (
                      <div key={post.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                              Scheduled
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-600">
                              🕒 {new Date(post.scheduledTime).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-extrabold capitalize">
                              Channels: {post.channels.join(', ')}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-600 font-semibold leading-relaxed line-clamp-1 select-text">
                            "{post.caption}"
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm("Are you sure you want to cancel this scheduled post?")) {
                              try {
                                const res = await apiService.deleteCampaign(post.id);
                                if (res && res.success) {
                                  setScheduledPosts(p => p.filter(x => x.id !== post.id));
                                  alert("Scheduled campaign cancelled successfully.");
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Cancel scheduled campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right side live rendering smartphone mockup */}
            <div className="lg:col-span-5 flex items-center justify-center">
              
              <div className="w-[280px] bg-slate-900 rounded-[40px] p-2.5 border-4 border-slate-800 shadow-[0_25px_50px_rgba(0,0,0,0.15)] overflow-hidden relative select-none">
                
                {/* Smartphone camera notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-950 rounded-full z-10 flex items-center justify-center">
                  <span className="h-1 w-1 rounded-full bg-slate-800" />
                </div>

                <div className="bg-white rounded-[32px] overflow-hidden text-[10px] text-slate-700 min-h-[460px] flex flex-col justify-between">
                  
                  {/* Smartphone bar info panel */}
                  <div className="bg-slate-950 text-white px-5 py-2.5 flex items-center justify-between text-[8px] font-bold">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Wifi className="h-2.5 w-2.5 text-indigo-400" />
                      <span>5G Network</span>
                    </div>
                  </div>

                  {/* Simulated Mobile Feed viewport inside */}
                  <div className="flex-grow flex flex-col justify-between text-left">
                    
                    <div className="p-2.5 flex items-center justify-between border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-605 font-black text-[8px]">
                          SK
                        </div>
                        <div>
                          <h5 className="font-extrabold text-[9px] text-slate-800">local_retailer_hub</h5>
                          <span className="text-[7.5px] text-indigo-500 font-bold block leading-none">Sponsored • 1.2km nearby</span>
                        </div>
                      </div>
                      <span className="text-slate-400">•••</span>
                    </div>

                    {/* Graphic creative mock inside phone */}
                    <div className="relative bg-slate-100 flex-1 min-h-[160px] overflow-hidden flex items-center justify-center">
                      <img
                        src={currentProductImage}
                        alt="Mobile Feed Creative"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Caption interactive summary panel */}
                    <div className="p-3 bg-white border-t border-slate-100 select-text">
                      <div className="flex items-center gap-2 text-slate-805 font-extrabold pb-1">
                        <span>💗 1.2k</span> <span>💬 95</span> <span>⭐ 4.9</span>
                      </div>
                      <p className="text-[9px] leading-relaxed text-slate-600 line-clamp-3">
                        <strong className="text-slate-850">local_retailer_hub</strong>{' '}
                        {caption}
                      </p>
                      <span className="text-[8px] text-slate-400 font-bold block uppercase mt-1">Ready to broadcast</span>
                    </div>

                  </div>

                  {/* Smartphone navigation bottom bar */}
                  <div className="bg-slate-950 px-6 py-2 border-t border-slate-900 text-center flex items-center justify-center">
                    <div className="h-1 w-20 bg-slate-700 rounded-full" />
                  </div>

                </div>

              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
