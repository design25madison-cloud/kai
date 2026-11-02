// Restricted words: terms a venture must not use. These are a hard rule, not a preference.

// Whole words or phrases only, so "load" doesn't match "download".
function matches(term, text) {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu").test(text);
}

// Which restricted words appear in any of these lines.
export function copyHits(terms, lines) {
  return terms.filter((term) => term.trim() && lines.some((line) => matches(term, line)));
}

// Which restricted words appear in a direction's voice: its tone words, headline, and interface line.
// The "not that" half of a tone pair is left out, since it names what to steer away from.
export function restrictedHits(terms, voice) {
  const lines = [voice.headline, voice.micro, ...voice.tone.map((t) => t[0])];
  return terms.filter((term) => term.trim() && lines.some((line) => matches(term, line)));
}
