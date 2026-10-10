import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = 'public/static/assets/images';
const map = {};
fs.readdirSync(dir).forEach(f => {
  if (!f.endsWith('.jpg')) return;
  const content = fs.readFileSync(path.join(dir, f));
  const hash = crypto.createHash('md5').update(content).digest('hex');
  if (!map[hash]) map[hash] = [];
  map[hash].push(f);
});
Object.entries(map).forEach(([hash, files]) => {
  console.log('Hash ' + hash + ': ' + files.length + ' files -> ' + files.join(', '));
});
