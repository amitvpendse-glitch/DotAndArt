import { collection, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

async function clearProducts() {
  console.log("Clearing products collection...");
  const colRef = collection(db, 'products');
  const snap = await getDocs(colRef);
  
  const batch = writeBatch(db);
  let count = 0;
  snap.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });
  
  await batch.commit();
  console.log(`Deleted ${count} products.`);
}

clearProducts().catch(console.error);
