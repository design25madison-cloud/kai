import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { mock, test } from "node:test";

// store.js picks the storage with import.meta.env, which only Vite provides, so projects.js gets this fake instead.
const saves = [];
globalThis.testAccounts = {
  saveProject: (userId, id, data, summary, version, closing) => new Promise((resolve, reject) => saves.push({ data, version, closing, resolve, reject })),
  loadProject: async (userId, id) => ({ id, updatedAt: 1, data: { screen: "brief", step: 2, f: { name: "Ferra" } } }),
  listProjects: async () => [],
};
registerHooks({
  resolve: (specifier, context, next) =>
    specifier === "./store.js" && context.parentURL.endsWith("/projects.js") ? { url: "data:text/javascript,export default globalThis.testAccounts", shortCircuit: true } : next(specifier, context),
});
const { projectVals, saveNow, scheduleSave } = await import("./projects.js");

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
