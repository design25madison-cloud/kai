// Applying answers suggested from uploaded materials to the brief.
//
// The rule: a suggestion only lands where the person hasn't given their own answer. It fills an
// empty field, and it may replace an earlier suggestion nobody edited. Anything typed, edited or
// confirmed is never touched.
//
// state.sugg remembers what was suggested, by key ("f.name" for a text answer, "tone" for a list).
// A field counts as still suggested while its value equals that entry. "Confirm all" empties it.

const SLIDER_DEFAULT = { warmth: 50, energy: 50, serious: 50 };
// Answers the brief starts with, which count as not answered yet.
const STARTS_AS = { "f.who": "operator", sl: SLIDER_DEFAULT };

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// No answer yet: nothing, only spaces, or an empty list or object. The brief's Core checks use it too.
export const blank = (v) => v == null || (typeof v === "string" ? !v.trim() : typeof v === "object" && !Object.keys(v).length);

const valueAt = (state, key) => (key.startsWith("f.") ? (state.f || {})[key.slice(2)] : state[key]);

// The keys whose current answer is a suggestion nobody has edited or confirmed.
export function suggestedKeys(state) {
  const sugg = state.sugg || {};
  return Object.keys(sugg).filter((key) => same(valueAt(state, key), sugg[key]));
}

// fill is the partial state the server returns (see server/fill.js). Returns the state patch to
// apply and how many answers it sets.
export function applyFill(state, fill) {
  const before = state.sugg || {};
  const sugg = { ...before };
  const f = { ...state.f };
  const patch = {};
  let filled = 0;

  const isOpen = (key) => {
    const current = valueAt(state, key);
    return blank(current) || same(current, STARTS_AS[key]) || (key in before && same(current, before[key]));
  };
  const take = (key, value, write) => {
    if (!isOpen(key)) return;
    write(value);
    sugg[key] = value;
    filled++;
  };

  for (const [k, v] of Object.entries(fill.f || {})) take(`f.${k}`, v, (value) => (f[k] = value));
  for (const [k, v] of Object.entries(fill)) {
    if (k === "f") continue;
    // The model may set only some sliders; the others stay in the middle.
    take(k, k === "sl" ? { ...SLIDER_DEFAULT, ...v } : v, (value) => (patch[k] = value));
  }

  patch.f = f;
  patch.sugg = sugg;
  // Sections of the brief that stay folded until they have an answer.
  if (f.legal) patch.legalOpen = true;
  if (f.endWho || f.endCares) patch.endOn = true;
  if (f.sigReact || f.sigEasier) patch.sigOpen = true;
  return { patch, filled };
}
