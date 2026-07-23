/**
 * AIGC content pipeline — replaces the Airtable → Framer sync.
 *
 * Flow per topic:  draft (Claude) → adversarial critique → revise if needed
 *                  → generate hero + cover images (gpt-image-1)
 *                  → write committed-ready MDX into src/content/blog/
 *
 * Nothing is committed automatically — output lands as working-tree changes for
 * human review, then you `git add` + commit (the review gate). Astro builds from
 * the committed MDX, so git is the source of truth (Path A).
 *
 * Usage:
 *   npm run generate -- "Modern Shaker cabinets for Bay Area kitchens"
 *   npm run generate -- --all            # process every topic in topics.json
 *   npm run generate -- --all --limit 3
 *   npm run generate -- "…topic…" --dry  # skip all API calls (wiring check)
 */
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateArticle } from './lib/claude';
import { generateImageBytes } from './lib/images';
import { renderMdx, writeMdx } from './lib/mdx';
import { slugify } from './lib/slug';
import { isConfigured as storageConfigured, uploadImage } from './lib/storage';
import type { Article } from './lib/schema';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(HERE, '../src/content/blog');

type Topic = { topic: string; category?: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadQueue(file = 'topics.json'): Promise<Topic[]> {
  const p = path.isAbsolute(file) ? file : path.join(HERE, file);
  const raw = await readFile(p, 'utf8');
  return JSON.parse(raw) as Topic[];
}

async function processTopic(t: Topic, dry: boolean): Promise<void> {
  console.log(`\n▶ ${t.topic}`);

  if (dry) {
    console.log('  [dry] would draft → critique → revise → images → MDX');
    return;
  }

  const { article, critique, revised } = await generateArticle(t.topic, t.category);
  console.log(
    `  ✓ generated${revised ? ' (revised once)' : ''} — score ${critique.score}/100, ${article.sections.length} sections, ${article.faq.length} FAQ`,
  );

  const slug = slugify(article.slug || article.title);

  // Generate both images, then place them: object storage in prod (keeps
  // binaries out of git), local file as a dev fallback when storage is unset.
  const [heroBytes, coverBytes] = await Promise.all([
    generateImageBytes(article.heroImagePrompt, '1536x1024'),
    generateImageBytes(article.coverImagePrompt, '1536x1024'),
  ]);

  // Cloud-only: images always go to object storage, never to disk/git.
  const heroRef = await uploadImage(`blog/${slug}-hero.png`, heroBytes);
  const coverRef = await uploadImage(`blog/${slug}-cover.png`, coverBytes);
  console.log('  ✓ images uploaded to object storage');

  const mdx = renderMdx(article as Article, heroRef, coverRef, today());
  const file = await writeMdx(BLOG_DIR, slug, mdx);
  console.log(`  ✓ wrote ${path.relative(process.cwd(), file)}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const all = args.includes('--all');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;
  const concIdx = args.indexOf('--concurrency');
  const concurrency = concIdx >= 0 ? Math.max(1, Number(args[concIdx + 1])) : 1;

  // Cloud-only: object storage is required for real runs (images never touch git).
  if (!dry && !storageConfigured()) {
    console.error(
      'Object storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID,\n' +
        'S3_SECRET_ACCESS_KEY, S3_BUCKET, and S3_PUBLIC_BASE_URL (see pipeline/.env.example).\n' +
        'Images are stored in the cloud, not locally.',
    );
    process.exit(1);
  }

  await mkdir(BLOG_DIR, { recursive: true });

  const queueIdx = args.indexOf('--queue');
  const queueFile = queueIdx >= 0 ? args[queueIdx + 1] : 'topics.json';

  let topics: Topic[];
  if (all) {
    topics = (await loadQueue(queueFile)).slice(0, limit);
  } else {
    const topic = args.find((a) => !a.startsWith('--') && a !== String(limit));
    if (!topic) {
      console.error('Provide a topic string, or use --all to process topics.json');
      process.exit(1);
    }
    topics = [{ topic }];
  }

  console.log(
    `Generating ${topics.length} article(s)${dry ? ' [DRY RUN]' : ''}` +
      (concurrency > 1 ? ` — ${concurrency} at a time` : '') + '…',
  );

  // Simple worker pool: `concurrency` topics run at once, pulling from a shared
  // queue. Each topic is isolated so one failure never aborts the batch.
  const failures: string[] = [];
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < topics.length) {
      const t = topics[cursor++];
      try {
        await processTopic(t, dry);
      } catch (err) {
        console.error(`  ✗ failed: ${t.topic} — ${(err as Error).message}`);
        failures.push(t.topic);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, topics.length) }, worker));

  if (failures.length) {
    console.log(`\n${failures.length} failed:`);
    for (const f of failures) console.log(`  - ${f}`);
  }
  console.log('\nDone. Review the new files, then: git add src/content/blog && git commit');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
