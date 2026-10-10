import { CartItem, CustomMandalaInquiry, Product } from '../types';

export const BUSINESS_WHATSAPP_NUMBER = '918652162647';
export const DISPLAY_WHATSAPP_NUMBER = '+91 86521 62647';

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
 * Formats a single product enquiry message
 */
export function formatSingleProductEnquiry(
  product: Product,
  selectedSize?: string,
  price?: number,
  customizationNotes?: string
): string {
  const sizeToDisplay = selectedSize || product.base_size || 'Standard';
  const priceToDisplay = price !== undefined ? price : product.base_price;

  let msg = `Hello Dot & Art,

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
 * Formats multi-product enquiry list message according to Section 7 of the user prompt:
 *
 * Hello Dot & Art,
 *
 * I would like to enquire about the following artwork:
 *
 * 1. Product: [Product Name]
 *    Code: [Product Code]
 *    Size: [Selected Size]
 *    Quantity: [Quantity]
 *    Displayed price: ₹[Price]
 *
 * Customization: [Customer requirements]
 * Customer name: [Name]
 * Customer WhatsApp: [Number]
 * Delivery location: [Address]
 * Additional message: [Message]
 *
 * Please confirm availability, final pricing, delivery charges, and estimated dispatch time.
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
  let msg = `Hello Dot & Art,\n\nI would like to enquire about the following artwork:\n\n`;

  items.forEach((item, index) => {
    msg += `${index + 1}. Product: ${item.product.name}\n`;
    msg += `   Code: ${item.product.sku}\n`;
    msg += `   Size: ${item.size}\n`;
    msg += `   Quantity: ${item.quantity}\n`;
    msg += `   Displayed price: ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
    if (item.customization_notes && item.customization_notes.trim()) {
      msg += `   Item Note: ${item.customization_notes.trim()}\n`;
    }
    msg += `\n`;
  });

  if (customer.generalCustomization && customer.generalCustomization.trim()) {
    msg += `Customization: ${customer.generalCustomization.trim()}\n`;
  } else {
    // Collect all individual notes if present
    const combinedNotes = items
      .filter((i) => i.customization_notes)
      .map((i) => `${i.product.sku}: ${i.customization_notes}`)
      .join('; ');
    msg += `Customization: ${combinedNotes || 'Standard catalog specifications'}\n`;
  }

  msg += `Customer name: ${customer.name}\n`;
  msg += `Customer WhatsApp: ${customer.whatsapp}\n`;
  msg += `Delivery location: ${customer.deliveryLocation}\n`;

  if (customer.additionalMessage && customer.additionalMessage.trim()) {
    msg += `Additional message: ${customer.additionalMessage.trim()}\n`;
  }

  msg += `\nPlease confirm availability, final pricing, delivery charges, and estimated dispatch time.`;

  return msg;
}

/**
 * Formats dedicated custom mandala commission enquiry
 */
export function formatCustomMandalaEnquiry(data: CustomMandalaInquiry): string {
  let msg = `Hello Dot & Art,

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
  msg += `\nPreferred color scheme: ${data.preferred_color_scheme}`;

  if (data.central_photo_requirement) {
    msg += `\nCentral photo/deity requirement & size: ${data.central_photo_requirement}`;
  }

  if (data.specific_pattern_requirements) {
    msg += `\nSpecific pattern requirements: ${data.specific_pattern_requirements}`;
  }

  if (data.additional_instructions) {
    msg += `\nAdditional instructions: ${data.additional_instructions}`;
  }

  msg += `\n\nPlease share design consultation details, estimated timeline, and advance payment instructions. Thank you!`;

  return msg;
}
