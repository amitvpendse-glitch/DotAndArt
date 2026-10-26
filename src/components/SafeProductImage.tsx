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
    return `${url}?v=20261026_v4`;
  };

  const cleanSku = (sku || '').trim().toUpperCase();
  const staticArtPath = cleanSku ? appendCacheBuster(`/static/assets/images/${cleanSku}.jpg`) : undefined;
  const thumbnailPath = cleanSku ? appendCacheBuster(`/static/assets/thumbnails/${cleanSku}.jpg`) : undefined;

  let initialCleanSrc = src;
  if (!initialCleanSrc && cleanSku) {
    initialCleanSrc = staticArtPath;
  }
  if (initialCleanSrc && initialCleanSrc.startsWith('/public/')) {
    initialCleanSrc = initialCleanSrc.replace(/^\/public/, '');
  }

  // If src is a local container /uploads/ path for an authentic catalog SKU, prefer static asset which is available on live Vercel
  if (
    initialCleanSrc &&
    initialCleanSrc.startsWith('/uploads/') &&
    cleanSku &&
    (cleanSku.startsWith('DA-') || cleanSku.startsWith('DNA-'))
  ) {
    initialCleanSrc = staticArtPath;
  }

  // Direct explicit mapping for requested SKUs
  if (cleanSku && ['DA-MD-10-0013', 'DA-MD-10-0016', 'DA-MD-10-0017', 'DA-MD-10-0018', 'DA-MD-10-0019'].includes(cleanSku)) {
    initialCleanSrc = staticArtPath;
  }

  initialCleanSrc = appendCacheBuster(initialCleanSrc);

  const [activeSrc, setActiveSrc] = useState<string | undefined>(() => {
    if (size === 'sm' && useThumbnail && thumbnailPath) {
      return thumbnailPath;
    }
    return initialCleanSrc || staticArtPath || thumbnailPath;
  });

  const [attemptCount, setAttemptCount] = useState<number>(0);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setAttemptCount(0);
    if (size === 'sm' && useThumbnail && thumbnailPath) {
      setActiveSrc(thumbnailPath);
    } else {
      setActiveSrc(initialCleanSrc || staticArtPath || thumbnailPath);
    }
  }, [src, cleanSku, size]);

  // For lg (zoom view), start with thumbnail instantly (0ms), then load full-res in background and switch instantly
  useEffect(() => {
    if (size === 'lg' && activeSrc) {
      setUseFullRes(false);
      const img = new Image();
      img.src = activeSrc;
      img.onload = () => {
        setUseFullRes(true);
      };
    }
  }, [activeSrc, size]);

  if ((!activeSrc && !initialCleanSrc) || hasError) {
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
        if (attemptCount === 0 && staticArtPath && activeSrc !== staticArtPath) {
          setAttemptCount(1);
          setActiveSrc(staticArtPath);
        } else if (attemptCount <= 1 && thumbnailPath && activeSrc !== thumbnailPath) {
          setAttemptCount(2);
          setActiveSrc(thumbnailPath);
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
