import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Script to store ACTUAL IMAGES in Supabase
 * 
 * Mode 1: Upload physical files to Supabase Storage Bucket ('product-images') -> Store public CDN URL in products table
 * Mode 2: Convert physical files to Base64 Data URLs ('data:image/jpeg;base64,...') -> Store raw image data in products JSONB column
 * 
 * Usage:
 * 1. Set environment variables in .env:
 *    SUPABASE_URL=https://your-supabase-project.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
 * 
 * 2. Run script:
 *    npx tsx src/scripts/upload_images_to_supabase.ts
 */

let rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!rawUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in environment variables.');
  process.exit(1);
}

const supabase = createClient(rawUrl, supabaseKey);

const IMAGES_DIR = path.resolve(process.cwd(), 'public/static/assets/images');
const BUCKET_NAME = 'product-images';

async function uploadImagesToSupabase() {
  console.log('🚀 Starting actual image processing for Supabase...');

  // 1. Check if Supabase Storage Bucket exists, if not attempt creation
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      console.log(`🪣 Creating Supabase Storage Bucket: "${BUCKET_NAME}"...`);
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    }
  } catch (bucketErr) {
    console.warn('⚠️ Bucket check notice:', bucketErr);
  }

  // Fetch all products from Supabase
  const { data: products, error: fetchErr } = await supabase.from('products').select('id, sku, name');
  if (fetchErr || !products) {
    console.error('❌ Error fetching products from Supabase:', fetchErr?.message);
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} products. Uploading actual images...`);

  let uploadedCount = 0;

  for (const prod of products) {
    const cleanSku = (prod.sku || '').trim().toUpperCase();
    if (!cleanSku) continue;

    const possibleFilenames = [
      `${cleanSku}.jpg`,
      `${cleanSku}.jpeg`,
      `${cleanSku}.png`,
      `${cleanSku.toLowerCase()}.jpg`,
    ];

    let foundFilePath = '';
    let foundFilename = '';

    for (const fname of possibleFilenames) {
      const fullPath = path.join(IMAGES_DIR, fname);
      if (fs.existsSync(fullPath)) {
        foundFilePath = fullPath;
        foundFilename = fname;
        break;
      }
    }

    if (!foundFilePath) {
      console.warn(`⚠️ Image file for SKU ${cleanSku} not found in local asset directory.`);
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(foundFilePath);

      // --- OPTION A: Upload File to Supabase Storage Bucket ---
      const storageKey = `${cleanSku}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storageKey, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      let publicCdnUrl = '';
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storageKey);
        publicCdnUrl = urlData.publicUrl;
      }

      // --- OPTION B: Convert File to Raw Base64 Data URL string ---
      const mimeType = foundFilename.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const base64Str = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

      // Save both the Storage CDN URL and raw Base64 data string in the images JSONB column
      const imageRecord = [
        {
          id: `img-${prod.id || cleanSku}-1`,
          product_id: prod.id || cleanSku,
          storage_path: publicCdnUrl || base64Str, // CDN URL or Base64 Raw Data
          base64_data: base64Str, // Raw actual image binary encoded as Base64 string
          filename: foundFilename,
          alt_text: `${prod.name} (${cleanSku})`,
          caption: prod.name,
          display_order: 1,
          is_primary: true,
        },
      ];

      const { error: updateErr } = await supabase
        .from('products')
        .update({ images: imageRecord })
        .eq('id', prod.id);

      if (updateErr) {
        console.error(`❌ Failed to update Supabase JSONB for SKU ${cleanSku}:`, updateErr.message);
      } else {
        uploadedCount++;
        console.log(`✅ Uploaded & Stored actual image for ${cleanSku} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
      }
    } catch (err) {
      console.error(`❌ Error processing image for SKU ${cleanSku}:`, err);
    }
  }

  console.log(`🎉 SUCCESS! Successfully uploaded & saved actual images for ${uploadedCount} products in Supabase.`);
}

uploadImagesToSupabase().catch((err) => {
  console.error('❌ Unhandled error:', err);
});
