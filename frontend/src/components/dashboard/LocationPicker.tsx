import * as React from 'react';
import { Search, MapPin, Navigation, Compass, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  title?: string;
  placeholder?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  title = "Geographic Location Tracker",
  placeholder = "Search area, city, local market place or landmark...",
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [geolocating, setGeolocating] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });

  // Nominatim Address Search
  const handleAddressSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setStatusMessage({ text: 'Querying OpenStreetMap Nominatim...', type: 'info' });

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'HyperlocalCampaignPlatformAIStudioApplet/1.0',
        },
      });

      if (response.data && response.data.length > 0) {
        const topResult = response.data[0];
        const newLat = parseFloat(topResult.lat);
        const newLng = parseFloat(topResult.lon);
        const displayName = topResult.display_name;

        onLocationChange(newLat, newLng, displayName);
        setStatusMessage({ text: `Successfully resolved to target!`, type: 'success' });
      } else {
        setStatusMessage({ text: 'Location not found. Try adding a local city name.', type: 'error' });
      }
    } catch (err: any) {
      console.warn('[GEOLOCATION SEARCH ERROR]', err);
      setStatusMessage({ text: 'Search failed. Please try again or type coordinate direct.', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  // Browser HTML Geolocation API Auto-detection
  const handleDetectCoordinates = () => {
    if (!navigator.geolocation) {
      setStatusMessage({ text: 'Your browser does not support HTML5 Geolocation services.', type: 'error' });
      return;
    }

    setGeolocating(true);
    setStatusMessage({ text: 'Detecting physical GPS device coordinates...', type: 'info' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Try to reverse-geocode to human descriptive locality name
        try {
          const revRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat,
              lon: lng,
              format: 'json',
            },
            headers: {
              'User-Agent': 'HyperlocalCampaignPlatformAIStudioApplet/1.0',
            }
          });
          const humanAddr = revRes.data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          onLocationChange(lat, lng, humanAddr);
        } catch (revError) {
          onLocationChange(lat, lng, `Device Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }

        setStatusMessage({ text: 'Location detected successfully!', type: 'success' });
        setGeolocating(false);
      },
      (error) => {
        console.warn('[GEOLOCATION PERMISSION BLOCKED]', error);
        setStatusMessage({
          text: error.code === error.PERMISSION_DENIED
            ? 'Access blocked by browser settings or iframe security.'
            : 'Unable to capture precise GPS signals.',
          type: 'error',
        });
        setGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left space-y-4" id="location-picker-card">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-indigo-500 shrink-0" />
          <span>{title}</span>
        </h4>
        <button
          type="button"
          onClick={handleDetectCoordinates}
          disabled={geolocating}
          className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-xl border border-indigo-200/50 transition-all cursor-pointer disabled:opacity-55"
        >
          <Navigation className="h-3 w-3 text-indigo-500 animate-pulse shrink-0" />
          <span>{geolocating ? 'Detecting...' : 'Current GPS Location'}</span>
        </button>
      </div>

      {/* Address Nominatim Query Search */}
      <div className="relative">
        <input
          type="text"
          className="w-full pl-9 pr-20 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddressSearch();
            }
          }}
        />
        <div className="absolute left-3 top-2.5 text-slate-400">
          <Search className="h-4 w-4 shrink-0" />
        </div>
        <button
          type="button"
          onClick={() => handleAddressSearch()}
          disabled={searching}
          className="absolute right-1.5 top-1.5 text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-750 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer disabled:opacity-60"
        >
          {searching ? 'Finding...' : 'Resolve'}
        </button>
      </div>

      {/* Visual Status Indicator */}
      {statusMessage.type && (
        <div className={`p-2 px-3 rounded-xl border text-[9px] font-bold flex items-center gap-1.5 animate-fade-in ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
          statusMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' :
          'bg-slate-50 text-slate-600 border-slate-100'
        }`} id="nominatim-status-message">
          {statusMessage.type === 'success' ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Direct Coord Numerical Inputs */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block">Target Latitude</label>
          <input
            type="number"
            step="0.00001"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800"
            value={latitude}
            onChange={(e) => onLocationChange(parseFloat(e.target.value) || 0, longitude)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block">Target Longitude</label>
          <input
            type="number"
            step="0.00001"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800"
            value={longitude}
            onChange={(e) => onLocationChange(latitude, parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
};
