import { readFileSync } from 'node:fs';
import { slugify } from './lib/slug.ts';

const r = JSON.parse(readFileSync(new URL('./topics-remaining.json', import.meta.url), 'utf8'));
r.forEach((t, i) => console.log(`${i}\t${slugify(t.topic)}\t${t.category}\t${t.topic}`));
