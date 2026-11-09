// Turns a brief into three directions, each a blend of one to three archetypes.
//
// 1. score()   rates all 16 archetypes against the brief and records why (the matched words).
// 2. blends()  picks three different blends. How many archetypes go into each depends on the
//              brief: a clear winner stands alone, close scores blend.
// 3. direction() builds each blend into the same direction shape the rest of the app already
//              reads (palettes, words, types, voices, images, reason…), so screens don't change.
//
// Everything is deterministic: the same brief always gives the same directions.
import { ARCHETYPES, ARCHETYPE_BY_ID, TONE_CHIPS } from "./archetypes.js";
import { curatedImage } from "./referenceImages.js";

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
function darkenForWhite(hsl) {
  let [h, s, l] = hsl;
  while (l > 4 && contrast(hslToHex([h, s, l]), "#FFFFFF") < 4.5) l -= 1;
  return [h, s, l];
}

function rgbDistance(a, b) {
  const p = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const q = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
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
export function blends(ranked) {
  const top = ranked[0].pts;
  const close = ranked.filter((r) => r.pts >= top * 0.75).slice(0, 3);
  const first = weigh(close);
  const [r1, r2, r3, r4] = ranked;
  const candidates = [[r2, r1], [r1, r3], [r2, r3], [r3, r1], [r1, r4], [r2], [r3]].map(weigh);
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
  primary = darkenForWhite(primary);
  const base = [primary, tweak(pick(p.surface, v)), tweak(pick(p.dark, v)), tweak(pick(p.light, v))];

  // Accent set: the weighted average of each archetype's accent count, 1–3. The lead gives the
  // first accent; the other archetypes give the rest, so a blend shows in the accents.
  const count = clamp(Math.round(mix.reduce((n, m) => n + ARCHETYPE_BY_ID[m.id].accentCount * m.w, 0)), 1, 3);
  const sources = [lead].concat(mix.slice(1).map((m) => ARCHETYPE_BY_ID[m.id]), lead, lead);
  const accents = [];
  for (let k = 0; accents.length < count && k < 12; k++) {
    const src = sources[k % sources.length];
    const offset = src === lead ? v + accents.length + Math.floor(k / sources.length) : v + Math.floor(k / sources.length);
    let a = tweak(pick(src.palette.accents, offset), true);
    if (ctx.noNeon) a = [a[0], Math.min(a[1], 72), a[2]];
    const hex = hslToHex(a);
    // Each accent has to read as its own color, distinct from the primary and the other accents.
    if (rgbDistance(hslToHex(primary), hex) >= 90 && !accents.some((x) => rgbDistance(hslToHex(x), hex) < 60)) accents.push(a);
  }

  if (!accents.length) accents.push(tweak(pick(p.accents, v), true));
  const split = accents.length === 1 ? [10] : accents.length === 2 ? [6, 4] : [5, 3, 2];
  const used = new Set();
  const named = (hsl) => {
    let n = colorName(hsl);
    if (used.has(n)) n = (hsl[2] > 50 ? "Light " : "Dark ") + n.replace(/^(Deep|Pale|Bright) /, "").toLowerCase();
    if (used.has(n)) n = n + " " + (used.size + 1);
    used.add(n);
    return n;
  };
  return base.map((hsl, k) => [named(hsl), hslToHex(hsl), ROLES[k], RATIOS[k]])
    .concat(accents.map((hsl, k) => [named(hsl), hslToHex(hsl), k === 0 ? "Accent" : `Accent ${k + 1}`, split[k]]));
}

function buildVoice(mix, v) {
  const lead = ARCHETYPE_BY_ID[mix[0].id];
  const leadPairs = lead.voice.pairs;
  const tone = mix[1]
    ? [pick(leadPairs, v * 2), pick(leadPairs, v * 2 + 1), pick(ARCHETYPE_BY_ID[mix[1].id].voice.pairs, v)]
    : [pick(leadPairs, v * 3), pick(leadPairs, v * 3 + 1), pick(leadPairs, v * 3 + 2)];
  return { tone: tone.map((t) => t.slice()), headline: pick(lead.voice.headlines, v), micro: pick(lead.voice.micro, v) };
}

function buildImages(mix) {
  // Visible slots split by weight, lead first. Within each archetype, labels with a hand-picked
  // photo go first; the rest are found by image search when they're shown.
  const order = (a) => a.images.slice().sort((x, y) => (curatedImage(y) ? 1 : 0) - (curatedImage(x) ? 1 : 0));
  const lists = mix.map((m) => ({ list: order(ARCHETYPE_BY_ID[m.id]), n: Math.max(1, Math.round(m.w * 6)) }));
  const seen = new Set(), images = [], pool = [];
  lists.forEach(({ list, n }) => {
    list.forEach((label) => {
      if (seen.has(label)) return;
      seen.add(label);
      (images.length < 6 && list.indexOf(label) < n ? images : pool).push(label);
    });
  });
  while (images.length < 6 && pool.length) images.push(pool.shift());
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

const pct = (w) => Math.round(w * 100) + "%";
const listOf = (xs) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1]);
const quoted = (xs) => xs.map((x) => (x.startsWith("Your ") ? x.charAt(0).toLowerCase() + x.slice(1) : `"${x}"`));

function explain(mix, rank, ctx) {
  const names = mix.map((m) => ARCHETYPE_BY_ID[m.id].name);
  const lead = ARCHETYPE_BY_ID[mix[0].id];
  const opening = mix.length === 1
    ? `Your brief points to ${lead.name} (${lead.theme.toLowerCase()}) on its own.`
    : `A blend of ${listOf(mix.map((m) => `${ARCHETYPE_BY_ID[m.id].name} (${pct(m.w)})`))}.`;
  const reasons = mix.map((m) => {
    const a = ARCHETYPE_BY_ID[m.id];
    return m.why.length
      ? `${a.name} comes from ${listOf(quoted(m.why.slice(0, 3)))}.`
      : `${a.name} adds ${a.attributes.slice(0, 2).join(" and ").toLowerCase()}.`;
  });
  const standing = rank === 0
    ? "This is the closest match to your brief."
    : rank === 1 ? "It ranks second: a different lead, for contrast." : "The wildcard: a less expected combination that still fits.";
  const match = [...new Set(mix.flatMap((m) => m.why))].filter((x) => !x.startsWith("Your ")).slice(0, 4);
  if (ctx.noGradients) match.push("No gradients");
  if (ctx.noNeon) match.push("No neon");
  const tradeoff = lead.misfire + (mix.length === 3 ? " Three archetypes can blur together, so lock the pieces you like and regenerate the rest." : "");
  return { name: names.join(" + "), reason: `${opening} ${reasons.join(" ")} ${standing}`, match, tradeoff };
}

function direction(mix, rank, offset, ctx) {
  const lead = ARCHETYPE_BY_ID[mix[0].id];
  const second = mix[1] && ARCHETYPE_BY_ID[mix[1].id];
  // Three variants of every module, used by Regenerate. An option that shares its lead with an
  // earlier option starts on a later variant, so the two don't look alike.
  const vs = [0, 1, 2].map((k) => k + offset);
  const palettes = vs.map((v) => buildPalette(mix, v, ctx));
  const words = vs.map((v) => pick(lead.words, v).slice());
  const types = vs.map((v) => [pick(lead.display, v), second && mix[1].w >= 0.3 ? pick(second.body, v) : pick(lead.body, v)]);
  const voices = vs.map((v) => buildVoice(mix, v));
  const { images, imgPool } = buildImages(mix);
  const text = explain(mix, rank, ctx);
  return {
    ...text,
    mix: mix.map((m) => ({ id: m.id, name: ARCHETYPE_BY_ID[m.id].name, w: m.w })),
    accentIdx: 4,
    wordFont: words[0][0], track: words[0][1], display: types[0][0], body: types[0][1],
    palettes, words, types, voices, images, imgPool,
    look: { ...lead.look },
    gradient: gradientFor(mix, ctx),
  };
}

// ---------- Entry point ----------

export function generateDirections(state, adjust) {
  const ctx = {
    avoidC: state.avoidC || [],
    noGradients: (state.avoidT || []).includes("Gradients"),
    noNeon: (state.avoidT || []).includes("Neon"),
    adjust: state.f.colorDir ? (hex) => adjust(hex, state.f.colorDir) : null,
  };
  const ranked = score(state);
  const picked = blends(ranked);
  const leads = {};
  return {
    ranked,
    directions: picked.map((mix, rank) => {
      const offset = leads[mix[0].id] || 0;
      leads[mix[0].id] = offset + 1;
      return direction(mix, rank, offset, ctx);
    }),
  };
}
