import type { ImageMetadata } from 'astro';

/**
 * Filename → optimized image resolvers for the CMS collections whose images
 * live in src/assets/<collection>/. Data JSON stores bare filenames; these map
 * them through astro:assets. To migrate a collection to R2 later, swap the
 * matching resolver to return R2 URLs — call sites don't change.
 */
function resolver(glob: Record<string, { default: ImageMetadata }>) {
  const byName = new Map<string, ImageMetadata>();
  for (const [path, mod] of Object.entries(glob)) {
    byName.set(path.split('/').pop()!, mod.default);
  }
  return (filename: string | undefined): ImageMetadata | undefined =>
    filename ? byName.get(filename) : undefined;
}

export const galleryImage = resolver(
  import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,webp,avif}', { eager: true }),
);
export const colorsImage = resolver(
  import.meta.glob('../assets/colors/*.{png,jpg,jpeg,webp,avif}', { eager: true }),
);
export const finishesImage = resolver(
  import.meta.glob('../assets/finishes/*.{png,jpg,jpeg,webp,avif}', { eager: true }),
);
