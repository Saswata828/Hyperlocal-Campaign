import * as React from 'react';
import { 
  Target, 
  Trash2, 
  Settings, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  CircleDollarSign,
  Search,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { dashboardService, Campaign } from '../../services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const CampaignManagement: React.FC<{ onRefresh: () => void; onViewTab?: (tab: string) => void }> = ({ onRefresh, onViewTab }) => {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [campaignToDelete, setCampaignToDelete] = React.useState<{ id: string; name: string } | null>(null);

  const fetchCampaigns = () => {
    setCampaigns(dashboardService.getCampaigns());
  };

  React.useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = (id: string, name: string) => {
    setCampaignToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCampaign = () => {
    if (campaignToDelete) {
      dashboardService.deleteCampaign(campaignToDelete.id);
      fetchCampaigns();
      onRefresh();
      setIsDeleteModalOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleLaunch = (camp: Campaign) => {
    const updated: Campaign = {
      ...camp,
      status: 'Active',
      reach: 1200,
      engagement: 340,
      leads: 12,
      roi: 110,
    };
    dashboardService.saveCampaign(updated);
    fetchCampaigns();
    onRefresh();
  };

  // Filters logic
  const filtered = campaigns.filter(c => {
    const statusMatch = filterStatus === 'All' || c.status === filterStatus;
    const searchTermLower = (searchTerm || '').toLowerCase();
    const nameMatch = (c.name || '').toLowerCase().includes(searchTermLower) || 
                      (c.festival || '').toLowerCase().includes(searchTermLower);
    return statusMatch && nameMatch;
  });

  // Calculate high-level aggregates
  const totalSpend = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalReach = campaigns.reduce((acc, c) => acc + c.reach, 0);

  // Chart data preparing from existing data
  const chartData = campaigns.map(c => ({
    name: c.name.slice(0, 16) + '...',
    Budget: c.budget,
    Reach: c.reach
  }));

  const statusTags = ['All', 'Active', 'Scheduled', 'Draft', 'Completed'];

  return (
    <div className="space-y-6 text-left" id="campaign-management-tab-view">
      
      {/* Header aggregates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Campaign Operations Center</h3>
          <p className="text-[11px] text-slate-400 font-medium">Coordinate ongoing nearby social broadcaster broadcasts, schedule timers, and review spend indexes</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 rounded-2xl px-4 py-2 text-xs font-semibold">
          <div>
            <span className="text-[9px] text-slate-400 font-bold block">ENGAGED LOCAL BUDGET</span>
            <span className="text-slate-800 font-black">INR {totalSpend.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[9px] text-slate-400 font-bold block">AGGREGATE IMPRESSIONS</span>
            <span className="text-slate-800 font-black">{totalReach.toLocaleString()} users</span>
          </div>
        </div>
      </div>

      {/* Tables control headers search bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-150 rounded-2xl shadow-xs">
        
        {/* Search */}
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaign terms, festivals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>

        {/* Dynamic status selection tab selectors */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {statusTags.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterStatus === tab
                  ? 'bg-indigo-600 text-white border-transparent'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Campaigns Listing Enterprise Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-medium border-collapse text-left">
            <thead>
              <tr className="bg-slate-55 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <th className="p-4">Campaign Name & Festival</th>
                <th className="p-4">Ad Type / Channels</th>
                <th className="p-4">Radius Bound</th>
                <th className="p-4">Est Budget (INR)</th>
                <th className="p-4">Status Tag</th>
                <th className="p-4 text-right">Reach Metrics</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {filtered.map(camp => (
                <tr key={camp.id} className="hover:bg-slate-50/50 text-slate-700 transition-colors">
                  
                  {/* Name */}
                  <td className="p-4">
                    <div className="max-w-[200px]">
                      <h4 className="font-extrabold text-slate-850 truncate">{camp.name}</h4>
                      <span className="text-[10px] text-indigo-600 font-bold font-mono tracking-tight">{camp.festival}</span>
                    </div>
                  </td>

                  {/* Platforms list */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {camp.platforms.map(plat => (
                        <span key={plat} className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {plat}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Radius */}
                  <td className="p-4">
                    <span className="font-bold text-slate-800">{camp.radiusKm} km scope</span>
                  </td>

                  {/* Budget */}
                  <td className="p-4">
                    <span className="font-extrabold text-slate-900">INR {camp.budget.toLocaleString()}</span>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      camp.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse'
                        : camp.status === 'Scheduled'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : camp.status === 'Completed'
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${camp.status === 'Active' ? 'bg-emerald-500 animate-ping' : camp.status === 'Scheduled' ? 'bg-blue-500' : camp.status === 'Completed' ? 'bg-slate-400' : 'bg-amber-400'}`} />
                      {camp.status}
                    </span>
                  </td>

                  {/* Reach details */}
                  <td className="p-4 text-right">
                    {camp.status === 'Completed' || camp.status === 'Active' ? (
                      <div>
                        <strong className="text-slate-800 text-[11px] block">{camp.reach.toLocaleString()}</strong>
                        <span className="text-[9px] text-indigo-600 font-extrabold">{camp.leads} inquiries generated</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Awaiting Launch</span>
                    )}
                  </td>

                  {/* Commands */}
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5 font-bold">
                      {camp.status === 'Draft' && (
                        <button
                          onClick={() => handleLaunch(camp)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-1 rounded-md cursor-pointer transition-colors"
                          title="Push Live immediately"
                        >
                          Launch
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(camp.id, camp.name)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer transition-all"
                        title="Delete campaign"
                        id={"btn-delete-campaign-" + camp.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-semibold space-y-4">
                    <Target className="h-11 w-11 mx-auto text-indigo-500 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800">No Target Campaigns Active</p>
                      <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">Reach prospective customers within 1 to 15 kilometers of your store branch! Select a local festival target, draft a smart discount offer, and launch instantly.</p>
                    </div>
                    {onViewTab && (
                      <button
                        type="button"
                        onClick={() => onViewTab('generator')}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-95 shrink-0"
                      >
                        Generate your first AI campaign in 1 click
                      </button>
                    )}
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Underbar Budget distribution chart using Recharts */}
      {filtered.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2.5 mb-4">
            Campaign Budget & Performance Distribution
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" fontSize={9} stroke="#94a3b8" tickLine={false} />
                <YAxis fontSize={9} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Campaign Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && campaignToDelete && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 text-slate-800" id="campaign-delete-confirm-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 overflow-hidden text-left"
              id="campaign-delete-confirm-box"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-850 uppercase tracking-widest">
                    Delete Campaign?
                  </h4>
                  <p className="text-[11px] text-slate-450 mt-1.5 leading-relaxed">
                    Are you sure you want to permanently delete <strong className="text-slate-700">{campaignToDelete.name}</strong>? All generated advertising copy, headline, reach targets, performance statistics, and live platform configurations will be cleared. This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex items-center justify-end gap-2 text-xs font-extrabold pt-2.5 border-t border-slate-50">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setCampaignToDelete(null);
                    }}
                    className="rounded-xl font-extrabold"
                  >
                    Cancel
                  </Button>
                  <button
                    onClick={confirmDeleteCampaign}
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

    </div>
  );
};
