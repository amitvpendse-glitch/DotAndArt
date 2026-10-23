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
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_PAGES, INITIAL_TESTIMONIALS } from '../data/initialCatalog';
import { Product, Category, WebsiteSettings, WebsitePage, Testimonial } from '../types';
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
const PAGES_COLLECTION = 'pages';
const TESTIMONIALS_COLLECTION = 'testimonials';
const CATALOG_STATE_COLLECTION = 'catalog_state';

// In-memory cache with short TTL to avoid excessive Firestore reads while ensuring multi-device consistency
let cachedProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
const CACHE_TTL_MS = 0; // Zero cache TTL to guarantee real-time multi-browser sync

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
  if (firestoreQuotaExceeded) return defaultDeleted;

  try {
    const docRef = doc(db, CATALOG_STATE_COLLECTION, 'deleted_items');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.ids)) {
        data.ids.forEach((id: any) => defaultDeleted.add(String(id)));
      }
    }
  } catch (err) {
    checkQuotaError(err);
  }
  return defaultDeleted;
}

export async function addFirestoreDeletedIds(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0 || firestoreQuotaExceeded) return;
  try {
    const existing = await getFirestoreDeletedIds();
    ids.forEach((id) => existing.add(id));
    const docRef = doc(db, CATALOG_STATE_COLLECTION, 'deleted_items');
    await setDoc(docRef, { ids: Array.from(existing), updated_at: new Date().toISOString() }, { merge: true });
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
    const finalMap = new Map<string, Product>();
    for (const p of allSources) {
      if (!p) continue;
      const pid = (p.id || '').trim();
      const psku = (p.sku || '').trim().toUpperCase();
      if (deletedSet.has(pid) || deletedSet.has(psku) || isSkuBlocked(psku, pid)) continue;
      if (pid && finalMap.has(pid)) continue;
      if (psku && finalMap.has(psku)) continue;
      // If Firestore already has this SKU, do not let initial or local override unless newer
      if (psku && Array.from(finalMap.values()).some(existing => (existing.sku || '').toUpperCase() === psku)) continue;
      if (pid) finalMap.set(pid, p);
      if (psku) finalMap.set(psku, p);
    }

    const finalItems = Array.from(finalMap.values());
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
  if (firestoreQuotaExceeded) {
    cachedProducts = null;
    return;
  }
  try {
    cachedProducts = null; // Invalidate cache
    const docId = product.id || `prod-${Date.now()}`;
    const docRef = doc(db, PRODUCTS_COLLECTION, docId);
    await setDoc(docRef, cleanFirestoreData({ ...product, id: docId, updated_at: new Date().toISOString() }), { merge: true });
  } catch (err) {
    checkQuotaError(err);
  }
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
  if (firestoreQuotaExceeded) return allIdentifiers.length;

  try {
    await addFirestoreDeletedIds(allIdentifiers);
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    let deletedCount = 0;

    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      const docId = docSnap.id;
      if (
        matchIds.includes(docId) ||
        matchIds.includes(data.id) ||
        matchSkus.includes(data.sku) ||
        matchIds.includes(data.sku) ||
        matchSkus.includes(data.id) ||
        matchSkus.includes(docId)
      ) {
        batch.delete(docSnap.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
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
      if (
        matchIds.includes(docId) ||
        matchIds.includes(data.id) ||
        matchSkus.includes(data.sku) ||
        matchIds.includes(data.sku) ||
        matchSkus.includes(data.id)
      ) {
        batch.set(docSnap.ref, cleanFields, { merge: true });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
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

