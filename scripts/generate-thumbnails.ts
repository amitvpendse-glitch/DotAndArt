import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve(process.cwd(), 'public/static/assets/images');
const THUMBNAILS_DIR = path.resolve(process.cwd(), 'public/static/assets/thumbnails');

async function generateThumbnails() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('[Thumbnails] Images directory does not exist:', IMAGES_DIR);
    return;
  }

  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }

  const files = fs.readdirSync(IMAGES_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`[Thumbnails] Found ${files.length} images to process...`);

  let count = 0;
  for (const file of files) {
    const srcPath = path.join(IMAGES_DIR, file);
    const destPath = path.join(THUMBNAILS_DIR, file);

    // Skip if thumbnail exists and is newer than source
    if (fs.existsSync(destPath)) {
      const srcStat = fs.statSync(srcPath);
      const destStat = fs.statSync(destPath);
      if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size > 0) {
        continue;
      }
    }

    try {
      await sharp(srcPath)
        .resize(480, 480, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, progressive: true })
        .toFile(destPath);
      count++;
    } catch (err) {
      console.error(`[Thumbnails] Error generating thumbnail for ${file}:`, err);
    }
  }

  console.log(`[Thumbnails] Successfully generated/verified ${count} thumbnails in ${THUMBNAILS_DIR}`);
}

generateThumbnails();
