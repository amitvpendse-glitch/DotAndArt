import { getFirestoreProducts } from '../lib/firestoreCatalog';

async function fetchAndLogProducts() {
  const products = await getFirestoreProducts(true);
  console.log(JSON.stringify(products.map(p => ({ id: p.id, sku: p.sku })), null, 2));
}

fetchAndLogProducts();
