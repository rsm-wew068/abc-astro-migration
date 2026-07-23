# Blog authoring brief — American Built Cabinets

You are writing SEO/GEO blog articles for **American Built Cabinets (ABCabinet)**, a
San Jose based custom cabinet manufacturer serving the Bay Area (San Jose, San Francisco,
San Mateo). They manufacture locally, serve homeowners and builders, and emphasize quality
control, fast roughly 3 week lead times, and warranty support. Voice: authoritative,
practical, warm, never hypey. Write for GEO / AI answer engines: specific, factual,
well structured, with real depth.

**Before writing, read this file to match its exact format, structure, and quality bar:**
`src/content/blog/why-frameless-cabinets-dominate-modern-homes.mdx`

## For EACH assigned topic, create TWO files

### 1. `src/content/blog/<slug>.mdx`

```
---
title: "<SEO title, 50 to 65 characters, no clickbait>"
category: "<the exact category given for this topic>"
intro: "<one strong opening paragraph that states the value and names the Bay Area service area naturally>"
heroImage: "https://pub-1665e0cd31a4447aaef1030063a757ff.r2.dev/blog/<slug>-hero.png"
coverImage: "https://pub-1665e0cd31a4447aaef1030063a757ff.r2.dev/blog/<slug>-cover.png"
publishDate: 2026-07-23
updatedDate: 2026-07-23
faq:
  - q: "<a real question a Bay Area buyer would ask>"
    a: "<concise, specific answer, 2 to 4 sentences>"
  # 4 to 6 FAQ pairs total
---

## <Section heading, specific and descriptive>

<1 to 3 paragraphs of prose>

## <Section heading>

<1 to 3 paragraphs>

# 4 to 5 sections total. Vary the structure between articles.
```

### 2. `pipeline/img-prompts/<slug>.json`

```json
{"slug":"<slug>","heroPrompt":"<photoreal hero image prompt>","coverPrompt":"<photoreal cover image prompt>"}
```

## Slug rules
- Concise kebab-case derived from the title, 4 to 7 words, no stop-word padding.
- Use the SAME slug for the `.mdx` filename, both image URLs, and the `.json` filename.
- Must NOT collide with these existing slugs:
  2026-kitchen-cabinet-trends-bay-area-homes, adu-multi-unit-cabinetry-bay-area-builders,
  best-materials-luxury-kitchens-2026-bay-area, cabinet-warranty-after-sales-service-matter,
  cabinetry-home-builders-trade-program, custom-cabinets-3-week-bay-area-process,
  custom-cabinets-manufactured-locally-silicon-valley, custom-kitchen-cabinets-lead-time-bay-area,
  custom-vs-semi-custom-cabinets-difference, custom-vs-stock-cabinets-california-homeowners,
  flat-panel-raised-shaker-cabinet-doors, garage-cabinets-smart-storage-bay-area-homes,
  green-kitchen-cabinets-bay-area-guide, how-to-choose-best-custom-cabinet-manufacturer,
  in-house-or-outsourced-silicon-valley-custom-cabinets, integrated-material-solutions-one-manufacturer,
  kitchen-cabinet-ideas-bay-area-homes, maximizing-storage-small-bay-area-kitchens,
  modern-dining-room-cabinet-solutions-bay-area, modern-rta-cabinets-bay-area-storage-guide,
  modern-shaker-cabinets-bay-area-guide, pantry-cabinets-bay-area, shaker-cabinets-bay-area-homes,
  two-tone-kitchen-cabinets-paint-veneer-san-jose, why-frameless-cabinets-dominate-modern-homes

## Content HARD RULES
- **NEVER use em dashes (—) or en dashes (–).** Use commas, colons, periods, or the word "to"
  for ranges (for example "2 to 3 inches"). This is non-negotiable and will be checked.
- Avoid AI-tell phrasing: no "in today's fast-paced world", "when it comes to", "elevate",
  "seamless", "unlock", "dive in", "it's worth noting", "furthermore", "moreover", or a tidy
  rule-of-three in every paragraph. Vary sentence length and structure.
- Ground every article in cabinetry specifics: materials (plywood, MDF, solid wood), finishes
  (paint, stain, laminate, veneer, thermofoil), hardware (soft-close hinges, dovetail drawers,
  full-extension slides), RTA vs semi-custom vs custom, real dimensions, and the roughly 3 week
  local lead time. Reference the Bay Area naturally, not as keyword stuffing.
- Each article must be genuinely different in angle and structure. No near-duplicate boilerplate
  across articles. FAQ pairs go in frontmatter ONLY, never in the body.

## Image prompt rules
Photoreal cabinetry or kitchen scenes relevant to the specific topic, natural lighting, realistic
wood grain and materials. NO text, logos, watermarks, signage, or recognizable faces.

## Do NOT
Run any build, npm, or git commands. Only write the two files per topic. When done, report the
list of slugs you created.
