// Applies a brand to the deck template (src/assets/deck-template.pptx).
//
// The template is an ordinary PowerPoint file that a designer can open and restyle. A .pptx is a
// zip of XML files, and KAI changes only these things in it:
//
// - Theme colors and theme fonts (ppt/theme/). Shapes and text that use theme colors follow.
//     Text 1 = ink                 Background 1 = page background
//     Text 2 = dark background     Background 2 = surface
//     Accent 1 = buttons and links     Accent 2 = brand accent
//     Accent 3 = primary color     Accent 4 = text on the primary color
//     Accent 5 = text on the dark background     Accent 6 = text on the brand accent
//     Links = ink     Headings font = display typeface     Body font = body typeface
// - Text set in the font "KAI Wordmark" gets the wordmark typeface and letter spacing.
// - {{tokens}} in any slide or layout are replaced with the brand's words.
// - Shapes named swatch1…6 take the palette colors (and swatch1-label…6 their text color), spread
//   evenly for however many colors the brand has. Pictures named photo1…4 take the moodboard photos.
// - A brand guide slide (one holding a shape named guide-moodboard, guide-palette, guide-type or
//   guide-voice) is removed when its section isn't being exported.
// - A slide holding a shape named kai-notes is always removed. The template's first two slides
//   are these: they tell whoever edits the file what to keep so that all of the above still works.
//
// No browser APIs here, so it runs in the tests too. deck.js loads the file and the photos.

// A color that isn't six hex digits makes a file PowerPoint asks to repair, so refuse it here.
const hex = (c) => {
  const value = String(c).replace("#", "").toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(value)) throw new Error(`Not a hex color: ${c}`);
  return value;
};
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const THEME_SLOTS = (t) => ({
  dk1: t.ink, lt1: t.light, dk2: t.dark, lt2: t.surface,
  accent1: t.accent, accent2: t.highlight, accent3: t.colors[0].show, accent4: t.colors[0].label,
  accent5: t.onDark, accent6: t.onHighlight,
  hlink: t.ink, folHlink: t.ink,
});

export function themeXml(xml, t) {
  for (const [slot, color] of Object.entries(THEME_SLOTS(t))) {
    xml = xml.replace(new RegExp(`(<a:${slot}>)[\\s\\S]*?(</a:${slot}>)`), `$1<a:srgbClr val="${hex(color)}"/>$2`);
  }
  const font = (kind, face) => (xml = xml.replace(new RegExp(`(<a:${kind}Font>\\s*<a:latin typeface=")[^"]*"`), `$1${esc(face)}"`));
  font("major", t.display);
  font("minor", t.body);
  return xml;
}

// Calls fn(name, block) for every shape and picture. fn returns the new block, "" to remove it,
// or nothing to leave it alone.
const SHAPE = /<p:(sp|pic)>[\s\S]*?<\/p:\1>/g;
function mapShapes(xml, fn) {
  return xml.replace(SHAPE, (block) => {
    const name = (block.match(/<p:cNvPr [^>]*?name="([^"]*)"/) || [])[1] || "";
    const next = fn(name, block);
    return next == null ? block : next;
  });
}
const FILL = /<a:solidFill>[\s\S]*?<\/a:solidFill>/;
const solid = (color) => `<a:solidFill><a:srgbClr val="${hex(color)}"/></a:solidFill>`;
const BOX = /<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"\/>/;
const boxOf = (block) => {
  const m = block.match(BOX);
  return m ? { x: +m[1], y: +m[2], w: +m[3], h: +m[4] } : null;
};
const moveTo = (block, x, w) => block.replace(BOX, (all, x0, y, w0, h) => `<a:off x="${Math.round(x)}" y="${y}"/><a:ext cx="${Math.round(w)}" cy="${h}"/>`);

function wordmark(xml, t) {
  // The wordmark stays on one line, and a long one gets a smaller size so it fits its box.
  // shortcut: letter width is guessed at 0.9 of the size (a wide bold typeface), so narrow
  // typefaces come out smaller than they need to. Measure the real font if that matters.
  xml = mapShapes(xml, (name, block) => {
    const box = boxOf(block);
    if (!box || !block.includes("{{wordmark}}") || !block.includes('typeface="KAI Wordmark"')) return;
    const fit = Math.floor(((box.w / 12700 / t.word.length - t.track) / 0.9) * 100); // 12700 units per point
    return block
      .replace(/<a:bodyPr\b([^>]*?)(\/?)>/, (all, attrs, close) => `<a:bodyPr${attrs.replace(/ wrap="[^"]*"/, "")} wrap="none"${close}>`)
      .replace(/(<a:rPr\b[^>]*? sz=")(\d+)"/g, (all, start, sz) => `${start}${Math.min(+sz, Math.max(fit, 1000))}"`);
  });
  // Letter spacing is in hundredths of a point, on the run that uses the wordmark font.
  return xml
    .replace(/<a:(rPr|defRPr|endParaRPr)\b([^>]*)>((?:(?!<\/a:\1>)[\s\S])*?typeface="KAI Wordmark")/g, (all, tag, attrs, rest) => {
      const spaced = / spc="/.test(attrs) ? attrs.replace(/ spc="[^"]*"/, ` spc="${Math.round(t.track * 100)}"`) : `${attrs} spc="${Math.round(t.track * 100)}"`;
      return `<a:${tag}${spaced}>${rest}`;
    })
    .replace(/typeface="KAI Wordmark"/g, `typeface="${esc(t.wordFont)}"`);
}

function palette(xml, t) {
  const boxes = {};
  mapShapes(xml, (name, block) => void (/^swatch\d(-label)?$/.test(name) && (boxes[name] = boxOf(block))));
  const first = boxes.swatch1;
  const slots = Object.keys(boxes).filter((n) => /^swatch\d$/.test(n)).length;
  const last = boxes["swatch" + slots];
  if (!first || !last) return xml;
  const n = Math.min(t.colors.length, slots);
  const width = (last.x + last.w - first.x) / n;
  const label = boxes["swatch1-label"];
  return mapShapes(xml, (name, block) => {
    const m = name.match(/^swatch(\d)(-label)?$/);
    if (!m) return;
    const k = +m[1] - 1, c = t.colors[k];
    if (k >= n) return "";
    // The first fill inside the shape's properties is the shape's own (an outline's comes later).
    if (!m[2]) return moveTo(block.replace(new RegExp(`(<p:spPr[\\s\\S]*?)${FILL.source}`), `$1${solid(c.show)}`), first.x + k * width, width);
    const moved = label ? moveTo(block, first.x + k * width + (label.x - first.x), width - (first.w - label.w)) : block;
    return moved.replace(new RegExp(FILL.source, "g"), solid(c.label));
  });
}

// Crops a photo to its box with the picture's own crop setting, so the whole photo stays in the
// file and can be re-cropped in PowerPoint. Units are 1/1000 of a percent.
function cropTo(block, photo) {
  const box = boxOf(block);
  if (!box || !photo.width || !photo.height) return block;
  const want = box.w / box.h, have = photo.width / photo.height;
  const cut = (share) => Math.round((share / 2) * 100000);
  const rect = have > want ? `l="${cut(1 - want / have)}" r="${cut(1 - want / have)}"` : `t="${cut(1 - have / want)}" b="${cut(1 - have / want)}"`;
  return block.replace(/<a:srcRect[^>]*\/>/, "").replace(/(<a:blip\b[^>]*?(?:\/>|>[\s\S]*?<\/a:blip>))/, `$1<a:srcRect ${rect}/>`);
}

function tokens(t, photos) {
  const out = { wordmark: t.word, name: t.name, headline: t.headline, "font.display": t.display, "font.body": t.body, "font.names": t.display === t.body ? t.display : `${t.display} and ${t.body}` };
  t.colors.forEach((c, k) => Object.assign(out, { [`color${k + 1}.name`]: c.name, [`color${k + 1}.role`]: c.role, [`color${k + 1}.hex`]: c.show.toUpperCase() }));
  t.tone.forEach((tn, k) => Object.assign(out, { [`tone${k + 1}.yes`]: tn.yes, [`tone${k + 1}.no`]: tn.no }));
  photos.forEach((p, k) => Object.assign(out, { [`photo${k + 1}.label`]: p.label, [`photo${k + 1}.credit`]: p.credit }));
  return out;
}

const NOTES = /<p:cNvPr [^>]*?name="kai-notes"/;
const SECTION_OF = { "guide-moodboard": "mood", "guide-palette": "palette", "guide-type": "type", "guide-voice": "voice" };

async function removeSlide(zip, path) {
  const file = path.split("/").pop();
  const edit = async (name, fn) => zip.file(name) && zip.file(name, fn(await zip.file(name).async("string")));
  let rid = "";
  await edit("ppt/_rels/presentation.xml.rels", (xml) =>
    xml.replace(new RegExp(`<Relationship [^>]*?Target="slides/${escRe(file)}"[^>]*?/>`), (rel) => {
      rid = (rel.match(/ Id="([^"]+)"/) || [])[1] || "";
      return "";
    }),
  );
  await edit("ppt/presentation.xml", (xml) => xml.replace(new RegExp(`<p:sldId [^>]*?r:id="${escRe(rid)}"[^>]*?/>`), ""));
  // Its speaker notes page goes too, or the file would point at a slide that isn't there.
  const relsPath = `ppt/slides/_rels/${file}.rels`;
  const rels = zip.file(relsPath) ? await zip.file(relsPath).async("string") : "";
  const notes = (rels.match(/Target="\.\.\/notesSlides\/([^"]+)"/) || [])[1];
  const gone = [`/ppt/slides/${file}`].concat(notes ? [`/ppt/notesSlides/${notes}`] : []);
  await edit("[Content_Types].xml", (xml) => gone.reduce((x, part) => x.replace(new RegExp(`<Override [^>]*?PartName="${escRe(part)}"[^>]*?/>`), ""), xml));
  [path, relsPath].concat(notes ? [`ppt/notesSlides/${notes}`, `ppt/notesSlides/_rels/${notes}.rels`] : []).forEach((p) => zip.remove(p));
}

// zip: the template, opened with JSZip. t: deckTheme(). sections: the export sections wanted.
// photos: up to four of { label, credit, page, bytes, width, height }; bytes is a JPEG or absent.
export async function applyBrand(zip, t, { sections, photos = [] }) {
  const words = tokens(t, photos);
  const fillIn = (xml) => xml.replace(/\{\{([\w.]+)\}\}/g, (all, key) => esc(words[key]));
  // Every theme file: which one the slides use (and which the notes pages use) varies between files.
  for (const path of Object.keys(zip.files).filter((p) => /^ppt\/theme\/theme\d+\.xml$/.test(p))) zip.file(path, themeXml(await zip.file(path).async("string"), t));

  for (const path of Object.keys(zip.files).filter((p) => /^ppt\/(slides|slideLayouts|slideMasters)\/[^/]+\.xml$/.test(p))) {
    let xml = await zip.file(path).async("string");
    const guide = (xml.match(/<p:cNvPr [^>]*?name="(guide-[a-z]+)"/) || [])[1];
    const unwanted = NOTES.test(xml) || (guide && SECTION_OF[guide] && !sections.includes(SECTION_OF[guide]));
    if (unwanted && path.startsWith("ppt/slides/")) {
      await removeSlide(zip, path);
      continue;
    }
    xml = palette(wordmark(xml, t), t);

    const relsPath = path.replace(/([^/]+)$/, "_rels/$1.rels");
    let rels = zip.file(relsPath) ? await zip.file(relsPath).async("string") : "";
    xml = mapShapes(xml, (name, block) => {
      const k = (name.match(/^photo(\d)$/) || [])[1];
      const photo = k && photos[k - 1];
      if (!photo || !photo.bytes) return;
      const rid = (block.match(/<a:blip\b[^>]*?r:embed="([^"]+)"/) || [])[1];
      const target = (rels.match(new RegExp(`<Relationship [^>]*?Id="${escRe(rid || "")}"[^>]*?Target="([^"]+)"`)) || [])[1];
      if (!target) return;
      zip.file("ppt/" + target.replace(/^\.\.\//, ""), photo.bytes);
      return cropTo(block, photo);
    });
    // Each credit links to its photo's page; the template holds a stand-in address per photo.
    photos.forEach((p, k) => (rels = rels.replace(`https://kai.invalid/photo${k + 1}`, esc(p.page || "https://commons.wikimedia.org"))));
    if (rels) zip.file(relsPath, rels);
    zip.file(path, fillIn(xml));
  }
  return zip;
}
