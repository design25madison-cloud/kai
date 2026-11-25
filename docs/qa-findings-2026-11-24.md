# Hands-on test of the hosted app, 2026-11-24

Six test sessions on the deployed site (commit `c152b8b`), each acting as a designer working on one
new brand: a freelancer fintech, a hot sauce maker, a home care company, a brand with an awkward
name and inputs, a climate software startup, and a children's bookshop. 59 raw findings, merged
here into 39. The 16 most important were then traced to their cause in the code.

Status words:

- **Confirmed**: the code shows the cause.
- **By design**: the app does what the code intends; the question is whether the design is right.
- **Reported**: seen by a tester, cause not traced.

## Status after the fix rounds

Fixed: every finding except the ones listed below.

Left on purpose:
- 13: the meeting and handoff screens stay unreachable. The designers removed the "Take to meeting"
  button on Nov 2 (commit `5051dcb`), so it was not brought back.

Open, with the designers:
- 9, 10: photo mood and variety. Their unpushed photo work covers this.
- Archetype content: without a tagline the mockup headline, the voice samples and one trade-off line
  ("In B2B it needs...") still read like software.
- 7 (rest): two questions on the Tone step ("What feature gets users to try it first", the "aha
  moment") still read like software. The Customer step and the suggested words now follow the
  industry; that wording is in `src/app/briefCopy.js` for review.

Not reproduced: the clipboard write in 39.

Changes the designers should look at, because they alter what KAI generates:
- The first color to keep is the primary exactly as typed, and every kept color is read.
- "Color direction" understands color names.
- Each of the three options takes its own route for surface, neutrals and accents (tonal,
  opposite temperature, high contrast), so parchment-style surfaces set by the archetype mostly go,
  a cool brief gets one warm-neutral option, and photos no longer tint the neutrals.
- A customer description with no keyword sets no audience (no AAA contrast target, no cautious
  executive profile).
- Sans or Serif now decides the type pair; Warm or Cool steers palette temperature.

Small, by design: an empty project nobody touched is removed after 7 days; a cancelled AI edit still
counts against the daily limit; PDF and PowerPoint always export every section.

Not covered: file exports (nothing was downloaded), file uploads, the meeting and handoff screens
(unreachable, see 13), and real phones (narrow sizes were emulated).

## What held up

- No console errors and no failed requests in any session.
- Nothing typed was lost, including text typed under a second before a reload.
- Locks, edits and photos survived option switches, reloads and duplicating a project.
- Photo credits name the photographer and source, and their links are right.
- Accented letters and `&` render in every wordmark font tried; HTML typed into the brief is shown
  as text and never run.
- Rename, Duplicate, Undo after Regenerate, and "Back to results" worked.

## 1. The brief is not followed (seen in 5 of 6 sessions)

1. **The "Color direction" text does almost nothing.** Confirmed. "Charred red-orange and deep vine
   green" gave cobalt blue; "fox orange" gave green and blue. Only six words are understood (warm,
   cool or blue, light, dark or deep, bright, mute); color names match nothing.
   `src/app/BrandApp.jsx:99-109`
2. **A "color to keep" does not appear as typed.** Confirmed. The primary is pulled 60% toward the
   first keep color, because the control that sets the strength (`keep`) is not shown on any screen
   and stays at its default. Only the first three keep colors are read; the rest are dropped
   silently. The text still says "Built around your colors". `src/app/generate.js:326-327, 827, 835`
3. **Look-and-feel picks barely count.** By design. Picking Sans, Cool or Minimal only nudges which
   archetype leads; fonts come from that archetype's list. A brief that picked Sans got a serif
   recommendation in two sessions. `src/app/generate.js:143-149, 665-666`
4. **The explanation text claims things the result does not show.** Confirmed for three:
   - "'fire' in the name brings ember reds into the palette" is printed whether or not the cue was
     applied. `src/app/generate.js:585`
   - All three options say "It fits the character of your brief most closely".
     `src/app/generate.js:715`
   - After a color is edited by hand, its name ("Cobalt" on an orange) and the "reaches AAA" line
     stay as they were. Reported.
5. **Every brand is "For field and operational users".** Confirmed. The customer type defaults to
   "operator", and any text that matches no keyword is read as field work.
   `src/app/BrandApp.jsx:49`, `src/app/layers.js:50`

## 2. Sample content is generic

6. **The landing page and dashboard mockups use fixed business-software copy.** By design. A hot
   sauce got "Paperwork, finally simple." and a dashboard with "Active projects 48" and "Vendor
   review". The copy is a constant; the headline comes from the lead archetype.
   `src/screens/LandingMockup.jsx:4`, `src/screens/DashboardMockup.jsx:1-30`
7. **The brief form assumes a business-to-business company.** Reported. Tone chips include "Sturdy"
   and "Industrial"; the Customer step asks for an "Economic buyer" and "Operational user" with
   chips like ROI and Efficiency, for a bookshop.
8. **The company description is printed in full in the landing mockup** and again in the "Brief:"
   line under the recommendation. Confirmed. A 1,500-character description became 20 lines of hero
   text. `src/app/BrandApp.jsx:582`, `src/screens/LandingMockup.jsx:145`, `src/screens/Moodboard.jsx:147`

## 3. Photos and sameness

9. **Photos can feel cold or bleak for a warm brand.** Reported; this is the mood-only rule working
   as written. For a home care brand: fog with two faded figures walking away, cracked dry earth, a
   bare brick wall, a cracked palm. Almost no people, homes or care. The designers' photo brief
   (not yet in the repo) is meant to catch this.
10. **The same photos repeat across the three options, and Swap and Regenerate draw from a small
    pool.** Reported in three sessions. A swap often lands on a photo another option already shows.
11. **A photo tile briefly shows the previous option's photo under the new label and credit.**
    Confirmed as likely: the `<img>` is reused and keeps painting the old picture while the new one
    loads. `src/screens/RefImage.jsx:9`
12. **The three directions look alike.** Reported in three sessions: same color family, similar
    names ("Considered shelter", "Forward shelter"), and once two options with the identical name
    "Warm common ground".

## 4. Dead ends and missing pieces

13. **The meeting and handoff screens cannot be reached.** Confirmed. `openMeeting` exists but no
    screen calls it; the button was removed in an earlier commit (`5051dcb`), before this week's
    work. A project saved on either screen would also reopen at the welcome screen.
    `src/app/flow.js:158-171`, `src/app/projects.js:29`
14. **"Comment" is an AI edit request, not a note.** Reported. It always asks the AI to change the
    design, a finished one cannot be edited or removed, and the toast calls an edit "Comment 1".
    AI edits took from 40 seconds to over 2.5 minutes with no progress hint or cancel, and one
    reply said "the primary color at index 0".
15. **"Your mix" does not follow its source option.** By design: it is a copy made when the mix is
    created, and "Update your mix" rebuilds it. Nothing says when it is out of date. Its heading
    reads "Your mix: Your mix". Confirmed. `src/app/BrandApp.jsx:292, 407-419`, `src/screens/Moodboard.jsx:12`
16. **Hand edits cannot be undone, and they lock the part without saying so.** Reported. Undo exists
    only after Regenerate and after an accepted AI edit.

## 5. Getting around and saving

17. **Reload, Back and Forward always land on the project list.** By design: the app has no page
    addresses. Nothing is lost, but Back on a fresh tab would leave the site, and a project cannot
    be bookmarked or shared by link.
18. **Looking at a project marks it "Edited just now" and moves it to the front.** Switching tabs or
    options is saved on purpose (the app remembers where you were), so "Saving…" flickers on plain
    navigation. `src/app/projects.js:6-18`. A save on merely opening was reported but its cause is
    not traced.
19. **"Edit answers" strands the results.** By design, with gaps. After only looking at a brief
    step, the project card says "Brief step 3" and reopening lands on the brief. Changing one
    answer hides "Back to results" with no explanation. `src/app/projects.js:13-14, 28-36`
20. **"New brand" creates an empty project at once.** Reported. Leaving right away keeps an empty
    "Untitled brand" card; they pile up.
21. **Menus do not close on Escape or a click outside** (project card menu, Account, export).
    Confirmed: there is no handler. `src/app/projects.js:119-120`, `src/screens/ProjectChrome.jsx:27`,
    `src/screens/OutputScreen.jsx:53-54`

## 6. Narrow screens

22. **Phone width (375 px), results screen.** Reported. Lock and Comment buttons are always shown,
    overlap each other, stick out past the edge and cover text. The Account menu opens off the left
    edge. The header takes four rows. The recommended option's tab can be off screen.
23. **Tablet and phone.** Reported. The alphabet specimen runs out of its card, Compare shows one
    and a half options with no scroll hint, and the Customer step scrolls sideways on a phone. The
    project list is fine at every size.

## 7. Smaller defects

24. **An invalid color code adds the picker's default purple** with no error. Confirmed.
    `src/app/BrandApp.jsx:603-605`
25. **Typography Edit shows "Anta" for both fonts** and lists 8 fonts that leave out the current
    ones. Confirmed. `src/app/BrandApp.jsx:627`, `src/screens/TypographySection.jsx:27, 34`
26. **Wording.** Confirmed. "Lets get started" (`src/screens/WelcomeScreen.jsx:11`), "1 Core answers
    are missing" (`src/app/BrandApp.jsx:611`), "Generate direction" for three directions
    (`src/screens/BriefScreen.jsx:66`).
27. **Font labels show package names** such as `@fontsource/fraunces`. By design, as a developer
    hint. `src/screens/TypographySection.jsx:49, 57`
28. **A long name overflows** the card fan in the landing mockup and runs over "Overview" in the
    dashboard mockup. Reported.
29. **Dark preview.** Reported. The dark neutral swatch disappears against the dark background, and
    the toggle changes only the moodboard tile and deck thumbnails.
30. **Color names do not fit their swatch.** Reported. "Pale rust" is near white, "Rust" is a light
    tan.
31. **The contrast claim is stronger than the numbers.** Reported. Text says "pushed contrast to
    AAA" while the UI primary is 4.57:1, and 3.37:1 to 3.76:1 in dark mode with no warning.
32. **Required answers are not marked on their steps.** Reported. Next never objects; only Review
    shows what is missing, lists rows as "Answered" without their content, and leaves out "Visuals
    to avoid".
33. **"Visuals to avoid" ignores Enter** and runs the words together, unlike the other list fields.
    Reported.
34. **No limits or tidying in the brief.** Reported. 11 keep colors, 21 tone words and 16 competitor
    rows were accepted; blank competitor rows stay; a name of only spaces passes.
35. **Brief form details.** Reported. Customer inputs clip their text, the "+" beside a competitor's
    address has no label, an empty focused input has a red ring that looks like an error, and the
    color picker opens on purple.
36. **Export menu.** Reported. The default format is CLAUDE.md, and it does not say which direction
    it exports.
37. **Regenerate changes little.** Reported. With two colors locked, only one neutral changed, twice
    the same way. Regenerating voice or typography gave another option's exact result.
38. **The browser tab always says "KAI".** Reported.
39. **Seen once, cause unknown.** A wordmark drawn in the wrong font for a moment after switching
    options, and a clipboard write reported by the test tool during one photo Swap.
