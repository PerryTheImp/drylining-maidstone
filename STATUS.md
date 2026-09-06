# STATUS.md — Drylining Maidstone

## Session Handover

### Last Checkpoint

Date: 2026-09-06
Phase: City-swap + clone-contamination cleanup COMPLETE. Build passing. Ready for Vercel + DNS.
Status: READY FOR HANDOFF

### Last Action Completed

- **2026-09-06 12:51:** Home page hero swapped to real Maidstone shot (`/images/maidstone-town.jpg`). References updated in 5 places: home page background, video poster, Layout JSON-LD `image` field, og:image meta, twitter:image meta. All 21 Salford-area leftover files (`area-salford-*.jpg`, `area-ordsall-*.jpg`, `area-broughton-*.jpg`, `area-eccles-*.jpg`, `area-irlam-*.jpg`, `area-worsley-*.jpg`, `area-lowry.jpg`, `hero-featured.jpg`, `hero-main.jpg`, `hero-residential.jpg`) and the orphaned `generate_images.py/sh` scripts removed from `public/images/`. `public/images/` is now 55 files, all real Maidstone photos + shared before/after library. Build green: 63 pages, 815ms.
- All Salford/Manchester contamination removed (verified via `grep` over `dist/`)
- 12 Maidstone area pages: allington, bearsted, boxley, east-farleigh, harrietsham, headcorn, hollingbourne, loose, maidstone-central, marden, staplehurst, yalding
- 12 service pages: acoustic, commercial, drylining-contractors, fire-rated, insulated, metal-stud, office, partition-walls, plasterboard-installation, refurbishment, suspended-ceilings, taping-and-jointing
- 28 FAQ pages
- Plus: about, contact, faq, get-quote, privacy, resources/dry-lining-cost-guide, sitemap, robots.txt, llms.txt, favicons, news-sitemap stub
- Hero images: per-area files symlinked to existing Salford-area shots (placeholder — swap to Leonardo Maidstone drops before launch for premium feel)
- Phone placeholder `+448****8888` consistently applied; Twilio swap is a 1-line replace post-GSC

### Current File / Page

`~/agency-workspace/drylining-maidstone/` — repo ready for first commit.

### Next Exact Action

Ask Perry: (1) does he want me to create the GitHub repo + Vercel project + first deploy, or (2) will he handle the GitHub/Vercel side? Once known, proceed with `gh repo create`, push, Vercel import.

### Blockers

None technical. Awaiting Perry decision on repo/vercel creation.

### Decisions Needed From Perry

- GitHub repo creation (`PerryTheImp/drylining-maidstone`?) — me or you?
- Vercel project — me or you?
- Real Twilio number — will swap after GSC indexation is confirmed (placeholder pattern in place)
- Maidstone-specific hero images (currently symlinked to Salford-area shots — premium feel requires Leonardo drops)

### Important Warning

- **Hero images** — 12 area pages now use real Maidstone photographs. Home page hero still uses the old `hero-featured.jpg` (Salford shot) — swap to `maidstone-town.jpg` or `leeds-castle.jpg` if you want a real Maidstone skyline on the homepage. Contact page already uses the real `area-maidstone-central.jpg`.
- **News-sitemap `<news:job_id>`** is a placeholder string — update after Maidstone blog cron is created.
- **Map embed** uses Google Maps `q=Maidstone,+Kent,+UK` (correct — no Salford contamination).
- **dist/ folder** is generated locally; Vercel will rebuild on deploy.

### Git State

Branch: main
Last Commit: none
Uncommitted Changes: yes (whole skeleton + cleanup)
Remote: not configured

### Verification snapshot

```
$ npm run build
63 page(s) built in 835ms
Complete!

$ grep -rol "Salford\|salford\|SALFORD" dist/ | grep -v Binary
(empty)

$ grep -rol "Manchester\|the Lowry\|Maidstone Quays" dist/ | grep -v Binary
(empty)

$ grep -rol "Q23048891\|City_of_Salford" dist/
(empty)

$ ls dist/areas/
allington  bearsted  boxley  east-farleigh  harrietsham  headcorn
hollingbourne  loose  maidstone-central  marden  staplehurst  yalding
```
