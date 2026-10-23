import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { WebsitePage } from '../types';
import { PAGES_COLLECTION } from './firestoreCatalog';

export function usePageSeo(slug: string, defaultTitle: string, defaultDesc?: string) {
  const [page, setPage] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, PAGES_COLLECTION);
    
    // Real-time listener
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: WebsitePage[] = [];
      snapshot.forEach((doc) => data.push(doc.data() as WebsitePage));
      
      const found = data.find((p) => p.slug === slug);
      if (found) {
        setPage(found);
        if (found.seo_title) {
          document.title = found.seo_title;
        } else if (defaultTitle) {
          document.title = defaultTitle;
        }
        if (found.meta_description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', found.meta_description);
        }
      } else if (defaultTitle) {
        document.title = defaultTitle;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug, defaultTitle]);

  return { page, loading };
}
