// Post-build: copy dist/sitemap-0.xml → dist/sitemap.xml so GSC's existing
// entry at /sitemap.xml keeps working. Also writes a redirect at
// /sitemap-index.xml → /sitemap.xml in case GSC ever auto-discovers it.
import { readFileSync, writeFileSync, existsSync, copyFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const dist = resolve(process.cwd(), 'dist');
const child = resolve(dist, 'sitemap-0.xml');
const target = resolve(dist, 'sitemap.xml');
const index = resolve(dist, 'sitemap-index.xml');

if (!existsSync(child)) {
  console.log('[postbuild] no sitemap-0.xml found, skipping');
  process.exit(0);
}

copyFileSync(child, target);
console.log(`[postbuild] copied sitemap-0.xml → sitemap.xml (${readFileSync(target).length} bytes)`);

// Also write sitemap.xml as a sitemap index pointing to itself, so the canonical
// /sitemap.xml works for GSC while still being a single fetch.
const inner = readFileSync(target, 'utf8');
const urlCount = (inner.match(/<loc>/g) || []).length;
const selfIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.dryliningmaidstone.co.uk/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
// Replace the integration's sitemap-index.xml with one that points to /sitemap.xml
writeFileSync(index, selfIndex);
console.log(`[postbuild] rewrote sitemap-index.xml → points to /sitemap.xml (${urlCount} URLs)`);
