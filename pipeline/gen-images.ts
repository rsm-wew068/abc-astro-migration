/**
 * Image-only backfill for hand-authored articles.
 *
 * When articles are authored directly (not through the Claude pipeline), the
 * text lands as MDX but the hero/cover images still need generating. This reads
 * every `pipeline/img-prompts/<slug>.json` ({ slug, heroPrompt, coverPrompt }),
 * generates both images via gpt-image-1, and uploads them to R2 at the exact
 * keys the MDX already references (blog/<slug>-hero.png, blog/<slug>-cover.png).
 *
 * Uses ONLY OpenAI (images) + S3/R2 (upload) — no Anthropic calls, so it works
 * regardless of the Anthropic credit balance.
 *
 * Usage: npm run gen-images                 # all prompt files
 *        npm run gen-images -- --concurrency 4
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateImageBytes } from './lib/images';
import { isConfigured as storageConfigured, uploadImage } from './lib/storage';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_DIR = path.join(HERE, 'img-prompts');

type Prompt = { slug: string; heroPrompt: string; coverPrompt: string };

async function processOne(p: Prompt): Promise<void> {
  console.log(`\n▶ ${p.slug}`);
  const [heroBytes, coverBytes] = await Promise.all([
    generateImageBytes(p.heroPrompt, '1536x1024'),
    generateImageBytes(p.coverPrompt, '1536x1024'),
  ]);
  await uploadImage(`blog/${p.slug}-hero.png`, heroBytes);
  await uploadImage(`blog/${p.slug}-cover.png`, coverBytes);
  console.log(`  ✓ ${p.slug} hero + cover uploaded to R2`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const concIdx = args.indexOf('--concurrency');
  const concurrency = concIdx >= 0 ? Math.max(1, Number(args[concIdx + 1])) : 4;

  if (!storageConfigured()) {
    console.error('Object storage is not configured (S3_* env). See pipeline/.env.example.');
    process.exit(1);
  }

  const files = (await readdir(PROMPT_DIR)).filter((f) => f.endsWith('.json'));
  const prompts: Prompt[] = [];
  for (const f of files) {
    prompts.push(JSON.parse(await readFile(path.join(PROMPT_DIR, f), 'utf8')));
  }
  console.log(`Generating images for ${prompts.length} article(s) — ${concurrency} at a time…`);

  const failures: string[] = [];
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < prompts.length) {
      const p = prompts[cursor++];
      try {
        await processOne(p);
      } catch (err) {
        console.error(`  ✗ ${p.slug}: ${(err as Error).message}`);
        failures.push(p.slug);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, prompts.length) }, worker));

  if (failures.length) {
    console.log(`\n${failures.length} failed: ${failures.join(', ')}`);
    process.exit(1);
  }
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
