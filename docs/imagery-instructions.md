# KAI image selection

How KAI chooses the six reference photos for each brand direction.
- **Built:** works in the prototype today.
- **Spec:** intended production behavior, not built yet.

## The principle
**Imagery expresses the brand, not the business.**
- **Photos carry mood:** material, texture, light, landscape, form, gesture.
- **Photos never show what the company does:**
  - No workplaces, equipment or products
  - No people doing the company's work
  - Nothing that pictures the founder's own industry

**Example:** a food manufacturer whose brand reads as sturdy and precise gets "Steel lattice", "Wire mesh" and "Concrete wall", not a container yard or a kitchen.

## 1. Gather subjects
A subject is a short description of a mood photo, such as "Forest canopy" or "Brushed steel".
- **Archetypes (Built):** each archetype in the direction's blend contributes its 8–9 curated mood subjects.
- **Name cue (Built):** 2 subjects carrying the name's meaning as a material or landscape. For example, "iron" brings "Iron texture" and "Rust bloom".
- **Admired references (Spec):** their subjects go first.
- **The industry contributes no subjects.** It's used only to filter (step 2).

## 2. Remove anything literal or ruled out
- **Literal subjects (Built):** drop any subject that pictures a business: workplaces, equipment, products or people at work (container, warehouse, server, factory, kitchen, product, clinic and so on). This applies whatever the industry.
- **The founder's industry (Built):** drop any subject containing that industry's words. For construction that's "hard hat", "crane" and "blueprint".
- **Visuals to avoid (Spec):** drop any subject matching a phrase from the brief's "Visuals to avoid".
- **Avoided references (Spec):** drop any subject matching an avoided reference.

## 3. Fill six slots (Built)
1. **Share by weight.** Archetypes share the slots by weight; each slot goes to the archetype furthest behind its share.
2. **Interleave.** Alternate lead, second, lead and so on, so the first photos already show the blend.
3. **Name cue slot.** Slot 4 is the name cue's photo.
4. **No repeats.** No two options open on the same photos: photos an earlier option shows first go to the back of later lists.
5. **The rest** form a pool for Swap and Regenerate, ordered by palette fit.

## 4. Search each subject
- **Query:**
  - **Built:** the subject, word for word.
  - **Spec:** the subject plus up to two mood modifiers from the tone ("warm light", "minimal", "vibrant", "dramatic"). Never industry, product, brand or competitor words.
- **Sources (Built):**
  1. **Unsplash, always first.** Search up to 5 results and take the first that clears the quality bar:
     - The short edge is at least 1600 px.
     - It isn't an Unsplash+ (paid) photo.
  2. **Wikimedia Commons, only as a fallback,** when Unsplash has no result that clears the bar, or no key is configured:
     - **First,** KAI's hand-picked Commons photos (40 bundled with the app).
     - **Then** Commons search: free licenses only (public domain, CC0, CC BY, CC BY-SA), at least 1600 px wide.
- **No result:** keep the subject as a labeled empty tile. Never substitute an unrelated photo.

## 5. Pick the best result
- **Built:** the first result that passes the source's quality bar.
- **Spec:** compare up to 5 results:
  1. **Exclude:**
     - Anything that pictures a business (step 2's rule, applied to the photo itself)
     - Logos and readable text
     - News or event photos of identifiable people
     - Anything matching "Visuals to avoid"
  2. **Prefer the best fit** with the direction's palette.
  3. **Then prefer the best fit with the tone:** brightness and saturation.
  4. **Tie-break** on the source's own relevance order.

## 6. Rules if a model runs this
1. Photos express the brand's mood. Never picture the company's work, workplace, equipment, products or industry.
2. Pick exactly six subjects per direction, using the slot rules above and the curated subjects provided.
3. Never pick anything literal, matching "Visuals to avoid", or matching an avoided reference.
4. A query is the subject plus at most two tone modifiers. Never use industry, product or brand words.
5. Use Unsplash first. Use Wikimedia Commons only when Unsplash has nothing that clears the quality bar.
6. Give a one-sentence reason per photo naming the brand quality it carries.
7. If nothing fits, return the subject with no photo.

## For the developer: Unsplash API key
1. Create an app and get an **Access Key** at **https://unsplash.com/developers**. Demo keys allow 50 requests an hour; apply for production access to raise it to 5,000.
2. **Keep the key on a server.** Never put it in browser code or commit it.
   - **Locally:** set `UNSPLASH_ACCESS_KEY=…` in `.env.local` (gitignored). The Vite dev server proxies `/api/unsplash/*` and attaches the key (`vite.config.js`).
   - **In production:** replace that proxy with a small server function that adds `Authorization: Client-ID <key>` to requests to `api.unsplash.com`.
3. **Unsplash's API terms apply:**
   - Show photos from the URLs the API returns; don't re-host them.
   - Credit "Photo by [name] on Unsplash", with links carrying `utm_source` and `utm_medium=referral`.
   - Call the photo's download endpoint when a photo is actually used (locked or exported).
4. **Without a key,** KAI falls back to Wikimedia Commons automatically.
