import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { ArticleSchema, CritiqueSchema, type Article, type Critique } from './schema';

/**
 * Claude text generation for the AIGC pipeline.
 *
 * Zero-arg client — resolves credentials from ANTHROPIC_API_KEY or an
 * `ant auth login` OAuth profile (see pipeline/README.md). Model is Opus 4.8
 * with adaptive thinking; structured outputs guarantee the shape.
 */
let _client: Anthropic | null = null;
/** Zero-arg client — resolves ANTHROPIC_API_KEY or an `ant` OAuth profile on first use. */
function client(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}
const MODEL = 'claude-opus-4-8';

const BRAND = `You write for American Built Cabinets (ABCabinet), a San Jose-based
custom cabinet manufacturer serving the Bay Area (San Jose, San Francisco, San Mateo).
They manufacture locally, serve homeowners and builders, and emphasize quality control,
fast ~3-week lead times, and warranty support. Voice: authoritative, practical, warm —
never hypey. Write for GEO/AI answer engines: specific, factual, well-structured, with
real depth. Avoid generic filler and near-duplicate boilerplate across posts.`;

/** Step A — generate a full structured article from a topic brief. */
export async function draftArticle(topic: string, category?: string): Promise<Article> {
  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: zodOutputFormat(ArticleSchema) },
    system: BRAND,
    messages: [
      {
        role: 'user',
        content: `Write a complete, original SEO/GEO blog article for this topic:

"${topic}"${category ? `\nCategory: ${category}` : ''}

Requirements:
- 3–5 body sections, each with a distinct, specific angle. Vary the structure — do NOT reuse a fixed template.
- Ground claims in cabinetry specifics (materials: plywood/MDF/solid wood; finishes; hardware like soft-close hinges, dovetail drawers, full-extension slides; RTA vs semi-custom vs custom; lead times).
- Reference the Bay Area service area naturally, not as keyword stuffing.
- 4–6 genuinely useful FAQ pairs.
- Meta description under 160 characters.
- Image prompts must be photoreal, brand-appropriate cabinetry/kitchen scenes with NO text, logos, or watermarks.`,
      },
    ],
  });
  if (!res.parsed_output) throw new Error('Draft: model returned no parseable output');
  return res.parsed_output;
}

/** Step B — adversarial critique against SEO/GEO + brand quality bar. */
export async function critique(article: Article): Promise<Critique> {
  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: zodOutputFormat(CritiqueSchema) },
    system: BRAND,
    messages: [
      {
        role: 'user',
        content: `Critically review this draft article as a demanding SEO/GEO editor.
Be adversarial: look for genericness, template sameness, thin or padded FAQ, keyword stuffing,
factual vagueness, weak meta description, or a title that won't earn clicks. Pass ONLY if it is
genuinely strong and differentiated.

Draft:
${JSON.stringify(article, null, 2)}`,
      },
    ],
  });
  if (!res.parsed_output) throw new Error('Critique: model returned no parseable output');
  return res.parsed_output;
}

/** Step C — revise the draft using the critique. */
export async function revise(article: Article, c: Critique): Promise<Article> {
  const res = await client().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high', format: zodOutputFormat(ArticleSchema) },
    system: BRAND,
    messages: [
      {
        role: 'user',
        content: `Revise this article to fix the editor's issues. Keep what works; rewrite what doesn't.
Return the full corrected article.

Issues:
${c.issues.map((i) => `- [${i.severity}] ${i.note}`).join('\n')}

Guidance: ${c.revisionGuidance}

Current draft:
${JSON.stringify(article, null, 2)}`,
      },
    ],
  });
  if (!res.parsed_output) throw new Error('Revise: model returned no parseable output');
  return res.parsed_output;
}

/**
 * Full generate loop: draft → critique → (revise once if needed).
 * Returns the best article plus the final critique for logging.
 */
export async function generateArticle(
  topic: string,
  category?: string,
): Promise<{ article: Article; critique: Critique; revised: boolean }> {
  let article = await draftArticle(topic, category);
  let c = await critique(article);
  let revised = false;
  if (!c.pass) {
    article = await revise(article, c);
    c = await critique(article);
    revised = true;
  }
  return { article, critique: c, revised };
}
