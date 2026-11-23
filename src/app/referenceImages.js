// The photo for an image label: Unsplash first (imageSearch.js); hand-picked Wikimedia Commons
// photos (referenceImages.json, shipped with the app) and Commons search only as a fallback. Each result holds the photo's author, license, source and links for credit.
import credits from "./referenceImages.json";
import { isSearching, markUsed, searchedImage, subscribe } from "./imageSearch.js";

const files = import.meta.glob("../assets/references/*.jpg", { eager: true, query: "?url", import: "default" });

// The hand-picked photo only. Never searches, so it's safe to call in bulk.
export function curatedImage(label) {
  const credit = credits[label];
  return credit ? { ...credit, source: "Wikimedia Commons", src: files[`../assets/references/${credit.file}`] } : null;
}

// Unsplash comes first. The hand-picked Commons photos, then Commons search, are the fallback: used
// only when Unsplash has nothing that clears its quality bar (or there's no key yet).
// Starts a search on a miss, so only call it for photos that are actually on screen or exported.
export function referenceImage(label) {
  const searched = searchedImage(label);
  if (searched && searched.source === "Unsplash") return searched;
  return curatedImage(label) || searched;
}

export { isSearching, subscribe };

// Call when photos are picked or exported, so Unsplash counts the use (their terms require it).
export function markImagesUsed(labels) {
  labels.forEach((label) => markUsed(referenceImage(label)));
}
