import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://www.dryliningmaidstone.co.uk',
  build: {
    format: 'directory'
  },
  integrations: [sitemap({
    entryLimit: 10000,
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date()
  })]
});
