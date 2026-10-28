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
    if (legacyPath && !isPlaceholderPath(legacyPath)) return false;
    if (p.sku && p.sku.trim()) return false;
    return true;
  }

  const hasRealPhoto = imagesList.some((img) => {
    if (!img) return false;
    const path = (img.storage_path || '').trim();
    if (!path) return false;
    return !isPlaceholderPath(path);
  });

  if (hasRealPhoto) return false;
  if (p.sku && p.sku.trim()) return false;

  return true;
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
    path.includes('logo.jpeg') ||
    path.includes('logo.webp')
  );
}

/**
 * Determines whether an artwork is High Demand.
 * Returns true if explicitly marked as is_high_demand, or if it is an artisan Lippan
 * artwork (which requires additional clay curing & mirror setting time by default).
 */
export function isProductHighDemand(p: Product | null | undefined): boolean {
  if (!p) return false;
  if (typeof p.is_high_demand === 'boolean') {
    return p.is_high_demand;
  }
  const categorySlug = (p.category_slug || '').toLowerCase();
  const categoryId = (p.category_id || '').toLowerCase();
  const categoryName = (p.category_name || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const sku = (p.sku || '').toUpperCase();

  const isLippan =
    categorySlug.includes('lippan') ||
    categoryId.includes('lippan') ||
    categoryName.includes('lippan') ||
    name.includes('lippan') ||
    sku.startsWith('DA-LP');

  return Boolean(isLippan);
}
