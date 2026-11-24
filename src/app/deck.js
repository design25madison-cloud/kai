// PowerPoint deck for a direction: six editable layouts, then brand guide slides.
//
// The slides come from a template file (src/assets/deck-template.pptx) that a designer can open
// and restyle in PowerPoint. KAI applies the brand's colors, fonts, words and photos to it
// (deckTemplate.js says exactly what it changes). The preview on the moodboard (DeckPreview.jsx)
// draws only the four brand guide slides, from deckTheme() and DECK_SLIDES.
//
// The template is adapted from "Clean Minimal" by SlidesCarnival (slidescarnival.com), used under
// CC BY 4.0. Its license requires the credit link on the closing slide, so don't remove it.
import templateUrl from "../assets/deck-template.pptx?url";
import { applyBrand } from "./deckTemplate.js";
import { markImagesUsed, referenceImage } from "./referenceImages.js";

// The brand guide slides, which the preview draws. The sample layouts exist only in the template file.
export const DECK_SLIDES = [
  { id: "moodboard", label: "Moodboard" },
  { id: "palette", label: "Palette" },
  { id: "type", label: "Typography" },
  { id: "voice", label: "Voice" },
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
    // On screen, a light swatch's label is the app's own ink (a CSS variable). A file needs a hex code.
    colors: d.colors.map((c) => ({ ...c, label: /^#[0-9a-f]{6}$/i.test(c.label) ? c.label : d.ink })),
    tone: d.tone,
    imgs: d.imgs.slice(0, 4).map((im) => im[0]), // The four the moodboard shows
  };
}

export function deckFileName(t, ext = "pptx") {
  const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
  return `${slug}-deck-template.${ext}`;
}

// One moodboard photo, as the template needs it: the bytes as a JPEG, and its size for cropping.
// A photo that can't be fetched leaves the template's grey box in place.
async function loadPhoto(label) {
  const img = referenceImage(label);
  if (!img) return { label, credit: "" };
  const photo = { label, credit: img.source === "Unsplash" ? `Photo by ${img.author} on Unsplash` : `${img.author}, ${img.license}`, page: img.page };
  try {
    let blob = await (await fetch(img.src)).blob();
    const bitmap = await createImageBitmap(blob);
    if (blob.type !== "image/jpeg") {
      const canvas = Object.assign(document.createElement("canvas"), { width: bitmap.width, height: bitmap.height });
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      blob = await new Promise((done) => canvas.toBlob(done, "image/jpeg", 0.9));
    }
    return { ...photo, bytes: new Uint8Array(await blob.arrayBuffer()), width: bitmap.width, height: bitmap.height };
  } catch {
    return photo;
  }
}

// Builds the deck for a direction. The zip library is loaded only here, so it doesn't slow the page.
export async function buildDeck(d, f, sections) {
  const { default: JSZip } = await import("jszip");
  const t = deckTheme(d, f);
  if (sections.includes("mood")) markImagesUsed(t.imgs);
  const [template, photos] = await Promise.all([fetch(templateUrl).then((r) => r.arrayBuffer()), Promise.all(t.imgs.map(loadPhoto))]);
  const zip = await applyBrand(await JSZip.loadAsync(template), t, { sections, photos });
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
  return { blob, t };
}
