// Log in, the project list, autosave, and each project's address. Storage itself lives in accounts.js
// (this browser) or accountsRemote.js (the hosted server); store.js picks one.
import accounts from "./store.js";

// Interface state that belongs to this visit, not to the project, so it's never saved.
const TRANSIENT = new Set([
  "user", "projectId", "projects", "saveStatus", "saveError", "authError", "authBusy",
  "projectMenu", "renaming", "deleting", "deckBusy", "toast", "undo", "allMenu", "edit", "cmode", "draft", "genStep", "pk",
  "files", "uploading", "fillBusy", "fillError",
]);
// Where you were. It's saved so a project reopens in place, but moving around isn't editing: a save of
// only these doesn't change the project's edited time (which is also its version, see saveNow).
const PLACE = new Set(["screen", "step", "option", "view", "path", "darkPrev", "legalOpen", "sigOpen", "mixPick", "handoffFile", "exportSel", "exportFormat"]);
// A project reopens on one of these. Generation is a moment, so it reopens on the brief's last step.
const RESUMABLE = new Set(["welcome", "start", "brief", "out", "meet", "handoff"]);
const SAVE_DELAY = 700;
const RETRY_DELAY = 5000;
const ADDRESS = /^#\/p\/([\w-]+)$/;

export function projectChanged(prev, next) {
  return Object.keys(next).some((k) => !TRANSIENT.has(k) && prev[k] !== next[k]);
}

const SHOWS_DIRECTIONS = ["out", "meet", "handoff"];

function snapshot(app, state = app.state) {
  const data = {};
  Object.keys(state).forEach((k) => {
    if (!TRANSIENT.has(k)) data[k] = state[k];
  });
  // A project with directions reopens on them, unless its answers changed since they were made.
  // genInputs only reads this.state, so it can be asked about a state that isn't the app's yet.
  const current = data.dirs && data.dirs.in === app.genInputs.call({ state });
  if (current && !SHOWS_DIRECTIONS.includes(data.screen)) data.screen = "out";
  else if (!RESUMABLE.has(data.screen)) Object.assign(data, state.screen === "gen" ? { screen: "brief", step: 5 } : { screen: "welcome" });
  return data;
}

// What the project card says: where the project reopens, and the direction's palette once there is one.
function summary(app, data) {
  const s = app.state;
  const cur = SHOWS_DIRECTIONS.includes(s.screen) && app.current();
  const dir = s.dirs ? s.dirs.directions[s.option] : cur;
  const results = s.option === 3 ? "Your mix" : dir ? `Option ${s.option + 1}: ${dir.name}` : "Directions";
  const where = { welcome: "Getting started", start: "Uploads", brief: `Brief step ${data.step}`, out: results, meet: "Alignment meeting", handoff: "Handed off" }[data.screen] || "";
  const out = { name: (s.f.name || "").trim() || "Untitled brand", where };
  // Left out elsewhere, so the card keeps the last palette it showed.
  if (cur) out.swatches = cur.colors.map((c) => c.show);
  return out;
}

// Fresh interface state, keeping who's signed in.
function fresh(app, patch) {
  clearInterval(app._g);
  clearTimeout(app._t);
  app._fresh = null;
  return Object.assign(JSON.parse(JSON.stringify(app._init)), { user: app.state.user, projects: app.state.projects }, patch);
}

// Changed keys since the last save (or since the project was opened).
const changes = (app, data) => Object.keys(data).filter((k) => data[k] !== (app._saved || {})[k]);
const isEdit = (keys) => keys.some((k) => !PLACE.has(k));

export function scheduleSave(app) {
  // After a 409 this tab's copy is out of date, so it stops saving. While a retry waits, it saves the latest anyway.
  if (app._version === null || (app._save && app.state.saveStatus === "error")) return;
  clearTimeout(app._save);
  app._save = setTimeout(() => saveNow(app), SAVE_DELAY);
  // Moving around saves quietly; "Saving…" is for real changes.
  if (app.state.saveStatus !== "saving" && isEdit(changes(app, snapshot(app)))) app.setState({ saveStatus: "saving" });
}

// One save at a time, each sending the version the last one got back, so the server can refuse a stale tab.
// Resolves to the error message when the save failed and will be retried: the work isn't safe to leave yet.
export function saveNow(app, { closing = false } = {}) {
  clearTimeout(app._save);
  app._save = null;
  const { user, projectId } = app.state;
  if (!user || !projectId || app._version === null) return Promise.resolve("");
  // shortcut: the closing save can't wait for one in flight, so both carry the same version and the later one gets a 409; if that's the closing save, the last edits are lost. Merge on the server if that's ever reported.
  if (app._saving && !closing) return (app._next = app._next || app._saving.then(() => { app._next = null; return saveNow(app); }));
  const data = snapshot(app);
  const changed = changes(app, data);
  // Nothing to send: opening a project and leaving it again isn't a change.
  if (!changed.length) {
    if (app.state.saveStatus === "saving") app.setState({ saveStatus: "saved" });
    return Promise.resolve("");
  }
  app._fresh = null;
  // Only an edit moves the version on. A save of only where you were keeps it: the content it carries is
  // what that version already holds, so a tab with newer content is never overwritten without a 409.
  const saving = accounts
    .saveProject(user.id, projectId, data, summary(app, data), app._version, closing, isEdit(changed))
    .then((updatedAt) => {
      app._version = updatedAt;
      app._saved = data;
      app.setState({ saveStatus: app._save || app._next ? "saving" : "saved", saveError: "" });
      return "";
    })
    .catch((err) => {
      if (err.status === 409 || err.status === 404) {
        app._version = null;
        app.setState({ saveStatus: "conflict", saveError: err.message });
        app.showToast(err.message);
        return "";
      }
      app._save = setTimeout(() => saveNow(app), RETRY_DELAY);
      app.setState({ saveStatus: "error", saveError: err.message });
      return err.message;
    })
    .finally(() => {
      if (app._saving === saving) app._saving = null;
    });
  return (app._saving = saving);
}

// The address bar holds the open project (#/p/<id>) or the list (#/). Tests run without one.
function address(hash, push) {
  if (window.history) window.history[push ? "pushState" : "replaceState"](null, "", hash);
}

function nameOf(s) {
  // The header shows the name from the project list once someone has renamed it there.
  const listed = (s.projects || []).find((p) => p.id === s.projectId);
  return listed && listed.renamed ? listed.name : (s.f.name || "").trim() || "Untitled brand";
}

// After each change: a project opened or left gets its own history entry, so Back and Forward move
// between the list and a project, and the tab is named after the project.
export function syncAddress(app, prev) {
  const s = app.state;
  if (!window.history) return;
  document.title = s.projectId ? `${nameOf(s)} · KAI` : "KAI";
  // Coming from the splash or log in, followAddress decides where to go.
  if (s.projectId === prev.projectId || prev.screen === "splash" || prev.screen === "auth") return;
  const want = s.projectId ? `#/p/${s.projectId}` : s.screen === "projects" ? "#/" : null;
  if (want && (window.location.hash || "#/") !== want) address(want, true);
}

// When the address changes (Back, Forward, a pasted link) or the app starts: go where it points.
export function followAddress(app) {
  const s = app.state, hash = window.location.hash;
  if (!s.user || s.screen === "splash" || s.screen === "auth") return;
  // An in-page link such as #sec-palette: the project keeps its own address.
  if (hash && !hash.startsWith("#/")) return s.projectId && address(`#/p/${s.projectId}`);
  const id = (hash.match(ADDRESS) || [])[1] || null;
  if (id === s.projectId) return;
  const v = projectVals(app);
  // Leaving was refused (the work isn't saved), so the address goes back to the project.
  const stayed = (failed) => failed && address(`#/p/${s.projectId}`);
  if (!id) return v.toProjects().then(stayed);
  return s.projectId ? v.leave(() => v.openProject(id)).then(stayed) : v.openProject(id);
}

function relativeTime(t) {
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "Edited just now";
  if (mins < 60) return `Edited ${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Edited ${hours} hr ago`;
  if (hours < 48) return "Edited yesterday";
  return "Edited " + new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function projectVals(app) {
  const s = app.state;
  const set = (patch) => app.setState(patch);
  const user = s.user;

  const loadList = () => accounts.listProjects(user.id).then((projects) => set({ projects }));
  const fail = (err) => app.showToast(err.message);
  const toList = () => accounts.listProjects(user.id).then((projects) => app.setState(fresh(app, { screen: "projects", projects })));

  const openProject = (id) =>
    accounts
      .loadProject(user.id, id)
      .then((p) => {
        app._version = p.updatedAt;
        const state = fresh(app, { ...p.data, projectId: p.id, saveStatus: "saved" });
        // It opens where it would reopen (see snapshot), and that is what's saved, so opening isn't a change.
        app._saved = snapshot(app, state);
        app.setState(Object.assign(state, { screen: app._saved.screen, step: app._saved.step }));
      })
      // A link to a project that's gone (or someone else's) shows the list and says so.
      .catch((err) => {
        if (window.location.hash === `#/p/${id}`) address("#/");
        return toList().then(() => fail(err), fail);
      });

  // A project made by New brand in this visit and never changed isn't kept.
  // One left by closing the tab or reloading goes when the list loads a week later (listProjects).
  const discard = () => {
    if (!app._fresh || app._fresh !== app.state.projectId) return Promise.resolve();
    address("#/");
    return accounts.deleteProject(user.id, app._fresh).catch(() => {});
  };
  // Leaving after a failed save would drop the work, so stay and say why. Resolves to that reason, or "" once gone.
  const stay = (failed) => app.showToast(`Your latest changes aren't saved yet. ${failed}`);
  const leave = (next) =>
    saveNow(app)
      .then((failed) => (failed ? (stay(failed), failed) : discard().then(next).then(() => "")))
      .catch(fail);
  const toProjects = () => leave(toList);

  const cards = (s.projects || []).map((p) => ({
    id: p.id,
    name: p.name,
    swatches: p.swatches,
    meta: [relativeTime(p.updatedAt), p.where].filter(Boolean).join(" · "),
    open: () => openProject(p.id),
    menuOpen: s.projectMenu === p.id,
    toggleMenu: () => set({ projectMenu: s.projectMenu === p.id ? null : p.id, deleting: null }),
    renaming: s.renaming === p.id,
    startRename: () => set({ renaming: p.id, projectMenu: null }),
    commitRename: (name) => accounts.renameProject(user.id, p.id, name).then(() => { set({ renaming: null }); return loadList(); }).catch(fail),
    cancelRename: () => set({ renaming: null }),
    duplicate: () => accounts.duplicateProject(user.id, p.id).then((copy) => { set({ projectMenu: null }); app.showToast(`Made a copy: ${copy.name}`); return loadList(); }).catch(fail),
    deleting: s.deleting === p.id,
    askDelete: () => set({ deleting: p.id }),
    cancelDelete: () => set({ deleting: null, projectMenu: null }),
    confirmDelete: () => accounts.deleteProject(user.id, p.id).then(() => { set({ deleting: null, projectMenu: null }); return loadList(); }).catch(fail),
  }));

  const submitAuth = (email, password) => {
    set({ authBusy: true, authError: "" });
    return accounts
      .logIn(email, password)
      .then((u) => accounts.listProjects(u.id).then((projects) => app.setState({ user: u, projects, screen: "projects", authBusy: false }, () => followAddress(app))))
      .catch((err) => set({ authError: err.message, authBusy: false }));
  };

  const saveLabel = { saving: "Saving…", saved: "Saved", error: "Couldn't save", conflict: "Out of date, reload" }[s.saveStatus] || "";

  return {
    isAuth: s.screen === "auth",
    isProjects: s.screen === "projects",
    authError: s.authError,
    authBusy: s.authBusy,
    submitAuth,
    leaveSplash: () => {
      if (s.screen !== "splash") return;
      if (user) accounts.listProjects(user.id).then((projects) => app.setState({ projects, screen: "projects" }, () => followAddress(app))).catch(fail);
      else set({ screen: "auth" });
    },
    userEmail: user ? user.email : "",
    inProject: !!s.projectId,
    cards,
    hasProjects: cards.length > 0,
    newProject: () => {
      if (app._creating) return; // A double click would make two projects.
      const state = fresh(app, { screen: "welcome" });
      const data = snapshot(app, state);
      app._creating = accounts
        .createProject(user.id, data)
        .then((p) => {
          app._version = p.updatedAt;
          app._saved = data;
          app.setState(Object.assign(state, { projectId: p.id, saveStatus: "saved" }));
          app._fresh = p.id;
        })
        .catch(fail)
        .finally(() => (app._creating = null));
    },
    openProject,
    leave,
    toProjects,
    logOut: () => leave(() => accounts.logOut().then(() => app.setState(fresh(app, { screen: "auth", user: null, projects: [] })))),
    projectName: nameOf(s),
    saveLabel,
    saveError: s.saveStatus === "error" || s.saveStatus === "conflict" ? s.saveError : "",
  };
}
