/**
 * One-time: upload all CMS + blog + portfolio images to R2 under
 * <collection>/<filename> keys. Run with:
 *   npx tsx --env-file-if-exists=pipeline/.env pipeline/upload-assets.ts
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});
const bucket = process.env.S3_BUCKET!;
const ct = (f: string) =>
  f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
const IMG = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

async function uploadDir(dir: string, prefix: string): Promise<number> {
  let n = 0;
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return 0;
  }
  for (const f of files) {
    if (!IMG.some((e) => f.toLowerCase().endsWith(e))) continue;
    const body = await readFile(path.join(dir, f));
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `${prefix}/${f}`,
        Body: body,
        ContentType: ct(f),
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    n++;
  }
  return n;
}

const targets: [string, string][] = [
  ['src/assets/events', 'events'],
  ['src/assets/gallery', 'gallery'],
  ['src/assets/colors', 'colors'],
  ['src/assets/finishes', 'finishes'],
  ['src/assets/colors-finishes', 'colors-finishes'],
  ['src/content/blog', 'blog'],
  ['src/content/portfolio', 'portfolio'],
];

let total = 0;
for (const [dir, prefix] of targets) {
  const n = await uploadDir(dir, prefix);
  total += n;
  console.log(`  ${prefix.padEnd(16)} ${n}`);
}
console.log(`\nUploaded ${total} images to R2 bucket "${bucket}".`);
