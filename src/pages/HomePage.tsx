import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, MessageCircle, Heart, Star, ShieldCheck, CheckCircle2, ChevronRight, Eye, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Category, Product, Testimonial, FAQ, WebsitePage } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { SafeProductImage } from '../components/SafeProductImage';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { HugeShowcaseBanner } from '../components/HugeShowcaseBanner';
import { createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectProduct: (sku: string) => void;
  addToCart?: (product: Product) => void;
  decrementItem?: (product: Product) => void;
  getItemQuantity?: (productId: string) => number;
  cartItemsCount?: number;
}

export function HomePage({
  onNavigate,
  onSelectProduct,
  addToCart: propsAddToCart,
  decrementItem: propsDecrementItem,
  getItemQuantity: propsGetItemQuantity,
  cartItemsCount = 0,
}: HomePageProps) {
  const cart = useCart();
  const addToCart = propsAddToCart || cart.addToCart;
  const decrementItem = propsDecrementItem || ((p: Product) => cart.decrementItem(p));
  const getItemQuantity = propsGetItemQuantity || cart.getItemQuantity;

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [pageData, setPageData] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);

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

  const handleHeroWhatsApp = () => {
    const url = createWhatsAppUrl('Hello Dot And Art! I would like to enquire about your mandalas & Lippan art.');
    openExternalLink(url);
  };

  const sectionsList = pageData?.sections || [];
  const introSection = (pageData as any)?.content_json?.sections?.intro || sectionsList.find((s: any) => s.section_type === 'intro');
  const bulkSection = (pageData as any)?.content_json?.sections?.bulk || sectionsList.find((s: any) => s.section_type === 'bulk');

  return (
    <div className="min-h-screen">
      <HugeShowcaseBanner
        onNavigate={onNavigate}
        onSelectProduct={onSelectProduct}
      />

      {/* Featured Products Section Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-theme-glass gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
              Handcrafted Collection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-theme-primary mt-1">
              Featured Sacred Artworks
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

                {/* Details Area with authentic specifications */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-theme-muted font-semibold">
                      <span>{isLippan ? 'Lippan Wall Hanging' : 'Mandala Wall Hanging'}</span>
                      <span className="font-mono text-theme-accent font-bold px-1.5 py-0.5 rounded bg-theme-accent/10 border border-theme-glass">
                        {product.sku}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product.sku)}
                      className="font-serif text-base font-semibold text-theme-primary group-hover:text-theme-accent transition-colors cursor-pointer leading-tight"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-theme-muted font-light line-clamp-1">
                      {product.description}
                    </p>

                    {/* Detailed Specifications Box */}
                    <div className="pt-2 border-t border-theme-glass space-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-theme-muted">Size:</span>
                        <span className="font-semibold text-theme-primary">{product.base_size}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-theme-muted shrink-0">Material:</span>
                        <span className="font-medium text-theme-primary text-right text-[10px] leading-tight line-clamp-1" title={product.material}>
                          {product.material}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-theme-muted pt-0.5">
                        <div>Creation: <strong className="text-theme-primary">{product.creation_time}</strong></div>
                        <div>Customizable: <strong className="text-emerald-600">Yes</strong></div>
                      </div>
                      <div className="text-[10px] text-theme-muted truncate" title="Worldwide shipping in bubble wrap and corrugated box">
                        Shipping: <strong className="text-theme-primary">Bubble wrap & corrugated box</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Area */}
                  {(() => {
                    const itemQty = getItemQuantity(product.id);
                    return (
                      <div className="flex items-center justify-between pt-2 border-t border-theme-glass">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-theme-muted font-semibold">Price</span>
                          <p className="font-serif text-lg font-bold text-theme-accent">
                            ₹{product.base_price.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomedProduct(product);
                            }}
                            className="p-2 rounded-full border border-theme-glass text-theme-primary hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
                            title="Zoom and inspect artwork image"
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
                  'At Dot And Art, art is not merely decoration; it is a sacred meditation. Each dot mandala begins at the central Bindu — the spark of primordial consciousness — and blossoms outward in thousands of concentric, hand-dropped acrylic droplets.'}
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-theme-dark text-white p-8 sm:p-14 overflow-hidden relative shadow-xl border border-theme-glass">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">
              Personalized Art Commissions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-white">
              Have a Specific Space, Diameter or Energy in Mind?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              From 10-inch sacred meditation wall hangings to grand 30-inch feature wall centerpieces, we craft bespoke pieces tailored to your exact color preferences, deity symbols, or central photos.
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                    'Hello Dot And Art! I would like to enquire about bulk/corporate/wedding gifting orders.'
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      {/* Image Zoom Modal for Catalog Items */}
      <ImageZoomModal
        product={zoomedProduct}
        isOpen={!!zoomedProduct}
        onClose={() => setZoomedProduct(null)}
        onSelectProduct={onSelectProduct}
      />
    </div>
  );
}
