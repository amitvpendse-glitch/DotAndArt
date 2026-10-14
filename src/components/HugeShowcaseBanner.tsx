import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Eye,
  ShoppingBag,
  X,
  Check,
  ShieldCheck,
  Truck,
  Clock,
  Layers,
  Home,
  Info,
  Maximize2,
  Compass,
  Edit,
  UploadCloud,
  Save,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { Product, WebsiteSettings } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import {
  dispatchDirectWhatsAppOrder,
  formatSingleProductEnquiry,
  collectAttachmentsForProduct,
  WhatsAppAttachmentItem,
} from '../utils/whatsapp';
import { WhatsAppAttachmentModal } from './WhatsAppAttachmentModal';

interface HugeShowcaseBannerProps {
  onSelectProduct: (sku: string) => void;
  onNavigate: (path: string) => void;
}

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  title: string;
  tag: string;
  description: string;
}

const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    id: 'mirrors',
    x: 65,
    y: 35,
    title: 'Precision Mirror Inlays',
    tag: 'Light Reflection',
    description:
      'Concentric hand-embedded mirrors that playfully catch daylight and evening room illumination.',
  },
  {
    id: 'color-gradients',
    x: 35,
    y: 65,
    title: 'Deep Pigment Layering',
    tag: 'Artisan Technique',
    description:
      'Graduated teal, mystical indigo, metallic bronze, and gold heavy-body artist acrylics.',
  },
  {
    id: 'outer-rim',
    x: 78,
    y: 72,
    title: '24-Inch Sealed Diameter',
    tag: 'Moisture-Proof Base',
    description:
      'Rigid 8mm moisture-resistant MDF board, hand-sanded with flush rear hook and gloss protective varnish.',
  },
];

const LIVING_SPACES = [
  {
    title: 'Living Room Centerpiece',
    icon: '🛋️',
    description: 'Perfect 24-inch commanding focal point mounted above a 3-seater sofa or credenza.',
    heightNote: 'Hang at eye-level (58–60 inches from floor)',
  },
  {
    title: 'Pooja & Meditation Altar',
    icon: '🕉️',
    description: 'Fosters serene concentration and brings harmonious sacred energy into prayer rooms.',
    heightNote: 'Centered directly behind or above the sanctum altar',
  },
  {
    title: 'Foyer & Entryway Console',
    icon: '🚪',
    description: 'Welcomes guests and family with reflective auspicious blessings and handmade warmth.',
    heightNote: 'Position 8–10 inches above entryway table',
  },
];

const FALLBACK_PRODUCT: Product = {
  id: 'prod-artist-shital',
  sku: 'ARTIST-SHITAL',
  name: 'Shital Thosar — Sacred Geometry & Handmade Mandala Art',
  short_description:
    'Crafting serene dot mandalas and traditional Lippan Kaam mirror art with deep devotion and precision.',
  description:
    'Shital Thosar is a visionary Indian artisan specializing in sacred Dot Mandalas and traditional Gujarati Lippan Kaam mirror art. Handcrafted on moisture-resistant MDF board with heavy-body acrylics, light-reflecting mirrors, and protective varnish, her creations bring spiritual harmony, positive energy, and radiant warmth into modern homes across the globe.',
  category_id: 'cat-mandala',
  category_name: 'Handcrafted Sacred Art',
  category_slug: 'mandala-wall-hangings',
  material: 'MDF Board, Lippan Clay Relief, Acrylics, Mirrors, Varnish',
  framing: '',
  customizable: true,
  creation_time: 'Handmade on Order',
  shipping_info: 'Worldwide Insured Express Delivery',
  special_information:
    'Clean gently with a soft dry microfiber cloth.',
  featured: true,
  is_published: true,
  photos_available_note: 'Yes',
  base_price: 0,
  base_size: 'Custom Sizes Available',
  images: [
    {
      id: 'img-artist-shital-1',
      product_id: 'prod-artist-shital',
      storage_path: '/static/assets/images/Art_artist.jpg',
      alt_text: 'Artist Shital Thosar with Sacred Mandala Art',
      caption: 'Artist Shital Thosar with Sacred Mandala Art',
      display_order: 1,
      is_primary: true,
    },
  ],
  variants: [],
  created_at: new Date('2025-01-01').toISOString(),
  updated_at: new Date('2025-01-01').toISOString(),
};

export const HugeShowcaseBanner: React.FC<HugeShowcaseBannerProps> = ({
  onSelectProduct,
  onNavigate,
}) => {
  const { theme } = useTheme();
  const { addToCart, getItemQuantity } = useCart();

  const [product, setProduct] = useState<Product>(FALLBACK_PRODUCT);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'story' | 'craft' | 'space'>('story');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(DEFAULT_HOTSPOTS[0]);
  const [showHotspots, setShowHotspots] = useState(true);

  // Admin Quick Edit Modal State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState({
    title: '',
    eyebrow: '',
    short_description: '',
    description: '',
    image_url: '',
    product_sku: '',
    price: 5200,
    size: '24 inches',
    material: 'MDF Board, Acrylic Colors, Mirrors, Varnish',
    creation_time: '8 Days',
    shipping_info: 'All over the world (Bubble wrap and corrugated box)',
    badge_text: '100% Handcrafted Original',
  });
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bannerSaveSuccess, setBannerSaveSuccess] = useState('');
  const [bannerSaveError, setBannerSaveError] = useState('');

  // Full-View Modal State
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // WhatsApp Attachment Modal State
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [preparedEnquiry, setPreparedEnquiry] = useState<{
    msg: string;
    attachments: WhatsAppAttachmentItem[];
  }>({ msg: '', attachments: [] });

  // Detect admin token
  useEffect(() => {
    const token = localStorage.getItem('dot_admin_token') || localStorage.getItem('admin_token');
    if (token) {
      setIsAdmin(true);
      setAdminToken(token);
    }
  }, []);

  // Fetch settings & product catalog
  const loadBannerSettings = async () => {
    try {
      const [settingsRes, prodsRes] = await Promise.all([
        safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null),
        safeFetchJson<{ products: Product[] }>('/api/products', undefined, { products: [] }),
      ]);

      if (settingsRes) {
        setSettings(settingsRes);
      }

      const allProducts = prodsRes?.products || [];
      setProductsList(allProducts);

      const targetSku = settingsRes?.showcase_banner?.product_sku || 'DA-MD-24-0002';
      const found = allProducts.find((p) => p.sku === targetSku);
      if (found) {
        setProduct({
          ...found,
          images: found.images && found.images.length > 0 ? found.images : FALLBACK_PRODUCT.images,
        });
      }
    } catch (err) {
      console.error('Failed to load showcase banner data', err);
    }
  };

  useEffect(() => {
    loadBannerSettings();
  }, []);

  // Effective banner values from admin settings or fallbacks
  const bannerConfig = settings?.showcase_banner;
  const imageSrc =
    bannerConfig?.image_url ||
    product.images?.find((i) => i.is_primary)?.storage_path ||
    product.images?.[0]?.storage_path ||
    '/static/assets/images/DA-MD-24-0002.jpg';

  const bannerTitle = bannerConfig?.title || product.name || 'Sacred Harmony — 24-Inch Dot Mandala Wall Hanging';
  const bannerEyebrow = bannerConfig?.eyebrow || 'Monumental 24-Inch Showcase';
  const bannerSku = bannerConfig?.product_sku || product.sku || 'DA-MD-24-0002';
  const bannerPrice = bannerConfig?.price ?? product.base_price ?? 5200;
  const bannerSize = bannerConfig?.size || product.base_size || '24 inches';
  const bannerMaterial = bannerConfig?.material || product.material || 'MDF Board, Acrylic Colors, Mirrors, Varnish';
  const bannerCreationTime = bannerConfig?.creation_time || product.creation_time || '8 Days';
  const bannerShippingInfo = bannerConfig?.shipping_info || product.shipping_info || 'All over the world (Bubble wrap and corrugated box)';
  const bannerShortDesc = bannerConfig?.short_description || product.short_description || 'Monumental 24-inch handcrafted sacred dot mandala with shimmering mirrors and protective varnish.';
  const bannerFullDesc = bannerConfig?.description || product.description || 'An awe-inspiring 24-inch handcrafted sacred dot mandala wall hanging...';
  const bannerBadgeText = bannerConfig?.badge_text || '100% Handcrafted Original';
  const hotspotsList = bannerConfig?.hotspots || DEFAULT_HOTSPOTS;

  // Initialize edit modal state when opening
  const handleOpenAdminEdit = () => {
    setEditingBanner({
      title: bannerTitle,
      eyebrow: bannerEyebrow,
      short_description: bannerShortDesc,
      description: bannerFullDesc,
      image_url: imageSrc,
      product_sku: bannerSku,
      price: bannerPrice,
      size: bannerSize,
      material: bannerMaterial,
      creation_time: bannerCreationTime,
      shipping_info: bannerShippingInfo,
      badge_text: bannerBadgeText,
    });
    setBannerSaveSuccess('');
    setBannerSaveError('');
    setIsAdminEditOpen(true);
  };

  const handleAdminImageUpload = async (file: File) => {
    setUploadingImage(true);
    setBannerSaveError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
        body: formData,
      });
      const data = await safeResponseJson(res, {});
      if (res.ok && data.url) {
        setEditingBanner((prev) => ({ ...prev, image_url: data.url }));
        setBannerSaveSuccess('Image uploaded! Click "Save Banner Changes" to publish live.');
      } else {
        setBannerSaveError(data?.error || 'Failed to upload image file.');
      }
    } catch {
      setBannerSaveError('Error uploading banner image file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBannerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    setBannerSaveSuccess('');
    setBannerSaveError('');

    try {
      const updatedSettings: WebsiteSettings = {
        ...(settings || ({
          business_name: 'Dot And Art Studio',
          tagline: 'Handcrafted Sacred Mandalas',
          domain: 'dotandart.in',
          whatsapp_number: '+918652162647',
          whatsapp_display: '+91 86521 62647',
          instagram_url: 'https://instagram.com',
          facebook_url: 'https://facebook.com',
          email: 'shitalthosar@yahoo.com',
          studio_address: 'Mumbai, Maharashtra, India',
          payment_terms: '50% advance for custom commissions',
          shipping_policy_summary: 'Worldwide insured shipping',
          announcement_banner: { enabled: true, text: '✨ Explore our catalog!' },
          default_seo: { title: 'Dot And Art', description: 'Handcrafted art', keywords: 'art' },
        } as WebsiteSettings)),
        showcase_banner: {
          title: editingBanner.title,
          eyebrow: editingBanner.eyebrow,
          short_description: editingBanner.short_description,
          description: editingBanner.description,
          image_url: editingBanner.image_url,
          product_sku: editingBanner.product_sku,
          price: editingBanner.price,
          size: editingBanner.size,
          material: editingBanner.material,
          creation_time: editingBanner.creation_time,
          shipping_info: editingBanner.shipping_info,
          badge_text: editingBanner.badge_text,
          hotspots: settings?.showcase_banner?.hotspots || DEFAULT_HOTSPOTS,
        },
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify(updatedSettings),
      });

      if (res.ok) {
        setSettings(updatedSettings);
        setBannerSaveSuccess('Hero Banner image & details updated successfully!');
        setTimeout(() => {
          setIsAdminEditOpen(false);
        }, 1200);
      } else {
        setBannerSaveError('Failed to save banner settings.');
      }
    } catch {
      setBannerSaveError('Network error saving banner configuration.');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleWhatsAppEnquiry = () => {
    const customProd: Product = {
      ...product,
      name: bannerTitle,
      base_price: bannerPrice,
      images: [
        {
          id: 'banner-img',
          product_id: product.id || 'prod-banner',
          storage_path: imageSrc,
          alt_text: bannerTitle,
          display_order: 1,
          is_primary: true,
        },
      ],
    };
    const msg = formatSingleProductEnquiry(customProd, bannerSize, bannerPrice);
    const attachments = collectAttachmentsForProduct(customProd);
    dispatchDirectWhatsAppOrder(msg, attachments);
  };

  const handleAddToCart = () => {
    addToCart(product, product.variants?.[0]);
  };

  const inCartQty = getItemQuantity(product.id, bannerSize);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#181512] via-[#211B17] to-theme-page text-white border-b border-white/10 transition-colors duration-500">
      {/* Decorative background ambiance */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-amber-600/15 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-[700px] h-[700px] rounded-full bg-[#128C7E]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
        {/* Top Header Eyebrow & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{bannerEyebrow}</span>
            </span>

            {/* Admin Quick Edit Button */}
            {isAdmin && (
              <button
                onClick={handleOpenAdminEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-md cursor-pointer animate-bounce"
                title="Admin: Edit Banner Image & Details"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Admin: Change Banner Image & Details</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
            <span className="font-medium text-emerald-300">{bannerBadgeText}</span>
            <span className="text-white/30">•</span>
            <span>Handcrafted Sacred Art Collection</span>
          </div>
        </div>

        {/* Main Grid: Left = Huge Image Banner, Right = Smart Description Dock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: HUGE IMAGE BANNER CONTAINER */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full max-w-[580px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/30 bg-[#0F0D0B] group select-none transition-transform duration-500 hover:scale-[1.01]">
              {/* Main Artwork Image */}
              <img
                src={imageSrc}
                alt={bannerTitle}
                className="w-full h-full object-cover transition-transform duration-700"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  e.currentTarget.src = '/static/assets/images/DA-MD-24-0002.jpg';
                }}
              />

              {/* Inner glow rim */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-inset ring-white/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]" />

              {/* Interactive Hotspot Pins */}
              {showHotspots &&
                hotspotsList.map((spot) => {
                  const isSelected = selectedHotspot?.id === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => setSelectedHotspot(spot)}
                      onMouseEnter={() => setSelectedHotspot(spot)}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-transform ${
                        isSelected ? 'scale-125' : 'scale-100 hover:scale-110'
                      } cursor-pointer group/pin`}
                      aria-label={spot.title}
                    >
                      <span className="relative flex h-6 w-6 items-center justify-center">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isSelected ? 'bg-amber-400' : 'bg-white'
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white items-center justify-center shadow-lg transition-colors ${
                            isSelected ? 'bg-amber-500' : 'bg-black/80'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                      </span>

                      {/* Tooltip label on hover */}
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-7 opacity-0 group-hover/pin:opacity-100 pointer-events-none transition-opacity bg-black/90 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded shadow whitespace-nowrap border border-white/20">
                        {spot.title}
                      </span>
                    </button>
                  );
                })}

              {/* Bottom controls overlay on the banner image */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 text-xs z-20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHotspots(!showHotspots)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium transition-colors cursor-pointer text-white flex items-center gap-1.5"
                  >
                    <Compass className="w-3 h-3 text-amber-300" />
                    <span>{showHotspots ? 'Hide Pins' : 'Explore Pins'}</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={handleOpenAdminEdit}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-amber-400/40"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Banner</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsZoomModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Full View</span>
                </button>
              </div>
            </div>

            {/* Quick Hotspot Highlight Card */}
            {selectedHotspot && (
              <div className="w-full max-w-[580px] mt-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-200">{selectedHotspot.title}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/50">
                      {selectedHotspot.tag}
                    </span>
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed">
                    {selectedHotspot.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SMART DESCRIPTION SHOWCASE DOCK */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Artist Focus Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                <span>Artisan Shital Thosar</span>
                <span>•</span>
                <span>Sacred Dot Mandala & Lippan Art</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight leading-[1.15]">
                {bannerTitle}
              </h1>
              <p className="font-serif text-base text-amber-200/90 font-normal italic">
                {bannerShortDesc}
              </p>
            </div>

            {/* TAB NAVIGATION */}
            <div className="p-1 rounded-2xl bg-white/10 border border-white/15 flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('story')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'story'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Story</span>
              </button>

              <button
                onClick={() => setActiveTab('craft')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'craft'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Craft Details</span>
              </button>

              <button
                onClick={() => setActiveTab('space')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'space'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Room Guide</span>
              </button>
            </div>

            {/* TAB CONTENT CARD */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 shadow-xl">
              {activeTab === 'story' && (
                <div className="space-y-3.5 text-xs sm:text-sm text-white/85 leading-relaxed font-light">
                  <p className="whitespace-pre-line">{bannerFullDesc}</p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-200">
                    <span>✨ Meditative Sacred Geometry</span>
                    <span>🕉️ Aura of Peace & Focus</span>
                  </div>
                </div>
              )}

              {activeTab === 'craft' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-white/50 uppercase font-mono block">Exact Diameter</span>
                      <strong className="text-sm text-amber-300 font-serif">{bannerSize}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-white/50 uppercase font-mono block">Creation Lead Time</span>
                      <strong className="text-sm text-amber-300 font-serif">{bannerCreationTime}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-white/50 uppercase font-mono block">Materials Used</span>
                    <p className="text-white/85 text-[11px] leading-relaxed">
                      {bannerMaterial}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px] text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-300" />
                      <span>{bannerShippingInfo}</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">Worldwide Dispatch</span>
                  </div>
                </div>
              )}

              {activeTab === 'space' && (
                <div className="space-y-2.5 text-xs">
                  <p className="text-[11px] text-white/60 mb-2">
                    How this artwork anchors different interior spaces:
                  </p>
                  {LIVING_SPACES.map((space, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3"
                    >
                      <span className="text-lg">{space.icon}</span>
                      <div className="space-y-0.5">
                        <strong className="text-white block font-medium">{space.title}</strong>
                        <p className="text-[11px] text-white/70">{space.description}</p>
                        <span className="text-[10px] text-amber-300/80 block mt-0.5">
                          Tip: {space.heightNote}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ART & ARTIST DISCOVERY FOOTER (NO PRICING OR SELLING) */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200/90">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="font-serif italic text-white/85 text-xs sm:text-sm">
                    “Handcrafted Dot Mandalas & Lippan Kaam mirror art by Shital Thosar.”
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('/shop')}
                  className="px-5 py-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  <span>Explore Art Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN QUICK EDIT BANNER MODAL */}
      {isAdminEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#1A1714] border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
            <button
              onClick={() => setIsAdminEditOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Admin: Change Showcase Banner Image & Details
                </h3>
                <p className="text-xs text-white/60">
                  Update the main hero image, headline, specifications, and price on the home page.
                </p>
              </div>
            </div>

            {bannerSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>{bannerSaveSuccess}</span>
              </div>
            )}

            {bannerSaveError && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{bannerSaveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveBannerConfig} className="space-y-4 text-xs">
              {/* Image Upload & Link */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <label className="block font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  1. Banner Image & Catalog SKU
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-black">
                    <img
                      src={editingBanner.image_url || '/static/assets/images/DA-MD-24-0002.jpg'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <span className="block text-[11px] text-white/70 mb-1">Select Catalog Product:</span>
                      <select
                        value={editingBanner.product_sku}
                        onChange={(e) => {
                          const sku = e.target.value;
                          const found = productsList.find((p) => p.sku === sku);
                          const img = found?.images?.[0]?.storage_path || `/static/assets/images/${sku}.jpg`;
                          setEditingBanner({
                            ...editingBanner,
                            product_sku: sku,
                            image_url: img,
                            title: found?.name || editingBanner.title,
                            price: found?.base_price || editingBanner.price,
                            material: found?.material || editingBanner.material,
                            creation_time: found?.creation_time || editingBanner.creation_time,
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium cursor-pointer"
                      >
                        {productsList.map((p) => (
                          <option key={p.sku} value={p.sku} className="bg-slate-900 text-white">
                            {p.sku} — {p.name} (₹{p.base_price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingBanner.image_url}
                        placeholder="Image URL or upload file..."
                        onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-[11px]"
                      />

                      <label className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors">
                        {uploadingImage ? (
                          <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleAdminImageUpload(e.target.files[0]);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 font-semibold mb-1">Banner Title / Headline</label>
                  <input
                    type="text"
                    value={editingBanner.title}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-1">Eyebrow Badge Text</label>
                  <input
                    type="text"
                    value={editingBanner.eyebrow}
                    onChange={(e) => setEditingBanner({ ...editingBanner, eyebrow: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-semibold"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/80 font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingBanner.price}
                    onChange={(e) => setEditingBanner({ ...editingBanner, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-amber-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-1">Size Label</label>
                  <input
                    type="text"
                    value={editingBanner.size}
                    onChange={(e) => setEditingBanner({ ...editingBanner, size: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-1">Lead Time</label>
                  <input
                    type="text"
                    value={editingBanner.creation_time}
                    onChange={(e) => setEditingBanner({ ...editingBanner, creation_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-semibold mb-1">Short Tagline</label>
                <input
                  type="text"
                  value={editingBanner.short_description}
                  onChange={(e) => setEditingBanner({ ...editingBanner, short_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
                />
              </div>

              <div>
                <label className="block text-white/90 font-semibold mb-1">
                  Full Detailed Story / Description
                </label>
                <textarea
                  rows={4}
                  value={editingBanner.description}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdminEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBanner}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingBanner ? 'Saving...' : 'Save Banner Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SCREEN DETAIL INSPECTION MODAL */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full bg-[#14110E] border border-white/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-300">
                {bannerSku} • High Resolution Display
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                {bannerTitle} — Artwork Detail View
              </h3>
            </div>

            <div className="relative w-full aspect-square max-h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
              <img
                src={imageSrc}
                alt={bannerTitle}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10 text-xs text-white/70">
              <p>
                {bannerShortDesc}
              </p>
              <button
                onClick={() => {
                  setIsZoomModalOpen(false);
                  handleWhatsAppEnquiry();
                }}
                className="px-6 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enquire via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP ATTACHMENT MODAL */}
      <WhatsAppAttachmentModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        messageText={preparedEnquiry.msg}
        attachments={preparedEnquiry.attachments}
        title={bannerTitle}
      />
    </section>
  );
};
