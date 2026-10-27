import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Eye,
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  ShieldCheck,
  Sparkles,
  Layers,
  Maximize2,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { Product, Testimonial } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { SafeProductImage } from '../components/SafeProductImage';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { useCart } from '../context/CartContext';
import { WhatsAppAttachmentModal } from '../components/WhatsAppAttachmentModal';
import {
  createWhatsAppUrl,
  openExternalLink,
  formatSingleProductEnquiry,
  collectAttachmentsForProduct,
  DISPLAY_WHATSAPP_NUMBER,
} from '../utils/whatsapp';
import { usePageSeo } from '../lib/usePageSeo';
import { isSkuBlocked } from '../lib/blockedSkus';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectProduct: (sku: string) => void;
  addToCart?: (product: Product) => void;
  decrementItem?: (product: Product) => void;
  getItemQuantity?: (productId: string) => number;
  cartItemsCount?: number;
}

// Default 10 Best Handcrafted Artwork Masterpieces for Hero Slideshow
const DEFAULT_HERO_SLIDES = [
  {
    image: '/static/assets/images/Home_page_banner.jpeg',
    title: 'AUTHENTIC HARMONY · 24" HANDCRAFTED DOT MANDALA',
    subtext: 'Hand-painted dot mandala art by Shital Thosar',
  },
  {
    image: '/static/assets/images/DA-MD-30-0001.jpg',
    title: 'GRAND AURA · 30" MONUMENTAL WALL MANDALA',
    subtext: 'Intricate symmetry and vibrant gold pigments',
  },
  {
    image: '/static/assets/images/DA-MD-24-0001.jpg',
    title: 'CELESTIAL RADIANCE · 24" GEOMETRY MANDALA',
    subtext: 'Meticulously placed acrylic dots',
  },
  {
    image: '/static/assets/images/DA-LP-36-0001.jpg',
    title: 'HERITAGE MIRROR · 36" GUJARATI LIPPAN KAAM',
    subtext: 'Mud-relief craft with shimmering mirrors',
  },
  {
    image: '/static/assets/images/DA-MD-Set-7Chakra.jpg',
    title: 'SEVEN CHAKRAS · COMPLETE MEDITATION SET',
    subtext: 'Complete set of hand-painted chakra plaques',
  },
  {
    image: '/static/assets/images/DA-MD-24-0002.jpg',
    title: 'LOTUS MEDITATION · 24" SPIRITUAL DOT MANDALA',
    subtext: 'Harmonic geometry for tranquil wall decor',
  },
  {
    image: '/static/assets/images/DA-LP-24x48-0001.jpg',
    title: 'KUTCH TRADITION · 24"x48" LIPPAN MUD-MIRROR PANEL',
    subtext: 'Reflective mirror clay relief panel',
  },
  {
    image: '/static/assets/images/DA-MD-18-0002.jpg',
    title: 'GOLDEN SUNBURST · 18" ENERGY MANDALA',
    subtext: 'Vibrant energy and precise dotwork',
  },
  {
    image: '/static/assets/images/DA-MD-24-0005.jpg',
    title: 'ROYAL AZURE · 24" INTRICATE CERAMIC MANDALA',
    subtext: 'Deep blue hues with gold highlights',
  },
  {
    image: '/static/assets/images/DA-MD-15-0001.jpg',
    title: 'VIBRANT BLOSSOM · 15" CONTEMPORARY MANDALA',
    subtext: 'Modern color palettes with traditional techniques',
  },
];

// Default 9 curated art plate images for the 3x3 "Details you can feel" gallery
const DEFAULT_PLATE_IMAGES = [
  { src: '/static/assets/images/DA-MD-12-0001.jpg', sku: 'DA-MD-12-0001', name: 'Celestial Teal Mandala', size: '12"' },
  { src: '/static/assets/images/DA-MD-18-0002.jpg', sku: 'DA-MD-18-0002', name: 'Peacock Bloom Mandala', size: '18"' },
  { src: '/static/assets/images/DA-LP-14-0001.jpg', sku: 'DA-LP-14-0001', name: 'Radiant Lippan Kaam Mirror', size: '14"' },
  { src: '/static/assets/images/DA-MD-10-0001.jpg', sku: 'DA-MD-10-0001', name: 'Harmonic Ochre Mandala', size: '10"' },
  { src: '/static/assets/images/DA-MD-15-0001.jpg', sku: 'DA-MD-15-0001', name: 'Multi-Colour Symphony', size: '15"' },
  { src: '/static/assets/images/DA-LP-18-0001.jpg', sku: 'DA-LP-18-0001', name: 'Concentric Lippan Relief', size: '18"' },
  { src: '/static/assets/images/DA-LP-Set-0001.jpg', sku: 'DA-LP-Set-0001', name: 'Kutch Diya & Mirror Inlay', size: 'Set' },
  { src: '/static/assets/images/DA-MD-12-0006.jpg', sku: 'DA-MD-12-0006', name: 'Blush Lotus Mandala', size: '12"' },
  { src: '/static/assets/images/DA-MD-24-0001.jpg', sku: 'DA-MD-24-0001', name: 'Royal Emerald Monumental', size: '24"' },
];

export function HomePage({
  onNavigate,
  onSelectProduct,
  addToCart: propsAddToCart,
  decrementItem: propsDecrementItem,
  getItemQuantity: propsGetItemQuantity,
}: HomePageProps) {
  const cart = useCart();
  const addToCart = propsAddToCart || cart.addToCart;
  const decrementItem = propsDecrementItem || ((p: Product) => cart.decrementItem(p));
  const getItemQuantity = propsGetItemQuantity || cart.getItemQuantity;

  const { page: cmsPage } = usePageSeo(
    'home',
    'Dot And Art — Handcrafted Mandala & Lippan Mud Mirror Art Studio'
  );

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mandala' | 'lippan'>('all');
  const [loading, setLoading] = useState(true);
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic CMS sections with fallbacks
  const slideshowSec = cmsPage?.sections?.find((s) => s.section_key === 'slideshow' || s.section_type === 'slideshow');
  const heroSlides = (slideshowSec?.content_json?.slides && Array.isArray(slideshowSec.content_json.slides) && slideshowSec.content_json.slides.length > 0)
    ? slideshowSec.content_json.slides
    : DEFAULT_HERO_SLIDES;

  const beginPortalsSec = cmsPage?.sections?.find((s) => s.section_key === 'begin_portals' || s.section_type === 'begin_portals');
  const portals = (beginPortalsSec?.content_json?.portals && Array.isArray(beginPortalsSec.content_json.portals) && beginPortalsSec.content_json.portals.length > 0)
    ? beginPortalsSec.content_json.portals
    : [
        {
          title: 'Artworks Collection',
          subtitle: 'Explore handcrafted Dot Mandalas & Lippan Mirrors',
          image: '/static/assets/images/DA-MD-12-0001.jpg',
          link: '/shop',
        },
        {
          title: 'Commissions Studio',
          subtitle: 'Personalized sizes, color palettes & photo art',
          image: '/static/assets/images/shital-studio-working.jpg',
          link: '/custom-order',
        },
        {
          title: 'Artist & Studio Story',
          subtitle: 'Meet Shital Thosar and read collector reviews',
          image: '/static/assets/images/Home_page_banner.jpeg',
          link: '/about',
        },
      ];

  const detailPlatesSec = cmsPage?.sections?.find((s) => s.section_key === 'detail_plates' || s.section_type === 'detail_plates');
  const plateImages = (detailPlatesSec?.content_json?.plates && Array.isArray(detailPlatesSec.content_json.plates) && detailPlatesSec.content_json.plates.length > 0)
    ? detailPlatesSec.content_json.plates
    : DEFAULT_PLATE_IMAGES;

  const largeMandalasSec = cmsPage?.sections?.find((s) => s.section_key === 'large_mandalas_banner' || s.section_type === 'large_mandalas_banner');
  const largeMandalas = {
    eyebrow: largeMandalasSec?.content_json?.eyebrow || 'CUSTOM COMMISSIONS · LARGE SIZED MANDALAS',
    title: largeMandalasSec?.content_json?.title || 'Made to enthrall,\nup close and across the room.',
    paragraph: largeMandalasSec?.content_json?.paragraph || 'At this scale a mandala holds you still for a moment. From the doorway it reads as one bold form. Step closer and the nuance arrives: the concentric rings, the subtle gradients, the thousands of individual dots and light-reflecting mirrors that built it.',
    quote: largeMandalasSec?.content_json?.quote || 'You choose the colours and the inspiration. I create the mandala. Together, it creates magic.',
    author: largeMandalasSec?.content_json?.author || '— Shital Thosar',
    image: largeMandalasSec?.content_json?.image || '/static/assets/images/Art_artist.jpeg',
  };

  const trustBoxesSec = cmsPage?.sections?.find((s) => s.section_key === 'trust_boxes' || s.section_type === 'trust_boxes');
  const trustBoxes = (trustBoxesSec?.content_json?.boxes && Array.isArray(trustBoxesSec.content_json.boxes) && trustBoxesSec.content_json.boxes.length > 0)
    ? trustBoxesSec.content_json.boxes
    : [
        {
          title: '100% Handcrafted Originals',
          description: 'Every dot and clay relief pattern is meticulously handcrafted by artist Shital Thosar.',
        },
        {
          title: 'Protective Varnish Finish',
          description: 'Sealed with professional UV & moisture resistant varnish for long-lasting vibrant artwork.',
        },
        {
          title: 'Safe Worldwide Delivery',
          description: 'Multi-layered custom wooden crate & foam bubble packaging ensures 100% safe transit.',
        },
        {
          title: 'Direct Artist Support',
          description: 'Direct communication with the artist for color advice, wall sizing & custom creations.',
        },
      ];

  // Auto-advance hero background slideshow every 3.5 seconds
  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await safeFetchJson<{ products: Product[] }>('/api/products?featured=true', undefined, { products: [] });
        const prods = prodRes?.products ? prodRes.products : [];
        const seenIds = new Set<string>();
        const seenSkus = new Set<string>();
        const uniqueProds = prods.filter((p) => {
          if (!p || isSkuBlocked(p?.sku, p?.id)) return false;
          const pid = (p.id || '').trim();
          const psku = (p.sku || '').trim().toUpperCase();
          if (pid && seenIds.has(pid)) return false;
          if (psku && seenSkus.has(psku)) return false;
          if (pid) seenIds.add(pid);
          if (psku) seenSkus.add(psku);
          return true;
        });
        setFeaturedProducts(uniqueProds);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    window.addEventListener('app_products_updated', loadData);
    return () => window.removeEventListener('app_products_updated', loadData);
  }, []);

  const handleDirectArtworkEnquiry = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEnquiryProduct(product);
  };

  const handleCommissionClick = () => {
    const url = createWhatsAppUrl(
      'Hello Dot And Art! I would love to enquire about commissioning a custom large-sized mandala artwork.'
    );
    openExternalLink(url);
  };

  const filteredFeatured = featuredProducts.filter((p) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'mandala') {
      return (
        p.category_slug === 'mandala-wall-hangings' ||
        p.sku.startsWith('DA-MD') ||
        p.name.toLowerCase().includes('mandala')
      );
    }
    if (selectedCategory === 'lippan') {
      return (
        p.category_slug === 'lippan-wall-hangings' ||
        p.sku.startsWith('DA-LP') ||
        p.name.toLowerCase().includes('lippan')
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-theme-page text-theme-primary selection:bg-[#C85A32]/20">
      
      {/* ========================================================================= */}
      {/* 1. MONUMENTAL HERO SECTION                                               */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#0A0D10] text-white">
        {/* Full-bleed high-res Mandala Art Backdrop - Editable CMS Slideshow */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroSlides.map((slide: any, idx: number) => (
            <img
              key={idx}
              src={slide.image}
              alt={slide.title || 'Handcrafted Mandala Artwork'}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide
                  ? 'opacity-95 z-10 scale-100'
                  : 'opacity-0 z-0 pointer-events-none scale-105'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0D10] to-transparent pointer-events-none z-20" />
        </div>

        <div className="relative z-30 max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24 lg:py-32 min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex flex-col justify-center">
          <div className="max-w-3xl space-y-6">
            
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2">
              <span className="text-xs sm:text-sm uppercase tracking-[0.25em] font-sans font-bold text-[#E6A082] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                HANDCRAFTED DOT MANDALA & LIPPAN ART
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.08] text-balance drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              Artful Calm, <br />
              <span className="font-normal italic text-[#F7D8BA] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                Colourful Charm.
              </span>
            </h1>

            {/* Editorial Lead Copy */}
            <p className="text-sm sm:text-base md:text-lg text-stone-100 font-normal leading-relaxed max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              Hand-painted dot mandala art and traditional Gujarati Lippan Kaam mud-mirror creations by Indian artisan <strong className="text-white font-medium">Shital Thosar</strong>. Wall mandalas, home decor and artisan curios, each one meticulously made to spread tranquility and joy.
            </p>

            {/* 3 Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('/shop?category=all')}
                className="px-6 py-3.5 rounded-full bg-[#C85A32] hover:bg-[#b04a25] text-white font-semibold text-xs sm:text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/custom-order')}
                className="px-6 py-3.5 rounded-full bg-black/40 hover:bg-black/60 text-white font-semibold text-xs sm:text-sm tracking-wide border border-white/40 backdrop-blur-sm shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Commission a Mandala
              </button>

              <button
                onClick={() => onNavigate('/about')}
                className="px-5 py-3 rounded-full text-stone-100 hover:text-white font-medium text-xs sm:text-sm tracking-wide transition-colors cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                About Shital Thosar
              </button>
            </div>
          </div>

          {/* Bottom Right Artwork Title Identifier & Slide Indicators */}
          <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/20 pt-4 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-1 bg-[#C85A32] rounded-full" />
              {/* Slide Indicator Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {heroSlides.map((slide: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentSlide ? 'w-6 bg-[#E6A082]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`View ${slide.title}`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] tracking-wider text-stone-300 uppercase ml-2 hidden sm:inline">
                {currentSlide + 1} / {heroSlides.length}
              </span>
            </div>

            <div className="font-mono text-[11px] uppercase tracking-widest text-[#F7D8BA] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-all duration-500">
              {heroSlides[currentSlide]?.title} {heroSlides[currentSlide]?.subtext ? `· ${heroSlides[currentSlide].subtext}` : ''}
            </div>
          </div>
        </div>

        {/* Marquee Ribbon Divider */}
        <div className="w-full bg-[#050608] border-y border-white/10 py-3 overflow-hidden select-none">
          <div className="flex whitespace-nowrap gap-8 text-[11px] sm:text-xs tracking-[0.25em] font-mono uppercase text-stone-400 animate-marquee">
            <span>PATTERN</span> <span>·</span>
            <span className="text-[#E6A082]">COLOUR</span> <span>·</span>
            <span>SYMMETRY</span> <span>·</span>
            <span className="text-white">BRUSHWORK</span> <span>·</span>
            <span>DETAIL</span> <span>·</span>
            <span className="text-[#E6A082]">PATIENCE</span> <span>·</span>
            <span>PRECISION</span> <span>·</span>
            <span className="text-white">PASSION</span> <span>·</span>
            <span>MINDFULNESS</span> <span>·</span>
            <span className="text-[#E6A082]">TRADITION</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. "WHERE WOULD YOU LIKE TO BEGIN?" PORTALS                               */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-theme-glass gap-3">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-theme-primary tracking-tight">
              Where would you like to begin?
            </h2>
          </div>
          <span className="text-xs uppercase font-mono tracking-widest text-theme-accent font-semibold">
            TAP A CARD TO EXPLORE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((p: any, idx: number) => (
            <div
              key={idx}
              onClick={() => onNavigate(p.link || '/shop')}
              className="group relative h-96 sm:h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 border border-theme-glass"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = '/static/assets/images/Home_page_banner.jpeg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute top-4 left-4 font-mono text-xs text-white/70 tracking-widest font-bold">
                0{idx + 1}
              </div>
              <div className="absolute bottom-6 left-6 right-6 space-y-1 text-white">
                <h3 className="font-serif text-2xl font-medium tracking-wide group-hover:text-[#F7D8BA] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  {p.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "DETAILS YOU CAN FEEL BEFORE YOU TOUCH IT"                             */}
      {/* ========================================================================= */}
      <section className="bg-theme-card/50 border-y border-theme-glass py-16 sm:py-24">
        <div className="max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Craftsmanship Philosophy */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C85A32] font-bold">
                  DOT MANDALA & LIPPAN KAAM · THE ART FORM
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-theme-primary tracking-tight leading-[1.12]">
                  Details you can feel <br />
                  <span className="italic font-normal">before you touch it.</span>
                </h2>
              </div>

              <p className="text-sm sm:text-base text-theme-muted font-light leading-relaxed">
                In a Dot Mandala piece, there are no prints, no stencils, no shortcuts. Every dot is placed by hand: raised, glossy, catching light differently from every angle. Each mirror is hand-inlaid into authentic Gujarati clay-relief motifs.
              </p>

              {/* 4 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5 border-t border-theme-glass pt-3">
                  <h4 className="font-serif font-semibold text-base text-theme-primary">A meditative process</h4>
                  <p className="text-xs text-theme-muted font-light leading-relaxed">Hours of slow, steady mindful dotting with complete concentration.</p>
                </div>

                <div className="space-y-1.5 border-t border-theme-glass pt-3">
                  <h4 className="font-serif font-semibold text-base text-theme-primary">Control in every stroke</h4>
                  <p className="text-xs text-theme-muted font-light leading-relaxed">Brushwork and custom styluses held to a fine, even line.</p>
                </div>

                <div className="space-y-1.5 border-t border-theme-glass pt-3">
                  <h4 className="font-serif font-semibold text-base text-theme-primary">Magic out of dots</h4>
                  <p className="text-xs text-theme-muted font-light leading-relaxed">Artist-grade heavy acrylics and patience until the surface shimmers.</p>
                </div>

                <div className="space-y-1.5 border-t border-theme-glass pt-3">
                  <h4 className="font-serif font-semibold text-base text-theme-primary">A symphony of colour</h4>
                  <p className="text-xs text-theme-muted font-light leading-relaxed">Each concentric ring harmoniously answering the one before it.</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-theme-glass text-xs font-mono">
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-serif text-[#C85A32] block">10,000+</span>
                  <span className="text-theme-muted tracking-wider uppercase text-[10px]">dots in a large piece</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-serif text-theme-primary block">40+ hrs</span>
                  <span className="text-theme-muted tracking-wider uppercase text-[10px]">average per commission</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-serif text-emerald-600 block">100%</span>
                  <span className="text-theme-muted tracking-wider uppercase text-[10px]">Handmade & Non-AI</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3x3 CMS Artwork Gallery */}
            <div className="lg:col-span-6">
              <div className="p-4 sm:p-6 rounded-3xl glass-card border border-theme-glass bg-theme-page/80 shadow-2xl">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {plateImages.map((plate: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const matched = featuredProducts.find((p) => p.sku === plate.sku || plate.src?.includes(p.sku));
                        if (matched) {
                          setZoomedProduct(matched);
                        } else if (plate.sku) {
                          onSelectProduct(plate.sku);
                        }
                      }}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-stone-50 dark:bg-stone-900/60 border border-theme-glass shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-center p-2 sm:p-2.5"
                      title={`${plate.name} (${plate.size}) — Click to view authentic high-resolution photograph`}
                    >
                      <img
                        src={plate.src}
                        alt={plate.name}
                        className="w-full h-full object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/static/assets/images/Home_page_banner.jpeg'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center rounded-2xl">
                        <span className="text-[10px] font-bold text-white leading-tight">{plate.name}</span>
                        <span className="text-[9px] text-[#F7D8BA] font-mono mt-0.5">{plate.size} · View Photo</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-theme-muted">
                    Click any authentic artwork plate to inspect full original photograph
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURED HAND-PAINTED PIECES (Supports up to 50 items)                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-theme-glass gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C85A32] font-bold">
              HANDCRAFTED CATALOG
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-theme-primary mt-1">
              Featured Hand-Painted Pieces
            </h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-theme-card border border-theme-glass">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              All Pieces
            </button>
            <button
              onClick={() => setSelectedCategory('mandala')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'mandala'
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              Dot Mandalas
            </button>
            <button
              onClick={() => setSelectedCategory('lippan')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'lippan'
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              Lippan Kaam
            </button>
          </div>
        </div>

        {/* Product Cards Grid - Up to 50 featured items supported */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeatured.slice(0, 50).map((product) => {
            const primaryImg = product?.images?.find((img) => img.is_primary) || product?.images?.[0];
            const qty = getItemQuantity(product.id || product.sku);

            return (
              <div
                key={product.id || product.sku}
                className="group rounded-3xl glass-card overflow-hidden transition-all duration-300 flex flex-col border border-theme-glass bg-theme-card/80 hover:shadow-xl hover:border-theme-accent/40"
              >
                <div
                  onClick={() => onSelectProduct(product.sku)}
                  className="relative aspect-square bg-theme-page overflow-hidden cursor-pointer flex items-center justify-center p-3"
                >
                  <SafeProductImage
                    src={primaryImg?.storage_path}
                    alt={product.name}
                    name={product.name}
                    sku={product.sku}
                    category_slug={product.category_slug}
                    fit="contain"
                    className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-102"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedProduct(product);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md cursor-pointer"
                    title="Zoom High-Resolution Artwork"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
                      {product.base_size || 'Standard'}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-theme-accent block">
                      {product.sku}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(product.sku)}
                      className="font-serif text-base font-semibold text-theme-primary hover:text-theme-accent transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-theme-glass flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-theme-muted block">Price</span>
                      <span className="font-serif text-lg font-bold text-theme-primary">
                        ₹{product.base_price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDirectArtworkEnquiry(e, product)}
                        className="p-2 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] transition-colors cursor-pointer"
                        title="Enquire on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-[#128C7E] text-white" />
                      </button>

                      {qty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-[#C85A32]/10 border border-[#C85A32]/30 rounded-full px-2 py-1">
                          <button
                            onClick={() => decrementItem(product)}
                            className="p-0.5 text-[#C85A32] hover:opacity-70"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono px-1 text-[#C85A32]">{qty}</span>
                          <button
                            onClick={() => addToCart(product)}
                            className="p-0.5 text-[#C85A32] hover:opacity-70"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="px-3.5 py-1.5 rounded-full bg-theme-primary text-theme-page text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('/shop?category=all')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-theme-glass glass-card hover:bg-[#C85A32] hover:text-white text-theme-primary text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer"
          >
            <span>Explore Entire Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. LARGE SIZED MANDALAS BANNER (CMS Editable)                             */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#0E0C0A] text-white py-20 sm:py-28 border-t border-white/10">
        <div className="max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Portrait of Artist Shital Thosar */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden border-2 border-[#C85A32]/30 shadow-2xl p-2 bg-[#171412]">
                <img
                  src={largeMandalas.image}
                  alt="Artist Shital Thosar with Handcrafted Mandala Artwork"
                  className="w-full h-full object-contain rounded-2xl"
                  onError={(e) => { e.currentTarget.src = '/static/assets/images/Art_artist.jpeg'; }}
                />
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white">Shital Thosar</h4>
                    <p className="text-[11px] text-[#E6A082] font-mono uppercase tracking-wider">Founder & Master Artisan</p>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Pune, India</span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Commission Proposition */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E6A082] font-bold">
                {largeMandalas.eyebrow}
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.12] whitespace-pre-line">
                {largeMandalas.title}
              </h2>

              <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
                {largeMandalas.paragraph}
              </p>

              <div className="pl-4 border-l-2 border-[#C85A32] py-1 space-y-1">
                <p className="font-serif text-base sm:text-lg text-stone-200 italic leading-snug">
                  "{largeMandalas.quote}"
                </p>
                <span className="text-xs uppercase font-mono tracking-wider text-[#E6A082] block">
                  {largeMandalas.author}
                </span>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('/custom-order')}
                  className="px-6 py-3.5 rounded-full bg-[#C85A32] hover:bg-[#b04a25] text-white font-semibold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enquire about a commission</span>
                </button>

                <button
                  onClick={handleCommissionClick}
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                >
                  WhatsApp: {DISPLAY_WHATSAPP_NUMBER}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. 4 TRUST TEXT BOXES (CMS Editable)                                    */}
      {/* ========================================================================= */}
      {trustBoxes.length > 0 && (
        <section className="bg-theme-card/30 border-t border-theme-glass py-12 sm:py-16">
          <div className="max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustBoxes.map((box: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2 bg-theme-page/60 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center font-bold text-lg mb-3">
                    {i === 0 ? <Sparkles className="w-5 h-5" /> : i === 1 ? <ShieldCheck className="w-5 h-5" /> : i === 2 ? <Layers className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <h4 className="font-serif font-bold text-base text-theme-primary">{box.title}</h4>
                  <p className="text-xs text-theme-muted font-light leading-relaxed">{box.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* High-Resolution Artwork Zoom Modal */}
      <ImageZoomModal
        product={zoomedProduct}
        isOpen={!!zoomedProduct}
        onClose={() => setZoomedProduct(null)}
        onSelectProduct={onSelectProduct}
      />

      {/* Single Artwork Direct WhatsApp Enquiry Modal */}
      {enquiryProduct && (
        <WhatsAppAttachmentModal
          isOpen={!!enquiryProduct}
          onClose={() => setEnquiryProduct(null)}
          messageText={formatSingleProductEnquiry(
            enquiryProduct,
            enquiryProduct.base_size,
            enquiryProduct.base_price
          )}
          attachments={collectAttachmentsForProduct(enquiryProduct)}
          title={`Enquire Artwork — ${enquiryProduct.sku}`}
        />
      )}
    </div>
  );
}
