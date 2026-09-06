# Drylining Maidstone

Astro v6 static site for **dryliningmaidstone.co.uk** — a professional drylining, partition wall, and suspended ceiling contractor serving Maidstone and surrounding areas.

## Tech Stack

- **Astro** v6.x with static output (`output: 'static'`)
- **Inline CSS** pattern via `<style>` blocks and inline `style` attributes (no external CSS framework)
- **Vercel** deployment ready

## Project Structure

```
src/
├── layouts/Layout.astro          # Shared layout with nav, footer, CSS variables
├── pages/
│   ├── index.astro               # Home (hero, services, areas, trust, why choose, CTA, FAQ)
│   ├── services/                 # 8 service pages + index
│   ├── areas/                    # 8 area pages + index
│   ├── get-quote.astro           # Lead capture form (Google Sheets webhook)
│   ├── about.astro
│   ├── faq.astro
│   └── contact.astro
├── components/
│   ├── FlipCard.astro
│   ├── TrustBar.astro
│   ├── AreasGrid.astro
│   └── FAQItem.astro
└── content/blog/                 # 3 seed articles
```

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Static build to dist/
npm run preview   # Preview build locally
```

## Deployment

### Vercel

1. Connect the GitHub repo to Vercel
2. Framework preset: **Astro**
3. Build command: `npm run build`
4. Output directory: `dist`

Or deploy via CLI:

```bash
vercel --prod
```

### Form Configuration

The quote form on `/get-quote/` and the hero form POST to:

```
https://script.google.com/macros/s/SCRIPT_ID/exec
```

Update the `action` attribute in:
- `src/pages/get-quote.astro`
- `src/pages/index.astro`

Replace `SCRIPT_ID` with your actual Google Apps Script deployment ID.

## SEO

Every page includes:
- Unique meta title (50–60 chars) and description (120–160 chars)
- Canonical URL
- JSON-LD schema markup (LocalBusiness, Service, FAQPage, BreadcrumbList, Organization)
- Proper H1 + TL;DR content structure
- Internal linking throughout

## Brand

- **Colours:** Primary `#C41E3A`, Secondary `#111111`
- **Phone:** 0117 XXX XXXX (placeholder — update in Layout and pages)
- **Email:** info@dryliningmaidstone.co.uk

## License

Private — for dryliningmaidstone.co.uk
