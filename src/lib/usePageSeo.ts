import { useState, useEffect } from 'react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from './firebase';
import { WebsitePage } from '../types';
import { PAGES_COLLECTION } from './firestoreCatalog';
import { INITIAL_PAGES } from '../data/initialCatalog';

function getInitialPage(slug: string): WebsitePage | null {
  try {
    const custom = typeof window !== 'undefined' ? localStorage.getItem('app_custom_pages') : null;
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed)) {
        const found = parsed.find((p: WebsitePage) => p.slug === slug);
        if (found) return found;
      }
    }
  } catch {}
  return INITIAL_PAGES.find((p) => p.slug === slug) || null;
}

export function usePageSeo(slug: string, defaultTitle: string, defaultDesc?: string) {
  const [page, setPage] = useState<WebsitePage | null>(() => getInitialPage(slug));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getInitialPage(slug);
    if (cached) {
      setPage(cached);
    }

    const colRef = collection(db, PAGES_COLLECTION);
    
    // Real-time listener
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: WebsitePage[] = [];
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          data.push(doc.data() as WebsitePage);
        }
      });
      
      const found = data.find((p) => p.slug === slug);
      if (found) {
        setPage(found);
        try {
          const custom = localStorage.getItem('app_custom_pages');
          let pagesArr: WebsitePage[] = custom ? JSON.parse(custom) : [];
          if (!Array.isArray(pagesArr)) pagesArr = [];
          const idx = pagesArr.findIndex((p) => p.slug === slug);
          if (idx >= 0) {
            pagesArr[idx] = found;
          } else {
            pagesArr.push(found);
          }
          localStorage.setItem('app_custom_pages', JSON.stringify(pagesArr));
        } catch {}

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

    const handlePagesUpdated = () => {
      const refreshed = getInitialPage(slug);
      if (refreshed) {
        setPage(refreshed);
      }
    };

    window.addEventListener('app_pages_updated', handlePagesUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('app_pages_updated', handlePagesUpdated);
    };
  }, [slug, defaultTitle]);

  return { page, loading };
}
