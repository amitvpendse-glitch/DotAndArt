import { getFirestoreProducts, bulkImportFirestoreProducts } from '../src/lib/firestoreCatalog';
import dbData from '../data/db.json';
import { Product } from '../src/types';

async function main() {
  const products = dbData.products as Product[];
  console.log(`Products in db.json: ${products.length}`);
  
  const currentProducts = await getFirestoreProducts(true);
  console.log(`Products in Firestore: ${currentProducts.length}`);

  if (currentProducts.length === 174) {
    console.log("Firestore already has 174 products. No sync needed.");
    return;
  }

  // If not 174, let's sync.
  // The user said "the database has now exactly 174 product entries".
  // Let's assume db.json is the source of truth for these 174.
  
  console.log(`Syncing ${products.length} products to Firestore...`);
  const count = await bulkImportFirestoreProducts(products);
  console.log(`Imported ${count} products.`);
  
  const finalProducts = await getFirestoreProducts(true);
  console.log(`New total in Firestore: ${finalProducts.length}`);
}

main().catch(console.error);
