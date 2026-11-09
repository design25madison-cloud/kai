// Turns a brief into three directions, each a blend of one to three archetypes.
//
// 1. score()   rates all 16 archetypes against the brief and records why (the matched words).
// 2. blends()  picks three different blends. How many archetypes go into each depends on the
//              brief: a clear winner stands alone, close scores blend.
// 3. direction() builds each blend into the same direction shape the rest of the app already
//              reads (palettes, words, types, voices, images, reason…), so screens don't change.
//
// Archetypes say who the brand is. The reasoning layers in layers.js (category, positioning,
// audience, name) then shape the decisions, and each layer leaves a reason the founder can read.
//
// Everything is deterministic: the same brief always gives the same directions.
import { ARCHETYPES, ARCHETYPE_BY_ID, TONE_CHIPS } from "./archetypes.js";
import { hexToOklch, oklchToHex } from "./color.js";
import { imageColors } from "./imageColors.js";
import { curatedImage } from "./referenceImages.js";

export { hexToOklch, oklchToHex };
import { AUDIENCES, audienceOf, competitorColorsOf, industryOf, nameCuesOf, stanceOf } from "./layers.js";

// ---------- Color helpers ----------

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function hslToHex([h, s, l]) {
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function hexToHsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
}

function lum(hex) {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Darkens a color until it carries white text at AA (4.5:1).
function darkenForWhite(hsl, target = 4.5) {
  let [h, s, l] = hsl;
  while (l > 4 && contrast(hslToHex([h, s, l]), "#FFFFFF") < target) l -= 1;
  return [h, s, l];
}

// Signed shortest turn from hue a to hue b, in degrees (-180…180).
const hueTurn = (a, b) => ((b - a + 540) % 360) - 180;
const turnTo = (h, deg) => [((h[0] + deg) % 360 + 360) % 360, h[1], h[2]];

function rgbDistance(a, b) {
  const p = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const q = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

// Lowers lightness, keeping hue and chroma, until white text passes the target contrast.
function fitForWhite(c, target) {
  let [L, C, H] = c;
  while (L > 0.1 && contrast(oklchToHex([L, C, H]), "#FFFFFF") < target) L -= 0.01;
  return [L, C, H];
}

// Readable names, so palettes say "Deep forest" rather than a hex.
const HUES = [
  [10, "Red"], [20, "Vermilion"], [32, "Rust"], [44, "Amber"], [56, "Gold"], [70, "Chartreuse"], [90, "Olive"],
  [135, "Green"], [165, "Forest"], [185, "Teal"], [200, "Cyan"], [215, "Azure"], [235, "Cobalt"], [255, "Indigo"],
  [280, "Violet"], [305, "Plum"], [330, "Magenta"], [350, "Rose"], [361, "Red"],
];
export function colorName([h, s, l]) {
  if (s < 12 || (s < 25 && (l < 16 || l > 90))) {
    if (l < 10) return "Ink";
    if (l < 22) return "Graphite";
    if (l < 45) return "Slate";
    if (l < 72) return "Stone";
    if (l < 90) return "Fog";
    return "Paper";
  }
  if (l > 82 && s < 50 && h >= 15 && h <= 65) return l > 93 ? "Linen" : "Sand";
  if (s < 55 && l < 45 && h >= 8 && h <= 40) return l < 26 ? "Deep oxide" : "Oxide";
  if (l > 85) return "Pale " + HUES.find(([max]) => h < max)[1].toLowerCase();
  const hue = HUES.find(([max]) => h < max)[1];
  if (l < 26) return "Deep " + hue.toLowerCase();
  if (s > 75 && l > 45) return "Bright " + hue.toLowerCase();
  return hue;
}

// ---------- 1. Scoring ----------

const BRIEF_TEXT_KEYS = ["desc", "meaning", "toneIn", "lookNote", "mot", "success", "opCares", "endCares", "problem", "short", "diff", "diffWhy", "outcomes", "switchTo", "value", "emo", "wedge", "wedgeWhy", "feel", "diffFeel", "wfAha", "wfSuccess", "sigReact", "sigEasier"];

function briefText(f) {
  // Placeholders like "[Why this matters]" are prompts, not answers, so they don't count.
  return BRIEF_TEXT_KEYS.map((k) => f[k] || "").join(" \n ").replace(/\[[^\]]*\]/g, " ").toLowerCase();
}

const hasWord = (text, w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(text);

export function score(input) {
  const { f, tone = [], sl = {}, looks = {} } = input;
  const text = briefText(f);
  const slidersMoved = ["warmth", "energy", "serious"].some((k) => sl[k] != null && sl[k] !== 50);
  return ARCHETYPES.map((a) => {
    const why = [];
    let pts = 0;
    tone.forEach((chip) => {
      if ((TONE_CHIPS[chip] || []).includes(a.id) || a.attributes.some((x) => x.toLowerCase() === chip.toLowerCase())) {
        pts += 2;
        why.push(chip);
      }
    });
    a.signals.forEach((w) => {
      if (hasWord(text, w)) {
        pts += 1;
        why.push(w.charAt(0).toUpperCase() + w.slice(1));
      }
    });
    // Sliders: up to 1 point each for being close to where the archetype sits.
    let near = 0;
    ["warmth", "energy", "serious"].forEach((k) => {
      const v = sl[k] == null ? 50 : sl[k];
      near += 1 - Math.abs(v - a.sl[k]) / 100;
    });
    pts += near;
    if (slidersMoved && near / 3 > 0.82) why.push("Your tone sliders");
    // Look pairs: a match adds, a clash subtracts.
    let lookHits = 0;
    [0, 1, 2, 3].forEach((k) => {
      const pick = looks[k], want = a.looks[k];
      if (!pick || want === "?") return;
      if (pick === want) { pts += 0.75; lookHits++; } else pts -= 0.5;
    });
    if (lookHits >= 2) why.push("Your look picks");
    // Category: archetypes common in the industry get a nudge, not a takeover.
    const industry = industryOf(f);
    if (industry && industry.typical.includes(a.id)) {
      pts += 1.25;
      why.push(`Common in ${industry.label.split(" and ")[0].toLowerCase()}`);
    }
    return { id: a.id, pts: Math.round(pts * 100) / 100, why: [...new Set(why)] };
  }).sort((x, y) => y.pts - x.pts);
}

// ---------- 2. Picking blends ----------

const round5 = (x) => Math.round(x * 20) / 20;

function weigh(members) {
  const total = members.reduce((n, m) => n + m.pts, 0) || 1;
  let out = members.map((m) => ({ id: m.id, w: round5(m.pts / total), why: m.why }));
  // The lead always carries at least 55%, so every blend has a clear character.
  if (out.length > 1 && out[0].w < 0.55) {
    const rest = out.slice(1), restTotal = rest.reduce((n, m) => n + m.w, 0) || 1;
    out = [{ ...out[0], w: 0.55 }].concat(rest.map((m) => ({ ...m, w: round5((0.45 * m.w) / restTotal) })));
  }
  const drift = 1 - out.reduce((n, m) => n + m.w, 0);
  out[0].w = Math.round((out[0].w + drift) * 100) / 100;
  return out;
}

// Two blends count as the same if they use the same archetypes, whatever the weights.
const blendKey = (b) => b.map((m) => m.id).sort().join("+");

// The first blend is the recommendation: every archetype within 75% of the top score, up to
// three. The other two are the strongest different blends, so the three options really differ.
// noLead: archetypes the audience can take blended in but not as the lead (Rebel for executive
// buyers, say). Those blends get re-led by their next allowed archetype.
export function blends(ranked, noLead = []) {
  const allowed = ranked.filter((r) => !noLead.includes(r.id));
  const relead = (members) => {
    if (!noLead.includes(members[0].id)) return members;
    const ok = members.find((m) => !noLead.includes(m.id)) || allowed[0];
    return [ok].concat(members.filter((m) => m !== ok)).slice(0, 3);
  };
  const top = ranked[0].pts;
  const close = ranked.filter((r) => r.pts >= top * 0.75).slice(0, 3);
  const first = weigh(relead(close));
  const [r1, r2, r3, r4] = ranked;
  const candidates = [[r2, r1], [r1, r3], [r2, r3], [r3, r1], [r1, r4], [r2], [r3]].map((c) => weigh(relead(c)));
  const out = [first];
  candidates.forEach((c) => {
    if (out.length < 3 && !out.some((b) => blendKey(b) === blendKey(c))) out.push(c);
  });
  return out;
}

// ---------- 3. Building a direction ----------

const ROLES = ["Primary", "Surface", "Neutral dark", "Neutral light"];
const RATIOS = [30, 40, 15, 5];
const pick = (list, v) => list[v % list.length];

function buildPalette(mix, v, ctx) {
  const lead = ARCHETYPE_BY_ID[mix[0].id], p = lead.palette;
  const tweak = (hsl, strong) => {
    let out = hsl;
    // The founder's color direction ("warmer", "muted"…) shifts the brand colors.
    if (strong && ctx.adjust) {
      const adj = ctx.adjust(hslToHex(out));
      if (adj) out = hexToHsl(adj);
    }
    // Steer clear of colors the founder said to avoid.
    let guard = 0;
    while (ctx.avoidC.some((a) => rgbDistance(hslToHex(out), a) < 60) && guard < 6) {
      out = [(out[0] + 30) % 360, out[1], out[2]];
      guard++;
    }
    return out;
  };
  let primary = tweak(pick(p.primary, v), true);
  // A secondary archetype with real weight pulls the primary hue a little toward its own, but
  // only when the two hues are already neighbors; pulling across the wheel just makes mud.
  if (mix[1] && mix[1].w >= 0.35) {
    const other = pick(ARCHETYPE_BY_ID[mix[1].id].palette.primary, v);
    const d = ((other[0] - primary[0] + 540) % 360) - 180;
    if (other[1] > 15 && primary[1] > 15 && Math.abs(d) <= 90) {
      primary = [(primary[0] + d * 0.15 + 360) % 360, primary[1], primary[2]];
    }
  }
  const reasons = [];
  const chromatic = primary[1] > 15;
  const L = ctx.layers;
  ctx = { ...ctx, categoryAccent: null };

  // Name: a cue word ("iron", "river"…) pulls the primary toward its color when they're close,
  // otherwise it joins the accents below.
  let cueAccent = null;
  if (L.cue) {
    const t = hueTurn(primary[0], L.cue.hue[0]);
    if (chromatic && Math.abs(t) <= 120) {
      primary = turnTo(primary, t * 0.3);
      reasons.push({ layer: "Name", text: `"${L.cue.word}" in the name pulls the primary toward ${L.cue.gist}.` });
    } else cueAccent = L.cue.hue;
  }

  // Category and positioning: start from what the industry usually uses, then move as far from
  // it as the distinctiveness dial says.
  if (L.industry) {
    const short = L.industry.label.split(" and ")[0];
    if (!chromatic) {
      reasons.push({ layer: "Category", text: `A neutral primary sits outside ${short.toLowerCase()}'s usual ${L.industry.look.split(" and ")[0]}.` });
    } else {
      const conv = L.industry.hues.reduce((best, h) => (Math.abs(hueTurn(primary[0], h)) < Math.abs(hueTurn(primary[0], best)) ? h : best));
      const off = hueTurn(conv, primary[0]); // How far the primary already sits from the convention.
      if (ctx.dial < 0.35) {
        // Fitting in: keep the archetype's primary and nod to the category with an accent.
        // Pulling the primary across the wheel toward the category hue just makes mud.
        ctx.categoryAccent = [conv, 55, 45];
        reasons.push({ layer: "Category", text: `${short} brands usually use ${L.industry.look}. As the trusted alternative, the palette keeps that color as an accent.` });
      } else {
        const need = 25 + ctx.dial * 65;
        if (Math.abs(off) < need) {
          primary = turnTo(primary, (Math.sign(off) || 1) * need - off);
          reasons.push({ layer: "Positioning", text: `${short} brands usually use ${L.industry.look}. You're positioned to stand apart, so the primary moves away from it.` });
        } else {
          reasons.push({ layer: "Positioning", text: `Already distinct from ${short.toLowerCase()}'s usual ${L.industry.look.split(" and ")[0]}.` });
        }
      }
    }
  }

  // Competitors: never share a hue with a competitor's main color. This wins over the above.
  L.competitors.forEach((c) => {
    const ch = hexToHsl(c.hex);
    if (!chromatic || ch[1] <= 15) return;
    const t = hueTurn(ch[0], primary[0]);
    if (Math.abs(t) < 35) {
      primary = turnTo(primary, (Math.sign(t) || 1) * 40 - t);
      reasons.push({ layer: "Positioning", text: `Steers clear of ${c.name}'s ${colorName(ch).toLowerCase()}.` });
    }
  });

  // ---- From here the palette is built in OKLCH, around the primary, so every color relates. ----

  // Audience: field users get AAA contrast on the primary; everyone else AA.
  const target = L.profile ? L.profile.contrast : 4.5;
  let P = hexToOklch(hslToHex(primary));
  const photos = ctx.imagery;
  // Imagery: a strong photo color near the primary's hue pulls it a little closer, so the
  // primary feels like it belongs in the same world as the photos.
  if (photos && photos.vivid.length && P[1] > 0.04) {
    const near = photos.vivid.find((c) => Math.abs(hueTurn(P[2], c.lch[2])) <= 60);
    if (near) {
      P = [P[0], P[1], (P[2] + hueTurn(P[2], near.lch[2]) * 0.3 + 360) % 360];
      reasons.push({ layer: "Imagery", text: `The primary leans toward the ${colorName(hexToHsl(oklchToHex(near.lch))).toLowerCase()} in the "${near.label}" photo.` });
    }
  }
  // Tone: temperature turns the primary toward warm or cool, loudness scales its chroma, and
  // sharpness sets how dark (serious) or light (playful) it sits.
  const T = ctx.toneDials;
  const WARM_H = 55, COOL_H = 245; // OKLCH hues of a warm amber and a cool blue
  if (P[1] > 0.04 && Math.abs(T.temperature) > 0.2) {
    // Cooling a warm hue travels through olive and green toward teal, never back through red.
    const anchor = T.temperature > 0 ? WARM_H : P[2] < 130 ? 190 : COOL_H;
    P = [P[0], P[1], (P[2] + clamp(hueTurn(P[2], anchor), -1, 1) * Math.min(Math.abs(hueTurn(P[2], anchor)), 40 * Math.abs(T.temperature)) + 360) % 360];
  }
  P = [clamp(P[0] - 0.05 * T.sharpness, 0.2, 0.7), P[1] * (1 + 0.3 * T.loudness), P[2]];
  const tw = toneWords(T);
  if (tw.length) reasons.push({ layer: "Tone", text: `Your tone reads ${listOf(tw)}, so the colors are ${listOf([T.temperature > 0.2 ? "warmer" : T.temperature < -0.2 ? "cooler" : null, T.loudness > 0.2 ? "more saturated" : T.loudness < -0.2 ? "quieter" : null, T.sharpness > 0.2 ? "deeper" : T.sharpness < -0.2 ? "lighter" : null].filter(Boolean))}.` });

  // Seeds: colors the founder wants to keep lead the palette. The keep dial sets how strongly:
  // near "keep what I have" the first seed becomes the primary as is; toward "start fresh" it's
  // only a nudge. Later seeds become accents.
  const seeds = ctx.seeds || [];
  if (seeds.length) {
    const s0 = seeds[0], k = ctx.keepStrength;
    if (k >= 0.75) P = s0.lch.slice();
    else P = [P[0] + (s0.lch[0] - P[0]) * k, P[1] + (s0.lch[1] - P[1]) * k, (P[2] + hueTurn(P[2], s0.lch[2]) * k + 360) % 360];
    reasons.push({ layer: "Seeds", text: k >= 0.75 ? `Your color ${s0.hex}${s0.from ? ` (from ${s0.from})` : ""} leads the palette as is.` : `The primary is steered toward your color ${s0.hex}${s0.from ? ` (from ${s0.from})` : ""}${k < 0.35 ? ", lightly, since you chose to start fresh" : ""}.` });
  }
  P = fitForWhite(P, target);
  if (L.profile && target > 4.5) reasons.push({ layer: "Audience", text: `For ${L.profile.label}, white text on the primary reaches AAA (7:1).` });
  const hasHue = P[1] > 0.04; // Black or graphite primaries (Rebel, Visionary) have no hue to build from.
  const Hp = P[2];

  // Neutrals are tinted toward the primary, so they belong to it. Archetypes whose surfaces carry
  // their own warmth (parchment, ivory, sand) keep it.
  const sur = hexToOklch(hslToHex(tweak(pick(p.surface, v))));
  const ownTint = sur[1] > 0.018;
  let surfaceH = ownTint || !hasHue ? sur[2] : Hp;
  // Imagery: when the photos have a clear warm or cool cast, the surface picks it up.
  if (!ownTint && photos && photos.cast != null) {
    surfaceH = photos.cast;
    reasons.push({ layer: "Imagery", text: `The surface picks up the ${photos.cast < 100 || photos.cast > 330 ? "warm" : "cool"} cast of the photos.` });
  }
  // Tone outranks imagery: a clearly warm or cool tone sets the surface's tint.
  // A clear lean overrides even an archetype's own surface (Explorer's sand, Sage's parchment).
  const toneSurface = Math.abs(T.temperature) > (ownTint ? 0.5 : 0.3);
  if (toneSurface) surfaceH = T.temperature > 0 ? WARM_H + 20 : COOL_H;
  const surface = [clamp(sur[0], 0.9, 0.965), ownTint && !toneSurface ? Math.min(sur[1], 0.035) : hasHue || photos || toneSurface ? 0.014 : 0.004, surfaceH];
  const light = [clamp(surface[0] + 0.025, 0.975, 0.99), surface[1] * 0.5, surface[2]];
  const drk = hexToOklch(hslToHex(tweak(pick(p.dark, v))));
  const dark = [clamp(drk[0] - 0.03 * T.sharpness, 0.13, 0.26), hasHue ? clamp(drk[1], 0.012, 0.03) : Math.min(drk[1], 0.01), hasHue ? Hp : drk[2]];

  // Accents: one dominant, a second for support. Only the loud archetypes get a third.
  const loud = ["jester", "magician", "everyman", "creator", "transformer"].includes(lead.id);
  let count = clamp(Math.round(mix.reduce((n, m) => n + ARCHETYPE_BY_ID[m.id].accentCount * m.w, 0)), 1, 3);
  if (!loud) count = Math.min(count, 2);
  count = clamp(count + (L.profile && L.profile.extraAccent ? 1 : 0) + (cueAccent ? 1 : 0) + (T.sharpness < -0.4 ? 1 : 0), 1, loud || T.sharpness < -0.4 ? 3 : 2);
  if (T.minimal) count = 1; // Minimal: one accent, no more.

  // Where each accent's hue comes from, in priority order. Each one is then snapped to a harmony
  // with the primary (complement, split complement, triad or neighbor), so accents relate to the
  // primary and to each other instead of arriving from unrelated sources.
  const wanted = [];
  // Seeds after the first become accents before anything else.
  seeds.slice(1, 3).forEach((sd) => wanted.push({ src: hexToHsl(sd.hex), lch: sd.lch, why: "seed", label: sd.hex }));
  // Imagery: the photos' most vivid colors come first, rotated per variant so Regenerate tries
  // a different one. Archetype accents remain the fallback.
  if (photos && photos.vivid.length) {
    const n = photos.vivid.length;
    [0, 1].forEach((k) => {
      const c = photos.vivid[(v + k) % n];
      if (k < n) wanted.push({ src: hexToHsl(oklchToHex(c.lch)), lch: c.lch, why: "photo", label: c.label });
    });
  }
  if (ctx.categoryAccent) wanted.push({ src: ctx.categoryAccent, why: "category" });
  wanted.push({ src: pick(p.accents, v) });
  if (cueAccent) wanted.push({ src: cueAccent, why: "cue" });
  if (mix[1]) wanted.push({ src: pick(ARCHETYPE_BY_ID[mix[1].id].palette.accents, v) });
  wanted.push({ src: pick(p.accents, v + 1) }, { src: pick(p.accents, v + 2) });

  // Tone-on-tone (0) and near neighbors (±25) count too, so an accent that already sits well with
  // the primary (orange on brown) keeps its character instead of being forced across the wheel.
  const HARMONY = [0, 25, -25, 40, -40, 120, 150, 180, 210, 240];
  const tier = (sat) => (ctx.noNeon ? Math.min : (x) => x)(sat < 50 ? 0.09 : sat < 75 ? 0.13 : 0.17, 0.12);
  // Yellows and oranges stay vivid when light; blues and violets wash out to pastel, so cool
  // accents sit lower.
  const accentL = (H, k) => (H >= 180 && H < 320 ? [0.6, 0.54, 0.48] : [0.74, 0.66, 0.6])[k];
  const accents = [];
  let skippedForCategory = false;
  for (const w of wanted) {
    if (accents.length >= count) break;
    // Once the photos have given an accent, archetype accents don't add a second one: an
    // unrelated hue does more harm than a single strong accent.
    if (!w.why && (photos || seeds.length > 1) && accents.length >= 1) break;
    const src = tweak(w.src, true);
    let H = hexToOklch(hslToHex(src))[2];
    // Photo colors keep their hue: they already sit together in the moodboard. Only colors from
    // other sources get snapped into a harmony with the primary.
    if (hasHue && w.why !== "photo" && w.why !== "seed") {
      const free = HARMONY.map((o) => (Hp + o + 360) % 360).filter((h) => !accents.some((a) => Math.abs(hueTurn(a[2], h)) < 45));
      if (!free.length) break;
      H = free.reduce((best, h) => (Math.abs(hueTurn(H, h)) < Math.abs(hueTurn(H, best)) ? h : best));
    }
    if (accents.some((a) => Math.abs(hueTurn(a[2], H)) < 45)) continue;
    // A photo color that's just a lighter primary adds nothing as an accent.
    if (w.why === "photo" && hasHue && Math.abs(hueTurn(Hp, H)) < 30) continue;
    // Photo colors keep their own vividness (within a sensible range); others use a tier.
    const chroma = (w.lch ? clamp(w.lch[1], 0.08, ctx.noNeon ? 0.12 : 0.17) : tier(src[1])) * (1 + 0.25 * T.loudness);
    // Seeds keep their own lightness; others sit at the accent level (a touch lighter when playful).
    const acc = w.why === "seed" ? w.lch.slice() : [accentL(H, accents.length) - 0.03 * T.sharpness, chroma, H];
    const hex = oklchToHex(acc), hslHue = hexToHsl(hex)[0];
    // Breaking from the category: no accent in its signature hues either.
    if (L.industry && ctx.dial >= 0.65 && w.why !== "category" && L.industry.hues.some((h) => Math.abs(hueTurn(hslHue, h)) < 25)) { skippedForCategory = true; continue; }
    if (ctx.avoidC.some((x) => rgbDistance(hex, x) < 60)) continue;
    accents.push(acc);
    if (w.why === "seed") reasons.push({ layer: "Seeds", text: `Your color ${w.label} is kept as an accent.` });
    if (w.why === "photo") reasons.push({ layer: "Imagery", text: `${accents.length === 1 ? "The main accent" : "A supporting accent"} is drawn from the "${w.label}" photo.` });
    if (w.why === "cue") reasons.push({ layer: "Name", text: `"${L.cue.word}" in the name adds ${colorName(hexToHsl(hex)).toLowerCase()} as an accent.` });
  }
  if (!accents.length) {
    const H = hasHue ? (Hp + 180) % 360 : hexToOklch(hslToHex(pick(p.accents, v)))[2];
    accents.push([accentL(H, 0), tier(70), H]);
  }
  if (skippedForCategory) reasons.push({ layer: "Positioning", text: `No accent in ${L.industry.look.split(" and ")[0]}, to break from the category.` });

  const split = accents.length === 1 ? [10] : accents.length === 2 ? [7, 3] : [6, 3, 1];
  const used = new Set();
  const named = (hex) => {
    const hsl = hexToHsl(hex);
    let n = colorName(hsl);
    if (used.has(n)) n = (hsl[2] > 50 ? "Light " : "Dark ") + n.replace(/^(Deep|Pale|Bright) /, "").toLowerCase();
    if (used.has(n)) n = n + " " + (used.size + 1);
    used.add(n);
    return n;
  };
  const rows = [P, surface, dark, light].map((c, k) => { const hex = oklchToHex(c); return [named(hex), hex, ROLES[k], RATIOS[k]]; })
    .concat(accents.map((c, k) => { const hex = oklchToHex(c); return [named(hex), hex, k === 0 ? "Accent" : `Accent ${k + 1}`, split[k]]; }));
  return { rows, reasons };
}

function buildVoice(mix, v, ctx) {
  const lead = ARCHETYPE_BY_ID[mix[0].id];
  const leadPairs = lead.voice.pairs;
  const tone = mix[1]
    ? [pick(leadPairs, v * 2), pick(leadPairs, v * 2 + 1), pick(ARCHETYPE_BY_ID[mix[1].id].voice.pairs, v)]
    : [pick(leadPairs, v * 3), pick(leadPairs, v * 3 + 1), pick(leadPairs, v * 3 + 2)];
  // Audience: the last tone pair speaks to who has to trust it.
  if (ctx.layers.profile) tone[2] = ctx.layers.profile.pair;
  return { tone: tone.map((t) => t.slice()), headline: pick(lead.voice.headlines, v), micro: pick(lead.voice.micro, v) };
}

function buildImages(mix, offset, shown, ctx, rank) {
  // Six slots shared by weight and interleaved (lead, second, lead…), so the first few photos,
  // the ones Compare and the moodboard show, already read as the blend.
  // Within each archetype, hand-picked photos come first. Photos an earlier option already shows
  // go to the back, and an option sharing its lead with an earlier one starts further down the
  // lead's list, so no two options open on the same photos.
  const order = (a, k) => {
    const list = a.images.slice().sort((x, y) => (curatedImage(y) ? 1 : 0) - (curatedImage(x) ? 1 : 0));
    const start = k === 0 ? (offset * 3) % list.length : 0;
    const rotated = list.slice(start).concat(list.slice(0, start));
    return rotated.filter((l) => !shown.has(l)).concat(rotated.filter((l) => shown.has(l)));
  };
  // Category: skip images that are the industry's clichés.
  const L = ctx.layers;
  const cliche = (label) => L.industry && L.industry.cliches.some((c) => label.toLowerCase().includes(c));
  const queues = mix.map((m, k) => order(ARCHETYPE_BY_ID[m.id], k).filter((l) => !cliche(l)));
  const taken = mix.map(() => 0);
  const seen = new Set(), images = [];
  for (let slot = 0; slot < 6; slot++) {
    // Largest remainder: the archetype furthest behind its share goes next.
    const ranked = mix.map((m, k) => k).sort((x, y) => (mix[y].w * (slot + 1) - taken[y]) - (mix[x].w * (slot + 1) - taken[x]));
    for (const k of ranked) {
      const label = queues[k].find((l) => !seen.has(l));
      if (label) { seen.add(label); images.push(label); taken[k]++; break; }
    }
  }
  // Name and category each place one photo: the name's cue on the moodboard, the industry's world
  // in the imagery set. Options take turns through them so they don't repeat.
  const place = (slot, list) => {
    if (!list || !list.length) return;
    const label = list[rank % list.length];
    if (images.includes(label)) return;
    if (images[slot]) seen.delete(images[slot]);
    images[slot] = label;
    seen.add(label);
  };
  place(3, L.cue && L.cue.images);
  place(4, L.industry && L.industry.images);
  const pool = [...new Set(queues.flat())].filter((l) => !seen.has(l));
  images.slice(0, 4).forEach((l) => shown.add(l));
  const src = (label) => [label, curatedImage(label) ? "Wikimedia Commons" : "Search"];
  return { images: images.map(src), imgPool: pool.map(src) };
}

function gradientFor(mix, ctx) {
  if (ctx.noGradients) return "none";
  const levels = { core: 3, subtle: 2, optional: 1, none: 0 };
  const lead = levels[ARCHETYPE_BY_ID[mix[0].id].gradient];
  const blended = Math.max(...mix.slice(1).map((m) => (m.w >= 0.3 ? levels[ARCHETYPE_BY_ID[m.id].gradient] : 0)), 0);
  const best = Math.max(lead, blended >= 3 ? 2 : 0);
  return best >= 3 ? "core" : best === 2 ? "subtle" : "none";
}

const listOf = (xs) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1]);

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// How the founder's sliders lean, in words ("serious and professional"). Only clear leans count.
function sliderLean(sl = {}) {
  const words = [];
  if (sl.serious > 60) words.push("serious"); else if (sl.serious < 40) words.push("playful");
  if (sl.warmth > 60) words.push("professional"); else if (sl.warmth < 40) words.push("warm");
  if (sl.energy > 60) words.push("energetic"); else if (sl.energy < 40) words.push("calm");
  return words;
}

// The option's name: the lead archetype's territory with the second one's twist ("Rugged
// systems"), or the lead's own name when it stands alone ("Solid systems").
function directionName(mix) {
  const lead = ARCHETYPE_BY_ID[mix[0].id];
  if (!mix[1]) return lead.soloName;
  return cap(`${ARCHETYPE_BY_ID[mix[1].id].twist} ${lead.noun}`);
}

// The recommendation, written as a short design rationale: what the brand is, what in the brief
// points there, and how it shows up in the design. Weights are expressed in words, never numbers.
function explain(mix, rank, ctx, firstLead) {
  const [lead, second, third] = mix.map((m) => ARCHETYPE_BY_ID[m.id]);
  const evenly = second && mix[1].w >= 0.45;

  // 1. What it is.
  let opening = cap(lead.essence);
  if (second) opening += `, ${second.flavor}`;
  if (third) opening += `, and a ${third.twist} undertone`;
  opening += ".";

  // 2. What in the brief points here, in the founder's own words: tone words they picked are
  // descriptions; words found in their answers are things the brief talks about.
  const why = [...new Set(mix.flatMap((m) => m.why))].filter((x) => !/^(Your |Common in )/.test(x));
  const described = why.filter((x) => (ctx.tone || []).includes(x)).map((x) => x.toLowerCase());
  const mentioned = why.filter((x) => !(ctx.tone || []).includes(x)).map((x) => x.toLowerCase());
  const lean = sliderLean(ctx.sl).filter((w) => !described.includes(w)); // Don't say "warm" twice.
  const parts = [];
  if (described.length) parts.push(`you described it as ${listOf(described.slice(0, 3))}`);
  if (mentioned.length) parts.push(`your brief talks about ${listOf(mentioned.slice(0, 2).map((x) => `"${x}"`))}`);
  if (lean.length) parts.push(`your sliders lean ${listOf(lean)}`);
  const evidence = parts.length ? cap(listOf(parts)) + "." : "This reads closest to your answers so far.";

  // 3. How it shows up.
  let design = `That comes through in ${lead.carries}`;
  if (second) design += evenly ? `, balanced by ${second.touch}` : `, with ${second.touch}`;
  design += ".";

  // 4. Where it sits among the three options.
  const standing = rank === 0
    ? "It's the closest read of your brief."
    : lead.id === firstLead
      ? `Same foundation as Option 1, ${second ? second.flavor : "on its own"} instead.`
      : rank === 1 ? `A different emphasis on the same brief, with ${lead.name} leading.` : `The wildcard: ${lead.name} leading, a less expected answer to the same brief.`;

  const match = [...new Set(mix.flatMap((m) => m.why))].filter((x) => !/^(Your |Common in )/.test(x)).slice(0, 4);
  if (ctx.noGradients) match.push("No gradients");
  if (ctx.noNeon) match.push("No neon");
  const tradeoff = lead.misfire + (third ? " With three influences it can blur, so lock the pieces you like and regenerate the rest." : "");

  // One line per reasoning layer, shown with the recommendation. Archetype names stay visible
  // here so the source is legible, but in words, not percentages.
  const L = ctx.layers, layers = [];
  const personality = !second
    ? `${lead.name} through and through: ${lead.attributes.slice(0, 3).join(", ").toLowerCase()}.`
    : evenly
      ? `${lead.name} and ${second.name} in equal measure: ${lead.twist} and ${second.twist}${third ? `, with a hint of ${third.name}` : ""}.`
      : `${lead.name} at its core, with ${second.name}'s ${second.twist} streak${third ? ` and a hint of ${third.name}` : ""}.`;
  layers.push({ layer: "Personality", text: personality });
  const tw = toneWords(ctx.toneDials);
  if (tw.length) layers.push({ layer: "Tone", text: `Reads ${listOf(tw)}: ${[ctx.toneDials.temperature > 0.2 ? "warmer hues" : ctx.toneDials.temperature < -0.2 ? "cooler hues" : null, ctx.toneDials.loudness > 0.2 ? "more saturated color" : ctx.toneDials.loudness < -0.2 ? "quieter color" : null, ctx.toneDials.sharpness > 0.2 ? "deeper, firmer contrast" : ctx.toneDials.sharpness < -0.2 ? "lighter, looser color" : null].filter(Boolean).join(", ")}.` });
  if ((ctx.seeds || []).length) layers.push({ layer: "Seeds", text: `Built around your colors ${listOf(ctx.seeds.slice(0, 3).map((x) => x.hex))}, ${ctx.keepStrength >= 0.75 ? "kept as they are" : ctx.keepStrength >= 0.35 ? "as a strong steer" : "as a light nudge"}.` });
  if (L.industry) layers.push({ layer: "Category", text: `${L.industry.label.split(" and ")[0]} brands usually use ${L.industry.look}.` });
  else if (L.industryOther) layers.push({ layer: "Category", text: `No rules yet for ${L.industryOther}, so this leans on the other layers.` });
  const dialText = ctx.dial < 0.35 ? "Close to the category: a trusted alternative, done better." : ctx.dial < 0.65 ? "Stands apart from the category without breaking it." : "Breaks from the category: a clear challenger.";
  const stance = L.stance.length ? ` Your brief calls today's options ${listOf(L.stance.slice(0, 2).map((x) => `"${x}"`))}.` : "";
  const rivals = L.competitors.length ? ` Steers clear of ${listOf(L.competitors.map((c) => c.name))}'s colors.` : "";
  layers.push({ layer: "Positioning", text: dialText + stance + rivals });
  if (L.profile) layers.push({ layer: "Audience", text: `For ${L.profile.label}: ${L.profile.effect}.` });
  if (L.cue) layers.push({ layer: "Name", text: `"${L.cue.word}" in the name brings ${L.cue.gist} into the palette and imagery, and suggests ${L.cue.wordmark} for the wordmark.` });
  if (L.industry) match.unshift(L.industry.label.split(" and ")[0]);
  return { name: directionName(mix), reason: `${opening} ${evidence} ${design} ${standing}`, match: match.slice(0, 6), tradeoff, layers };
}

// Tone, as three color dials from the system map (each -1…1):
//   temperature: warm (+) or cool (−)       ← the Warm–Professional slider, Warm and Industrial chips
//   loudness:    vivid (+) or quiet (−)     ← the Calm–Energetic slider, Bold, Calm, Minimal chips
//   sharpness:   serious (+) or playful (−) ← the Playful–Serious slider, Precise, Sturdy, Playful chips
function toneDials(sl = {}, chips = []) {
  const v = (k) => (sl[k] == null ? 50 : sl[k]);
  const d = { temperature: (50 - v("warmth")) / 50, loudness: (v("energy") - 50) / 50, sharpness: (v("serious") - 50) / 50, minimal: false };
  const nudge = { Warm: ["temperature", 0.3], Industrial: ["temperature", -0.15], Bold: ["loudness", 0.3], Calm: ["loudness", -0.3], Minimal: ["loudness", -0.15], Playful: ["sharpness", -0.3], Precise: ["sharpness", 0.2], Sturdy: ["sharpness", 0.15] };
  chips.forEach((c) => { if (nudge[c]) d[nudge[c][0]] += nudge[c][1]; });
  d.minimal = chips.includes("Minimal");
  ["temperature", "loudness", "sharpness"].forEach((k) => { d[k] = clamp(d[k], -1, 1); });
  return d;
}

// The tone in words, for the reasons ("warm, vivid and serious"). Only clear leans count.
function toneWords(d) {
  const w = [];
  if (d.temperature > 0.2) w.push("warm"); else if (d.temperature < -0.2) w.push("cool");
  if (d.loudness > 0.2) w.push("vivid"); else if (d.loudness < -0.2) w.push("quiet");
  if (d.sharpness > 0.2) w.push("serious"); else if (d.sharpness < -0.2) w.push("playful");
  return w;
}

// The moodboard photos' colors, merged: vivid ones become accent candidates, and the overall
// cast (warm or cool) tints the surface. Returns null until at least one photo has been read.
function photoPalette(labels) {
  // The fourth slot is the name's cue photo: it counts, but at half weight, so one photo placed
  // for the name doesn't set the color for the whole moodboard.
  const read = labels.map((label, k) => ({ label, colors: imageColors(label), slot: k === 3 ? 0.5 : 1 })).filter((x) => x.colors && x.colors.length);
  if (!read.length) return null;
  const vivid = [];
  let castA = 0, castB = 0, castW = 0;
  read.forEach(({ label, colors, slot }) => {
    colors.forEach((c) => {
      const [L, C, H] = c.lch;
      castA += Math.cos((H * Math.PI) / 180) * C * c.share;
      castB += Math.sin((H * Math.PI) / 180) * C * c.share;
      castW += c.share;
      // Accent candidates: clearly colored, not near black or white, weighted by area × vividness.
      if (C > 0.06 && L > 0.3 && L < 0.88) {
        const same = vivid.find((v) => Math.abs(hueTurn(v.lch[2], H)) < 20);
        const weight = c.share * C * slot;
        if (same) { if (weight > same.weight) Object.assign(same, { lch: c.lch, label }); same.weight += weight; }
        else vivid.push({ lch: c.lch, label, weight });
      }
    });
  });
  vivid.sort((x, y) => y.weight - x.weight);
  const castC = Math.hypot(castA, castB) / (castW || 1);
  const castH = ((Math.atan2(castB, castA) * 180) / Math.PI + 360) % 360;
  return { vivid: vivid.slice(0, 4), cast: castC > 0.012 ? castH : null };
}

// Orders photos by how close their colors sit to the palette (unread photos keep their place).
function rankByFit(list, hexes) {
  const pal = hexes.map(hexToOklch);
  const fit = (label) => {
    const colors = imageColors(label);
    if (!colors || !colors.length) return 0;
    return colors.reduce((n, c) => n + c.share * Math.min(...pal.map((p) => Math.hypot(p[0] - c.lch[0], (p[1] - c.lch[1]) * 2) + Math.abs(hueTurn(p[2], c.lch[2])) / 360)), 0);
  };
  return list.map((x, i) => ({ x, i, f: fit(x[0]) })).sort((a, b) => (a.f && b.f ? a.f - b.f : a.i - b.i)).map((y) => y.x);
}

function direction(mix, rank, offset, ctx, shown) {
  const lead = ARCHETYPE_BY_ID[mix[0].id];
  const second = mix[1] && ARCHETYPE_BY_ID[mix[1].id];
  // Three variants of every module, used by Regenerate. An option that shares its lead with an
  // earlier option starts on a later variant, so the two don't look alike.
  const vs = [0, 1, 2].map((k) => k + offset);
  // Imagery first: the palette is built partly out of the photos' own colors.
  const { images, imgPool } = buildImages(mix, offset, shown, ctx, rank);
  ctx = { ...ctx, dial: dialFor(mix, ctx), imagery: photoPalette(images.slice(0, 4).map((x) => x[0])) };
  const built = vs.map((v) => buildPalette(mix, v, ctx));
  const palettes = built.map((b) => b.rows);
  const words = vs.map((v) => pick(lead.words, v).slice());
  const types = vs.map((v) => [pick(lead.display, v), second && mix[1].w >= 0.3 ? pick(second.body, v) : pick(lead.body, v)]);
  const voices = vs.map((v) => buildVoice(mix, v, ctx));
  // Photos not shown yet are ordered by how well they fit the palette, for Swap and Regenerate.
  const pool = rankByFit(imgPool, built[0].rows.map((r) => r[1]));
  const text = explain(mix, rank, ctx, ctx.firstLead);
  return {
    ...text,
    mix: mix.map((m) => ({ id: m.id, name: ARCHETYPE_BY_ID[m.id].name, w: m.w })),
    accentIdx: 4,
    wordFont: words[0][0], track: words[0][1], display: types[0][0], body: types[0][1],
    palettes, words, types, voices, images, imgPool: pool,
    look: { ...lead.look },
    gradient: gradientFor(mix, ctx),
    dial: ctx.dial,
    primaryReasons: built[0].reasons,
  };
}

// Distinctiveness, 0 (look like the category, done better) to 1 (break from it). Pushed up by
// the founder's stance against today's options and by challenger archetypes, pulled down by
// steady ones, and capped by what the audience can take.
function dialFor(mix, ctx) {
  const L = ctx.layers;
  let d = 0.4 + Math.min(0.3, L.stance.length * 0.08);
  mix.forEach((m) => {
    if (["rebel", "transformer", "magician", "jester"].includes(m.id)) d += m.w * 0.35;
    if (["protector", "sage", "ruler", "innocent"].includes(m.id)) d -= m.w * 0.15;
  });
  if (L.profile) d = Math.min(d + (L.profile.bias || 0), L.profile.cap);
  return Math.round(clamp(d, 0.1, 0.95) * 100) / 100;
}

// ---------- Entry point ----------

export function generateDirections(state, adjust) {
  const ctx = {
    avoidC: state.avoidC || [],
    noGradients: (state.avoidT || []).includes("Gradients"),
    noNeon: (state.avoidT || []).includes("Neon"),
    adjust: state.f.colorDir ? (hex) => adjust(hex, state.f.colorDir) : null,
    sl: state.sl,
    tone: state.tone || [],
    toneDials: toneDials(state.sl, state.tone || []),
    keepStrength: 1 - (state.keep == null ? 40 : state.keep) / 100,
  };
  // Seeds: colors to keep, then the vivid colors of admired references. Avoided references add
  // their vivid colors to the avoid list.
  const refAvoid = (label) => (state.refTags && state.refTags[label] !== undefined ? state.refTags[label] : label === "Neon sign");
  const vividOf = (label) => (imageColors(label) || []).filter((c) => c.lch[1] > 0.06 && c.lch[0] > 0.25 && c.lch[0] < 0.9).slice(0, 1);
  ctx.seeds = (state.keepC || []).map((hex) => ({ hex, lch: hexToOklch(hex) }))
    .concat((state.refs || []).filter((l) => !refAvoid(l)).flatMap((l) => vividOf(l).map((c) => ({ hex: c.hex, lch: c.lch, from: `"${l}"` }))))
    .slice(0, 3);
  ctx.avoidC = ctx.avoidC.concat((state.refs || []).filter(refAvoid).flatMap((l) => vividOf(l).map((c) => c.hex)));
  const audience = audienceOf(state.f);
  ctx.layers = {
    industry: industryOf(state.f),
    industryOther: state.f.industry === "other" ? (state.f.industryOther || "").trim() || "your industry" : "",
    audience,
    profile: audience ? AUDIENCES[audience] : null,
    cue: nameCuesOf(state.f)[0] || null,
    competitors: competitorColorsOf(state.comps),
    stance: stanceOf(state.f),
  };
  const ranked = score(state);
  const picked = blends(ranked, ctx.layers.profile ? ctx.layers.profile.noLead : []);
  ctx.firstLead = picked[0][0].id;
  const leads = {};
  const shown = new Set(); // Photos earlier options open on, so later ones pick others.
  return {
    ranked,
    directions: picked.map((mix, rank) => {
      const offset = leads[mix[0].id] || 0;
      leads[mix[0].id] = offset + 1;
      return direction(mix, rank, offset, ctx, shown);
    }),
  };
}
