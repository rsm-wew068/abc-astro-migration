/**
 * JSON-LD generators, the core GEO win (§4 of the migration plan).
 * Each content type maps its fields to schema.org structured data, injected
 * server-side into <head>. Written once per type; no per-page duplication.
 */
import { SITE } from './site';

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

/** Absolute URL helper, JSON-LD must use absolute URLs. */
export function abs(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, SITE.url).href;
}

/** Site-wide Organization, referenced by @id from every other node. */
export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.telephone,
    logo: { '@type': 'ImageObject', url: abs(SITE.logo) },
    sameAs: [...SITE.sameAs],
  };
}

/** Site-wide WebSite node. */
export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': ORG_ID },
  };
}

/** LocalBusiness / HomeAndConstructionBusiness for Home + Contact (§4). */
export function localBusinessSchema() {
  return {
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name: SITE.name,
    image: abs(SITE.logo),
    url: SITE.url,
    telephone: SITE.telephone,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    areaServed: SITE.areaServed.map((name) => ({ '@type': 'Place', name })),
    parentOrganization: { '@id': ORG_ID },
  };
}

type Crumb = { name: string; url: string };

/** BreadcrumbList from an ordered list of crumbs. */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.url),
    })),
  };
}

type ArticleInput = {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishDate?: Date;
  updatedDate?: Date;
  category?: string;
};

/** BlogPosting for blog detail pages (§4). */
export function articleSchema(a: ArticleInput) {
  const url = abs(`/blog/${a.slug}`);
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: a.title,
    description: a.description,
    ...(a.image ? { image: abs(a.image) } : {}),
    ...(a.category ? { articleSection: a.category } : {}),
    ...(a.publishDate ? { datePublished: a.publishDate.toISOString() } : {}),
    dateModified: (a.updatedDate ?? a.publishDate ?? new Date()).toISOString(),
    mainEntityOfPage: url,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

export type FaqPair = { question: string; answer: string };

/** FAQPage, auto-built from a post's parsed FAQ pairs (§4/§5). */
export function faqSchema(pairs: FaqPair[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: pairs.map((p) => ({
      '@type': 'Question',
      name: p.question,
      acceptedAnswer: { '@type': 'Answer', text: p.answer },
    })),
  };
}

type CreativeWorkInput = {
  title: string;
  description: string;
  slug: string;
  images: string[];
  category?: string;
};

/** CreativeWork + ImageObject for portfolio case-study pages (§4). */
export function creativeWorkSchema(w: CreativeWorkInput) {
  const url = abs(`/portfolio/${w.slug}`);
  return {
    '@type': 'CreativeWork',
    '@id': `${url}#work`,
    name: w.title,
    description: w.description,
    url,
    ...(w.category ? { genre: w.category } : {}),
    creator: { '@id': ORG_ID },
    image: w.images.map((src) => ({
      '@type': 'ImageObject',
      contentUrl: abs(src),
    })),
  };
}

/**
 * Assemble a full JSON-LD document with @context and @graph.
 * Pass the node objects produced by the generators above.
 */
export function graph(...nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}
