import { Product } from '../types';

/**
 * Checks whether a product is awaiting photos, has no photo,
 * has an empty image path, or uses a default/placeholder image.
 */
export function isAwaitingPhoto(p: Product): boolean {
  if (!p) return true;

  const imagesList = Array.isArray(p?.images) ? p?.images : [];

  if (imagesList.length === 0) {
    const legacyPath = ((p as any).image_url || (p as any).image_path || '').trim();
    if (!legacyPath) return true;
    return isPlaceholderPath(legacyPath);
  }

  const hasRealPhoto = imagesList.some((img) => {
    if (!img) return false;
    const path = (img.storage_path || '').trim();
    if (!path) return false;
    return !isPlaceholderPath(path);
  });

  return !hasRealPhoto;
}

function isPlaceholderPath(pathStr: string): boolean {
  const path = pathStr.toLowerCase();
  return (
    path.includes('placeholder') ||
    path.includes('default') ||
    path.includes('dotandart_logo') ||
    path.includes('no-image') ||
    path.includes('fallback') ||
    path.includes('artwork-placeholder') ||
    path.includes('logo.jpg') ||
    path.includes('logo.png') ||
    path.includes('logo.jpeg') ||
    path.includes('logo.webp')
  );
}

