import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { isSkuBlocked } from '../lib/blockedSkus';
import { SafeProductImage } from './SafeProductImage';

interface SideArtStreamsProps {
  side?: 'left' | 'right' | 'both';
  onSelectProduct?: (sku: string) => void;
}

// Helper to construct a seamless, rich infinite loop array with at least 64 items (~8,000px height)
const createInfiniteLoop = (baseItems: Product[], minCount = 64): Product[] => {
  if (!baseItems || baseItems.length === 0) return [];
  let result: Product[] = [];
  while (result.length < minCount) {
    result = [...result, ...baseItems];
  }
  // Ensure even count for seamless keyframe loop resets
  if (result.length % 2 !== 0) {
    result = [...result, ...baseItems];
  }
  return result;
};

export const SideArtStreams: React.FC<SideArtStreamsProps> = ({ side = 'both', onSelectProduct }) => {
  const [artworks, setArtworks] = useState<Product[]>([]);
  const [stageHeight, setStageHeight] = useState<number | null>(null);

  // Smart dynamic height observer matching exact main content height
  useEffect(() => {
    const mainEl = document.getElementById('main-stage-content');

    const updateHeight = () => {
      if (mainEl) {
        setStageHeight(mainEl.clientHeight);
      }
    };

    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);

    let observer: ResizeObserver | null = null;
    if (mainEl && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(mainEl);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    safeFetchJson<{ products: Product[] }>('/api/products?limit=50', undefined, { products: [] })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          setArtworks(res.products.filter((p) => !isSkuBlocked(p?.sku, p?.id)));
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

  // Build rich 64+ item loops for both streams so they span full height and loop seamlessly
  const leftLoop = createInfiniteLoop(leftBase, 64);
  const rightLoop = createInfiniteLoop(rightBase, 64);

  const handleCardClick = (sku: string) => {
    if (onSelectProduct) {
      onSelectProduct(sku);
    } else {
      window.history.pushState({}, '', `/product/${sku}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const dynamicStyle = stageHeight && stageHeight > 100 ? { height: `${stageHeight}px` } : { height: '100%' };

  return (
    <>
      {/* LEFT SIDE WATERFALL STREAM */}
      {(side === 'left' || side === 'both') && (
        <aside
          style={dynamicStyle}
          className="hidden min-[1024px]:flex flex-col shrink-0 overflow-hidden pointer-events-none select-none z-20
            w-16 lg:w-20 xl:w-28 2xl:w-36 3xl:w-44
            py-2 pl-1 lg:pl-2 xl:pl-3 2xl:pl-4 transition-all duration-300"
          aria-label="Mandala Art Stream"
        >
          <div className="relative flex-1 overflow-hidden w-full h-full min-h-0">
            <div
              className="flex flex-col gap-2.5 lg:gap-3 xl:gap-4 animate-waterfall-left pointer-events-auto"
              style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            >
              {leftLoop.map((item, index) => {
                const primaryImg = item?.images?.find((i) => i.is_primary)?.storage_path || item?.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;

                return (
                  <div
                    key={`left-${item.id}-${index}`}
                    onClick={() => handleCardClick(item.sku)}
                    className="group relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden border border-theme-glass bg-theme-card shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1 lg:p-1.5"
                    title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                  >
                    <SafeProductImage
                      src={primaryImg}
                      alt={item.name}
                      name={item.name}
                      sku={item.sku}
                      category_slug={item.category_slug}
                      size="sm"
                      priority={index < 4}
                      className="w-full h-full object-contain"
                    />

                    {/* Hover Overlay Tag */}
                    <div className="absolute inset-x-0 bottom-0 p-1 lg:p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
                      <p className="text-[9px] lg:text-[10px] font-bold line-clamp-1">{item.name}</p>
                      <p className="text-[10px] lg:text-[11px] font-sans font-bold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
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
          style={dynamicStyle}
          className="hidden min-[1024px]:flex flex-col shrink-0 overflow-hidden pointer-events-none select-none z-20
            w-16 lg:w-20 xl:w-28 2xl:w-36 3xl:w-44
            py-2 pr-1 lg:pr-2 xl:pr-3 2xl:pr-4 transition-all duration-300"
          aria-label="Lippan Art Stream"
        >
          <div className="relative flex-1 overflow-hidden w-full h-full min-h-0">
            <div
              className="flex flex-col gap-2.5 lg:gap-3 xl:gap-4 animate-waterfall-right pointer-events-auto"
              style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            >
              {rightLoop.map((item, index) => {
                const primaryImg = item?.images?.find((i) => i.is_primary)?.storage_path || item?.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;

                return (
                  <div
                    key={`right-${item.id}-${index}`}
                    onClick={() => handleCardClick(item.sku)}
                    className="group relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden border border-theme-glass bg-theme-card shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1 lg:p-1.5"
                    title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                  >
                    <SafeProductImage
                      src={primaryImg}
                      alt={item.name}
                      name={item.name}
                      sku={item.sku}
                      category_slug={item.category_slug}
                      size="sm"
                      priority={index < 4}
                      className="w-full h-full object-contain"
                    />

                    {/* Hover Overlay Tag */}
                    <div className="absolute inset-x-0 bottom-0 p-1 lg:p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pointer-events-none">
                      <p className="text-[9px] lg:text-[10px] font-bold line-clamp-1">{item.name}</p>
                      <p className="text-[10px] lg:text-[11px] font-sans font-bold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
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
