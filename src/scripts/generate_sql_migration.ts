import * as fs from 'fs';
import * as path from 'path';

function escapeSqlString(str: string): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeSqlJson(obj: any): string {
  if (obj === null || obj === undefined) return "'{}'::jsonb";
  const jsonStr = JSON.stringify(obj);
  return `'${jsonStr.replace(/'/g, "''")}'::jsonb`;
}

function generateMigrationSql() {
  const dbPath = path.resolve(process.cwd(), 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ db.json not found!');
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(raw);

  let sql = `-- ====================================================================\n`;
  sql += `-- SUPABASE COMPLETE MIGRATION: PAGE EDIT & CMS TABLES + DATA SEEDING\n`;
  sql += `-- Copy and run this entire file in Supabase SQL Editor (https://supabase.com/dashboard)\n`;
  sql += `-- ====================================================================\n\n`;

  // 1. DDL
  sql += `-- 1. PAGES TABLE\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.pages (\n`;
  sql += `    id TEXT PRIMARY KEY,\n`;
  sql += `    slug TEXT UNIQUE NOT NULL,\n`;
  sql += `    title TEXT NOT NULL,\n`;
  sql += `    seo_title TEXT,\n`;
  sql += `    meta_description TEXT,\n`;
  sql += `    status TEXT DEFAULT 'published',\n`;
  sql += `    sections JSONB DEFAULT '[]'::jsonb,\n`;
  sql += `    created_at TIMESTAMPTZ DEFAULT NOW(),\n`;
  sql += `    updated_at TIMESTAMPTZ DEFAULT NOW()\n`;
  sql += `);\n\n`;

  sql += `-- 2. GLOBAL SETTINGS TABLE\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.settings (\n`;
  sql += `    id TEXT PRIMARY KEY DEFAULT 'settings-global',\n`;
  sql += `    business_name TEXT,\n`;
  sql += `    tagline TEXT,\n`;
  sql += `    contact_email TEXT,\n`;
  sql += `    contact_phone TEXT,\n`;
  sql += `    whatsapp_number TEXT,\n`;
  sql += `    address TEXT,\n`;
  sql += `    instagram_url TEXT,\n`;
  sql += `    facebook_url TEXT,\n`;
  sql += `    currency TEXT DEFAULT 'INR',\n`;
  sql += `    free_shipping_threshold NUMERIC DEFAULT 0,\n`;
  sql += `    announcement_bar JSONB DEFAULT '{}'::jsonb,\n`;
  sql += `    showcase_banner JSONB DEFAULT '{}'::jsonb,\n`;
  sql += `    footer JSONB DEFAULT '{}'::jsonb,\n`;
  sql += `    created_at TIMESTAMPTZ DEFAULT NOW(),\n`;
  sql += `    updated_at TIMESTAMPTZ DEFAULT NOW()\n`;
  sql += `);\n\n`;

  sql += `-- 3. TESTIMONIALS TABLE\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.testimonials (\n`;
  sql += `    id TEXT PRIMARY KEY,\n`;
  sql += `    author_name TEXT NOT NULL,\n`;
  sql += `    author_location TEXT,\n`;
  sql += `    rating INTEGER DEFAULT 5,\n`;
  sql += `    content TEXT NOT NULL,\n`;
  sql += `    artwork_purchased TEXT,\n`;
  sql += `    avatar_url TEXT,\n`;
  sql += `    date_str TEXT,\n`;
  sql += `    is_featured BOOLEAN DEFAULT TRUE,\n`;
  sql += `    is_active BOOLEAN DEFAULT TRUE,\n`;
  sql += `    created_at TIMESTAMPTZ DEFAULT NOW(),\n`;
  sql += `    updated_at TIMESTAMPTZ DEFAULT NOW()\n`;
  sql += `);\n\n`;

  sql += `-- 4. FAQS TABLE\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.faqs (\n`;
  sql += `    id TEXT PRIMARY KEY,\n`;
  sql += `    category TEXT,\n`;
  sql += `    question TEXT NOT NULL,\n`;
  sql += `    answer TEXT NOT NULL,\n`;
  sql += `    display_order INTEGER DEFAULT 1,\n`;
  sql += `    is_active BOOLEAN DEFAULT TRUE,\n`;
  sql += `    created_at TIMESTAMPTZ DEFAULT NOW(),\n`;
  sql += `    updated_at TIMESTAMPTZ DEFAULT NOW()\n`;
  sql += `);\n\n`;

  sql += `-- 5. MEDIA ASSETS TABLE\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.media (\n`;
  sql += `    id TEXT PRIMARY KEY,\n`;
  sql += `    storage_path TEXT NOT NULL,\n`;
  sql += `    media_type TEXT DEFAULT 'image',\n`;
  sql += `    filename TEXT,\n`;
  sql += `    title TEXT,\n`;
  sql += `    created_at TIMESTAMPTZ DEFAULT NOW()\n`;
  sql += `);\n\n`;

  sql += `-- 6. AUDIT LOGS TABLE\n`;
  sql += `CREATE TABLE IF NOT EXISTS public.audit_logs (\n`;
  sql += `    id TEXT PRIMARY KEY,\n`;
  sql += `    admin_user_id TEXT,\n`;
  sql += `    action TEXT NOT NULL,\n`;
  sql += `    entity_type TEXT,\n`;
  sql += `    entity_id TEXT,\n`;
  sql += `    safe_metadata_json JSONB DEFAULT '{}'::jsonb,\n`;
  sql += `    created_at TIMESTAMPTZ DEFAULT NOW()\n`;
  sql += `);\n\n`;

  sql += `-- ROW LEVEL SECURITY & POLICIES\n`;
  sql += `ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;\n`;
  sql += `ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;\n`;
  sql += `ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;\n`;
  sql += `ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;\n`;
  sql += `ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;\n`;
  sql += `ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;\n\n`;

  sql += `DROP POLICY IF EXISTS "Public read pages" ON public.pages;\n`;
  sql += `CREATE POLICY "Public read pages" ON public.pages FOR SELECT USING (true);\n`;
  sql += `DROP POLICY IF EXISTS "All pages" ON public.pages;\n`;
  sql += `CREATE POLICY "All pages" ON public.pages FOR ALL USING (true);\n\n`;

  sql += `DROP POLICY IF EXISTS "Public read settings" ON public.settings;\n`;
  sql += `CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);\n`;
  sql += `DROP POLICY IF EXISTS "All settings" ON public.settings;\n`;
  sql += `CREATE POLICY "All settings" ON public.settings FOR ALL USING (true);\n\n`;

  sql += `DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;\n`;
  sql += `CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);\n`;
  sql += `DROP POLICY IF EXISTS "All testimonials" ON public.testimonials;\n`;
  sql += `CREATE POLICY "All testimonials" ON public.testimonials FOR ALL USING (true);\n\n`;

  sql += `DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;\n`;
  sql += `CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);\n`;
  sql += `DROP POLICY IF EXISTS "All faqs" ON public.faqs;\n`;
  sql += `CREATE POLICY "All faqs" ON public.faqs FOR ALL USING (true);\n\n`;

  sql += `DROP POLICY IF EXISTS "Public read media" ON public.media;\n`;
  sql += `CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);\n`;
  sql += `DROP POLICY IF EXISTS "All media" ON public.media;\n`;
  sql += `CREATE POLICY "All media" ON public.media FOR ALL USING (true);\n\n`;

  sql += `DROP POLICY IF EXISTS "Public read audit_logs" ON public.audit_logs;\n`;
  sql += `CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);\n`;
  sql += `DROP POLICY IF EXISTS "All audit_logs" ON public.audit_logs;\n`;
  sql += `CREATE POLICY "All audit_logs" ON public.audit_logs FOR ALL USING (true);\n\n`;

  // 2. DATA SEEDING

  // Pages
  sql += `-- ====================================================================\n`;
  sql += `-- DATA SEEDING: PAGES (${(db.pages || []).length} pages)\n`;
  sql += `-- ====================================================================\n`;
  for (const p of db.pages || []) {
    const id = escapeSqlString(p.id || `page-${p.slug}`);
    const slug = escapeSqlString(p.slug);
    const title = escapeSqlString(p.title);
    const seo_title = escapeSqlString(p.seo_title);
    const meta_description = escapeSqlString(p.meta_description);
    const status = escapeSqlString(p.status || 'published');
    const sections = escapeSqlJson(p.sections || []);
    const created_at = escapeSqlString(p.created_at || new Date().toISOString());
    const updated_at = escapeSqlString(p.updated_at || new Date().toISOString());

    sql += `INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)\n`;
    sql += `VALUES (${id}, ${slug}, ${title}, ${seo_title}, ${meta_description}, ${status}, ${sections}, ${created_at}, ${updated_at})\n`;
    sql += `ON CONFLICT (slug) DO UPDATE SET\n`;
    sql += `  title = EXCLUDED.title,\n`;
    sql += `  seo_title = EXCLUDED.seo_title,\n`;
    sql += `  meta_description = EXCLUDED.meta_description,\n`;
    sql += `  status = EXCLUDED.status,\n`;
    sql += `  sections = EXCLUDED.sections,\n`;
    sql += `  updated_at = EXCLUDED.updated_at;\n\n`;
  }

  // Settings
  sql += `-- ====================================================================\n`;
  sql += `-- DATA SEEDING: SETTINGS\n`;
  sql += `-- ====================================================================\n`;
  const s = db.settings || {};
  const sId = escapeSqlString(s.id || 'settings-global');
  const bName = escapeSqlString(s.business_name || 'Dot And Art');
  const tagline = escapeSqlString(s.tagline || '');
  const email = escapeSqlString(s.contact_email || 'shitalthosar@yahoo.com');
  const phone = escapeSqlString(s.contact_phone || '+91 8652162647');
  const wa = escapeSqlString(s.whatsapp_number || '+91 8652162647');
  const addr = escapeSqlString(s.address || 'Pune, India');
  const insta = escapeSqlString(s.instagram_url || '');
  const fb = escapeSqlString(s.facebook_url || '');
  const curr = escapeSqlString(s.currency || 'INR');
  const freeShip = Number(s.free_shipping_threshold) || 0;
  const annBar = escapeSqlJson(s.announcement_bar || {});
  const showBanner = escapeSqlJson(s.showcase_banner || {});
  const footer = escapeSqlJson(s.footer || {});
  const sUpdated = escapeSqlString(s.updated_at || new Date().toISOString());

  sql += `INSERT INTO public.settings (id, business_name, tagline, contact_email, contact_phone, whatsapp_number, address, instagram_url, facebook_url, currency, free_shipping_threshold, announcement_bar, showcase_banner, footer, updated_at)\n`;
  sql += `VALUES (${sId}, ${bName}, ${tagline}, ${email}, ${phone}, ${wa}, ${addr}, ${insta}, ${fb}, ${curr}, ${freeShip}, ${annBar}, ${showBanner}, ${footer}, ${sUpdated})\n`;
  sql += `ON CONFLICT (id) DO UPDATE SET\n`;
  sql += `  business_name = EXCLUDED.business_name,\n`;
  sql += `  tagline = EXCLUDED.tagline,\n`;
  sql += `  contact_email = EXCLUDED.contact_email,\n`;
  sql += `  contact_phone = EXCLUDED.contact_phone,\n`;
  sql += `  whatsapp_number = EXCLUDED.whatsapp_number,\n`;
  sql += `  address = EXCLUDED.address,\n`;
  sql += `  instagram_url = EXCLUDED.instagram_url,\n`;
  sql += `  facebook_url = EXCLUDED.facebook_url,\n`;
  sql += `  announcement_bar = EXCLUDED.announcement_bar,\n`;
  sql += `  showcase_banner = EXCLUDED.showcase_banner,\n`;
  sql += `  footer = EXCLUDED.footer,\n`;
  sql += `  updated_at = EXCLUDED.updated_at;\n\n`;

  // Testimonials
  sql += `-- ====================================================================\n`;
  sql += `-- DATA SEEDING: TESTIMONIALS (${(db.testimonials || []).length} items)\n`;
  sql += `-- ====================================================================\n`;
  for (const t of db.testimonials || []) {
    const tId = escapeSqlString(t.id);
    const author = escapeSqlString(t.author_name);
    const loc = escapeSqlString(t.author_location);
    const rating = Number(t.rating) || 5;
    const content = escapeSqlString(t.content);
    const artwork = escapeSqlString(t.artwork_purchased);
    const avatar = escapeSqlString(t.avatar_url);
    const dateStr = escapeSqlString(t.date_str);
    const isFeat = t.is_featured !== false ? 'TRUE' : 'FALSE';
    const isAct = t.is_active !== false ? 'TRUE' : 'FALSE';
    const tCreated = escapeSqlString(t.created_at || new Date().toISOString());
    const tUpdated = escapeSqlString(t.updated_at || new Date().toISOString());

    sql += `INSERT INTO public.testimonials (id, author_name, author_location, rating, content, artwork_purchased, avatar_url, date_str, is_featured, is_active, created_at, updated_at)\n`;
    sql += `VALUES (${tId}, ${author}, ${loc}, ${rating}, ${content}, ${artwork}, ${avatar}, ${dateStr}, ${isFeat}, ${isAct}, ${tCreated}, ${tUpdated})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET\n`;
    sql += `  author_name = EXCLUDED.author_name,\n`;
    sql += `  content = EXCLUDED.content,\n`;
    sql += `  rating = EXCLUDED.rating,\n`;
    sql += `  updated_at = EXCLUDED.updated_at;\n\n`;
  }

  // FAQs
  sql += `-- ====================================================================\n`;
  sql += `-- DATA SEEDING: FAQS (${(db.faqs || []).length} items)\n`;
  sql += `-- ====================================================================\n`;
  for (const f of db.faqs || []) {
    const fId = escapeSqlString(f.id);
    const cat = escapeSqlString(f.category || 'General');
    const q = escapeSqlString(f.question);
    const a = escapeSqlString(f.answer);
    const order = Number(f.display_order) || 1;
    const isAct = f.is_active !== false ? 'TRUE' : 'FALSE';
    const fCreated = escapeSqlString(f.created_at || new Date().toISOString());
    const fUpdated = escapeSqlString(f.updated_at || new Date().toISOString());

    sql += `INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)\n`;
    sql += `VALUES (${fId}, ${cat}, ${q}, ${a}, ${order}, ${isAct}, ${fCreated}, ${fUpdated})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET\n`;
    sql += `  question = EXCLUDED.question,\n`;
    sql += `  answer = EXCLUDED.answer,\n`;
    sql += `  display_order = EXCLUDED.display_order,\n`;
    sql += `  updated_at = EXCLUDED.updated_at;\n\n`;
  }

  // Media
  sql += `-- ====================================================================\n`;
  sql += `-- DATA SEEDING: MEDIA (${(db.media || []).length} items)\n`;
  sql += `-- ====================================================================\n`;
  for (const m of db.media || []) {
    const mId = escapeSqlString(m.id);
    const pathStr = escapeSqlString(m.storage_path);
    const type = escapeSqlString(m.media_type || 'image');
    const fn = escapeSqlString(m.filename);
    const title = escapeSqlString(m.title);
    const mCreated = escapeSqlString(m.created_at || new Date().toISOString());

    sql += `INSERT INTO public.media (id, storage_path, media_type, filename, title, created_at)\n`;
    sql += `VALUES (${mId}, ${pathStr}, ${type}, ${fn}, ${title}, ${mCreated})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET\n`;
    sql += `  storage_path = EXCLUDED.storage_path,\n`;
    sql += `  filename = EXCLUDED.filename;\n\n`;
  }

  fs.writeFileSync(path.resolve(process.cwd(), 'supabase_page_edit_tables.sql'), sql, 'utf-8');
  console.log('🎉 Generated supabase_page_edit_tables.sql successfully!');
}

generateMigrationSql();
