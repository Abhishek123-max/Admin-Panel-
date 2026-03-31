import { useEffect, useState } from 'react';
import { Building2, MessageSquare, ShoppingBag, Users, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Stats {
  properties: number;
  enquiries: number;
  sellEnquiries: number;
  visitors: number;
  visitorsToday: number;
  topPages: { path: string; count: number }[];
  recentEnquiries: { id: string; name: string; phone: string; message: string; created_at: string }[];
  propertiesByType: { type: string; count: number }[];
}

const STAT_CARDS = [
  { key: 'properties', label: 'Total Properties', Icon: Building2, color: 'bg-blue-50 text-blue-600', path: '/admin/properties' },
  { key: 'enquiries', label: 'Contact Enquiries', Icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600', path: '/admin/enquiries' },
  { key: 'sellEnquiries', label: 'Sell Enquiries', Icon: ShoppingBag, color: 'bg-amber-50 text-amber-600', path: '/admin/sell-enquiries' },
  { key: 'visitors', label: 'Total Visitors', Icon: Users, color: 'bg-rose-50 text-rose-600', path: '/admin/visitors' },
];

const TYPE_LABELS: Record<string, string> = {
  land_sale: 'Land for Sale',
  room_rent: 'Room for Rent',
  land_rent: 'Land for Rent',
  commercial_rent: 'Commercial Rent',
  lease: 'Lease',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    properties: 0,
    enquiries: 0,
    sellEnquiries: 0,
    visitors: 0,
    visitorsToday: 0,
    topPages: [],
    recentEnquiries: [],
    propertiesByType: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [propertiesRes, enquiriesRes, sellRes, visitorsRes, visitorsToday, pagesRes, recentRes, typeRes] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase.from('enquiries').select('id', { count: 'exact', head: true }),
      supabase.from('sell_enquiries').select('id', { count: 'exact', head: true }),
      supabase.from('page_views').select('id', { count: 'exact', head: true }),
      supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('page_views').select('path').limit(500),
      supabase.from('enquiries').select('id, name, phone, message, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('properties').select('type'),
    ]);

    const pageCounts: Record<string, number> = {};
    (pagesRes.data || []).forEach((r: { path: string }) => {
      pageCounts[r.path] = (pageCounts[r.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    const typeCounts: Record<string, number> = {};
    (typeRes.data || []).forEach((r: { type: string }) => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    });
    const propertiesByType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));

    setStats({
      properties: propertiesRes.count || 0,
      enquiries: enquiriesRes.count || 0,
      sellEnquiries: sellRes.count || 0,
      visitors: visitorsRes.count || 0,
      visitorsToday: visitorsToday.count || 0,
      topPages,
      recentEnquiries: (recentRes.data || []) as Stats['recentEnquiries'],
      propertiesByType,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a2240]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map(({ key, label, Icon, color, path }) => (
          <Link to={path} key={key} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#0a2240]">{stats[key as keyof Stats] as number}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0a2240]">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-xs text-[#c9a84c] hover:underline">View all</Link>
          </div>
          {stats.recentEnquiries.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No enquiries yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentEnquiries.map((e) => (
                <div key={e.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-[#c9a84c]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-[#c9a84c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#0a2240]">{e.name} <span className="text-gray-400 font-normal">· {e.phone}</span></p>
                    <p className="text-gray-500 text-xs truncate">{e.message}</p>
                  </div>
                  <p className="text-gray-400 text-xs flex-shrink-0">{new Date(e.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#c9a84c]" />
              <h2 className="font-bold text-[#0a2240] text-sm">Visitors Today</h2>
            </div>
            <p className="text-3xl font-bold text-[#0a2240]">{stats.visitorsToday}</p>
            <p className="text-gray-400 text-xs mt-1">Total: {stats.visitors} page views</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#c9a84c]" />
              <h2 className="font-bold text-[#0a2240] text-sm">Top Pages</h2>
            </div>
            {stats.topPages.length === 0 ? (
              <p className="text-gray-400 text-xs">No data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.topPages.map((p) => (
                  <div key={p.path} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate max-w-[130px]">{p.path}</span>
                    <span className="text-xs font-semibold text-[#0a2240]">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-[#0a2240] mb-4">Properties by Type</h2>
        {stats.propertiesByType.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No properties listed yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.propertiesByType.map(({ type, count }) => (
              <div key={type} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#0a2240]">{count}</p>
                <p className="text-gray-500 text-xs mt-1">{TYPE_LABELS[type] || type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
