import { Component } from "react";
import Root from "../screens/Root.jsx";
import { ALL_SECTIONS, typeScaleOf } from "./exports.js";
import accounts from "./store.js";
import { ensureFonts } from "./fonts.js";
import { flowVals, newMeeting } from "./flow.js";
import { GEN_VERSION, colorName, contrast, generateDirections, hexToHsl, hslToHex } from "./generate.js";
import { isSearching, markImagesUsed, pinImages, shownImages, subscribe as onImages } from "./referenceImages.js";
import { INDUSTRIES } from "./layers.js";
import { briefCopy } from "./briefCopy.js";
import { imageColorsVersion, readingColors, subscribe as onImageColors } from "./imageColors.js";
import { restrictedHits } from "./language.js";
import { followAddress, projectChanged, projectVals, saveNow, scheduleSave, syncAddress } from "./projects.js";
import { loadMaterials, materialVals } from "./materials.js";
import { editContext, editProposal, honestAAA } from "./edits.js";
import { blank } from "./fill.js";

const SETTLE_MS = 30000;

export default class BrandApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: 'splash', path: 'brief', step: 1, dirs: null,
      f: this.blankF(), tone: [], looks: {}, sl: { warmth: 50, energy: 50, serious: 50 },
      avoidC: [], keepC: [], avoidT: [], banned: [], brandsA: [], deliv: [], domains: [], votes: [], taglines: [], buyerCares: [], comps: [], alts: [],
      refs: [], refTags: {}, legalOpen: false, endOn: false, sigOpen: false,
      pk: { open: false, mode: 'avoid', h: 280, s: 70, l: 30, text: null },
      genStep: 0, option: 0, edit: null, allMenu: false, toast: '', undo: null, ov: [{}, {}, {}],
      view: 'dir', darkPrev: false, cmode: false, comments: [], draft: null, cid: 0,
      mixPick: { word: 0, palette: 0, type: 0, refs: 0, voice: 0 }, mixBase: null, keep: 40,
      meeting: newMeeting(), handoffFile: 'claude', exportSel: ALL_SECTIONS, exportFormat: 'pdf'
    };
    Object.assign(this.state, { user: accounts.currentUser(), projectId: null, projects: [], saveStatus: 'saved', saveError: '', authError: '', authBusy: false, projectMenu: null, renaming: null, deleting: null });
    // Materials: pasted notes and which answers were suggested from them are saved with the project; the rest is per visit.
    Object.assign(this.state, { material: '', sugg: {}, files: [], uploading: '', fillBusy: false, fillError: '' });
    this._init = JSON.parse(JSON.stringify(this.state));
  }
  // A new screen or step opens at its top, not wherever the last one was scrolled to.
  componentDidUpdate(_, prev) {
    const s = this.state;
    if (s.screen !== prev.screen || s.step !== prev.step || s.view !== prev.view) window.scrollTo(0, 0);
    // Autosave: any change to the open project saves shortly after the last edit.
    if (s.projectId && s.projectId === prev.projectId && projectChanged(prev, s)) scheduleSave(this);
    syncAddress(this, prev);
    if (s.screen === 'start' && (prev.screen !== 'start' || prev.projectId !== s.projectId)) loadMaterials(this);
    this.storeDirs();
  }
  blankF() {
    const keys = ['name', 'legal', 'desc', 'domainIn', 'voteIn', 'meaning', 'toneIn', 'lookNote', 'colorDir', 'avoidOther', 'bannedIn', 'brandAIn', 'buyerRole', 'mot', 'success', 'opRole', 'opTeam', 'opCares', 'endWho', 'endCares',
      'problem', 'short', 'altIn', 'diff', 'diffWhy', 'outcomes', 'switchTo', 'value', 'emo', 'wedge', 'wedgeWhy', 'feel', 'diffFeel', 'wfStart', 'wfAha', 'wfSuccess', 'sigReact', 'sigEasier', 'site', 'industry', 'industryOther'];
    const o = { who: 'operator' }; keys.forEach(k => { o[k] = ''; }); return o;
  }
  sampleState() {
    const f = Object.assign(this.blankF(), {
      name: 'Ferra', desc: '[Company description from your brief: what it does and for whom]', meaning: 'Fe, iron: strength that holds under load.',
      buyerRole: '[Buyer role]', mot: '[What motivates them to purchase]', success: '[How they define success]', opRole: '[Operator role]', opTeam: '[Function or team]', opCares: '[What they care about]',
      problem: '[The problem your brief describes]', short: '[Why current solutions fall short]', diff: '[What makes you different]', diffWhy: '[Why this matters]',
      outcomes: '[Outcomes users want]', switchTo: '[What would make them switch]', value: '[Primary value]', emo: '[Secondary or emotional value]'
    });
    return {
      f, tone: ['Sturdy', 'Industrial', 'Precise'], looks: { 0: 'a', 1: 'b', 2: 'b', 3: 'b' }, sl: { warmth: 35, energy: 45, serious: 70 },
      avoidC: ['#5A136A'], avoidT: ['Gradients', 'Neon'],
      brandsA: [{ name: '[Brand you admire]', why: '[Why]' }],
      deliv: [{ type: 'Logo' }, { type: 'Website' }], domains: ['ferra.example'], votes: ['Ferra', '[Alternate name]'],
      taglines: ['[Working tagline]'], buyerCares: ['ROI', 'Reliability'], comps: [{ name: '[Competitor]', url: '' }], alts: ['[Current workaround]']
    };
  }
  componentDidMount() {
    // Closing the tab mid-change still saves it.
    this._flush = () => { if (this._save) saveNow(this, { closing: true }); };
    window.addEventListener('beforeunload', this._flush);
    // Back, Forward and pasted links change the address; the app follows it.
    this._follow = () => followAddress(this);
    window.addEventListener('hashchange', this._follow);
    // Reference photos arrive from image search after the first render; redraw when they do.
    this._offImages = onImages(() => this.forceUpdate());
    this._offImageColors = onImageColors(() => this.forceUpdate());
  }
  componentWillUnmount() { if (this._offImages) this._offImages(); if (this._offImageColors) this._offImageColors(); clearInterval(this._g); clearTimeout(this._t); clearTimeout(this._a); clearTimeout(this._st); window.removeEventListener('beforeunload', this._flush); window.removeEventListener('hashchange', this._follow); }

  hexOk(h) { return /^#[0-9a-fA-F]{6}$/.test(h || ''); }
  // Long answers are cut at a word where the screens use them as sample copy.
  short(t, n) { t = (t || '').trim(); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t; }
  rgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
  lum(h) { const c = this.rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  mix(h, t) { const c = this.rgb(h).map(v => Math.round(v * (1 - t))); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase(); }
  minMix(h) { for (let t = 0; t <= 0.9; t += 0.01) { if (contrast(this.mix(h, t), '#FFFFFF') >= 4.5) return Math.round(t * 100); } return 90; }
  hex2hsl(hex) {
    const [r, g, b] = this.rgb(hex).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.min(95, Math.max(5, Math.round(l * 100)))];
  }
  pkg(n) { return '@fontsource/' + n.toLowerCase().replace(/ /g, '-'); }

  mixHex(a, b, t) { const x = this.rgb(a), y = this.rgb(b); return '#' + x.map((v, k) => Math.round(v + (y[k] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); }
  tint(h, t) { const c = this.rgb(h).map(v => Math.round(v + (255 - v) * t)); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase(); }
  hueToward(h, target, step) { const d = ((target - h + 540) % 360) - 180; return (h + Math.sign(d) * Math.min(step, Math.abs(d)) + 360) % 360; }
  norm(t) {
    return t.toLowerCase().replace(/too (cold|cool|blue)/g, 'warm').replace(/too (warm|hot|orange|red)/g, 'cool').replace(/too dark/g, 'light').replace(/too (light|pale|washed)/g, 'dark')
      .replace(/too (bright|loud|saturated|much)/g, 'muted').replace(/too (dull|muted|flat|grey|gray)/g, 'bright').replace(/cold/g, 'cool').replace(/lighter/g, 'light').replace(/darker/g, 'dark');
  }
  adjust(hex, t) {
    let [h, s, l] = this.hex2hsl(hex), hit = false;
    if (/warm/.test(t)) { h = this.hueToward(h, 30, 14); s += 8; hit = true; }
    if (/cool|cold|blue/.test(t)) { h = this.hueToward(h, 210, 16); hit = true; }
    if (/light|pale|airy/.test(t)) { l += 10; hit = true; }
    if (/dark|deep|rich|charred/.test(t)) { l -= 10; hit = true; }
    if (/bright|bold|vivid|pop|punch|electric/.test(t)) { s += 15; hit = true; }
    if (/mute|soft|calm|dull|subtle|tone it down/.test(t)) { s -= 15; hit = true; }
    if (!hit) return null;
    return hslToHex([h, Math.max(0, Math.min(100, s)), Math.max(4, Math.min(96, l))]);
  }

  // The three directions come from the brief: each is a blend of one to three archetypes
  // (see generate.js and docs/archetypes.md). Cached until the brief inputs change.
  // Keys are sorted because the server's database reorders them, and this is compared after a reload.
  // avoidIn is text still being typed, not an answer, so it is left out.
  genInputs() { const s = this.state; return JSON.stringify([s.f, s.tone, s.sl, s.looks, s.avoidC, s.keepC, s.avoidT, s.comps, s.refs, s.refTags, s.keep], (k, v) => k === 'avoidIn' ? undefined : v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(x => [x, v[x]])) : v); }
  // A project shows the directions stored with it (storeDirs), so photo searches and deploys don't change them.
  generated() {
    const s = this.state, saved = s.dirs && s.dirs.v === GEN_VERSION ? s.dirs : null;
    pinImages(saved && saved.images);
    if (saved) return saved;
    // Photo colors arrive after the first render, so their version is part of the key.
    const inputs = this.genInputs(), key = inputs + imageColorsVersion();
    if (this._genKey !== key) {
      this._genKey = key; this._genIn = inputs;
      this._gen = generateDirections(s, (hex, t) => this.adjust(hex, t));
    }
    return this._gen;
  }
  // Directions computed live are stored with the project once the photo searches and color reads
  // they depend on have landed or failed, along with the searched photos they show.
  // shortcut: a lookup still running after SETTLE_MS on these screens is given up on, and the directions are stored without its colors; Generate again brings them in.
  storeDirs() {
    const s = this.state;
    const reset = () => { clearTimeout(this._st); this._st = null; this._late = false; };
    if (!['out', 'meet', 'handoff'].includes(s.screen) || (s.dirs && s.dirs.v === GEN_VERSION)) return reset();
    if (!this._st) this._st = setTimeout(() => { this._late = true; this.forceUpdate(); }, SETTLE_MS);
    if ((isSearching() || readingColors()) && !this._late) return;
    reset();
    const g = this.generated(), images = shownImages(g.directions.flatMap(d => d.images.concat(d.imgPool).map(x => x[0])));
    this.setState({ dirs: JSON.parse(JSON.stringify({ v: GEN_VERSION, in: this.genInputs(), directions: g.directions, recommended: g.recommended, images })) });
  }
  opts() {
    const list = this.generated().directions.slice();
    if (this.state.mixBase) list.push(this.state.mixBase);
    return list;
  }

  followOv() {
    const ov = [{}, {}, {}];
    const base = this.opts();
    ov.forEach((o, i) => {
      const lock = {};
      const clean = base[i].voices.findIndex(v => !restrictedHits(this.state.banned, v).length);
      if (clean > 0) o.voiceV = clean;
      o.lock = lock;
    });
    return ov;
  }

  setOvAt(i, patch) { const ov = this.state.ov.slice(); while (ov.length <= i) ov.push({}); ov[i] = Object.assign({}, ov[i], patch); this.setState({ ov }); }
  setOv(patch) { this.setOvAt(this.state.option, patch); }
  lockOv(mod, what, patch) { const ov = this.state.ov[this.state.option] || {}; this.handEdit(this.state.option, mod, what, Object.assign({}, patch, { lock: Object.assign({}, ov.lock, { [mod]: true }) })); }
  // A hand edit locks its part and offers Undo. Several edits in a row to one part (typing a hex,
  // dragging a slider) undo together, back to before the first.
  handEdit(i, part, what, patch) {
    const u = this.state.undo, prev = u && u.i === i && u.part === part ? u.prev : (this.state.ov[i] || {});
    this.setOvAt(i, patch);
    this.showToast(what + ' changed. Locked because you edited it.', { i, prev, part });
  }
  showToast(msg, undo) {
    clearTimeout(this._t);
    this.setState({ toast: msg, undo: undo || null, allMenu: false });
    this._t = setTimeout(() => this.setState({ toast: '', undo: null }), undo ? 6000 : 2600);
  }

  // A patch for ov that regenerates one module; null when the module is locked, false when no
  // variant would show anything other than what is shown now.
  regenPatch(i, mod, ov) {
    const base = this.opts()[i], lock = ov.lock || {}, J = JSON.stringify;
    // The next variant after `from` that shows something new: not what is shown now, and not the
    // same as an earlier variant, so repeated presses go through every different result once.
    const step = (list, from, res, now, ok = () => true) => {
      const L = list.length, key = (v) => J(res(v)), first = new Map();
      for (let v = 0; v < L; v++) if (ok(v) && !first.has(key(v))) first.set(key(v), v);
      for (let t = 1; t <= L; t++) { const v = (from + t) % L; if (first.get(key(v)) === v && key(v) !== J(now)) return v; }
      return false;
    };
    if (mod === 'palette') {
      const sw = ov.swLock || [], L = base.palettes.length, pv = (ov.palV || 0) % L, curPal = base.palettes[pv], idx = curPal.map((_, k) => k);
      if (idx.every(k => sw[k])) return null;
      const hex = idx.map(k => sw[k] ? ((ov.hex && ov.hex[k] != null) ? ov.hex[k] : curPal[k][1]) : null);
      const names = idx.map(k => sw[k] ? ((ov.names && ov.names[k]) || curPal[k][0]) : null);
      // Skip variants too short to hold every locked color, so a regenerate never drops one.
      const need = idx.reduce((n, k) => sw[k] ? k + 1 : n, 0);
      const nv = step(base.palettes, pv, (v) => base.palettes[v].map((c, k) => (hex[k] != null ? hex[k] : c[1]).toUpperCase()),
        curPal.map((c, k) => ((ov.hex && ov.hex[k] != null) ? ov.hex[k] : c[1]).toUpperCase()), (v) => base.palettes[v].length >= need);
      if (nv === false) return false;
      const p = { palV: nv, hex, names };
      if (!ov.uiFixed) p.uiMix = null;
      return p;
    }
    if (mod === 'word') {
      if (lock.word) return null;
      const from = (ov.wordV || 0) % base.words.length, wv = base.words[from];
      const v = step(base.words, from, (k) => base.words[k].slice(0, 2), [ov.wordFont || wv[0], ov.track != null ? ov.track : wv[1]]);
      return v === false ? false : { wordV: v, wordFont: null, track: null };
    }
    if (mod === 'type') {
      if (lock.type) return null;
      const from = (ov.typeV || 0) % base.types.length, tv = base.types[from];
      const v = step(base.types, from, (k) => base.types[k].slice(0, 2), [ov.display || tv[0], ov.body || tv[1]]);
      return v === false ? false : { typeV: v, display: null, body: null };
    }
    if (mod === 'voice') {
      if (lock.voice) return null;
      const V = base.voices, from = (ov.voiceV || 0) % V.length, vv = V[from];
      const clean = (k) => !restrictedHits(this.state.banned, V[k]).length, anyClean = V.some((_, k) => clean(k));
      const v = step(V, from, (k) => V[k], Object.assign({}, vv, { tone: ov.tone || vv.tone, headline: ov.headline || vv.headline }), (k) => !anyClean || clean(k));
      return v === false ? false : { voiceV: v, tone: null, headline: null };
    }
    if (mod === 'refs') {
      const imgs = (ov.images || base.images.map(x => [x[0], x[1], false])).map(x => x.slice());
      if (imgs.every(x => x[2])) return null;
      let n = ov.imgN || 0; const pool = base.imgPool.concat(base.images);
      imgs.forEach((im, k) => {
        if (im[2]) return;
        let p = pool[n % pool.length], guard = 0;
        while (imgs.some(x => x[0] === p[0]) && guard < pool.length) { n++; p = pool[n % pool.length]; guard++; }
        imgs[k] = [p[0], p[1], false]; n++;
      });
      // The pool steps on with imgN, so this is the same only when no unused photo is left.
      if (J(imgs.map(x => x[0])) === J((ov.images || base.images).map(x => x[0]))) return false;
      return { images: imgs, imgN: n };
    }
    return null;
  }
  doRegen(mods) {
    const s = this.state, i = s.option, prev = s.ov[i] || {};
    let ov = Object.assign({}, prev); const done = [], kept = [], same = [];
    const NM = { word: 'wordmark', palette: 'palette', type: 'typography', refs: 'imagery', voice: 'voice' };
    mods.forEach(m => { const p = this.regenPatch(i, m, ov); if (p) { ov = Object.assign({}, ov, p); done.push(NM[m]); } else (p === false ? same : kept).push(NM[m]); });
    const part = (same.includes('palette') && (prev.swLock || []).some(Boolean)) || (same.includes('imagery') && (prev.images || []).some(x => x[2]));
    const name = this.opts()[i].name, none = same.length ? ' No other ' + same.join(' or ') + ' to show' + (part ? ' with what you locked.' : '.') : '';
    if (!done.length) { this.showToast(same.length ? none.slice(1) : 'Everything is locked. Unlock a section to regenerate it.'); return; }
    const all = s.ov.slice(); while (all.length <= i) all.push({}); all[i] = ov;
    this.setState({ ov: all });
    this.showToast('New ' + done.join(', ') + ' within ' + name + '.' + (kept.length ? ' Kept locked: ' + kept.join(', ') + '.' : '') + none, { i, prev });
  }

  // light: Compare shows the options as they are; the dark preview covers only the direction view.
  optionData(i, light) {
    const s = this.state, O = this.opts(), base = O[i], ov = s.ov[i] || {}, lock = ov.lock || {}, dk = !!s.darkPrev && !light;
    const SHUT = 'M8 11V7a4 4 0 0 1 8 0v4', OPEN = 'M8 11V7a4 4 0 0 1 7.6-1.6';
    const lk = (on, what) => ({ locked: !!on, lockBg: on ? 'var(--color-action)' : '#FFFFFF', lockFg: on ? '#FFFFFF' : 'var(--color-ink)', shackle: on ? SHUT : OPEN, lockAria: (on ? 'Unlock ' : 'Lock ') + what });
    const pal = base.palettes[(ov.palV || 0) % base.palettes.length], swLock = ov.swLock || [];
    const hexes = pal.map((c, k) => (ov.hex && ov.hex[k] != null) ? ov.hex[k] : c[1]);
    const shown = pal.map((c, k) => this.hexOk(hexes[k]) ? hexes[k].toUpperCase() : c[1]);
    const names = pal.map((c, k) => (ov.names && ov.names[k]) || c[0]);
    const pin = (sec, target, label) => () => this.startComment(sec, target, label);
    const colors = pal.map((c, k) => Object.assign({
      name: names[k], role: c[2], ratio: c[3], text: hexes[k], show: shown[k],
      label: this.lum(shown[k]) > 0.35 ? 'var(--color-ink)' : '#FFFFFF', aria: names[k] + ' hex value',
      pinC: pin('palette', k, names[k]), pinAria: 'Add ' + names[k] + ' to the AI edit', picked: this.isPicked('palette', k),
      // A typed color gets a name that fits it; a half-typed one keeps the last name.
      setHex: (e) => { const v = e.target.value, h = hexes.slice(), nm = names.slice(), l = swLock.slice(); h[k] = v; l[k] = true; if (this.hexOk(v)) nm[k] = colorName(hexToHsl(v)); this.handEdit(i, 'palette' + k, c[2] + ' color', { hex: h, names: nm, swLock: l }); },
      toggleLock: () => { const l = swLock.slice(); l[k] = !l[k]; const h = hexes.slice(); const nm = names.slice(); this.setOvAt(i, { swLock: l, hex: h, names: nm }); }
    }, lk(swLock[k], names[k])));
    const at = (role) => base.palettes[0].findIndex(c => c[2] === role);
    const primaryO = shown[at('Primary')], surfaceO = shown[at('Surface')], lightO = shown[at('Neutral light')], primaryR = contrast(primaryO, '#FFFFFF');
    const darkIdx = shown.reduce((m, h, k) => this.lum(h) < this.lum(shown[m]) ? k : m, 0), darkO = shown[darkIdx];
    // UI primary is tuned from the first accent, unless it would have to be darkened so far it
    // loses its color (yellows go olive). Then the accent that holds up best is used, or the primary
    // if none can.
    const accentIdxs = pal.map((c, k) => k).filter(k => /^Accent/.test(pal[k][2]));
    let uiIdx = base.accentIdx;
    if (this.minMix(shown[uiIdx]) > 30) {
      const bestAccent = accentIdxs.reduce((best, k) => this.minMix(shown[k]) < this.minMix(shown[best]) ? k : best, uiIdx);
      uiIdx = this.minMix(shown[bestAccent]) <= 45 ? bestAccent : at('Primary');
    }
    const accent = shown[uiIdx], accentName = names[uiIdx];
    const uiMix = ov.uiMix != null ? ov.uiMix : this.minMix(accent);
    const ui = ov.uiFixed || this.mix(accent, uiMix / 100), uiR = contrast(ui, '#FFFFFF'), uiDR = contrast(ui, darkO);
    // Rounded down, so a ratio just under a threshold never shows as reaching it.
    const two = (r) => (Math.floor(r * 100) / 100).toFixed(2);
    const T = dk
      ? { light: darkO, surface: this.tint(darkO, 0.1), primary: surfaceO, ink: lightO, deep: this.mix(darkO, 0.35), card: this.tint(darkO, 0.14), onDeep: surfaceO, onPrimary: darkO }
      : { light: lightO, surface: surfaceO, primary: primaryO, ink: darkO, deep: darkO, card: '#FFFFFF', onDeep: surfaceO, onPrimary: '#FFFFFF' };
    const wv = base.words[(ov.wordV || 0) % base.words.length], tv = base.types[(ov.typeV || 0) % base.types.length], vv = base.voices[(ov.voiceV || 0) % base.voices.length];
    const wordFont = ov.wordFont || wv[0], track = ov.track != null ? ov.track : wv[1];
    const display = ov.display || tv[0], body = ov.body || tv[1];
    ensureFonts([wordFont, display, body]);
    const toneArr = ov.tone || vv.tone, headline = ov.headline || vv.headline;
    const tone = toneArr.map((t, k) => ({
      yes: t[0], no: t[1], editing: s.edit === 'voice' && s.option === i,
      setYes: (e) => { const tt = toneArr.map(x => x.slice()); tt[k][0] = e.target.value; this.handEdit(i, 'voice', 'Voice', { tone: tt, lock: Object.assign({}, lock, { voice: true }) }); },
      setNo: (e) => { const tt = toneArr.map(x => x.slice()); tt[k][1] = e.target.value; this.handEdit(i, 'voice', 'Voice', { tone: tt, lock: Object.assign({}, lock, { voice: true }) }); }
    }));
    const imgs = ov.images || base.images.map(x => [x[0], x[1], false]);
    const imageCards = imgs.map((im, k) => ({
      label: im[0], source: im[1], locked: !!im[2], pinBd: im[2] ? 'var(--color-action)' : 'var(--color-grey-1)',
      pinC: pin('refs', k, im[0]), pinAria: 'Add ' + im[0] + ' to the AI edit', picked: this.isPicked('refs', k),
      swap: () => {
        const pool = base.imgPool.concat(base.images); let n = ov.imgN || 0, p = pool[n % pool.length], g = 0;
        while (imgs.some(x => x[0] === p[0]) && g < pool.length) { n++; p = pool[n % pool.length]; g++; }
        const nn = imgs.map(x => x.slice()); nn[k] = [p[0], p[1], true]; this.setOvAt(i, { images: nn, imgN: n + 1 });
      },
      // Locking a photo is picking it, which Unsplash counts as a use.
      pin: () => { const nn = imgs.map(x => x.slice()); nn[k][2] = !nn[k][2]; if (nn[k][2]) markImagesUsed([im[0]]); this.setOvAt(i, { images: nn }); }
    }));
    const lightName = names[at('Neutral light')], surfName = names[at('Surface')];
    // Gradients run from the hero color to the accent. The far end is nudged until the hero's
    // text still passes AA on it, so a gradient never costs readability.
    const look = base.look || null, heroKey = (look && look.hero) || 'primary';
    let gradientCss = null;
    if (base.gradient && base.gradient !== 'none') {
      const bg = { primary: T.primary, deep: T.deep, light: T.light }[heroKey], fg = { primary: T.onPrimary, deep: T.onDeep, light: T.ink }[heroKey];
      // Try the accents, then the primary, and take the first that passes with a small nudge.
      // Forcing a color far from its own lightness (yellow darkened for light text) turns to mud.
      const accents = colors.filter(c => /^Accent/.test(c.role)).map(c => c.show);
      const candidates = (base.gradient === 'core' ? accents : accents.map(x => this.mixHex(bg, x, 0.35))).concat([T.primary]).filter(x => x.toUpperCase() !== bg.toUpperCase());
      const step = this.lum(fg) > 0.5 ? -1 : 1;
      const fit = (hex) => { let e = hexToHsl(hex), n = 0; while (n < 60 && contrast(hslToHex(e), fg) < 4.5) { e = [e[0], e[1], Math.max(0, Math.min(100, e[2] + step))]; n++; } return { e, n }; };
      const tries = candidates.map(fit);
      const end = (tries.find(t => t.n <= 12) || tries[tries.length - 1]).e;
      gradientCss = 'linear-gradient(120deg, ' + bg + ' 0%, ' + hslToHex(end) + ' 100%)';
    }
    const linkColor = !dk ? ui : (contrast(accent, T.light) >= 4.5 ? accent : this.tint(ui, 0.45));
    // Most primaryReasons explain how the generated primary was reached, so they go once it's edited by hand.
    // The audience row is about contrast, which honestAAA restates for the new color.
    const honest = (rows) => (rows || []).map(r => Object.assign({}, r, { text: honestAAA(r.text, primaryR) }));
    return Object.assign({
      i, label: i === 3 ? 'Your mix' : 'Option ' + (i + 1), name: base.name, title: i === 3 ? 'Your mix' : 'Option ' + (i + 1) + ': ' + base.name, recommended: !!base.recommended, fit: base.fit || '', mix: base.mix || [], layers: honest(base.layers), primaryReasons: honest(base.primaryReasons).filter(r => r.layer === 'Audience' || primaryO === pal[at('Primary')][1].toUpperCase()), dial: base.dial, look, gradient: base.gradient || 'none', gradientCss, wordFont, track, trackPx: track + 'px', display, body,
      displayPkg: this.pkg(display), bodyPkg: this.pkg(body), colors, palNames: names.join(', '),
      darkName: names[darkIdx], darkO, accent, accentName,
      accentText: contrast(accent, T.deep) >= 4.5 ? accent : (dk ? lightO : '#FFFFFF'),
      onAccent: contrast(darkO, accent) >= contrast('#FFFFFF', accent) ? darkO : '#FFFFFF',
      ui, uiMix, uiHover: this.mix(ui, 0.15), uiRatio: two(uiR), uiDarkRatio: two(uiDR), linkColor,
      passLabel: uiR >= 4.5 ? 'Passes AA' : 'Fails AA', passBg: uiR >= 4.5 ? 'var(--color-ink)' : 'var(--color-coral)',
      darkPassLabel: uiDR >= 3 ? 'Passes AA' : 'Fails AA', darkPassBg: uiDR >= 3 ? 'var(--color-ink)' : 'var(--color-coral)',
      // WCAG AA: 4.5:1 for the button's white text, 3:1 for the button's edge against the page.
      uiWarn: uiR < 4.5 ? 'White text on this button is ' + two(uiR) + ':1, below the 4.5:1 that AA needs for text.' : '',
      uiDarkWarn: uiDR < 3 ? 'In dark mode the button is ' + two(uiDR) + ':1 against ' + names[darkIdx] + ', below the 3:1 that AA needs for a button edge.' : '',
      darkRoles: [{ role: 'Background', name: names[darkIdx] }, { role: 'Text', name: lightName }, { role: 'Wordmark and headings', name: surfName }, { role: 'Buttons', name: 'UI primary' }],
      tone, toneArr, headline, setHeadline: (e) => this.handEdit(i, 'voice', 'Voice', { headline: e.target.value, lock: Object.assign({}, lock, { voice: true }) }), micro: vv.micro, hits: restrictedHits(s.banned, { tone: toneArr, headline, micro: vv.micro }), reason: base.reason, match: base.match, tradeoff: base.tradeoff,
      imgs, imageCards, img0: imgs[0][0], img1: imgs[1][0], img2: imgs[2][0], img3: imgs[3][0], word: (this.state.f.name || 'Name').toUpperCase(),
      locks: { word: !!lock.word, palette: pal.every((_, k) => swLock[k]), ui: !!ov.uiFixed, type: !!lock.type, voice: !!lock.voice, refs: imgs.every(x => x[2]) },
      lk
    }, T);
  }
  current() { return this.optionData(this.state.option); }


  startComment(sec, target, label) {
    const d = this.state.draft || { items: [], text: '' }, items0 = d.items || [];
    const has = items0.some(x => x.sec === sec && x.target === target);
    const items = has ? items0.filter(x => !(x.sec === sec && x.target === target)) : items0.concat([{ sec, target, label }]);
    this.setState({ draft: Object.assign({}, d, { items }), cmode: true, edit: null });
  }
  isPicked(sec, target) { const d = this.state.draft; return !!(d && d.items && d.items.some(x => x.sec === sec && x.target === target)); }
  updComment(id, patch) { this.setState({ comments: this.state.comments.map(c => c.id === id ? Object.assign({}, c, patch) : c) }); }
  // On the hosted version the server's AI proposes the change. `npm run dev` has no server, so
  // there it falls back to the keyword rules in propose().
  // this._asking maps the requests in flight ("project:comment") to their AbortController. A comment
  // saved as 'thinking' with no request behind it (the page was closed mid-answer) can then be retried
  // instead of sticking.
  applyAI(id) {
    const c = this.state.comments.find(x => x.id === id); if (!c) return;
    const pid = this.state.projectId, key = pid + ':' + id, asking = this._asking || (this._asking = new Map()), ctl = new AbortController();
    // An answer to a cancelled or retried request, or one that arrives after another project was opened, is dropped.
    const done = (patch) => { if (asking.get(key) !== ctl) return; asking.delete(key); if (this.state.projectId === pid) this.updComment(id, patch); };
    asking.set(key, ctl);
    this.updComment(id, { status: 'thinking', error: null, started: Date.now() });
    if (!accounts.canFill) { this._a = setTimeout(() => { const cc = this.state.comments.find(x => x.id === id); done(cc ? { status: 'proposed', prop: this.propose(cc) } : {}); }, 1100); return; }
    const i = c.opt, about = { c, d: this.optionData(i), base: this.opts()[i], ov: this.state.ov[i] || {} };
    accounts.editPiece(pid, editContext(Object.assign({ f: this.state.f, tone: this.state.tone, banned: this.state.banned }, about)), ctl.signal)
      .then(change => {
        const prop = editProposal(Object.assign({ change, ratio: contrast }, about));
        ensureFonts([prop.aFont].concat(prop.aType || []));
        done({ status: 'proposed', prop });
      })
      .catch(err => done({ status: 'open', error: err.message }));
  }
  accept(id) {
    const c = this.state.comments.find(x => x.id === id); if (!c || !c.prop) return;
    const prev = this.state.ov[c.opt] || {};
    this.setOvAt(c.opt, c.prop.patch);
    this.updComment(id, { status: 'applied' });
    this.showToast('AI edit ' + c.num + ' applied and locked.', { i: c.opt, prev, cid: id });
  }
  // Stops waiting. The server still counts the request: the AI call may already have run.
  cancelAI(id) {
    const key = this.state.projectId + ':' + id, ctl = this._asking && this._asking.get(key);
    if (this._asking) this._asking.delete(key);
    if (ctl) ctl.abort();
    this.updComment(id, { status: 'open', error: 'Cancelled.' });
  }
  propose(c) {
    const i = c.opt, base = this.opts()[i], ov = this.state.ov[i] || {}, lock = ov.lock || {}, d = this.optionData(i), t = this.norm(c.text), n = c.tries || 0;
    const words = (t.match(/warm|cool|light|dark|bright|bold|mute|soft|deep|vivid|calm/g) || []).map(w => w === 'mute' ? 'muted' : w).filter((x, k, a) => a.indexOf(x) === k);
    if (c.sec === 'palette' || c.sec === 'preview') {
      const before = d.colors.map(x => x.show), after = before.slice(), swLock = (ov.swLock || []).slice();
      const targets = typeof c.target === 'number' ? [c.target] : before.map((_, k) => k).filter(k => !swLock[k]);
      const nextPal = base.palettes[((ov.palV || 0) + 1 + n) % base.palettes.length];
      targets.forEach(k => { after[k] = this.adjust(before[k], t) || (nextPal[k] ? nextPal[k][1] : before[k]); swLock[k] = true; });
      const what = typeof c.target === 'number' ? d.colors[c.target].name : (targets.length === before.length ? 'the whole palette' : 'the unlocked colors');
      const how = words.length ? 'shifted ' + what + ' to read ' + words.join(' and ') + '.' : 'swapped ' + what + ' for the next shade that stays within ' + base.name + '.';
      return { kind: 'colors', summary: 'You asked: "' + c.text + '". I ' + how + ' Changed colors will be locked.', before, after,
        patch: { hex: after, names: d.colors.map(x => x.name), swLock } };
    }
    if (c.sec === 'ui') {
      const step = /light|bright|soft/.test(t) ? -10 : 10, m = Math.max(0, Math.min(80, d.uiMix + step * (n + 1))), hex = this.mix(d.accent, m / 100);
      return { kind: 'colors', summary: (step > 0 ? 'Darkened' : 'Lightened') + ' the UI primary. White text contrast goes from ' + d.uiRatio + ':1 to ' + contrast(hex, '#FFFFFF').toFixed(2) + ':1.',
        before: [d.ui], after: [hex], patch: { uiMix: m, uiFixed: hex } };
    }
    if (c.sec === 'word') {
      let font = d.wordFont, tr = d.track, why;
      if (/spac|wide|loose|air/.test(t)) { tr = d.track + 3; why = 'Opened the letter spacing from ' + d.track + 'px to ' + tr + 'px.'; }
      else if (/tight|close|narrow/.test(t)) { tr = Math.max(0, d.track - 2); why = 'Tightened the letter spacing from ' + d.track + 'px to ' + tr + 'px.'; }
      else { const w = base.words[((ov.wordV || 0) + 1 + n) % base.words.length]; font = w[0]; tr = w[1]; why = 'Tried ' + font + ', another wordmark face that fits ' + base.name + '.'; }
      return { kind: 'word', summary: why, bFont: d.wordFont, bTrack: d.trackPx, aFont: font, aTrack: tr + 'px',
        patch: { wordFont: font, track: tr, lock: Object.assign({}, lock, { word: true }) } };
    }
    if (c.sec === 'type') {
      if (c.target === 'body' || /read|body|small|legib/.test(t)) {
        const opts = ['Barlow', 'IBM Plex Sans', 'Work Sans'].filter(x => x !== d.body), nb = opts[n % opts.length];
        return { kind: 'type', summary: 'Swapped the body face for one with more open letterforms at small sizes.', bType: [d.display, d.body], aType: [d.display, nb], sample: [d.headline, d.micro],
          patch: { body: nb, lock: Object.assign({}, lock, { type: true }) } };
      }
      const tp = base.types[((ov.typeV || 0) + 1 + n) % base.types.length];
      return { kind: 'type', summary: 'Tried the next type pairing within ' + base.name + '.', bType: [d.display, d.body], aType: [tp[0], tp[1]], sample: [d.headline, d.micro],
        patch: { display: tp[0], body: tp[1], lock: Object.assign({}, lock, { type: true }) } };
    }
    if (c.sec === 'refs') {
      const imgs = d.imgs.map(x => x.slice()), pool = base.imgPool.concat(base.images); let k2 = ov.imgN || 0;
      const targets = typeof c.target === 'number' ? [c.target] : imgs.map((x, k) => k).filter(k => !imgs[k][2]);
      const bl = targets.map(k => imgs[k][0]);
      targets.forEach(k => { let p = pool[k2 % pool.length], g = 0; while (imgs.some(x => x[0] === p[0]) && g < pool.length) { k2++; p = pool[k2 % pool.length]; g++; } imgs[k] = [p[0], p[1], true]; k2++; });
      return { kind: 'images', summary: 'Replaced ' + bl.length + (bl.length === 1 ? ' image' : ' images') + ' with searches closer to your note.', swaps: targets.map((k, x) => [bl[x], imgs[k][0]]),
        patch: { images: imgs, imgN: k2 } };
    }
    if (c.sec === 'voice') {
      if (/short|punch|fewer/.test(t) && d.headline.split(' ').length > 3) {
        const h = d.headline.replace(/[.]$/, '').split(' ').slice(0, 3).join(' ') + '.';
        return { kind: 'text', summary: 'Cut the headline to its first three words.', bText: d.headline, aText: h, patch: { headline: h, lock: Object.assign({}, lock, { voice: true }) } };
      }
      const v = base.voices[((ov.voiceV || 0) + 1 + n) % base.voices.length];
      return { kind: 'text', summary: 'Rewrote the tone and headline, keeping the voice of ' + base.name + '.', bText: d.toneArr.map(x => x[0]).join(', ') + ' · ' + d.headline, aText: v.tone.map(x => x[0]).join(', ') + ' · ' + v.headline,
        patch: { tone: v.tone, headline: v.headline, lock: Object.assign({}, lock, { voice: true }) } };
    }
    return { kind: 'text', summary: 'No change suggested.', bText: '', aText: '', patch: {} };
  }
  // Each part of a direction as the mix copies it, so the mix can tell when its source option has changed since.
  mixParts(d) { return { word: [d.wordFont, d.track], palette: d.colors.map(c => c.show), type: [d.display, d.body], refs: d.imgs.map(x => x[0]), voice: [d.toneArr, d.headline] }; }
  // The parts of the mix whose option differs now from when the mix was made. dd: optionData of options 1 to 3.
  mixStale(dd) {
    const from = this.state.mixBase && this.state.mixBase.from; if (!from) return [];
    return Object.keys(from.parts).filter(k => JSON.stringify(this.mixParts(dd[from.picks[k]])[k]) !== JSON.stringify(from.parts[k]));
  }
  // mp: which option each part comes from; "Update your mix" on the mix passes the picks it was made with.
  createMix(mp) {
    const s = this.state, O = this.opts(), had = !!s.mixBase;
    mp = mp || s.mixPick;
    const dd = [0, 1, 2].map(k => this.optionData(k));
    const uniq = (a) => a.filter((x, k) => a.findIndex(y => JSON.stringify(y) === JSON.stringify(x)) === k);
    const pd = dd[mp.palette], wd = dd[mp.word], td = dd[mp.type], vd = dd[mp.voice], rd = dd[mp.refs];
    const palNow = pd.colors.map((c) => [c.name, c.show, c.role, c.ratio]);
    const L = (k) => 'Option ' + (k + 1);
    const mixBase = {
      name: 'Your mix', accentIdx: 4, mix: O[mp.palette].mix, look: O[mp.palette].look, gradient: O[mp.palette].gradient,
      palettes: [palNow].concat(O[mp.palette].palettes.filter(pl => pl.length === palNow.length && pl.some((c, k) => !pd.colors[k].locked && c[1] !== palNow[k][1]))), words: uniq([[wd.wordFont, wd.track]].concat(O[mp.word].words)),
      types: uniq([[td.display, td.body]].concat(O[mp.type].types)), voices: uniq([{ tone: vd.toneArr, headline: vd.headline, micro: vd.micro }].concat(O[mp.voice].voices)),
      images: rd.imgs.map(x => [x[0], x[1]]), imgPool: O[mp.refs].imgPool,
      reason: 'Your own combination: the wordmark from ' + L(mp.word) + ', the palette from ' + L(mp.palette) + ', typography from ' + L(mp.type) + ', imagery from ' + L(mp.refs) + ', and the voice from ' + L(mp.voice) + '. Regenerating a section stays within the direction that piece came from.',
      match: ['Wordmark · ' + L(mp.word), 'Palette · ' + L(mp.palette), 'Type · ' + L(mp.type), 'Imagery · ' + L(mp.refs), 'Voice · ' + L(mp.voice)],
      tradeoff: 'Pieces from different directions can clash. Check the UI preview and the moodboard to see them together.',
      from: { picks: mp, parts: {} }
    };
    Object.keys(mp).forEach(k => { mixBase.from.parts[k] = this.mixParts(dd[mp[k]])[k]; });
    const ov = s.ov.slice(0, 3); while (ov.length < 3) ov.push({});
    ov[3] = { swLock: pd.colors.map(c => c.locked), uiFixed: pd.locks.ui ? pd.ui : null, images: rd.imgs.map(x => x.slice()),
      lock: { word: wd.locks.word, type: td.locks.type, voice: vd.locks.voice } };
    this.setState({ mixBase, ov, mixPick: mp, option: 3, view: 'dir', edit: null });
    this.showToast(had ? 'Updated your mix from its options.' : 'Created your custom direction. It is now the Your mix tab.');
  }

  renderVals() {
    const s = this.state, f = s.f;
    const set = (patch) => this.setState(patch);
    const toggleIn = (key, v) => () => { const a = s[key]; set({ [key]: a.includes(v) ? a.filter(x => x !== v) : a.concat([v]) }); };
    const on = (b) => b ? { bg: 'var(--color-action)', fg: '#FFFFFF' } : { bg: '#FFFFFF', fg: 'var(--color-ink)' };
    // Moving between brief steps drops competitor rows left blank.
    const goStep = (n, then) => { const comps = s.comps.filter(c => !blank([c.name, c.url, c.color].join(''))); this.setState(Object.assign({ step: n }, comps.length < s.comps.length ? { comps } : {}), then); };

    const stepNames = ['General', 'Branding', 'Customer', 'Tone', 'Review'];
    const steps = stepNames.map((label, k) => {
      const n = k + 1;
      return { label, current: s.step === n ? 'step' : undefined, pick: () => goStep(n) };
    });

    // Customer and Tone wording follows who the industry sells to; picked words outside the list stay shown.
    const copy = briefCopy(f.industry);
    const toneChips = s.tone.filter(t => !copy.tone.includes(t)).concat(copy.tone).map(label => Object.assign({ label, on: s.tone.includes(label), toggle: toggleIn('tone', label) }, on(s.tone.includes(label))));
    const treatChips = ['Gradients', 'Neon', 'All caps', 'Drop shadows', 'Pill buttons'].map(label => Object.assign({ label, on: s.avoidT.includes(label), toggle: toggleIn('avoidT', label) }, on(s.avoidT.includes(label))));
    const lookPairs = [['Warm', 'Cool'], ['Serif', 'Sans'], ['Ornate', 'Minimal'], ['Soft', 'Geometric']].map(([a, b], k) => ({
      a, b, onA: s.looks[k] === 'a', onB: s.looks[k] === 'b', bdA: s.looks[k] === 'a' ? 'var(--color-action)' : 'var(--color-grey-1)', bdB: s.looks[k] === 'b' ? 'var(--color-action)' : 'var(--color-grey-1)',
      pickA: () => set({ looks: Object.assign({}, s.looks, { [k]: 'a' }) }), pickB: () => set({ looks: Object.assign({}, s.looks, { [k]: 'b' }) })
    }));
    const sliders = [['warmth', 'Warm', 'Professional'], ['energy', 'Calm', 'Energetic'], ['serious', 'Playful', 'Serious']].map(([key, l, r]) => ({ key, l, r, val: s.sl[key], aria: l + ' to ' + r }));
    const avoidColors = s.avoidC.map(hex => ({ hex, aria: 'Remove ' + hex + ' from the avoid list', remove: () => set({ avoidC: s.avoidC.filter(x => x !== hex) }) }));
    const keepColors = (s.keepC || []).map(hex => ({ hex, aria: 'Remove ' + hex + ' from the keep list', remove: () => set({ keepC: s.keepC.filter(x => x !== hex) }) }));
    const p = s.pk, pHex = hslToHex([p.h, p.s, p.l]), rad = p.h * Math.PI / 180;
    const pk = { open: p.open, mode: p.mode || 'avoid', l: p.l, hex: pHex, hexText: p.text !== null ? p.text : pHex, badHex: !!p.text && !this.hexOk(p.text),
      x: (50 + Math.sin(rad) * p.s / 2).toFixed(1) + '%', y: (50 - Math.cos(rad) * p.s / 2).toFixed(1) + '%' };
    const setPk = (patch) => set({ pk: Object.assign({}, s.pk, patch) });
    const listUpd = (key, i, field) => (e) => { const a = s[key].map(x => (typeof x === 'object' ? Object.assign({}, x) : x)); if (field) a[i][field] = e.target.value; else a[i] = e.target.value; set({ [key]: a }); };
    const listRm = (key, i) => () => set({ [key]: s[key].filter((_, j) => j !== i) });
    const fromField = (field, key, make) => () => { const v = (s.f[field] || '').trim(); if (!v) return; set({ [key]: s[key].concat([make ? make(v) : v]), f: Object.assign({}, s.f, { [field]: '' }) }); };
    const onEnter = (fn) => (e) => { if (e.key === 'Enter') { e.preventDefault(); fn(); } };
    const deliv = s.deliv.map((d, i) => ({ type: d.type, setType: listUpd('deliv', i, 'type'), remove: listRm('deliv', i) }));
    const domains = s.domains.map((d, i) => ({ label: d, aria: 'Remove ' + d, remove: listRm('domains', i) }));
    const addDomain = fromField('domainIn', 'domains');
    // Visuals to avoid stay one comma-separated answer in f.avoidOther, which the server fill and exports read.
    const avoidList = (f.avoidOther || '').split(',').map(x => x.trim()).filter(Boolean);
    const setAvoid = (list, extra) => set({ f: Object.assign({}, s.f, { avoidOther: list.join(', ') }, extra) });
    const avoidVisuals = avoidList.map((label, i) => ({ label, aria: 'Remove ' + label, remove: () => setAvoid(avoidList.filter((_, j) => j !== i)) }));
    const addAvoid = () => { const v = (f.avoidIn || '').trim(); if (v) setAvoid(avoidList.concat([v]), { avoidIn: '' }); };
    const swap = (i, j) => () => { if (j < 0 || j >= s.votes.length) return; const a = s.votes.slice(); const t = a[i]; a[i] = a[j]; a[j] = t; set({ votes: a }); };
    const votes = s.votes.map((v, i) => ({ rank: (i + 1) + '.', label: v, up: swap(i, i - 1), down: swap(i, i + 1), upAria: 'Move ' + v + ' up', downAria: 'Move ' + v + ' down', aria: 'Remove ' + v, remove: listRm('votes', i) }));
    const taglines = s.taglines.map((t, i) => ({ text: t, set: listUpd('taglines', i), remove: listRm('taglines', i) }));
    const careChips = s.buyerCares.filter(c => !copy.cares.includes(c)).concat(copy.cares).map(label => Object.assign({ label, on: s.buyerCares.includes(label), toggle: toggleIn('buyerCares', label) }, on(s.buyerCares.includes(label))));
    const comps = s.comps.map((c, i) => ({ name: c.name, url: c.url, color: c.color || '', setName: listUpd('comps', i, 'name'), setUrl: listUpd('comps', i, 'url'), setColor: (e) => listUpd('comps', i, 'color')({ target: { value: e.target.value.toUpperCase() } }), remove: listRm('comps', i) }));
    const bannedChips = s.banned.map((w, i) => ({ label: w, aria: 'Remove ' + w, remove: listRm('banned', i) }));
    const addBanned = fromField('bannedIn', 'banned');
    const alts = s.alts.map((a, i) => ({ label: a, aria: 'Remove ' + a, remove: listRm('alts', i) }));
    const SUGG = ['Patagonia', 'Caterpillar', 'Teenage Engineering', 'Braun', 'Leica', 'Carhartt', 'Muji', 'Stripe'];
    const brandGroup = (key, field, title, inputId) => {
      const q = (s.f[field] || '').trim().toLowerCase();
      const sugg = q ? SUGG.filter(b => b.toLowerCase().includes(q) && !s[key].some(c => c.name === b)).slice(0, 4).map(b => ({ label: b, pick: () => set({ [key]: s[key].concat([{ name: b, why: '' }]), f: Object.assign({}, s.f, { [field]: '' }) }) })) : [];
      return { title, inputId, field, value: s.f[field], sugg, hasSugg: sugg.length > 0, add: fromField(field, key, v => ({ name: v, why: '' })),
        cards: s[key].map((b, i) => ({ name: b.name, why: b.why, aria: 'Remove ' + b.name, whyAria: 'Why ' + b.name, setWhy: listUpd(key, i, 'why'), remove: listRm(key, i) })) };
    };
    const brandGroups = [brandGroup('brandsA', 'brandAIn', 'Brands you admire, and why', 'f-ba')];
    const refCards = s.refs.map(label => {
      const avoid = s.refTags[label] === undefined ? label === 'Neon sign' : s.refTags[label];
      return Object.assign({ label, avoid, tag: avoid ? 'Avoid' : 'Admire', removeAria: 'Remove ' + label, toggle: () => set({ refTags: Object.assign({}, s.refTags, { [label]: !avoid }) }), remove: () => set({ refs: s.refs.filter(x => x !== label) }) }, on(avoid));
    });

    // [label, the answer as text, its step, the field to focus there]
    const core = [
      ['Working name', f.name, 1, 'f-name'], ['Company description', f.desc, 1, 'f-desc'], ['Domains secured', s.domains.join(', '), 1, 'f-domainIn'], ['Name meaning', f.meaning, 2, 'f-meaning'], ['Tone of the name', s.tone.join(', '), 4, 'f-toneIn'],
      ['Look and feel', Object.keys(s.looks).sort().map(k => lookPairs[k][s.looks[k]]).join(', '), 2], ['Colors or treatments to avoid', s.avoidC.concat(s.avoidT).join(', '), 2],
      ['Brands admired', s.brandsA.map(b => b.name).join(', '), 2, 'f-ba'], ['Core problem', f.problem, 3, 'f-problem'], ['Differentiation', f.diff, 3, 'f-diff']
    ];
    const missing = core.filter(c => blank(c[1])).length;
    // Refinements Generate would discard; followOv() itself only sets an empty lock and voiceV.
    const refined = s.comments.length > 0 || !!s.mixBase || s.ov.some(o => o && (Object.keys(o).some(k => k !== 'lock' && k !== 'voiceV') || Object.values(o.lock || {}).some(Boolean)));
    const checkRow = ([label, val, st, id], optional) => {
      const ok = !blank(val), quiet = ok || optional;
      return { label, preview: ok ? this.short(val, 60) : '', status: ok ? 'Answered' : optional ? 'Optional' : 'Missing', bg: quiet ? 'var(--color-grey-1)' : 'var(--color-ink)', fg: quiet ? 'var(--color-ink)' : '#FFFFFF',
        action: ok ? 'Edit' : 'Add', aria: (ok ? 'Edit ' : 'Add ') + label.toLowerCase(), go: () => goStep(st, () => { const el = id && document.getElementById(id); if (el) el.focus(); }) };
    };
    const coreChecks = core.map(c => checkRow(c)).concat([checkRow(['Visuals to avoid', f.avoidOther, 2, 'f-avoidIn'], true)]);

    const genLabels = ['Reading your answers', 'Locking what is decided', 'Generating three directions', 'Checking contrast and fonts', 'Pulling reference images'];
    const genSteps = genLabels.map((label, k) => ({ label, dot: k < s.genStep ? 'var(--color-action)' : (k === s.genStep ? 'var(--color-grey-2)' : 'var(--color-grey-1)'), fg: k <= s.genStep ? 'var(--color-ink)' : 'var(--color-grey-2)' }));

    // Directions start photo searches and downloads, so they're only built on the screens that show them.
    const cur = ['gen', 'out', 'meet', 'handoff'].includes(s.screen) ? this.current() : null;
    const OPT = cur ? this.opts() : [];
    const optTabs = OPT.map((o, k) => ({ label: k === 3 ? 'Your mix' : 'Option ' + (k + 1), name: k === 3 ? 'Custom direction' : o.name, rec: !!o.recommended, on: s.option === k, bd: s.option === k ? 'var(--color-action)' : 'transparent', bg: s.option === k ? '#FFFFFF' : 'transparent', fg: s.option === k ? 'var(--color-ink)' : 'var(--color-ink)', pick: () => set({ option: k, edit: null, draft: null, view: 'dir' }) }));

    const SECTION_IDS = ['word', 'palette', 'ui', 'type', 'refs', 'preview', 'voice'];
    const secNames = { word: 'Wordmark', palette: 'Palette', ui: 'UI primary', type: 'Typography', refs: 'Reference imagery', preview: 'Visualization', voice: 'Voice and tone' };
    const sec = {};
    SECTION_IDS.forEach(id => {
      const editing = s.edit === id;
      sec[id] = {
        editing, editLabel: editing ? 'Done' : 'Edit', editBg: editing ? 'var(--color-action)' : '#FFFFFF', editFg: editing ? '#FFFFFF' : 'var(--color-ink)',
        toggleEdit: () => set({ edit: editing ? null : id })
      };
    });

    const heights = ['40%', '65%', '50%', '85%', '60%', '75%', '45%'];
    const bars = (cur ? heights : []).map((h, k) => ({ h, c: k === 3 ? cur.accent : cur.primary }));
    const typeScale = cur && typeScaleOf(cur);
    const avoided = s.avoidC.filter(h => cur && cur.colors.some(c => c.show.toUpperCase() === h.toUpperCase()));
    const oi = s.option, myC = s.comments.filter(c => c.opt === oi);
    if (cur) Object.keys(sec).forEach(id => {
      const locked = !!cur.locks[id];
      Object.assign(sec[id], cur.lk(locked, secNames[id].toLowerCase()), {
        regenFg: locked ? 'var(--color-grey-2)' : 'var(--color-ink)', regenBd: 'var(--color-grey-1)',
        regen: () => locked ? this.showToast(secNames[id] + ' is locked. Unlock it to regenerate.') : this.doRegen([id]),
        toggleLock: () => {
          const o = this.state.ov[oi] || {};
          if (id === 'palette') { const v = !locked; this.setOvAt(oi, { swLock: cur.colors.map(() => v), hex: cur.colors.map(c => c.show), names: cur.colors.map(c => c.name) }); }
          else if (id === 'refs') this.setOvAt(oi, { images: cur.imgs.map(x => [x[0], x[1], !locked]) });
          else if (id === 'ui') this.setOvAt(oi, { uiFixed: locked ? null : cur.ui, uiMix: cur.uiMix });
          else this.setOvAt(oi, { lock: Object.assign({}, o.lock, { [id]: !locked }) });
        }
      });
    });
    const ST = { open: ['Open', 'var(--color-grey-1)', 'var(--color-ink)'], thinking: ['AI working', 'var(--color-grey-1)', 'var(--color-ink)'], proposed: ['Suggestion ready', '#FFFFFF', 'var(--color-ink)'], applied: ['Applied', 'var(--color-ink)', '#FFFFFF'] };
    const cm = {};
    const asked = (c) => !!this._asking && this._asking.has(s.projectId + ':' + c.id);
    const mkC = (c) => {
        const p = c.prop || {}, st = ST[c.status];
        return {
          num: c.num, label: c.label, text: c.text, status: st[0], stBg: st[1], stFg: st[2],
          canApply: c.status === 'open' || (c.status === 'thinking' && !asked(c)), thinking: c.status === 'thinking' && asked(c), proposed: c.status === 'proposed' && !!c.prop,
          summary: p.summary || '', isColors: p.kind === 'colors', isText: p.kind === 'text', isWord: p.kind === 'word', isImages: p.kind === 'images', isType: p.kind === 'type',
          swaps: p.swaps || [], typeRows: p.kind === 'type' ? [['Before', p.bType], ['After', p.aType]] : [], sample: p.sample || [],
          bSw: (p.before || []).map(hex => ({ hex })), aSw: (p.after || []).map(hex => ({ hex })), bText: p.bText || '', aText: p.aText || '',
          bFont: p.bFont || '', bTrack: p.bTrack || '', aFont: p.aFont || '', aTrack: p.aTrack || '',
          apply: () => this.applyAI(c.id), accept: () => this.accept(c.id),
          error: c.error || '', idle: c.status === 'thinking' && !asked(c) ? "This edit didn't finish." : '',
          // Rejected summaries go back to the AI, so "Try another version" proposes something else.
          reject: () => this.updComment(c.id, { status: 'open', prop: null, tries: (c.tries || 0) + 1, rejected: (c.rejected || []).concat(p.summary || []).slice(-3) }),
          isApplied: c.status === 'applied', where: secNames[c.sec] === c.label ? c.label : secNames[c.sec] + ' · ' + c.label, href: '#sec-' + c.sec,
          started: c.started || Date.now(), cancel: () => this.cancelAI(c.id),
          // Removing takes the request off the list; an applied change stays (Undo or Regenerate changes it).
          remove: () => { this.setState({ comments: this.state.comments.filter(x => x.id !== c.id) }); this.showToast(c.status === 'applied' ? 'Removed from the list. The change stays.' : 'Removed from the list.'); }
        };
    };
    SECTION_IDS.forEach(id => {
      const list = myC.filter(c => c.sec === id).map(mkC);
      cm[id] = { composing: !!(s.draft && s.draft.sec === id), has: list.length > 0, list };
    });
    const allCm = myC.map(mkC);
    const pinMap = { word: ['word', 'mark', 'Wordmark'], wordDark: ['word', 'dark', 'Wordmark on dark'], palUsage: ['palette', 'usage', 'Palette in use'], ui: ['ui', 'ui', 'UI primary'],
      typeDisplay: ['type', 'display', 'Header typeface'], typeBody: ['type', 'body', 'Body typeface'], preview: ['preview', 'preview', 'Product UI'], landing: ['preview', 'landing', 'Landing page'],
      voiceHead: ['voice', 'headline', 'Sample headline'], voiceTone: ['voice', 'tone', 'Interface copy'] };
    if (cur) [0, 1, 2, 3].forEach(k => { pinMap['img' + k] = ['refs', k, cur.imgs[k][0]]; });
    const pins = {}, pinSel = {}; Object.keys(pinMap).forEach(k => { const v = pinMap[k]; pins[k] = () => this.startComment(v[0], v[1], v[2]); pinSel[k] = this.isPicked(v[0], v[1]); });
    const pieces = {};
    Object.keys(pinMap).forEach(k => {
      const v = pinMap[k], img = v[0] === 'refs' ? cur.imageCards[v[1]] : null, canLock = v[0] !== 'preview';
      pieces[k] = { label: v[2], comment: pins[k], locked: img ? img.locked : canLock && sec[v[0]].locked,
        toggleLock: img ? img.pin : (canLock ? sec[v[0]].toggleLock : null), lockName: img ? v[2].toLowerCase() : secNames[v[0]].toLowerCase() };
    });
    const dItems = (s.draft && s.draft.items) || [];
    const draftItems = dItems.map(it => ({ label: secNames[it.sec] === it.label ? it.label : secNames[it.sec] + ' · ' + it.label, aria: 'Remove ' + it.label, remove: () => this.startComment(it.sec, it.target, it.label) }));
    const openN = myC.filter(c => c.status !== 'applied').length;

    const mp = s.mixPick, ROWS = [['word', 'Wordmark'], ['palette', 'Palette'], ['type', 'Type'], ['refs', 'Imagery'], ['voice', 'Voice']];
    const pickCell = (row, k) => { const onn = mp[row] === k; return { on: onn, label: onn ? 'Picked' : 'Use this', bg: onn ? 'var(--color-action)' : '#FFFFFF', fg: onn ? '#FFFFFF' : 'var(--color-ink)', pick: () => set({ mixPick: Object.assign({}, mp, { [row]: k }) }) }; };
    const cols = (cur ? [0, 1, 2] : []).map(k => {
      const d = this.optionData(k, true), pk = {}; ROWS.forEach(r => { pk[r[0]] = pickCell(r[0], k); });
      return Object.assign({}, d, { rec: d.recommended, imgTop: d.imageCards.slice(0, 3), open: () => set({ option: k, view: 'dir' }), pk });
    });
    const mixSummary = ROWS.map(r => r[1] + ' from Option ' + (mp[r[0]] + 1)).join(' · ');
    // On the mix, each part whose option has changed since the mix was made says so.
    const mixStale = {};
    if (s.option === 3) this.mixStale(cols).forEach(k => { mixStale[k] = 'Option ' + (s.mixBase.from.picks[k] + 1) + "'s " + secNames[k].toLowerCase() + ' has changed since you made this mix.'; });


    return {
      ...flowVals(this),
      ...projectVals(this),
      isStart: s.screen === 'start', isBrief: s.screen === 'brief', isGen: s.screen === 'gen', isOut: s.screen === 'out',
      toBrief: () => set({ screen: 'brief', step: 1 }),
      steps, stepNow: s.step, stepPct: (s.step / stepNames.length * 100) + '%', isS1: s.step === 1, isS2: s.step === 2, isS3: s.step === 3, isS4: s.step === 4, isS5: s.step === 5, notLast: s.step < 5,
      nextStep: () => goStep(Math.min(5, s.step + 1)),
      mockIntro: /^\[.*\]$/.test((f.desc || '').trim()) ? '' : this.short(f.desc, 180),
      // The person's own working tagline reads truer in the mockup hero than the archetype's sample headline.
      mockHeadline: this.short(s.taglines.find(t => (t || '').trim() && !/^\[.*\]$/.test(t.trim())), 80), briefDesc: this.short(f.desc, 280), briefProblem: this.short(f.problem, 280),
      banned: s.banned, bannedChips, addBanned, bannedKey: onEnter(addBanned),
      f, onField: (e) => { const k = e.target.name; set({ f: Object.assign({}, s.f, { [k]: e.target.value }) }); },
      // On each brief step's wrapper: a text answer loses its outer spaces when focus leaves it.
      trimField: (e) => { const k = e.target.name, v = s.f[k]; if (typeof v === 'string' && v !== v.trim()) set({ f: Object.assign({}, s.f, { [k]: v.trim() }) }); },
      avoidVisuals, avoidKey: onEnter(addAvoid),
      onSlider: (e) => { const k = e.target.name; set({ sl: Object.assign({}, s.sl, { [k]: Number(e.target.value) }) }); },
      deliv, addDeliv: () => set({ deliv: s.deliv.concat([{ type: 'Logo' }]) }),
      domains, domainKey: onEnter(addDomain), votes, addVote: fromField('voteIn', 'votes'),
      legalOpen: s.legalOpen, toggleLegal: () => set({ legalOpen: !s.legalOpen }), legalLabel: s.legalOpen ? 'Hide legal name' : 'Different legal name?',
      addTone: fromField('toneIn', 'tone'), toneHint: s.tone.length > 5 ? 'Three to five words give the clearest direction. More tend to cancel out.' : '', taglines, addTagline: () => set({ taglines: s.taglines.concat(['']) }),
      brandGroups, careChips, briefWords: copy, comps, compHint: s.comps.length > 5 ? 'Five main competitors are enough. Each one with a color narrows the palette.' : '', industries: INDUSTRIES, addComp: () => set({ comps: s.comps.concat([{ name: '', url: '' }]) }), alts, altKey: onEnter(fromField('altIn', 'alts')),
      endOn: s.endOn, endOff: !s.endOn, toggleEnd: () => set({ endOn: !s.endOn }), endLabel: s.endOn ? 'Included' : 'Add', endBg: s.endOn ? 'var(--color-action)' : '#FFFFFF', endFg: s.endOn ? '#FFFFFF' : 'var(--color-ink)',
      sigOpen: s.sigOpen, toggleSig: () => set({ sigOpen: !s.sigOpen }), sigLabel: s.sigOpen ? 'Hide early signals' : 'Add early signals of success (optional)',
      domainShown: s.domains[0] || 'yourname.com',
      toneChips, treatChips, lookPairs, sliders, avoidColors, keepColors, pk,
      // The generator builds on the first three keep colors only (seeds in generate.js).
      // Opens on a neutral grey, not whatever was last picked.
      openPicker: (mode = 'avoid') => setPk({ open: !(p.open && (p.mode || 'avoid') === mode), mode, text: null, h: 0, s: 0, l: 50 }), closePicker: () => setPk({ open: false }),
      pickWheel: (e) => {
        const r = e.currentTarget.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
        const sat = Math.min(100, Math.round(Math.sqrt(dx * dx + dy * dy) / (r.width / 2) * 100));
        const hue = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360);
        setPk({ h: hue, s: sat, text: null });
      },
      setPickL: (e) => setPk({ l: Number(e.target.value), text: null }),
      setPickHex: (e) => { const v = e.target.value; if (this.hexOk(v)) { const hsl = this.hex2hsl(v); setPk({ h: hsl[0], s: hsl[1], l: hsl[2], text: v }); } else { setPk({ text: v }); } },
      addPicked: () => {
        if (p.text && !this.hexOk(p.text)) return; // The button is disabled too; this covers Enter.
        const h = (p.text && this.hexOk(p.text)) ? p.text.toUpperCase() : pHex, key = p.mode === 'keep' ? 'keepC' : 'avoidC', list = s[key] || [];
        set({ [key]: list.includes(h) ? list : list.concat([h]), pk: Object.assign({}, s.pk, { open: false, text: null }) });
      },
      // The hosted build hides the four sample photos until real uploads exist; local demo keeps them.
      refsAdded: s.refs.length > 0, addRefs: accounts.canFill ? null : () => set({ refs: ['Corten steel', 'Sand dune', 'Industrial stair', 'Neon sign'] }), refCards,
      coreChecks, hasMissing: missing > 0, genBg: missing > 0 ? 'var(--color-grey-2)' : 'var(--color-action)',
      readyText: missing > 0 ? (missing === 1 ? '1 required answer is missing' : missing + ' required answers are missing') + '. Generation unlocks when every required answer has something, even rough.' : 'Every required answer is filled. You are ready to generate.',
      fillSample: () => { const smp = this.sampleState(); const nf = Object.assign({}, smp.f); Object.keys(s.f).forEach(k => { if (s.f[k]) nf[k] = s.f[k]; }); const patch = { f: nf }; Object.keys(smp).forEach(k => { if (k === 'f') return; const cur = s[k]; const empty = Array.isArray(cur) ? cur.length === 0 : (cur && typeof cur === 'object' ? Object.keys(cur).length === 0 : !cur); if (empty) patch[k] = smp[k]; }); set(patch); },
      generate: () => {
        if (missing > 0) return;
        set({ screen: 'gen', genStep: 0, dirs: null }); clearInterval(this._g);
        this._g = setInterval(() => { const n = this.state.genStep + 1; if (n > 4) { clearInterval(this._g); const rec = this.generated().recommended || 0; this.setState({ screen: 'out', option: rec, mixPick: { word: rec, palette: rec, type: rec, refs: rec, voice: rec }, ov: this.followOv(), mixBase: null, comments: [], view: 'dir', draft: null, darkPrev: false, cmode: false, meeting: Object.assign({}, this.state.meeting, { marks: {}, notice: null, agreedRound: null }) }); } else { this.setState({ genStep: n }); } }, 650);
      },
      genSteps,
      backToBrief: () => set({ screen: 'brief', step: 5 }),
      // The stored directions remember the answers they came from, so this also works after a reload.
      canReturn: (s.dirs ? s.dirs.in : this._genIn) === this.genInputs(), backToResults: () => set({ screen: 'out' }), genLoses: refined,
      // Stored directions made from other answers: still viewable, but Generate is what brings them up to date.
      oldDirs: !!s.dirs && s.dirs.in !== this.genInputs(), hasMix: !!s.mixBase,
      startOver: () => { clearInterval(this._g); clearTimeout(this._t); this.setState(Object.assign(JSON.parse(JSON.stringify(this._init)), { screen: 'welcome', user: s.user, projectId: s.projectId, projects: s.projects, saveStatus: s.saveStatus })); },
      optTabs, allMenu: s.allMenu, toggleAll: () => set({ allMenu: !s.allMenu }),
      cur, wordUpper: (f.name || 'Name').toUpperCase(),
      // A wordmark never breaks inside a word: it shrinks until its longest word fits its box (a .word-box
      // parent). 0.8em is a wide capital letter. Spacing is in em, so it shrinks with the letters, and the
      // same space is added in front, since spacing trails every letter and would pull the word off centre.
      wordFit: (px, trackPx) => { const n = Math.max(...(f.name || 'Name').trim().split(/\s+/).map(w => w.length)), t = (parseFloat(trackPx) || 0) / px, em = t.toFixed(3) + 'em'; return { fontSize: `min(${px}px, calc(100cqi / ${(n * (0.8 + t) + t).toFixed(2)}))`, letterSpacing: em, paddingLeft: em, textAlign: 'center', overflowWrap: 'normal' }; },
      whyTitle: s.option === 3 ? 'About your custom mix' : (cur && cur.recommended ? 'Why we recommend Option ' + (s.option + 1) : 'How Option ' + (s.option + 1) + ' compares to the recommendation'),
      matchLabel: s.option === 3 ? 'Built from' : 'Matches your brief on',
      // The fonts in use lead the list: a select whose value isn't among its options shows the first option instead.
      sec, fonts: [...new Set([...(cur ? [cur.wordFont, cur.display, cur.body] : []), 'Anta', 'Oxanium', 'Chakra Petch', 'Archivo Black', 'Archivo', 'Barlow', 'IBM Plex Sans', 'Work Sans'])],
      setWordFont: (e) => this.lockOv('word', 'Wordmark', { wordFont: e.target.value, track: cur.track }), setTrack: (e) => this.lockOv('word', 'Wordmark', { track: Number(e.target.value), wordFont: cur.wordFont }),
      setUiMix: (e) => { const v = Number(e.target.value); this.handEdit(s.option, 'ui', 'UI primary', { uiMix: v, uiFixed: this.mix(cur.accent, v / 100) }); },
      setDisplay: (e) => this.lockOv('type', 'Typography', { display: e.target.value, body: cur.body }), setBody: (e) => this.lockOv('type', 'Typography', { body: e.target.value, display: cur.display }),
      avoidNote: avoided.length ? 'Warning: ' + avoided.join(', ') + ' is on your avoid list.' : '',
      bars, typeScale, hasToast: !!s.toast, toast: s.toast,
      hasUndo: !!(s.undo && s.toast),
      doUndo: () => {
        const u = s.undo; if (!u) return;
        const ov = s.ov.slice(); ov[u.i] = u.prev; const patch = { ov, toast: '', undo: null };
        if (u.meeting) { patch.meeting = u.meeting; patch.screen = 'meet'; }
        if (u.cid) patch.comments = s.comments.map(c => c.id === u.cid ? Object.assign({}, c, { status: 'proposed' }) : c);
        clearTimeout(this._t); set(patch);
      },
      isDir: s.view === 'dir', isCmp: s.view === 'cmp', 
      viewDir: () => set({ view: 'dir' }), viewCmp: () => set({ view: 'cmp', edit: null, draft: null }),
      vDirBg: s.view === 'dir' ? 'var(--color-action)' : 'transparent', vDirFg: s.view === 'dir' ? '#FFFFFF' : 'var(--color-ink)',
      vCmpBg: s.view === 'cmp' ? 'var(--color-action)' : 'transparent', vCmpFg: s.view === 'cmp' ? '#FFFFFF' : 'var(--color-ink)',
      darkPrev: s.darkPrev, toggleDark: () => set({ darkPrev: !s.darkPrev }),
      darkBg: s.darkPrev ? 'var(--color-action)' : '#FFFFFF', darkFg: s.darkPrev ? '#FFFFFF' : 'var(--color-ink)',
      bentoBg: s.darkPrev && cur ? cur.light : 'transparent', bentoPad: s.darkPrev ? '14px' : '0',
      cmode: s.cmode, toggleCmode: () => set({ cmode: !s.cmode, draft: null }),
      cmBg: s.cmode ? 'var(--color-action)' : '#FFFFFF', cmFg: s.cmode ? '#FFFFFF' : 'var(--color-ink)',
      cmodeLabel: 'AI edits' + (openN ? ' · ' + openN : ''),
      regenAll: () => this.doRegen(['word', 'palette', 'type', 'refs', 'voice']),
      cm, pins, pinSel, pieces, allCm, draftItems, hasDraftItems: dItems.length > 0, noDraftItems: dItems.length === 0,
      panelPad: s.cmode ? '380px' : '0', cmCount: myC.length === 1 ? '1 edit' : myC.length + ' edits',
      draft: s.draft || { items: [], text: '' },
      sendBg: dItems.length && s.draft && s.draft.text.trim() ? 'var(--color-action)' : 'var(--color-grey-2)',
      setDraft: (e) => set({ draft: Object.assign({ items: [] }, s.draft, { text: e.target.value }) }),
      cancelDraft: () => set({ draft: { items: [], text: '' } }),
      postComment: () => {
        const d = s.draft || { items: [], text: '' };
        if (!d.items.length) { this.showToast('Click a piece of the moodboard to add it first.'); return; }
        if (!d.text.trim()) { this.showToast('Say what you want changed.'); return; }
        let id = s.cid;
        const last = myC.reduce((n, c) => Math.max(n, c.num || 0), 0); // Counting would repeat a number once one is removed from the list.
        const add = d.items.map((it, k) => { id++; return { id, num: last + k + 1, opt: oi, sec: it.sec, target: it.target, label: it.label, text: d.text.trim(), status: 'thinking', tries: 0, started: Date.now() }; });
        set({ comments: s.comments.concat(add), cid: id, draft: { items: [], text: '' } });
        // Marked as asked right away, so they read "working" while they wait their turn.
        const asking = this._asking || (this._asking = new Map());
        add.forEach((c, k) => {
          const key = s.projectId + ':' + c.id;
          asking.set(key, null);
          // One cancelled while it waited its turn is not sent.
          setTimeout(() => { if (this.state.projectId === s.projectId && asking.has(key)) this.applyAI(c.id); else asking.delete(key); }, k * 450);
        });
      },
      cols, mixSummary, mixBtn: s.mixBase ? 'Update your mix' : 'Create custom direction', createMix: () => this.createMix(),
      mixStale, updateMix: () => this.createMix(s.mixBase.from.picks),
      // Last, so the hosted build's brief-review values replace the local ones (fillSample).
      ...materialVals(this)
    };
  }

  render() {
    return <Root vm={this.renderVals()} />;
  }
}
