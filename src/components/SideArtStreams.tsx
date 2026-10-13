import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { safeFetchJson } from '../lib/safeFetch';

interface SideArtStreamsProps {
  onSelectProduct?: (sku: string) => void;
}

export const SideArtStreams: React.FC<SideArtStreamsProps> = ({ onSelectProduct }) => {
  const [artworks, setArtworks] = useState<Product[]>([]);

  useEffect(() => {
    safeFetchJson<{ products: Product[] }>('/api/products?limit=24', undefined, { products: [] })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          setArtworks(res.products);
        }
      })
      .catch(() => {
        // Silent fallback
      });
  }, []);

  if (!artworks || artworks.length < 4) {
    return null;
  }

  // Filter or partition into Mandala (left) and Lippan (right) groups (up to 8 items each)
  const mandalaItems = artworks
    .filter((p) => !p.category_slug?.includes('lippan') && !p.name.toLowerCase().includes('lippan'))
    .slice(0, 8);
  const lippanItems = artworks
    .filter((p) => p.category_slug?.includes('lippan') || p.name.toLowerCase().includes('lippan'))
    .slice(0, 8);

  const leftGroup = mandalaItems.length >= 3 ? mandalaItems : artworks.slice(0, Math.ceil(artworks.length / 2)).slice(0, 8);
  const rightGroup = lippanItems.length >= 3 ? lippanItems : artworks.slice(Math.ceil(artworks.length / 2)).slice(0, 8);

  // Duplicate once for seamless 50% infinite keyframe loop (reduces DOM nodes by 60%)
  const leftLoop = [...leftGroup, ...leftGroup];
  const rightLoop = [...rightGroup, ...rightGroup];

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
      {/* LEFT SIDE WATERFALL STREAM - Strictly confined to outer margin to prevent overlapping */}
      <aside
        className="fixed top-32 bottom-16 z-20 hidden min-[1480px]:flex flex-col overflow-hidden pointer-events-none select-none"
        style={{
          width: 'clamp(68px, calc((100vw - 1320px) / 2), 116px)',
          left: 'max(0.75rem, calc(((100vw - 1280px) / 2 - clamp(68px, calc((100vw - 1320px) / 2), 116px)) / 2))',
          contain: 'layout paint',
        }}
        aria-label="Mandala Art Stream"
      >
        <div className="text-[9px] uppercase font-bold tracking-wider text-center text-theme-muted mb-2 py-1 px-1 bg-theme-glass/90 rounded-full border border-theme-glass pointer-events-auto shadow-xs truncate">
          Mandalas
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl border border-theme-glass/60 bg-theme-page/40 p-1" style={{ contain: 'strict' }}>
          <div
            className="flex flex-col gap-2.5 animate-waterfall-down pointer-events-auto"
            style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
          >
            {leftLoop.map((item, index) => {
              const thumbUrl = `/static/assets/thumbnails/${item.sku}.jpg`;
              const fullUrl = item.images?.find((i) => i.is_primary)?.storage_path || item.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;

              return (
                <div
                  key={`left-${item.id}-${index}`}
                  onClick={() => handleCardClick(item.sku)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-theme-glass bg-theme-card shadow-xs cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1"
                  title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                >
                  <img
                    src={thumbUrl}
                    alt={item.name}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority="low"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      if (e.currentTarget.src !== fullUrl) {
                        e.currentTarget.src = fullUrl;
                      }
                    }}
                  />

                  {/* Hover Overlay Tag */}
                  <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
                    <p className="text-[8px] font-bold line-clamp-1">{item.name}</p>
                    <p className="text-[9px] font-serif font-semibold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE WATERFALL STREAM - Strictly confined to outer margin and clears floating actions */}
      <aside
        className="fixed top-32 bottom-32 z-20 hidden min-[1480px]:flex flex-col overflow-hidden pointer-events-none select-none"
        style={{
          width: 'clamp(68px, calc((100vw - 1320px) / 2), 116px)',
          right: 'max(0.75rem, calc(((100vw - 1280px) / 2 - clamp(68px, calc((100vw - 1320px) / 2), 116px)) / 2))',
          contain: 'layout paint',
        }}
        aria-label="Lippan Art Stream"
      >
        <div className="text-[9px] uppercase font-bold tracking-wider text-center text-theme-muted mb-2 py-1 px-1 bg-theme-glass/90 rounded-full border border-theme-glass pointer-events-auto shadow-xs truncate">
          Lippan
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl border border-theme-glass/60 bg-theme-page/40 p-1" style={{ contain: 'strict' }}>
          <div
            className="flex flex-col gap-2.5 animate-waterfall-up pointer-events-auto"
            style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
          >
            {rightLoop.map((item, index) => {
              const thumbUrl = `/static/assets/thumbnails/${item.sku}.jpg`;
              const fullUrl = item.images?.find((i) => i.is_primary)?.storage_path || item.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;

              return (
                <div
                  key={`right-${item.id}-${index}`}
                  onClick={() => handleCardClick(item.sku)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-theme-glass bg-theme-card shadow-xs cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1"
                  title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                >
                  <img
                    src={thumbUrl}
                    alt={item.name}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority="low"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      if (e.currentTarget.src !== fullUrl) {
                        e.currentTarget.src = fullUrl;
                      }
                    }}
                  />

                  {/* Hover Overlay Tag */}
                  <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
                    <p className="text-[8px] font-bold line-clamp-1">{item.name}</p>
                    <p className="text-[9px] font-serif font-semibold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
