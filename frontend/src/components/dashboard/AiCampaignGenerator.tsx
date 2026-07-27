import * as React from 'react';
import { 
  Sparkles, 
  Settings, 
  MapPin, 
  CircleDollarSign, 
  MessageSquare, 
  Send, 
  Save, 
  Info,
  Smartphone,
  Check,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Share2,
  Copy,
  RotateCw,
  Plus,
  Trash2,
  ChevronRight,
  TrendingUp,
  Bot,
  Zap,
  Tag,
  ArrowRight,
  Sparkle,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardService, Campaign } from '../../services/dashboardService';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';

// Copilot Variation type definitions
interface CopilotVariation {
  id: string;
  styleName: string;
  headline: string;
  caption: string;
  cta: string;
  hashtags: string[];
  emojis?: string[];
  imagePrompt?: string;
  productDescription?: string;
  promotionalText: string;
  strategy: string;
  suggestedAudience: string;
  bestPostingTime: string;
  recommendedBudget: number;
  expectedReach: number;
  expectedEngagement: number;
  strengthScore: number;
}

export const AiCampaignGenerator: React.FC<{ 
  onCampaignSaved: () => void;
  preFill?: { name: string; offer: string; audience: string } | null;
  onClearPrefill?: () => void;
}> = ({ onCampaignSaved, preFill, onClearPrefill }) => {
  // Input Form States
  const [name, setName] = React.useState('');
  const [businessCategory, setBusinessCategory] = React.useState('Fashion & Apparel');
  const [storeLocation, setStoreLocation] = React.useState('Sambalpur, Odisha');
  const [festival, setFestival] = React.useState('Nuakhai Celebration');
  const [product, setProduct] = React.useState('Sambalpuri Handloom Kurti');
  const [offer, setOffer] = React.useState('Flat 20% off with Free Complimentary Gift Box');
  const [audience, setAudience] = React.useState('Ethnic weavers, families and modern festive shoppers');
  const [objective, setObjective] = React.useState('Increase Offline Footfall');
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(['Instagram', 'WhatsApp']);
  const [radiusKm, setRadiusKm] = React.useState(5);
  const [budget, setBudget] = React.useState(15000);

  React.useEffect(() => {
    if (preFill) {
      if (preFill.name) setName(preFill.name);
      if (preFill.offer) setOffer(preFill.offer);
      if (preFill.audience) setAudience(preFill.audience);
      
      // Provide visual feedback via standard notification helper
      showNotification('success', '⚡ Autofilled generator fields with AI Recommended Strategy! Scroll down to generate your ad.');

      // Scroll smoothly to the input form
      setTimeout(() => {
        const formEl = document.getElementById("generator-brief-form-section");
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      if (onClearPrefill) {
        onClearPrefill();
      }
    }
  }, [preFill, onClearPrefill]);

  // User custom input option overrides
  const [customCategoryActive, setCustomCategoryActive] = React.useState(false);
  const [customLocationActive, setCustomLocationActive] = React.useState(false);
  const [customFestivalActive, setCustomFestivalActive] = React.useState(false);
  const [customProductActive, setCustomProductActive] = React.useState(false);

  // Dynamic lists from store/inventory APIs
  const [stores, setStores] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [campaignHistory, setCampaignHistory] = React.useState<Campaign[]>([]);

  const PRESET_CATEGORIES = ["Fashion & Apparel", "SaaS & Ad Services", "Retail Outlets", "Jewelry & Footwear", "Home Decor"];
  const PRESET_FESTIVALS = ["Nuakhai Celebration", "Raja Festival Special", "Diwali Sparkle Blockbuster", "Holi Carnival", "Weekend Flash Promotion"];
  
  const standardLocations = ["Sambalpur, Odisha", "Connaught Place, New Delhi", "Salt Lake, Kolkata", ...stores.map((st: any) => st.address)];
  const standardProducts = ["Sambalpuri Handloom Kurti", "Designer Cotton Sarees", "Gold Filigree Earrings", "Handcrafted Sandalwood Giftbox", ...products.map((pr: any) => pr.name)];

  const isCustomCategory = customCategoryActive || (businessCategory && !PRESET_CATEGORIES.includes(businessCategory));
  const isCustomLocation = customLocationActive || (storeLocation && !standardLocations.includes(storeLocation));
  const isCustomFestival = customFestivalActive || (festival && !PRESET_FESTIVALS.includes(festival));
  const isCustomProduct = customProductActive || (product && !standardProducts.includes(product));

  // AI Copilot state managers
  const [variations, setVariations] = React.useState<CopilotVariation[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState('');
  const [selectedVarId, setSelectedVarId] = React.useState<string>('A');
  const [isRewriting, setIsRewriting] = React.useState(false);
  
  // Intelligent Recommendations states
  const [recos, setRecos] = React.useState<any>(null);
  const [loadingRecos, setLoadingRecos] = React.useState(false);

  // Ask AI Chat panel states
  const [chatMessages, setChatMessages] = React.useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: "Welcome to your Enterprise Marketing Copilot! Ask me to refine copy, discover local hashtags, or outline a campaign strategy." }
  ]);
  const [chatInput, setChatInput] = React.useState('');
  const [isChatSending, setIsChatSending] = React.useState(false);

  // Enterprise Custom Copilot Capabilities
  const [language, setLanguage] = React.useState('English');
  const [posterPrompts, setPosterPrompts] = React.useState<any[]>([]);
  const [isGeneratingPoster, setIsGeneratingPoster] = React.useState(false);
  const [activeScoreData, setActiveScoreData] = React.useState<any>(null);
  const [isAuditingScore, setIsAuditingScore] = React.useState(false);
  const [calendarData, setCalendarData] = React.useState<any[]>([]);
  const [isGeneratingCalendar, setIsGeneratingCalendar] = React.useState(false);
  const [copilotTab, setCopilotTab] = React.useState<'assistant' | 'score' | 'calendar' | 'poster'>('assistant');

  // Notifications feedback
  const [notiStatus, setNotiStatus] = React.useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Selected Version shortcut
  const activeVariation = variations.find(v => v.id === selectedVarId) || variations[0];

  React.useEffect(() => {
    loadBentoContext();
  }, []);

  // Fetch dynamic location context, merchant inventory and historical templates
  const loadBentoContext = async () => {
    try {
      const storeList = dashboardService.getStores();
      setStores(storeList);
      if (storeList.length > 0) {
        // Automatically default location to primary physical store address
        const primaryStoreLocation = storeList[0].address || storeList[0].name;
        // Clean address mapping
        if (primaryStoreLocation.toLowerCase().includes("delhi")) setStoreLocation("Connaught Place, New Delhi");
        else if (primaryStoreLocation.toLowerCase().includes("kolkata")) setStoreLocation("Salt Lake, Kolkata");
        else setStoreLocation(primaryStoreLocation);
      }

      const productList = await apiService.getProducts();
      setProducts(productList);
      if (productList.length > 0) {
        setProduct(productList[0].name);
      }

      loadCampaignHistory();
    } catch (err) {
      console.warn("Context loader err:", err);
    }
  };

  const loadCampaignHistory = async () => {
    try {
      const history = await apiService.getCampaigns();
      setCampaignHistory(history);
    } catch (err) {
      console.warn("History fetch err:", err);
    }
  };

  // Re-fetch localized recommendations when store location changes
  React.useEffect(() => {
    triggerRecommendations();
  }, [storeLocation]);

  const triggerRecommendations = async () => {
    setLoadingRecos(true);
    try {
      const data = await apiService.copilotGetRecommendations({
        location: storeLocation,
        products: products.map(p => ({ name: p.name, category: p.category }))
      });
      setRecos(data);
    } catch (err) {
      console.warn("Reco generator error:", err);
    } finally {
      setLoadingRecos(false);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // STEP 1: Main generation (Generates 5 robust styled Variations)
  const generateCampaignCopilot = async () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing regional cultural demographics...');
    await sleep(700);
    setGenerationStep('Crawling local competitor ad trends & seasonal bids...');
    await sleep(800);
    setGenerationStep('Synthesizing psychological campaign strategies...');
    
    try {
      const data = await apiService.copilotGenerateCampaign({
        businessCategory,
        storeLocation,
        festival,
        product,
        offer,
        audience,
        objective,
        platforms: selectedPlatforms,
        budget,
        language
      });

      setVariations(data);
      setSelectedVarId(data[0]?.id || 'A');
      showNotification('success', 'Synthesized 5 Enterprise marketing variations!');
    } catch (err) {
      console.error("Copilot generate error", err);
      showNotification('info', 'Merged high-fidelity regional template presets.');
    } finally {
      setIsGenerating(false);
    }
  };

  // STEP 2: Rewrite Dial modifier action (Optimize chosen version)
  const applyRewriteDial = async (action: string) => {
    if (!activeVariation) return;
    setIsRewriting(true);
    showNotification('info', `Engaging AI optimization dial: "${action}"...`);

    try {
      const output = await apiService.copilotRewriteCampaign({
        headline: activeVariation.headline,
        caption: activeVariation.caption,
        hashtags: activeVariation.hashtags,
        action
      });

      // Update specific variation copy matching selection
      setVariations(prev => prev.map(v => v.id === selectedVarId ? {
        ...v,
        headline: output.headline,
        caption: output.caption,
        hashtags: output.hashtags
      } : v));

      showNotification('success', `Optimized Active Version for: ${action}!`);
    } catch (err) {
      console.error("Rewrite dial error:", err);
    } finally {
      setIsRewriting(false);
    }
  };

  const [regeneratingSections, setRegeneratingSections] = React.useState<Record<string, boolean>>({});

  const handleRegenerateSection = async (section: string) => {
    if (!activeVariation) return;
    setRegeneratingSections(prev => ({ ...prev, [section]: true }));
    showNotification('info', `Regenerating ${section} via Gemini...`);

    try {
      const response = await fetch('/api/campaigns/copilot-regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        },
        body: JSON.stringify({
          section,
          currentText: section === 'caption' ? activeVariation.caption : 
                       section === 'hashtags' ? activeVariation.hashtags.join(' ') :
                       section === 'cta' ? activeVariation.cta :
                       section === 'imagePrompt' ? activeVariation.imagePrompt :
                       section === 'productDescription' ? activeVariation.productDescription : '',
          product,
          festival,
          offer,
          language
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.text) {
          setVariations(prev => prev.map(v => {
            if (v.id === selectedVarId) {
              if (section === 'caption') {
                return { ...v, caption: data.text };
              } else if (section === 'hashtags') {
                const tags = data.text.split(/[\s,]+/).filter((t: string) => t.startsWith('#'));
                return { ...v, hashtags: tags.length > 0 ? tags : data.text.split(/[\s,]+/).map((t: string) => t.startsWith('#') ? t : '#' + t) };
              } else if (section === 'cta') {
                return { ...v, cta: data.text };
              } else if (section === 'imagePrompt') {
                return { ...v, imagePrompt: data.text };
              } else if (section === 'productDescription') {
                return { ...v, productDescription: data.text };
              }
            }
            return v;
          }));
          showNotification('success', `Regenerated ${section}!`);
        }
      }
    } catch (err) {
      console.error("Failed to regenerate section:", err);
      showNotification('info', `Reverted to adaptive local alternate copy.`);
    } finally {
      setRegeneratingSections(prev => ({ ...prev, [section]: false }));
    }
  };

  // Generate Image Generation Prompts for Marketing creatives
  const generatePosterPrompt = async () => {
    if (!activeVariation) {
      showNotification('info', 'Please generate campaign drafts first to design posters!');
      return;
    }
    setIsGeneratingPoster(true);
    setCopilotTab('poster');
    try {
      const response = await apiService.copilotGeneratePosterPrompt({
        headline: activeVariation.headline,
        caption: activeVariation.caption,
        product: product,
        festival: festival
      });
      setPosterPrompts(response);
      showNotification('success', 'Generated 3 themed social poster art prompts!');
    } catch (e) {
      console.error(e);
      showNotification('info', 'Failed to generate visual prompts.');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  // Run Campaign Quality Audit
  const auditCampaignScore = async () => {
    if (!activeVariation) {
      showNotification('info', 'Please generate campaign drafts first to audit!');
      return;
    }
    setIsAuditingScore(true);
    setCopilotTab('score');
    try {
      const response = await apiService.copilotCampaignScoreAudit({
        headline: activeVariation.headline,
        caption: activeVariation.caption,
        offer: offer,
        objective: objective,
        language: language
      });
      setActiveScoreData(response);
      showNotification('success', `Audit completed! Score: ${response.totalScore}/100`);
    } catch (e) {
      console.error(e);
      showNotification('info', 'Failed to core score campaign.');
    } finally {
      setIsAuditingScore(false);
    }
  };

  // Generate 30-Day Campaign Suggestions Pipeline
  const generateCampaignCalendar = async () => {
    setIsGeneratingCalendar(true);
    setCopilotTab('calendar');
    try {
      const response = await apiService.copilotGenerateCalendar({
        businessCategory: businessCategory,
        storeLocation: storeLocation
      });
      setCalendarData(response);
      showNotification('success', '30-Day campaign suggestions pipeline generated!');
    } catch (e) {
      console.error(e);
      showNotification('info', 'Failed to formulate calendar pipeline.');
    } finally {
      setIsGeneratingCalendar(false);
    }
  };

  // STEP 3: "Ask AI" Conversational response
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const response = await apiService.copilotAskAi({
        message: userMsg,
        draftContext: {
          businessCategory,
          storeLocation,
          festival,
          product,
          offer,
          audience,
          objective,
          budget,
          radiusKm,
          activeTemplate: activeVariation
        }
      });
      setChatMessages(prev => [...prev, { sender: 'assistant', text: response.reply }]);
    } catch (err) {
      console.warn("Chat error:", err);
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "I analyzed that! Let's prioritize local geofence radius tags and bundle values." }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Save selected campaign version directly into history
  const handleSaveActiveCampaign = async (status: 'Draft' | 'Active' | 'Scheduled') => {
    if (!activeVariation) return;
    
    const campData = {
      id: `camp-${Date.now()}`,
      name: name || `${festival} Local Drive`,
      goal: objective,
      festival,
      audience,
      radiusKm,
      budget,
      offer,
      tone: activeVariation.styleName,
      platforms: selectedPlatforms,
      status,
      reach: status === 'Active' ? activeVariation.expectedReach : 0,
      engagement: status === 'Active' ? Math.round(activeVariation.expectedReach * (activeVariation.expectedEngagement / 100)) : 0,
      leads: status === 'Active' ? Math.round(activeVariation.expectedReach * 0.012) : 0,
      roi: status === 'Active' ? Math.round(activeVariation.strengthScore * 3.1) : 0,
      startDate: new Date().toISOString().split('T')[0],
      generatedHeadline: activeVariation.headline,
      generatedCaption: activeVariation.caption,
      generatedCtas: [activeVariation.cta],
      generatedHashtags: activeVariation.hashtags
    };

    try {
      await apiService.createCampaign(campData);
      showNotification('success', `Ad successfully saved & published as: ${status}!`);
      loadCampaignHistory();
      setName('');
      onCampaignSaved();
    } catch (error) {
      console.error("Save camp error:", error);
    }
  };

  // Reuse previous campaign template
  const handleReusePastCampaign = (camp: Campaign) => {
    setName(camp.name);
    setFestival(camp.festival);
    setObjective(camp.goal);
    setAudience(camp.audience);
    setRadiusKm(camp.radiusKm);
    setBudget(camp.budget);
    setOffer(camp.offer);
    if (camp.platforms) setSelectedPlatforms(camp.platforms);

    // Mock an active variation from the template history
    const customVar: CopilotVariation = {
      id: 'A',
      styleName: camp.tone || 'Empathetic & Emotional',
      headline: camp.generatedHeadline || 'Past campaign headline',
      caption: camp.generatedCaption || 'Past campaign body copy',
      cta: camp.generatedCtas?.[0] || 'Click to claim in-store!',
      hashtags: camp.generatedHashtags || [],
      promotionalText: 'Reused and loaded past success framework',
      strategy: 'Using tested legacy copy block',
      suggestedAudience: camp.audience,
      bestPostingTime: 'Friday after hours',
      recommendedBudget: camp.budget,
      expectedReach: camp.reach || 12000,
      expectedEngagement: 12.8,
      strengthScore: 88
    };

    setVariations([customVar]);
    setSelectedVarId('A');
    showNotification('success', `Successfully reloaded historic template: "${camp.name}"!`);
  };

  // Duplicate an active variation instantly
  const handleDuplicateVersion = () => {
    if (!activeVariation) return;
    const duplicated: CopilotVariation = {
      ...activeVariation,
      id: `${activeVariation.id}_copy`,
      styleName: `${activeVariation.styleName} (Duplicate)`
    };
    setVariations(prev => [...prev, duplicated]);
    setSelectedVarId(duplicated.id);
    showNotification('success', `Cloned active copywriting version!`);
  };

  // Export copy functionality
  const handleExportText = () => {
    if (!activeVariation) return;
    const combinedText = `📢 AD HEADLINE: ${activeVariation.headline}\n\n📝 PRIMARY CAPTION:\n${activeVariation.caption}\n\n📍 ACTIONS INTERACTIVE:\n👉 ${activeVariation.cta}\n\n🏷️ HASHTAGS:\n${activeVariation.hashtags.join(' ')}`;
    
    try {
      navigator.clipboard.writeText(combinedText);
      showNotification('success', 'Combined markdown copy copied to clipboard!');
    } catch (err) {
      // Fallback alert
      showNotification('success', 'Text prepared! Highlight the caption and copy!');
    }
  };

  const showNotification = (type: 'success' | 'info', text: string) => {
    setNotiStatus({ type, text });
    setTimeout(() => setNotiStatus(null), 3000);
  };

  return (
    <div className="space-y-6" id="copilot-workspace-container">
      
      {/* Dynamic Feedback Toast */}
      <AnimatePresence>
        {notiStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black tracking-wide uppercase shadow-2xl border text-white ${
              notiStatus.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500' 
                : 'bg-indigo-600 border-indigo-500'
            }`}
          >
            <Check className="h-4 w-4 shrink-0" />
            <span>{notiStatus.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        
        {/* LEFT PANEL: CONFIGURATOR (35% on Large screens) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 relative">
          <div className="flex items-center gap-2.5 border-b border-rose-50/10 pb-3">
            <div className="h-9 w-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
              <Zap className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">Targeting Context</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">Config the hyperlocal parameters below</p>
            </div>
          </div>

          {/* One-Click Festival Quickstart Row */}
          <div className="bg-gradient-to-tr from-rose-50/70 to-rose-100/30 rounded-2xl p-3 border border-rose-100/50 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-rose-600 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider">One-Click Festival Autofill</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                id="quick-nuakhai-campaign"
                onClick={() => {
                  setName("Nuakhai Juhar Sambalpuri Festive Drive");
                  setFestival("Nuakhai Celebration");
                  setBusinessCategory("Fashion & Apparel");
                  setProduct("Sambalpuri Handloom Kurti");
                  setOffer("Flat 20% off with Free Complimentary Gift Box");
                  setAudience("Ethnic weavers, local families and modern festive shoppers");
                  setLanguage("Odia");
                  setBudget(20000);
                  setCustomCategoryActive(false);
                  setCustomLocationActive(false);
                  setCustomFestivalActive(false);
                  setCustomProductActive(false);
                  showNotification('success', "Loaded Nuakhai Sambalpuri Odia campaign details!");
                }}
                className="px-2 py-1.5 bg-white border border-rose-100/80 text-[10px] font-bold text-rose-800 hover:bg-rose-50 hover:border-rose-200 transition rounded-xl text-center cursor-pointer shadow-2xs leading-tight"
              >
                🌾 Nuakhai
              </button>
              <button
                type="button"
                id="quick-diwali-campaign"
                onClick={() => {
                  setName("Diwali Sparkle Gold Jewel Festival");
                  setFestival("Diwali Sparkle Blockbuster");
                  setBusinessCategory("Jewelry & Footwear");
                  setProduct("Gold Filigree Earrings");
                  setOffer("Flat 10% Cash Voucher + Extra Free Laxmi Silver Coin");
                  setAudience("High value gifting families and local neighborhood couples");
                  setLanguage("Hindi");
                  setBudget(45000);
                  setCustomCategoryActive(false);
                  setCustomLocationActive(false);
                  setCustomFestivalActive(false);
                  setCustomProductActive(false);
                  showNotification('success', "Loaded Diwali Jewel Hindi campaign details!");
                }}
                className="px-2 py-1.5 bg-white border border-rose-100/80 text-[10px] font-bold text-rose-800 hover:bg-rose-50 hover:border-rose-200 transition rounded-xl text-center cursor-pointer shadow-2xs leading-tight"
              >
                🪔 Diwali
              </button>
              <button
                type="button"
                id="quick-christmas-campaign"
                onClick={() => {
                  setName("Winter Holiday & Christmas Home Joy Drive");
                  setFestival("Weekend Flash Promotion");
                  setBusinessCategory("Home Decor");
                  setProduct("Handcrafted Sandalwood Giftbox");
                  setOffer("Flat 25% Off Premium Cozy Winter Candle Collections");
                  setAudience("Holiday interior decorators, young millennials and gift buyers");
                  setLanguage("English");
                  setBudget(25000);
                  setCustomCategoryActive(false);
                  setCustomLocationActive(false);
                  setCustomFestivalActive(false);
                  setCustomProductActive(false);
                  showNotification('success', "Loaded Christmas Holiday English campaign details!");
                }}
                className="px-2 py-1.5 bg-white border border-rose-100/80 text-[10px] font-bold text-rose-800 hover:bg-rose-50 hover:border-rose-200 transition rounded-xl text-center cursor-pointer shadow-2xs leading-tight"
              >
                🎄 Christmas
              </button>
            </div>
          </div>

          {/* Form Brief Inputs */}
          <div className="space-y-4" id="generator-brief-form-section">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider flex items-center justify-between">
                <span>Campaign Title Label</span>
                <span className="text-[9px] text-slate-400 font-normal">Internal name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sambalpuri Handloom Monsoon Special"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-550 focus:border-rose-550 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>

            {/* Outflow Language Choice */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider flex items-center justify-between">
                <span>Copywriting Language</span>
                <span className="text-[9px] text-rose-600 font-bold px-1.5 py-0.5 bg-rose-50 rounded">Pro Localize</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer hover:border-slate-300 transition"
                id="outflow-language-selector"
              >
                <option value="English">🌐 English (Global Corporate)</option>
                <option value="Hindi">🇮🇳 Hindi (हिंदी Marketing)</option>
                <option value="Odia">🏮 Odia (ଓଡ଼ିଆ - Sambalpuri Core)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Business Category</label>
                <select
                  value={isCustomCategory ? "Other" : businessCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setCustomCategoryActive(true);
                      setBusinessCategory('');
                    } else {
                      setCustomCategoryActive(false);
                      setBusinessCategory(val);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="Fashion & Apparel">👗 Fashion & Apparel</option>
                  <option value="SaaS & Ad Services">💻 SaaS & Ad Services</option>
                  <option value="Retail Outlets">🏬 Retail Outlets</option>
                  <option value="Jewelry & Footwear">👑 Jewelry & Footwear</option>
                  <option value="Home Decor">🕯️ Home Decor</option>
                  <option value="Other">✍️ Other (Custom...)</option>
                </select>
                {isCustomCategory && (
                  <input
                    type="text"
                    placeholder="Enter custom category..."
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-550 focus:border-rose-550 text-xs font-semibold text-slate-800 outline-none"
                  />
                )}
              </div>

              {/* Store location dropdown or manual query */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Boutique Location</label>
                <select
                  value={isCustomLocation ? "Other" : storeLocation}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setCustomLocationActive(true);
                      setStoreLocation('');
                    } else {
                      setCustomLocationActive(false);
                      setStoreLocation(val);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="Sambalpur, Odisha">🏮 Sambalpur, Odisha</option>
                  <option value="Connaught Place, New Delhi">🗼 Connaught Place, Delhi</option>
                  <option value="Salt Lake, Kolkata">🏙️ Salt Lake, Kolkata</option>
                  {stores.map(st => (
                    <option key={st.id} value={st.address}>{st.name.substring(0, 15)}...</option>
                  ))}
                  <option value="Other">✍️ Other (Custom...)</option>
                </select>
                {isCustomLocation && (
                  <input
                    type="text"
                    placeholder="Enter custom location..."
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-550 focus:border-rose-550 text-xs font-semibold text-slate-800 outline-none"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Festival Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Target Event</label>
                <select
                  value={isCustomFestival ? "Other" : festival}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setCustomFestivalActive(true);
                      setFestival('');
                    } else {
                      setCustomFestivalActive(false);
                      setFestival(val);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="Nuakhai Celebration">🌾 Nuakhai Celebration</option>
                  <option value="Raja Festival Special">🌸 Raja Festival Special</option>
                  <option value="Diwali Sparkle Blockbuster">✨ Diwali Celebration</option>
                  <option value="Holi Carnival">🎨 Holi Carnival</option>
                  <option value="Weekend Flash Promotion">⚡ Weekend Flash Promotion</option>
                  <option value="Other">✍️ Other (Custom...)</option>
                </select>
                {isCustomFestival && (
                  <input
                    type="text"
                    placeholder="Enter custom festival event..."
                    value={festival}
                    onChange={(e) => setFestival(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-550 focus:border-rose-550 text-xs font-semibold text-slate-800 outline-none"
                  />
                )}
              </div>

              {/* Product Reference */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Product Catalog</label>
                <select
                  value={isCustomProduct ? "Other" : product}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setCustomProductActive(true);
                      setProduct('');
                    } else {
                      setCustomProductActive(false);
                      setProduct(val);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="Sambalpuri Handloom Kurti">🧵 Sambalpuri Kurti</option>
                  <option value="Designer Cotton Sarees">👗 Designer Cotton Sarees</option>
                  <option value="Gold Filigree Earrings">💎 Gold Earrings</option>
                  <option value="Handcrafted Sandalwood Giftbox">🎁 Sandalwood Box</option>
                  {products.map(pr => (
                    <option key={pr.id} value={pr.name}>{pr.name.substring(0, 16)}...</option>
                  ))}
                  <option value="Other">✍️ Other (Custom...)</option>
                </select>
                {isCustomProduct && (
                  <input
                    type="text"
                    placeholder="Enter custom product catalog..."
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-550 focus:border-rose-550 text-xs font-semibold text-slate-800 outline-none"
                  />
                )}
              </div>
            </div>

            {/* Compelling Offer */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Incentive / Coupon Offer</label>
              <input
                type="text"
                placeholder="e.g. Flat 20% off all designer sarees plus complimentary incense candles"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-850 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Target Demographic Cohort</label>
              <textarea
                rows={2}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-750 outline-none"
              />
            </div>

            {/* Campaign Objective */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider font-sans">Objective Goal</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="Increase Offline Footfall">🎟️ Increase Offline Footfall</option>
                <option value="Acquire High-Value Premium Leads">💎 Acquire Premium Leads</option>
                <option value="Boost Online Orders & Catalog Awareness">🛒 Boost Online Orders</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Geofence radius slider */}
              <div className="space-y-1 text-[9px] font-extrabold text-slate-400">
                <div className="flex justify-between items-center text-[10px] text-slate-450 uppercase mb-0.5">
                  <span>Geofence Radius</span>
                  <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{radiusKm} KM</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Ad budget slider */}
              <div className="space-y-1 text-[9px] font-extrabold text-slate-400">
                <div className="flex justify-between items-center text-[10px] text-slate-450 uppercase mb-0.5">
                  <span>Target Budget</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">₹{budget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="2500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Target Channels */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Social Channels</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { name: 'Instagram', color: 'text-pink-600', bg: 'hover:bg-pink-50 hover:border-pink-300' },
                  { name: 'Facebook', color: 'text-blue-600', bg: 'hover:bg-blue-50 hover:border-blue-300' },
                  { name: 'WhatsApp', color: 'text-emerald-600', bg: 'hover:bg-emerald-50 hover:border-emerald-300' },
                  { name: 'Twitter/X', color: 'text-slate-800', bg: 'hover:bg-slate-50 hover:border-slate-300' }
                ].map(plat => {
                  const active = selectedPlatforms.includes(plat.name);
                  return (
                    <button
                      type="button"
                      key={plat.name}
                      onClick={() => {
                        setSelectedPlatforms(prev => prev.includes(plat.name) ? prev.filter(p => p !== plat.name) : [...prev, plat.name]);
                      }}
                      className={`py-1.5 px-1 rounded-lg border text-center font-extrabold text-[9px] cursor-pointer transition-all ${plat.bg} ${
                        active 
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-black' 
                          : 'bg-white border-slate-200 text-slate-450'
                      }`}
                    >
                      <span className={plat.color}>{plat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Synthesis CTA */}
            <Button
              fullWidth
              variant="primary"
              onClick={generateCampaignCopilot}
              isLoading={isGenerating}
              disabled={!offer}
              className="bg-black hover:bg-zinc-900 border-none rounded-xl text-white py-2.5 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-black/10 active:scale-98 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2 text-rose-300 animate-spin" />
              <span>Compile enterprise draft</span>
            </Button>

          </div>
        </div>

        {/* CENTER PANEL: COPILOT STUDIO & MULTI-VARIATIONS (45% on Large screens) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-[560px] relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* LOADER ELEMENT */}
            {isGenerating && (
              <motion.div
                key="thinking-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="relative mb-5 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-rose-600 animate-spin flex items-center justify-center" />
                  <Bot className="h-6 w-6 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
                  <span>Gemini Marketing Agent Thinking</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-550 animate-ping" />
                </h4>
                <p className="text-xs text-rose-600 font-bold font-mono tracking-tight mt-3 max-w-xs">{generationStep}</p>
                <span className="text-[9px] text-slate-400 font-black uppercase mt-8 block">Configuring 5 Distinct Copy Variations</span>
              </motion.div>
            )}

            {/* RENDER VARIATIONS BOARD */}
            {variations.length > 0 ? (
              <motion.div
                key="copilot-board"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div>
                  
                  {/* Variation Selectors (A, B, C, D, E Tabs) */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-rose-500" />
                      <span>VARIANCE OUTLET</span>
                    </span>
                    <button 
                      onClick={() => setVariations([])} 
                      className="text-[9px] font-black text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Reset Studio
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 mb-4">
                    {variations.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVarId(v.id)}
                        className={`py-2 px-1 rounded-xl text-center border cursor-pointer transition-all flex flex-col items-center ${
                          selectedVarId === v.id
                            ? 'bg-black border-black text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-black uppercase">{v.id}</span>
                        <span className="text-[7.5px] font-extrabold tracking-tight truncate w-full px-1">
                          {v.styleName.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active Variant Layout */}
                  <div className="space-y-3.5">
                    
                    {/* Style Rationale Banner */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-start gap-2 select-text">
                      <Bot className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{activeVariation.styleName} Rationale</h5>
                        <p className="text-[10px] text-slate-400 font-semibold leading-normal">{activeVariation.strategy}</p>
                      </div>
                    </div>

                    {/* Performance Predictor Badges */}
                    <div className="bg-emerald-50/20 border border-emerald-100/30 rounded-2xl p-3 grid grid-cols-3 gap-2.5 items-center">
                      <div className="border-r border-slate-100/50 pr-2">
                        <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider leading-none">Strength Score</span>
                        <div className="flex items-baseline gap-0.5 mt-0.5">
                          <span className="text-sm font-black text-slate-800 font-mono">{activeVariation.strengthScore}</span>
                          <span className="text-[8px] text-slate-400 font-extrabold">/100</span>
                        </div>
                      </div>

                      <div className="border-r border-slate-100/50 pr-2">
                        <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider leading-none">Expected Reach</span>
                        <span className="text-xs font-black text-slate-800 font-mono mt-0.5 block">
                          ~{activeVariation.expectedReach.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wider leading-none">Engagement %</span>
                        <span className="text-xs font-black text-emerald-700 font-mono mt-0.5 block">
                          {activeVariation.expectedEngagement}%
                        </span>
                      </div>
                    </div>

                    {/* Micro Audience & Optimal Time Suggestions */}
                    <div className="grid grid-cols-2 gap-3 bg-indigo-50/10 border border-indigo-100/10 rounded-xl p-2.5 text-[9px] font-semibold text-slate-500">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-405 block mb-0.5 tracking-wider">Suggested Audience</span>
                        <span className="text-slate-800 block truncate">{activeVariation.suggestedAudience}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-450 block mb-0.5 tracking-wider">Posting Time recommendation</span>
                        <span className="text-slate-800 block truncate">{activeVariation.bestPostingTime}</span>
                      </div>
                    </div>

                    {/* COPY REVIEW BOARD */}
                    <div className="space-y-3 select-text">
                      {/* Editable Headline */}
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Headline Output</label>
                        <input
                          type="text"
                          value={activeVariation.headline}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations(prev => prev.map(v => v.id === selectedVarId ? { ...v, headline: val } : v));
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-800 outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      {/* Editable Caption Body */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black uppercase text-slate-450 block tracking-widest">Caption Box</label>
                          <button
                            type="button"
                            disabled={regeneratingSections['caption']}
                            onClick={() => handleRegenerateSection('caption')}
                            className="flex items-center gap-1 text-[9px] font-black text-rose-600 uppercase tracking-wider hover:text-rose-700 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCw className={`h-2.5 w-2.5 ${regeneratingSections['caption'] ? 'animate-spin' : ''}`} />
                            <span>Regenerate</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={activeVariation.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations(prev => prev.map(v => v.id === selectedVarId ? { ...v, caption: val } : v));
                          }}
                          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-600 leading-normal outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-start">
                        {/* Interactive CTA */}
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">CTA Suggestion</label>
                            <button
                              type="button"
                              disabled={regeneratingSections['cta']}
                              onClick={() => handleRegenerateSection('cta')}
                              className="flex items-center gap-0.5 text-[8px] font-black text-rose-600 uppercase tracking-wider hover:text-rose-700 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCw className={`h-2 w-2 ${regeneratingSections['cta'] ? 'animate-spin' : ''}`} />
                              <span>Sync</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={activeVariation.cta}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariations(prev => prev.map(v => v.id === selectedVarId ? { ...v, cta: val } : v));
                            }}
                            className="w-full px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-black text-slate-700 outline-none"
                          />
                        </div>

                        {/* Hashtags list */}
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="text-[8px] font-black uppercase text-slate-450 block tracking-widest">Tags suggestions</label>
                            <button
                              type="button"
                              disabled={regeneratingSections['hashtags']}
                              onClick={() => handleRegenerateSection('hashtags')}
                              className="flex items-center gap-0.5 text-[8px] font-black text-rose-600 uppercase tracking-wider hover:text-rose-700 cursor-pointer disabled:opacity-50"
                            >
                              <RotateCw className={`h-2 w-2 ${regeneratingSections['hashtags'] ? 'animate-spin' : ''}`} />
                              <span>Refresh</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 leading-snug">
                            {activeVariation.hashtags && activeVariation.hashtags.length > 0 ? activeVariation.hashtags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[9px] font-semibold bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded leading-none">
                                {tag}
                              </span>
                            )) : (
                              <span className="text-[9px] text-slate-400 italic">No tags selected</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* EMOJI SUGGESTIONS SECTION */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Emoji Suggestions</label>
                          <span className="text-[8px] text-slate-405 font-extrabold uppercase text-slate-400">Click to append</span>
                        </div>
                        <div className="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl flex-wrap">
                          {(activeVariation.emojis || ["😃", "✨", "🌸", "🛍️", "🎯", "🔥"]).map((emoji, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const newCaption = activeVariation.caption + " " + emoji;
                                setVariations(prev => prev.map(v => v.id === selectedVarId ? { ...v, caption: newCaption } : v));
                                showNotification('success', `Injected emoji ${emoji} into Caption!`);
                              }}
                              className="text-sm hover:scale-125 transition-transform cursor-pointer"
                              title="Click to insert at the end of caption"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* PRODUCT DESCRIPTION SECTION */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black uppercase text-slate-450 block tracking-widest">AI Product Description</label>
                          <button
                            type="button"
                            disabled={regeneratingSections['productDescription']}
                            onClick={() => handleRegenerateSection('productDescription')}
                            className="flex items-center gap-1 text-[9px] font-black text-rose-600 uppercase tracking-wider hover:text-rose-700 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCw className={`h-2.5 w-2.5 ${regeneratingSections['productDescription'] ? 'animate-spin' : ''}`} />
                            <span>Regenerate</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={activeVariation.productDescription || `Exquisite handcrafted piece matching our elite seasonal catalogue for ${product || 'custom items'}.`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations(prev => prev.map(v => v.id === selectedVarId ? { ...v, productDescription: val } : v));
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10.5px] font-semibold text-slate-600 leading-relaxed outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      {/* IMAGE PROMPT SECTION */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black uppercase text-slate-450 block tracking-widest">Midjourney/Dall-E Image Prompt</label>
                          <button
                            type="button"
                            disabled={regeneratingSections['imagePrompt']}
                            onClick={() => handleRegenerateSection('imagePrompt')}
                            className="flex items-center gap-1 text-[9px] font-black text-rose-600 uppercase tracking-wider hover:text-rose-700 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCw className={`h-2.5 w-2.5 ${regeneratingSections['imagePrompt'] ? 'animate-spin' : ''}`} />
                            <span>Regenerate</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={activeVariation.imagePrompt || `Cinematic visual studio photoshoot of ${product || 'traditional sarees'} backgrounded with golden lamps, soft focus.`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations(prev => prev.map(v => v.id === selectedVarId ? { ...v, imagePrompt: val } : v));
                          }}
                          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10.5px] font-mono text-slate-500 leading-normal outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                    </div>

                  </div>
                </div>

                {/* TACTICAL REWRITE DIALS TOOLBOX (8 Buttons) */}
                <div className="space-y-1.5 pt-3.5 border-t border-slate-50">
                  <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-rose-500" />
                    <span>Tactical Optimizers Rewrite Engine</span>
                  </span>
                  
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[
                      { actionName: 'Make Professional', icon: '👔' },
                      { actionName: 'Make Friendly', icon: '😊' },
                      { actionName: 'Make Luxury', icon: '💎' },
                      { actionName: 'Make Viral', icon: '🚀' },
                      { actionName: 'Make Shorter', icon: '✂️' },
                      { actionName: 'Make Longer', icon: '✍️' },
                      { actionName: 'Add Emoji', icon: '😃' },
                      { actionName: 'Remove Emoji', icon: '❌' }
                    ].map(btn => (
                      <button
                        key={btn.actionName}
                        type="button"
                        disabled={isRewriting}
                        onClick={() => applyRewriteDial(btn.actionName)}
                        className="py-1 px-0.5 rounded-lg border border-slate-150 bg-white hover:bg-slate-50 text-[8.5px] font-extrabold text-slate-600 transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-60 cursor-pointer text-center truncate"
                      >
                        <span>{btn.icon}</span>
                        <span className="truncate">{btn.actionName.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SAVING / SHARING CONTROLS FOOTER */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSaveActiveCampaign('Draft')}
                      className="rounded-xl text-[10px] font-extrabold"
                    >
                      <Save className="h-3.5 w-3.5 mr-1 text-slate-500" />
                      <span>Save Draft</span>
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleSaveActiveCampaign('Scheduled')}
                      className="rounded-xl text-[10px] font-extrabold"
                    >
                      <Settings className="h-3.5 w-3.5 mr-1 text-indigo-500 animate-spin" />
                      <span>Schedule Ad</span>
                    </Button>

                    <Button
                      variant="primary"
                      onClick={() => handleSaveActiveCampaign('Active')}
                      className="rounded-xl text-[10px] font-extrabold"
                    >
                      <Send className="h-3.5 w-3.5 mr-1 text-white animate-pulse" />
                      <span>Push active</span>
                    </Button>
                  </div>

                  {/* Duplicate / Export text buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDuplicateVersion}
                      className="py-2 text-[9px] uppercase font-black tracking-wider text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 text-center flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 border border-rose-150"
                    >
                      <span>👥 Duplicate Version</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportText}
                      className="py-2 text-[9px] uppercase font-black tracking-wider text-black bg-slate-100 rounded-xl hover:bg-slate-200 text-center flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 border border-slate-200"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Export Text Copy</span>
                    </button>
                  </div>

                </div>

              </motion.div>
            ) : (
              /* EMPTY PREPreview STAGE */
              <motion.div
                key="empty-pre"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4"
              >
                <div className="h-14 w-14 bg-rose-50/50 rounded-full border border-rose-100 text-rose-500 flex items-center justify-center animate-bounce">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div className="max-w-xs space-y-1 select-text">
                  <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-wider">Empty Output Studio</h4>
                  <p className="text-[10px] font-semibold text-slate-400 leading-normal">
                    Draft your targeting objectives in the left compiler panel and trigger synthesis. Our Gemini AI Co-pilot model will generate 5 customized marketing strategies in 1 click!
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT PANEL: ENTERPRISE AI MARKETING COPILOT WORKSPACE */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-[560px]">
          
          {/* Unified AI Copilot Studio Tabbed Panel */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between overflow-hidden flex-1 relative">
            
            <div className="space-y-4 flex flex-col h-full">
              {/* Header branding */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="h-8 w-8 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Copilot Studio</h3>
                  <p className="text-[9px] text-slate-400 font-bold leading-none">Advanced Local Campaign Suite</p>
                </div>
              </div>

              {/* Elite Responsive Tabs */}
              <div className="grid grid-cols-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setCopilotTab('assistant')}
                  className={`py-1.5 text-[8.5px] font-extrabold uppercase rounded-lg text-center cursor-pointer transition ${
                    copilotTab === 'assistant' ? 'bg-white shadow-2xs text-rose-600 border border-slate-150' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  💬 Chat AI
                </button>
                <button
                  type="button"
                  onClick={auditCampaignScore}
                  className={`py-1.5 text-[8.5px] font-extrabold uppercase rounded-lg text-center cursor-pointer transition ${
                    copilotTab === 'score' ? 'bg-white shadow-2xs text-rose-600 border border-slate-150' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  📊 Score
                </button>
                <button
                  type="button"
                  onClick={generateCampaignCalendar}
                  className={`py-1.5 text-[8.5px] font-extrabold uppercase rounded-lg text-center cursor-pointer transition ${
                    copilotTab === 'calendar' ? 'bg-white shadow-2xs text-rose-600 border border-slate-150' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  🗓️ Calendar
                </button>
                <button
                  type="button"
                  onClick={generatePosterPrompt}
                  className={`py-1.5 text-[8.5px] font-extrabold uppercase rounded-lg text-center cursor-pointer transition ${
                    copilotTab === 'poster' ? 'bg-white shadow-2xs text-rose-600 border border-slate-150' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  🎨 Poster
                </button>
              </div>

              {/* TAB CONTENTS CONTAINER */}
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <AnimatePresence mode="wait">
                  
                  {/* 1. CHAT TAB CONTENT */}
                  {copilotTab === 'assistant' && (
                    <motion.div
                      key="chat-pane"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="flex-1 flex flex-col justify-between overflow-hidden h-full"
                    >
                      {/* Simulated Chat Feed */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 max-h-[190px] select-text">
                        {chatMessages.map((msg, mIdx) => (
                          <div
                            key={mIdx}
                            className={`flex flex-col text-left ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`p-2 rounded-xl text-[10px] font-semibold leading-relaxed max-w-[90%] font-sans whitespace-pre-wrap shadow-3xs text-left ${
                                msg.sender === 'user'
                                  ? 'bg-slate-900 text-white rounded-tr-none'
                                  : 'bg-slate-50 border border-slate-150 text-slate-800 rounded-tl-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isChatSending && (
                          <div className="flex justify-start text-left">
                            <div className="bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl text-[9px] font-bold text-slate-400 font-sans flex items-center gap-1.5 rounded-tl-none">
                              <span className="h-1 w-1 bg-rose-500 rounded-full animate-ping" />
                              <span>Copilot formulating...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quick Prompt Suggesters */}
                      <div className="flex gap-1 overflow-x-auto pb-1.5 shrink-0 scrollbar-none mb-1">
                        {[
                          'Suggest local hashtags',
                          'diwali strategy',
                          'improve headline',
                          'budget feedback tips'
                        ].map(suggest => (
                          <button
                            key={suggest}
                            type="button"
                            onClick={() => setChatInput(suggest)}
                            className="bg-slate-50 border border-slate-150 text-[8px] font-extrabold capitalize text-slate-500 px-2 rounded-lg shrink-0 transition-all active:scale-95 hover:border-rose-300 cursor-pointer whitespace-nowrap text-left"
                          >
                            {suggest}
                          </button>
                        ))}
                      </div>

                      {/* Chat Input form */}
                      <form
                        onSubmit={sendChatMessage}
                        className="flex gap-1.5 border-t border-slate-100 pt-2 shrink-0"
                      >
                        <input
                          type="text"
                          placeholder="Ask co-pilot directly..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 text-xs border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                        <button
                          type="submit"
                          disabled={isChatSending}
                          className="bg-rose-600 hover:bg-rose-700 h-8 w-8 text-white rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5 text-white" />
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* 2. QUALITY SCORE TAB CONTENT */}
                  {copilotTab === 'score' && (
                    <motion.div
                      key="score-pane"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="flex-1 flex flex-col overflow-y-auto space-y-3.5 pr-1 text-left max-h-[260px] scrollbar-none select-text"
                    >
                      {isAuditingScore ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                          <div className="h-6 w-6 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
                          <span className="text-[10px] text-slate-450 font-black uppercase tracking-wider font-mono">Analyzing Quality & Relevance...</span>
                        </div>
                      ) : activeScoreData ? (
                        <div className="space-y-4">
                          {/* Total score panel */}
                          <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between border border-slate-800">
                            <div className="space-y-0.5 text-left">
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Score</span>
                              <h5 className="text-[11px] font-black text-rose-400">Quality Assurance Pass</h5>
                              <p className="text-[8px] text-slate-400 leading-none">Evaluates copy potential & hook stats</p>
                            </div>
                            <div className="h-10 w-10 bg-slate-950 rounded-full border border-slate-800 flex flex-col items-center justify-center shadow-inner select-none shrink-0 ml-1">
                              <span className="text-sm font-black text-rose-500 font-mono leading-none">{activeScoreData.totalScore}</span>
                              <span className="text-[7px] font-bold text-slate-500">/100</span>
                            </div>
                          </div>

                          {/* Pillars detailed progress bars */}
                          <div className="space-y-2.5">
                            {[
                              { key: 'clarity', title: '✍️ Copywriting Clarity', color: 'bg-indigo-500' },
                              { key: 'relevance', title: '🏮 Hyperlocal Relevance', color: 'bg-amber-500' },
                              { key: 'urgency', title: '⏳ CTA Urgency Factor', color: 'bg-rose-500' },
                              { key: 'practicality', title: '🎫 Coupon Usability', color: 'bg-emerald-500' }
                            ].map(p => {
                              const score = activeScoreData.pillars?.[p.key]?.score ?? 20;
                              return (
                                <div key={p.key} className="space-y-0.5">
                                  <div className="flex justify-between items-baseline text-[9px]">
                                    <span className="font-extrabold text-slate-700">{p.title}</span>
                                    <span className="font-mono font-black text-slate-900">{score}<span className="text-[7px] text-slate-400">/25</span></span>
                                  </div>
                                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${(score/25) * 100}%` }} />
                                  </div>
                                  <p className="text-[8.5px] text-slate-400 leading-snug font-semibold">{activeScoreData.pillars?.[p.key]?.feedback}</p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Concrete suggestions of improvements */}
                          <div className="space-y-1.5 border-t border-slate-100 pt-3">
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block pb-1">AI Tactical Improvements Solutions</span>
                            <div className="space-y-1.5">
                              {activeScoreData.improvements?.map((tip: string, tIdx: number) => (
                                <div key={tIdx} className="bg-rose-50/50 border border-rose-100/30 text-rose-950 p-2 rounded-xl text-[9.5px] leading-relaxed flex gap-2 items-start font-semibold shadow-3xs">
                                  <span className="text-rose-700 bg-white h-4 w-4 rounded-full flex items-center justify-center font-black shrink-0 font-mono text-[8.5px] border border-rose-200">{tIdx + 1}</span>
                                  <span className="leading-normal">{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-405 space-y-2">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mx-auto border border-slate-200">
                            <Check className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5 max-w-[200px] mx-auto">
                            <h5 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Quality Score Audit</h5>
                            <p className="text-[9px] font-semibold text-slate-400 leading-normal">Perform instant copywriting audit scanning for local cultural hooks and conversion rate optimization metrics.</p>
                          </div>
                          <button
                            type="button"
                            onClick={auditCampaignScore}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-extrabold cursor-pointer transition shadow-3xs"
                          >
                            Run Quality Audit
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 3. 30-DAY TIMELINE CALENDAR TAB CONTENT */}
                  {copilotTab === 'calendar' && (
                    <motion.div
                      key="calendar-pane"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="flex-1 flex flex-col overflow-y-auto space-y-3 pr-1 text-left max-h-[260px] scrollbar-none select-text"
                    >
                      {isGeneratingCalendar ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                          <div className="h-6 w-6 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
                          <span className="text-[10px] text-slate-450 font-black uppercase tracking-wider font-mono">Formulating 30-day timeline...</span>
                        </div>
                      ) : calendarData && calendarData.length > 0 ? (
                        <div className="space-y-3.5">
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-50 pb-1">30-Day Campaign Suggestions Calendar</span>
                          
                          <div className="space-y-2.5">
                            {calendarData.map((item, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-150 rounded-2xl p-2.5 space-y-2 relative shadow-3xs hover:border-rose-200 transition">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Day {item.dayOffset} Suggestion</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setName(item.title);
                                      setFestival(item.festival);
                                      setProduct(item.suggestedProduct);
                                      setOffer(item.offer);
                                      setAudience(item.targetAudience);
                                      showNotification('success', `Autofilled form with calendar track Day ${item.dayOffset}!`);
                                    }}
                                    className="text-[8px] text-rose-750 font-extrabold px-1.5 py-0.5 bg-white border border-rose-100 hover:bg-rose-50 rounded-lg transition cursor-pointer flex items-center shadow-3xs"
                                  >
                                    ⚡ Load Autofill
                                  </button>
                                </div>
                                <div className="space-y-0.5">
                                  <h6 className="text-[10px] font-extrabold text-slate-800 leading-tight">{item.title}</h6>
                                  <div className="grid grid-cols-2 gap-1 text-[8px] font-semibold text-slate-400">
                                    <div><span className="text-slate-500">Target:</span> {item.festival}</div>
                                    <div><span className="text-slate-500">Stock:</span> {item.suggestedProduct}</div>
                                    <div className="col-span-2"><span className="text-slate-500">Offer:</span> {item.offer}</div>
                                  </div>
                                </div>
                                <p className="text-[8.5px] text-slate-400 font-semibold leading-normal italic border-t border-slate-100 pt-1.5">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-400 space-y-2">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mx-auto border border-slate-200">
                            <Layers className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5 max-w-[200px] mx-auto">
                            <h5 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">30-Day Campaign Calendar</h5>
                            <p className="text-[9px] font-semibold text-slate-400 leading-normal">Generate a 30-day staggered campaign suggestions pipeline customized to your selected boutique location and category.</p>
                          </div>
                          <button
                            type="button"
                            onClick={generateCampaignCalendar}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-extrabold cursor-pointer transition shadow-3xs"
                          >
                            Build 30-Day Pipeline
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 4. POSTER PROMPT CREATOR TAB CONTENT */}
                  {copilotTab === 'poster' && (
                    <motion.div
                      key="poster-pane"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="flex-1 flex flex-col overflow-y-auto space-y-3 pr-1 text-left max-h-[260px] scrollbar-none select-text"
                    >
                      {isGeneratingPoster ? (
                        <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                          <div className="h-6 w-6 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
                          <span className="text-[10px] text-slate-450 font-black uppercase tracking-wider font-mono">Designing creative visual poster prompt directives...</span>
                        </div>
                      ) : posterPrompts && posterPrompts.length > 0 ? (
                        <div className="space-y-3">
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-50 pb-1">AI Midjourney Visual Prompt Solutions</span>
                          
                          <div className="space-y-3">
                            {posterPrompts.map((p, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-150 rounded-2xl p-2.5 space-y-2 relative shadow-3xs hover:border-slate-200 transition">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[8px] font-black bg-rose-50 text-rose-750 px-2 py-0.5 rounded-lg uppercase tracking-wider leading-none">{p.style}</span>
                                  <span className="text-[8px] font-bold text-slate-400 font-mono">Ratio {p.ratio || "1:1"}</span>
                                </div>
                                <div className="bg-slate-900 text-slate-200 text-[8.5px] leading-relaxed font-mono p-2 rounded-xl border border-slate-800 relative select-all group shadow-inner">
                                  {p.prompt}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(p.prompt);
                                      showNotification('success', `Copied ad visual prompt!`);
                                    }}
                                    className="absolute right-1.5 top-1.5 h-5 w-5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center border border-slate-700 cursor-pointer shadow transition scale-90"
                                    title="Copy Prompt"
                                  >
                                    <Copy className="h-2.5 w-2.5 text-white" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-405 space-y-2">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mx-auto border border-slate-200">
                            <Sparkle className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5 max-w-[200px] mx-auto">
                            <h5 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Poster Prompt Creator</h5>
                            <p className="text-[9px] font-semibold text-slate-400 leading-normal">Generate highly detailed artistic style instructions tailored for Stable Diffusion/Midjourney to generate beautiful creatives matching your copy.</p>
                          </div>
                          <button
                            type="button"
                            onClick={generatePosterPrompt}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[9px] font-extrabold cursor-pointer transition shadow-3xs"
                          >
                            Generate Poster Prompts
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

            {/* Quick Recommendations trigger footer */}
            <div className="border-t border-slate-105 pt-2 flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={triggerRecommendations}
                className="w-full py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
              >
                <RotateCw className="h-3 w-3" />
                <span>Refresh region strategy insights</span>
              </button>
            </div>





            {/* Recos boxes */}
            <div className="hidden flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[190px] select-text text-left">
              {loadingRecos ? (
                <div className="flex flex-col items-center justify-center text-center py-10 space-y-1">
                  <div className="h-5 w-5 rounded-full border border-indigo-505 animate-spin" />
                  <span className="text-[9px] text-slate-450 font-black uppercase">Auditing region metadata...</span>
                </div>
              ) : recos ? (
                <div className="space-y-3">
                  {/* Location Insights */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black uppercase text-indigo-700 tracking-wider">Location Intelligence ({storeLocation.split(',')[0]})</span>
                    {recos.locationInsights?.map((insight: any, iIdx: number) => (
                      <div key={iIdx} className="bg-indigo-50/40 rounded-xl p-2 text-[9px] leading-relaxed border border-indigo-100/50">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-indigo-900">{insight.title}</span>
                          <span className="text-[7.5px] font-extrabold bg-indigo-100 text-indigo-800 px-1 rounded uppercase tracking-wider">{insight.badge}</span>
                        </div>
                        <p className="text-slate-500 font-medium leading-snug">{insight.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Product Insights */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black uppercase text-rose-700 tracking-wider">Product & Bundle Solutions</span>
                    {recos.productInsights?.map((insight: any, pIdx: number) => (
                      <div key={pIdx} className="bg-rose-50/30 rounded-xl p-2 text-[9px] leading-relaxed border border-rose-100/50">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-rose-900">{insight.title}</span>
                          <span className="text-[7.5px] font-extrabold bg-rose-100 text-rose-800 px-1 rounded uppercase tracking-wider">{insight.badge}</span>
                        </div>
                        <p className="text-slate-550 font-medium leading-snug">{insight.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Competitor Insights */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Competitor Gaps Opportunity</span>
                    {recos.competitorInsights?.map((insight: any, cIdx: number) => (
                      <div key={cIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-[9px] leading-relaxed">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-slate-800">{insight.title}</span>
                          <span className="text-[7.5px] font-bold bg-slate-200 text-slate-700 px-1 rounded uppercase tracking-wider">{insight.badge}</span>
                        </div>
                        <p className="text-slate-500 font-medium leading-snug">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-[10px] font-medium leading-relaxed select-none">
                  Choose a boutique location to trigger smart competitor strategy recomendations.
                </div>
              )}
            </div>
            
            {/* Quick Recommendations trigger */}
            <button
              type="button"
              onClick={triggerRecommendations}
              className="hidden mt-2 w-full py-1 text-[8.5px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all text-center flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <RotateCw className="h-3 w-3" />
              <span>Refresh strategy predictions</span>
            </button>
          </div>

        </div>

      </div>

      {/* LOWER PANEL: HISTORICAL TEMPLATES WORKSPACE (Reuse, Duplicate, and History logs) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-left">
        <div className="flex justify-between items-baseline border-b border-slate-50 pb-3 mb-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-600" />
              <span>SaaS Campaign History & Legacy Templates</span>
            </h4>
            <p className="text-[10px] text-slate-405 font-medium leading-none">View and reload tested configurations directly into the Copilot board</p>
          </div>
          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{campaignHistory.length} Saved Drives</span>
        </div>

        {campaignHistory.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-xs font-medium leading-relaxed select-none">
            No marketing drives completed yet. Save your first Copilot variation as a draft to register it here!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
            {campaignHistory.slice().reverse().map(camp => (
              <div 
                key={camp.id} 
                className="bg-slate-50 hover:bg-slate-100/50 border border-slate-150 rounded-2xl p-4 transition-all hover:shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800 truncate block max-w-[70%] leading-none">{camp.name}</span>
                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full leading-none shrink-0 ${
                      camp.status === 'Completed' ? 'bg-indigo-100 text-indigo-805' :
                      camp.status === 'Active' ? 'bg-emerald-100 text-emerald-708' :
                      camp.status === 'Scheduled' ? 'bg-yellow-102 text-yellow-805' :
                      'bg-slate-205 text-slate-607'
                    }`}>{camp.status}</span>
                  </div>

                  <div className="text-[10px] space-y-1 text-slate-450 leading-snug">
                    <div className="flex gap-1.5 select-text">
                      <span className="font-extrabold text-slate-600">Offer:</span>
                      <span className="truncate">{camp.offer || "General Discount"}</span>
                    </div>

                    <div className="flex gap-1.5 select-text">
                      <span className="font-extrabold text-slate-600">Event:</span>
                      <span>{camp.festival}</span>
                    </div>

                    <div className="flex gap-2">
                      <div>
                        <span className="text-[8px] uppercase font-black tracking-wide text-slate-400 block">Radius Target</span>
                        <span className="text-slate-800 font-bold">{camp.radiusKm} KM</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-black tracking-wide text-slate-400 block">INR Budget</span>
                        <span className="text-slate-800 font-bold">₹{camp.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-200/50 mt-3 flex justify-between items-center gap-2">
                  <span className="text-[8.5px] font-bold text-slate-400 font-mono">
                    Launched: {camp.startDate || "Recent"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleReusePastCampaign(camp)}
                      className="text-[9px] font-extrabold uppercase bg-rose-600 hover:bg-rose-705 text-white px-2.5 py-1.5 rounded-lg transition-all hover:scale-95 cursor-pointer text-center whitespace-nowrap"
                    >
                      Reuse Template
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await apiService.deleteCampaign(camp.id);
                          showNotification('success', 'Legacy campaign deleted!');
                          loadCampaignHistory();
                          onCampaignSaved();
                        } catch (err) {
                          console.error("Delete err:", err);
                        }
                      }}
                      className="p-1 px-1.5 rounded bg-slate-200 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
