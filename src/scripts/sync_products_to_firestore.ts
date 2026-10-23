import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { INITIAL_PRODUCTS } from '../data/initialCatalog';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

async function syncProducts() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  const auth = getAuth(app);

  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
      },
      operationType,
      path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  console.log('Starting product sync...');

  const productsCollection = collection(db, 'products');
  let snapshot;
  try {
    snapshot = await getDocs(productsCollection);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
  }
  
  const existingProducts = new Map(snapshot.docs.map(doc => [doc.id, doc.data()]));
  const initialProductMap = new Map(INITIAL_PRODUCTS.map(p => [p.id, p]));

  console.log(`Found ${existingProducts.size} existing products in Firestore.`);
  console.log(`Expected ${initialProductMap.size} products from catalog.`);

  let addedCount = 0;
  let updatedCount = 0;
  let deletedCount = 0;

  // Add or Update
  for (const [id, product] of initialProductMap) {
    if (!existingProducts.has(id)) {
      console.log(`Adding product: ${id}`);
      try {
        await setDoc(doc(db, 'products', id), product);
        addedCount++;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `products/${id}`);
      }
    } else {
      console.log(`Updating product: ${id}`);
      try {
        await setDoc(doc(db, 'products', id), product); // Using setDoc for full overwrite
        updatedCount++;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      }
    }
  }

  // Delete
  for (const [id] of existingProducts) {
    if (!initialProductMap.has(id)) {
      console.log(`Deleting obsolete product: ${id}`);
      try {
        await deleteDoc(doc(db, 'products', id));
        deletedCount++;
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  }

  console.log(`Finished sync. Added ${addedCount}, Updated ${updatedCount}, Deleted ${deletedCount} products.`);
}

syncProducts().catch(console.error);
