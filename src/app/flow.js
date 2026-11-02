// Alignment meeting and handoff: state transitions and view values.
//
// The model: a direction is reviewed in rounds. In each round the group marks every module
// Agreed or Needs work. Not agreed means back to picks: agreed modules lock, so regenerating
// only touches what is still open, and the round count goes up. Agreed means handoff.
import { ALL_SECTIONS, claudeMd, downloadFile, fontsGuide, handoffFiles, tokensCss, tokensJson } from "./exports.js";

export const MODULES = [
  ["word", "Wordmark"],
  ["palette", "Palette and UI primary"],
  ["type", "Typography"],
  ["refs", "Imagery"],
  ["voice", "Voice"],
];

export const newMeeting = () => ({ round: 1, marks: {}, log: [], notice: null, agreedRound: null });

function moduleValue(id, d) {
  if (id === "word") return `${d.wordFont}, ${d.trackPx} spacing`;
  if (id === "palette") return `${d.palNames}. UI primary ${d.ui}`;
  if (id === "type") return `${d.display} with ${d.body}`;
  if (id === "refs") return d.imgs.slice(0, 3).map((im) => im[0]).join(", ");
  return d.tone.map((t) => t.yes).join(", ");
}

// Same locks the section headers set, applied to several modules at once. Modules in `release`
// are unlocked: the group rejected them, so regenerating has to be able to change them.
function lockedOv(app, i, mods, release = []) {
  const d = app.optionData(i);
  const prev = app.state.ov[i] || {};
  const patch = { lock: Object.assign({}, prev.lock) };
  mods.forEach((m) => {
    if (m === "palette") Object.assign(patch, { swLock: [true, true, true, true, true], hex: d.colors.map((c) => c.show), names: d.colors.map((c) => c.name), uiFixed: d.ui, uiMix: d.uiMix });
    else if (m === "refs") patch.images = d.imgs.map((x) => [x[0], x[1], true]);
    else patch.lock[m] = true;
  });
  release.forEach((m) => {
    if (m === "palette") Object.assign(patch, { swLock: [], uiFixed: null });
    else if (m === "refs") patch.images = d.imgs.map((x) => [x[0], x[1], false]);
    else patch.lock[m] = false;
  });
  const ov = app.state.ov.slice();
  while (ov.length <= i) ov.push({});
  ov[i] = Object.assign({}, prev, patch);
  return { ov, prev };
}

function marksFor(meeting, option) {
  return meeting.marks[option] || {};
}

function logEntry(meeting, option, name, outcome) {
  const marks = marksFor(meeting, option);
  return {
    round: meeting.round,
    name,
    outcome,
    agreed: MODULES.filter(([id]) => marks[id]?.status === "agreed").map(([, label]) => label),
    open: MODULES.filter(([id]) => marks[id]?.status !== "agreed").map(([id, label]) => ({ label, note: (marks[id]?.note || "").trim() })),
  };
}

function describeOpen(open) {
  return open.map((o) => (o.note ? `${o.label} ("${o.note}")` : o.label)).join(", ");
}

const EXPORT_SECTIONS = [
  ["mood", "Moodboard"],
  ["word", "Wordmark"],
  ["palette", "Palette"],
  ["ui", "UI primary"],
  ["type", "Typography"],
  ["refs", "Imagery"],
  ["preview", "UI preview"],
  ["voice", "Voice"],
];

// Each format, the sections that have something to put in it, and how to build the file.
const EXPORT_FORMATS = [
  { id: "pdf", label: "PDF", uses: ALL_SECTIONS },
  { id: "claude", label: "CLAUDE.md", uses: ["word", "palette", "ui", "type", "refs", "voice"], name: "CLAUDE.md", mime: "text/markdown", build: (i) => claudeMd(i) },
  { id: "css", label: "CSS tokens", uses: ["word", "palette", "ui", "type"], name: "tokens.css", mime: "text/css", build: (i) => tokensCss(i.d, i.sections) },
  { id: "json", label: "JSON tokens", uses: ["word", "palette", "ui", "type"], name: "tokens.json", mime: "application/json", build: (i) => tokensJson(i.d, i.sections) },
  { id: "fonts", label: "Font guide", uses: ["word", "type"], name: "fonts.md", mime: "text/markdown", build: (i) => fontsGuide(i.d, i.sections) },
];

function exportVals(app) {
  const s = app.state;
  const sel = s.exportSel;
  const usable = (f) => f.uses.some((id) => sel.includes(id));
  const current = EXPORT_FORMATS.find((f) => f.id === s.exportFormat);
  const set = (patch) => app.setState(patch);
  return {
    allOn: sel.length === ALL_SECTIONS.length,
    toggleAll: () => set({ exportSel: sel.length === ALL_SECTIONS.length ? [] : ALL_SECTIONS }),
    sections: EXPORT_SECTIONS.map(([id, label]) => ({
      id,
      label,
      on: sel.includes(id),
      toggle: () => set({ exportSel: ALL_SECTIONS.filter((x) => (x === id ? !sel.includes(id) : sel.includes(x))) }),
    })),
    formats: EXPORT_FORMATS.map((f) => ({ id: f.id, label: f.label, on: f === current, disabled: !usable(f), pick: () => set({ exportFormat: f.id }) })),
    canRun: usable(current),
    run: () => {
      if (!usable(current)) return;
      if (current.id === "pdf") return app.printDirection(sel);
      const content = current.build({ d: app.current(), f: s.f, avoidC: s.avoidC, avoidT: s.avoidT, domains: s.domains, agreedRound: s.meeting.agreedRound, sections: sel });
      downloadFile(current.name, content, current.mime);
      set({ allMenu: false });
      app.showToast(current.name + " downloaded.");
    },
  };
}

export function flowVals(app) {
  const s = app.state;
  const { meeting } = s;
  const set = (patch) => app.setState(patch);
  const isMeet = s.screen === "meet";
  const isHandoff = s.screen === "handoff";
  const isOut = s.screen === "out";
  const leaveTop = () => window.scrollTo(0, 0);

  const openMeeting = () => {
    set({ screen: "meet", view: "dir", edit: null, draft: null, cmode: false, darkPrev: false, allMenu: false });
    leaveTop();
  };
  const base = {
    isMeet,
    isHandoff,
    showPrint: isOut || isHandoff,
    printSel: s.printSel,
    openMeeting,
    meetingLabel: meeting.log.length ? `Back to meeting · Round ${meeting.round}` : "Take to meeting",
    roundNotice: isOut ? meeting.notice : null,
    exportMenu: exportVals(app),
    dismissNotice: () => set({ meeting: Object.assign({}, meeting, { notice: null }) }),
  };
  if (!isMeet && !isHandoff) return base;

  const d = app.current();
  const option = s.option;
  const marks = marksFor(meeting, option);
  const setMark = (id, patch) => {
    const forOption = Object.assign({}, marks, { [id]: Object.assign({}, marks[id], patch) });
    set({ meeting: Object.assign({}, meeting, { marks: Object.assign({}, meeting.marks, { [option]: forOption }) }) });
  };
  const directions = app.opts().map((o, k) => {
    const done = Object.values(marksFor(meeting, k)).filter((m) => m.status === "agreed").length;
    return { label: k === 3 ? "Your mix" : "Option " + (k + 1), name: k === 3 ? "Custom direction" : o.name, on: k === option, progress: done ? `${done} of ${MODULES.length} agreed` : "", pick: () => set({ option: k }) };
  });
  const modules = MODULES.map(([id, label]) => {
    const m = marks[id] || {};
    const toggle = (status) => () => setMark(id, { status: m.status === status ? null : status });
    return {
      id,
      label,
      value: moduleValue(id, d),
      agreed: m.status === "agreed",
      work: m.status === "work",
      note: m.note || "",
      noteAria: "What is off about " + label.toLowerCase(),
      setNote: (e) => setMark(id, { note: e.target.value }),
      markAgreed: toggle("agreed"),
      markWork: toggle("work"),
    };
  });
  const agreedN = modules.filter((m) => m.agreed).length;
  const allAgreed = agreedN === modules.length;
  const name = option === 3 ? "Your mix" : d.name;

  const backToPicks = () => {
    const entry = logEntry(meeting, option, name, "open");
    const lockIds = MODULES.filter(([id]) => marks[id]?.status === "agreed").map(([id]) => id);
    const releaseIds = MODULES.filter(([id]) => marks[id]?.status === "work").map(([id]) => id);
    const { ov, prev } = lockedOv(app, option, lockIds, releaseIds);
    const notice = {
      round: meeting.round + 1,
      title: `Round ${meeting.round + 1} of ${name}`,
      locked: entry.agreed.length ? "Agreed and locked: " + entry.agreed.join(", ") + "." : "Nothing was agreed, so nothing new is locked.",
      open: "Still open: " + describeOpen(entry.open) + ".",
    };
    set({ ov, screen: "out", view: "dir", meeting: Object.assign({}, meeting, { round: meeting.round + 1, log: meeting.log.concat([entry]), notice }) });
    app.showToast(`Round ${meeting.round} logged. Agreed modules are locked.`, { i: option, prev, meeting });
    leaveTop();
  };
  const handOff = () => {
    if (!allAgreed) return;
    const { ov } = lockedOv(app, option, MODULES.map(([id]) => id));
    set({ ov, screen: "handoff", handoffFile: "claude", meeting: Object.assign({}, meeting, { agreedRound: meeting.round, notice: null, log: meeting.log.concat([logEntry(meeting, option, name, "agreed")]) }) });
    leaveTop();
  };
  const reopen = () => {
    set({ screen: "meet", meeting: Object.assign({}, meeting, { agreedRound: null, log: meeting.log.filter((e) => e.outcome !== "agreed") }) });
    leaveTop();
  };

  const rounds = meeting.log.map((e) => ({
    label: `Round ${e.round}`,
    text: e.outcome === "agreed" ? `${e.name}: all ${MODULES.length} modules agreed.` : `${e.name}: ${e.agreed.length} of ${MODULES.length} agreed. Open: ${describeOpen(e.open)}.`,
  }));

  const vals = Object.assign(base, {
    meet: {
      round: meeting.round,
      directions,
      modules,
      agreedN,
      total: modules.length,
      allAgreed,
      someOpen: !allAgreed,
      progress: `${agreedN} of ${modules.length} agreed`,
      gateText: allAgreed ? "Every module is agreed." : "Handoff unlocks when every module is agreed.",
      hasRounds: rounds.length > 0,
      rounds,
      backToPicks,
      handOff,
      leave: () => {
        set({ screen: "out" });
        leaveTop();
      },
      editBrief: () => set({ screen: "brief", step: 5 }),
    },
  });

  if (isHandoff) {
    const files = handoffFiles({ d, f: s.f, avoidC: s.avoidC, avoidT: s.avoidT, domains: s.domains, agreedRound: meeting.agreedRound });
    const sel = files.find((x) => x.id === s.handoffFile) || files[0];
    vals.handoff = {
      name: s.f.name || "Your brand",
      direction: name,
      agreedText: `Agreed in round ${meeting.agreedRound}. Target is 1 to 2 rounds.`,
      picks: modules.map((m) => ({ label: m.label, value: m.value })),
      rounds,
      files: files.map((x) => ({
        ...x,
        on: x.id === sel.id,
        preview: () => set({ handoffFile: x.id }),
        download: () => {
          downloadFile(x.name, x.content, x.mime);
          app.showToast(x.name + " downloaded.");
        },
      })),
      selName: sel.name,
      selContent: sel.content,
      copy: async () => {
        try {
          await navigator.clipboard.writeText(sel.content);
          app.showToast(sel.name + " copied.");
        } catch {
          app.showToast("Couldn't copy. Use Download instead.");
        }
      },
      printPdf: () => app.printDirection(ALL_SECTIONS),
      reopen,
    };
  }
  return vals;
}
