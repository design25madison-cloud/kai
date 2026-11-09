// Loads brand fonts from Google Fonts the first time a direction uses them. Bundling all ~50
// archetype fonts would slow the first page load, so only these few ship with the app.
const BUNDLED = new Set(["Geist", "KoHo", "Anta", "Archivo", "Archivo Black", "Barlow", "Chakra Petch", "IBM Plex Sans", "Oxanium", "Work Sans"]);

// Weights to request. Google Fonts rejects a request that asks for a weight a family doesn't
// have, so single-weight families ask for none and a few have their own list.
const WEIGHTS = {
  "Young Serif": null, "Libre Caslon Display": null, "Anton": null, "Alfa Slab One": null, "DM Serif Display": null,
  "Bagel Fat One": null, "Lilita One": null,
  "Space Mono": "400;700", "Lato": "400;700",
};
const DEFAULT_WEIGHTS = "400;500;600;700";

const loaded = new Set();

export function ensureFonts(families) {
  if (typeof document === "undefined") return;
  families.forEach((family) => {
    if (!family || BUNDLED.has(family) || loaded.has(family)) return;
    loaded.add(family);
    const weights = family in WEIGHTS ? WEIGHTS[family] : DEFAULT_WEIGHTS;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}${weights ? `:wght@${weights}` : ""}&display=swap`;
    link.dataset.brandFont = family;
    document.head.appendChild(link);
  });
}
