import type { ImageMetadata } from 'astro';

/**
 * Resolves an event image filename (stored in src/data/events.json) to the
 * optimized asset in src/assets/events/. Using import.meta.glob lets the
 * data-driven events still flow through astro:assets (responsive AVIF/WebP).
 *
 * When migrating to R2: replace this resolver with one that returns R2 URLs,
 * and upload src/assets/events/ to the bucket — the call sites don't change.
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/events/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  byName.set(path.split('/').pop()!, mod.default);
}

export function eventImage(filename: string | undefined): ImageMetadata | undefined {
  return filename ? byName.get(filename) : undefined;
}
