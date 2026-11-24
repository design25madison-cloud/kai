import assert from "node:assert/strict";
import { test } from "node:test";
import { freeLicense, https } from "./imageSearch.js";

test("only freely licensed Commons files get through", () => {
  const free = ["Public domain", "PD-self", "CC0", "CC0 1.0", "CC BY 4.0", "CC-BY-4.0", "CC BY-SA 3.0", "CC BY-SA 3.0 de", "cc-by-sa-3.0-migrated"];
  const refused = [
    "CC BY-NC 4.0", "CC BY-ND 4.0", "CC BY-NC-SA 2.0", "CC BY-NC-ND 3.0", "Non-free", "GFDL", "",
    // Spelled out: these used to slip past the "nc"/"nd" check.
    "CC BY Non Commercial", "CC BY 4.0 (no commercial use)", "CC BY No-Derivatives 4.0",
  ];
  for (const l of free) assert.equal(freeLicense(l), true, l);
  for (const l of refused) assert.equal(freeLicense(l), false, l);
});

test("links are kept only when they are https", () => {
  assert.equal(https("https://commons.wikimedia.org/wiki/File:X.jpg"), "https://commons.wikimedia.org/wiki/File:X.jpg");
  assert.equal(https("http://creativecommons.org/licenses/by-sa/3.0/"), "https://creativecommons.org/licenses/by-sa/3.0/"); // License links stay links.
  for (const url of ["javascript:alert(1)", " javascript:alert(1)", "data:text/html,x", "http://example.org/licenses/by/4.0", "http://creativecommons.org.evil.example/x", "//evil.example", "", undefined, null, 42]) {
    assert.equal(https(url), "", String(url));
  }
});
