import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Article } from './schema';

/** YAML-escape a scalar string for double-quoted frontmatter. */
function yamlStr(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

/**
 * Render an Article into an MDX file that satisfies the `blog` content-collection
 * schema (src/content.config.ts). `heroRef`/`coverRef` are the final image
 * references — either a remote URL (object storage, the prod path) or a local
 * "./file.png" relative path (dev fallback). Both are accepted by the schema.
 */
export function renderMdx(
  article: Article,
  heroRef: string,
  coverRef: string,
  publishDate: string,
): string {
  const faqYaml = article.faq
    .map((f) => `  - q: ${yamlStr(f.q)}\n    a: ${yamlStr(f.a)}`)
    .join('\n');

  const frontmatter = [
    '---',
    `title: ${yamlStr(article.title)}`,
    `category: ${yamlStr(article.category)}`,
    `intro: ${yamlStr(article.intro)}`,
    `heroImage: ${yamlStr(heroRef)}`,
    `coverImage: ${yamlStr(coverRef)}`,
    `publishDate: ${publishDate}`,
    `updatedDate: ${publishDate}`,
    'faq:',
    faqYaml,
    '---',
  ].join('\n');

  const body = article.sections
    .map((s) => `## ${s.heading}\n\n${s.body.trim()}`)
    .join('\n\n');

  return `${frontmatter}\n\n${body}\n`;
}

/** Write the MDX file to disk and return its absolute path. */
export async function writeMdx(
  dir: string,
  slug: string,
  content: string,
): Promise<string> {
  const file = path.join(dir, `${slug}.mdx`);
  await writeFile(file, content, 'utf8');
  return file;
}
