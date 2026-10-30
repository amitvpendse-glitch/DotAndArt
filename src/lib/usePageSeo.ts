import { useState, useEffect } from 'react';
import { WebsitePage } from '../types';
import { INITIAL_PAGES } from '../data/initialCatalog';
import { safeFetchJson } from './safeFetch';

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
      if (cached.seo_title) {
        document.title = cached.seo_title;
      } else if (defaultTitle) {
        document.title = defaultTitle;
      }
    }

    async function fetchPageSeo() {
      try {
        const pages = await safeFetchJson<WebsitePage[]>('/api/pages', undefined, []);
        if (Array.isArray(pages)) {
          const found = pages.find((p) => p.slug === slug);
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
          }
        }
      } catch (err) {
        console.warn('SEO fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPageSeo();

    const handlePagesUpdated = () => {
      fetchPageSeo();
    };

    window.addEventListener('app_pages_updated', handlePagesUpdated);

    return () => {
      window.removeEventListener('app_pages_updated', handlePagesUpdated);
    };
  }, [slug, defaultTitle]);

  return { page, loading };
}
