import { z } from 'zod';

/**
 * Structured-output schemas for the AIGC content pipeline.
 * The generated article maps 1:1 onto the Astro `blog` content collection
 * (src/content.config.ts) so the MDX writer is a pure projection.
 *
 * NB: JSON-schema structured outputs don't support min/maxLength — length
 * limits (meta description ≤ 160 chars, etc.) are enforced in the prompt and
 * re-checked in code, not in the schema.
 */

export const SectionSchema = z.object({
  heading: z.string().describe('Section H2 heading, specific and descriptive'),
  body: z
    .string()
    .describe('1–3 paragraphs of Markdown prose for this section'),
});

export const FaqSchema = z.object({
  q: z.string().describe('A real question a Bay Area buyer would ask'),
  a: z.string().describe('A concise, specific answer (2–4 sentences)'),
});

export const ArticleSchema = z.object({
  title: z.string().describe('SEO title, 50–65 characters, no clickbait'),
  slug: z
    .string()
    .describe('URL slug in kebab-case, derived from the title, no stop-word padding'),
  category: z
    .string()
    .describe('One of: Buying Guide, Kitchen Design, Manufacturing, Cabinet Features, Materials & Finishes, Trade & Builders'),
  metaDescription: z
    .string()
    .describe('Meta description under 160 characters, compelling and specific'),
  intro: z
    .string()
    .describe('Opening paragraph that states the value and names the Bay Area service area naturally'),
  sections: z
    .array(SectionSchema)
    .describe('3–5 body sections, each with a distinct angle — vary structure between posts'),
  faq: z
    .array(FaqSchema)
    .describe('4–6 FAQ pairs → drives FAQPage schema. Must be genuinely useful, not padding.'),
  heroImagePrompt: z
    .string()
    .describe('Photoreal image prompt for the hero: a real-looking cabinetry/kitchen scene relevant to the topic. No text, no logos, no watermarks.'),
  coverImagePrompt: z
    .string()
    .describe('Photoreal image prompt for the listing cover thumbnail, complementary to the hero.'),
  heroAlt: z.string().describe('Descriptive, keyword-aware alt text for the hero image'),
  coverAlt: z.string().describe('Descriptive alt text for the cover image'),
});

export type Article = z.infer<typeof ArticleSchema>;

export const CritiqueSchema = z.object({
  score: z.number().describe('Overall quality score 0–100'),
  pass: z.boolean().describe('True if the draft meets the bar and needs no revision'),
  issues: z
    .array(
      z.object({
        severity: z.string().describe('high | medium | low'),
        note: z.string().describe('Specific, actionable problem'),
      }),
    )
    .describe('Concrete problems, most severe first. Empty if the draft is strong.'),
  revisionGuidance: z
    .string()
    .describe('If not passing, precise instructions for the reviser. Empty if passing.'),
});

export type Critique = z.infer<typeof CritiqueSchema>;
