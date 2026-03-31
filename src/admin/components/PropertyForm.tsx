import { useState, FormEvent, type ChangeEventHandler } from 'react';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Property, PropertyType, PROPERTY_TYPE_LABELS } from '../../types/property';

interface Props {
  property: Property | null;
  onClose: () => void;
  onSaved: () => void;
}

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Water Supply', 'Electricity', 'Boundary Wall', 'Road Access', 'Garden', 'Security', 'Swimming Pool', 'Gym'];

const EMPTY: Partial<Property> = {
  title: '', description: '', type: 'land_sale', price: 0, price_period: 'total',
  area: 0, area_unit: 'sqft', bedrooms: null, bathrooms: null,
  address: '', city: '', state: 'Goa', country: 'India', zip_code: '',
  featured: false, available: true, whatsapp_number: '', cover_image: '',
  amenities: [], agent_name: '', agent_phone: '', agent_email: '', video_url: '',
};

function FieldInput({
  label,
  name,
  type = 'text',
  required = false,
  className = '',
  step,
  digitsOnly,
  maxDigits,
  value,
  onChange,
}: {
  label: string;
  name: keyof Property;
  type?: string;
  required?: boolean;
  className?: string;
  step?: number;
  digitsOnly?: boolean;
  maxDigits?: number;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor={`field_${String(name)}`}>
        {label}
        {required && ' *'}
      </label>
      <input
        id={`field_${String(name)}`}
        type={type}
        required={required}
        step={type === 'number' ? (step ?? 1) : undefined}
        inputMode={digitsOnly ? 'numeric' : (type === 'number' ? 'numeric' : undefined)}
        pattern={digitsOnly && maxDigits ? `\\d{${maxDigits}}` : digitsOnly ? '\\d*' : undefined}
        maxLength={digitsOnly && maxDigits ? maxDigits : undefined}
        value={(value as string | number | null) ?? ''}
        onKeyDown={e => {
          if (!digitsOnly && type !== 'number') return;
          // Allow navigation/editing keys and shortcuts.
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          const allowed = [
            'Backspace',
            'Tab',
            'Delete',
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
          ];
          if (allowed.includes(e.key)) return;
          if (digitsOnly) {
            if (/^\d$/.test(e.key)) return;
            e.preventDefault();
            return;
          }

          // For numeric inputs, block number special chars like 'e', '+', '-'.
          if (/^\d$/.test(e.key)) return;
          e.preventDefault();
        }}
        onChange={e => {
          if (digitsOnly) {
            const cleaned = e.target.value.replace(/\D/g, '');
            const trimmed = typeof maxDigits === 'number' ? cleaned.slice(0, maxDigits) : cleaned;
            onChange(trimmed);
            return;
          }
          if (type === 'number') {
            const raw = e.target.value;
            if (raw === '') {
              onChange(null);
              return;
            }
            const n = Number(raw);
            if (Number.isNaN(n)) return;
            onChange(n);
            return;
          }
          onChange(e.target.value);
        }}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
      />
    </div>
  );
}

export default function PropertyForm({ property, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Property>>(property ? { ...property } : { ...EMPTY });
  const [images, setImages] = useState<string[]>(
    property?.property_images?.map(i => i.url) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const set = (key: keyof Property, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'property_images';

  const uploadImageFile = async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `properties/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const storage = supabase.storage.from(STORAGE_BUCKET);

    const { data: uploaded, error: err } = await storage.upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

    if (err) throw err;
    const { data: publicUrlData } = storage.getPublicUrl(uploaded.path);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadError('');

    const zip = form.zip_code as string | null | undefined;
    if (zip && String(zip).length !== 6) {
      setLoading(false);
      setError('ZIP Code must be 6 digits.');
      return;
    }

    const agentPhone = form.agent_phone as string | null | undefined;
    if (agentPhone && String(agentPhone).length !== 10) {
      setLoading(false);
      setError('Agent Phone must be 10 digits.');
      return;
    }

    const whatsappNumber = form.whatsapp_number as string | null | undefined;
    if (whatsappNumber && String(whatsappNumber).length !== 10) {
      setLoading(false);
      setError('WhatsApp Number must be 10 digits.');
      return;
    }

    const inputPrice = Number(form.price);
    const normalizedPrice = Number.isFinite(inputPrice) ? Math.round(inputPrice) : 0;

    const payload = {
      title: form.title, description: form.description, type: form.type,
      price: normalizedPrice, price_period: form.price_period,
      area: form.area ? Number(form.area) : null, area_unit: form.area_unit,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      address: form.address, city: form.city, state: form.state,
      country: form.country, zip_code: form.zip_code,
      featured: form.featured, available: form.available,
      whatsapp_number: form.whatsapp_number, cover_image: form.cover_image,
      amenities: form.amenities, agent_name: form.agent_name,
      agent_phone: form.agent_phone, agent_email: form.agent_email,
      video_url: form.video_url, updated_at: new Date().toISOString(),
    };

    let propertyId = property?.id;

    if (property?.id) {
      const { error: err } = await supabase.from('properties').update(payload).eq('id', property.id);
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { data, error: err } = await supabase.from('properties').insert(payload).select('id').single();
      if (err || !data) { setError(err?.message || 'Failed to create'); setLoading(false); return; }
      propertyId = data.id;
    }

    if (propertyId) {
      await supabase.from('property_images').delete().eq('property_id', propertyId);
      if (images.length > 0) {
        await supabase.from('property_images').insert(
          images.map((url, i) => ({ property_id: propertyId, url, sort_order: i }))
        );
      }
    }

    setLoading(false);
    onSaved();
  };

  const handleCoverUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImageFile(file);
      set('cover_image', url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload cover image');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    const inputEl = e.currentTarget;
    const fileList = inputEl.files ? Array.from(inputEl.files) : [];
    if (!fileList.length) return;

    setUploading(true);
    setUploadError('');
    try {
      const urls = await Promise.all(fileList.map(uploadImageFile));
      setImages(i => [...i, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 pt-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#0a2240] text-lg">{property ? 'Edit Property' : 'Add New Property'}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
            {uploadError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{uploadError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Property Title"
                name="title"
                required
                className="sm:col-span-2"
                value={form.title}
                onChange={v => set('title', v)}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                <select
                  required
                  value={form.type}
                  onChange={e => set('type', e.target.value as PropertyType)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                >
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Price Period</label>
                <select
                  value={form.price_period ?? 'total'}
                  onChange={e => set('price_period', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                >
                  <option value="total">Total</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="per_sqft">Per Sqft</option>
                </select>
              </div>
              <FieldInput
                label="Price (₹)"
                name="price"
                type="number"
                required
                step={1}
                value={form.price}
                onChange={v => set('price', v)}
              />
              <FieldInput
                label="Area"
                name="area"
                type="number"
                step={1}
                value={form.area}
                onChange={v => set('area', v)}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Area Unit</label>
                <select
                  value={form.area_unit}
                  onChange={e => set('area_unit', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                >
                  {['sqft', 'sqm', 'acre', 'guntha', 'hectare', 'cents'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <FieldInput
                label="Bedrooms"
                name="bedrooms"
                type="number"
                step={1}
                value={form.bedrooms}
                onChange={v => set('bedrooms', v)}
              />
              <FieldInput
                label="Bathrooms"
                name="bathrooms"
                type="number"
                step={1}
                value={form.bathrooms}
                onChange={v => set('bathrooms', v)}
              />
              <FieldInput
                label="Address"
                name="address"
                required
                className="sm:col-span-2"
                value={form.address}
                onChange={v => set('address', v)}
              />
              <FieldInput
                label="City"
                name="city"
                required
                value={form.city}
                onChange={v => set('city', v)}
              />
              <FieldInput
                label="State"
                name="state"
                required
                value={form.state}
                onChange={v => set('state', v)}
              />
              <FieldInput
                label="ZIP Code"
                name="zip_code"
                digitsOnly
                maxDigits={6}
                value={form.zip_code}
                onChange={v => set('zip_code', v)}
              />
              <FieldInput
                label="WhatsApp Number"
                name="whatsapp_number"
                digitsOnly
                maxDigits={10}
                value={form.whatsapp_number}
                onChange={v => set('whatsapp_number', v)}
              />
              <div className="sm:col-span-2">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {(form.cover_image as string | null) ? (
                      <img src={form.cover_image as string} alt="Cover" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cover Image Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploading}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>
              <FieldInput
                label="Video URL"
                name="video_url"
                className="sm:col-span-2"
                value={form.video_url}
                onChange={v => set('video_url', v)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map(a => {
                  const active = (form.amenities || []).includes(a);
                  return (
                    <button
                      type="button"
                      key={a}
                      onClick={() => set('amenities', active
                        ? (form.amenities || []).filter(x => x !== a)
                        : [...(form.amenities || []), a]
                      )}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active ? 'bg-[#c9a84c] text-white border-[#c9a84c]' : 'border-gray-200 text-gray-600 hover:border-[#c9a84c]'}`}
                    >{a}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Gallery Images</label>
              <div className="space-y-2 mb-3">
                {images.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <img
                      src={url}
                      alt=""
                      className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-gray-600 flex-1 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={uploading}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <FieldInput
                label="Agent Name"
                name="agent_name"
                value={form.agent_name}
                onChange={v => set('agent_name', v)}
              />
              <FieldInput
                label="Agent Phone"
                name="agent_phone"
                digitsOnly
                maxDigits={10}
                value={form.agent_phone}
                onChange={v => set('agent_phone', v)}
              />
              <FieldInput
                label="Agent Email"
                name="agent_email"
                value={form.agent_email}
                onChange={v => set('agent_email', v)}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.available ?? true} onChange={e => set('available', e.target.checked)} className="w-4 h-4 accent-[#c9a84c]" />
                <span className="text-sm text-gray-700">Available / Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured ?? false} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-[#c9a84c]" />
                <span className="text-sm text-gray-700">Featured on Homepage</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#c9a84c] hover:bg-[#b8963e] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (property ? 'Save Changes' : 'Add Property')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
