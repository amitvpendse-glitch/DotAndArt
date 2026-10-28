import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to update the "images" JSONB column in Supabase for all products
 * 
 * Usage:
 * 1. Set environment variables in .env:
 *    SUPABASE_URL=https://your-supabase-project.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
 * 
 * 2. Run script:
 *    npx tsx src/scripts/update_supabase_images.ts
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateImages() {
  console.log('🖼️ Updating images JSONB column in Supabase...');

  // Read catalog data from db.json
  const dbPath = path.resolve(process.cwd(), 'db.json');
  let dbProducts: any[] = [];
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.products)) dbProducts = parsed.products;
    } catch {}
  }

  // Fetch all existing products from Supabase
  const { data: supabaseProducts, error: fetchErr } = await supabase.from('products').select('id, sku, name, images');
  if (fetchErr) {
    console.error('❌ Error fetching products from Supabase:', fetchErr.message);
    process.exit(1);
  }

  if (!supabaseProducts || supabaseProducts.length === 0) {
    console.error('❌ No products found in Supabase table.');
    process.exit(1);
  }

  console.log(`🔍 Found ${supabaseProducts.length} products in Supabase. Building image records...`);

  const dbMap = new Map<string, any>();
  dbProducts.forEach((p) => {
    if (p.sku) dbMap.set(p.sku.toUpperCase(), p);
  });

  let updatedCount = 0;

  for (const prod of supabaseProducts) {
    const cleanSku = (prod.sku || '').trim().toUpperCase();
    const dbMatch = dbMap.get(cleanSku);

    let imagesJson: any[] = [];
    if (dbMatch && Array.isArray(dbMatch.images) && dbMatch.images.length > 0) {
      imagesJson = dbMatch.images;
    } else {
      // Default to /static/assets/images/${cleanSku}.jpg
      imagesJson = [
        {
          id: `img-${prod.id || cleanSku}-1`,
          product_id: prod.id || cleanSku,
          storage_path: `/static/assets/images/${cleanSku}.jpg`,
          alt_text: `${prod.name || 'Handcrafted Artwork'} (${cleanSku})`,
          caption: prod.name || 'Handcrafted Artwork',
          display_order: 1,
          is_primary: true,
        },
      ];
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({ images: imagesJson })
      .eq('id', prod.id);

    if (updateErr) {
      console.warn(`⚠️ Failed to update images for SKU ${cleanSku}:`, updateErr.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`🎉 SUCCESS! Updated images JSONB for ${updatedCount} products in Supabase.`);
}

updateImages().catch((err) => {
  console.error('❌ Unhandled error:', err);
});
