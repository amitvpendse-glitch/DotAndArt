import React, { useState, useEffect } from 'react';
import { ArtworkPlaceholder } from './ArtworkPlaceholder';
import { getLocalArtworkImage } from '../utils/localImageCache';

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

  const EXACT_SKU_FILE_MAP: Record<string, string> = {
    'DA-LP-24X48-0001': 'DA-LP-24x48-0001.jpg',
    'DA-LP-24x48-0001': 'DA-LP-24x48-0001.jpg',
    'DA-LP-SET-0001': 'DA-LP-Set-0001.jpg',
    'DA-LP-Set-0001': 'DA-LP-Set-0001.jpg',
    'DA-LP-SET-0002': 'DA-LP-Set-0002.jpg',
    'DA-LP-Set-0002': 'DA-LP-Set-0002.jpg',
    'DA-LP-SET-0003': 'DA-LP-Set-0003.jpg',
    'DA-LP-Set-0003': 'DA-LP-Set-0003.jpg',
    'DA-MD-SET-0001': 'DA-MD-Set-0001.jpg',
    'DA-MD-Set-0001': 'DA-MD-Set-0001.jpg',
    'DA-MD-SET-7CHAKRA': 'DA-MD-Set-7Chakra.jpg',
    'DA-MD-Set-7Chakra': 'DA-MD-Set-7Chakra.jpg',
  };

  const appendCacheBuster = (url?: string) => {
    if (!url) return url;
    if (url.startsWith('data:') || url.startsWith('blob:') || url.includes('?')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${url}?v=20261026_v5`;
  };

  const cleanSku = (sku || '').trim().toUpperCase();
  const rawSku = (sku || '').trim();
  const mappedFilename = EXACT_SKU_FILE_MAP[cleanSku] || EXACT_SKU_FILE_MAP[rawSku] || (cleanSku ? `${cleanSku}.jpg` : undefined);
  const uppercaseFilename = cleanSku ? `${cleanSku}.jpg` : undefined;

  const staticArtPath = mappedFilename ? appendCacheBuster(`/static/assets/images/${mappedFilename}`) : undefined;
  const thumbnailPath = mappedFilename ? appendCacheBuster(`/static/assets/thumbnails/${mappedFilename}`) : undefined;
  const uppercaseStaticArtPath = uppercaseFilename ? appendCacheBuster(`/static/assets/images/${uppercaseFilename}`) : undefined;
  const uppercaseThumbnailPath = uppercaseFilename ? appendCacheBuster(`/static/assets/thumbnails/${uppercaseFilename}`) : undefined;

  let initialCleanSrc = src;
  if (initialCleanSrc && initialCleanSrc.startsWith('/public/')) {
    initialCleanSrc = initialCleanSrc.replace(/^\/public/, '');
  }
  if (!initialCleanSrc && cleanSku) {
    initialCleanSrc = staticArtPath;
  }

  initialCleanSrc = appendCacheBuster(initialCleanSrc);

  // Build candidate fallback chain in priority order
  const candidates: string[] = [];
  const addCandidate = (c?: string) => {
    if (c && !candidates.includes(c)) {
      candidates.push(c);
    }
  };

  // User-provided or uploaded image ALWAYS takes top priority
  addCandidate(initialCleanSrc);

  // Fallbacks if primary image fails to load
  addCandidate(staticArtPath);
  addCandidate(thumbnailPath);
  addCandidate(uppercaseStaticArtPath);
  addCandidate(uppercaseThumbnailPath);

  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [localSrc, setLocalSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setHasError(false);
    setIsLoaded(false);
    setCandidateIndex(0);
    setLocalSrc(null);

    const checkLocal = async () => {
      // If src is already a remote Supabase/cloud URL, don't override it with old local cached images
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        return;
      }
      let cached: string | null = null;
      if (src && (src.startsWith('/uploads/') || src.startsWith('data:') || src.startsWith('blob:'))) {
        cached = await getLocalArtworkImage(src);
      }
      if (!cached && cleanSku) {
        cached = await getLocalArtworkImage(cleanSku);
      }
      if (!cached && src) {
        cached = await getLocalArtworkImage(src);
      }
      if (active && cached) {
        setLocalSrc(cached);
      }
    };
    checkLocal();
    return () => {
      active = false;
    };
  }, [src, cleanSku, size]);

  const activeSrc = localSrc || candidates[candidateIndex] || candidates[0];

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

  if ((!activeSrc && !initialCleanSrc && !localSrc) || hasError) {
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
      onError={async () => {
        if (!localSrc) {
          const cached =
            (src ? await getLocalArtworkImage(src) : null) ||
            (cleanSku ? await getLocalArtworkImage(cleanSku) : null);
          if (cached) {
            setLocalSrc(cached);
            setHasError(false);
            return;
          }
        }
        if (candidateIndex + 1 < candidates.length) {
          setCandidateIndex((prev) => prev + 1);
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
