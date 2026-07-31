import * as React from 'react';
import { getApiUrl } from '../../services/api';
import { 
  Facebook, 
  Instagram, 
  MessageCircle, 
  MapPin, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PublishHistoryEntry {
  id: string;
  campaignId: string;
  campaignName: string;
  merchantEmail: string;
  merchantName: string;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'google';
  publishDate: string;
  publishTime: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  postId: string;
  errorMessage?: string;
  caption: string;
  bannerUrl: string;
}

export const PublishHistory: React.FC = () => {
  const [history, setHistory] = React.useState<PublishHistoryEntry[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [platformFilter, setPlatformFilter] = React.useState<string>('all');
  const [selectedEntry, setSelectedEntry] = React.useState<PublishHistoryEntry | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/social/publish-history'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data || []);
      }
    } catch (err) {
      console.error("Failed to load publish history:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleRetry = async (e: React.MouseEvent, entry: PublishHistoryEntry) => {
    e.stopPropagation(); // Avoid opening details modal
    setActionLoading(entry.id);
    try {
      const response = await fetch(getApiUrl('/api/social/retry-publish'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('_hyperlocal_access_token')}`
        },
        body: JSON.stringify({ historyId: entry.id })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast('success', `Campaign "${entry.campaignName}" successfully published to ${entry.platform.toUpperCase()}!`);
        // Refresh local history list
        fetchHistory();
      } else {
        showToast('error', data.error || `Retry failed for ${entry.platform.toUpperCase()}.`);
      }
    } catch (err: any) {
      showToast('error', err.message || "Failed to reach backend server.");
    } finally {
      setActionLoading(null);
    }
  };

  const getPlatformDetails = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return {
          title: 'Facebook Page',
          icon: Facebook,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&q=80'
        };
      case 'instagram':
        return {
          title: 'Instagram Business',
          icon: Instagram,
          color: 'text-pink-600',
          bg: 'bg-pink-50',
          border: 'border-pink-100',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
        };
      case 'whatsapp':
        return {
          title: 'WhatsApp Business',
          icon: MessageCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80'
        };
      case 'google':
        return {
          title: 'Google Profile',
          icon: MapPin,
          color: 'text-rose-600',
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&q=80'
        };
      default:
        return {
          title: 'Other Platform',
          icon: GlobeIcon,
          color: 'text-slate-500',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'
        };
    }
  };

  const GlobeIcon = (props: any) => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );

  // Filters
  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         entry.postId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPlatform = platformFilter === 'all' || entry.platform.toLowerCase() === platformFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in" id="publish-history-panel">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[9999] p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-2xl ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-600" />
          <span>Multi-Channel Publish History</span>
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Monitor recent ad creative distribution cycles, track live post IDs, check transaction API codes, and trigger retries on failed broadcasts.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold md:w-80">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search campaigns, ID, merchant..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-750 font-semibold w-full placeholder:text-slate-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>Platform:</span>
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none font-bold"
            >
              <option value="all">All Channels</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="google">Google Profile</option>
            </select>
          </div>

          <button 
            onClick={fetchHistory}
            className="p-2 rounded-xl hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
            <strong className="text-xs text-slate-500">Loading publication registry logs...</strong>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Clock className="h-6 w-6" />
            </div>
            <div className="max-w-xs">
              <span className="text-xs font-black text-slate-700 block">No Publication History Recorded</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block leading-normal">
                There are no matches for the selected filters. Make sure you have connected accounts and executed ad campaigns.
              </span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-black tracking-wider text-slate-400 select-none">
                  <th className="py-4 px-6">Campaign Info</th>
                  <th className="py-4 px-4">Merchant</th>
                  <th className="py-4 px-4">Platform</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Post ID</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {filteredHistory.map((entry) => {
                  const details = getPlatformDetails(entry.platform);
                  const PlatformIcon = details.icon;
                  const isFailed = entry.status === 'FAILED';
                  const isSuccess = entry.status === 'SUCCESS';

                  return (
                    <tr 
                      key={entry.id} 
                      onClick={() => setSelectedEntry(entry)}
                      className="hover:bg-slate-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Campaign Name with thumbnail */}
                      <td className="py-3.5 px-6 max-w-[220px]">
                        <div className="flex items-center gap-3">
                          {entry.bannerUrl ? (
                            <img 
                              src={entry.bannerUrl} 
                              alt="Ad Campaign banner" 
                              className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-xs shrink-0" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0">
                              <Sparkles className="h-5.5 w-5.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 block truncate group-hover:text-indigo-650">{entry.campaignName}</span>
                            <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5">ID: {entry.campaignId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Merchant details */}
                      <td className="py-3.5 px-4 max-w-[150px] truncate">
                        <div>
                          <span className="font-bold text-slate-900 block truncate">{entry.merchantName}</span>
                          <span className="text-[9px] text-slate-400 block font-semibold truncate">{entry.merchantEmail}</span>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold border ${details.bg} ${details.border} ${details.color} text-[10.5px]`}>
                          <PlatformIcon className="h-3.5 w-3.5" />
                          <span>{details.title}</span>
                        </span>
                      </td>

                      {/* Publish Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-bold block flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" /> {entry.publishDate}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono font-semibold block flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" /> {entry.publishTime}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-fit select-none">
                            <CheckCircle2 className="h-3 w-3" /> SUCCESS
                          </span>
                        ) : isFailed ? (
                          <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-fit select-none">
                            <XCircle className="h-3 w-3" /> FAILED
                          </span>
                        ) : (
                          <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-fit select-none">
                            <Clock className="h-3 w-3" /> PENDING
                          </span>
                        )}
                      </td>

                      {/* Post ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[10px] font-bold text-slate-500">
                        {entry.postId && entry.postId !== 'N/A' ? (
                          <span className="bg-slate-50 border border-slate-150 px-2 py-0.5 rounded text-slate-700 font-extrabold flex items-center gap-1 w-fit">
                            {entry.postId}
                          </span>
                        ) : (
                          <span className="text-slate-300 select-none">N/A</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {isFailed && (
                            <button
                              onClick={(e) => handleRetry(e, entry)}
                              disabled={actionLoading === entry.id}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 disabled:bg-indigo-200 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-lg flex items-center gap-1 shadow-xs cursor-pointer select-none"
                            >
                              {actionLoading === entry.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <span>Retry</span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details View Modal Panel */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] select-none" id="details-modal-overlay">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 text-slate-800"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Publish Transaction Details</h3>
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">ID: {selectedEntry.id}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-450 transition-colors cursor-pointer text-slate-500 font-bold text-sm"
                >
                  ✕ Close
                </button>
              </div>

              {/* Modal Scroll Body */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                {/* 1. LEFT PANEL: Smartphone / Preview Mockup */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 block self-start">Interactive Mockup Preview</span>
                  
                  {/* Smartphone visual frame container */}
                  <div className="w-[260px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative">
                    {/* Ear Speaker Notch */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-20 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                      <div className="h-1 w-8 bg-slate-800 rounded-full" />
                    </div>

                    {/* App Internal Display */}
                    <div className="bg-white rounded-[32px] overflow-hidden text-[10px] w-full min-h-[380px] border border-slate-900 flex flex-col relative select-text">
                      {/* App Header Row */}
                      <div className="bg-slate-50 border-b border-slate-100 p-2.5 pt-6 flex items-center gap-1.5">
                        <img 
                          src={getPlatformDetails(selectedEntry.platform).avatar} 
                          alt="Merchant profile logo" 
                          className="h-6 w-6 rounded-full object-cover border border-slate-200 shadow-xs" 
                        />
                        <div className="text-left min-w-0">
                          <strong className="font-extrabold text-slate-900 leading-tight block truncate text-[9.5px]">
                            {selectedEntry.merchantName}
                          </strong>
                          <span className="text-[7.5px] text-slate-450 font-bold block flex items-center gap-0.5">
                            {getPlatformDetails(selectedEntry.platform).title} • {selectedEntry.publishDate}
                          </span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                        {/* Caption text */}
                        <p className="text-[9px] leading-relaxed text-slate-700 font-medium max-h-[80px] overflow-y-auto">
                          {selectedEntry.caption}
                        </p>

                        {/* Creative Image */}
                        {selectedEntry.bannerUrl && (
                          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs relative">
                            <img 
                              src={selectedEntry.bannerUrl} 
                              alt="Ad Campaign banner mockup" 
                              className="w-full h-[150px] object-cover" 
                            />
                            {/* Logo Platform stamp overlay */}
                            <span className="absolute bottom-2 right-2 bg-slate-900/60 backdrop-blur-xs p-1 rounded-md text-white border border-white/10 flex items-center">
                              {React.createElement(getPlatformDetails(selectedEntry.platform).icon, { className: "h-3 w-3" })}
                            </span>
                          </div>
                        )}

                        {/* Interactive Engagement simulated buttons */}
                        <div className="border-t border-slate-50 pt-2 flex justify-between px-2 text-[8.5px] text-slate-400 font-bold">
                          <span>❤️ 1.2k</span>
                          <span>💬 85</span>
                          <span>✈️ Share</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* 2. RIGHT PANEL: API / Transaction execution details */}
                <div className="md:col-span-7 space-y-5">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 select-text ${
                    selectedEntry.status === 'SUCCESS'
                      ? 'bg-emerald-50/50 border-emerald-150 text-slate-800'
                      : 'bg-rose-50/50 border-rose-150 text-slate-850'
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {selectedEntry.status === 'SUCCESS' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        {selectedEntry.status === 'SUCCESS' ? 'Publication Succeeded' : 'Publication Failed'}
                      </h4>
                      <p className="text-[10.5px] leading-relaxed mt-1 text-slate-500 font-medium">
                        {selectedEntry.status === 'SUCCESS' 
                          ? `The ad creative was successfully verified and posted to your linked official ${getPlatformDetails(selectedEntry.platform).title}. Post status is live and indexable.`
                          : `The Graph/Cloud API rejected the post request. Check the transaction error report below.`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Core Properties */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">CAMPAIGN NAME</span>
                      <span className="text-slate-900 mt-0.5 block font-black">{selectedEntry.campaignName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">POST ID / RECORD</span>
                      <span className="text-slate-900 mt-0.5 block font-mono text-[10.5px]">{selectedEntry.postId || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">PUBLISH CHANNEL</span>
                      <span className="text-slate-900 mt-0.5 block flex items-center gap-1 capitalize">
                        {React.createElement(getPlatformDetails(selectedEntry.platform).icon, { className: `h-3.5 w-3.5 ${getPlatformDetails(selectedEntry.platform).color}` })}
                        {getPlatformDetails(selectedEntry.platform).title}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">PARTNER ADMIN</span>
                      <span className="text-slate-900 mt-0.5 block">{selectedEntry.merchantName}</span>
                    </div>
                  </div>

                  {/* Error notes or Transaction audit trail logs */}
                  <div className="space-y-2 select-text">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Enterprise API Transaction Logs</span>
                    
                    {selectedEntry.status === 'FAILED' && selectedEntry.errorMessage && (
                      <div className="p-3.5 bg-rose-950/5 border border-rose-200 text-rose-700 rounded-xl text-[10.5px] font-bold font-mono">
                        <strong className="block text-rose-800 text-[11px] mb-1 font-sans">⚠️ Error Exception:</strong>
                        {selectedEntry.errorMessage}
                      </div>
                    )}

                    <div className="bg-slate-950 text-slate-300 rounded-2xl p-4.5 text-[10px] font-bold font-mono max-h-[160px] overflow-y-auto space-y-1.5 border border-slate-900">
                      <div><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> <span className="text-indigo-400">INITIATING</span> social broadcasting pipelines...</div>
                      <div><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> FETCHING credentials from HSM key-ring...</div>
                      <div><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> ESTABLISHING secure SSL connection...</div>
                      <div><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> UPLOADING ad canvas creative assets to servers...</div>
                      {selectedEntry.status === 'SUCCESS' ? (
                        <>
                          <div><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> DISPATCHING Graph post API call...</div>
                          <div className="text-emerald-400"><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> SUCCESS - Status code 200 OK. Post distributed!</div>
                          <div className="text-slate-400">Post Live URL: https://{selectedEntry.platform}.com/{selectedEntry.postId}</div>
                        </>
                      ) : (
                        <>
                          <div><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> DISPATCHING Graph post API call...</div>
                          <div className="text-rose-500"><span className="text-slate-500">[{selectedEntry.publishDate} {selectedEntry.publishTime}]</span> EXCEPTION: Graph/Cloud API returned error code 400 Bad Request.</div>
                          <div className="text-slate-400">Error Payload: {"{"} error: "OAuthException", message: "{selectedEntry.errorMessage || 'Invalid user token'}" {"}"}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions in details */}
                  {selectedEntry.status === 'FAILED' && (
                    <button
                      onClick={(e) => {
                        handleRetry(e, selectedEntry);
                        setSelectedEntry(null);
                      }}
                      disabled={actionLoading === selectedEntry.id}
                      className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-xs py-3 rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {actionLoading === selectedEntry.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" /> Re-trigger API Dispatch Now
                        </>
                      )}
                    </button>
                  )}

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
