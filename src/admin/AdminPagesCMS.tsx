import React, { useState, useEffect } from 'react';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Layers,
  HelpCircle,
  MessageSquareQuote,
  Eye,
  Check,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  MapPin,
  Globe,
  Phone,
  Heart,
  ShieldCheck,
  User,
} from 'lucide-react';
import { WebsitePage, PageSection, WebsiteSettings } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { INITIAL_PAGES } from '../data/initialCatalog';
import { setActiveWhatsAppNumber, createWhatsAppUrl } from '../utils/whatsapp';

interface AdminPagesCMSProps {
  token: string;
}

export const AdminPagesCMS: React.FC<AdminPagesCMSProps> = ({ token }) => {
  const [pages, setPages] = useState<WebsitePage[]>(INITIAL_PAGES);
  const [selectedSlug, setSelectedSlug] = useState<string>('home');
  const [activePage, setActivePage] = useState<WebsitePage | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPagesAndSettings = () => {
    setLoading(true);
    Promise.all([
      safeFetchJson<WebsitePage[]>(
        '/api/admin/pages',
        { headers: { Authorization: `Bearer ${token}` } },
        INITIAL_PAGES
      ),
      safeFetchJson<WebsiteSettings | null>(
        '/api/admin/settings',
        { headers: { Authorization: `Bearer ${token}` } },
        null
      ),
    ])
      .then(([pagesData, settingsData]) => {
        const list = Array.isArray(pagesData) && pagesData.length > 0 ? [...pagesData] : [...INITIAL_PAGES];
        // Ensure all default pages exist
        INITIAL_PAGES.forEach((initP) => {
          if (!list.some((p) => p.slug === initP.slug)) {
            list.push(initP);
          }
        });
        setPages(list);
        if (settingsData) {
          setSettings(settingsData);
          if (settingsData.whatsapp_number) {
            setActiveWhatsAppNumber(settingsData.whatsapp_number);
          }
        }

        const currentSlug = selectedSlug || 'home';
        const found = (list || []).find((p) => p.slug === currentSlug) || list[0];
        setSelectedSlug(found.slug);
        setActivePage(JSON.parse(JSON.stringify(found)));
      })
      .catch((err) => {
        console.error(err);
        setPages(INITIAL_PAGES);
        setActivePage(JSON.parse(JSON.stringify(INITIAL_PAGES[0])));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPagesAndSettings();
  }, []);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    setSuccessMsg('');
    setErrorMsg('');
    const found = (pages || []).find((p) => p.slug === slug);
    if (found) {
      setActivePage(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleSave = async (status: 'draft' | 'published' = 'published') => {
    if (!activePage) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. If Contact page is active, ensure contact_header and brand_identity sections in activePage reflect current values
      let pageSectionsToSave = activePage.sections ? [...activePage.sections] : [];
      if (activePage.slug === 'contact' && settings) {
        const brandSecIdx = pageSectionsToSave.findIndex(
          (s) => s.section_key === 'brand_identity' || s.section_type === 'brand_identity'
        );
        const brandContent = {
          business_name: settings.business_name,
          tagline: settings.tagline,
          whatsapp_number: settings.whatsapp_number,
          whatsapp_display: settings.whatsapp_display,
          email: settings.email,
          studio_address: settings.studio_address,
          instagram_url: settings.instagram_url,
          facebook_url: settings.facebook_url,
          domain: settings.domain,
        };

        if (brandSecIdx >= 0) {
          pageSectionsToSave[brandSecIdx] = {
            ...pageSectionsToSave[brandSecIdx],
            content_json: brandContent,
          };
        } else {
          pageSectionsToSave.push({
            id: 'sec-contact-brand',
            page_id: activePage.id,
            section_type: 'brand_identity',
            section_key: 'brand_identity',
            content_json: brandContent,
            display_order: pageSectionsToSave.length + 1,
            is_visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      // 2. Save page CMS
      const data = await safeFetchJson<any>(
        `/api/admin/pages/${activePage.slug}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: activePage.title,
            seo_title: activePage.seo_title,
            meta_description: activePage.meta_description,
            status,
            sections: pageSectionsToSave,
            settings: activePage.slug === 'contact' ? settings : undefined,
          }),
        },
        null
      );

      if (!data) {
        setErrorMsg('Failed to update page CMS.');
        return;
      }

      // 3. If contact page or home page with banner, also save to settings API
      if (activePage.slug === 'contact' && settings) {
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        });

        if (settings.whatsapp_number) {
          setActiveWhatsAppNumber(settings.whatsapp_number, settings.whatsapp_display);
          try {
            localStorage.setItem('dot_whatsapp_number', settings.whatsapp_number);
            if (settings.whatsapp_display) {
              localStorage.setItem('dot_whatsapp_display', settings.whatsapp_display);
            }
          } catch {}
        }
      }

      // Always dispatch custom events for instant live reflection across the public site
      if (settings) {
        window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: settings }));
      }
      window.dispatchEvent(new Event('app_pages_updated'));

      setSuccessMsg(
        activePage.slug === 'contact'
          ? `✓ Contact details, WhatsApp number, email, and social profiles saved & published live!`
          : `✓ Saved and published changes for "${activePage.title}". Live website is updated!`
      );
      setTimeout(() => setSuccessMsg(''), 4500);
      fetchPagesAndSettings();
    } catch (err) {
      setErrorMsg('Server error saving page CMS.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to update a section's content field cleanly
  const updateSectionField = (sectionKeyOrType: string, fieldKey: string, value: any) => {
    if (!activePage) return;
    const copy = [...(activePage.sections || [])];
    const secIdx = copy.findIndex(
      (s) => s.section_key === sectionKeyOrType || s.section_type === sectionKeyOrType
    );

    if (secIdx >= 0) {
      copy[secIdx] = {
        ...copy[secIdx],
        content_json: {
          ...(copy[secIdx].content_json || {}),
          [fieldKey]: value,
        },
      };
      setActivePage({ ...activePage, sections: copy });
    } else {
      copy.push({
        id: `sec-${sectionKeyOrType}-${Date.now()}`,
        page_id: activePage.id,
        section_type: sectionKeyOrType,
        section_key: sectionKeyOrType,
        content_json: { [fieldKey]: value },
        display_order: copy.length + 1,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setActivePage({ ...activePage, sections: copy });
    }
  };

  // Helper to get a section field with fallback default
  const getSectionField = (sectionKeyOrType: string, fieldKey: string, defaultValue: string = '') => {
    const sec = activePage?.sections?.find(
      (s) => s.section_key === sectionKeyOrType || s.section_type === sectionKeyOrType
    );
    return sec?.content_json?.[fieldKey] !== undefined ? sec.content_json[fieldKey] : defaultValue;
  };

  // Upload an image file for a section field (e.g. banner image)
  const handleFileUpload = async (sectionKeyOrType: string, fieldKey: string, file: File) => {
    if (!file || !activePage) return;
    setUploadingImage(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await safeResponseJson(res, {});
      if (res.ok && data.url) {
        updateSectionField(sectionKeyOrType, fieldKey, data.url);
        setSuccessMsg(`Image uploaded successfully! Click "Save & Publish Changes" to apply.`);
      } else {
        setErrorMsg(data?.error || 'Failed to upload image.');
      }
    } catch {
      setErrorMsg('Error uploading image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-theme-muted">Loading website pages and contact settings...</p>
      </div>
    );
  }

  // Find home sections
  const bannerSection = activePage?.sections?.find(
    (s) => s.section_type === 'banner' || s.section_key === 'banner'
  );
  const bannerContent = bannerSection?.content_json || {};

  const featuredSection = activePage?.sections?.find(
    (s) => s.section_type === 'featured_artworks' || s.section_key === 'featured_authentic_artworks'
  );
  const featuredContent = featuredSection?.content_json || {};

  const testimonialsSection = activePage?.sections?.find(
    (s) => s.section_type === 'testimonials' || s.section_key === 'testimonials'
  );
  const testimonialsContent = testimonialsSection?.content_json || {};

  // Find FAQ sections if FAQs page is selected
  const faqHeaderSection = activePage?.sections?.find(
    (s) => s.section_type === 'header' || s.section_key === 'faqs_header'
  );
  const faqHeaderContent = faqHeaderSection?.content_json || {};

  const faqHelpSection = activePage?.sections?.find(
    (s) => s.section_type === 'help_card' || s.section_key === 'faqs_help_card'
  );
  const faqHelpContent = faqHelpSection?.content_json || {};

  // Find Contact header section
  const contactHeaderSection = activePage?.sections?.find(
    (s) => s.section_type === 'header' || s.section_key === 'contact_header'
  );
  const contactHeaderContent = contactHeaderSection?.content_json || {};

  return (
    <div className="space-y-6 text-theme-primary">
      {/* CMS Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">
            Website Pages CMS
          </h2>
          <p className="text-xs text-theme-muted">
            Easily view and edit the exact text, media, contact channels, and brand details for every page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePage && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="px-5 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Changes'}</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Clean Page Navigation Selector Tabs */}
      <div className="p-4 rounded-2xl glass-card border border-theme-glass space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-theme-accent flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          <span>Select Webpage to Edit:</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {pages.map((p) => {
            const isSelected = selectedSlug === p.slug;
            return (
              <button
                key={p.slug}
                onClick={() => handleSelectPage(p.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-theme-accent text-white shadow-xs font-bold'
                    : 'bg-theme-page text-theme-primary hover:bg-theme-accent/15 border border-theme-glass'
                }`}
              >
                {p.slug === 'home' && <span>🏠</span>}
                {p.slug === 'contact' && <span>📬</span>}
                {p.slug === 'faqs' && <span>❓</span>}
                {p.slug === 'shop' && <span>🎨</span>}
                {p.slug === 'custom-order' && <span>🛒</span>}
                {p.slug === 'gallery' && <span>🖼️</span>}
                {p.slug === 'about' && <span>👤</span>}
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Page Editor */}
      {activePage && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-theme-glass craft-shadow space-y-8 text-xs text-theme-primary">
          {/* Page Top Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-glass">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-theme-primary">
                  Editing: {activePage.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                  {activePage.status}
                </span>
              </div>
              <p className="text-xs text-theme-muted font-mono mt-0.5">
                Path: /{activePage.slug === 'home' ? '' : activePage.slug}
              </p>
            </div>

            <a
              href={activePage.slug === 'home' ? '/' : `/${activePage.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl glass-button text-xs text-theme-primary hover:bg-theme-accent/15 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-theme-accent" />
              <span>View Live Webpage</span>
            </a>
          </div>

          {/* ========================================================= */}
          {/* 1. HOME PAGE: THE 3 EXACT EXISTING SECTIONS               */}
          {/* ========================================================= */}
          {activePage.slug === 'home' && (
            <div className="space-y-8">
              <div className="p-4 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-xs text-theme-primary space-y-1">
                <p className="font-bold text-theme-accent flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Editable Sections of Home Page</span>
                </p>
                <p className="text-theme-muted text-[11px]">
                  The Home page consists of exactly 3 editable sections: <strong>1. Banner</strong>, <strong>2. Featured Authentic Artworks</strong>, and <strong>3. Testimonials</strong>. Below is the exact text present on the live site. Edit any field and click &quot;Save &amp; Publish Changes&quot;.
                </p>
              </div>

              {/* ---------------- SECTION 1: BANNER ---------------- */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-accent/30 space-y-5">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-serif text-lg font-bold text-theme-primary">
                      Section 1: Hero Showcase Banner
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent border border-theme-glass">
                    Huge Showcase Banner
                  </span>
                </div>

                {/* Banner Image Drag & Drop / Upload */}
                <div className="space-y-2">
                  <label className="block font-bold text-theme-primary text-xs flex items-center justify-between">
                    <span>Banner Artwork Image</span>
                    <span className="text-[10px] text-theme-muted font-normal">
                      Drag &amp; drop or click to upload new photo
                    </span>
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(true);
                    }}
                    onDragLeave={() => setIsDraggingBanner(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload('banner', 'image_url', file);
                    }}
                    onClick={() => {
                      const input = document.getElementById('cms-banner-file-input') as HTMLInputElement;
                      if (input) input.click();
                    }}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center gap-4 cursor-pointer ${
                      isDraggingBanner
                        ? 'border-theme-accent bg-theme-accent/10 scale-[1.01]'
                        : 'border-theme-glass bg-theme-card hover:border-theme-accent/70'
                    }`}
                  >
                    <input
                      id="cms-banner-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('banner', 'image_url', file);
                      }}
                    />

                    {bannerContent.image_url ? (
                      <img
                        src={bannerContent.image_url}
                        alt="Banner Preview"
                        className="w-24 h-24 object-cover rounded-xl border border-theme-glass shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-theme-page flex items-center justify-center text-theme-muted border border-theme-glass shrink-0">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    <div className="text-center sm:text-left space-y-1 flex-1">
                      <p className="font-semibold text-xs text-theme-primary">
                        {uploadingImage
                          ? 'Uploading image...'
                          : isDraggingBanner
                          ? 'Drop banner photo here!'
                          : 'Drag & drop banner image here, or click to browse'}
                      </p>
                      <p className="text-[11px] text-theme-muted">
                        Current image path: <span className="font-mono text-theme-accent">{bannerContent.image_url || '/static/assets/images/DA-MD-24-0002.jpg'}</span>
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg bg-theme-accent/15 text-theme-accent font-semibold text-xs flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </div>
                  </div>
                </div>

                {/* Banner Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Top Badge / Eyebrow Text
                    </label>
                    <input
                      type="text"
                      value={bannerContent.eyebrow ?? 'MEET THE ARTIST & MASTER CRAFTSWOMAN'}
                      onChange={(e) => updateSectionField('banner', 'eyebrow', e.target.value)}
                      placeholder="e.g. MEET THE ARTIST & MASTER CRAFTSWOMAN"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Artwork Product Code Reference
                    </label>
                    <input
                      type="text"
                      value={bannerContent.product_sku ?? 'ARTIST-SHITAL'}
                      onChange={(e) => updateSectionField('banner', 'product_sku', e.target.value)}
                      placeholder="e.g. ARTIST-SHITAL"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary mb-1">
                    Main Banner Title / Headline
                  </label>
                  <input
                    type="text"
                    value={bannerContent.title ?? 'Shital Thosar — Authentic Geometry & Handmade Mandala Art'}
                    onChange={(e) => updateSectionField('banner', 'title', e.target.value)}
                    placeholder="e.g. Shital Thosar — Authentic Geometry & Handmade Mandala Art"
                    className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary mb-1">
                    Short Tagline / Intro Sentence
                  </label>
                  <input
                    type="text"
                    value={bannerContent.short_description ?? 'Crafting serene dot mandalas and traditional Lippan Kaam mirror art with deep devotion and precision.'}
                    onChange={(e) => updateSectionField('banner', 'short_description', e.target.value)}
                    placeholder="e.g. Crafting serene dot mandalas..."
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                  />
                </div>

                {/* Description Narrative */}
                <div>
                  <label className="block font-semibold text-theme-primary mb-1">
                    Full Artist Story / Description Narrative
                  </label>
                  <textarea
                    rows={4}
                    value={bannerContent.description ?? 'Shital Thosar is a visionary Indian artisan specializing in authentic Dot Mandalas and traditional Gujarati Lippan Kaam mirror art. Handcrafted on moisture-resistant MDF board with heavy-body acrylics, light-reflecting mirrors, and protective varnish, her creations bring spiritual harmony, positive energy, and radiant warmth into modern homes across the globe.'}
                    onChange={(e) => updateSectionField('banner', 'description', e.target.value)}
                    placeholder="Detailed artist narrative..."
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Dimensions / Availability Note
                    </label>
                    <input
                      type="text"
                      value={bannerContent.size ?? 'Custom Sizes Available'}
                      onChange={(e) => updateSectionField('banner', 'size', e.target.value)}
                      placeholder="e.g. Custom Sizes Available"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Starting Price / Price Note (₹)
                    </label>
                    <input
                      type="number"
                      value={bannerContent.price ?? 0}
                      onChange={(e) => updateSectionField('banner', 'price', Number(e.target.value))}
                      placeholder="0 for custom, or price in ₹"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Floating Badge Note
                    </label>
                    <input
                      type="text"
                      value={bannerContent.badge_text ?? 'Handmade with Devotion'}
                      onChange={(e) => updateSectionField('banner', 'badge_text', e.target.value)}
                      placeholder="e.g. Handmade with Devotion"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Material Specification
                    </label>
                    <input
                      type="text"
                      value={bannerContent.material ?? 'MDF Board, Acrylic Colors, Mirrors, Varnish'}
                      onChange={(e) => updateSectionField('banner', 'material', e.target.value)}
                      placeholder="e.g. MDF Board, Acrylic Colors, Mirrors, Varnish"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Creation Lead Time
                    </label>
                    <input
                      type="text"
                      value={bannerContent.creation_time ?? '8 Days'}
                      onChange={(e) => updateSectionField('banner', 'creation_time', e.target.value)}
                      placeholder="e.g. 8 Days"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Shipping Information
                    </label>
                    <input
                      type="text"
                      value={bannerContent.shipping_info ?? 'All over the world (Bubble wrap and corrugated box)'}
                      onChange={(e) => updateSectionField('banner', 'shipping_info', e.target.value)}
                      placeholder="e.g. All over the world"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>
                </div>
              </div>

              {/* ---------------- SECTION 2: FEATURED Authentic ARTWORKS ---------------- */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-serif text-lg font-bold text-theme-primary">
                      Section 2: Featured Authentic Artworks
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent border border-theme-glass">
                    Catalog Showcase Grid
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Eyebrow / Small Header Badge
                    </label>
                    <input
                      type="text"
                      value={featuredContent.badge_text ?? 'Handcrafted Collection'}
                      onChange={(e) => updateSectionField('featured_authentic_artworks', 'badge_text', e.target.value)}
                      placeholder="e.g. Handcrafted Collection"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={featuredContent.heading ?? 'Featured Authentic Artworks'}
                      onChange={(e) => updateSectionField('featured_authentic_artworks', 'heading', e.target.value)}
                      placeholder="e.g. Featured Authentic Artworks"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Catalog Link Button Text
                    </label>
                    <input
                      type="text"
                      value={featuredContent.catalog_link_text ?? 'View Full Catalog'}
                      onChange={(e) => updateSectionField('featured_authentic_artworks', 'catalog_link_text', e.target.value)}
                      placeholder="e.g. View Full Catalog"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-theme-card border border-theme-glass text-[11px] text-theme-muted flex items-center gap-2">
                  <Layers className="w-4 h-4 text-theme-accent shrink-0" />
                  <span>
                    <strong>Which artworks appear here?</strong> The products displayed in this section are managed under the <strong>Product Catalog</strong> tab. Simply toggle the &quot;Featured&quot; star switch on any product to display it here.
                  </span>
                </div>
              </div>

              {/* ---------------- SECTION 3: TESTIMONIALS ---------------- */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-serif text-lg font-bold text-theme-primary">
                      Section 3: Testimonials
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent border border-theme-glass">
                    Customer Reviews
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Eyebrow / Small Header Badge
                    </label>
                    <input
                      type="text"
                      value={testimonialsContent.badge_text ?? 'Collector Words'}
                      onChange={(e) => updateSectionField('testimonials', 'badge_text', e.target.value)}
                      placeholder="e.g. Collector Words"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Section Main Heading
                    </label>
                    <input
                      type="text"
                      value={testimonialsContent.heading ?? 'Cherished in Homes Worldwide'}
                      onChange={(e) => updateSectionField('testimonials', 'heading', e.target.value)}
                      placeholder="e.g. Cherished in Homes Worldwide"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-theme-card border border-theme-glass text-[11px] text-theme-muted flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-theme-accent shrink-0" />
                  <span>
                    <strong>How to manage customer reviews?</strong> Individual collector testimonials (customer names, 5-star ratings, quotes, artwork purchased) are managed in the dedicated <strong>Testimonials</strong> admin tab.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. CONTACT PAGE CMS: BRAND IDENTITY & WHATSAPP CHANNELS    */}
          {/* ========================================================= */}
          {activePage.slug === 'contact' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-xs text-theme-primary space-y-1">
                <p className="font-bold text-theme-accent flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Brand Identity, Studio Information &amp; Primary Ordering WhatsApp</span>
                </p>
                <p className="text-theme-muted text-[11px]">
                  Directly change your phone number, email, social media handles, studio address, and brand tagline. Changes apply immediately across the Contact page, site footer, and WhatsApp ordering system.
                </p>
              </div>

              {/* Section 1: Contact Page Header & Intro */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-serif text-lg font-bold text-theme-primary">
                      1. Contact Page Header &amp; Subtitle
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    Header Banner
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Top Eyebrow Badge
                    </label>
                    <input
                      type="text"
                      value={contactHeaderContent.badge ?? 'GET IN TOUCH'}
                      onChange={(e) => updateSectionField('contact_header', 'badge', e.target.value)}
                      placeholder="e.g. GET IN TOUCH"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Main Page Heading
                    </label>
                    <input
                      type="text"
                      value={contactHeaderContent.title ?? 'Contact Dot And Art Studio'}
                      onChange={(e) => updateSectionField('contact_header', 'title', e.target.value)}
                      placeholder="e.g. Contact Dot And Art Studio"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary mb-1">
                    Introductory Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={contactHeaderContent.description ?? 'We welcome custom commission enquiries, bulk orders, and interior design collaborations.'}
                    onChange={(e) => updateSectionField('contact_header', 'description', e.target.value)}
                    placeholder="Intro description..."
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Brand Identity & Primary Ordering WhatsApp */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-accent/30 space-y-5">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-serif text-lg font-bold text-theme-primary">
                      2. Brand Identity &amp; Primary Ordering WhatsApp
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    Live Routing Channels
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Studio / Business Name
                    </label>
                    <input
                      type="text"
                      value={settings?.business_name ?? 'Dot And Art Studio'}
                      onChange={(e) => setSettings((prev) => prev ? ({ ...prev, business_name: e.target.value }) : null)}
                      placeholder="e.g. Dot And Art Studio"
                      className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Brand Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={settings?.tagline ?? 'Handcrafted Authentic Mandalas & Lippan Mirror Art'}
                      onChange={(e) => setSettings((prev) => prev ? ({ ...prev, tagline: e.target.value }) : null)}
                      placeholder="e.g. Handcrafted Authentic Mandalas & Lippan Mirror Art"
                      className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>
                </div>

                {/* Primary WhatsApp Ordering Number Box */}
                <div className="p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-3">
                  <div className="flex items-center gap-2 text-[#128C7E] font-bold text-xs">
                    <MessageCircle className="w-4 h-4 fill-[#128C7E] text-white" />
                    <span>Primary Ordering WhatsApp Phone Number (Direct Route)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-theme-primary mb-1">
                        WhatsApp Number (International format with country code) *
                      </label>
                      <input
                        type="text"
                        value={settings?.whatsapp_number ?? '+918652162647'}
                        onChange={(e) => setSettings((prev) => prev ? ({ ...prev, whatsapp_number: e.target.value }) : null)}
                        placeholder="e.g. +91 8652162647 or 918652162647"
                        className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass font-mono font-bold text-emerald-700 dark:text-emerald-400"
                      />
                      <p className="text-[10px] text-theme-muted mt-1">
                        All customer order inquiries from catalog, cart, and custom requests automatically route directly to this WhatsApp number.
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-theme-primary mb-1">
                        Display Phone Label (shown to customers)
                      </label>
                      <input
                        type="text"
                        value={settings?.whatsapp_display ?? '+91 8652162647'}
                        onChange={(e) => setSettings((prev) => prev ? ({ ...prev, whatsapp_display: e.target.value }) : null)}
                        placeholder="e.g. +91 8652162647"
                        className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary font-semibold"
                      />
                      <p className="text-[10px] text-theme-muted mt-1">
                        Formatted phone number visible on the contact card and site footer.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Official Contact Email *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-theme-accent/15 text-theme-accent shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={settings?.email ?? 'shitalthosar@yahoo.com'}
                        onChange={(e) => setSettings((prev) => prev ? ({ ...prev, email: e.target.value }) : null)}
                        placeholder="shitalthosar@yahoo.com"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Website Domain
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-theme-accent/15 text-theme-accent shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={settings?.domain ?? 'dotandart.in'}
                        onChange={(e) => setSettings((prev) => prev ? ({ ...prev, domain: e.target.value }) : null)}
                        placeholder="dotandart.in"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary mb-1">
                    Physical Studio Address / Location
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-theme-accent/15 text-theme-accent shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={settings?.studio_address ?? 'Pune, Maharashtra, India'}
                      onChange={(e) => setSettings((prev) => prev ? ({ ...prev, studio_address: e.target.value }) : null)}
                      placeholder="e.g. Pune, Maharashtra, India"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Social Profiles & Media Handles */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-serif text-lg font-bold text-theme-primary">
                      3. Social Media Profiles &amp; Handles
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    Social Links
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1 flex items-center gap-1.5">
                      <Instagram className="w-4 h-4 text-[#E1306C]" />
                      <span>Instagram Profile URL / Handle</span>
                    </label>
                    <input
                      type="text"
                      value={settings?.instagram_url ?? 'https://www.instagram.com/sathosar'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => prev ? ({ ...prev, instagram_url: val }) : null);
                        updateSectionField('brand_identity', 'instagram_url', val);
                      }}
                      placeholder="https://www.instagram.com/sathosar"
                      className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                    <span className="text-[10px] text-theme-muted mt-1 block">
                      e.g. https://www.instagram.com/sathosar
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1 flex items-center gap-1.5">
                      <Facebook className="w-4 h-4 text-[#1877F2]" />
                      <span>Facebook Page URL</span>
                    </label>
                    <input
                      type="text"
                      value={settings?.facebook_url ?? 'https://www.facebook.com/people/Dot-And-Art/61570301135652/'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => prev ? ({ ...prev, facebook_url: val }) : null);
                        updateSectionField('brand_identity', 'facebook_url', val);
                      }}
                      placeholder="https://www.facebook.com/people/Dot-And-Art/61570301135652/"
                      className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                    <span className="text-[10px] text-theme-muted mt-1 block">
                      e.g. https://www.facebook.com/people/Dot-And-Art/61570301135652/
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Live Channel Verification & Instant Test Box */}
              <div className="p-5 rounded-2xl glass-panel border border-theme-glass space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-theme-accent flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Live Channel Verification &amp; Instant Click-to-Test</span>
                </h5>
                <p className="text-[11px] text-theme-muted">
                  Verify that your contact channels open correctly before or after saving:
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href={createWhatsAppUrl('Hello Dot And Art! This is a test message from the Admin CMS.', settings?.whatsapp_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Test WhatsApp ({settings?.whatsapp_display || settings?.whatsapp_number || '+91 8652162647'})</span>
                  </a>

                  <a
                    href={`mailto:${settings?.email || 'shitalthosar@yahoo.com'}`}
                    className="px-3.5 py-2 rounded-xl glass-button text-xs font-semibold text-theme-primary border border-theme-glass hover:bg-theme-accent/15 inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-theme-accent" />
                    <span>Test Email ({settings?.email || 'shitalthosar@yahoo.com'})</span>
                  </a>

                  {settings?.instagram_url && (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl glass-button text-xs font-semibold text-theme-primary border border-theme-glass hover:bg-[#E1306C] hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Test Instagram</span>
                    </a>
                  )}

                  {settings?.facebook_url && (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl glass-button text-xs font-semibold text-theme-primary border border-theme-glass hover:bg-[#1877F2] hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Facebook className="w-4 h-4" />
                      <span>Test Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. FAQS PAGE CMS                                          */}
          {/* ========================================================= */}
          {activePage.slug === 'faqs' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-xs text-theme-primary space-y-1">
                <p className="font-bold text-theme-accent flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>FAQs Page Content &amp; WhatsApp Assistance</span>
                </p>
                <p className="text-theme-muted text-[11px]">
                  Edit the header title, description, and the bottom WhatsApp assistance banner for the dedicated FAQs page. Individual questions &amp; answers are managed in the <strong>FAQs</strong> tab in the sidebar.
                </p>
              </div>

              {/* Section 1: Page Header */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary">
                    1. FAQs Page Header
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    Header Banner
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Top Eyebrow Badge
                    </label>
                    <input
                      type="text"
                      value={faqHeaderContent.badge ?? 'Common Inquiries'}
                      onChange={(e) => updateSectionField('faqs_header', 'badge', e.target.value)}
                      placeholder="e.g. Common Inquiries"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Main Page Heading
                    </label>
                    <input
                      type="text"
                      value={faqHeaderContent.title ?? 'Frequently Asked Questions'}
                      onChange={(e) => updateSectionField('faqs_header', 'title', e.target.value)}
                      placeholder="e.g. Frequently Asked Questions"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary mb-1">
                    Introductory Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={faqHeaderContent.description ?? 'Everything you need to know about our sizes, customization process, pricing policy, creation timelines, advance payments, and worldwide shipping.'}
                    onChange={(e) => updateSectionField('faqs_header', 'description', e.target.value)}
                    placeholder="Description text..."
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
                  />
                </div>
              </div>

              {/* Section 2: WhatsApp Help Banner */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary">
                    2. Bottom WhatsApp Help Card
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    Direct Contact Box
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      Card Heading
                    </label>
                    <input
                      type="text"
                      value={faqHelpContent.title ?? 'Still have a question?'}
                      onChange={(e) => updateSectionField('faqs_help_card', 'title', e.target.value)}
                      placeholder="e.g. Still have a question?"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary mb-1">
                      WhatsApp Button Text
                    </label>
                    <input
                      type="text"
                      value={faqHelpContent.button_text ?? 'Chat on WhatsApp (+91 8652162647)'}
                      onChange={(e) => updateSectionField('faqs_help_card', 'button_text', e.target.value)}
                      placeholder="e.g. Chat on WhatsApp (+91 8652162647)"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary mb-1">
                    Card Description
                  </label>
                  <textarea
                    rows={2}
                    value={faqHelpContent.description ?? 'We are just a message away. Reach out to the artist on WhatsApp for immediate answers regarding your custom requirements.'}
                    onChange={(e) => updateSectionField('faqs_help_card', 'description', e.target.value)}
                    placeholder="Description text..."
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. ABOUT ARTIST PAGE CMS (All Text Boxes Editable)       */}
          {/* ========================================================= */}
          {activePage.slug === 'about' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-xs text-theme-primary space-y-1">
                <p className="font-bold text-theme-accent flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>About Artist Page Content Editor</span>
                </p>
                <p className="text-theme-muted text-[11px]">
                  All text boxes, narrative paragraphs, philosophical principles, handcrafted promises, and creation process steps on the &quot;About Artist&quot; page are directly editable below. Changes publish live immediately upon clicking <strong>Save &amp; Publish Changes</strong>.
                </p>
              </div>

              {/* Section 1: Intro Hero */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">1</span>
                    <span>Hero Header &amp; Subtitle</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    artist_hero
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Badge / Tagline
                    </label>
                    <input
                      type="text"
                      value={getSectionField('artist_hero', 'badge', 'Meet The Artist')}
                      onChange={(e) => updateSectionField('artist_hero', 'badge', e.target.value)}
                      placeholder="e.g. Meet The Artist"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Main Heading / Artist Name
                    </label>
                    <input
                      type="text"
                      value={getSectionField('artist_hero', 'title', 'About Shital Thosar')}
                      onChange={(e) => updateSectionField('artist_hero', 'title', e.target.value)}
                      placeholder="e.g. About Shital Thosar"
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary text-xs mb-1">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={getSectionField('artist_hero', 'subtitle', 'Artist & Founder behind DotAndArt')}
                    onChange={(e) => updateSectionField('artist_hero', 'subtitle', e.target.value)}
                    placeholder="Subtitle describing the artist and studio..."
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Main Narrative & Bio */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">2</span>
                    <span>Artist Story &amp; Narrative Box</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    artist_story
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary text-xs mb-1">
                    Greeting / Statement Heading
                  </label>
                  <textarea
                    rows={2}
                    value={getSectionField('artist_story', 'statement_heading', 'Hi, I’m Shital Thosar, the artist and creator behind DotAndArt.')}
                    onChange={(e) => updateSectionField('artist_story', 'statement_heading', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-medium resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Paragraph 1 — The Spark &amp; Artistic Beginning
                    </label>
                    <textarea
                      rows={3}
                      value={getSectionField('artist_story', 'paragraph_1', 'What started as a love for colours, patterns and the simple joy of creating with my hands slowly grew into something much more meaningful—my own art journey.')}
                      onChange={(e) => updateSectionField('artist_story', 'paragraph_1', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Paragraph 2 — Dot Mandala Art &amp; Meditative Calm
                    </label>
                    <textarea
                      rows={3}
                      value={getSectionField('artist_story', 'paragraph_2', 'I found myself drawn to Dot Mandala Art, where tiny dots come together to create intricate patterns, balance and harmony. For me, mandala is not just about creating something beautiful. It is a process of slowing down, being present and finding a little calm in the middle of everyday life.')}
                      onChange={(e) => updateSectionField('artist_story', 'paragraph_2', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Paragraph 3 — Evolution &amp; Indian Artistic Influences
                    </label>
                    <textarea
                      rows={3}
                      value={getSectionField('artist_story', 'paragraph_3', 'With time, my art has evolved into a blend of traditional mandala patterns, contemporary colours and Indian artistic influences. I enjoy experimenting with colours, textures and different forms while keeping the handmade character of every piece alive.')}
                      onChange={(e) => updateSectionField('artist_story', 'paragraph_3', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Paragraph 4 — Handcrafted Devotion
                    </label>
                    <textarea
                      rows={3}
                      value={getSectionField('artist_story', 'paragraph_4', 'Every DotAndArt creation is painted by hand, one dot and one detail at a time. Whether it is a personalised photo mandala, a festive piece, a wall artwork or a custom creation, I put a little piece of my creativity and love into each one.')}
                      onChange={(e) => updateSectionField('artist_story', 'paragraph_4', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Paragraph 5 — Meaningful Impact &amp; Community
                    </label>
                    <textarea
                      rows={3}
                      value={getSectionField('artist_story', 'paragraph_5', "Today, DotAndArt is not just about selling handmade art. It is about creating meaningful pieces that become part of someone's home, celebrations and memories.")}
                      onChange={(e) => updateSectionField('artist_story', 'paragraph_5', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-theme-glass space-y-3">
                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Closing Thanks Note
                    </label>
                    <input
                      type="text"
                      value={getSectionField('artist_story', 'closing_thanks', 'Thank you for being a part of my creative journey.')}
                      onChange={(e) => updateSectionField('artist_story', 'closing_thanks', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-theme-primary text-xs mb-1">
                        Sign-off
                      </label>
                      <input
                        type="text"
                        value={getSectionField('artist_story', 'closing_sign', 'With love,')}
                        onChange={(e) => updateSectionField('artist_story', 'closing_sign', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-theme-primary text-xs mb-1">
                        Artist Name
                      </label>
                      <input
                        type="text"
                        value={getSectionField('artist_story', 'closing_name', 'Shital')}
                        onChange={(e) => updateSectionField('artist_story', 'closing_name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-theme-primary text-xs mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={getSectionField('artist_story', 'closing_role', 'Artist & Founder, DotAndArt')}
                        onChange={(e) => updateSectionField('artist_story', 'closing_role', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: The Handcrafted Promise */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">3</span>
                    <span>The Handcrafted Promise Card</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    artist_promise
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary text-xs mb-1">
                    Promise Card Title
                  </label>
                  <input
                    type="text"
                    value={getSectionField('artist_promise', 'promise_title', 'The Handcrafted Promise')}
                    onChange={(e) => updateSectionField('artist_promise', 'promise_title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary text-xs mb-1">
                    Promise Description
                  </label>
                  <textarea
                    rows={2}
                    value={getSectionField('artist_promise', 'promise_desc', 'Every artwork leaving the studio has been painted by hand with patience, precision, and devotion. We use non-toxic, lightfast acrylics, moisture-sealed MDF bases, and authentic mirrors.')}
                    onChange={(e) => updateSectionField('artist_promise', 'promise_desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block font-semibold text-theme-primary text-xs mb-1">
                    3 Promise Checkpoints
                  </label>
                  <input
                    type="text"
                    value={getSectionField('artist_promise', 'point_1', 'Zero mass-production or stencil printing')}
                    onChange={(e) => updateSectionField('artist_promise', 'point_1', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    placeholder="Checkpoint 1..."
                  />
                  <input
                    type="text"
                    value={getSectionField('artist_promise', 'point_2', 'Hand painted dot by dot, detail by detail')}
                    onChange={(e) => updateSectionField('artist_promise', 'point_2', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    placeholder="Checkpoint 2..."
                  />
                  <input
                    type="text"
                    value={getSectionField('artist_promise', 'point_3', 'Protective moisture-seal applied to every creation')}
                    onChange={(e) => updateSectionField('artist_promise', 'point_3', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    placeholder="Checkpoint 3..."
                  />
                </div>
              </div>

              {/* Section 4: Custom Artworks Card */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">4</span>
                    <span>Custom Artworks Callout Card</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    artist_custom_card
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Callout Title
                    </label>
                    <input
                      type="text"
                      value={getSectionField('artist_custom_card', 'card_title', 'Custom Artworks')}
                      onChange={(e) => updateSectionField('artist_custom_card', 'card_title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={getSectionField('artist_custom_card', 'button_text', 'Commission Custom Piece')}
                      onChange={(e) => updateSectionField('artist_custom_card', 'button_text', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary text-xs mb-1">
                    Callout Description
                  </label>
                  <textarea
                    rows={2}
                    value={getSectionField('artist_custom_card', 'card_desc', 'Looking for custom colors, specific dimensions, or a personalized photo mandala?')}
                    onChange={(e) => updateSectionField('artist_custom_card', 'card_desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                  />
                </div>
              </div>

              {/* Section 5: The Meditative Discipline */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">5</span>
                    <span>The Meditative Discipline &amp; Philosophy</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    meditative_discipline
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Badge
                    </label>
                    <input
                      type="text"
                      value={getSectionField('meditative_discipline', 'discipline_badge', 'The Meditative Discipline')}
                      onChange={(e) => updateSectionField('meditative_discipline', 'discipline_badge', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={getSectionField('meditative_discipline', 'discipline_title', 'Every Dot Placed with Breath, Patience & Devotion')}
                      onChange={(e) => updateSectionField('meditative_discipline', 'discipline_title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Intro Paragraph 1 (Mandala Meditation)
                    </label>
                    <textarea
                      rows={3}
                      value={getSectionField('meditative_discipline', 'discipline_intro_1', 'At DotAndArt, art is not merely decoration; it is a authentic meditation. Each dot mandala begins at the central Bindu — the spark of primordial consciousness — and blossoms outward in thousands of concentric, hand-dropped acrylic droplets.')}
                      onChange={(e) => updateSectionField('meditative_discipline', 'discipline_intro_1', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Intro Paragraph 2 (Lippan Tradition)
                    </label>
                    <textarea
                      rows={3}
                      value={getSectionField('meditative_discipline', 'discipline_intro_2', 'Our Lippan Kaam honors the pastoral tribes of Kutch, where hand-kneaded organic clay relief lines cradle gleaming hand-cut mirrors that reflect light and ward off negativity. No molds, no mass production — only singular handmade devotion.')}
                      onChange={(e) => updateSectionField('meditative_discipline', 'discipline_intro_2', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-theme-glass">
                  <p className="text-xs font-bold text-theme-accent uppercase mb-3">
                    4 Discipline Features
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                      <label className="block text-[11px] font-bold text-theme-primary">Feature 1</label>
                      <input
                        type="text"
                        value={getSectionField('meditative_discipline', 'feature_1_title', 'No Mechanization')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_1_title', e.target.value)}
                        placeholder="Title..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={getSectionField('meditative_discipline', 'feature_1_desc', 'Every circle, arc, and mirror placement is created manually using traditional dotting tools.')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_1_desc', e.target.value)}
                        placeholder="Description..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                      <label className="block text-[11px] font-bold text-theme-primary">Feature 2</label>
                      <input
                        type="text"
                        value={getSectionField('meditative_discipline', 'feature_2_title', 'Authentic Geometry')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_2_title', e.target.value)}
                        placeholder="Title..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={getSectionField('meditative_discipline', 'feature_2_desc', 'Designs rooted in ancient Vedic proportions that balance energy and harmony in living spaces.')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_2_desc', e.target.value)}
                        placeholder="Description..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                      <label className="block text-[11px] font-bold text-theme-primary">Feature 3</label>
                      <input
                        type="text"
                        value={getSectionField('meditative_discipline', 'feature_3_title', 'Weather Protective Seal')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_3_title', e.target.value)}
                        placeholder="Title..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={getSectionField('meditative_discipline', 'feature_3_desc', 'Coated with professional artist varnish to safeguard colors and mirrors against dust and humidity.')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_3_desc', e.target.value)}
                        placeholder="Description..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                      <label className="block text-[11px] font-bold text-theme-primary">Feature 4</label>
                      <input
                        type="text"
                        value={getSectionField('meditative_discipline', 'feature_4_title', 'Transit Safe Crate')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_4_title', e.target.value)}
                        placeholder="Title..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={getSectionField('meditative_discipline', 'feature_4_desc', 'Custom shock-absorbent multi-ply packaging ensures your delicate artwork arrives flawless.')}
                        onChange={(e) => updateSectionField('meditative_discipline', 'feature_4_desc', e.target.value)}
                        placeholder="Description..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: The Creation Process (4 Steps) */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">6</span>
                    <span>The 4-Step Creation Process</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    creation_process
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Process Badge
                    </label>
                    <input
                      type="text"
                      value={getSectionField('creation_process', 'process_badge', 'The Creation Process')}
                      onChange={(e) => updateSectionField('creation_process', 'process_badge', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-theme-primary text-xs mb-1">
                      Process Title
                    </label>
                    <input
                      type="text"
                      value={getSectionField('creation_process', 'process_title', 'How Each Piece Comes To Life')}
                      onChange={(e) => updateSectionField('creation_process', 'process_title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-theme-accent">Step 01</span>
                    </div>
                    <input
                      type="text"
                      value={getSectionField('creation_process', 'step_1_title', 'Base Preparation')}
                      onChange={(e) => updateSectionField('creation_process', 'step_1_title', e.target.value)}
                      placeholder="Step Title..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={getSectionField('creation_process', 'step_1_desc', 'Moisture-resistant MDF discs are precision-cut, sanded, primed, and coated in rich foundational base paint.')}
                      onChange={(e) => updateSectionField('creation_process', 'step_1_desc', e.target.value)}
                      placeholder="Step Description..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-theme-accent">Step 02</span>
                    </div>
                    <input
                      type="text"
                      value={getSectionField('creation_process', 'step_2_title', 'Symmetry & Geometry')}
                      onChange={(e) => updateSectionField('creation_process', 'step_2_title', e.target.value)}
                      placeholder="Step Title..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={getSectionField('creation_process', 'step_2_desc', 'Harmonious radial divisions are mapped outward from the central nucleus to guide dot placements.')}
                      onChange={(e) => updateSectionField('creation_process', 'step_2_desc', e.target.value)}
                      placeholder="Step Description..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-theme-accent">Step 03</span>
                    </div>
                    <input
                      type="text"
                      value={getSectionField('creation_process', 'step_3_title', 'Dotting & Detailing')}
                      onChange={(e) => updateSectionField('creation_process', 'step_3_title', e.target.value)}
                      placeholder="Step Title..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={getSectionField('creation_process', 'step_3_desc', 'Layer after layer of graduated paint droplets or hand-set mirrors are painted with steady presence.')}
                      onChange={(e) => updateSectionField('creation_process', 'step_3_desc', e.target.value)}
                      placeholder="Step Description..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-theme-card border border-theme-glass space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-theme-accent">Step 04</span>
                    </div>
                    <input
                      type="text"
                      value={getSectionField('creation_process', 'step_4_title', 'Sealing & Finishing')}
                      onChange={(e) => updateSectionField('creation_process', 'step_4_title', e.target.value)}
                      placeholder="Step Title..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                    />
                    <textarea
                      rows={3}
                      value={getSectionField('creation_process', 'step_4_desc', 'Artworks cure naturally before being sealed with protective varnish and fitted with mounting hardware.')}
                      onChange={(e) => updateSectionField('creation_process', 'step_4_desc', e.target.value)}
                      placeholder="Step Description..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Bottom Catalog CTA */}
              <div className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4">
                <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                  <h4 className="font-serif text-lg font-bold text-theme-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">7</span>
                    <span>Bottom Catalog CTA Button</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                    bottom_cta
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-theme-primary text-xs mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={getSectionField('bottom_cta', 'button_text', 'Explore Entire Product Catalog')}
                    onChange={(e) => updateSectionField('bottom_cta', 'button_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. OTHER PAGES (Custom Orders, Catalog, Gallery, etc.)    */}
          {/* ========================================================= */}
          {activePage.slug !== 'home' && activePage.slug !== 'contact' && activePage.slug !== 'faqs' && activePage.slug !== 'about' && (
            <div className="space-y-6">
              {activePage.sections?.map((section, sIdx) => {
                const content = section.content_json || {};
                return (
                  <div
                    key={section.id || sIdx}
                    className="p-6 rounded-2xl bg-theme-page border-2 border-theme-glass space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-theme-glass pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center font-bold text-xs">
                          {sIdx + 1}
                        </span>
                        <h4 className="font-serif text-lg font-bold text-theme-primary capitalize">
                          {section.section_key.replace(/_/g, ' ')}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent">
                        {section.section_type}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(content).map(([fKey, fVal]) => {
                        const isLong = typeof fVal === 'string' && (fVal.length > 70 || fVal.includes('\n'));
                        const isImage = typeof fVal === 'string' && (fKey.includes('image') || fKey.includes('img') || fVal.startsWith('/'));

                        return (
                          <div key={fKey} className="space-y-1">
                            <label className="block font-semibold text-theme-primary capitalize text-xs">
                              {fKey.replace(/_/g, ' ')}
                            </label>

                            {isImage ? (
                              <div className="flex items-center gap-3">
                                {typeof fVal === 'string' && (
                                  <img
                                    src={fVal}
                                    alt={fKey}
                                    className="w-16 h-16 object-cover rounded-xl border border-theme-glass shrink-0"
                                  />
                                )}
                                <input
                                  type="text"
                                  value={String(fVal ?? '')}
                                  onChange={(e) => updateSectionField(section.section_key, fKey, e.target.value)}
                                  className="flex-1 px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                                />
                              </div>
                            ) : isLong ? (
                              <textarea
                                rows={3}
                                value={String(fVal ?? '')}
                                onChange={(e) => updateSectionField(section.section_key, fKey, e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs resize-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={String(fVal ?? '')}
                                onChange={(e) => updateSectionField(section.section_key, fKey, e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* SEO & Search Meta Settings (Standard across all pages)    */}
          {/* ========================================================= */}
          <div className="p-6 rounded-2xl bg-theme-page border border-theme-glass space-y-4">
            <h4 className="font-serif text-base font-bold text-theme-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-theme-accent" />
              <span>Page Title &amp; SEO Meta Tags</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Page Title *</label>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => setActivePage({ ...activePage, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">SEO Title Tag (&lt;title&gt;)</label>
                <input
                  type="text"
                  value={activePage.seo_title || ''}
                  onChange={(e) => setActivePage({ ...activePage, seo_title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={activePage.meta_description || ''}
                onChange={(e) => setActivePage({ ...activePage, meta_description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
              />
            </div>
          </div>

          {/* Bottom Save & Publish Button */}
          <div className="pt-4 border-t border-theme-glass flex items-center justify-between">
            <p className="text-xs text-theme-muted">
              Click &quot;Save &amp; Publish Changes&quot; to apply all edits directly to the live website.
            </p>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="px-6 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Publish Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
