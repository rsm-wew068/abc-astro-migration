# AIGC Content Pipeline

Self-contained content generation that **replaces Airtable**. It generates
SEO/GEO blog articles *and* their images with AI, then writes committed-ready
MDX straight into `src/content/blog/`. Git is the source of truth; Astro builds
from the committed MDX (Path A).

```
draft (Claude Opus 4.8, structured output)
  → adversarial critique (LLM editor)
  → revise once if it doesn't pass
  → hero + cover images (OpenAI gpt-image-1)
  → write src/content/blog/<slug>.mdx  +  <slug>-hero.png / <slug>-cover.png
```

Nothing is committed automatically — new files land as working-tree changes for
**human review**, then you `git add` + commit. That review step is the quality gate.

## Setup

**Claude (text)** — the client is zero-arg and resolves credentials automatically. Either:
- `export ANTHROPIC_API_KEY=sk-ant-...`, or
- install the Anthropic CLI and run `ant auth login` (stores an OAuth profile the SDK reads).

**OpenAI (images)** — `export OPENAI_API_KEY=sk-...` (used for `gpt-image-1`).

**Image storage (S3-compatible)** — set the `S3_*` vars so generated images upload to
object storage **instead of git**. Works with Cloudflare R2 (recommended: free 10 GB,
zero egress), MinIO on Railway, AWS S3, or Backblaze B2 — just point `S3_ENDPOINT` at
the right host. Also set `S3_PUBLIC_BASE_URL` (the CDN/public base the site links to);
Astro's image optimizer trusts that host automatically (see `astro.config.mjs`).

> If the `S3_*` vars are **unset**, the pipeline falls back to writing images locally
> into `src/content/blog/` — fine for a quick dev run, but **not for production**
> (that's the git-bloat we're avoiding). Configure storage before generating at volume.

See `.env.example`. Load with your shell, a dotenv tool, or the `--env-file` flag
(the `generate` script already loads `pipeline/.env`).

## Usage

```bash
# one-off topic
npm run generate -- "Modern Shaker cabinets for Bay Area kitchens"

# process the whole queue (pipeline/topics.json)
npm run generate -- --all
npm run generate -- --all --limit 3

# wiring check, no API calls / no cost
npm run generate -- --all --dry
```

Edit `pipeline/topics.json` to queue topics (`{ "topic": "...", "category": "..." }`).

## Design notes

- **Quality over automation.** The critique→revise loop exists to avoid the
  near-duplicate, templated feel of the old Airtable AI-field output. Tune the
  bar in `lib/claude.ts` (`BRAND` prompt + critique instructions).
- **Images: blog only.** AI imagery is used for blog hero/cover art. Portfolio
  and gallery imagery should stay real photography — authenticity and image SEO
  matter more there than for illustrative blog headers. Swap the provider in
  `lib/images.ts` (isolated behind one function) without touching the rest.
- **Schema-locked.** `lib/schema.ts` mirrors the `blog` content collection, so
  the MDX writer is a pure projection and the FAQ array drives FAQPage JSON-LD
  automatically.
