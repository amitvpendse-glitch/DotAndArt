import { saveFirestoreProduct } from '../src/lib/firestoreCatalog';
import { Product } from '../src/types';

async function main() {
  const newProduct: Product = {
    id: 'prod-da-md-10-0001',
    sku: 'DA-MD-10-0001',
    name: 'Mandala Wall Hanging',
    description: 'Circular hand-painted dot mandala',
    category_id: 'cat-mandala',
    category_name: 'Mandala Wall Hangings',
    category_slug: 'mandala-wall-hangings',
    material: 'Moisture-resistant MDF board, Acrylic Paints, Mirrors, Spray Varnish, Hanging Hooks',
    framing: 'Ready to hang',
    customizable: false,
    creation_time: '1-3 Days',
    shipping_info: 'Worldwide shipping available',
    featured: false,
    is_published: true,
    is_available: true,
    base_price: 650,
    base_size: '10 Inches',
    images: [
      {
        id: 'img-prod-da-md-10-0001-1',
        product_id: 'prod-da-md-10-0001',
        storage_path: '/assets/aistudio/image_74a718ce.png',
        alt_text: 'Mandala Wall Hanging',
        caption: 'Mandala Wall Hanging',
        display_order: 1,
        is_primary: true,
      }
    ],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log('Saving product:', newProduct.sku);
  await saveFirestoreProduct(newProduct);
  console.log('Product saved!');
}

main().catch(console.error);
