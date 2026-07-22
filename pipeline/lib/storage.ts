import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Image object storage — keeps binaries OUT of git (they scale to ~1GB/yr at
 * this content velocity). Generic S3-compatible, so the same code targets:
 *   - Cloudflare R2   (recommended: free 10GB, zero egress, no server)
 *   - MinIO on Railway (S3 API on a volume; put a CDN in front)
 *   - AWS S3 / Backblaze B2 / any S3 endpoint
 *
 * Config (env, see pipeline/.env.example):
 *   S3_ENDPOINT           e.g. https://<acct>.r2.cloudflarestorage.com
 *   S3_REGION             "auto" for R2
 *   S3_ACCESS_KEY_ID
 *   S3_SECRET_ACCESS_KEY
 *   S3_BUCKET
 *   S3_PUBLIC_BASE_URL    public/CDN base the site links to, e.g. https://cdn.abcabinet.us
 */

export function isConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET &&
      process.env.S3_PUBLIC_BASE_URL,
  );
}

let _s3: S3Client | null = null;
function s3(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _s3;
}

/**
 * Upload image bytes under `key` (e.g. "blog/<slug>-hero.png").
 * Returns the public URL the MDX frontmatter will reference.
 */
export async function uploadImage(
  key: string,
  bytes: Buffer,
  contentType = 'image/png',
): Promise<string> {
  await s3().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  const base = process.env.S3_PUBLIC_BASE_URL!.replace(/\/$/, '');
  return `${base}/${key}`;
}
