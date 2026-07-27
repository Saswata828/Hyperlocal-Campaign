import L from 'leaflet';

export interface MarkerStyleOptions {
  color?: string; // 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate'
  isPrimary?: boolean;
  isSelected?: boolean;
}

export const createStoreIcon = (options: MarkerStyleOptions = {}): L.DivIcon => {
  const { color = 'indigo', isPrimary = false, isSelected = false } = options;

  let bgClass = 'bg-indigo-600';
  let borderClass = 'border-indigo-100';
  let shadowClass = 'shadow-indigo-500/20';

  if (color === 'emerald') {
    bgClass = 'bg-emerald-600';
    borderClass = 'border-emerald-100';
    shadowClass = 'shadow-emerald-500/20';
  } else if (color === 'rose') {
    bgClass = 'bg-rose-600';
    borderClass = 'border-rose-100';
    shadowClass = 'shadow-rose-500/20';
  } else if (color === 'amber') {
    bgClass = 'bg-amber-500';
    borderClass = 'border-amber-150';
    shadowClass = 'shadow-amber-500/20';
  } else if (color === 'slate') {
    bgClass = 'bg-slate-700';
    borderClass = 'border-slate-100';
    shadowClass = 'shadow-slate-500/20';
  }

  const pulseRing = isSelected ? `
    <div class="absolute -inset-1 rounded-full bg-indigo-500/30 animate-ping"></div>
  ` : '';

  const scaleClass = isSelected ? 'scale-125' : 'hover:scale-110';
  const animateClass = isSelected ? 'animate-bounce' : '';

  return L.divIcon({
    className: 'custom-div-store-marker-container',
    html: `
      <div class="relative flex items-center justify-center transform transition-all duration-300 ${scaleClass} ${animateClass}" style="width: 38px; height: 38px;">
        ${pulseRing}
        <div class="absolute -bottom-1.5 w-6 h-1.5 bg-slate-950/20 rounded-full blur-[1.5px]"></div>
        <div class="h-9 w-9 rounded-full ${bgClass} border-2 border-white flex items-center justify-center shadow-lg ${shadowClass} relative z-10 text-white">
          ${isPrimary ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
              <path d="m2 22 1-1h3l9-9"/>
              <path d="M14 2h8v8"/>
              <path d="m22 2-7.5 7.5"/>
            </svg>
          ` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="2" y1="20" x2="22" y2="20"/>
              <rect x="9" y="10" width="6" height="7"/>
            </svg>
          `}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 32],
    popupAnchor: [0, -32],
  });
};
