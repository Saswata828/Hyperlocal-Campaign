import * as React from 'react';
import { 
  User, 
  Lock, 
  BellRing, 
  CreditCard, 
  Store, 
  HelpCircle, 
  ShieldCheck, 
  Check, 
  Bot,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';

interface SettingsPageProps {
  currentUser: any;
  onUpdateUser?: (updatedUser: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser }) => {
  const [bName, setBName] = React.useState(currentUser?.businessName || '');
  const [mOwner, setMOwner] = React.useState(currentUser?.ownerName || '');
  const [gstin, setGstin] = React.useState(currentUser?.gstin || '');
  const [currentValEmail, setCurrentValEmail] = React.useState(currentUser?.email || '');
  const [mobileNum, setMobileNum] = React.useState(currentUser?.mobileNumber || '');

  // Password params
  const [currPass, setCurrPass] = React.useState('');
  const [newPass, setNewPass] = React.useState('');

  const [notifSound, setNotifSound] = React.useState(true);
  const [notifLowStock, setNotifLowStock] = React.useState(true);

  // Status visual cues
  const [statusProfileSaved, setStatusProfileSaved] = React.useState(false);
  const [statusSecSaved, setStatusSecSaved] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentUser) {
      setBName(currentUser.businessName || '');
      setMOwner(currentUser.ownerName || '');
      setGstin(currentUser.gstin || '');
      setCurrentValEmail(currentUser.email || '');
      setMobileNum(currentUser.mobileNumber || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const response = await apiService.updateProfile({
        businessName: bName,
        ownerName: mOwner,
        gstin: gstin,
        mobileNumber: mobileNum
      });
      if (response && response.success) {
        setStatusProfileSaved(true);
        if (onUpdateUser) {
          onUpdateUser(response.user);
        }
        setTimeout(() => setStatusProfileSaved(false), 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to update profile details.");
    }
  };

  const handleSavePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPass.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    try {
      const response = await apiService.updateProfile({
        password: newPass
      });
      if (response && response.success) {
        setStatusSecSaved(true);
        setTimeout(() => {
          setStatusSecSaved(false);
          setCurrPass('');
          setNewPass('');
        }, 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to update security credentials.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fade-in" id="settings-tab-view">
      
      {/* Left Settings inputs lists */}
      <div className="lg:col-span-8 space-y-6">
        
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 text-rose-800 text-xs font-semibold">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Profile Details Block */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
          <div className="border-b border-slate-50 pb-3 mb-5">
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-indigo-500" /> Administrative Profile Details
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold">Change principal merchant details and tax identifiers used in campaigns</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Registered Corporation Name</label>
                <input
                  type="text"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Supervising Administrator Name</label>
                <input
                  type="text"
                  value={mOwner}
                  onChange={(e) => setMOwner(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Official GSTIN Registry ID</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Primary Notification Mail Link</label>
                <input
                  type="email"
                  value={currentValEmail}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none bg-slate-50 text-slate-500 shrink-0 select-none cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contact Mobile Number</label>
                <input
                  type="text"
                  value={mobileNum}
                  onChange={(e) => setMobileNum(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-bold">Verification parameters are mapped securely on server databases.</span>
              {statusProfileSaved ? (
                <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1 animate-pulse">
                  <Check className="h-4.5 w-4.5" /> Details synchronized!
                </span>
              ) : (
                <Button type="submit" variant="primary" className="rounded-xl text-xs font-bold py-2 px-4.5">
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Security / Password Block */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
          <div className="border-b border-slate-50 pb-3 mb-5">
            <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="h-4.5 w-4.5 text-indigo-500" /> Corporate Password Update
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold text-slate-400">Regularly cycle your API connect code to keep campaigns secure</p>
          </div>

          <form onSubmit={handleSavePass} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Password PIN</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">New Cryptographic PIN</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 font-bold">Standard security rules: Minimum 8 symbols containing numerals.</span>
              {statusSecSaved ? (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <Check className="h-4.5 w-4.5" /> Secure PIN registered!
                </span>
              ) : (
                <Button type="submit" variant="primary" disabled={!newPass.trim()} className="rounded-xl text-xs font-bold py-2">
                  Update Security Profile
                </Button>
              )}
            </div>
          </form>
        </div>

      </div>

      {/* Right side billing and notification checkboxes */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Toggle selectors preferences */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2.5">
            Automatic triggers Preference
          </h4>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-700 block">Audience Sound Pings</span>
                <span className="text-[9px] text-slate-400 font-semibold block leading-tight">Sound alerts when inquiries trigger</span>
              </div>
              <input
                type="checkbox"
                checked={notifSound}
                onChange={() => setNotifSound(!notifSound)}
                className="h-4.5 w-4.5 rounded text-indigo-600 border-slate-300 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-slate-700 block">Critical Inventory Trigger</span>
                <span className="text-[9px] text-slate-400 font-semibold block leading-tight">Push warning on items below 10 units</span>
              </div>
              <input
                type="checkbox"
                checked={notifLowStock}
                onChange={() => setNotifLowStock(!notifLowStock)}
                className="h-4.5 w-4.5 rounded text-indigo-600 border-slate-300 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Subscription / billing details layout */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-300 space-y-4">
          <div className="border-b border-indigo-950 pb-2 flex items-center justify-between">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-indigo-400" /> Core billing status
            </span>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-900 px-2 py-0.5 rounded font-extrabold">Active</span>
          </div>

          <div>
            <span className="text-[9px] text-slate-400 font-bold block">CURRENT SERVICE MODEL</span>
            <strong className="text-sm font-black text-white block mt-0.5">AdPulse Professional tier</strong>
            <p className="text-[11.5px] leading-relaxed text-slate-400 mt-2">
              Billed monthly. Unlocked full LLM generation triggers, unlimited store targets, and high-frequency webhook sync tools.
            </p>
          </div>

          <div className="pt-2 border-t border-indigo-950 leading-none">
            <span className="text-[9px] text-slate-450 font-bold block">NEXT CHARGE DATE</span>
            <span className="text-xs font-extrabold text-slate-200 mt-1 block">November 12, 2026</span>
          </div>

        </div>

      </div>

    </div>
  );
};
