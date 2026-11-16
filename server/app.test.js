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

// The test signs people in with a header. The real server never does this.
before(async () => {
  await pool.query(SCHEMA);
  const app = createApp({ pool, identify: async (req) => req.get("x-test-user") || null });
  server = app.listen(0);
  base = `http://localhost:${server.address().port}/api`;
});
after(async () => {
  await pool.query("delete from projects where owner in ($1, $2)", [ana, ben]);
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
