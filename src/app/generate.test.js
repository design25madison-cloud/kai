import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

// generate.js reaches referenceImages.js, which only runs under Vite: import.meta.glob finds the
// photo files and a bare JSON import needs an attribute in Node. Stand both in here, no new deps.
// shortcut: no photo files means no photo colors, so the photo-steered palette paths aren't covered; run this through Vite if they need to be.
registerHooks({
  load(url, context, nextLoad) {
    const out = nextLoad(url, context);
    if (!url.endsWith("/referenceImages.js")) return out;
    const source = String(out.source).replace(/import\.meta\.glob\([^)]*\)/, "({})").replace('from "./referenceImages.json";', 'from "./referenceImages.json" with { type: "json" };');
    return { ...out, source };
  },
});
const { generateDirections } = await import("./generate.js");
const { INDUSTRIES } = await import("./layers.js");

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
      assert.equal(/palette and imagery/.test(claim.text), d.primaryReasons.some((r) => r.layer === "Name"), `${label}: ${claim.text}`);
    }
  }
  assert.ok(cues > 0, "no brief had a name cue");
});
