import * as React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Percent, 
  CircleDollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

export const AnalyticsReports: React.FC = () => {
  // Campaign statistics over time
  const monthlyPerf = [
    { month: 'Jan', Budget: 25000, Reach: 18000, ROI: 180 },
    { month: 'Feb', Budget: 35000, Reach: 29000, ROI: 210 },
    { month: 'Mar', Budget: 45000, Reach: 42000, ROI: 245 },
    { month: 'Apr', Budget: 30005, Reach: 21000, ROI: 195 },
    { month: 'May', Budget: 80000, Reach: 95000, ROI: 310 }
  ];

  const platformProportions = [
    { name: 'Instagram Broadcast', value: 45, color: '#ec4899' },
    { name: 'Facebook Pro Pages', value: 30, color: '#3b82f6' },
    { name: 'WhatsApp Business', value: 18, color: '#10b981' },
    { name: 'Twitter / X Sponsored', value: 7, color: '#0f172a' }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in" id="analytics-reports-tab-view">
      
      {/* Header operations */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">SaaS Hyperlocal Intel Suite</h3>
          <p className="text-[11px] text-slate-400 font-medium font-medium">Verify aggregate CTRs, audience growth projections, and social publisher performance comparisons</p>
        </div>
        <span className="text-[10px] bg-slate-55 border border-slate-100 text-slate-500 font-bold px-3 py-1.5 rounded-xl self-start flex items-center gap-1">
          📊 Core Database Connected
        </span>
      </div>

      {/* Main split charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: ROI trends */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-50 pb-3 mb-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" /> Campaign ROI Growth trajectory
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold font-medium">Growth values track pre-buying and coupon redemption margins</p>
          </div>

          <div className="h-[210px] w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerf}>
                <defs>
                  <linearGradient id="colorRoiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #f1f5f9' }} />
                <Legend iconSize={8} />
                <Area type="monotone" name="Conversion ROI %" dataKey="ROI" stroke="#6366f1" strokeWidth={3} fill="url(#colorRoiGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Platform distribution pie */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-50 pb-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Target Channel allocation</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Proportions based on active social engagements</p>
          </div>

          {/* Pie rendering */}
          <div className="h-[140px] w-full flex items-center justify-center font-mono select-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformProportions}
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {platformProportions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl select-text font-mono">
            {platformProportions.map(plat => (
              <div key={plat.name} className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: plat.color }} />
                  {plat.name}
                </span>
                <span>{plat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Spend VS Leads bar chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
        
        <div className="border-b border-slate-50 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Target allocation Budget VS Impressions reached</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Normalized metrics comparing budgets allocated against impression indices</p>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Quarter summary</span>
        </div>

        <div className="h-[210px] w-full font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerf}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip />
              <Legend iconSize={8} />
              <Bar name="Invested Budget (INR)" dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={35} />
              <Bar name="Audience Impression Index" dataKey="Reach" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};
