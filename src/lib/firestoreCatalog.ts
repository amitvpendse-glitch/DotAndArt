import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_PAGES, INITIAL_TESTIMONIALS, INITIAL_FAQS } from '../data/initialCatalog';
import { Product, Category, WebsiteSettings, WebsitePage, Testimonial, FAQ } from '../types';
import { isSkuBlocked } from './blockedSkus';

/**
 * Strips undefined properties recursively so Firestore does not reject payloads.
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj as Record<string, any>)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const SETTINGS_COLLECTION = 'settings';
export const PAGES_COLLECTION = 'pages';
const TESTIMONIALS_COLLECTION = 'testimonials';
const CATALOG_STATE_COLLECTION = 'catalog_state';

// In-memory cache with short TTL to avoid excessive Firestore reads while ensuring multi-device consistency
let cachedProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL to drastically reduce Firestore reads

// Quota safeguard flag to prevent quota error loops
let firestoreQuotaExceeded = false;

function checkQuotaError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg.includes('Quota limit exceeded') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('Permission denied') ||
    msg.includes('offline') ||
    msg.includes('Could not reach Cloud Firestore backend') ||
    msg.includes('Backend didn\'t respond within')
  ) {
    if (!firestoreQuotaExceeded) {
      firestoreQuotaExceeded = true;
      console.warn('[firestoreCatalog] Firestore offline or unreachable. Operating in lightning-fast local fallback mode.');
    }
  }
}

export async function getFirestoreDeletedIds(): Promise<Set<string>> {
  const defaultDeleted = new Set<string>([
    "DA-AP-10-0001", "DA-AP-10-0002", "DA-AP-10-0003", "DA-AP-10-0004", "DA-AP-10-0005",
    "prod-da-ap-10-0001", "prod-da-ap-10-0002", "prod-da-ap-10-0003", "prod-da-ap-10-0004", "prod-da-ap-10-0005"
  ]);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const delStr = localStorage.getItem('app_deleted_product_ids');
      if (delStr) {
        const parsed = JSON.parse(delStr);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => {
            if (id) {
              defaultDeleted.add(String(id));
              defaultDeleted.add(String(id).toUpperCase());
            }
          });
        }
      }
    } catch {}
  }

  if (firestoreQuotaExceeded) return defaultDeleted;

  try {
    const docRef = doc(db, CATALOG_STATE_COLLECTION, 'deleted_items');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.ids)) {
        data.ids.forEach((id: any) => {
          if (id) {
            defaultDeleted.add(String(id));
            defaultDeleted.add(String(id).toUpperCase());
          }
        });
      }
    }
  } catch (err) {
    checkQuotaError(err);
  }
  return defaultDeleted;
}

export async function addFirestoreDeletedIds(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  cachedProducts = null;

  // Sync localStorage immediately in browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const delStr = localStorage.getItem('app_deleted_product_ids');
      const parsed = delStr ? JSON.parse(delStr) : [];
      const set = new Set(Array.isArray(parsed) ? parsed : []);
      ids.forEach((id) => {
        if (id) {
          set.add(String(id));
          set.add(String(id).toUpperCase());
        }
      });
      localStorage.setItem('app_deleted_product_ids', JSON.stringify(Array.from(set)));

      const custStr = localStorage.getItem('app_custom_products');
      if (custStr) {
        const cust = JSON.parse(custStr);
        if (Array.isArray(cust)) {
          const filtered = cust.filter(
            (p) => !set.has(p.id) && !set.has(p.sku) && !set.has(String(p.sku || '').toUpperCase())
          );
          localStorage.setItem('app_custom_products', JSON.stringify(filtered));
        }
      }
    } catch {}
  }

  if (firestoreQuotaExceeded) return;

  try {
    const existing = await getFirestoreDeletedIds();
    ids.forEach((id) => {
      if (id) {
        existing.add(String(id));
        existing.add(String(id).toUpperCase());
      }
    });
    const docRef = doc(db, CATALOG_STATE_COLLECTION, 'deleted_items');
    await setDoc(docRef, { ids: Array.from(existing), updated_at: new Date().toISOString() }, { merge: true });
  } catch (err) {
    checkQuotaError(err);
  }
}

export async function removeFirestoreDeletedIds(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  cachedProducts = null;

  // Sync localStorage in browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const delStr = localStorage.getItem('app_deleted_product_ids');
      if (delStr) {
        const parsed = JSON.parse(delStr);
        if (Array.isArray(parsed)) {
          const idSet = new Set(ids.map((i) => String(i)));
          ids.forEach((i) => idSet.add(String(i).toUpperCase()));
          const filtered = parsed.filter((item) => !idSet.has(String(item)) && !idSet.has(String(item).toUpperCase()));
          localStorage.setItem('app_deleted_product_ids', JSON.stringify(filtered));
        }
      }
    } catch {}
  }

  if (firestoreQuotaExceeded) return;

  try {
    const existing = await getFirestoreDeletedIds();
    let changed = false;
    ids.forEach((id) => {
      if (!id) return;
      const strId = String(id);
      const upper = strId.toUpperCase();
      if (existing.has(strId)) {
        existing.delete(strId);
        changed = true;
      }
      if (existing.has(upper)) {
        existing.delete(upper);
        changed = true;
      }
    });
    if (changed) {
      const docRef = doc(db, CATALOG_STATE_COLLECTION, 'deleted_items');
      await setDoc(docRef, { ids: Array.from(existing), updated_at: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    checkQuotaError(err);
  }
}

/**
 * Retrieves all products from Firestore.
 * Automatically seeds initial catalog on first run if Firestore collection is empty.
 */
function getLocalCustomProducts(): Product[] {
  if (INITIAL_PRODUCTS.length === 0) return [];
  try {
    const custom = localStorage.getItem('app_custom_products');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export async function getFirestoreProducts(forceFresh = false): Promise<Product[]> {
  const now = Date.now();
  if (!forceFresh && cachedProducts && now - lastProductsFetchTime < CACHE_TTL_MS) {
    return cachedProducts;
  }

  const localCustom = getLocalCustomProducts();

  if (firestoreQuotaExceeded) {
    return [...INITIAL_PRODUCTS, ...localCustom].filter((p) => !isSkuBlocked(p?.sku, p?.id));
  }

  try {
    const deletedSet = await getFirestoreDeletedIds();
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);

    const rawItems: Product[] = [];

    if (!snap.empty) {
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        const pid = (data.id || docSnap.id || '').trim();
        const psku = (data.sku || '').trim().toUpperCase();

        if (!deletedSet.has(pid) && !deletedSet.has(psku) && !deletedSet.has(docSnap.id) && !isSkuBlocked(psku, pid)) {
          rawItems.push({
            ...data,
            id: pid,
          });
        }
      });
    }

    // Sort rawItems by updated_at descending so newest updates are processed first
    rawItems.sort((a, b) => {
      const timeA = new Date(a?.updated_at || a?.created_at || 0).getTime();
      const timeB = new Date(b?.updated_at || b?.created_at || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;
      const scoreA = (a?.images?.length || 0) + (a?.variants?.length || 0) + (a?.description ? 1 : 0);
      const scoreB = (b?.images?.length || 0) + (b?.variants?.length || 0) + (b?.description ? 1 : 0);
      return scoreB - scoreA;
    });

    const items: Product[] = [];
    const seenIds = new Set<string>();
    const seenSkus = new Set<string>();
    for (const p of rawItems) {
      const pid = (p.id || '').trim();
      const psku = (p.sku || '').trim().toUpperCase();
      if (pid && seenIds.has(pid)) continue;
      if (psku && seenSkus.has(psku)) continue;
      if (pid) seenIds.add(pid);
      if (psku) seenSkus.add(psku);
      items.push(p);
    }

    // Prioritize Firestore items over local custom and initial products
    const allSources = [...items, ...localCustom, ...INITIAL_PRODUCTS];
    allSources.sort((a, b) => {
      const timeA = new Date(a?.updated_at || a?.created_at || 0).getTime();
      const timeB = new Date(b?.updated_at || b?.created_at || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;
      const scoreA = (a?.images?.length || 0) + (a?.variants?.length || 0);
      const scoreB = (b?.images?.length || 0) + (b?.variants?.length || 0);
      return scoreB - scoreA;
    });
    const finalItems: Product[] = [];
    const seenFinalIds = new Set<string>();
    const seenFinalSkus = new Set<string>();
    for (const p of allSources) {
      if (!p) continue;
      const pid = (p.id || '').trim();
      const psku = (p.sku || '').trim().toUpperCase();
      if (deletedSet.has(pid) || deletedSet.has(psku) || isSkuBlocked(psku, pid)) continue;
      if (pid && seenFinalIds.has(pid)) continue;
      if (psku && seenFinalSkus.has(psku)) continue;
      if (pid) seenFinalIds.add(pid);
      if (psku) seenFinalSkus.add(psku);
      finalItems.push(p);
    }

    cachedProducts = finalItems;
    lastProductsFetchTime = now;
    return finalItems;
  } catch (err) {
    checkQuotaError(err);
    if (cachedProducts) return cachedProducts.filter((p) => !isSkuBlocked(p?.sku, p?.id));
    return [...INITIAL_PRODUCTS, ...getLocalCustomProducts()].filter((p) => !isSkuBlocked(p?.sku, p?.id));
  }
}

export async function getFirestoreProductById(idOrSku: string): Promise<Product | null> {
  if (firestoreQuotaExceeded) return null;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, idOrSku);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Product;
    }
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const allSnap = await getDocs(colRef);
    let found: Product | null = null;
    allSnap.forEach((d) => {
      const data = d.data() as Product;
      if (d.id === idOrSku || data.id === idOrSku || data.sku?.toUpperCase() === idOrSku.toUpperCase()) {
        found = data;
      }
    });
    return found;
  } catch (err) {
    checkQuotaError(err);
    return null;
  }
}

/**
 * Saves or updates a single product in Firestore.
 */
export async function saveFirestoreProduct(product: Product): Promise<void> {
  cachedProducts = null; // Invalidate cache immediately

  const targetSku = (product.sku || '').trim().toUpperCase();
  const targetId = (product.id || '').trim();

  // Determine doc ID in Firestore, resolving if a document already exists with this SKU or ID
  let docId = targetId;
  if (!docId || !docId.startsWith('prod-')) {
    if (targetSku) {
      docId = `prod-${targetSku.toLowerCase()}`;
    } else {
      docId = `prod-${Date.now()}`;
    }
  }

  // Sync localStorage immediately in browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const unDeleteIds = [docId, targetId, targetSku, product.sku].filter(Boolean) as string[];
      const delStr = localStorage.getItem('app_deleted_product_ids');
      if (delStr) {
        const parsed = JSON.parse(delStr);
        if (Array.isArray(parsed)) {
          const idSet = new Set(unDeleteIds.map((i) => String(i)));
          unDeleteIds.forEach((i) => idSet.add(String(i).toUpperCase()));
          const filtered = parsed.filter((item) => !idSet.has(String(item)) && !idSet.has(String(item).toUpperCase()));
          localStorage.setItem('app_deleted_product_ids', JSON.stringify(filtered));
        }
      }
      const customStr = localStorage.getItem('app_custom_products');
      let customArr: Product[] = [];
      if (customStr) {
        try {
          customArr = JSON.parse(customStr);
        } catch {}
      }
      if (!Array.isArray(customArr)) customArr = [];
      const matchIdx = customArr.findIndex(
        (p) =>
          p.id === docId ||
          p.id === targetId ||
          (p.sku && targetSku && p.sku.toUpperCase() === targetSku)
      );
      const cleanProd = { ...product, id: docId, sku: targetSku || product.sku, updated_at: new Date().toISOString() };
      if (matchIdx >= 0) {
        customArr[matchIdx] = cleanProd;
      } else {
        customArr.unshift(cleanProd);
      }
      localStorage.setItem('app_custom_products', JSON.stringify(customArr));
    } catch {}
  }

  if (firestoreQuotaExceeded) return;

  try {
    // If updating, find if an existing doc has this SKU with a different doc ID
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
      const snap = await getDocs(colRef);
      snap.forEach((d) => {
        const dData = d.data() as Product;
        if (
          d.id === targetId ||
          (targetSku && ((dData.sku && dData.sku.toUpperCase() === targetSku) || d.id.toUpperCase() === targetSku))
        ) {
          docId = d.id;
        }
      });
    } catch {}

    const docRef = doc(db, PRODUCTS_COLLECTION, docId);
    const cleaned = cleanFirestoreData({ ...product, id: docId, updated_at: new Date().toISOString() });
    await setDoc(docRef, cleaned, { merge: true });
    console.log(`[firestoreCatalog] Successfully saved product: ${docId}`);

    // Immediately remove from deleted_items so saved artwork is visible everywhere
    const unDeleteIds = [docId, targetId, product.sku, targetSku].filter(Boolean) as string[];
    await removeFirestoreDeletedIds(unDeleteIds);

    await saveFirestoreSyncFlag(true);
  } catch (err) {
    console.error(`[firestoreCatalog] Failed to save product ${product.id}:`, err);
    checkQuotaError(err);
  }
}

/**
 * Saves or updates a single product in Firestore, ensuring sync flag is updated.
 */
export async function saveFirestoreProductWithSync(product: Product): Promise<void> {
  return saveFirestoreProduct(product);
}

/**
 * Deletes products from Firestore by IDs or SKUs across all devices.
 */
export async function deleteFirestoreProducts(ids: string[], skus: string[]): Promise<number> {
  cachedProducts = null; // Invalidate cache
  const matchIds = Array.isArray(ids) ? ids : [];
  const matchSkus = Array.isArray(skus) ? skus : [];
  const allIdentifiers = [...matchIds, ...matchSkus].filter(Boolean);

  if (allIdentifiers.length === 0) return 0;

  const normalized = new Set<string>();
  allIdentifiers.forEach((item) => {
    const s = String(item).trim();
    if (s) {
      normalized.add(s);
      normalized.add(s.toUpperCase());
      normalized.add(s.toLowerCase());
    }
  });

  // 1. Immediately mark as deleted in state & localStorage
  await addFirestoreDeletedIds(Array.from(normalized));

  // Sync localStorage immediately in browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customStr = localStorage.getItem('app_custom_products');
      if (customStr) {
        const customArr = JSON.parse(customStr);
        if (Array.isArray(customArr)) {
          const filtered = customArr.filter(
            (p) =>
              !normalized.has(p.id) &&
              !normalized.has(String(p.id).toUpperCase()) &&
              !normalized.has(p.sku) &&
              !normalized.has(String(p.sku || '').toUpperCase())
          );
          localStorage.setItem('app_custom_products', JSON.stringify(filtered));
        }
      }
    } catch {}
  }

  if (firestoreQuotaExceeded) return allIdentifiers.length;

  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    let deletedCount = 0;

    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      const docId = docSnap.id;
      const dSku = (data.sku || '').trim().toUpperCase();
      const dId = (data.id || '').trim();

      const matches =
        normalized.has(docId) ||
        normalized.has(docId.toUpperCase()) ||
        normalized.has(docId.toLowerCase()) ||
        (dId && (normalized.has(dId) || normalized.has(dId.toUpperCase()) || normalized.has(dId.toLowerCase()))) ||
        (dSku && (normalized.has(dSku) || normalized.has(dSku.toUpperCase()) || normalized.has(dSku.toLowerCase())));

      if (matches) {
        batch.delete(docSnap.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      await saveFirestoreSyncFlag(true);
    }

    return deletedCount > 0 ? deletedCount : allIdentifiers.length;
  } catch (err) {
    checkQuotaError(err);
    return allIdentifiers.length;
  }
}

/**
 * Bulk updates products in Firestore.
 */
export async function updateFirestoreProducts(
  ids: string[],
  skus: string[],
  fields: Partial<Product>
): Promise<number> {
  cachedProducts = null;
  const matchIds = Array.isArray(ids) ? ids : [];
  const matchSkus = Array.isArray(skus) ? skus : [];

  if (matchIds.length === 0 && matchSkus.length === 0) return 0;

  const normalized = new Set<string>();
  [...matchIds, ...matchSkus].forEach((item) => {
    if (item) {
      const s = String(item).trim();
      normalized.add(s);
      normalized.add(s.toUpperCase());
      normalized.add(s.toLowerCase());
    }
  });

  // Sync localStorage in browser
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customStr = localStorage.getItem('app_custom_products');
      if (customStr) {
        const customArr = JSON.parse(customStr);
        if (Array.isArray(customArr)) {
          const updated = customArr.map((p) => {
            if (
              normalized.has(p.id) ||
              normalized.has(String(p.id).toUpperCase()) ||
              normalized.has(p.sku) ||
              normalized.has(String(p.sku || '').toUpperCase())
            ) {
              return { ...p, ...fields, updated_at: new Date().toISOString() };
            }
            return p;
          });
          localStorage.setItem('app_custom_products', JSON.stringify(updated));
        }
      }
    } catch {}
  }

  if (firestoreQuotaExceeded) return matchIds.length + matchSkus.length;

  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    let updatedCount = 0;

    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const cleanFields = cleanFirestoreData({ ...fields, updated_at: now });

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      const docId = docSnap.id;
      const dSku = (data.sku || '').trim().toUpperCase();
      const dId = (data.id || '').trim();

      const matches =
        normalized.has(docId) ||
        normalized.has(docId.toUpperCase()) ||
        normalized.has(docId.toLowerCase()) ||
        (dId && (normalized.has(dId) || normalized.has(dId.toUpperCase()) || normalized.has(dId.toLowerCase()))) ||
        (dSku && (normalized.has(dSku) || normalized.has(dSku.toUpperCase()) || normalized.has(dSku.toLowerCase())));

      if (matches) {
        batch.set(docSnap.ref, cleanFields, { merge: true });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      await saveFirestoreSyncFlag(true);
    }

    return updatedCount;
  } catch (err) {
    checkQuotaError(err);
    return 0;
  }
}

/**
 * Bulk imports products into Firestore.
 */
export async function bulkImportFirestoreProducts(products: Product[]): Promise<number> {
  cachedProducts = null;
  if (!products || products.length === 0) return 0;
  if (firestoreQuotaExceeded) return products.length;

  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const p of products) {
      const docId = p.id || `prod-${Date.now()}-${count}`;
      const docRef = doc(db, PRODUCTS_COLLECTION, docId);
      batch.set(docRef, cleanFirestoreData({ ...p, id: docId, updated_at: new Date().toISOString() }), { merge: true });
      count++;
    }
    await batch.commit();
    const importedIdentifiers: string[] = [];
    for (const p of products) {
      if (p.id) importedIdentifiers.push(p.id);
      if (p.sku) importedIdentifiers.push(p.sku);
    }
    await removeFirestoreDeletedIds(importedIdentifiers);
    await saveFirestoreSyncFlag(true);
    return count;
  } catch (err) {
    checkQuotaError(err);
    return 0;
  }
}

/**
 * Retrieves all categories from Firestore.
 */
export async function getFirestoreCategories(): Promise<Category[]> {
  if (firestoreQuotaExceeded) return INITIAL_CATEGORIES;
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      try {
        const batch = writeBatch(db);
        for (const cat of INITIAL_CATEGORIES) {
          const docRef = doc(db, CATEGORIES_COLLECTION, cat.id);
          batch.set(docRef, cleanFirestoreData(cat));
        }
        await batch.commit();
      } catch (seedErr) {
        checkQuotaError(seedErr);
      }
      return INITIAL_CATEGORIES;
    }
    const categories: Category[] = [];
    snap.forEach((docSnap) => categories.push(docSnap.data() as Category));
    categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return categories;
  } catch (err) {
    checkQuotaError(err);
    return INITIAL_CATEGORIES;
  }
}

/**
 * Retrieves website settings from Firestore.
 */
export async function getFirestoreSettings(): Promise<WebsiteSettings> {
  if (firestoreQuotaExceeded) return INITIAL_SETTINGS;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as WebsiteSettings;
      const merged: WebsiteSettings = {
        ...INITIAL_SETTINGS,
        ...data,
      };
      return merged;
    }
    saveFirestoreSettings(INITIAL_SETTINGS).catch(() => {});
    return INITIAL_SETTINGS;
  } catch (err) {
    checkQuotaError(err);
    return INITIAL_SETTINGS;
  }
}

export async function saveFirestoreSettings(settings: WebsiteSettings): Promise<void> {
  if (firestoreQuotaExceeded) return;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'main');
    await setDoc(docRef, cleanFirestoreData(settings), { merge: true });
    await saveFirestoreSyncFlag(true);
  } catch (err) {
    checkQuotaError(err);
  }
}

/**
 * Retrieves website CMS pages from Firestore.
 */
export async function getFirestorePages(): Promise<WebsitePage[]> {
  if (firestoreQuotaExceeded) return INITIAL_PAGES;
  try {
    const colRef = collection(db, PAGES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return INITIAL_PAGES;
    }
    const rawPages: WebsitePage[] = [];
    snap.forEach((docSnap) => rawPages.push(docSnap.data() as WebsitePage));

    rawPages.sort((a, b) => {
      const timeA = new Date(a?.updated_at || a?.created_at || 0).getTime();
      const timeB = new Date(b?.updated_at || b?.created_at || 0).getTime();
      return timeB - timeA;
    });

    const pageMap = new Map<string, WebsitePage>();
    for (const p of rawPages) {
      if (!p || !p.slug) continue;
      const slug = p.slug.toLowerCase().trim();
      if (!pageMap.has(slug)) {
        pageMap.set(slug, p);
      }
    }

    return Array.from(pageMap.values());
  } catch (err) {
    checkQuotaError(err);
    return INITIAL_PAGES;
  }
}

export async function saveFirestorePage(page: WebsitePage): Promise<void> {
  if (firestoreQuotaExceeded) return;
  try {
    const docRef = doc(db, PAGES_COLLECTION, page.slug);
    await setDoc(docRef, cleanFirestoreData({ ...page, updated_at: new Date().toISOString() }), { merge: true });
    await saveFirestoreSyncFlag(true);
  } catch (err) {
    checkQuotaError(err);
  }
}

/**
 * Retrieves testimonials from Firestore.
 */
export async function getFirestoreTestimonials(): Promise<Testimonial[]> {
  if (firestoreQuotaExceeded) return INITIAL_TESTIMONIALS;
  try {
    const colRef = collection(db, TESTIMONIALS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return INITIAL_TESTIMONIALS;
    }
    const list: Testimonial[] = [];
    snap.forEach((docSnap) => list.push(docSnap.data() as Testimonial));
    return list;
  } catch (err) {
    checkQuotaError(err);
    return INITIAL_TESTIMONIALS;
  }
}

export async function saveFirestoreTestimonial(testimonial: Testimonial): Promise<void> {
  if (firestoreQuotaExceeded) {
    console.warn('[firestoreCatalog] Quota exceeded, skipping Firestore save');
    throw new Error('Firestore quota exceeded');
  }
  try {
    console.log(`[firestoreCatalog] Attempting to save testimonial: ${testimonial.id}`);
    const docRef = doc(db, TESTIMONIALS_COLLECTION, testimonial.id);
    await setDoc(docRef, cleanFirestoreData({ ...testimonial, updated_at: new Date().toISOString() }), { merge: true });
    console.log(`[firestoreCatalog] Successfully saved testimonial: ${testimonial.id}`);
    await saveFirestoreSyncFlag(true);
  } catch (err) {
    console.error(`[firestoreCatalog] Failed to save testimonial ${testimonial.id}:`, err);
    checkQuotaError(err);
  }
}

export async function deleteFirestoreTestimonial(id: string): Promise<void> {
  if (firestoreQuotaExceeded) return;
  try {
    const docRef = doc(db, TESTIMONIALS_COLLECTION, id);
    await deleteDoc(docRef);
    await saveFirestoreSyncFlag(true);
  } catch (err) {
    checkQuotaError(err);
  }
}

export async function bulkImportFirestoreTestimonials(testimonials: Testimonial[]): Promise<void> {
  if (firestoreQuotaExceeded || !testimonials || testimonials.length === 0) return;
  try {
    const batch = writeBatch(db);
    testimonials.forEach((t) => {
      const docRef = doc(db, TESTIMONIALS_COLLECTION, t.id);
      batch.set(docRef, cleanFirestoreData(t), { merge: true });
    });
    await batch.commit();
  } catch (err) {
    checkQuotaError(err);
  }
}

export async function getFirestoreSyncFlag(): Promise<{ changed: boolean; updated_at: string }> {
  if (firestoreQuotaExceeded) return { changed: false, updated_at: new Date().toISOString() };
  try {
    const docRef = doc(db, CATALOG_STATE_COLLECTION, 'sync_flag');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as { changed: boolean; updated_at: string };
    }
  } catch (err) {
    checkQuotaError(err);
  }
  return { changed: false, updated_at: new Date().toISOString() };
}

export async function saveFirestoreSyncFlag(changed: boolean): Promise<void> {
  if (firestoreQuotaExceeded) return;
  try {
    const docRef = doc(db, CATALOG_STATE_COLLECTION, 'sync_flag');
    await setDoc(docRef, { changed, updated_at: new Date().toISOString() }, { merge: true });
  } catch (err) {
    checkQuotaError(err);
  }
}

export async function getFirestoreFAQs(): Promise<FAQ[]> {
  if (firestoreQuotaExceeded) return INITIAL_FAQS;
  try {
    const colRef = collection(db, 'faqs');
    const snap = await getDocs(colRef);
    if (snap.empty) return INITIAL_FAQS;
    const list: FAQ[] = [];
    snap.forEach((docSnap) => list.push(docSnap.data() as FAQ));
    return list.sort((a, b) => a.display_order - b.display_order);
  } catch (err) {
    checkQuotaError(err);
    return INITIAL_FAQS;
  }
}

export async function saveFirestoreFAQ(faq: FAQ): Promise<void> {
  if (firestoreQuotaExceeded) return;
  try {
    const docRef = doc(db, 'faqs', faq.id);
    await setDoc(docRef, cleanFirestoreData({ ...faq, updated_at: new Date().toISOString() }), { merge: true });
    await saveFirestoreSyncFlag(true);
  } catch (err) {
    checkQuotaError(err);
  }
}

export async function deleteFirestoreFAQ(id: string): Promise<void> {
  if (firestoreQuotaExceeded) return;
  try {
    const docRef = doc(db, 'faqs', id);
    await deleteDoc(docRef);
    await saveFirestoreSyncFlag(true);
  } catch (err) {
    checkQuotaError(err);
  }
}
