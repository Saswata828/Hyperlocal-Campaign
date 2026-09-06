import * as React from 'react';
import { 
  TrendingUp, 
  Users, 
  Percent, 
  Share2,
  RefreshCw,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../../services/api';

export const AnalyticsReports: React.FC = () => {
  const [realtimeData, setRealtimeData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);
  const [platformFilter, setPlatformFilter] = React.useState<'all' | 'facebook' | 'instagram'>('all');
  const [lastSyncedTime, setLastSyncedTime] = React.useState<string>("");

  const loadRealtimeAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiService.getRealtimeAnalytics();
      if (res && res.summary) {
        setRealtimeData(res);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.error("Failed to load real-time analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLive = async () => {
    setIsSyncing(true);
    try {
      await apiService.syncLiveAnalytics();
      await loadRealtimeAnalytics();
    } catch (e) {
      console.error("Failed to sync live telemetry:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    loadRealtimeAnalytics();
  }, []);

  const summary = realtimeData?.summary || {
    totalPublished: 0,
    activeCampaigns: 0,
    totalReach: 0,
    totalImpressions: 0,
    totalEngagement: 0,
    totalLikes: 0,
    totalComments: 0,
    totalClicks: 0,
    conversionRate: 0,
    engagementRate: 0
  };

  // Filtered recent published posts
  const allPosts = realtimeData?.recentPosts || [];
  const filteredPosts = allPosts.filter((post: any) => {
    if (platformFilter === 'all') return true;
    return post.platform?.toLowerCase() === platformFilter;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in" id="analytics-reports-tab-view">
      
      {/* Header operations */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <span>SaaS Hyperlocal Intel Suite</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Live interactive telemetry aggregated across published social posts, reactions, comments, and conversion indices
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncLive}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Refreshing Meta...' : '🔄 Sync Live Data'}</span>
          </button>
          {lastSyncedTime && (
            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg">
              Live: {lastSyncedTime}
            </span>
          )}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Verified Reach</span>
            <span className="h-7 w-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {summary.totalReach >= 1000 ? `${(summary.totalReach / 1000).toFixed(1)}k` : summary.totalReach}
            </h3>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-2">
              <TrendingUp className="h-3 w-3 shrink-0" /> Verified Across Channels
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Engagements</span>
            <span className="h-7 w-7 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center font-bold">
              <ThumbsUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {summary.totalEngagement.toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-2">
              <span>{summary.totalLikes} likes</span> &bull; <span>{summary.totalComments} comments</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Clicks & Leads</span>
            <span className="h-7 w-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
              <Percent className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {summary.totalClicks.toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-2">
              Conv. Rate: {summary.conversionRate}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Engagement Rate</span>
            <span className="h-7 w-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {summary.engagementRate}%
            </h3>
            <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5 mt-2">
              {summary.totalPublished} Posts Active
            </span>
          </div>
        </div>
      </div>

      {/* Verified Live Published Posts & Interactions */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Share2 className="h-4 w-4 text-indigo-600" />
              <span>Published Posts & Live Telemetry Interactions</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold">Individual post reactions, likes, and comments polled from Meta Graph API</p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${platformFilter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              All
            </button>
            <button
              onClick={() => setPlatformFilter('facebook')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${platformFilter === 'facebook' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              Facebook
            </button>
            <button
              onClick={() => setPlatformFilter('instagram')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${platformFilter === 'instagram' ? 'bg-pink-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              Instagram
            </button>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="space-y-3">
            {filteredPosts.map((post: any, idx: number) => {
              const live = post.liveMetrics || {};
              const isFb = post.platform === 'facebook';
              const targetUrl = post.postUrl || live.permalink || (isFb ? 'https://facebook.com' : 'https://instagram.com');

              return (
                <div key={post.id || idx} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isFb ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {post.platform}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {post.publishDate} {post.publishTime}
                      </span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Published
                      </span>
                    </div>

                    <h5 className="text-xs font-black text-slate-800 truncate">
                      {post.headline || post.caption?.slice(0, 75) || 'Social Broadcast Post'}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {post.caption || 'No caption provided.'}
                    </p>
                  </div>

                  {/* Telemetry Numbers */}
                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200/60 pt-2 md:pt-0 md:pl-4 shrink-0">
                    <div className="text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Likes</span>
                      <div className="flex items-center justify-center gap-1 text-xs font-black text-slate-800">
                        <ThumbsUp className="h-3 w-3 text-pink-500" />
                        <span>{live.likes ?? 0}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Comments</span>
                      <div className="flex items-center justify-center gap-1 text-xs font-black text-slate-800">
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                        <span>{live.comments ?? 0}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Reach</span>
                      <div className="flex items-center justify-center gap-1 text-xs font-black text-slate-800">
                        <Users className="h-3 w-3 text-indigo-500" />
                        <span>{live.reach ?? 0}</span>
                      </div>
                    </div>

                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
            <Share2 className="h-6 w-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No Posts Published Under This Filter</p>
            <p className="text-[11px] text-slate-400 font-medium">
              Publish campaigns to Facebook or Instagram via the AI Generator to see real-time interaction metrics!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
