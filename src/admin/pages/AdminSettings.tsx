import { useEffect, useState } from 'react';
import {
  Save, Globe, Phone, Mail, MapPin, Clock, Image,
  Facebook, Twitter, Instagram, Youtube, Linkedin,
  MessageSquare, Search, FileText, Shield,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Setting { key: string; value: string; }

type FieldType = 'text' | 'url' | 'email' | 'textarea' | 'richtext';

interface Field {
  key: string;
  label: string;
  type: FieldType;
  placeholder: string;
  hint?: string;
}

interface Group {
  title: string;
  icon: React.ElementType;
  fields: Field[];
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.028-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.689-2.051 1.6-1.72 1.894-4.166 1.894-5.768l-5.586-.002c-.005 0-.005-1.999 0-2H22l.003 2.002c.005 2.454-.494 5.542-2.587 7.793C17.724 23.231 15.354 24 12.187 24z"/>
    </svg>
  );
}

const GROUPS: Group[] = [
  {
    title: 'Brand & Logo',
    icon: Image,
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'WesternProperties' },
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Your trusted real estate partner' },
      { key: 'logo_url', label: 'Logo Image URL', type: 'url', placeholder: 'https://your-logo-url.com/logo.png' },
    ],
  },
  {
    title: 'Contact Information',
    icon: Phone,
    fields: [
      { key: 'phone', label: 'Phone Number (Display)', type: 'text', placeholder: '+91 98765 43210' },
      { key: 'phone_raw', label: 'Phone Raw (digits only, for links)', type: 'text', placeholder: '919876543210' },
      { key: 'email', label: 'Email Address', type: 'email', placeholder: 'info@westernproperties.in' },
      { key: 'whatsapp_text', label: 'WhatsApp Default Message', type: 'text', placeholder: 'Hello! I have a property enquiry.' },
    ],
  },
  {
    title: 'Address & Hours',
    icon: MapPin,
    fields: [
      { key: 'address', label: 'Full Address', type: 'textarea', placeholder: '123 Western Avenue, Goa - 403001' },
      { key: 'business_hours', label: 'Business Hours', type: 'textarea', placeholder: 'Mon – Sat: 9AM – 7PM\nSunday: 10AM – 5PM' },
    ],
  },
  {
    title: 'Social Media Links',
    icon: Globe,
    fields: [
      { key: 'facebook_url', label: 'Facebook Page URL', type: 'url', placeholder: 'https://facebook.com/yourpage' },
      { key: 'instagram_url', label: 'Instagram Profile URL', type: 'url', placeholder: 'https://instagram.com/yourhandle' },
      { key: 'twitter_url', label: 'Twitter / X URL', type: 'url', placeholder: 'https://twitter.com/yourhandle' },
      { key: 'linkedin_url', label: 'LinkedIn Page URL', type: 'url', placeholder: 'https://linkedin.com/company/yourpage' },
      { key: 'youtube_url', label: 'YouTube Channel URL', type: 'url', placeholder: 'https://youtube.com/@yourchannel' },
      { key: 'whatsapp_url', label: 'WhatsApp Business Link', type: 'url', placeholder: 'https://wa.me/919876543210', hint: 'Format: https://wa.me/CountryCodeNumber — e.g. https://wa.me/919876543210' },
      { key: 'pinterest_url', label: 'Pinterest Profile URL', type: 'url', placeholder: 'https://pinterest.com/yourprofile' },
      { key: 'threads_url', label: 'Threads Profile URL', type: 'url', placeholder: 'https://www.threads.net/@yourhandle' },
    ],
  },
  {
    title: 'SEO Settings',
    icon: Search,
    fields: [
      { key: 'seo_title', label: 'Default SEO Title', type: 'text', placeholder: 'WesternProperties — Buy, Rent & Lease Properties in Goa', hint: 'Shown in Google search results and browser tab. Ideal length: 50–60 characters.' },
      { key: 'seo_description', label: 'Default Meta Description', type: 'textarea', placeholder: 'Find verified land for sale, rooms for rent, and commercial properties across Goa.', hint: 'Shown in Google search snippets. Ideal length: 120–160 characters.' },
      { key: 'seo_og_image', label: 'Default Social Share Image URL', type: 'url', placeholder: 'https://...image.jpg', hint: 'This image appears when sharing the homepage on Facebook, WhatsApp, Instagram, etc. Recommended size: 1200×630 pixels.' },
    ],
  },
  {
    title: 'Privacy Policy',
    icon: Shield,
    fields: [
      {
        key: 'privacy_policy_content',
        label: 'Privacy Policy Content (HTML supported)',
        type: 'richtext',
        placeholder: '<h2>1. Introduction</h2>\n<p>Your privacy policy text here...</p>',
        hint: 'Paste or type your Privacy Policy here. HTML tags like <h2>, <p>, <ul>, <li>, <strong>, <a> are supported. If left blank, the built-in default policy is shown.',
      },
    ],
  },
  {
    title: 'Terms & Conditions',
    icon: FileText,
    fields: [
      {
        key: 'terms_content',
        label: 'Terms & Conditions Content (HTML supported)',
        type: 'richtext',
        placeholder: '<h2>1. Acceptance of Terms</h2>\n<p>Your terms text here...</p>',
        hint: 'Paste or type your Terms & Conditions here. HTML tags like <h2>, <p>, <ul>, <li>, <strong>, <a> are supported. If left blank, the built-in default terms are shown.',
      },
    ],
  },
];

const FIELD_ICONS: Record<string, React.ElementType> = {
  facebook_url: Facebook,
  twitter_url: Twitter,
  instagram_url: Instagram,
  youtube_url: Youtube,
  linkedin_url: Linkedin,
  whatsapp_url: MessageSquare,
  pinterest_url: PinterestIcon,
  threads_url: ThreadsIcon,
  phone: Phone,
  phone_raw: Phone,
  email: Mail,
  address: MapPin,
  business_hours: Clock,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [ogUploading, setOgUploading] = useState(false);
  const [ogUploadError, setOgUploadError] = useState<string | null>(null);

  const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'property_images';

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('key, value');
    const map: Record<string, string> = {};
    (data || []).forEach((s: Setting) => { map[s.key] = s.value; });
    setSettings(map);
    setLoading(false);
  };

  const uploadLogoImageFile = async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `site/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const storage = supabase.storage.from(STORAGE_BUCKET);

    const { data: uploaded, error: err } = await storage.upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    if (err) throw err;

    const { data: publicUrlData } = storage.getPublicUrl(uploaded.path);
    return publicUrlData.publicUrl;
  };

  const handleLogoUpload: React.ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoUploadError(null);
    try {
      const url = await uploadLogoImageFile(file);
      setSettings(s => ({ ...s, logo_url: url }));
    } catch (err) {
      setLogoUploadError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const uploadOgImageFile = async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `site/og/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const storage = supabase.storage.from(STORAGE_BUCKET);

    const { data: uploaded, error: err } = await storage.upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    if (err) throw err;

    const { data: publicUrlData } = storage.getPublicUrl(uploaded.path);
    return publicUrlData.publicUrl;
  };

  const handleOgUpload: React.ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOgUploading(true);
    setOgUploadError(null);
    try {
      const url = await uploadOgImageFile(file);
      setSettings(s => ({ ...s, seo_og_image: url }));
    } catch (err) {
      setOgUploadError(err instanceof Error ? err.message : 'Failed to upload social share image');
    } finally {
      setOgUploading(false);
    }
  };

  const handleSaveGroup = async (groupTitle: string, keys: string[]) => {
    setSaving(groupTitle);
    for (const key of keys) {
      await supabase.from('site_settings').upsert(
        { key, value: settings[key] || '' },
        { onConflict: 'key' }
      );
    }
    setSaving(null);
    setSaved(groupTitle);
    setTimeout(() => setSaved(null), 2500);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a2240]">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage website content, contact info, social links, SEO, and legal pages</p>
      </div>

      <div className="space-y-6">
        {GROUPS.map(({ title, icon: GroupIcon, fields }) => {
          const keys = fields.map(f => f.key);
          const isSaving = saving === title;
          const isSaved = saved === title;

          return (
            <div key={title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="w-8 h-8 bg-[#c9a84c]/10 rounded-lg flex items-center justify-center">
                  <GroupIcon className="w-4 h-4 text-[#c9a84c]" />
                </div>
                <h2 className="font-semibold text-[#0a2240] text-sm">{title}</h2>
              </div>

              <div className="p-6 space-y-5">
                {fields.map(({ key, label, type, placeholder, hint }) => {
                  const Icon = FIELD_ICONS[key];
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                      {key === 'logo_url' ? (
                        <div>
                          {logoUploadError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-3">
                              {logoUploadError}
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={logoUploading}
                            onChange={handleLogoUpload}
                            className="w-full text-sm"
                          />
                          {(settings[key] || '').trim() ? (
                            <img
                              src={settings[key]}
                              alt="Logo preview"
                              className="mt-3 h-16 w-auto object-contain border border-gray-200 rounded-lg bg-white px-2 py-1"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : null}
                        </div>
                      ) : key === 'seo_og_image' ? (
                        <div>
                          {ogUploadError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-3">
                              {ogUploadError}
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={ogUploading}
                            onChange={handleOgUpload}
                            className="w-full text-sm"
                          />
                          {(settings[key] || '').trim() ? (
                            <img
                              src={settings[key]}
                              alt="Social share preview"
                              className="mt-3 h-32 w-full object-cover border border-gray-200 rounded-xl bg-white"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : null}
                        </div>
                      ) : type === 'richtext' ? (
                        <textarea
                          rows={14}
                          value={settings[key] || ''}
                          onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-y font-mono leading-relaxed"
                          spellCheck={false}
                        />
                      ) : type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={settings[key] || ''}
                          onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none"
                        />
                      ) : (
                        <div className="relative">
                          {Icon && (
                            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          )}
                          <input
                            type={type}
                            value={settings[key] || ''}
                            onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className={`w-full border border-gray-200 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
                          />
                        </div>
                      )}
                      {hint && (
                        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{hint}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="px-6 pb-5 flex justify-end">
                <button
                  onClick={() => handleSaveGroup(title, keys)}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isSaved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#c9a84c] hover:bg-[#b8963e] text-white'
                  } disabled:opacity-60`}
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isSaved ? (
                    'Saved!'
                  ) : (
                    <><Save className="w-4 h-4" /> Save {title}</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
