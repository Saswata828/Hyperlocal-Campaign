import * as React from 'react';
import { Target, Sparkles, Navigation } from 'lucide-react';

interface RadiusSelectorProps {
  value: number; // in kilometers
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 50,
}) => {
  const getAdvisoryText = (val: number) => {
    if (val <= 5) {
      return {
        tag: 'Hyperlocal Micro-Radius',
        desc: 'Ideal for neighborhood delivery, fast food, and boutique clothing stores. Delivers dense engagement with minimal budget spend.',
        color: 'text-indigo-800 bg-indigo-50 border-indigo-100',
      };
    }
    if (val <= 15) {
      return {
        tag: 'Urban Multi-District',
        desc: 'Captures whole town segments. Perfect for specialty services, gyms, auto parts, and larger brand outlets.',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-100',
      };
    }
    return {
      tag: 'Metropolitan Area Regional',
      desc: 'Extensive regional coverage. Perfect for high-consideration purchases, regional wholesale, and large festival promotions.',
      color: 'text-amber-800 bg-amber-50 border-amber-100',
    };
  };

  const advice = getAdvisoryText(value);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs text-left" id="radius-selector-card">
      <div className="flex items-center justify-between mb-4">
        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Target className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>Hyperlocal Outreach Radius</span>
        </label>
        <span className="text-xs font-mono font-extrabold text-white bg-indigo-600 px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
          {value} km
        </span>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 1)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            id="radius-target-slider-input"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-extrabold font-mono mt-1.5 px-1">
            <span>{min} km</span>
            <span>10 km</span>
            <span>20 km</span>
            <span>30 km</span>
            <span>40 km</span>
            <span>{max} km</span>
          </div>
        </div>

        {/* Advisory Context Card */}
        <div className={`mt-2 border rounded-xl p-3.5 transition-all duration-300 ${advice.color}`} id="targeting-advice-alert">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-wider">{advice.tag}</span>
          </div>
          <p className="text-[10px] leading-relaxed font-semibold opacity-95">
            {advice.desc}
          </p>
        </div>
      </div>
    </div>
  );
};
