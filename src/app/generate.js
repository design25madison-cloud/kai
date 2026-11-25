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
import { restrictedHits } from "./language.js";
import { AUDIENCES, audienceOf, competitorColorsOf, industryOf, isLiteral, nameCuesOf, stanceOf } from "./layers.js";

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

export function rgbDistance(a, b) {
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
  [10, "Red"], [20, "Vermilion"], [32, "Orange"], [44, "Amber"], [56, "Gold"], [70, "Chartreuse"], [90, "Olive"],
  [135, "Green"], [165, "Forest"], [185, "Teal"], [200, "Cyan"], [215, "Azure"], [235, "Cobalt"], [255, "Indigo"],
  [280, "Violet"], [305, "Plum"], [330, "Magenta"], [350, "Rose"], [361, "Red"],
];
// HSL saturation reads near-white and near-black colors as vivid, so lightness and chroma come from
// OKLCH; only the hue name comes from the HSL hue.
export function colorName([h, s, l]) {
  const [L, C] = hexToOklch(hslToHex([h, s, l]));
  if (C < 0.025 || L > 0.97 || L < 0.18) {
    if (L < 0.22) return "Ink";
    if (L < 0.33) return "Graphite";
    if (L < 0.55) return "Slate";
    if (L < 0.78) return "Stone";
    if (L < 0.93) return "Fog";
    return "Paper";
  }
  if (C < 0.1 && h >= 15 && h <= 70) return L > 0.9 ? "Linen" : L > 0.8 ? "Sand" : L > 0.6 ? "Tan" : L > 0.45 ? "Clay" : L > 0.32 ? "Oxide" : "Deep oxide";
  let hue = HUES.find(([max]) => h < max)[1];
  if (hue === "Olive" && L > 0.65) hue = "Lime"; // Olive is a dark yellow-green; a light one is lime.
  if (L > 0.88) return "Pale " + hue.toLowerCase();
  if (L < 0.4) return "Deep " + hue.toLowerCase();
  if (C < 0.07) return "Dusty " + hue.toLowerCase();
  if (C > 0.17 && L > 0.55) return "Bright " + hue.toLowerCase();
  return hue;
}

// Color words a designer might type in the color direction, as a typical swatch.
const COLOR_WORDS = {
  red: "#C62828", crimson: "#B0102F", scarlet: "#D8281E", vermilion: "#E0401C", orange: "#EE7A1E", tangerine: "#F28500",
  amber: "#F0A020", rust: "#A84A24", terracotta: "#C8643C", brick: "#A0402C", burgundy: "#7A1F2E", maroon: "#6E1A26",
  wine: "#722F37", coral: "#F07060", salmon: "#F08070", peach: "#F6B48C", pink: "#E86A9A", rose: "#D0507A",
  magenta: "#C2187A", fuchsia: "#D020A0", purple: "#6A2C91", violet: "#7A4FC9", plum: "#6E2F5E", lavender: "#B6A2DE",
  lilac: "#C3A6D8", indigo: "#3A3F9A", navy: "#1F2F5C", blue: "#2860C8", cobalt: "#1F4FB8", azure: "#2E8BE6",
  sky: "#6AB4E8", cyan: "#10A8C8", teal: "#127C7C", turquoise: "#20B2AA", aqua: "#3CC8C8", mint: "#8ED8B0",
  sage: "#8FA88A", green: "#2E8B4A", emerald: "#0F8A5A", forest: "#1F5A36", olive: "#6B7A2A", moss: "#5E7A3A",
  lime: "#9CCB2A", chartreuse: "#A8D020", yellow: "#F2C81E", gold: "#C8A030", mustard: "#C8A02A", ochre: "#C08A2A",
  sand: "#D8C4A0", tan: "#C49A6C", beige: "#E3D5BE", brown: "#6B4430", chocolate: "#5A3420", coffee: "#5E3F2C",
  espresso: "#3E2A20", caramel: "#B87A3E", copper: "#B4643A", bronze: "#8C6A34", cream: "#F3EBD6", ivory: "#F6F1E4",
  paper: "#F6F4EE", white: "#FAFAFA", linen: "#F2EDE2", bone: "#E8E1D2", black: "#141414", ink: "#1E2430",
  charcoal: "#2E3134", graphite: "#3A3D40", slate: "#4E5966", grey: "#8A8D90", gray: "#8A8D90", silver: "#BFC3C6", stone: "#9C968C",
};
const colorWord = (w) => COLOR_WORDS[w] || COLOR_WORDS[w.slice(0, -1)] || COLOR_WORDS[w.slice(0, -2)]; // "blues", "peaches"
const NOT = /\b(no|not|avoid|never|less|too)\b/;

// Reads the color direction. Each phrase between commas, "and" or "with" that names colors is one
// color: its color words are blended ("red-orange", "ink blue") and its other words go to adjust as
// modifiers ("deep teal"). Phrases without a color word ("warmer", "muted") are the rest, which
// adjust applies to the whole palette. Phrases that rule something out are skipped.
export function readColorDirection(text, adjust) {
  const colors = [], rest = [];
  (text || "").toLowerCase().split(/[,;&/]|\b(?:and|with|plus|or|but)\b/).forEach((phrase) => {
    if (NOT.test(phrase)) return;
    phrase = phrase.replace(/\b(a|an|one|some|the|touch|hint|bit|splash|dash|of|accents?)\b/g, " ").replace(/\s+/g, " ").trim(); // "a touch of moss" is "moss"
    if (!phrase) return;
    const words = phrase.split(/[^a-z]+/).filter(Boolean), hits = words.map(colorWord).filter(Boolean);
    if (!hits.length) { rest.push(phrase); return; }
    // Blend in OKLab, so "red-orange" sits between the two.
    const ab = hits.map((x) => { const [L, C, H] = hexToOklch(x); return [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)]; });
    const [L, A, B] = [0, 1, 2].map((i) => ab.reduce((n, c) => n + c[i], 0) / ab.length);
    let hex = oklchToHex([L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360]);
    const mods = words.filter((w) => !colorWord(w)).join(" ");
    hex = (mods && adjust && adjust(hex, mods)) || hex;
    colors.push({ hex, lch: hexToOklch(hex), label: `"${phrase}"`, kind: "text" });
  });
  return { colors, rest: rest.join(", ") };
}

// Pale or dark neutrals ("cream", "ink") among the founder's colors become the surface or the dark
// neutral rather than an accent.
const paleNeutral = (s) => s.lch[0] >= 0.86 && s.lch[1] < 0.08;
const darkNeutral = (s) => s.lch[0] <= 0.32 && s.lch[1] < 0.06;

// The founder's colors that made it into a palette: the lead (perhaps darkened) and any kept exactly.
const seedsIn = (ctx, rows) => (ctx.seeds || []).filter((s) => s === ctx.leadSeed || rows.some((r) => r[1] === s.hex));
const seedText = (s, what) => (s.kind === "text" ? `${s.label} from your color direction ${what}` : `Your color ${s.label} ${what}`);

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
// The brief's look pairs, in the order of archetypes' `looks` ("a" is the first of each pair).
const LOOK_PAIRS = [["Warm", "Cool"], ["Serif", "Sans"], ["Ornate", "Minimal"], ["Soft", "Geometric"]];
// The serif faces among the archetypes' fonts; every other one is a sans (or mono).
const SERIFS = new Set(["Alfa Slab One", "Bodoni Moda", "Cormorant", "Cormorant Garamond", "DM Serif Display", "EB Garamond", "Fraunces", "Libre Caslon Display", "Newsreader", "Playfair Display", "Source Serif 4", "Young Serif"]);
const RATIOS = [30, 40, 15, 5];
// How a palette treats the colors around its primary. The three options open on different routes
// and each option's variants try the other two, so a shared or kept primary still gives three looks.
const ROUTES = ["tonal", "temperature", "contrast"];
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
        ctx.categoryAccent = [conv, 55, 45]; // Its reason is given below, once it's really among the accents.
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

  // Category and competitor moves can land on a color the founder ruled out: check again.
  for (let g = 0; g < 6 && ctx.avoidC.some((x) => rgbDistance(hslToHex(primary), x) < 70); g++) primary = turnTo(primary, 30);

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

  // Seeds: the founder's colors (kept hexes, then colors named in the color direction, then
  // admired photos). The lead seed becomes the primary as is, darkened only if white text needs it.
  // Pale and dark neutrals set the surface and dark neutral; the rest become accents.
  const seeds = ctx.seeds || [], leadSeed = ctx.leadSeed;
  const others = seeds.filter((s) => s !== leadSeed);
  const paleSeed = others.find(paleNeutral), darkSeed = others.find(darkNeutral);
  const seedAccents = others.filter((s) => s !== paleSeed && s !== darkSeed);
  if (leadSeed) {
    reasons.length = 0; // The founder's color replaces the primary, so the moves above no longer show.
    P = leadSeed.lch.slice();
  }
  P = fitForWhite(P, target);
  if (leadSeed) {
    const hex = oklchToHex(P);
    reasons.push({ layer: "Seeds", text: seedText(leadSeed, hex === leadSeed.hex || leadSeed.kind === "text" ? "leads the palette." : `leads the palette, darkened to ${hex} so white text on it reaches ${contrast(hex, "#FFFFFF").toFixed(1)}:1.`) });
  }
  const ratio = contrast(oklchToHex(P), "#FFFFFF");
  if (L.profile && target > 4.5 && ratio >= 7) reasons.push({ layer: "Audience", text: `For ${L.profile.label}, white text on the primary reaches AAA (${ratio.toFixed(1)}:1).` });
  const hasHue = P[1] > 0.04; // Black or graphite primaries (Rebel, Visionary) have no hue to build from.
  const Hp = P[2];

  // Neutrals follow the route (see ROUTES): tonal tints them toward the primary, contrast keeps them
  // near white and black so the accent stands out, temperature turns them the other way from the
  // primary (cool greys under a warm primary, warm ones under a cool primary).
  const route = ctx.route;
  const sur = hexToOklch(hslToHex(tweak(pick(p.surface, v))));
  const ownTint = sur[1] > 0.018;
  const opposite = isWarm(hasHue ? Hp : sur[2]) ? COOL_H : WARM_H + 20;
  let surfaceH = route === "temperature" ? opposite : !hasHue ? sur[2] : route === "tonal" || !ownTint ? Hp : sur[2];
  // A clearly warm or cool tone sets the tint of the tonal and contrast routes, even over an
  // archetype's own surface (Explorer's sand, Sage's parchment). The temperature route keeps its
  // counterpoint to the primary, or a cool tone with a cool primary would leave two routes alike.
  // Photos steer the primary and accents, not the neutrals, for the same reason.
  const toneSurface = route !== "temperature" && Math.abs(T.temperature) > (ownTint ? 0.5 : 0.3);
  if (toneSurface) surfaceH = T.temperature > 0 ? WARM_H + 20 : COOL_H;
  const surC = { tonal: hasHue ? 0.026 : 0.004, temperature: 0.022, contrast: 0.005 }[route];
  const surL = { tonal: 0.89, temperature: 0.94, contrast: 0.975 }[route];
  const surface = paleSeed ? paleSeed.lch.slice() : [surL, toneSurface ? Math.max(surC, 0.014) : surC, surfaceH];
  const light = [{ tonal: 0.965, temperature: 0.98, contrast: 0.995 }[route], surface[1] * 0.6, surface[2]];
  const drk = hexToOklch(hslToHex(tweak(pick(p.dark, v))));
  const darkL = clamp(drk[0] - 0.03 * T.sharpness + { tonal: 0.05, temperature: 0, contrast: -0.05 }[route], 0.12, 0.3);
  const darkC = { tonal: hasHue ? 0.035 : 0.01, temperature: 0.022, contrast: 0.004 }[route];
  const dark = darkSeed ? darkSeed.lch.slice() : [darkL, darkC, route === "temperature" ? opposite : hasHue ? Hp : drk[2]];
  if (paleSeed) reasons.push({ layer: "Seeds", text: seedText(paleSeed, "is the surface.") });
  if (darkSeed) reasons.push({ layer: "Seeds", text: seedText(darkSeed, "is the dark neutral.") });

  // Accents: one dominant, a second for support. Only the loud archetypes get a third.
  const loud = ["jester", "magician", "everyman", "creator", "transformer"].includes(lead.id);
  let count = clamp(Math.round(mix.reduce((n, m) => n + ARCHETYPE_BY_ID[m.id].accentCount * m.w, 0)), 1, 3);
  if (!loud) count = Math.min(count, 2);
  count = clamp(count + (L.profile && L.profile.extraAccent ? 1 : 0) + (cueAccent ? 1 : 0) + (T.sharpness < -0.4 ? 1 : 0), 1, loud || T.sharpness < -0.4 ? 3 : 2);
  // The founder's own colors may fill the accents up to that cap.
  if (seedAccents.length) count = Math.max(count, Math.min(seedAccents.length, loud || T.sharpness < -0.4 ? 3 : 2));
  if (T.minimal) count = 1; // Minimal: one accent, no more.

  // Where each accent's hue comes from, in priority order. Each one is then snapped to a harmony
  // with the primary (complement, split complement, triad or neighbor), so accents relate to the
  // primary and to each other instead of arriving from unrelated sources.
  const wanted = [];
  // The founder's other colors become accents before anything else.
  seedAccents.forEach((sd) => wanted.push({ src: hexToHsl(sd.hex), lch: sd.lch, why: "seed", seed: sd }));
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

  // The route picks the harmony: tonal stays beside the primary, contrast crosses to the other side
  // of the wheel, temperature takes the quarter turns between.
  const HARMONY = { tonal: [0, 25, -25, 40, -40], temperature: [90, 270], contrast: [180, 150, 210] };
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
    if (!w.why && (photos || seedAccents.length) && accents.length >= 1) break;
    const src = w.why === "seed" ? w.src : tweak(w.src, true);
    let H = hexToOklch(hslToHex(src))[2];
    // Photo colors keep their hue: they already sit together in the moodboard. Only colors from
    // other sources get snapped into a harmony with the primary.
    if (hasHue && w.why !== "photo" && w.why !== "seed") {
      const open = (offsets) => offsets.map((o) => (Hp + o + 360) % 360).filter((h) => !accents.some((a) => Math.abs(hueTurn(a[2], h)) < 45));
      // Once the route's own hues are used, a loud blend's further accents may come from any harmony.
      const own = open(HARMONY[route]);
      const free = own.length || !accents.length ? own : open(Object.values(HARMONY).flat());
      if (!free.length) break;
      const to = free.reduce((best, h) => (Math.abs(hueTurn(H, h)) < Math.abs(hueTurn(H, best)) ? h : best));
      // The category's color only counts as a nod while it stays recognisable; this route may not fit it.
      if (w.why === "category" && Math.abs(hueTurn(H, to)) > 30) continue;
      H = to;
    }
    if (accents.some((a) => Math.abs(hueTurn(a[2], H)) < 45)) continue;
    // A photo color that's just a lighter primary adds nothing as an accent.
    if (w.why === "photo" && hasHue && Math.abs(hueTurn(Hp, H)) < 30) continue;
    // Photo colors keep their own vividness (within a sensible range); others use a tier.
    // The route mutes (tonal) or lifts (contrast) the accent, but never against a clear loud or quiet tone.
    const routeC = { tonal: T.loudness > 0.2 ? 1 : 0.7, temperature: 1, contrast: T.loudness < -0.2 ? 1 : 1.3 }[route];
    const chroma = Math.min((w.lch ? clamp(w.lch[1], 0.08, ctx.noNeon ? 0.12 : 0.17) : tier(src[1])) * (1 + 0.25 * T.loudness) * routeC, ctx.noNeon ? 0.12 : 0.22);
    // Seeds keep their own lightness; others sit at the accent level (a touch lighter when playful).
    const acc = w.why === "seed" ? w.lch.slice() : [accentL(H, accents.length) - 0.03 * T.sharpness + { tonal: -0.04, temperature: 0.04, contrast: 0 }[route], chroma, H];
    const hex = oklchToHex(acc), hslHue = hexToHsl(hex)[0];
    // Breaking from the category: no accent in its signature hues either.
    if (L.industry && ctx.dial >= 0.65 && w.why !== "category" && w.why !== "seed" && L.industry.hues.some((h) => Math.abs(hueTurn(hslHue, h)) < 25)) { skippedForCategory = true; continue; }
    if (ctx.avoidC.some((x) => rgbDistance(hex, x) < 60)) continue;
    accents.push(acc);
    if (w.why === "seed") reasons.push({ layer: "Seeds", text: seedText(w.seed, "becomes an accent.") });
    if (w.why === "category") reasons.push({ layer: "Category", text: `${L.industry.label.split(" and ")[0]} brands usually use ${L.industry.look}. As the trusted alternative, the palette keeps that color as an accent.` });
    if (w.why === "photo") reasons.push({ layer: "Imagery", text: `${accents.length === 1 ? "The main accent" : "A supporting accent"} is drawn from the "${w.label}" photo.` });
    if (w.why === "cue") reasons.push({ layer: "Name", text: `"${L.cue.word}" in the name adds ${colorName(hexToHsl(hex)).toLowerCase()} as an accent.` });
  }
  if (!accents.length) {
    const from = hasHue ? (Hp + 180) % 360 : hexToOklch(hslToHex(pick(p.accents, v)))[2];
    // The routes allow few hues, so the fallback may have to turn away from an avoided color.
    const H = [0, 30, -30, 60, -60, 90, -90].map((o) => (from + o + 360) % 360).find((h) => !ctx.avoidC.some((x) => rgbDistance(oklchToHex([accentL(h, 0), tier(70), h]), x) < 60)) ?? from;
    accents.push([accentL(H, 0), tier(70), H]);
  }
  if (skippedForCategory) reasons.push({ layer: "Positioning", text: `No accent in ${L.industry.look.split(" and ")[0]}, to break from the category.` });

  const split = accents.length === 1 ? [10] : accents.length === 2 ? [7, 3] : [6, 3, 1];
  const used = new Set();
  const named = (hex) => {
    const hsl = hexToHsl(hex);
    let n = colorName(hsl);
    if (used.has(n)) n = (hsl[2] > 50 ? "Light " : "Dark ") + n.replace(/^(Deep|Pale|Bright|Dusty) /, "").toLowerCase();
    if (used.has(n)) n = n + " " + (used.size + 1);
    used.add(n);
    return n;
  };
  const rows = [P, surface, dark, light].map((c, k) => { const hex = oklchToHex(c); return [named(hex), hex, ROLES[k], RATIOS[k]]; })
    .concat(accents.map((c, k) => { const hex = oklchToHex(c); return [named(hex), hex, k === 0 ? "Accent" : `Accent ${k + 1}`, split[k]]; }));
  const shows = toneShown(T, rows);
  if (shows.length) reasons.push({ layer: "Tone", text: `Your tone reads ${listOf(shows.map((x) => x[0]))}, and the palette follows: ${listOf(shows.map((x) => x[1]))}.` });
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
  // Imagery carries the brand, not the business: skip anything that pictures a workplace,
  // equipment or product, and anything that pictures the founder's own industry.
  const L = ctx.layers;
  const cliche = (label) => L.industry && L.industry.cliches.some((c) => label.toLowerCase().includes(c));
  const queues = mix.map((m, k) => order(ARCHETYPE_BY_ID[m.id], k).filter((l) => !cliche(l) && !isLiteral(l)));
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
  // The name's cue places one photo on the moodboard (its meaning, as a material or landscape).
  // Options take turns through its subjects so they don't repeat.
  const place = (slot, list) => {
    if (!list || !list.length) return;
    const label = list[rank % list.length];
    // A short list wraps around, so a later option skips a photo an earlier one opens on.
    if (images.includes(label) || (slot < 4 && shown.has(label))) return;
    if (images[slot]) seen.delete(images[slot]);
    images[slot] = label;
    seen.add(label);
  };
  place(3, L.cue && L.cue.images.filter((l) => !isLiteral(l)));
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

const uniq = (xs) => xs.filter((x, k) => xs.findIndex((y) => JSON.stringify(y) === JSON.stringify(x)) === k);

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
// systems"), or the lead's own name when it stands alone ("Solid systems"). A name another option
// already has falls back to the third archetype's twist, the lead's own name, then the second's territory.
function directionName(mix, taken) {
  const [lead, second, third] = mix.map((m) => ARCHETYPE_BY_ID[m.id]);
  const names = (second ? [`${second.twist} ${lead.noun}`, third && `${third.twist} ${lead.noun}`, lead.soloName, `${lead.twist} ${second.noun}`] : [lead.soloName]).filter(Boolean).map(cap);
  return names.find((n) => !taken.includes(n)) || names[0];
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

  // 3. How it shows up. When the founder's colors lead, the archetype's own colors don't, and a
  // sans display can't carry "serifs".
  let carries = ctx.leadSeed ? lead.carries.replace(/^.*?(color|tones|black and white), /, "") : lead.carries;
  if (!SERIFS.has(ctx.display)) carries = carries.replace(/(\w+) serifs/, "$1 type");
  if (ROUTES[ctx.firstRoute] !== "tonal") carries = carries.replace(" tonal color", " color"); // Sage's "quiet tonal color" on a contrasting palette.
  let design = `That comes through in ${carries}`;
  if (second) design += evenly ? `, balanced by ${second.touch}` : `, with ${second.touch}`;
  design += ".";

  // 4. Where it sits among the three options.
  // Where it sits among the three is added after scoring (see standingFor), because the
  // recommendation goes to the best fit, not to the first option.

  const match = [...new Set(mix.flatMap((m) => m.why))].filter((x) => !/^(Your |Common in )/.test(x)).slice(0, 4);
  // Look picks count only when the result shows them: the type for Serif or Sans, the palette for
  // Warm or Cool, and the lead's own look for the other two pairs.
  const lch = [ctx.rows[0]].concat(ctx.rows.slice(4)).map((r) => hexToOklch(r[1])).filter((c) => c[1] > 0.04);
  const warmShare = lch.filter((c) => isWarm(c[2])).length / (lch.length || 1);
  const follows = [
    (x) => lch.length > 0 && (x === "a" ? warmShare >= 0.5 : warmShare <= 0.5),
    (x) => (x === "a" ? SERIFS.has(ctx.display) : !SERIFS.has(ctx.display) && !SERIFS.has(ctx.body)),
    (x) => lead.looks[2] === x,
    (x) => lead.looks[3] === x,
  ];
  LOOK_PAIRS.forEach((pair, k) => { const x = ctx.looks[k], label = x && pair[x === "a" ? 0 : 1]; if (x && follows[k](x) && !match.includes(label)) match.push(label); });
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
  const shows = toneShown(ctx.toneDials, ctx.rows);
  if (shows.length) layers.push({ layer: "Tone", text: `Reads ${listOf(shows.map((x) => x[0]))}: ${shows.map((x) => x[1]).join(", ")}.` });
  const seeds = ctx.seeds || [];
  if (seeds.length) {
    // Name only the colors really in the palette, and say how many were left out.
    const used = seedsIn(ctx, ctx.rows), own = used.filter((x) => x.kind !== "text"), said = used.filter((x) => x.kind === "text"), left = seeds.length - used.length;
    const parts = [own.length && `your color${own.length > 1 ? "s" : ""} ${listOf(own.map((x) => x.label))}`, said.length && `${listOf(said.map((x) => x.label))} from your color direction`].filter(Boolean);
    const out = left ? `${left} of your ${seeds.length} colors ${left === 1 ? "was" : "were"} left out to keep the palette focused.` : "";
    layers.push({ layer: "Seeds", text: parts.length ? `Built around ${listOf(parts)}.${out && " " + out}` : out });
  }
  if (L.industry) layers.push({ layer: "Category", text: `${L.industry.label.split(" and ")[0]} brands usually use ${L.industry.look}.` });
  else if (L.industryOther) layers.push({ layer: "Category", text: `No rules yet for ${L.industryOther}, so this leans on the other layers.` });
  const dialText = ctx.dial < 0.35 ? "Close to the category: a trusted alternative, done better." : ctx.dial < 0.65 ? "Stands apart from the category without breaking it." : "Breaks from the category: a clear challenger.";
  const stance = L.stance.length ? ` Your brief calls today's options ${listOf(L.stance.slice(0, 2).map((x) => `"${x}"`))}.` : "";
  const rivals = L.competitors.length && !clashOf(L.competitors, ctx.rows) ? ` Steers clear of ${listOf(L.competitors.map((c) => c.name))}'s colors.` : "";
  layers.push({ layer: "Positioning", text: dialText + stance + rivals });
  if (L.profile) layers.push({ layer: "Audience", text: `For ${L.profile.label}: ${L.profile.effect}.` });
  const into = [ctx.cueInPalette && "palette", ctx.cueInImagery && "imagery"].filter(Boolean);
  if (L.cue) layers.push({ layer: "Name", text: `"${L.cue.word}" in the name ${into.length ? `brings ${L.cue.gist} into the ${into.join(" and ")}, and ` : ""}suggests ${L.cue.wordmark} for the wordmark.` });
  if (L.industry) match.unshift(L.industry.label.split(" and ")[0]);
  return { reasonBody: `${opening} ${evidence} ${design}`, match: match.slice(0, 8), tradeoff, layers };
}

// Tone, as three color dials from the system map (each -1…1):
//   temperature: warm (+) or cool (−)       ← the Warm–Professional slider, Warm and Industrial chips
//   loudness:    vivid (+) or quiet (−)     ← the Calm–Energetic slider, Bold, Calm, Minimal chips
//   sharpness:   serious (+) or playful (−) ← the Playful–Serious slider, Precise, Sturdy, Playful chips
function toneDials(sl = {}, chips = [], looks = {}) {
  const v = (k) => (sl[k] == null ? 50 : sl[k]);
  const d = { temperature: (50 - v("warmth")) / 50, loudness: (v("energy") - 50) / 50, sharpness: (v("serious") - 50) / 50, minimal: false };
  d.temperature += looks[0] === "a" ? 0.5 : looks[0] === "b" ? -0.5 : 0; // The Warm or Cool look pick.
  const nudge = { Warm: ["temperature", 0.3], Industrial: ["temperature", -0.15], Bold: ["loudness", 0.3], Calm: ["loudness", -0.3], Minimal: ["loudness", -0.15], Playful: ["sharpness", -0.3], Precise: ["sharpness", 0.2], Sturdy: ["sharpness", 0.15] };
  chips.forEach((c) => { if (nudge[c]) d[nudge[c][0]] += nudge[c][1]; });
  d.minimal = chips.includes("Minimal");
  ["temperature", "loudness", "sharpness"].forEach((k) => { d[k] = clamp(d[k], -1, 1); });
  return d;
}

// The tone leans the finished palette really shows, as [tone word, what it does to the color].
// Same tests as the Fit line, so the text never claims "warmer hues" on a blue palette.
function toneShown(d, rows) {
  const [primary, ...accents] = [rows[0]].concat(rows.slice(4)).map((r) => hexToOklch(r[1]));
  const chromatic = [primary].concat(accents).filter((c) => c[1] > 0.04);
  const warm = chromatic.filter((c) => isWarm(c[2])).length / (chromatic.length || 1);
  const vivid = accents.length > 0 && Math.max(...accents.map((c) => c[1])) > 0.13;
  return [
    chromatic.length && d.temperature > 0.2 && warm >= 0.5 && ["warm", "warmer hues"],
    chromatic.length && d.temperature < -0.2 && warm <= 0.5 && ["cool", "cooler hues"],
    d.loudness > 0.2 && vivid && ["vivid", "more saturated color"],
    d.loudness < -0.2 && !vivid && ["quiet", "quieter color"],
    d.sharpness > 0.2 && primary[0] < 0.52 && ["serious", "deeper, firmer contrast"],
    d.sharpness < -0.2 && primary[0] > 0.4 && ["playful", "lighter, looser color"],
  ].filter(Boolean);
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
  const build = (o) => [0, 1, 2].map((k) => buildPalette(mix, vs[(o + k) % 3], { ...ctx, route: ROUTES[(ctx.firstRoute + k) % 3] }));
  let built = build(0);
  // Open on the variant whose primary sits furthest from the earlier options' primaries, so the
  // three don't share a color family unless the brief forces one (kept or named colors, tone).
  const gap = (a, b) => (a[1] < 0.04 || b[1] < 0.04 ? (a[1] < 0.04 && b[1] < 0.04 ? 0 : 180) : Math.abs(hueTurn(a[2], b[2])));
  const spread = built.map((b) => Math.min(180, ...ctx.primaries.map((p) => gap(hexToOklch(b.rows[0][1]), p))));
  const o = spread[0] >= 40 ? 0 : spread.indexOf(Math.max(...spread));
  if (o) built = build(o);
  ctx.primaries.push(hexToOklch(built[0].rows[0][1]));
  const palettes = built.map((b) => b.rows);
  // Serif or Sans in the brief picks the faces, from the first of the mix's font lists that has one.
  const want = ctx.looks[1], others = mix.slice(1).map((m) => ARCHETYPE_BY_ID[m.id]);
  const suits = (font, isBody) => !want || (want === "a" ? isBody || SERIFS.has(font) : !SERIFS.has(font));
  const fitting = (lists, isBody, font = (x) => x) => lists.map((l) => l.filter((x) => suits(font(x), isBody))).find((l) => l.length) || lists[0];
  const display = fitting([lead, ...others].map((a) => a.display), false);
  const body = fitting([second && mix[1].w >= 0.3 ? second.body : lead.body, lead.body, ...others.map((a) => a.body)], true);
  const wordList = fitting([lead, ...others].map((a) => a.words), false, (w) => w[0]);
  // More candidates than the three variants: generateDirections keeps the ones no other option shows.
  const more = [0, 1, 2, 3, 4, 5].map((k) => k + offset);
  const words = uniq(more.map((v) => pick(wordList, v).slice()).concat(others.flatMap((a) => a.words).filter((w) => suits(w[0], false)).map((w) => w.slice())));
  const types = uniq(more.map((v) => [pick(display, v), pick(body, v)]).concat(display.flatMap((d) => body.map((b) => [d, b]))));
  const voices = uniq(more.map((v) => buildVoice(mix, v, ctx)));
  // Keep the display face but prefer a body face no earlier option opens on.
  const fresh = types.findIndex((t) => t[0] === types[0][0] && !ctx.bodies.includes(t[1]));
  if (fresh > 0) types.unshift(types.splice(fresh, 1)[0]);
  ctx.bodies.push(types[0][1]);
  // Photos not shown yet are ordered by how well they fit the palette, for Swap and Regenerate.
  const pool = rankByFit(imgPool, built[0].rows.map((r) => r[1]));
  // The name's cue can be filtered out of the palette; buildPalette gives a "Name" reason only when it's in.
  const cueInPalette = built[0].reasons.some((r) => r.layer === "Name");
  const cueInImagery = !!ctx.layers.cue && images.some((x) => ctx.layers.cue.images.includes(x[0]));
  const text = explain(mix, rank, { ...ctx, cueInPalette, cueInImagery, rows: built[0].rows, display: types[0][0], body: types[0][1] }, ctx.firstLead);
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

// ---------- 4. Scoring ----------
// Each finished option is checked against the brief: does it keep the founder's colors, stay
// clear of what they want to avoid and of competitors, match the tone, sit where positioning
// says, and keep the archetype fit? Points rank the options; only words are ever shown.

const isWarm = (H) => H < 110 || H > 330; // OKLCH: reds, oranges, yellows

// The first competitor whose main color shares a hue with the primary (k 0) or an accent.
function clashOf(rivals, rows) {
  const cols = [rows[0]].concat(rows.slice(4)).map((r) => hexToOklch(r[1]));
  for (const c of rivals) {
    const ch = hexToOklch(c.hex);
    if (ch[1] < 0.04) continue;
    const k = cols.findIndex((col) => col[1] > 0.04 && Math.abs(hueTurn(col[2], ch[2])) < 30);
    if (k >= 0) return { c, k };
  }
  return null;
}

function scoreDirection(d, mixPts, ctx, closest) {
  const pal = d.palettes[0], lch = pal.map((r) => hexToOklch(r[1]));
  const primary = lch[0], accents = lch.slice(4);
  const strong = [], weak = [];
  let pts = 2 * mixPts; // Personality: how well the archetypes fit the brief (0–2).
  if (mixPts >= 0.9) strong.push({ w: 1.5, text: `fits the character of your brief ${closest ? "most closely" : "closely"}` });

  // Seeds: kept colors should actually be in the palette.
  const seeds = ctx.seeds || [], kept = seedsIn(ctx, pal).length, left = seeds.length - kept;
  if (kept) { pts += 2 * kept; strong.push({ w: 2, text: "keeps your colors" }); }
  if (left) { pts -= 2 * left; weak.push({ w: 2, text: `leaves out ${left} of your colors` }); }

  // Avoid list: nothing close to a color the founder ruled out.
  ctx.avoidC.forEach((hex) => {
    const hit = pal.find((r) => rgbDistance(r[1], hex) < 60);
    if (hit) { pts -= 3; weak.push({ w: 3, text: `has a ${hit[0].toLowerCase()} close to your avoided ${hex}` }); }
  });

  // Competitors: primary and accents clear of their main colors.
  const rivals = ctx.layers.competitors;
  const clash = clashOf(rivals, pal);
  if (clash) { pts -= clash.k === 0 ? 3 : 1.5; weak.push({ w: clash.k === 0 ? 3 : 1.5, text: `has ${clash.k === 0 ? "a primary" : "an accent"} close to ${clash.c.name}'s color` }); }
  else if (rivals.length) { pts += 1; strong.push({ w: 1, text: `stands clear of ${listOf(rivals.map((c) => c.name))}` }); }

  // Tone: does the finished palette read the way the sliders asked?
  const T = ctx.toneDials, chromatic = [primary].concat(accents).filter((c) => c[1] > 0.04);
  if (Math.abs(T.temperature) > 0.3 && chromatic.length) {
    const warmShare = chromatic.filter((c) => isWarm(c[2])).length / chromatic.length;
    const ok = T.temperature > 0 ? warmShare >= 0.5 : warmShare <= 0.5;
    pts += ok ? 1 : -1.5;
    (ok ? strong : weak).push({ w: ok ? 1 : 1.5, text: ok ? `reads as ${T.temperature > 0 ? "warm" : "cool"} as you asked` : `reads ${T.temperature > 0 ? "cooler" : "warmer"} than your tone` });
  }
  if (Math.abs(T.loudness) > 0.3 && accents.length) {
    const vivid = Math.max(...accents.map((c) => c[1])) > 0.13;
    const ok = T.loudness > 0 ? vivid : !vivid;
    pts += ok ? 1 : -1;
    (ok ? strong : weak).push({ w: 1, text: ok ? (T.loudness > 0 ? "has the energy you asked for" : "stays quiet, as you asked") : (T.loudness > 0 ? "is quieter than your tone" : "is louder than your tone") });
  }
  if (Math.abs(T.sharpness) > 0.3) {
    // Serious reads as a deep primary, playful as a lighter one; the middle ground passes both.
    const ok = T.sharpness > 0 ? primary[0] < 0.52 : primary[0] > 0.4;
    pts += ok ? 0.5 : -0.5;
    if (!ok) weak.push({ w: 0.5, text: T.sharpness > 0 ? "is lighter than a serious tone suggests" : "is heavier than a playful tone suggests" });
  }

  // Positioning: distance from the category's usual colors should match the boldness setting.
  const ind = ctx.layers.industry;
  if (ind && primary[1] > 0.04) {
    const hslHue = hexToHsl(pal[0][1])[0];
    const away = Math.min(...ind.hues.map((h) => Math.abs(hueTurn(hslHue, h))));
    const short = ind.label.split(" and ")[0].toLowerCase();
    if (d.dial >= 0.65) {
      const ok = away > 45;
      pts += ok ? 1.5 : -1.5;
      (ok ? strong : weak).push({ w: 1.5, text: ok ? `breaks from ${short} convention like a challenger should` : `looks too much like ${short} convention for a challenger` });
    } else if (d.dial < 0.35) {
      const nod = pal.slice(4).some((r) => ind.hues.some((h) => Math.abs(hueTurn(hexToHsl(r[1])[0], h)) < 25));
      pts += nod ? 1 : 0;
      if (nod) strong.push({ w: 1, text: `feels at home in ${short}` });
    }
  }

  // Words the founder ruled out shouldn't appear in the voice.
  if (restrictedHits(ctx.banned || [], d.voices[0]).length) { pts -= 2; weak.push({ w: 2, text: "uses a word you ruled out" }); }

  strong.sort((x, y) => y.w - x.w);
  weak.sort((x, y) => y.w - x.w);
  return { pts, strong: strong.map((x) => x.text), weak: weak.map((x) => x.text) };
}

// One sentence on fit, in words: the two biggest strengths and the biggest thing to watch.
function fitLine(sc) {
  const s2 = [...new Set(sc.strong)].slice(0, 2), w1 = sc.weak[0];
  if (!s2.length && !w1) return "";
  if (!s2.length) return `Watch: it ${w1}.`;
  return `It ${listOf(s2)}${w1 ? `; watch: it ${w1}` : ""}.`;
}

function standingFor(d, k, rec, dirs) {
  const leadOf = (x) => x.mix[0].id;
  if (k === rec) return "It's the strongest fit for your brief.";
  // Same lead as the recommendation, or as an earlier option: say so, and what's different.
  const twin = leadOf(d) === leadOf(dirs[rec]) ? rec : dirs.findIndex((x, j) => j < k && j !== rec && leadOf(x) === leadOf(d));
  if (twin >= 0) return `Same foundation as Option ${twin + 1}, ${d.mix[1] ? ARCHETYPE_BY_ID[d.mix[1].id].flavor : "on its own"} instead.`;
  return dirs.filter((_, j) => j !== rec).indexOf(d) === 0
    ? `A different emphasis on the same brief, with ${d.mix[0].name} leading.`
    : `The wildcard: ${d.mix[0].name} leading, a less expected answer to the same brief.`;
}

// ---------- Entry point ----------

// A project stores the directions it was generated with (BrandApp.generated()), so later changes
// here or in archetypes.js don't move its colors. A stored copy with another version is dropped and
// recomputed. Bump this when a change would break how screens read an older copy (a field renamed,
// removed or newly required), or when a deploy should regenerate every saved project on purpose.
// Changing colors or wording alone doesn't need it: saved projects then keep what they had.
export const GEN_VERSION = 1;

export function generateDirections(state, adjust) {
  const ctx = {
    avoidC: state.avoidC || [],
    noGradients: (state.avoidT || []).includes("Gradients"),
    noNeon: (state.avoidT || []).includes("Neon"),
    sl: state.sl,
    banned: state.banned || [],
    tone: state.tone || [],
    looks: state.looks || {},
    toneDials: toneDials(state.sl, state.tone || [], state.looks || {}),
  };
  // The color direction: named colors become seeds; the other words shift the whole palette.
  const dir = readColorDirection(state.f.colorDir, adjust);
  ctx.adjust = dir.rest ? (hex) => adjust(hex, dir.rest) : null;
  // Seeds: colors to keep, then colors named in the color direction, then the vivid colors of
  // admired references. Avoided references add their vivid colors to the avoid list.
  const refAvoid = (label) => (state.refTags && state.refTags[label] !== undefined ? state.refTags[label] : label === "Neon sign");
  const vividOf = (label) => (imageColors(label) || []).filter((c) => c.lch[1] > 0.06 && c.lch[0] > 0.25 && c.lch[0] < 0.9).slice(0, 1);
  ctx.seeds = (state.keepC || []).map((hex) => ({ hex: hex.toUpperCase(), lch: hexToOklch(hex), label: hex.toUpperCase(), kind: "keep" }))
    .concat(dir.colors)
    .concat((state.refs || []).filter((l) => !refAvoid(l)).flatMap((l) => vividOf(l).map((c) => ({ hex: c.hex, lch: c.lch, label: `${c.hex} (from "${l}")`, kind: "ref" }))));
  // The first kept color leads as typed; otherwise the first seed that isn't a pale or dark neutral.
  ctx.leadSeed = ctx.seeds[0] && ctx.seeds[0].kind === "keep" ? ctx.seeds[0] : ctx.seeds.find((x) => !paleNeutral(x) && !darkNeutral(x)) || null;
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
  // The primaries and body faces earlier options open on, so later ones pick others.
  ctx.primaries = [];
  ctx.bodies = [];
  // The calmest blend opens tonal, the most energetic on a contrasting accent, the middle one on
  // the neutrals' temperature.
  const energy = (mix) => mix.reduce((n, m) => n + ARCHETYPE_BY_ID[m.id].sl.energy * m.w, 0);
  const calmFirst = picked.map((_, k) => k).sort((a, b) => energy(picked[a]) - energy(picked[b]) || a - b);
  const dirs = picked.map((mix, rank) => {
    const offset = leads[mix[0].id] || 0;
    leads[mix[0].id] = offset + 1;
    return direction(mix, rank, offset, { ...ctx, firstRoute: calmFirst.indexOf(rank) }, shown);
  });
  // Names differ within a set, and Regenerate tries what no other option shows before repeating one.
  const taken = [];
  dirs.forEach((d, k) => { d.name = directionName(picked[k], taken); taken.push(d.name); });
  ["words", "types", "voices"].forEach((key) => dirs.forEach((d, k) => {
    const elsewhere = dirs.filter((_, j) => j !== k).map((x) => JSON.stringify(x[key][0]));
    const [first, ...rest] = d[key], seen = (x) => elsewhere.includes(JSON.stringify(x));
    d[key] = [first, ...rest.filter((x) => !seen(x)), ...rest.filter(seen)].slice(0, 3);
  }));
  // Score the finished options and recommend the best fit. Ties keep the generated order.
  const top = ranked[0].pts || 1;
  const fitPts = (mix) => mix.reduce((n, m) => n + m.w * ((ranked.find((r) => r.id === m.id) || {}).pts || 0), 0) / top;
  const fits = picked.map(fitPts), closest = fits.indexOf(Math.max(...fits));
  const scores = dirs.map((d, k) => scoreDirection(d, fits[k], ctx, k === closest));
  const rec = scores.reduce((best, sc, k) => (sc.pts > scores[best].pts + 0.01 ? k : best), 0);
  dirs.forEach((d, k) => {
    d.recommended = k === rec;
    d.fit = fitLine(scores[k]);
    d.reason = `${d.reasonBody} ${standingFor(d, k, rec, dirs)}`;
    if (d.fit) d.layers.unshift({ layer: "Fit", text: d.fit });
  });
  return { ranked, directions: dirs, recommended: rec };
}
