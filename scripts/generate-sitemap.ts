import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '../src/data/initialCatalog.js';

const baseUrl = 'https://www.dotandart.in';
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  '',
  '/shop',
  '/custom-order',
  '/about',
  '/gallery',
  '/testimonials',
  '/faq',
  '/contact',
  '/legal'
];

async function generateSitemap() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const uniqueSkus = new Set<string>();

  if (Array.isArray(INITIAL_PRODUCTS)) {
    INITIAL_PRODUCTS.forEach((p) => {
      if (p && p.sku && p.is_published !== false) {
        const cleanSku = String(p.sku).trim();
        if (!cleanSku.includes('AP-10') && !cleanSku.includes('COPY')) {
          uniqueSkus.add(cleanSku);
        }
      }
    });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticPages.forEach((p) => {
    const priority = p === '' ? '1.0' : p === '/shop' || p === '/gallery' ? '0.9' : '0.8';
    const freq = p === '' || p === '/shop' ? 'daily' : 'weekly';
    xml += `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  });

  Array.from(uniqueSkus).forEach((sku) => {
    xml += `  <url>\n    <loc>${baseUrl}/product/${encodeURIComponent(sku)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });

  xml += `</urlset>\n`;

  const targetPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(targetPath, xml, 'utf8');
  console.log(`[Sitemap] Generated sitemap.xml with ${staticPages.length + uniqueSkus.size} URLs at ${targetPath}`);
}

generateSitemap().catch((err) => {
  console.error('[Sitemap] Failed to generate sitemap:', err);
});
