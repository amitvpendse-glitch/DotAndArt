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
}

export const SafeProductImage: React.FC<SafeProductImageProps> = ({
  src,
  alt,
  name,
  sku,
  category_slug,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  const isLippan =
    category_slug === 'lippan-wall-hangings' ||
    name.toLowerCase().includes('lippan');

  if (!src || hasError) {
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

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};
