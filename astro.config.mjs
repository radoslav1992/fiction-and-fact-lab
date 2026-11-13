import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/lib/site.mjs';

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  // Teacher answer keys are noindex and stay out of the sitemap, like the 404 page. So do the audiobook
  // player (/book/) and the saved shelf (/favorites/), which have no content of their own.
  integrations: [sitemap({ filter: page => !/\/404(?:\/|\.html)?$/.test(page) && !/\/(?:teachers\/answers|book|favorites)\//.test(page) })],
  vite: { server: { allowedHosts: ['terminal.local'] } },
});
