/**
 * One-time portfolio migration: pulls the 5 case studies that were never
 * migrated from the live Framer site. Downloads each real project photo from
 * Framer's CDN, uploads it to R2 (never hotlinked), and writes the MDX file to
 * match src/content/portfolio/veev-by-lennar-model-x.mdx.
 *
 * Usage: npx tsx --env-file-if-exists=pipeline/.env pipeline/portfolio-import.ts
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isConfigured, uploadImage } from './lib/storage';

const R2 = 'https://pub-1665e0cd31a4447aaef1030063a757ff.r2.dev';
const FRAMER = 'https://framerusercontent.com';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../src/content/portfolio');

type Case = {
  slug: string; title: string; category: string; summary: string;
  publishDate: string; body: string[]; photos: string[]; // photos[0] = thumbnail
};

const CASES: Case[] = [
  {
    slug: 'veev-by-lennar-model-e', title: 'Veev by Lennar Model E', category: 'Veev',
    summary: 'A modular two-story single-family home built with Veev by Lennar, part of a 100-plus residence program delivered across the Bay Area with clean, modern cabinetry throughout.',
    publishDate: '2026-06-20',
    body: [
      'This project features the Veev Home Model E, a modular two-story single-family home developed in collaboration with Veev by Lennar. The project includes over 100 residences delivered across key Bay Area locations, including San Jose, Santa Clara, Walnut Creek, Hayward, Castro Valley, and Santa Rosa.',
      'Each home is designed with a contemporary layout, featuring 5 bedrooms and 4 bathrooms. The kitchen anchors the main living level with clean, modern cabinetry, an oversized island, integrated appliances, and smart storage solutions, balancing functionality with a refined, modern aesthetic.',
      'Upstairs, the primary suite offers a calm, spa-inspired bathroom and generous closet space, complemented by additional well-proportioned bedrooms and a family room designed for everyday living. The cabinetry systems throughout the project were engineered for consistency, efficiency, and scalability, supporting a large-volume modular housing program.',
    ],
    photos: [
      '/images/hHE5ZX83XA0swrUaIutHy6hBCY.jpeg', '/images/39hLQStygf0JyMUsiZvqbKlTo.jpg',
      '/images/ROQGHFwKGaYX3NAiXB4N6wJd0k.jpg', '/images/6U3W4qAOzWwTvUHFc8h2SYy6Ok.jpg',
      '/images/y0bWZWSiBvwk58Bu1mcQ26Re0.jpg',
    ],
  },
  {
    slug: 'uc-davis-health', title: 'UC Davis Health', category: 'UC Davis',
    summary: 'Custom institutional cabinetry for the UC Davis Health Central Utility Plant Expansion, delivered with Rudolph and Sletten Construction from shop drawings through installation.',
    publishDate: '2026-05-10',
    body: [
      'American Built Cabinets provided custom cabinetry for the UC Davis Health Central Utility Plant Expansion, working with Rudolph and Sletten Construction on this institutional project.',
      'Healthcare facilities require careful planning, precise fabrication, and close coordination throughout the construction process. Our team worked closely with the project team from shop drawings through production, ensuring every cabinet met the project specifications and quality standards.',
      'Projects like this rely on clear communication, attention to detail, and consistent execution. From planning to fabrication, our focus was on delivering reliable cabinetry that supported the project schedule and performance requirements.',
    ],
    photos: [
      '/images/7oajZOLh0kosWunCBmWtUDypQc.jpg', '/images/vd5TalhkJUzFCXK3ISPPqCV3Hs.jpg',
      '/images/0xhPVyeWx6GxWbvGxulWa1IAnGw.jpg', '/images/qz3hgpKQo6d8fcpm5FmH58WEA.jpg',
      '/images/kY2VOdAl07e8lHG0e4ydIE2Xc.jpg',
    ],
  },
  {
    slug: 'haraz-coffee-house', title: 'Haraz Coffee House', category: 'Commercial',
    summary: 'Commercial cabinetry for Haraz Coffee House, planned closely with the client from layout and storage through materials and finishes for a smooth, on-schedule build.',
    publishDate: '2026-04-15',
    body: [
      'Every successful commercial project starts with good planning.',
      'For this coffee house, we spent considerable time working closely with the client during the early design phase. From layout planning and storage solutions to material selections and finish details, every decision was carefully discussed to ensure the cabinetry met both the operational needs of the space and the client vision.',
      'That early collaboration made the rest of the project run smoothly. Production, delivery, and installation stayed on schedule, and the finished cabinetry fit into the space with minimal adjustments on site.',
      'For commercial projects, we believe clear communication at the beginning leads to a smoother build, a more efficient installation, and a better final result.',
    ],
    photos: [
      '/images/MEGVhFP3cLeAtY9wfL66i8Jeb8.png', '/images/kpxwP602WcqlT01C78C01i9jYrk.png',
      '/images/P6ledkMOD56V67j3jG05ZwdJec.png', '/images/AG5pxhmNFhnBwslaEoKMJ4Vf9s.png',
      '/images/tA3g7SlEUwZXuC5AoBMFn6TsQ.png',
    ],
  },
  {
    slug: 'multi-residence', title: 'Multi-Residence Custom Cabinetry', category: 'Residential',
    summary: 'A phased whole-home cabinetry program across four residences, with a consistent design language spanning kitchens, bathrooms, closets, and laundry rooms.',
    publishDate: '2026-03-20',
    body: [
      'This whole-home custom cabinetry project was completed in multiple phases as the property was built over time, with a total of four residences included in the development.',
      'Our team provided custom cabinetry throughout each home, creating a consistent design language across kitchens, bathrooms, closets, laundry rooms, and other living spaces. From the beginning, we worked closely with the homeowner to coordinate layouts, materials, finishes, and colors, ensuring every detail reflected the original vision.',
      'Because the project was completed in stages, clear communication and careful planning were essential. Maintaining the same design style and finish consistency across all four homes required close coordination throughout every phase.',
      'The result is a cohesive whole-home cabinetry solution where every space feels connected, functional, and thoughtfully designed.',
    ],
    photos: [
      '/images/oPD9u78D5uwHJbrwrISlFEvKLmY.jpg', '/images/ug0YC8IES3lyF058VfTN2khRM.jpg',
      '/images/Euj37oqY1AwXO4kkYFk2R2Go4.jpg', '/images/1V6ZvPw1ue0ItYw8bCkFjxZMTk.jpg',
      '/images/absliRElxIusJDJn8hq6adpbtw.jpg',
    ],
  },
  {
    slug: 'ferguson', title: 'Ferguson Home Showroom', category: 'Commercial',
    summary: 'American Built Cabinets on display in Ferguson Home showrooms in Santa Clara and Fresno, giving homeowners, designers, and builders a close-up look at our craftsmanship.',
    publishDate: '2026-02-10',
    body: [
      'American Built Cabinets is proud to have our cabinetry featured in Ferguson Home showrooms in Santa Clara and Fresno, California.',
      'These showroom displays give homeowners, designers, and builders the opportunity to see our craftsmanship, finishes, and cabinet details up close. Seeing the products in person makes it easier to compare materials, explore design options, and plan with confidence.',
      'For us, being in the showroom is about more than displaying cabinets, it is about helping customers make informed decisions with products they can experience firsthand.',
    ],
    photos: [
      '/images/Hw9BjgpvvNEYDLCL9iMKR4Q.jpg', '/images/c07j9t5MFJPJjqd4jOHlOZgwQ.jpg',
      '/images/36qrjBVH43qHyowBllGW3raEDbg.jpg', '/images/xwOdO8RmBtFJzTygoU8aZRpz3Nw.jpg',
      '/images/VhuVUz7jT6iLKRfAQHDhOQKB5BY.jpg',
    ],
  },
];

const yamlStr = (s: string) => '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

async function download(p: string): Promise<Buffer> {
  const res = await fetch(FRAMER + p, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`download ${p}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main(): Promise<void> {
  if (!isConfigured()) { console.error('S3/R2 not configured.'); process.exit(1); }
  for (const c of CASES) {
    console.log(`\n▶ ${c.slug}`);
    const urls: string[] = [];
    for (let i = 0; i < c.photos.length; i++) {
      const ext = c.photos[i].split('.').pop();
      const key = `portfolio/${c.slug}-${i === 0 ? 'thumb' : i}.${ext}`;
      await uploadImage(key, await download(c.photos[i]));
      urls.push(`${R2}/${key}`);
      console.log(`  ✓ ${key}`);
    }
    const fm = [
      '---',
      `title: ${yamlStr(c.title)}`,
      `category: ${yamlStr(c.category)}`,
      `summary: ${yamlStr(c.summary)}`,
      `thumbnail: ${yamlStr(urls[0])}`,
      'photos:',
      ...urls.slice(1).map((u) => `  - ${yamlStr(u)}`),
      `publishDate: ${c.publishDate}`,
      '---',
    ].join('\n');
    await writeFile(path.join(OUT, `${c.slug}.mdx`), `${fm}\n\n${c.body.join('\n\n')}\n`, 'utf8');
    console.log(`  ✓ wrote ${c.slug}.mdx`);
  }
  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
