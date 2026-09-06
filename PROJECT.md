# PROJECT.md — Drylining Maidstone

## Identity

| Field | Value |
|---|---|
| Site name | Drylining Maidstone |
| Domain | `https://dryliningmaidstone.co.uk` |
| City | Maidstone |
| County | Kent (county town) |
| Country | England, UK |
| Wikidata | Q213180 (Maidstone) |
| Wikipedia | https://en.wikipedia.org/wiki/Maidstone |
| Population | 109,490 (2021 census) |
| Local authority | Maidstone Borough Council |
| Phone (placeholder) | `FREEPHONE 0800 MAIDSTONE` / `tel:+448****8888` |
| Real phone | **NOT YET** — swap after GSC indexation |
| Email | info@dryliningmaidstone.co.uk |
| Lead routing | Google Sheet `1KcG2Fqwt6Fvzw--wCi14Z3X9vRJFXuCt0DelE6UhT8c` + GApps Script webhook (shared with all 10 drylining sites) |
| Analytics | None yet |

## Brand

| Token | Value |
|---|---|
| `--primary` | `#1E40AF` (Maidstone blue) |
| `--primary-dark` | `#1E3A8A` |
| `--secondary` | `#111111` |
| `--accent` | `#FACC15` (yellow highlights) |
| Font | Inter |

## Postcodes (primary service area)

ME14 (town centre), ME15 (south/east), ME16 (north), ME17 (south villages — Harrietsham, Hollingbourne), ME18 (Yalding), TN12 (Staplehurst, Marden), TN27 (Headcorn).

## Nearby towns / villages served (12 areas)

1. Maidstone Central — ME14, ME15
2. Bearsted — ME14
3. Allington — ME16
4. Loose — ME15, ME17
5. Boxley — ME14
6. Staplehurst — ME17, TN12
7. Headcorn — ME17, TN27
8. Marden — TN12
9. Yalding — ME18
10. East Farleigh — ME15
11. Harrietsham — ME17
12. Hollingbourne — ME17

## Services (12)

Drylining Contractors · Partition Walls · Metal Stud Partitioning · Suspended Ceilings · Plasterboard Installation · Taping & Jointing · Commercial Drylining · Office Drylining · Fire-Rated Drylining · Acoustic Drylining · Insulated Drylining · Refurbishment Drylining.

## Competitors

- https://kentplasteringanddrylining.co.uk/
- https://meridiandrylining.co.uk/
- https://fernsgroup.co.uk/dry-lining/

## Known unknowns / decisions needed from Perry

- Real Twilio number to swap in once GSC indexation confirmed.
- Real Leonardo hero image (the current `hero-featured.jpg` is the Salford master — replace before launch with a Maidstone-specific image).
- GBP creation deferred to client handover.

## Special instructions

- Phone placeholder must read `0800 MAIDSTONE` until Twilio lands.
- Twelve area pages must each have a unique hero image (currently some point at Salford files).
- News-sitemap `<news:job_id>` must be updated to Maidstone's cron job ID (currently still Salford's).
