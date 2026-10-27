import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Eye, ShoppingBag, MessageCircle, X, ChevronDown, Plus, Minus, Download, Flame, FileText, Loader2, Check } from 'lucide-react';
import { Product, Category, WebsiteSettings } from '../types';
import { SafeProductImage } from '../components/SafeProductImage';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { AvailableBadge } from '../components/AvailableBadge';
import { useCart } from '../context/CartContext';
import { safeFetchJson } from '../lib/safeFetch';
import { WhatsAppAttachmentModal } from '../components/WhatsAppAttachmentModal';
import {
  createWhatsAppUrl,
  openExternalLink,
  copyImageToClipboard,
  formatSingleProductEnquiry,
  collectAttachmentsForProduct,
} from '../utils/whatsapp';
import { usePageSeo } from '../lib/usePageSeo';
import { isSkuBlocked } from '../lib/blockedSkus';
import { isProductHighDemand } from '../utils/productUtils';

interface ShopPageProps {
  initialCategory?: string;
  onSelectProduct: (sku: string) => void;
  onNavigate: (path: string) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-mandala',
    name: 'Mandala Wall Hangings',
    slug: 'mandala-wall-hangings',
    description: 'Intricately handcrafted authentic dot mandalas',
    display_order: 1,
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'cat-lippan',
    name: 'Lippan Wall Hangings',
    slug: 'lippan-wall-hangings',
    description: 'Traditional Gujarati mud and mirror art (Lippan Kaam)',
    display_order: 2,
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
];

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory, onSelectProduct, onNavigate }) => {
  usePageSeo('shop', 'Shop Handcrafted Mandalas & Lippan Wall Hangings — Dot And Art');
  const { addToCart, getItemQuantity, decrementItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [downloadingSku, setDownloadingSku] = useState<string | null>(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [priceTier, setPriceTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [highDemandOnly, setHighDemandOnly] = useState<boolean>(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    const savedFilters = sessionStorage.getItem('shop_filters');
    if (savedFilters) {
      const { category, search, size, price, sort, highDemand } = JSON.parse(savedFilters);
      if (category) setSelectedCategory(category);
      if (search) setSearchQuery(search);
      if (size) setSelectedSizeFilter(size);
      if (price) setPriceTier(price);
      if (sort) setSortBy(sort);
      if (highDemand !== undefined) setHighDemandOnly(highDemand);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('shop_filters', JSON.stringify({
      category: selectedCategory,
      search: searchQuery,
      size: selectedSizeFilter,
      price: priceTier,
      sort: sortBy,
      highDemand: highDemandOnly
    }));
  }, [selectedCategory, searchQuery, selectedSizeFilter, priceTier, sortBy, highDemandOnly]);

  useEffect(() => {
    const loadSettingsAndCategories = () => {
      safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null).then((s) => {
        if (s) setSettings(s);
      });

      safeFetchJson<any>('/api/categories', undefined, null).then((catRes) => {
        const catList = Array.isArray(catRes) ? catRes : (catRes?.categories || []);
        if (Array.isArray(catList) && catList.length > 0) {
          setCategories(catList);
        }
      });
    };

    loadSettingsAndCategories();

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<WebsiteSettings>;
      if (customEvent.detail && typeof customEvent.detail === 'object') {
        setSettings(customEvent.detail);
      } else {
        loadSettingsAndCategories();
      }
    };

    window.addEventListener('app_settings_updated', handleSettingsUpdate);
    window.addEventListener('app_categories_updated', loadSettingsAndCategories);
    return () => {
      window.removeEventListener('app_settings_updated', handleSettingsUpdate);
      window.removeEventListener('app_categories_updated', loadSettingsAndCategories);
    };
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (products.length === 0) {
        setLoading(true);
      }
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
        if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
        if (sortBy) queryParams.append('sort', sortBy);
        if (highDemandOnly) queryParams.append('highDemand', 'true');

        if (priceTier === 'under-2000') {
          queryParams.append('maxPrice', '2000');
        } else if (priceTier === '2000-5000') {
          queryParams.append('minPrice', '2000');
          queryParams.append('maxPrice', '5000');
        } else if (priceTier === '5000-10000') {
          queryParams.append('minPrice', '5000');
          queryParams.append('maxPrice', '10000');
        } else if (priceTier === 'above-10000') {
          queryParams.append('minPrice', '10000');
        }

        if (selectedSizeFilter !== 'all') {
          queryParams.append('size', selectedSizeFilter);
        }

        const prodRes = await safeFetchJson<{ products: Product[] }>(`/api/products?${queryParams.toString()}`, undefined, { products: [] });
        const prods = prodRes?.products || [];
        const seenIds = new Set<string>();
        const seenSkus = new Set<string>();
        const unique = prods.filter((p) => {
          if (!p || isSkuBlocked(p?.sku, p?.id)) return false;
          const pid = (p.id || '').trim();
          const psku = (p.sku || '').trim().toUpperCase();
          if (pid && seenIds.has(pid)) return false;
          if (psku && seenSkus.has(psku)) return false;
          if (pid) seenIds.add(pid);
          if (psku) seenSkus.add(psku);
          return true;
        });
        setProducts(unique);

        // Auto-discover unique categories from fetched products if not in categories list
        setCategories((prevCats) => {
          const catSlugs = new Set(prevCats.map((c) => (c.slug || '').toLowerCase()));
          const newAdded = [...prevCats];
          unique.forEach((p) => {
            const pSlug = (p.category_slug || p.category_id || '').toLowerCase();
            const pName = p.category_name || p.category_slug || '';
            if (pSlug && pName && !catSlugs.has(pSlug)) {
              catSlugs.add(pSlug);
              newAdded.push({
                id: p.category_id || `cat-${pSlug}`,
                name: pName,
                slug: pSlug,
                description: `Handcrafted ${pName}`,
                display_order: newAdded.length + 1,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          });
          return newAdded;
        });
      } catch (err) {
        console.error('Error fetching shop data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    window.addEventListener('app_products_updated', fetchProducts);
    return () => window.removeEventListener('app_products_updated', fetchProducts);
  }, [selectedCategory, searchQuery, selectedSizeFilter, priceTier, sortBy, highDemandOnly]);

  // Dynamic sizes according to selected category (Item 3)
  const availableSizes = useMemo(() => {
    const relevant = selectedCategory === 'all'
      ? products
      : products.filter((p) => {
          const pSlug = (p.category_slug || '').toLowerCase();
          const pId = (p.category_id || '').toLowerCase();
          const catLower = selectedCategory.toLowerCase();
          return (
            pSlug === catLower ||
            pId === catLower ||
            pSlug.includes(catLower) ||
            pId.includes(catLower) ||
            (catLower.includes('mandala') && pSlug.includes('mandala')) ||
            (catLower.includes('lippan') && pSlug.includes('lippan'))
          );
        });

    const normalizeSize = (s: string) => {
      return s
        .toLowerCase()
        .replace(/inches/g, 'inch')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const set = new Set<string>();
    relevant.forEach((p) => {
      if (p.base_size && p.base_size.trim()) set.add(normalizeSize(p.base_size));
      if (p.variants && Array.isArray(p.variants)) {
        p.variants.forEach((v: any) => {
          const s = (v.size || v.size_name || '').trim();
          if (s) set.add(normalizeSize(s));
        });
      }
    });

    if (set.size === 0) {
      return [];
    }

    const filteredSizes = Array.from(set).filter(
      (s) => s !== '12 inch diameter'
    );

    return filteredSizes.sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  }, [products, selectedCategory]);

  // Reset size filter when category changes if the size is not valid for new category
  useEffect(() => {
    if (selectedSizeFilter !== 'all' && !availableSizes.includes(selectedSizeFilter)) {
      setSelectedSizeFilter('all');
    }
  }, [availableSizes, selectedSizeFilter]);

  // Price wise sorting & filtering client-side for immediate responsiveness
  const displayedProducts = useMemo(() => {
    let list = [...products];
    if (highDemandOnly) {
      list = list.filter((p) => isProductHighDemand(p));
    }
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (Number(a.base_price) || 0) - (Number(b.base_price) || 0));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (Number(b.base_price) || 0) - (Number(a.base_price) || 0));
    } else if (sortBy === 'high_demand') {
      list.sort((a, b) => (isProductHighDemand(b) ? 1 : 0) - (isProductHighDemand(a) ? 1 : 0));
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (Number(a.base_price) || 0) - (Number(b.base_price) || 0);
      });
    }
    return list;
  }, [products, sortBy, highDemandOnly]);

  const handleDirectArtworkEnquiry = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEnquiryProduct(product);
  };

  return (
    <div className="max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10 space-y-8 bg-theme-page text-theme-primary transition-colors duration-500">

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          Authentic Artwork Catalog
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-theme-primary">
          Dot And Art Product Catalog
        </h1>
        <p className="text-sm text-theme-muted font-light leading-relaxed">
          Original handcrafted pieces created with meditative devotion. Each authentic dot mandala and Lippan mirror artwork is painted by hand with archival materials.
        </p>

      </div>
      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-theme-glass space-y-4 shadow-lg">
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, Product Code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-theme-muted whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="high_demand">🔥 High Demand First</option>
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category & High Demand Filter Buttons */}
        <div className="pt-2 border-t border-theme-glass flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-theme-muted mr-2">Category:</span>
          
          {/* Product Catalog / All Artworks button — STRICTLY highlighted ONLY if selectedCategory === 'all' */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-theme-accent text-white font-semibold shadow-xs ring-2 ring-theme-accent/30'
                : 'bg-theme-page text-theme-primary hover:bg-theme-accent/10 border border-theme-glass'
            }`}
          >
            Product Catalog
          </button>

          {(categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES).map((cat) => {
            const catSlug = (cat.slug || '').toLowerCase();
            const catId = (cat.id || '').toLowerCase();
            const selCat = (selectedCategory || '').toLowerCase();

            const isSelected =
              selCat !== 'all' &&
              (selCat === catSlug ||
                selCat === catId ||
                (catSlug.includes('mandala') && selCat.includes('mandala')) ||
                (catSlug.includes('lippan') && selCat.includes('lippan')) ||
                ((catSlug.includes('tea-light') || catSlug.includes('candle')) && (selCat.includes('tea-light') || selCat.includes('candle'))));

            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-theme-accent text-white font-semibold shadow-xs ring-2 ring-theme-accent/30'
                    : 'bg-theme-page text-theme-primary hover:bg-theme-accent/10 border border-theme-glass'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          {/* High Demand Items Toggle Pill */}
          <button
            onClick={() => setHighDemandOnly(!highDemandOnly)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ml-auto sm:ml-2 ${
              highDemandOnly
                ? 'bg-amber-600 text-white font-semibold shadow-md ring-2 ring-amber-400'
                : 'bg-theme-page text-amber-700 hover:bg-amber-500/10 border border-amber-300/60'
            }`}
            title="Filter high demand handmade artworks"
          >
            <Flame className={`w-3.5 h-3.5 ${highDemandOnly ? 'text-white fill-white' : 'text-amber-600 fill-amber-500'}`} />
            <span>High Demand</span>
            {highDemandOnly && <Check className="w-3 h-3 ml-0.5" />}
          </button>
        </div>

        {/* Row 3: Secondary Filters (Size & Price Range) */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-theme-glass text-xs">
          {/* Size Filter */}
          <div className="flex items-center gap-2">
            <span className="text-theme-muted">Size:</span>
            <select
              value={selectedSizeFilter}
              onChange={(e) => {
                setSelectedSizeFilter(e.target.value);
              }}
              disabled={availableSizes.length === 0}
              className="px-2.5 py-1.5 rounded-md bg-theme-page border border-theme-glass text-theme-primary focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="all">
                {availableSizes.length === 0 ? 'No sizes available' : 'All Sizes'}
              </option>
              {availableSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Price Tier Filter */}
          <div className="flex items-center gap-2">
            <span className="text-theme-muted">Price:</span>
            <select
              value={priceTier}
              onChange={(e) => {
                setPriceTier(e.target.value);
              }}
              className="px-2.5 py-1.5 rounded-md bg-theme-page border border-theme-glass text-theme-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Prices</option>
              <option value="under-2000">Under ₹2,000</option>
              <option value="2000-5000">₹2,000 – ₹5,000</option>
              <option value="5000-10000">₹5,000 – ₹10,000</option>
              <option value="above-10000">Above ₹10,000</option>
            </select>
          </div>

          {/* Reset Filters button if active */}
          {(selectedCategory !== 'all' || selectedSizeFilter !== 'all' || priceTier !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSizeFilter('all');
                setPriceTier('all');
                setSearchQuery('');
              }}
              className="text-xs text-theme-accent hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalog Sub-header Bar */}
      <div className="flex items-center justify-between text-xs text-theme-muted px-1">
        <span>Handcrafted authentic art & custom mandala creations</span>
        <span className="hidden sm:inline">
          Worldwide shipping available on all catalog items
        </span>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-60 sm:h-80 rounded-xl sm:rounded-2xl bg-theme-accent/10 animate-pulse" />
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-theme-glass p-8 space-y-4">
          <p className="font-serif text-xl text-theme-primary">No artworks match your search filters</p>
          <p className="text-xs text-theme-muted">
            Try clearing your search terms or selecting "Product Catalog".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSizeFilter('all');
              setPriceTier('all');
              setSearchQuery('');
              setHighDemandOnly(false);
            }}
            className="px-5 py-2 rounded-full bg-theme-accent text-white text-xs font-semibold cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {displayedProducts.map((product, index) => {
            const isLippan =
              product.category_slug === 'lippan-wall-hangings' ||
              product.name.toLowerCase().includes('lippan') ||
              product.sku.startsWith('DA-LP');
            const isHighDemand = isProductHighDemand(product);
            const extraDays = product.extra_delivery_days !== undefined ? product.extra_delivery_days : 5;
            const primaryImg = product?.images?.find((img) => img.is_primary) || product?.images?.[0];

            return (
              <div
                key={product.id || product.sku}
                className="group rounded-xl sm:rounded-2xl glass-card overflow-hidden border border-theme-glass transition-all duration-300 flex flex-col justify-between bg-theme-card"
              >
                {/* Visual Artwork Thumbnail */}
                <div
                  onClick={() => onSelectProduct(product.sku)}
                  className="relative aspect-square bg-theme-page overflow-hidden cursor-pointer flex items-center justify-center p-1.5 sm:p-3"
                >
                  <SafeProductImage
                    src={primaryImg?.storage_path}
                    alt={primaryImg?.alt_text || product.name}
                    name={product.name}
                    sku={product.sku}
                    category_slug={product.category_slug}
                    size="md"
                    priority={index < 4}
                    fit="contain"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Left: SKU Badge & Available Badge on Artwork Image */}
                  <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-30 flex items-center gap-1 sm:gap-1.5 flex-wrap max-w-[88%]">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded bg-theme-card/90 backdrop-blur-xs text-[8px] sm:text-[10px] font-mono font-semibold text-theme-primary border border-theme-glass shadow-xs">
                      {product.sku}
                    </span>
                    {product.show_available_badge !== false && (
                      <AvailableBadge
                        isAvailable={product.is_available !== false}
                        badgeText={product.available_badge_text}
                        unavailableText={product.unavailable_badge_text}
                        size="xs"
                      />
                    )}
                  </div>

                  {/* High Demand Badge on Thumbnail */}
                  {isHighDemand && (
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 z-30 px-1.5 sm:px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white text-[8px] sm:text-[9px] font-bold shadow-xs flex items-center gap-0.5 sm:gap-1 backdrop-blur-xs">
                      <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white text-white" />
                      <span className="hidden xs:inline">High Demand</span>
                    </div>
                  )}

                  {/* Zoom Badge Button on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedProduct(product);
                    }}
                    className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-30 p-1.5 sm:p-2 rounded-full bg-slate-950/75 hover:bg-slate-900 text-amber-400 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110 shadow-lg border border-amber-500/30"
                    title="Zoom artwork image"
                  >
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>

                  {product.customizable && (
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-30 px-1.5 sm:px-2 py-0.5 rounded bg-theme-dark/80 text-white text-[8px] sm:text-[9px] font-medium backdrop-blur-xs">
                      Customizable
                    </div>
                  )}
                </div>

                {/* Immediate Action Bar below image (Mobile & Desktop) */}
                {(() => {
                  const itemQty = getItemQuantity(product.id);
                  return (
                    <div className="flex items-center justify-between px-2.5 sm:px-3 py-2 bg-theme-page/60 border-b border-theme-glass text-xs">
                      {/* Price */}
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-theme-muted font-semibold block leading-none">Price</span>
                        <p className="font-bold text-xs sm:text-sm text-theme-accent">
                          ₹{product.base_price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Small Icon Actions (No whole text on enquire button; common across previews) */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {/* Zoom Icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedProduct(product);
                          }}
                          className="p-1.5 rounded-full border border-theme-glass text-theme-muted hover:text-theme-primary hover:bg-theme-glass transition-colors cursor-pointer"
                          title="Zoom & inspect artwork image"
                          aria-label="Zoom artwork"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>

                        {/* Enquire on WhatsApp Small Icon (No whole text!) */}
                        <button
                          onClick={(e) => handleDirectArtworkEnquiry(e, product)}
                          className="p-1.5 sm:p-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                          title="Enquire on WhatsApp"
                          aria-label="Enquire on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                        </button>

                        {/* Add to Cart Small Icon (No text!) */}
                        {itemQty > 0 ? (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-theme-accent/15 border border-theme-accent shadow-xs">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decrementItem(product);
                              }}
                              className="w-5 h-5 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-0.5 text-[11px] font-bold text-theme-accent min-w-[0.9rem] text-center">
                              {itemQty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="w-5 h-5 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="p-1.5 sm:p-2 rounded-full bg-theme-accent hover:opacity-90 text-white shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                            title="Add to Cart"
                            aria-label="Add to Cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Content with complete authentic specifications */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase tracking-wider text-theme-muted font-semibold">
                      <span className="truncate mr-1">{isLippan ? 'Lippan Art' : 'Mandala Art'}</span>
                      <span className="font-mono text-theme-accent font-bold px-1 sm:px-1.5 py-0.2 rounded bg-theme-accent/10 border border-theme-glass text-[8px] sm:text-[10px]">
                        {product.sku}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product.sku)}
                      className="font-serif text-xs sm:text-base font-semibold text-theme-primary group-hover:text-theme-accent transition-colors cursor-pointer leading-tight line-clamp-1 sm:line-clamp-2"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    <p className="text-[10px] sm:text-xs text-theme-muted font-light line-clamp-1 hidden sm:block">
                      {product.description}
                    </p>

                    {/* High Demand Positive Notice Free-Text Box (Desktop / Tablet) */}
                    {isHighDemand && (
                      <div
                        className="hidden sm:block p-2.5 rounded-xl border text-[10px] space-y-1 font-medium transition-colors shadow-2xs"
                        style={{
                          backgroundColor: 'var(--high-demand-bg)',
                          borderColor: 'var(--high-demand-border)',
                        }}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1 font-bold" style={{ color: 'var(--high-demand-title)' }}>
                            <Flame className="w-3 h-3 text-orange-600 fill-orange-500 shrink-0" />
                            <span>High Demand Artisan Piece</span>
                          </span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
                            style={{
                              backgroundColor: 'var(--high-demand-pill-bg)',
                              color: 'var(--high-demand-pill-text)',
                            }}
                          >
                            +{extraDays} days
                          </span>
                        </div>
                        <p className="leading-tight font-medium" style={{ color: 'var(--high-demand-text)' }}>
                          {product.high_demand_message ||
                            `Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow ${extraDays} additional days for our master artist to craft and perfect your authentic piece.`}
                        </p>
                      </div>
                    )}

                    {/* Detailed Specifications Box */}
                    <div className="pt-1.5 sm:pt-2 border-t border-theme-glass space-y-1 text-[10px] sm:text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-theme-muted">Size:</span>
                        <span className="font-semibold text-theme-primary truncate ml-1">{product.base_size}</span>
                      </div>
                      <div className="hidden sm:flex justify-between items-start gap-2">
                        <span className="text-theme-muted shrink-0">Material:</span>
                        <span className="font-medium text-theme-primary text-right text-[10px] leading-tight line-clamp-1" title={product.material}>
                          {product.material}
                        </span>
                      </div>
                      <div className="hidden sm:flex justify-between items-center text-[10px] text-theme-muted pt-0.5">
                        <div>Creation: <strong className="text-theme-primary">{product.creation_time}</strong></div>
                        <div>Customizable: <strong className="text-emerald-600 font-bold">Yes</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Zoom Modal for Catalog Items */}
      <ImageZoomModal
        product={zoomedProduct}
        isOpen={!!zoomedProduct}
        onClose={() => setZoomedProduct(null)}
        onSelectProduct={onSelectProduct}
      />

      {/* Single Artwork Copy Modal for Direct Enquiry */}
      {enquiryProduct && (
        <WhatsAppAttachmentModal
          isOpen={!!enquiryProduct}
          onClose={() => setEnquiryProduct(null)}
          messageText={formatSingleProductEnquiry(
            enquiryProduct,
            enquiryProduct.base_size,
            enquiryProduct.base_price
          )}
          attachments={collectAttachmentsForProduct(enquiryProduct)}
          title={`Enquire Artwork — ${enquiryProduct.sku}`}
        />
      )}
    </div>
  );
};
