const fs = require('fs');
const path = require('path');

const imagesDir = path.join(process.cwd(), 'public', 'static', 'assets', 'images');
const sourceImage = path.join(imagesDir, 'DA-MD-10-0001.jpg');

if (!fs.existsSync(sourceImage)) {
  console.error('Source image DA-MD-10-0001.jpg not found!');
  process.exit(1);
}

const sourceBuffer = fs.readFileSync(sourceImage);

const prefixes = [
  { prefix: 'DA-MD-10-', count: 9 },
  { prefix: 'DA-MD-12-', count: 19 },
  { prefix: 'DA-MD-15-', count: 10 },
  { prefix: 'DA-MD-18-', count: 10 },
  { prefix: 'DA-MD-24-', count: 2 },
  { prefix: 'DA-MD-30-', count: 1 },
  { prefix: 'DA-LP-LG-', count: 3 },
  { prefix: 'DA-LP-MD-', count: 3 },
  { prefix: 'DA-LP-SM-', count: 2 },
];

for (const group of prefixes) {
  for (let i = 1; i <= group.count; i++) {
    const filename = `${group.prefix}${String(i).padStart(4, '0')}.jpg`;
    const filePath = path.join(imagesDir, filename);
    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    if (!stats || stats.size === 0) {
      fs.writeFileSync(filePath, sourceBuffer);
      console.log(`Fixed/Created valid image: ${filename}`);
    } else {
      console.log(`OK: ${filename} (${stats.size} bytes)`);
    }
  }
}
console.log('All image files verified and repaired!');
