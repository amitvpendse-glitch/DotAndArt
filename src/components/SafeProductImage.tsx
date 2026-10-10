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
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isLippan =
    category_slug === 'lippan-wall-hangings' ||
    name.toLowerCase().includes('lippan');

  let cleanSrc = src;
  if (cleanSrc && cleanSrc.startsWith('/public/')) {
    cleanSrc = cleanSrc.replace(/^\/public/, '');
  }

  if (!cleanSrc || hasError) {
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
      src={cleanSrc}
      alt={alt}
      loading={loadingStrategy}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={`object-cover transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-90'
      } ${className}`}
    />
  );
};

