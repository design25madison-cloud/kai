import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { FONTS, editContext, editProposal, honestAAA } from "./edits.js";

const d = {
  colors: [{ name: "Forest", show: "#245A46" }, { name: "Sand", show: "#F8F1E8" }, { name: "Amber", show: "#DA9B4E" }],
  ui: "#9B6C37", uiMix: 30, uiRatio: "4.57", wordFont: "Anta", track: 3, trackPx: "3px", display: "Archivo", body: "Barlow",
  toneArr: [["Clear", "dry"]], headline: "Run the yard.", micro: "Save", imgs: [["Quarry", "wiki", false], ["Sand dune", "wiki", true]],
};
const base = { name: "Rugged systems", images: [["Quarry", "wiki"], ["Sand dune", "wiki"]], imgPool: [["Blueprint", "unsplash"]] };
const brief = { f: { name: "Ferra", desc: "Steel." }, tone: ["Sturdy"], banned: [] };

test("the request names only the pieces that may change", () => {
  const ov = { swLock: [false, true, false] };
  assert.deepEqual(editContext({ c: { sec: "palette", target: 2, text: "warmer" }, d, base, ov, ...brief }).ctx.targets, [2]);
  // A whole-palette edit leaves locked colors alone.
  assert.deepEqual(editContext({ c: { sec: "palette", text: "warmer" }, d, base, ov, ...brief }).ctx.targets, [0, 2]);
  // A whole-imagery edit leaves locked photos alone, and offers the rest of the pool.
  const refs = editContext({ c: { sec: "refs", text: "more water" }, d, base, ov, ...brief }).ctx;
  assert.deepEqual([refs.targets, refs.pool], [[0], ["Blueprint", "Quarry", "Sand dune"]]);
  assert.ok(FONTS.includes("IBM Plex Sans") && FONTS.length > 20);
});

test("a change becomes a proposal that locks what it touched", () => {
  const colors = editProposal({ c: { sec: "palette", target: 0 }, d, base, ov: { swLock: [false, true] }, change: { summary: "Navy.", colors: [{ index: 0, hex: "#1F3A5F", name: "Navy" }] } });
  assert.deepEqual(colors.before, ["#245A46", "#F8F1E8", "#DA9B4E"]);
  assert.deepEqual(colors.patch, { hex: ["#1F3A5F", "#F8F1E8", "#DA9B4E"], names: ["Navy", "Sand", "Amber"], swLock: [true, true] });

  const images = editProposal({ c: { sec: "refs" }, d, base, ov: {}, change: { summary: "Swapped.", swaps: [{ index: 0, label: "Blueprint" }] } });
  assert.deepEqual(images.swaps, [["Quarry", "Blueprint"]]);
  assert.deepEqual(images.patch.images, [["Blueprint", "unsplash", true], ["Sand dune", "wiki", true]]);

  const word = editProposal({ c: { sec: "word" }, d, base, ov: { lock: { type: true } }, change: { summary: "Wider.", font: "Anta", track: 6 } });
  assert.deepEqual(word.patch, { wordFont: "Anta", track: 6, lock: { type: true, word: true } });
});

test("the converter installs every typeface a direction can use", () => {
  // converter/fonts.txt is what the PDF export can show. Add a typeface to an archetype, add it there.
  const installed = readFileSync(new URL("../../converter/fonts.txt", import.meta.url), "utf8").trim().split("\n");
  assert.deepEqual(installed, FONTS);
});

test("an AAA claim is restated with the real ratio once the primary no longer reaches it", () => {
  const audience = "For field and operational users, white text on the primary reaches AAA (7:1).";
  assert.equal(honestAAA(audience, 7.4), audience);
  assert.equal(honestAAA(audience, 4.912), "For field and operational users, white text on the primary is 4.91:1, short of AAA (7:1).");
  assert.equal(honestAAA("For field users: pushed contrast to AAA and kept the voice plain.", 4.5), "For field users: aimed for AAA contrast (white text on the primary is now 4.50:1) and kept the voice plain.");
  assert.equal(honestAAA("Reads warm.", 2), "Reads warm.");
});
