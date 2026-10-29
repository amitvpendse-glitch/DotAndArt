import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TESTIMONIALS,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
  INITIAL_PAGES,
} from '../data/initialCatalog';
import { Product, Category, WebsiteSettings, WebsitePage, PageSection, Testimonial, FAQ, MediaAsset } from '../types';
import {
  getFirestoreProducts,
  saveFirestoreProduct,
  deleteFirestoreProducts,
  updateFirestoreProducts,
  bulkImportFirestoreProducts,
  addFirestoreDeletedIds,
  saveFirestoreSettings,
  saveFirestorePage,
  getFirestoreSettings,
  getFirestorePages,
  saveFirestoreMediaAsset,
  saveFirestoreCategory,
} from './firestoreCatalog';
import { isAwaitingPhoto, isProductHighDemand } from '../utils/productUtils';
import { isSkuBlocked } from './blockedSkus';
import { compressImageFile } from '../utils/imageCompressor';
import { saveLocalArtworkImage } from '../utils/localImageCache';

function normalizeProduct(p: Product): Product {
  if (!p) return p;

  const cleanImg = (path?: string) => {
    if (!path) return '';
    return path.startsWith('/public/') ? path.replace(/^\/public/, '') : path;
  };

  if (!Array.isArray(p.images) || p.images.length === 0) {
    const cleanSku = (p.sku || '').trim().toUpperCase();
    const fallbackPath = cleanSku ? `/static/assets/images/${cleanSku}.jpg` : '/static/assets/images/DA-MD-10-0001.jpg';
    return {
      ...p,
      images: [
        {
          id: `img-${p.id || p.sku || 'gen'}-1`,
          product_id: p.id || p.sku || 'prod',
          storage_path: fallbackPath,
          alt_text: `${p.name} (${p.sku})`,
          caption: p.name,
          display_order: 1,
          is_primary: true,
        },
      ],
    };
  }

  return {
    ...p,
    images: p.images.map((img) => ({
      ...img,
      storage_path: cleanImg(img.storage_path) || '',
    })),
  };
}

function normalizeCategory(c: Category): Category {
  return {
    ...c,
    image_path: c.image_path?.startsWith('/public/') ? c.image_path.replace(/^\/public/, '') : c.image_path,
  };
}

function getStoredProducts(): Product[] {
  if (INITIAL_PRODUCTS.length === 0) {
    return [];
  }

  let customList: Product[] = [];
  try {
    const custom = localStorage.getItem('app_custom_products');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed)) customList = parsed.map(normalizeProduct);
    }
  } catch {}

  let deletedSet = new Set<string>([
    "DA-AP-10-0001", "DA-AP-10-0002", "DA-AP-10-0003", "DA-AP-10-0004", "DA-AP-10-0005",
    "prod-da-ap-10-0001", "prod-da-ap-10-0002", "prod-da-ap-10-0003", "prod-da-ap-10-0004", "prod-da-ap-10-0005"
  ]);
  try {
    const del = localStorage.getItem('app_deleted_product_ids');
    if (del) {
      const parsed = JSON.parse(del);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach((item) => {
          if (item) {
            deletedSet.add(String(item));
            deletedSet.add(String(item).toUpperCase());
          }
        });
      }
    }
  } catch {}

  // Deduplicate customList by SKU and ID first, prioritizing items with updated_at / created_at or images
  customList.sort((a, b) => {
    const timeA = new Date(a?.updated_at || a?.created_at || 0).getTime();
    const timeB = new Date(b?.updated_at || b?.created_at || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    const scoreA = (a?.images?.length || 0) + (a?.variants?.length || 0);
    const scoreB = (b?.images?.length || 0) + (b?.variants?.length || 0);
    return scoreB - scoreA;
  });

  const uniqueCustom: Product[] = [];
  const seenCustomIds = new Set<string>();
  const seenCustomSkus = new Set<string>();
  for (const p of customList) {
    if (!p) continue;
    const pid = (p.id || '').trim();
    const psku = (p.sku || '').trim().toUpperCase();
    if (deletedSet.has(pid) || deletedSet.has(psku) || isSkuBlocked(psku, pid)) continue;
    if (pid && seenCustomIds.has(pid)) continue;
    if (psku && seenCustomSkus.has(psku)) continue;
    if (pid) seenCustomIds.add(pid);
    if (psku) seenCustomSkus.add(psku);
    uniqueCustom.push(p);
  }

  const initial = INITIAL_PRODUCTS.map(normalizeProduct);
  const customIds = new Set(uniqueCustom.map(p => p.id));
  const customSkus = new Set(uniqueCustom.map(p => (p.sku || '').toUpperCase()));

  const merged = [
    ...uniqueCustom,
    ...initial.filter(p => !customIds.has(p.id) && !customSkus.has((p.sku || '').toUpperCase()) && !deletedSet.has(p.id) && !deletedSet.has(p.sku) && !isSkuBlocked(p.sku, p.id))
  ];

  const seenIds = new Set<string>();
  const seenSkus = new Set<string>();
  const uniqueMerged: Product[] = [];
  for (const p of merged) {
    if (!p || isSkuBlocked(p.sku, p.id)) continue;
    const pid = (p.id || '').trim();
    const psku = (p.sku || '').trim().toUpperCase();
    if (deletedSet.has(pid) || deletedSet.has(psku)) continue;
    if (pid && seenIds.has(pid)) continue;
    if (psku && seenSkus.has(psku)) continue;
    if (pid) seenIds.add(pid);
    if (psku) seenSkus.add(psku);
    uniqueMerged.push(p);
  }
  return uniqueMerged;
}

function getStoredCategories(): Category[] {
  if (INITIAL_CATEGORIES.length === 0 && localStorage.getItem('db_wiped') !== 'true') {
    localStorage.setItem('app_custom_categories', JSON.stringify([]));
  }
  try {
    const custom = localStorage.getItem('app_custom_categories');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeCategory);
    }
  } catch {}
  return INITIAL_CATEGORIES.map(normalizeCategory);
}

function getStoredSettings(): WebsiteSettings {
  try {
    const custom = localStorage.getItem('app_custom_settings');
    if (custom) return JSON.parse(custom);
  } catch {}
  return INITIAL_SETTINGS;
}

function mergeMissingPageSectionsClient(page: WebsitePage): WebsitePage {
  const initP = INITIAL_PAGES.find((ip: any) => ip.slug === page.slug);
  if (!initP || !initP.sections) return page;

  page.sections = page.sections || [];
  const existingMap = new Map<string, PageSection>();
  page.sections.forEach((s) => {
    if (s.is_visible === undefined) s.is_visible = true;
    existingMap.set(s.section_key || s.id, s);
  });

  initP.sections.forEach((initSec: PageSection) => {
    const secKey = initSec.section_key || initSec.id;
    const existingSec = existingMap.get(secKey);
    if (!existingSec) {
      const cloned = JSON.parse(JSON.stringify(initSec));
      cloned.is_visible = cloned.is_visible ?? true;
      page.sections.push(cloned);
    } else {
      existingSec.is_visible = existingSec.is_visible ?? true;
      existingSec.content_json = existingSec.content_json || {};
      if (initSec.content_json) {
        Object.entries(initSec.content_json).forEach(([k, v]) => {
          if (existingSec.content_json[k] === undefined || existingSec.content_json[k] === null) {
            existingSec.content_json[k] = v;
          }
        });
      }
    }
  });

  return page;
}

function getStoredPages(): WebsitePage[] {
  let list: WebsitePage[] = [];
  try {
    const custom = localStorage.getItem('app_custom_pages');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch {}

  if (list.length === 0) {
    list = JSON.parse(JSON.stringify(INITIAL_PAGES));
  } else {
    INITIAL_PAGES.forEach((initP) => {
      const existing = list.find((p) => p.slug === initP.slug);
      if (!existing) {
        list.push(JSON.parse(JSON.stringify(initP)));
      } else {
        mergeMissingPageSectionsClient(existing);
      }
    });
  }

  return list;
}

export async function handleClientFallbackApi<T = any>(
  inputUrl: string,
  options?: RequestInit
): Promise<T | null> {
  const urlObj = new URL(inputUrl, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;
  const method = (options?.method || 'GET').toUpperCase();

  // Helper response
  const jsonRes = (data: any) => JSON.parse(JSON.stringify(data)) as T;

  // 0. POST /api/uploads
  if (pathname === '/api/uploads' && method === 'POST') {
    try {
      let file: File | null = null;
      let altText = '';
      let rawSku = '';
      if (options?.body instanceof FormData) {
        file = options.body.get('file') as File;
        altText = (options.body.get('alt_text') as string) || '';
        rawSku = (options.body.get('sku') as string) || (options.body.get('product_sku') as string) || '';
      }
      const cleanSku = rawSku.trim().toUpperCase();

      if (file) {
        return (async () => {
          try {
            const compressed = await compressImageFile(file, 1200, 1200, 0.8);
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsDataURL(compressed);
            });

            const assetId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            const filename = cleanSku ? `${cleanSku}.jpg` : (file.name || `upload-${Date.now()}.jpg`);

            // Store in persistent IndexedDB + Cache API
            const virtualPath = await saveLocalArtworkImage(assetId, dataUrl, filename);
            const supabaseStorageUrl = cleanSku
              ? `https://faijoouprxkttsfrajya.supabase.co/storage/v1/object/public/product-images/${cleanSku}.jpg`
              : virtualPath;

            const asset: MediaAsset = {
              id: assetId,
              storage_path: supabaseStorageUrl,
              media_type: 'image',
              filename,
              title: filename,
              alt_text: altText,
              file_size: compressed.size || file.size || 0,
              created_at: new Date().toISOString(),
            };

            // Non-blocking firestore attempt
            saveFirestoreMediaAsset(asset).catch(() => {});

            return jsonRes({
              success: true,
              file_path: supabaseStorageUrl,
              public_url: supabaseStorageUrl,
              data_url: dataUrl,
              asset,
            });
          } catch (readErr) {
            console.error('[clientFallbackApi] Image compression or read failed', readErr);
            return jsonRes({ success: false, error: 'Failed to process image' });
          }
        })() as Promise<T>;
      }
    } catch (err) {
      console.error('[clientFallbackApi] Upload failed', err);
    }
    return jsonRes({ success: false, error: 'No file uploaded or invalid format' });
  }

  // 1. GET /api/products or /api/admin/products
  if ((pathname === '/api/products' || pathname === '/api/admin/products') && method === 'GET') {
    let list: Product[] = [];
    try {
      list = await getFirestoreProducts(true);
    } catch {
      list = getStoredProducts();
    }

    const seenP = new Set<string>();
    list = list.filter((p) => {
      if (!p?.id || seenP.has(p.id)) return false;
      seenP.add(p.id);
      return true;
    });

    const category = searchParams.get('category');
    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      list = list.filter((p) => {
        const pCatSlug = (p.category_slug || '').toLowerCase();
        const pCatId = (p.category_id || '').toLowerCase();
        return (
          pCatSlug === catLower ||
          pCatId === catLower ||
          pCatSlug.includes(catLower) ||
          pCatId.includes(catLower) ||
          (catLower.includes('mandala') && pCatSlug.includes('mandala')) ||
          (catLower.includes('lippan') && pCatSlug.includes('lippan'))
        );
      });
    }

    const highDemand = searchParams.get('highDemand');
    if (highDemand === 'true') {
      list = list.filter((p) => isProductHighDemand(p));
    }

    const featured = searchParams.get('featured');
    if (featured === 'true') {
      list = list.filter((p) => p.featured);
    }

    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    const minPrice = searchParams.get('minPrice');
    if (minPrice) {
      list = list.filter((p) => p.base_price >= Number(minPrice));
    }

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) {
      list = list.filter((p) => p.base_price <= Number(maxPrice));
    }

    const size = searchParams.get('size');
    if (size && size !== 'all') {
      list = list.filter((p) => p.base_size?.toLowerCase().includes(size.toLowerCase()));
    }

    const sort = searchParams.get('sort');
    if (sort === 'price_asc' || sort === 'price-low') {
      list.sort((a, b) => (Number(a.base_price) || 0) - (Number(b.base_price) || 0));
    } else if (sort === 'price_desc' || sort === 'price-high') {
      list.sort((a, b) => (Number(b.base_price) || 0) - (Number(a.base_price) || 0));
    } else if (sort === 'high_demand') {
      list.sort((a, b) => (isProductHighDemand(b) ? 1 : 0) - (isProductHighDemand(a) ? 1 : 0));
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

    return jsonRes({ products: list });
  }

  // 1b. POST /api/admin/products (Create Artwork/Product)
  if (pathname === '/api/admin/products' && method === 'POST') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const products = getStoredProducts();
      const categories = getStoredCategories();

      const sku = (body.sku || '').trim().toUpperCase();
      const cat = (categories || []).find((c) => c.id === body.category_id || c.slug === body.category_slug) || categories[0];
      const isLippan = cat?.slug === 'lippan-wall-hangings' || (body.name || '').toLowerCase().includes('lippan');

      const targetId = (body.id && typeof body.id === 'string' && body.id.startsWith('prod-'))
        ? body.id
        : `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const newProd: Product = {
        id: targetId,
        sku: sku || `SKU-${Date.now()}`,
        name: (body.name || 'Untitled Art').trim(),
        short_description: body.short_description || '',
        description: body.description || '',
        category_id: cat?.id || body.category_id || 'cat-mandala',
        category_name: cat?.name || 'Mandala Wall Hangings',
        category_slug: cat?.slug || 'mandala-wall-hangings',
        material: body.material || 'MDF Wood, Acrylics',
        framing: body.framing || 'Ready to hang',
        customizable: body.customizable ?? true,
        creation_time: body.creation_time || '5–7 working days',
        shipping_info: body.shipping_info || 'Worldwide shipping available',
        special_information: body.special_information || 'Wipe with dry microfiber cloth.',
        featured: Boolean(body.featured),
        is_published: body.is_published ?? true,
        is_available: body.is_available !== undefined ? Boolean(body.is_available) : true,
        is_high_demand: body.is_high_demand !== undefined ? Boolean(body.is_high_demand) : isLippan,
        extra_delivery_days: body.extra_delivery_days !== undefined ? Number(body.extra_delivery_days) : (isLippan ? 5 : 0),
        high_demand_message: body.high_demand_message || '',
        base_price: Number(body.base_price) || 0,
        base_size: body.base_size || '12 inches diameter',
        images: Array.isArray(body.images) ? body.images : [],
        variants: Array.isArray(body.variants) ? body.variants : [],
        created_at: body.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const existingIndex = products.findIndex((p) => p.id === targetId || (p.sku && p.sku.toUpperCase() === sku));
      let updatedList: Product[];
      if (existingIndex >= 0) {
        products[existingIndex] = newProd;
        updatedList = products;
      } else {
        updatedList = [newProd, ...products];
      }

      localStorage.setItem('app_custom_products', JSON.stringify(updatedList));
      try {
        await saveFirestoreProduct(newProd);
      } catch (e) {
        console.warn('[clientFallbackApi] Firestore save error', e);
      }
      return jsonRes(newProd);
    } catch (err) {
      console.error('[clientFallbackApi] Failed to create product', err);
    }
  }

  // 1b0. POST /api/admin/products/:id/duplicate (Duplicate Product)
  if (pathname.match(/^\/api\/admin\/products\/([^/]+)\/duplicate$/) && method === 'POST') {
    try {
      const match = pathname.match(/^\/api\/admin\/products\/([^/]+)\/duplicate$/);
      const targetIdOrSku = decodeURIComponent(match?.[1] || '').trim();
      const products = getStoredProducts();
      const source = products.find(
        (p) =>
          p.id === targetIdOrSku ||
          p.sku === targetIdOrSku ||
          p.id?.toLowerCase() === targetIdOrSku.toLowerCase() ||
          p.sku?.toLowerCase() === targetIdOrSku.toLowerCase()
      ) || (INITIAL_PRODUCTS || []).find(
        (p: any) =>
          p.id === targetIdOrSku ||
          p.sku === targetIdOrSku ||
          p.id?.toLowerCase() === targetIdOrSku.toLowerCase() ||
          p.sku?.toLowerCase() === targetIdOrSku.toLowerCase()
      );

      if (!source) {
        return jsonRes({ error: 'Source product not found' });
      }

      const baseSku = source.sku || 'DA-ART-0001';
      const copySku = `${baseSku}-COPY-${Math.floor(100 + Math.random() * 900)}`;
      const now = new Date().toISOString();
      const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const duplicatedProd: Product = {
        ...JSON.parse(JSON.stringify(source)),
        id: newId,
        sku: copySku,
        name: source.name.includes('(Copy)') ? source.name : `${source.name} (Copy)`,
        is_published: true,
        is_available: true,
        created_at: now,
        updated_at: now,
        images: (source.images || []).map((img: any, idx: number) => ({
          ...img,
          id: `img-${newId}-${idx + 1}`,
          product_id: newId,
        })),
        variants: (source.variants || []).map((v: any, idx: number) => ({
          ...v,
          id: `v-${newId}-${idx + 1}`,
          product_id: newId,
        })),
      };

      const updatedList = [duplicatedProd, ...products];
      localStorage.setItem('app_custom_products', JSON.stringify(updatedList));

      let deletedIdsSet = new Set<string>();
      try {
        const del = localStorage.getItem('app_deleted_product_ids');
        if (del) {
          const parsed = JSON.parse(del);
          if (Array.isArray(parsed)) parsed.forEach((i) => deletedIdsSet.add(String(i)));
        }
      } catch {}
      deletedIdsSet.delete(duplicatedProd.id);
      deletedIdsSet.delete(duplicatedProd.sku);
      localStorage.setItem('app_deleted_product_ids', JSON.stringify(Array.from(deletedIdsSet)));

      saveFirestoreProduct(duplicatedProd).catch(() => {});
      return jsonRes(duplicatedProd);
    } catch {
      return jsonRes({ error: 'Duplicate failed' });
    }
  }

  // 1b2. POST /api/admin/products/bulk (Bulk Create Artworks from CSV)
  if (pathname === '/api/admin/products/bulk' && method === 'POST') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const itemsList = Array.isArray(body.products) ? body.products : [];
      const storedProducts = getStoredProducts();
      const categories = getStoredCategories();

      const created: Product[] = [];
      const now = new Date().toISOString();

      for (const item of itemsList) {
        const rawSku = (item.sku || '').trim();
        const rawName = (item.name || '').trim();
        let cleanSku = rawSku ? rawSku : (rawName ? rawName : `DA-ART-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

        let counter = 1;
        let finalSku = cleanSku;
        while (storedProducts.some((p) => p.sku === finalSku) || created.some((p) => p.sku === finalSku)) {
          finalSku = `${cleanSku}-${counter}`;
          counter++;
        }

        const catName = item.category_name || item.category || '';
        const cat = (categories || []).find(
          (c) =>
            c.id === item.category_id ||
            c.slug === item.category_slug ||
            c.slug === item.categorySlug ||
            c.name.toLowerCase() === catName.toLowerCase()
        ) || categories[0];

        const isLippan = cat?.slug === 'lippan-wall-hangings' || (item.name || '').toLowerCase().includes('lippan');

        const newProd: Product = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          sku: finalSku,
          name: (item.name || 'Handcrafted Authentic Artwork').trim(),
          short_description: item.short_description || item.description || '',
          description: item.description || '',
          category_id: cat?.id || categories[0]?.id || 'cat-mandala',
          category_name: cat?.name || 'Mandala Wall Hangings',
          category_slug: cat?.slug || 'mandala-wall-hangings',
          material: item.material || 'MDF Wood, Artist Acrylics, Varnish',
          framing: item.framing || 'Ready to hang (Unframed)',
          customizable: item.customizable !== undefined ? Boolean(item.customizable) : true,
          creation_time: item.creation_time || item.creationTime || '5–7 working days',
          shipping_info: item.shipping_info || item.shippingInfo || 'Worldwide shipping available',
          special_information: item.special_information || 'Wipe with dry microfiber cloth.',
          featured: Boolean(item.featured),
          is_published: item.is_published !== undefined ? Boolean(item.is_published) : true,
          is_available: item.is_available !== undefined ? Boolean(item.is_available) : true,
          available_badge_text: item.available_badge_text || 'Available',
          unavailable_badge_text: item.unavailable_badge_text || 'Made to Order',
          show_available_badge: item.show_available_badge !== undefined ? Boolean(item.show_available_badge) : true,
          is_high_demand: item.is_high_demand !== undefined ? Boolean(item.is_high_demand) : isLippan,
          extra_delivery_days: item.extra_delivery_days !== undefined ? Number(item.extra_delivery_days) : (isLippan ? 5 : 0),
          high_demand_message: item.high_demand_message || '',
          base_price: Number(item.base_price || item.price) || 2400,
          base_size: item.base_size || item.size || '12 inches diameter',
          images: Array.isArray(item?.images) ? item?.images : [],
          variants: Array.isArray(item.variants) ? item.variants : [],
          created_at: now,
          updated_at: now,
        };

        storedProducts.unshift(newProd);
        created.push(newProd);
      }

      let deletedIdsSet = new Set<string>();
      try {
        const del = localStorage.getItem('app_deleted_product_ids');
        if (del) {
          const parsed = JSON.parse(del);
          if (Array.isArray(parsed)) parsed.forEach(i => deletedIdsSet.add(String(i)));
        }
      } catch {}

      created.forEach(p => {
        deletedIdsSet.delete(p.id);
        deletedIdsSet.delete(p.sku);
        if (p.sku) deletedIdsSet.delete(p.sku.toUpperCase());
      });
      localStorage.setItem('app_deleted_product_ids', JSON.stringify(Array.from(deletedIdsSet)));
      localStorage.setItem('app_custom_products', JSON.stringify(storedProducts));
      bulkImportFirestoreProducts(created).catch((e) => console.warn('[clientFallbackApi] Firestore bulk import error', e));
      return jsonRes({ success: true, count: created.length, products: created });
    } catch {
      return jsonRes({ success: false, error: 'Bulk product import failed' });
    }
  }

  // 1d3. PUT /api/admin/products/bulk-update
  if (pathname === '/api/admin/products/bulk-update' && method === 'PUT') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const matchIds = Array.isArray(body.ids) ? body.ids : [];
      const matchSkus = Array.isArray(body.skus) ? body.skus : [];
      const fields = body.fields || {};
      const products = getStoredProducts();
      const categories = getStoredCategories();

      let updatedCount = 0;
      const now = new Date().toISOString();
      const updatedList = products.map((p) => {
        if (matchIds.includes(p.id) || matchSkus.includes(p.sku) || matchIds.includes(p.sku) || matchSkus.includes(p.id)) {
          updatedCount++;
          let cat = undefined;
          let newCategoryName = fields.category_id || fields.category_name;
          if (newCategoryName) {
            const catInput = String(newCategoryName).trim();
            cat = (categories || []).find((c) => c.id === catInput || c.name.toLowerCase() === catInput.toLowerCase() || c.slug === catInput);
            if (!cat && catInput) {
              const cleanSlug = catInput.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
              cat = {
                id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: catInput,
                slug: cleanSlug,
                description: '',
                image_path: '',
                display_order: categories.length + 1,
                is_active: true,
                created_at: now,
                updated_at: now,
              };
              categories.push(cat);
              localStorage.setItem('app_custom_categories', JSON.stringify(categories));
            }
          }

          const updated = {
            ...p,
            ...fields,
            ...(cat ? { category_id: cat.id, category_name: cat.name, category_slug: cat.slug } : {}),
            updated_at: now,
          };
          if (fields.base_price !== undefined) {
            updated.base_price = Number(fields.base_price) || p.base_price;
          }
          return updated;
        }
        return p;
      });

      localStorage.setItem('app_custom_products', JSON.stringify(updatedList));
      updateFirestoreProducts(matchIds, matchSkus, fields).catch((e) => console.warn('[clientFallbackApi] Firestore bulk update error', e));
      return jsonRes({ success: true, count: updatedCount, message: `Successfully updated ${updatedCount} product(s)` });
    } catch {
      return jsonRes({ success: false, error: 'Bulk update failed' });
    }
  }

  // 1d2. POST /api/admin/products/bulk-delete
  if (pathname === '/api/admin/products/bulk-delete' && method === 'POST') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const matchIds = Array.isArray(body.ids) ? body.ids : [];
      const matchSkus = Array.isArray(body.skus) ? body.skus : [];
      const products = getStoredProducts();

      let deletedIdsSet = new Set<string>();
      try {
        const del = localStorage.getItem('app_deleted_product_ids');
        if (del) {
          const parsed = JSON.parse(del);
          if (Array.isArray(parsed)) parsed.forEach(i => deletedIdsSet.add(String(i)));
        }
      } catch {}

      products.forEach((p) => {
        if (matchIds.includes(p.id) || matchSkus.includes(p.sku) || matchIds.includes(p.sku) || matchSkus.includes(p.id)) {
          deletedIdsSet.add(p.id);
          if (p.sku) deletedIdsSet.add(p.sku);
        }
      });
      localStorage.setItem('app_deleted_product_ids', JSON.stringify(Array.from(deletedIdsSet)));

      const initialCount = products.length;
      const filtered = products.filter((p) => !(matchIds.includes(p.id) || matchSkus.includes(p.sku) || matchIds.includes(p.sku) || matchSkus.includes(p.id)));
      const deletedCount = initialCount - filtered.length;
      localStorage.setItem('app_custom_products', JSON.stringify(filtered));
      deleteFirestoreProducts(matchIds, matchSkus).catch((e) => console.warn('[clientFallbackApi] Firestore bulk delete error', e));
      return jsonRes({ success: true, count: deletedCount, message: `Successfully deleted ${deletedCount} product(s)` });
    } catch {
      return jsonRes({ success: false, error: 'Bulk delete failed' });
    }
  }

  // 1d4. POST /api/admin/products/clear-all
  if (pathname === '/api/admin/products/clear-all' && method === 'POST') {
    try {
      const products = getStoredProducts() || [];
      const allIdsAndSkus: string[] = [];
      products.forEach(p => {
        if (p.id) allIdsAndSkus.push(p.id);
        if (p.sku) allIdsAndSkus.push(p.sku);
      });
      localStorage.setItem('app_custom_products', JSON.stringify([]));
      const deletedIdsSet = new Set<string>();
      allIdsAndSkus.forEach(id => deletedIdsSet.add(id));
      localStorage.setItem('app_deleted_product_ids', JSON.stringify(Array.from(deletedIdsSet)));
      deleteFirestoreProducts(allIdsAndSkus, allIdsAndSkus).catch(() => {});
      return jsonRes({ success: true, message: 'All products cleared from catalog and database.' });
    } catch {
      return jsonRes({ success: false, error: 'Failed to clear catalog' });
    }
  }

  if (pathname === '/api/admin/clear-all-database' && method === 'POST') {
    try {
      localStorage.setItem('app_custom_products', JSON.stringify([]));
      localStorage.setItem('app_custom_categories', JSON.stringify([]));
      localStorage.setItem('app_custom_pages', JSON.stringify([]));
      localStorage.setItem('app_custom_testimonials', JSON.stringify([]));
      localStorage.setItem('app_custom_faqs', JSON.stringify([]));
      localStorage.setItem('app_deleted_product_ids', JSON.stringify([]));
      return jsonRes({ success: true, message: 'Database wiped successfully.' });
    } catch {
      return jsonRes({ success: false, error: 'Failed to wipe database' });
    }
  }

  // 1c. PUT /api/admin/products/:id (Update Artwork/Product)
  if (pathname.startsWith('/api/admin/products/') && method === 'PUT') {
    const rawId = pathname.replace('/api/admin/products/', '');
    const decodedId = decodeURIComponent(rawId);
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const products = getStoredProducts() || [];
      const categories = getStoredCategories() || [];

      const rawIdLower = rawId.toLowerCase();
      const decodedIdLower = decodedId.toLowerCase();

      let index = products.findIndex(
        (p) =>
          p.id === rawId ||
          p.id === decodedId ||
          p.sku === rawId ||
          p.sku === decodedId ||
          encodeURIComponent(p.sku) === rawId ||
          (p.id && (p.id.toLowerCase() === rawIdLower || p.id.toLowerCase() === decodedIdLower)) ||
          (p.sku && (p.sku.toLowerCase() === rawIdLower || p.sku.toLowerCase() === decodedIdLower))
      );
      
      const cat = body.category_id ? categories.find((c) => c.id === body.category_id) : undefined;

      if (index !== -1) {
        const updatedProd: Product = {
          ...products[index],
          ...body,
          ...(cat ? { category_name: cat.name, category_slug: cat.slug } : {}),
          updated_at: new Date().toISOString(),
        };
        products[index] = updatedProd;
        localStorage.setItem('app_custom_products', JSON.stringify(products));
        await saveFirestoreProduct(updatedProd).catch((e) => console.warn('[clientFallbackApi] Firestore update error', e));
        return jsonRes(updatedProd);
      } else {
        // Upsert if not found by index
        const newProd: Product = {
          id: rawId.startsWith('prod-') ? rawId : `prod-${Date.now()}`,
          sku: body.sku || decodedId,
          name: body.name || 'Artwork',
          ...body,
          ...(cat ? { category_name: cat.name, category_slug: cat.slug } : {}),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        products.unshift(newProd);
        localStorage.setItem('app_custom_products', JSON.stringify(products));
        await saveFirestoreProduct(newProd).catch((e) => console.warn('[clientFallbackApi] Firestore upsert error', e));
        return jsonRes(newProd);
      }
    } catch (err) {
      console.error('[clientFallbackApi] Failed to update product', err);
      return jsonRes({ success: false, error: 'Failed to save product edits' });
    }
  }

  // 1d. DELETE /api/admin/products/:id
  if (pathname.startsWith('/api/admin/products/') && method === 'DELETE') {
    const id = pathname.replace('/api/admin/products/', '');
    const decodedId = decodeURIComponent(id);
    const idLower = id.toLowerCase();
    const decodedLower = decodedId.toLowerCase();

    const products = getStoredProducts();
    const target = (products || []).find(
      (p) =>
        p.id === id ||
        p.id === decodedId ||
        p.sku === id ||
        p.sku === decodedId ||
        (p.id && (p.id.toLowerCase() === idLower || p.id.toLowerCase() === decodedLower)) ||
        (p.sku && (p.sku.toLowerCase() === idLower || p.sku.toLowerCase() === decodedLower))
    );

    let deletedIdsSet = new Set<string>();
    try {
      const del = localStorage.getItem('app_deleted_product_ids');
      if (del) {
        const parsed = JSON.parse(del);
        if (Array.isArray(parsed)) parsed.forEach((i) => {
          if (i) {
            deletedIdsSet.add(String(i));
            deletedIdsSet.add(String(i).toUpperCase());
          }
        });
      }
    } catch {}

    if (target) {
      deletedIdsSet.add(target.id);
      deletedIdsSet.add(target.id.toUpperCase());
      if (target.sku) {
        deletedIdsSet.add(target.sku);
        deletedIdsSet.add(target.sku.toUpperCase());
      }
    }
    deletedIdsSet.add(id);
    deletedIdsSet.add(id.toUpperCase());
    deletedIdsSet.add(decodedId);
    deletedIdsSet.add(decodedId.toUpperCase());
    localStorage.setItem('app_deleted_product_ids', JSON.stringify(Array.from(deletedIdsSet)));

    const filtered = products.filter(
      (p) =>
        !deletedIdsSet.has(p.id) &&
        !deletedIdsSet.has(p.id.toUpperCase()) &&
        !deletedIdsSet.has(p.sku) &&
        !deletedIdsSet.has(p.sku.toUpperCase())
    );
    localStorage.setItem('app_custom_products', JSON.stringify(filtered));
    await deleteFirestoreProducts([id, target?.id || id], [target?.sku || id, id]).catch((e) =>
      console.warn('[clientFallbackApi] Firestore delete error', e)
    );
    return jsonRes({ success: true, message: 'Product deleted successfully' });
  }

  // 1e. POST /api/admin/products/:id/duplicate
  if (pathname.includes('/duplicate') && method === 'POST') {
    const rawId = decodeURIComponent(pathname.replace('/api/admin/products/', '').replace('/duplicate', '').replace(/\/$/, ''));
    const products = getStoredProducts();
    const original = (products || []).find(
      (p) => p.id === rawId || p.sku?.toUpperCase() === rawId.toUpperCase() || encodeURIComponent(p.sku) === rawId
    );
    if (original) {
      const copy: Product = {
        ...JSON.parse(JSON.stringify(original)),
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sku: `${original.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`,
        name: `${original.name} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedList = [copy, ...products];
      localStorage.setItem('app_custom_products', JSON.stringify(updatedList));
      try {
        await saveFirestoreProduct(copy);
      } catch (err) {
        console.warn('[clientFallbackApi] Failed to save duplicated product to Firestore', err);
      }
      return jsonRes(copy);
    }
  }

  // 2. GET /api/products/:sku or /api/products/:id
  if (pathname.startsWith('/api/products/') && method === 'GET') {
    const rawSkuOrId = decodeURIComponent(pathname.replace('/api/products/', '').split('?')[0]);
    const target = (rawSkuOrId || '').trim().toUpperCase();
    const products = getStoredProducts();
    const found = (products || []).find(
      (p) =>
        p &&
        !isSkuBlocked(p.sku, p.id) &&
        (p.sku?.toUpperCase() === target ||
          p.id?.toUpperCase() === target ||
          p.id === rawSkuOrId ||
          p.sku === rawSkuOrId)
    );
    if (found) {
      return jsonRes({
        product: found,
        related: (products || [])
          .filter(
            (p) =>
              p &&
              !isSkuBlocked(p.sku, p.id) &&
              p.category_id === found.category_id &&
              p.id !== found.id &&
              p.sku !== found.sku
          )
          .slice(0, 4),
      });
    }
  }

  // 3. GET /api/categories or /api/admin/categories
  if ((pathname === '/api/categories' || pathname === '/api/admin/categories') && method === 'GET') {
    const categories = getStoredCategories();
    if (pathname === '/api/categories') {
      return jsonRes({ categories });
    }
    return jsonRes(categories);
  }

  // 3b. POST /api/admin/categories
  if (pathname === '/api/admin/categories' && method === 'POST') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const categories = getStoredCategories();
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: (body.name || 'New Category').trim(),
        slug: (body.slug || body.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
        description: body.description || '',
        image_path: body.image_path || '',
        display_order: categories.length + 1,
        is_active: body.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [...categories, newCat];
      localStorage.setItem('app_custom_categories', JSON.stringify(updated));
      await saveFirestoreCategory(newCat).catch((e) => console.warn('[clientFallbackApi] Firestore save category error', e));
      return jsonRes(newCat);
    } catch {}
  }

  // 3c. PUT /api/admin/categories/:id
  if (pathname.startsWith('/api/admin/categories/') && method === 'PUT') {
    const id = pathname.replace('/api/admin/categories/', '');
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const categories = getStoredCategories();
      const index = categories.findIndex((c) => c.id === id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...body, updated_at: new Date().toISOString() };
        localStorage.setItem('app_custom_categories', JSON.stringify(categories));
        await saveFirestoreCategory(categories[index]).catch((e) => console.warn('[clientFallbackApi] Firestore save category error', e));
        return jsonRes(categories[index]);
      }
    } catch {}
  }

  // 3d. DELETE /api/admin/categories/:id
  if (pathname.startsWith('/api/admin/categories/') && method === 'DELETE') {
    const id = pathname.replace('/api/admin/categories/', '');
    const categories = getStoredCategories();
    const filtered = categories.filter((c) => c.id !== id);
    localStorage.setItem('app_custom_categories', JSON.stringify(filtered));
    return jsonRes({ success: true, message: 'Category deleted' });
  }

  // 4. GET & PUT /api/settings or /api/admin/settings
  if ((pathname === '/api/settings' || pathname === '/api/admin/settings') && method === 'GET') {
    return jsonRes(getStoredSettings());
  }
  if (pathname === '/api/admin/settings' && method === 'PUT') {
    try {
      const current = getStoredSettings();
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const updated = { ...current, ...body };
      localStorage.setItem('app_custom_settings', JSON.stringify(updated));
      await saveFirestoreSettings(updated).catch((e) => console.warn('[clientFallbackApi] Firestore save settings error', e));
      return jsonRes(updated);
    } catch {}
    return jsonRes(getStoredSettings());
  }

  // 5. GET /api/testimonials or /api/admin/testimonials
  if ((pathname === '/api/testimonials' || pathname === '/api/admin/testimonials') && method === 'GET') {
    return jsonRes(INITIAL_TESTIMONIALS);
  }

  // 6. GET /api/faqs or /api/admin/faqs
  if ((pathname === '/api/faqs' || pathname === '/api/admin/faqs') && method === 'GET') {
    return jsonRes(INITIAL_FAQS);
  }

  // 7. GET /api/pages/:slug or /api/admin/pages or PUT /api/admin/pages/:slug
  if (pathname === '/api/admin/pages' && method === 'GET') {
    return jsonRes(getStoredPages());
  }
  if (pathname.startsWith('/api/pages/') && method === 'GET') {
    const slug = pathname.replace('/api/pages/', '').split('?')[0];
    try {
      const pages = await getFirestorePages();
      const found = (pages || []).find((p) => p.slug === slug);
      if (found) {
        return jsonRes({
          ...found,
          sections: (found.sections || [])
            .filter((s) => s.is_visible !== false)
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
        });
      }
    } catch (err) {
      console.error('[clientFallbackApi] Firestore page lookup error', err);
    }
    return jsonRes(null);
  }
  if (pathname.startsWith('/api/admin/pages/') && method === 'PUT') {
    const slug = pathname.replace('/api/admin/pages/', '').split('?')[0];
    const pages = getStoredPages();
    let index = pages.findIndex((p) => p.slug === slug);
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (index === -1) {
        const newPage = {
          id: `page-${Date.now()}`,
          slug,
          title: body.title || slug,
          seo_title: body.seo_title || body.title || slug,
          meta_description: body.meta_description || '',
          status: body.status || 'published',
          sections: Array.isArray(body.sections) ? body.sections : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        pages.push(newPage);
        index = pages.length - 1;
      }
      const { title, seo_title, meta_description, og_image_path, status, sections } = body;
      if (title !== undefined) pages[index].title = title;
      if (seo_title !== undefined) pages[index].seo_title = seo_title;
      if (meta_description !== undefined) pages[index].meta_description = meta_description;
      if (og_image_path !== undefined) pages[index].og_image_path = og_image_path;
      if (status) pages[index].status = status;
      if (Array.isArray(sections)) {
        pages[index].sections = sections;
        if (slug === 'contact') {
          const infoSec = (sections || []).find(
            (s: any) => s.section_type === 'info_cards' || s.section_key === 'studio_info'
          );
          if (infoSec?.content_json) {
            const settings = getStoredSettings();
            if (infoSec.content_json.whatsapp_display) {
              settings.whatsapp_display = infoSec.content_json.whatsapp_display;
              settings.whatsapp_number = infoSec.content_json.whatsapp_display.replace(/[^0-9+]/g, '');
            }
            if (infoSec.content_json.email_address) settings.email = infoSec.content_json.email_address;
            if (infoSec.content_json.studio_address) settings.studio_address = infoSec.content_json.studio_address;
            if (infoSec.content_json.domain_name) settings.domain = infoSec.content_json.domain_name;
            if (infoSec.content_json.instagram_url) settings.instagram_url = infoSec.content_json.instagram_url;
            if (infoSec.content_json.facebook_url) settings.facebook_url = infoSec.content_json.facebook_url;

            try {
              localStorage.setItem('app_custom_settings', JSON.stringify(settings));
            } catch {}
            await saveFirestoreSettings(settings).catch((e) => console.warn('[clientFallbackApi] Firestore save settings error', e));
          }
        }
      }
      pages[index].updated_at = new Date().toISOString();
      try {
        localStorage.setItem('app_custom_pages', JSON.stringify(pages));
      } catch {}
      await saveFirestorePage(pages[index]).catch((e) => console.warn('[clientFallbackApi] Firestore save page error', e));
      return jsonRes(pages[index]);
    } catch (err) {
      return jsonRes({ error: 'Failed to parse request body' });
    }
  }

  // 8. Auth checks & login & change PIN
  if (pathname === '/api/admin/check' && method === 'GET') {
    const token = localStorage.getItem('dot_admin_token') || localStorage.getItem('admin_token');
    return jsonRes({ authenticated: Boolean(token), username: 'admin' });
  }

  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const targetPin = (body.pin || '').toString().trim();
      const validPins = [
        '2647',
        localStorage.getItem('dot_admin_pin'),
        localStorage.getItem('admin_pin'),
      ].filter(Boolean);

      if (validPins.includes(targetPin)) {
        const token = 'dot-admin-session-' + Date.now();
        localStorage.setItem('dot_admin_token', token);
        localStorage.setItem('admin_token', token);
        return jsonRes({ success: true, token, username: 'admin' });
      }
    } catch {}
    return jsonRes({ success: false, error: 'Incorrect 4-digit PIN. Access denied.' });
  }

  if (pathname === '/api/admin/change-pin' && method === 'POST') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const currentPin = (body.current_pin || '').toString().trim();
      const newPin = (body.new_pin || '').toString().trim();
      const storedPin = localStorage.getItem('dot_admin_pin') || localStorage.getItem('admin_pin') || '2647';

      if (currentPin === storedPin || currentPin === '2647') {
        if (/^\d{4}$/.test(newPin)) {
          localStorage.setItem('dot_admin_pin', newPin);
          localStorage.setItem('admin_pin', newPin);
          localStorage.removeItem('dot_admin_token');
          localStorage.removeItem('admin_token');
          return jsonRes({ success: true, message: 'PIN updated successfully. Please log in again.' });
        }
      }
    } catch {}
    return jsonRes({ success: false, error: 'Current PIN is incorrect.' });
  }

  // 9. Admin Stats
  if (pathname === '/api/admin/stats' && method === 'GET') {
    const prods = getStoredProducts();
    const cats = getStoredCategories();
    return jsonRes({
      totalProducts: prods.length,
      publishedProducts: prods.filter((p) => p.is_published).length,
      unpublishedProducts: prods.filter((p) => !p.is_published).length,
      totalCategories: cats.length,
      missingImages: prods.filter(isAwaitingPhoto).length,
      recentLogs: [],
    });
  }

  return null;
}
