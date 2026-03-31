import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Advantage {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  color_class: string;
  icon_color_class: string;
  active: boolean;
  sort_order: number;
}

const ICON_OPTIONS = ['Shield', 'Clock', 'Award', 'Leaf', 'Star', 'Zap', 'Heart', 'Check', 'TrendingUp', 'MapPin', 'Users', 'Home'];
const COLOR_OPTIONS = [
  { label: 'Emerald', bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  { label: 'Blue', bg: 'bg-blue-50', icon: 'text-blue-600' },
  { label: 'Amber', bg: 'bg-amber-50', icon: 'text-amber-600' },
  { label: 'Teal', bg: 'bg-teal-50', icon: 'text-teal-600' },
  { label: 'Rose', bg: 'bg-rose-50', icon: 'text-rose-600' },
  { label: 'Sky', bg: 'bg-sky-50', icon: 'text-sky-600' },
];

const EMPTY: Partial<Advantage> = { icon_name: 'Shield', title: '', description: '', color_class: 'bg-emerald-50', icon_color_class: 'text-emerald-600', active: true, sort_order: 0 };

export default function AdminAdvantages() {
  const [items, setItems] = useState<Advantage[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Advantage> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('advantages').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('advantages').update({ active: !current }).eq('id', id);
    setItems(b => b.map(x => x.id === id ? { ...x, active: !current } : x));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    if (form.id) {
      await supabase.from('advantages').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id);
    } else {
      await supabase.from('advantages').insert(form);
    }
    setSaving(false);
    setForm(null);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('advantages').delete().eq('id', deleteId);
    setItems(b => b.filter(x => x.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2240]">Advantages</h1>
          <p className="text-gray-500 text-sm mt-0.5">Why Choose Us section items</p>
        </div>
        <button onClick={() => setForm({ ...EMPTY })} className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Advantage
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(a => (
            <div key={a.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${a.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${a.color_class} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-lg font-bold ${a.icon_color_class}`}>{a.icon_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0a2240] text-sm">{a.title}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{a.description}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(a.id, a.active)} className={`p-1.5 rounded-lg ${a.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    {a.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => setForm({ ...a })} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="sm:col-span-2 bg-white rounded-2xl p-12 text-center text-gray-400">No advantages yet.</div>}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-[#0a2240]">{form.id ? 'Edit Advantage' : 'Add Advantage'}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Icon Name</label>
                <select value={form.icon_name || 'Shield'} onChange={e => setForm(f => ({ ...f!, icon_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]">
                  {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.label} type="button"
                      onClick={() => setForm(f => ({ ...f!, color_class: c.bg, icon_color_class: c.icon }))}
                      className={`px-3 py-1.5 rounded-lg text-xs border-2 transition-all ${form.color_class === c.bg ? 'border-[#c9a84c]' : 'border-transparent'} ${c.bg} ${c.icon}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title || ''} onChange={e => setForm(f => ({ ...f!, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                <textarea rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f!, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(f => ({ ...f!, active: e.target.checked }))} className="w-4 h-4 accent-[#c9a84c]" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Sort Order:</label>
                  <input type="number" value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f!, sort_order: Number(e.target.value) }))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setForm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#c9a84c] hover:bg-[#b8963e] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-[#0a2240] mb-2">Delete Advantage?</h3>
            <p className="text-gray-500 text-sm mb-5">This will remove the item from the Why Choose Us section.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
