import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

/**
 * Script to seed all Page Edit and CMS related tables in Supabase:
 * 1. pages (Website pages & section content)
 * 2. settings (Global website & business settings)
 * 3. testimonials (Collector reviews & ratings)
 * 4. faqs (Frequently asked questions)
 * 5. media (Uploaded assets library)
 * 6. audit_logs (Admin activity logs)
 */

const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPageEditTables() {
  console.log('🚀 Starting Supabase Page Edits & CMS Seeding...');
  console.log(`📡 Connecting to Supabase project: ${supabaseUrl}`);

  // Read data from db.json or fallback to initial catalog
  let dbData: any = {};
  const dbPath = path.resolve(process.cwd(), 'db.json');
  if (fs.existsSync(dbPath)) {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      dbData = JSON.parse(raw);
      console.log('📄 Loaded live dataset from db.json');
    } catch (e) {
      console.warn('⚠️ Could not parse db.json, using fallback defaults.');
    }
  }

  // 1. Seed Pages
  const pages = dbData.pages || [];
  if (pages.length > 0) {
    console.log(`\n📄 Upserting ${pages.length} Pages into Supabase "pages" table...`);
    const formattedPages = pages.map((p: any) => ({
      id: p.id || `page-${p.slug}`,
      slug: p.slug,
      title: p.title || '',
      seo_title: p.seo_title || '',
      meta_description: p.meta_description || '',
      status: p.status || 'published',
      sections: Array.isArray(p.sections) ? p.sections : [],
      created_at: p.created_at || new Date().toISOString(),
      updated_at: p.updated_at || new Date().toISOString(),
    }));

    const { error: pageErr } = await supabase
      .from('pages')
      .upsert(formattedPages, { onConflict: 'slug' });

    if (pageErr) {
      console.error('❌ Error seeding "pages" table:', pageErr.message);
      if (pageErr.message.includes('relation "public.pages" does not exist') || pageErr.code === '42P01') {
        console.warn('👉 Table "pages" does not exist in Supabase yet. Please execute the SQL migration script first.');
      }
    } else {
      console.log('✅ Successfully seeded "pages" table!');
    }
  }

  // 2. Seed Settings
  const settings = dbData.settings || {};
  if (settings && (settings.business_name || settings.id)) {
    console.log('\n⚙️ Upserting Global Settings into Supabase "settings" table...');
    const formattedSettings = {
      id: settings.id || 'settings-global',
      business_name: settings.business_name || 'Dot And Art',
      tagline: settings.tagline || 'Handcrafted Dot Mandala & Lippan Mirror Art',
      contact_email: settings.contact_email || 'shitalthosar@yahoo.com',
      contact_phone: settings.contact_phone || '+91 8652162647',
      whatsapp_number: settings.whatsapp_number || '+91 8652162647',
      address: settings.address || 'Pune, India',
      instagram_url: settings.instagram_url || 'https://www.instagram.com/sathosar',
      facebook_url: settings.facebook_url || '',
      currency: settings.currency || 'INR',
      free_shipping_threshold: Number(settings.free_shipping_threshold) || 0,
      announcement_bar: settings.announcement_bar || {},
      showcase_banner: settings.showcase_banner || {},
      footer: settings.footer || {},
      updated_at: settings.updated_at || new Date().toISOString(),
    };

    const { error: settingsErr } = await supabase
      .from('settings')
      .upsert([formattedSettings], { onConflict: 'id' });

    if (settingsErr) {
      console.error('❌ Error seeding "settings" table:', settingsErr.message);
      if (settingsErr.message.includes('relation "public.settings" does not exist') || settingsErr.code === '42P01') {
        console.warn('👉 Table "settings" does not exist in Supabase yet. Please execute the SQL migration script first.');
      }
    } else {
      console.log('✅ Successfully seeded "settings" table!');
    }
  }

  // 3. Seed Testimonials
  const testimonials = dbData.testimonials || [];
  if (testimonials.length > 0) {
    console.log(`\n💬 Upserting ${testimonials.length} Testimonials into Supabase "testimonials" table...`);
    const formattedTestimonials = testimonials.map((t: any) => ({
      id: t.id || `test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      author_name: t.author_name || 'Collector',
      author_location: t.author_location || '',
      rating: Number(t.rating) || 5,
      content: t.content || '',
      artwork_purchased: t.artwork_purchased || '',
      avatar_url: t.avatar_url || '',
      date_str: t.date_str || '',
      is_featured: t.is_featured !== false,
      is_active: t.is_active !== false,
      created_at: t.created_at || new Date().toISOString(),
      updated_at: t.updated_at || new Date().toISOString(),
    }));

    const { error: testErr } = await supabase
      .from('testimonials')
      .upsert(formattedTestimonials, { onConflict: 'id' });

    if (testErr) {
      console.error('❌ Error seeding "testimonials" table:', testErr.message);
      if (testErr.message.includes('relation "public.testimonials" does not exist') || testErr.code === '42P01') {
        console.warn('👉 Table "testimonials" does not exist in Supabase yet. Please execute the SQL migration script first.');
      }
    } else {
      console.log('✅ Successfully seeded "testimonials" table!');
    }
  }

  // 4. Seed FAQs
  const faqs = dbData.faqs || [];
  if (faqs.length > 0) {
    console.log(`\n❓ Upserting ${faqs.length} FAQs into Supabase "faqs" table...`);
    const formattedFaqs = faqs.map((f: any) => ({
      id: f.id || `faq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      category: f.category || 'General',
      question: f.question || '',
      answer: f.answer || '',
      display_order: Number(f.display_order) || 1,
      is_active: f.is_active !== false,
      created_at: f.created_at || new Date().toISOString(),
      updated_at: f.updated_at || new Date().toISOString(),
    }));

    const { error: faqErr } = await supabase
      .from('faqs')
      .upsert(formattedFaqs, { onConflict: 'id' });

    if (faqErr) {
      console.error('❌ Error seeding "faqs" table:', faqErr.message);
      if (faqErr.message.includes('relation "public.faqs" does not exist') || faqErr.code === '42P01') {
        console.warn('👉 Table "faqs" does not exist in Supabase yet. Please execute the SQL migration script first.');
      }
    } else {
      console.log('✅ Successfully seeded "faqs" table!');
    }
  }

  // 5. Seed Media
  const media = dbData.media || [];
  if (media.length > 0) {
    console.log(`\n🖼️ Upserting ${media.length} Media Assets into Supabase "media" table...`);
    const formattedMedia = media.map((m: any) => ({
      id: m.id || `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      storage_path: m.storage_path || '',
      media_type: m.media_type || 'image',
      filename: m.filename || '',
      title: m.title || '',
      created_at: m.created_at || new Date().toISOString(),
    }));

    const { error: mediaErr } = await supabase
      .from('media')
      .upsert(formattedMedia, { onConflict: 'id' });

    if (mediaErr) {
      console.error('❌ Error seeding "media" table:', mediaErr.message);
    } else {
      console.log('✅ Successfully seeded "media" table!');
    }
  }

  // 6. Seed Audit Logs
  const auditLogs = dbData.audit_logs || [];
  if (auditLogs.length > 0) {
    console.log(`\n📋 Upserting ${auditLogs.length} Audit Logs into Supabase "audit_logs" table...`);
    const formattedLogs = auditLogs.map((l: any) => ({
      id: l.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      admin_user_id: l.admin_user_id || 'admin',
      action: l.action || 'system_event',
      entity_type: l.entity_type || 'system',
      entity_id: l.entity_id || '',
      safe_metadata_json: l.safe_metadata_json || {},
      created_at: l.created_at || new Date().toISOString(),
    }));

    const { error: logErr } = await supabase
      .from('audit_logs')
      .upsert(formattedLogs, { onConflict: 'id' });

    if (logErr) {
      console.error('❌ Error seeding "audit_logs" table:', logErr.message);
    } else {
      console.log('✅ Successfully seeded "audit_logs" table!');
    }
  }

  console.log('\n🎉 Supabase Page Edit Tables seeding process finished!');
}

seedPageEditTables().catch((err) => {
  console.error('❌ Unhandled seeding error:', err);
});
