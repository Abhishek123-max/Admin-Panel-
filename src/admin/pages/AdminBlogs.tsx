import { useEffect, useState, useRef, type ChangeEventHandler } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Save, X, Eye, EyeOff, Star, StarOff, Image, Youtube, Tag, User, Clock, FileText, Search, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Quote, Type, Palette, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Blog } from '../../hooks/useBlogs';

const CATEGORIES = [
  { value: 'investment', label: 'Investment' },
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'rental', label: 'Rentals' },
  { value: 'finance', label: 'Finance & Loans' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'selling', label: 'Selling' },
  { value: 'general', label: 'General' },
];

const FONT_FAMILIES = [
  'Default', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Courier New',
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

const COLORS = [
  '#000000', '#1a1a1a', '#333333', '#555555', '#777777', '#999999',
  '#0a2240', '#1e4080', '#2563eb', '#0ea5e9', '#06b6d4',
  '#c9a84c', '#d97706', '#ea580c', '#dc2626',
  '#16a34a', '#059669', '#0d9488',
  '#7c3aed', '#9333ea', '#db2777',
];

type TabKey = 'content' | 'meta' | 'images' | 'seo';

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  images: string[];
  youtube_url: string;
  tags: string[];
  category: string;
  author: string;
  author_avatar: string;
  read_time: number;
  published: boolean;
  featured: boolean;
  seo_title: string;
  seo_description: string;
}

const EMPTY_FORM: FormData = {
  title: '', slug: '', excerpt: '', content: '',
  cover_image: '', images: [], youtube_url: '',
  tags: [], category: 'general', author: 'Western Properties',
  author_avatar: '', read_time: 5,
  published: true, featured: false,
  seo_title: '', seo_description: '',
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    syncContent();
  };

  const syncContent = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertHeading = (level: number) => {
    exec('formatBlock', `h${level}`);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center">
        <button type="button" title="Bold" onClick={() => exec('bold')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" title="Italic" onClick={() => exec('italic')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" title="Underline" onClick={() => exec('underline')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-gray-900">
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button type="button" title="Heading 1" onClick={() => insertHeading(1)} className="px-2 py-1 rounded text-xs font-bold hover:bg-white hover:shadow-sm transition-all text-gray-600">H1</button>
        <button type="button" title="Heading 2" onClick={() => insertHeading(2)} className="px-2 py-1 rounded text-xs font-bold hover:bg-white hover:shadow-sm transition-all text-gray-600">H2</button>
        <button type="button" title="Heading 3" onClick={() => insertHeading(3)} className="px-2 py-1 rounded text-xs font-bold hover:bg-white hover:shadow-sm transition-all text-gray-600">H3</button>
        <button type="button" title="Paragraph" onClick={() => exec('formatBlock', 'p')} className="px-2 py-1 rounded text-xs hover:bg-white hover:shadow-sm transition-all text-gray-600">P</button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button type="button" title="Bullet List" onClick={() => exec('insertUnorderedList')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600">
          <List className="w-4 h-4" />
        </button>
        <button type="button" title="Numbered List" onClick={() => exec('insertOrderedList')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button type="button" title="Blockquote" onClick={() => exec('formatBlock', 'blockquote')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600">
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button type="button" title="Align Left" onClick={() => exec('justifyLeft')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button type="button" title="Align Center" onClick={() => exec('justifyCenter')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button type="button" title="Align Right" onClick={() => exec('justifyRight')} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600">
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button type="button" title="Insert Link" onClick={insertLink} className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600">
          <Link2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <div className="relative">
          <button
            type="button"
            title="Font Family"
            onClick={() => { setShowFontFamily(p => !p); setShowFontSize(false); setShowColorPicker(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white hover:shadow-sm transition-all text-gray-600"
          >
            <Type className="w-3.5 h-3.5" />
            Font
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontFamily && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px]">
              {FONT_FAMILIES.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { exec('fontName', f === 'Default' ? 'inherit' : f); setShowFontFamily(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: f === 'Default' ? 'inherit' : f }}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            title="Font Size"
            onClick={() => { setShowFontSize(p => !p); setShowFontFamily(false); setShowColorPicker(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white hover:shadow-sm transition-all text-gray-600"
          >
            Size
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[100px]">
              {FONT_SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { exec('fontSize', '7'); if (editorRef.current) { const spans = editorRef.current.querySelectorAll('font[size="7"]'); spans.forEach(el => { (el as HTMLElement).removeAttribute('size'); (el as HTMLElement).style.fontSize = s; }); } syncContent(); setShowFontSize(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                  style={{ fontSize: s }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            title="Text Color"
            onClick={() => { setShowColorPicker(p => !p); setShowFontFamily(false); setShowFontSize(false); }}
            className="flex items-center gap-1 p-1.5 rounded hover:bg-white hover:shadow-sm transition-all text-gray-600"
          >
            <Palette className="w-4 h-4" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 w-48">
              <p className="text-xs text-gray-500 mb-2">Text Color</p>
              <div className="grid grid-cols-6 gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { exec('foreColor', c); setShowColorPicker(false); }}
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="mt-2 border-t border-gray-100 pt-2">
                <p className="text-xs text-gray-500 mb-1">Background</p>
                <div className="grid grid-cols-6 gap-1">
                  {COLORS.map(c => (
                    <button
                      key={`bg-${c}`}
                      type="button"
                      onClick={() => { exec('hiliteColor', c); setShowColorPicker(false); }}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={`Background: ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncContent}
        onBlur={syncContent}
        onClick={() => { setShowColorPicker(false); setShowFontFamily(false); setShowFontSize(false); }}
        className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 text-sm text-gray-800 focus:outline-none prose prose-sm max-w-none"
        style={{
          lineHeight: '1.75',
        }}
      />
    </div>
  );
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('content');
  const [newTag, setNewTag] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [uploadingAuthorAvatar, setUploadingAuthorAvatar] = useState(false);
  const [authorAvatarUploadError, setAuthorAvatarUploadError] = useState<string | null>(null);

  const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'property_images';

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    setBlogs(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCreating(true);
    setEditing(null);
    setActiveTab('content');
  };

  const openEdit = (blog: Blog) => {
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      cover_image: blog.cover_image,
      images: Array.isArray(blog.images) ? blog.images : [],
      youtube_url: blog.youtube_url || '',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      category: blog.category,
      author: blog.author,
      author_avatar: blog.author_avatar || '',
      read_time: blog.read_time,
      published: blog.published,
      featured: blog.featured,
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || '',
    });
    setEditing(blog.id);
    setCreating(false);
    setActiveTab('content');
  };

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      images: form.images,
      tags: form.tags,
      updated_at: new Date().toISOString(),
    };
    if (editing) {
      await supabase.from('blogs').update(payload).eq('id', editing);
    } else {
      await supabase.from('blogs').insert({ ...payload, created_at: new Date().toISOString() });
    }
    setSaving(false);
    closeForm();
    fetchBlogs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('blogs').delete().eq('id', id);
    setDeleting(null);
    fetchBlogs();
  };

  const togglePublished = async (blog: Blog) => {
    await supabase.from('blogs').update({ published: !blog.published }).eq('id', blog.id);
    fetchBlogs();
  };

  const toggleFeatured = async (blog: Blog) => {
    await supabase.from('blogs').update({ featured: !blog.featured }).eq('id', blog.id);
    fetchBlogs();
  };

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setNewTag('');
  };

  const removeTag = (t: string) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const removeImage = (url: string) => setForm(f => ({ ...f, images: f.images.filter(x => x !== url) }));

  const uploadImageFile = async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `blogs/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const storage = supabase.storage.from(STORAGE_BUCKET);
    const { data: uploaded, error: err } = await storage.upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });
    if (err) throw err;
    const { data: publicUrlData } = storage.getPublicUrl(uploaded.path);
    return publicUrlData.publicUrl;
  };

  const handleCoverUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImages(true);
    setUploadError(null);
    try {
      const url = await uploadImageFile(file);
      setForm(f => ({ ...f, cover_image: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload cover image');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleGalleryUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    const fileList = e.target.files ? Array.from(e.target.files) : [];
    if (!fileList.length) return;
    setUploadingImages(true);
    setUploadError(null);
    try {
      const urls = await Promise.all(fileList.map(uploadImageFile));
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload gallery images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAuthorAvatarUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAuthorAvatar(true);
    setAuthorAvatarUploadError(null);
    try {
      const url = await uploadImageFile(file);
      setForm(f => ({ ...f, author_avatar: url }));
    } catch (err) {
      setAuthorAvatarUploadError(
        err instanceof Error ? err.message : 'Failed to upload author avatar'
      );
    } finally {
      setUploadingAuthorAvatar(false);
    }
  };

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { key: TabKey; label: string; Icon: React.ElementType }[] = [
    { key: 'content', label: 'Content', Icon: FileText },
    { key: 'meta', label: 'Meta', Icon: User },
    { key: 'images', label: 'Images & Video', Icon: Image },
    { key: 'seo', label: 'SEO', Icon: Search },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />)}
      </div>
    );
  }

  if (creating || editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0a2240]">{creating ? 'New Blog Post' : 'Edit Blog Post'}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{form.title || 'Untitled'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={closeForm} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.slug.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c9a84c] hover:bg-[#b8963e] text-white text-sm font-semibold transition-all disabled:opacity-60"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Post
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key ? 'bg-white text-[#0a2240] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {activeTab === 'content' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Post Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({
                    ...f,
                    title: e.target.value,
                    slug: f.slug || slugify(e.target.value),
                    seo_title: f.seo_title || e.target.value,
                  }))}
                  placeholder="Enter blog post title..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] text-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL Slug *</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-gray-400 text-sm">/blog/</span>
                  <input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="url-friendly-slug"
                    className="flex-1 text-sm focus:outline-none text-[#0a2240]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Excerpt / Summary</label>
                <textarea
                  rows={3}
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value, seo_description: f.seo_description || e.target.value }))}
                  placeholder="Brief summary shown in blog listing..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Article Content</label>
                <RichTextEditor
                  value={form.content}
                  onChange={v => setForm(f => ({ ...f, content: v }))}
                />
                <p className="text-xs text-gray-400 mt-1">Use the toolbar to format text — bold, headings, colors, links, lists and more.</p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                    className={`w-10 h-5.5 rounded-full transition-colors relative ${form.published ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    style={{ height: '22px', width: '40px' }}
                  >
                    <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ width: '18px', height: '18px', top: '2px' }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                    className={`w-10 rounded-full transition-colors relative ${form.featured ? 'bg-[#c9a84c]' : 'bg-gray-300'}`}
                    style={{ height: '22px', width: '40px' }}
                  >
                    <span className={`absolute top-0.5 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} style={{ width: '18px', height: '18px', top: '2px' }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Read Time (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.read_time}
                    onChange={e => setForm(f => ({ ...f, read_time: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Author Name</label>
                  <input
                    value={form.author}
                    onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    placeholder="Western Properties"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Author Avatar Upload</label>
                  {authorAvatarUploadError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-2">
                      {authorAvatarUploadError}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingAuthorAvatar}
                    onChange={handleAuthorAvatarUpload}
                    className="w-full text-sm"
                  />
                  {form.author_avatar && (
                    <img
                      src={form.author_avatar}
                      alt="Author avatar preview"
                      className="mt-3 h-20 w-20 rounded-full object-cover border border-gray-200 bg-white px-1 py-1"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag and press Enter..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2.5 bg-[#0a2240] text-white rounded-xl text-sm font-medium hover:bg-[#0d2f57] transition-colors">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map(t => (
                    <span key={t} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">
                      <Tag className="w-3 h-3" />
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="text-gray-400 hover:text-red-500 transition-colors ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {form.tags.length === 0 && <p className="text-gray-400 text-sm">No tags added</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {uploadError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cover / Featured Image Upload *</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImages}
                  onChange={handleCoverUpload}
                  className="w-full text-sm"
                />
                {form.cover_image ? (
                  <img src={form.cover_image} alt="Cover preview" className="mt-3 h-48 w-full object-cover rounded-xl border border-gray-200" />
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Additional Photo Gallery Upload</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingImages}
                    onChange={handleGalleryUpload}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
                {form.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {form.images.map(url => (
                      <div key={url} className="relative group">
                        <img src={url} alt="" className="h-28 w-full object-cover rounded-xl border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No gallery images added</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">YouTube Video URL</label>
                <div className="relative">
                  <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    value={form.youtube_url}
                    onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Supports youtube.com/watch?v= and youtu.be/ formats</p>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                SEO settings control how this blog post appears in Google search results and when shared on social media.
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">SEO Title</label>
                <input
                  value={form.seo_title}
                  onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))}
                  placeholder="Leave blank to use post title"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                />
                <p className="text-xs text-gray-400 mt-1">{form.seo_title.length}/60 characters (ideal: 50–60)</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Meta Description</label>
                <textarea
                  rows={3}
                  value={form.seo_description}
                  onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))}
                  placeholder="Leave blank to use excerpt"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.seo_description.length}/160 characters (ideal: 120–160)</p>
              </div>
              {form.seo_title && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Google Preview</p>
                  <p className="text-blue-600 text-base font-medium">{form.seo_title}</p>
                  <p className="text-green-700 text-sm">westernproperties.in/blog/{form.slug}</p>
                  <p className="text-gray-600 text-sm mt-1">{form.seo_description || form.excerpt}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2240]">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-0.5">{blogs.length} total posts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#c9a84c] hover:bg-[#b8963e] text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts by title or category..."
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">No blog posts yet</p>
          <p className="text-gray-300 text-sm mt-1">Click "New Post" to create your first article</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(blog => (
            <div key={blog.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                {blog.cover_image && (
                  <img src={blog.cover_image} alt={blog.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0a2240] text-sm leading-snug truncate">{blog.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 capitalize">{blog.category}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{blog.read_time} min</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {blog.excerpt && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-1">{blog.excerpt}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleFeatured(blog)}
                        title={blog.featured ? 'Unfeature' : 'Feature'}
                        className={`p-2 rounded-lg transition-all ${blog.featured ? 'text-[#c9a84c] bg-[#c9a84c]/10' : 'text-gray-300 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10'}`}
                      >
                        {blog.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => togglePublished(blog)}
                        title={blog.published ? 'Unpublish' : 'Publish'}
                        className={`p-2 rounded-lg transition-all ${blog.published ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 hover:text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        {blog.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(blog)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#0a2240] hover:bg-gray-100 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deleting === blog.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
