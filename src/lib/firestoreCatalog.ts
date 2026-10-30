import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_PAGES, INITIAL_TESTIMONIALS, INITIAL_FAQS } from '../data/initialCatalog';
import { Product, Category, WebsiteSettings, WebsitePage, Testimonial, FAQ, MediaAsset } from '../types';
import { isSkuBlocked } from './blockedSkus';
import { clearLocalArtworkImage } from '../utils/localImageCache';

/**
 * Supabase + Smart Local Cache Adapter
 * Completely disconnected from Firebase / Firestore.
 */

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  
  if (typeof process !== 'undefined' && process.env && !process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('dotenv').config();
    } catch {}
  }

  const rawUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://faijoouprxkttsfrajya.supabase.co';
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
  const supabaseKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaWpvb3VwcnhrdHRzZnJhanlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMzE2ODcsImV4cCI6MjEwODcwNzY4N30.dpQTTxbPZHp_yff109modnbzTRdCg0T0_zU8G_mmjFY';

  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.warn('[supabaseCatalogAdapter] Supabase client init notice:', err);
    }
  }
  return supabase;
}

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

export const PAGES_COLLECTION = 'pages';
export const MEDIA_ASSETS_COLLECTION = 'media_assets';

export let firestoreQuotaExceeded = false; // Always false now that Firebase is disconnected

export function checkQuotaError(_err: unknown) {
  // Firebase disconnected - no quota error tracking needed
}

export function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallbackValue);
    }, ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }).catch((err) => {
      clearTimeout(timer);
      throw err;
    }),
    timeoutPromise,
  ]);
}

export async function getFirestoreDeletedIds(): Promise<Set<string>> {
  const defaultDeleted = new Set<string>([
    "DA-AP-10-0001", "DA-AP-10-0002", "DA-AP-10-0003", "DA-AP-10-0004", "DA-AP-10-0005",
    "prod-da-ap-10-0001", "prod-da-ap-10-0002", "prod-da-ap-10-0003", "prod-da-ap-10-0004", "prod-da-ap-10-0005",
    "DA-TC-CS-0001-AMIT", "prod-tc-3-1793234378011",
    "DA-TC-CS-0001-COPY-304", "DA-TC-CS-0001-COPY-585"
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
  return defaultDeleted;
}

export async function addFirestoreDeletedIds(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
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
    } catch {}
  }
}

export async function removeFirestoreDeletedIds(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
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
}

export function getLocalCustomProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const custom = localStorage.getItem('app_custom_products');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => p && !isSkuBlocked(p.sku, p.id));
      }
    }
  } catch {}
  return [];
}

let cachedProducts: Product[] | null = null;
let lastProductsFetchTime = 0;
const CACHE_TTL_MS = 3000; // 3 second smart cache TTL to ensure instant Supabase sync across pages/devices

export function invalidateProductsCache(): void {
  cachedProducts = null;
  lastProductsFetchTime = 0;
}

/**
 * Retrieves all products from Supabase with smart local cache fallback
 */
export async function getFirestoreProducts(forceFresh = false): Promise<Product[]> {
  const now = Date.now();
  if (!forceFresh && cachedProducts && now - lastProductsFetchTime < CACHE_TTL_MS) {
    return cachedProducts;
  }

  const localCustom = getLocalCustomProducts();
  const sb = getSupabase();
  const deletedSet = await getFirestoreDeletedIds();

  if (sb) {
    try {
      const { data, error } = await sb.from('products').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const items: Product[] = data
          .map((row: any) => ({
            id: row.id,
            sku: row.sku,
            name: row.name,
            short_description: row.short_description || '',
            description: row.description || '',
            category_id: row.category_id || 'cat-mandala',
            category_name: row.category_name || '',
            category_slug: row.category_slug || '',
            material: row.material || '',
            framing: row.framing || '',
            customizable: row.customizable !== false,
            creation_time: row.creation_time || '',
            shipping_info: row.shipping_info || '',
            special_information: row.special_information || '',
            featured: Boolean(row.featured),
            is_published: row.is_published !== false,
            is_available: row.is_available !== false,
            available_badge_text: row.available_badge_text || 'Available',
            unavailable_badge_text: row.unavailable_badge_text || 'Made to Order',
            show_available_badge: row.show_available_badge !== false,
            is_high_demand: Boolean(row.is_high_demand),
            extra_delivery_days: Number(row.extra_delivery_days) || 0,
            high_demand_message: row.high_demand_message || '',
            base_price: Number(row.base_price) || 0,
            base_size: row.base_size || '12 inches',
            images: Array.isArray(row.images) ? row.images : [],
            variants: Array.isArray(row.variants) ? row.variants : [],
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString(),
          }))
          .filter((p) => !deletedSet.has(p.id) && !deletedSet.has(p.sku) && !isSkuBlocked(p.sku, p.id));

        // Supabase is authoritative source of truth: synchronize directly with DB
        cachedProducts = items;
        lastProductsFetchTime = now;

        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            // Overwrite and clean out any stale or deleted products in browser local storage
            localStorage.setItem('app_custom_products', JSON.stringify(items));
          } catch {}
        }

        return items;
      }
    } catch (err) {
      console.warn('[Supabase] Products query fallback to local cache:', err);
    }
  }

  // Fallback to initial catalog first, then local custom edits (taking precedence)
  const fallbackMap = new Map<string, Product>();
  INITIAL_PRODUCTS.forEach((p) => {
    if (p && (p.id || p.sku)) {
      fallbackMap.set(p.sku ? p.sku.toUpperCase() : p.id, p);
    }
  });
  localCustom.forEach((p) => {
    if (p && (p.id || p.sku)) {
      fallbackMap.set(p.sku ? p.sku.toUpperCase() : p.id, p);
    }
  });

  const result = Array.from(fallbackMap.values()).filter((p) => !isSkuBlocked(p?.sku, p?.id));
  cachedProducts = result;
  lastProductsFetchTime = now;
  return result;
}


export async function getFirestoreProductById(idOrSku: string): Promise<Product | null> {
  if (!idOrSku) return null;
  const list = await getFirestoreProducts();
  const search = idOrSku.trim().toUpperCase();
  return list.find((p) => p.sku?.toUpperCase() === search || p.id?.toUpperCase() === search) || null;
}

/**
 * Save / Upsert Product to Supabase & Local Cache
 */
export async function saveFirestoreProduct(product: Product): Promise<void> {
  if (!product) return;
  console.log(`[SupabaseCatalog] saveFirestoreProduct called for SKU: ${product.sku}, name: ${product.name}, price: ${product.base_price}`);
  invalidateProductsCache();

  // Check if product is in deleted set or blocked, if so, ensure it is deleted from Supabase and abort save
  const deletedSet = await getFirestoreDeletedIds();
  if (deletedSet.has(product.id) || (product.sku && deletedSet.has(product.sku.toUpperCase())) || isSkuBlocked(product.sku, product.id)) {
      console.warn(`[SupabaseCatalog] Product ${product.sku} is marked as deleted/blocked. Ensuring deletion from Supabase.`);
      await deleteFirestoreProducts([product.id], [product.sku || '']).catch((err) => console.warn('Firestore forced delete error', err));
      return;
  }
  
  await clearLocalArtworkImage(product.sku || product.id);

  // 1. Local Storage Cache
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customStr = localStorage.getItem('app_custom_products');
      let customArr: Product[] = customStr ? JSON.parse(customStr) : [];
      if (!Array.isArray(customArr)) customArr = [];

      const targetSku = (product.sku || '').trim().toUpperCase();
      const targetId = (product.id || '').trim();

      const idx = customArr.findIndex(
        (p) =>
          (targetId && p.id === targetId) ||
          (targetSku && (p.sku || '').trim().toUpperCase() === targetSku)
      );

      if (idx >= 0) {
        customArr[idx] = product;
      } else {
        customArr.push(product);
      }
      localStorage.setItem('app_custom_products', JSON.stringify(customArr));
      console.log(`[SupabaseCatalog] Successfully updated local storage cache for SKU: ${targetSku}`);
    } catch (e) {
      console.warn('[SupabaseCatalog] Local storage cache update error:', e);
    }
  }

  // 2. Supabase Cloud Sync
  const sb = getSupabase();
  if (sb) {
    try {
      const sku = (product.sku || '').trim().toUpperCase();
      const payload: Record<string, any> = {
        id: product.id || `prod-${sku.toLowerCase()}`,
        sku,
        name: product.name,
        short_description: product.short_description || '',
        description: product.description || '',
        category_id: product.category_id || 'cat-mandala',
        category_name: product.category_name || '',
        category_slug: product.category_slug || '',
        material: product.material || '',
        framing: product.framing || '',
        customizable: product.customizable !== false,
        creation_time: product.creation_time || '',
        shipping_info: product.shipping_info || '',
        special_information: product.special_information || '',
        featured: Boolean(product.featured),
        is_published: product.is_published !== false,
        is_available: product.is_available !== false,
        available_badge_text: product.available_badge_text || 'Available',
        unavailable_badge_text: product.unavailable_badge_text || 'Made to Order',
        show_available_badge: product.show_available_badge !== false,
        is_high_demand: Boolean(product.is_high_demand),
        extra_delivery_days: Number(product.extra_delivery_days) || 0,
        high_demand_message: product.high_demand_message || '',
        base_price: Number(product.base_price) || 0,
        base_size: product.base_size || '12 inches',
        images: Array.isArray(product.images) ? product.images : [],
        variants: Array.isArray(product.variants) ? product.variants : [],
        updated_at: new Date().toISOString(),
      };

      // SKU-centric Upsert: Find existing record by SKU to ensure stable identity and prevent 409s
      let { data: existingSkuRow } = await sb.from('products').select('id').eq('sku', sku).maybeSingle();
      
      let res;
      if (existingSkuRow && existingSkuRow.id) {
        // Update existing record by SKU (even if the ID in the payload is different)
        payload.id = existingSkuRow.id; // Ensure we update the correct ID
        res = await sb.from('products').update(payload).eq('id', existingSkuRow.id).select();
      } else {
        // Check for ID collision if no SKU match found
        let { data: existingIdRow } = await sb.from('products').select('id').eq('id', payload.id).maybeSingle();
        if (existingIdRow && existingIdRow.id) {
          res = await sb.from('products').update(payload).eq('id', payload.id).select();
        } else {
          res = await sb.from('products').insert(payload).select();
        }
      }

      const upsertErr = res.error;
      const data = res.data;
      
      if (upsertErr) {
        if (upsertErr.code === '42501' || upsertErr.message?.includes('row-level security')) {
          console.warn(`[SupabaseCatalog] RLS Policy Notice (Error 42501): Supabase Row-Level Security is blocking writes from the anon key for SKU ${sku}. Saved successfully to local cache.`);
        } else {
          console.warn('[SupabaseCatalog] Upsert warning for SKU', sku, ':', upsertErr);
        }
      } else {
        console.log('[SupabaseCatalog] Successfully synced SKU', sku, 'to Supabase database:', data);
      }
    } catch (e) {
      console.warn('[SupabaseCatalog] Save product exception warning:', e);
    }
  } else {
    console.warn('[SupabaseCatalog] getSupabase() returned null. Supabase client not initialized.');
  }
}

export async function deleteFirestoreProducts(ids: string[], skus: string[] = []): Promise<void> {
  cachedProducts = null;
  await addFirestoreDeletedIds([...ids, ...skus]);
  
  for (const sku of skus) {
      await clearLocalArtworkImage(sku);
  }
  for (const id of ids) {
      await clearLocalArtworkImage(id);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customStr = localStorage.getItem('app_custom_products');
      if (customStr) {
        const parsed = JSON.parse(customStr);
        if (Array.isArray(parsed)) {
          const idSet = new Set(ids.map((i) => String(i).toUpperCase()));
          const skuSet = new Set(skus.map((s) => String(s).toUpperCase()));
          ids.forEach((i) => idSet.add(String(i).toUpperCase()));
          skus.forEach((s) => skuSet.add(String(s).toUpperCase()));

          const filtered = parsed.filter((p: any) => {
            const pid = String(p.id || '').toUpperCase();
            const psku = String(p.sku || '').toUpperCase();
            return !idSet.has(pid) && !skuSet.has(psku);
          });
          localStorage.setItem('app_custom_products', JSON.stringify(filtered));
        }
      }
    } catch {}
  }

  const sb = getSupabase();
  if (sb) {
    try {
      if (ids.length > 0) {
        const { data: existing } = await sb.from('products').select('id').in('id', ids);
        if (existing && existing.length > 0) {
            const { error } = await sb.from('products').delete().in('id', existing.map(e => e.id));
            if (error) console.warn('[Supabase] Delete ID error', error);
        }
      }
      if (skus.length > 0) {
        const { data: existing } = await sb.from('products').select('sku').in('sku', skus);
        if (existing && existing.length > 0) {
            const { error } = await sb.from('products').delete().in('sku', existing.map(e => e.sku));
            if (error) console.warn('[Supabase] Delete SKU error', error);
        }
      }
    } catch (e) {
      console.warn('[Supabase] Delete products error:', e);
    }
  }
}

export async function updateFirestoreProducts(ids: string[], skus: string[], fields: Record<string, any>): Promise<void> {
  cachedProducts = null;
  const sb = getSupabase();
  if (sb) {
    try {
      if (ids.length > 0) {
        await sb.from('products').update(fields).in('id', ids);
      }
      if (skus.length > 0) {
        await sb.from('products').update(fields).in('sku', skus);
      }
    } catch (e) {
      console.warn('[Supabase] Update products error:', e);
    }
  }
}

export async function bulkImportFirestoreProducts(products: Product[]): Promise<void> {
  cachedProducts = null;
  for (const p of products) {
    await saveFirestoreProduct(p);
  }
}

export async function getFirestoreCategories(): Promise<Category[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('categories').select('*').order('display_order', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data as Category[];
      }
    } catch {}
  }
  return INITIAL_CATEGORIES;
}

export async function saveFirestoreCategory(category: Category): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('categories').upsert({
        id: category.id || `cat-${category.slug}`,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image_path: category.image_path || '',
        display_order: category.display_order || 1,
        is_active: category.is_active !== false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' });
    } catch {}
  }
}

export async function getFirestoreSettings(): Promise<WebsiteSettings | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('settings').select('*').limit(1).single();
      if (!error && data) {
        return {
          business_name: data.business_name || INITIAL_SETTINGS.business_name,
          tagline: data.tagline || INITIAL_SETTINGS.tagline,
          domain: data.domain || INITIAL_SETTINGS.domain,
          whatsapp_number: data.whatsapp_number || INITIAL_SETTINGS.whatsapp_number,
          whatsapp_display: data.whatsapp_display || INITIAL_SETTINGS.whatsapp_display,
          instagram_url: data.instagram_url || INITIAL_SETTINGS.instagram_url,
          facebook_url: data.facebook_url || INITIAL_SETTINGS.facebook_url,
          email: data.contact_email || INITIAL_SETTINGS.email,
          studio_address: data.address || INITIAL_SETTINGS.studio_address,
          payment_terms: INITIAL_SETTINGS.payment_terms,
          shipping_policy_summary: INITIAL_SETTINGS.shipping_policy_summary,
          showcase_banner: data.showcase_banner || INITIAL_SETTINGS.showcase_banner,
          announcement_banner: data.announcement_bar || INITIAL_SETTINGS.announcement_banner,
          default_seo: INITIAL_SETTINGS.default_seo,
        };
      }
    } catch {}
  }
  return INITIAL_SETTINGS;
}

export async function saveFirestoreSettings(settings: WebsiteSettings): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('settings').upsert({
        id: 'settings-global',
        business_name: settings.business_name,
        tagline: settings.tagline,
        contact_email: settings.email,
        contact_phone: settings.whatsapp_number,
        whatsapp_number: settings.whatsapp_number,
        address: settings.studio_address,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        announcement_bar: settings.announcement_banner,
        showcase_banner: settings.showcase_banner,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch {}
  }
}

export async function getFirestorePages(): Promise<WebsitePage[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('pages').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        return data as WebsitePage[];
      }
    } catch {}
  }
  return INITIAL_PAGES;
}

export async function saveFirestorePage(page: WebsitePage): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('pages').upsert({
        id: page.id || `page-${page.slug}`,
        slug: page.slug,
        title: page.title,
        seo_title: page.seo_title || '',
        meta_description: page.meta_description || '',
        status: page.status || 'published',
        sections: Array.isArray(page.sections) ? page.sections : [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' });
    } catch {}
  }
}

export async function getFirestoreTestimonials(): Promise<Testimonial[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('testimonials').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        return data.map((row: any) => ({
          id: row.id,
          customer_name: row.author_name || row.customer_name || 'Collector',
          content: row.content || '',
          rating: Number(row.rating) || 5,
          location: row.author_location || row.location || '',
          artwork_purchased: row.artwork_purchased || '',
          image_path: row.avatar_url || row.image_path || '',
          display_order: Number(row.display_order) || 1,
          is_published: row.is_active !== undefined ? Boolean(row.is_active) : (row.is_published !== false),
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
        }));
      }
    } catch {}
  }
  return INITIAL_TESTIMONIALS;
}

export async function saveFirestoreTestimonial(testimonial: Testimonial): Promise<void> {
  const sb = getSupabase();
  if (!sb || !testimonial || !testimonial.id) return;

  try {
    const payload: Record<string, any> = {
      id: testimonial.id,
      author_name: testimonial.customer_name || 'Collector',
      content: testimonial.content || '',
      rating: Number(testimonial.rating) || 5,
      author_location: testimonial.location || '',
      artwork_purchased: testimonial.artwork_purchased || '',
      avatar_url: testimonial.image_path || '',
      is_active: testimonial.is_published !== false,
      updated_at: new Date().toISOString(),
    };

    const res = await sb.from('testimonials').upsert(payload).select();
    if (res.error) {
      console.warn('[SupabaseCatalog] Testimonial upsert notice:', res.error.message);
    } else {
      console.log(`[SupabaseCatalog] Testimonial ${testimonial.id} saved successfully to Supabase.`);
    }
  } catch (e) {
    console.warn('[SupabaseCatalog] saveFirestoreTestimonial exception:', e);
  }
}

export async function deleteFirestoreTestimonial(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb && id) {
    try {
      await sb.from('testimonials').delete().eq('id', id);
    } catch {}
  }
}

export async function getFirestoreFAQs(): Promise<FAQ[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('faqs').select('*').order('display_order', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          question: row.question || '',
          answer: row.answer || '',
          category: row.category || 'General',
          display_order: Number(row.display_order) || 1,
          is_published: row.is_published !== false,
          created_at: row.created_at || new Date().toISOString(),
          updated_at: row.updated_at || new Date().toISOString(),
        }));
      }
    } catch {}
  }
  return INITIAL_FAQS;
}

export async function saveFirestoreFAQ(faq: FAQ): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('faqs').upsert({
        id: faq.id,
        category: faq.category || 'General',
        question: faq.question,
        answer: faq.answer,
        display_order: Number(faq.display_order) || 1,
        is_published: faq.is_published !== false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch {}
  }
}

export async function deleteFirestoreFAQ(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb && id) {
    try {
      await sb.from('faqs').delete().eq('id', id);
    } catch {}
  }
}

export async function saveFirestoreMediaAsset(asset: MediaAsset): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('media').upsert({
        id: asset.id,
        storage_path: asset.storage_path,
        media_type: asset.media_type || 'image',
        filename: asset.filename || '',
        title: asset.title || '',
        created_at: asset.created_at || new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch {}
  }
}

export async function saveFirestoreSyncFlag(_changed = true): Promise<void> {
  // Local/Supabase sync flag helper
}

export async function getFirestoreSyncFlag(): Promise<{ changed: boolean; updated_at: string } | null> {
  return { changed: false, updated_at: new Date().toISOString() };
}

export async function syncLocalCustomProductsToFirestore(): Promise<void> {
  const localCustom = getLocalCustomProducts();
  const sb = getSupabase();
  if (sb && localCustom.length > 0) {
    try {
      const { data: existing } = await sb.from('products').select('id, sku');
      const existingIds = new Set((existing || []).map((r: any) => r.id));
      const existingSkus = new Set((existing || []).map((r: any) => (r.sku || '').toUpperCase()));

      for (const p of localCustom) {
        const skuUpper = (p.sku || '').trim().toUpperCase();
        // Only insert if completely absent from Supabase
        if (!existingIds.has(p.id) && !existingSkus.has(skuUpper)) {
          await saveFirestoreProduct(p);
        }
      }
    } catch (e) {
      console.warn('[Supabase] Offline sync notice:', e);
    }
  }
}

/**
 * Direct client-side upload to Supabase Storage ('product-images' bucket).
 * Works reliably from the browser on the live website and preview environments,
 * completely avoiding backend 405 Method Not Allowed proxy errors.
 */
export async function uploadImageToSupabaseStorage(
  file: File | Blob,
  sku?: string,
  originalFilename?: string
): Promise<{ success: boolean; public_url: string; fileName: string; error?: string }> {
  const sb = getSupabase();
  const cleanSku = (sku || '').trim().toUpperCase();
  const timestamp = Date.now();
  let ext = 'jpg';

  if (file.type) {
    if (file.type.includes('png')) ext = 'png';
    else if (file.type.includes('webp')) ext = 'webp';
    else if (file.type.includes('jpeg') || file.type.includes('jpg')) ext = 'jpg';
  } else if (originalFilename && originalFilename.includes('.')) {
    const rawExt = (originalFilename.split('.').pop() || 'jpg').toLowerCase();
    if (rawExt === 'png') ext = 'png';
    else if (rawExt === 'webp') ext = 'webp';
    else ext = 'jpg';
  }

  const fileName = cleanSku
    ? `${cleanSku}_${timestamp}.${ext}`
    : `${timestamp}-${Math.random().toString(36).substring(2, 6)}.${ext}`;

  const contentType = file.type || 'image/jpeg';
  const publicUrl = `https://faijoouprxkttsfrajya.supabase.co/storage/v1/object/public/product-images/${fileName}`;

  // Strategy 1: Supabase JS SDK upload
  if (sb) {
    try {
      const { data, error } = await sb.storage
        .from('product-images')
        .upload(fileName, file, {
          contentType,
          upsert: true,
        });

      if (!error && data) {
        console.log(`[SupabaseStorage] JS SDK uploaded ${fileName} successfully:`, publicUrl);
        return { success: true, public_url: publicUrl, fileName };
      }
      if (error) {
        console.warn('[uploadImageToSupabaseStorage] JS SDK upload warning, trying direct REST:', error.message);
      }
    } catch (err: any) {
      console.warn('[uploadImageToSupabaseStorage] JS SDK exception, trying direct REST:', err);
    }
  }

  // Strategy 2: Direct REST fetch upload (bypasses any browser JS SDK serialization bugs on mobile)
  const supabaseKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaWpvb3VwcnhrdHRzZnJhanlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMzE2ODcsImV4cCI6MjEwODcwNzY4N30.dpQTTxbPZHp_yff109modnbzTRdCg0T0_zU8G_mmjFY';

  try {
    const directUploadUrl = `https://faijoouprxkttsfrajya.supabase.co/storage/v1/object/product-images/${fileName}`;
    const restRes = await fetch(directUploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body: file,
    });

    if (restRes.ok) {
      console.log(`[SupabaseStorage] Direct REST uploaded ${fileName} successfully:`, publicUrl);
      return { success: true, public_url: publicUrl, fileName };
    } else {
      const errTxt = await restRes.text().catch(() => '');
      console.warn('[SupabaseStorage] Direct REST upload response not ok:', restRes.status, errTxt);
      return { success: false, public_url: '', fileName, error: `Upload error (${restRes.status})` };
    }
  } catch (restErr: any) {
    console.error('[SupabaseStorage] Direct REST fetch failed:', restErr);
    return { success: false, public_url: '', fileName, error: restErr?.message || 'Network upload error' };
  }
}
