import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';

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

// Google coba /favicon.ico dulu; tulis ICO berisi PNG (Google butuh >= 48px).
const icoSizes = [48, 32];
const pngs = [];
for (const size of icoSizes) {
  pngs.push(await sharp(srcBuf).resize(size, size, { fit: 'cover', position: 'center' }).png().toBuffer());
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const entries = [];
pngs.forEach((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 0);
  e.writeUInt8(icoSizes[i] === 256 ? 0 : icoSizes[i], 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  entries.push(e);
});
await writeFile(path.join(outDir, 'favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));
console.log('favicon.ico -> ' + icoSizes.join('+') + 'px');