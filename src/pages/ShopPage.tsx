import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Eye, ShoppingBag, X, Sparkles, ChevronDown, Plus, Minus, Download } from 'lucide-react';
import { Product, Category, WebsiteSettings } from '../types';
import { SafeProductImage } from '../components/SafeProductImage';
import { useCart } from '../context/CartContext';
import { safeFetchJson } from '../lib/safeFetch';
import { generateProfessionalCatalogPDF } from '../utils/pdfCatalogGenerator';
import { FileText, Loader2 } from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  onSelectProduct: (sku: string) => void;
  onNavigate: (path: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory, onSelectProduct, onNavigate }) => {
  const { addToCart, getItemQuantity, decrementItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [priceTier, setPriceTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null).then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
        if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
        if (sortBy) queryParams.append('sort', sortBy);

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

        const [prodRes, catRes] = await Promise.all([
          safeFetchJson<{ products: Product[] }>(`/api/products?${queryParams.toString()}`, undefined, { products: [] }),
          safeFetchJson<Category[]>('/api/categories', undefined, []),
        ]);

        setProducts(prodRes?.products || []);
        setCategories(Array.isArray(catRes) ? catRes : []);
      } catch (err) {
        console.error('Error fetching shop data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, searchQuery, selectedSizeFilter, priceTier, sortBy]);

  const displayedProducts = products;

  const handleDownloadPdfCatalog = async () => {
    if (!products || products.length === 0) return;
    setIsGeneratingPdf(true);
    setPdfProgressText('Initializing PDF Document Engine...');

    try {
      await generateProfessionalCatalogPDF(products, settings, (current, total, name) => {
        setPdfProgressText(`Preparing high-res artwork ${current} of ${total} — ${name}`);
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Unable to generate PDF catalog. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
    }
  };

  const handleDownloadCsvCatalog = () => {
    if (!products || products.length === 0) return;

    const headers = ['SKU', 'Artwork Name', 'Category', 'Base Size', 'Base Price (INR)', 'Customizable', 'Availability', 'Description'];
    
    const csvRows = products.map((p) => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        escape(p.sku),
        escape(p.name),
        escape(p.category_name || p.category_slug || ''),
        escape(p.base_size),
        p.base_price,
        p.customizable ? 'Yes' : 'No',
        p.is_published ? 'In Stock / Available' : 'Custom Order Only',
        escape(p.description),
      ].join(',');
    });

    const csvString = [headers.join(','), ...csvRows].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Dot_And_Art_Product_Catalog.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* PDF Progress Modal Overlay */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-4 border border-theme-glass shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-theme-accent/20 text-theme-accent flex items-center justify-center mx-auto animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-theme-primary">Compiling Professional PDF Catalog</h3>
            <p className="text-xs text-theme-muted">{pdfProgressText}</p>
            <div className="w-full bg-theme-glass rounded-full h-2 overflow-hidden">
              <div className="bg-theme-accent h-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          Authentic Artwork Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          Dot And Art Collection
        </h1>
        <p className="text-sm text-theme-muted font-light leading-relaxed">
          Original handcrafted pieces available in authentic dimensions: 10, 12, 15, 18, 24, and 30 inches.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownloadPdfCatalog}
            disabled={isGeneratingPdf || products.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-theme-accent hover:opacity-90 text-white text-xs font-semibold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Download full professional catalog in PDF format with images and pricing"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Catalog</span>
          </button>

          <button
            onClick={handleDownloadCsvCatalog}
            disabled={products.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-theme-card hover:bg-theme-accent/10 border border-theme-glass text-theme-primary text-xs font-medium transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Download catalog as CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-theme-muted" />
            <span>CSV Catalog</span>
          </button>
        </div>
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
              placeholder="Search by name, SKU..."
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
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Filter Buttons */}
        <div className="pt-2 border-t border-theme-glass flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-theme-muted mr-2">Category:</span>
          <button
            onClick={() => {
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-theme-accent text-white font-semibold shadow-xs'
                : 'bg-theme-page text-theme-primary hover:bg-theme-accent/10 border border-theme-glass'
            }`}
          >
            All Collections
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-theme-accent text-white font-semibold shadow-xs'
                  : 'bg-theme-page text-theme-primary hover:bg-theme-accent/10 border border-theme-glass'
              }`}
            >
              {cat.name}
            </button>
          ))}
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
              className="px-2.5 py-1.5 rounded-md bg-theme-page border border-theme-glass text-theme-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Sizes</option>
              <option value="10 inches">10 inches</option>
              <option value="12 inches">12 inches</option>
              <option value="15 inches">15 inches</option>
              <option value="18 inches">18 inches</option>
              <option value="24 inches">24 inches</option>
              <option value="30 inches">30 inches</option>
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

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-theme-muted px-1">
        <span>
          Showing <strong>{displayedProducts.length}</strong> of <strong>{products.length}</strong> pieces
        </span>
        <span className="hidden sm:inline">
          Worldwide shipping available on all catalog items
        </span>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-theme-accent/10 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-theme-glass p-8 space-y-4">
          <p className="font-serif text-xl text-theme-primary">No artworks match your search filters</p>
          <p className="text-xs text-theme-muted">
            Try clearing your search terms or selecting "All Collections".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSizeFilter('all');
              setPriceTier('all');
              setSearchQuery('');
            }}
            className="px-5 py-2 rounded-full bg-theme-accent text-white text-xs font-semibold cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product, index) => {
            const isLippan =
              product.category_slug === 'lippan-wall-hangings' ||
              product.name.toLowerCase().includes('lippan');
            const primaryImg = product.images?.find((img) => img.is_primary) || product.images?.[0];

            return (
              <div
                key={product.id}
                className="group rounded-2xl glass-card overflow-hidden border border-theme-glass transition-all duration-300 flex flex-col justify-between bg-theme-card"
              >
                {/* Visual Artwork Thumbnail */}
                <div
                  onClick={() => onSelectProduct(product.sku)}
                  className="relative aspect-square bg-theme-page overflow-hidden cursor-pointer flex items-center justify-center p-3"
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



                  {/* SKU Badge */}
                  <div className="absolute top-3 left-3 z-30 px-2 py-0.5 rounded bg-theme-card/90 backdrop-blur-xs text-[10px] font-mono font-semibold text-theme-primary border border-theme-glass">
                    {product.sku}
                  </div>

                  {product.customizable && (
                    <div className="absolute bottom-3 left-3 z-30 px-2 py-0.5 rounded bg-theme-dark/80 text-white text-[9px] font-medium backdrop-blur-xs">
                      Customizable
                    </div>
                  )}
                </div>

                {/* Content with complete authentic specifications */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-theme-muted font-semibold">
                      <span>{isLippan ? 'Lippan Wall Hanging' : 'Mandala Wall Hanging'}</span>
                      <span className="font-mono text-theme-accent font-bold px-1.5 py-0.5 rounded bg-theme-accent/10 border border-theme-glass">
                        {product.sku}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product.sku)}
                      className="font-serif text-base font-semibold text-theme-primary group-hover:text-theme-accent transition-colors cursor-pointer leading-tight"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-theme-muted font-light line-clamp-1">
                      {product.description}
                    </p>

                    {/* Detailed Specifications Box */}
                    <div className="pt-2 border-t border-theme-glass space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-theme-muted">Size:</span>
                        <span className="font-semibold text-theme-primary">{product.base_size}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-theme-muted shrink-0">Material:</span>
                        <span className="font-medium text-theme-primary text-right text-[10px] leading-tight line-clamp-1" title={product.material}>
                          {product.material}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-theme-muted pt-0.5">
                        <div>Creation: <strong className="text-theme-primary">{product.creation_time}</strong></div>
                        <div>Customizable: <strong className="text-emerald-600">Yes</strong></div>
                      </div>
                      <div className="text-[10px] text-theme-muted truncate" title="Worldwide shipping in bubble wrap and corrugated box">
                        Shipping: <strong className="text-theme-primary">Bubble wrap & corrugated box</strong>
                      </div>
                    </div>
                  </div>

                  {/* Item card action area */}
                  {(() => {
                    const itemQty = getItemQuantity(product.id);
                    return (
                      <div className="flex items-center justify-between pt-2.5 border-t border-theme-glass">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-theme-muted font-semibold">Price</span>
                          <p className="font-serif text-base font-bold text-theme-accent">
                            ₹{product.base_price.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectProduct(product.sku)}
                            className="p-2 rounded-full border border-theme-glass text-theme-primary hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
                            title="View artwork details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {itemQty > 0 ? (
                            <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-theme-accent/15 border border-theme-accent shadow-xs">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrementItem(product);
                                }}
                                className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-1.5 text-xs font-bold text-theme-accent min-w-[1.2rem] text-center">
                                {itemQty}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                                className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="px-3.5 py-1.5 rounded-full bg-theme-accent hover:opacity-90 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                              title="Add to cart"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
