import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Clock,
  Hammer,
  Palette,
  CheckCircle2,
  Info,
  Plus,
  Minus,
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { SafeProductImage } from '../components/SafeProductImage';
import { useCart } from '../context/CartContext';
import { createWhatsAppUrl, formatSingleProductEnquiry, openExternalLink } from '../utils/whatsapp';

interface ProductDetailPageProps {
  sku: string;
  onBack: () => void;
  onSelectProduct: (sku: string) => void;
  onNavigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  sku,
  onBack,
  onSelectProduct,
  onNavigate,
}) => {
  const { addToCart, getItemQuantity, decrementItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // User Interactive Selections
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [customizationNotes, setCustomizationNotes] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const data = await safeFetchJson<{ product: Product; related: Product[] } | null>(
          `/api/products/${sku}`,
          undefined,
          null
        );
        if (data && data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          if (data.product?.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          } else {
            setSelectedVariant(undefined);
          }
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sku]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-theme-page text-theme-primary">
        <div className="w-12 h-12 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-theme-muted">Loading artwork details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 bg-theme-page text-theme-primary">
        <h2 className="font-serif text-2xl font-bold text-theme-primary">Artwork Not Found</h2>
        <p className="text-xs text-theme-muted">
          The product code you requested may have been moved or updated.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-theme-accent text-white text-xs font-semibold cursor-pointer"
        >
          Return to Shop Catalog
        </button>
      </div>
    );
  }

  const isLippan =
    product.category_slug === 'lippan-wall-hangings' || product.name.toLowerCase().includes('lippan');
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const currentSize = selectedVariant ? selectedVariant.size : product.base_size;

  const handleDirectWhatsApp = () => {
    const msg = formatSingleProductEnquiry(product, currentSize, currentPrice, customizationNotes);
    const url = createWhatsAppUrl(msg);
    openExternalLink(url);
  };

  const handleAddAndEnquire = () => {
    addToCart(product, selectedVariant, customizationNotes);
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [];
  const currentActiveImage = imagesList[activeImageIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-theme-primary hover:text-theme-accent transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden glass-card p-2 border border-theme-glass shadow-lg">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-theme-page flex items-center justify-center p-3">
              <SafeProductImage
                src={currentActiveImage?.storage_path}
                alt={currentActiveImage?.alt_text || product.name}
                name={product.name}
                sku={product.sku}
                category_slug={product.category_slug}
                size="lg"
                fit="contain"
                className="w-full h-full object-contain"
              />

              {/* SKU Pill */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-theme-card/95 backdrop-blur-xs text-xs font-mono font-semibold text-theme-primary border border-theme-glass">
                Code: {product.sku}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip (if multiple photos available) */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer flex items-center justify-center p-1 bg-theme-page ${
                    activeImageIndex === idx
                      ? 'border-theme-accent scale-105 shadow-xs'
                      : 'border-theme-glass opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeProductImage
                    src={img.storage_path}
                    alt={img.alt_text || `Thumbnail ${idx + 1}`}
                    name={product.name}
                    sku={product.sku}
                    category_slug={product.category_slug}
                    size="sm"
                    fit="contain"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Specifications & Direct Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2 border-b border-theme-glass pb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-accent">
                {product.category_name || (isLippan ? 'Lippan Mud-Mirror Art' : 'Mandala Wall Hanging')}
              </span>
              <span>•</span>
              <span className="text-xs font-mono text-theme-muted bg-theme-accent/10 px-2 py-0.5 rounded border border-theme-glass">
                {product.sku}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-theme-primary leading-tight">
              {product.name}
            </h1>

            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-theme-accent">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-theme-muted italic">
                (Standard catalog size: {currentSize})
              </span>
            </div>
          </div>

          {/* Size / Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-primary">
                Select Dimensions / Size:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-theme-accent bg-theme-accent/15 text-theme-accent ring-1 ring-theme-accent shadow-xs'
                          : 'border-theme-glass bg-theme-card text-theme-primary hover:bg-theme-accent/10'
                      }`}
                    >
                      <div className="font-semibold">{v.size}</div>
                      <div className="text-[11px] text-theme-muted">₹{v.price.toLocaleString('en-IN')}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-primary">About This Artwork</h4>
            <p className="text-xs sm:text-sm text-theme-muted leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Craft Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl glass-panel border border-theme-glass text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Hammer className="w-3 h-3 text-theme-accent" /> Material
              </span>
              <p className="font-medium text-theme-primary">{product.material}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Info className="w-3 h-3 text-theme-accent" /> Framing
              </span>
              <p className="font-medium text-theme-primary">{product.framing}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Clock className="w-3 h-3 text-theme-accent" /> Creation Time
              </span>
              <p className="font-medium text-theme-primary">{product.creation_time}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Truck className="w-3 h-3 text-theme-accent" /> Shipping
              </span>
              <p className="font-medium text-theme-primary">{product.shipping_info}</p>
            </div>
          </div>

          {/* Special Information & Care Note */}
          {product.special_information && (
            <div className="p-3.5 rounded-xl glass-card border border-theme-glass text-[11px] text-theme-muted flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-theme-primary">Care Instructions:</strong> {product.special_information}
              </div>
            </div>
          )}

          {/* Customization Request Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-theme-primary">
              Customization Requests (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Prefer peacock teal accents, need gift packaging..."
              value={customizationNotes}
              onChange={(e) => setCustomizationNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-theme-card border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
            />
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleDirectWhatsApp}
              className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enquire on WhatsApp (+91 86521 62647)</span>
            </button>

            {(() => {
              const detailQty = getItemQuantity(product.id, selectedVariant?.size);
              if (detailQty > 0) {
                return (
                  <div className="w-full p-2.5 rounded-full border border-theme-accent bg-theme-accent/15 flex items-center justify-between shadow-xs">
                    <button
                      onClick={() => decrementItem(product, selectedVariant?.size)}
                      className="w-9 h-9 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                      title="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="text-center px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent block">
                        Added to Cart
                      </span>
                      <span className="text-sm font-bold text-theme-primary">
                        {detailQty} {detailQty === 1 ? 'item' : 'items'} in cart
                      </span>
                    </div>
                    <button
                      onClick={handleAddAndEnquire}
                      className="w-9 h-9 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                      title="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              }
              return (
                <button
                  onClick={handleAddAndEnquire}
                  className="w-full py-3.5 px-6 rounded-full bg-theme-accent hover:opacity-90 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span>Add to Cart</span>
                </button>
              );
            })()}
          </div>

          {/* Policy summary */}
          <div className="text-[11px] text-theme-muted text-center pt-2">
            <span>Payment Policy: 50% advance upon order confirmation • 50% prior to dispatch.</span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-theme-glass space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-semibold text-theme-primary">
              Related Artworks from this Collection
            </h3>
            <button
              onClick={() => onNavigate(`/shop?category=${product.category_slug}`)}
              className="text-xs font-bold text-theme-accent hover:opacity-80 cursor-pointer"
            >
              View More in Category →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((rel) => {
              const relImg = rel.images?.find((i) => i.is_primary) || rel.images?.[0];

              return (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel.sku)}
                  className="group rounded-2xl glass-card border border-theme-glass overflow-hidden cursor-pointer p-3 space-y-2.5 transition-all hover:scale-105 bg-theme-card"
                >
                  <div className="relative aspect-square rounded-xl bg-theme-page overflow-hidden flex items-center justify-center p-2">
                    <SafeProductImage
                      src={relImg?.storage_path}
                      alt={rel.name}
                      name={rel.name}
                      sku={rel.sku}
                      category_slug={rel.category_slug}
                      size="sm"
                      fit="contain"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />

                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-theme-muted">{rel.sku}</span>
                    <h5 className="font-serif text-sm font-semibold text-theme-primary truncate group-hover:text-theme-accent">
                      {rel.name}
                    </h5>
                    <p className="font-serif text-sm font-bold text-theme-accent mt-1">
                      ₹{rel.base_price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
