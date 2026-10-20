import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  MessageCircle,
  Eye,
  ShoppingBag,
  X,
  Check,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Clock,
  Layers,
  Home,
  Info,
  Maximize2,
  Compass,
  Download,
  BookOpen,
  Heart,
  Sparkles,
  Palette,
} from 'lucide-react';
import { Product, WebsiteSettings } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import {
  dispatchDirectWhatsAppOrder,
  formatSingleProductEnquiry,
  collectAttachmentsForProduct,
  WhatsAppAttachmentItem,
} from '../utils/whatsapp';
import { WhatsAppAttachmentModal } from './WhatsAppAttachmentModal';
import { AvailableBadge } from './AvailableBadge';

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
    description: 'Fosters serene concentration and brings harmonious authentic energy into prayer rooms.',
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
  name: 'Shital Thosar — Authentic Geometry & Handmade Mandala Art',
  short_description:
    'Crafting serene dot mandalas and traditional Lippan Kaam mirror art with deep devotion and precision.',
  description:
    'Shital Thosar is a visionary Indian artisan specializing in authentic Dot Mandalas and traditional Gujarati Lippan Kaam mirror art. Handcrafted on moisture-resistant MDF board with heavy-body acrylics, light-reflecting mirrors, and protective varnish, her creations bring spiritual harmony, positive energy, and radiant warmth into modern homes across the globe.',
  category_id: 'cat-mandala',
  category_name: 'Handcrafted Authentic Art',
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
      alt_text: 'Artist Shital Thosar with Authentic Mandala Art',
      caption: 'Artist Shital Thosar with Authentic Mandala Art',
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


  // Full-View Modal State
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // WhatsApp Attachment Modal State
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [preparedEnquiry, setPreparedEnquiry] = useState<{
    msg: string;
    attachments: WhatsAppAttachmentItem[];
  }>({ msg: '', attachments: [] });

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
      const found = (allProducts || []).find((p) => p.sku === targetSku);
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
    '/static/assets/images/Home_page_banner.jpeg';

  const bannerTitle = bannerConfig?.title || product.name || 'Authentic Harmony — 24-Inch Dot Mandala Wall Hanging';
  const bannerEyebrow = bannerConfig?.eyebrow || 'Monumental 24-Inch Showcase';
  const bannerSku = bannerConfig?.product_sku || product.sku || 'DA-MD-24-0002';
  const bannerPrice = bannerConfig?.price ?? product.base_price ?? 5200;
  const bannerSize = bannerConfig?.size || product.base_size || '24 inches';
  const bannerMaterial = bannerConfig?.material || product.material || 'MDF Board, Acrylic Colors, Mirrors, Varnish';
  const bannerCreationTime = bannerConfig?.creation_time || product.creation_time || '8 Days';
  const bannerShippingInfo = bannerConfig?.shipping_info || product.shipping_info || 'All over the world (Bubble wrap and corrugated box)';
  const bannerShortDesc = bannerConfig?.short_description || product.short_description || 'Monumental 24-inch handcrafted authentic dot mandala with shimmering mirrors and protective varnish.';
  const bannerFullDesc = bannerConfig?.description || product.description || bannerShortDesc;
  const bannerBadgeText = bannerConfig?.badge_text || '100% Handcrafted Original';
  const showHotspots = bannerConfig?.pins_enabled !== false;
  const hotspotsList = bannerConfig?.pins || bannerConfig?.hotspots || DEFAULT_HOTSPOTS;

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

  // Dedicated background theme color configurations (3 core styles)
  const isSapphire = theme === 'sapphire';
  const isOchre = theme === 'ochre';

  const bannerTheme = isSapphire
    ? {
        sectionBg: 'bg-gradient-to-b from-[#0A1931] via-[#061024] to-[#030814] border-b border-[#1D529E]/40',
        orbTop: 'bg-[#1D529E]/35',
        orbSide: 'bg-[#D4AF37]/25',
        frameBorder: 'border-4 border-[#1D529E]/60 bg-[#0E2243] shadow-2xl',
        eyebrowBadge: 'bg-[#1D529E]/25 text-[#D1E4FF] border-[#1D529E]/40',
        sparkleIcon: 'text-[#92C1FF]',
        artistSubheader: 'text-[#6BB0FF]',
        shortDesc: 'text-blue-100/90',
        titleText: 'text-white',
        bodyText: 'text-blue-100/85',
        tabActive: 'bg-[#1D529E] text-white font-bold shadow-md',
        tabInactive: 'text-blue-200/75 hover:bg-[#1D529E]/20',
        accentText: 'text-[#D4AF37]',
        fullViewBtn: 'bg-[#1D529E]/25 hover:bg-[#1D529E]/45 text-white border-[#1D529E]/40',
        cardBorder: 'border-[#1D529E]/40 bg-[#0A1931]/90 shadow-xl text-white',
        subCardBg: 'bg-[#061024]/90 border-[#1D529E]/25 text-blue-100/80',
      }
    : isOchre
    ? {
        sectionBg: 'bg-gradient-to-b from-[#EBD3A7] via-[#DFBF87] to-[#CEA664] border-b border-[#8C5D0D]/45',
        orbTop: 'bg-[#8C5D0D]/25',
        orbSide: 'bg-[#D4A347]/30',
        frameBorder: 'border-4 border-[#8C5D0D]/50 bg-white/95 shadow-xl',
        eyebrowBadge: 'bg-[#8C5D0D]/20 text-[#2B1B04] border-[#8C5D0D]/45',
        sparkleIcon: 'text-[#734A08]',
        artistSubheader: 'text-[#633F05]',
        shortDesc: 'text-[#2B1B04]',
        titleText: 'text-[#170C00]',
        bodyText: 'text-[#241502]',
        tabActive: 'bg-[#8C5D0D] text-white font-bold shadow-md',
        tabInactive: 'text-[#241502] hover:bg-[#8C5D0D]/15',
        accentText: 'text-[#633F05]',
        fullViewBtn: 'bg-[#8C5D0D]/20 hover:bg-[#8C5D0D]/35 text-[#170C00] border-[#8C5D0D]/45',
        cardBorder: 'border-[#8C5D0D]/35 bg-white/95 shadow-lg text-[#170C00]',
        subCardBg: 'bg-[#FAF3E6]/95 border-[#8C5D0D]/25 text-[#241502]',
      }
    : {
        sectionBg: 'bg-gradient-to-b from-[#1C1714] via-[#14100E] to-[#0A0807] border-b border-[#D4A373]/30',
        orbTop: 'bg-[#D4A373]/20',
        orbSide: 'bg-[#E6C594]/15',
        frameBorder: 'border-4 border-[#D4A373]/60 bg-[#1A1613] shadow-2xl',
        eyebrowBadge: 'bg-[#D4A373]/15 text-[#E6C594] border-[#D4A373]/30',
        sparkleIcon: 'text-[#E6C594]',
        artistSubheader: 'text-[#D4A373]',
        shortDesc: 'text-stone-300',
        titleText: 'text-white',
        bodyText: 'text-stone-300',
        tabActive: 'bg-[#D4A373] text-stone-950 font-bold shadow-md',
        tabInactive: 'text-stone-300 hover:bg-[#D4A373]/10',
        accentText: 'text-[#E6C594]',
        fullViewBtn: 'bg-[#D4A373]/15 hover:bg-[#D4A373]/30 text-[#E6C594] border-[#D4A373]/35',
        cardBorder: 'border-[#D4A373]/30 bg-[#1C1714]/90 shadow-xl text-white',
        subCardBg: 'bg-[#14100E]/90 border-[#D4A373]/20 text-stone-300',
      };

  return (
    <section className={`relative w-full overflow-hidden ${bannerTheme.sectionBg} text-white transition-colors duration-500`}>
      {/* Decorative background ambiance */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <div className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full ${bannerTheme.orbTop} blur-3xl animate-pulse`} />
        <div className={`absolute top-1/2 -right-32 w-[700px] h-[700px] rounded-full ${bannerTheme.orbSide} blur-3xl`} />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12">
        {/* Top Header Eyebrow & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-900/10 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full ${bannerTheme.eyebrowBadge} text-xs font-bold uppercase tracking-widest backdrop-blur-md`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${bannerTheme.sparkleIcon}`} />
              <span>{bannerEyebrow}</span>
            </span>
          </div>

          <div className={`flex items-center gap-2 text-xs ${bannerTheme.bodyText} font-medium`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{bannerBadgeText}</span>
            <span className="opacity-40">•</span>
            <span>Handcrafted Product Catalog</span>
          </div>
        </div>

        {/* Main Grid: Left = Huge Image Banner, Right = Smart Description Dock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: HUGE IMAGE BANNER CONTAINER */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start">
            <div className={`relative w-full max-w-[460px] md:max-w-[520px] lg:max-w-[560px] 2xl:max-w-[680px] 3xl:max-w-[800px] aspect-square rounded-3xl overflow-hidden shadow-2xl ${bannerTheme.frameBorder} group select-none transition-transform duration-500 hover:scale-[1.01]`}>
              {/* Main Artwork Image */}
              <img
                src={imageSrc}
                alt={bannerTitle}
                className="w-full h-full object-cover transition-transform duration-700"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  e.currentTarget.src = '/static/assets/images/Home_page_banner.jpeg';
                }}
              />

              {/* Inner glow rim */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-inset ring-white/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]" />

              {/* Floating Available Badge & Product Code on Monumental Showcase Image */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-white bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 shadow-md">
                  Product Code: {bannerSku}
                </span>
                <AvailableBadge
                  isAvailable={product?.is_available !== false}
                  badgeText={product?.available_badge_text || 'Available'}
                  unavailableText={product?.unavailable_badge_text || 'Made to Order'}
                  size="sm"
                />
              </div>

              {/* Interactive Hotspot Pins (Customized and controlled from Admin console) */}
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
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between p-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-xs z-20">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-amber-300 font-semibold px-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>100% Hand-Painted • Original Photos (Not AI)</span>
                </div>

                <button
                  onClick={() => setIsZoomModalOpen(true)}
                  className={`px-3 py-1 rounded-lg ${bannerTheme.fullViewBtn} text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0`}
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Full View</span>
                </button>
              </div>
            </div>

            {/* Quick Hotspot Highlight Card (White box with black fonts) */}
            {showHotspots && selectedHotspot && (
              <div className="w-full max-w-[580px] mt-3 p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-md text-stone-900 backdrop-blur-md flex items-start gap-3 text-xs select-none">
                <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-950 text-xs tracking-wide">{selectedHotspot.title}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 font-bold">
                      {selectedHotspot.tag}
                    </span>
                  </div>
                  <p className="text-stone-800 font-normal text-[11px] leading-relaxed">
                    {selectedHotspot.description}
                  </p>
                </div>
              </div>
            )}

            {/* Informative Studio Craft & Specifications Grid (White boxes with black fonts) */}
            <div className="w-full max-w-[580px] mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs select-none">
              <div className="p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-md text-stone-900 backdrop-blur-md flex items-start gap-3 transition-all hover:bg-white hover:shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-950 text-xs tracking-wide">Moisture-Proof Base</h4>
                  <p className="text-stone-800 font-normal text-[11px] leading-snug">
                    8mm high-density MDF board with hand-sanded edges & moisture-seal coat.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-md text-stone-900 backdrop-blur-md flex items-start gap-3 transition-all hover:bg-white hover:shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-950 text-xs tracking-wide">Protective Gloss Varnish</h4>
                  <p className="text-stone-800 font-normal text-[11px] leading-snug">
                    Sealed with dual-coat artist varnish to preserve rich pigment vibrancy for decades.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-md text-stone-900 backdrop-blur-md flex items-start gap-3 transition-all hover:bg-white hover:shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-950 text-xs tracking-wide">Insured Global Transit</h4>
                  <p className="text-stone-800 font-normal text-[11px] leading-snug">
                    Encapsulated in high-density foam, bubble armor, and 7-ply corrugated box.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-md text-stone-900 backdrop-blur-md flex items-start gap-3 transition-all hover:bg-white hover:shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-950 text-xs tracking-wide">Handmade Dedication</h4>
                  <p className="text-stone-800 font-normal text-[11px] leading-snug">
                    100% manual dotting & mirror inlay taking 8+ dedicated studio days per piece.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-md text-stone-900 backdrop-blur-md flex items-start gap-3 transition-all hover:bg-white hover:shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-950 text-xs tracking-wide">Light-Reflecting Mirrors</h4>
                  <p className="text-stone-800 font-normal text-[11px] leading-snug">
                    Concentric hand-embedded mirrors that catch natural sunlight & room lighting.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/95 border border-stone-200/90 shadow-md text-stone-900 backdrop-blur-md flex items-start gap-3 transition-all hover:bg-white hover:shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-950 text-xs tracking-wide">Custom Sizes & Colors</h4>
                  <p className="text-stone-800 font-normal text-[11px] leading-snug">
                    Tailored diameters from 10" to 30" with color schemes matched to your room.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SMART DESCRIPTION SHOWCASE DOCK */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Artist Focus Header */}
            <div className="space-y-2">
              <div className={`flex items-center gap-2 text-xs font-mono ${bannerTheme.artistSubheader}`}>
                <span>Artisan Shital Thosar</span>
                <span>•</span>
                <span>Authentic Dot Mandala & Lippan Art</span>
              </div>
              <h1 className={`font-sans text-3xl sm:text-4xl lg:text-5xl font-bold ${bannerTheme.titleText} tracking-tight leading-[1.15]`}>
                {bannerTitle}
              </h1>
              <p className={`font-sans text-base ${bannerTheme.shortDesc} font-medium italic`}>
                {bannerShortDesc}
              </p>
            </div>

            {/* Authenticity Certificate Note */}
            <div className={`p-3 rounded-2xl ${bannerTheme.cardBorder} backdrop-blur-md flex items-center gap-2.5 text-xs shadow-sm`}>
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className={`text-[11px] leading-snug font-medium ${bannerTheme.bodyText}`}>
                <strong className={bannerTheme.titleText}>100% Hand-Painted Original Creations:</strong> All products are hand-painted by the artist. All website photos are original captures of physical artworks, never AI-generated.
              </p>
            </div>

            {/* TAB NAVIGATION */}
            <div className="p-1 rounded-2xl bg-stone-900/5 border border-stone-900/10 flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('story')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'story'
                    ? bannerTheme.tabActive
                    : bannerTheme.tabInactive
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>The Story</span>
              </button>

              <button
                onClick={() => setActiveTab('craft')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'craft'
                    ? bannerTheme.tabActive
                    : bannerTheme.tabInactive
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Craft Details</span>
              </button>

              <button
                onClick={() => setActiveTab('space')}
                className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'space'
                    ? bannerTheme.tabActive
                    : bannerTheme.tabInactive
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Room Guide</span>
              </button>
            </div>

            {/* TAB CONTENT CARD */}
            <div className={`p-5 sm:p-6 rounded-3xl ${bannerTheme.cardBorder} backdrop-blur-md space-y-4 shadow-xl`}>
              {activeTab === 'story' && (
                <div className={`space-y-3.5 text-xs sm:text-sm ${bannerTheme.bodyText} leading-relaxed font-normal`}>
                  <p className="whitespace-pre-line">{bannerFullDesc}</p>
                  <div className={`pt-2 border-t border-stone-900/10 flex items-center justify-between text-xs font-medium ${bannerTheme.accentText}`}>
                    <span>Meditative Authentic Geometry</span>
                    <span>🕉️ Aura of Peace & Focus</span>
                  </div>
                </div>
              )}

              {activeTab === 'craft' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${bannerTheme.subCardBg}`}>
                      <span className="text-[10px] opacity-60 uppercase font-mono block">Exact Diameter</span>
                      <strong className={`text-sm ${bannerTheme.accentText} font-serif`}>{bannerSize}</strong>
                    </div>

                    <div className={`p-3 rounded-xl ${bannerTheme.subCardBg}`}>
                      <span className="text-[10px] opacity-60 uppercase font-mono block">Creation Lead Time</span>
                      <strong className={`text-sm ${bannerTheme.accentText} font-serif`}>{bannerCreationTime}</strong>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl ${bannerTheme.subCardBg} space-y-1`}>
                    <span className="text-[10px] opacity-60 uppercase font-mono block">Materials Used</span>
                    <p className={`${bannerTheme.bodyText} text-[11px] leading-relaxed font-medium`}>
                      {bannerMaterial}
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl ${bannerTheme.subCardBg} flex items-center justify-between text-[11px] ${bannerTheme.bodyText}`}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Truck className={`w-3.5 h-3.5 ${bannerTheme.accentText}`} />
                      <span>{bannerShippingInfo}</span>
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Worldwide Dispatch</span>
                  </div>
                </div>
              )}

              {activeTab === 'space' && (
                <div className="space-y-2.5 text-xs">
                  <p className={`text-[11px] ${bannerTheme.bodyText} opacity-70 mb-2`}>
                    How this artwork anchors different interior spaces:
                  </p>
                  {LIVING_SPACES.map((space, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl ${bannerTheme.subCardBg} flex items-start gap-3`}
                    >
                      <span className="text-lg">{space.icon}</span>
                      <div className="space-y-0.5">
                        <strong className={`${bannerTheme.titleText} block font-medium`}>{space.title}</strong>
                        <p className={`text-[11px] ${bannerTheme.bodyText} opacity-80`}>{space.description}</p>
                        <span className={`text-[10px] ${bannerTheme.accentText} font-semibold block mt-0.5`}>
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
              <div className={`p-4 rounded-2xl ${bannerTheme.cardBorder} backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xl`}>
                <div className="flex items-center gap-2.5">
                  <Heart className={`w-4 h-4 ${bannerTheme.sparkleIcon} shrink-0`} />
                  <span className={`font-sans italic ${bannerTheme.titleText} text-xs sm:text-sm font-semibold`}>
                    “Handcrafted Dot Mandalas & Lippan Kaam mirror art by Shital Thosar.”
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('/shop')}
                  className={`px-5 py-2.5 rounded-full ${
                    isSapphire
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F1D675] hover:from-[#C59F2A] hover:to-[#E5C558] text-slate-950 font-bold border border-amber-300'
                      : 'bg-amber-400 hover:bg-amber-500 text-black border border-amber-200'
                  } font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg`}
                >
                  <span>Explore Art Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
