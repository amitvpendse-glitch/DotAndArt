import fs from 'fs';
import path from 'path';

export const USER_REQUESTED_SKUS: string[] = [
  'DA-MD-10-0001',
  'DA-MD-10-0004',
  'DA-MD-10-0005',
  'DA-MD-10-0006',
  'DA-MD-10-0007',
  'DA-MD-10-0008',
  'DA-MD-10-0009',
  'DA-MD-10-0010',
  'DA-MD-10-0011',
  'DA-MD-10-0012',
  'DA-MD-10-0013',
  'DA-MD-10-0014',
  'DA-MD-10-0015',
  'DA-MD-10-0016',
  'DA-MD-10-0017',
  'DA-MD-10-0018',
  'DA-MD-10-0019',
  'DA-MD-12-0001',
  'DA-MD-12-0002',
  'DA-MD-12-0003',
  'DA-MD-12-0004',
  'DA-MD-12-0005',
  'DA-MD-12-0006',
  'DA-MD-12-0007',
  'DA-MD-12-0008',
  'DA-MD-12-0009',
  'DA-MD-12-0011',
  'DA-MD-12-0012',
  'DA-MD-12-0015',
  'DA-MD-12-0016',
  'DA-MD-12-0017',
  'DA-MD-12-0018',
  'DA-MD-12-0019',
  'DA-MD-12-0020',
  'DA-MD-12-0021',
  'DA-MD-12-0022',
  'DA-MD-12-0023',
  'DA-MD-12-0024',
  'DA-MD-12-0025',
  'DA-MD-12-0026',
  'DA-MD-12-0027',
  'DA-MD-12-0028',
  'DA-MD-12-0029',
  'DA-MD-12-0030',
  'DA-MD-12-0031',
  'DA-MD-12-0032',
  'DA-MD-12-0033',
  'DA-MD-12-0034',
  'DA-MD-12-0035',
  'DA-MD-12-0036',
  'DA-MD-12-0037',
  'DA-MD-12-0038',
  'DA-MD-12-0039',
  'DA-MD-12-0040',
  'DA-MD-12-0041',
  'DA-MD-12-0042',
  'DA-MD-12-0043',
  'DA-MD-12-0044',
  'DA-MD-12-0045',
  'DA-MD-12-0046',
  'DA-MD-12-0047',
  'DA-MD-12-0048',
  'DA-MD-12-0049',
  'DA-MD-12-0050',
  'DA-MD-12-0051',
  'DA-MD-12-0052',
  'DA-MD-12-0053',
  'DA-MD-12-0054',
  'DA-MD-12-0055',
  'DA-MD-12-0056',
  'DA-MD-15-0001',
  'DA-MD-15-0002',
  'DA-MD-15-0003',
  'DA-MD-15-0004',
  'DA-MD-15-0005',
  'DA-MD-15-0006',
  'DA-MD-15-0008',
  'DA-MD-15-0009',
  'DA-MD-15-0010',
  'DA-MD-15-0011',
  'DA-MD-15-0012',
  'DA-MD-15-0013',
  'DA-MD-15-0014',
  'DA-MD-15-0015',
  'DA-MD-15-0016',
  'DA-MD-15-0017',
  'DA-MD-15-0018',
  'DA-MD-15-0019',
  'DA-MD-15-0020',
  'DA-MD-15-0021',
  'DA-MD-15-0022',
  'DA-MD-15-0023',
  'DA-MD-15-0024',
  'DA-MD-15-0025',
  'DA-MD-15-0026',
  'DA-MD-15-0027',
  'DA-MD-15-0028',
  'DA-MD-15-0029',
  'DA-MD-15-0030',
  'DA-MD-15-0031',
  'DA-MD-15-0032',
  'DA-MD-15-0033',
  'DA-MD-15-0034',
  'DA-MD-15-0035',
  'DA-MD-15-0036',
  'DA-MD-15-0037',
  'DA-MD-15-0038',
  'DA-MD-15-0039',
  'DA-MD-15-0040',
  'DA-MD-15-0041',
  'DA-MD-15-0042',
  'DA-MD-15-0043',
  'DA-MD-15-0044',
  'DA-MD-15-0045',
  'DA-MD-15-0046',
  'DA-MD-15-0047',
  'DA-MD-15-0048',
  'DA-MD-15-0049',
  'DA-MD-15-0050',
  'DA-MD-15-0051',
  'DA-MD-15-0052',
  'DA-MD-18-0002',
  'DA-MD-18-0003',
  'DA-MD-18-0004',
  'DA-MD-18-0005',
  'DA-MD-18-0006',
  'DA-MD-18-0007',
  'DA-MD-18-0008',
  'DA-MD-18-0009',
  'DA-MD-18-0010',
  'DA-MD-18-0011',
  'DA-MD-18-0012',
  'DA-MD-18-0013',
  'DA-MD-18-0014',
  'DA-MD-18-0015',
  'DA-MD-18-0016',
  'DA-MD-18-0017',
  'DA-MD-18-0018',
  'DA-MD-18-0019',
  'DA-MD-18-0020',
  'DA-MD-18-0021',
  'DA-MD-18-0022',
  'DA-MD-18-0023',
  'DA-MD-18-0024',
  'DA-MD-18-0025',
  'DA-MD-18-0026',
  'DA-MD-18-0027',
  'DA-MD-18-0028',
  'DA-MD-18-0029',
  'DA-MD-18-0030',
  'DA-MD-18-0031',
  'DA-MD-18-0032',
  'DA-MD-24-0001',
  'DA-MD-24-0002',
  'DA-MD-24-0003',
  'DA-MD-24-0004',
  'DA-MD-24-0005',
  'DA-MD-24-0006',
  'DA-MD-24-0007',
  'DA-MD-30-0001',
  'DA-MD-Set-0001',
  'DA-MD-Set-7Chakra',
  'DA-LP-10-0001',
  'DA-LP-14-0001',
  'DA-LP-18-0001',
  'DA-LP-18-0002',
  'DA-LP-18-0003',
  'DA-LP-18-0004',
  'DA-LP-18-0005',
  'DA-LP-24x48-0001',
  'DA-LP-36-0001',
  'DA-LP-Set-0001',
  'DA-LP-Set-0002',
  'DA-LP-Set-0003',
];

function executeMapping() {
  const imagesDir = path.join(process.cwd(), 'public', 'static', 'assets', 'images');
  const imageFiles = fs.readdirSync(imagesDir);
  const fileMap = new Map<string, string>();
  imageFiles.forEach((f) => {
    const base = f.replace(/\.[^.]+$/, '').toUpperCase();
    fileMap.set(base, f);
  });

  const dbPath = path.join(process.cwd(), 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const existingMap = new Map<string, any>();
  (db.products || []).forEach((p: any) => {
    existingMap.set((p.sku || '').toUpperCase(), p);
  });

  const getMeta = (sku: string) => {
    const isLippan = sku.startsWith('DA-LP');
    let size = '12 Inches';
    let price = 950;
    let name = isLippan ? 'Lippan Wall Hanging' : 'Mandala Wall Hanging';

    if (sku.includes('Set-7Chakra')) {
      size = 'Set of 7 (8-10 Inches)';
      price = 4500;
      name = '7 Chakra Mandala Wall Art Set';
    } else if (sku.includes('Set-')) {
      size = 'Set';
      price = isLippan ? 4500 : 3500;
      name = isLippan ? 'Lippan Art Wall Hanging Set' : 'Mandala Wall Hanging Set';
    } else if (sku.includes('-10-')) {
      size = '10 Inches';
      price = isLippan ? 1200 : 650;
    } else if (sku.includes('-12-')) {
      size = '12 Inches';
      price = 950;
    } else if (sku.includes('-14-')) {
      size = '14 Inches';
      price = 2400;
    } else if (sku.includes('-15-')) {
      size = '15 Inches';
      price = 1700;
    } else if (sku.includes('-18-')) {
      size = '18 Inches';
      price = isLippan ? 3600 : 2800;
    } else if (sku.includes('-24-')) {
      size = '24 Inches';
      price = 5500;
    } else if (sku.includes('-30-')) {
      size = '30 Inches';
      price = 8500;
    } else if (sku.includes('-36-')) {
      size = '36 Inches';
      price = 7500;
    } else if (sku.includes('-24x48-')) {
      size = '24x48 Inches';
      price = 9500;
    }

    const category_id = isLippan ? 'cat-lippan' : 'cat-mandala';
    const category_name = isLippan ? 'Lippan Wall Hangings' : 'Mandala Wall Hangings';
    const category_slug = isLippan ? 'lippan-wall-hangings' : 'mandala-wall-hangings';
    const material = isLippan
      ? 'Moisture-resistant MDF board, High-grade clay paste, Mirrors, Protective Sealant'
      : 'Moisture-resistant MDF board, Acrylic Paints, Mirrors, Spray Varnish, Hanging Hook and Stabilizer';

    return { isLippan, size, price, name, category_id, category_name, category_slug, material };
  };

  const finalProducts = USER_REQUESTED_SKUS.map((sku, index) => {
    const existing = existingMap.get(sku.toUpperCase());
    const meta = getMeta(sku);
    const matchedFile = fileMap.get(sku.toUpperCase());
    const imgPath = matchedFile
      ? `/static/assets/images/${matchedFile}`
      : `/static/assets/images/${sku}.jpg`;

    const id = existing?.id || `prod-${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const images = [
      {
        id: `img-${id}-1`,
        product_id: id,
        storage_path: imgPath,
        alt_text: `${existing?.name || meta.name} (${sku})`,
        caption: existing?.name || meta.name,
        display_order: 1,
        is_primary: true,
      },
    ];

    if (existing) {
      return {
        ...existing,
        images,
        is_published: true,
        is_available: true,
        base_size: existing.base_size || meta.size,
        base_price: existing.base_price || meta.price,
      };
    }

    return {
      id,
      sku,
      name: meta.name,
      short_description: meta.isLippan
        ? 'Authentic handcrafted mud and mirror Lippan artwork'
        : 'Circular hand-painted dot mandala',
      description: meta.isLippan
        ? 'Authentic Kutch mud and mirror Lippan artwork handcrafted with traditional motifs and high-clarity mirrors.'
        : 'Circular hand-painted dot mandala crafted with artist acrylics on moisture-resistant MDF board.',
      category_id: meta.category_id,
      category_name: meta.category_name,
      category_slug: meta.category_slug,
      material: meta.material,
      framing: 'Ready to hang',
      customizable: true,
      creation_time: '1-3 Days',
      shipping_info: 'Worldwide insured shipping available',
      special_information: 'Clean gently with a soft dry microfiber cloth.',
      featured: index < 8,
      is_published: true,
      is_available: true,
      base_price: meta.price,
      base_size: meta.size,
      images,
      variants: [],
      created_at: new Date('2026-10-20T10:06:11.947Z').toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  db.products = finalProducts;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`[Mapping] Successfully mapped ${finalProducts.length} products into db.json`);

  // Also sync initialCatalog.ts
  const catalogPath = path.join(process.cwd(), 'src', 'data', 'initialCatalog.ts');
  let content = 'export const INITIAL_PRODUCTS: any[] = ' + JSON.stringify(finalProducts, null, 2) + ';\n\n';
  content += 'export const INITIAL_CATEGORIES: any[] = ' + JSON.stringify(db.categories || [], null, 2) + ';\n\n';
  content += 'export const INITIAL_TESTIMONIALS: any[] = ' + JSON.stringify(db.testimonials || [], null, 2) + ';\n\n';
  content += 'export const INITIAL_FAQS: any[] = ' + JSON.stringify(db.faqs || [], null, 2) + ';\n\n';
  content += 'export const INITIAL_SETTINGS: any = ' + JSON.stringify(db.settings || {}, null, 2) + ';\n\n';
  content += 'export const INITIAL_PAGES: any = ' + JSON.stringify(db.pages || {}, null, 2) + ';\n';
  fs.writeFileSync(catalogPath, content);
  console.log(`[Mapping] Successfully synced ${finalProducts.length} products to initialCatalog.ts`);
}

executeMapping();
