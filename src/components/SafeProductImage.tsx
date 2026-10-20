import React, { useState, useEffect } from 'react';
import { ArtworkPlaceholder } from './ArtworkPlaceholder';

interface SafeProductImageProps {
  src?: string;
  alt: string;
  name: string;
  sku: string;
  category_slug?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  useThumbnail?: boolean;
  fit?: 'contain' | 'cover';
}

export const SafeProductImage: React.FC<SafeProductImageProps> = ({
  src,
  alt,
  name,
  sku,
  category_slug,
  className = '',
  size = 'md',
  priority = false,
  loading,
  useThumbnail = true,
  fit = 'contain',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFullRes, setUseFullRes] = useState(size !== 'lg');

  const isLippan =
    category_slug === 'lippan-wall-hangings' ||
    name.toLowerCase().includes('lippan');

  const appendCacheBuster = (url?: string) => {
    if (!url) return url;
    if (url.startsWith('data:') || url.startsWith('blob:') || url.includes('?')) return url;
    return `${url}?v=20261020_v3`;
  };

  let cleanSrc = src;
  if (!cleanSrc && sku) {
    cleanSrc = `/static/assets/images/${sku}.jpg`;
  }
  if (cleanSrc && cleanSrc.startsWith('/public/')) {
    cleanSrc = cleanSrc.replace(/^\/public/, '');
  }

  // Direct explicit mapping for requested SKUs
  if (sku && ['DA-MD-10-0013', 'DA-MD-10-0016', 'DA-MD-10-0017', 'DA-MD-10-0018', 'DA-MD-10-0019'].includes(sku)) {
    cleanSrc = `/static/assets/images/${sku}.jpg`;
  }

  const thumbnailPath = sku ? appendCacheBuster(`/static/assets/thumbnails/${sku}.jpg`) : undefined;
  cleanSrc = appendCacheBuster(cleanSrc);

  // For lg (zoom view), start with thumbnail instantly (0ms), then load full-res in background and switch instantly
  useEffect(() => {
    if (size === 'lg' && cleanSrc) {
      setUseFullRes(false);
      const img = new Image();
      img.src = cleanSrc;
      img.onload = () => {
        setUseFullRes(true);
      };
    }
  }, [cleanSrc, size]);

  let activeSrc = cleanSrc;
  if (!cleanSrc && useThumbnail && thumbnailPath) {
    activeSrc = thumbnailPath;
  }

  if ((!activeSrc && !cleanSrc) || hasError) {
    return (
      <ArtworkPlaceholder
        name={name}
        sku={sku}
        isLippan={isLippan}
        size={size}
        className={className}
      />
    );
  }

  const loadingStrategy = loading || (priority ? 'eager' : 'lazy');

  return (
    <img
      src={activeSrc}
      alt={alt}
      loading={loadingStrategy}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setIsLoaded(true)}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onError={() => {
        if (activeSrc === thumbnailPath && cleanSrc) {
          setUseFullRes(true);
        } else {
          setHasError(true);
        }
      }}
      className={`${
        fit === 'cover' ? 'object-cover' : 'object-contain max-w-full max-h-full'
      } transition-opacity duration-200 ${
        isLoaded ? 'opacity-100' : 'opacity-90'
      } ${className}`}
    />
  );
};
