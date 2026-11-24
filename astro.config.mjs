import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  site: 'https://www.dryliningmaidstone.co.uk',
  adapter: vercel(),
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
