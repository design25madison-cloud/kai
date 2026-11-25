import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

// generate.js reaches referenceImages.js, which only runs under Vite: import.meta.glob finds the
// photo files and a bare JSON import needs an attribute in Node. Stand both in here, no new deps.
// Photo colors are read from a canvas in the browser, so here they come from globalThis.photoColors
// (label → [{ hex, share }]) when a test sets it, and photos have no colors otherwise.
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith("/imageColors.js")) {
      const source = 'import { hexToOklch } from "./color.js"; export const imageColors = (label) => { const c = globalThis.photoColors && globalThis.photoColors(label); return c ? c.map((x) => ({ ...x, lch: hexToOklch(x.hex) })) : null; };';
      return { format: "module", shortCircuit: true, source };
    }
    const out = nextLoad(url, context);
    if (!url.endsWith("/referenceImages.js")) return out;
    const source = String(out.source).replace(/import\.meta\.glob\([^)]*\)/, "({})").replace('from "./referenceImages.json";', 'from "./referenceImages.json" with { type: "json" };');
    return { ...out, source };
  },
});
const { generateDirections } = await import("./generate.js");
const { INDUSTRIES } = await import("./layers.js");
const { ARCHETYPE_BY_ID } = await import("./archetypes.js");

const brief = (f = {}, tone = [], sl = {}) => ({
  f: { name: "", ...f }, tone, sl: { warmth: 50, energy: 50, serious: 50, ...sl }, looks: {},
  avoidC: [], keepC: [], avoidT: [], banned: [], comps: [], refs: [], refTags: {}, keep: 40,
});
const briefs = [
  ["blank", brief()],
  ...INDUSTRIES.map((ind) => [ind.id, brief({ name: "Ferra", industry: ind.id })]),
  ["sturdy, serious", brief({ name: "Ferra", meaning: "Fe, iron: strength that holds under load." }, ["Sturdy", "Industrial", "Precise"], { warmth: 35, energy: 45, serious: 70 })],
  ["playful, warm, bold", brief({ name: "Pip" }, ["Playful", "Warm", "Bold"], { warmth: 10, energy: 90, serious: 10 })],
  ["calm, minimal", brief({ name: "Still" }, ["Calm", "Minimal"], { warmth: 80, energy: 10, serious: 60 })],
];

// BrandApp.optionData reads these on every screen that shows directions, so a miss throws in render.
test("every brief gives directions the view model can render", () => {
  for (const [label, state] of briefs) {
    const { directions } = generateDirections(state, () => null);
    assert.equal(directions.length, 3, label);
    directions.forEach((d, k) => {
      d.palettes.forEach((pal) => {
        const roles = pal.map((c) => c[2]);
        for (const role of ["Primary", "Surface", "Neutral light"]) assert.ok(roles.includes(role), `${label}, option ${k + 1}: no ${role}`);
      });
      assert.ok(d.images.length >= 4, `${label}, option ${k + 1}: ${d.images.length} images`);
    });
    const firstFour = directions.flatMap((d) => d.images.slice(0, 4).map((im) => im[0]));
    assert.deepEqual(firstFour.filter((l, i) => firstFour.indexOf(l) !== i), [], `${label}: a photo repeats in the first four`);
  }
});

// Projects store their directions as JSON (BrandApp.storeDirs), so nothing may be lost on the way.
test("directions survive JSON unchanged", () => {
  for (const [label, state] of briefs) {
    const { directions } = generateDirections(state, () => null);
    assert.deepStrictEqual(JSON.parse(JSON.stringify(directions)), directions, label);
  }
});

test("the explanation only claims what the result shows", () => {
  let cues = 0;
  for (const [label, state] of [...briefs, ["ember", brief({ name: "Ember & Vine", industry: "food" })], ["river", brief({ name: "Riverbend", industry: "finance" }, ["Playful", "Bold"])]]) {
    const { directions } = generateDirections(state, () => null);
    assert.ok(directions.filter((d) => /most closely/.test(d.fit)).length <= 1, `${label}: more than one option fits "most closely"`);
    for (const d of directions) {
      const claim = d.layers.find((l) => l.layer === "Name");
      if (!claim) continue;
      cues++;
      // The name is credited with the palette only when buildPalette says it used it.
      assert.equal(/into the palette/.test(claim.text), d.primaryReasons.some((r) => r.layer === "Name"), `${label}: ${claim.text}`);
    }
  }
  assert.ok(cues > 0, "no brief had a name cue");
});

const { hexToOklch, colorName, hexToHsl } = await import("./generate.js");
const hueOf = (hex) => hexToOklch(hex)[2];
const near = (h, target, tol) => Math.abs(((h - target + 540) % 360) - 180) <= tol;

test("named colors in the color direction lead the palette", () => {
  const cases = [
    // [color direction, primary hue, hues that must appear among the accents]
    ["Charred red-orange and deep vine green", 40, [145]],
    ["fox orange, paper cream and ink blue with a touch of moss", 55, [262]],
    ["deep teal and wind-blue with one electric lime accent", 195, [262, 125]],
  ];
  for (const [colorDir, primary, accents] of cases) {
    const { directions } = generateDirections(brief({ colorDir }), () => null);
    for (const d of directions) {
      const pal = d.palettes[0];
      assert.ok(near(hueOf(pal[0][1]), primary, 20), `${colorDir}: primary ${pal[0][1]}`);
      for (const h of accents) assert.ok(pal.slice(4).some((r) => near(hueOf(r[1]), h, 20)), `${colorDir}: no accent near ${h} in ${pal.map((r) => r[1])}`);
    }
  }
  // A pale neutral sets the surface, and the mood words still reach adjust, as modifiers and on their own.
  const fox = generateDirections(brief({ colorDir: "fox orange, paper cream" }), () => null).directions[0].palettes[0];
  assert.ok(hexToOklch(fox[1][1])[0] > 0.9 && near(hueOf(fox[1][1]), 90, 15), `surface ${fox[1][1]}`);
  const asked = [];
  generateDirections(brief({ colorDir: "deep teal, warmer and muted" }), (hex, t) => { asked.push(t); return null; });
  assert.ok(asked.includes("deep") && asked.includes("warmer, muted") && !asked.some((t) => /teal/.test(t)), asked.join(" | "));
});

test("the first kept color is the primary as typed, and the text names only colors in the palette", () => {
  const dark = generateDirections({ ...brief(), keepC: ["#7a1f2e"] }, () => null).directions;
  dark.forEach((d) => assert.equal(d.palettes[0][0][1], "#7A1F2E"));
  const light = generateDirections({ ...brief(), keepC: ["#E8A33D"] }, () => null).directions;
  light.forEach((d) => assert.ok(d.primaryReasons.some((r) => /darkened to #[0-9A-F]{6}/.test(r.text)), "a darkened keep color says so"));
  const keepC = ["#5E1782", "#C0392B", "#6F4E37", "#F5EBDC", "#111111", "#FFBF00", "#228B22", "#1E50A0", "#FF00FF", "#00FFFF", "#FF8000"];
  for (const d of generateDirections({ ...brief(), keepC }, () => null).directions) {
    const hexes = d.palettes[0].map((r) => r[1]), text = d.layers.find((l) => l.layer === "Seeds").text;
    const named = text.match(/#[0-9A-F]{6}/g);
    assert.equal(d.palettes[0][0][1], "#5E1782");
    named.forEach((h) => assert.ok(hexes.includes(h), `${text}: ${h} is not in the palette`));
    assert.match(text, new RegExp(`${keepC.length - named.length} of your 11 colors were left out`));
  }
});

test("Sans or Serif picks the type, and look chips appear only when the result follows them", () => {
  const SERIF = /Serif|Garamond|Bodoni|Playfair|Fraunces|Newsreader|Caslon|Cormorant|Slab/;
  for (const [label, state] of [...briefs, ["calm, precise", brief({}, ["Calm", "Precise"])]]) {
    for (const want of ["a", "b"]) {
      const { directions } = generateDirections({ ...state, looks: { 0: want, 1: want } }, () => null);
      for (const d of directions) {
        const serif = SERIF.test(d.display), sansPair = !serif && !SERIF.test(d.body);
        // Wherever the mix's font lists have a face that fits, the pick decides it.
        const fonts = (k) => d.mix.flatMap((m) => ARCHETYPE_BY_ID[m.id][k]);
        if (want === "a" && fonts("display").some((f) => SERIF.test(f))) assert.ok(serif, `${label}: Serif pick gave ${d.display}`);
        if (want === "b" && fonts("display").some((f) => !SERIF.test(f))) assert.ok(!serif, `${label}: Sans pick gave ${d.display}`);
        assert.equal(d.match.includes(want === "a" ? "Serif" : "Sans"), want === "a" ? serif : sansPair, `${label}: ${d.match}`);
        const lch = [d.palettes[0][0]].concat(d.palettes[0].slice(4)).map((r) => hexToOklch(r[1])).filter((c) => c[1] > 0.04);
        const warm = lch.filter((c) => c[2] < 110 || c[2] > 330).length / (lch.length || 1);
        const looksWarm = lch.length > 0 && (want === "a" ? warm >= 0.5 : warm <= 0.5);
        if (!state.tone.includes("Warm")) assert.equal(d.match.includes(want === "a" ? "Warm" : "Cool"), looksWarm, `${label}: ${d.match}`);
      }
    }
  }
});

test("an operator description that matches no keyword sets no audience", () => {
  const plain = generateDirections(brief({ who: "operator", opRole: "Store manager", opTeam: "Retail" }), () => null).directions;
  plain.forEach((d) => assert.ok(!d.layers.some((l) => l.layer === "Audience"), d.layers.map((l) => l.text).join(" ")));
  const crew = generateDirections(brief({ who: "operator", opRole: "Site foreman" }), () => null).directions;
  assert.ok(crew.some((d) => d.layers.some((l) => /field and operational/.test(l.text))));
  // The same for a buyer: "parents" aren't executive buyers, a procurement lead is.
  const parents = generateDirections(brief({ who: "buyer", buyerRole: "Parents and gift buyers" }), () => null).directions;
  parents.forEach((d) => assert.ok(!d.layers.some((l) => l.layer === "Audience"), d.layers.map((l) => l.text).join(" ")));
  const exec = generateDirections(brief({ who: "buyer", buyerRole: "Head of procurement" }), () => null).directions;
  assert.ok(exec.some((d) => d.layers.some((l) => /executive and procurement/.test(l.text))));
});

test("option names differ within a set, and Regenerate tries what other options don't show", () => {
  const chips = ["Warm", "Bold", "Precise", "Minimal", "Calm", "Playful", "Sturdy", "Industrial"];
  for (let i = 0; i < chips.length; i++) for (let j = i + 1; j < chips.length; j++) {
    const { directions } = generateDirections(brief({}, [chips[i], chips[j]]), () => null);
    const names = directions.map((d) => d.name);
    assert.equal(new Set(names).size, 3, `${chips[i]} + ${chips[j]}: ${names}`);
    for (const key of ["types", "voices"]) directions.forEach((d, k) => {
      const shown = directions.filter((_, x) => x !== k).map((o) => JSON.stringify(o[key][0]));
      assert.ok(!d[key].slice(1).some((v) => shown.includes(JSON.stringify(v))), `${chips[i]} + ${chips[j]}: option ${k + 1} ${key} repeats another option`);
    });
  }
});

test("the three options, and each option's variants, look different around the primary", async () => {
  const { rgbDistance } = await import("./generate.js");
  // Distance per role other than the primary; a role only one side has counts as fully different.
  const apart = (A, B) => [...new Set([...A, ...B].map((r) => r[2]))].filter((role) => role !== "Primary").map((role) => {
    const a = A.find((r) => r[2] === role), b = B.find((r) => r[2] === role);
    return [role, a && b ? rgbDistance(a[1], b[1]) : 255];
  });
  const keeps = ["#1E50A0", "#7A1F2E", "#2E6B4F"];
  for (const [label, state] of [...briefs, ...briefs.map(([l, s], k) => [`${l}, keeps ${keeps[k % 3]}`, { ...s, keepC: [keeps[k % 3]] }])]) {
    const D = generateDirections(state, () => null).directions;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
      const ds = apart(D[i].palettes[0], D[j].palettes[0]).map((x) => x[1]);
      assert.ok(ds.reduce((n, x) => n + x, 0) / ds.length >= 20, `${label}: options ${i + 1} and ${j + 1} are near-identical around the primary`);
      // Without kept colors, two colored primaries don't share a hue family.
      const [a, b] = [D[i], D[j]].map((d) => hexToOklch(d.palettes[0][0][1]));
      if (!state.keepC.length && a[1] >= 0.04 && b[1] >= 0.04) assert.ok(!near(a[2], b[2], 30), `${label}: options ${i + 1} and ${j + 1} share a primary hue`);
    }
    // Regenerate with a few colors locked must still visibly change every other role. Near-white
    // neutrals can only move a little.
    D.forEach((d, k) => d.palettes.forEach((A, a) => d.palettes.slice(a + 1).forEach((B) => {
      for (const [role, x] of apart(A, B)) assert.ok(x >= (role === "Neutral light" ? 5 : 10), `${label}, option ${k + 1}: ${role} barely changes between variants (${A.map((r) => r[1])} / ${B.map((r) => r[1])})`);
    })));
  }
});

test("with photos and a kept color, each option's route still sets its neutrals", () => {
  // Muted, mostly warm photos, like the bundled fallback ones.
  globalThis.photoColors = () => [{ hex: "#C9B48A", share: 0.4 }, { hex: "#7A8C9E", share: 0.3 }, { hex: "#A8B060", share: 0.2 }, { hex: "#2E3A44", share: 0.1 }];
  try {
    const kept = hueOf("#1E50A0");
    for (const [label, sl, looks] of [["no lean", {}, {}], ["professional slider", { warmth: 80 }, {}], ["Cool look", {}, { 0: "b" }]]) {
      const D = generateDirections({ ...brief({ name: "Ferra", industry: "software" }, [], sl), looks, keepC: ["#1E50A0"] }, () => null).directions;
      assert.ok(D.some((d) => d.primaryReasons.some((r) => r.layer === "Imagery")), `${label}: the photos weren't read`);
      const surfaces = D.map((d) => hexToOklch(d.palettes[0][1][1]));
      // A blue primary: the tonal option's surface leans blue, the temperature option's leans warm.
      assert.ok(surfaces.some((c) => near(c[2], kept, 30)), `${label}: no surface tinted toward the primary (${D.map((d) => d.palettes[0][1][1])})`);
      assert.ok(surfaces.some((c) => c[2] < 110 || c[2] > 330), `${label}: no warm counterpoint surface (${D.map((d) => d.palettes[0][1][1])})`);
    }
  } finally {
    delete globalThis.photoColors;
  }
});

test("color names fit their swatch", () => {
  const name = (hex) => colorName(hexToHsl(hex));
  assert.equal(name("#FFFBF7"), "Paper");
  assert.equal(name("#C7986F"), "Tan");
  assert.equal(name("#111111"), "Ink");
  assert.doesNotMatch(name("#E5DDCE"), /rust|orange/i);
});
