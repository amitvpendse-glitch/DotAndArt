/**
 * Image Preloader Utility for ultra-fast artwork image rendering.
 * Pre-decodes artwork images into the browser GPU/memory cache.
 */

const preloadedUrls = new Set<string>();

export function preloadImage(url: string): Promise<void> {
  if (!url || preloadedUrls.has(url)) {
    return Promise.resolve();
  }

  preloadedUrls.add(url);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.decoding = 'async';
    if (typeof img.decode === 'function') {
      img
        .decode()
        .then(() => resolve())
        .catch(() => resolve());
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}

export function preloadImages(urls: (string | undefined)[]): void {
  const validUrls = urls.filter((url): url is string => Boolean(url && !preloadedUrls.has(url)));
  validUrls.forEach((url) => {
    preloadImage(url);
  });
}
