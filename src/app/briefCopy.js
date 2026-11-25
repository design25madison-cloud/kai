// Wording for the brief's Customer and Tone steps, by who the industry mostly sells to. Only the words
// on screen change: the fields and what they store stay the same (see audienceOf in layers.js and the
// field questions in server/fill.js). A missing, "other" or unknown industry gets the neutral set.
import { ARCHETYPES, TONE_CHIPS } from "./archetypes.js";
import { INDUSTRY_BY_ID } from "./layers.js";

// Who each industry in INDUSTRIES (layers.js) mostly sells to.
export const KIND = {
  construction: "both", manufacturing: "organisations", logistics: "organisations", finance: "both",
  healthcare: "both", energy: "both", legal: "both", software: "organisations", retail: "people",
  food: "people", education: "both", government: "both", agriculture: "organisations", media: "people",
};

// For designers: every set has the same keys. buyer, user and end are the three card titles (fields
// buyerRole…, opRole… and endWho…); *Hint is the grey example text in an empty field; cares are the
// "What they care about" chips; tone is the suggested tone words, which must stay words the generator
// scores (a TONE_CHIPS key or an archetype attribute in archetypes.js). The test checks both.
export const COPY = {
  organisations: {
    buyer: "Who decides to buy", buyerRole: "Role or title", buyerRoleHint: "e.g. head of operations",
    cares: ["ROI", "Growth", "Efficiency", "Reliability", "Cost", "Risk"],
    user: "Who uses it day to day", userRole: "Role or title", userRoleHint: "e.g. site manager",
    team: "Team or department", teamHint: "e.g. marketing, operations",
    end: "Who it is ultimately for", endHint: "e.g. their own customers",
    altsHint: "e.g. spreadsheets, then Enter",
    tone: ["Precise", "Practical", "Calm", "Bold", "Minimal", "Inventive", "Warm", "Sturdy", "Industrial"],
  },
  people: {
    buyer: "Who buys it", buyerRole: "Who they are", buyerRoleHint: "e.g. parents, gift buyers",
    cares: ["Price", "Quality", "Convenience", "Trust", "Fun", "Health"],
    user: "Who uses or enjoys it", userRole: "Who they are", userRoleHint: "e.g. home cooks, young readers",
    team: "Group they belong to", teamHint: "e.g. families, students",
    end: "Who it is ultimately for", endHint: "e.g. friends they share it with",
    altsHint: "e.g. a big chain store, then Enter",
    tone: ["Warm", "Playful", "Welcoming", "Honest", "Fresh", "Bold", "Calm", "Indulgent", "Expressive"],
  },
  // Also the neutral set, for no industry or one not listed.
  both: {
    buyer: "Who decides to buy", buyerRole: "Who they are", buyerRoleHint: "e.g. an office manager, a parent",
    cares: ["Cost", "Quality", "Reliability", "Trust", "Ease of use", "Growth"],
    user: "Who uses it day to day", userRole: "Who they are", userRoleHint: "e.g. nurses, students",
    team: "Team or group", teamHint: "e.g. front desk, first-year students",
    end: "Who it is ultimately for", endHint: "e.g. patients, families",
    altsHint: "e.g. doing it by hand, then Enter",
    tone: ["Warm", "Calm", "Welcoming", "Honest", "Precise", "Bold", "Playful", "Minimal", "Sturdy"],
  },
};

// The archetypes a tone word scores for, by the same rule as score() in generate.js.
const fits = (w) => ARCHETYPES.filter((a) => (TONE_CHIPS[w] || []).includes(a.id) || a.attributes.some((x) => x.toLowerCase() === w.toLowerCase())).map((a) => a.id);

// The wording set for an industry id. Tone words that suit the industry's usual archetypes come first.
export function briefCopy(industry) {
  const set = COPY[Object.hasOwn(KIND, industry) ? KIND[industry] : "both"];
  const typical = Object.hasOwn(INDUSTRY_BY_ID, industry) ? INDUSTRY_BY_ID[industry].typical : [];
  const hits = (w) => fits(w).filter((id) => typical.includes(id)).length;
  return { ...set, tone: set.tone.slice().sort((a, b) => hits(b) - hits(a)) };
}
