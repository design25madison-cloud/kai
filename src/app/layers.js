// The reasoning layers that sit alongside the archetypes (see "Reasoning layers" in
// docs/archetypes.md). Archetypes decide who the brand is; these decide where it stands:
//
// - Category:    what brands in the industry usually look like (the starting point)
// - Positioning: how far to move from that starting point, and away from competitors
// - Audience:    who has to read it and trust it (how far is safe)
// - Name:        cues from the name and its meaning
//
// Rules first. Industries outside these families ("Other") skip the category layer until a
// server-side model can reason about any industry (engineer work).

// hues: conventional primary hues in the category. images: photo labels that place the brand in
// its world. cliches: words that mark an image label as a category cliché to skip.
export const INDUSTRIES = [
  { id: "construction", label: "Construction and real estate", hues: [45, 25], look: "safety yellow or orange and heavy type", typical: ["builder", "hero", "explorer"], images: ["Concrete forms", "Site at dawn"], cliches: ["hard hat", "crane", "handshake", "blueprint"] },
  { id: "manufacturing", label: "Manufacturing and industrial", hues: [210, 0], look: "steel blue or grey and engineered type", typical: ["builder", "hero", "sage"], images: ["Factory floor", "Machined parts"], cliches: ["gear", "factory smoke", "robot arm"] },
  { id: "logistics", label: "Logistics and supply chain", hues: [215, 25], look: "corporate blue with orange and bold sans", typical: ["builder", "explorer", "hero"], images: ["Warehouse aisle", "Loading dock"], cliches: ["globe", "truck", "container ship", "container yard"] },
  { id: "finance", label: "Finance and insurance", hues: [220, 175], look: "navy or teal and conservative serif or geometric sans", typical: ["sage", "ruler", "protector", "visionary"], images: ["Ledger paper", "Glass atrium"], cliches: ["coin", "piggy bank", "handshake", "stock chart"] },
  { id: "healthcare", label: "Healthcare and life sciences", hues: [205, 150], look: "clinical blue or green and rounded sans", typical: ["protector", "sage", "innocent"], images: ["Clinic daylight", "Care hands"], cliches: ["stethoscope", "smiling doctor", "heartbeat", "pill"] },
  { id: "energy", label: "Energy and climate", hues: [130, 50], look: "green or sun yellow and clean sans", typical: ["champion", "visionary", "builder"], images: ["Turbine blades", "Solar field"], cliches: ["lightbulb", "leaf", "globe in hands"] },
  { id: "legal", label: "Legal and professional services", hues: [220, 350], look: "navy or burgundy and traditional serif", typical: ["sage", "ruler", "protector"], images: ["Archive shelves", "Stone columns"], cliches: ["gavel", "scales of justice", "handshake"] },
  { id: "software", label: "Software and data", hues: [235, 265], look: "blue or purple and geometric sans", typical: ["builder", "magician", "visionary", "creator"], images: ["Server aisle", "Interface in use"], cliches: ["circuit board", "binary", "glowing brain", "cloud icon"] },
  { id: "retail", label: "Retail and consumer goods", hues: [0, 330], look: "red or pink and friendly sans", typical: ["everyman", "jester", "lover", "innocent"], images: ["Shop window", "Product shelf"], cliches: ["shopping cart", "shopping bag"] },
  { id: "food", label: "Food and hospitality", hues: [20, 95], look: "warm orange-red or fresh green and rounded type", typical: ["lover", "everyman", "innocent", "jester"], images: ["Market produce", "Kitchen pass"], cliches: ["chef hat", "cutlery"] },
  { id: "education", label: "Education", hues: [215, 45], look: "blue with yellow and friendly sans", typical: ["sage", "creator", "everyman", "innocent"], images: ["Library shelves", "Notebook pages"], cliches: ["graduation cap", "apple", "chalkboard", "lightbulb"] },
  { id: "government", label: "Government and public sector", hues: [220, 0], look: "navy with red and institutional serif", typical: ["protector", "sage", "ruler"], images: ["Civic building", "Public square"], cliches: ["flag", "capitol", "handshake"] },
  { id: "agriculture", label: "Agriculture", hues: [100, 40], look: "green or wheat and sturdy type", typical: ["explorer", "protector", "builder"], images: ["Crop rows", "Soil texture"], cliches: ["tractor", "sprout in hands"] },
  { id: "media", label: "Media and entertainment", hues: [0, 280], look: "red or purple and expressive display type", typical: ["creator", "jester", "magician", "rebel"], images: ["Stage lights", "Print press"], cliches: ["film reel", "play button", "microphone"] },
];
export const INDUSTRY_BY_ID = Object.fromEntries(INDUSTRIES.map((x) => [x.id, x]));

// Audience profiles. cap: highest distinctiveness that's still safe. bias: a push up or down. noLead: archetypes that may
// be blended in but shouldn't lead for this audience. contrast: minimum for white text on primary.
export const AUDIENCES = {
  executive: { label: "executive and procurement buyers", cap: 0.6, bias: -0.15, noLead: ["rebel", "jester"], contrast: 4.5, pair: ["Proven", "boastful"], effect: "kept it conservative and led with proof" },
  field: { label: "field and operational users", cap: 0.9, noLead: ["lover"], contrast: 7, pair: ["Plain", "curt"], effect: "pushed contrast to AAA and kept the voice plain" },
  technical: { label: "technical users", cap: 0.9, noLead: [], contrast: 4.5, pair: ["Precise", "dense"], effect: "kept the voice precise" },
  broad: { label: "a broad audience", cap: 0.95, bias: 0.05, noLead: [], contrast: 4.5, pair: ["Welcoming", "generic"], effect: "added color and kept it welcoming", extraAccent: true },
};

const FIELD = /\b(field|crew|crews|site|sites|driver|drivers|technician|technicians|warehouse|nurse|nurses|foreman|installer|installers|inspector|inspectors|mechanic|operator|operators|frontline|plant)\b/;
const TECH = /\b(engineer|engineers|engineering|developer|developers|devops|analyst|analysts|data|it|admin|admins|scientist|scientists)\b/;
const EXEC = /\b(ceo|cfo|coo|cto|vp|director|head of|procurement|purchasing|owner|executive|partner|principal|buyer|controller)\b/;

export function audienceOf(f) {
  const strip = (t) => (t || "").replace(/\[[^\]]*\]/g, " ").toLowerCase();
  const op = strip(`${f.opRole} ${f.opTeam} ${f.opCares}`);
  const buyer = strip(`${f.buyerRole} ${f.mot}`);
  const end = strip(`${f.endWho} ${f.endCares}`);
  if (f.who === "operator") return FIELD.test(op) ? "field" : TECH.test(op) ? "technical" : op.trim() ? "field" : null;
  if (f.who === "end") return FIELD.test(end) ? "field" : TECH.test(end) ? "technical" : end.trim() ? "broad" : null;
  if (f.who === "buyer") return EXEC.test(buyer) || buyer.trim() ? "executive" : null;
  return null;
}

// Words in the name or its meaning that carry a color, imagery and a wordmark cue.
export const NAME_CUES = [
  { words: ["iron", "steel", "forge", "ferro", "fe", "metal", "anvil", "ferrum"], hue: [18, 45, 32], images: ["Forged steel", "Iron texture"], wordmark: "squared, sturdy letterforms", gist: "oxide and steel tones" },
  { words: ["river", "wave", "tide", "flow", "aqua", "marine", "sea", "ocean", "current"], hue: [190, 55, 36], images: ["River current", "Ocean surface"], wordmark: "flowing curves", gist: "water blues" },
  { words: ["light", "sun", "lumen", "lux", "sol", "ray", "bright", "dawn", "solar"], hue: [45, 90, 55], images: ["Morning light", "Sunlit wall"], wordmark: "open, airy letterforms", gist: "warm light" },
  { words: ["root", "roots", "grove", "seed", "leaf", "tree", "sprout", "verde", "forest", "oak"], hue: [120, 38, 30], images: ["Forest canopy", "Seedling"], wordmark: "organic terminals", gist: "growing greens" },
  { words: ["north", "peak", "summit", "alp", "alpine", "ridge", "mountain", "everest"], hue: [210, 30, 32], images: ["Mountain ridge", "Alpine light"], wordmark: "tall, upright letterforms", gist: "cool mountain tones" },
  { words: ["stone", "rock", "granite", "terra", "clay", "earth", "slate", "quarry"], hue: [28, 25, 38], images: ["Stone slab", "Raw clay"], wordmark: "solid, weighty letterforms", gist: "earthy browns" },
  { words: ["fire", "ember", "blaze", "flame", "ignite", "spark", "pyro"], hue: [10, 80, 46], images: ["Ember glow", "Flame"], wordmark: "sharp, energetic cuts", gist: "ember reds" },
  { words: ["star", "nova", "orbit", "astro", "cosmos", "lunar", "moon", "stellar", "atlas"], hue: [240, 45, 28], images: ["Night sky", "Orbit trails"], wordmark: "wide, precise letterforms", gist: "deep night blues" },
  { words: ["bridge", "link", "connect", "node", "net", "weave", "thread", "span"], hue: [200, 40, 38], images: ["Suspension bridge", "Woven thread"], wordmark: "connected letterforms", gist: "steady blues" },
  { words: ["gold", "aurum", "brass", "crown", "regal", "royal"], hue: [42, 60, 46], images: ["Gold leaf", "Brass detail"], wordmark: "refined serifs", gist: "gold tones" },
  { words: ["key", "lock", "shield", "guard", "safe", "fort", "harbor", "haven", "vault"], hue: [215, 40, 26], images: ["Old key", "Stone fortress"], wordmark: "enclosed, protective shapes", gist: "deep protective blues" },
];

export function nameCuesOf(f) {
  const text = `${f.name || ""} ${(f.meaning || "").replace(/\[[^\]]*\]/g, " ")}`.toLowerCase();
  const hits = [];
  NAME_CUES.forEach((cue) => {
    const word = cue.words.find((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(text));
    if (word) hits.push({ ...cue, word });
  });
  return hits.slice(0, 1); // One cue keeps it legible; the strongest is the first in the list.
}

// Wording that signals the founder is positioning against how things are done today.
const STANCE = /\b(outdated|broken|legacy|clunky|finally|unlike|old-school|slow|manual|fax|paper-based|spreadsheets?|antiquated|archaic|frustrat\w*|painful)\b/g;

export function stanceOf(f) {
  const text = ["short", "diff", "diffWhy", "problem", "switchTo", "diffFeel"].map((k) => f[k] || "").join(" ").replace(/\[[^\]]*\]/g, " ").toLowerCase();
  return [...new Set(text.match(STANCE) || [])];
}

export function industryOf(f) {
  return INDUSTRY_BY_ID[f.industry] || null;
}

export function competitorColorsOf(comps) {
  return (comps || []).filter((c) => /^#[0-9a-f]{6}$/i.test(c.color || "")).map((c) => ({ name: (c.name || "").replace(/\[[^\]]*\]/g, "").trim() || "a competitor", hex: c.color.toUpperCase() }));
}
