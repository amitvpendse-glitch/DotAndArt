import { Category, Product, Testimonial, FAQ, WebsiteSettings, WebsitePage } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    "id": "cat-mandala",
    "name": "Mandala Wall Hangings",
    "slug": "mandala-wall-hangings",
    "description": "Intricately handcrafted sacred dot mandalas painted dot-by-dot with acrylics on premium MDF boards. Meditative focal points designed to infuse balance, serenity, and spiritual energy into living and sacred spaces.",
    "image_path": "/static/assets/images/DA-MD-12-0001.jpg",
    "display_order": 1,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "cat-lippan",
    "name": "Lippan Wall Hangings",
    "slug": "lippan-wall-hangings",
    "description": "Traditional Gujarati mud and mirror art (Lippan Kaam) modernized for contemporary home décor. Hand-kneaded clay reliefs embedded with gleaming geometric mirrors (abhla) that reflect radiant warmth and cultural heritage.",
    "image_path": "/static/assets/images/DA-LP-LG-0001.jpg",
    "display_order": 2,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-da-md-10-0001",
    "sku": "DA-MD-10-0001",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0001-1",
        "product_id": "prod-da-md-10-0001",
        "storage_path": "/static/assets/images/DA-MD-10-0001.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0001 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0001-1",
        "product_id": "prod-da-md-10-0001",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0002",
    "sku": "DA-MD-10-0002",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0002-1",
        "product_id": "prod-da-md-10-0002",
        "storage_path": "/static/assets/images/DA-MD-10-0002.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0002 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0002-1",
        "product_id": "prod-da-md-10-0002",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0003",
    "sku": "DA-MD-10-0003",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0003-1",
        "product_id": "prod-da-md-10-0003",
        "storage_path": "/static/assets/images/DA-MD-10-0003.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0003 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0003-1",
        "product_id": "prod-da-md-10-0003",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0004",
    "sku": "DA-MD-10-0004",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0004-1",
        "product_id": "prod-da-md-10-0004",
        "storage_path": "/static/assets/images/DA-MD-10-0004.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0004 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0004-1",
        "product_id": "prod-da-md-10-0004",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0005",
    "sku": "DA-MD-10-0005",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0005-1",
        "product_id": "prod-da-md-10-0005",
        "storage_path": "/static/assets/images/DA-MD-10-0005.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0005 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0005-1",
        "product_id": "prod-da-md-10-0005",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0006",
    "sku": "DA-MD-10-0006",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0006-1",
        "product_id": "prod-da-md-10-0006",
        "storage_path": "/static/assets/images/DA-MD-10-0006.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0006 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0006-1",
        "product_id": "prod-da-md-10-0006",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0007",
    "sku": "DA-MD-10-0007",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0007-1",
        "product_id": "prod-da-md-10-0007",
        "storage_path": "/static/assets/images/DA-MD-10-0007.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0007 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0007-1",
        "product_id": "prod-da-md-10-0007",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0008",
    "sku": "DA-MD-10-0008",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0008-1",
        "product_id": "prod-da-md-10-0008",
        "storage_path": "/static/assets/images/DA-MD-10-0008.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0008 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0008-1",
        "product_id": "prod-da-md-10-0008",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-10-0009",
    "sku": "DA-MD-10-0009",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 650,
    "base_size": "10 inches",
    "images": [
      {
        "id": "img-DA-MD-10-0009-1",
        "product_id": "prod-da-md-10-0009",
        "storage_path": "/static/assets/images/DA-MD-10-0009.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-10-0009 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (10 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-10-0009-1",
        "product_id": "prod-da-md-10-0009",
        "size": "10 inches",
        "price": 650,
        "variant_label": "Standard (10 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0001",
    "sku": "DA-MD-12-0001",
    "name": "Mandala Wall Hanging",
    "short_description": "Square Mandala Wall Hanging",
    "description": "Square Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0001-1",
        "product_id": "prod-da-md-12-0001",
        "storage_path": "/static/assets/images/DA-MD-12-0001.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0001 (Square Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0001-1",
        "product_id": "prod-da-md-12-0001",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0002",
    "sku": "DA-MD-12-0002",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0002-1",
        "product_id": "prod-da-md-12-0002",
        "storage_path": "/static/assets/images/DA-MD-12-0002.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0002 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0002-1",
        "product_id": "prod-da-md-12-0002",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0003",
    "sku": "DA-MD-12-0003",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0003-1",
        "product_id": "prod-da-md-12-0003",
        "storage_path": "/static/assets/images/DA-MD-12-0003.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0003 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0003-1",
        "product_id": "prod-da-md-12-0003",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0004",
    "sku": "DA-MD-12-0004",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0004-1",
        "product_id": "prod-da-md-12-0004",
        "storage_path": "/static/assets/images/DA-MD-12-0004.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0004 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0004-1",
        "product_id": "prod-da-md-12-0004",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0005",
    "sku": "DA-MD-12-0005",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0005-1",
        "product_id": "prod-da-md-12-0005",
        "storage_path": "/static/assets/images/DA-MD-12-0005.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0005 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0005-1",
        "product_id": "prod-da-md-12-0005",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0006",
    "sku": "DA-MD-12-0006",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0006-1",
        "product_id": "prod-da-md-12-0006",
        "storage_path": "/static/assets/images/DA-MD-12-0006.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0006 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0006-1",
        "product_id": "prod-da-md-12-0006",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0007",
    "sku": "DA-MD-12-0007",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0007-1",
        "product_id": "prod-da-md-12-0007",
        "storage_path": "/static/assets/images/DA-MD-12-0007.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0007 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0007-1",
        "product_id": "prod-da-md-12-0007",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0008",
    "sku": "DA-MD-12-0008",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0008-1",
        "product_id": "prod-da-md-12-0008",
        "storage_path": "/static/assets/images/DA-MD-12-0008.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0008 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0008-1",
        "product_id": "prod-da-md-12-0008",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0009",
    "sku": "DA-MD-12-0009",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0009-1",
        "product_id": "prod-da-md-12-0009",
        "storage_path": "/static/assets/images/DA-MD-12-0009.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0009 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0009-1",
        "product_id": "prod-da-md-12-0009",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0010",
    "sku": "DA-MD-12-0010",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0010-1",
        "product_id": "prod-da-md-12-0010",
        "storage_path": "/static/assets/images/DA-MD-12-0010.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0010 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0010-1",
        "product_id": "prod-da-md-12-0010",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0011",
    "sku": "DA-MD-12-0011",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0011-1",
        "product_id": "prod-da-md-12-0011",
        "storage_path": "/static/assets/images/DA-MD-12-0011.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0011 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0011-1",
        "product_id": "prod-da-md-12-0011",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0012",
    "sku": "DA-MD-12-0012",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0012-1",
        "product_id": "prod-da-md-12-0012",
        "storage_path": "/static/assets/images/DA-MD-12-0012.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0012 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0012-1",
        "product_id": "prod-da-md-12-0012",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0013",
    "sku": "DA-MD-12-0013",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0013-1",
        "product_id": "prod-da-md-12-0013",
        "storage_path": "/static/assets/images/DA-MD-12-0013.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0013 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0013-1",
        "product_id": "prod-da-md-12-0013",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0014",
    "sku": "DA-MD-12-0014",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0014-1",
        "product_id": "prod-da-md-12-0014",
        "storage_path": "/static/assets/images/DA-MD-12-0014.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0014 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0014-1",
        "product_id": "prod-da-md-12-0014",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0015",
    "sku": "DA-MD-12-0015",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0015-1",
        "product_id": "prod-da-md-12-0015",
        "storage_path": "/static/assets/images/DA-MD-12-0015.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0015 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0015-1",
        "product_id": "prod-da-md-12-0015",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0016",
    "sku": "DA-MD-12-0016",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0016-1",
        "product_id": "prod-da-md-12-0016",
        "storage_path": "/static/assets/images/DA-MD-12-0016.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0016 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0016-1",
        "product_id": "prod-da-md-12-0016",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0017",
    "sku": "DA-MD-12-0017",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0017-1",
        "product_id": "prod-da-md-12-0017",
        "storage_path": "/static/assets/images/DA-MD-12-0017.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0017 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0017-1",
        "product_id": "prod-da-md-12-0017",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0018",
    "sku": "DA-MD-12-0018",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0018-1",
        "product_id": "prod-da-md-12-0018",
        "storage_path": "/static/assets/images/DA-MD-12-0018.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0018 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0018-1",
        "product_id": "prod-da-md-12-0018",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-12-0019",
    "sku": "DA-MD-12-0019",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "2 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 2 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 850,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-MD-12-0019-1",
        "product_id": "prod-da-md-12-0019",
        "storage_path": "/static/assets/images/DA-MD-12-0019.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-12-0019 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-12-0019-1",
        "product_id": "prod-da-md-12-0019",
        "size": "12 inches",
        "price": 850,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0001",
    "sku": "DA-MD-15-0001",
    "name": "Mandala Wall Hanging",
    "short_description": "Square Mandala Wall Hanging",
    "description": "Square Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0001-1",
        "product_id": "prod-da-md-15-0001",
        "storage_path": "/static/assets/images/DA-MD-15-0001.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0001 (Square Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0001-1",
        "product_id": "prod-da-md-15-0001",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0002",
    "sku": "DA-MD-15-0002",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0002-1",
        "product_id": "prod-da-md-15-0002",
        "storage_path": "/static/assets/images/DA-MD-15-0002.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0002 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0002-1",
        "product_id": "prod-da-md-15-0002",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0003",
    "sku": "DA-MD-15-0003",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0003-1",
        "product_id": "prod-da-md-15-0003",
        "storage_path": "/static/assets/images/DA-MD-15-0003.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0003 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0003-1",
        "product_id": "prod-da-md-15-0003",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0004",
    "sku": "DA-MD-15-0004",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0004-1",
        "product_id": "prod-da-md-15-0004",
        "storage_path": "/static/assets/images/DA-MD-15-0004.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0004 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0004-1",
        "product_id": "prod-da-md-15-0004",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0005",
    "sku": "DA-MD-15-0005",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging with mirror",
    "description": "Circular Mandala Wall Hanging with mirror",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Centre Mirror, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Centre Mirror, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1600,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0005-1",
        "product_id": "prod-da-md-15-0005",
        "storage_path": "/static/assets/images/DA-MD-15-0005.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0005 (Circular Mandala Wall Hanging with mirror)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0005-1",
        "product_id": "prod-da-md-15-0005",
        "size": "15 inches",
        "price": 1600,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0006",
    "sku": "DA-MD-15-0006",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0006-1",
        "product_id": "prod-da-md-15-0006",
        "storage_path": "/static/assets/images/DA-MD-15-0006.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0006 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0006-1",
        "product_id": "prod-da-md-15-0006",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0007",
    "sku": "DA-MD-15-0007",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0007-1",
        "product_id": "prod-da-md-15-0007",
        "storage_path": "/static/assets/images/DA-MD-15-0007.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0007 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0007-1",
        "product_id": "prod-da-md-15-0007",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0008",
    "sku": "DA-MD-15-0008",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0008-1",
        "product_id": "prod-da-md-15-0008",
        "storage_path": "/static/assets/images/DA-MD-15-0008.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0008 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0008-1",
        "product_id": "prod-da-md-15-0008",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0009",
    "sku": "DA-MD-15-0009",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1500,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0009-1",
        "product_id": "prod-da-md-15-0009",
        "storage_path": "/static/assets/images/DA-MD-15-0009.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0009 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0009-1",
        "product_id": "prod-da-md-15-0009",
        "size": "15 inches",
        "price": 1500,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-15-0010",
    "sku": "DA-MD-15-0010",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging with photo insert",
    "description": "Circular Mandala Wall Hanging with photo insert",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Photo, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "3 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Photo, Warnish• Creation Time: 3 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1600,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-MD-15-0010-1",
        "product_id": "prod-da-md-15-0010",
        "storage_path": "/static/assets/images/DA-MD-15-0010.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-15-0010 (Circular Mandala Wall Hanging with photo insert)",
        "caption": "Mandala Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-15-0010-1",
        "product_id": "prod-da-md-15-0010",
        "size": "15 inches",
        "price": 1600,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0001",
    "sku": "DA-MD-18-0001",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging with photo insert",
    "description": "Circular Mandala Wall Hanging with photo insert",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Photo, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Photo, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2600,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0001-1",
        "product_id": "prod-da-md-18-0001",
        "storage_path": "/static/assets/images/DA-MD-18-0001.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0001 (Circular Mandala Wall Hanging with photo insert)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0001-1",
        "product_id": "prod-da-md-18-0001",
        "size": "18 inches",
        "price": 2600,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0002",
    "sku": "DA-MD-18-0002",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0002-1",
        "product_id": "prod-da-md-18-0002",
        "storage_path": "/static/assets/images/DA-MD-18-0002.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0002 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0002-1",
        "product_id": "prod-da-md-18-0002",
        "size": "18 inches",
        "price": 2500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0003",
    "sku": "DA-MD-18-0003",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0003-1",
        "product_id": "prod-da-md-18-0003",
        "storage_path": "/static/assets/images/DA-MD-18-0003.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0003 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0003-1",
        "product_id": "prod-da-md-18-0003",
        "size": "18 inches",
        "price": 2500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0004",
    "sku": "DA-MD-18-0004",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging with mirror",
    "description": "Circular Mandala Wall Hanging with mirror",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Centre Mirror, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Centre Mirror, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2600,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0004-1",
        "product_id": "prod-da-md-18-0004",
        "storage_path": "/static/assets/images/DA-MD-18-0004.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0004 (Circular Mandala Wall Hanging with mirror)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0004-1",
        "product_id": "prod-da-md-18-0004",
        "size": "18 inches",
        "price": 2600,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0005",
    "sku": "DA-MD-18-0005",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging with photo insert",
    "description": "Circular Mandala Wall Hanging with photo insert",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Photo, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Photo, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2600,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0005-1",
        "product_id": "prod-da-md-18-0005",
        "storage_path": "/static/assets/images/DA-MD-18-0005.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0005 (Circular Mandala Wall Hanging with photo insert)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0005-1",
        "product_id": "prod-da-md-18-0005",
        "size": "18 inches",
        "price": 2600,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0006",
    "sku": "DA-MD-18-0006",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0006-1",
        "product_id": "prod-da-md-18-0006",
        "storage_path": "/static/assets/images/DA-MD-18-0006.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0006 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0006-1",
        "product_id": "prod-da-md-18-0006",
        "size": "18 inches",
        "price": 2500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0007",
    "sku": "DA-MD-18-0007",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging with photo insert",
    "description": "Circular Mandala Wall Hanging with photo insert",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Photo, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Photo, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2600,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0007-1",
        "product_id": "prod-da-md-18-0007",
        "storage_path": "/static/assets/images/DA-MD-18-0007.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0007 (Circular Mandala Wall Hanging with photo insert)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0007-1",
        "product_id": "prod-da-md-18-0007",
        "size": "18 inches",
        "price": 2600,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0008",
    "sku": "DA-MD-18-0008",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0008-1",
        "product_id": "prod-da-md-18-0008",
        "storage_path": "/static/assets/images/DA-MD-18-0008.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0008 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0008-1",
        "product_id": "prod-da-md-18-0008",
        "size": "18 inches",
        "price": 2500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0009",
    "sku": "DA-MD-18-0009",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0009-1",
        "product_id": "prod-da-md-18-0009",
        "storage_path": "/static/assets/images/DA-MD-18-0009.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0009 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0009-1",
        "product_id": "prod-da-md-18-0009",
        "size": "18 inches",
        "price": 2500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-18-0010",
    "sku": "DA-MD-18-0010",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 2500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-MD-18-0010-1",
        "product_id": "prod-da-md-18-0010",
        "storage_path": "/static/assets/images/DA-MD-18-0010.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-18-0010 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-18-0010-1",
        "product_id": "prod-da-md-18-0010",
        "size": "18 inches",
        "price": 2500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-24-0001",
    "sku": "DA-MD-24-0001",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "8 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 8 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 5200,
    "base_size": "24 inches",
    "images": [
      {
        "id": "img-DA-MD-24-0001-1",
        "product_id": "prod-da-md-24-0001",
        "storage_path": "/static/assets/images/DA-MD-24-0001.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-24-0001 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (24 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-24-0001-1",
        "product_id": "prod-da-md-24-0001",
        "size": "24 inches",
        "price": 5200,
        "variant_label": "Standard (24 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-24-0002",
    "sku": "DA-MD-24-0002",
    "name": "Sacred Harmony — 24-Inch Dot Mandala Wall Hanging",
    "short_description": "Monumental 24-inch handcrafted sacred dot mandala with shimmering mirrors and protective varnish.",
    "description": "An awe-inspiring 24-inch handcrafted sacred dot mandala wall hanging. Painted dot by concentric dot with meditative precision on moisture-resistant MDF board, featuring deep jewel-toned acrylics, concentric light-reflecting mirrors, and a durable crystal-clear protective varnish finish.",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "8 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Mirrors, Warnish• Creation Time: 8 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 5200,
    "base_size": "24 inches",
    "images": [
      {
        "id": "img-DA-MD-24-0002-1",
        "product_id": "prod-da-md-24-0002",
        "storage_path": "/static/assets/images/DA-MD-24-0002.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-24-0002 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (24 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-24-0002-1",
        "product_id": "prod-da-md-24-0002",
        "size": "24 inches",
        "price": 5200,
        "variant_label": "Standard (24 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-md-30-0001",
    "sku": "DA-MD-30-0001",
    "name": "Mandala Wall Hanging",
    "short_description": "Circular Mandala Wall Hanging",
    "description": "Circular Mandala Wall Hanging",
    "category_id": "cat-mandala",
    "category_name": "Mandala Wall Hangings",
    "category_slug": "mandala-wall-hangings",
    "material": "MDF Board, Acrylic Colors, Pearls or Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "12 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Acrylic Colors, Pearls or Mirrors, Warnish• Creation Time: 12 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 8500,
    "base_size": "30 inches",
    "images": [
      {
        "id": "img-DA-MD-30-0001-1",
        "product_id": "prod-da-md-30-0001",
        "storage_path": "/static/assets/images/DA-MD-30-0001.jpg",
        "alt_text": "Mandala Wall Hanging — DA-MD-30-0001 (Circular Mandala Wall Hanging)",
        "caption": "Mandala Wall Hanging (30 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-MD-30-0001-1",
        "product_id": "prod-da-md-30-0001",
        "size": "30 inches",
        "price": 8500,
        "variant_label": "Standard (30 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-lg-0001",
    "sku": "DA-LP-LG-0001",
    "name": "Lippan Wall Hanging",
    "short_description": "Large Lippan Wall Hanging",
    "description": "Large Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "15 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish• Creation Time: 15 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 25000,
    "base_size": "24 inches",
    "images": [
      {
        "id": "img-DA-LP-LG-0001-1",
        "product_id": "prod-da-lp-lg-0001",
        "storage_path": "/static/assets/images/DA-LP-LG-0001.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-LG-0001 (Large Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (24 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-LG-0001-1",
        "product_id": "prod-da-lp-lg-0001",
        "size": "24 inches",
        "price": 25000,
        "variant_label": "Standard (24 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-lg-0002",
    "sku": "DA-LP-LG-0002",
    "name": "Lippan Wall Hanging",
    "short_description": "Large Lippan Wall Hanging",
    "description": "Large Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "8 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish• Creation Time: 8 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 3500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-LP-LG-0002-1",
        "product_id": "prod-da-lp-lg-0002",
        "storage_path": "/static/assets/images/DA-LP-LG-0002.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-LG-0002 (Large Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-LG-0002-1",
        "product_id": "prod-da-lp-lg-0002",
        "size": "18 inches",
        "price": 3500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-lg-0003",
    "sku": "DA-LP-LG-0003",
    "name": "Lippan Wall Hanging",
    "short_description": "Large Lippan Wall Hanging",
    "description": "Large Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "15 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish• Creation Time: 15 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 25000,
    "base_size": "30 inches",
    "images": [
      {
        "id": "img-DA-LP-LG-0003-1",
        "product_id": "prod-da-lp-lg-0003",
        "storage_path": "/static/assets/images/DA-LP-LG-0003.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-LG-0003 (Large Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (30 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-LG-0003-1",
        "product_id": "prod-da-lp-lg-0003",
        "size": "30 inches",
        "price": 25000,
        "variant_label": "Standard (30 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-md-0001",
    "sku": "DA-LP-MD-0001",
    "name": "Lippan Wall Hanging",
    "short_description": "Medium Lippan Wall Hanging",
    "description": "Medium Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "5 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish• Creation Time: 5 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1700,
    "base_size": "15 inches",
    "images": [
      {
        "id": "img-DA-LP-MD-0001-1",
        "product_id": "prod-da-lp-md-0001",
        "storage_path": "/static/assets/images/DA-LP-MD-0001.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-MD-0001 (Medium Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (15 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-MD-0001-1",
        "product_id": "prod-da-lp-md-0001",
        "size": "15 inches",
        "price": 1700,
        "variant_label": "Standard (15 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-md-0002",
    "sku": "DA-LP-MD-0002",
    "name": "Lippan Wall Hanging",
    "short_description": "Medium Lippan Wall Hanging",
    "description": "Medium Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "8 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish• Creation Time: 8 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 3500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-LP-MD-0002-1",
        "product_id": "prod-da-lp-md-0002",
        "storage_path": "/static/assets/images/DA-LP-MD-0002.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-MD-0002 (Medium Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-MD-0002-1",
        "product_id": "prod-da-lp-md-0002",
        "size": "18 inches",
        "price": 3500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-md-0003",
    "sku": "DA-LP-MD-0003",
    "name": "Lippan Wall Hanging",
    "short_description": "Medium Lippan Wall Hanging",
    "description": "Medium Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Centre, Mirror, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "8 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Centre, Mirror, Warnish• Creation Time: 8 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 3500,
    "base_size": "18 inches",
    "images": [
      {
        "id": "img-DA-LP-MD-0003-1",
        "product_id": "prod-da-lp-md-0003",
        "storage_path": "/static/assets/images/DA-LP-MD-0003.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-MD-0003 (Medium Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (18 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-MD-0003-1",
        "product_id": "prod-da-lp-md-0003",
        "size": "18 inches",
        "price": 3500,
        "variant_label": "Standard (18 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-sm-0001",
    "sku": "DA-LP-SM-0001",
    "name": "Lippan Wall Hanging",
    "short_description": "Small Lippan Wall Hanging",
    "description": "Small Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "4 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish• Creation Time: 4 Days • Shipping: All over the world",
    "featured": true,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1100,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-LP-SM-0001-1",
        "product_id": "prod-da-lp-sm-0001",
        "storage_path": "/static/assets/images/DA-LP-SM-0001.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-SM-0001 (Small Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-SM-0001-1",
        "product_id": "prod-da-lp-sm-0001",
        "size": "12 inches",
        "price": 1100,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "prod-da-lp-sm-0002",
    "sku": "DA-LP-SM-0002",
    "name": "Lippan Wall Hanging",
    "short_description": "Small Lippan Wall Hanging",
    "description": "Small Lippan Wall Hanging",
    "category_id": "cat-lippan",
    "category_name": "Lippan Wall Hangings",
    "category_slug": "lippan-wall-hangings",
    "material": "MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish",
    "framing": "No",
    "customizable": true,
    "creation_time": "4 Days",
    "shipping_info": "All over the world (Bubble wrap and corrugated box)",
    "special_information": "Photos Available: Yes • Material: MDF Board, Lippan Clay, Acrylic Colors, Mirrors, Warnish• Creation Time: 4 Days • Shipping: All over the world",
    "featured": false,
    "is_published": true,
    "photos_available_note": "Yes",
    "base_price": 1100,
    "base_size": "12 inches",
    "images": [
      {
        "id": "img-DA-LP-SM-0002-1",
        "product_id": "prod-da-lp-sm-0002",
        "storage_path": "/static/assets/images/DA-LP-SM-0002.jpg",
        "alt_text": "Lippan Wall Hanging — DA-LP-SM-0002 (Small Lippan Wall Hanging)",
        "caption": "Lippan Wall Hanging (12 inches)",
        "display_order": 1,
        "is_primary": true
      }
    ],
    "variants": [
      {
        "id": "var-DA-LP-SM-0002-1",
        "product_id": "prod-da-lp-sm-0002",
        "size": "12 inches",
        "price": 1100,
        "variant_label": "Standard (12 inches)",
        "is_available": true,
        "display_order": 1
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    customer_name: 'Ananya Sharma',
    content: 'The sacred mandala we ordered is an absolute masterpiece. The precision of the dots and the vibrant spiritual energy it radiates in our living room is breathtaking.',
    rating: 5,
    location: 'Mumbai, India',
    artwork_purchased: 'Surya Mandala',
    display_order: 1,
    is_published: true,
    created_at: new Date('2025-01-10').toISOString(),
    updated_at: new Date('2025-01-10').toISOString(),
  },
  {
    id: 'test-2',
    customer_name: 'Vikram & Priya Nair',
    content: 'Stunning Lippan mirror art! The craftsmanship and packaging quality exceeded our expectations. It adds such warm traditional heritage to our modern entryway.',
    rating: 5,
    location: 'Bengaluru, India',
    artwork_purchased: 'Lippan Mirror Wall Hanging',
    display_order: 2,
    is_published: true,
    created_at: new Date('2025-01-12').toISOString(),
    updated_at: new Date('2025-01-12').toISOString(),
  },
];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Are these artworks 100% handmade?',
    answer: 'Yes! Every single dot mandala and Lippan mud-mirror piece is meticulously handcrafted by skilled artisans dot-by-dot, with no machine printing whatsoever.',
    category: 'Craftsmanship',
    display_order: 1,
    is_published: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'faq-2',
    question: 'How are artworks shipped safely without transit damage?',
    answer: 'We securely pack each artwork with multi-layer protective bubble wrap and sturdy corrugated box packaging to ensure 100% safe, damage-free delivery worldwide.',
    category: 'Shipping',
    display_order: 2,
    is_published: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
];

export const INITIAL_SETTINGS: WebsiteSettings = {
  business_name: 'Dot And Art Studio',
  tagline: 'Handcrafted Sacred Mandalas & Lippan Mirror Art',
  domain: 'dotandart.in',
  whatsapp_number: '+918652162647',
  whatsapp_display: '+91 86521 62647',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  email: 'shitalthosar@yahoo.com',
  studio_address: 'Mumbai, Maharashtra, India',
  payment_terms: '50% advance for custom commissions, balance upon photo approval prior to dispatch.',
  shipping_policy_summary: 'Worldwide insured shipping available with robust bubble & crate packing.',
  featured_3d_sku: 'DA-MD-24-0001',
  featured_3d_image: '/static/assets/images/DA-MD-24-0001.jpg',
  showcase_banner: {
    title: 'Sacred Harmony — 24-Inch Dot Mandala Wall Hanging',
    eyebrow: 'Monumental 24-Inch Showcase',
    description: 'An awe-inspiring 24-inch handcrafted sacred dot mandala wall hanging. Painted dot by concentric dot with meditative precision on moisture-resistant MDF board, featuring deep jewel-toned acrylics, concentric light-reflecting mirrors, and a durable crystal-clear protective varnish finish.',
    short_description: 'Monumental 24-inch handcrafted sacred dot mandala with shimmering mirrors and protective varnish.',
    image_url: '/static/assets/images/DA-MD-24-0002.jpg',
    product_sku: 'DA-MD-24-0002',
    price: 5200,
    size: '24 inches',
    material: 'MDF Board, Acrylic Colors, Mirrors, Varnish',
    creation_time: '8 Days',
    shipping_info: 'All over the world (Bubble wrap and corrugated box)',
    badge_text: '100% Handcrafted Original',
    hotspots: [
      {
        id: 'mirrors',
        x: 65,
        y: 35,
        title: 'Precision Mirror Inlays',
        tag: 'Light Reflection',
        description: 'Concentric hand-embedded mirrors that playfully catch daylight and evening room illumination.',
      },
      {
        id: 'color-gradients',
        x: 35,
        y: 65,
        title: 'Deep Pigment Layering',
        tag: 'Artisan Technique',
        description: 'Graduated teal, mystical indigo, metallic bronze, and gold heavy-body artist acrylics.',
      },
      {
        id: 'outer-rim',
        x: 78,
        y: 72,
        title: '24-Inch Sealed Diameter',
        tag: 'Moisture-Proof Base',
        description: 'Rigid 8mm moisture-resistant MDF board, hand-sanded with flush rear hook and gloss protective varnish.',
      },
    ],
  },
  announcement_banner: {
    enabled: true,
    text: '✨ Explore our newly curated catalog of authentic handcrafted dot mandalas and Lippan mirror art!',
    link_url: '/shop',
  },
  default_seo: {
    title: 'Dot And Art — Handcrafted Sacred Mandalas & Lippan Mirror Art',
    description: 'Discover exquisite handcrafted dot mandalas and traditional Lippan mirror wall hangings created with devotion and precision.',
    keywords: 'dot mandala, lippan art, wall hangings, spiritual art, handmade home decor',
  },
};

export const INITIAL_PAGES: WebsitePage[] = [
  {
    id: 'page-home',
    slug: 'home',
    title: 'Home',
    seo_title: 'Dot And Art — Handcrafted Mandala & Lippan Mud Mirror Art Studio',
    meta_description: 'Discover authentic handmade sacred dot mandala paintings and traditional Kutch Lippan mud-mirror art handcrafted by artist Shital Thosar.',
    status: 'published',
    sections: [
      {
        id: 'sec-home-hero',
        page_id: 'page-home',
        section_type: 'hero',
        section_key: 'hero_main',
        content_json: {
          badge_text: 'HANDMADE SACRED MANDALAS & LIPPAN ART',
          headline: 'Harmonious Geometry & Handcrafted Devotion for Your Sacred Space',
          subtitle: 'Every dot is painted by hand with reverence, patience, and meditative precision. Explore bespoke mandalas, Lippan mud-mirror art, and personalized photo creations.',
          cta_primary_text: 'Explore Art Collection',
          cta_secondary_text: 'Commission Custom Piece',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'sec-home-philosophy',
        page_id: 'page-home',
        section_type: 'feature',
        section_key: 'craft_philosophy',
        content_json: {
          title: 'The Art of Patience & Meditation',
          subtitle: 'A Sacred Practice in Every Circle',
          body: 'Mandala art is more than visual beauty—it is a spiritual sanctuary. From individual acrylic dots to traditional clay mirrorwork, each creation radiates serenity, balance, and positive energy into your home.',
          feature_1: '100% Handcrafted by Artist Shital Thosar',
          feature_2: 'Vibrant Premium Pigments & Protective Varnish',
          feature_3: 'Worldwide Shockproof Wooden Packaging',
        },
        display_order: 2,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'sec-home-custom-cta',
        page_id: 'page-home',
        section_type: 'cta',
        section_key: 'custom_banner',
        content_json: {
          title: 'Desire a Custom Diameter or Color Scheme?',
          subtitle: 'We collaborate directly with art collectors, interior designers, and home owners to paint bespoke mandalas tailored to your wall dimensions and sacred intentions.',
          button_text: 'Request Custom Commission',
        },
        display_order: 3,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-shop',
    slug: 'shop',
    title: 'Catalog',
    seo_title: 'Shop Handcrafted Mandalas & Lippan Wall Hangings — Dot And Art',
    meta_description: 'Browse our complete catalog of authentic handmade dot mandala wall hangings, Lippan mud-mirror art, and sacred decor.',
    status: 'published',
    sections: [
      {
        id: 'sec-shop-header',
        page_id: 'page-shop',
        section_type: 'header',
        section_key: 'catalog_header',
        content_json: {
          badge: 'AUTHENTIC HANDMADE COLLECTION',
          title: 'Artisan Artwork Catalog',
          description: 'Browse our complete range of ready-to-dispatch and made-to-order sacred mandalas, Lippan mud-mirror wall hangings, and custom photo mandalas.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-custom',
    slug: 'custom-order',
    title: 'Bespoke Orders',
    seo_title: 'Commission a Custom Mandala or Lippan Artwork — Dot And Art',
    meta_description: 'Order personalized photo mandalas, custom diameters, and bespoke color schemes painted specifically for your space.',
    status: 'published',
    sections: [
      {
        id: 'sec-custom-header',
        page_id: 'page-custom',
        section_type: 'header',
        section_key: 'custom_header',
        content_json: {
          badge: 'BESPOKE ART COMMISSIONS',
          title: 'Custom Order Studio',
          description: 'Have a specific room size, color scheme, or sacred intention? Collaborate directly with artist Shital Thosar to create a one-of-a-kind mandala.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'sec-custom-process',
        page_id: 'page-custom',
        section_type: 'process',
        section_key: 'commission_process',
        content_json: {
          step_1: 'Share Your Vision — Choose your diameter, colors, or central photo.',
          step_2: 'Artisan Crafting — Shital hand-paints each dot with precision and care.',
          step_3: 'Safe Delivery — Secure shockproof wooden packaging delivered to your door.',
        },
        display_order: 2,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-gallery',
    slug: 'gallery',
    title: 'Gallery',
    seo_title: 'High-Definition Artwork Gallery — Dot And Art',
    meta_description: 'Explore a high-definition visual archive of handmade mandalas and Kutch Lippan mud-mirror artwork.',
    status: 'published',
    sections: [
      {
        id: 'sec-gallery-header',
        page_id: 'page-gallery',
        section_type: 'header',
        section_key: 'gallery_header',
        content_json: {
          badge: 'COLLECTOR SHOWCASE',
          title: 'The Artwork Gallery',
          description: 'High-definition visual archive of our handmade mandalas and Kutch Lippan mud-mirror pieces. Click any artwork to view details or enquire.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-about',
    slug: 'about',
    title: 'About Artist',
    seo_title: 'About Shital Thosar — Artist & Founder, DotAndArt',
    meta_description: 'Meet Shital Thosar, the artist and creator behind DotAndArt. Discover her journey of handmade dot mandalas and Lippan mirror art.',
    status: 'published',
    sections: [
      {
        id: 'sec-about-hero',
        page_id: 'page-about',
        section_type: 'hero',
        section_key: 'artist_hero',
        content_json: {
          badge: 'ARTIST PHILOSOPHY',
          title: 'The Heart & Hands Behind DotAndArt',
          subtitle: 'Handcrafted dot mandalas and Lippan mirror creations born out of love, patterns, and meditative calm.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'sec-about-bio',
        page_id: 'page-about',
        section_type: 'bio',
        section_key: 'artist_story',
        content_json: {
          artist_name: 'Shital Thosar',
          paragraph_1: 'Hi, I’m Shital Thosar, the artist and creator behind DotAndArt.',
          paragraph_2: 'What started as a love for colours, patterns and the simple joy of creating with my hands slowly grew into something much more meaningful—my own art journey.',
          paragraph_3: 'I found myself drawn to Dot Mandala Art, where tiny dots come together to create intricate patterns, balance and harmony. For me, mandala is not just about creating something beautiful. It is a process of slowing down, being present and finding a little calm in the middle of everyday life.',
          paragraph_4: 'With time, my art has evolved into a blend of traditional mandala patterns, contemporary colours and Indian artistic influences. I enjoy experimenting with colours, textures and different forms while keeping the handmade character of every piece alive.',
          paragraph_5: 'Every DotAndArt creation is painted by hand, one dot and one detail at a time. Whether it is a personalised photo mandala, a festive piece, a wall artwork or a custom creation, I put a little piece of my creativity and love into each one.',
          paragraph_6: 'Today, DotAndArt is not just about selling handmade art. It is about creating meaningful pieces that become part of someone\'s home, celebrations and memories.',
          closing_signature: 'Thank you for being a part of my creative journey.\nWith love,\nShital\nArtist & Founder, DotAndArt',
        },
        display_order: 2,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-contact',
    slug: 'contact',
    title: 'Contact',
    seo_title: 'Contact Dot And Art Studio — Shital Thosar',
    meta_description: 'Get in touch with Dot And Art studio for custom commission enquiries, bulk orders, and interior design collaborations.',
    status: 'published',
    sections: [
      {
        id: 'sec-contact-header',
        page_id: 'page-contact',
        section_type: 'header',
        section_key: 'contact_header',
        content_json: {
          badge: 'GET IN TOUCH',
          title: 'Contact Dot And Art Studio',
          description: 'We welcome custom commission enquiries, bulk orders, and interior design collaborations.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-shipping-policy',
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    seo_title: 'Shipping & Delivery Policy — Dot And Art',
    meta_description: 'Learn about our worldwide shipping, shockproof wooden packaging, creation lead times, and courier tracking.',
    status: 'published',
    sections: [
      {
        id: 'sec-shipping-content',
        page_id: 'page-shipping-policy',
        section_type: 'legal',
        section_key: 'shipping_info',
        content_json: {
          title: 'Shipping & Delivery Policy',
          summary: 'We ship handcrafted mandalas and Lippan artworks across India and internationally with shockproof wooden and bubble crating.',
          creation_time: 'Ready items dispatch in 2-3 days; custom pieces take 10-18 business days depending on diameter.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-refund-policy',
    slug: 'refund-policy',
    title: 'Refund Policy',
    seo_title: 'Cancellation & Refund Policy — Dot And Art',
    meta_description: 'Read our cancellation and refund terms for handcrafted artworks and custom commissions.',
    status: 'published',
    sections: [
      {
        id: 'sec-refund-content',
        page_id: 'page-refund-policy',
        section_type: 'legal',
        section_key: 'refund_info',
        content_json: {
          title: 'Cancellation & Refund Policy',
          summary: 'Due to the unique handmade nature of each piece, orders can be cancelled within 24 hours of placement. 50% advance payments for custom orders are non-refundable once painting begins.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-terms-conditions',
    slug: 'terms-conditions',
    title: 'Terms & Conditions',
    seo_title: 'Terms & Conditions — Dot And Art',
    meta_description: 'Read the official terms and conditions for purchasing artwork and placing custom orders with Dot And Art.',
    status: 'published',
    sections: [
      {
        id: 'sec-terms-content',
        page_id: 'page-terms-conditions',
        section_type: 'legal',
        section_key: 'terms_info',
        content_json: {
          title: 'Terms & Conditions',
          summary: 'By accessing dotandart.in or ordering handcrafted pieces, you agree to our studio terms regarding handmade variations, payments, and copyright.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'page-privacy-policy',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    seo_title: 'Privacy Policy — Dot And Art',
    meta_description: 'Learn how Dot And Art collects, protects, and uses customer contact details for custom order delivery.',
    status: 'published',
    sections: [
      {
        id: 'sec-privacy-content',
        page_id: 'page-privacy-policy',
        section_type: 'legal',
        section_key: 'privacy_info',
        content_json: {
          title: 'Privacy Policy',
          summary: 'We respect your privacy. Contact details provided for custom order inquiries and WhatsApp delivery updates are strictly used for fulfilling your order.',
        },
        display_order: 1,
        is_visible: true,
        created_at: new Date('2025-01-01').toISOString(),
        updated_at: new Date('2025-01-01').toISOString(),
      },
    ],
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
];

