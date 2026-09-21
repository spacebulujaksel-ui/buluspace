import { readdir, stat, rename } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DIR = fileURLToPath(new URL('../public/asset/img/', import.meta.url));
const MAX_JPG_WIDTH = 1600;
const MAX_PNG_WIDTH = 900;

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const fmt = (ext) => ({ '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png' }[ext] ?? null);

for (const file of await readdir(DIR)) {
  const ext = extname(file).toLowerCase();
  const format = fmt(ext);
  if (!format) continue;

  const path = join(DIR, file);
  const before = (await stat(path)).size;
  if (before < 20_000) {
    console.log(`skip ${file} (${kb(before)})`);
    continue;
  }

  const image = sharp(path).rotate();
  const meta = await image.metadata();
  const maxWidth = format === 'png' ? MAX_PNG_WIDTH : MAX_JPG_WIDTH;
  if ((meta.width ?? 0) > maxWidth) image.resize({ width: maxWidth });

  if (format === 'png') {
    image.png({ palette: true, quality: 85, compressionLevel: 9 });
  } else {
    image.jpeg({ quality: 80, mozjpeg: true });
  }

  const tmp = `${path}.tmp`;
  await image.toFile(tmp);
  await rename(tmp, path);
  const after = (await stat(path)).size;
  console.log(`${basename(file)}: ${kb(before)} -> ${kb(after)} (${Math.round((1 - after / before) * 100)}% ↓)`);
}