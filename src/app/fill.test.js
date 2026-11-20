import assert from "node:assert/strict";
import { test } from "node:test";
import { applyFill, suggestedKeys } from "./fill.js";

const empty = () => ({ f: { name: "", desc: "", who: "operator" }, tone: [], sl: { warmth: 50, energy: 50, serious: 50 }, looks: {} });
const after = (state, patch) => ({ ...state, ...patch });

test("suggestions fill empty answers and are remembered as suggestions", () => {
  const state = empty();
  const { patch, filled } = applyFill(state, { f: { name: "Ferra", who: "buyer" }, tone: ["Sturdy"], sl: { warmth: 80 } });
  assert.equal(filled, 4);
  assert.deepEqual([patch.f.name, patch.f.who, patch.tone], ["Ferra", "buyer", ["Sturdy"]]);
  assert.deepEqual(patch.sl, { warmth: 80, energy: 50, serious: 50 });
  assert.deepEqual(suggestedKeys(after(state, patch)).sort(), ["f.name", "f.who", "sl", "tone"]);
});

test("an answer the person typed is never replaced", () => {
  const state = { ...empty(), f: { name: "My name", desc: "" }, tone: ["Bold"] };
  const { patch, filled } = applyFill(state, { f: { name: "Ferra", desc: "Makes steel." }, tone: ["Sturdy"] });
  assert.equal(filled, 1);
  assert.deepEqual([patch.f.name, patch.f.desc, patch.tone], ["My name", "Makes steel.", undefined]);
});

test("running it again refreshes untouched suggestions but keeps edited ones", () => {
  let state = empty();
  state = after(state, applyFill(state, { f: { name: "Ferra", desc: "Makes steel." } }).patch);
  state = { ...state, f: { ...state.f, desc: "Makes steel, edited by me." } };

  const { patch, filled } = applyFill(state, { f: { name: "Ferra Inc", desc: "A new description." } });
  assert.equal(filled, 1);
  assert.deepEqual([patch.f.name, patch.f.desc], ["Ferra Inc", "Makes steel, edited by me."]);
  assert.deepEqual(suggestedKeys(after(state, patch)), ["f.name"]);
});

test("confirmed answers count as the person's own", () => {
  let state = empty();
  state = after(state, applyFill(state, { f: { name: "Ferra" } }).patch);
  state = { ...state, sugg: {}, confirmed: true }; // What "Confirm all" does.
  const { patch, filled } = applyFill(state, { f: { name: "Something else" } });
  assert.equal(filled, 0);
  assert.equal(patch.f.name, "Ferra");
});
