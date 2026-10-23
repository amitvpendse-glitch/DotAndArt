import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  ShoppingBag,
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
  Eye,
  ZoomIn,
  Flame,
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { safeFetchJson } from '../lib/safeFetch';
import { SafeProductImage } from '../components/SafeProductImage';
import { ImageZoomModal } from '../components/ImageZoomModal';
import { AvailableBadge } from '../components/AvailableBadge';
import { useCart } from '../context/CartContext';
import {
  dispatchDirectWhatsAppOrder,
  formatSingleProductEnquiry,
  collectAttachmentsForProduct,
  WhatsAppAttachmentItem,
  getDisplayWhatsAppNumber,
} from '../utils/whatsapp';
import { WhatsAppAttachmentModal } from '../components/WhatsAppAttachmentModal';
import { isSkuBlocked } from '../lib/blockedSkus';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [preparedEnquiry, setPreparedEnquiry] = useState<{
    msg: string;
    attachments: WhatsAppAttachmentItem[];
  }>({ msg: '', attachments: [] });

  useEffect(() => {
    if (isSkuBlocked(sku)) {
      setProduct(null);
      setRelated([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'products');
    const q = query(colRef, where('sku', '==', sku));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const productDoc = snapshot.docs[0];
        const data = productDoc.data() as Product;
        const prod = { ...data, id: productDoc.id };
        setProduct(prod);

        // Fetch related products (keep as is or update to snapshot)
        // Since related products depend on category_id, we can keep the simple fetch or also make it real-time
        // For now, let's keep the related logic simple
        safeFetchJson<{ product: Product; related: Product[] } | null>(
          `/api/products/${sku}`,
          undefined,
          null
        ).then((data) => {
          if (data && data.related) {
            const rawRel = data.related || [];
            const seenRel = new Set<string>();
            const uniqueRel = rawRel.filter((p) => {
              const pid = p?.id || p?.sku;
              if (!pid || seenRel.has(pid)) return false;
              seenRel.add(pid);
              return true;
            });
            setRelated(uniqueRel);
          }
        });
        
        // Auto-select variant if not already selected
        if (!selectedVariant && prod?.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
    product.category_slug === 'lippan-wall-hangings' ||
    product.name.toLowerCase().includes('lippan') ||
    product.sku.startsWith('DA-LP');
  const isHighDemand = product.is_high_demand !== undefined ? product.is_high_demand : isLippan;
  const extraDays = product.extra_delivery_days !== undefined ? product.extra_delivery_days : 5;
  const highDemandNotice =
    product.high_demand_message ||
    'Loved by collectors! Due to high artisan demand and intricate mirror curing, please allow 5 additional days for our master artist to craft and perfect your authentic piece.';
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const currentSize = selectedVariant ? selectedVariant.size : product.base_size;



  const handleDirectWhatsApp = () => {
    const msg = formatSingleProductEnquiry(product, currentSize, currentPrice, customizationNotes);
    const attachments = collectAttachmentsForProduct(product);
    setPreparedEnquiry({ msg, attachments });
    setAttachmentModalOpen(true);
  };

  const handleAddAndEnquire = () => {
    addToCart(product, selectedVariant, customizationNotes);
  };

  const imagesList = product?.images && product?.images.length > 0 ? product?.images : [];
  const currentActiveImage = imagesList[activeImageIndex];

  return (
    <div className="max-w-7xl 2xl:max-w-[1500px] 3xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 space-y-16 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-theme-primary hover:text-theme-accent transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </button>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden glass-card p-2 border border-theme-glass shadow-lg group">
            <div
              onClick={() => setIsZoomOpen(true)}
              className="relative w-full h-full rounded-2xl overflow-hidden bg-theme-page flex items-center justify-center p-3 cursor-zoom-in"
            >
              <SafeProductImage
                src={currentActiveImage?.storage_path}
                alt={currentActiveImage?.alt_text || product.name}
                name={product.name}
                sku={product.sku}
                category_slug={product.category_slug}
                size="lg"
                fit="contain"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
              />

              {/* Top Left: Product Code Pill & Available Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className="px-3 py-1 rounded-md bg-theme-card/95 backdrop-blur-xs text-xs font-mono font-semibold text-theme-primary border border-theme-glass shadow-xs">
                  Product Code: {product.sku}
                </div>
                {product.show_available_badge !== false && (
                  <AvailableBadge
                    isAvailable={product.is_available !== false}
                    badgeText={product.available_badge_text}
                    unavailableText={product.unavailable_badge_text}
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Immediate Action Bar below Artwork Image (Enquire & Add to Cart) */}
          {(() => {
            const detailQty = getItemQuantity(product.id, selectedVariant?.size);
            return (
              <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-theme-card/90 rounded-2xl border border-theme-glass text-xs shadow-md">
                {/* Price & Dimensions — Hidden on mobile to prevent buttons from wrapping/becoming round */}
                <div className="hidden sm:flex items-center gap-2.5">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-theme-muted font-semibold block leading-none">Price</span>
                    <p className="font-sans font-bold text-base sm:text-lg text-theme-accent mt-0.5">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="text-theme-glass text-sm">|</span>
                  <div className="text-[11px] text-theme-muted font-mono font-medium">
                    {currentSize}
                  </div>
                </div>

                {/* Sleek Action Buttons (Enquire & Add to Cart) — Full breathing room on mobile */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Enquire Button */}
                  <button
                    onClick={handleDirectWhatsApp}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    title="Enquire via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                    <span>Enquire</span>
                  </button>

                  {/* Add to Cart Button */}
                  {detailQty > 0 ? (
                    <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-full bg-theme-accent/15 border border-theme-accent shadow-xs shrink-0">
                      <button
                        onClick={() => decrementItem(product, selectedVariant?.size)}
                        className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-theme-primary px-1 font-mono">
                        {detailQty}
                      </span>
                      <button
                        onClick={handleAddAndEnquire}
                        className="w-6 h-6 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddAndEnquire}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-theme-accent hover:opacity-90 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Thumbnail Strip (if multiple photos available) */}
          {imagesList.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1">
              {imagesList.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer flex items-center justify-center p-2 bg-theme-page ${
                    activeImageIndex === idx
                      ? 'border-theme-accent scale-105 shadow-md ring-2 ring-theme-accent/20'
                      : 'border-theme-glass opacity-75 hover:opacity-100 hover:scale-102'
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
                Product Code: {product.sku}
              </span>
            </div>

            <h1 className="font-sans text-3xl sm:text-4xl font-bold text-theme-primary leading-tight">
              {product.name}
            </h1>

            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-sans text-3xl font-bold text-theme-accent">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Availability & High Demand Status Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {product.show_available_badge !== false && (
                <AvailableBadge
                  isAvailable={product.is_available !== false}
                  badgeText={product.available_badge_text}
                  unavailableText={product.unavailable_badge_text}
                  size="md"
                />
              )}
              {isHighDemand && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-xs">
                  <Flame className="w-3.5 h-3.5 fill-white text-white" />
                  <span>🔥 High Demand</span>
                </span>
              )}
            </div>

            {/* High Demand Positive Notice Box */}
            {isHighDemand && (
              <div
                className="mt-3 p-4 rounded-2xl border space-y-2 text-xs transition-colors shadow-2xs"
                style={{
                  backgroundColor: 'var(--high-demand-bg)',
                  borderColor: 'var(--high-demand-border)',
                }}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--high-demand-title)' }}>
                    <Flame className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>High Demand Artisan Creation</span>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono"
                    style={{
                      backgroundColor: 'var(--high-demand-pill-bg)',
                      color: 'var(--high-demand-pill-text)',
                    }}
                  >
                    +{extraDays} days crafting
                  </span>
                </div>
                <p className="leading-relaxed font-medium" style={{ color: 'var(--high-demand-text)' }}>
                  {highDemandNotice}
                </p>
              </div>
            )}
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

          {/* Craft Specifications Grid - Complete Official Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl glass-panel border border-theme-glass text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Hammer className="w-3 h-3 text-theme-accent" /> Material
              </span>
              <p className="font-medium text-theme-primary">{product.material}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Palette className="w-3 h-3 text-theme-accent" /> Customizable?
              </span>
              <p className="font-medium text-emerald-600">Yes</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-theme-accent" /> Photos Available?
              </span>
              <p className="font-medium text-theme-primary">{product.photos_available_note || 'Yes'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Clock className="w-3 h-3 text-theme-accent" /> Creation Time
              </span>
              <p className="font-medium text-theme-primary">{product.creation_time}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-theme-muted flex items-center gap-1">
                <Truck className="w-3 h-3 text-theme-accent" /> Shipping Details
              </span>
              <p className="font-medium text-theme-primary">
                {product.shipping_info.toLowerCase().includes('bubble wrap')
                  ? product.shipping_info
                  : `${product.shipping_info} • Bubble wrap and corrugated box`}
              </p>
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



          {/* Location 2: Bottom Action Row after Description */}
          {(() => {
            const detailQty = getItemQuantity(product.id, selectedVariant?.size);
            return (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleDirectWhatsApp}
                  className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  title="Enquire via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enquire</span>
                </button>

                {detailQty > 0 ? (
                  <div className="w-full sm:flex-1 py-2.5 px-4 rounded-full bg-theme-accent/15 border border-theme-accent flex items-center justify-between shadow-xs">
                    <span className="text-xs font-bold text-theme-primary font-mono">
                      In Cart: {detailQty}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrementItem(product, selectedVariant?.size)}
                        className="w-7 h-7 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleAddAndEnquire}
                        className="w-7 h-7 rounded-full bg-theme-accent text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleAddAndEnquire}
                    className="w-full sm:flex-1 py-3 px-5 rounded-full bg-theme-accent hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            );
          })()}

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
              Related Artworks from Product Catalog
            </h3>
            <button
              onClick={() => onNavigate(`/shop?category=${product.category_slug}`)}
              className="text-xs font-bold text-theme-accent hover:opacity-80 cursor-pointer"
            >
              View More in Category →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {related.map((rel, idx) => {
              const relImg = rel?.images?.find((i) => i.is_primary) || rel?.images?.[0];

              return (
                <div
                  key={rel.id ? `${rel.id}-${idx}` : `${rel.sku}-${idx}`}
                  onClick={() => onSelectProduct(rel.sku)}
                  className="group rounded-xl sm:rounded-2xl glass-card border border-theme-glass overflow-hidden cursor-pointer p-2 sm:p-3 space-y-1.5 sm:space-y-2.5 transition-all hover:scale-105 bg-theme-card"
                >
                  <div className="relative aspect-square rounded-lg sm:rounded-xl bg-theme-page overflow-hidden flex items-center justify-center p-1.5 sm:p-2">
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
                    <span className="text-[8px] sm:text-[10px] font-mono text-theme-muted">{rel.sku}</span>
                    <h5 className="font-serif text-xs sm:text-sm font-semibold text-theme-primary truncate group-hover:text-theme-accent">
                      {rel.name}
                    </h5>
                    <p className="font-serif text-xs sm:text-sm font-bold text-theme-accent mt-0.5 sm:mt-1">
                      ₹{rel.base_price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <WhatsAppAttachmentModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        messageText={preparedEnquiry.msg}
        attachments={preparedEnquiry.attachments}
        title={`Enquiry for ${product.name}`}
      />
      <ImageZoomModal
        product={product}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        initialImageIndex={activeImageIndex}
      />
    </div>
  );
};
