import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Property, PropertyType, PROPERTY_TYPE_LABELS } from '../../types/property';
import PropertyForm from '../components/PropertyForm';

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('properties')
      .select('*, property_images(url, sort_order)')
      .order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  };

  const toggleAvailable = async (id: string, current: boolean) => {
    await supabase.from('properties').update({ available: !current }).eq('id', id);
    setProperties(p => p.map(x => (x.id === id ? { ...x, available: !current } : x)));
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('properties').update({ featured: !current }).eq('id', id);
    setProperties(p => p.map(x => (x.id === id ? { ...x, featured: !current } : x)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('properties').delete().eq('id', deleteId);
    setProperties(p => p.filter(x => x.id !== deleteId));
    setDeleteId(null);
  };

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
    const matchType = !typeFilter || p.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2240]">Properties</h1>
          <p className="text-gray-500 text-sm mt-0.5">{properties.length} total listings</p>
        </div>
        <button
          onClick={() => {
            setEditProperty(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as PropertyType | '')}
          className="sm:w-48 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
        >
          <option value="">All Types</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400">No properties found</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    City
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const img =
                    p.property_images?.find((i: { sort_order: number }) => i.sort_order === 0)?.url || p.cover_image;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                          )}
                          <p className="font-medium text-[#0a2240] line-clamp-1">{p.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg font-medium">
                          {PROPERTY_TYPE_LABELS[p.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.city}</td>
                      <td className="px-4 py-3 font-semibold text-[#0a2240] hidden lg:table-cell">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAvailable(p.id, p.available)}
                            title={p.available ? 'Hide listing' : 'Show listing'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.available
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {p.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => toggleFeatured(p.id, p.featured)}
                            title={p.featured ? 'Remove from featured' : 'Add to featured'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.featured
                                ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditProperty(p);
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <PropertyForm
          property={editProperty}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchProperties();
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-[#0a2240] text-lg mb-2">Delete Property?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This action cannot be undone. All images and data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
