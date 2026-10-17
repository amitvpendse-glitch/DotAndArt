import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { safeFetchJson } from '../lib/safeFetch';

interface SideArtStreamsProps {
  side?: 'left' | 'right' | 'both';
  onSelectProduct?: (sku: string) => void;
}

export const SideArtStreams: React.FC<SideArtStreamsProps> = ({ side = 'both', onSelectProduct }) => {
  const [artworks, setArtworks] = useState<Product[]>([]);

  useEffect(() => {
    safeFetchJson<{ products: Product[] }>('/api/products?limit=50', undefined, { products: [] })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          setArtworks(res.products);
        }
      })
      .catch(() => {
        // Silent fallback
      });
  }, []);

  if (!artworks || artworks.length < 2) {
    return null;
  }

  // Separate into Mandalas (left) and Lippan (right) groups
  const mandalaItems = artworks.filter(
    (p) => !p.category_slug?.includes('lippan') && !p.name.toLowerCase().includes('lippan')
  );
  const lippanItems = artworks.filter(
    (p) => p.category_slug?.includes('lippan') || p.name.toLowerCase().includes('lippan')
  );

  const leftBase = mandalaItems.length > 0 ? mandalaItems : artworks;
  const rightBase = lippanItems.length > 0 ? lippanItems : artworks;

  // Multiply base items 8x so the stream contains 50+ items and covers the entire vertical length of any webpage down to the footer
  const leftLoop = [...leftBase, ...leftBase, ...leftBase, ...leftBase, ...leftBase, ...leftBase, ...leftBase, ...leftBase];
  const rightLoop = [...rightBase, ...rightBase, ...rightBase, ...rightBase, ...rightBase, ...rightBase, ...rightBase, ...rightBase];

  const handleCardClick = (sku: string) => {
    if (onSelectProduct) {
      onSelectProduct(sku);
    } else {
      window.history.pushState({}, '', `/product/${sku}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <>
      {/* LEFT SIDE WATERFALL STREAM */}
      {(side === 'left' || side === 'both') && (
        <aside
          className="hidden min-[1024px]:flex flex-col h-full shrink-0 overflow-hidden pointer-events-none select-none z-20
            w-16 lg:w-20 xl:w-28 2xl:w-36 3xl:w-44
            py-3 pl-1 lg:pl-2 xl:pl-3 2xl:pl-4 transition-all duration-300"
          aria-label="Mandala Art Stream"
        >
          <div className="sticky top-20 z-10 text-[9px] lg:text-[10px] xl:text-[11px] uppercase font-bold tracking-wider text-center text-theme-muted mb-3 py-1 px-1.5 bg-theme-glass/90 rounded-full border border-theme-glass pointer-events-auto shadow-sm truncate">
            Mandalas
          </div>

          <div className="relative flex-1 overflow-hidden w-full h-full">
            <div
              className="flex flex-col gap-2.5 lg:gap-3 xl:gap-4 animate-waterfall-down pointer-events-auto min-h-full"
              style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            >
              {leftLoop.map((item, index) => {
                const thumbUrl = `/static/assets/thumbnails/${item.sku}.jpg`;
                const fullUrl = item.images?.find((i) => i.is_primary)?.storage_path || item.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;

                return (
                  <div
                    key={`left-${item.id}-${index}`}
                    onClick={() => handleCardClick(item.sku)}
                    className="group relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden border border-theme-glass/80 bg-theme-card/90 shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1 lg:p-1.5"
                    title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                  >
                    <img
                      src={thumbUrl}
                      alt={item.name}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        if (e.currentTarget.src !== fullUrl) {
                          e.currentTarget.src = fullUrl;
                        }
                      }}
                    />

                    {/* Hover Overlay Tag */}
                    <div className="absolute inset-x-0 bottom-0 p-1 lg:p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
                      <p className="text-[9px] lg:text-[10px] font-bold line-clamp-1">{item.name}</p>
                      <p className="text-[10px] lg:text-[11px] font-serif font-semibold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      )}

      {/* RIGHT SIDE WATERFALL STREAM */}
      {(side === 'right' || side === 'both') && (
        <aside
          className="hidden min-[1024px]:flex flex-col h-full shrink-0 overflow-hidden pointer-events-none select-none z-20
            w-16 lg:w-20 xl:w-28 2xl:w-36 3xl:w-44
            py-3 pr-1 lg:pr-2 xl:pr-3 2xl:pr-4 transition-all duration-300"
          aria-label="Lippan Art Stream"
        >
          <div className="sticky top-20 z-10 text-[9px] lg:text-[10px] xl:text-[11px] uppercase font-bold tracking-wider text-center text-theme-muted mb-3 py-1 px-1.5 bg-theme-glass/90 rounded-full border border-theme-glass pointer-events-auto shadow-sm truncate">
            Lippan
          </div>

          <div className="relative flex-1 overflow-hidden w-full h-full">
            <div
              className="flex flex-col gap-2.5 lg:gap-3 xl:gap-4 animate-waterfall-up pointer-events-auto min-h-full"
              style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            >
              {rightLoop.map((item, index) => {
                const thumbUrl = `/static/assets/thumbnails/${item.sku}.jpg`;
                const fullUrl = item.images?.find((i) => i.is_primary)?.storage_path || item.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;

                return (
                  <div
                    key={`right-${item.id}-${index}`}
                    onClick={() => handleCardClick(item.sku)}
                    className="group relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden border border-theme-glass/80 bg-theme-card/90 shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1 lg:p-1.5"
                    title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                  >
                    <img
                      src={thumbUrl}
                      alt={item.name}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        if (e.currentTarget.src !== fullUrl) {
                          e.currentTarget.src = fullUrl;
                        }
                      }}
                    />

                    {/* Hover Overlay Tag */}
                    <div className="absolute inset-x-0 bottom-0 p-1 lg:p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
                      <p className="text-[9px] lg:text-[10px] font-bold line-clamp-1">{item.name}</p>
                      <p className="text-[10px] lg:text-[11px] font-serif font-semibold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
