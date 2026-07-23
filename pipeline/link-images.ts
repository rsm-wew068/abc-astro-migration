/**
 * Idempotent image linker for pipeline-authored articles.
 *
 * For every article that has an img-prompt JSON (i.e. one whose images are
 * meant to live at blog/<slug>-hero.png / -cover.png), check whether those
 * images actually exist on R2:
 *   - exists  -> ensure the MDX frontmatter references them
 *   - missing -> strip the heroImage/coverImage lines so the build doesn't fail
 *                on an unfetchable remote image (the article still renders,
 *                just without a hero/thumbnail until its images are generated)
 *
 * Run it after `npm run gen-images` to re-link articles whose images were just
 * created. Enforces the no-hybrid rule: it never substitutes another image,
 * it only links an article to ITS OWN generated images or to nothing.
 *
 * Usage: npm run link-images
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(HERE, '../src/content/blog');
const PROMPT_DIR = path.join(HERE, 'img-prompts');
const R2 = 'https://pub-1665e0cd31a4447aaef1030063a757ff.r2.dev';

async function exists(key: string): Promise<boolean> {
  try { return (await fetch(`${R2}/${key}`, { method: 'HEAD' })).ok; } catch { return false; }
}

function stripImageLines(fm: string): string {
  return fm
    .split('\n')
    .filter((l) => !/^\s*(heroImage|coverImage):/.test(l))
    .join('\n');
}

function ensureImageLines(fm: string, slug: string): string {
  if (/^\s*heroImage:/m.test(fm)) return fm; // already present
  // insert after the intro line (or after category as a fallback)
  const hero = `heroImage: "${R2}/blog/${slug}-hero.png"`;
  const cover = `coverImage: "${R2}/blog/${slug}-cover.png"`;
  const lines = fm.split('\n');
  const at = lines.findIndex((l) => /^intro:/.test(l));
  const idx = at >= 0 ? at + 1 : lines.findIndex((l) => /^category:/.test(l)) + 1;
  lines.splice(idx, 0, hero, cover);
  return lines.join('\n');
}

async function main(): Promise<void> {
  const slugs = (await readdir(PROMPT_DIR)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  let linked = 0, stripped = 0;
  for (const slug of slugs) {
    const file = path.join(BLOG_DIR, `${slug}.mdx`);
    let src: string;
    try { src = await readFile(file, 'utf8'); } catch { continue; }
    const m = src.match(/^---\n([\s\S]*?)\n---/);
    if (!m) continue;
    const has = await exists(`blog/${slug}-hero.png`);
    const newFm = has ? ensureImageLines(m[1], slug) : stripImageLines(m[1]);
    if (newFm !== m[1]) {
      await writeFile(file, src.replace(m[0], `---\n${newFm}\n---`), 'utf8');
      if (has) linked++; else stripped++;
    }
  }
  console.log(`Linked ${linked} article(s) to their images; stripped refs from ${stripped} still-missing article(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
