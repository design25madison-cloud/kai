import assert from "node:assert/strict";
import { test } from "node:test";
import { INDUSTRIES } from "./layers.js";
import { mockCopy } from "./mockCopy.js";

// The structure of a value with the text left out: same keys, same list lengths, same types.
const shape = (v) => (Array.isArray(v) ? v.map(shape) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])])) : typeof v);

test("every industry has a full mockup copy set shaped like the default", () => {
  const base = mockCopy("");
  for (const { id } of INDUSTRIES) {
    const copy = mockCopy(id);
    assert.notEqual(copy, base, `${id} has its own copy`);
    assert.deepEqual(shape(copy), shape(base), `${id} has the same shape as the default`);
  }
});

test("an unknown or missing industry gets the default copy", () => {
  const base = mockCopy(undefined);
  for (const id of ["other", "toString", "nonsense", null]) assert.equal(mockCopy(id), base);
  assert.doesNotMatch(JSON.stringify(base), /project|software|integration/i);
});
