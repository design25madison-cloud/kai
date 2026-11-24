import { brokenImage, referenceImage } from "../app/referenceImages.js";

// Fills its positioned parent with the photo for this label. Labels with no photo, such as
// someone's own uploads, keep the plain tile.
export default function RefImage({ label }) {
  const image = referenceImage(label);
  return (
    <>
      {image && <img className="ref-image" src={image.src} alt={label} loading="lazy" onError={() => brokenImage(image.src)} title={image.source === "Unsplash" ? `Photo by ${image.author} on Unsplash` : `${image.author}, ${image.license}`} />}
      <span className={image ? "ref-caption" : undefined}>{label}</span>
    </>
  );
}

// A link that was dropped as unsafe (imageSearch.js) leaves the credit as plain text.
const link = (href, text) => (href ? <a href={href} target="_blank" rel="noreferrer">{text}</a> : text);

// Required by the photos' licenses wherever they're shown at full detail. Unsplash asks for
// exactly "Photo by [name] on Unsplash", with both linked.
export function RefCredit({ label }) {
  const image = referenceImage(label);
  if (!image) return null;
  if (image.source === "Unsplash") {
    return (
      <span className="ref-credit">
        Photo by {link(image.authorUrl, image.author)} on {link(image.sourceUrl, "Unsplash")}
      </span>
    );
  }
  return (
    <span className="ref-credit">
      {link(image.page, image.author)}, {link(image.licenseUrl, image.license)}
    </span>
  );
}
