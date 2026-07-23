import raw from '../data/events.json';

/**
 * Events collection. Data materialized from the Framer `event` collection.
 * Images currently reference the Framer CDN (allow-listed in astro.config) as
 * an interim; they migrate to R2 with the rest of the CMS imagery.
 */
export type EventItem = {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  thumb: string;
  content: string;
  gallery: string[];
};

const byDateDesc = (a: EventItem, b: EventItem) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();
const byDateAsc = (a: EventItem, b: EventItem) =>
  new Date(a.date).getTime() - new Date(b.date).getTime();

export const ALL_EVENTS: EventItem[] = (raw as EventItem[]).slice().sort(byDateDesc);

// Start of today, events dated today or later are "upcoming".
const startOfToday = new Date(new Date().toDateString()).getTime();

export const UPCOMING = ALL_EVENTS.filter(
  (e) => new Date(e.date).getTime() >= startOfToday,
).sort(byDateAsc);

export const PAST = ALL_EVENTS.filter(
  (e) => new Date(e.date).getTime() < startOfToday,
).sort(byDateDesc);

// Events excluded from the homepage hero carousel (still shown on events pages).
const HERO_EXCLUDE = [
  'american-built-cabinets-proudly-sponsored-the-ktsf-50th-anniversary-summer-concert',
];

/** Latest events for the homepage hero carousel. */
export const LATEST_EVENTS = ALL_EVENTS.filter(
  (e) => !HERO_EXCLUDE.includes(e.slug),
).slice(0, 3);

export const getEvent = (slug: string) =>
  ALL_EVENTS.find((e) => e.slug === slug);

export function formatDate(d: string): string {
  // Dates are stored at UTC midnight, format in UTC to avoid an off-by-one.
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
