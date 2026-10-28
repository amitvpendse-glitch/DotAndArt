import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WebsitePage, WebsiteSettings, Testimonial, FAQ, MediaAsset, AuditLog } from '../types';

const rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('[supabaseCatalog] Could not initialize Supabase client:', err);
  }
}

/**
 * Save / Upsert a Website Page in Supabase
 */
export async function saveSupabasePage(page: WebsitePage): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: page.id || `page-${page.slug}`,
      slug: page.slug,
      title: page.title,
      seo_title: page.seo_title || '',
      meta_description: page.meta_description || '',
      status: page.status || 'published',
      sections: Array.isArray(page.sections) ? page.sections : [],
      created_at: page.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('pages').upsert(payload, { onConflict: 'slug' });
    if (error) {
      console.warn('[Supabase] Error saving page:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch all Website Pages from Supabase
 */
export async function getSupabasePages(): Promise<WebsitePage[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('pages').select('*');
    if (error || !Array.isArray(data)) return [];
    return data as WebsitePage[];
  } catch {
    return [];
  }
}

/**
 * Save / Upsert Global Website Settings in Supabase
 */
export async function saveSupabaseSettings(settings: WebsiteSettings): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: 'settings-global',
      business_name: settings.business_name || 'Dot And Art',
      tagline: settings.tagline || '',
      contact_email: settings.email || 'shitalthosar@yahoo.com',
      contact_phone: settings.whatsapp_number || '+91 8652162647',
      whatsapp_number: settings.whatsapp_number || '+91 8652162647',
      address: settings.studio_address || 'Pune, India',
      instagram_url: settings.instagram_url || '',
      facebook_url: settings.facebook_url || '',
      announcement_bar: settings.announcement_banner || {},
      showcase_banner: settings.showcase_banner || {},
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Error saving settings:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch Global Website Settings from Supabase
 */
export async function getSupabaseSettings(): Promise<WebsiteSettings | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1).single();
    if (error || !data) return null;
    return data as WebsiteSettings;
  } catch {
    return null;
  }
}

/**
 * Save / Upsert Testimonial in Supabase
 */
export async function saveSupabaseTestimonial(testimonial: Testimonial): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: testimonial.id,
      author_name: testimonial.customer_name || 'Collector',
      author_location: testimonial.location || '',
      rating: Number(testimonial.rating) || 5,
      content: testimonial.content,
      artwork_purchased: testimonial.artwork_purchased || '',
      avatar_url: testimonial.image_path || '',
      is_published: testimonial.is_published !== false,
      display_order: testimonial.display_order || 1,
      created_at: testimonial.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('testimonials').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Error saving testimonial:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch Testimonials from Supabase
 */
export async function getSupabaseTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (error || !Array.isArray(data)) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}

/**
 * Save / Upsert FAQ in Supabase
 */
export async function saveSupabaseFAQ(faq: FAQ): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: faq.id,
      category: faq.category || 'General',
      question: faq.question,
      answer: faq.answer,
      display_order: Number(faq.display_order) || 1,
      is_published: faq.is_published !== false,
      created_at: faq.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('faqs').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Error saving FAQ:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch FAQs from Supabase
 */
export async function getSupabaseFAQs(): Promise<FAQ[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('faqs').select('*').order('display_order', { ascending: true });
    if (error || !Array.isArray(data)) return [];
    return data as FAQ[];
  } catch {
    return [];
  }
}

/**
 * Save Media Asset in Supabase
 */
export async function saveSupabaseMedia(asset: MediaAsset): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: asset.id,
      storage_path: asset.storage_path,
      media_type: asset.media_type || 'image',
      filename: asset.filename || '',
      title: asset.title || '',
      created_at: asset.created_at || new Date().toISOString(),
    };
    const { error } = await supabase.from('media').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Error saving media:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Save Audit Log in Supabase
 */
export async function saveSupabaseAuditLog(log: AuditLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: log.id,
      admin_user_id: log.admin_user_id || 'admin',
      action: log.action,
      entity_type: log.entity_type || 'system',
      entity_id: log.entity_id || '',
      safe_metadata_json: log.safe_metadata_json || {},
      created_at: log.created_at || new Date().toISOString(),
    };
    const { error } = await supabase.from('audit_logs').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Error saving audit log:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
