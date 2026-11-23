# KAI: brief for engineering

**Written:** Nov 10, 2026
**For:** an engineer joining the project
**Purpose:** what KAI is, how it's built today, how the logic works, and where engineering help is needed

---

## TL;DR
- **What KAI is:** a brand direction tool for 25madison's incubations. A strategist fills a brief and gets three scored brand directions: palette, type, wordmark, imagery, voice and mockups. They can then refine, compare, mix and export.
- **Where it is:** a **browser-only React prototype**, with no backend. Accounts and saves are fake (localStorage). The only outside services are Unsplash (photos), Wikimedia Commons and Google Fonts.
- **The core** is a deterministic generator (`src/app/generate.js`) that turns the brief into three directions, with readable reasons for every decision.
- **How it's built:** design-led and fast. A designer builds it directly in code with Claude Code, in small commits on `main`. There are no tests yet. The quality bar on UX is high; the engineering scaffolding is light.
- **The ask:** help turn it into a real product. That means accounts and storage, a small server layer (images, AI), deployment, tests, and a sanity check of the architecture before it grows further.

---

## 1. Context
- **25madison** is a venture studio. KAI is used early in an incubation, to get from "we have a name and a deck" to a credible brand direction quickly.
- **Users:**
  - **Strategists and designers** at 25m drive it.
  - **Founders** review the directions, often live in a meeting.
- **Inputs:** a kickoff brief (company, audience, competitors, tone), optional uploads (old logo, deck, moodboard), and an opinion on how much to keep.
- **Outputs:** three directions, each with:
  - Moodboard
  - Wordmark
  - Palette and UI primary
  - Typography
  - Imagery
  - Landing and dashboard mockups
  - Voice
  - Recommendation
- **Exports:** PDF, PowerPoint deck template, CSS and JSON tokens, CLAUDE.md, font guide.
- **The source of truth for product intent** is the system map, `~/Desktop/25m/KAI system map.html`. Ask the designer for it. It's not in the repo. It specifies one shared **keyword profile** from the brief feeding four engines (palette, type, imagery, voice), with only two outside services: **Claude for text and Unsplash for images.**

---

## 2. How it's being made
- **Designer-led and code-first.** The lead product designer builds in code with Claude Code. Figma is for new flows; cosmetic changes go straight to code.
- **Prototypes are production-adjacent.** They're used for founder demos, as marketing artifacts, as engineer reference and as a codebase starting point. Visual and UX fidelity matter more than infrastructure.
- **Small increments, committed straight to `main`.** 37 commits so far. There are no PRs yet, and the GitHub remote is `design25madison-cloud/matthew`.
- **Decisions are written down:** `docs/archetypes.md` holds the generation rules, the decisions made and the open questions. Code comments explain *why*.
- **Design rules that shape the code:**
  - No gradients, sparkle icons or chat-first "AI" patterns in KAI's own interface.
  - AI reasoning should be legible: every choice explains itself, and undo is always available.
  - Words, not scores. The recommendation shows no percentages or numeric scores.
- **What doesn't exist yet:** tests, CI, a backend, deployment, error monitoring and real authentication.

---

## 3. Stack and structure
- **React 18 and Vite 5,** plain JavaScript (no TypeScript), no Tailwind.
- **Dependencies:** `pptxgenjs` (deck export, lazy-loaded), `@fontsource/*` for about 10 bundled fonts, and nothing else at runtime.
- **One big class component,** `src/app/BrandApp.jsx` (about 830 lines). It holds all state. `renderVals()` builds a single **view model (`vm`)** that every screen reads, by spreading `flowVals(this)` (`flow.js`) and `projectVals(this)` (`projects.js`). Screens are mostly presentational.
- **CSS is layered:** `tokens.css` (variables), `base.css`, `utilities.css` (single-purpose classes, some with very long names), then a file per area (`onboarding`, `results`, `mockups`, `account`, `flow`). Brand mockups use `--m-*` variables.

### File map: logic

| File | What it does |
|---|---|
| `app/BrandApp.jsx` | State, actions, and building the view model; wires the generator into the screens |
| `app/generate.js` | **The generator**: scoring, blends, palettes, voice, images, explanations, final scoring |
| `app/archetypes.js` | 16 brand archetypes as data: palettes, fonts, voice, imagery, looks, copy |
| `app/layers.js` | Reasoning layers: 14 industry families, audience profiles, name cues, stance words |
| `app/color.js` | OKLCH color math (a perceptual color space) |
| `app/imageSearch.js` | Unsplash and Wikimedia Commons search, caching, attribution, Unsplash download notice |
| `app/imageColors.js` | Reads photo pixels into dominant colors (k-means in OKLab), cached |
| `app/referenceImages.js` + `.json` | 40 hand-picked Commons photos, plus a lookup that falls back to search |
| `app/fonts.js` | Loads brand fonts from Google Fonts on demand |
| `app/exports.js`, `app/deck.js` | Token, CLAUDE.md and font-guide exports; PowerPoint deck |
| `app/accounts.js`, `app/projects.js` | Fake log in, project list, autosave (localStorage) |
| `app/flow.js` | Meeting, handoff and export-menu logic |
| `app/language.js` | Restricted-word checks |

The screens live in `src/screens/`, one file per screen or section.

---

## 4. Product flow
1. **Log in:** fake; any email and password works.
2. **Projects:** the project list, autosaved.
3. **Start:** pick a path, upload, give an opinion, set the keep dial.
4. **Brief,** in 5 steps:
   - **General:** name, description, industry, deliverables
   - **Branding:** name meaning, look and feel, colors to keep and avoid, references
   - **Customer:** buyer and operator, problem, competitors with optional colors
   - **Tone:** tone words, sliders, product feel
   - **Review**
5. **Generating:** a staged animation; the generation itself is instant.
6. **Results:** three options.
   - **Direct view:** moodboard with the recommendation, followed by sections for wordmark, palette, UI primary, type, imagery, visualization, voice and the deck template.
   - **Compare view:** pick pieces from each option to create a custom "Your mix".
   - **Editing:** lock or regenerate per section, and precise editing (comment-driven AI-style proposals with before and after previews).
7. **Meeting and handoff:** review rounds where sections get agreed or flagged, then export.

---

## 5. The generation logic
Everything is **deterministic and runs in the browser** on every relevant state change, cached by a key built from the brief's inputs. There is no AI call. "AI" in the interface currently means rules and templates.

### Pipeline
```
brief → score 16 archetypes → pick 3 blends → for each blend:
   images → photo colors → palette → type + wordmark → voice → explanation
→ score each finished option against the brief → recommend the best fit
```

### Step by step
1. **Score archetypes** (`score()`): tone chips, keywords in brief answers, slider proximity, look picks and an industry bonus. Each archetype keeps the matched words as `why`.
2. **Blends** (`blends()`): option 1 is every archetype within 75% of the top score (up to 3). Options 2 and 3 are the strongest *different* sets. The lead carries at least 55%. Audience rules can stop an archetype from leading, for example Rebel for executive buyers.
3. **Images** (`buildImages()`): six photo slots shared by weight across the blend, plus the name's cue photo. Literal subjects (workplaces, equipment, products, the founder's industry) are filtered out, because imagery carries the brand, not the business. No repeats across options. Full rules are in `docs/imagery-instructions.md`.
4. **Photo colors** (`photoPalette()`): the main colors of the four visible photos (vivid colors become accent candidates; the overall cast tints the surface).
5. **Palette** (`buildPalette()`), built in OKLCH. Order of authority:
   1. **Seeds:** colors to keep, and admired references. The keep dial sets the strength, from exact to a nudge.
   2. **Tone:** sliders and chips become three dials: temperature (hue), loudness (chroma) and sharpness (lightness and number of accents).
   3. **Imagery:** photo colors become accents and the surface cast; the primary leans toward a nearby photo color.
   4. **Context:** category convention vs. the distinctiveness dial, competitor hue avoidance, and the name cue.
   5. **Archetype:** fills whatever's left.

   Hard limits apply throughout: avoid lists, competitor colors, and AA contrast for white text on the primary (AAA for field users). The UI primary is derived from the accent that survives darkening best.
6. **Type, wordmark and voice:** taken from the archetype data. Voice pairs mix the lead, the second archetype and an audience pair.
7. **Explanation** (`explain()`): a written rationale (what the brand is, the evidence in the brief, how it shows up), a curated option name ("Rugged systems") and one line per layer (Fit, Personality, Tone, Seeds, Category, Positioning, Audience, Name).
8. **Scoring** (`scoreDirection()`): each finished option is checked for kept colors, avoid hits, competitor proximity, tone match, positioning match, archetype fit and banned words. The best fit gets the badge. **Scores are never shown**, only a fit sentence.

### State on top of the generator
User edits live in `state.ov[optionIndex]`: palette version, hex overrides, locks, swapped images, voice edits and so on. `optionData(i)` merges the generator's output with those overrides into what the screens show.

---

## 6. Outside services and keys
- **Unsplash:**
  - **Locally,** the Vite dev server proxies `/api/unsplash/*` and attaches `UNSPLASH_ACCESS_KEY` from `.env.local` (gitignored), so the key never reaches the browser.
  - **A hosted build has no proxy** and falls back to Commons.
  - **API terms we follow:** hotlinking, attribution and the download endpoint.
- **Wikimedia Commons:** a direct browser API call, no key. Only free licenses are used (public domain, CC0, CC BY, CC BY-SA).
- **Google Fonts:** loaded on demand via `<link>` tags.
- **Claude API:** **not integrated yet.** The system map plans it for reading uploads into a draft brief, voice copy and the "why" text.

---

## 7. What's fake or prototype-only
- **Auth and storage:** `accounts.js` stores users and projects in localStorage, with no passwords and nothing synced between devices. Its functions already return promises and take plain data, **so a real API can replace the file without touching the screens.**
- **Upload reading:** uploads and the "talk through the brand" step are mocked. For example, a logo upload "finds" a fixed iron color and the Anta font (`followOv()`).
- **Precise editing:** keyword rules that pretend to be AI (`propose()`).
- **Generation timing:** the generating screen is an animation; the work itself is synchronous.
- **The sample brief** ("Ferra") fills in placeholder answers for demos.

---

## 8. Where engineering is needed
Roughly in priority order:
1. **Accounts, storage and sync:** real authentication, a database for projects, and versioned saves. **Saved projects need a migration story,** because the generator changes often (see section 9).
2. **A server layer:** an Unsplash proxy (the same job the dev proxy does), Claude API calls, and later reading competitor sites for their colors and style.
3. **Deployment:** Vercel has been floated; nothing is set up. The project uses a relative `base: "./"`.
4. **Tests:** the generator is pure and deterministic, so it's very testable. Snapshot tests of `generateDirections()` for a set of briefs would catch regressions quickly.
5. **An architecture review:** break up `BrandApp.jsx` and `generate.js` before they grow further, and decide on the state approach (the class plus view-model pattern has worked so far, but it's at its limit).
6. **AI integration** per the system map: reading uploads into a brief, voice copy, and possibly a model for industries outside the 14 families.

---

## 9. Known issues and tech debt
- **Overrides are tied to option position.** If the brief changes and the directions change, old overrides apply to different options. The same goes for projects saved before the generator changed.
- **The palette ignores swapped photos.** It follows the generated photos, not the ones the user swaps in.
- **The pick can change once after load,** when photo colors arrive asynchronously.
- **The generator runs during render.** It's cached by a JSON key of the inputs, which is fine at this size but worth moving out of render.
- **Big files:** `BrandApp.jsx` (about 830 lines) and `generate.js` (about 860) mix concerns.
- **Utility class sprawl:** some single-purpose classes have very long names, for example a full radial gradient spelled out as a class.
- **Console noise:** without an Unsplash key, expect 401 errors in the console (the fallback works).
- **The scoring work is uncommitted** as of this writing (`generate.js`, `BrandApp.jsx`, `CompareView.jsx`).

---

## 10. Running it
```bash
npm install
npm run dev        # http://localhost:5173
```
- **Optional:** `.env.local` with `UNSPLASH_ACCESS_KEY=...`, then restart the dev server.
- **Log in** with any email and password, then press **New brand** and use the sample brief to see the results quickly.

---

## 11. Questions for you
1. **Backend shape:** a hosted backend service plus a database, or something lighter like serverless functions? What fits 25m's other incubations?
2. **Where the generator runs:** keep it client-side (fast and free) or move it to the server so AI calls and model reasoning can join it?
3. **Saved projects as the generator evolves:** store the generated output, or store the inputs and regenerate with a pinned generator version?
4. **State:** refactor before building the backend, or wrap the current model first?
5. **What you need from design** to work efficiently: specs, Figma, or this repo as the reference?
