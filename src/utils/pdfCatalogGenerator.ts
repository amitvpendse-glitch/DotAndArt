import jsPDF from 'jspdf';
import { Product, WebsiteSettings } from '../types';

interface PDFProgressCallback {
  (current: number, total: number, itemName: string): void;
}

/**
 * Helper to convert an image URL or fallback path to a base64 JPEG data URL.
 */
function loadImageDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    let cleanUrl = url;
    if (cleanUrl.startsWith('/public/')) {
      cleanUrl = cleanUrl.replace('/public/', '/');
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Fill background white for JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = cleanUrl;
  });
}

/**
 * Generates a geometric mandala placeholder on jsPDF canvas if image is unavailable.
 */
function drawMandalaPlaceholder(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  sku: string,
  name: string
) {
  // Background box
  pdf.setFillColor(245, 240, 235);
  pdf.setDrawColor(212, 163, 115);
  pdf.setLineWidth(0.4);
  pdf.rect(x, y, w, h, 'FD');

  const cx = x + w / 2;
  const cy = y + h / 2 - 4;

  // Outer ring
  pdf.setDrawColor(200, 90, 50);
  pdf.setLineWidth(0.6);
  pdf.circle(cx, cy, 18);

  // Inner ring
  pdf.setDrawColor(212, 163, 115);
  pdf.circle(cx, cy, 12);
  pdf.circle(cx, cy, 6);

  // Dot points
  pdf.setFillColor(200, 90, 50);
  for (let angle = 0; angle < 360; angle += 45) {
    const rad = (angle * Math.PI) / 180;
    const px = cx + Math.cos(rad) * 12;
    const py = cy + Math.sin(rad) * 12;
    pdf.circle(px, py, 1, 'F');
  }

  // Text
  pdf.setTextColor(102, 87, 77);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('DOT & ART MANDALA', cx, cy + 24, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text(sku, cx, cy + 28, { align: 'center' });
}

export async function generateProfessionalCatalogPDF(
  products: Product[],
  settings: WebsiteSettings | null,
  onProgress?: PDFProgressCallback
): Promise<void> {
  if (!products || products.length === 0) {
    throw new Error('No products available for catalog generation.');
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const totalProducts = products.length;

  // Pre-load all images to memory with progress reporting
  const imageCache: Record<string, string | null> = {};
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (onProgress) {
      onProgress(i + 1, totalProducts, p.name);
    }

    const primaryImg =
      p.images?.find((img) => img.is_primary)?.storage_path ||
      p.images?.[0]?.storage_path ||
      `/static/assets/images/${p.sku}.jpg`;

    const loadedData = await loadImageDataUrl(primaryImg);
    imageCache[p.id] = loadedData;
  }

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  // Top Banner Dark Background
  pdf.setFillColor(30, 26, 23); // #1E1A17
  pdf.rect(0, 0, pageWidth, 120, 'F');

  // Decorative Accent Bar
  pdf.setFillColor(200, 90, 50); // #C85A32
  pdf.rect(0, 118, pageWidth, 4, 'F');

  // Gold Ring Accent
  pdf.setDrawColor(212, 163, 115);
  pdf.setLineWidth(1);
  pdf.circle(pageWidth / 2, 45, 22);
  pdf.circle(pageWidth / 2, 45, 16);
  pdf.setFillColor(212, 163, 115);
  pdf.circle(pageWidth / 2, 45, 2, 'F');

  // Title on Dark Banner
  pdf.setTextColor(250, 247, 242);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(28);
  pdf.text('DOT & ART', pageWidth / 2, 80, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(212, 163, 115);
  pdf.text('AUTHENTIC HANDCRAFTED DOT MANDALA & LIPPAN ARTWORKS', pageWidth / 2, 89, {
    align: 'center',
  });

  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text('Official Collection Catalog • Edition 2026', pageWidth / 2, 96, { align: 'center' });

  // Main Body Content on Cover Page
  let yPos = 140;

  pdf.setTextColor(44, 39, 36);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(18);
  pdf.text('Product Catalog & Pricing Directory', 20, yPos);

  pdf.setLineWidth(0.5);
  pdf.setDrawColor(200, 90, 50);
  pdf.line(20, yPos + 3, 190, yPos + 3);

  yPos += 14;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(102, 87, 77);

  const introText =
    'Welcome to the official collection catalog of Dot And Art. Each artwork showcased herein is meticulously crafted by hand, utilizing premium acrylic pigments on high-density MDF wood and traditional mirror relief clay work. All designs can be ordered directly or customized to bespoke dimensions, color themes, and space requirements.';

  const splitIntro = pdf.splitTextToSize(introText, 170);
  pdf.text(splitIntro, 20, yPos);
  yPos += splitIntro.length * 5 + 10;

  // Summary Metrics Box
  pdf.setFillColor(250, 247, 242);
  pdf.setDrawColor(212, 163, 115);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(20, yPos, 170, 42, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(200, 90, 50);
  pdf.text('CATALOG AT A GLANCE', 28, yPos + 10);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(44, 39, 36);
  pdf.text(`• Total Featured Artworks: ${products.length} Items`, 28, yPos + 18);
  pdf.text('• Primary Categories: Sacred Dot Mandalas & Lippan Kaam Relief Art', 28, yPos + 24);
  pdf.text('• Size Options: 6" Compact Plaques up to 48" Grand Wall Sculptures', 28, yPos + 30);
  pdf.text('• Currency: Indian Rupees (₹ INR) — Worldwide Express Shipping', 28, yPos + 36);

  yPos += 54;

  // Contact & Studio Details Box
  pdf.setFillColor(30, 26, 23);
  pdf.roundedRect(20, yPos, 170, 36, 3, 3, 'F');

  pdf.setTextColor(250, 247, 242);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('STUDIO INQUIRIES & CUSTOM COMMISSIONS', 28, yPos + 10);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(212, 163, 115);
  pdf.text(`Email: ${settings?.email || 'info@dotandart.com'}`, 28, yPos + 18);
  pdf.text(`Phone / WhatsApp: ${settings?.whatsapp_display || settings?.whatsapp_number || '+91 98765 43210'}`, 28, yPos + 24);
  pdf.text(`Location: ${settings?.studio_address || 'Pune, Maharashtra, India'}`, 28, yPos + 30);

  pdf.setTextColor(250, 247, 242);
  pdf.text('Website: www.dotandart.com', 120, yPos + 18);
  pdf.text('Insured Air Express Shipping', 120, yPos + 24);
  pdf.text('Custom Colorways Available', 120, yPos + 30);

  // Cover Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('© 2026 Dot And Art. All Rights Reserved.', pageWidth / 2, pageHeight - 12, {
    align: 'center',
  });

  // ==========================================
  // PAGE 2 ONWARDS: PRODUCT CARDS (2 ITEMS PER PAGE)
  // ==========================================
  const itemsPerPage = 2;
  const totalCatalogPages = Math.ceil(products.length / itemsPerPage);

  for (let pageIdx = 0; pageIdx < totalCatalogPages; pageIdx++) {
    pdf.addPage();

    const pageNum = pageIdx + 2;
    const pageStartItemIdx = pageIdx * itemsPerPage;
    const pageItems = products.slice(pageStartItemIdx, pageStartItemIdx + itemsPerPage);

    // Inner Header
    pdf.setFillColor(30, 26, 23);
    pdf.rect(0, 0, pageWidth, 16, 'F');

    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(250, 247, 242);
    pdf.text('DOT & ART', 15, 11);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(212, 163, 115);
    pdf.text('Authentic Handmade Mandala & Lippan Catalog', 50, 11);

    pdf.setTextColor(200, 200, 200);
    pdf.text(`Page ${pageNum} of ${totalCatalogPages + 1}`, pageWidth - 15, 11, { align: 'right' });

    pdf.setDrawColor(200, 90, 50);
    pdf.setLineWidth(0.6);
    pdf.line(0, 16, pageWidth, 16);

    // Render 2 items on this page
    pageItems.forEach((product, itemIndex) => {
      const cardY = 24 + itemIndex * 128; // height space ~122mm per card
      const cardHeight = 122;

      // Card Background
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(15, cardY, 180, cardHeight, 3, 3, 'FD');

      // Left Column: Artwork Image (55mm x 55mm)
      const imgX = 22;
      const imgY = cardY + 8;
      const imgSize = 55;

      const imgData = imageCache[product.id];
      if (imgData) {
        try {
          pdf.addImage(imgData, 'JPEG', imgX, imgY, imgSize, imgSize);
          pdf.setDrawColor(212, 163, 115);
          pdf.setLineWidth(0.4);
          pdf.rect(imgX, imgY, imgSize, imgSize, 'D');
        } catch {
          drawMandalaPlaceholder(pdf, imgX, imgY, imgSize, imgSize, product.sku, product.name);
        }
      } else {
        drawMandalaPlaceholder(pdf, imgX, imgY, imgSize, imgSize, product.sku, product.name);
      }

      // SKU Tag under Image
      pdf.setFillColor(30, 26, 23);
      pdf.roundedRect(imgX, imgY + imgSize + 4, imgSize, 8, 1.5, 1.5, 'F');
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(250, 247, 242);
      pdf.text(product.sku, imgX + imgSize / 2, imgY + imgSize + 9.5, { align: 'center' });

      // Customizability Pill
      if (product.customizable) {
        pdf.setFillColor(200, 90, 50);
        pdf.roundedRect(imgX, imgY + imgSize + 14, imgSize, 6, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(255, 255, 255);
        pdf.text('CUSTOMIZABLE DESIGN', imgX + imgSize / 2, imgY + imgSize + 18, {
          align: 'center',
        });
      }

      // Right Column: Artwork Details
      const textX = 84;
      let textY = cardY + 12;

      // Category Subtitle
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(200, 90, 50);
      pdf.text(
        (product.category_name || product.category_slug || 'MANDALA ARTWORK').toUpperCase(),
        textX,
        textY
      );

      textY += 6;

      // Product Title
      pdf.setFont('times', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(44, 39, 36);
      const splitTitle = pdf.splitTextToSize(product.name, 105);
      pdf.text(splitTitle, textX, textY);
      textY += splitTitle.length * 5 + 3;

      // Specifications Grid
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(102, 87, 77);

      pdf.text(`Description: `, textX, textY);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 39, 36);
      pdf.text(`${product.description || ''}`, textX + 18, textY);
      textY += 4.5;

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 87, 77);
      pdf.text(`Size: `, textX, textY);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 39, 36);
      pdf.text(`${product.base_size || ''}`, textX + 18, textY);
      textY += 4.5;

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 87, 77);
      pdf.text(`Material: `, textX, textY);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(44, 39, 36);
      const splitMat = pdf.splitTextToSize(product.material || '', 85);
      pdf.text(splitMat, textX + 18, textY);
      textY += splitMat.length * 3.8 + 1;

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 87, 77);
      pdf.text(`Customizable: `, textX, textY);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 139, 34);
      pdf.text(`Yes`, textX + 22, textY);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 87, 77);
      pdf.text(`Creation Time: `, textX + 50, textY);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 39, 36);
      pdf.text(`${product.creation_time || ''}`, textX + 72, textY);
      textY += 4.5;

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 87, 77);
      pdf.text(`Shipping: `, textX, textY);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 39, 36);
      pdf.text(`Bubble wrap & corrugated box (Worldwide)`, textX + 18, textY);

      // Price Banner Box
      pdf.setFillColor(250, 247, 242);
      pdf.setDrawColor(212, 163, 115);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(textX, cardY + cardHeight - 22, 105, 15, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(102, 87, 77);
      pdf.text('CATALOG PRICE:', textX + 5, cardY + cardHeight - 12);

      pdf.setFont('times', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(200, 90, 50);
      pdf.text(`₹${product.base_price.toLocaleString('en-IN')}`, textX + 38, cardY + cardHeight - 12);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Incl. Tax & Packaging', textX + 75, cardY + cardHeight - 12);
    });

    // Inner Page Footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      'Dot And Art Official Catalog • Order via WhatsApp or Website www.dotandart.com',
      15,
      pageHeight - 8
    );
    pdf.text(`Page ${pageNum}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
  }

  // Trigger browser file download
  pdf.save(`Dot_And_Art_Official_Product_Catalog_${new Date().toISOString().slice(0, 10)}.pdf`);
}
