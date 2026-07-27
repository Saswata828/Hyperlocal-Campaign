import * as React from 'react';
import L from 'leaflet';
import { MapPin, Target, Users, Sparkles, Navigation, Store } from 'lucide-react';

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

interface StoreMapProps {
  center: { lat: number; lng: number };
  radiusKm?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  stores?: Store[];
  selectedStoreId?: string;
  onSelectStore?: (id: string) => void;
  interactive?: boolean;
}

export const StoreMap: React.FC<StoreMapProps> = ({
  center,
  radiusKm = 5,
  onLocationChange,
  stores = [],
  selectedStoreId,
  onSelectStore,
  interactive = true,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const centerMarkerRef = React.useRef<L.Marker | null>(null);
  const radiusCircleRef = React.useRef<L.Circle | null>(null);
  const extraMarkersRef = React.useRef<L.Marker[]>([]);
  const customerMarkersRef = React.useRef<L.CircleMarker[]>([]);

  const [nearbyCount, setNearbyCount] = React.useState(0);

  // Initialize Map
  React.useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing map if any
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (err) {
        console.warn('Error during map removal:', err);
      }
      mapRef.current = null;
    }

    // Create Leaflet map instance centered on target
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: interactive,
      doubleClickZoom: false,
      attributionControl: false,
    });

    // Use beautiful dark themed tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Map Click Handler for moving coordinates
    if (interactive && onLocationChange) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.warn('Cleanup error of map:', err);
        }
        mapRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Sync / Pan map when coordinate changes
  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom());
    }
  }, [center.lat, center.lng]);

  // Handle center pin and radius circle updates
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Core Pin Marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setLatLng([center.lat, center.lng]);
    } else {
      const livePin = L.marker([center.lat, center.lng], {
        draggable: interactive,
        icon: L.divIcon({
          className: 'custom-main-pin-wrapper',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute -bottom-1 w-4 h-1 bg-slate-950/35 rounded-full blur-[1px]"></div>
              <div class="h-9 w-9 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-lg transform -translate-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m2 22 1-1h3l9-9"/><path d="M14 2h8v8"/><path d="m22 2-7.5 7.5"/></svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 32]
        })
      }).addTo(map);

      // Handle drag end to update coordinates
      if (interactive && onLocationChange) {
        livePin.on('dragend', () => {
          const pos = livePin.getLatLng();
          onLocationChange(pos.lat, pos.lng);
        });
      }

      centerMarkerRef.current = livePin;
    }

    // 2. Targeting Radius Circle Overlay
    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([center.lat, center.lng]);
      radiusCircleRef.current.setRadius(radiusKm * 1000);
    } else {
      radiusCircleRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        fillColor: '#6366f1',
        fillOpacity: 0.15,
        color: '#4f46e5',
        weight: 1.5,
        opacity: 0.7,
      }).addTo(map);
    }

  }, [center.lat, center.lng, radiusKm, interactive]);

  // Sync extra multi-store coordinates
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old extra markers
    extraMarkersRef.current.forEach((m) => m.remove());
    extraMarkersRef.current = [];

    stores.forEach((st) => {
      const isSelected = selectedStoreId === st.id;
      // Skip center pin position duplicates to avoid overlapping
      const isCenter = Math.abs(st.latitude - center.lat) < 0.0002 && Math.abs(st.longitude - center.lng) < 0.0002;
      if (isCenter) return;

      const storePin = L.marker([st.latitude, st.longitude], {
        icon: L.divIcon({
          className: 'custom-extra-store-pin',
          html: `
            <div class="p-1.5 rounded-full shadow-lg border border-white cursor-pointer hover:scale-110 transition-transform ${
              isSelected ? 'bg-indigo-600 text-white animate-bounce' : 'bg-slate-750 text-slate-100'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M14 2h8v8"/><path d="m22 2-7.5 7.5"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(map);

      storePin.on('click', () => {
        if (onSelectStore) onSelectStore(st.id);
      });

      extraMarkersRef.current.push(storePin);
    });
  }, [stores, selectedStoreId, center.lat, center.lng]);

  // Simulate/Sync customer target coordinates
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old customer markers
    customerMarkersRef.current.forEach((dot) => dot.remove());
    customerMarkersRef.current = [];

    const numPoints = Math.round(15 + radiusKm * 3.5);
    setNearbyCount(numPoints * 12);

    const colors = ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6'];

    for (let i = 0; i < numPoints; i++) {
      const radiusMeters = radiusKm * 1000;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * radiusMeters; // uniform density inside radius cylinder
      
      const latOffset = (dist * Math.sin(angle)) / 111320;
      const lngOffset = (dist * Math.cos(angle)) / (40075000 * Math.cos((center.lat * Math.PI) / 180) / 360);

      const computedLat = center.lat + latOffset;
      const computedLng = center.lng + lngOffset;

      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const dotMarker = L.circleMarker([computedLat, computedLng], {
        radius: 3.5,
        fillColor: randomColor,
        fillOpacity: 0.8,
        color: '#ffffff',
        weight: 1,
        opacity: 0.9,
      }).addTo(map);

      dotMarker.bindTooltip('Active Local Customer Device', { direction: 'top', opacity: 0.85 });

      customerMarkersRef.current.push(dotMarker);
    }
  }, [center.lat, center.lng, radiusKm]);

  return (
    <div className="w-full h-full relative" id="leaflet-platform-container">
      {/* Actual Map Target Rendering Block */}
      <div ref={containerRef} className="w-full h-full min-h-[250px]" id="leaflet-map-host" />

      {/* Modern Dashboard Overlay HUD UI */}
      <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md text-[9px] text-slate-350 border border-slate-800/80 rounded-2xl p-2.5 px-3 z-[1000] shadow-2xl pointer-events-none flex items-center gap-2.5 select-none max-w-xs sm:max-w-md">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
          <span className="truncate text-white font-extrabold flex items-center gap-1">
            <Navigation className="h-3 w-3 text-indigo-400" /> Map Platform Active
          </span>
        </div>
        <div className="h-3 w-[1px] bg-slate-800" />
        <p className="text-[9px] text-slate-450 font-semibold truncate leading-none">
          Radius: <strong className="text-white">{radiusKm}km</strong> &bull; Sweep: <strong className="text-emerald-400">{nearbyCount}+ active leads</strong>
        </p>
      </div>

      {interactive && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm shadow-xl border border-slate-200/90 py-1 px-2.5 rounded-xl text-[9px] text-slate-700 font-extrabold z-[1000] flex items-center gap-1.5 pointer-events-none select-none">
          <Sparkles className="h-3 w-3 text-indigo-600 animate-pulse shrink-0" />
          <span>Click map or drag the store marker to reposition!</span>
        </div>
      )}
    </div>
  );
};
