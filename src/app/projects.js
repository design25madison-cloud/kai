// Log in, the project list, and autosave. Storage itself lives in accounts.js (this browser) or
// accountsRemote.js (the hosted server); store.js picks one.
import accounts from "./store.js";

// Interface state that belongs to this visit, not to the project, so it's never saved.
const TRANSIENT = new Set([
  "user", "projectId", "projects", "saveStatus", "saveError", "authError", "authBusy",
  "projectMenu", "renaming", "deleting", "deckBusy", "toast", "undo", "allMenu", "edit", "cmode", "draft", "genStep", "pk",
  "files", "uploading", "fillBusy", "fillError",
]);
// A project reopens on one of these. Generation is a moment, so it reopens on the brief's last step.
const RESUMABLE = new Set(["welcome", "start", "brief", "out"]);
const SAVE_DELAY = 700;
const RETRY_DELAY = 5000;

export function projectChanged(prev, next) {
  return Object.keys(next).some((k) => !TRANSIENT.has(k) && prev[k] !== next[k]);
}

function snapshot(state) {
  const data = {};
  Object.keys(state).forEach((k) => {
    if (!TRANSIENT.has(k)) data[k] = state[k];
  });
  if (!RESUMABLE.has(data.screen)) Object.assign(data, state.screen === "gen" ? { screen: "brief", step: 5 } : { screen: "welcome" });
  return data;
}

function summary(app) {
  const s = app.state;
  const where = { welcome: "Getting started", start: "Uploads", brief: `Brief step ${s.step}`, gen: "Brief step 5" }[s.screen] || "";
  const out = { name: (s.f.name || "").trim() || "Untitled brand", where };
  // The card shows the direction's palette once there is one.
  if (s.screen === "out") out.swatches = app.current().colors.map((c) => c.show);
  return out;
}

// Fresh interface state, keeping who's signed in.
function fresh(app, patch) {
  clearInterval(app._g);
  clearTimeout(app._t);
  return Object.assign(JSON.parse(JSON.stringify(app._init)), { user: app.state.user, projects: app.state.projects }, patch);
}

export function scheduleSave(app) {
  // After a 409 this tab's copy is out of date, so it stops saving. While a retry waits, it saves the latest anyway.
  if (app._version === null || (app._save && app.state.saveStatus === "error")) return;
  clearTimeout(app._save);
  app._save = setTimeout(() => saveNow(app), SAVE_DELAY);
  if (app.state.saveStatus !== "saving") app.setState({ saveStatus: "saving" });
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
  const saving = accounts
    .saveProject(user.id, projectId, snapshot(app.state), summary(app), app._version, closing)
    .then((updatedAt) => {
      app._version = updatedAt;
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

  const open = (id) =>
    accounts
      .loadProject(user.id, id)
      .then((p) => {
        app._version = p.updatedAt;
        app.setState(fresh(app, { ...p.data, projectId: p.id, saveStatus: "saved" }));
      })
      .catch(fail);

  // Leaving after a failed save would drop the work, so stay and say why.
  const stay = (failed) => app.showToast(`Your latest changes aren't saved yet. ${failed}`);
  const toProjects = () =>
    saveNow(app)
      .then((failed) => failed ? stay(failed) : accounts.listProjects(user.id).then((projects) => app.setState(fresh(app, { screen: "projects", projects }))))
      .catch(fail);

  const cards = (s.projects || []).map((p) => ({
    id: p.id,
    name: p.name,
    swatches: p.swatches,
    meta: [relativeTime(p.updatedAt), p.where].filter(Boolean).join(" · "),
    open: () => open(p.id),
    menuOpen: s.projectMenu === p.id,
    toggleMenu: () => set({ projectMenu: s.projectMenu === p.id ? null : p.id, deleting: null }),
    renaming: s.renaming === p.id,
    startRename: () => set({ renaming: p.id, projectMenu: null }),
    commitRename: (name) => accounts.renameProject(user.id, p.id, name).then(() => { set({ renaming: null }); return loadList(); }).catch(fail),
    cancelRename: () => set({ renaming: null }),
    duplicate: () => accounts.duplicateProject(user.id, p.id).then(() => { set({ projectMenu: null }); return loadList(); }).catch(fail),
    deleting: s.deleting === p.id,
    askDelete: () => set({ deleting: p.id }),
    cancelDelete: () => set({ deleting: null, projectMenu: null }),
    confirmDelete: () => accounts.deleteProject(user.id, p.id).then(() => { set({ deleting: null, projectMenu: null }); return loadList(); }).catch(fail),
  }));

  const submitAuth = (email, password) => {
    set({ authBusy: true, authError: "" });
    return accounts
      .logIn(email, password)
      .then((u) => accounts.listProjects(u.id).then((projects) => set({ user: u, projects, screen: "projects", authBusy: false })))
      .catch((err) => set({ authError: err.message, authBusy: false }));
  };

  // The header shows the name from the project list once someone has renamed it there.
  const listed = (s.projects || []).find((p) => p.id === s.projectId);
  const projectName = listed && listed.renamed ? listed.name : (s.f.name || "").trim() || "Untitled brand";

  const saveLabel = { saving: "Saving…", saved: "Saved", error: "Couldn't save", conflict: "Out of date, reload" }[s.saveStatus] || "";

  return {
    isAuth: s.screen === "auth",
    isProjects: s.screen === "projects",
    authError: s.authError,
    authBusy: s.authBusy,
    submitAuth,
    leaveSplash: () => {
      if (s.screen !== "splash") return;
      if (user) accounts.listProjects(user.id).then((projects) => set({ projects, screen: "projects" })).catch(fail);
      else set({ screen: "auth" });
    },
    userEmail: user ? user.email : "",
    inProject: !!s.projectId,
    cards,
    hasProjects: cards.length > 0,
    newProject: () => {
      if (app._creating) return; // A double click would make two projects.
      const data = snapshot(fresh(app, { screen: "welcome" }));
      app._creating = accounts
        .createProject(user.id, data)
        .then((p) => {
          app._version = p.updatedAt;
          app.setState(fresh(app, { ...data, projectId: p.id, saveStatus: "saved" }));
        })
        .catch(fail)
        .finally(() => (app._creating = null));
    },
    toProjects,
    logOut: () =>
      saveNow(app).then((failed) =>
        failed ? stay(failed) : accounts.logOut().then(() => app.setState(fresh(app, { screen: "auth", user: null, projects: [] })))),
    projectName,
    saveLabel,
    saveError: s.saveStatus === "error" || s.saveStatus === "conflict" ? s.saveError : "",
  };
}
