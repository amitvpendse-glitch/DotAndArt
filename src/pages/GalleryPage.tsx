import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ArtworkPlaceholder } from '../components/ArtworkPlaceholder';
import { SafeProductImage } from '../components/SafeProductImage';
import { safeFetchJson } from '../lib/safeFetch';

interface GalleryPageProps {
  onSelectProduct: (sku: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'mandala' | 'lippan'>('all');
  const [activeLightbox, setActiveLightbox] = useState<Product | null>(null);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((item) => {
          const primaryImg = item.images?.find((i) => i.is_primary) || item.images?.[0];

          return (
            <div
              key={item.id}
              onClick={() => setActiveLightbox(item)}
              className="group relative aspect-square rounded-2xl overflow-hidden glass-card craft-shadow hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <SafeProductImage
                src={primaryImg?.storage_path}
                alt={item.name}
                name={item.name}
                sku={item.sku}
                category_slug={item.category_slug}
                size="md"
                className="w-full h-full group-hover:scale-105 group-hover:brightness-110 group-hover:contrast-105 transition-all duration-500"
              />



              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-theme-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
                <span className="text-[10px] font-mono tracking-wider bg-white/20 px-2 py-0.5 rounded self-start">
                  {item.sku}
                </span>

                <div className="space-y-1">
                  <h4 className="font-serif text-base font-semibold leading-tight">{item.name}</h4>
                  <p className="text-[11px] opacity-80">
                    {item.base_size} • ₹{item.base_price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-theme-accent font-medium">
                  <ZoomIn className="w-4 h-4" />
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
              <div className="relative aspect-square bg-theme-page flex items-center justify-center">
                <SafeProductImage
                  src={activeLightbox.images?.[0]?.storage_path}
                  alt={activeLightbox.name}
                  name={activeLightbox.name}
                  sku={activeLightbox.sku}
                  category_slug={activeLightbox.category_slug}
                  size="lg"
                  className="w-full h-full"
                />
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
                    <div>
                      <strong className="text-theme-muted">Framing:</strong> {activeLightbox.framing}
                    </div>
                    <div>
                      <strong className="text-theme-muted">Estimated Time:</strong> {activeLightbox.creation_time}
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
    </div>
  );
};
