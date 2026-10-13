import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, AlertCircle, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SafeProductImage } from './SafeProductImage';
import {
  createWhatsAppUrl,
  formatMultiProductEnquiry,
  openExternalLink,
  collectAttachmentsForCart,
  sendNativeWhatsAppShare,
  WhatsAppAttachmentItem,
} from '../utils/whatsapp';
import { WhatsAppAttachmentModal } from './WhatsAppAttachmentModal';

export const EnquiryDrawer: React.FC = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    totalItems,
    totalEstimatedPrice,
  } = useCart();

  // Customer Details Form State
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [preparedEnquiry, setPreparedEnquiry] = useState<{
    msg: string;
    attachments: WhatsAppAttachmentItem[];
  }>({ msg: '', attachments: [] });

  if (!isDrawerOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerWhatsApp.trim() || customerWhatsApp.trim().length < 8) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return;
    }
    setErrorMessage('');

    const formattedMessage = formatMultiProductEnquiry(items, {
      name: customerName.trim(),
      whatsapp: customerWhatsApp.trim(),
      deliveryLocation: deliveryLocation.trim() || 'Not specified',
      additionalMessage: additionalMessage.trim(),
      generalCustomization: '',
    });

    const attachments = collectAttachmentsForCart(items);

    // Record order enquiry on server safely
    try {
      await fetch('/api/custom-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          whatsapp_number: customerWhatsApp,
          desired_size: items.map((i) => `${i.product.sku} (${i.size})`).join(', '),
          preferred_color_scheme: 'Catalog selection',
        }),
      });
    } catch {
      // non-blocking
    }

    // Attempt native share with files (on mobile, directly attaches images in WhatsApp!)
    const result = await sendNativeWhatsAppShare(formattedMessage, attachments);
    if (result === 'shared') {
      return;
    }

    // Otherwise, open attachment modal for desktop or fallback
    setPreparedEnquiry({ msg: formattedMessage, attachments });
    setAttachmentModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#12100E]/70 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-theme-card text-theme-primary shadow-2xl flex flex-col border-l border-theme-glass">
          {/* Header */}
          <div className="px-6 py-5 bg-theme-page border-b border-theme-glass flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-theme-accent/15 text-theme-accent flex items-center justify-center border border-theme-glass">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-theme-primary">Your Cart</h3>
                <p className="text-[11px] text-theme-muted font-medium">
                  {items.length === 0
                    ? 'Your cart is empty'
                    : `${totalItems} item${totalItems > 1 ? 's' : ''} in cart`}
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-full text-theme-muted hover:bg-theme-glass hover:text-theme-primary transition-colors cursor-pointer"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-theme-accent/10 flex items-center justify-center text-theme-accent">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-theme-primary">Your Cart is Empty</h4>
                <p className="text-xs text-theme-muted max-w-xs mx-auto">
                  Browse our handmade mandala and Lippan collections to easily add artworks to your cart.
                </p>
                <button
                  onClick={closeDrawer}
                  className="mt-2 px-6 py-2.5 rounded-full bg-theme-accent text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Product Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-theme-glass">
                    <span className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                      Cart Items ({items.length})
                    </span>
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-red-500 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  {items.map((item, index) => {
                    const primaryImg = item.product.images?.find((img) => img.is_primary) || item.product.images?.[0];

                    return (
                      <div
                        key={`${item.product.id}-${item.size}-${index}`}
                        className="p-3.5 rounded-2xl bg-theme-page/60 border border-theme-glass shadow-xs space-y-2.5"
                      >
                        <div className="flex gap-3">
                          {/* Image Thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-theme-glass bg-theme-card">
                            <SafeProductImage
                              src={primaryImg?.storage_path}
                              alt={primaryImg?.alt_text || item.product.name}
                              name={item.product.name}
                              sku={item.product.sku}
                              category_slug={item.product.category_slug}
                              size="sm"
                              className="w-full h-full"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="font-serif text-sm font-semibold text-theme-primary truncate">
                                {item.product.name}
                              </h5>
                              <button
                                onClick={() => removeFromCart(index)}
                                className="text-theme-muted hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-theme-muted mt-0.5">
                              <span className="font-mono bg-theme-card px-1.5 py-0.2 rounded border border-theme-glass">
                                {item.product.sku}
                              </span>
                              <span>•</span>
                              <span>{item.size}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-theme-glass rounded-lg overflow-hidden bg-theme-card">
                                <button
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                  className="p-1.5 hover:bg-theme-glass text-theme-primary cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2.5 text-xs font-semibold text-theme-primary">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  className="p-1.5 hover:bg-theme-glass text-theme-primary cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-sm font-bold text-theme-accent">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Optional Customization note */}
                        <div>
                          <input
                            type="text"
                            placeholder="Optional: color request, custom date..."
                            value={item.customization_notes || ''}
                            onChange={(e) => updateNotes(index, e.target.value)}
                            className="w-full text-[11px] px-3 py-1.5 rounded-lg bg-theme-card border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Total Summary */}
                <div className="p-4 rounded-2xl bg-theme-page/80 border border-theme-glass flex items-center justify-between">
                  <div>
                    <span className="text-xs text-theme-muted font-medium">Cart Total</span>
                    <p className="text-[10px] text-theme-muted opacity-80">Inclusive of catalog artwork pricing</p>
                  </div>
                  <span className="font-serif text-xl font-bold text-theme-accent">
                    ₹{totalEstimatedPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Direct Customer Details & Submit Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                    Order Details
                  </h4>

                  {errorMessage && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-theme-primary mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Anjali Nair"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-theme-primary mb-1">
                      WhatsApp / Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerWhatsApp}
                      onChange={(e) => setCustomerWhatsApp(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-theme-primary mb-1">
                      Delivery Location / City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="e.g. Mumbai 400053 or London, UK"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-theme-primary mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={additionalMessage}
                      onChange={(e) => setAdditionalMessage(e.target.value)}
                      placeholder="Delivery deadline or gift note..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary resize-none"
                    />
                  </div>

                  {/* Direct Submit Button - Simple and clear */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-3 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Submit</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <WhatsAppAttachmentModal
        isOpen={attachmentModalOpen}
        onClose={() => {
          setAttachmentModalOpen(false);
          closeDrawer();
        }}
        messageText={preparedEnquiry.msg}
        attachments={preparedEnquiry.attachments}
        title="Order Enquiry & Artwork Attachments"
      />
    </div>
  );
};
