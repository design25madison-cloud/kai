// Finds a reference photo for an image label ("Forest canopy", "Server aisle"…).
//
// Order: Unsplash first (through the dev server, which holds the key), then Wikimedia Commons.
// Results are cached in this browser for a week, because Unsplash demo keys allow only 50
// searches an hour. A label with no result is retried after a day.
//
// Rules from the two sources' terms (see "Image sourcing" in docs/archetypes.md):
// - Unsplash photos are shown from the URLs Unsplash returns, never downloaded and re-hosted.
// - Every photo is credited with links to the photographer and source.
// - Commons: only freely licensed files. Anything non-commercial or no-derivatives is skipped.

const CACHE_KEY = "kai.images.v1";
const WEEK = 7 * 24 * 3600 * 1000;
const DAY = 24 * 3600 * 1000;
const APP = "kai_prototype"; // Unsplash asks for this on every link back to them.

const utm = (url) => `${url}${url.includes("?") ? "&" : "?"}utm_source=${APP}&utm_medium=referral`;

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch {
    return {};
  }
}
function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or blocked: results just won't survive a reload.
  }
}

let unsplashOff = false; // Set when there's no key (or it's rejected), so we stop asking.

async function fromUnsplash(term) {
  if (unsplashOff) return null;
  const res = await fetch(`/api/unsplash/search/photos?query=${encodeURIComponent(term)}&per_page=5&content_filter=high`);
  if (res.status === 401 || res.status === 403) {
    unsplashOff = true;
    return null;
  }
  if (!res.ok) return null;
  const json = await res.json();
  const p = (json.results || [])[0];
  if (!p) return null;
  return {
    source: "Unsplash",
    id: p.id,
    src: p.urls.regular,
    author: p.user.name,
    authorUrl: utm(p.user.links.html),
    license: "Unsplash License",
    licenseUrl: utm("https://unsplash.com/license"),
    page: utm(p.links.html),
    sourceUrl: utm("https://unsplash.com"),
    // Unsplash requires a call to this when the photo is actually used. See markUsed().
    download: p.links.download_location.replace("https://api.unsplash.com", "/api/unsplash"),
  };
}

const FREE = /^(public domain|pd|cc0|cc[- ]by(-sa)?([- ][\d.]+)?)/i;
const RESTRICTED = /nc|nd|non-?commercial|no ?deriv/i;
const stripHtml = (html) => {
  const el = document.createElement("div");
  el.innerHTML = html || "";
  return el.textContent.trim().replace(/\s+/g, " ");
};

async function fromCommons(term) {
  const params = new URLSearchParams({
    action: "query", format: "json", origin: "*",
    generator: "search", gsrsearch: `${term} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "10",
    prop: "imageinfo", iiprop: "url|extmetadata|mime", iiurlwidth: "1200",
    iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist|NonFree",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!res.ok) return null;
  const pages = Object.values((await res.json()).query?.pages || {}).sort((a, b) => a.index - b.index);
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    const meta = info?.extmetadata || {};
    const license = meta.LicenseShortName?.value || "";
    if (!info || !/^image\/(jpeg|png)$/.test(info.mime)) continue;
    if (meta.NonFree?.value || !FREE.test(license) || RESTRICTED.test(license)) continue;
    return {
      source: "Wikimedia Commons",
      src: info.thumburl || info.url,
      author: stripHtml(meta.Artist?.value) || "Unknown author",
      license,
      licenseUrl: meta.LicenseUrl?.value || "",
      page: info.descriptionurl,
    };
  }
  return null;
}

// ---------- The store screens read from ----------

const cache = readCache();
const pending = new Set();
const listeners = new Set();
const used = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Misses, and results found while Unsplash was unavailable (no key yet), only keep for a day,
// so adding a key soon brings in Unsplash photos.
function fresh(entry) {
  if (!entry) return false;
  return Date.now() - entry.t < (entry.image && entry.unsplash ? WEEK : DAY);
}

// Returns the cached photo for a label, or null while it's being looked up (or if none exists).
// A miss starts a lookup; subscribers hear when it lands.
export function searchedImage(label) {
  const entry = cache[label];
  if (fresh(entry)) return entry.image;
  if (!pending.has(label) && typeof window !== "undefined") {
    pending.add(label);
    Promise.resolve()
      .then(() => fromUnsplash(label))
      .catch(() => null)
      .then((image) => image || fromCommons(label).catch(() => null))
      .then((image) => {
        cache[label] = { image: image || null, t: Date.now(), unsplash: !unsplashOff };
        writeCache(cache);
        pending.delete(label);
        listeners.forEach((fn) => fn());
      });
  }
  return entry ? entry.image : null;
}

export function isSearching(label) {
  return pending.has(label);
}

// Tells Unsplash a photo was used, once per photo per visit. Their API terms require this
// whenever someone picks or exports a photo.
export function markUsed(image) {
  if (!image || image.source !== "Unsplash" || !image.download || used.has(image.id)) return;
  used.add(image.id);
  fetch(image.download).catch(() => used.delete(image.id));
}
