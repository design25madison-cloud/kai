import assert from "node:assert/strict";
import { after, mock, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

// BrandApp is JSX and its imports need Vite, so it's loaded through Vite's SSR loader, with
// stand-ins for the browser: a photo search that answers per `net`, and photos whose colors come
// from their URL and `net.hue`. Each boot() is a fresh set of modules, like another browser.
const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const net = { set: 1, hue: 0, hang: false, fail: false };
const store = new Map();
globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
globalThis.window = globalThis;
Object.assign(window, { scrollTo() {}, addEventListener() {}, removeEventListener() {} });
const ixid = "M3w2NTM0NzR8MHwxfHNlYXJjaHwxfHxsYWtlfGVufDB8fHx8MTcxOTk0MjM0Nnww";
globalThis.fetch = async (url) => {
  if (net.hang) return new Promise(() => {});
  if (net.fail) throw new TypeError("Failed to fetch");
  const q = new URL(url, "http://x").searchParams.get("query") || "x", id = q.replace(/\W/g, "") + net.set;
  // Shaped and sized like a real Unsplash answer, so the stored size measured below is realistic.
  const photo = { id, urls: { regular: `https://images.unsplash.com/photo-1501785888041-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=${ixid}&ixlib=rb-4.0.3&q=80&w=1080` },
    user: { name: "Photographer Name", links: { html: "https://unsplash.com/@photographer" } }, links: { html: `https://unsplash.com/photos/some-photo-${id}`, download_location: `https://api.unsplash.com/photos/${id}/download?ixid=${ixid}` } };
  return { ok: true, status: 200, json: async () => ({ results: [photo] }) };
};
globalThis.Image = class { set src(v) { this._src = v; setTimeout(() => this.onload(), 0); } get src() { return this._src; } };
const hash = (s) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 360, 7);
const canvas = () => {
  let src = "";
  return { getContext: () => ({ drawImage: (img) => { src = img.src; }, getImageData: () => {
    const [h, data] = [(hash(src) + net.hue) % 360, new Uint8ClampedArray(40 * 40 * 4)];
    const f = (n) => { const k = (n + h / 30) % 12; return Math.round(255 * (0.5 - 0.4 * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    for (let i = 0; i < data.length; i += 4) data.set(i < data.length / 2 ? [f(0), f(8), f(4), 255] : [236, 232, 226, 255], i); // Half a vivid color, half a pale neutral.
    return { data };
  } }) };
};
globalThis.document = { fonts: { add() {}, load: () => Promise.resolve() }, createElement: (tag) => (tag === "canvas" ? canvas() : { dataset: {}, style: {} }), head: { appendChild() {} }, querySelector: () => null };
globalThis.FontFace = class { load() { return Promise.resolve(this); } };

const servers = [];
after(() => Promise.all(servers.map((s) => s.close())));
async function boot() {
  const server = await createServer({ root: ROOT, configFile: ROOT + "vite.config.js", server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: "custom", logLevel: "error" });
  servers.push(server);
  const load = (p) => server.ssrLoadModule(p);
  const [{ default: BrandApp }, gen, refs, projects, accounts, exports] = await Promise.all(["/src/app/BrandApp.jsx", "/src/app/generate.js", "/src/app/referenceImages.js", "/src/app/projects.js", "/src/app/accounts.js", "/src/app/exports.js"].map(load));
  // React's part: render after every change, then componentDidUpdate.
  const make = (state) => {
    const app = new BrandApp({});
    app.setState = function (p) { const prev = this.state; this.state = { ...prev, ...(typeof p === "function" ? p(prev) : p) }; this.vm = this.renderVals(); this.componentDidUpdate({}, prev); };
    app.forceUpdate = function () { this.vm = this.renderVals(); this.componentDidUpdate({}, this.state); };
    app.componentDidMount();
    if (state) app.setState(state);
    return app;
  };
  return { make, gen, refs, projects, accounts, exports };
}
const until = async (ok, what) => { for (let n = 0; n < 500; n++) { if (ok()) return; await new Promise((r) => setTimeout(r, 10)); } assert.fail("timed out waiting for " + what); };
const shown = (app) => app.opts().slice(0, 3).map((_, k) => app.optionData(k).colors.map((c) => c.show));
// Postgres jsonb, where the hosted server keeps projects, gives keys back in its own order.
const sortKeys = (v) => (Array.isArray(v) ? v.map(sortKeys) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().reverse().map((k) => [k, sortKeys(v[k])])) : v);

let first; // The project from the first test, saved, as later visits load it.
const brief = (make) => {
  const app = make();
  const smp = app.sampleState();
  return Object.assign(smp, { f: Object.assign(app.blankF(), smp.f, { problem: "Slow audits", diff: "Faster" }), domains: ["ferra.example"] });
};

test("directions are stored once the photos they read have landed, and another visit shows them as stored", async () => {
  Object.assign(net, { set: 1, hue: 0 });
  store.clear();
  const a = await boot();
  const app = a.make();
  app.setState(Object.assign(brief(a.make), { screen: "out" }));
  assert.equal(app.state.dirs, null, "nothing is stored while photo searches and color reads are still running");
  await until(() => app.state.dirs, "the directions to be stored");
  assert.equal(app.state.dirs.v, a.gen.GEN_VERSION);
  const before = shown(app), labels = Object.keys(app.state.dirs.images);
  assert.ok(labels.length > 0, "searched photos are stored with the directions");
  first = sortKeys(JSON.parse(JSON.stringify(app.state)));

  // Another browser, a week later: the search now finds other photos, with other colors.
  Object.assign(net, { set: 2, hue: 140 });
  store.clear();
  const b = await boot();
  const reopened = b.make(Object.assign({}, first, { screen: "out" }));
  assert.deepEqual(shown(reopened), before, "the stored palettes are shown");
  const css = b.exports.tokensCss(reopened.current(), b.exports.ALL_SECTIONS);
  assert.ok(before[reopened.state.option].every((hex) => css.includes(hex)), "exports use the stored palette");
  const label = labels[0];
  assert.equal(b.refs.referenceImage(label).src, first.dirs.images[label].src, "the stored photo is shown, not the new search result");
  // A stored photo that no longer loads falls back to searching again.
  b.refs.brokenImage(first.dirs.images[label].src);
  await until(() => b.refs.referenceImage(label) && /-\w+2\?/.test(b.refs.referenceImage(label).src), "the photo to be searched again");
  assert.deepEqual(shown(reopened), before, "a broken photo doesn't move the stored palette");

  // Without the stored copy, the same project would now come out differently.
  const live = b.make(Object.assign({}, first, { screen: "out", dirs: null }));
  await until(() => live.state.dirs, "the live directions to be stored");
  assert.notDeepEqual(shown(live), before);
});

test("a stored copy with another version is ignored and stored again", async () => {
  const a = await boot();
  const old = JSON.parse(JSON.stringify(first.dirs));
  old.v = a.gen.GEN_VERSION + 1;
  old.directions.forEach((d) => d.palettes.forEach((p) => { p[0][1] = "#123456"; }));
  delete old.directions[0].palettes; // A shape this build can't read: rendering it would throw.
  const app = a.make(Object.assign({}, first, { screen: "out", dirs: old }));
  assert.ok(shown(app).every((p) => p[0] !== "#123456"), "computed live instead");
  await until(() => app.state.dirs.v === a.gen.GEN_VERSION, "the directions to be stored again");
  assert.ok(app.state.dirs.directions[0].palettes.length > 0);
});

test("Generate replaces the stored copy; Back to results works after a reload while the answers are unchanged", async () => {
  const a = await boot();
  const tampered = JSON.parse(JSON.stringify(first.dirs));
  tampered.directions.forEach((d) => d.palettes.forEach((p) => { p[0][1] = "#123456"; }));
  const app = a.make(Object.assign({}, first, { screen: "brief", step: 5, dirs: tampered }));
  assert.ok(app.vm.canReturn, "Back to results is offered after a reload");
  app.vm.backToResults();
  assert.equal(app.optionData(0).colors[0].show, "#123456", "the stored copy is what's shown");
  app.setState({ screen: "brief", f: Object.assign({}, app.state.f, { name: "Ferro" }) });
  assert.equal(app.vm.canReturn, false, "changed answers need Generate");
  app.setState({ f: Object.assign({}, app.state.f, { name: first.f.name }) });

  let tick;
  const realInterval = globalThis.setInterval;
  globalThis.setInterval = (fn) => { tick = fn; return 0; };
  try { app.vm.generate(); } finally { globalThis.setInterval = realInterval; }
  assert.equal(app.state.dirs, null, "Generate drops the stored copy");
  for (let k = 0; k < 5; k++) tick();
  assert.equal(app.state.screen, "out");
  await until(() => app.state.dirs, "the new directions to be stored");
  assert.ok(shown(app).every((p) => p[0] !== "#123456"), "fresh directions from the answers");
  assert.deepEqual(app.state.dirs.directions, JSON.parse(JSON.stringify(a.gen.generateDirections(app.state, (h, t) => app.adjust(h, t)).directions)));
});

test("lookups that fail, or never finish, don't keep a project from being stored", async () => {
  net.fail = true;
  store.clear();
  let a = await boot();
  let app = a.make(Object.assign({}, first, { screen: "out", dirs: null }));
  await until(() => app.state.dirs, "the directions to be stored after failed searches");
  net.fail = false;

  net.hang = true;
  store.clear();
  a = await boot();
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    app = a.make(Object.assign({}, first, { screen: "out", dirs: null }));
    mock.timers.tick(29000);
    assert.equal(app.state.dirs, null, "still live while searches might land");
    mock.timers.tick(1000);
    assert.equal(app.state.dirs.v, a.gen.GEN_VERSION, "stored after 30 seconds");
  } finally {
    mock.timers.reset();
    net.hang = false;
  }
});

test("the stored copy survives a save and a reload unchanged, and stays small", async (t) => {
  store.clear();
  const a = await boot();
  const user = await a.accounts.logIn("test@example.com");
  const app = a.make({ user, screen: "projects" });
  a.projects.projectVals(app).newProject();
  await until(() => app.state.projectId, "the project to be created");
  app.setState(Object.assign({}, first, { user, projectId: app.state.projectId, projects: [], screen: "out" }));
  await a.projects.saveNow(app);

  const again = a.make({ user, screen: "projects", projects: [{ id: app.state.projectId, name: "Ferra", updatedAt: 1 }] });
  a.projects.projectVals(again).cards[0].open();
  await until(() => again.state.projectId, "the project to open");
  assert.deepEqual(again.state.dirs, first.dirs);
  assert.deepEqual(shown(again), shown(app));
  const card = (await a.accounts.listProjects(user.id))[0];
  assert.deepEqual(card.swatches, app.current().colors.map((c) => c.show), "the project card shows the stored palette");

  const data = (await a.accounts.loadProject(user.id, app.state.projectId)).data, size = (x) => new TextEncoder().encode(JSON.stringify(x)).length;
  t.diagnostic(`saved project ${size(data)} bytes: directions ${size(data.dirs.directions)}, photos ${size(data.dirs.images)} (${Object.keys(data.dirs.images).length})`);
  assert.ok(size(data) < 60000, "small enough for the save made while a tab closes");
});
