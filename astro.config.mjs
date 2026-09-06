import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://dryliningmaidstone.co.uk',
  build: {
    format: 'directory'
  }
});
