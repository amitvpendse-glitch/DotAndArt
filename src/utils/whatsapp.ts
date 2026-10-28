import JSZip from 'jszip';
import { CartItem, CustomMandalaInquiry, Product } from '../types';
import { getLocalArtworkImage } from './localImageCache';

export const BUSINESS_WHATSAPP_NUMBER = '918652162647';
export const DISPLAY_WHATSAPP_NUMBER = '+91 8652162647';

export function setActiveWhatsAppNumber(_num: string, _display?: string): void {
  // Hardcoded
}

export function getActiveWhatsAppNumber(): string {
  return BUSINESS_WHATSAPP_NUMBER;
}

export function getDisplayWhatsAppNumber(_settings?: any): string {
  return DISPLAY_WHATSAPP_NUMBER;
}

export interface WhatsAppAttachmentItem {
  url: string;
  filename: string;
  title?: string;
  sku?: string;
}

/**
 * Creates a WhatsApp click-to-chat URL with properly encoded message text directly for the artist
 */
export function createWhatsAppUrl(message: string, phone?: string): string {
  const target = (phone && phone.trim()) ? phone : getActiveWhatsAppNumber();
  const cleanNumber = target.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Collects ALL image attachments for a product (primary + gallery photos)
 */
export function collectAttachmentsForProduct(product: Product): WhatsAppAttachmentItem[] {
  if (!product) return [];
  const items: WhatsAppAttachmentItem[] = [];
  const rawProd = product as any;
  const images = Array.isArray(product?.images) && product.images.length > 0 ? product.images : [];

  images.forEach((img, idx) => {
    const path = (img?.storage_path || (img as any)?.url || '').trim();
    if (path) {
      items.push({
        url: path,
        filename: `${product.sku}_${idx + 1}.jpg`,
        title: `${product.name} (Image ${idx + 1})`,
        sku: product.sku,
      });
    }
  });

  if (items.length === 0) {
    const directPath = (rawProd.image_url || rawProd.image_path || rawProd.primary_image || '').trim();
    if (directPath) {
      items.push({
        url: directPath,
        filename: `${product.sku}.jpg`,
        title: product.name,
        sku: product.sku,
      });
    }
  }

  if (items.length === 0 && product.sku) {
    const cleanSku = product.sku.trim().toUpperCase();
    const EXACT_SKU_FILE_MAP: Record<string, string> = {
      'DA-LP-24X48-0001': 'DA-LP-24x48-0001.jpg',
      'DA-LP-24x48-0001': 'DA-LP-24x48-0001.jpg',
      'DA-LP-SET-0001': 'DA-LP-Set-0001.jpg',
      'DA-LP-Set-0001': 'DA-LP-Set-0001.jpg',
      'DA-LP-SET-0002': 'DA-LP-Set-0002.jpg',
      'DA-LP-Set-0002': 'DA-LP-Set-0002.jpg',
      'DA-LP-SET-0003': 'DA-LP-Set-0003.jpg',
      'DA-LP-Set-0003': 'DA-LP-Set-0003.jpg',
      'DA-MD-SET-0001': 'DA-MD-Set-0001.jpg',
      'DA-MD-Set-0001': 'DA-MD-Set-0001.jpg',
      'DA-MD-SET-7CHAKRA': 'DA-MD-Set-7Chakra.jpg',
      'DA-MD-Set-7Chakra': 'DA-MD-Set-7Chakra.jpg',
    };
    const mapped = EXACT_SKU_FILE_MAP[cleanSku] || `${cleanSku}.jpg`;
    items.push({
      url: `/static/assets/images/${mapped}`,
      filename: `${product.sku}.jpg`,
      title: product.name,
      sku: product.sku,
    });
  }

  return items;
}

/**
 * Collects ALL image attachments for all products in a cart
 */
export function collectAttachmentsForCart(cartItems: CartItem[]): WhatsAppAttachmentItem[] {
  if (!cartItems || cartItems.length === 0) return [];
  const items: WhatsAppAttachmentItem[] = [];
  cartItems.forEach((ci) => {
    if (!ci.product) return;
    const prodAtts = collectAttachmentsForProduct(ci.product);
    items.push(...prodAtts);
  });
  return items;
}

/**
 * Helper to fetch and convert any image URL into a high-quality JPG Blob
 */
export async function fetchImageAsJpgBlob(imageUrl: string): Promise<Blob> {
  let primaryUrl = imageUrl;
  if (imageUrl.startsWith('/uploads/local-') || imageUrl.startsWith('data:')) {
    const cached = await getLocalArtworkImage(imageUrl);
    if (cached) primaryUrl = cached;
  }

  if (
    typeof window !== 'undefined' &&
    primaryUrl &&
    !primaryUrl.startsWith('http') &&
    !primaryUrl.startsWith('data:') &&
    !primaryUrl.startsWith('blob:')
  ) {
    if (!primaryUrl.startsWith('/')) primaryUrl = '/' + primaryUrl;
    primaryUrl = window.location.origin + primaryUrl;
  }

  const candidates: string[] = [primaryUrl];
  const skuMatch = imageUrl.match(/(DA-[A-Z0-9-]+)/i);
  if (skuMatch && skuMatch[1] && typeof window !== 'undefined') {
    const cleanSku = skuMatch[1].toUpperCase();
    const candidatePath = `${window.location.origin}/static/assets/images/${cleanSku}.jpg`;
    if (!candidates.includes(candidatePath)) candidates.push(candidatePath);
  }

  let lastErr: any = null;
  for (const candUrl of candidates) {
    try {
      return await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        if (candUrl.startsWith('http') && typeof window !== 'undefined' && !candUrl.startsWith(window.location.origin)) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 800;
            canvas.height = img.naturalHeight || img.height || 800;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(
                (blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error('Canvas toBlob failed'));
                },
                'image/jpeg',
                0.92
              );
            } else {
              reject(new Error('Canvas context unavailable'));
            }
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = () => {
          fetch(candUrl)
            .then((res) => res.blob())
            .then((blob) => resolve(blob))
            .catch((err) => reject(err));
        };

        img.src = candUrl;
      });
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('Failed to fetch image as JPG blob');
}

/**
 * Downloads ALL artwork images in the order as downloadable .jpg files to user's device
 */
export async function downloadAllAttachments(attachments: WhatsAppAttachmentItem[]): Promise<void> {
  if (!attachments || attachments.length === 0) return;

  for (let idx = 0; idx < attachments.length; idx++) {
    const att = attachments[idx];
    if (!att.url) continue;

    const rawFilename = att.filename || `artwork_${idx + 1}`;
    const baseName = rawFilename.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
    const finalJpgFilename = `${baseName}.jpg`;

    try {
      const jpgBlob = await fetchImageAsJpgBlob(att.url);
      const blobUrl = URL.createObjectURL(jpgBlob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = finalJpgFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);
    } catch (e) {
      console.warn('Fallback direct download for attachment:', att.url, e);
      try {
        const a = document.createElement('a');
        a.href = att.url;
        a.download = finalJpgFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Failed to trigger download:', att.url, err);
      }
    }

    if (idx < attachments.length - 1) {
      await new Promise((res) => setTimeout(res, 220));
    }
  }
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
 * Helper to fetch and convert an image URL into a lightweight, fast PNG Blob suitable for ClipboardItem
 * Scales images down to maxDimension (default 800px) so large 16MB photos become ~150KB - 300KB
 */
export async function fetchImageAsPngBlob(imageUrl: string, maxDimension: number = 800): Promise<Blob> {
  if (!imageUrl) throw new Error('Image URL is required');

  let primaryUrl = imageUrl;
  if (imageUrl.startsWith('/uploads/local-') || imageUrl.startsWith('data:')) {
    const cached = await getLocalArtworkImage(imageUrl);
    if (cached) primaryUrl = cached;
  }

  if (
    typeof window !== 'undefined' &&
    primaryUrl &&
    !primaryUrl.startsWith('http') &&
    !primaryUrl.startsWith('data:') &&
    !primaryUrl.startsWith('blob:')
  ) {
    if (!primaryUrl.startsWith('/')) primaryUrl = '/' + primaryUrl;
    primaryUrl = window.location.origin + primaryUrl;
  }

  const candidates: string[] = [primaryUrl];
  const skuMatch = imageUrl.match(/(DA-[A-Z0-9-]+)/i);
  if (skuMatch && skuMatch[1] && typeof window !== 'undefined') {
    const cleanSku = skuMatch[1].toUpperCase();
    const candidatePath = `${window.location.origin}/static/assets/images/${cleanSku}.jpg`;
    if (!candidates.includes(candidatePath)) candidates.push(candidatePath);
  }

  let lastErr: any = null;
  for (const candUrl of candidates) {
    try {
      return await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        if (candUrl.startsWith('http') && typeof window !== 'undefined' && !candUrl.startsWith(window.location.origin)) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          try {
            const origWidth = img.naturalWidth || img.width || 800;
            const origHeight = img.naturalHeight || img.height || 800;

            let targetWidth = origWidth;
            let targetHeight = origHeight;

            if (origWidth > maxDimension || origHeight > maxDimension) {
              if (origWidth >= origHeight) {
                targetWidth = maxDimension;
                targetHeight = Math.round((origHeight * maxDimension) / origWidth);
              } else {
                targetHeight = maxDimension;
                targetWidth = Math.round((origWidth * maxDimension) / origHeight);
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, targetWidth, targetHeight);
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

              canvas.toBlob(
                (blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error('Canvas toBlob returned null'));
                },
                'image/png'
              );
            } else {
              reject(new Error('Canvas context unavailable'));
            }
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error(`Failed to load image at ${candUrl}`));
        img.src = candUrl;
      });
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('Failed to load image for PNG blob creation');
}

/**
 * Copies a single image directly to the system clipboard
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    const pngBlob = await fetchImageAsPngBlob(imageUrl);
    if (navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write single image warning:', err);
  }
  return false;
}

/**
 * Copies multiple images directly to the system clipboard
 */
export async function copyMultipleImagesToClipboard(imageUrls: string[]): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  const validUrls = imageUrls.filter((url) => url && typeof url === 'string');
  if (validUrls.length === 0) return false;

  try {
    const items: ClipboardItem[] = await Promise.all(
      validUrls.map(async (url) => {
        const pngBlob = await fetchImageAsPngBlob(url);
        return new ClipboardItem({ 'image/png': pngBlob });
      })
    );

    if (navigator.clipboard.write) {
      await navigator.clipboard.write(items);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write multiple images warning:', err);
    if (validUrls.length > 0) {
      return copyImageToClipboard(validUrls[0]);
    }
  }
  return false;
}

/**
 * Copies ALL artwork images for the order to system clipboard
 */
export async function copyAllImagesToClipboard(attachments: WhatsAppAttachmentItem[]): Promise<boolean> {
  if (!attachments || attachments.length === 0) return false;
  const urls = attachments.map((att) => att.url).filter(Boolean);
  return copyMultipleImagesToClipboard(urls);
}

/**
 * Packs all artwork images in the order into a ZIP archive (.zip) and triggers auto download
 */
export async function downloadOrderAsZip(
  attachments: WhatsAppAttachmentItem[],
  zipFilename: string = 'DotAndArt_Order_Artworks.zip'
): Promise<boolean> {
  if (!attachments || attachments.length === 0) return false;

  try {
    const zip = new JSZip();
    const folder = zip.folder('DotAndArt_Order_Photos') || zip;

    for (let idx = 0; idx < attachments.length; idx++) {
      const att = attachments[idx];
      if (!att.url) continue;

      const rawFilename = att.filename || `artwork_${idx + 1}`;
      const baseName = rawFilename.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
      const finalJpgFilename = `${baseName}.jpg`;

      try {
        const jpgBlob = await fetchImageAsJpgBlob(att.url);
        folder.file(finalJpgFilename, jpgBlob);
      } catch (e) {
        console.warn('Could not add image to zip:', att.url, e);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const blobUrl = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);

    return true;
  } catch (err) {
    console.error('Failed to create ZIP file:', err);
    return false;
  }
}

/**
 * Downloads a single artwork image directly as a high-definition .jpg file.
 * Perfect for users who wish to download individual items from the catalog.
 */
export async function downloadArtworkImage(
  imageUrl: string,
  filename?: string
): Promise<boolean> {
  if (!imageUrl) return false;
  const rawFilename = filename || 'dotandart_artwork.jpg';
  const baseName = rawFilename.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, '');
  const finalJpgFilename = `${baseName}.jpg`;

  try {
    const jpgBlob = await fetchImageAsJpgBlob(imageUrl);
    const blobUrl = URL.createObjectURL(jpgBlob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = finalJpgFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);

    return true;
  } catch (e) {
    console.warn('Fallback direct download for image:', imageUrl, e);
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = finalJpgFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch (err) {
      console.error('Failed to download artwork image:', imageUrl, err);
      return false;
    }
  }
}

/**
 * Instantly dispatches order directly to +91 86521 62647 on WhatsApp as a clean text message.
 */
export function dispatchDirectWhatsAppOrder(
  messageText: string,
  attachments: WhatsAppAttachmentItem[] = []
): void {
  if (attachments.length === 1 && attachments[0].url) {
    copyImageToClipboard(attachments[0].url).catch(() => {});
  }
  const url = createWhatsAppUrl(messageText);
  openExternalLink(url);
}

/**
 * Formats a single product enquiry message for WhatsApp.
 * Clean message text without pasting image URLs into the text string (Item 5).
 */
export function formatSingleProductEnquiry(
  product: Product,
  selectedSize?: string,
  price?: number,
  customizationNotes?: string
): string {
  const sizeToDisplay = selectedSize || product.base_size || 'Standard';
  const priceToDisplay = price !== undefined ? price : product.base_price;

  let msg = `Hello Dot And Art,

I would like to enquire about the following artwork:

Product: ${product.name}
Code: ${product.sku}
Size: ${sizeToDisplay}
Displayed price: ₹${priceToDisplay.toLocaleString('en-IN')}`;

  if (customizationNotes && customizationNotes.trim()) {
    msg += `\nCustomization requirements: ${customizationNotes.trim()}`;
  }

  msg += `\n\nPlease confirm availability, final pricing, delivery charges, and estimated dispatch time. Thank you!`;
  return msg;
}

/**
 * Formats multi-product / bulk enquiry list message with product codes and photo URLs.
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
  let msg = `Hello Dot And Art,\n\nI would like to enquire about the following artwork order:\n\n`;

  items.forEach((item, index) => {
    const primaryImg = item?.product?.images?.find((i) => i.is_primary) || item?.product?.images?.[0];
    let photoUrl = '';
    if (primaryImg?.storage_path) {
      if (primaryImg.storage_path.startsWith('http')) {
        photoUrl = primaryImg.storage_path;
      } else if (typeof window !== 'undefined') {
        const p = primaryImg.storage_path.startsWith('/') ? primaryImg.storage_path : `/${primaryImg.storage_path}`;
        photoUrl = `${window.location.origin}${p}`;
      }
    }

    msg += `${index + 1}. Product: ${item.product.name}\n`;
    msg += `   Code: ${item.product.sku}\n`;
    msg += `   Size: ${item.size}\n`;
    msg += `   Quantity: ${item.quantity}\n`;
    msg += `   Price: ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
    if (photoUrl) {
      msg += `   Photo Link: ${photoUrl}\n`;
    }

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

  msg += `\nPlease confirm availability, final pricing, delivery charges, and estimated dispatch time. Thank you!`;

  return msg;
}

/**
 * Formats dedicated custom mandala commission enquiry.
 * For single reference artwork (includeUrls=false), keeps message text clean without image URLs.
 * For multiple reference artworks (includeUrls=true), inserts image URLs and names.
 */
export function formatCustomMandalaEnquiry(
  data: CustomMandalaInquiry,
  includeUrls: boolean = false,
  attachments: WhatsAppAttachmentItem[] = []
): string {
  let msg = `Hello Dot And Art,

I would like to request a custom handmade mandala commission:

Customer name: ${data.customer_name}
Customer WhatsApp: ${data.whatsapp_number}`;

  if (data.email) {
    msg += `\nEmail: ${data.email}`;
  }

  msg += `\nDelivery location: ${data.delivery_address}`;

  if (data.reference_product_code && data.reference_product_code.trim()) {
    const code = data.reference_product_code.trim().toUpperCase();
    msg += `\nReference Product Code: ${code}`;
    if (includeUrls) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const refUrl = `${origin}/static/assets/images/${code}.jpg`;
      msg += `\nReference Image Link: ${refUrl}`;
    }
  }

  if (includeUrls && attachments && attachments.length > 0) {
    attachments.forEach((att, idx) => {
      if (att.url) {
        msg += `\nReference Photo ${idx + 1} (${att.title || 'Image'}): ${att.url}`;
      }
    });
  }

  msg += `\nDesired size: ${data.desired_size}`;
  if (data.preferred_color_scheme && data.preferred_color_scheme.trim()) {
    msg += `\nPreferred color scheme: ${data.preferred_color_scheme.trim()}`;
  }

  if (data.central_photo_requirement && data.central_photo_requirement.trim()) {
    msg += `\nCentral photo/deity requirement: ${data.central_photo_requirement.trim()}`;
  }

  if (data.specific_pattern_requirements && data.specific_pattern_requirements.trim()) {
    msg += `\nSpecific pattern requirements: ${data.specific_pattern_requirements.trim()}`;
  }

  if (data.additional_instructions && data.additional_instructions.trim()) {
    msg += `\nAdditional instructions: ${data.additional_instructions.trim()}`;
  }

  msg += `\n\nPlease share design details, estimated timeline, and advance payment instructions. Thank you!`;

  return msg;
}
