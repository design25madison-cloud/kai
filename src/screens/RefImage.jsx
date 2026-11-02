import { referenceImage } from "../app/referenceImages.js";

// Fills its positioned parent with the photo for this label. Labels with no photo, such as
// someone's own uploads, keep the plain tile.
export default function RefImage({ label }) {
  const image = referenceImage(label);
  return (
    <>
      {image && <img className="ref-image" src={image.src} alt={label} loading="lazy" title={`${image.author}, ${image.license}`} />}
      <span className={image ? "ref-caption" : undefined}>{label}</span>
    </>
  );
}

// Required by the photos' licenses wherever they're shown at full detail.
export function RefCredit({ label }) {
  const image = referenceImage(label);
  if (!image) return null;
  return (
    <span className="ref-credit">
      <a href={image.page} target="_blank" rel="noreferrer">{image.author}</a>,{" "}
      {image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a> : image.license}
    </span>
  );
}
