// Log in, the project list, and autosave. Storage itself lives in accounts.js.
import * as accounts from "./accounts.js";

// Interface state that belongs to this visit, not to the project, so it's never saved.
const TRANSIENT = new Set([
  "user", "projectId", "projects", "saveStatus", "saveError", "authMode", "authError", "authBusy",
  "projectMenu", "renaming", "deleting", "toast", "undo", "allMenu", "edit", "cmode", "draft", "genStep", "vRec", "oRec", "pk",
]);
// A project reopens on one of these. Generation is a moment, so it reopens on the brief's last step.
const RESUMABLE = new Set(["welcome", "start", "brief", "out"]);
const SAVE_DELAY = 700;

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
  clearInterval(app._v);
  clearTimeout(app._t);
  return Object.assign(JSON.parse(JSON.stringify(app._init)), { user: app.state.user, projects: app.state.projects }, patch);
}

export function scheduleSave(app) {
  clearTimeout(app._save);
  app._save = setTimeout(() => saveNow(app), SAVE_DELAY);
  if (app.state.saveStatus !== "saving") app.setState({ saveStatus: "saving" });
}

export function saveNow(app) {
  clearTimeout(app._save);
  app._save = null;
  const { user, projectId } = app.state;
  if (!user || !projectId) return Promise.resolve();
  return accounts
    .saveProject(user.id, projectId, snapshot(app.state), summary(app))
    .then(() => app.setState({ saveStatus: "saved", saveError: "" }))
    .catch((err) => app.setState({ saveStatus: "error", saveError: err.message }));
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
      .then((p) => app.setState(fresh(app, { ...p.data, projectId: p.id, saveStatus: "saved" })))
      .catch(fail);

  const toProjects = () =>
    saveNow(app)
      .then(() => accounts.listProjects(user.id))
      .then((projects) => app.setState(fresh(app, { screen: "projects", projects })));

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
    const call = s.authMode === "signup" ? accounts.signUp : accounts.logIn;
    return call(email, password)
      .then((u) => accounts.listProjects(u.id).then((projects) => set({ user: u, projects, screen: "projects", authBusy: false })))
      .catch((err) => set({ authError: err.message, authBusy: false }));
  };

  // The header shows the name from the project list once someone has renamed it there.
  const listed = (s.projects || []).find((p) => p.id === s.projectId);
  const projectName = listed && listed.renamed ? listed.name : (s.f.name || "").trim() || "Untitled brand";

  const saveLabel = { saving: "Saving…", saved: "Saved", error: "Couldn't save" }[s.saveStatus] || "";

  return {
    isAuth: s.screen === "auth",
    isProjects: s.screen === "projects",
    isSignup: s.authMode === "signup",
    authError: s.authError,
    authBusy: s.authBusy,
    submitAuth,
    toggleAuthMode: () => set({ authMode: s.authMode === "signup" ? "login" : "signup", authError: "" }),
    leaveSplash: () => {
      if (s.screen !== "splash") return;
      if (user) accounts.listProjects(user.id).then((projects) => set({ projects, screen: "projects" }));
      else set({ screen: "auth" });
    },
    userEmail: user ? user.email : "",
    inProject: !!s.projectId,
    cards,
    hasProjects: cards.length > 0,
    newProject: () => {
      const data = snapshot(fresh(app, { screen: "welcome" }));
      accounts.createProject(user.id, data).then((p) => app.setState(fresh(app, { ...data, projectId: p.id, saveStatus: "saved" }))).catch(fail);
    },
    toProjects,
    logOut: () =>
      saveNow(app)
        .then(() => accounts.logOut())
        .then(() => app.setState(fresh(app, { screen: "auth", user: null, projects: [], authMode: "login" }))),
    projectName,
    saveLabel,
    saveError: s.saveStatus === "error" ? s.saveError : "",
  };
}
