import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { mock, test } from "node:test";

// store.js picks the storage with import.meta.env, which only Vite provides, so projects.js gets this fake instead.
const saves = [];
const deleted = [];
let stored = null; // What the next loadProject gives back, when a test sets it.
globalThis.testAccounts = {
  saveProject: (userId, id, data, summary, version, closing, edited) => new Promise((resolve, reject) => saves.push({ data, summary, version, closing, edited, resolve, reject })),
  loadProject: async (userId, id) => stored || { id, updatedAt: 1, data: { screen: "brief", step: 2, f: { name: "Ferra" } } },
  listProjects: async () => [],
  createProject: async (userId, data) => ({ id: "new", updatedAt: 9, data }),
  deleteProject: async (userId, id) => void deleted.push(id),
};
// The address bar, which projects.js keeps in step with the open project.
globalThis.window = { location: { hash: "" } };
window.history = { pushState: (a, b, hash) => (window.location.hash = hash), replaceState: (a, b, hash) => (window.location.hash = hash) };
globalThis.document = { title: "" };
registerHooks({
  resolve: (specifier, context, next) =>
    specifier === "./store.js" && context.parentURL.endsWith("/projects.js") ? { url: "data:text/javascript,export default globalThis.testAccounts", shortCircuit: true } : next(specifier, context),
});
const { followAddress, projectChanged, projectVals, saveNow, scheduleSave, syncAddress } = await import("./projects.js");

const settle = () => new Promise((resolve) => setImmediate(resolve));
const conflict = () => Object.assign(new Error("This project was changed in another tab or device."), { status: 409 });

test("saves go one at a time with the latest version, retry after a failure, and block leaving until they work", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const toasts = [];
  const app = {
    state: { user: { id: "u" }, projectId: null, projects: [], screen: "projects", f: { name: "" }, saveStatus: "saved" },
    _init: { screen: "welcome", f: { name: "" }, saveStatus: "saved" },
    setState(patch) { Object.assign(this.state, patch); },
    showToast: (msg) => toasts.push(msg),
  };
  const edit = (name) => { app.state.f = { name }; scheduleSave(app); };

  app.state.projects = [{ id: "p", name: "Ferra", updatedAt: 1 }];
  projectVals(app).cards[0].open();
  await settle();
  assert.equal(app.state.projectId, "p");

  // A save is in flight; edits meanwhile wait for it, then go once with the version it returned.
  edit("A");
  mock.timers.tick(700);
  edit("AB");
  mock.timers.tick(700);
  edit("ABC");
  mock.timers.tick(700);
  assert.equal(saves.length, 1);
  assert.equal(saves[0].version, 1);
  saves[0].resolve(2);
  await settle();
  assert.equal(saves.length, 2);
  assert.deepEqual([saves[1].version, saves[1].data.f.name, saves[1].closing], [2, "ABC", false]);

  // It fails: leaving is refused with the reason, and it's tried again about 5 seconds later.
  saves[1].reject(new Error("Your sign-in expired."));
  await settle();
  assert.equal(app.state.saveStatus, "error");
  edit("ABCD"); // Doesn't jump the queue: the waiting retry saves the latest.
  mock.timers.tick(4000);
  assert.equal(saves.length, 2);
  mock.timers.tick(1000);
  assert.deepEqual([saves.length, saves[2].version, saves[2].data.f.name], [3, 2, "ABCD"]);
  const leaving = projectVals(app).toProjects(); // Tries again at once, behind the retry in flight.
  saves[2].reject(new Error("Your sign-in expired."));
  await settle();
  saves[3].reject(new Error("Your sign-in expired."));
  await leaving;
  assert.equal(app.state.projectId, "p");
  assert.match(toasts.at(-1), /aren't saved yet. Your sign-in expired/);

  // Signed in again: the next retry works, keeps the new version, and leaving is allowed.
  mock.timers.tick(5000);
  saves[4].resolve(3);
  await settle();
  assert.deepEqual([app.state.saveStatus, saves[4].version], ["saved", 2]);
  edit("ABCDE");
  saveNow(app, { closing: true });
  assert.deepEqual([saves[5].version, saves[5].closing], [3, true]);
  saves[5].resolve(4);
  edit("ABCDEF");
  const left = projectVals(app).toProjects();
  await settle();
  assert.deepEqual([saves.length, saves[6].version], [7, 4]);
  saves[6].resolve(5);
  await left;
  assert.equal(app.state.screen, "projects");
  mock.timers.reset();
});

test("a save refused as out of date stops saving and doesn't block leaving", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const toasts = [];
  const app = {
    state: { user: { id: "u" }, projectId: null, projects: [{ id: "p", name: "Ferra", updatedAt: 1 }], screen: "projects", f: { name: "" }, saveStatus: "saved" },
    _init: { screen: "welcome", f: { name: "" }, saveStatus: "saved" },
    setState(patch) { Object.assign(this.state, patch); },
    showToast: (msg) => toasts.push(msg),
  };
  projectVals(app).cards[0].open();
  await settle();
  const before = saves.length;
  app.state.f = { name: "Edited" };
  saveNow(app);
  saves.at(-1).reject(conflict());
  await settle();
  assert.equal(app.state.saveStatus, "conflict");
  assert.match(toasts.at(-1), /another tab or device/);
  assert.equal(projectVals(app).saveLabel, "Out of date, reload");

  app.state.f = { name: "More" };
  scheduleSave(app);
  mock.timers.tick(10000);
  assert.equal(saves.length, before + 1); // No retry, and no more saves over the newer work.
  await projectVals(app).toProjects();
  assert.equal(app.state.screen, "projects");
  mock.timers.reset();
});

// A fake BrandApp: setState applies at once and runs the autosave and address sync, as componentDidUpdate does.
function makeApp(projects = []) {
  const app = {
    state: { user: { id: "u" }, projectId: null, projects, screen: "projects", f: { name: "" }, saveStatus: "saved" },
    _init: { screen: "welcome", step: 1, option: 0, f: { name: "" }, dirs: null, path: "brief", projectId: null, saveStatus: "saved" },
    setState(patch, then) {
      const prev = this.state;
      this.state = { ...prev, ...patch };
      if (this.state.projectId && this.state.projectId === prev.projectId && projectChanged(prev, this.state)) scheduleSave(this);
      syncAddress(this, prev);
      if (then) then();
    },
    showToast: (msg) => app.toasts.push(msg),
    toasts: [],
    genInputs() { return JSON.stringify(this.state.f); },
    current: () => ({ colors: [{ show: "#0F5C4A" }] }),
  };
  return app;
}
const finished = { id: "p", updatedAt: 1, data: { screen: "brief", step: 3, option: 1, f: { name: "Ferra" }, dirs: { in: JSON.stringify({ name: "Ferra" }), directions: [{ name: "Forge" }, { name: "Anvil" }] } } };

test("opening a project and moving around isn't an edit: nothing is sent until something moves, and then quietly", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const app = makeApp([{ id: "p", name: "Ferra", updatedAt: 1 }]);
  stored = null;
  await projectVals(app).cards[0].open();
  const before = saves.length;
  app.setState({ step: 3 });
  assert.equal(app.state.saveStatus, "saved", "no Saving… for moving around");
  mock.timers.tick(700);
  assert.deepEqual([saves.length, saves.at(-1).edited, saves.at(-1).data.step], [before + 1, false, 3]);
  saves.at(-1).resolve(1); // The version stays.
  await settle();
  app.setState({ f: { name: "Ferro" } });
  assert.equal(app.state.saveStatus, "saving");
  mock.timers.tick(700);
  assert.deepEqual([saves.length, saves.at(-1).edited], [before + 2, true]);
  saves.at(-1).resolve(2);
  await settle();
  // Nothing new since that save: leaving sends nothing.
  await projectVals(app).toProjects();
  assert.deepEqual([saves.length, app.state.screen], [before + 2, "projects"]);
  mock.timers.reset();
});

test("a project with directions reopens on them unless its answers changed, and its card names the direction", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const app = makeApp();
  stored = finished; // Saved on the brief by an older version, answers unchanged.
  await projectVals(app).openProject("p");
  assert.equal(app.state.screen, "out");
  const before = saves.length;
  app.setState({ screen: "brief", step: 4 }); // Edit answers, only looking.
  mock.timers.tick(700);
  assert.deepEqual([saves.length, saves.at(-1).data.screen, saves.at(-1).summary.where, saves.at(-1).edited], [before + 1, "out", "Option 2: Anvil", false]);
  saves.at(-1).resolve(1);
  await settle();
  app.setState({ f: { name: "Ferro" } }); // A changed answer: the directions no longer match.
  mock.timers.tick(700);
  assert.deepEqual([saves.length, saves.at(-1).data.screen, saves.at(-1).summary.where], [before + 2, "brief", "Brief step 4"]);
  saves.at(-1).resolve(2);
  await settle();
  stored = null;
  mock.timers.reset();
});

test("a new brand left untouched isn't kept; one that was changed, or that existed before, is", async () => {
  const app = makeApp();
  deleted.length = 0;
  projectVals(app).newProject();
  await settle();
  assert.deepEqual([app.state.projectId, window.location.hash], ["new", "#/p/new"]);
  await projectVals(app).toProjects();
  assert.deepEqual([deleted, app.state.screen, window.location.hash], [["new"], "projects", "#/"]);

  projectVals(app).newProject();
  await settle();
  app.setState({ screen: "start", path: "brief" }); // A choice.
  const leaving = projectVals(app).toProjects();
  saves.at(-1).resolve(9);
  await leaving;
  assert.deepEqual(deleted, ["new"]);

  stored = null;
  await projectVals(app).openProject("p");
  await projectVals(app).toProjects();
  assert.deepEqual(deleted, ["new"]);
});

test("the address follows the open project, and Back, Forward and pasted links follow the address", async () => {
  const app = makeApp([{ id: "p", name: "Ferra", updatedAt: 1 }]);
  window.location.hash = "";
  stored = null;
  await projectVals(app).cards[0].open();
  assert.deepEqual([window.location.hash, document.title], ["#/p/p", "Ferra · KAI"]);
  // An in-page link to a section keeps the project's address.
  window.location.hash = "#sec-palette";
  followAddress(app);
  assert.equal(window.location.hash, "#/p/p");
  // Back to the list.
  window.location.hash = "#/";
  await followAddress(app);
  assert.deepEqual([app.state.projectId, app.state.screen, document.title], [null, "projects", "KAI"]);
  // Forward, or a pasted link, opens it again.
  window.location.hash = "#/p/p";
  await followAddress(app);
  assert.equal(app.state.projectId, "p");
  // A link to a project that isn't there shows the list and says so.
  testAccounts.loadProject = async () => { throw new Error("That project no longer exists."); };
  window.location.hash = "#/p/gone";
  await followAddress(app);
  await settle();
  assert.deepEqual([app.state.screen, window.location.hash, app.toasts.at(-1)], ["projects", "#/", "That project no longer exists."]);
});

test("local mode: a new brand left untouched for a week goes when the list loads; anything a person made stays", async () => {
  const kept = new Map();
  globalThis.localStorage = { getItem: (k) => kept.get(k) ?? null, setItem: (k, v) => kept.set(k, String(v)), removeItem: (k) => kept.delete(k) };
  const local = await import("./accounts.js");
  const { id: u } = await local.logIn("ana@test");
  const make = async (name) => (await local.createProject(u, { screen: "welcome" }, { name })).id;
  const ids = { left: await make("left"), answered: await make("answered"), moved: await make("moved"), renamed: await make("renamed"), copied: await make("copied"), recent: await make("recent") };
  await local.saveProject(u, ids.answered, { screen: "brief", f: { name: "Ferra" } }, {}, 0, false, true);
  await local.saveProject(u, ids.moved, { screen: "start" }, {}, 0, false, false); // Only where they were.
  await local.renameProject(u, ids.renamed, "Ferra");
  await local.duplicateProject(u, ids.copied);
  // Over a week passes for all but the recent one; the edits came a minute after creating.
  const key = `kai.projects.${u}`;
  const old = Date.now() - 8 * 24 * 60 * 60 * 1000;
  const edited = [ids.answered, ids.renamed];
  kept.set(key, JSON.stringify(JSON.parse(kept.get(key)).map((p) => (p.id === ids.recent ? p : { ...p, createdAt: old, updatedAt: edited.includes(p.id) ? old + 60000 : old }))));

  const names = (await local.listProjects(u)).map((p) => p.name).sort();
  assert.deepEqual(names, ["Ferra", "answered", "copied", "copied copy", "recent"].sort());
  assert.equal(JSON.parse(kept.get(key)).length, 5, "the abandoned ones are gone from storage too");
});
