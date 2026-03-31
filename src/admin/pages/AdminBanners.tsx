import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Banner {
  id: string;
  image_url: string;
  label: string;
  subtitle: string;
  sort_order: number;
  active: boolean;
}

const EMPTY: Partial<Banner> = { image_url: '', label: '', subtitle: '', sort_order: 0, active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const STORAGE_BUCKET =
    (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined) ?? 'property-images';

  async function uploadImageToStorage(file: File, pathPrefix: string): Promise<string> {
    const objectPath = `${pathPrefix}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, file, { upsert: false, contentType: file.type });

    if (uploadErr) throw uploadErr;

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
    return data.publicUrl;
  }

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from('hero_banners').select('*').order('sort_order');
    setBanners(data || []);
    setLoading(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('hero_banners').update({ active: !current }).eq('id', id);
    setBanners(b => b.map(x => x.id === id ? { ...x, active: !current } : x));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    if (form.id) {
      await supabase.from('hero_banners').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id);
    } else {
      await supabase.from('hero_banners').insert({ ...form });
    }
    setSaving(false);
    setForm(null);
    fetchBanners();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('hero_banners').delete().eq('id', deleteId);
    setBanners(b => b.filter(x => x.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2240]">Hero Banners</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage the homepage slideshow banners</p>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY })}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8963e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <img
                  src={b.image_url}
                  alt={b.label}
                  className="w-20 h-14 object-cover rounded-xl flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0a2240] text-sm">{b.label}</p>
                  <p className="text-gray-500 text-xs truncate">{b.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(b.id, b.active)}
                    className={`p-1.5 rounded-lg transition-colors ${b.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setForm({ ...b })} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(b.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && <div className="bg-white rounded-2xl p-12 text-center text-gray-400">No banners yet. Add your first banner.</div>}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-[#0a2240]">{form.id ? 'Edit Banner' : 'Add Banner'}</h2>
              <button onClick={() => setForm(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      setUploadError(null);
                      setUploadingImage(true);
                      const url = await uploadImageToStorage(file, 'hero-banners');
                      setForm(f => ({ ...f!, image_url: url }));
                    } catch (err) {
                      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
                    } finally {
                      setUploadingImage(false);
                      // allow selecting the same file again
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                />
                {uploadingImage && (
                  <p className="mt-2 text-xs text-gray-500">Uploading image...</p>
                )}
                {uploadError && (
                  <p className="mt-2 text-xs text-red-600">{uploadError}</p>
                )}
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="w-full h-32 object-cover rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Label *</label>
                <input type="text" value={form.label || ''} onChange={e => setForm(f => ({ ...f!, label: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" placeholder="e.g. Coastal Properties" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea rows={2} value={form.subtitle || ''} onChange={e => setForm(f => ({ ...f!, subtitle: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none" placeholder="Short description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f!, sort_order: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(f => ({ ...f!, active: e.target.checked }))} className="w-4 h-4 accent-[#c9a84c]" />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
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
            <h3 className="font-bold text-[#0a2240] mb-2">Delete Banner?</h3>
            <p className="text-gray-500 text-sm mb-5">This will remove the banner from the homepage slideshow.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
