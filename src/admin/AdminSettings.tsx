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
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
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
  const currentBannerImage = settings.featured_3d_image || selectedProduct?.images?.[0]?.storage_path || `/public/static/assets/images/${settings.featured_3d_sku || 'DA-MD-24-0001'}.jpg`;

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
        {/* 1. Featured 3D Masterpiece Banner Artwork Configuration */}
        <div className="space-y-4 p-5 rounded-2xl bg-theme-page border border-theme-glass">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-theme-accent shrink-0" />
            <h3 className="font-serif text-base font-bold text-theme-primary uppercase tracking-wider">
              1. Featured 3D Masterpiece Banner Artwork
            </h3>
          </div>
          <p className="text-xs text-theme-muted">
            Configure which artwork piece or custom image is rendered inside the interactive 3D Showcase Banner on the Home Page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
            {/* Image Preview Box */}
            <div className="md:col-span-4 space-y-2 text-center">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-theme-accent">
                Current 3D Banner Preview
              </span>
              <div className="relative w-40 h-40 mx-auto rounded-full p-1 bg-gradient-to-tr from-theme-accent/60 to-amber-200/40 shadow-md overflow-hidden">
                <img
                  src={currentBannerImage}
                  alt="3D Banner Artwork"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
              </div>
              <p className="text-[10px] text-theme-muted font-mono">
                Active SKU: {settings.featured_3d_sku || 'DA-MD-24-0001'}
              </p>
            </div>

            {/* Selector & Upload Form */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block font-semibold text-theme-primary mb-1">
                  Select Featured Artwork Product from Catalog:
                </label>
                <select
                  value={settings.featured_3d_sku || 'DA-MD-24-0001'}
                  onChange={(e) => {
                    const newSku = e.target.value;
                    const prod = products.find((p) => p.sku === newSku);
                    const prodImg = prod?.images?.[0]?.storage_path || `/public/static/assets/images/${newSku}.jpg`;
                    setSettings({
                      ...settings,
                      featured_3d_sku: newSku,
                      featured_3d_image: prodImg,
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
                  Or Upload Custom 3D Banner Artwork Image File:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={settings.featured_3d_image || ''}
                    placeholder="/uploads/my-3d-banner.jpg or https://..."
                    onChange={(e) => setSettings({ ...settings, featured_3d_image: e.target.value })}
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
