import { Component } from "react";
import Root from "../screens/Root.jsx";
import { ALL_SECTIONS, typeScaleOf } from "./exports.js";
import { flowVals, newMeeting } from "./flow.js";

export default class BrandApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: 'splash', path: 'brief', step: 1, imported: false, confirmed: false,
      f: this.blankF(), tone: [], looks: {}, sl: { warmth: 50, energy: 50, serious: 50 },
      avoidC: [], avoidT: [], brandsA: [], brandsX: [], deliv: [], domains: [], votes: [], taglines: [], buyerCares: [], comps: [], alts: [],
      refs: [], refTags: {}, legalOpen: false, endOn: false, sigOpen: false,
      pk: { open: false, h: 280, s: 70, l: 30, text: null },
      genStep: 0, option: 0, edit: null, allMenu: false, toast: '', undo: null, ov: [{}, {}, {}],
      arts: [], view: 'dir', darkPrev: false, cmode: false, comments: [], draft: null, cid: 0,
      mixPick: { word: 0, palette: 0, type: 0, refs: 0, voice: 0 }, mixBase: null, keep: 40, opinion: '', oRec: null,
      meeting: newMeeting(), handoffFile: 'claude', printSel: ALL_SECTIONS, exportSel: ALL_SECTIONS, exportFormat: 'pdf'
    };
    this.state.vRec = null; this.state.vDone = {}; this.state.showT = false;
    this._init = JSON.parse(JSON.stringify(this.state));
  }
  blankF() {
    const keys = ['name', 'legal', 'desc', 'domainIn', 'voteIn', 'meaning', 'toneIn', 'lookNote', 'avoidOther', 'brandAIn', 'brandXIn', 'buyerRole', 'mot', 'success', 'opRole', 'opTeam', 'opCares', 'endWho', 'endCares',
      'problem', 'short', 'altIn', 'diff', 'diffWhy', 'outcomes', 'switchTo', 'value', 'emo', 'wedge', 'wedgeWhy', 'feel', 'diffFeel', 'jWhen', 'jWant', 'jSo', 'wfStart', 'wfAha', 'wfSuccess', 'sigReact', 'sigEasier', 'site'];
    const o = { who: 'operator' }; keys.forEach(k => { o[k] = ''; }); return o;
  }
  sampleState() {
    const f = Object.assign(this.blankF(), {
      name: 'Ferra', desc: '[Company description from your brief: what it does and for whom]', meaning: 'Fe, iron: strength that holds under load.',
      buyerRole: '[Buyer role]', mot: '[What motivates them to purchase]', success: '[How they define success]', opRole: '[Operator role]', opTeam: '[Function or team]', opCares: '[What they care about]',
      problem: '[The problem your brief describes]', short: '[Why current solutions fall short]', diff: '[What makes you different]', diffWhy: '[Why this matters]',
      outcomes: '[Outcomes users want]', switchTo: '[What would make them switch]', value: '[Primary value]', emo: '[Secondary or emotional value]',
      jWhen: '[situation]', jWant: '[motivation]', jSo: '[outcome]'
    });
    return {
      f, tone: ['Sturdy', 'Industrial', 'Precise'], looks: { 0: 'a', 1: 'b', 2: 'b', 3: 'b' }, sl: { warmth: 35, energy: 45, serious: 70 },
      avoidC: ['#5A136A'], avoidT: ['Gradients', 'Neon'],
      brandsA: [{ name: '[Brand you admire]', why: '[Why]' }], brandsX: [{ name: '[Brand to avoid resembling]', why: '' }],
      deliv: [{ type: 'Logo' }, { type: 'Website' }], domains: ['ferra.example'], votes: ['Ferra', '[Alternate name]'],
      taglines: ['[Working tagline]'], buyerCares: ['ROI', 'Reliability'], comps: [{ name: '[Competitor]', url: '' }], alts: ['[Current workaround]']
    };
  }
  componentWillUnmount() { clearInterval(this._g); clearInterval(this._v); clearTimeout(this._t); clearTimeout(this._a); clearInterval(this._o); }

  voiceData(n) {
    const smp = this.sampleState(), sf = smp.f;
    const pickF = (keys) => { const o = {}; keys.forEach(k => { o[k] = sf[k]; }); return o; };
    if (n === 1) return {
      section: 'the basics', prompts: ['What you are calling it', 'What it does and for whom', 'What you need', 'Domains you secured', 'Names the team likes'],
      transcript: 'Okay, so the working name is Ferra, like iron. It is [what the company does] for [who it is for]. We secured ferra dot example. We need a logo and a website. The team likes Ferra best, and [an alternate name] came second.',
      items: [{ label: 'Working name', f: pickF(['name']) }, { label: 'Company description', f: pickF(['desc']) }, { label: 'Domains secured', x: { domains: smp.domains } },
        { label: 'Deliverables', x: { deliv: smp.deliv } }, { label: 'Name preferences', x: { votes: smp.votes } }]
    };
    if (n === 2) return {
      section: 'your brand', prompts: ['Where the name comes from', 'How it should look and feel', 'Brands you admire or want to avoid', 'Colors and styles to stay away from', 'Any taglines'],
      transcript: 'Ferra comes from Fe, the symbol for iron, so strength that holds under load. It should feel sturdy, industrial, and precise. Warm rather than cold, clean and minimal, more serious than playful. We like [a brand we admire] because [why]. We do not want to look like [a brand to avoid]. No gradients, no neon, and stay away from purple. A working tagline is [working tagline].',
      items: [{ label: 'Name meaning', f: pickF(['meaning']) }, { label: 'Tone of the name', x: { tone: smp.tone } }, { label: 'Look and feel', x: { looks: smp.looks } },
        { label: 'Emotional tone', x: { sl: smp.sl }, force: true }, { label: 'Colors to avoid', x: { avoidC: smp.avoidC } }, { label: 'Treatments to avoid', x: { avoidT: smp.avoidT } },
        { label: 'Brands admired', x: { brandsA: smp.brandsA } }, { label: 'Brands to avoid', x: { brandsX: smp.brandsX } }, { label: 'Taglines', x: { taglines: smp.taglines } }]
    };
    if (n === 3) return {
      section: 'your customer', prompts: ['Who buys it and who uses it', 'The problem and who feels it most', 'Competitors and workarounds', 'What makes you different'],
      transcript: 'The buyer is usually [buyer role]. They care about ROI and reliability, and they buy because [motivation]. The day-to-day user is [operator role] on the [team] team. The problem is [the problem today], and operators feel it most. Right now people get by with [a workaround] or [a competitor], which fall short because [reason]. What makes us different is [differentiator], and that matters because [why].',
      items: [{ label: 'Economic buyer', f: pickF(['buyerRole', 'mot', 'success']) }, { label: 'What the buyer cares about', x: { buyerCares: smp.buyerCares } },
        { label: 'Operational user', f: pickF(['opRole', 'opTeam', 'opCares']) }, { label: 'Core problem', f: pickF(['problem', 'short']) },
        { label: 'Competitors', x: { comps: smp.comps } }, { label: 'Alternatives', x: { alts: smp.alts } },
        { label: 'Differentiation', f: pickF(['diff', 'diffWhy']) }, { label: 'Audience motivation', f: pickF(['outcomes', 'switchTo']) }]
    };
    return {
      section: 'your product', prompts: ['The main value it delivers', 'What gets people to try it', 'How it should feel to use', 'A typical day using it'],
      transcript: 'The main value is [primary value], and it should make people feel [emotional value]. People will try it first for [the wedge feature], because [why it beats alternatives]. Using it should feel [how it feels end to end]. A typical day starts with [situation], the aha moment is [aha moment], and success looks like [outcome].',
      items: [{ label: 'Value', f: { value: sf.value, emo: sf.emo } }, { label: 'Wedge feature', f: { wedge: '[Feature that gets users to try it]', wedgeWhy: '[Why it beats alternatives]' } },
        { label: 'Product feel', f: { feel: '[How it should feel end to end]', diffFeel: '[What should feel different]' } },
        { label: 'Job to be done', f: pickF(['jWhen', 'jWant', 'jSo']) },
        { label: 'Workflow', f: { wfStart: '[Where users start]', wfAha: '[The aha moment]', wfSuccess: '[What success looks like]' } }]
    };
  }
  applyVoice(n) {
    const s = this.state, d = this.voiceData(n), nf = Object.assign({}, s.f), patch = {}, filled = [], prev = { f: s.f };
    d.items.forEach(it => {
      let did = false;
      Object.keys(it.f || {}).forEach(k => { if (!nf[k]) { nf[k] = it.f[k]; did = true; } });
      Object.keys(it.x || {}).forEach(k => {
        const cur = s[k];
        const empty = it.force || (Array.isArray(cur) ? cur.length === 0 : (cur && typeof cur === 'object' ? Object.keys(cur).length === 0 : !cur));
        if (empty) { prev[k] = cur; patch[k] = it.x[k]; did = true; }
      });
      if (did) filled.push(it.label);
    });
    patch.f = nf; patch.vRec = null;
    patch.vDone = Object.assign({}, s.vDone, { [n]: { filled, prev } });
    this.setState(patch);
  }

  hexOk(h) { return /^#[0-9a-fA-F]{6}$/.test(h || ''); }
  rgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
  lum(h) { const c = this.rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  ratio(a, b) { const l1 = this.lum(a), l2 = this.lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  mix(h, t) { const c = this.rgb(h).map(v => Math.round(v * (1 - t))); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase(); }
  minMix(h) { for (let t = 0; t <= 0.9; t += 0.01) { if (this.ratio(this.mix(h, t), '#FFFFFF') >= 4.5) return Math.round(t * 100); } return 90; }
  hsl2hex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
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
    if (/dark|deep|rich/.test(t)) { l -= 10; hit = true; }
    if (/bright|bold|vivid|pop|punch/.test(t)) { s += 15; hit = true; }
    if (/mute|soft|calm|dull|subtle|tone it down/.test(t)) { s -= 15; hit = true; }
    if (!hit) return null;
    return this.hsl2hex(h, Math.max(0, Math.min(100, s)), Math.max(4, Math.min(96, l)));
  }

  opts() {
    const ROLES = ['Primary', 'Surface', 'Neutral dark', 'Neutral light', 'Accent'];
    const P = (rows, r) => rows.map((x, k) => [x[0], x[1], ROLES[k], r[k]]);
    const R0 = [30, 40, 15, 5, 10], R2 = [25, 45, 15, 5, 10];
    const list = [
      { name: 'Forged warmth', wordFont: 'Anta', track: 6, display: 'Oxanium', body: 'Barlow', accentIdx: 4,
        colors: P([['Iron', '#3E1F0E'], ['Sand', '#D8CFC4'], ['Graphite', '#2B2B2B'], ['Khaki', '#CFC3A6'], ['Signal amber', '#F5A623']], R0),
        alt: [P([['Oxide', '#4A2412'], ['Dune', '#E2D6C6'], ['Charcoal', '#262626'], ['Bone', '#EFE8DC'], ['Ember', '#E8892B']], R0),
          P([['Bronze', '#5A3519'], ['Clay', '#D9C7B0'], ['Soot', '#1F1F1F'], ['Linen', '#F2ECE2'], ['Brass', '#D9A441']], R0)],
        words: [['Oxanium', 5], ['Chakra Petch', 4]], types: [['Chakra Petch', 'Barlow'], ['Oxanium', 'IBM Plex Sans']],
        tone: [['Sturdy', 'heavy'], ['Direct', 'blunt'], ['Precise', 'cold']], headline: 'Built for the load you carry.', micro: 'Saved. Your changes are live.',
        voices: [{ tone: [['Steady', 'slow'], ['Plain-spoken', 'curt'], ['Exact', 'fussy']], headline: 'Strength you can count on.', micro: 'Done. Everything held.' },
          { tone: [['Grounded', 'stiff'], ['Confident', 'loud'], ['Clear', 'cold']], headline: 'Made to hold.', micro: 'Saved. Nothing lost.' }],
        images: [['Rusted metal', 'Unsplash'], ['Sand ripples', 'Are.na'], ['Steel lattice', 'Unsplash'], ['Container yard', 'Are.na'], ['Desert texture', 'Unsplash'], ['Rowing crew', 'Unsplash']],
        imgPool: [['Forged steel', 'Unsplash'], ['Cast iron', 'Are.na'], ['Dune shadows', 'Unsplash'], ['Weld seam', 'Are.na'], ['Ochre wall', 'Unsplash'], ['Quarry', 'Unsplash']],
        reason: 'This is the closest match to your brief. The iron brown and the squared Anta wordmark carry "sturdy" and "industrial," the sand surface keeps the warmth your tone sliders leaned toward, and nothing in it uses the gradients or neon on your avoid list. The amber accent is tuned down to a UI primary that passes AA contrast for button text.',
        match: ['Sturdy', 'Industrial', 'Precise', 'Leans warm', 'No gradients or neon'],
        tradeoff: 'Signal amber is loud at full strength, so keep it to accents and use the tuned shade for buttons and links.' },
      { name: 'Cool alloy', wordFont: 'Chakra Petch', track: 4, display: 'Chakra Petch', body: 'IBM Plex Sans', accentIdx: 4,
        colors: P([['Slate', '#1F2A33'], ['Mist', '#E3E7EA'], ['Steel', '#5B6B78'], ['Frost', '#F5F7F8'], ['Rust', '#C8553D']], R0),
        alt: [P([['Navy steel', '#1B2838'], ['Fog', '#E6EAEE'], ['Gunmetal', '#4E5A66'], ['Ice', '#F4F6F8'], ['Copper', '#B8643E']], R0),
          P([['Graphite blue', '#232C35'], ['Cloud', '#DDE3E8'], ['Pewter', '#6A7682'], ['Snow', '#F7F9FA'], ['Signal red', '#C24A3A']], R0)],
        words: [['IBM Plex Sans', 3], ['Oxanium', 2]], types: [['IBM Plex Sans', 'IBM Plex Sans'], ['Oxanium', 'Work Sans']],
        tone: [['Calm', 'passive'], ['Clear', 'clinical'], ['Exact', 'rigid']], headline: 'Clarity at every step.', micro: 'All set. Nothing else needed.',
        voices: [{ tone: [['Measured', 'dull'], ['Lucid', 'sterile'], ['Calm', 'distant']], headline: 'See every step clearly.', micro: 'Up to date. Nothing needs you.' },
          { tone: [['Precise', 'rigid'], ['Quiet', 'passive'], ['Direct', 'abrupt']], headline: 'Less noise. More signal.', micro: 'All clear.' }],
        images: [['Brushed steel', 'Unsplash'], ['Turbine blades', 'Unsplash'], ['Concrete wall', 'Are.na'], ['Wire mesh', 'Are.na'], ['Fog over water', 'Unsplash'], ['Machined parts', 'Unsplash']],
        imgPool: [['Aluminum panel', 'Unsplash'], ['Glass facade', 'Are.na'], ['Overcast harbor', 'Unsplash'], ['Blueprint', 'Are.na'], ['Server aisle', 'Unsplash'], ['Steel cable', 'Unsplash']],
        reason: 'This option matches "precise" best and reads the clearest of the three. It ranks second because it is cooler than the warmth your sliders asked for, and slate and steel are the most expected colors for an industrial brand, so it does less to stand apart.',
        match: ['Precise', 'Industrial', 'No gradients or neon'],
        tradeoff: 'Strong for product UI, weaker as a memorable brand. Warming the surface toward sand would close the gap with your brief.' },
      { name: 'Raw ground', wordFont: 'Archivo Black', track: 2, display: 'Archivo', body: 'Work Sans', accentIdx: 4,
        colors: P([['Rust', '#9C3D1F'], ['Sand', '#E8DCC8'], ['Ink', '#161616'], ['Paper', '#F7F3EC'], ['Olive', '#6B6A3A']], R2),
        alt: [P([['Terracotta', '#A4472A'], ['Oat', '#EADFCB'], ['Bark', '#1C1A17'], ['Chalk', '#F6F1E8'], ['Moss', '#5E6B3A']], R2),
          P([['Brick', '#8E3A22'], ['Wheat', '#E3D3B5'], ['Coal', '#141414'], ['Cream', '#F8F2E6'], ['Sage', '#7A7D52']], R2)],
        words: [['Archivo', 3], ['Work Sans', 4]], types: [['Archivo Black', 'Work Sans'], ['Archivo', 'Barlow']],
        tone: [['Grounded', 'rough'], ['Honest', 'plain'], ['Bold', 'loud']], headline: 'Made from the ground up.', micro: 'Done. On to the next one.',
        voices: [{ tone: [['Earthy', 'rustic'], ['Warm', 'soft'], ['Bold', 'brash']], headline: 'Rooted in the real.', micro: 'Nice work. That is done.' },
          { tone: [['Honest', 'blunt'], ['Hands-on', 'messy'], ['Solid', 'heavy']], headline: 'Built by hand, built to last.', micro: 'Done and dusted.' }],
        images: [['Raw clay', 'Are.na'], ['Weathered wood', 'Unsplash'], ['Stone slab', 'Unsplash'], ['Rust bloom', 'Are.na'], ['Dry riverbed', 'Unsplash'], ['Hand tools', 'Unsplash']],
        imgPool: [['Sun-dried brick', 'Unsplash'], ['Linen weave', 'Are.na'], ['Clay pots', 'Unsplash'], ['Olive grove', 'Unsplash'], ['Sandstone', 'Are.na'], ['Wood grain', 'Unsplash']],
        reason: 'This is the most distinctive and earthy option, with the heaviest wordmark. It ranks third because it fits "sturdy" but not "precise," and the weight leans toward a lifestyle brand more than an industrial one.',
        match: ['Sturdy', 'Leans warm', 'No gradients or neon'],
        tradeoff: 'Memorable, but the furthest from "precise." Pairing it with a lighter wordmark would bring it closer to the brief.' }
    ].map(o => Object.assign(o, {
      palettes: [o.colors].concat(o.alt), words: [[o.wordFont, o.track]].concat(o.words), types: [[o.display, o.body]].concat(o.types),
      voices: [{ tone: o.tone, headline: o.headline, micro: o.micro }].concat(o.voices)
    }));
    if (this.state.mixBase) list.push(this.state.mixBase);
    return list;
  }

  artDefs() {
    return {
      brief: { name: 'Ferra_brand_brief.docx', kind: 'DOC', detail: 'Brand brief · 36 answers found', def: 'follow',
        fol: 'Its answers fill the brief and are marked Imported. You confirm them.', ctx: 'Its answers show as Suggested drafts. Check each one before you generate.', short: '' },
      logo: { name: 'ferra-logo-draft.png', kind: 'PNG', detail: 'Logo draft · colors found:', swatches: ['#3E1F0E', '#D8CFC4'], def: 'follow',
        fol: 'Every option keeps this wordmark style (closest typeface: Anta) and Iron #3E1F0E as the primary. Both start locked.', ctx: 'Its colors and letterforms steer the options, but each option can move away from them.', short: 'the Anta wordmark and Iron #3E1F0E from your logo' },
      deck: { name: 'pitch-deck-v3.pdf', kind: 'PDF', detail: 'Pitch deck · 14 slides · body set in IBM Plex Sans', def: 'context',
        fol: 'Every option sets body text in IBM Plex Sans, and typography starts locked.', ctx: 'We read it for positioning and audience. Its fonts and colors are not reused.', short: 'IBM Plex Sans from your deck' },
      mood: { name: 'mood-shots (4 images)', kind: 'IMG', detail: 'Mood images', def: 'context',
        fol: 'Your images lead the reference imagery in every option, locked.', ctx: 'They guide the image searches. Your files are not shown on the moodboard.', short: 'your mood images' },
      call: { name: 'kickoff-call-transcript.txt', kind: 'TXT', detail: 'Meeting transcript · 42 min', def: 'context',
        fol: 'Decisions said on the call fill the brief as Imported.', ctx: 'We pull suggestions from the call. You decide what to keep.', short: 'decisions from the kickoff call' }
    };
  }
  aspectDefs() {
    return {
      brief: [['audience', 'Audience', 'who it is for'], ['tone', 'Tone words', 'how it should feel'], ['refs', 'Brand references', 'brands it names']],
      logo: [['colors', 'Colors', 'Iron and Sand'], ['letters', 'Letterforms', 'squared and geometric'], ['mark', 'Icon shape', 'the anvil mark']],
      deck: [['fonts', 'Fonts', 'IBM Plex Sans'], ['colors', 'Colors', 'navy and white'], ['layout', 'Layouts', 'slide structure'], ['msg', 'Messaging', 'how it pitches']],
      mood: [['colors', 'Colors', 'rust and sand tones'], ['texture', 'Textures', 'metal, sand, concrete'], ['subjects', 'Subjects', 'people at work']],
      call: [['tone', 'How the founders talk', 'plain and direct'], ['decisions', 'Decisions', 'things agreed on the call']]
    };
  }
  keepBand() { const v = this.state.keep; return v < 25 ? 0 : v < 50 ? 1 : v < 75 ? 2 : 3; }
  heard() {
    const t = (this.state.opinion || '').toLowerCase(), prefs = {}, said = [];
    t.split(/[.;!?,]|\bbut\b|\band\b/).forEach(cl => {
      cl = cl.trim(); if (!cl) return;
      const neg = /(don't|dont|do not|\bnot\b|\bno\b|avoid|hate|too |change|lose|ditch|drop|bit dark|off)/.test(cl);
      const pos = !neg && /(like|love|keep|want|good|great|fine|works|close)/.test(cl);
      if (!neg && !pos) return;
      const v = neg ? 'avoid' : 'like', tops = [];
      if (/colou?r|brown|palette|tone|warm/.test(cl)) tops.push([['logo.colors', 'mood.colors'], 'the colors']);
      if (/letter|wordmark|lettering/.test(cl)) tops.push([['logo.letters'], 'the letterforms']);
      if (/font|typeface|\btype\b/.test(cl)) tops.push([['deck.fonts'], 'the deck fonts']);
      if (/photo|image|picture|mood|texture/.test(cl)) tops.push([['mood.texture'], 'the images']);
      if (/icon|symbol|anvil|\bmark\b/.test(cl)) tops.push([['logo.mark'], 'the icon']);
      tops.forEach(tp => { tp[0].forEach(k => { prefs[k] = v; }); const w = (v === 'like' ? 'keep ' : 'change ') + tp[1]; if (!said.includes(w)) said.push(w); });
    });
    return { prefs, said };
  }
  pref(id, key) { if (!this.state.arts.some(x => x.id === id) || this.artRole(id) !== 'context' || this.keepBand() === 3) return undefined; return this.heard().prefs[id + '.' + key]; }
  artRole(id) {
    if (!this.state.arts.some(x => x.id === id)) return null;
    const b = this.keepBand();
    if (id === 'brief') return b < 3 ? 'follow' : 'context';
    if (id === 'logo' || id === 'deck' || id === 'mood') return b === 0 ? 'follow' : 'context';
    return 'context';
  }
  followOv() {
    const ov = [{}, {}, {}];
    const logo = this.artRole('logo') === 'follow', deck = this.artRole('deck') === 'follow', mood = this.artRole('mood') === 'follow';
    const base = this.opts();
    ov.forEach((o, i) => {
      const lock = {};
      if (logo) { o.wordFont = 'Anta'; lock.word = true; o.hex = [ '#3E1F0E', null, null, null, null ]; o.names = ['Iron']; o.swLock = [true]; }
      if (deck) { o.body = 'IBM Plex Sans'; lock.type = true; }
      if (mood) { o.images = base[i].images.map((x, k) => k < 2 ? ['Your image ' + (k + 1), 'Your upload', true] : [x[0], x[1], false]); }
      if (!logo && this.pref('logo', 'colors') === 'like') { o.hex = ['#3E1F0E', null, null, null, null]; o.names = ['Iron']; }
      if (!logo && this.pref('logo', 'letters') === 'like') o.wordFont = 'Anta';
      if (!logo && this.pref('logo', 'letters') === 'avoid') { const w = base[i].words.findIndex(x => x[0] !== 'Anta'); if (base[i].words[0][0] === 'Anta') o.wordV = w; }
      if (!deck && this.pref('deck', 'fonts') === 'like') o.body = 'IBM Plex Sans';
      if (!deck && this.pref('deck', 'fonts') === 'avoid') { const t = base[i].types.findIndex(x => x[1] !== 'IBM Plex Sans' && x[0] !== 'IBM Plex Sans'); if (base[i].types[0].includes('IBM Plex Sans')) o.typeV = t; }
      o.lock = lock;
    });
    return ov;
  }

  setOvAt(i, patch) { const ov = this.state.ov.slice(); while (ov.length <= i) ov.push({}); ov[i] = Object.assign({}, ov[i], patch); this.setState({ ov }); }
  setOv(patch) { this.setOvAt(this.state.option, patch); }
  lockOv(mod, patch) { const ov = this.state.ov[this.state.option] || {}; this.setOv(Object.assign({}, patch, { lock: Object.assign({}, ov.lock, { [mod]: true }) })); }
  showToast(msg, undo) {
    clearTimeout(this._t);
    this.setState({ toast: msg, undo: undo || null, allMenu: false });
    this._t = setTimeout(() => this.setState({ toast: '', undo: null }), undo ? 6000 : 2600);
  }

  regenPatch(i, mod, ov) {
    const base = this.opts()[i], lock = ov.lock || {};
    if (mod === 'palette') {
      const sw = ov.swLock || [], L = base.palettes.length, pv = ov.palV || 0, curPal = base.palettes[pv % L];
      if ([0, 1, 2, 3, 4].every(k => sw[k])) return null;
      const hex = [0, 1, 2, 3, 4].map(k => sw[k] ? ((ov.hex && ov.hex[k] != null) ? ov.hex[k] : curPal[k][1]) : null);
      const names = [0, 1, 2, 3, 4].map(k => sw[k] ? ((ov.names && ov.names[k]) || curPal[k][0]) : null);
      const p = { palV: (pv + 1) % L, hex, names };
      if (!ov.uiFixed) p.uiMix = null;
      return p;
    }
    if (mod === 'word') { if (lock.word) return null; return { wordV: ((ov.wordV || 0) + 1) % base.words.length, wordFont: null, track: null }; }
    if (mod === 'type') { if (lock.type) return null; return { typeV: ((ov.typeV || 0) + 1) % base.types.length, display: null, body: null }; }
    if (mod === 'voice') { if (lock.voice) return null; return { voiceV: ((ov.voiceV || 0) + 1) % base.voices.length, tone: null, headline: null }; }
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
      return { images: imgs, imgN: n };
    }
    return null;
  }
  doRegen(mods) {
    const s = this.state, i = s.option, prev = s.ov[i] || {};
    let ov = Object.assign({}, prev); const done = [], kept = [];
    const NM = { word: 'wordmark', palette: 'palette', type: 'typography', refs: 'imagery', voice: 'voice' };
    mods.forEach(m => { const p = this.regenPatch(i, m, ov); if (p) { ov = Object.assign({}, ov, p); done.push(NM[m]); } else kept.push(NM[m]); });
    if (!done.length) { this.showToast('Everything is locked. Unlock a section to regenerate it.'); return; }
    const all = s.ov.slice(); while (all.length <= i) all.push({}); all[i] = ov;
    this.setState({ ov: all });
    const name = this.opts()[i].name;
    this.showToast('New ' + done.join(', ') + ' within ' + name + '.' + (kept.length ? ' Kept locked: ' + kept.join(', ') + '.' : ''), { i, prev });
  }

  optionData(i) {
    const s = this.state, O = this.opts(), base = O[i], ov = s.ov[i] || {}, lock = ov.lock || {}, dk = !!s.darkPrev;
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
      pinC: pin('palette', k, names[k]), pinAria: 'Add ' + names[k] + ' to precise editing', picked: this.isPicked('palette', k),
      setHex: (e) => { const h = hexes.slice(); h[k] = e.target.value; const l = swLock.slice(); l[k] = true; this.setOvAt(i, { hex: h, swLock: l }); },
      toggleLock: () => { const l = swLock.slice(); l[k] = !l[k]; const h = hexes.slice(); const nm = names.slice(); this.setOvAt(i, { swLock: l, hex: h, names: nm }); }
    }, lk(swLock[k], names[k])));
    const at = (role) => base.palettes[0].findIndex(c => c[2] === role);
    const primaryO = shown[at('Primary')], surfaceO = shown[at('Surface')], lightO = shown[at('Neutral light')];
    const darkIdx = shown.reduce((m, h, k) => this.lum(h) < this.lum(shown[m]) ? k : m, 0), darkO = shown[darkIdx];
    const accent = shown[base.accentIdx], accentName = names[base.accentIdx];
    const uiMix = ov.uiMix != null ? ov.uiMix : this.minMix(accent);
    const ui = ov.uiFixed || this.mix(accent, uiMix / 100), uiR = this.ratio(ui, '#FFFFFF');
    const T = dk
      ? { light: darkO, surface: this.tint(darkO, 0.1), primary: surfaceO, ink: lightO, deep: this.mix(darkO, 0.35), card: this.tint(darkO, 0.14), onDeep: surfaceO, onPrimary: darkO }
      : { light: lightO, surface: surfaceO, primary: primaryO, ink: darkO, deep: darkO, card: '#FFFFFF', onDeep: surfaceO, onPrimary: '#FFFFFF' };
    const wv = base.words[(ov.wordV || 0) % base.words.length], tv = base.types[(ov.typeV || 0) % base.types.length], vv = base.voices[(ov.voiceV || 0) % base.voices.length];
    const wordFont = ov.wordFont || wv[0], track = ov.track != null ? ov.track : wv[1];
    const display = ov.display || tv[0], body = ov.body || tv[1];
    const toneArr = ov.tone || vv.tone, headline = ov.headline || vv.headline;
    const tone = toneArr.map((t, k) => ({
      yes: t[0], no: t[1], editing: s.edit === 'voice' && s.option === i,
      setYes: (e) => { const tt = toneArr.map(x => x.slice()); tt[k][0] = e.target.value; this.setOvAt(i, { tone: tt, lock: Object.assign({}, lock, { voice: true }) }); },
      setNo: (e) => { const tt = toneArr.map(x => x.slice()); tt[k][1] = e.target.value; this.setOvAt(i, { tone: tt, lock: Object.assign({}, lock, { voice: true }) }); }
    }));
    const imgs = ov.images || base.images.map(x => [x[0], x[1], false]);
    const imageCards = imgs.map((im, k) => ({
      label: im[0], source: im[1], locked: !!im[2], pinBd: im[2] ? 'var(--color-action)' : 'var(--color-grey-1)',
      pinC: pin('refs', k, im[0]), pinAria: 'Add ' + im[0] + ' to precise editing', picked: this.isPicked('refs', k),
      swap: () => {
        const pool = base.imgPool.concat(base.images); let n = ov.imgN || 0, p = pool[n % pool.length], g = 0;
        while (imgs.some(x => x[0] === p[0]) && g < pool.length) { n++; p = pool[n % pool.length]; g++; }
        const nn = imgs.map(x => x.slice()); nn[k] = [p[0], p[1], true]; this.setOvAt(i, { images: nn, imgN: n + 1 });
      },
      pin: () => { const nn = imgs.map(x => x.slice()); nn[k][2] = !nn[k][2]; this.setOvAt(i, { images: nn }); }
    }));
    const lightName = names[at('Neutral light')], surfName = names[at('Surface')];
    const linkColor = !dk ? ui : (this.ratio(accent, T.light) >= 4.5 ? accent : this.tint(ui, 0.45));
    return Object.assign({
      i, label: i === 3 ? 'Your mix' : 'Option ' + (i + 1), name: base.name, wordFont, track, trackPx: track + 'px', display, body,
      displayPkg: this.pkg(display), bodyPkg: this.pkg(body), colors, palNames: names.join(', '),
      darkName: names[darkIdx], darkO, accent, accentName,
      accentText: this.ratio(accent, T.deep) >= 4.5 ? accent : (dk ? lightO : '#FFFFFF'),
      onAccent: this.ratio(darkO, accent) >= this.ratio('#FFFFFF', accent) ? darkO : '#FFFFFF',
      ui, uiMix, uiHover: this.mix(ui, 0.15), uiRatio: uiR.toFixed(2), uiDarkRatio: this.ratio(ui, darkO).toFixed(2), linkColor,
      passLabel: uiR >= 4.5 ? 'Passes AA' : 'Fails AA', passBg: uiR >= 4.5 ? 'var(--color-ink)' : 'var(--color-coral)',
      darkRoles: [{ role: 'Background', name: names[darkIdx] }, { role: 'Text', name: lightName }, { role: 'Wordmark and headings', name: surfName }, { role: 'Buttons', name: 'UI primary' }],
      tone, toneArr, headline, micro: vv.micro, reason: base.reason, match: base.match, tradeoff: base.tradeoff,
      imgs, imageCards, img0: imgs[0][0], img1: imgs[1][0], img2: imgs[2][0], img3: imgs[3][0], word: (this.state.f.name || 'Name').toUpperCase(),
      locks: { word: !!lock.word, palette: [0, 1, 2, 3, 4].every(k => swLock[k]), ui: !!ov.uiFixed, type: !!lock.type, voice: !!lock.voice, refs: imgs.every(x => x[2]) },
      lk
    }, T);
  }
  current() { return this.optionData(this.state.option); }

  printDirection(sections) {
    this.setState({ printSel: sections, allMenu: false }, () => window.print());
  }

  startComment(sec, target, label) {
    const d = this.state.draft || { items: [], text: '' }, items0 = d.items || [];
    const has = items0.some(x => x.sec === sec && x.target === target);
    const items = has ? items0.filter(x => !(x.sec === sec && x.target === target)) : items0.concat([{ sec, target, label }]);
    this.setState({ draft: Object.assign({}, d, { items }), cmode: true, edit: null });
  }
  isPicked(sec, target) { const d = this.state.draft; return !!(d && d.items && d.items.some(x => x.sec === sec && x.target === target)); }
  updComment(id, patch) { this.setState({ comments: this.state.comments.map(c => c.id === id ? Object.assign({}, c, patch) : c) }); }
  applyAI(id) {
    this.updComment(id, { status: 'thinking' });
    this._a = setTimeout(() => { const c = this.state.comments.find(x => x.id === id); if (!c) return; this.updComment(id, { status: 'proposed', prop: this.propose(c) }); }, 1100);
  }
  accept(id) {
    const c = this.state.comments.find(x => x.id === id); if (!c || !c.prop) return;
    const prev = this.state.ov[c.opt] || {};
    this.setOvAt(c.opt, c.prop.patch);
    this.updComment(id, { status: 'applied' });
    this.showToast('Comment ' + c.num + ' applied and locked.', { i: c.opt, prev, cid: id });
  }
  propose(c) {
    const i = c.opt, base = this.opts()[i], ov = this.state.ov[i] || {}, lock = ov.lock || {}, d = this.optionData(i), t = this.norm(c.text), n = c.tries || 0;
    const words = (t.match(/warm|cool|light|dark|bright|bold|mute|soft|deep|vivid|calm/g) || []).map(w => w === 'mute' ? 'muted' : w).filter((x, k, a) => a.indexOf(x) === k);
    if (c.sec === 'palette' || c.sec === 'preview') {
      const before = d.colors.map(x => x.show), after = before.slice(), swLock = (ov.swLock || []).slice();
      const targets = typeof c.target === 'number' ? [c.target] : [0, 1, 2, 3, 4].filter(k => !swLock[k]);
      const nextPal = base.palettes[((ov.palV || 0) + 1 + n) % base.palettes.length];
      targets.forEach(k => { after[k] = this.adjust(before[k], t) || nextPal[k][1]; swLock[k] = true; });
      const what = typeof c.target === 'number' ? d.colors[c.target].name : (targets.length === 5 ? 'the whole palette' : 'the unlocked colors');
      const how = words.length ? 'shifted ' + what + ' to read ' + words.join(' and ') + '.' : 'swapped ' + what + ' for the next shade that stays within ' + base.name + '.';
      return { kind: 'colors', summary: 'You asked: "' + c.text + '". I ' + how + ' Changed colors will be locked.', before, after,
        patch: { hex: after, names: d.colors.map(x => x.name), swLock } };
    }
    if (c.sec === 'ui') {
      const step = /light|bright|soft/.test(t) ? -10 : 10, m = Math.max(0, Math.min(80, d.uiMix + step * (n + 1))), hex = this.mix(d.accent, m / 100);
      return { kind: 'colors', summary: (step > 0 ? 'Darkened' : 'Lightened') + ' the UI primary. White text contrast goes from ' + d.uiRatio + ':1 to ' + this.ratio(hex, '#FFFFFF').toFixed(2) + ':1.',
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
        return { kind: 'text', summary: 'Swapped the body face for one with more open letterforms at small sizes.', bText: 'Body: ' + d.body, aText: 'Body: ' + nb,
          patch: { body: nb, lock: Object.assign({}, lock, { type: true }) } };
      }
      const tp = base.types[((ov.typeV || 0) + 1 + n) % base.types.length];
      return { kind: 'text', summary: 'Tried the next type pairing within ' + base.name + '.', bText: d.display + ' with ' + d.body, aText: tp[0] + ' with ' + tp[1],
        patch: { display: tp[0], body: tp[1], lock: Object.assign({}, lock, { type: true }) } };
    }
    if (c.sec === 'refs') {
      const imgs = d.imgs.map(x => x.slice()), pool = base.imgPool.concat(base.images); let k2 = ov.imgN || 0;
      const targets = typeof c.target === 'number' ? [c.target] : imgs.map((x, k) => k).filter(k => !imgs[k][2]);
      const bl = targets.map(k => imgs[k][0]);
      targets.forEach(k => { let p = pool[k2 % pool.length], g = 0; while (imgs.some(x => x[0] === p[0]) && g < pool.length) { k2++; p = pool[k2 % pool.length]; g++; } imgs[k] = [p[0], p[1], true]; k2++; });
      return { kind: 'text', summary: 'Replaced ' + bl.length + (bl.length === 1 ? ' image' : ' images') + ' with searches closer to your note.', bText: bl.join(', '), aText: targets.map(k => imgs[k][0]).join(', '),
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
  createMix() {
    const s = this.state, mp = s.mixPick, O = this.opts();
    const dd = [0, 1, 2].map(k => this.optionData(k));
    const ROLES = ['Primary', 'Surface', 'Neutral dark', 'Neutral light', 'Accent'];
    const uniq = (a) => a.filter((x, k) => a.findIndex(y => JSON.stringify(y) === JSON.stringify(x)) === k);
    const pd = dd[mp.palette], wd = dd[mp.word], td = dd[mp.type], vd = dd[mp.voice], rd = dd[mp.refs];
    const palNow = pd.colors.map((c, k) => [c.name, c.show, ROLES[k], c.ratio]);
    const L = (k) => 'Option ' + (k + 1);
    const mixBase = {
      name: 'Your mix', accentIdx: 4,
      palettes: [palNow].concat(O[mp.palette].palettes.filter(pl => pl.some((c, k) => !pd.colors[k].locked && c[1] !== palNow[k][1]))), words: uniq([[wd.wordFont, wd.track]].concat(O[mp.word].words)),
      types: uniq([[td.display, td.body]].concat(O[mp.type].types)), voices: uniq([{ tone: vd.toneArr, headline: vd.headline, micro: vd.micro }].concat(O[mp.voice].voices)),
      images: rd.imgs.map(x => [x[0], x[1]]), imgPool: O[mp.refs].imgPool,
      reason: 'Your own combination: the wordmark from ' + L(mp.word) + ', the palette from ' + L(mp.palette) + ', typography from ' + L(mp.type) + ', imagery from ' + L(mp.refs) + ', and the voice from ' + L(mp.voice) + '. Regenerating a section stays within the direction that piece came from.',
      match: ['Wordmark · ' + L(mp.word), 'Palette · ' + L(mp.palette), 'Type · ' + L(mp.type), 'Imagery · ' + L(mp.refs), 'Voice · ' + L(mp.voice)],
      tradeoff: 'Pieces from different directions can clash. Check the UI preview and the moodboard to see them together.'
    };
    const ov = s.ov.slice(0, 3); while (ov.length < 3) ov.push({});
    ov[3] = { swLock: pd.colors.map(c => c.locked), uiFixed: pd.locks.ui ? pd.ui : null, images: rd.imgs.map(x => x.slice()),
      lock: { word: wd.locks.word, type: td.locks.type, voice: vd.locks.voice } };
    this.setState({ mixBase, ov, option: 3, view: 'dir', edit: null });
    this.showToast('Created your custom direction. It is now the Your mix tab.');
  }

  renderVals() {
    const s = this.state, f = s.f;
    const set = (patch) => this.setState(patch);
    const toggleIn = (key, v) => () => { const a = s[key]; set({ [key]: a.includes(v) ? a.filter(x => x !== v) : a.concat([v]) }); };
    const on = (b) => b ? { bg: 'var(--color-action)', fg: '#FFFFFF' } : { bg: '#FFFFFF', fg: 'var(--color-ink)' };


    const stepNames = ['General', 'Branding', 'Customer', 'Extra info', 'Review'];
    const steps = stepNames.map((label, k) => {
      const n = k + 1;
      return { label, current: s.step === n ? 'step' : undefined, pick: () => set({ step: n }) };
    });

    const toneChips = (s.tone.filter(t => !['Sturdy', 'Industrial', 'Precise', 'Warm', 'Playful', 'Calm', 'Bold', 'Minimal'].includes(t))).concat(['Sturdy', 'Industrial', 'Precise', 'Warm', 'Playful', 'Calm', 'Bold', 'Minimal']).map(label => Object.assign({ label, on: s.tone.includes(label), toggle: toggleIn('tone', label) }, on(s.tone.includes(label))));
    const treatChips = ['Gradients', 'Neon', 'All caps', 'Drop shadows', 'Pill buttons'].map(label => Object.assign({ label, on: s.avoidT.includes(label), toggle: toggleIn('avoidT', label) }, on(s.avoidT.includes(label))));
    const lookPairs = [['Warm', 'Cool'], ['Serif', 'Sans'], ['Ornate', 'Minimal'], ['Soft', 'Geometric']].map(([a, b], k) => ({
      a, b, onA: s.looks[k] === 'a', onB: s.looks[k] === 'b', bdA: s.looks[k] === 'a' ? 'var(--color-action)' : 'var(--color-grey-1)', bdB: s.looks[k] === 'b' ? 'var(--color-action)' : 'var(--color-grey-1)',
      pickA: () => set({ looks: Object.assign({}, s.looks, { [k]: 'a' }) }), pickB: () => set({ looks: Object.assign({}, s.looks, { [k]: 'b' }) })
    }));
    const sliders = [['warmth', 'Warm', 'Professional'], ['energy', 'Calm', 'Energetic'], ['serious', 'Playful', 'Serious']].map(([key, l, r]) => ({ key, l, r, val: s.sl[key], aria: l + ' to ' + r }));
    const avoidColors = s.avoidC.map(hex => ({ hex, aria: 'Remove ' + hex + ' from the avoid list', remove: () => set({ avoidC: s.avoidC.filter(x => x !== hex) }) }));
    const p = s.pk, pHex = this.hsl2hex(p.h, p.s, p.l), rad = p.h * Math.PI / 180;
    const pk = { open: p.open, l: p.l, hex: pHex, hexText: p.text !== null ? p.text : pHex,
      x: (50 + Math.sin(rad) * p.s / 2).toFixed(1) + '%', y: (50 - Math.cos(rad) * p.s / 2).toFixed(1) + '%' };
    const setPk = (patch) => set({ pk: Object.assign({}, s.pk, patch) });
    const listUpd = (key, i, field) => (e) => { const a = s[key].map(x => (typeof x === 'object' ? Object.assign({}, x) : x)); if (field) a[i][field] = e.target.value; else a[i] = e.target.value; set({ [key]: a }); };
    const listRm = (key, i) => () => set({ [key]: s[key].filter((_, j) => j !== i) });
    const fromField = (field, key, make) => () => { const v = (s.f[field] || '').trim(); if (!v) return; set({ [key]: s[key].concat([make ? make(v) : v]), f: Object.assign({}, s.f, { [field]: '' }) }); };
    const onEnter = (fn) => (e) => { if (e.key === 'Enter') { e.preventDefault(); fn(); } };
    const deliv = s.deliv.map((d, i) => ({ type: d.type, setType: listUpd('deliv', i, 'type'), remove: listRm('deliv', i) }));
    const domains = s.domains.map((d, i) => ({ label: d, aria: 'Remove ' + d, remove: listRm('domains', i) }));
    const addDomain = fromField('domainIn', 'domains');
    const swap = (i, j) => () => { if (j < 0 || j >= s.votes.length) return; const a = s.votes.slice(); const t = a[i]; a[i] = a[j]; a[j] = t; set({ votes: a }); };
    const votes = s.votes.map((v, i) => ({ rank: (i + 1) + '.', label: v, up: swap(i, i - 1), down: swap(i, i + 1), upAria: 'Move ' + v + ' up', downAria: 'Move ' + v + ' down', aria: 'Remove ' + v, remove: listRm('votes', i) }));
    const toneAll = ['Sturdy', 'Industrial', 'Precise', 'Warm', 'Playful', 'Calm', 'Bold', 'Minimal'];
    s.tone.forEach(t => { if (!toneAll.includes(t)) toneAll.push(t); });
    const taglines = s.taglines.map((t, i) => ({ text: t, set: listUpd('taglines', i), remove: listRm('taglines', i) }));
    const careChips = ['ROI', 'Growth', 'Efficiency', 'Reliability', 'Cost', 'Risk'].map(label => Object.assign({ label, on: s.buyerCares.includes(label), toggle: toggleIn('buyerCares', label) }, on(s.buyerCares.includes(label))));
    const comps = s.comps.map((c, i) => ({ name: c.name, url: c.url, setName: listUpd('comps', i, 'name'), setUrl: listUpd('comps', i, 'url'), remove: listRm('comps', i) }));
    const alts = s.alts.map((a, i) => ({ label: a, aria: 'Remove ' + a, remove: listRm('alts', i) }));
    const SUGG = ['Patagonia', 'Caterpillar', 'Teenage Engineering', 'Braun', 'Leica', 'Carhartt', 'Muji', 'Stripe'];
    const brandGroup = (key, field, title, inputId) => {
      const q = (s.f[field] || '').trim().toLowerCase();
      const sugg = q ? SUGG.filter(b => b.toLowerCase().includes(q) && !s[key].some(c => c.name === b)).slice(0, 4).map(b => ({ label: b, pick: () => set({ [key]: s[key].concat([{ name: b, why: '' }]), f: Object.assign({}, s.f, { [field]: '' }) }) })) : [];
      return { title, inputId, field, value: s.f[field], sugg, hasSugg: sugg.length > 0, add: fromField(field, key, v => ({ name: v, why: '' })),
        cards: s[key].map((b, i) => ({ name: b.name, why: b.why, aria: 'Remove ' + b.name, whyAria: 'Why ' + b.name, setWhy: listUpd(key, i, 'why'), remove: listRm(key, i) })) };
    };
    const brandGroups = [brandGroup('brandsA', 'brandAIn', 'Brands you admire, and why', 'f-ba'), brandGroup('brandsX', 'brandXIn', 'Brands to avoid resembling, and why', 'f-bx')];
    const refCards = s.refs.map(label => {
      const avoid = s.refTags[label] === undefined ? label === 'Neon sign' : s.refTags[label];
      return Object.assign({ label, avoid, tag: avoid ? 'Avoid' : 'Admire', removeAria: 'Remove ' + label, toggle: () => set({ refTags: Object.assign({}, s.refTags, { [label]: !avoid }) }), remove: () => set({ refs: s.refs.filter(x => x !== label) }) }, on(avoid));
    });

    const core = [
      ['Working name', !!f.name, 1], ['Company description', !!f.desc, 1], ['Domains secured', s.domains.length > 0, 1], ['Name meaning', !!f.meaning, 2], ['Tone of the name', s.tone.length > 0, 2],
      ['Look and feel', Object.keys(s.looks).length > 0, 2], ['Colors or treatments to avoid', s.avoidC.length + s.avoidT.length > 0, 2],
      ['Brands admired', s.brandsA.length > 0, 2], ['Core problem', !!f.problem, 3], ['Differentiation', !!f.diff, 3]
    ];
    const missing = core.filter(c => !c[1]).length;
    const coreChecks = core.map(([label, ok, st]) => ({ label, status: ok ? 'Answered' : 'Missing', bg: ok ? 'var(--color-grey-1)' : 'var(--color-ink)', fg: ok ? 'var(--color-ink)' : '#FFFFFF', go: () => set({ step: st }) }));

    const genLabels = ['Reading your answers', 'Locking what is decided', 'Generating three directions', 'Checking contrast and fonts', 'Pulling reference images'];
    const genSteps = genLabels.map((label, k) => ({ label, dot: k < s.genStep ? 'var(--color-action)' : (k === s.genStep ? 'var(--color-grey-2)' : 'var(--color-grey-1)'), fg: k <= s.genStep ? 'var(--color-ink)' : 'var(--color-grey-2)' }));

    const cur = this.current();
    const OPT = this.opts();
    const optTabs = OPT.map((o, k) => ({ label: k === 3 ? 'Your mix' : 'Option ' + (k + 1), name: k === 3 ? 'Custom direction' : o.name, rec: k === 0, on: s.option === k, bd: s.option === k ? 'var(--color-action)' : 'transparent', bg: s.option === k ? '#FFFFFF' : 'transparent', fg: s.option === k ? 'var(--color-ink)' : 'var(--color-ink)', pick: () => set({ option: k, edit: null, draft: null, view: 'dir' }) }));

    const SECTION_IDS = ['word', 'palette', 'ui', 'type', 'refs', 'preview', 'voice'];
    const secNames = { word: 'Wordmark', palette: 'Palette', ui: 'UI primary', type: 'Typography', refs: 'Reference imagery', preview: 'UI preview', voice: 'Voice and tone' };
    const sec = {};
    SECTION_IDS.forEach(id => {
      const editing = s.edit === id;
      sec[id] = {
        editing, editLabel: editing ? 'Done' : 'Edit', editBg: editing ? 'var(--color-action)' : '#FFFFFF', editFg: editing ? '#FFFFFF' : 'var(--color-ink)',
        toggleEdit: () => set({ edit: editing ? null : id })
      };
    });

    const heights = ['40%', '65%', '50%', '85%', '60%', '75%', '45%'];
    const bars = heights.map((h, k) => ({ h, c: k === 3 ? cur.accent : cur.primary }));
    const typeScale = typeScaleOf(cur);
    const VD = s.step <= 4 ? this.voiceData(s.step) : null;
    const vWords = VD ? VD.transcript.split(' ') : [];
    const vRec = !!(s.vRec && s.vRec.step === s.step);
    const vDone = vRec ? null : s.vDone[s.step];
    const voice = {
      show: s.screen === 'brief' && s.step <= 4, idle: !vRec && !vDone, rec: vRec, done: !!vDone,
      section: VD ? VD.section : '', startAria: VD ? 'Start talking through ' + VD.section : 'Start talking',
      prompts: VD ? VD.prompts : [], live: vRec ? (vWords.slice(0, s.vRec.shown).join(' ') || 'Start talking…') : '',
      transcript: VD ? VD.transcript : '', filled: vDone ? vDone.filled.map(l => ({ label: l })) : [],
      doneText: vDone ? (vDone.filled.length ? 'Filled ' + vDone.filled.length + ' answers from what you said. Check them below.' : 'Everything you mentioned was already filled in.') : '',
      showT: s.showT, tLabel: s.showT ? 'Hide what you said' : 'Show what you said'
    };
    const startVoice = () => {
      clearInterval(this._v); set({ vRec: { step: s.step, shown: 0 }, showT: false });
      this._v = setInterval(() => {
        const r = this.state.vRec; if (!r) { clearInterval(this._v); return; }
        const total = this.voiceData(r.step).transcript.split(' ').length;
        if (r.shown >= total) { clearInterval(this._v); return; }
        this.setState({ vRec: { step: r.step, shown: r.shown + 2 } });
      }, 140);
    };
    const stopVoice = () => { clearInterval(this._v); this.applyVoice(s.step); };
    const cancelVoice = () => { clearInterval(this._v); set({ vRec: null }); };
    const undoVoice = () => { const dn = s.vDone[s.step]; if (!dn) return; const patch = Object.assign({}, dn.prev); const vd = Object.assign({}, s.vDone); delete vd[s.step]; patch.vDone = vd; set(patch); };
    const toggleT = () => set({ showT: !s.showT });
    const avoided = s.avoidC.filter(h => cur.colors.some(c => c.show.toUpperCase() === h.toUpperCase()));
    const oi = s.option, myC = s.comments.filter(c => c.opt === oi);
    Object.keys(sec).forEach(id => {
      const locked = !!cur.locks[id];
      Object.assign(sec[id], cur.lk(locked, secNames[id].toLowerCase()), {
        regenFg: locked ? 'var(--color-grey-2)' : 'var(--color-ink)', regenBd: 'var(--color-grey-1)',
        regen: () => locked ? this.showToast(secNames[id] + ' is locked. Unlock it to regenerate.') : this.doRegen([id]),
        toggleLock: () => {
          const o = this.state.ov[oi] || {};
          if (id === 'palette') { const v = !locked; this.setOvAt(oi, { swLock: [v, v, v, v, v], hex: cur.colors.map(c => c.show), names: cur.colors.map(c => c.name) }); }
          else if (id === 'refs') this.setOvAt(oi, { images: cur.imgs.map(x => [x[0], x[1], !locked]) });
          else if (id === 'ui') this.setOvAt(oi, { uiFixed: locked ? null : cur.ui, uiMix: cur.uiMix });
          else this.setOvAt(oi, { lock: Object.assign({}, o.lock, { [id]: !locked }) });
        }
      });
    });
    const ST = { open: ['Open', 'var(--color-grey-1)', 'var(--color-ink)'], thinking: ['AI working', 'var(--color-grey-1)', 'var(--color-ink)'], proposed: ['Suggestion ready', '#FFFFFF', 'var(--color-ink)'], applied: ['Applied', 'var(--color-ink)', '#FFFFFF'] };
    const cm = {};
    const mkC = (c) => {
        const p = c.prop || {}, st = ST[c.status];
        return {
          num: c.num, label: c.label, text: c.text, status: st[0], stBg: st[1], stFg: st[2],
          canApply: c.status === 'open', thinking: c.status === 'thinking', proposed: c.status === 'proposed' && !!c.prop,
          summary: p.summary || '', isColors: p.kind === 'colors', isText: p.kind === 'text', isWord: p.kind === 'word',
          bSw: (p.before || []).map(hex => ({ hex })), aSw: (p.after || []).map(hex => ({ hex })), bText: p.bText || '', aText: p.aText || '',
          bFont: p.bFont || '', bTrack: p.bTrack || '', aFont: p.aFont || '', aTrack: p.aTrack || '',
          apply: () => this.applyAI(c.id), accept: () => this.accept(c.id),
          reject: () => this.updComment(c.id, { status: 'open', prop: null, tries: (c.tries || 0) + 1 }),
          isApplied: c.status === 'applied', where: secNames[c.sec] === c.label ? c.label : secNames[c.sec] + ' · ' + c.label, href: '#sec-' + c.sec
        };
    };
    SECTION_IDS.forEach(id => {
      const list = myC.filter(c => c.sec === id).map(mkC);
      cm[id] = { composing: !!(s.draft && s.draft.sec === id), has: list.length > 0, list };
    });
    const allCm = myC.map(mkC);
    const pinMap = { word: ['word', 'mark', 'Wordmark'], wordDark: ['word', 'dark', 'Wordmark on dark'], palUsage: ['palette', 'usage', 'Palette in use'], ui: ['ui', 'ui', 'UI primary'],
      typeDisplay: ['type', 'display', 'Header typeface'], typeBody: ['type', 'body', 'Body typeface'], preview: ['preview', 'preview', 'UI preview'],
      voiceHead: ['voice', 'headline', 'Sample headline'], voiceTone: ['voice', 'tone', 'Interface copy'] };
    [0, 1, 2, 3].forEach(k => { pinMap['img' + k] = ['refs', k, cur.imgs[k][0]]; });
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
    const cols = [0, 1, 2].map(k => {
      const d = this.optionData(k), pk = {}; ROWS.forEach(r => { pk[r[0]] = pickCell(r[0], k); });
      return Object.assign({}, d, { rec: k === 0, imgTop: d.imageCards.slice(0, 3), open: () => set({ option: k, view: 'dir' }), pk });
    });
    const mixSummary = ROWS.map(r => r[1] + ' from Option ' + (mp[r[0]] + 1)).join(' · ');

    const AD = this.artDefs();
    const setRole = (id, role) => set({ arts: s.arts.map(a => a.id === id ? Object.assign({}, a, { role }) : a) });
    const updArt = (id, patch) => set({ arts: s.arts.map(a => a.id === id ? Object.assign({}, a, patch) : a) });
    const ASP = this.aspectDefs();
    const STARTERS = [['I like the', 'I like the '], ["I don't want the", "I don't want the "], ['Keep', 'Keep '], ['Ignore', 'Ignore ']];
    const PH = { brief: 'For example: the audience section is outdated, use the call instead.', logo: "For example: I like the colors, but the letters feel too techy.",
      deck: "For example: I like the confident headlines, I don't want the navy.", mood: "For example: I like the warm light in the photos, I don't want people in them.",
      call: 'For example: only use what the founders agreed on in the last ten minutes.' };
    const prefSum = (a) => {
      const like = [], avoid = []; (ASP[a.id] || []).forEach(x => { const v = (a.asp || {})[x[0]]; if (v === 'like') like.push(x[1].toLowerCase()); if (v === 'avoid') avoid.push(x[1].toLowerCase()); });
      const parts = []; if (like.length) parts.push('lean into its ' + like.join(' and ')); if (avoid.length) parts.push('stay away from its ' + avoid.join(' and '));
      return { like, avoid, text: parts.join(', and ') };
    };
    const arts = s.arts.map(a => {
      const d = AD[a.id], fo = a.role === 'follow';
      return { name: d.name, kind: d.kind, detail: d.detail, swatches: (d.swatches || []).map(hex => ({ hex })),
        isF: fo, isC: !fo, fBg: fo ? 'var(--color-action)' : 'transparent', fFg: fo ? '#FFFFFF' : 'var(--color-ink)', cBg: !fo ? 'var(--color-action)' : 'transparent', cFg: !fo ? '#FFFFFF' : 'var(--color-ink)',
        effect: fo ? d.fol : d.ctx, roleAria: 'How to use ' + d.name, removeAria: 'Remove ' + d.name,
        aspects: (ASP[a.id] || []).map(x => {
          const cur = (a.asp || {})[x[0]] || 'neutral';
          return { label: x[1], hint: x[2], aria: x[1] + ' from ' + d.name,
            choices: [['like', 'Like'], ['neutral', 'Neutral'], ['avoid', 'Avoid']].map(c => ({ label: c[1], on: cur === c[0], bg: cur === c[0] ? 'var(--color-action)' : 'transparent', fg: cur === c[0] ? '#FFFFFF' : 'var(--color-ink)',
              pick: () => updArt(a.id, { asp: Object.assign({}, a.asp, { [x[0]]: c[0] }) }) })) };
        }),
        noteId: 'note-' + a.id, note: a.note || '', placeholder: PH[a.id] || '',
        setNote: (e) => updArt(a.id, { note: e.target.value }),
        starters: STARTERS.map(t => ({ label: t[0], add: () => { const n = (a.note || '').trim(); updArt(a.id, { note: (n ? n + (/[.!?]$/.test(n) ? ' ' : ', ') : '') + (n ? t[1].charAt(0).toLowerCase() + t[1].slice(1) : t[1]) }); } })),
        hasSum: !!(prefSum(a).text || (a.note || '').trim()),
        sum: (prefSum(a).text ? "We'll " + prefSum(a).text + '. ' : '') + ((a.note || '').trim() ? 'Your note goes to the generator as written.' : ''),
        setF: () => setRole(a.id, 'follow'), setC: () => setRole(a.id, 'context'), remove: () => set({ arts: s.arts.filter(x => x.id !== a.id) }) };
    });
    const addArts = () => {
      const have = s.arts.map(a => a.id), add = Object.keys(AD).filter(id => !have.includes(id)).map(id => ({ id, role: AD[id].def }));
      if (!add.length) { this.showToast('All the sample files are already added.'); return; }
      set({ arts: s.arts.concat(add) });
    };
    const briefCtx = this.artRole('brief') === 'context';
    const keepStops = [0, 1, 2, 3].map(k => ({ label: ['Keep', 'Evolve', 'Inspired by', 'Fresh'][k], on: false }));
    const toBrief = () => {
      const hasBrief = s.arts.some(a => a.id === 'brief');
      if (s.path === 'brief' && hasBrief && !s.imported) set(Object.assign({ screen: 'brief', step: 1, imported: true }, this.sampleState()));
      else set({ screen: 'brief', step: 1 });
    };
    const fol = s.arts.filter(a => this.artRole(a.id) === 'follow' && AD[a.id].short), ctxA = s.arts.filter(a => this.artRole(a.id) === 'context');
    const HD = this.heard(), band = this.keepBand();
    const BANDS = [['Keep exactly as is', 10, 'We keep your logo, colors, fonts, and images fixed and build the rest around them.'], ['Alter it slighty', 37, 'We keep what is recognizable and refresh the rest. Your notes decide what stays.'], ['Alter it a lot', 62, 'Your uploads set the mood, but every option can move away from them.'], ['Totally change it', 90, 'We only read your uploads for context. Expect three new directions.']];
    const O_SAMPLE = 'I like the warm brown in the logo, but the letters feel too techy. The deck fonts are fine, and the photos are close but a bit dark.';
    const oWords = O_SAMPLE.split(' ');
    const toggleOpinionVoice = () => {
      if (s.oRec) { clearInterval(this._o); const said = oWords.slice(0, Math.max(s.oRec.shown, oWords.length)).join(' '); set({ oRec: null, opinion: ((s.opinion || '').trim() + ' ' + said).trim() }); return; }
      clearInterval(this._o); set({ oRec: { shown: 0 } });
      this._o = setInterval(() => { const r0 = this.state.oRec; if (!r0) { clearInterval(this._o); return; } if (r0.shown >= oWords.length) { clearInterval(this._o); return; } this.setState({ oRec: { shown: r0.shown + 2 } }); }, 140);
    };

    return {
      ...flowVals(this),
      voice, startVoice, stopVoice, cancelVoice, undoVoice, toggleT,
      isStart: s.screen === 'start', isBrief: s.screen === 'brief', isGen: s.screen === 'gen', isOut: s.screen === 'out',
      toBrief,
      steps, stepNow: s.step, stepPct: (s.step / stepNames.length * 100) + '%', isS1: s.step === 1, isS2: s.step === 2, isS3: s.step === 3, isS4: s.step === 4, isS5: s.step === 5, notLast: s.step < 5,
      nextStep: () => set({ step: Math.min(5, s.step + 1) }),
      showUpload: s.path === 'brief' && !s.imported, imported: s.imported, badge: s.imported && !s.confirmed,
      doImport: () => set(Object.assign({ imported: true, arts: s.arts.some(a => a.id === 'brief') ? s.arts : [{ id: 'brief', role: 'follow' }].concat(s.arts) }, this.sampleState())),
      confirmAll: () => set({ confirmed: true }), confirmLabel: s.confirmed ? 'Confirmed' : 'Confirm all',
      f, onField: (e) => { const k = e.target.name; set({ f: Object.assign({}, s.f, { [k]: e.target.value }) }); },
      onSlider: (e) => { const k = e.target.name; set({ sl: Object.assign({}, s.sl, { [k]: Number(e.target.value) }) }); },
      deliv, addDeliv: () => set({ deliv: s.deliv.concat([{ type: 'Logo' }]) }),
      domains, domainKey: onEnter(addDomain), votes, addVote: fromField('voteIn', 'votes'),
      legalOpen: s.legalOpen, toggleLegal: () => set({ legalOpen: !s.legalOpen }), legalLabel: s.legalOpen ? 'Hide legal name' : 'Different legal name?',
      mic: () => this.showToast('Listening… your answer is transcribed into this field (prototype)'),
      addTone: fromField('toneIn', 'tone'), taglines, addTagline: () => set({ taglines: s.taglines.concat(['']) }),
      brandGroups, careChips, comps, addComp: () => set({ comps: s.comps.concat([{ name: '', url: '' }]) }), alts, altKey: onEnter(fromField('altIn', 'alts')),
      endOn: s.endOn, endOff: !s.endOn, toggleEnd: () => set({ endOn: !s.endOn }), endLabel: s.endOn ? 'Included' : 'Add end user', endBg: s.endOn ? 'var(--color-action)' : '#FFFFFF', endFg: s.endOn ? '#FFFFFF' : 'var(--color-ink)',
      sigOpen: s.sigOpen, toggleSig: () => set({ sigOpen: !s.sigOpen }), sigLabel: s.sigOpen ? 'Hide early signals' : 'Add early signals of success (optional)',
      domainShown: s.domains[0] || 'yourname.com',
      toneChips, treatChips, lookPairs, sliders, avoidColors, pk,
      openPicker: () => setPk({ open: !p.open, text: null }), closePicker: () => setPk({ open: false }),
      pickWheel: (e) => {
        const r = e.currentTarget.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
        const sat = Math.min(100, Math.round(Math.sqrt(dx * dx + dy * dy) / (r.width / 2) * 100));
        const hue = Math.round((Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360);
        setPk({ h: hue, s: sat, text: null });
      },
      setPickL: (e) => setPk({ l: Number(e.target.value), text: null }),
      setPickHex: (e) => { const v = e.target.value; if (this.hexOk(v)) { const hsl = this.hex2hsl(v); setPk({ h: hsl[0], s: hsl[1], l: hsl[2], text: v }); } else { setPk({ text: v }); } },
      addPicked: () => { const h = (p.text && this.hexOk(p.text)) ? p.text.toUpperCase() : pHex; set({ avoidC: s.avoidC.includes(h) ? s.avoidC : s.avoidC.concat([h]), pk: Object.assign({}, s.pk, { open: false, text: null }) }); },
      refsAdded: s.refs.length > 0, addRefs: () => set({ refs: ['Corten steel', 'Sand dune', 'Industrial stair', 'Neon sign'] }), refCards,
      coreChecks, hasMissing: missing > 0, genBg: missing > 0 ? 'var(--color-grey-2)' : 'var(--color-action)',
      readyText: missing > 0 ? missing + ' Core answers are missing. Generation unlocks when every Core answer has something, even rough.' : 'Every Core answer is filled. You are ready to generate.',
      fillSample: () => { const smp = this.sampleState(); const nf = Object.assign({}, smp.f); Object.keys(s.f).forEach(k => { if (s.f[k]) nf[k] = s.f[k]; }); const patch = { f: nf }; Object.keys(smp).forEach(k => { if (k === 'f') return; const cur = s[k]; const empty = Array.isArray(cur) ? cur.length === 0 : (cur && typeof cur === 'object' ? Object.keys(cur).length === 0 : !cur); if (empty) patch[k] = smp[k]; }); set(patch); },
      generate: () => {
        if (missing > 0) return;
        set({ screen: 'gen', genStep: 0 }); clearInterval(this._g);
        this._g = setInterval(() => { const n = this.state.genStep + 1; if (n > 4) { clearInterval(this._g); this.setState({ screen: 'out', option: 0, ov: this.followOv(), mixBase: null, comments: [], view: 'dir', draft: null, darkPrev: false, cmode: false, meeting: Object.assign({}, this.state.meeting, { marks: {}, notice: null, agreedRound: null }) }); } else { this.setState({ genStep: n }); } }, 650);
      },
      genSteps,
      backToBrief: () => set({ screen: 'brief', step: 5 }),
      startOver: () => { clearInterval(this._g); clearInterval(this._v); clearTimeout(this._t); this.setState(Object.assign(JSON.parse(JSON.stringify(this._init)), { screen: 'welcome' })); },
      optTabs, allMenu: s.allMenu, toggleAll: () => set({ allMenu: !s.allMenu }),
      cur, wordUpper: (f.name || 'Name').toUpperCase(),
      whyTitle: s.option === 0 ? 'Why we recommend Option 1' : (s.option === 3 ? 'About your custom mix' : 'How Option ' + (s.option + 1) + ' compares to the recommendation'),
      matchLabel: s.option === 3 ? 'Built from' : 'Matches your brief on',
      sec, fonts: ['Anta', 'Oxanium', 'Chakra Petch', 'Archivo Black', 'Archivo', 'Barlow', 'IBM Plex Sans', 'Work Sans'],
      setWordFont: (e) => this.lockOv('word', { wordFont: e.target.value, track: cur.track }), setTrack: (e) => this.lockOv('word', { track: Number(e.target.value), wordFont: cur.wordFont }),
      setUiMix: (e) => { const v = Number(e.target.value); this.setOv({ uiMix: v, uiFixed: this.mix(cur.accent, v / 100) }); },
      setDisplay: (e) => this.lockOv('type', { display: e.target.value, body: cur.body }), setBody: (e) => this.lockOv('type', { body: e.target.value, display: cur.display }),
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
      arts, hasArts: s.arts.length > 0, addArts,
      badgeText: briefCtx ? 'Suggested' : 'Imported', importName: AD.brief.name,
      importText: briefCtx ? '36 answers suggested. Fields marked Suggested are drafts, so check each one.' : '36 answers imported. Fields marked Imported came from your brief.',
      hasFollowNote: s.arts.length > 0,
      followNote: 'You chose "' + BANDS[band][0] + '".' + (fol.length ? ' Kept fixed: ' + fol.map(a => AD[a.id].short).join(', ') + '.' : ''),
      contextNote: HD.said.length ? 'From your notes: ' + HD.said.join(', ') + '.' : ((s.opinion || '').trim() ? 'Your note: "' + s.opinion.trim() + '"' : ''),
      opinion: s.opinion || '', setOpinion: (e) => set({ opinion: e.target.value }), oRec: !!s.oRec, oIdle: !s.oRec,
      oLive: s.oRec ? (oWords.slice(0, s.oRec.shown).join(' ') || 'Listening…') : '', toggleOpinionVoice,
      oMicBg: s.oRec ? 'var(--color-ink)' : 'var(--color-action)', oMicAria: s.oRec ? 'Stop and add what you said' : 'Talk about what you uploaded',
      oMicText: s.oRec ? 'Listening… tap to stop' : 'Talk instead of typing',
      hasHeard: HD.said.length > 0, heardText: HD.said.join(', ') + '.',
      keep: s.keep, keepPct: s.keep + '%', setKeep: (e) => set({ keep: Number(e.target.value) }),
      keepName: BANDS[band][0],
      keepStops: BANDS.map((bd, k) => ({ label: bd[0], on: band === k, bg: band === k ? 'var(--color-action)' : '#FFFFFF', fg: band === k ? '#FFFFFF' : 'var(--color-ink)', bd: band === k ? 'var(--color-action)' : 'var(--color-grey-1)', pick: () => set({ keep: bd[1] }) })),
      isDir: s.view !== 'cmp', isCmp: s.view === 'cmp',
      viewDir: () => set({ view: 'dir' }), viewCmp: () => set({ view: 'cmp', edit: null, draft: null }),
      vDirBg: s.view !== 'cmp' ? 'var(--color-action)' : 'transparent', vDirFg: s.view !== 'cmp' ? '#FFFFFF' : 'var(--color-ink)',
      vCmpBg: s.view === 'cmp' ? 'var(--color-action)' : 'transparent', vCmpFg: s.view === 'cmp' ? '#FFFFFF' : 'var(--color-ink)',
      darkPrev: s.darkPrev, toggleDark: () => set({ darkPrev: !s.darkPrev }),
      darkBg: s.darkPrev ? 'var(--color-action)' : '#FFFFFF', darkFg: s.darkPrev ? '#FFFFFF' : 'var(--color-ink)',
      bentoBg: s.darkPrev ? cur.light : 'transparent', bentoPad: s.darkPrev ? '14px' : '0',
      cmode: s.cmode, toggleCmode: () => set({ cmode: !s.cmode, draft: null }),
      cmBg: s.cmode ? 'var(--color-action)' : '#FFFFFF', cmFg: s.cmode ? '#FFFFFF' : 'var(--color-ink)',
      cmodeLabel: 'Precise editing' + (openN ? ' · ' + openN : ''),
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
        const add = d.items.map((it, k) => { id++; return { id, num: myC.length + k + 1, opt: oi, sec: it.sec, target: it.target, label: it.label, text: d.text.trim(), status: 'thinking', tries: 0 }; });
        set({ comments: s.comments.concat(add), cid: id, draft: { items: [], text: '' } });
        add.forEach((c, k) => setTimeout(() => { const cc = this.state.comments.find(x => x.id === c.id); if (cc) this.updComment(c.id, { status: 'proposed', prop: this.propose(cc) }); }, 1000 + k * 450));
      },
      cols, mixSummary, mixBtn: s.mixBase ? 'Update your mix' : 'Create custom direction', createMix: () => this.createMix()
    };
  }

  render() {
    return <Root vm={this.renderVals()} />;
  }
}
