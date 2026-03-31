import { useEffect, useState } from 'react';
import { Users, Monitor, Globe, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PageView {
  id: string;
  path: string;
  referrer: string;
  user_agent: string;
  country: string;
  session_id: string;
  created_at: string;
}

interface DayStat { date: string; count: number; }
interface PathStat { path: string; count: number; }

export default function AdminVisitors() {
  const [views, setViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [topPaths, setTopPaths] = useState<PathStat[]>([]);
  const [dailyStats, setDailyStats] = useState<DayStat[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [allRes, todayRes, weekRes, recentRes] = await Promise.all([
      supabase.from('page_views').select('id', { count: 'exact', head: true }),
      supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayStr),
      supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
      supabase.from('page_views').select('*').order('created_at', { ascending: false }).limit(200),
    ]);

    setTotal(allRes.count || 0);
    setToday(todayRes.count || 0);
    setWeek(weekRes.count || 0);

    const data: PageView[] = recentRes.data || [];
    setViews(data);

    const pathCounts: Record<string, number> = {};
    data.forEach(v => { pathCounts[v.path] = (pathCounts[v.path] || 0) + 1; });
    setTopPaths(
      Object.entries(pathCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }))
    );

    const dayCounts: Record<string, number> = {};
    data.forEach(v => {
      const d = v.created_at.split('T')[0];
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    const sorted = Object.entries(dayCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, count]) => ({ date, count }));
    setDailyStats(sorted);

    setLoading(false);
  };

  const maxDaily = Math.max(...dailyStats.map(d => d.count), 1);

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a2240]">Visitor Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track who is visiting your website</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Page Views', value: total, Icon: Globe, color: 'bg-blue-50 text-blue-600' },
          { label: 'Views Today', value: today, Icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Views This Week', value: week, Icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#0a2240]">{value.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-[#0a2240] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#c9a84c]" /> Daily Views (Last 7 Days)
          </h2>
          {dailyStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {dailyStats.map(({ date, count }) => (
                <div key={date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                    {new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#c9a84c] rounded-full transition-all"
                      style={{ width: `${(count / maxDaily) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#0a2240] w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-[#0a2240] mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-[#c9a84c]" /> Top Pages
          </h2>
          {topPaths.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {topPaths.map(({ path, count }, i) => (
                <div key={path} className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 font-medium flex-shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{path}</span>
                  <span className="text-xs font-semibold text-[#0a2240] bg-gray-50 px-2 py-0.5 rounded-lg">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#c9a84c]" />
          <h2 className="font-bold text-[#0a2240] text-sm">Recent Page Views (Last 200)</h2>
        </div>
        {views.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No page views recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Page</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Referrer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Browser</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {views.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-[#0a2240] text-xs">{v.path}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs hidden md:table-cell truncate max-w-[150px]">
                      {v.referrer || 'Direct'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs hidden lg:table-cell truncate max-w-[200px]">
                      {v.user_agent ? v.user_agent.split(' ')[0] : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(v.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
