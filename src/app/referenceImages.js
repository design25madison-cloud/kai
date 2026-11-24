// The photo for an image label: Unsplash first (imageSearch.js); hand-picked Wikimedia Commons
// photos (referenceImages.json, shipped with the app) and Commons search only as a fallback. Each
// result holds the photo's author, license, source and links for credit.
import credits from "./referenceImages.json";
import { brokenImage, cachedImage, isSearching, markUsed, pinImages, pinnedImage, searchedImage, subscribe } from "./imageSearch.js";

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
  const curated = curatedImage(label);
  // A stored project keeps the hand-picked photo it showed, even if Unsplash has one by now.
  if (curated && pinnedImage(label) === null) return curated;
  const searched = searchedImage(label);
  if (searched && searched.source === "Unsplash") return searched;
  return curated || searched;
}

export { brokenImage, isSearching, pinImages, subscribe };

// The searched photos these labels show now, for a project to keep. A label showing its hand-picked
// photo (which ships with the app) is left out, and referenceImage() reads that as "keep the hand-picked one".
export const shownImages = (labels) => Object.fromEntries(labels.map((l) => [l, cachedImage(l)]).filter(([l, image]) => image && (image.source === "Unsplash" || !curatedImage(l))));

// Call when photos are picked or exported, so Unsplash counts the use (their terms require it).
export function markImagesUsed(labels) {
  labels.forEach((label) => markUsed(referenceImage(label)));
}
