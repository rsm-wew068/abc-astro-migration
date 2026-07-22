import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections. Source of truth is Airtable; the B2 sync script
 * (Phase 1) materializes rows into these MDX files under src/content/**.
 * Frontmatter here mirrors the Framer CMS fields so the sync maps 1:1.
 */

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.string().optional(),
      intro: z.string(),
      // Local asset (dev/seed) OR a remote object-storage URL (prod pipeline).
      heroImage: z.union([image(), z.string().url()]).optional(),
      coverImage: z.union([image(), z.string().url()]).optional(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // Structured FAQ → drives FAQPage JSON-LD automatically (§4/§5).
      faq: z
        .array(z.object({ q: z.string(), a: z.string() }))
        .optional()
        .default([]),
    }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portfolio' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.string().optional(),
      summary: z.string(),
      thumbnail: image().optional(),
      // Ordered gallery images for the case study + ImageObject schema.
      photos: z.array(image()).optional().default([]),
      publishDate: z.coerce.date().optional(),
    }),
});

export const collections = { blog, portfolio };
