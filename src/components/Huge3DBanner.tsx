import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, MessageCircle, Eye, Compass, Layers, ZoomIn, X, Settings, Check, UploadCloud, ImageIcon } from 'lucide-react';
import { createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';
import { Product } from '../types';
import { safeFetchJson, safeResponseJson } from '../lib/safeFetch';
import { useTheme } from '../context/ThemeContext';

interface Huge3DBannerProps {
  onSelectProduct: (sku: string) => void;
  onNavigate: (path: string) => void;
}

export const Huge3DBanner: React.FC<Huge3DBannerProps> = ({ onSelectProduct, onNavigate }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [is3DActive, setIs3DActive] = useState(true);

  // Dynamic 3D Artwork state
  const [featuredSku, setFeaturedSku] = useState('DA-MD-24-0001');
  const [customBannerImage, setCustomBannerImage] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return !!localStorage.getItem('dot_admin_token');
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function loadBannerData() {
      try {
        const token = localStorage.getItem('dot_admin_token');
        const [settingsRes, prodRes, sessionRes] = await Promise.all([
          safeFetchJson<{ featured_3d_sku?: string; featured_3d_image?: string }>('/api/settings', undefined, {}),
          safeFetchJson<{ products: Product[] }>('/api/products', undefined, { products: [] }),
          token
            ? safeFetchJson<{ authenticated: boolean }>('/api/admin/check', {
                headers: { Authorization: `Bearer ${token}` },
              }, { authenticated: false })
            : Promise.resolve({ authenticated: false }),
        ]);

        const prods = prodRes?.products || [];
        setAllProducts(prods);
        setIsAdminLoggedIn(!!sessionRes?.authenticated || !!token);

        const skuToUse = settingsRes?.featured_3d_sku || 'DA-MD-24-0001';
        setFeaturedSku(skuToUse);

        if (settingsRes?.featured_3d_image) {
          setCustomBannerImage(settingsRes.featured_3d_image);
        }

        const found = prods.find((p) => p.sku === skuToUse) || prods[0];
        if (found) {
          if (settingsRes?.featured_3d_image) {
            setActiveProduct({
              ...found,
              images: [
                {
                  id: 'img-custom-3d',
                  product_id: found.id,
                  storage_path: settingsRes.featured_3d_image,
                  is_primary: true,
                  display_order: 1,
                  created_at: new Date().toISOString(),
                },
                ...(found.images || []),
              ],
            });
          } else {
            setActiveProduct(found);
          }
        }
      } catch (err) {
        console.error('Failed to load 3D banner settings', err);
      }
    }
    loadBannerData();
  }, []);

  const handleAdminSaveBanner = async (newSku: string, newImage?: string) => {
    setFeaturedSku(newSku);
    if (newImage !== undefined) {
      setCustomBannerImage(newImage);
    }

    const found = allProducts.find((p) => p.sku === newSku);
    if (found) {
      const activeImg = newImage || customBannerImage || found.images?.[0]?.storage_path;
      if (activeImg) {
        setActiveProduct({
          ...found,
          images: [
            {
              id: 'img-custom-3d',
              product_id: found.id,
              storage_path: activeImg,
              is_primary: true,
              display_order: 1,
              created_at: new Date().toISOString(),
            },
            ...(found.images || []),
          ],
        });
      } else {
        setActiveProduct(found);
      }
    }

    const token = localStorage.getItem('dot_admin_token');
    if (token) {
      setSavingSettings(true);
      try {
        const body: Record<string, string> = { featured_3d_sku: newSku };
        if (newImage !== undefined) {
          body.featured_3d_image = newImage;
        } else if (customBannerImage) {
          body.featured_3d_image = customBannerImage;
        }

        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.error('Failed to save 3D banner artwork', err);
      } finally {
        setSavingSettings(false);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    const token = localStorage.getItem('dot_admin_token');
    if (!token) return;

    setUploadingImage(true);
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
        setCustomBannerImage(data.url);
        await handleAdminSaveBanner(featuredSku, data.url);
      }
    } catch (err) {
      console.error('Error uploading 3D banner image', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Image source resolution
  const primaryImg = activeProduct?.images?.find((i) => i.is_primary) || activeProduct?.images?.[0];
  const imageSrc = customBannerImage || primaryImg?.storage_path || `/public/static/assets/images/${featuredSku}.jpg`;
  const fallbackSrc = `/static/assets/images/${featuredSku}.jpg`;

  // Dynamic Theme Banner Styling Configurations
  const themeBannerStyles = {
    earthy: {
      sectionBg: 'bg-[#4A0E17]', // Rich Royal Maroon
      glowMain: 'from-[#801B2B]/60 via-[#C85A32]/25 to-transparent',
      glowSecondary: 'from-[#D4A373]/30 to-transparent',
      ringsBorder: 'border-[#D4A373]/25',
      badgeBg: 'bg-[#360910]/90 border-[#D4A373]/50 text-[#E6C594]',
      badgeIcon: 'text-[#E6C594]',
      titleText: 'text-[#FAF7F2]',
      descText: 'text-[#E5D2C5]',
      chipBg: 'bg-[#310A10]/80 border-[#661825]',
      chipLabel: 'text-[#D1B2A3]',
      chipValPrimary: 'text-[#FAF7F2]',
      chipValAccent: 'text-[#E6C594]',
      btnPrimary: 'bg-[#C85A32] hover:bg-[#B34A24] text-white shadow-[0_4px_20px_rgba(200,90,50,0.45)]',
      btnSecondary: 'bg-[#310A10] hover:bg-[#420E16] text-[#FAF7F2] border-[#D4A373]/60 hover:border-[#E6C594]',
      rimBorder: 'border-[#D4A373] shadow-[0_0_40px_rgba(212,163,115,0.4)]',
      artBorder: 'border-[#310A10] bg-[#1C0407]',
      interactiveText: 'text-[#D1B2A3]',
      tickerBg: 'bg-[#2E080E] border-[#59121E] text-[#E8C5B0]',
      tickerAccent: 'bg-[#D4A373]',
    },
    sapphire: {
      sectionBg: 'bg-[#0A1628]',
      glowMain: 'from-[#1D529E]/45 via-[#0F3266]/25 to-transparent',
      glowSecondary: 'from-[#00B4D8]/30 to-transparent',
      ringsBorder: 'border-[#00B4D8]/20',
      badgeBg: 'bg-[#0F2537]/90 border-[#00B4D8]/40 text-[#70D6FF]',
      badgeIcon: 'text-[#00B4D8]',
      titleText: 'text-[#F0F6FF]',
      descText: 'text-[#B0D0F0]',
      chipBg: 'bg-[#12243E]/80 border-[#1E3A63]',
      chipLabel: 'text-[#8AAECF]',
      chipValPrimary: 'text-[#F0F6FF]',
      chipValAccent: 'text-[#70D6FF]',
      btnPrimary: 'bg-[#1D529E] hover:bg-[#164282] text-white shadow-[0_4px_20px_rgba(29,82,158,0.45)]',
      btnSecondary: 'bg-[#0F2537] hover:bg-[#16354D] text-[#F0F6FF] border-[#00B4D8]/50 hover:border-[#70D6FF]',
      rimBorder: 'border-[#00B4D8] shadow-[0_0_40px_rgba(0,180,216,0.4)]',
      artBorder: 'border-[#0D1F38] bg-[#071220]',
      interactiveText: 'text-[#8AAECF]',
      tickerBg: 'bg-[#06101D] border-[#132847] text-[#9AC5EC]',
      tickerAccent: 'bg-[#00B4D8]',
    },
    blackgold: {
      sectionBg: 'bg-[#080808]',
      glowMain: 'from-[#D4AF37]/25 via-[#2A2415]/30 to-transparent',
      glowSecondary: 'from-[#F3E5AB]/20 to-transparent',
      ringsBorder: 'border-[#D4AF37]/20',
      badgeBg: 'bg-[#14120C]/90 border-[#D4AF37]/50 text-[#F3E5AB]',
      badgeIcon: 'text-[#D4AF37]',
      titleText: 'text-[#FCFA00] text-amber-50',
      descText: 'text-[#E0D8C3]',
      chipBg: 'bg-[#181610]/80 border-[#2A261C]',
      chipLabel: 'text-[#B5A88B]',
      chipValPrimary: 'text-[#FFFDF7]',
      chipValAccent: 'text-[#F3E5AB]',
      btnPrimary: 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:opacity-90 text-black font-bold shadow-[0_4px_20px_rgba(212,175,55,0.35)]',
      btnSecondary: 'bg-[#181610] hover:bg-[#221F17] text-[#FFFDF7] border-[#D4AF37]/60 hover:border-[#F3E5AB]',
      rimBorder: 'border-[#D4AF37] shadow-[0_0_45px_rgba(212,175,55,0.4)]',
      artBorder: 'border-[#181610] bg-[#0A0907]',
      interactiveText: 'text-[#B5A88B]',
      tickerBg: 'bg-[#030303] border-[#1E1B13] text-[#D8CCA9]',
      tickerAccent: 'bg-[#D4AF37]',
    },
  };

  const style = themeBannerStyles[theme] || themeBannerStyles.earthy;

  // 3D Parallax tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 22;
    const rotY = ((x - centerX) / centerX) * 22;

    setRotateX(rotX);
    setRotateY(rotY);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.5 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!is3DActive || !containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(-((y - centerY) / centerY) * 18);
    setRotateY(((x - centerX) / centerX) * 18);
  };

  const handleMouseEnter = () => {
    if (is3DActive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  const handleWhatsAppEnquiry = () => {
    const text = `Hi Shital, I am admiring the Featured 3D Masterpiece artwork (${activeProduct?.name || featuredSku}, SKU: ${featuredSku}) on DotAndArt. I would like to inquire about its availability, custom dimensions, or ordering details.`;
    const url = createWhatsAppUrl(text);
    openExternalLink(url);
  };

  return (
    <>
      <section className={`relative overflow-hidden ${style.sectionBg} transition-colors duration-500`}>
        {/* Background Radial Glow Effects */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial ${style.glowMain} rounded-full blur-3xl pointer-events-none opacity-80`} />
        <div className={`absolute -top-24 -right-24 w-96 h-96 bg-gradient-radial ${style.glowSecondary} rounded-full blur-2xl pointer-events-none`} />

        {/* Ambient Concentric Geometry Background Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className={`w-[350px] h-[350px] sm:w-[550px] sm:h-[550px] md:w-[750px] md:h-[750px] rounded-full border ${style.ringsBorder} animate-spin-slow`} />
          <div className={`absolute w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] md:w-[550px] md:h-[550px] rounded-full border border-dashed ${style.ringsBorder}`} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Left Column: ARTWORK METADATA & STORY */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left order-2 lg:order-1">
              
              {/* Badge & Admin Trigger */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${style.badgeBg} border text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-xs transition-colors duration-500`}>
                  <Sparkles className={`w-3.5 h-3.5 ${style.badgeIcon}`} />
                  <span>Featured 3D Masterpiece</span>
                </span>

                {isAdminLoggedIn && (
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/50 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Admin: Change 3D Banner Artwork"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-300" />
                    <span>Change 3D Banner Image</span>
                  </button>
                )}
              </div>

              {/* Title & Headline */}
              <div className="space-y-3">
                <h1 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-medium ${style.titleText} tracking-tight leading-tight transition-colors duration-500`}>
                  {activeProduct?.name || 'Sacred Sacred Dot Mandala Masterpiece'}
                </h1>
                <p className={`text-sm sm:text-base ${style.descText} font-light leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-500`}>
                  {activeProduct?.description ||
                    'Handpainted dot by dot with meditative presence. Explore every concentric layer, rich pigment depth, and sacred geometry in interactive 3D dimension.'}
                </p>
              </div>

              {/* Key Highlights Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0">
                <div className={`p-3 rounded-xl ${style.chipBg} backdrop-blur-xs transition-colors duration-500`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${style.chipLabel} block`}>Artwork SKU</span>
                  <span className={`font-mono text-xs font-bold ${style.chipValPrimary}`}>{featuredSku}</span>
                </div>
                <div className={`p-3 rounded-xl ${style.chipBg} backdrop-blur-xs transition-colors duration-500`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${style.chipLabel} block`}>Price</span>
                  <span className={`font-serif text-sm sm:text-base font-semibold ${style.chipValAccent}`}>
                    ₹{(activeProduct?.base_price || 6500).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${style.chipBg} backdrop-blur-xs col-span-2 sm:col-span-1 transition-colors duration-500`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${style.chipLabel} block`}>Craftsmanship</span>
                  <span className={`font-serif text-sm sm:text-base font-semibold ${style.chipValAccent}`}>100% Handcrafted</span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => onSelectProduct(featuredSku)}
                  className={`w-full sm:w-auto px-7 py-3.5 rounded-full ${style.btnPrimary} font-medium text-sm transition-all flex items-center justify-center gap-2.5 group cursor-pointer`}
                >
                  <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>View Product Details</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={handleWhatsAppEnquiry}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-full ${style.btnSecondary} font-medium text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer`}
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Inquire on WhatsApp</span>
                </button>
              </div>

              {/* Interactive Cue & Controls */}
              <div className={`pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs ${style.interactiveText} transition-colors duration-500`}>
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>Interactive 3D: Move cursor over artwork to tilt</span>
                </div>
                <button
                  onClick={() => setIs3DActive(!is3DActive)}
                  className="underline hover:opacity-100 text-[11px] transition-opacity cursor-pointer"
                >
                  {is3DActive ? 'Pause 3D' : 'Enable 3D'}
                </button>
              </div>
            </div>

            {/* Right Column: HUGE 3D IMAGE SHOWCASE */}
            <div className="lg:col-span-6 flex justify-center items-center order-1 lg:order-2">
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleTouchMove}
                className="relative cursor-grab active:cursor-grabbing p-4 sm:p-6"
                style={{ perspective: '1200px' }}
              >
                {/* 3D Tilted Card Container */}
                <div
                  className={`relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] lg:w-[480px] lg:h-[480px] rounded-full transition-transform ease-out ${
                    isHovered ? 'duration-100' : 'duration-700'
                  }`}
                  style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.04 : 1}, ${
                      isHovered ? 1.04 : 1
                    }, 1)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Outer Glowing Metallic Rim */}
                  <div className={`absolute inset-0 rounded-full border-4 ${style.rimBorder} transition-colors duration-500`} />

                  {/* Artwork Image Circle */}
                  <div
                    className={`absolute inset-3 rounded-full border-8 ${style.artBorder} overflow-hidden shadow-2xl transition-colors duration-500 flex items-center justify-center`}
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <img
                      src={imageSrc}
                      onError={(e) => {
                        e.currentTarget.src = fallbackSrc;
                      }}
                      alt={activeProduct?.name || featuredSku}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    {/* Glare Reflection Layer */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
                        opacity: glarePos.opacity,
                      }}
                    />

                    {/* Inspect High-Res Zoom Button Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                      <button
                        onClick={() => setIsZoomModalOpen(true)}
                        className="px-4 py-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-semibold border border-white/30 shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                        <span>Inspect High-Res</span>
                      </button>
                    </div>
                  </div>

                  {/* Floating Dimension Tag */}
                  <div
                    className="hidden sm:flex absolute -top-3 -right-3 px-3.5 py-1.5 rounded-full bg-theme-accent text-white text-[11px] font-bold shadow-lg items-center gap-1.5"
                    style={{ transform: 'translateZ(45px)' }}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{activeProduct?.base_size || 'Interactive'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Feature Ticker Strip */}
        <div className={`${style.tickerBg} py-3.5 px-4 text-xs transition-colors duration-500`}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${style.tickerAccent}`} />
              <span className="font-medium">100% Manual Dot Devotion</span>
              <span className="hidden sm:inline opacity-50">•</span>
              <span className="hidden sm:inline">Zero Screen Printing</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">Worldwide Shock-Proof Crating</span>
              <span className="opacity-50">•</span>
              <button
                onClick={() => onNavigate('/shop')}
                className="hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                Browse Full Catalog <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN / USER 3D MANDALA SELECTOR MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-xl w-full glass-panel rounded-3xl p-6 shadow-2xl border border-white/60 space-y-5 bg-white/95 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#C85A32]" />
                <div>
                  <h3 className="font-serif text-lg font-bold">Change 3D Banner Artwork</h3>
                  <p className="text-xs text-slate-500">Pick any catalog product or upload a custom image for the 3D banner</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Image Upload Section */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                  <span>Upload Custom 3D Banner Image:</span>
                </span>
                {customBannerImage && (
                  <button
                    onClick={() => {
                      setCustomBannerImage(null);
                      handleAdminSaveBanner(featuredSku, '');
                    }}
                    className="text-[10px] text-red-600 hover:underline cursor-pointer font-medium"
                  >
                    Reset to Default Catalog Image
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={customBannerImage || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomBannerImage(val);
                    handleAdminSaveBanner(featuredSku, val);
                  }}
                  placeholder="/uploads/my-3d-artwork.jpg or https://..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs text-slate-800 font-mono"
                />

                <label className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#A03E1B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs">
                  {uploadingImage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Product Catalog List Selection */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Or Select Product Artwork from Catalog:
              </span>

              <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-1">
                {allProducts.map((p) => {
                  const isSelected = p.sku === featuredSku && !customBannerImage;
                  const pImg = p.images?.find((i) => i.is_primary) || p.images?.[0];
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCustomBannerImage(null);
                        handleAdminSaveBanner(p.sku, '');
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C85A32]/10 border-[#C85A32] ring-1 ring-[#C85A32]'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={pImg?.storage_path || `/public/static/assets/images/${p.sku}.jpg`}
                        onError={(e) => {
                          e.currentTarget.src = `/static/assets/images/${p.sku}.jpg`;
                        }}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#C85A32]">{p.sku}</span>
                          <span className="font-serif text-xs font-bold text-slate-700">₹{p.base_price.toLocaleString('en-IN')}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 truncate">{p.name}</h4>
                        <p className="text-[10px] text-slate-500">{p.base_size}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                {savingSettings ? 'Saving to Database...' : `Active Artwork: ${featuredSku}`}
              </span>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="px-5 py-2 rounded-full bg-[#2C2724] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-RESOLUTION DETAIL ZOOM MODAL */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-[#1E1916] rounded-2xl border border-[#3E332C] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#3E332C] flex items-center justify-between text-[#FAF7F2]">
              <div>
                <h3 className="font-serif text-lg font-bold">{activeProduct?.name || featuredSku}</h3>
                <p className="text-xs text-[#A8988B]">High-Resolution Studio Asset (SKU: {featuredSku})</p>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-[#120F0E]">
              <img
                src={imageSrc}
                onError={(e) => {
                  e.currentTarget.src = fallbackSrc;
                }}
                alt="3D Mandala High Resolution"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t border-[#3E332C] bg-[#1A1513] flex items-center justify-between">
              <button
                onClick={() => {
                  setIsZoomModalOpen(false);
                  onSelectProduct(featuredSku);
                }}
                className="px-5 py-2 rounded-full bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B34A24] transition-colors cursor-pointer"
              >
                View in Product Catalog
              </button>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#2A221E] text-[#D1C2B5] text-xs hover:text-white transition-colors cursor-pointer"
              >
                Close Inspect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
