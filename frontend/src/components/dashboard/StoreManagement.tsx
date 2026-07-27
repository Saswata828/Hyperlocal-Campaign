import * as React from 'react';
import { 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  Store as StoreIcon, 
  Trash2, 
  BadgeHelp, 
  Check, 
  Navigation,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dashboardService, Store, subscribeToDashboardState } from '../../services/dashboardService';
import { Button } from '../ui/Button';
import { StoreMap } from './StoreMap';
import { LocationPicker } from './LocationPicker';
import { RadiusSelector } from './RadiusSelector';
import { MultiStoreMap } from './MultiStoreMap';

export const StoreManagement: React.FC = () => {
  const [stores, setStores] = React.useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [storeToDelete, setStoreToDelete] = React.useState<{ id: string; name: string } | null>(null);
  
  // Form elements
  const [editingStoreId, setEditingStoreId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [category, setCategory] = React.useState('Retail Outlets');
  const [hours, setHours] = React.useState('09:00 AM - 09:00 PM');
  const [radiusTargetKm, setRadiusTargetKm] = React.useState(5);
  const [status, setStatus] = React.useState<'Active' | 'Inactive'>('Active');
  const [latitude, setLatitude] = React.useState<number>(28.6304);
  const [longitude, setLongitude] = React.useState<number>(77.2177);

  // States for Map Pin Modal
  const [isPinModalOpen, setIsPinModalOpen] = React.useState(false);
  const [pinStore, setPinStore] = React.useState<Store | null>(null);
  const [tempLat, setTempLat] = React.useState<number>(28.6304);
  const [tempLng, setTempLng] = React.useState<number>(77.2177);

  // Selected store for map highlight
  const [selectedStoreId, setSelectedStoreId] = React.useState<string | null>(null);

  const fetchStores = () => {
    const loadedStores = dashboardService.getStores();
    setStores(loadedStores);
    if (loadedStores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(loadedStores[0].id);
    }
  };

  React.useEffect(() => {
    fetchStores();
    const unsubscribe = subscribeToDashboardState(() => {
      fetchStores();
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingStoreId(null);
    setName('');
    setAddress('');
    setPhone('');
    setCategory('Retail Outlets');
    setHours('09:00 AM - 09:00 PM');
    setRadiusTargetKm(5);
    setStatus('Active');
    setLatitude(28.6304);
    setLongitude(77.2177);
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStoreId(store.id);
    setName(store.name);
    setAddress(store.address);
    setPhone(store.phone);
    setCategory(store.category);
    setHours(store.hours);
    setRadiusTargetKm(store.radiusTargetKm);
    setStatus(store.status);
    setLatitude(store.latitude ?? 28.6304);
    setLongitude(store.longitude ?? 77.2177);
    setIsModalOpen(true);
  };

  const openPinModal = (store: Store) => {
    setPinStore(store);
    setTempLat(store.latitude ?? 28.6304);
    setTempLng(store.longitude ?? 77.2177);
    setIsPinModalOpen(true);
  };

  const handleSavePin = () => {
    if (pinStore) {
      const updatedStore: Store = {
        ...pinStore,
        latitude: tempLat,
        longitude: tempLng
      };
      dashboardService.saveStore(updatedStore);
      fetchStores();
      setIsPinModalOpen(false);
      setPinStore(null);
    }
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const newStore: Store = {
      id: editingStoreId || `store-${Date.now()}`,
      name,
      address,
      phone: phone || '+91 99999 88888',
      category,
      hours,
      radiusTargetKm,
      status,
      latitude,
      longitude
    };

    dashboardService.saveStore(newStore);
    fetchStores();
    setIsModalOpen(false);
  };

  const handleDeleteStore = (id: string, name: string) => {
    setStoreToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteStore = () => {
    if (storeToDelete) {
      dashboardService.deleteStore(storeToDelete.id);
      fetchStores();
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    dashboardService.toggleStoreStatus(id);
    fetchStores();
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    const activeStore = stores.find(s => s.id === selectedStoreId);
    if (activeStore) {
      const updatedStore: Store = {
        ...activeStore,
        latitude: lat,
        longitude: lng
      };
      dashboardService.saveStore(updatedStore);
      fetchStores();
    }
  };

  const getMapPosition = (storeLat?: number, storeLng?: number) => {
    const lat = storeLat ?? 28.6304;
    const lng = storeLng ?? 77.2177;

    const minLat = 22.0;
    const maxLat = 29.0;
    const minLng = 72.0;
    const maxLng = 89.0;

    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;

    const topPercent = ((maxLat - lat) / latSpan) * 100;
    const leftPercent = ((lng - minLng) / lngSpan) * 100;

    // Bounds check to avoid overflow in visual container
    const boundedTop = Math.max(8, Math.min(92, topPercent));
    const boundedLeft = Math.max(8, Math.min(92, leftPercent));

    return { top: `${boundedTop}%`, left: `${boundedLeft}%` };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const activeStore = stores.find(s => s.id === selectedStoreId) || stores[0];
    if (!activeStore) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pctX = x / rect.width;
    const pctY = y / rect.height;

    const minLat = 22.0;
    const maxLat = 29.0;
    const minLng = 72.0;
    const maxLng = 89.0;

    const calculatedLat = maxLat - (pctY * (maxLat - minLat));
    const calculatedLng = minLng + (pctX * (maxLng - minLng));

    const roundedLat = Math.round(calculatedLat * 10000) / 10000;
    const roundedLng = Math.round(calculatedLng * 10000) / 10000;

    const updatedStore: Store = {
      ...activeStore,
      latitude: roundedLat,
      longitude: roundedLng
    };

    dashboardService.saveStore(updatedStore);
    fetchStores();

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.setValueAtTime(440, audioContext.currentTime);
        gain.gain.setValueAtTime(0.04, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.12);
      }
    } catch (err) {
      // safe fallback for secure browser contexts without Web Audio setup
    }
  };

  return (
    <div className="space-y-6 text-left" id="store-management-tab-view">
      
      {/* Header bar actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Branch & Location Outlets</h3>
          <p className="text-[11px] text-slate-400 font-medium">Configure individual store address targets, categories, and delivery boundaries</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl border border-transparent shadow-md hover:shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 self-start cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Location</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Stores Cards Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {stores.map(store => (
              <motion.div
                key={store.id}
                layoutId={store.id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedStoreId(store.id)}
                className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 select-none transition-all duration-200 cursor-pointer ${
                  selectedStoreId === store.id 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Store Top details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-extrabold uppercase bg-slate-50 text-slate-550 border border-slate-100 px-2 py-0.5 rounded-full">
                      {store.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(store.id);
                      }}
                      className={`flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 text-[10px] font-black cursor-pointer select-none transition-all duration-200 ${
                        store.status === 'Active' 
                          ? 'bg-emerald-50 border-emerald-250/30 text-emerald-700 hover:bg-emerald-100/70 hover:scale-[1.03]' 
                          : 'bg-rose-50 border-rose-250/30 text-rose-700 hover:bg-rose-100/70 hover:scale-[1.03]'
                      }`}
                      title="Click directly to toggle status"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${store.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span>{store.status}</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-850 truncate flex items-center gap-1.5">
                      <StoreIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span>{store.name}</span>
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-1 flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </p>
                  </div>
                </div>

                {/* Sub details card list */}
                <div className="space-y-1.5 border-t border-slate-50 pt-3 text-[11px] font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center justify-between text-indigo-600 bg-indigo-50/50 rounded-lg p-1.5 border border-indigo-100/20 font-extrabold mt-2 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3 animate-pulse" />
                      Target Bound:
                    </span>
                    <span>{store.radiusTargetKm} km limit</span>
                  </div>
                  
                  {/* GPS Coordinate Display */}
                  <div className="flex items-center justify-between text-teal-600 bg-teal-50/55 rounded-lg p-1.5 border border-teal-100/20 font-mono text-[9px] select-text">
                    <span className="flex items-center gap-1 font-bold">
                      <MapPin className="h-3 w-3 text-teal-500" />
                      GPS Pin Loc:
                    </span>
                    <span>
                      {(store.latitude ?? 28.6304).toFixed(4)}&deg;N, {(store.longitude ?? 77.2177).toFixed(4)}&deg;E
                    </span>
                  </div>
                </div>

                {/* Edit commands */}
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-100/80 mt-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(store.id);
                    }}
                    className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none transition-colors ${
                      store.status === 'Active' 
                        ? 'text-amber-600 hover:text-amber-700' 
                        : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${store.status === 'Active' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span>{store.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center gap-2 select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPinModal(store);
                      }}
                      className="text-[10px] text-teal-600 hover:text-teal-750 font-bold flex items-center gap-0.5 cursor-pointer select-none"
                      title="Set exact GPS pin on virtual map"
                    >
                      <MapPin className="h-3.5 w-3.5 text-teal-500" /> Pin
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(store);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-805 font-bold flex items-center gap-0.5 cursor-pointer select-none"
                    >
                      <Edit2 className="h-3 w-3 text-indigo-500" /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStore(store.id, store.name);
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer select-none"
                    >
                      <Trash2 className="h-3 w-3 text-rose-400" /> Delete
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}

            {stores.length === 0 && (
              <div className="col-span-2 text-center p-12 bg-white border border-slate-100 rounded-3xl text-slate-400 space-y-3">
                <StoreIcon className="h-10 w-10 mx-auto text-slate-300" />
                <div>
                  <p className="text-xs font-bold text-slate-800">No Stores Registered</p>
                  <p className="text-[11px] text-slate-400">Click the add button above to map your first commercial branch outlet.</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Virtual Google Maps Vector placeholder */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>Target Delivery Map Overlay</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed animate-fade-in">
              Active GPS pins of configured store branches. Generates target radii circles mapping nearby potential leads.
            </p>
          </div>

          {/* Map Vector visualization placeholder */}
          <div 
            className="relative h-[310px] bg-slate-100 rounded-2xl border border-slate-250 overflow-hidden flex items-center justify-center shadow-inner"
            title="Interactive Map - Click directly to set or move the selected store's Pin!"
          >
            <MultiStoreMap
              stores={stores}
              selectedStoreId={selectedStoreId || undefined}
              onSelectStore={(id) => setSelectedStoreId(id)}
              onStorePositionChange={(id, lat, lng) => {
                setSelectedStoreId(id);
                handleMapLocationChange(lat, lng);
              }}
              interactive={true}
            />
          </div>

          <p className="text-[11px] font-medium text-slate-405 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100 text-slate-500">
            <strong>Radius Targeting advice:</strong> Setting target zones below 5 kilometers gives extremely dense push alerts with low budget wasting. Ideal for fast-delivery micro retail items.
          </p>
        </div>

      </div>

      {/* Dynamic Popups Modal Add/Edit Branch */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 text-slate-800">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 text-left relative"
            >
              <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
                <StoreIcon className="h-4.5 w-4.5 text-indigo-500" />
                <span>{editingStoreId ? 'Configure Store Details' : 'Register New Location'}</span>
              </h4>

              <form onSubmit={handleSaveStore} className="space-y-4">
                
                {/* Store Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Branch Location Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AdPulse Elite Store"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Branch Category dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Business Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="SaaS & Ad Services">SaaS & Ad Services</option>
                    <option value="Retail Apparel">Retail Apparel</option>
                    <option value="Footwear & Premium Accessories">Footwear & Premium Accessories</option>
                    <option value="Gold & Fine Jewelry">Gold & Fine Jewelry</option>
                    <option value="Food & Hyperlocal Beverage">Food & Hyperlocal Beverage</option>
                  </select>
                </div>

                {/* Address details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Physical Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 101, Connaught Circle, Block G"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Inline contact and status hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phone Connection</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Opening Hours</label>
                    <input
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="09:00 AM - 09:00 PM"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Target Geolocation picker + address search */}
                <LocationPicker
                  latitude={latitude}
                  longitude={longitude}
                  address={address}
                  onLocationChange={(lat, lng, addr) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    if (addr) setAddress(addr);
                  }}
                  title="Branch Map Geolocation"
                />

                {/* Target Radius Selection */}
                <RadiusSelector
                  value={radiusTargetKm}
                  onChange={(val) => setRadiusTargetKm(val)}
                />

                <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-150 text-left">
                  <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider block">Branch Location Status</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setStatus('Active')}
                      className={`grow py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer text-center transition-all ${status === 'Active' ? 'bg-emerald-150 text-emerald-800 border border-emerald-300' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Inactive')}
                      className={`grow py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer text-center transition-all ${status === 'Inactive' ? 'bg-rose-150 text-rose-800 border border-rose-300' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                {/* Buttons footer */}
                <div className="border-t border-slate-50 pt-4 flex items-center justify-end gap-2 text-xs font-extrabold">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="rounded-xl"
                  >
                    Save branch changes
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && storeToDelete && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 text-slate-800" id="store-delete-confirm-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 text-left relative"
              id="store-delete-confirm-box"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest">
                    Remove Store Branch?
                  </h4>
                  <p className="text-[11px] text-slate-450 mt-1.5 leading-relaxed">
                    Are you sure you want to permanently delete <strong className="text-slate-700">{storeToDelete.name}</strong>? All target coordinates, radius definitions, and push delivery maps config for this branch will be cleared. This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex items-center justify-end gap-2 text-xs font-extrabold pt-2.5 border-t border-slate-50">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setStoreToDelete(null);
                    }}
                    className="rounded-xl font-extrabold"
                  >
                    Cancel
                  </Button>
                  <button
                    onClick={confirmDeleteStore}
                    className="px-4.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-md hover:shadow-rose-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map Pin Assignment Modal */}
      <AnimatePresence>
        {isPinModalOpen && pinStore && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 text-slate-800" id="store-pin-config-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 text-left relative"
              id="store-pin-config-box"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-5 w-5 text-teal-505 animate-bounce" />
                    <div>
                      <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest leading-none">Map Pin Assignment</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Assign geographic coordinates for {pinStore.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsPinModalOpen(false);
                      setPinStore(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-50 hover:bg-slate-100 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                {/* Real-time OpenStreetMap Interactive Dropper */}
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Interactive Location Dropper Map</label>
                  <div className="h-[220px] rounded-2xl overflow-hidden border border-slate-250 relative bg-slate-50">
                    <StoreMap
                      center={{ lat: tempLat, lng: tempLng }}
                      radiusKm={pinStore.radiusTargetKm}
                      onLocationChange={(lat, lng) => {
                        setTempLat(Math.round(lat * 100000) / 100000);
                        setTempLng(Math.round(lng * 100000) / 100000);
                      }}
                      interactive={true}
                    />
                  </div>
                </div>

                {/* Coord values */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Latitude (&deg;N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="-90"
                      max="90"
                      value={tempLat}
                      onChange={(e) => setTempLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Longitude (&deg;E)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="-180"
                      max="180"
                      value={tempLng}
                      onChange={(e) => setTempLng(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Popular Indian City Shortcuts */}
                <div className="space-y-1 pt-1 text-left">
                  <label className="text-[9px] font-black text-slate-400 uppercase block tracking-widest">Regional Indian City Presets</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Connaught Place (Delhi)', lat: 28.6304, lng: 77.2177 },
                      { name: 'Marine Drive (Mumbai)', lat: 18.9402, lng: 72.8252 },
                      { name: 'Salt Lake City (Kolkata)', lat: 22.5726, lng: 88.4149 },
                      { name: 'Indiranagar (Bengaluru)', lat: 12.9716, lng: 77.6412 },
                    ].map(city => (
                      <button
                        key={city.name}
                        onClick={() => {
                          setTempLat(city.lat);
                          setTempLng(city.lng);
                        }}
                        className="text-[9.5px] font-black px-2 py-1 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 bg-white rounded-lg transition-colors cursor-pointer select-none"
                      >
                        {city.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 text-xs font-extrabold pt-3.5 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPinModalOpen(false);
                      setPinStore(null);
                    }}
                    className="rounded-xl font-extrabold"
                  >
                    Cancel
                  </Button>
                  <button
                    onClick={handleSavePin}
                    className="px-4.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition-colors shadow-md hover:shadow-teal-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Save Placed Pin
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
