// OKLCH color math, shared by the generator and the photo color reader.
// A color space where equal steps look equal to the eye: an L of 0.7 is as light in yellow as in
// blue, and lowering L to reach contrast keeps the color's character instead of turning it to mud.
// Colors are [L 0–1, C (chroma) 0–~0.37, H 0–360].

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const fromLinear = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

export function hexToOklch(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

function oklchToRgb([L, C, H]) {
  const A = C * Math.cos((H * Math.PI) / 180), B = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}

// Out-of-gamut colors lose chroma until they fit, so hue and lightness hold.
export function oklchToHex([L, C, H]) {
  let c = C, rgb = oklchToRgb([L, c, H]);
  while (c > 0 && rgb.some((x) => x < -0.0005 || x > 1.0005)) { c -= 0.002; rgb = oklchToRgb([L, Math.max(c, 0), H]); }
  return "#" + rgb.map((x) => Math.round(clamp(fromLinear(clamp(x, 0, 1)), 0, 1) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

