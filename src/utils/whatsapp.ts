import { CartItem, CustomMandalaInquiry, Product } from '../types';

export const BUSINESS_WHATSAPP_NUMBER = '918652162647';
export const DISPLAY_WHATSAPP_NUMBER = '+91 86521 62647';

export interface WhatsAppAttachmentItem {
  url: string;
  filename: string;
  title?: string;
  sku?: string;
}

/**
 * Creates a WhatsApp click-to-chat URL with properly encoded message text
 */
export function createWhatsAppUrl(message: string): string {
  const cleanNumber = BUSINESS_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Safely navigates/opens external links without calling window.open (avoids iframe blocking)
 */
export function openExternalLink(url: string): void {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.location.href = url;
  }
}

/**
 * Helper to resolve all valid direct URLs for a product's images
 */
export function getAbsoluteImageUrls(product: Product): string[] {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://dotandart.in';

  const urls: string[] = [];

  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      let path = img.storage_path;
      if (path) {
        if (!path.startsWith('http')) {
          if (!path.startsWith('/')) path = '/' + path;
          path = `${origin}${path}`;
        }
        if (!urls.includes(path)) urls.push(path);
      }
    });
  }

  // Fallback to standard SKU image path if no image list found
  if (urls.length === 0 && product.sku) {
    urls.push(`${origin}/static/assets/images/${product.sku}.jpg`);
  }

  return urls;
}

/**
 * Collects all attachment items for a single product (multiple images if present)
 */
export function collectAttachmentsForProduct(product: Product): WhatsAppAttachmentItem[] {
  const urls = getAbsoluteImageUrls(product);
  return urls.map((url, i) => {
    const suffix = urls.length > 1 ? `_${i + 1}` : '';
    return {
      url,
      filename: `${product.sku}${suffix}.jpg`,
      title: product.name,
      sku: product.sku,
    };
  });
}

/**
 * Collects all attachment items across all products in a cart
 */
export function collectAttachmentsForCart(items: CartItem[]): WhatsAppAttachmentItem[] {
  const all: WhatsAppAttachmentItem[] = [];
  const seenUrls = new Set<string>();

  items.forEach((item) => {
    const productAttachments = collectAttachmentsForProduct(item.product);
    productAttachments.forEach((att) => {
      if (!seenUrls.has(att.url)) {
        seenUrls.add(att.url);
        all.push(att);
      }
    });
  });

  return all;
}

/**
 * Fetches image blobs and converts them to File objects for native sharing or downloading
 */
export async function fetchImageFiles(attachments: WhatsAppAttachmentItem[]): Promise<File[]> {
  const files: File[] = [];
  for (let i = 0; i < attachments.length; i++) {
    const item = attachments[i];
    try {
      const res = await fetch(item.url);
      if (!res.ok) continue;
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const cleanName = item.filename ? item.filename.replace(/\.[^/.]+$/, '') : `artwork_${i + 1}`;
      const file = new File([blob], `${cleanName}.${ext}`, { type: blob.type || 'image/jpeg' });
      files.push(file);
    } catch (e) {
      console.warn('Could not load image file:', item.url, e);
    }
  }
  return files;
}

/**
 * Attempts native WhatsApp Web Share with file attachments
 */
export async function sendNativeWhatsAppShare(
  message: string,
  attachments: WhatsAppAttachmentItem[]
): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.share || !attachments || attachments.length === 0) {
    return 'unsupported';
  }

  try {
    const files = await fetchImageFiles(attachments);
    if (files.length === 0) return 'unsupported';

    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({
        files,
        title: 'Dot And Art Order Enquiry',
        text: message,
      });
      return 'shared';
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return 'cancelled';
    }
    console.warn('Native share error:', err);
  }

  return 'unsupported';
}

/**
 * Initiates automatic download of all attachments so the user can easily attach them in WhatsApp Web
 */
export async function downloadAllAttachments(attachments: WhatsAppAttachmentItem[]): Promise<void> {
  for (let i = 0; i < attachments.length; i++) {
    const item = attachments[i];
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = item.filename || `artwork_${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.filename || `artwork_${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}

/**
 * Copies an image directly to the system clipboard so the user can press Ctrl+V / Cmd+V in WhatsApp Web
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.write) {
    return false;
  }

  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    // The Clipboard API generally requires image/png format
    let pngBlob = blob;
    if (blob.type !== 'image/png') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
      img.src = URL.createObjectURL(blob);
      const loadedImg = await loaded;
      const canvas = document.createElement('canvas');
      canvas.width = loadedImg.naturalWidth;
      canvas.height = loadedImg.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(loadedImg, 0, 0);
        pngBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b || blob), 'image/png')
        );
      }
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}

/**
 * Formats a single product enquiry message.
 * IMPORTANT: No image links are printed in the text; images go as media attachments!
 */
export function formatSingleProductEnquiry(
  product: Product,
  selectedSize?: string,
  price?: number,
  customizationNotes?: string
): string {
  const sizeToDisplay = selectedSize || product.base_size || 'Standard';
  const priceToDisplay = price !== undefined ? price : product.base_price;
  const imageCount = (product.images && product.images.length > 0) ? product.images.length : 1;

  let msg = `Hello Dot And Art,

I would like to enquire about the following artwork:

Product: ${product.name}
Code: ${product.sku}
Size: ${sizeToDisplay}
Displayed price: ₹${priceToDisplay.toLocaleString('en-IN')}`;

  if (customizationNotes && customizationNotes.trim()) {
    msg += `\nCustomization requirements: ${customizationNotes.trim()}`;
  }

  msg += `\n\n[Attached: ${imageCount > 1 ? `${imageCount} artwork photos` : 'Artwork photo'}]`;
  msg += `\n\nPlease confirm availability, final pricing, delivery charges, and estimated dispatch time. Thank you!`;
  return msg;
}

/**
 * Formats multi-product enquiry list message.
 * IMPORTANT: No image links are printed in the text; images go as media attachments!
 */
export function formatMultiProductEnquiry(
  items: CartItem[],
  customer: {
    name: string;
    whatsapp: string;
    deliveryLocation: string;
    additionalMessage?: string;
    generalCustomization?: string;
  }
): string {
  let msg = `Hello Dot And Art,\n\nI would like to enquire about the following artwork:\n\n`;

  let totalImagesCount = 0;
  items.forEach((item, index) => {
    msg += `${index + 1}. Product: ${item.product.name}\n`;
    msg += `   Code: ${item.product.sku}\n`;
    msg += `   Size: ${item.size}\n`;
    msg += `   Quantity: ${item.quantity}\n`;
    msg += `   Displayed price: ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;

    const imgCount = (item.product.images && item.product.images.length > 0) ? item.product.images.length : 1;
    totalImagesCount += imgCount;

    if (item.customization_notes && item.customization_notes.trim()) {
      msg += `   Item Note: ${item.customization_notes.trim()}\n`;
    }
    msg += `\n`;
  });

  if (customer.generalCustomization && customer.generalCustomization.trim()) {
    msg += `Customization: ${customer.generalCustomization.trim()}\n`;
  } else {
    const combinedNotes = items
      .filter((i) => i.customization_notes)
      .map((i) => `${i.product.sku}: ${i.customization_notes}`)
      .join('; ');
    if (combinedNotes) {
      msg += `Customization: ${combinedNotes}\n`;
    }
  }

  msg += `Customer name: ${customer.name}\n`;
  msg += `Customer WhatsApp: ${customer.whatsapp}\n`;
  msg += `Delivery location: ${customer.deliveryLocation}\n`;

  if (customer.additionalMessage && customer.additionalMessage.trim()) {
    msg += `Additional message: ${customer.additionalMessage.trim()}\n`;
  }

  msg += `\n[Attached: ${totalImagesCount} artwork photos for the items above]`;
  msg += `\n\nPlease confirm availability, final pricing, delivery charges, and estimated dispatch time.`;

  return msg;
}

/**
 * Formats dedicated custom mandala commission enquiry.
 * IMPORTANT: No image links are printed in the text; images go as media attachments!
 */
export function formatCustomMandalaEnquiry(
  data: CustomMandalaInquiry,
  hasAttachments?: boolean
): string {
  let msg = `Hello Dot And Art,

I would like to request a bespoke custom handmade mandala commission:

Customer name: ${data.customer_name}
Customer WhatsApp: ${data.whatsapp_number}`;

  if (data.email) {
    msg += `\nEmail: ${data.email}`;
  }

  msg += `\nDelivery location: ${data.delivery_address}`;

  if (data.reference_product_code) {
    msg += `\nReference Product Code: ${data.reference_product_code}`;
  }

  msg += `\nDesired size: ${data.desired_size}`;
  if (data.preferred_color_scheme && data.preferred_color_scheme.trim()) {
    msg += `\nPreferred color scheme: ${data.preferred_color_scheme.trim()}`;
  }

  if (data.central_photo_requirement) {
    msg += `\nCentral photo/deity requirement & size: ${data.central_photo_requirement}`;
  }

  if (data.specific_pattern_requirements) {
    msg += `\nSpecific pattern requirements: ${data.specific_pattern_requirements}`;
  }

  if (data.additional_instructions) {
    msg += `\nAdditional instructions: ${data.additional_instructions}`;
  }

  if (hasAttachments || data.reference_product_code) {
    msg += `\n\n[Reference photos attached to this WhatsApp message]`;
  }

  msg += `\n\nPlease share design details, estimated timeline, and advance payment instructions. Thank you!`;

  return msg;
}
