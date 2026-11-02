// Reference photos from Wikimedia Commons, picked by hand for each image label.
// Each entry in referenceImages.json holds the photo's author, license, and source page.
import credits from "./referenceImages.json";

const files = import.meta.glob("../assets/references/*.jpg", { eager: true, query: "?url", import: "default" });

export function referenceImage(label) {
  const credit = credits[label];
  if (!credit) return null;
  return { ...credit, src: files[`../assets/references/${credit.file}`] };
}
