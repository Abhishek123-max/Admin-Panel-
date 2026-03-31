import { useEffect, useState } from 'react';
import { MessageSquare, Search, Phone, Mail, Building2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id: string | null;
  created_at: string;
  properties?: { title: string; city: string } | null;
}

export default function AdminEnquiries() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Enquiry | null>(null);

  useEffect(() => {
    supabase
      .from('enquiries')
      .select('*, properties(title, city)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.phone.includes(q);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a2240]">Contact Enquiries</h1>
        <p className="text-gray-500 text-sm mt-0.5">{items.length} total enquiries received</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No enquiries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0a2240]">{e.name}</p>
                      <p className="text-gray-500 text-xs sm:hidden">{e.phone}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-[#c9a84c] text-xs">
                          <Phone className="w-3 h-3" /> {e.phone}
                        </a>
                        <a href={`mailto:${e.email}`} className="flex items-center gap-1 text-gray-600 hover:text-[#c9a84c] text-xs">
                          <Mail className="w-3 h-3" /> {e.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {e.properties ? (
                        <div className="flex items-center gap-1 text-gray-600 text-xs">
                          <Building2 className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{e.properties.title}, {e.properties.city}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">General enquiry</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(e)} className="text-xs text-[#c9a84c] hover:underline font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-[#0a2240]">Enquiry Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 text-lg leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Name</p>
                  <p className="font-semibold text-[#0a2240]">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Date</p>
                  <p className="font-medium text-gray-700">{new Date(selected.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <a href={`tel:${selected.phone}`} className="font-medium text-[#c9a84c] hover:underline">{selected.phone}</a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <a href={`mailto:${selected.email}`} className="font-medium text-[#c9a84c] hover:underline text-sm">{selected.email}</a>
                </div>
              </div>
              {selected.properties && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-0.5">About Property</p>
                  <p className="font-medium text-[#0a2240] text-sm">{selected.properties.title} — {selected.properties.city}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Message</p>
                <p className="text-gray-700 text-sm bg-gray-50 rounded-xl p-4 leading-relaxed">{selected.message || 'No message provided.'}</p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <a href={`tel:${selected.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold">
                <Phone className="w-4 h-4" /> Call
              </a>
              <a href={`mailto:${selected.email}`} className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-white py-2.5 rounded-xl text-sm font-semibold">
                <Mail className="w-4 h-4" /> Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
