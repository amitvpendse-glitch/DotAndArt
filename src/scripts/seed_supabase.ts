import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Supabase Seeding Script
 * 
 * Usage:
 * 1. Set environment variables in .env:
 *    SUPABASE_URL=https://your-supabase-project.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
 * 
 * 2. Run script:
 *    npx tsx src/scripts/seed_supabase.ts
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSupabase() {
  console.log('🚀 Starting Supabase catalog seeding...');

  let productsToSeed: any[] = [];

  // 1. Try reading from db.json first (Server Storage)
  const dbPath = path.resolve(process.cwd(), 'db.json');
  if (fs.existsSync(dbPath)) {
    try {
      const rawDb = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(rawDb);
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        console.log(`📄 Found ${parsed.products.length} products in local db.json server storage.`);
        productsToSeed = parsed.products;
      }
    } catch (err) {
      console.warn('⚠️ Could not parse db.json:', err);
    }
  }

  if (productsToSeed.length === 0) {
    console.error('❌ No products found to seed.');
    process.exit(1);
  }

  // Sanitize & Format products for PostgreSQL / Supabase
  const formattedProducts = productsToSeed.map((p) => {
    const sku = (p.sku || '').trim().toUpperCase();
    return {
      id: p.id || `prod-${sku.toLowerCase()}`,
      sku,
      name: (p.name || 'Handcrafted Artwork').trim(),
      short_description: p.short_description || '',
      description: p.description || '',
      category_id: p.category_id || 'cat-mandala',
      category_name: p.category_name || 'Mandala Wall Hangings',
      category_slug: p.category_slug || 'mandala-wall-hangings',
      material: p.material || 'MDF Wood, Acrylics',
      framing: p.framing || 'Ready to hang',
      customizable: p.customizable !== false,
      creation_time: p.creation_time || '5–7 working days',
      shipping_info: p.shipping_info || 'Worldwide shipping available',
      special_information: p.special_information || 'Wipe with dry microfiber cloth.',
      featured: Boolean(p.featured),
      is_published: p.is_published !== false,
      is_available: p.is_available !== false,
      available_badge_text: p.available_badge_text || 'Available',
      unavailable_badge_text: p.unavailable_badge_text || 'Made to Order',
      show_available_badge: p.show_available_badge !== false,
      is_high_demand: Boolean(p.is_high_demand),
      extra_delivery_days: Number(p.extra_delivery_days) || 0,
      high_demand_message: p.high_demand_message || '',
      base_price: Number(p.base_price) || 0,
      base_size: p.base_size || '12 inches diameter',
      images: Array.isArray(p.images) ? p.images : [],
      variants: Array.isArray(p.variants) ? p.variants : [],
      created_at: p.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  console.log(`📤 Uploading ${formattedProducts.length} items to Supabase "products" table...`);

  const { data, error } = await supabase
    .from('products')
    .upsert(formattedProducts, { onConflict: 'sku' });

  if (error) {
    console.error('❌ Supabase insert error:', error.message);
  } else {
    console.log(`🎉 SUCCESS! Successfully seeded ${formattedProducts.length} artworks into Supabase!`);
  }
}

seedSupabase().catch((err) => {
  console.error('❌ Unhandled seeding error:', err);
});
