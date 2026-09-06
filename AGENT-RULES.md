# AGENT-RULES.md — Drylining Maidstone

## Priority order

1. **Perry's instructions** — current and direct
2. **AGENT-RULES.md** (this file)
3. **PROJECT.md**, **STATUS.md**, **CONTENT-MAP.md**, **QC.md**, **RESEARCH.md**, **MASTER-SOP.md**
4. **Existing code**

## No-invention rule

- Do NOT invent facts about Maidstone. Verify on Wikipedia / OS gazetteer / Wikidata first.
- Do NOT invent streets, postcodes, or landmarks.
- All phone numbers must be placeholder format unless Perry supplies a real Twilio number.
- Real Twilio number goes in ONLY after GSC indexation is confirmed.

## Clone contamination (this site was cloned from Salford)

The skeleton is a partial Salford clone. **Always grep for `salford`, Manchester-area postcodes (M3/M5/M6/M7/M27/M28/M30/M44/M50), invented Salford-renamed places (`Maidstone Quays`, `Maidstone waterfront`, `Lockmeadow` as a district, `the Lowry`), and Wikidata Q-numbers from Salford (Q23048891).**

Run after every contamination-pass: `grep -roi "salford\|M[0-9]\{1,2\}\|Q23048891\|Maidstone Quays\|Maidstone waterfront\|the Lowry" src/ public/`

## Brand

- Palette (batch 11+): `--primary: #1E40AF` (blue), `--secondary: #111111` (grey), `--accent: #FACC15` (yellow)
- Phone placeholder: `0800 MAIDSTONE` (display) / `+448****8888` (tel: link)
- Twilio: SWAP ONLY after GSC indexation. Leave placeholder until then.

## Phase rules

- Don't write pages until RESEARCH and CONTENT-MAP complete.
- Don't deploy before pre-launch QC passes.
- One task in progress at a time, batch updates, then checkpoint.

## QA stop conditions (halt and tell Perry)

- Source-city contamination found after build
- Wrong Wikidata entity in any LocalBusiness schema
- Wrong addressRegion (must be "Kent" — not "Metropolitan Borough", not "Greater Manchester")
- Real Twilio number leaked before GSC indexation
- Form action pointing at wrong Sheet/webhook
- > 5% remaining old-city content after a city-swap pass
