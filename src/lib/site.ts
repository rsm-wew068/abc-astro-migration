/**
 * Single source of truth for site-wide NAP (Name/Address/Phone), branding,
 * and social profiles. Consumed by JSON-LD generators (src/lib/schema.ts),
 * the footer, and page metadata so the business identity stays consistent
 * everywhere, one of the §11 audit non-negotiables.
 */

export const SITE = {
  name: 'American Built Cabinets',
  shortName: 'ABCabinet',
  legalName: 'American Built Cabinets',
  url: 'https://www.abcabinet.us',
  description:
    'San Jose-based American Built Cabinets manufactures premium custom cabinetry and integrated material solutions for residential and commercial projects across the Bay Area.',
  telephone: '+1-669-298-1888',
  telephoneDisplay: '(669) 298-1888',
  email: 'office@abcabinet.us',
  address: {
    street: '1748 Junction Ave',
    city: 'San Jose',
    region: 'CA',
    postalCode: '95112',
    country: 'US',
  },
  // Approx. coordinates for 1748 Junction Ave, San Jose, refine before launch.
  geo: { latitude: 37.3707, longitude: -121.9006 },
  areaServed: ['San Jose', 'San Francisco', 'San Mateo', 'Bay Area'],
  // sameAs, external profiles reinforcing entity identity for GEO (§4/§12).
  sameAs: [
    'https://www.instagram.com/american.built.cabinet_sanjose/',
    'https://www.linkedin.com/company/abcabinet',
  ],
  logo: '/images/logo.svg',
} as const;

export type NavItem = { label: string; href: string; children?: NavItem[] };

// Primary navigation, mirrors the live Framer header order exactly (§URLs preserved).
// Events opens a dropdown to Upcoming / Past (per the migration plan).
export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Service', href: '/service' },
  {
    label: 'Events',
    href: '/events',
    children: [
      { label: 'Upcoming Events', href: '/upcoming-events' },
      { label: 'Past Events', href: '/past-events' },
    ],
  },
  { label: 'Color & Finish', href: '/colors-finishes' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Trade Program', href: '/trade-program' },
  { label: 'Contact Us', href: '/contact' },
];
