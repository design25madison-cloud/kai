import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import JSZip from "jszip";
import { applyBrand } from "./deckTemplate.js";

const brand = {
  ink: "#0E1812", light: "#FDF9F5", dark: "#0E1812", surface: "#F8F1E8", accent: "#9B6C37", highlight: "#DA984E", onDark: "#F8F1E8", onHighlight: "#0E1812",
  display: "IBM Plex Sans", body: "Archivo", wordFont: "Anta", track: 4, word: "FERRA & CO", name: "Ferra & Co", headline: "Built to <last>.",
  colors: [
    { name: "Forest", role: "Primary", show: "#246a48", label: "#FFFFFF" },
    { name: "Pale amber", role: "Surface", show: "#F8F1E8", label: "#0E1812" },
    { name: "Deep forest", role: "Neutral dark", show: "#0E1812", label: "#FFFFFF" },
    { name: "Pale rust", role: "Neutral light", show: "#FDF9F5", label: "#0E1812" },
    { name: "Amber", role: "Accent", show: "#DA984E", label: "#0E1812" },
  ],
  tone: [{ yes: "Clear", no: "dry" }, { yes: "Rigorous", no: "rigid" }, { yes: "Curious", no: "aimless" }],
};
const photos = [
  { label: "Quarry", credit: "W.carter, CC BY-SA 4.0", page: "https://example.org/quarry?a=1&b=2", bytes: new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]), width: 1600, height: 900 },
  { label: "No photo", credit: "" },
];

const open = () => JSZip.loadAsync(readFileSync(new URL("../assets/deck-template.pptx", import.meta.url)));
const read = (zip, path) => zip.file(path).async("string");
const shape = (xml, name) => xml.match(new RegExp(`<p:(sp|pic)>(?:(?!</p:\\1>)[\\s\\S])*?name="${name}"[\\s\\S]*?</p:\\1>`))?.[0];
const slideWith = async (zip, marker) => {
  for (const path of Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))) {
    const xml = await read(zip, path);
    if (xml.includes(marker)) return { path, xml };
  }
  return null;
};

test("a brand's colors, fonts and words land in the template", async () => {
  const zip = await applyBrand(await open(), brand, { sections: ["mood", "palette", "type", "voice"], photos });
  // Whichever theme file the slides use, it carries the brand.
  const themes = Object.keys(zip.files).filter((p) => /^ppt\/theme\/theme\d+\.xml$/.test(p));
  assert.ok(themes.length);
  for (const path of themes) {
    const theme = await read(zip, path);
    assert.match(theme, /<a:dk1><a:srgbClr val="0E1812"\/><\/a:dk1>/);
    assert.match(theme, /<a:accent1><a:srgbClr val="9B6C37"\/><\/a:accent1>/);
    assert.match(theme, /<a:accent3><a:srgbClr val="246A48"\/><\/a:accent3>/); // The primary color, and the text that sits on it.
    assert.match(theme, /<a:accent4><a:srgbClr val="FFFFFF"\/><\/a:accent4>/);
    assert.match(theme, /<a:majorFont>\s*<a:latin typeface="IBM Plex Sans"/);
    assert.match(theme, /<a:minorFont>\s*<a:latin typeface="Archivo"/);
  }

  // No token or stand-in font is left anywhere, and text is escaped.
  for (const path of Object.keys(zip.files).filter((p) => /^ppt\/(slides|slideLayouts)\/[^/]+\.xml$/.test(p))) {
    const xml = await read(zip, path);
    assert.doesNotMatch(xml, /\{\{|KAI Wordmark/, path);
  }
  const cover = (await slideWith(zip, "FERRA &amp; CO")).xml;
  assert.match(cover, /<a:rPr[^>]* spc="400"[^>]*>(?:(?!<\/a:rPr>)[\s\S])*typeface="Anta"(?:(?!<\/a:rPr>)[\s\S])*<\/a:rPr><a:t>FERRA &amp; CO/);
  assert.ok((await slideWith(zip, "guide-voice")).xml.includes("Built to &lt;last&gt;."));
});

test("the palette spreads evenly for the colors a brand has", async () => {
  const box = (xml, name) => shape(xml, name).match(/<a:off x="(\d+)"[^>]*\/>\s*<a:ext cx="(\d+)"/).slice(1).map(Number);
  const raw = (await slideWith(await open(), 'name="guide-palette"')).xml;
  const [rawX6, rawW6] = box(raw, "swatch6");
  const zip = await applyBrand(await open(), brand, { sections: ["palette"], photos: [] });
  const { xml } = await slideWith(zip, "guide-palette");
  assert.equal(shape(xml, "swatch6"), undefined);
  assert.equal(shape(xml, "swatch6-label"), undefined);
  const [x1, w1] = box(xml, "swatch1"), [x5, w5] = box(xml, "swatch5");
  assert.equal(w1, w5);
  assert.ok(Math.abs(x5 - (x1 + 4 * w1)) <= 4);
  assert.ok(Math.abs(x5 + w5 - (rawX6 + rawW6)) <= 4, "five swatches fill the width six did");
  assert.match(shape(xml, "swatch1"), /<p:spPr>[\s\S]*<a:srgbClr val="246A48"\/>/);
  assert.match(shape(xml, "swatch1-label"), /<a:srgbClr val="FFFFFF"\/>[\s\S]*Forest[\s\S]*Primary[\s\S]*#246A48/);
  assert.ok(box(xml, "swatch5-label")[1] < w5);
});

test("photos are swapped in and cropped to their box, not stretched", async () => {
  const zip = await applyBrand(await open(), brand, { sections: ["mood"], photos });
  const { path, xml } = await slideWith(zip, "guide-moodboard");
  const rels = await read(zip, path.replace("slides/", "slides/_rels/") + ".rels");
  const frame = shape(xml, "photo1");
  const target = rels.match(new RegExp(`Id="${frame.match(/r:embed="([^"]+)"/)[1]}"[^>]*Target="\\.\\./([^"]+)"`))[1];
  assert.deepEqual([...(await zip.file("ppt/" + target).async("uint8array"))], [0xff, 0xd8, 0xff, 1, 2, 3]);
  // A 16:9 photo in a tall frame loses the same share from each side.
  const [, w, h] = frame.match(/<a:ext cx="(\d+)" cy="(\d+)"/).map(Number);
  const side = Math.round(((1 - w / h / (1600 / 900)) / 2) * 100000);
  assert.ok(side > 0);
  assert.match(frame, new RegExp(`<a:srcRect l="${side}" r="${side}"/>\\s*<a:stretch>`));
  assert.doesNotMatch(shape(xml, "photo2"), /srcRect/); // No photo: the grey box stays.
  assert.match(xml, /Quarry[\s\S]*W\.carter, CC BY-SA 4\.0/);
  assert.match(rels, /Target="https:\/\/example\.org\/quarry\?a=1&amp;b=2"/);
});

test("a section that isn't exported takes its slide out of the file cleanly", async () => {
  const count = async (zip) => (await read(zip, "ppt/presentation.xml")).match(/<p:sldId /g).length;
  const all = await count(await open());
  const zip = await applyBrand(await open(), brand, { sections: ["palette"], photos: [] });
  assert.equal(await slideWith(zip, "guide-voice"), null);
  assert.equal(await slideWith(zip, "guide-moodboard"), null);
  assert.equal(await count(zip), all - 5); // Moodboard, typography and voice are gone, and the two notes slides.
  // Nothing points at a part that is gone.
  const rels = await read(zip, "ppt/_rels/presentation.xml.rels");
  for (const [, target] of rels.matchAll(/Target="([^"]+)"/g)) assert.ok(zip.file("ppt/" + target), target);
  const types = await read(zip, "[Content_Types].xml");
  for (const [, part] of types.matchAll(/PartName="\/([^"]+)"/g)) assert.ok(zip.file(part), part);
});

test("the template explains itself, and those slides never reach an export", async () => {
  const template = await open();
  const first = (await read(template, "ppt/presentation.xml")).match(/<p:sldId [^>]*r:id="([^"]+)"/)[1];
  const target = (await read(template, "ppt/_rels/presentation.xml.rels")).match(new RegExp(`Id="${first}"[^>]*Target="([^"]+)"`))[1];
  assert.match(await read(template, "ppt/" + target), /name="kai-notes"[\s\S]*HOW TO EDIT THIS TEMPLATE/);
  for (const sections of [[], ["mood", "palette", "type", "voice"]]) {
    const zip = await applyBrand(await open(), brand, { sections, photos: [] });
    assert.equal(await slideWith(zip, "kai-notes"), null);
    assert.equal((await read(zip, "ppt/presentation.xml")).match(/<p:sldId /g).length, 11 + sections.length);
  }
});

test("every deck keeps the credit the template's license requires", async () => {
  const zip = await applyBrand(await open(), brand, { sections: [], photos: [] });
  const { path, xml } = await slideWith(zip, "Template by SlidesCarnival");
  const rid = shape(xml, "template-credit").match(/<a:hlinkClick r:id="([^"]+)"/)[1];
  assert.match(await read(zip, path.replace("slides/", "slides/_rels/") + ".rels"), new RegExp(`Id="${rid}"[^>]*Target="https://www\\.slidescarnival\\.com"`));
});

test("a color that isn't a hex code is refused, not written into the file", async () => {
  // PowerPoint asks to repair a file holding one, which is how this was found.
  const bad = { ...brand, colors: brand.colors.map((c, k) => (k === 1 ? { ...c, label: "var(--color-ink)" } : c)) };
  await assert.rejects(applyBrand(await open(), bad, { sections: ["palette"], photos: [] }), /Not a hex color/);
  // And a good brand leaves only real hex codes behind.
  const zip = await applyBrand(await open(), brand, { sections: ["mood", "palette", "type", "voice"], photos });
  for (const path of Object.keys(zip.files).filter((p) => /\.xml$/.test(p))) {
    for (const [, value] of (await read(zip, path)).matchAll(/<a:srgbClr val="([^"]*)"/g)) assert.match(value, /^[0-9A-F]{6}$/i, path);
  }
});

test("paragraph settings come first in every paragraph", async () => {
  // PowerPoint asks to repair a file where they appear again after a run of text.
  const zip = await applyBrand(await open(), brand, { sections: ["mood", "palette", "type", "voice"], photos });
  for (const path of Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))) {
    for (const [, body] of (await read(zip, path)).matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)) assert.doesNotMatch(body, /<a:(r|br|fld)\b[\s\S]*<a:pPr\b/, path);
  }
});
