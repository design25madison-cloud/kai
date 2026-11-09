// The photo for an image label. Hand-picked Wikimedia Commons photos (referenceImages.json,
// shipped with the app) come first; any other label is looked up on Unsplash and Commons
// (imageSearch.js). Each result holds the photo's author, license, source and links for credit.
import credits from "./referenceImages.json";
import { isSearching, markUsed, searchedImage, subscribe } from "./imageSearch.js";

const files = import.meta.glob("../assets/references/*.jpg", { eager: true, query: "?url", import: "default" });

// The hand-picked photo only. Never searches, so it's safe to call in bulk.
export function curatedImage(label) {
  const credit = credits[label];
  return credit ? { ...credit, source: "Wikimedia Commons", src: files[`../assets/references/${credit.file}`] } : null;
}

// Starts a search on a miss, so only call it for photos that are actually on screen or exported.
export function referenceImage(label) {
  return curatedImage(label) || searchedImage(label);
}

export { isSearching, subscribe };

// Call when photos are picked or exported, so Unsplash counts the use (their terms require it).
export function markImagesUsed(labels) {
  labels.forEach((label) => markUsed(referenceImage(label)));
}
