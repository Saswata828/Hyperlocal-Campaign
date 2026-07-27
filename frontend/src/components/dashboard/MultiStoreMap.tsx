import * as React from 'react';
import L from 'leaflet';
import { createStoreIcon } from './StoreMarker';
import { Navigation, Target, Activity } from 'lucide-react';

export interface Store {
  id: string;
  name: string;
  address: string;
  category: string;
  radiusTargetKm: number;
  latitude: number;
  longitude: number;
  status: string;
}

interface MultiStoreMapProps {
  stores: Store[];
  selectedStoreId?: string;
  onSelectStore?: (id: string) => void;
  onStorePositionChange?: (id: string, lat: number, lng: number) => void;
  interactive?: boolean;
}

export const MultiStoreMap: React.FC<MultiStoreMapProps> = ({
  stores = [],
  selectedStoreId,
  onSelectStore,
  onStorePositionChange,
  interactive = true,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<Record<string, L.Marker>>({});
  const circlesRef = React.useRef<Record<string, L.Circle>>({});

  // Initialize Map
  React.useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.warn('Map discard error:', e);
      }
      mapRef.current = null;
    }

    // Determine initial center
    let centerLat = 21.4669;
    let centerLng = 83.9812;

    if (stores.length > 0) {
      const active = stores.find(s => s.id === selectedStoreId) || stores[0];
      centerLat = active.latitude;
      centerLng = active.longitude;
    }

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: 12,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn('Cleanup map error:', e);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Update center when selectedStoreId changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStoreId) return;

    const targetStore = stores.find(s => s.id === selectedStoreId);
    if (targetStore) {
      map.setView([targetStore.latitude, targetStore.longitude], map.getZoom());
    }
  }, [selectedStoreId, stores]);

  // Sync markers and targeting circles
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers and circles first
    Object.keys(markersRef.current).forEach(key => {
      markersRef.current[key]?.remove();
    });
    Object.keys(circlesRef.current).forEach(key => {
      circlesRef.current[key]?.remove();
    });
    markersRef.current = {};
    circlesRef.current = {};

    stores.forEach((store) => {
      const isSelected = store.id === selectedStoreId;
      const isPrimary = store.status === 'Active';

      // Pick a design coordinate marker theme
      let styleColor = 'indigo';
      if (isSelected) styleColor = 'indigo';
      else if (store.status !== 'Active') styleColor = 'slate';
      else styleColor = 'emerald';

      // 1. Create Icon
      const icon = createStoreIcon({
        color: styleColor,
        isPrimary,
        isSelected,
      });

      // 2. Create Marker Pin
      const marker = L.marker([store.latitude, store.longitude], {
        icon,
        draggable: interactive && isSelected,
      }).addTo(map);

      // Create a nice styled Popup showing details
      marker.bindPopup(`
        <div class="text-left font-sans p-1 text-slate-800" style="min-width: 160px;">
          <h5 class="text-xs font-black text-slate-900 border-b border-slate-100 pb-1 mb-1 truncate">${store.name}</h5>
          <p class="text-[10px] text-slate-500 font-semibold mb-1 leading-normal truncate">${store.address || 'No Address set'}</p>
          <div class="flex items-center justify-between text-[9px] font-bold mt-1.5 pt-1 border-t border-slate-50">
            <span class="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">R: ${store.radiusTargetKm}km</span>
            <span class="px-1.5 py-0.5 rounded text-white ${store.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}">${store.status}</span>
          </div>
        </div>
      `, {
        closeButton: false,
      });

      marker.on('click', () => {
        if (onSelectStore) {
          onSelectStore(store.id);
        }
      });

      if (interactive && onStorePositionChange) {
        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          onStorePositionChange(store.id, latLng.lat, latLng.lng);
        });
      }

      markersRef.current[store.id] = marker;

      // 3. Create Hyperlocal Marketing Circle Overlay
      const circle = L.circle([store.latitude, store.longitude], {
        radius: (store.radiusTargetKm || 5) * 1000,
        fillColor: isSelected ? '#4f46e5' : '#10b981',
        fillOpacity: isSelected ? 0.15 : 0.04,
        color: isSelected ? '#6366f1' : '#34d399',
        weight: isSelected ? 2 : 1,
        dashArray: isSelected ? undefined : '4, 4',
        opacity: isSelected ? 0.8 : 0.4,
      }).addTo(map);

      circlesRef.current[store.id] = circle;
    });

  }, [stores, selectedStoreId, interactive]);

  // Adjust zoom automatically to fit all stores
  const handleAutoFitBounds = () => {
    const map = mapRef.current;
    if (!map || stores.length === 0) return;

    const latLngs = stores.map(s => L.latLng(s.latitude, s.longitude));
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [30, 30] });
  };

  return (
    <div className="w-full h-full relative" id="multi-store-leaflet-wrapper">
      <div ref={containerRef} className="w-full h-full min-h-[300px] bg-slate-900" id="multi-store-leaflet-host" />

      {/* Floating Action control HUD overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        {stores.length > 1 && (
          <button
            type="button"
            onClick={handleAutoFitBounds}
            className="bg-slate-900/90 backdrop-blur-md text-[10px] font-black text-white hover:text-indigo-300 border border-slate-700 hover:border-indigo-500 rounded-xl px-3 py-2 shadow-2xl transition-all cursor-pointer flex items-center gap-1.5 select-none"
          >
            <Activity className="h-3.5 w-3.5 text-indigo-400 animate-pulse shrink-0" />
            <span>Fit All Branches ({stores.length})</span>
          </button>
        )}
      </div>

      <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 px-3.5 z-[1000] shadow-xl pointer-events-none text-left select-none max-w-sm">
        <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> Direct Broadcast Sweep
        </span>
        <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-1">
          Each store renders an interactive outreach circle. Active channels direct ads to nearby potential leads.
        </p>
      </div>
    </div>
  );
};
