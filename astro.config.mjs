// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Allow Astro's image optimizer to fetch blog images from object storage
// (R2/MinIO/S3 behind a CDN). Set S3_PUBLIC_BASE_URL so its host is trusted.
const remoteImageHosts = [];
if (process.env.S3_PUBLIC_BASE_URL) {
  try {
    remoteImageHosts.push(new URL(process.env.S3_PUBLIC_BASE_URL).hostname);
  } catch {
    /* ignore malformed URL */
  }
}

// https://astro.build/config
export default defineConfig({
  // Canonical production domain. Drives sitemap.xml, canonical URLs, and
  // absolute JSON-LD URLs. Update if the primary domain changes at cutover.
  site: 'https://www.abcabinet.us',
  integrations: [mdx(), sitemap()],
  image: {
    // Trust the object-storage/CDN host for remote image optimization.
    domains: remoteImageHosts,
  },
});
