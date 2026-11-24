// Build step: installs the brand typefaces (fonts.txt, one Google Fonts family per line) so decks
// converted to PDF show the real fonts. Run as: node fonts.mjs fonts.txt <folder>.
// Google Fonts answers a plain client like this one with TrueType files, which LibreOffice needs.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const [list, dir] = process.argv.slice(2);
await mkdir(dir, { recursive: true });
const css = (family, weights) => fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}${weights}`);

for (const family of (await readFile(list, "utf8")).split("\n").map((s) => s.trim()).filter(Boolean)) {
  // Regular and bold, or the one weight a display face has.
  let res = await css(family, ":wght@400;700");
  if (!res.ok) res = await css(family, "");
  if (!res.ok) throw new Error(`${family}: Google Fonts answered ${res.status}`);
  const urls = [...(await res.text()).matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/g)].map((m) => m[1]);
  if (!urls.length) throw new Error(`${family}: no TrueType files offered`);
  for (const [k, url] of urls.entries()) {
    const file = await fetch(url);
    if (!file.ok) throw new Error(`${family}: download failed with ${file.status}`);
    await writeFile(`${dir}/${family.replace(/\W+/g, "")}-${k}.ttf`, Buffer.from(await file.arrayBuffer()));
  }
  console.log(`${family}: ${urls.length} file(s)`);
}
