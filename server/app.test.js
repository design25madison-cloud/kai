// Needs a Postgres to talk to (PGHOST and friends). Run with: npm test
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import pg from "pg";
import { createApp, SCHEMA } from "./app.js";

const pool = new pg.Pool();
const run = randomUUID();
const ana = `ana-${run}@test`;
const ben = `ben-${run}@test`;
let server, base;

// Stands in for Google Cloud: a bucket in memory, a converter and a model that answer on cue.
const bucket = new Map();
const asked = [];
let modelAnswer = {};
const cloud = {
  uri: (name) => `gs://test/${name}`,
  put: async (name, bytes) => void bucket.set(name, bytes),
  remove: async (name) => void bucket.delete(name),
  toPdf: async () => Buffer.from("%PDF-converted"),
  generate: async (request) => {
    asked.push(request);
    if (modelAnswer instanceof Error) throw modelAnswer;
    return modelAnswer;
  },
};
const PDF = Buffer.from("%PDF-1.7 test");
const PPTX = Buffer.from([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]);

// The test signs people in with a header. The real server never does this.
before(async () => {
  await pool.query(SCHEMA);
  const app = createApp({ pool, cloud, identify: async (req) => req.get("x-test-user") || null });
  server = app.listen(0);
  base = `http://localhost:${server.address().port}/api`;
});
after(async () => {
  await pool.query("delete from projects where owner in ($1, $2)", [ana, ben]);
  await pool.query("delete from fills where owner in ($1, $2)", [ana, ben]);
  server.close();
  await pool.end();
});

async function call(user, method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: { ...(user ? { "x-test-user": user } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function upload(user, projectId, name, bytes) {
  const res = await fetch(`${base}/projects/${projectId}/files`, {
    method: "POST",
    headers: { "x-test-user": user, "X-File-Name": encodeURIComponent(name), "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  return { status: res.status, body: await res.json() };
}

test("a project saves, reloads, and keeps a name typed in the project list", async () => {
  const created = (await call(ana, "POST", "/projects", { data: { screen: "welcome" } })).body;
  assert.equal(created.name, "Untitled brand");

  await call(ana, "PUT", `/projects/${created.id}`, { data: { screen: "brief" }, summary: { name: "Ferra", where: "Brief step 2" } });
  let loaded = (await call(ana, "GET", `/projects/${created.id}`)).body;
  assert.deepEqual([loaded.name, loaded.where, loaded.data.screen], ["Ferra", "Brief step 2", "brief"]);

  await call(ana, "POST", `/projects/${created.id}/rename`, { name: "Ferra v2" });
  await call(ana, "PUT", `/projects/${created.id}`, { data: { screen: "out" }, summary: { name: "Ferra" } });
  loaded = (await call(ana, "GET", `/projects/${created.id}`)).body;
  assert.equal(loaded.name, "Ferra v2");

  const copy = (await call(ana, "POST", `/projects/${created.id}/duplicate`)).body;
  assert.equal(copy.name, "Ferra v2 copy");
  const list = (await call(ana, "GET", "/projects")).body;
  assert.equal(list.length, 2);
  assert.equal(list[0].data, undefined);
});

test("nobody else can see or change a project", async () => {
  const { id } = (await call(ana, "POST", "/projects", { data: { secret: true } })).body;

  assert.deepEqual((await call(ben, "GET", "/projects")).body, []);
  assert.equal((await call(ben, "GET", `/projects/${id}`)).status, 404);
  assert.equal((await call(ben, "PUT", `/projects/${id}`, { data: { hacked: true } })).status, 404);
  assert.equal((await call(ben, "POST", `/projects/${id}/rename`, { name: "Mine" })).status, 404);
  assert.equal((await call(ben, "POST", `/projects/${id}/duplicate`)).status, 404);
  await call(ben, "DELETE", `/projects/${id}`);
  assert.equal((await call(null, "GET", `/projects/${id}`)).status, 401);

  const mine = (await call(ana, "GET", `/projects/${id}`)).body;
  assert.deepEqual([mine.name, mine.data], ["Untitled brand", { secret: true }]);
});

test("bad input is refused", async () => {
  assert.equal((await call(ana, "POST", "/projects", { data: "nope" })).status, 400);
  assert.equal((await call(ana, "GET", "/projects/not-a-uuid")).status, 404);
});

test("files upload, convert, and are deleted with the file or the project", async () => {
  const { id } = (await call(ana, "POST", "/projects", { data: {} })).body;

  const pdf = (await upload(ana, id, "Pitch deck.pdf", PDF)).body;
  assert.deepEqual([pdf.name, pdf.kind, pdf.size], ["Pitch deck.pdf", "pdf", PDF.length]);
  await upload(ana, id, "../../Kickoff.pptx", PPTX);
  const files = (await call(ana, "GET", `/projects/${id}/files`)).body;
  assert.deepEqual(files.map((f) => f.name), ["Pitch deck.pdf", "Kickoff.pptx"]);
  // The deck is stored twice: as uploaded, and as the PDF the model reads.
  const mine = () => [...bucket.keys()].filter((k) => k.startsWith(`projects/${id}/`));
  assert.equal(mine().length, 3);

  await call(ana, "DELETE", `/projects/${id}/files/${pdf.id}`);
  assert.equal(mine().length, 2);
  await call(ana, "DELETE", `/projects/${id}`);
  assert.equal(mine().length, 0);
});

test("uploads are checked, and nobody else can reach them", async () => {
  const { id } = (await call(ana, "POST", "/projects", { data: {} })).body;

  assert.equal((await upload(ana, id, "tool.exe", PDF)).status, 415);
  assert.equal((await upload(ana, id, "renamed.pdf", Buffer.from("not a pdf"))).status, 415);
  assert.equal((await upload(ana, id, "noextension", PDF)).status, 415);
  assert.equal((await upload(ben, id, "deck.pdf", PDF)).status, 404);

  const file = (await upload(ana, id, "deck.pdf", PDF)).body;
  assert.equal((await call(ben, "GET", `/projects/${id}/files`)).status, 404);
  await call(ben, "DELETE", `/projects/${id}/files/${file.id}`);
  assert.equal((await call(ana, "GET", `/projects/${id}/files`)).body.length, 1);

  for (let k = 1; k < 10; k++) await upload(ana, id, `deck-${k}.pdf`, PDF);
  assert.equal((await upload(ana, id, "one-too-many.pdf", PDF)).status, 409);
});

test("a fill sends the material to the model and returns only checked answers", async () => {
  const { id } = (await call(ana, "POST", "/projects", { data: {} })).body;
  assert.equal((await call(ana, "POST", `/projects/${id}/fill`, { text: "  " })).status, 400);

  await upload(ana, id, "Kickoff.pptx", PPTX);
  modelAnswer = {
    name: " Ferra ", desc: "Not known", industry: "made-up", who: "buyer", hacked: "<script>",
    tone: ["sturdy", "quirky", "sturdy"], keepC: ["#2a6f4d", "red"], buyerCares: ["roi", "Vibes"],
    comps: [{ name: "Acme", url: "acme.com" }, { url: "no-name.com" }],
    looks: { temperature: "Warm", shape: "Round" }, sliders: { warmth: 140, energy: "high" },
  };
  const { status, body } = await call(ana, "POST", `/projects/${id}/fill`, { text: "We sell steel." });
  assert.equal(status, 200);
  assert.deepEqual(body.fill, {
    f: { name: "Ferra", who: "buyer" },
    tone: ["Sturdy", "Quirky"], buyerCares: ["ROI"], keepC: ["#2A6F4D"],
    comps: [{ name: "Acme", url: "acme.com" }],
    looks: { 0: "a" }, sl: { warmth: 100 },
  });
  assert.equal(body.count, 8);

  // The model was pointed at the converted PDF, not the PowerPoint, and got the pasted notes.
  const request = asked.at(-1);
  assert.equal(request.text, "We sell steel.");
  assert.match(request.files[0].uri, /^gs:\/\/test\/projects\/.+\.pdf$/);
  assert.equal(request.files[0].mimeType, "application/pdf");

  assert.equal((await call(ben, "POST", `/projects/${id}/fill`, { text: "mine now" })).status, 404);
});

test("fills stop at the daily limit", async () => {
  const { id } = (await call(ben, "POST", "/projects", { data: {} })).body;
  await pool.query("insert into fills (owner) select $1 from generate_series(1, 20)", [ben]);
  const before = asked.length;
  assert.equal((await call(ben, "POST", `/projects/${id}/fill`, { text: "one more" })).status, 429);
  assert.equal(asked.length, before);
});

test("gap suggestions send the answers so far and need a description", async () => {
  const { id } = (await call(ana, "POST", "/projects", { data: {} })).body;
  assert.equal((await call(ana, "POST", `/projects/${id}/fill`, { text: "", brief: { name: "Ferra" } })).status, 400);

  modelAnswer = { meaning: "Fe, iron.", domains: ["made-up.com"] };
  const { status, body } = await call(ana, "POST", `/projects/${id}/fill`, { text: "", brief: { name: "Ferra", desc: "Steel for builders.", tone: ["Sturdy"], hacked: "x".repeat(5000) } });
  assert.equal(status, 200);
  assert.equal(body.fill.f.meaning, "Fe, iron.");
  // The model got the cleaned answers, and was asked to draft the rest.
  const request = asked.at(-1);
  assert.match(request.ask, /"desc":"Steel for builders\."/);
  assert.doesNotMatch(request.ask, /xxxxx/);
  assert.match(request.system, /draft answers for the rest/i);
});

test("an edit keeps only a usable change to the piece that was picked", async () => {
  const { id } = (await call(ana, "POST", "/projects", { data: {} })).body;
  const palette = { colors: [{ name: "Forest", hex: "#245A46" }, { name: "Amber", hex: "#DA9B4E" }], targets: [0], banned: ["cheap"] };
  const edit = (sec, ctx, text = "make it navy") => call(ana, "POST", `/projects/${id}/edit`, { sec, text, ctx });

  assert.equal((await edit("palette", palette, "  ")).status, 400);
  assert.equal((await edit("nope", palette)).status, 400);
  assert.equal((await edit("palette", { colors: [{ name: "Bad", hex: "red" }], targets: [0] })).status, 400);
  assert.equal((await call(ben, "POST", `/projects/${id}/edit`, { sec: "palette", text: "mine", ctx: palette })).status, 404);

  // Color 1 wasn't picked, so the model's change to it is dropped.
  modelAnswer = { summary: " Shifted Forest to navy. ", colors: [{ index: 0, hex: "#1f3a5f", name: "Navy" }, { index: 1, hex: "#000000", name: "Black" }, { index: 0, hex: "oops" }] };
  let res = await edit("palette", palette);
  assert.deepEqual(res.body, { summary: "Shifted Forest to navy.", colors: [{ index: 0, hex: "#1F3A5F", name: "Navy" }] });
  assert.match(asked.at(-1).ask, /Change only the colors at these positions: 0/);
  assert.match(asked.at(-1).ask, /"make it navy"/);

  // A typeface outside the list the browser offered is refused.
  const type = { fonts: ["Archivo", "Barlow"], display: "Archivo", body: "Barlow" };
  modelAnswer = { summary: "Swapped.", display: "Comic Sans MS", body: "Barlow" };
  assert.equal((await edit("type", type)).status, 502);
  modelAnswer = { summary: "Swapped.", display: "Barlow", body: "Archivo" };
  assert.deepEqual((await edit("type", type)).body, { summary: "Swapped.", display: "Barlow", body: "Archivo" });

  // Voice copy can't use a restricted word.
  const voice = { toneArr: [["Clear", "dry"]], headline: "Run the yard.", banned: ["cheap"] };
  modelAnswer = { summary: "Rewrote.", tone: [{ yes: "Bold", no: "loud" }], headline: "Cheap and fast." };
  assert.equal((await edit("voice", voice)).status, 502);
  modelAnswer = { summary: "Rewrote.", tone: [{ yes: "Bold", no: "loud" }], headline: "Built to last." };
  assert.deepEqual((await edit("voice", voice)).body, { summary: "Rewrote.", tone: [["Bold", "loud"]], headline: "Built to last." });

  // Edits have their own daily limit, apart from fills.
  await pool.query("insert into fills (owner, kind) select $1, 'edit' from generate_series(1, 200)", [ana]);
  assert.equal((await edit("voice", voice)).status, 429);
  assert.equal((await call(ana, "POST", `/projects/${id}/fill`, { text: "still allowed" })).status, 200);
});

test("a failed AI call says why and doesn't count against the daily limit", async () => {
  const { id } = (await call(ben, "POST", "/projects", { data: {} })).body;
  const uses = async () => (await pool.query("select count(*)::int as n from fills where owner = $1 and created_at > now() - interval '1 minute' and kind = any($2)", [ben, ["fill", "edit"]])).rows[0].n;
  await pool.query("delete from fills where owner = $1", [ben]);

  modelAnswer = new Error("model is down");
  const fill = await call(ben, "POST", `/projects/${id}/fill`, { text: "We sell steel." });
  assert.equal(fill.status, 502);
  assert.match(fill.body.error, /didn't answer/); // The written message, not the generic 5xx one.
  const voice = { toneArr: [["Clear", "dry"]], headline: "Run the yard." };
  assert.equal((await call(ben, "POST", `/projects/${id}/edit`, { sec: "voice", text: "warmer", ctx: voice })).status, 502);
  // The model answered, but with nothing usable: also free.
  modelAnswer = { summary: "Rewrote.", tone: [], headline: "" };
  assert.equal((await call(ben, "POST", `/projects/${id}/edit`, { sec: "voice", text: "warmer", ctx: voice })).status, 502);
  assert.equal(await uses(), 0);

  modelAnswer = { name: "Ferra" };
  assert.equal((await call(ben, "POST", `/projects/${id}/fill`, { text: "We sell steel." })).status, 200);
  assert.equal(await uses(), 1);
});

test("a deck comes back as a PDF, and only a deck is accepted", async () => {
  const send = (user, bytes) => fetch(`${base}/deck-pdf`, { method: "POST", headers: { "x-test-user": user, "Content-Type": "application/octet-stream" }, body: bytes });
  const ok = await send(ana, PPTX);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("content-type"), "application/pdf");
  assert.equal(Buffer.from(await ok.arrayBuffer()).toString(), "%PDF-converted");
  assert.equal((await send(ana, PDF)).status, 400);
  assert.equal((await send("", PPTX)).status, 401);
});
