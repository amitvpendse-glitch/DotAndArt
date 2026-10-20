/**
 * Safe fetch utility that verifies responses are JSON before parsing.
 * Integrates directly with Cloud Firestore for real-time multi-device
 * synchronization across laptop, mobile, and preview environments.
 */

import { handleClientFallbackApi } from './clientFallbackApi';
import {
  getFirestoreProducts,
  getFirestoreCategories,
  getFirestoreSettings,
  deleteFirestoreProducts,
  updateFirestoreProducts,
  saveFirestoreProduct,
} from './firestoreCatalog';

import { isSkuBlocked } from './blockedSkus';

export async function safeResponseJson<T = any>(
  res: Response,
  fallbackValue: any = null,
  options?: RequestInit,
  requestUrl?: string
): Promise<T> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        if (Array.isArray((data as any).products)) {
          (data as any).products = (data as any).products.filter((p: any) => !isSkuBlocked(p?.sku, p?.id));
          (data as any).total = (data as any).products.length;
        }
      }
      return data as T;
    }
  } catch (err) {
    console.warn('[safeResponseJson] Failed to parse JSON response', err);
  }

  // Fallback to client-side API engine if server returns non-JSON or HTML
  const fallbackData = await handleClientFallbackApi<T>(requestUrl || res.url || '', options);
  if (fallbackData !== null) {
    return fallbackData;
  }

  return fallbackValue as T;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallbackValue: any = null
): Promise<T> {
  const urlString = String(input);
  const method = (init?.method || 'GET').toUpperCase();

  // Try standard backend Express server fetch first
  try {
    const res = await fetch(input, init);
    if (res.ok) {
      const result = await safeResponseJson<T>(res, fallbackValue, init, urlString);
      if (result !== null && result !== undefined) {
        return result;
      }
    }
  } catch (netErr) {
    // Server fetch unreachable, proceed to offline/firestore fallback
  }

  // Fallback: Direct Cloud Firestore Read for Products
  if (method === 'GET' && (urlString === '/api/products' || urlString.startsWith('/api/products?') || urlString === '/api/admin/products' || urlString.startsWith('/api/admin/products?'))) {
    try {
      const allProds = await getFirestoreProducts();
      if (allProds && Array.isArray(allProds)) {
        const isAdmin = urlString.includes('/admin/');
        const urlObj = new URL(urlString, 'http://localhost');
        let list = (isAdmin ? [...allProds] : (allProds || []).filter((p) => p.is_published))
          .filter((p) => !isSkuBlocked(p?.sku, p?.id));

        const category = urlObj.searchParams.get('category');
        if (category && category !== 'all') {
          const catLower = category.toLowerCase();
          list = list.filter((p) => {
            const pSlug = (p.category_slug || '').toLowerCase();
            const pId = (p.category_id || '').toLowerCase();
            return (
              pSlug === catLower ||
              pId === catLower ||
              pSlug.includes(catLower) ||
              pId.includes(catLower) ||
              (catLower.includes('mandala') && pSlug.includes('mandala')) ||
              (catLower.includes('lippan') && pSlug.includes('lippan'))
            );
          });
        }

        const featured = urlObj.searchParams.get('featured');
        if (featured === 'true') {
          list = list.filter((p) => p.featured);
        }

        const searchQuery = urlObj.searchParams.get('search');
        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.sku?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q)
          );
        }

        const minPrice = urlObj.searchParams.get('minPrice');
        if (minPrice) {
          list = list.filter((p) => (Number(p.base_price) || 0) >= Number(minPrice));
        }

        const maxPrice = urlObj.searchParams.get('maxPrice');
        if (maxPrice) {
          list = list.filter((p) => (Number(p.base_price) || 0) <= Number(maxPrice));
        }

        const size = urlObj.searchParams.get('size');
        if (size && size !== 'all') {
          list = list.filter((p) => p.base_size?.toLowerCase().includes(size.toLowerCase()));
        }

        const sort = urlObj.searchParams.get('sort');
        if (sort === 'price_asc' || sort === 'price-low') {
          list.sort((a, b) => (Number(a.base_price) || 0) - (Number(b.base_price) || 0));
        } else if (sort === 'price_desc' || sort === 'price-high') {
          list.sort((a, b) => (Number(b.base_price) || 0) - (Number(a.base_price) || 0));
        } else if (sort === 'name_asc') {
          list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sort === 'newest') {
          list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        } else if (sort === 'featured') {
          list.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (Number(a.base_price) || 0) - (Number(b.base_price) || 0);
          });
        }

        const limit = urlObj.searchParams.get('limit');
        if (limit) {
          list = list.slice(0, Number(limit));
        }

        return { products: list, total: list.length } as unknown as T;
      }
    } catch (fsErr) {
      console.warn('[safeFetchJson] Firestore direct read error, falling back to network', fsErr);
    }
  }

  // 2. Direct Cloud Firestore Read for Single Product
  if (method === 'GET' && urlString.startsWith('/api/products/') && !urlString.includes('bulk')) {
    const skuOrId = decodeURIComponent(urlString.replace('/api/products/', '').split('?')[0]);
    try {
      const allProds = await getFirestoreProducts();
      const found = (allProds || []).find((p) => p.sku === skuOrId || p.id === skuOrId);
      if (found) {
        const related = allProds
          .filter((p) => p.category_id === found.category_id && p.id !== found.id && p.is_published)
          .slice(0, 4);
        return { product: found, related } as unknown as T;
      }
    } catch (fsErr) {
      console.warn('[safeFetchJson] Firestore product lookup error', fsErr);
    }
  }

  // 3. Direct Cloud Firestore Read for Categories
  if (method === 'GET' && (urlString === '/api/categories' || urlString === '/api/admin/categories')) {
    try {
      const cats = await getFirestoreCategories();
      if (cats && cats.length > 0) {
        return cats as unknown as T;
      }
    } catch (fsErr) {
      console.warn('[safeFetchJson] Firestore categories error', fsErr);
    }
  }

  // 4. Direct Cloud Firestore Read for Website Settings
  if (method === 'GET' && urlString === '/api/settings') {
    try {
      const settings = await getFirestoreSettings();
      if (settings) {
        return settings as unknown as T;
      }
    } catch (fsErr) {
      console.warn('[safeFetchJson] Firestore settings error', fsErr);
    }
  }

  // 5. Intercept Bulk Delete to guarantee immediate Cloud Firestore persistence across devices
  if (method === 'POST' && urlString === '/api/admin/products/bulk-delete') {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body || {};
      const matchIds = Array.isArray(body.ids) ? body.ids : [];
      const matchSkus = Array.isArray(body.skus) ? body.skus : [];
      deleteFirestoreProducts(matchIds, matchSkus).catch((e) =>
        console.error('[safeFetchJson] Firestore bulk delete sync error', e)
      );
    } catch (err) {
      console.error('[safeFetchJson] Error parsing bulk delete payload', err);
    }
  }

  // 6. Intercept Bulk Update to guarantee immediate Cloud Firestore persistence across devices
  if (method === 'PUT' && urlString === '/api/admin/products/bulk-update') {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body || {};
      const matchIds = Array.isArray(body.ids) ? body.ids : [];
      const matchSkus = Array.isArray(body.skus) ? body.skus : [];
      const fields = body.fields || {};
      updateFirestoreProducts(matchIds, matchSkus, fields).catch((e) =>
        console.error('[safeFetchJson] Firestore bulk update sync error', e)
      );
    } catch (err) {
      console.error('[safeFetchJson] Error parsing bulk update payload', err);
    }
  }

  // 7. Intercept Single Product Delete
  if (method === 'DELETE' && urlString.startsWith('/api/admin/products/')) {
    const id = urlString.replace('/api/admin/products/', '').split('?')[0];
    deleteFirestoreProducts([id], [id]).catch((e) =>
      console.error('[safeFetchJson] Firestore delete sync error', e)
    );
  }

  // 8. Standard Fetch for other API calls or fallback
  try {
    const res = await fetch(input, init);
    if (res.ok) {
      return await safeResponseJson<T>(res, fallbackValue, init, urlString);
    }
  } catch (err) {
    console.warn(`[safeFetchJson] Server fetch error for ${urlString}, switching to client engine`, err);
  }

  // Try client-side fallback API engine (e.g. for static Vercel builds or offline)
  const clientData = await handleClientFallbackApi<T>(urlString, init);
  if (clientData !== null) {
    return clientData;
  }

  return fallbackValue as T;
}
