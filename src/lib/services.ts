import type { ImageMetadata } from 'astro';

import designHero from '../assets/service/sub/design-hero.png';
import designA from '../assets/service/sub/design-a.png';
import designB from '../assets/service/sub/design-b.png';
import mfgHero from '../assets/service/sub/mfg-hero.png';
import mfgA from '../assets/service/sub/mfg-a.png';
import mfgB from '../assets/service/sub/mfg-b.png';
import installHero from '../assets/service/sub/install-hero.png';
import installA from '../assets/service/sub/install-a.png';
import installB from '../assets/service/sub/install-b.png';
import warrantyHero from '../assets/service/sub/warranty-hero.png';
import warrantyA from '../assets/service/sub/warranty-a.png';

export type Feature = { title: string; body: string; img?: ImageMetadata };
export type ServiceDetail = {
  slug: string;
  title: string;
  tagline: string;
  hero: ImageMetadata;
  metaTitle: string;
  metaDescription: string;
  features: Feature[];
};

/** The four /service/* detail pages, captured 1:1 from the live site. */
export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    slug: 'design-consultation',
    title: 'Design & Consultation',
    tagline: 'From brief to concept, refined together.',
    hero: designHero,
    metaTitle: 'Design Consultation | American Built Cabinets San Jose',
    metaDescription:
      'Engineering-driven cabinetry design and consultation for Bay Area homes — discovery, material direction, and 3D renderings before anything is cut.',
    features: [
      { title: 'Discovery & Brief', img: designA, body: 'We start every project with a thorough discovery session — to understand your space, your aesthetic, and how you actually live day to day.' },
      { title: 'Material & Finish Direction', img: designB, body: 'Walk through wood species, finishes, and hardware options with our team. We help you land on a palette that feels right for the space and ages well.' },
      { title: 'Renderings & Review', body: 'See your kitchen in 3D before anything is cut. We refine together — proportions, details, hardware — until every choice reads as intentional.' },
    ],
  },
  {
    slug: 'manufacturing',
    title: 'Manufacturing',
    tagline: 'Built in-house, shipped on schedule.',
    hero: mfgHero,
    metaTitle: 'In-House Cabinet Manufacturing | American Built Cabinets',
    metaDescription:
      'Cabinets built in our 80,000 sq ft San Jose facility — engineered workflows, quality checkpoints, and production slots scheduled at deposit.',
    features: [
      { title: 'In-House Production', img: mfgA, body: 'Everything is built in our 80,000 sq ft San Jose facility. No outsourced surprises, no unknown subs, no guessing where your cabinets were made.' },
      { title: 'Precision Workflow', img: mfgB, body: 'Engineered workflows and quality checkpoints keep consistency across every cabinet that leaves the floor — whether it’s a single kitchen or a hundred-unit build.' },
      { title: 'Predictable Lead Times', body: 'Production slots are scheduled at deposit. You know when your cabinetry will be ready — not eventually, but specifically.' },
    ],
  },
  {
    slug: 'installation',
    title: 'Installation',
    tagline: 'Approved crews, final-fit guarantee.',
    hero: installHero,
    metaTitle: 'Professional Cabinet Installation | American Built Cabinets',
    metaDescription:
      'Installed by crews we vet and train on our cabinetry systems — on-site final fit, adjustments, and a walk-through handover across the Bay Area.',
    features: [
      { title: 'Approved Crews', img: installA, body: 'Installed by crews we vet and train on our specific cabinetry systems. Not gig labor pulled from a board, not whoever was available.' },
      { title: 'Final Fit & Adjustments', img: installB, body: 'Doors, drawers, reveals, and hardware get dialed in on-site. Small imperfections are fixed before we leave, not added to a punch list.' },
      { title: 'Walk-Through & Handover', body: 'Final inspection happens together. We answer questions, walk through care basics, and make sure you’re set up to live with the work.' },
    ],
  },
  {
    slug: 'warranty-support',
    title: 'Warranty & Support',
    tagline: 'Local service, long-term protection.',
    hero: warrantyHero,
    metaTitle: 'Warranty Support | American Built Cabinets San Jose',
    metaDescription:
      'Comprehensive warranty on materials and workmanship, backed by a Bay Area-based service team and care guidance tailored to your finishes.',
    features: [
      { title: 'Long-Term Protection', img: warrantyA, body: 'Comprehensive warranty on materials and workmanship. If something fails because of how it was built or installed, we make it right — quickly.' },
      { title: 'Local Service Team', body: 'Bay Area-based service means a real person close enough to show up. Not an 800 number, not a six-week wait, not a script.' },
      { title: 'Care & Maintenance', body: 'We send you care guidance tailored to the specific finishes and materials in your project, so the work stays looking the way it did the day we handed over.' },
    ],
  },
];

export const getService = (slug: string) =>
  SERVICE_DETAILS.find((s) => s.slug === slug);
