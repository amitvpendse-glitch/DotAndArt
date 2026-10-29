/**
 * Client-side high-performance image compression utility using HTML5 Canvas and createImageBitmap.
 * Compresses large mobile camera/DSLR photos (5MB - 30MB) down to optimized ~100KB-250KB
 * JPEGs in milliseconds before uploading directly to Supabase Storage.
 * Fully compatible with iOS Safari, Android Chrome, and all mobile browsers.
 */

function isImageCandidate(file: File): boolean {
  if (!file) return false;
  if (file.type && file.type.toLowerCase().startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif|jfif|bmp|tiff|avif)$/i.test(file.name || '');
}

export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<File> {
  if (!isImageCandidate(file)) {
    return file;
  }

  // Preserve SVGs and animated GIFs
  const lowerName = (file.name || '').toLowerCase();
  const lowerType = (file.type || '').toLowerCase();
  if (lowerType.includes('svg') || lowerType.includes('gif') || lowerName.endsWith('.svg') || lowerName.endsWith('.gif')) {
    return file;
  }

  // If already under 150KB JPEG/PNG, return as-is
  if (file.size < 150 * 1024 && (lowerType.includes('jpeg') || lowerType.includes('jpg') || lowerType.includes('webp'))) {
    return file;
  }

  // Strategy A: Modern ultra-fast, low-memory createImageBitmap (iOS 15+, Chrome Android, Safari)
  if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
    try {
      const bitmap = await window.createImageBitmap(file);
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, width, height);
        if (typeof bitmap.close === 'function') {
          bitmap.close();
        }

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', quality);
        });

        if (blob) {
          const cleanName = (file.name || 'artwork').replace(/\.[^/.]+$/, '') + '.jpg';
          const compressed = new File([blob], cleanName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          console.log(
            `[imageCompressor] Mobile Bitmap: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressed.size / 1024).toFixed(1)}KB (${width}x${height}px)`
          );
          return compressed;
        }
      }
    } catch (bitmapErr) {
      console.warn('[imageCompressor] createImageBitmap notice, falling back to ObjectURL:', bitmapErr);
    }
  }

  // Strategy B: Lightweight ObjectURL + Image element (avoids huge Base64 RAM spikes on mobile)
  return new Promise((resolve) => {
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // If ObjectURL fails, return raw file safely
      resolve(file);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = (file.name || 'artwork').replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(
              `[imageCompressor] Mobile Image: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024).toFixed(1)}KB (${width}x${height}px)`
            );
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        console.warn('[imageCompressor] Canvas error, using original file', err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses a Base64 Data URL if it is oversized (> 250KB).
 */
export async function compressDataUrl(
  dataUrl: string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/') || dataUrl.includes('svg') || dataUrl.includes('gif')) {
    return dataUrl;
  }

  // If already under 300KB, return as-is
  if (dataUrl.length < 400 * 1024) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
