import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { isSkuBlocked } from '../lib/blockedSkus';
import { SafeProductImage } from './SafeProductImage';

interface SideArtStreamsProps {
  side?: 'left' | 'right' | 'both';
  onSelectProduct?: (sku: string) => void;
}

export interface SideArtStreamItem {
  id: string;
  sku: string;
  name: string;
  base_price: number;
  category_slug?: string;
  imgSrc: string;
}

// Fisher-Yates array shuffle helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Helper to construct a seamless, rich infinite loop array with at least 64 items (~8,000px height)
const createInfiniteLoop = (baseItems: SideArtStreamItem[], minCount = 64): SideArtStreamItem[] => {
  if (!baseItems || baseItems.length === 0) return [];
  let result: SideArtStreamItem[] = [];
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
  const [leftLoop, setLeftLoop] = useState<SideArtStreamItem[]>([]);
  const [rightLoop, setRightLoop] = useState<SideArtStreamItem[]>([]);
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
    safeFetchJson<{ products: Product[] }>('/api/products?limit=100', undefined, { products: [] })
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          const filtered = res.products.filter((p) => !isSkuBlocked(p?.sku, p?.id));
          
          // Flatten items to include multiple artwork images across ALL categories
          const items: SideArtStreamItem[] = [];
          filtered.forEach((p) => {
            if (p.images && p.images.length > 0) {
              p.images.forEach((img, idx) => {
                if (img.storage_path) {
                  items.push({
                    id: `${p.id}-img-${idx}-${img.id || ''}`,
                    sku: p.sku,
                    name: p.name,
                    base_price: p.base_price,
                    category_slug: p.category_slug,
                    imgSrc: img.storage_path,
                  });
                }
              });
            } else {
              items.push({
                id: `${p.id}-default`,
                sku: p.sku,
                name: p.name,
                base_price: p.base_price,
                category_slug: p.category_slug,
                imgSrc: `/static/assets/images/${p.sku}.jpg`,
              });
            }
          });

          if (items.length > 0) {
            // Randomize picking across ALL categories for both streams
            const shuffledLeft = shuffleArray(items);
            const shuffledRight = shuffleArray(items);

            setLeftLoop(createInfiniteLoop(shuffledLeft, 64));
            setRightLoop(createInfiniteLoop(shuffledRight, 64));
          }
        }
      })
      .catch(() => {
        // Silent fallback
      });
  }, []);

  if (leftLoop.length === 0 && rightLoop.length === 0) {
    return null;
  }

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
          aria-label="Handcrafted Art Stream Left"
        >
          <div className="relative flex-1 overflow-hidden w-full h-full min-h-0">
            <div
              className="flex flex-col gap-2.5 lg:gap-3 xl:gap-4 animate-waterfall-left pointer-events-auto"
              style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            >
              {leftLoop.map((item, index) => (
                <div
                  key={`left-${item.id}-${index}`}
                  onClick={() => handleCardClick(item.sku)}
                  className="group relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden border border-theme-glass bg-theme-card shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1 lg:p-1.5"
                  title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                >
                  <SafeProductImage
                    src={item.imgSrc}
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
              ))}
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
          aria-label="Handcrafted Art Stream Right"
        >
          <div className="relative flex-1 overflow-hidden w-full h-full min-h-0">
            <div
              className="flex flex-col gap-2.5 lg:gap-3 xl:gap-4 animate-waterfall-right pointer-events-auto"
              style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            >
              {rightLoop.map((item, index) => (
                <div
                  key={`right-${item.id}-${index}`}
                  onClick={() => handleCardClick(item.sku)}
                  className="group relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden border border-theme-glass bg-theme-card shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center p-1 lg:p-1.5"
                  title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                >
                  <SafeProductImage
                    src={item.imgSrc}
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
              ))}
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
