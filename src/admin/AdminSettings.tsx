import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Sparkles, UploadCloud, ImageIcon } from 'lucide-react';
import { WebsiteSettings, Product } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';

interface AdminSettingsProps {
  token: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ token }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

        if (settingsData) setSettings(settingsData);
        if (prodData?.products) setProducts(prodData.products);
      } catch (err) {
        console.error('Error loading settings/products', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
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
        setSuccessMsg('Website settings and 3D Banner configuration updated successfully.');
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
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await safeResponseJson(res, {});
      if (res.ok && data.url) {
        setSettings({
          ...settings,
          featured_3d_image: data.url,
        });
        setSuccessMsg('New 3D Banner Image uploaded! Click "Save All Settings" to apply globally.');
      } else {
        setErrorMsg(data?.error || 'Failed to upload banner image file.');
      }
    } catch (err) {
      setErrorMsg('Error uploading image.');
    } finally {
      setUploadingImage(false);
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

  const selectedProduct = products.find((p) => p.sku === (settings.featured_3d_sku || 'DA-MD-24-0001'));
  const currentBannerImage = settings.featured_3d_image || selectedProduct?.images?.[0]?.storage_path || `/static/assets/images/${settings.featured_3d_sku || 'DA-MD-24-0001'}.jpg`;

  return (
    <div className="space-y-6 max-w-4xl text-theme-primary">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">Website Global Settings</h2>
          <p className="text-xs text-theme-muted">
            Manage studio business information, ordering WhatsApp number, 3D banner artwork, and payment terms.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
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

      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-theme-glass craft-shadow space-y-8 text-xs text-theme-primary">
        {/* 1. Homepage Showcase Banner Artwork & Details Configuration */}
        <div className="space-y-6 p-5 sm:p-6 rounded-2xl bg-theme-page border border-theme-glass">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-theme-accent shrink-0" />
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
                Linked SKU: {settings.showcase_banner?.product_sku || 'DA-MD-24-0002'}
              </p>
            </div>

            {/* Banner Image & SKU Link Controls */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">
                  Connect Catalog Product SKU:
                </label>
                <select
                  value={settings.showcase_banner?.product_sku || 'DA-MD-24-0002'}
                  onChange={(e) => {
                    const newSku = e.target.value;
                    const prod = products.find((p) => p.sku === newSku);
                    const prodImg = prod?.images?.[0]?.storage_path || `/static/assets/images/${newSku}.jpg`;
                    setSettings({
                      ...settings,
                      showcase_banner: {
                        title: settings.showcase_banner?.title || prod?.name || 'Sacred Harmony',
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
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleBannerImageUpload(e.target.files[0]);
                        }
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
                  placeholder="Sacred Harmony — 24-Inch Dot Mandala Wall Hanging"
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
                placeholder="Monumental 24-inch handcrafted sacred dot mandala with shimmering mirrors..."
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

        <div className="pt-4 border-t border-theme-glass flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white font-semibold shadow-xs cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
