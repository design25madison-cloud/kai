# Brand archetypes: generation rules

**Status: DRAFT for review.** In use by the generator (`src/app/archetypes.js` and `src/app/generate.js`). Edits here should be mirrored there.

**Decisions so far** (Nov 9, 2026):
- **The set:** the classic 12 stay, and the PDF's set is added on top. Where the two overlap they merge, giving 16 archetypes in all. See "The full set".
- **Gradients** are allowed in generated brands, following the rules under "Gradients".
- **Accents:** palettes can have 2–3 accents.
- **Images** come from Wikimedia Commons and the Unsplash API. See "Image sourcing".

- **Source:** `~/Desktop/25m/brand arcetypes.pdf` (kept out of the repo on purpose, see the end)
- **From the PDF:** personality, theme, description, attributes and reference brands. Corrections there should go back into the PDF too.
- **Drafted:** everything else. Palette, type, wordmark, imagery, shape and composition come from reading each moodboard. Voice and brief signals are inferred from the attributes, since the PDF has none.
- Mark up anything that's wrong and I'll update both this file and the code.

## How the rules plug into KAI

Each archetype becomes a recipe that the generator fills in:

| KAI output | Rule here | Where it lives today |
|---|---|---|
| Palette (5 roles: Primary, Surface, Neutral dark, Neutral light, Accent) | Hue families, lightness, saturation, contrast, role ratios | Hardcoded hexes in `opts()` |
| Wordmark | Case, weight, tracking, font candidates | `wordFont`, `track` |
| Display + body type | Classification and Google Fonts candidates | `display`, `body` |
| Imagery | Subjects, treatment, what to avoid | Fixed labels per direction |
| UI shape (radius, density) | Radius range, density, composition | `LOOKS` in `LandingMockup.jsx` |
| Voice | "X, not Y" pairs, headline pattern | Fixed per direction |

**Constraint on fonts:** every candidate is on Google Fonts, so it's free to use, loads on the web and can be named in exports.

## The full set

The PDF's 10 plus the classic 12 give 16 archetypes, because six of the PDF's overlap with classic ones.

**Overlaps, merged into one entry each:**
- **Same name, same idea:** Everyman, Sage, Ruler, Magician. The PDF's version is the definition.
- **Same idea, different name:** Protector (classic: Caregiver) and Rebel (classic: Outlaw). The PDF's name leads, and the classic name stays as an alias so either one is recognized.

**Added from the classic 12** (entries 11–16; there's nothing on these in the PDF, so everything is drafted):
- Innocent
- Explorer
- Lover
- Jester
- Hero
- Creator

**Close pairs that need a clear line between them:**

| Pair | The line |
|---|---|
| Hero / Champion | Hero proves itself through mastery and winning. Champion serves a cause beyond itself. |
| Creator / Builder | Creator is about self-expression and craft. Builder is about the systems others rely on. |
| Explorer / Visionary | Explorer is about freedom and discovery now. Visionary is about a future it's building toward. |
| Magician / Transformer | Magician makes one impossible thing happen. Transformer keeps adapting to change. |

---

## 1. Protector · Sanctuary (classic: Caregiver)

**From the PDF**
- **Description:** Focused on compassion, empathy and service. Caregivers provide a safe, nurturing environment, emphasizing support, patience and a deep commitment to helping others.
- **Attributes:** Service, Compassion, Reliability, Understanding, Empathy, Altruism
- **Brands:** Volvo, Allstate, Dove

**Palette**
- **Primary:** deep forest or moss green, or warm earth
- **Surface:** warm bone or stone
- **Accent:** soft chartreuse, olive or dusk sky
- **Character:** low to mid saturation. Medium contrast: calm, never stark. No pure black.

**Type**
- **Display:** soft humanist serif, or a tall, condensed, friendly grotesk. Fraunces (soft settings), Newsreader, Instrument Sans.
- **Body:** humanist sans. Figtree, Source Sans 3.
- **Wordmark:** title case or lowercase, regular to medium weight, normal tracking.

**Imagery**
- **Subjects:** hands, nature at human scale (forest canopy, grasses), quiet interiors with natural light, people being cared for.
- **Treatment:** soft daylight and natural grain.
- **Avoid:** staged stock smiles, clinical white.

**Shape and composition**
- **Radius:** generous (12–16px)
- **Density:** lots of breathing room; soft repeating patterns are allowed
- **Composition:** centered, calm and balanced

**Voice**
- **Pairs:** Reassuring, not saccharine · Steady, not slow · Warm, not soft
- **Headlines:** a promise of safety or support. *"We've got the hard part."*

**Misfires**
- Too pastel or too "wellness"
- Drifting into Everyman's playfulness

---

## 2. Everyman · Community

**From the PDF**
- **Description:** Making a community and experience for all, providing opportunity and common growth.
- **Attributes:** Accessible, Welcoming, Simple, Humanist, Advocate, Optimistic, Connection
- **Brands:** Ikea, Figma, Levi's, Wikipedia

**Palette**
- **Primary:** friendly mid-saturation green or blue
- **Surface:** warm white
- **Accents:** several playful hues (coral, sun yellow, sky, pink). See the gap below.
- **Character:** mid to high saturation, cheerful and approachable.

**Type**
- **Display:** friendly grotesk, or a warm serif paired with sans. Bricolage Grotesque, Young Serif.
- **Body:** DM Sans, Plus Jakarta Sans.
- **Wordmark:** lowercase, medium to bold weight, tight to normal tracking.

**Imagery**
- **Subjects:** diverse real people, hand-drawn marks, objects in use, collaborative scenes.
- **Treatment:** bright and flat, with cut-out collage.

**Shape and composition**
- **Radius:** pills and fully rounded corners
- **Density:** medium
- **Composition:** modular tiles and chips, a visible system of friendly parts

**Voice**
- **Pairs:** Plain, not dumbed-down · Upbeat, not hype · Inclusive, not generic
- **Headlines:** a direct, everyday benefit. *"There's a better way to work."*

**Misfires**
- Generic SaaS (the "everyone" look). It needs one distinctive asset, such as an illustration style or a signature shape.

**Accents:** 3, one per playful hue.

---

## 3. Sage · Enlightenment

**From the PDF**
- **Description:** A restraint and control gained from immense experience and knowledge. Achieving the highest level of craft and sophistication.
- **Attributes:** Quality, Wisdom, Tradition, Truth, Clarity, Graceful, Austere
- **Brands:** TED, New York Times, Master Class, Harvard

**Palette**
- **Primary:** deep warm brown or ink
- **Surface:** parchment, stone or warm grey
- **Accent:** muted gold or brass
- **Character:** low saturation, near-monochrome, tonal rather than contrasting.

**Type**
- **Display:** classical serif. Cormorant Garamond, EB Garamond, Libre Caslon Display.
- **Body:** Source Serif 4, or Karla for a sans counterpart.
- **Wordmark:** title case or small caps, light to regular weight. Craft shown through detail, such as fine-line or engraved marks.

**Imagery**
- **Subjects:** craftspeople's hands, old trees, spiral architecture, books, materials.
- **Treatment:** warm, low light, rich texture.

**Shape and composition**
- **Radius:** small or none (0–4px)
- **Density:** editorial, with text-led pages and generous margins
- **Composition:** strict grid and typographic hierarchy

**Voice**
- **Pairs:** Considered, not academic · Precise, not cold · Assured, not boastful
- **Headlines:** a clear truth or insight. *"Good decisions start with better information."*

**Misfires**
- Fusty or old-fashioned. Pair the serif with modern layout and spacing.

---

## 4. Ruler · Power

**From the PDF**
- **Description:** Creating a desire to achieve more, experience and the best of the best, and have the highest level of expectations.
- **Attributes:** Status, Exclusivity, Quality, Elegance, Power, Beauty, Control
- **Brands:** Mercedes, Tiffany, LVMH, Equinox

**Palette**
- **Primary:** deep bottle green, oxblood, espresso or black
- **Surface:** ivory
- **Accent:** copper, gold or silver, used as flat colors
- **Character:** low saturation, high contrast. Dark colors dominate (about 50% or more).

**Type**
- **Display:** high-contrast didone, or a wide, refined serif. Bodoni Moda, Playfair Display.
- **Body:** a quiet geometric sans. Jost, Manrope.
- **Wordmark:** all caps, wide tracking, light to regular weight. Monogram or crest marks are allowed.

**Imagery**
- **Subjects:** estates, tailored fashion, sculptural interiors, luxury objects shot as products.
- **Treatment:** dramatic light on dark grounds.

**Shape and composition**
- **Radius:** sharp (0–2px)
- **Density:** sparse
- **Composition:** symmetric, centered, lots of negative space

**Voice**
- **Pairs:** Confident, not arrogant · Exacting, not fussy · Exclusive, not cold
- **Headlines:** few words, a statement of standard. *"Built for the few who notice."*

**Misfires**
- Reading as consumer luxury rather than B2B. Keep the copy tied to outcomes.

---

## 5. Magician · Imagination

**From the PDF**
- **Description:** Creating an experience that is surprising and inspiring, looking at the world in a totally unique way. Turning the impossible to possible.
- **Attributes:** Imagination, Wonder, Extraordinary, Inspiring, Unique
- **Brands:** Disney, Dyson, Lego, Pinterest

**Palette**
- **Primary:** saturated cobalt, violet or red
- **Surface:** clean light grey, or deep black for drama
- **Accents:** sun yellow, plus a soft pastel glow
- **Character:** high saturation, surreal combinations, light used as color.

**Type**
- **Display:** expressive display, outline or sculptural letterforms. Syne, Unbounded, Fraunces (high contrast, italic).
- **Body:** Manrope.
- **Wordmark:** custom-feeling forms, ligatures and an unexpected detail.

**Imagery**
- **Subjects:** surreal scale shifts, glowing light, sculpted 3D type, impossible architecture.
- **Treatment:** studio-clean surrealism.

**Shape and composition**
- **Radius:** mixed and playful
- **Density:** medium
- **Composition:** one hero moment per screen

**Voice**
- **Pairs:** Wondrous, not whimsical · Bold, not baffling · Inventive, not gimmicky
- **Headlines:** a reveal or reframe. *"What if the paperwork did itself?"*

**Misfires**
- Generic AI glow and sparkles. This archetype draws closest to the AI clichés, so the surprise has to come from concept and scale, not effects.

---

## 6. Rebel · Revolution (classic: Outlaw)

**From the PDF**
- **Description:** A need to disrupt the status quo and blaze a new path. Not afraid to stand out, be different and disregard risk.
- **Attributes:** Unconventional, Bold, Provocative, Disruptive, Confident, Daring
- **Brands:** Virgin, Harley Davidson, Supreme, MTV

**Palette**
- **Primary:** black
- **Surface:** white or off-white
- **Accent:** one acid color (lime, neon green or signal red), held to 10% or less
- **Character:** maximum contrast.

**Type**
- **Display:** heavy grotesk or condensed. Anton, Archivo Black, Space Grotesk at bold weights.
- **Body:** Space Mono or Archivo.
- **Wordmark:** all caps, heavy, tight. Distortion, slicing and stacking are allowed.

**Imagery**
- **Subjects:** motion blur, speed, raw product, pixel or bitmap graphics.
- **Treatment:** grain, glitch and op-art patterns.

**Shape and composition**
- **Radius:** none
- **Density:** dense
- **Composition:** overlapping, type as image, edge-to-edge

**Voice**
- **Pairs:** Blunt, not rude · Defiant, not angry · Confident, not cocky
- **Headlines:** a challenge to the status quo. *"Your industry runs on fax machines. Not anymore."*

**Misfires**
- Too aggressive for regulated or legacy buyers. Most of KAI's B2B clients will want Rebel only as a secondary archetype.

---

## 7. Transformer · Change

**From the PDF**
- **Description:** Composed of an agile nature that is built to adapt and survive in an ever-changing world.
- **Attributes:** Adaptive, Problem-Solving, Agile, Dynamic, Fluid, Opportunistic
- **Brands:** Google, Facebook, OpenAI

**Palette**
- **Primary:** shifting multi-hue (cobalt, orange, violet)
- **Surface:** soft pastel or light grey
- **Character:** colors meant to blend into each other. See the gradient flag below.

**Type**
- **Display:** variable or experimental. Bricolage Grotesque, Fraunces (variable width), Syne.
- **Body:** Figtree.
- **Wordmark:** fluid or modular letterforms, with a system of variants rather than one fixed logo.

**Imagery**
- **Subjects:** metamorphosis (butterflies, translucency), recycled materials, interfaces in use, layered 3D.
- **Treatment:** translucent, layered, in motion.

**Shape and composition**
- **Radius:** organic or variable
- **Density:** medium
- **Composition:** adaptive, with a logo or pattern that changes by context

**Voice**
- **Pairs:** Adaptive, not vague · Optimistic, not naive · Fast, not frantic
- **Headlines:** change made easy. *"Built to move as fast as your business."*

**Misfires**
- No fixed anchor, so the brand becomes forgettable. Keep one constant: a color or a mark.

**Gradients:** a core part of this archetype. See "Gradients" for the rules.

---

## 8. Champion · Mission

**From the PDF**
- **Description:** Driven by a clear sense of purpose to help the world. A higher order cause that guides everything they do.
- **Attributes:** Driven, Motivation, Passion, Useful, Belonging, Principled, Essential
- **Brands:** Patagonia, Allbirds, Toms

**Palette**
- **Primary:** sun yellow, cobalt or black
- **Surface:** kraft or off-white
- **Accent:** signal red or green
- **Character:** high contrast, poster-like, primary colors.

**Type**
- **Display:** condensed bold, slab or italic for momentum. Barlow Condensed, Oswald, Alfa Slab One.
- **Body:** Barlow.
- **Wordmark:** all caps, bold, slanted or set on a path for motion.

**Imagery**
- **Subjects:** athletes and people in action, protest-poster typography, planet and impact.
- **Treatment:** high contrast, type layered over photos.

**Shape and composition**
- **Radius:** none to small (0–4px)
- **Density:** dense
- **Composition:** oversized headlines, diagonal energy

**Voice**
- **Pairs:** Purposeful, not preachy · Urgent, not alarmist · Proud, not smug
- **Headlines:** an imperative call to action. *"Make your mark on the work that matters."*

**Misfires**
- Cause-washing. The mission has to be backed by the brief's "Why this matters" answer.

---

## 9. Builder · Systems

**From the PDF**
- **Description:** Creating a foundational structure that supports the stable operation of complex systems on a societal level.
- **Attributes:** Practical, Measured, Resourceful, Rigorous, Systematic, Sophisticated
- **Brands:** IBM, GE, Microsoft

**Palette**
- **Primary:** systems green or blue
- **Surface:** white, or a dark neutral for technical contexts
- **Accent:** a defined data-visualization set
- **Character:** restrained, functional color.

**Type**
- **Display:** neutral grotesk, sometimes with a serif for warmth. IBM Plex Sans, Work Sans, Space Grotesk.
- **Body:** IBM Plex Sans, IBM Plex Mono.
- **Wordmark:** medium weight, normal tracking. Geometric or modular marks.

**Imagery**
- **Subjects:** infrastructure (data centers, wind turbines), data visualization, illustrated portraits, grids.
- **Treatment:** precise and documentary.

**Shape and composition**
- **Radius:** small (2–8px)
- **Density:** medium to dense, with a visible grid
- **Composition:** modular cards and diagrams

**Voice**
- **Pairs:** Clear, not dry · Rigorous, not rigid · Capable, not corporate
- **Headlines:** capability and outcome. *"Explore data like an analyst."*

**Misfires**
- Faceless enterprise. Add one human element, such as portraits or a warm serif.

**Note:** this is likely the most common fit for 25madison's legacy-industry B2B work. KAI's current "Forged warmth" direction reads as Builder with Protector as the secondary archetype.

---

## 10. Visionary · Future

**From the PDF**
- **Description:** Creating a clear vision for a future that was unimagined.
- **Attributes:** Pioneering, Ambitious, Clarity, Progress, Aspirational, Foresight, Elevated
- **Brands:** SpaceX, Tesla, Apple, Nvidia

**Palette**
- **Primary:** white, light grey or brushed metal
- **Accent:** one vivid color (signal red-orange or electric violet)
- **Character:** minimal, high clarity, mostly white space.

**Type**
- **Display:** clean geometric or neo-grotesk. Sora, Manrope, Outfit.
- **Body:** Inter Tight.
- **Wordmark:** wide tracking, light to medium weight, minimal forms.

**Imagery**
- **Subjects:** robotics, parametric architecture, futuristic interfaces, abstract 3D forms.
- **Treatment:** clean white studio light.

**Shape and composition**
- **Radius:** large and smooth (16–24px)
- **Density:** airy
- **Composition:** one object, centered

**Voice**
- **Pairs:** Ambitious, not grandiose · Clear, not clinical · Forward, not futuristic-for-show
- **Headlines:** a belief about the future. *"The next decade of logistics starts here."*

**Misfires**
- A copy of one well-known tech brand's look. This archetype has the most generic default, so it needs one ownable color or form.

---

## 11. Innocent · Optimism

*From the classic 12. Not in the PDF, so everything here is drafted.*

- **Description:** Simple, honest and good. It promises a return to what's pure and easy.
- **Attributes:** Honest, Simple, Optimistic, Pure, Trustworthy, Fresh
- **Brands (reference only):** Coca-Cola, Innocent Drinks, Aveeno

**Palette**
- **Primary:** fresh sky blue, mint or butter yellow
- **Surface:** clean white
- **Accents:** 1–2 soft brights
- **Character:** high lightness, low to mid saturation, airy.

**Type**
- **Display:** rounded or soft geometric. Nunito, Quicksand, Fredoka.
- **Body:** Nunito Sans.
- **Wordmark:** lowercase, rounded, friendly.

**Imagery**
- **Subjects:** daylight, open skies, simple everyday moments.
- **Treatment:** bright, natural, uncluttered.

**Shape and composition**
- **Radius:** large (16–24px)
- **Density:** airy, with simple layouts

**Voice**
- **Pairs:** Simple, not simplistic · Honest, not naive · Cheerful, not childish
- **Headlines:** a plain promise. *"Paperwork, finally simple."*

**Misfires**
- Childish. In B2B it needs Builder or Sage as a secondary for credibility.

---

## 12. Explorer · Discovery

*From the classic 12. Not in the PDF, so everything here is drafted.*

- **Description:** Driven by freedom and discovery. It helps people find new ground on their own terms.
- **Attributes:** Independent, Adventurous, Curious, Authentic, Rugged, Free
- **Brands (reference only):** The North Face, Jeep, National Geographic

**Palette**
- **Primary:** earth tones (terrain brown, forest, slate)
- **Surface:** sand or fog
- **Accent:** one signal orange or trail red
- **Character:** natural, weathered, mid contrast.

**Type**
- **Display:** sturdy grotesk or condensed. Archivo Narrow, Oswald, Big Shoulders Display.
- **Body:** Archivo.
- **Wordmark:** all caps, medium to bold weight. Coordinate or badge motifs are allowed.

**Imagery**
- **Subjects:** landscapes, horizons, maps, people in the field.
- **Treatment:** wide shots, natural light, grain.

**Shape and composition**
- **Radius:** small (2–6px)
- **Density:** medium
- **Composition:** wide horizontal crops, map-like structure

**Voice**
- **Pairs:** Curious, not aimless · Bold, not reckless · Grounded, not dull
- **Headlines:** an invitation to go further. *"See every site from one screen."*

**Misfires**
- Outdoor-brand cosplay for an office product. Tie the visuals to the real "field" of the client's industry.

---

## 13. Lover · Intimacy

*From the classic 12. Not in the PDF, so everything here is drafted.*

- **Description:** Builds closeness and sensory pleasure, so people feel appreciated and wanted.
- **Attributes:** Passionate, Sensual, Warm, Devoted, Indulgent, Beautiful
- **Brands (reference only):** Chanel, Godiva, Victoria's Secret

**Palette**
- **Primary:** deep wine, rose or plum
- **Surface:** blush or cream
- **Accent:** one metallic-like warm tone (rose gold as a flat color)
- **Character:** warm, rich, mid saturation.

**Type**
- **Display:** elegant high-contrast or italic serif. Playfair Display Italic, Cormorant, DM Serif Display.
- **Body:** Lato or Jost.
- **Wordmark:** script-like or italic serif, refined.

**Imagery**
- **Subjects:** close-ups, texture, skin, fabric, warm interiors.
- **Treatment:** soft focus, warm tones, intimate crops.

**Shape and composition**
- **Radius:** medium (8–16px)
- **Composition:** layered, sensual curves

**Voice**
- **Pairs:** Warm, not gushing · Devoted, not clingy · Indulgent, not excessive
- **Headlines:** an emotional benefit. *"Clients who feel looked after."*

**Misfires**
- Rarely right as a primary in B2B. Mostly useful as a secondary for hospitality, beauty or relationship-heavy services.

---

## 14. Jester · Joy

*From the classic 12. Not in the PDF, so everything here is drafted.*

- **Description:** Brings fun and lightness, and doesn't take itself too seriously.
- **Attributes:** Playful, Witty, Irreverent, Spontaneous, Fun, Light-hearted
- **Brands (reference only):** Old Spice, M&M's, Mailchimp

**Palette**
- **Primary:** loud pop color (tomato, grape, lime)
- **Surface:** off-white or a bright color
- **Accents:** 2–3 clashing brights
- **Character:** maximum saturation, unexpected combinations.

**Type**
- **Display:** chunky, quirky display. Bagel Fat One, Rubik, Lilita One.
- **Body:** Rubik.
- **Wordmark:** bouncy, irregular baseline or rotation allowed.

**Imagery**
- **Subjects:** illustration, characters, absurd juxtapositions.
- **Treatment:** flat, bright, cartoon-like.

**Shape and composition**
- **Radius:** blobby or pill
- **Composition:** tilted, stickers, motion

**Voice**
- **Pairs:** Witty, not silly · Irreverent, not disrespectful · Light, not flippant
- **Headlines:** a joke that carries the benefit. *"Compliance, minus the yawns."*

**Misfires**
- Undercuts trust in serious categories. Use it as a 30% secondary for tone, not the base.

---

## 15. Hero · Mastery

*From the classic 12. Not in the PDF, so everything here is drafted.*

- **Description:** Proves its worth through courage and mastery. It helps people rise to a challenge and win.
- **Attributes:** Courageous, Determined, Strong, Competent, Disciplined, Victorious
- **Brands (reference only):** Nike, FedEx, BMW

**Palette**
- **Primary:** strong red, navy or black
- **Surface:** white or steel grey
- **Accent:** one high-energy color (orange, electric blue)
- **Character:** high contrast, strong saturation.

**Type**
- **Display:** bold, athletic sans or italic. Barlow Semi Condensed Bold, Saira, Exo 2.
- **Body:** Saira or Barlow.
- **Wordmark:** all caps, bold, forward-leaning.

**Imagery**
- **Subjects:** performance, effort, precision, finish lines.
- **Treatment:** dynamic angles, sharp focus, motion.

**Shape and composition**
- **Radius:** small (0–4px), angled cuts allowed
- **Composition:** diagonal energy, big numbers

**Voice**
- **Pairs:** Determined, not aggressive · Strong, not macho · Competitive, not combative
- **Headlines:** a challenge met. *"Close every job on time."*

**Misfires**
- Overlaps with Champion. Hero is about winning; if the brief is about a cause, choose Champion.

---

## 16. Creator · Expression

*From the classic 12. Not in the PDF, so everything here is drafted.*

- **Description:** Gives form to ideas. It values originality, craft and helping others make things.
- **Attributes:** Imaginative, Original, Expressive, Skilled, Inventive, Artistic
- **Brands (reference only):** Adobe, Lego, Canva

**Palette**
- **Primary:** one confident color (ultramarine, vermilion)
- **Surface:** paper white or a light tint
- **Accents:** 2–3 from an art-supply range
- **Character:** expressive but organized, mid to high saturation.

**Type**
- **Display:** characterful grotesk or a serif with personality. Space Grotesk, Bricolage Grotesque, Young Serif.
- **Body:** DM Sans.
- **Wordmark:** custom-feeling, with one crafted detail.

**Imagery**
- **Subjects:** tools, materials, works in progress, studios.
- **Treatment:** tactile, overhead shots, process-focused.

**Shape and composition**
- **Radius:** mixed
- **Composition:** canvas-like, layered, visible process

**Voice**
- **Pairs:** Original, not odd · Expressive, not chaotic · Skilled, not precious
- **Headlines:** an invitation to make. *"Design your workflow, not just follow it."*

**Misfires**
- Overlaps with Builder. Creator is about expression; if the brief is about reliability and infrastructure, choose Builder.

---

## At a glance

Accents and gradients per archetype, and what to search for when sourcing images.

| Archetype | Accents | Gradients | Image search terms |
|---|---|---|---|
| Protector | 1 | No | hands, forest canopy, grassland, quiet interior daylight |
| Everyman | 3 | No | people collaborating, community, everyday objects |
| Sage | 1 | No | craftsman hands, old tree, spiral staircase, library |
| Ruler | 1 | No | estate, tailored suit, marble interior, dark product |
| Magician | 2–3 | Yes, as glowing light | surreal, light installation, sculpture, cobalt sky |
| Rebel | 1 | No | motion blur, speed, concrete, neon, graffiti |
| Transformer | 2–3 | Yes, core to the look | butterfly, translucent, recycled materials, layered glass |
| Champion | 2 | No | athlete, protest poster, community action, planet |
| Builder | 2–3 (data set) | No | data center, wind turbine, infrastructure, grid |
| Visionary | 1 | Yes, subtle | robotics, parametric architecture, white studio object |
| Innocent | 1–2 | Optional, soft | clear sky, daylight, fresh fruit, simple home |
| Explorer | 1 | No | landscape, horizon, map, field work |
| Lover | 1 | Optional, soft | fabric texture, close-up, warm interior |
| Jester | 3 | No | colorful toys, confetti, bright illustration |
| Hero | 1 | No | runner, finish line, precision, motion |
| Creator | 2–3 | No | art supplies, workshop, studio, work in progress |

The search terms combine with the industry from the brief. For example, Builder for logistics searches for "warehouse infrastructure" before "infrastructure".

## Gradients

Allowed in generated brands, within these rules:
- **Colors:** stops come only from the brand's own palette. No off-palette hues, and no rainbow.
- **Stops:** 2, or at most 3.
- **Where:** hero areas, imagery overlays and brand moments. Never behind body text or on interface controls (buttons, inputs), where flat color keeps contrast predictable.
- **Contrast:** text over a gradient must pass AA against both ends.
- **Which archetypes:** default on for Transformer and Magician, subtle for Visionary, optional for Innocent and Lover, off for the rest. A founder can still turn them on.

## Accent sets

Palettes move from one Accent role to an accent set of 1–3 colors:
- **Count:** each archetype sets the default (see "At a glance").
- **Ratio:** accents share the existing 10% together. They don't each get 10%.
- **Order:** the first accent is the one used for UI primary and contrast checks. Others are for illustration, charts and highlights.

## Image sourcing

**Sources**
- **Wikimedia Commons** (the image library behind Wikipedia). No key needed. Only freely licensed files: public domain, CC0, CC BY and CC BY-SA. Anything non-commercial or no-derivatives is skipped.
- **Unsplash API.** Needs an Access Key that you set up and put in `.env.local`. The key never goes in the code or in chat.

**Rules both sources impose** (these are API terms, not preferences):
- **Credit:** show the photographer and source next to every image, with links. KAI already does this for its current Commons photos.
- **Unsplash hotlinking:** show Unsplash images from the URLs the API returns. Don't download and re-host them.
- **Unsplash download count:** when an image is actually used (picked for a moodboard or exported), call Unsplash's download endpoint. Unsplash requires this.
- **Rate limits:** Unsplash demo keys allow 50 requests an hour. Production approval raises this to 5,000. Results should be cached per brief.

**Built (Nov 9, 2026)** in `src/app/imageSearch.js`:
- **Order:** hand-picked photos (`referenceImages.json`) first, then Unsplash, then Commons.
- **Search scope:** only labels actually on screen or exported are searched.
- **Caching:** results are cached in the browser for a week. Misses, and results found before a key existed, are kept for a day only.
- **Download notice:** sent to Unsplash when a photo is locked, or exported to PDF or PowerPoint.
- **Commons quality:** Commons matches are literal (often event or news photos), so Unsplash gives noticeably better moodboards.

**Where the key lives:** local dev keeps the key on the dev server, which passes requests through to Unsplash. A deployed version needs a small server function for this. **That's engineer work.**

## Generation model

### A. Choosing the archetype: recommended
1. KAI scores all 16 from the brief.
2. KAI shows the top 3 with the reason for each ("Your answers to *Why this matters* and *Emotional tone* point to Champion").
3. The founder confirms or swaps them.

This keeps the AI legible and gives a clear point to step in.

**Signals per archetype** (fields the brief already asks):

| Archetype | Strongest brief signals |
|---|---|
| Protector | Emotional value mentions safety, trust or care; regulated or health contexts |
| Everyman | Broad audience; "simple", "for everyone"; switching from spreadsheets |
| Sage | Expertise, data, advice; "accurate", "trusted source" |
| Ruler | Premium pricing, enterprise top tier; "best in class", "exclusive" |
| Magician | "Feels like magic"; the aha moment is automation that seems impossible |
| Rebel | Strong "Why current solutions fall short"; an anti-incumbent stance |
| Transformer | Workflow change, modernization, "adapt", "agile" |
| Champion | A cause in "Why this matters"; impact or sustainability |
| Builder | Infrastructure, operations, systems, reliability; legacy industries |
| Visionary | Category creation; "future of", "next generation" |
| Innocent | "Simple", "honest", "easy"; first-time or non-expert users |
| Explorer | Field work, mobility, remote sites; "freedom", "discover" |
| Lover | Hospitality, beauty, client relationships; "feel valued" |
| Jester | Playful tone words; consumer-facing or young audience |
| Hero | Performance, speed, winning; "beat", "fastest", "outperform" |
| Creator | Making, designing, building things; tools for creative work |

### B. How the 3 options relate: built (Nov 9, 2026)
Options aren't limited to one archetype. Each option is a **blend of 1–3 archetypes**, and the brief decides how many:
- **Option 1, the recommendation:** every archetype scoring within 75% of the top score, up to three. A clear winner stands alone; close scores blend.
- **Options 2 and 3:** the strongest *different* blends. For example, the runner-up leading with the winner, or the winner with the third.
- **Different sets:** no two options use the same set of archetypes. "Builder + Explorer" and "Explorer + Builder" count as the same.
- **Weights:** set by the scores, and the lead always carries at least 55%, so each option has a clear character.

**What each archetype in a blend contributes**

| Piece | Comes from |
|---|---|
| Primary, surface, neutrals, wordmark, display font, interface shape | The lead |
| Primary hue | The lead, nudged slightly toward the second archetype when their hues are neighbors |
| Accent count | Weighted average of everyone's accent count, 1–3 |
| Accents | The first from the lead, the rest from the other archetypes |
| Body font | The second archetype, if it carries at least 30% |
| Voice | Two tone pairs from the lead, one from the second |
| Imagery | Split by weight |
| Gradient | The lead's setting, or "subtle" if a strong second archetype has gradients at its core |

**Readability guarantees built into the generator**
- **Primary** is darkened until white text passes AA.
- **UI primary** comes from the first accent, unless it would have to be darkened so far that it loses its color (yellows turn olive). Then the accent that holds up best is used, or the primary if none can.
- **Gradients:** the far end is chosen from the palette so the hero's text passes AA at both ends.

### C. Conflict rules: proposed
1. **The founder's explicit inputs win over archetype defaults.** This covers Color direction, Visuals to avoid, Words we can't use and avoided colors. When they conflict, flag it on the recommendation card: "Rebel usually runs high contrast; softened for your muted direction."
2. **Reference brands are for explanation only.** They never appear in output, and they're dropped from any card where they match one of the client's listed competitors.
3. **Accessibility wins over everything.** Contrast checks stay as they are today.

## Reasoning layers (built Nov 9, 2026: `src/app/layers.js`)

Archetypes alone decide too much: two different companies that both land on Builder get the same brand. Four more layers sit alongside personality. Each one changes specific decisions, and every decision records which layers shaped it, so the reason shown to the founder comes from several layers, not just the archetype.

**Approach:** rules first, running in the browser. A server-side model comes later, to read competitor sites (engineer work).

### How the layers combine
1. **Category** sets the starting point: what the industry usually looks like.
2. **Positioning** sets how far to move away from that starting point, and which competitor territory to avoid.
3. **Personality** (the archetype blend) sets the direction of the move: character, energy, voice.
4. **Audience** limits how far is safe: legibility, density, how conservative it is.
5. **Name and meaning** adds specific cues: a hue, imagery subjects, a wordmark detail.
6. **Constraints** are applied last, as hard filters: the founder's inputs, AA contrast, avoid lists.

### 1. Category conventions
- **Input:** industry. *Gap: the brief has no industry field. Recommend adding one to General (a picker plus "Other"), rather than guessing from the description.*
- **Rule table, one row per industry:**
  - Conventional hues
  - Conventional type style
  - Imagery clichés to avoid
  - Typical archetypes
- **Example rows:**
  - **Construction:** safety yellow or orange, heavy grotesk. Clichés: hard hats, cranes. Typical: Builder, Hero.
  - **Fintech:** navy or teal, geometric sans. Clichés: coins, handshakes. Typical: Sage, Ruler, Visionary.
  - **Healthcare:** blue or green, rounded sans. Clichés: stethoscopes, smiling doctors. Typical: Protector, Sage.
- **Changes:** the starting palette and type, and image labels to skip.

### 2. Positioning vs competitors
- **Inputs:**
  - Competitors and alternatives
  - Why current solutions fall short
  - What makes you different
  - How strong the stance is: Rebel or Transformer scores, wording like "outdated" or "broken"
- **Output, a distinctiveness dial from 0 to 1:**
  - **0, conform:** a trusted alternative that looks like the category, done better.
  - **1, break:** a challenger that deliberately breaks category conventions.
- **Competitor colors:**
  - **Rules-only version:** an optional "Their main color" swatch next to each competitor in the brief.
  - **Model version, later:** read the competitor's site and pull its colors automatically.
  - **Either way:** Primary stays clear of competitor hues; colors that are too close get rotated.
- **Changes:**
  - How far Primary moves from the category hue (dial × distance)
  - Whether the wordmark and type follow or break category style
  - The positioning sentence in the recommendation

### 3. Audience
- **Inputs:** who feels it most (buyer or operator), buyer and operator roles, what they care about, their motivation.
- **Profiles (rule table):**
  - **Field and operational users:** high contrast, larger type, sturdy shapes, less subtlety.
  - **Executive and procurement buyers:** conservative. The dial is capped at 0.6, and proof and clarity get prioritized in the voice.
  - **Technical users:** denser layout, a mono or technical secondary font is allowed, precise voice.
  - **Broad or consumer users:** friendlier, more color.
- **Changes:** a minimum contrast target (AA or AAA), the type size scale, how conservative the archetype pick is (for example, Rebel can only be blended in), and the voice.

### 4. Name and meaning
- **Inputs:** the working name and "Name meaning, metaphor, or origin".
- **A lexicon of cue words.** Each word maps to a hue, imagery subjects and a wordmark cue. For example:
  - **iron, steel, forge:** oxide or graphite; metal and forge imagery.
  - **river, wave, tide:** blue-teal; water imagery; flowing letterforms.
  - **light, sun, lumen:** warm yellow accent; light imagery.
  - **root, grove, seed:** green; nature imagery.
  - **north, peak, summit:** cool tones; landscape imagery.
- **Changes:** a hue pulled into Primary or an accent, extra image labels, and one wordmark note.

### Reasons travel with each decision
Every decision records the layers behind it, for example:
```
primary: { hex, reasons: [
  { layer: "category",    text: "Construction usually leans safety yellow" },
  { layer: "positioning", text: "Two competitors use yellow, and you're the modern alternative, so moved away" },
  { layer: "personality", text: "Builder keeps it grounded: deep green" },
  { layer: "audience",    text: "Procurement buyers: kept conservative" } ] }
```
The recommendation text is built from these, and the moodboard and palette can show a reason for each piece.

### Decisions (Nov 9, 2026)
- **Industries:** startups can be in any industry. The rules cover 14 broad families; "Other" skips the category layer until the model exists.
- **Brief:** an Industry dropdown was added to General, and an optional main-color swatch next to each competitor.
- **Fitting in vs standing out:** a brand meant to fit its category keeps the category color as an accent, not as the primary, because pulling the primary across the color wheel made muddy colors. A brand meant to break from the category drops any accent in the category's hues.
- **Not built yet:** type and wordmark don't yet follow or break category style. Only color, imagery, voice and contrast respond to the layers.

## Still open

1. **Choosing:** do you accept A, where KAI suggests the top 3 and the founder confirms? (Increment 3; until then, the founder sees the three blends directly.)
2. **Merges:** do you agree with merging Caregiver into Protector and Outlaw into Rebel, with the PDF's names leading?
3. **Moodboard readings:** do the visual readings match your intent, especially Transformer vs Visionary?
4. **Classic six:** do the drafts for Innocent, Explorer, Lover, Jester, Hero and Creator work for you?

## Keeping the PDF out of the repo

The PDF stays outside the repo because its moodboard images likely aren't licensed for redistribution, and the GitHub remote may be shared. Only the text above is committed.
