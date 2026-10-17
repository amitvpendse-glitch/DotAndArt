import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ArtworkPlaceholder } from '../components/ArtworkPlaceholder';
import { SafeProductImage } from '../components/SafeProductImage';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { AvailableBadge } from '../components/AvailableBadge';
import { safeFetchJson } from '../lib/safeFetch';
import { usePageSeo } from '../lib/usePageSeo';

interface GalleryPageProps {
  onSelectProduct: (sku: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onSelectProduct }) => {
  usePageSeo('gallery', 'High-Definition Artwork Gallery — Dot And Art');
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'mandala' | 'lippan'>('all');
  const [activeLightbox, setActiveLightbox] = useState<Product | null>(null);
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);

  useEffect(() => {
    safeFetchJson<{ products: Product[] }>('/api/products', undefined, { products: [] })
      .then((data) => setProducts(data.products || []));
  }, []);

  const filtered = products.filter((p) => {
    if (filter === 'mandala') return p.category_slug === 'mandala-wall-hangings';
    if (filter === 'lippan') return p.category_slug === 'lippan-wall-hangings';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          Collector Showcase
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          The Artwork Gallery
        </h1>
        <p className="text-sm text-theme-muted font-light leading-relaxed">
          High-definition visual archive of our handmade mandalas and Kutch Lippan mud-mirror pieces. Click any artwork to view details or enquire.
        </p>

        {/* Filter Buttons */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-theme-accent text-white shadow-xs'
                : 'glass-button text-theme-primary border border-theme-glass hover:bg-theme-accent/10'
            }`}
          >
            All Works ({products.length})
          </button>
          <button
            onClick={() => setFilter('mandala')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filter === 'mandala'
                ? 'bg-theme-accent text-white shadow-xs'
                : 'glass-button text-theme-primary border border-theme-glass hover:bg-theme-accent/10'
            }`}
          >
            Mandala Art
          </button>
          <button
            onClick={() => setFilter('lippan')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filter === 'lippan'
                ? 'bg-theme-accent text-white shadow-xs'
                : 'glass-button text-theme-primary border border-theme-glass hover:bg-theme-accent/10'
            }`}
          >
            Lippan Kaam
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
        {filtered.map((item, index) => {
          const primaryImg = item.images?.find((i) => i.is_primary) || item.images?.[0];

          return (
            <div
              key={item.id}
              onClick={() => setActiveLightbox(item)}
              className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden glass-card craft-shadow hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center p-1.5 sm:p-3"
            >
              <SafeProductImage
                src={primaryImg?.storage_path}
                alt={item.name}
                name={item.name}
                sku={item.sku}
                category_slug={item.category_slug}
                size="md"
                priority={index < 4}
                fit="contain"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />

              {/* Top Left: SKU & Available Badge */}
              <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-20 flex items-center gap-1 sm:gap-1.5 flex-wrap max-w-[88%] pointer-events-none">
                <span className="text-[8px] sm:text-[10px] font-mono tracking-wider bg-theme-card/90 backdrop-blur-md text-theme-primary px-1.5 sm:px-2 py-0.5 rounded border border-theme-glass shadow-xs">
                  {item.sku}
                </span>
                {item.show_available_badge !== false && (
                  <AvailableBadge
                    isAvailable={item.is_available !== false}
                    badgeText={item.available_badge_text}
                    unavailableText={item.unavailable_badge_text}
                    size="xs"
                  />
                )}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-theme-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 sm:p-4 flex flex-col justify-between text-white">
                <span className="text-[8px] sm:text-[10px] font-mono tracking-wider bg-white/20 px-1.5 sm:px-2 py-0.5 rounded self-start">
                  {item.sku}
                </span>

                <div className="space-y-0.5 sm:space-y-1">
                  <h4 className="font-serif text-xs sm:text-base font-semibold leading-tight line-clamp-2">{item.name}</h4>
                  <p className="text-[9px] sm:text-[11px] opacity-80">
                    {item.base_size} • ₹{item.base_price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-theme-accent font-medium">
                  <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Enlarge Preview</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {activeLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-3xl w-full glass-panel rounded-3xl overflow-hidden shadow-2xl border border-theme-glass">
            {/* Close Button */}
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-theme-card/90 hover:bg-theme-card text-theme-primary shadow-md transition-colors cursor-pointer border border-theme-glass"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image side */}
              <div
                onClick={() => setZoomedProduct(activeLightbox)}
                className="relative aspect-square bg-theme-page flex items-center justify-center cursor-zoom-in group"
              >
                <SafeProductImage
                  src={activeLightbox.images?.[0]?.storage_path}
                  alt={activeLightbox.name}
                  name={activeLightbox.name}
                  sku={activeLightbox.sku}
                  category_slug={activeLightbox.category_slug}
                  size="lg"
                  className="w-full h-full"
                />

                {/* Top Left: SKU & Available Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-theme-primary bg-theme-card/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-theme-glass shadow-xs">
                    {activeLightbox.sku}
                  </span>
                  {activeLightbox.show_available_badge !== false && (
                    <AvailableBadge
                      isAvailable={activeLightbox.is_available !== false}
                      badgeText={activeLightbox.available_badge_text}
                      unavailableText={activeLightbox.unavailable_badge_text}
                      size="sm"
                    />
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedProduct(activeLightbox);
                  }}
                  className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-amber-400 border border-amber-500/30 backdrop-blur-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg hover:scale-105"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>Zoom High-Res</span>
                </button>
              </div>

              {/* Info side */}
              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-theme-card text-theme-primary">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-theme-accent">
                      {activeLightbox.category_name}
                    </span>
                    <span className="text-theme-muted">•</span>
                    <span className="text-xs font-mono text-theme-muted bg-theme-page px-2 py-0.5 rounded border border-theme-glass">
                      {activeLightbox.sku}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-semibold text-theme-primary">
                    {activeLightbox.name}
                  </h3>

                  <p className="text-xs text-theme-muted leading-relaxed line-clamp-4">
                    {activeLightbox.description}
                  </p>

                  <div className="pt-2 space-y-1.5 text-xs text-theme-primary">
                    <div>
                      <strong className="text-theme-muted">Size:</strong> {activeLightbox.base_size}
                    </div>
                    <div>
                      <strong className="text-theme-muted">Material:</strong> {activeLightbox.material}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="text-theme-muted">Customizable:</strong> <span className="text-emerald-600 font-bold">Yes</span></div>
                      <div><strong className="text-theme-muted">Creation:</strong> {activeLightbox.creation_time}</div>
                    </div>
                    <div>
                      <strong className="text-theme-muted">Photos:</strong> {activeLightbox.photos_available_note || 'Yes'}
                    </div>
                    <div>
                      <strong className="text-theme-muted">Shipping:</strong>{' '}
                      {activeLightbox.shipping_info.toLowerCase().includes('bubble wrap')
                        ? activeLightbox.shipping_info
                        : `${activeLightbox.shipping_info} • Bubble wrap and corrugated box`}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-theme-glass flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-theme-muted">Displayed Price</span>
                    <p className="font-serif text-2xl font-bold text-theme-accent">
                      ₹{activeLightbox.base_price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const sku = activeLightbox.sku;
                      setActiveLightbox(null);
                      onSelectProduct(sku);
                    }}
                    className="px-5 py-2.5 rounded-full bg-theme-accent hover:opacity-90 text-white text-xs font-semibold shadow-xs transition-opacity cursor-pointer"
                  >
                    View Full Product Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Image Zoom Modal */}
      <ImageZoomModal
        product={zoomedProduct}
        isOpen={!!zoomedProduct}
        onClose={() => setZoomedProduct(null)}
        onSelectProduct={onSelectProduct}
      />
    </div>
  );
};
