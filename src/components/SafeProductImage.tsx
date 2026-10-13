import React, { useState } from 'react';
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
  const [useFallbackFull, setUseFallbackFull] = useState(false);

  const isLippan =
    category_slug === 'lippan-wall-hangings' ||
    name.toLowerCase().includes('lippan');

  let cleanSrc = src;
  if (cleanSrc && cleanSrc.startsWith('/public/')) {
    cleanSrc = cleanSrc.replace(/^\/public/, '');
  }

  // Generate lightweight thumbnail path for catalog & grid views (under 40KB vs 8MB original)
  const thumbnailPath = sku ? `/static/assets/thumbnails/${sku}.jpg` : undefined;

  // Prefer thumbnail for sm & md sizes unless full image is requested or thumbnail failed
  let activeSrc = cleanSrc;
  if (useThumbnail && size !== 'lg' && thumbnailPath && !useFallbackFull) {
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
      onError={() => {
        // If thumbnail failed, seamlessly try original untouched full-size image
        if (activeSrc === thumbnailPath && cleanSrc) {
          setUseFallbackFull(true);
        } else {
          setHasError(true);
        }
      }}
      className={`${
        fit === 'cover' ? 'object-cover' : 'object-contain max-w-full max-h-full'
      } transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-80'
      } ${className}`}
    />
  );
};

