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
  if ((pathname === '/api/products' || pathname === '/api/admin/products') && method === 'GET') {
    let list = getStoredProducts();

    const category = searchParams.get('category');
    if (category && category !== 'all') {
      list = list.filter((p) => p.category_slug === category || p.category_id === category);
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

  // 4. GET /api/settings or /api/admin/settings
  if ((pathname === '/api/settings' || pathname === '/api/admin/settings') && method === 'GET') {
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

  // 7. GET /api/pages/:slug or /api/admin/pages
  if (pathname === '/api/admin/pages' && method === 'GET') {
    return jsonRes(getStoredPages());
  }
  if (pathname.startsWith('/api/pages/') && method === 'GET') {
    const slug = pathname.replace('/api/pages/', '');
    const pages = getStoredPages();
    const page = pages.find((p) => p.slug === slug);
    return jsonRes(page || null);
  }

  // 8. Auth checks & login
  if (pathname === '/api/admin/check' && method === 'GET') {
    const token = localStorage.getItem('admin_token');
    return jsonRes({ authenticated: Boolean(token), username: 'admin' });
  }

  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (body.pin === '2647' || body.pin === localStorage.getItem('admin_pin')) {
        const token = 'mock-admin-token-' + Date.now();
        localStorage.setItem('admin_token', token);
        return jsonRes({ success: true, token, username: 'admin' });
      }
    } catch {}
    return jsonRes({ success: false, error: 'Invalid 4-digit PIN' });
  }

  // 9. Admin Stats
  if (pathname === '/api/admin/stats' && method === 'GET') {
    const prods = getStoredProducts();
    const cats = getStoredCategories();
    return jsonRes({
      productsCount: prods.length,
      categoriesCount: cats.length,
      mediaCount: prods.length,
      publishedProductsCount: prods.filter((p) => p.is_published).length,
    });
  }

  return null;
}
