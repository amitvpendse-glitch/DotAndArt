import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Eye, ShoppingBag, Plus, Minus, Download, Check, Flame } from 'lucide-react';
import { Category, Product, Testimonial, WebsiteSettings } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { SafeProductImage } from '../components/SafeProductImage';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { HugeShowcaseBanner } from '../components/HugeShowcaseBanner';
import { useCart } from '../context/CartContext';
import { downloadArtworkImage } from '../utils/whatsapp';
import { usePageSeo } from '../lib/usePageSeo';

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
}: HomePageProps) {
  const cart = useCart();
  const addToCart = propsAddToCart || cart.addToCart;
  const decrementItem = propsDecrementItem || ((p: Product) => cart.decrementItem(p));
  const getItemQuantity = propsGetItemQuantity || cart.getItemQuantity;

  const { page: cmsPage } = usePageSeo('home', 'Dot And Art — Handcrafted Mandala & Lippan Mud Mirror Art Studio');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);
  const [downloadingSku, setDownloadingSku] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, testRes] = await Promise.all([
          safeFetchJson<{ products: Product[] }>('/api/products?featured=true', undefined, { products: [] }),
          safeFetchJson<Testimonial[]>('/api/testimonials', undefined, []),
        ]);
        setFeaturedProducts(prodRes?.products ? prodRes.products : []);
        setTestimonials(Array.isArray(testRes) ? testRes : []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'featured_artworks' || s.section_key === 'featured_sacred_artworks'
  );
  const testimonialsSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'testimonials' || s.section_key === 'testimonials'
  );

  const featuredBadge = featuredSec?.content_json?.badge_text || 'Handcrafted Collection';
  const featuredHeading = featuredSec?.content_json?.heading || 'Featured Sacred Artworks';
  const catalogLinkText = featuredSec?.content_json?.catalog_link_text || 'View Full Catalog';
  const testimonialsBadge = testimonialsSec?.content_json?.badge_text || 'Collector Words';
  const testimonialsHeading = testimonialsSec?.content_json?.heading || 'Cherished in Homes Worldwide';

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
              {featuredBadge}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-theme-primary mt-1">
              {featuredHeading}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-theme-accent hover:opacity-80 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{catalogLinkText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => {
            const isLippan =
              product.category_slug === 'lippan-wall-hangings' ||
              product.name.toLowerCase().includes('lippan') ||
              product.sku.startsWith('DA-LP');
            const isHighDemand = product.is_high_demand !== undefined ? product.is_high_demand : isLippan;
            const extraDays = product.extra_delivery_days !== undefined ? product.extra_delivery_days : 5;
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

                  {/* SKU Badge */}
                  <div className="absolute top-3 left-3 z-30">
                    <span className="px-2 py-0.5 rounded bg-theme-card/90 backdrop-blur-xs text-[10px] font-mono font-semibold text-theme-primary border border-theme-glass">
                      {product.sku}
                    </span>
                  </div>

                  {/* High Demand Badge on Thumbnail */}
                  {isHighDemand && (
                    <div className="absolute bottom-3 right-3 z-30 px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold shadow-xs flex items-center gap-1 backdrop-blur-xs">
                      <Flame className="w-3 h-3 fill-white text-white" />
                      <span>High Demand</span>
                    </div>
                  )}

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

                    {/* High Demand Positive Free-Text Notice Box */}
                    {isHighDemand && (
                      <div
                        className="p-2.5 rounded-xl border text-[10px] space-y-1 font-medium transition-colors shadow-2xs"
                        style={{
                          backgroundColor: 'var(--high-demand-bg)',
                          borderColor: 'var(--high-demand-border)',
                        }}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1 font-bold" style={{ color: 'var(--high-demand-title)' }}>
                            <Flame className="w-3 h-3 text-orange-600 fill-orange-500 shrink-0" />
                            <span>High Demand Artisan Piece</span>
                          </span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
                            style={{
                              backgroundColor: 'var(--high-demand-pill-bg)',
                              color: 'var(--high-demand-pill-text)',
                            }}
                          >
                            +{extraDays} days
                          </span>
                        </div>
                        <p className="leading-tight font-medium" style={{ color: 'var(--high-demand-text)' }}>
                          {product.high_demand_message ||
                            `✨ Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow ${extraDays} additional days for our master artist to craft and perfect your sacred piece.`}
                        </p>
                      </div>
                    )}

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
                        <div>Customizable: <strong className="text-emerald-600 font-bold">Yes</strong></div>
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
                          {/* Zoom Image Button */}
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

                          {/* Download Artwork Image Button */}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!primaryImg?.storage_path) return;
                              setDownloadingSku(product.sku);
                              try {
                                await downloadArtworkImage(
                                  primaryImg.storage_path,
                                  `${product.sku}_${product.name.replace(/\s+/g, '_')}.jpg`
                                );
                              } finally {
                                setTimeout(() => setDownloadingSku(null), 1200);
                              }
                            }}
                            disabled={downloadingSku === product.sku}
                            className={`p-2 rounded-full border border-theme-glass transition-all cursor-pointer ${
                              downloadingSku === product.sku
                                ? 'bg-emerald-600 text-white'
                                : 'text-theme-primary hover:bg-theme-glass hover:text-theme-accent'
                            }`}
                            title="Download artwork image (.jpg)"
                          >
                            {downloadingSku === product.sku ? (
                              <Check className="w-4 h-4 animate-scale-in" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
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

      {/* 3. TESTIMONIALS SECTION */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-theme-glass">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
              {testimonialsBadge}
            </span>
            <h2 className="font-serif text-3xl font-medium text-theme-primary">
              {testimonialsHeading}
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
