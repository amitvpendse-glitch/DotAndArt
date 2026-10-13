import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, MessageCircle, Heart, Star, ShieldCheck, CheckCircle2, ChevronRight, Eye, Palette, Droplets, Flame, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Category, Product, Testimonial, FAQ, WebsitePage } from '../types';
import { SafeProductImage } from '../components/SafeProductImage';
import { Huge3DBanner } from '../components/Huge3DBanner';
import { useCart } from '../context/CartContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';
import { safeFetchJson } from '../lib/safeFetch';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (sku: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { addToCart, getItemQuantity, decrementItem } = useCart();
  const { theme, setTheme, openThemeModal } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [pageData, setPageData] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes, testRes, faqRes, pageRes] = await Promise.all([
          safeFetchJson<Category[]>('/api/categories', undefined, []),
          safeFetchJson<{ products: Product[] }>('/api/products?featured=true', undefined, { products: [] }),
          safeFetchJson<Testimonial[]>('/api/testimonials', undefined, []),
          safeFetchJson<FAQ[]>('/api/faqs', undefined, []),
          safeFetchJson<WebsitePage | null>('/api/pages/home', undefined, null),
        ]);

        setCategories(Array.isArray(catRes) ? catRes : []);
        setFeaturedProducts(prodRes?.products ? prodRes.products : []);
        setTestimonials(Array.isArray(testRes) ? testRes : []);
        setFaqs(Array.isArray(faqRes) ? faqRes.slice(0, 5) : []);
        setPageData(pageRes);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Extract editable hero section or sensible fallbacks
  const heroSection = pageData?.sections?.find((s) => s.section_type === 'hero')?.content_json || {
    headline: 'Sacred Dots. Reflective Mirrors. Timeless Soul.',
    subtitle: 'Immerse your space in the meditative tranquility of authentic handmade dot mandalas and centuries-old Gujarati Lippan mud-mirror art.',
    cta_primary_text: 'Explore Catalog',
    cta_secondary_text: 'Order Bespoke Mandala',
    badge: '100% Handcrafted in India • Worldwide Shipping',
  };

  const introSection = pageData?.sections?.find((s) => s.section_type === 'craft_intro')?.content_json;
  const bulkSection = pageData?.sections?.find((s) => s.section_type === 'bulk_gifting')?.content_json;

  const handleHeroWhatsApp = () => {
    const url = createWhatsAppUrl('Hello Dot & Art! I would like to enquire about bespoke handmade mandala and Lippan commissions.');
    openExternalLink(url);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* 1. HUGE 3D SHOWCASE BANNER (DA-MD-24-0001) AFTER NAVIGATION BAR */}
      <Huge3DBanner onSelectProduct={onSelectProduct} onNavigate={onNavigate} />

      {/* 2. HERO INTRO & BRAND STORY */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--hero-bg-from)] via-[var(--bg-page)] to-[var(--bg-page)] pt-10 pb-16 sm:pt-16 sm:pb-20 border-b border-theme-glass">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-theme-accent text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
            <span>{heroSection.badge || '100% Handcrafted in India • Worldwide Shipping'}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-medium tracking-tight text-theme-primary leading-[1.15]">
            {heroSection.headline}
          </h2>

          <p className="text-base sm:text-lg text-theme-muted max-w-2xl mx-auto leading-relaxed font-light">
            {heroSection.subtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/shop')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-theme-accent hover:opacity-90 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>{heroSection.cta_primary_text || 'Explore Catalog'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/custom-order')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full glass-button text-theme-primary font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{heroSection.cta_secondary_text || 'Order Bespoke Mandala'}</span>
            </button>
          </div>

          {/* Quick Interactive Theme Switcher Bar on Home Page */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="glass-panel p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-theme-glass">
              <div className="flex items-center gap-2 text-xs font-semibold text-theme-primary">
                <Palette className="w-4 h-4 text-theme-accent" />
                <span>Switch Color Theme:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setTheme('earthy')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    theme === 'earthy'
                      ? 'bg-[#C85A32] text-white shadow-md ring-2 ring-[#C85A32]/30'
                      : 'bg-white/60 text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                  title="Earthy Terracotta & Gold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Terracotta</span>
                </button>

                <button
                  onClick={() => setTheme('sapphire')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    theme === 'sapphire'
                      ? 'bg-[#1D529E] text-white shadow-md ring-2 ring-[#1D529E]/30'
                      : 'bg-white/60 text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                  title="Pastel Blue & Royal Sapphire"
                >
                  <Droplets className="w-3 h-3" />
                  <span>Pastel Blue</span>
                </button>

                <button
                  onClick={() => setTheme('blackgold')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    theme === 'blackgold'
                      ? 'bg-[#12100E] text-[#D4A373] border border-[#D4A373] shadow-md ring-2 ring-[#D4A373]/30'
                      : 'bg-white/60 text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                  title="Theme Black + Antique Gold"
                >
                  <Sparkles className="w-3 h-3 text-[#D4A373]" />
                  <span>Black & Gold</span>
                </button>

                <button
                  onClick={openThemeModal}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-theme-accent text-white hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="View All Theme Styles & Details"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>All Styles</span>
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="pt-6 grid grid-cols-3 gap-6 border-t border-theme-glass max-w-lg mx-auto text-center">
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-theme-accent">Authentic</span>
              <p className="text-xs text-theme-muted mt-0.5">Catalog Artworks</p>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-theme-accent">50/50</span>
              <p className="text-xs text-theme-muted mt-0.5">Advance Policy</p>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-theme-accent">Worldwide</span>
              <p className="text-xs text-theme-muted mt-0.5">Air Shipping</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED SHOWCASE (FEATURED ARTWORKS - Immediately after Explore catalog) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
              Curated Showcase
            </span>
            <h2 className="font-serif text-3xl font-medium text-theme-primary mt-1">
              Featured Artworks
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-theme-accent hover:opacity-80 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => {
            const isLippan =
              product.category_slug === 'lippan-wall-hangings' ||
              product.name.toLowerCase().includes('lippan');
            const primaryImg = product.images?.find((img) => img.is_primary) || product.images?.[0];

            return (
              <div
                key={product.id}
                className="group rounded-2xl glass-card overflow-hidden transition-all duration-300 flex flex-col border border-theme-glass bg-theme-card"
              >
                {/* Visual Area */}
                <div
                  onClick={() => onSelectProduct(product.sku)}
                  className="relative aspect-square bg-theme-page overflow-hidden cursor-pointer flex items-center justify-center p-3"
                >
                  <SafeProductImage
                    src={primaryImg?.storage_path}
                    alt={primaryImg?.alt_text || product.name}
                    name={product.name}
                    sku={product.sku}
                    category_slug={product.category_slug}
                    size="md"
                    priority={index < 4}
                    fit="contain"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />



                  <div className="absolute top-3 left-3 z-30 px-2 py-0.5 rounded bg-theme-card/90 backdrop-blur-xs text-[10px] font-mono font-semibold text-theme-primary border border-theme-glass">
                    {product.sku}
                  </div>

                  {product.featured && (
                    <div className="absolute top-3 right-3 z-30 px-2 py-0.5 rounded-full bg-theme-accent text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                      Featured
                    </div>
                  )}
                </div>

                {/* Details Area */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-theme-muted font-semibold">
                      {isLippan ? 'Lippan Mud Art' : 'Dot Mandala'} • {product.base_size}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(product.sku)}
                      className="font-serif text-base font-semibold text-theme-primary group-hover:text-theme-accent transition-colors cursor-pointer mt-0.5 line-clamp-1"
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Card Action Area */}
                  {(() => {
                    const itemQty = getItemQuantity(product.id);
                    return (
                      <div className="flex items-center justify-between pt-2 border-t border-theme-glass">
                        <div>
                          <span className="text-xs text-theme-muted">Displayed Price</span>
                          <p className="font-serif text-lg font-bold text-theme-accent">
                            ₹{product.base_price.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectProduct(product.sku)}
                            className="p-2 rounded-full border border-theme-glass text-theme-primary hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {itemQty > 0 ? (
                            <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-theme-accent/15 border border-theme-accent shadow-xs">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrementItem(product);
                                }}
                                className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-1.5 text-xs font-bold text-theme-accent min-w-[1.2rem] text-center">
                                {itemQty}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                                className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="px-3.5 py-1.5 rounded-full bg-theme-accent hover:opacity-90 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              title="Add to cart"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. THE MEDITATIVE DISCIPLINE (CRAFT STORY INTRO) */}
      <section className="py-16 sm:py-24 border-y border-theme-glass relative overflow-hidden bg-gradient-to-b from-[var(--bg-page)] via-[var(--hero-bg-from)] to-[var(--bg-page)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                {introSection?.tagline || 'The Meditative Discipline'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-theme-primary leading-snug">
                {introSection?.title || 'Every Dot Placed with Breath, Patience & Devotion'}
              </h2>
              <p className="text-sm sm:text-base text-theme-muted font-light leading-relaxed">
                {introSection?.paragraph_1 ||
                  'At Dot & Art, art is not merely decoration; it is a sacred meditation. Each dot mandala begins at the central Bindu — the spark of primordial consciousness — and blossoms outward in thousands of concentric, hand-dropped acrylic droplets.'}
              </p>
              <p className="text-sm sm:text-base text-theme-muted font-light leading-relaxed">
                {introSection?.paragraph_2 ||
                  'Our Lippan Kaam honors the pastoral tribes of Kutch, where hand-kneaded organic clay relief lines cradle gleaming hand-cut mirrors that reflect light and ward off negativity. No molds, no mass production — only singular handmade devotion.'}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-6 py-3 rounded-full glass-button text-theme-primary text-xs font-semibold tracking-wide transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Read The Full Artist Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Craft Features */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl glass-card space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-theme-accent flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-theme-primary">No Mechanization</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Every circle, arc, and mirror placement is created manually using traditional dotting tools and clay kneading.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-card space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-theme-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-theme-primary">Sacred Geometry</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Designs rooted in ancient Vedic and Tibetan proportions that balance prana and harmony in living spaces.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-card space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-theme-primary">Weather Protective Seal</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Coated with professional non-yellowing artist varnish to safeguard colors and mirrors against dust and humidity.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-card space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-theme-accent flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-theme-primary">Transit Safe Crate</h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  Custom shock-absorbent multi-ply packaging ensures your delicate mirrors and artwork arrive flawless worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BESPOKE MANDALA COMMISSIONS CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-theme-dark text-white p-8 sm:p-14 overflow-hidden relative shadow-xl border border-theme-glass">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">
              Personalized Art Commissions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-white">
              Have a Specific Space, Diameter or Energy in Mind?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              From 6-inch desktop meditation plaques to monumental 48-inch feature wall centerpieces, we craft bespoke pieces tailored to your exact color palette, deity symbols, or central photos.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onNavigate('/custom-order')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-theme-accent hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Create Custom Commission
              </button>

              <button
                onClick={handleHeroWhatsApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#2C2724]" />
                <span>Discuss with Artist on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BULK & CORPORATE GIFTING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl glass-card p-8 sm:p-12 craft-shadow border border-theme-glass">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                {bulkSection?.tagline || 'Corporate, Festive & Wedding Favors'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-theme-primary">
                {bulkSection?.title || 'Artisanal Bulk Gifting That Leaves a Lasting Impression'}
              </h2>
              <p className="text-sm text-theme-muted font-light leading-relaxed">
                {bulkSection?.description ||
                  'Looking for distinctive, culturally rich return gifts for a wedding, milestone anniversary, or corporate festive celebration? We handcraft coordinated sets of mini mandalas and Lippan plaques with custom gift packaging.'}
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-theme-primary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-theme-accent" /> Tiered Bulk Pricing (10+ Units)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-theme-accent" /> Custom Gift Packaging
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-theme-accent" /> Worldwide Dispatch
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <button
                onClick={() => {
                  const url = createWhatsAppUrl(
                    'Hello Dot & Art! I would like to enquire about bulk/corporate/wedding gifting orders.'
                  );
                  openExternalLink(url);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-theme-dark text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Enquire for Bulk Gifting</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
              Collector Words
            </span>
            <h2 className="font-serif text-3xl font-medium text-theme-primary">
              Cherished in Homes Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl glass-card border border-theme-glass flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[var(--accent-gold)] text-[var(--accent-gold)]" />
                    ))}
                  </div>
                  <p className="text-xs text-theme-primary leading-relaxed italic">
                    "{t.content}"
                  </p>
                </div>
                <div className="pt-3 border-t border-theme-glass">
                  <h4 className="text-xs font-semibold text-theme-primary">{t.customer_name}</h4>
                  <span className="text-[10px] text-theme-muted">
                    {t.location} {t.artwork_purchased ? `• ${t.artwork_purchased}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. FAQ PREVIEW */}
      {faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
              Common Queries
            </span>
            <h2 className="font-serif text-3xl font-medium text-theme-primary">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group p-4 rounded-xl glass-card border border-theme-glass transition-all"
              >
                <summary className="font-serif text-base font-semibold text-theme-primary cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <ChevronRight className="w-4 h-4 text-theme-muted group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-theme-muted font-light leading-relaxed pt-2 border-t border-theme-glass">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="text-center pt-8">
            <button
              onClick={() => onNavigate('/faq')}
              className="text-xs font-bold text-theme-accent hover:opacity-80 transition-colors cursor-pointer"
            >
              View All Frequently Asked Questions →
            </button>
          </div>
        </section>
      )}

      {/* 9. WHATSAPP BOTTOM CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border-2 border-theme-glass text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#25D366]/20 text-[#128C7E] flex items-center justify-center">
            <MessageCircle className="w-6 h-6 fill-[#128C7E] text-white" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-theme-primary">
            Ready to Connect with the Artist?
          </h2>
          <p className="text-xs sm:text-sm text-theme-muted max-w-lg mx-auto font-light">
            Whether you want to confirm dimensions, request customized colors, or check delivery schedules to your city, we are happy to chat directly on WhatsApp.
          </p>
          <div className="pt-2">
            <button
              onClick={handleHeroWhatsApp}
              className="px-8 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp (+91 86521 62647)</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
