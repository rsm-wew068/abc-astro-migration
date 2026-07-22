# American Built Cabinets — Migration & GEO Architecture Plan

**Goal:** Maximize SEO + GEO (visibility in AI answer engines) by moving to a code-based frontend with full server-side rendering and programmatic structured data — **while keeping the current visual design identical.**

**Current state:** Framer site. Blog (57 items) synced from Airtable; six other native Framer CMS collections. Core limitation: Framer can't cleanly generate dynamic, per-item JSON-LD schema (`Article`, `FAQPage`, `HowTo`, `Event`, `LocalBusiness`) across collections — central to GEO.

> **Honest framing:** This migration is the right *infrastructure* decision (removes the schema ceiling, gives full control), but the platform is not the biggest GEO lever. Off-site signals — Google Business Profile, reviews, directory citations, backlinks — move GEO/SEO faster and are platform-independent. Do both; ideally start the off-site track in parallel. See §12.

---

## 1. Decisions

| Choice | Decision | Why |
|--------|----------|-----|
| **Framework** | **Astro** | Ships static HTML by default → fully crawlable. Per-page JSON-LD trivial. Lighter than Next.js; no unnecessary JS. |
| **Content store** | **Airtable = source of truth → build-time sync → committed MDX** (Path B2, see §6) | Keeps the existing Airtable + AIGC-agent pipeline untouched; still gets Content Collections' type-safety, schema-from-frontmatter, and git history. |
| **Editing UI** | **Airtable itself** (no separate CMS) | The team + AIGC agent already author in Airtable. Sveltia/TinaCMS only if a non-Airtable editor is ever wanted. |
| **Hosting** | **Netlify or Cloudflare Pages** (free, commercial-OK) | Auto-deploy on push, global CDN, SSG/SSR. Avoid Vercel free tier (non-commercial). |
| **Design** | **Rebuilt 1:1 from current Framer pages** (visual only — see §2) | Same look to visitors; engine changes underneath. |
| **URLs** | **Preserved exactly** (`/blog/*`, `/service/*`, `/portfolio/*`, `/events/*`, …) | No ranking loss; 301s only where a path must change. |

**Why not the alternatives:** WordPress/Wix/Webflow are all builders whose schema-injection ceiling doesn't lift, and matching the exact current design means rebuilding it in *their* system. Next.js is heavier than a mostly-static marketing + blog site needs.

---

## 2. Design fidelity — scope of "identical"

**"Identical" means the visual design.** Content, structure, metadata, and schema get *cleaned up and improved* during the rebuild — this is intentional, not a contradiction:

- **Reproduced 1:1 (visual):** layout, grid, typography, colors, spacing, images, buttons, responsive/mobile behavior.
- **Cleaned up (non-visual):** template placeholders removed, consistent NAP, one nav, single H1 per page, descriptive alt text, correct titles/meta. (These are the outstanding audit items — see §11.)

So a visitor sees the same site; the markup, metadata, and structured data are strictly better.

**Approach:** extract computed styles, fonts, and assets from each live page; rebuild as Astro components; visual-diff against the original at multiple breakpoints.

---

## 3. Full content inventory (from the Framer project)

**7 CMS collections — 176 items — plus ~16 static pages.** Every collection is CMS-driven and hits the same schema ceiling today; the rebuild gives each one a single schema generator in code.

| Collection | Items | Source | Role |
|-----------|-------|--------|------|
| blog | 57 | **Synced (Airtable connector)** | SEO/GEO landing content |
| event | 26 | native Framer CMS | Event detail pages (`/events/*`) |
| gallery | 25 | native Framer CMS | Image gallery |
| Portfolio Photos | 35 | native Framer CMS | Supporting images for portfolio items |
| portfolio | 6 | native Framer CMS | Project case-study pages (`/portfolio/*`) |
| colors | 16 | native Framer CMS | Color options (feeds `/colors-finishes`) |
| finishes | 11 | native Framer CMS | Finish options (feeds `/colors-finishes`) |

Static pages: Home, /about, /gallery, /trade-program, /contact, /upcoming-events, /past-events, /faq, /warranty, /privacy, /trusted-partner, /colors-finishes, plus /service + 4 service sub-pages.

> Only **blog** is externally synced; the other six are native Framer collections. For the migration this is irrelevant — all become Astro Content Collections. (See §6 for how each is sourced.)

---

## 4. Schema strategy (the core GEO win)

Generated in code from each content type — clean, per-item, no duplicate-schema risk.

| Page / collection | Schema emitted |
|-----------|----------------|
| Every page | `Organization` + `WebSite` (site-wide, `sameAs` → Instagram, LinkedIn, press) |
| Home / Contact | `LocalBusiness` / `HomeAndConstructionBusiness` (NAP, geo, hours, service area: San Jose + Bay Area) |
| Blog post | `Article` / `BlogPosting` + `BreadcrumbList` |
| Blog post with Q&A block | `FAQPage` (auto-built from the post's FAQ frontmatter array) |
| How-to / guide posts | `HowTo` (steps from frontmatter) |
| Event (`/events/*`) | `Event` (name, date, location, organizer) |
| Portfolio (`/portfolio/*`) | `CreativeWork` + `ImageObject` for photos + `BreadcrumbList` |
| Gallery / Portfolio Photos | `ImageObject` (referenced by parent items; no standalone pages) |
| Colors / finishes | `Product` / `DefinedTerm` where useful; else `ItemList` on `/colors-finishes` |
| Service pages | `Service` + `BreadcrumbList` |

An Astro schema module maps each item's fields → JSON-LD, injected server-side into `<head>`. Written once per collection — far cheaper than re-solving per collection in a builder.

---

## 5. Content model (MDX frontmatter — blog example)

```yaml
---
title: "Modern Shaker Cabinets: A Bay Area Guide to Style and Function"
slug: "modern-shaker-cabinets-a-bay-area-guide-to-style-and-function"
description: "Modern Shaker cabinets blend timeless design with contemporary function..."
category: "Cabinet Features"
publishDate: 2026-07-02
updatedDate: 2026-07-02
heroImage: "/images/shaker-hero.jpg"
faq:
  - q: "What makes Modern Shaker cabinets popular in the Bay Area?"
    a: "Modern Shaker cabinets are favored for their clean lines..."
schemaType: "Article"   # or HowTo
---
```

The `faq` array → `FAQPage` schema automatically. Body is standard MDX. Each collection (event, portfolio, etc.) gets its own typed schema.

---

## 6. Content store — the real decision (A vs B)

Airtable + the AIGC content agent is **core operating infrastructure, not a liability.** Two honest paths:

**Path A — In-repo MDX + Git CMS.** Cleanest builds, full version control, schema from frontmatter. **Cost:** re-plumb the content workflow; the AIGC agent must target git commits instead of Airtable rows. *Not recommended given the Airtable investment.*

**Path B — Airtable as the source, Astro consumes it.** Two sub-variants:
- **B1 — fetch at build time** directly from the Airtable API. Simple, but builds fail if Airtable is down and there's no content version history.
- **B2 — sync script materializes Airtable → committed MDX (recommended).** A Node sync step (Airtable API) runs on demand / scheduled, writes rows to `src/content/**` as MDX, and commits them. Astro builds from the committed MDX.

**Recommended: B2.** Best of both — Airtable stays the authoring surface (AIGC agent and editors untouched), builds are reproducible and offline-safe, and content gets git history. **Cost:** an Airtable API token in CI and a sync script to maintain.

Sourcing per collection: **blog** already flows through Airtable → keep it. The six native Framer collections (event, portfolio, gallery, Portfolio Photos, colors, finishes) are **exported once** during migration (§9, Phase 1) into MDX; decide per collection whether ongoing edits happen in Airtable (extend the pipeline) or directly in MDX.

> **CMS note:** With B2, Airtable is the editor — **no Decap.** Decap is minimally maintained with dated UX; only if a non-Airtable editor is ever needed, prefer **Sveltia CMS** (drop-in, far better UX) or **TinaCMS** (visual, actively maintained).

---

## 7. Images — a real workstream (not a footnote)

For a cabinet company the portfolio/gallery *is* the product; images are ~95 items across collections (gallery 25, Portfolio Photos 35, portfolio 6, plus blog/event hero images). Treat as its own track:

- Migrate off `framerusercontent.com` to local/optimized assets.
- Use **`astro:assets`** for build-time optimization: responsive `srcset`/`sizes`, **AVIF + WebP** with fallbacks, correct dimensions to prevent CLS, lazy-loading below the fold.
- **Descriptive, keyword-aware alt text** on every image (SEO + accessibility + image search — a real GEO/discovery channel for a visual product).
- Add `ImageObject` schema on portfolio/gallery items (§4).

---

## 8. Animation fidelity — explicit decision, budgeted

**This is the most likely thing to break the "1:1 identical" promise.** Framer's scroll/stagger/physics motion is genuinely hard to reproduce and will not come free. Decide deliberately:

1. **Inventory** the current Framer animations (hero entrances, scroll reveals, staggers, hover/parallax, counters).
2. **Classify each: carry over vs. simplify.** Not every micro-motion is worth exact reproduction.
3. **For carry-overs, pick tooling:** **Motion One** (lightweight, good default), **GSAP + ScrollTrigger** (complex timelines), or a hydrated **React/Svelte island** for anything stateful — kept off the critical path so it doesn't hurt Core Web Vitals.
4. **Budget real time** for this in Phase 2; it's a workstream, not polish.

---

## 9. Migration phases

**Phase 0 — Fidelity proof-of-concept (first step).** Rebuild one blog post + one portfolio page + shared header/footer in Astro from the live design, wired to sample content, with full `Article` + `FAQPage` + `CreativeWork` + `Organization` schema. Judge visual + animation fidelity before committing.

**Phase 1 — Content export.** Build the Airtable→MDX sync (B2) for the blog. Export the six native Framer collections into MDX (57 + 26 + 25 + 35 + 6 + 16 + 11 = 176 items). Download and localize all images into the §7 pipeline.

**Phase 2 — Build out.** Rebuild all templates (home, about, service + 4 sub-pages, portfolio + items, events + upcoming/past, gallery, colors-finishes, contact, faq, warranty, privacy, trade-program, trusted-partner). Wire per-collection schema (§4). Execute the animation decisions (§8) and image pipeline (§7).

**Phase 3 — SEO/GEO parity + upgrades.** Preserve every URL; 301s where needed. Generate `sitemap.xml` (live 200s only) + `robots.txt` + native **RSS** (solves Reddit Pro). Fix all outstanding audit items (§11).

**Phase 4 — Staging + test (see §10), then launch.** Deploy to a gated staging URL, run the checklist, then cut over: point DNS, remove `noindex`, submit sitemap, monitor Search Console.

---

## 10. Testing before production

Test on a **gated staging deploy that never touches live URLs**, then cut over.

1. **Local:** `astro dev` for the build loop.
2. **Staging deploy:** free preview URL (Netlify/Cloudflare) set to **`noindex` + robots-blocked + password-protected** so Google never sees it and there's no duplicate content.
3. **Checks on staging:**
   - **Visual + animation parity** vs live, desktop/tablet/mobile.
   - **Rendering:** view-source/`curl` a page — confirm content *and* JSON-LD are in raw HTML without JS.
   - **Schema:** Google Rich Results Test + Schema.org validator on each page type.
   - **Parity crawl:** Screaming Frog (free ≤500 URLs) — diff URLs, titles, meta, status codes vs a live crawl. This is the "no SEO loss" gate.
   - **Performance:** Lighthouse / PageSpeed per page type.
   - **Redirects, link check, contact form.**
4. **Cutover, reversibly:** keep Framer live until staging passes; DNS can be pointed back — nothing destructive.

---

## 11. SEO safety checklist (cutover)

Non-negotiables so indexing carries over (same domain, same URLs = lowest-risk migration class):

- Preserve every URL 1:1; 301 only where unavoidable.
- Match/improve title tags, meta descriptions, headings, body content, canonical tags.
- Keep/expand structured data (the point).
- Same sitemap + robots.txt, resubmitted in Search Console at launch.
- Match or beat Core Web Vitals.
- Don't break internal links.
- Snapshot a full pre-migration crawl (URLs + titles + meta + schema) as the parity baseline.
- Expect a brief re-crawl wobble (days–weeks), then stable/improved. Monitor GSC coverage.

---

## 12. Off-site GEO (platform-independent — do in parallel)

The migration is the on-site foundation. The faster GEO/SEO gains for a local cabinet business are off-site and require no rebuild:

- **Claim + fully optimize Google Business Profile** (category, photos, services, service area, reviews).
- **Build consistent citations** (Yelp, Houzz, Bing Places, Apple Business Connect, trade directories) — identical NAP.
- **Collect reviews** (Google first).
- **Surface existing press** (Mercury News, World Journal, Sing Tao, LUXE) as links + `sameAs`.

Treat this as a second track running alongside the build.

---

## 13. Immediate next step

Build **Phase 0** — one blog post + one portfolio page + header/footer, exact design, real schema, and a first pass at the key animations — so visual *and* motion fidelity are proven before full commitment.