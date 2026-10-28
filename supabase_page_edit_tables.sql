-- ====================================================================
-- SUPABASE COMPLETE MIGRATION: PAGE EDIT & CMS TABLES + DATA SEEDING
-- Copy and run this entire file in Supabase SQL Editor (https://supabase.com/dashboard)
-- ====================================================================

-- 1. PAGES TABLE
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    status TEXT DEFAULT 'published',
    sections JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GLOBAL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'settings-global',
    business_name TEXT,
    tagline TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    whatsapp_number TEXT,
    address TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    currency TEXT DEFAULT 'INR',
    free_shipping_threshold NUMERIC DEFAULT 0,
    announcement_bar JSONB DEFAULT '{}'::jsonb,
    showcase_banner JSONB DEFAULT '{}'::jsonb,
    footer JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    author_name TEXT NOT NULL,
    author_location TEXT,
    rating INTEGER DEFAULT 5,
    content TEXT NOT NULL,
    artwork_purchased TEXT,
    avatar_url TEXT,
    date_str TEXT,
    is_featured BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    category TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEDIA ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.media (
    id TEXT PRIMARY KEY,
    storage_path TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    filename TEXT,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    safe_metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read pages" ON public.pages;
CREATE POLICY "Public read pages" ON public.pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "All pages" ON public.pages;
CREATE POLICY "All pages" ON public.pages FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "All settings" ON public.settings;
CREATE POLICY "All settings" ON public.settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "All testimonials" ON public.testimonials;
CREATE POLICY "All testimonials" ON public.testimonials FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "All faqs" ON public.faqs;
CREATE POLICY "All faqs" ON public.faqs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read media" ON public.media;
CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);
DROP POLICY IF EXISTS "All media" ON public.media;
CREATE POLICY "All media" ON public.media FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read audit_logs" ON public.audit_logs;
CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "All audit_logs" ON public.audit_logs;
CREATE POLICY "All audit_logs" ON public.audit_logs FOR ALL USING (true);

-- ====================================================================
-- DATA SEEDING: PAGES (7 pages)
-- ====================================================================
INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)
VALUES ('page-home', 'home', 'Home Page — Dot And Art Studio', 'Dot And Art Studio — Handcrafted Mandalas & Lippan Mirror Art', 'Discover authentic hand-painted dot mandalas and traditional Kutch Lippan mud-mirror art by artist Shital Thosar.', 'published', '[{"id":"sec-home-slideshow","page_id":"page-home","section_type":"slideshow","section_key":"slideshow","content_json":{"title":"Handcrafted Artwork Showcase","slides":[{"image":"/static/assets/images/Home_page_banner.jpeg","title":"AUTHENTIC HARMONY · 24\" HANDCRAFTED DOT MANDALA","subtext":"Hand-painted dot mandala art by Shital Thosar"},{"image":"/static/assets/images/DA-MD-30-0001.jpg","title":"GRAND AURA · 30\" MONUMENTAL WALL MANDALA","subtext":"Intricate symmetry and vibrant gold pigments"},{"image":"/static/assets/images/DA-MD-24-0001.jpg","title":"CELESTIAL RADIANCE · 24\" GEOMETRY MANDALA","subtext":"Meticulously placed acrylic dots"},{"image":"/static/assets/images/DA-LP-36-0001.jpg","title":"HERITAGE MIRROR · 36\" GUJARATI LIPPAN KAAM","subtext":"Mud-relief craft with shimmering mirrors"},{"image":"/static/assets/images/DA-MD-Set-7Chakra.jpg","title":"SEVEN CHAKRAS · COMPLETE MEDITATION SET","subtext":"Complete set of hand-painted chakra plaques"},{"image":"/static/assets/images/DA-MD-24-0002.jpg","title":"LOTUS MEDITATION · 24\" SPIRITUAL DOT MANDALA","subtext":"Harmonic geometry for tranquil wall decor"},{"image":"/static/assets/images/DA-LP-24x48-0001.jpg","title":"KUTCH TRADITION · 24\"x48\" LIPPAN MUD-MIRROR PANEL","subtext":"Reflective mirror clay relief panel"},{"image":"/static/assets/images/DA-MD-18-0002.jpg","title":"GOLDEN SUNBURST · 18\" ENERGY MANDALA","subtext":"Vibrant energy and precise dotwork"},{"image":"/static/assets/images/DA-MD-24-0005.jpg","title":"ROYAL AZURE · 24\" INTRICATE CERAMIC MANDALA","subtext":"Deep blue hues with gold highlights"},{"image":"/static/assets/images/DA-MD-15-0001.jpg","title":"VIBRANT BLOSSOM · 15\" CONTEMPORARY MANDALA","subtext":"Modern color palettes with traditional techniques"}]},"display_order":1,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-home-begin-portals","page_id":"page-home","section_type":"begin_portals","section_key":"begin_portals","content_json":{"title":"Where would you like to begin?","subtitle":"Select a category to explore our authentic collection or start a custom order.","portals":[{"title":"Artworks Collection","subtitle":"Explore handcrafted Dot Mandalas & Lippan Mirrors","image":"/static/assets/images/DA-MD-12-0001.jpg","link":"/shop"},{"title":"Commissions Studio","subtitle":"Personalized sizes, color palettes & photo art","image":"/static/assets/images/shital-studio-working.jpg","link":"/custom-order"},{"title":"Artist & Studio Story","subtitle":"Meet Shital Thosar and read collector reviews","image":"/static/assets/images/Home_page_banner.jpeg","link":"/about"}]},"display_order":2,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-home-detail-plates","page_id":"page-home","section_type":"detail_plates","section_key":"detail_plates","content_json":{"title":"Details you can feel before you touch it.","subtitle":"Zoom in on the raised acrylic dots, clay mud relief, and sparkling mirrorwork.","plates":[{"src":"/static/assets/images/DA-MD-12-0001.jpg","sku":"DA-MD-12-0001","name":"Celestial Teal Mandala","size":"12\""},{"src":"/static/assets/images/DA-MD-18-0002.jpg","sku":"DA-MD-18-0002","name":"Peacock Bloom Mandala","size":"18\""},{"src":"/static/assets/images/DA-LP-14-0001.jpg","sku":"DA-LP-14-0001","name":"Radiant Lippan Kaam Mirror","size":"14\""},{"src":"/static/assets/images/DA-MD-10-0001.jpg","sku":"DA-MD-10-0001","name":"Harmonic Ochre Mandala","size":"10\""},{"src":"/static/assets/images/DA-MD-15-0001.jpg","sku":"DA-MD-15-0001","name":"Multi-Colour Symphony","size":"15\""},{"src":"/static/assets/images/DA-LP-18-0001.jpg","sku":"DA-LP-18-0001","name":"Concentric Lippan Relief","size":"18\""},{"src":"/static/assets/images/DA-LP-Set-0001.jpg","sku":"DA-LP-Set-0001","name":"Kutch Diya & Mirror Inlay","size":"Set"},{"src":"/static/assets/images/DA-MD-12-0006.jpg","sku":"DA-MD-12-0006","name":"Blush Lotus Mandala","size":"12\""},{"src":"/static/assets/images/DA-MD-24-0001.jpg","sku":"DA-MD-24-0001","name":"Royal Emerald Monumental","size":"24\""}]},"display_order":3,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-home-featured","page_id":"page-home","section_type":"featured_artworks","section_key":"featured_artworks","content_json":{"badge":"Studio Highlights","title":"Featured Hand-Painted Pieces","description":"Explore our most sought-after Dot Mandalas and Lippan Mud-Mirror Art, each piece individually hand-painted."},"display_order":4,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-home-large-mandalas","page_id":"page-home","section_type":"large_mandalas_banner","section_key":"large_mandalas_banner","content_json":{"eyebrow":"CUSTOM COMMISSIONS · LARGE SIZED MANDALAS","title":"Made to enthrall,\nup close and across the room.","paragraph":"At this scale a mandala holds you still for a moment. From the doorway it reads as one bold form. Step closer and the nuance arrives: the concentric rings, the subtle gradients, the thousands of individual dots and light-reflecting mirrors that built it.","quote":"You choose the colours and the inspiration. I create the mandala. Together, it creates magic.","author":"— Shital Thosar","image":"/static/assets/images/Art_artist.jpeg"},"display_order":5,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-home-trust-boxes","page_id":"page-home","section_type":"trust_boxes","section_key":"trust_boxes","content_json":{"boxes":[{"title":"100% Handcrafted Originals","description":"Every dot and clay relief pattern is meticulously handcrafted by artist Shital Thosar."},{"title":"Protective Varnish Finish","description":"Sealed with professional UV & moisture resistant varnish for long-lasting vibrant artwork."},{"title":"Safe Worldwide Delivery","description":"Multi-layered custom wooden crate & foam bubble packaging ensures 100% safe transit."},{"title":"Direct Artist Support","description":"Direct communication with the artist for color advice, wall sizing & custom creations."}]},"display_order":6,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"}]'::jsonb, '2026-10-28T09:13:02.237Z', '2026-10-28T09:13:02.238Z')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sections = EXCLUDED.sections,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)
VALUES ('page-shop', 'shop', 'Artworks Catalog — Dot And Art', 'Artworks Catalog — Mandala Wall Hangings & Lippan Mirror Art', 'Browse our full collection of handcrafted Mandala Wall Hangings and traditional Kutch Lippan Mud-Mirror Art.', 'published', '[{"id":"sec-shop-header","page_id":"page-shop","section_type":"header","section_key":"shop_header","content_json":{"badge":"Handcrafted Collection","title":"Artworks & Mirrors","description":"Discover serene dot mandalas, intricate geometric mandalas, and traditional Kutch Lippan mud-mirror art. Ready to hang with protective varnish."},"display_order":1,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"}]'::jsonb, '2026-10-28T09:13:02.238Z', '2026-10-28T09:13:02.238Z')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sections = EXCLUDED.sections,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)
VALUES ('page-custom-order', 'custom-order', 'Custom Commissions — Dot And Art', 'Custom Commissions & Tailored Mandalas — Dot And Art', 'Commission a custom dot mandala or Lippan mirror artwork with your chosen color palette, diameter, and custom inscriptions.', 'published', '[{"id":"sec-custom-header","page_id":"page-custom-order","section_type":"header","section_key":"custom_header","content_json":{"badge":"CUSTOM AUTHENTIC ART COMMISSION","title":"Commission a Custom Artwork","subtitle":"Have an exact wall size, a personal spiritual intention, or a authentic central deity/photo in mind? We craft one-of-a-kind handmade mandalas and Lippan relief mirrors to your specifications."},"display_order":1,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-custom-pillars","page_id":"page-custom-order","section_type":"features","section_key":"custom_pillars","content_json":{"size_title":"Available Sizes","size_desc":"10, 12, 15, 18, 24, or 30 inches.","color_title":"Your Color Energy","color_desc":"Match your room interior, authentic chakra, or astrological gemstone.","bindu_title":"Photo / Deity Bindu","bindu_desc":"Incorporate an embossed photo or deity glyph at the mandala nucleus."},"display_order":2,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-custom-headings","page_id":"page-custom-order","section_type":"form_headings","section_key":"custom_form_headings","content_json":{"step1_heading":"1. Your Contact & Delivery Information","step2_heading":"2. Dimensions, Colors & Reference","step3_heading":"3. Central Element & Pattern Requirements","cta_button_text":"SUBMIT COMMISSION VIA WHATSAPP","policy_note":"50% advance upon design approval • 50% prior to dispatch • Worldwide insured shipping"},"display_order":3,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-custom-labels","page_id":"page-custom-order","section_type":"form_labels","section_key":"custom_form_labels","content_json":{"central_photo_label":"Central Photo or Deity Requirement & Dimension (Optional)","central_photo_note":"Note: Reference artwork URLs are automatically included in the WhatsApp message text.","pattern_label":"Specific Pattern or Energy Requirements","instructions_label":"Additional Instructions & Preferred Color Palette","instructions_placeholder":"Specify your preferred colors / color palette, wall interior notes, target occasion, or delivery deadline..."},"display_order":4,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"}]'::jsonb, '2026-10-28T09:13:02.238Z', '2026-10-28T09:13:02.238Z')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sections = EXCLUDED.sections,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)
VALUES ('page-about', 'about', 'About Shital Thosar — Dot And Art Studio', 'About Shital Thosar — Artist & Founder, Dot And Art', 'Learn about artist Shital Thosar, her meditative journey into dot mandala painting, and traditional Lippan Kaam mirror art.', 'published', '[{"id":"sec-about-guarantee","page_id":"page-about","section_type":"guarantee","section_key":"artist_authenticity_guarantee","content_json":{"heading":"Authenticity Guarantee: 100% Hand-Painted","tag":"ORIGINAL PHOTOGRAPHY [NO AI]","paragraph":"All artworks crafted at DotAndArt are authentic, physical hand-painted creations. Every image on this website is an original photograph of actual physical pieces, never AI-generated or digitally fabricated."},"display_order":1,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-hero","page_id":"page-about","section_type":"hero","section_key":"artist_hero","content_json":{"badge":"Meet The Artist","title":"About Shital Thosar","subtitle":"Artist & Founder behind DotAndArt"},"display_order":2,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-story","page_id":"page-about","section_type":"bio","section_key":"artist_story","content_json":{"statement_heading":"Hi, I’m Shital Thosar, the artist and creator behind DotAndArt.","paragraph_1":"What started as a love for colours, patterns and the simple joy of creating with my hands slowly grew into something much more meaningful—my own art journey.","paragraph_2":"I found myself drawn to Dot Mandala Art, where tiny dots come together to create intricate patterns, balance and harmony. For me, mandala is not just about creating something beautiful. It is a process of slowing down, being present and finding a little calm in the middle of everyday life.","paragraph_3":"With time, my art has evolved into a blend of traditional mandala patterns, contemporary colours and Indian artistic influences. I enjoy experimenting with colours, textures and different forms while keeping the handmade character of every piece alive.","paragraph_4":"Every DotAndArt creation is painted by hand, one dot and one detail at a time. Whether it is a personalised photo mandala, a festive piece, a wall artwork or a custom creation, I put a little piece of my creativity and love into each one.","paragraph_5":"Today, DotAndArt is not just about selling handmade art. It is about creating meaningful pieces that become part of someone''s home, celebrations and memories.","closing_thanks":"Thank you for being a part of my creative journey.","closing_sign":"With love,","closing_name":"Shital","closing_role":"ARTIST & FOUNDER, DOTANDART"},"display_order":3,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-card","page_id":"page-about","section_type":"profile_card","section_key":"artist_card","content_json":{"image":"/static/assets/images/Art_artist.jpeg","name":"Shital Thosar","role":"FOUNDER & MASTER ARTIST"},"display_order":4,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-promise","page_id":"page-about","section_type":"features","section_key":"artist_promise","content_json":{"promise_title":"The Handcrafted Promise","promise_desc":"Every artwork leaving the studio has been painted by hand with patience, precision, and devotion. We use non-toxic, lightfast acrylics, moisture-sealed MDF bases, and authentic mirrors.","point_1":"Zero mass-production or stencil printing","point_2":"Hand painted dot by dot, detail by detail","point_3":"Protective moisture-seal applied to every creation"},"display_order":5,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-custom-card","page_id":"page-about","section_type":"callout","section_key":"artist_custom_card","content_json":{"card_title":"Custom Artworks","card_desc":"Looking for custom colors, specific dimensions, or a personalized photo mandala?","button_text":"Commission Custom Piece"},"display_order":6,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-discipline","page_id":"page-about","section_type":"philosophy","section_key":"meditative_discipline","content_json":{"discipline_badge":"THE MEDITATIVE DISCIPLINE","discipline_title":"Every Dot Placed with Breath, Patience & Devotion","discipline_intro_1":"At DotAndArt, art is not merely decoration; it is a authentic meditation. Each dot mandala begins at the central Bindu — the spark of primordial consciousness — and blossoms outward in thousands of concentric, hand-dropped acrylic droplets.","discipline_intro_2":"Our Lippan Kaam honors the pastoral tribes of Kutch, where hand-kneaded organic clay relief lines cradle gleaming hand-cut mirrors that reflect light and ward off negativity. No molds, no mass production — only singular handmade devotion.","feature_1_title":"No Mechanization","feature_1_desc":"Every circle, arc, and mirror placement is created manually using traditional dotting tools.","feature_2_title":"Authentic Geometry","feature_2_desc":"Designs rooted in ancient Vedic proportions that balance energy and harmony in living spaces.","feature_3_title":"Weather Protective Seal","feature_3_desc":"Coated with professional artist varnish to safeguard colors and mirrors against dust and humidity.","feature_4_title":"Transit Safe Crate","feature_4_desc":"Custom shock-absorbent multi-ply packaging ensures your delicate artwork arrives flawless."},"display_order":7,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-process","page_id":"page-about","section_type":"steps","section_key":"creation_process","content_json":{"process_badge":"THE CREATION PROCESS","process_title":"How Each Piece Comes To Life","step_1_title":"Base Preparation","step_1_desc":"Moisture-resistant MDF discs are precision-cut, sanded, primed, and coated in rich foundational base paint.","step_2_title":"Symmetry & Geometry","step_2_desc":"Harmonious radial divisions are mapped outward from the central nucleus to guide dot placements.","step_3_title":"Dotting & Detailing","step_3_desc":"Layer after layer of graduated paint droplets or hand-set mirrors are painted with steady presence.","step_4_title":"Sealing & Finishing","step_4_desc":"Artworks cure naturally before being sealed with protective varnish and fitted with mounting hardware."},"display_order":8,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-about-cta","page_id":"page-about","section_type":"cta","section_key":"bottom_cta","content_json":{"button_text":"Explore Entire Product Catalog"},"display_order":9,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"}]'::jsonb, '2026-10-28T09:13:02.238Z', '2026-10-28T09:13:02.238Z')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sections = EXCLUDED.sections,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)
VALUES ('page-testimonials', 'testimonials', 'Collector Testimonials & Reviews — Dot And Art', 'Collector Testimonials — Dot And Art Studio', 'Read verified reviews and experiences from collectors and homeowners who have welcomed Dot And Art creations into their sanctuaries.', 'published', '[{"id":"sec-test-hero","page_id":"page-testimonials","section_type":"hero","section_key":"testimonials_hero","content_json":{"badge":"CLIENT & COLLECTOR TESTIMONIALS","title":"Words from Art Collectors","subtitle":"Read verified experiences from collectors, homeowners, yoga studios, and interior designers who have welcomed Shital Thosar’s authentic Dot Mandala and Lippan Art into their spaces.","button_text":"+ Leave a Review / Share Your Experience"},"display_order":1,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-test-stats","page_id":"page-testimonials","section_type":"stats","section_key":"testimonials_stats","content_json":{"stat1_value":"5.0 Star Rating","stat1_label":"Verified Customer Score","stat2_value":"100%","stat2_sub":"Handcrafted","stat2_label":"Zero mass production","stat3_value":"Worldwide","stat3_sub":"Insured Delivery","stat3_label":"Custom shockproof crating","stat4_value":"Direct","stat4_sub":"Artist Connection","stat4_label":"Pune Studio, India"},"display_order":2,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-test-cta","page_id":"page-testimonials","section_type":"cta","section_key":"testimonials_cta","content_json":{"title":"Ready to experience the serenity in your home?","description":"Browse our handcrafted catalog or discuss a custom diameter and custom color palette directly with Shital Thosar.","button_text":"Chat on WhatsApp"},"display_order":3,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"}]'::jsonb, '2026-10-28T09:13:02.238Z', '2026-10-28T09:13:02.238Z')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sections = EXCLUDED.sections,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)
VALUES ('page-faqs', 'faqs', 'Frequently Asked Questions — Dot And Art', 'Frequently Asked Questions — Care, Shipping & Commissions | Dot And Art', 'Find answers to top 10 questions regarding materials, framing, custom sizes, creation timelines, advance payments, and worldwide shipping.', 'published', '[{"id":"sec-faqs-header","page_id":"page-faqs","section_type":"header","section_key":"faqs_header","content_json":{"badge":"Common Inquiries","title":"Frequently Asked Questions","description":"Everything you need to know about our handcrafted mandala creation process, Lippan mirror art, customization, care, packaging, advance policies, and worldwide insured shipping."},"display_order":1,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-faqs-help","page_id":"page-faqs","section_type":"help_card","section_key":"faqs_help_card","content_json":{"title":"Still have a question?","description":"We are just a message away. Reach out to the artist on WhatsApp for immediate answers regarding your custom requirements.","button_text":"Chat on WhatsApp (+91 8652162647)"},"display_order":2,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"}]'::jsonb, '2026-10-28T09:13:02.238Z', '2026-10-28T09:13:02.238Z')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sections = EXCLUDED.sections,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.pages (id, slug, title, seo_title, meta_description, status, sections, created_at, updated_at)
VALUES ('page-contact', 'contact', 'Contact Studio — Dot And Art', 'Contact Studio & Artist Helpline — Dot And Art', 'Get in touch with Shital Thosar for studio visits in Pune, custom order inquiries, WhatsApp assistance, and email support.', 'published', '[{"id":"sec-contact-header","page_id":"page-contact","section_type":"header","section_key":"contact_header","content_json":{"badge":"Studio Connection","title":"Get in Touch with the Artist","description":"Have a question about a artwork or want to discuss a custom commission? Reach out directly via WhatsApp, phone, email, or visit our Pune studio."},"display_order":1,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-contact-info","page_id":"page-contact","section_type":"info_cards","section_key":"studio_info","content_json":{"info_title":"Studio Information","whatsapp_display":"+91 8652162647","whatsapp_note":"Direct messaging & custom order assistance","domain_name":"www.dotandart.in","email_address":"shitalthosar@yahoo.com","studio_address":"Pune, India","instagram_handle":"@sathosar","instagram_url":"https://www.instagram.com/sathosar","facebook_url":"https://www.facebook.com/people/Dot-And-Art/61570301135652/?rdid=pVSv1qBdjZtMtY9r&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1LuTQvNiMU%2F"},"display_order":2,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"},{"id":"sec-contact-form","page_id":"page-contact","section_type":"form_header","section_key":"contact_form","content_json":{"form_title":"Send a Direct Message","form_subtitle":"Fill in your inquiry below to open an immediate WhatsApp conversation with the artist.","submit_button_text":"Submit"},"display_order":3,"is_visible":true,"created_at":"2026-10-15T08:00:00.000Z","updated_at":"2026-10-15T08:00:00.000Z"}]'::jsonb, '2026-10-28T09:13:02.238Z', '2026-10-28T09:13:02.238Z')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  seo_title = EXCLUDED.seo_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sections = EXCLUDED.sections,
  updated_at = EXCLUDED.updated_at;

-- ====================================================================
-- DATA SEEDING: SETTINGS
-- ====================================================================
INSERT INTO public.settings (id, business_name, tagline, contact_email, contact_phone, whatsapp_number, address, instagram_url, facebook_url, currency, free_shipping_threshold, announcement_bar, showcase_banner, footer, updated_at)
VALUES ('settings-global', 'Dot And Art Studio', 'Authentic Handcrafted Mandala & Lippan Mirror Art', 'shitalthosar@yahoo.com', '+91 8652162647', '+918652162647', 'Pune, India', 'https://www.instagram.com/sathosar', 'https://www.facebook.com/people/Dot-And-Art/61570301135652/?rdid=pVSv1qBdjZtMtY9r&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1LuTQvNiMU%2F', 'INR', 0, '{}'::jsonb, '{"image_url":"/static/assets/images/Home_page_banner.jpeg","title":"Authentic Harmony — Handcrafted Dot Mandala Wall Hanging","eyebrow":"Monumental Studio Showcase","product_sku":"Home_page_banner","price":5200,"size":"24 inches","material":"Moisture-Resistant MDF Board, Heavy-Body Acrylic Colors, Mirrors, Varnish","creation_time":"8 Days","shipping_info":"Worldwide Insured Express Delivery","short_description":"Monumental 24-inch handcrafted authentic dot mandala with shimmering mirrors, intricate neutral tones, and protective glossy varnish.","badge_text":"100% Handcrafted Original","pins_enabled":true}'::jsonb, '{}'::jsonb, '2026-10-28T09:13:02.238Z')
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  tagline = EXCLUDED.tagline,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  whatsapp_number = EXCLUDED.whatsapp_number,
  address = EXCLUDED.address,
  instagram_url = EXCLUDED.instagram_url,
  facebook_url = EXCLUDED.facebook_url,
  announcement_bar = EXCLUDED.announcement_bar,
  showcase_banner = EXCLUDED.showcase_banner,
  footer = EXCLUDED.footer,
  updated_at = EXCLUDED.updated_at;

-- ====================================================================
-- DATA SEEDING: TESTIMONIALS (5 items)
-- ====================================================================
INSERT INTO public.testimonials (id, author_name, author_location, rating, content, artwork_purchased, avatar_url, date_str, is_featured, is_active, created_at, updated_at)
VALUES ('test-dummy-001', NULL, NULL, 5, 'The precision of every single dot is astonishing! It has transformed our living room and meditation corner into a sanctuary of calm. Arrived impeccably packed in a custom wooden-reinforced crate without a single scratch.', '24-Inch Golden Harmony Dot Mandala', NULL, NULL, TRUE, TRUE, '2026-10-15T10:00:00.000Z', '2026-10-15T10:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  author_name = EXCLUDED.author_name,
  content = EXCLUDED.content,
  rating = EXCLUDED.rating,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.testimonials (id, author_name, author_location, rating, content, artwork_purchased, avatar_url, date_str, is_featured, is_active, created_at, updated_at)
VALUES ('test-dummy-002', NULL, NULL, 5, 'We commissioned a custom Lippan piece for our clinic reception. Shital kept us updated throughout the process and incorporated our requested clay relief patterns and mirrors. Patients constantly compliment the craftsmanship.', 'Traditional Kutch Lippan Mud-Mirror Art', NULL, NULL, TRUE, TRUE, '2026-10-16T11:30:00.000Z', '2026-10-16T11:30:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  author_name = EXCLUDED.author_name,
  content = EXCLUDED.content,
  rating = EXCLUDED.rating,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.testimonials (id, author_name, author_location, rating, content, artwork_purchased, avatar_url, date_str, is_featured, is_active, created_at, updated_at)
VALUES ('test-dummy-003', NULL, NULL, 5, 'Photos simply do not do justice to the tactile depth and gloss finish. The mirrors catch the morning sun in the most magical way. You can feel the hours of patient devotion in every concentric circle.', 'Teal & Gold Harmonic Lotus Mandala', NULL, NULL, TRUE, TRUE, '2026-10-17T09:15:00.000Z', '2026-10-17T09:15:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  author_name = EXCLUDED.author_name,
  content = EXCLUDED.content,
  rating = EXCLUDED.rating,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.testimonials (id, author_name, author_location, rating, content, artwork_purchased, avatar_url, date_str, is_featured, is_active, created_at, updated_at)
VALUES ('test-dummy-004', NULL, NULL, 5, 'Working with Shital on our custom anniversary piece was a delight. She tailored the color palette to our dining room wall perfectly. The unboxing experience felt like opening a royal gift.', 'Custom 30-Inch Multi-Tier Floral Mandala', NULL, NULL, TRUE, TRUE, '2026-10-18T14:20:00.000Z', '2026-10-18T14:20:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  author_name = EXCLUDED.author_name,
  content = EXCLUDED.content,
  rating = EXCLUDED.rating,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.testimonials (id, author_name, author_location, rating, content, artwork_purchased, avatar_url, date_str, is_featured, is_active, created_at, updated_at)
VALUES ('test-dummy-005', NULL, NULL, 5, 'Ordered international delivery to Dubai and it arrived within 5 days safely in flawless condition. Outstanding craftsmanship, mesmerizing symmetry, and responsive communication from the artist.', 'Harmonic Geometry Lippan Mirror Hanging', NULL, NULL, TRUE, TRUE, '2026-10-19T16:45:00.000Z', '2026-10-19T16:45:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  author_name = EXCLUDED.author_name,
  content = EXCLUDED.content,
  rating = EXCLUDED.rating,
  updated_at = EXCLUDED.updated_at;

-- ====================================================================
-- DATA SEEDING: FAQS (10 items)
-- ====================================================================
INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-001', 'Materials & Craft', 'What materials and tools are used in creating Dot Mandala and Lippan Artworks?', 'Each dot mandala is handcrafted using moisture-resistant engineered MDF wooden boards, high-grade artist heavy-body acrylic paints, fine dotting tools, and authentic reflective mirrors. Lippan art pieces are crafted using traditional mud and ceramic relief clay mixtures combined with intricately arranged hand-cut glass mirrors (aabhla). Every completed artwork is sealed with archival, UV-resistant protective gloss varnish for longevity.', 1, TRUE, '2026-10-15T08:00:00.000Z', '2026-10-15T08:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-002', 'Installation & Hardware', 'Are the artworks ready to hang upon arrival?', 'Yes! Every artwork comes 100% ready to hang with a heavy-duty, rust-resistant triangle or sawtooth hanging hook pre-installed on the back, along with soft wall-stabilizer bumpers to ensure the artwork sits flush and protects your wall surface.', 2, TRUE, '2026-10-15T08:05:00.000Z', '2026-10-15T08:05:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-003', 'Custom Orders', 'Can I commission a custom design, color palette, or specific size?', 'Absolutely. Custom orders are warmly welcomed. You can choose specific sizes (from 8 inches up to 36+ inches), color schemes matching your interior palette, geometric patterns, or personalized inscriptions. Reach out via our Custom Commissions page or WhatsApp directly with the artist to discuss your ideas.', 3, TRUE, '2026-10-15T08:10:00.000Z', '2026-10-15T08:10:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-004', 'Timelines & Process', 'How long does it take to create and dispatch a handcrafted artwork?', 'Depending on the complexity and diameter, standard catalog items ship within 1–3 business days. Custom commissioned pieces typically require 5 to 12 days to ensure adequate curing time for clay relief layers, precision dotting in multiple pigment layers, and complete varnish drying.', 4, TRUE, '2026-10-15T08:15:00.000Z', '2026-10-15T08:15:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-005', 'Packaging & Protection', 'How are the delicate artworks packed for safe transit?', 'We take utmost care in packaging. Each piece is wrapped in acid-free tissue, enclosed in multiple layers of heavy-duty shock-absorbing bubble wrap, protected with rigid corner guards, and encased in reinforced double-wall corrugated cartons or sturdy wooden crating for oversized mirrors.', 5, TRUE, '2026-10-15T08:20:00.000Z', '2026-10-15T08:20:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-006', 'Shipping & Delivery', 'Do you ship across India and internationally?', 'Yes, we provide tracked and insured shipping across India (usually arriving within 3–7 business days) as well as worldwide international express delivery with reputed logistics partners (DHL/FedEx).', 6, TRUE, '2026-10-15T08:25:00.000Z', '2026-10-15T08:25:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-007', 'Care & Maintenance', 'How should I care for and clean my Dot Art and Lippan mirror wall hangings?', 'Maintenance is very simple. Gently dust the surface with a soft, clean, dry microfiber cloth or a soft bristle brush. For Lippan mirrors, you may lightly wipe the mirror glass with a barely damp cotton swab. Never use harsh abrasive chemicals, alcohol sprays, or soak the piece in water. For indoor display away from direct rain and prolonged harsh direct outdoor sunlight.', 7, TRUE, '2026-10-15T08:30:00.000Z', '2026-10-15T08:30:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-008', 'Payment & Pricing', 'What is your payment and advance policy for custom commissions?', 'For custom commissioned artwork, a 50% advance booking deposit is required to begin design sketching, material sourcing, and studio creation. The remaining 50% balance is payable upon completion after we share high-definition photos and video of your finished artwork prior to secure dispatch.', 8, TRUE, '2026-10-15T08:35:00.000Z', '2026-10-15T08:35:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-009', 'Insurance & Guarantees', 'What happens if an artwork is damaged during courier transit?', 'Every shipment is 100% transit-insured. In the extremely rare event that your package arrives damaged, simply take a short unboxing video and clear photographs of the outer packaging and damaged item within 24 hours of receipt, and send it to our WhatsApp helpline (+91 8652162647). We will immediately replace or restore your piece free of charge.', 9, TRUE, '2026-10-15T08:40:00.000Z', '2026-10-15T08:40:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO public.faqs (id, category, question, answer, display_order, is_active, created_at, updated_at)
VALUES ('faq-010', 'Authenticity & Certification', 'Do Dot And Art creations come with an artist Certificate of Authenticity?', 'Yes, all original Dot And Art creations come signed by the artist Shital Thosar and include a studio Certificate of Authenticity specifying the artwork title, year of creation, dimensions, and medium used.', 10, TRUE, '2026-10-15T08:45:00.000Z', '2026-10-15T08:45:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  display_order = EXCLUDED.display_order,
  updated_at = EXCLUDED.updated_at;

-- ====================================================================
-- DATA SEEDING: MEDIA (2 items)
-- ====================================================================
INSERT INTO public.media (id, storage_path, media_type, filename, title, created_at)
VALUES ('media-1793114375950-2a8baf', '/uploads/DA-LP-SM-0002-1793114375911-7658bd05.jpg', 'image', 'DA-LP-SM-0002-1793114375911-7658bd05.jpg', 'DA-LP-SM-0002.jpg', '2026-10-27T15:19:35.950Z')
ON CONFLICT (id) DO UPDATE SET
  storage_path = EXCLUDED.storage_path,
  filename = EXCLUDED.filename;

INSERT INTO public.media (id, storage_path, media_type, filename, title, created_at)
VALUES ('media-1793113488827-9e99f1', '/uploads/DA-LP-SM-0002-1793113488770-517d2c1c.jpg', 'image', 'DA-LP-SM-0002-1793113488770-517d2c1c.jpg', 'DA-LP-SM-0002.jpg', '2026-10-27T15:04:48.827Z')
ON CONFLICT (id) DO UPDATE SET
  storage_path = EXCLUDED.storage_path,
  filename = EXCLUDED.filename;

