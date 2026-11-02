// Alignment meeting and handoff: state transitions and view values.
//
// The model: a direction is reviewed in rounds. In each round the group marks every module
// Agreed or Needs work. Not agreed means back to picks: agreed modules lock, so regenerating
// only touches what is still open, and the round count goes up. Agreed means handoff.
import { downloadFile, fontsCss, handoffFiles, imageCsv, tokensCss, tokensJson, voiceMd } from "./exports.js";

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

export function flowVals(app) {
  const s = app.state;
  const { meeting } = s;
  const set = (patch) => app.setState(patch);
  const isMeet = s.screen === "meet";
  const isHandoff = s.screen === "handoff";
  const isOut = s.screen === "out";
  const leaveTop = () => window.scrollTo(0, 0);

  const openMeeting = () => {
    set({ screen: "meet", view: "dir", edit: null, draft: null, cmode: false, darkPrev: false, exMenu: null, allMenu: false });
    leaveTop();
  };
  const base = {
    isMeet,
    isHandoff,
    showPrint: isOut || isHandoff,
    printAll: s.printScope === "all",
    openMeeting,
    meetingLabel: meeting.log.length ? `Back to meeting · Round ${meeting.round}` : "Take to meeting",
    roundNotice: isOut ? meeting.notice : null,
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
      printPdf: () => app.printDirection("all"),
      reopen,
    };
  }
  return vals;
}

// Export menus on the direction page. Formats with no file behind them stay labeled as prototype.
export function exportSection(app, sectionId, format, sectionName) {
  const d = app.current();
  const file = (name, content, mime) => {
    downloadFile(name, content, mime);
    app.showToast(name + " downloaded.");
  };
  const key = sectionId + "/" + format;
  if (key === "palette/CSS tokens" || key === "ui/CSS tokens") return file("tokens.css", tokensCss(d), "text/css");
  if (key === "palette/JSON tokens") return file("tokens.json", tokensJson(d), "application/json");
  if (key === "type/CSS font stack") return file("fonts.css", fontsCss(d), "text/css");
  if (key === "refs/Image links (.csv)") return file("reference-images.csv", imageCsv(d), "text/csv");
  if (key === "voice/Markdown") return file("voice.md", voiceMd(d), "text/markdown");
  if (key === "preview/PDF") return app.printDirection("board");
  if (key === "voice/Copy to clipboard") {
    return navigator.clipboard.writeText(voiceMd(d)).then(
      () => app.showToast("Voice copied."),
      () => app.showToast("Couldn't copy. Use Markdown instead."),
    );
  }
  return app.showToast(`${sectionName} as ${format} isn't built yet (prototype).`);
}

export function exportPage(app, format) {
  const s = app.state;
  const d = app.current();
  const file = (name, content, mime) => {
    downloadFile(name, content, mime);
    app.showToast(name + " downloaded.");
  };
  if (format === "Whole page (PDF)") return app.printDirection("all");
  if (format === "Moodboard only (PDF)") return app.printDirection("board");
  if (format === "Color tokens (CSS)") return file("tokens.css", tokensCss(d), "text/css");
  if (format === "CLAUDE.md brand rules") {
    const claude = handoffFiles({ d, f: s.f, avoidC: s.avoidC, avoidT: s.avoidT, domains: s.domains, agreedRound: s.meeting.agreedRound })[0];
    return file(claude.name, claude.content, claude.mime);
  }
  return app.showToast(`${format} isn't built yet (prototype).`);
}
