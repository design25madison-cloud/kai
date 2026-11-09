// PowerPoint deck template for a direction: six editable layouts, then brand guide slides.
//
// The layouts are slide masters with placeholders, so founders add new slides from them in
// PowerPoint or Google Slides. The preview on the moodboard (DeckPreview.jsx) draws the same
// slides from deckTheme() and DECK_SLIDES, so the two stay in step.
import { markImagesUsed, referenceImage } from "./referenceImages.js";

// Wide 16:9 slide, in inches. Font sizes are in points (the slide is 960pt wide).
const W = 13.333;
const H = 7.5;
const M = 0.75; // Margin

// Which brand guide slides each export section adds.
export const GUIDE_SECTIONS = { moodboard: "mood", palette: "palette", type: "type", voice: "voice" };

export const DECK_SLIDES = [
  { id: "title", label: "Title", layout: true },
  { id: "section", label: "Section", layout: true },
  { id: "content", label: "Title and content", layout: true },
  { id: "image", label: "Image and text", layout: true },
  { id: "statement", label: "Statement", layout: true },
  { id: "closing", label: "Closing", layout: true },
  { id: "moodboard", label: "Moodboard", layout: false },
  { id: "palette", label: "Palette", layout: false },
  { id: "type", label: "Typography", layout: false },
  { id: "voice", label: "Voice", layout: false },
];

export function deckTheme(d, f) {
  return {
    dark: d.deep,
    onDark: d.onDeep,
    light: d.light,
    ink: d.ink,
    surface: d.surface,
    accent: d.ui,
    // Section dividers use the accent, so they stand apart from the title slide even when
    // a direction's primary and dark colors are the same.
    highlight: d.accent,
    onHighlight: d.onAccent,
    display: d.display,
    body: d.body,
    wordFont: d.wordFont,
    track: d.track,
    word: d.word,
    name: (f.name || "").trim() || "Brand",
    headline: d.headline,
    colors: d.colors,
    tone: d.tone,
    imgs: d.imgs.slice(0, 4).map((im) => im[0]), // The four the moodboard shows
  };
}

export function deckFileName(t) {
  const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
  return `${slug}-deck-template.pptx`;
}

const hex = (c) => String(c).replace("#", "").toUpperCase();

function masters(pptx, t) {
  const text = (face, size, color, extra = {}) => ({ fontFace: face, fontSize: size, color: hex(color), margin: 0, ...extra });
  const word = (x, y, w, h, size, color, align = "left") => ({
    text: { text: t.word, options: { x, y, w, h, ...text(t.wordFont, size, color, { charSpacing: t.track, align, valign: "middle" }) } },
  });
  const ph = (name, type, x, y, w, h, opts, prompt) => ({ placeholder: { options: { name, type, x, y, w, h, ...opts }, text: prompt } });

  pptx.defineSlideMaster({
    title: "Title",
    background: { color: hex(t.dark) },
    objects: [
      word(M, M, 6, 0.5, 20, t.onDark),
      ph("title", "title", M, 3.2, W - 2 * M, 1.6, text(t.display, 54, t.onDark, { bold: true, valign: "bottom" }), "Presentation title"),
      ph("subtitle", "body", M, 5.0, W - 2 * M, 0.6, text(t.body, 20, t.onDark), "Subtitle"),
    ],
  });
  pptx.defineSlideMaster({
    title: "Section",
    background: { color: hex(t.highlight) },
    objects: [
      ph("number", "body", M, M, 3, 0.6, text(t.body, 20, t.onHighlight), "01"),
      ph("title", "title", M, 4.4, W - 2 * M, 2.35, text(t.display, 60, t.onHighlight, { bold: true, valign: "bottom" }), "Section title"),
    ],
  });
  pptx.defineSlideMaster({
    title: "Title and content",
    background: { color: hex(t.light) },
    slideNumber: { x: W - M - 0.5, y: H - 0.55, w: 0.5, h: 0.3, ...text(t.body, 11, t.ink, { align: "right" }) },
    objects: [
      word(M, H - 0.55, 4, 0.3, 11, t.ink),
      ph("title", "title", M, M, W - 2 * M, 1.0, text(t.display, 36, t.ink, { bold: true, valign: "top" }), "Slide title"),
      ph("body", "body", M, 2.1, 7.5, 4.2, text(t.body, 20, t.ink, { valign: "top", bullet: true, paraSpaceAfter: 10 }), "Key point"),
    ],
  });
  pptx.defineSlideMaster({
    title: "Image and text",
    background: { color: hex(t.light) },
    slideNumber: { x: W - M - 0.5, y: H - 0.55, w: 0.5, h: 0.3, ...text(t.body, 11, t.ink, { align: "right" }) },
    objects: [
      { rect: { x: 0, y: 0, w: W / 2, h: H, fill: { color: hex(t.surface) } } },
      ph("image", "pic", 0, 0, W / 2, H, {}, "Image"),
      ph("title", "title", W / 2 + M, M, W / 2 - 2 * M, 1.6, text(t.display, 36, t.ink, { bold: true, valign: "top" }), "Slide title"),
      ph("body", "body", W / 2 + M, 2.6, W / 2 - 2 * M, 3.6, text(t.body, 18, t.ink, { valign: "top" }), "Supporting text"),
    ],
  });
  pptx.defineSlideMaster({
    title: "Statement",
    background: { color: hex(t.surface) },
    objects: [
      { rect: { x: M, y: 2.0, w: 0.9, h: 0.08, fill: { color: hex(t.accent) } } },
      ph("title", "title", M, 2.4, W - 2 * M, 3.2, text(t.display, 48, t.ink, { bold: true, valign: "top" }), "A single statement"),
    ],
  });
  pptx.defineSlideMaster({
    title: "Closing",
    background: { color: hex(t.dark) },
    objects: [
      word(M, 2.6, W - 2 * M, 1.4, 72, t.onDark, "center"),
      ph("title", "title", M, 4.3, W - 2 * M, 0.7, text(t.display, 28, t.onDark, { align: "center" }), "Thank you"),
      ph("body", "body", M, 5.1, W - 2 * M, 0.5, text(t.body, 16, t.onDark, { align: "center" }), "name@company.com"),
    ],
  });
}

// One sample slide per layout, so the file opens showing how each one is meant to be used.
function layoutSlides(pptx, t) {
  pptx.addSlide({ masterName: "Title" }).addText("Presentation title", { placeholder: "title" });
  pptx.addSlide({ masterName: "Section" }).addText("Section title", { placeholder: "title" });
  const c = pptx.addSlide({ masterName: "Title and content" });
  c.addText("Slide title", { placeholder: "title" });
  c.addText("Key point\nKey point\nKey point", { placeholder: "body" });
  const i = pptx.addSlide({ masterName: "Image and text" });
  i.addText("Slide title", { placeholder: "title" });
  i.addText("Supporting text", { placeholder: "body" });
  pptx.addSlide({ masterName: "Statement" }).addText(t.headline, { placeholder: "title" });
  pptx.addSlide({ masterName: "Closing" }).addText("Thank you", { placeholder: "title" });
}

function guideHeader(slide, t, title) {
  slide.background = { color: hex(t.light) };
  slide.addText(title, { x: M, y: M, w: W - 2 * M, h: 0.7, fontFace: t.display, fontSize: 32, bold: true, color: hex(t.ink), margin: 0, valign: "top" });
}

function guideSlides(pptx, t, sections) {
  const want = (id) => sections.includes(GUIDE_SECTIONS[id]);
  const ink = hex(t.ink);

  if (want("moodboard")) {
    const s = pptx.addSlide();
    guideHeader(s, t, "Moodboard");
    const gap = 0.2, top = 1.8, cw = (W - 2 * M - 3 * gap) / 4, ch = 4.2;
    t.imgs.forEach((label, k) => {
      const x = M + k * (cw + gap);
      const img = referenceImage(label);
      if (img) s.addImage({ path: new URL(img.src, window.location.href).href, x, y: top, w: cw, h: ch, sizing: { type: "cover", w: cw, h: ch } });
      else s.addShape("rect", { x, y: top, w: cw, h: ch, fill: { color: hex(t.surface) } });
      s.addText(label, { x, y: top + ch + 0.15, w: cw, h: 0.3, fontFace: t.body, fontSize: 12, color: ink, margin: 0 });
      if (img) s.addText(img.source === "Unsplash" ? `Photo by ${img.author} on Unsplash` : `${img.author}, ${img.license}`, { x, y: top + ch + 0.45, w: cw, h: 0.3, fontFace: t.body, fontSize: 9, color: ink, margin: 0, hyperlink: { url: img.page } });
    });
    s.addText("Reference images set direction only. Don't use them in final work.", { x: M, y: H - 0.6, w: W - 2 * M, h: 0.3, fontFace: t.body, fontSize: 10, color: ink, margin: 0 });
  }

  if (want("palette")) {
    const s = pptx.addSlide();
    guideHeader(s, t, "Palette");
    const total = t.colors.reduce((n, c) => n + c.ratio, 0);
    let x = M;
    const w = W - 2 * M, top = 1.8, h = 4.6;
    t.colors.forEach((c) => {
      const cw = (w * c.ratio) / total;
      s.addShape("rect", { x, y: top, w: cw, h, fill: { color: hex(c.show) } });
      s.addText([
        { text: c.name, options: { bold: true, breakLine: true } },
        { text: c.role, options: { breakLine: true } },
        { text: c.show.toUpperCase() },
      ], { x: x + 0.2, y: top + h - 1.2, w: cw - 0.3, h: 1.0, fontFace: t.body, fontSize: 12, color: hex(c.label), margin: 0, valign: "bottom" });
      x += cw;
    });
  }

  if (want("type")) {
    const s = pptx.addSlide();
    guideHeader(s, t, "Typography");
    const col = (x, role, face, size, bold) => {
      s.addText(role, { x, y: 1.9, w: 5.6, h: 0.3, fontFace: t.body, fontSize: 12, color: ink, margin: 0 });
      s.addText(face, { x, y: 2.3, w: 5.6, h: 1.0, fontFace: face, fontSize: size, bold, color: ink, margin: 0 });
      s.addText("ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789", { x, y: 3.5, w: 5.6, h: 1.6, fontFace: face, fontSize: 18, color: ink, margin: 0, valign: "top" });
    };
    col(M, "Headings", t.display, 40, true);
    col(W / 2 + 0.2, "Body", t.body, 40, false);
    s.addText(`Install ${t.display} and ${t.body} (free on Google Fonts) so this deck shows them, or open it in Google Slides.`, { x: M, y: H - 0.6, w: W - 2 * M, h: 0.3, fontFace: t.body, fontSize: 10, color: ink, margin: 0 });
  }

  if (want("voice")) {
    const s = pptx.addSlide();
    guideHeader(s, t, "Voice");
    t.tone.forEach((tn, k) => {
      s.addText([
        { text: tn.yes, options: { bold: true } },
        { text: `, not ${tn.no}` },
      ], { x: M, y: 1.9 + k * 0.8, w: W - 2 * M, h: 0.6, fontFace: t.body, fontSize: 26, color: ink, margin: 0 });
    });
    s.addText(t.headline, { x: M, y: 5.2, w: W - 2 * M, h: 1.2, fontFace: t.display, fontSize: 28, bold: true, color: hex(t.accent), margin: 0, valign: "top" });
  }
}

// Builds and downloads the file. The library is loaded only here, so it doesn't slow the page.
export async function downloadDeck(d, f, sections) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const t = deckTheme(d, f);
  if (sections.includes(GUIDE_SECTIONS.moodboard)) markImagesUsed(t.imgs);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = `${t.name} deck template`;
  pptx.company = t.name;
  masters(pptx, t);
  layoutSlides(pptx, t);
  guideSlides(pptx, t, sections);
  const fileName = deckFileName(t);
  await pptx.writeFile({ fileName });
  return fileName;
}
