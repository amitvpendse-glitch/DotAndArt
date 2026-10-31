import React, { useState, useEffect } from 'react';
import { FloatingSaveButton } from './FloatingSaveButton';
import { Save, CheckCircle2, AlertCircle, UploadCloud, ImageIcon, Plus, Trash2, MapPin, Sliders, Database, Sparkles } from 'lucide-react';
import { WebsiteSettings, Product, ShowcaseBannerHotspot } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { setActiveWhatsAppNumber } from '../utils/whatsapp';
import { compressImageFile } from '../utils/imageCompressor';
import { uploadImageToSupabaseStorage, saveFirestoreSettings, cleanupUnusedSupabaseStorageImages } from '../lib/firestoreCatalog';

interface AdminSettingsProps {
  token: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ token }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cleaningStorage, setCleaningStorage] = useState(false);
  const [storageResult, setStorageResult] = useState<{ success: boolean; message: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [settingsData, prodData] = await Promise.all([
          safeFetchJson<WebsiteSettings | null>('/api/admin/settings', {
            headers: { Authorization: `Bearer ${token}` },
          }, null),
          safeFetchJson<{ products: Product[] }>('/api/products', undefined, { products: [] }),
        ]);

        if (settingsData) {
          setSettings(settingsData);
          setIsDirty(false);
        }
        if (prodData?.products) setProducts(prodData.products);
      } catch (err) {
        console.error('Error loading settings/products', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await saveFirestoreSettings(settings).catch((err) => console.warn('[AdminSettings] Direct Supabase DB save warning:', err));

      const data = await safeFetchJson<any>(
        '/api/admin/settings',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        },
        null
      );

      if (data) {
        if (data.whatsapp_number) {
          setActiveWhatsAppNumber(data.whatsapp_number, data.whatsapp_display);
        }
        window.dispatchEvent(new CustomEvent('app_settings_updated', { detail: data }));
        window.dispatchEvent(new Event('app_pages_updated'));
        setIsDirty(false);
        setSuccessMsg('Website settings, badges, and configuration updated successfully.');
      } else {
        setErrorMsg('Failed to update website settings.');
      }
    } catch {
      setErrorMsg('Network error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleBannerImageUpload = async (file: File) => {
    if (!settings) return;
    setUploadingImage(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const compressed = await compressImageFile(file);
      let filePath = '';

      // 1. Direct client-side upload to Supabase Storage
      try {
        const uploadResult = await uploadImageToSupabaseStorage(compressed, 'banner-3d', file.name);
        if (uploadResult.success && uploadResult.public_url) {
          filePath = uploadResult.public_url;
        }
      } catch (sbErr) {
        console.warn('[AdminSettings] Supabase upload exception:', sbErr);
      }

      // 2. Fallback via safeFetchJson
      if (!filePath) {
        const formData = new FormData();
        formData.append('file', compressed);
        const data = await safeFetchJson<{ success?: boolean; file_path?: string; public_url?: string; error?: string }>(
          '/api/uploads',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          },
          null
        );
        filePath = data?.public_url || data?.file_path || '';
      }

      if (filePath) {
        setSettings({
          ...settings,
          featured_3d_image: filePath,
        });
        setIsDirty(true);
        setSuccessMsg('New 3D Banner Image compressed & uploaded! Click "Save All Settings" to apply globally.');
      } else {
        setErrorMsg('Failed to upload banner image file.');
      }
    } catch (err) {
      setErrorMsg('Error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStorageCleanup = async () => {
    setCleaningStorage(true);
    setStorageResult(null);
    try {
      const res = await cleanupUnusedSupabaseStorageImages('product-images');
      setStorageResult(res);
    } catch (err: any) {
      setStorageResult({
        success: false,
        message: err?.message || 'Error executing storage cleanup.',
      });
    } finally {
      setCleaningStorage(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-xs text-theme-muted">
        <div className="w-8 h-8 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p>Loading website settings & 3D banner config...</p>
      </div>
    );
  }

  const selectedProduct = (products || []).find((p) => p.sku === (settings.featured_3d_sku || 'DA-MD-24-0001'));
  const currentBannerImage = settings.featured_3d_image || selectedProduct?.images?.[0]?.storage_path || `/static/assets/images/${settings.featured_3d_sku || 'DA-MD-24-0001'}.jpg`;

  return (
    <div className="space-y-6 max-w-4xl text-theme-primary">
      <FloatingSaveButton 
        onSave={() => handleSave()} 
        isSaving={saving} 
        isDirty={isDirty}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">Website Global Settings</h2>
          <p className="text-xs text-theme-muted">
            Manage studio business information, ordering WhatsApp number, 3D banner artwork, and payment terms.
          </p>
        </div>

        <button
          type="button"
          disabled={!isDirty || saving}
          onClick={() => handleSave()}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
            !isDirty
              ? 'bg-stone-500/20 text-stone-400 dark:text-stone-500 cursor-not-allowed border border-white/10'
              : 'bg-[#C85A32] hover:bg-[#A03E1B] text-white cursor-pointer shadow-md transform hover:-translate-y-0.5'
          }`}
          title={!isDirty ? 'No unsaved edits' : 'Click to save settings to database'}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving to Cloud...</span>
            </>
          ) : !isDirty ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
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

      <form
        onSubmit={handleSave}
        onChange={() => setIsDirty(true)}
        className="glass-card p-6 sm:p-8 rounded-3xl border border-theme-glass craft-shadow space-y-8 text-xs text-theme-primary"
      >
        {/* 1. Homepage Showcase Banner Artwork & Details Configuration */}
        <div className="space-y-6 p-5 sm:p-6 rounded-2xl bg-theme-page border border-theme-glass">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-theme-accent shrink-0" />
            <h3 className="font-serif text-base font-bold text-theme-primary uppercase tracking-wider">
              1. Homepage Hero Showcase Banner Artwork & Details
            </h3>
          </div>
          <p className="text-xs text-theme-muted">
            Customize the primary artwork banner image, headline, eyebrow badge, specifications, and pricing displayed at the very top of your store home page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
            {/* Image Preview Box */}
            <div className="md:col-span-4 space-y-2 text-center">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-accent">
                Active Hero Banner Image
              </span>
              <div className="relative w-48 h-48 mx-auto rounded-2xl p-1 bg-gradient-to-tr from-amber-500/40 to-theme-accent/60 shadow-lg overflow-hidden border border-theme-glass">
                <img
                  src={
                    settings.showcase_banner?.image_url ||
                    settings.featured_3d_image ||
                    '/static/assets/images/DA-MD-24-0002.jpg'
                  }
                  alt="Showcase Banner Artwork"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
              </div>
              <p className="text-[10px] text-theme-muted font-mono">
                Linked Product Code: {settings.showcase_banner?.product_sku || 'DA-MD-24-0002'}
              </p>
            </div>

            {/* Banner Image & Product Code Link Controls */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">
                  Connect Catalog Product Code:
                </label>
                <select
                  value={settings.showcase_banner?.product_sku || 'DA-MD-24-0002'}
                  onChange={(e) => {
                    const newSku = e.target.value;
                    const prod = (products || []).find((p) => p.sku === newSku);
                    const prodImg = prod?.images?.[0]?.storage_path || `/static/assets/images/${newSku}.jpg`;
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        title: settings.showcase_banner?.title || prod?.name || 'Authentic Harmony',
                        eyebrow: settings.showcase_banner?.eyebrow || 'Monumental 24-Inch Showcase',
                        description: settings.showcase_banner?.description || prod?.description || '',
                        short_description: settings.showcase_banner?.short_description || prod?.short_description || '',
                        image_url: prodImg,
                        product_sku: newSku,
                        price: prod?.base_price || 5200,
                        size: prod?.base_size || '24 inches',
                        material: prod?.material || 'MDF Board, Acrylic Colors, Mirrors, Varnish',
                        creation_time: prod?.creation_time || '8 Days',
                        shipping_info: prod?.shipping_info || 'All over the world',
                        badge_text: '100% Handcrafted Original',
                        hotspots: settings.showcase_banner?.hotspots,
                      },
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-theme-card border border-theme-glass text-theme-primary font-semibold text-xs cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku} className="bg-theme-page text-theme-primary">
                      {p.sku} — {p.name} (₹{p.base_price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">
                  Custom Banner Image File or URL:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={settings.showcase_banner?.image_url || ''}
                    placeholder="/uploads/hero-banner.jpg or https://..."
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        showcase_banner: {
                          ...settings.showcase_banner,
                          image_url: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass font-mono text-xs text-theme-primary"
                  />

                  <label className="px-4 py-2 rounded-xl bg-theme-accent/20 hover:bg-theme-accent/30 border border-theme-glass text-theme-accent font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleBannerImageUpload(e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Text Details Form */}
          <div className="space-y-4 pt-4 border-t border-theme-glass">
            <h4 className="font-bold text-xs uppercase tracking-wider text-theme-accent">
              Hero Banner Headline & Content Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Banner Headline / Title</label>
                <input
                  type="text"
                  value={settings.showcase_banner?.title || ''}
                  placeholder="Authentic Harmony — 24-Inch Dot Mandala Wall Hanging"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        ...settings.showcase_banner,
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary font-serif font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Eyebrow Badge Text</label>
                <input
                  type="text"
                  value={settings.showcase_banner?.eyebrow || ''}
                  placeholder="Monumental 24-Inch Showcase"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        ...settings.showcase_banner,
                        eyebrow: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={settings.showcase_banner?.price || 5200}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        ...settings.showcase_banner,
                        price: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass font-bold text-theme-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Size Label</label>
                <input
                  type="text"
                  value={settings.showcase_banner?.size || ''}
                  placeholder="24 inches"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        ...settings.showcase_banner,
                        size: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Creation Lead Time</label>
                <input
                  type="text"
                  value={settings.showcase_banner?.creation_time || ''}
                  placeholder="8 Days"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        ...settings.showcase_banner,
                        creation_time: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">Materials Specification</label>
                <input
                  type="text"
                  value={settings.showcase_banner?.material || ''}
                  placeholder="MDF Board, Acrylic Colors, Mirrors, Varnish"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        ...settings.showcase_banner,
                        material: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary mb-1">Shipping Note</label>
                <input
                  type="text"
                  value={settings.showcase_banner?.shipping_info || ''}
                  placeholder="All over the world (Bubble wrap and corrugated box)"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        ...settings.showcase_banner,
                        shipping_info: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Short Tagline</label>
              <input
                type="text"
                value={settings.showcase_banner?.short_description || ''}
                placeholder="Monumental 24-inch handcrafted authentic dot mandala with shimmering mirrors..."
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showcase_banner: {
                      ...settings.showcase_banner,
                      short_description: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Full Detailed Story / Description</label>
              <textarea
                rows={4}
                value={settings.showcase_banner?.description || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    showcase_banner: {
                      ...settings.showcase_banner,
                      description: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary leading-relaxed"
              />
            </div>

            {/* Banner Image Pins (Hotspots) Customization Section */}
            <div className="pt-4 border-t border-theme-glass space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-serif text-sm font-bold text-theme-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-theme-accent" />
                    <span>Homepage Banner Image Pins (Hotspots)</span>
                  </h4>
                  <p className="text-[11px] text-theme-muted">
                    Configure interactive hotspot pins placed directly on the homepage hero banner. Controlled exclusively from this admin console (hidden from visitors to toggle).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-theme-primary bg-theme-page px-3 py-1.5 rounded-xl border border-theme-glass">
                    <input
                      type="checkbox"
                      checked={settings.showcase_banner?.pins_enabled !== false}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          showcase_banner: {
                            ...settings.showcase_banner,
                            pins_enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-theme-accent cursor-pointer"
                    />
                    <span>Show Pins on Banner</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const currentPins = settings.showcase_banner?.pins || settings.showcase_banner?.hotspots || [
                        { id: 'mirrors', x: 65, y: 35, title: 'Precision Mirror Inlays', tag: 'Light Reflection', description: 'Concentric hand-embedded mirrors that playfully catch daylight and evening illumination.' },
                        { id: 'color-gradients', x: 35, y: 65, title: 'Deep Pigment Layering', tag: 'Artisan Technique', description: 'Graduated teal, mystical indigo, metallic bronze, and gold artist acrylics.' },
                        { id: 'outer-rim', x: 78, y: 72, title: '24-Inch Sealed Diameter', tag: 'Moisture-Proof Base', description: 'Rigid 8mm moisture-resistant MDF board, hand-sanded with flush rear hook and gloss varnish.' },
                      ];
                      const newPin: ShowcaseBannerHotspot = {
                        id: `pin-${Date.now()}`,
                        x: 50,
                        y: 50,
                        title: 'New Focal Detail',
                        tag: 'Craft Detail',
                        description: 'Description of this handmade artwork detail or technique.',
                      };
                      setSettings({
                        ...settings,
                        showcase_banner: {
                          ...settings.showcase_banner,
                          pins: [...currentPins, newPin],
                          hotspots: [...currentPins, newPin],
                        },
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer hover:opacity-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pin</span>
                  </button>
                </div>
              </div>

              {/* Pins Editor Cards */}
              <div className="space-y-3">
                {(
                  settings.showcase_banner?.pins ||
                  settings.showcase_banner?.hotspots || [
                    { id: 'mirrors', x: 65, y: 35, title: 'Precision Mirror Inlays', tag: 'Light Reflection', description: 'Concentric hand-embedded mirrors that playfully catch daylight and evening illumination.' },
                    { id: 'color-gradients', x: 35, y: 65, title: 'Deep Pigment Layering', tag: 'Artisan Technique', description: 'Graduated teal, mystical indigo, metallic bronze, and gold artist acrylics.' },
                    { id: 'outer-rim', x: 78, y: 72, title: '24-Inch Sealed Diameter', tag: 'Moisture-Proof Base', description: 'Rigid 8mm moisture-resistant MDF board, hand-sanded with flush rear hook and gloss varnish.' },
                  ]
                ).map((pin, idx) => (
                  <div
                    key={pin.id || idx}
                    className="p-3.5 rounded-2xl bg-theme-page/80 border border-theme-glass space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-theme-primary">
                        <span className="w-5 h-5 rounded-full bg-theme-accent text-white flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{pin.title || `Pin ${idx + 1}`}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const currentPins = settings.showcase_banner?.pins || settings.showcase_banner?.hotspots || [];
                          const updated = currentPins.filter((_, i) => i !== idx);
                          setSettings({
                            ...settings,
                            showcase_banner: {
                              ...settings.showcase_banner,
                              pins: updated,
                              hotspots: updated,
                            },
                          });
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 cursor-pointer"
                        title="Delete Pin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-theme-muted mb-0.5">Pin Title</label>
                        <input
                          type="text"
                          value={pin.title}
                          onChange={(e) => {
                            const currentPins = [...(settings.showcase_banner?.pins || settings.showcase_banner?.hotspots || [])];
                            currentPins[idx] = { ...currentPins[idx], title: e.target.value };
                            setSettings({
                              ...settings,
                              showcase_banner: { ...settings.showcase_banner, pins: currentPins, hotspots: currentPins },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-theme-card border border-theme-glass text-theme-primary text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-theme-muted mb-0.5">Category Tag</label>
                        <input
                          type="text"
                          value={pin.tag}
                          onChange={(e) => {
                            const currentPins = [...(settings.showcase_banner?.pins || settings.showcase_banner?.hotspots || [])];
                            currentPins[idx] = { ...currentPins[idx], tag: e.target.value };
                            setSettings({
                              ...settings,
                              showcase_banner: { ...settings.showcase_banner, pins: currentPins, hotspots: currentPins },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-theme-card border border-theme-glass text-theme-primary text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-theme-muted mb-0.5">X Position (%: 0–100)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={pin.x}
                          onChange={(e) => {
                            const currentPins = [...(settings.showcase_banner?.pins || settings.showcase_banner?.hotspots || [])];
                            currentPins[idx] = { ...currentPins[idx], x: Number(e.target.value) || 0 };
                            setSettings({
                              ...settings,
                              showcase_banner: { ...settings.showcase_banner, pins: currentPins, hotspots: currentPins },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-theme-card border border-theme-glass text-theme-primary text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-theme-muted mb-0.5">Y Position (%: 0–100)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={pin.y}
                          onChange={(e) => {
                            const currentPins = [...(settings.showcase_banner?.pins || settings.showcase_banner?.hotspots || [])];
                            currentPins[idx] = { ...currentPins[idx], y: Number(e.target.value) || 0 };
                            setSettings({
                              ...settings,
                              showcase_banner: { ...settings.showcase_banner, pins: currentPins, hotspots: currentPins },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-theme-card border border-theme-glass text-theme-primary text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-theme-muted mb-0.5">Description</label>
                      <input
                        type="text"
                        value={pin.description}
                        onChange={(e) => {
                          const currentPins = [...(settings.showcase_banner?.pins || settings.showcase_banner?.hotspots || [])];
                          currentPins[idx] = { ...currentPins[idx], description: e.target.value };
                          setSettings({
                            ...settings,
                            showcase_banner: { ...settings.showcase_banner, pins: currentPins, hotspots: currentPins },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-theme-card border border-theme-glass text-theme-primary text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Brand Identity & Primary Ordering WhatsApp */}
        <div className="space-y-4 pt-4 border-t border-theme-glass">
          <h3 className="font-serif text-base font-bold text-theme-accent uppercase tracking-wider">
            2. Brand Identity & Primary Ordering WhatsApp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-theme-primary mb-1">Business Name</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-theme-primary mb-1">Primary WhatsApp Number *</label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="+91 8652162647"
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass font-semibold text-theme-accent"
              />
              <span className="text-[10px] text-theme-muted">All customer orders and quotations route to this number.</span>
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Website Domain</label>
              <input
                type="text"
                value={settings.domain}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
              />
            </div>
          </div>
        </div>

        {/* 3. Social Channels & Contact */}
        <div className="space-y-4 pt-4 border-t border-theme-glass">
          <h3 className="font-serif text-base font-bold text-theme-accent uppercase tracking-wider">
            3. Social Profiles & Studio Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-theme-primary mb-1">Instagram Profile URL</label>
              <input
                type="text"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Facebook Profile URL</label>
              <input
                type="text"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-theme-primary mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Studio Address</label>
              <input
                type="text"
                value={settings.studio_address}
                onChange={(e) => setSettings({ ...settings, studio_address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary"
              />
            </div>
          </div>
        </div>

        {/* 4. Policies and Announcement Banner */}
        <div className="space-y-4 pt-4 border-t border-theme-glass">
          <h3 className="font-serif text-base font-bold text-theme-accent uppercase tracking-wider">
            4. Announcement Banner & Payment Policy
          </h3>

          <div className="p-4 rounded-2xl bg-theme-page border border-theme-glass space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="annCheck"
                checked={settings.announcement_banner.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement_banner: {
                      ...settings.announcement_banner,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="rounded text-theme-accent cursor-pointer"
              />
              <label htmlFor="annCheck" className="font-semibold text-theme-primary cursor-pointer">
                Show Announcement Bar on Website Header
              </label>
            </div>

            <div>
              <label className="block font-semibold text-theme-primary mb-1">Announcement Text</label>
              <input
                type="text"
                value={settings.announcement_banner.text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement_banner: {
                      ...settings.announcement_banner,
                      text: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-theme-primary mb-1">Standard Payment Terms</label>
            <textarea
              rows={2}
              value={settings.payment_terms}
              onChange={(e) => setSettings({ ...settings, payment_terms: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary resize-none"
            />
          </div>
        </div>

        {/* 5. Artwork Images Available Badge Settings */}
        <div className="space-y-4 pt-4 border-t border-theme-glass">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-theme-accent uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>5. Artwork Images "Available" Badge Global Settings</span>
            </h3>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              Global Default
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-theme-page border border-theme-glass space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showBadgesCheck"
                checked={settings.show_available_badges !== false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    show_available_badges: e.target.checked,
                  })
                }
                className="rounded text-theme-accent cursor-pointer"
              />
              <label htmlFor="showBadgesCheck" className="font-semibold text-theme-primary cursor-pointer text-xs">
                Enable "Available" badge across all artwork images (Catalog, Homepage, Gallery, Lightbox)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-theme-primary text-xs mb-1">
                  Default "Available" Badge Label Text
                </label>
                <input
                  type="text"
                  value={settings.available_badge_default_text || 'Available'}
                  placeholder="e.g. Available, Available to Order"
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      available_badge_default_text: e.target.value,
                    });
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary text-xs mb-1">
                  Default "Made to Order" / Unavailable Badge Label
                </label>
                <input
                  type="text"
                  value={settings.unavailable_badge_default_text || 'Made to Order'}
                  placeholder="e.g. Made to Order, Custom Order"
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      unavailable_badge_default_text: e.target.value,
                    });
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary text-xs mb-1">
                  Authenticity Trust Badge
                </label>
                <input
                  type="text"
                  value={settings.artisan_badge_text || 'Original Studio Photography • 100% Non-AI Guarantee'}
                  placeholder="e.g. 100% Non-AI Guarantee"
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      artisan_badge_text: e.target.value,
                    });
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-primary text-xs mb-1">
                  Shipping Badge
                </label>
                <input
                  type="text"
                  value={settings.shipping_badge_text || 'Worldwide Safe Courier Shipping'}
                  placeholder="e.g. Worldwide Shipping"
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      shipping_badge_text: e.target.value,
                    });
                    setIsDirty(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-theme-card border border-theme-glass text-theme-primary text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. Supabase Storage Maintenance & Garbage Collector */}
        <div className="space-y-4 pt-4 border-t border-theme-glass">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-theme-accent uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-theme-accent" />
              <span>6. Supabase Storage Maintenance &amp; Garbage Collector</span>
            </h3>
            <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full">
              Automated Bucket Cleanup
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-theme-page border border-theme-glass space-y-4">
            <div>
              <h4 className="font-bold text-xs text-theme-primary mb-1">
                Purge Unused &amp; Orphaned Bucket Images
              </h4>
              <p className="text-xs text-theme-muted leading-relaxed">
                When product images or banners are repeatedly updated, old image files remain stored inside your Supabase Storage bucket (<code className="font-mono text-[11px] text-theme-accent">product-images</code>). Click below to automatically scan all active catalog products, testimonials, and CMS pages, and permanently purge any orphaned images to free up bucket quota.
              </p>
            </div>

            {storageResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  storageResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300'
                }`}
              >
                {storageResult.success ? (
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span>{storageResult.message}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={cleaningStorage}
                onClick={handleStorageCleanup}
                className="px-5 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                {cleaningStorage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Scanning &amp; Purging Orphan Images...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Purge Unused Bucket Images Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-theme-glass flex items-center justify-between">
          <span className="text-[11px] text-theme-muted">
            {isDirty ? 'Unsaved settings detected' : 'All settings saved to database'}
          </span>
          <button
            type="submit"
            disabled={!isDirty || saving}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all ${
              !isDirty
                ? 'bg-stone-500/20 text-stone-400 dark:text-stone-500 cursor-not-allowed border border-white/10'
                : 'bg-[#C85A32] hover:bg-[#A03E1B] text-white cursor-pointer shadow-md transform hover:-translate-y-0.5'
            }`}
            title={!isDirty ? 'No unsaved edits' : 'Click to save settings to database'}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Cloud...</span>
              </>
            ) : !isDirty ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
