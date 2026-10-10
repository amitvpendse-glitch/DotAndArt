import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { LightBulbEffect } from './LightBulbEffect';

interface SideArtStreamsProps {
  onSelectProduct?: (sku: string) => void;
}

export const SideArtStreams: React.FC<SideArtStreamsProps> = ({ onSelectProduct }) => {
  const [artworks, setArtworks] = useState<Product[]>([]);

  useEffect(() => {
    safeFetchJson<{ products: Product[] }>('/api/products?limit=20', undefined, { products: [] })
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

  // Split artworks into left and right groups
  const half = Math.ceil(artworks.length / 2);
  const leftGroup = artworks.slice(0, half);
  const rightGroup = artworks.slice(half);

  // Duplicate arrays to create infinite seamless loop
  const leftLoop = [...leftGroup, ...leftGroup, ...leftGroup];
  const rightLoop = [...rightGroup, ...rightGroup, ...rightGroup];

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
      {/* LEFT SIDEWATERFALL STREAM */}
      <div className="fixed left-2 2xl:left-6 top-24 bottom-12 z-20 w-28 2xl:w-36 hidden xl:flex flex-col overflow-hidden pointer-events-none select-none">
        <div className="text-[10px] uppercase font-bold tracking-widest text-center text-theme-muted mb-2 py-1 bg-theme-glass/80 backdrop-blur-xs rounded-full border border-theme-glass pointer-events-auto shadow-xs">
          Mandala Stream
        </div>
        
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-theme-glass/60 bg-theme-page/30 backdrop-blur-2xs p-1">
          <div className="flex flex-col gap-3 animate-waterfall-down pointer-events-auto">
            {leftLoop.map((item, index) => {
              const imgUrl = item.images?.find((i) => i.is_primary)?.storage_path || item.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;
              
              return (
                <div
                  key={`left-${item.id}-${index}`}
                  onClick={() => handleCardClick(item.sku)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-theme-glass bg-theme-card shadow-md cursor-pointer hover:scale-105 hover:z-30 hover:shadow-2xl transition-all duration-300"
                  title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                >
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = `/static/assets/images/${item.sku}.jpg`;
                    }}
                  />
                  <LightBulbEffect label="Spotlight" />

                  {/* Hover Overlay Tag */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                    <p className="text-[9px] font-bold line-clamp-1">{item.name}</p>
                    <p className="text-[10px] font-serif font-semibold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE WATERFALL STREAM */}
      <div className="fixed right-2 2xl:right-6 top-24 bottom-12 z-20 w-28 2xl:w-36 hidden xl:flex flex-col overflow-hidden pointer-events-none select-none">
        <div className="text-[10px] uppercase font-bold tracking-widest text-center text-theme-muted mb-2 py-1 bg-theme-glass/80 backdrop-blur-xs rounded-full border border-theme-glass pointer-events-auto shadow-xs">
          Lippan Stream
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl border border-theme-glass/60 bg-theme-page/30 backdrop-blur-2xs p-1">
          <div className="flex flex-col gap-3 animate-waterfall-up pointer-events-auto">
            {rightLoop.map((item, index) => {
              const imgUrl = item.images?.find((i) => i.is_primary)?.storage_path || item.images?.[0]?.storage_path || `/static/assets/images/${item.sku}.jpg`;

              return (
                <div
                  key={`right-${item.id}-${index}`}
                  onClick={() => handleCardClick(item.sku)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-theme-glass bg-theme-card shadow-md cursor-pointer hover:scale-105 hover:z-30 hover:shadow-2xl transition-all duration-300"
                  title={`${item.name} — ₹${item.base_price.toLocaleString('en-IN')}`}
                >
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = `/static/assets/images/${item.sku}.jpg`;
                    }}
                  />
                  <LightBulbEffect label="Spotlight" />

                  {/* Hover Overlay Tag */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                    <p className="text-[9px] font-bold line-clamp-1">{item.name}</p>
                    <p className="text-[10px] font-serif font-semibold text-amber-300">₹{item.base_price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
