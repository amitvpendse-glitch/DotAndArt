
import fs from 'fs';
import path from 'path';

const DB_FILE = 'db.json';
const IMAGES_DIR = 'public/static/assets/images';

function fixImages() {
  if (!fs.existsSync(DB_FILE)) {
    console.error('db.json not found');
    return;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const files = fs.readdirSync(IMAGES_DIR);

  db.products.forEach((prod: any) => {
    prod.images.forEach((img: any) => {
      if (img.storage_path && img.storage_path.includes('/uploads/')) {
        const filename = path.basename(img.storage_path);
        if (files.includes(filename)) {
          img.storage_path = `/static/assets/images/${filename}`;
        }
      }
    });
  });

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log('Fixed image paths in db.json');
}

fixImages();
