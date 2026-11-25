import assert from "node:assert/strict";
import { test } from "node:test";
import { INDUSTRIES } from "./layers.js";
import { COPY, KIND, briefCopy } from "./briefCopy.js";
import { ARCHETYPES, TONE_CHIPS } from "./archetypes.js";

test("every industry gets a wording set with the same keys, and an unknown one gets the neutral set", () => {
  const keys = Object.keys(COPY.both).sort();
  for (const { id } of INDUSTRIES) {
    assert.ok(COPY[KIND[id]], `${id} has a kind of customer`);
    assert.deepEqual(Object.keys(briefCopy(id)).sort(), keys, `${id} has every key`);
  }
  for (const id of ["", "other", "nonsense", "toString", null, undefined]) assert.deepEqual(briefCopy(id), COPY.both);
});

// score() in generate.js gives points for a tone word that is a TONE_CHIPS key or an archetype attribute.
test("every suggested tone word is one the generator scores", () => {
  const scored = (w) => TONE_CHIPS[w] || ARCHETYPES.some((a) => a.attributes.some((x) => x.toLowerCase() === w.toLowerCase()));
  for (const set of Object.values(COPY)) for (const w of set.tone) assert.ok(scored(w), `${w} is scored`);
});

test("a consumer industry leads with friendly tone words, a building one with sturdy ones", () => {
  assert.deepEqual(briefCopy("food").tone.slice(0, 2), ["Playful", "Warm"]);
  assert.equal(briefCopy("construction").tone[0], "Sturdy");
});
