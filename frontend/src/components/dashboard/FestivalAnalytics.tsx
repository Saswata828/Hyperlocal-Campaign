import * as React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  HelpCircle, 
  BadgeAlert,
  Compass,
  ArrowUpRight,
  Flame,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { dashboardService, FestivalInsight } from '../../services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const FestivalAnalytics: React.FC<{ onAutofillCampaign: (fest: string, offer: string, aud: string) => void }> = ({ onAutofillCampaign }) => {
  const [festivals, setFestivals] = React.useState<FestivalInsight[]>([]);
  const [selectedFestId, setSelectedFestId] = React.useState<string>('fest-1');

  React.useEffect(() => {
    setFestivals(dashboardService.getFestivals());
  }, []);

  const selectedFest = festivals.find(f => f.id === selectedFestId) || festivals[0];

  const radarData = [
    { subject: 'Visual Clicks', A: 85, B: 60, fullMark: 100 },
    { subject: 'Group Shares', A: 95, B: 40, fullMark: 100 },
    { subject: 'Local Store Footfall', A: 100, B: 85, fullMark: 100 },
    { subject: 'WhatsApp Lead Conversion', A: 78, B: 90, fullMark: 100 },
    { subject: 'Same-day Courier Urgency', A: 92, B: 55, fullMark: 100 }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in" id="festival-analytics-tab-view">
      
      {/* Header bar */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-800">Seasonal Festival Insights</h3>
        <p className="text-[11px] text-slate-400 font-medium">Predict conversion spikes based on religious timelines, regional social sharing triggers, and historical retail volumes</p>
      </div>

      {/* Top selection row scroll horizontal container */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {festivals.map(fest => (
          <button
            key={fest.id}
            onClick={() => setSelectedFestId(fest.id)}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedFestId === fest.id
                ? 'bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white border-transparent shadow-lg shadow-indigo-100'
                : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <Calendar className={`h-4.5 w-4.5 ${selectedFestId === fest.id ? 'text-white/80 animate-pulse' : 'text-slate-400'}`} />
              <span className={`text-[9px] font-extrabold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                selectedFestId === fest.id ? 'bg-white/20 text-white' : 'bg-slate-50 border border-slate-100 text-slate-450'
              }`}>
                {fest.date}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-black truncate">{fest.name}</h4>
              <p className={`text-[10px] font-bold mt-1.5 flex items-center gap-0.5 ${selectedFestId === fest.id ? 'text-white/80' : 'text-emerald-600'}`}>
                <TrendingUp className="h-3 w-3 shrink-0" />
                Avg ROI: {fest.historicalRoi}%
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Main split details workspace */}
      {selectedFest && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Details page card */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            
            <div className="space-y-4 select-text">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">Selected seasonal profile</span>
                  <h3 className="text-base font-black text-slate-850 mt-1 flex items-center gap-1.5 leading-tight">
                    <Flame className="h-4.5 w-4.5 text-amber-500 animate-bounce" />
                    {selectedFest.name} Campaign Intelligence
                  </h3>
                </div>

                <button
                  onClick={() => onAutofillCampaign(
                    `${selectedFest.name} Festive Boost Drive`,
                    selectedFest.recommendedOffer,
                    selectedFest.trendingProducts[0] || 'Families'
                  )}
                  className="bg-indigo-50 hover:bg-indigo-150 text-indigo-750 font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" /> Launch AI Campaign
                </button>
              </div>

              {/* Recommended offer */}
              <div className="bg-indigo-50/40 p-4.5 rounded-2xl border border-indigo-100/10 space-y-2">
                <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest block">Recommended local offer promo</span>
                <p className="text-xs font-extrabold text-slate-800 leading-normal">{selectedFest.recommendedOffer}</p>
                <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">
                  Based on historical machine metrics showing exactly <strong>{selectedFest.engagementMultiplier}x multiplier</strong> increase in visual social clicks.
                </p>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Trending goods */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Trending search goods</span>
                  <div className="space-y-1">
                    {selectedFest.trendingProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                        <span className="h-4 w-4 bg-slate-200/60 rounded-full flex items-center justify-center text-[9px] font-mono text-slate-500">{idx+1}</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pot reach */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Regional Audience</span>
                    <strong className="text-sm font-black text-slate-800 block mt-1">{selectedFest.potentialReach}</strong>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                    <ArrowUpRight className="h-3.5 w-3.5" /> High conversion localized density
                  </span>
                </div>

              </div>

              {/* Generative insight card */}
              <div className="bg-slate-900 border border-slate-850 p-4.5 rounded-2xl text-slate-200 flex items-start gap-3">
                <Sparkles className="h-5.5 w-5.5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="text-[9px] font-bold text-indigo-350 uppercase tracking-widest block">AdPulse GenAI Marketing strategy</span>
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed mt-1.5">{selectedFest.aiTip}</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Radar metric visualization using Recharts */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between text-center">
            <div className="space-y-1 text-left">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Seasonal Channel engagement index</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Normalized distribution comparing general baseline index (Blue) against festival trends (Indigo)</p>
            </div>

            {/* Radar layout */}
            <div className="h-[210px] w-full mt-4 flex items-center justify-center font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" fontSize={8} stroke="#64748b" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} stroke="#94a3b8" />
                  <Radar name="Baseline Channel" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Radar name={selectedFest.name} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-3 py-1 rounded-xl block mx-auto">
              🎯 Metric profile matches high localized intent
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
