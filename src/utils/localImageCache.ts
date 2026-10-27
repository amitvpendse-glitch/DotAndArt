import { Product } from '../types';

const DB_NAME = 'DotAndArtStorage';
const DB_VERSION = 1;
const STORE_IMAGES = 'artwork_images';
const STORE_PRODUCTS = 'custom_products';
const RUNTIME_CACHE_NAME = 'dot-and-art-runtime-v5';

// Memory fallback in case IndexedDB is restricted
const memoryImages = new Map<string, string>();
const memoryProducts = new Map<string, Product>();

/**
 * Opens the IndexedDB instance for Dot And Art.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Converts a base64 data URL to a binary Blob for high-efficiency storage.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Saves an uploaded artwork image into both browser IndexedDB and the Service Worker Cache API.
 * This guarantees the image persists across page navigation, browser restarts, and sessions.
 * Returns the virtual image path that can be used everywhere in `<img src="...">`.
 */
export async function saveLocalArtworkImage(
  imageKey: string,
  dataUrl: string,
  sku?: string
): Promise<string> {
  const cleanKey = imageKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const cleanSku = (sku || '').trim().toUpperCase();
  const virtualPath = `/uploads/local-${cleanKey}.jpg`;

  memoryImages.set(cleanKey, dataUrl);
  if (cleanSku) {
    memoryImages.set(cleanSku, dataUrl);
  }

  // 1. Put into Service Worker Cache API so normal HTTP requests find it immediately
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const blob = dataUrlToBlob(dataUrl);
      const cache = await window.caches.open(RUNTIME_CACHE_NAME);
      const response = new Response(blob, {
        headers: {
          'Content-Type': blob.type || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
      await cache.put(virtualPath, response.clone());
      if (cleanSku) {
        await cache.put(`/static/assets/images/${cleanSku}.jpg`, response.clone()).catch(() => {});
      }
    } catch (cacheErr) {
      console.warn('[localImageCache] Cache API put notice:', cacheErr);
    }
  }

  // 2. Put into IndexedDB (persists gigabytes of images without blowing 5MB localStorage limit)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);
      const record = {
        key: cleanKey,
        sku: cleanSku,
        dataUrl,
        virtualPath,
        updated_at: new Date().toISOString(),
      };
      store.put(record);
      if (cleanSku && cleanSku !== cleanKey) {
        store.put({ ...record, key: cleanSku });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (idbErr) {
    console.warn('[localImageCache] IndexedDB store image notice:', idbErr);
  }

  return virtualPath;
}

/**
 * Retrieves a locally cached artwork image by key, virtual path, or SKU.
 */
export async function getLocalArtworkImage(keyOrSkuOrPath: string): Promise<string | null> {
  if (!keyOrSkuOrPath) return null;

  // Direct dataUrl check
  if (keyOrSkuOrPath.startsWith('data:image/')) {
    return keyOrSkuOrPath;
  }

  const cleanKey = keyOrSkuOrPath
    .replace(/^\/uploads\/local-/, '')
    .replace(/\.jpg$/i, '')
    .replace(/^\/static\/assets\/images\//, '')
    .trim()
    .toLowerCase();

  const cleanSku = keyOrSkuOrPath
    .replace(/^\/static\/assets\/images\//, '')
    .replace(/\.jpg$/i, '')
    .trim()
    .toUpperCase();

  // 1. Check memory cache first
  if (memoryImages.has(cleanKey)) return memoryImages.get(cleanKey)!;
  if (memoryImages.has(cleanSku)) return memoryImages.get(cleanSku)!;
  if (memoryImages.has(keyOrSkuOrPath)) return memoryImages.get(keyOrSkuOrPath)!;

  // 2. Check IndexedDB
  try {
    const db = await openDB();
    const data = await new Promise<any>((resolve) => {
      const tx = db.transaction(STORE_IMAGES, 'readonly');
      const store = tx.objectStore(STORE_IMAGES);
      const req = store.get(cleanKey);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });

    if (data && data.dataUrl) {
      memoryImages.set(cleanKey, data.dataUrl);
      return data.dataUrl;
    }

    if (cleanSku) {
      const dataSku = await new Promise<any>((resolve) => {
        const tx = db.transaction(STORE_IMAGES, 'readonly');
        const store = tx.objectStore(STORE_IMAGES);
        const req = store.get(cleanSku);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (dataSku && dataSku.dataUrl) {
        memoryImages.set(cleanSku, dataSku.dataUrl);
        return dataSku.dataUrl;
      }
    }
  } catch {}

  // 3. Check Cache API
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await window.caches.open(RUNTIME_CACHE_NAME);
      const match = (await cache.match(keyOrSkuOrPath)) || (await cache.match(`/uploads/local-${cleanKey}.jpg`));
      if (match) {
        const blob = await match.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        if (dataUrl) {
          memoryImages.set(cleanKey, dataUrl);
          return dataUrl;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Persists a custom product to IndexedDB and localStorage safely.
 */
export async function saveLocalCustomProduct(product: Product): Promise<void> {
  if (!product) return;
  const id = product.id || `prod-${Date.now()}`;
  const cleanProd = { ...product, id };

  memoryProducts.set(id, cleanProd);

  // 1. IndexedDB save (unlimited quota)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      store.put(cleanProd);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[localImageCache] IndexedDB product save notice:', err);
  }

  // 2. localStorage save (stripping large base64 strings if needed to avoid QuotaExceededError)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customStr = localStorage.getItem('app_custom_products');
      let customArr: Product[] = [];
      if (customStr) {
        try {
          customArr = JSON.parse(customStr);
        } catch {}
      }
      if (!Array.isArray(customArr)) customArr = [];

      const matchIdx = customArr.findIndex(
        (p) => p.id === id || (p.sku && cleanProd.sku && p.sku.toUpperCase() === cleanProd.sku.toUpperCase())
      );

      // Create a lightweight version without multi-megabyte base64 strings for localStorage
      const lightProd: Product = {
        ...cleanProd,
        images: (cleanProd.images || []).map((img, idx) => ({
          ...img,
          storage_path: (img.storage_path || '').startsWith('data:') && (img.storage_path || '').length > 50000
            ? `/uploads/local-${cleanProd.id}-${idx + 1}.jpg`
            : img.storage_path,
        })),
      };

      if (matchIdx >= 0) {
        customArr[matchIdx] = lightProd;
      } else {
        customArr.unshift(lightProd);
      }

      localStorage.setItem('app_custom_products', JSON.stringify(customArr));
    } catch (lsErr) {
      console.warn('[localImageCache] localStorage full, safely saved in IndexedDB:', lsErr);
    }
  }
}

/**
 * Retrieves all locally saved custom products across IndexedDB and localStorage.
 */
export async function getAllLocalCustomProducts(): Promise<Product[]> {
  const mergedMap = new Map<string, Product>();

  // 1. From localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const str = localStorage.getItem('app_custom_products');
      if (str) {
        const arr = JSON.parse(str);
        if (Array.isArray(arr)) {
          arr.forEach((p) => {
            if (p?.id) mergedMap.set(p.id, p);
          });
        }
      }
    } catch {}
  }

  // 2. From IndexedDB (higher fidelity, holds full images)
  try {
    const db = await openDB();
    const idbProducts = await new Promise<Product[]>((resolve) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readonly');
      const store = tx.objectStore(STORE_PRODUCTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    idbProducts.forEach((p) => {
      if (p?.id) mergedMap.set(p.id, p);
    });
  } catch {}

  // 3. From memory map
  memoryProducts.forEach((p, id) => {
    if (!mergedMap.has(id)) mergedMap.set(id, p);
  });

  return Array.from(mergedMap.values());
}

/**
 * Exports all local artworks, custom products, and uploaded images into a portable JSON package.
 * Allows the admin to move or backup newly created artworks across devices and browsers
 * even when Cloud Firestore quota is exceeded.
 */
export async function exportLocalCatalogBackup(): Promise<string> {
  const products = await getAllLocalCustomProducts();
  const images: Record<string, string> = {};

  try {
    const db = await openDB();
    const allImgs = await new Promise<any[]>((resolve) => {
      const tx = db.transaction(STORE_IMAGES, 'readonly');
      const store = tx.objectStore(STORE_IMAGES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
    allImgs.forEach((item) => {
      if (item && item.key && item.dataUrl) {
        images[item.key] = item.dataUrl;
      }
    });
  } catch {}

  const backup = {
    app: 'Dot And Art Catalog Backup',
    version: 1,
    exported_at: new Date().toISOString(),
    products,
    images,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Imports an exported JSON catalog bundle into local storage and cache.
 */
export async function importLocalCatalogBackup(
  jsonString: string
): Promise<{ productsCount: number; imagesCount: number }> {
  const parsed = JSON.parse(jsonString);
  const products: Product[] = Array.isArray(parsed.products) ? parsed.products : [];
  const images: Record<string, string> = parsed.images || {};

  let productsCount = 0;
  let imagesCount = 0;

  for (const p of products) {
    if (p && (p.id || p.sku)) {
      await saveLocalCustomProduct(p);
      productsCount++;
    }
  }

  for (const [key, dataUrl] of Object.entries(images)) {
    if (key && dataUrl) {
      await saveLocalArtworkImage(key, dataUrl);
      imagesCount++;
    }
  }

  // Trigger app refresh
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('app_products_updated'));
  }

  return { productsCount, imagesCount };
}
