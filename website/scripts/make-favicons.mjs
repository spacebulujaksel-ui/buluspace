import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public', 'favicon.png');
const outDir = path.join(root, 'public');

const targets = [
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon.png', size: 192 },
  { file: 'favicon-192.png', size: 192 },
  { file: 'apple-touch-icon.png', size: 180 },
];

const srcBuf = await sharp(src).png().toBuffer();

for (const { file, size } of targets) {
  await sharp(srcBuf)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png({ quality: 90 })
    .toFile(path.join(outDir, file));
  console.log(`${file} -> ${size}px`);
}