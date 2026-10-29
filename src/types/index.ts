export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_path?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  price: number;
  variant_label?: string;
  is_available: boolean;
  display_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text?: string;
  caption?: string;
  display_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string; // Unique product code (e.g., DNA-MAN-001)
  name: string;
  short_description?: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  material: string;
  framing: string;
  customizable: boolean;
  creation_time: string;
  shipping_info: string;
  special_information?: string;
  featured: boolean;
  is_published: boolean;
  is_available?: boolean; // Shown as available in catalog (editable by admin)
  available_badge_text?: string; // Custom badge label text (e.g. "Available", "Available to Order", "In Stock")
  unavailable_badge_text?: string; // Custom badge label when unavailable (e.g. "Made to Order", "Unavailable")
  show_available_badge?: boolean; // Whether to display badge on images (editable by admin)
  is_high_demand?: boolean; // Lippan art items shown as high demand (editable by admin)
  extra_delivery_days?: number; // e.g. 5 extra days (editable by admin)
  high_demand_message?: string; // Free text box saying it will take 5 more days than usual, positively phrased (editable by admin)
  badge_tag?: string; // Custom promotional badge tag e.g. "Featured", "Bestseller", "New", "Staff Pick"
  photos_available_note?: string;
  base_price: number;
  base_size: string;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  storage_path: string;
  media_type: 'image' | 'video';
  filename: string;
  title?: string;
  alt_text?: string;
  caption?: string;
  file_size?: number;
  created_at: string;
  referenced_count?: number;
}

export interface PageSection {
  id: string;
  page_id: string;
  section_type: string;
  section_key: string;
  content_json: Record<string, any>;
  display_order: number;
  is_visible?: boolean;
  enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebsitePage {
  id: string;
  slug: string;
  title: string;
  seo_title?: string;
  meta_description?: string;
  og_image_path?: string;
  status: 'published' | 'draft';
  sections: PageSection[];
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  location?: string;
  artwork_purchased?: string;
  image_path?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseBannerHotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  tag: string;
  description: string;
}

export interface ShowcaseBannerConfig {
  title?: string;
  eyebrow?: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  product_sku?: string;
  price?: number;
  size?: string;
  material?: string;
  creation_time?: string;
  shipping_info?: string;
  badge_text?: string;
  pins_enabled?: boolean;
  pins?: ShowcaseBannerHotspot[];
  hotspots?: ShowcaseBannerHotspot[];
}

export interface WebsiteSettings {
  business_name: string;
  tagline: string;
  domain: string;
  whatsapp_number: string;
  whatsapp_display: string;
  instagram_url: string;
  facebook_url: string;
  email: string;
  studio_address: string;
  payment_terms: string;
  shipping_policy_summary: string;
  available_badge_default_text?: string;
  unavailable_badge_default_text?: string;
  artisan_badge_text?: string;
  shipping_badge_text?: string;
  show_available_badges?: boolean;
  featured_3d_sku?: string;
  featured_3d_image?: string;
  showcase_banner?: ShowcaseBannerConfig;
  announcement_banner: {
    enabled: boolean;
    text: string;
    link_url?: string;
  };
  default_seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

export interface AuditLog {
  id: string;
  admin_user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  safe_metadata_json: Record<string, any>;
  created_at: string;
}

export interface CartItem {
  product: Product;
  selected_variant?: ProductVariant;
  size: string;
  price: number;
  quantity: number;
  customization_notes?: string;
}

export interface CustomMandalaInquiry {
  customer_name: string;
  whatsapp_number: string;
  email?: string;
  delivery_address: string;
  reference_product_code?: string;
  desired_size: string;
  preferred_color_scheme: string;
  central_photo_requirement?: string;
  specific_pattern_requirements?: string;
  additional_instructions?: string;
}

export interface ImportReport {
  total_processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  details: Array<{
    sku: string;
    name: string;
    status: 'inserted' | 'updated' | 'skipped' | 'failed';
    reason?: string;
  }>;
}
