import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TESTIMONIALS,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
  INITIAL_PAGES,
} from '../data/initialCatalog';
import { Product, Category, WebsiteSettings, WebsitePage, Testimonial, FAQ } from '../types';

function normalizeProduct(p: Product): Product {
  const cleanImg = (path?: string) => (path?.startsWith('/public/') ? path.replace(/^\/public/, '') : path);
  return {
    ...p,
    images: (p.images || []).map((img) => ({
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
  try {
    const custom = localStorage.getItem('app_custom_products');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeProduct);
    }
  } catch {}
  return INITIAL_PRODUCTS.map(normalizeProduct);
}

function getStoredCategories(): Category[] {
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

function getStoredPages(): WebsitePage[] {
  try {
    const custom = localStorage.getItem('app_custom_pages');
    if (custom) return JSON.parse(custom);
  } catch {}
  return INITIAL_PAGES;
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

  // 1. GET /api/products or /api/admin/products
  // 1. GET /api/products or /api/admin/products
  if ((pathname === '/api/products' || pathname === '/api/admin/products') && method === 'GET') {
    let list = getStoredProducts();

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
    if (sort === 'price-low') {
      list.sort((a, b) => a.base_price - b.base_price);
    } else if (sort === 'price-high') {
      list.sort((a, b) => b.base_price - a.base_price);
    } else if (sort === 'newest') {
      list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
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
      const cat = categories.find((c) => c.id === body.category_id);
      const isLippan = cat?.slug === 'lippan-wall-hangings' || (body.name || '').toLowerCase().includes('lippan');

      const newProd: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        sku: sku || `SKU-${Date.now()}`,
        name: (body.name || 'Untitled Art').trim(),
        short_description: body.short_description || '',
        description: body.description || '',
        category_id: body.category_id || categories[0]?.id || 'cat-mandala',
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedList = [newProd, ...products];
      localStorage.setItem('app_custom_products', JSON.stringify(updatedList));
      return jsonRes(newProd);
    } catch (err) {
      console.error('[clientFallbackApi] Failed to create product', err);
    }
  }

  // 1c. PUT /api/admin/products/:id (Update Artwork/Product)
  if (pathname.startsWith('/api/admin/products/') && method === 'PUT') {
    const id = pathname.replace('/api/admin/products/', '');
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const products = getStoredProducts();
      const categories = getStoredCategories();

      const index = products.findIndex((p) => p.id === id);
      if (index !== -1) {
        const cat = body.category_id ? categories.find((c) => c.id === body.category_id) : undefined;
        const updatedProd: Product = {
          ...products[index],
          ...body,
          ...(cat ? { category_name: cat.name, category_slug: cat.slug } : {}),
          updated_at: new Date().toISOString(),
        };
        products[index] = updatedProd;
        localStorage.setItem('app_custom_products', JSON.stringify(products));
        return jsonRes(updatedProd);
      }
    } catch (err) {
      console.error('[clientFallbackApi] Failed to update product', err);
    }
  }

  // 1d. DELETE /api/admin/products/:id
  if (pathname.startsWith('/api/admin/products/') && method === 'DELETE') {
    const id = pathname.replace('/api/admin/products/', '');
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    localStorage.setItem('app_custom_products', JSON.stringify(filtered));
    return jsonRes({ success: true, message: 'Product deleted successfully' });
  }

  // 1e. POST /api/admin/products/:id/duplicate
  if (pathname.includes('/duplicate') && method === 'POST') {
    const id = pathname.replace('/api/admin/products/', '').replace('/duplicate', '');
    const products = getStoredProducts();
    const original = products.find((p) => p.id === id);
    if (original) {
      const copy: Product = {
        ...original,
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        sku: `${original.sku}-COPY-${Math.floor(100 + Math.random() * 900)}`,
        name: `${original.name} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedList = [copy, ...products];
      localStorage.setItem('app_custom_products', JSON.stringify(updatedList));
      return jsonRes(copy);
    }
  }

  // 2. GET /api/products/:sku or /api/products/:id
  if (pathname.startsWith('/api/products/') && method === 'GET') {
    const skuOrId = pathname.replace('/api/products/', '');
    const products = getStoredProducts();
    const found = products.find(
      (p) => p.sku === skuOrId || p.id === skuOrId || encodeURIComponent(p.sku) === skuOrId
    );
    if (found) {
      return jsonRes({ product: found, related: products.filter((p) => p.category_id === found.category_id && p.id !== found.id).slice(0, 4) });
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
    const slug = pathname.replace('/api/pages/', '');
    const pages = getStoredPages();
    const page = pages.find((p) => p.slug === slug);
    return jsonRes(page || null);
  }
  if (pathname.startsWith('/api/admin/pages/') && method === 'PUT') {
    const slug = pathname.replace('/api/admin/pages/', '');
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
      if (Array.isArray(sections)) pages[index].sections = sections;
      pages[index].updated_at = new Date().toISOString();
      try {
        localStorage.setItem('app_custom_pages', JSON.stringify(pages));
      } catch {}
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
      missingImages: prods.filter((p) => !p.images || p.images.length === 0).length,
      recentLogs: [],
    });
  }

  return null;
}
