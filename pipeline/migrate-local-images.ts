/**
 * One-time cleanup: move any LOCAL blog images (`./x.png` in frontmatter) up to
 * object storage, rewrite the frontmatter to the returned URLs, and delete the
 * local files — leaving the repo free of image binaries.
 *
 * Run once after configuring the S3_* env vars:
 *   npx tsx --env-file-if-exists=pipeline/.env pipeline/migrate-local-images.ts
 */
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isConfigured, uploadImage } from './lib/storage';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(HERE, '../src/content/blog');

const FIELD_RE = /^(heroImage|coverImage):\s*["']?(\.\/[^"'\n]+)["']?\s*$/gm;

const contentType = (f: string) =>
  f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'image/jpeg';

async function main() {
  if (!isConfigured()) {
    console.error('S3_* not configured — nothing to migrate to. See pipeline/.env.example.');
    process.exit(1);
  }

  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.mdx'));
  let moved = 0;

  for (const mdxName of files) {
    const mdxPath = path.join(BLOG_DIR, mdxName);
    let text = await readFile(mdxPath, 'utf8');
    const localRefs: { local: string; file: string }[] = [];

    text = text.replace(FIELD_RE, (_m, field: string, ref: string) => {
      localRefs.push({ local: ref, file: ref.replace(/^\.\//, '') });
      return `${field}: "__PENDING__${ref}"`; // placeholder, replaced below
    });
    if (localRefs.length === 0) continue;

    for (const { local, file } of localRefs) {
      const abs = path.join(BLOG_DIR, file);
      const bytes = await readFile(abs);
      const url = await uploadImage(`blog/${file}`, bytes, contentType(file));
      text = text.replace(`__PENDING__${local}`, url);
      await unlink(abs);
      moved++;
      console.log(`  ↑ ${file} → ${url}`);
    }
    await writeFile(mdxPath, text, 'utf8');
    console.log(`  ✓ rewrote ${mdxName}`);
  }

  console.log(`\nDone — moved ${moved} image(s) to object storage. Commit the rewritten MDX.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
