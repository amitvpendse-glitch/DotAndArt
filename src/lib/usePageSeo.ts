import { useState, useEffect } from 'react';
import { safeFetchJson } from './safeFetch';
import { WebsitePage } from '../types';

export function usePageSeo(slug: string, defaultTitle: string, defaultDesc?: string) {
  const [page, setPage] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPage = () => {
      safeFetchJson<WebsitePage | null>(`/api/pages/${slug}`, undefined, null)
        .then((data) => {
          if (isMounted) {
            if (data) {
              setPage(data);
              if (data.seo_title) {
                document.title = data.seo_title;
              } else if (defaultTitle) {
                document.title = defaultTitle;
              }
              if (data.meta_description) {
                let metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                  metaDesc = document.createElement('meta');
                  metaDesc.setAttribute('name', 'description');
                  document.head.appendChild(metaDesc);
                }
                metaDesc.setAttribute('content', data.meta_description);
              }
            } else if (defaultTitle) {
              document.title = defaultTitle;
            }
          }
        })
        .catch(() => {
          if (isMounted && defaultTitle) {
            document.title = defaultTitle;
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchPage();

    const handlePageUpdate = () => {
      fetchPage();
    };

    window.addEventListener('app_pages_updated', handlePageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('app_pages_updated', handlePageUpdate);
    };
  }, [slug, defaultTitle]);

  return { page, loading };
}
