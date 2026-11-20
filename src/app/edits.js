// Precise editing with the server's AI (server/edit.js): what to send about the piece being
// edited, and how to turn the checked answer into the proposal the panel shows.
//
// c is the comment ({ sec, target, label, text, rejected }), d is the direction as shown
// (BrandApp.optionData), base is the generated direction, ov its saved overrides.
import { ARCHETYPES } from "./archetypes.js";

// Every typeface the archetypes use. All are on Google Fonts, so any of them can be loaded.
export const FONTS = [...new Set(ARCHETYPES.flatMap((a) => [...a.words.map((w) => w[0]), ...a.display, ...a.body]))].sort();

const unlocked = (flags, count) => Array.from({ length: count }, (_, k) => k).filter((k) => !flags[k]);

export function editContext({ c, d, base, ov, f, tone, banned }) {
  const one = typeof c.target === "number";
  const ctx = { name: f.name, desc: f.desc, direction: base.name, tone, banned, rejected: c.rejected || [], piece: c.label };
  if (c.sec === "palette" || c.sec === "preview") {
    ctx.colors = d.colors.map((x) => ({ name: x.name, hex: x.show }));
    ctx.targets = one ? [c.target] : unlocked(ov.swLock || [], d.colors.length);
  }
  if (c.sec === "ui") {
    ctx.ui = d.ui;
    ctx.colors = d.colors.map((x) => ({ name: x.name, hex: x.show }));
  }
  if (c.sec === "word") Object.assign(ctx, { fonts: FONTS, wordFont: d.wordFont, track: d.track });
  if (c.sec === "type") Object.assign(ctx, { fonts: FONTS, display: d.display, body: d.body });
  if (c.sec === "refs") {
    ctx.images = d.imgs.map((x) => x[0]);
    ctx.targets = one ? [c.target] : unlocked(d.imgs.map((x) => x[2]), d.imgs.length);
    ctx.pool = base.imgPool.concat(base.images).map((x) => x[0]);
  }
  if (c.sec === "voice") Object.assign(ctx, { toneArr: d.toneArr, headline: d.headline });
  return { sec: c.sec, text: c.text, ctx };
}

// Same shapes as BrandApp.propose(), so the panel and "Accept and lock" work unchanged.
// ratio(a, b) is the contrast between two hex colors.
export function editProposal({ c, d, base, ov, change, ratio }) {
  const lock = ov.lock || {};
  const summary = change.summary;
  if (c.sec === "palette" || c.sec === "preview") {
    const before = d.colors.map((x) => x.show);
    const after = before.slice();
    const names = d.colors.map((x) => x.name);
    const swLock = (ov.swLock || []).slice();
    change.colors.forEach(({ index, hex, name }) => {
      after[index] = hex;
      names[index] = name;
      swLock[index] = true;
    });
    return { kind: "colors", summary: summary + " Changed colors will be locked.", before, after, patch: { hex: after, names, swLock } };
  }
  if (c.sec === "ui") {
    const contrast = ` White text contrast goes from ${d.uiRatio}:1 to ${ratio(change.hex, "#FFFFFF").toFixed(2)}:1.`;
    return { kind: "colors", summary: summary + contrast, before: [d.ui], after: [change.hex], patch: { uiMix: d.uiMix, uiFixed: change.hex } };
  }
  if (c.sec === "word") {
    return { kind: "word", summary, bFont: d.wordFont, bTrack: d.trackPx, aFont: change.font, aTrack: change.track + "px", patch: { wordFont: change.font, track: change.track, lock: { ...lock, word: true } } };
  }
  if (c.sec === "type") {
    return { kind: "type", summary, bType: [d.display, d.body], aType: [change.display, change.body], sample: [d.headline, d.micro], patch: { display: change.display, body: change.body, lock: { ...lock, type: true } } };
  }
  if (c.sec === "refs") {
    const pool = base.imgPool.concat(base.images);
    const images = d.imgs.map((x) => x.slice());
    const swaps = change.swaps.map(({ index, label }) => {
      const was = images[index][0];
      images[index] = [label, (pool.find((p) => p[0] === label) || [])[1], true];
      return [was, label];
    });
    return { kind: "images", summary, swaps, patch: { images, imgN: ov.imgN || 0 } };
  }
  const say = (tone, headline) => tone.map((t) => t[0]).join(", ") + " · " + headline;
  return { kind: "text", summary, bText: say(d.toneArr, d.headline), aText: say(change.tone, change.headline), patch: { tone: change.tone, headline: change.headline, lock: { ...lock, voice: true } } };
}
