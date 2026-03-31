import { useEffect, useState, type ChangeEventHandler } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar_url: string;
  active: boolean;
  sort_order: number;
}

const EMPTY: Partial<Testimonial> = { name: '', location: '', rating: 5, text: '', avatar_url: '', active: true, sort_order: 0 };

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Testimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('testimonials').update({ active: !current }).eq('id', id);
    setItems(b => b.map(x => x.id === id ? { ...x, active: !current } : x));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    if (form.id) {
      await supabase.from('testimonials').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id);
    } else {
      await supabase.from('testimonials').insert(form);
    }
    setSaving(false);
    setForm(null);
    fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('testimonials').delete().eq('id', deleteId);
    setItems(b => b.filter(x => x.id !== deleteId));
    setDeleteId(null);
  };

  const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'property_images';

  const uploadImageFile = async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `testimonials/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const storage = supabase.storage.from(STORAGE_BUCKET);

    const { data: uploaded, error: err } = await storage.upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    if (err) throw err;

    const { data: publicUrlData } = storage.getPublicUrl(uploaded.path);
    return publicUrlData.publicUrl;
  };

  const handleAvatarUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImageFile(file);
      setForm(f => ({ ...f!, avatar_url: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2240]">Testimonials</h1>
          <p className="text-gray-500 text-sm mt-0.5">What your clients say</p>
        </div>
        <button onClick={() => setForm({ ...EMPTY })} className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(t => (
            <div key={t.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${t.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start gap-3 mb-3">
                <img src={t.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80'} alt={t.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0a2240] text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= t.rating ? 'fill-[#c9a84c] text-[#c9a84c]' : 'text-gray-200'}`} />)}
                </div>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-3">"{t.text}"</p>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => toggleActive(t.id, t.active)} className={`p-1.5 rounded-lg ${t.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {t.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setForm({ ...t })} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="md:col-span-2 bg-white rounded-2xl p-12 text-center text-gray-400">No testimonials yet.</div>}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-[#0a2240]">{form.id ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {uploadError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f!, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={form.location || ''} onChange={e => setForm(f => ({ ...f!, location: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f!, rating: s }))}>
                      <Star className={`w-6 h-6 transition-colors ${s <= (form.rating || 5) ? 'fill-[#c9a84c] text-[#c9a84c]' : 'text-gray-200 hover:text-[#c9a84c]'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Review Text *</label>
                <textarea rows={4} value={form.text || ''} onChange={e => setForm(f => ({ ...f!, text: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none" placeholder="Client's review..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Avatar Image Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleAvatarUpload}
                  className="w-full text-sm"
                />
                {(form.avatar_url || '').toString() ? (
                  <img
                    src={form.avatar_url as string}
                    alt="avatar preview"
                    className="mt-3 h-24 w-24 rounded-full object-cover border border-gray-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(f => ({ ...f!, active: e.target.checked }))} className="w-4 h-4 accent-[#c9a84c]" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Sort Order:</label>
                  <input type="number" value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f!, sort_order: Number(e.target.value) }))}
                    className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a84c]" />
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
            <h3 className="font-bold text-[#0a2240] mb-2">Delete Testimonial?</h3>
            <p className="text-gray-500 text-sm mb-5">This will remove the testimonial from the website.</p>
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
