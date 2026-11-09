// The main colors of each reference photo, so the palette can come out of the moodboard instead
// of being chosen separately from it.
//
// A photo is drawn small (40×40) on a canvas and its pixels are grouped into 5 colors with
// k-means in OKLab, a color space where distances match what the eye sees. Results are cached in
// this browser. Hand-picked photos are local; Unsplash and Commons images allow this kind of
// reading (they're served with permissive cross-origin headers).
import { hexToOklch, oklchToHex } from "./color.js";
import { referenceImage, subscribe as onImages } from "./referenceImages.js";

const CACHE_KEY = "kai.imageColors.v1";
const SIZE = 40;
const K = 5;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}
const cache = typeof window === "undefined" ? {} : readCache(); // src → [{ hex, share }]
const pending = new Set();
const wanted = new Set();
const listeners = new Set();
let version = 0;

export const imageColorsVersion = () => version;
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// sRGB 0–255 → OKLab [L, a, b]
function toLab(r, g, b) {
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

function kmeans(points) {
  // Start from points spread across the lightness range, so dark and light areas both get a group.
  const sorted = points.slice().sort((p, q) => p[0] - q[0]);
  let centers = Array.from({ length: K }, (_, k) => sorted[Math.floor(((k + 0.5) / K) * sorted.length)].slice());
  let assign = new Array(points.length).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    points.forEach((p, i) => {
      let best = 0, bd = Infinity;
      centers.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; best = k; } });
      assign[i] = best;
    });
    centers = centers.map((c, k) => {
      const mine = points.filter((_, i) => assign[i] === k);
      if (!mine.length) return c;
      return [0, 1, 2].map((d) => mine.reduce((n, p) => n + p[d], 0) / mine.length);
    });
  }
  return centers.map((c, k) => {
    const share = assign.filter((a) => a === k).length / points.length;
    const C = Math.hypot(c[1], c[2]), H = ((Math.atan2(c[2], c[1]) * 180) / Math.PI + 360) % 360;
    return { hex: oklchToHex([c[0], C, H]), share: Math.round(share * 1000) / 1000 };
  }).filter((c) => c.share > 0.02).sort((x, y) => y.share - x.share);
}

function sample(src) {
  if (pending.has(src) || cache[src]) return;
  pending.add(src);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
      const points = [];
      for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 200) points.push(toLab(data[i], data[i + 1], data[i + 2]));
      cache[src] = points.length ? kmeans(points) : [];
    } catch {
      cache[src] = []; // The image wouldn't let us read its pixels; fall back to archetype accents.
    }
    finish(src);
  };
  img.onerror = () => { cache[src] = []; finish(src); };
  img.src = src;
}

function finish(src) {
  pending.delete(src);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* storage full: fine */ }
  version++;
  listeners.forEach((fn) => fn());
}

// The main colors of a label's photo as [{ hex, lch, share }], or null until it's been read.
// Asking starts the read (and the photo search, if the label isn't resolved yet).
export function imageColors(label) {
  const image = referenceImage(label);
  if (!image || !image.src) { wanted.add(label); return null; }
  const colors = cache[image.src];
  if (!colors) { sample(image.src); return null; }
  return colors.map((c) => ({ ...c, lch: hexToOklch(c.hex) }));
}

// When a photo search lands, read any labels that were waiting for it.
if (typeof window !== "undefined") {
  onImages(() => {
    [...wanted].forEach((label) => {
      const image = referenceImage(label);
      if (image && image.src) { wanted.delete(label); sample(image.src); }
    });
  });
}
