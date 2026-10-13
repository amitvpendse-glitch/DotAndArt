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
} from 'lucide-react';
import { Product } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import {
  formatSingleProductEnquiry,
  collectAttachmentsForProduct,
  sendNativeWhatsAppShare,
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

const HOTSPOTS: Hotspot[] = [
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
  id: 'prod-da-md-24-0002',
  sku: 'DA-MD-24-0002',
  name: 'Sacred Harmony — 24-Inch Dot Mandala Wall Hanging',
  short_description:
    'Monumental 24-inch handcrafted sacred dot mandala with shimmering mirrors and protective varnish.',
  description:
    'An awe-inspiring 24-inch handcrafted sacred dot mandala wall hanging. Painted dot by concentric dot with meditative precision on moisture-resistant MDF board, featuring deep jewel-toned acrylics, concentric light-reflecting mirrors, and a durable crystal-clear protective varnish finish.',
  category_id: 'cat-mandala',
  category_name: 'Mandala Wall Hangings',
  category_slug: 'mandala-wall-hangings',
  material: 'MDF Board, Acrylic Colors, Mirrors, Warnish',
  framing: '',
  customizable: true,
  creation_time: '8 Days',
  shipping_info: 'All over the world (Bubble wrap and corrugated box)',
  special_information:
    'Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish • Creation Time: 8 Days • Shipping: All over the world',
  featured: true,
  is_published: true,
  photos_available_note: 'Yes',
  base_price: 5200,
  base_size: '24 inches',
  images: [
    {
      id: 'img-prod-da-md-24-0002-1',
      product_id: 'prod-da-md-24-0002',
      storage_path: '/static/assets/images/DA-MD-24-0002.jpg',
      alt_text: 'Sacred Harmony 24-Inch Dot Mandala (DA-MD-24-0002)',
      caption: 'Sacred Harmony 24-Inch Dot Mandala',
      display_order: 1,
      is_primary: true,
    },
  ],
  variants: [
    {
      id: 'var-DA-MD-24-0002-1',
      product_id: 'prod-da-md-24-0002',
      size: '24 inches',
      price: 5200,
      variant_label: 'Standard (24 inches)',
      is_available: true,
      display_order: 1,
    },
  ],
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
  const [activeTab, setActiveTab] = useState<'story' | 'craft' | 'space' | 'zoom'>('story');
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(HOTSPOTS[0]);
  const [showHotspots, setShowHotspots] = useState(true);

  // Full-View Modal State
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // WhatsApp Attachment Modal State
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [preparedEnquiry, setPreparedEnquiry] = useState<{
    msg: string;
    attachments: WhatsAppAttachmentItem[];
  }>({ msg: '', attachments: [] });

  const imageSrc = '/static/assets/images/DA-MD-24-0002.jpg';

  useEffect(() => {
    safeFetchJson<{ products: Product[] }>('/api/products', undefined, { products: [] })
      .then((res) => {
        const found = res?.products?.find((p) => p.sku === 'DA-MD-24-0002');
        if (found) {
          setProduct({
            ...found,
            images: found.images && found.images.length > 0
              ? found.images
              : FALLBACK_PRODUCT.images,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleWhatsAppEnquiry = async () => {
    const msg = formatSingleProductEnquiry(product, '24 inches', product.base_price);
    const attachments = collectAttachmentsForProduct(product);

    // Try native share first (attaches photos directly in WhatsApp on mobile devices)
    const result = await sendNativeWhatsAppShare(msg, attachments);
    if (result === 'shared') return;

    setPreparedEnquiry({ msg, attachments });
    setAttachmentModalOpen(true);
  };

  const handleAddToCart = () => {
    addToCart(product, product.variants?.[0]);
  };

  const inCartQty = getItemQuantity(product.id, '24 inches');

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
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Monumental 24-Inch Showcase</span>
            </span>
            <span className="text-xs font-mono text-amber-200/70 hidden sm:inline">
              Code: DA-MD-24-0002
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
            <span className="font-medium text-emerald-300">100% Handcrafted Original</span>
            <span className="text-white/30">•</span>
            <span>Worldwide Shipping in Bubble Wrap & Corrugated Box</span>
          </div>
        </div>

        {/* Main Grid: Left = Huge Image with Interactive Detail Lens & Hotspots, Right = Smart Description Dock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: HUGE IMAGE BANNER CONTAINER */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div
              className="relative w-full max-w-[580px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-500/30 bg-[#0F0D0B] group select-none transition-transform duration-500 hover:scale-[1.01]"
            >
              {/* Actual Huge Artwork Image (DA-MD-24-0002.jpg) */}
              <img
                src={imageSrc}
                alt="Sacred Harmony — 24-Inch Dot Mandala Wall Hanging (DA-MD-24-0002)"
                className="w-full h-full object-cover transition-transform duration-700"
                loading="eager"
                fetchPriority="high"
              />

              {/* Subtle radial inner glow rim */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-inset ring-white/20 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]" />

              {/* Interactive Hotspot Pins */}
              {showHotspots &&
                HOTSPOTS.map((spot) => {
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

              {/* Bottom controls overlay on the huge banner image */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 text-xs z-20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHotspots(!showHotspots)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium transition-colors cursor-pointer text-white flex items-center gap-1.5"
                  >
                    <Compass className="w-3 h-3 text-amber-300" />
                    <span>{showHotspots ? 'Hide Pins' : 'Explore Pins'}</span>
                  </button>
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

            {/* Quick Hotspot Highlight Card directly below the image */}
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
            
            {/* Title & Dimension Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                <span>Artisan Shital Thosar</span>
                <span>•</span>
                <span>24 Inches (61 cm Round)</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight leading-[1.15]">
                Sacred Harmony
              </h1>
              <p className="font-serif text-lg text-amber-200/90 font-normal italic">
                24-Inch Circular Dot Mandala Wall Hanging
              </p>
            </div>

            {/* SMART DESCRIPTION NAVIGATION TABS */}
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

            {/* SMART TAB CONTENT CARD */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4 shadow-xl">
              {activeTab === 'story' && (
                <div className="space-y-3.5 text-xs sm:text-sm text-white/85 leading-relaxed font-light">
                  <p>
                    <strong className="text-white font-semibold">The Sacred Harmony</strong> represents the infinite rhythm of the cosmos. Every single dot is applied by hand using specialized stylus tools, building concentric rings of energy that draw the viewer into a state of calm meditation.
                  </p>
                  <p className="text-white/70">
                    Thousands of vibrant acrylic dots in rich jewel peacock teal, mystical deep blue, radiant gold, and shimmering bronze converge around reflective mirrors, creating an optical 3D vibrational depth as light shifts throughout the day.
                  </p>
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
                      <strong className="text-sm text-amber-300 font-serif">24 Inches (61 cm)</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-white/50 uppercase font-mono block">Creation Lead Time</span>
                      <strong className="text-sm text-amber-300 font-serif">8 Days of Hand-Painting</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] text-white/50 uppercase font-mono block">Materials Used</span>
                    <p className="text-white/85 text-[11px] leading-relaxed">
                      Moisture-resistant MDF Wood Board, Heavy-Body Acrylic Pigments, Hand-placed Precision Mirrors, Sealed with High-Gloss Crystal Varnish.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px] text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-300" />
                      <span>Bubble wrap and corrugated box</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">Worldwide Dispatch</span>
                  </div>
                </div>
              )}

              {activeTab === 'space' && (
                <div className="space-y-2.5 text-xs">
                  <p className="text-[11px] text-white/60 mb-2">
                    How the 24-inch monumental diameter anchors different interior spaces:
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

            {/* PRICING & QUICK ACTIONS */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/60 block">
                    Original Artwork Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-amber-400">
                      ₹{product.base_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-white/60">
                      (24 inches standard size)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectProduct('DA-MD-24-0002')}
                  className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Full Specifications</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="py-3.5 px-5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enquire on WhatsApp</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="py-3.5 px-5 rounded-full bg-white text-black hover:bg-amber-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {inCartQty > 0 ? `In Cart (${inCartQty}) — Add Another` : 'Add to Cart'}
                  </span>
                </button>
              </div>

              {/* Custom Size Request link */}
              <div className="flex items-center justify-center gap-4 text-xs text-white/60 pt-1">
                <span>Also available in custom sizes: 10, 12, 15, 18, 24, 30 inches</span>
                <span>•</span>
                <button
                  onClick={() => onNavigate('/custom-order')}
                  className="text-amber-300 hover:underline cursor-pointer font-medium"
                >
                  Custom Request →
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
                DA-MD-24-0002 • 3072 × 4096 Original Resolution
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                Sacred Harmony — 24-Inch Dot Mandala Detail View
              </h3>
            </div>

            <div className="relative w-full aspect-square max-h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
              <img
                src={imageSrc}
                alt="DA-MD-24-0002 high resolution"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10 text-xs text-white/70">
              <p>
                Each dot is individually hand-placed in concentric meditation over 8 days on solid moisture-resistant MDF board.
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

      {/* WHATSAPP ATTACHMENT MODAL (Images go as attachments, not links!) */}
      <WhatsAppAttachmentModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        messageText={preparedEnquiry.msg}
        attachments={preparedEnquiry.attachments}
        title="24-Inch Sacred Mandala (DA-MD-24-0002)"
      />
    </section>
  );
};
