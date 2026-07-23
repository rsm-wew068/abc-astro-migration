/**
 * R2 media base. Public bucket URL (not a secret) — safe to commit. CMS + blog
 * images live in R2; `media()` builds their public URLs. Astro optimizes these
 * remote images at build (r2.dev host allow-listed in astro.config), so visitors
 * get optimized copies from the Pages CDN, not r2.dev directly.
 *
 * To move to a custom domain later, change R2_PUBLIC to https://cdn.abcabinet.us.
 */
export const R2_PUBLIC = 'https://pub-1665e0cd31a4447aaef1030063a757ff.r2.dev';

export function media(collection: string, filename: string | undefined): string | undefined {
  return filename ? `${R2_PUBLIC}/${collection}/${filename}` : undefined;
}
