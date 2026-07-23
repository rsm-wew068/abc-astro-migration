import type { ImageMetadata } from 'astro';

/**
 * Resolve an image field (local ImageMetadata or a remote URL string) to a
 * plain URL, for JSON-LD, OG tags, and anywhere a raw string is needed.
 */
export function imageUrl(
  src: ImageMetadata | string | undefined,
): string | undefined {
  if (!src) return undefined;
  return typeof src === 'string' ? src : src.src;
}
