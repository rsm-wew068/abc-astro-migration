// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Allow Astro's image optimizer to fetch site/CMS/blog images from object
// storage (Cloudflare R2). The public R2 dev host is trusted by default;
// S3_PUBLIC_BASE_URL can add another host (e.g. a custom media subdomain).
const remoteImageHosts = ['pub-1665e0cd31a4447aaef1030063a757ff.r2.dev'];
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
