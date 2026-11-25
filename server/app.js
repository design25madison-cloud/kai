// The hosted server: saved projects in Postgres, the Unsplash proxy, and the built app's files.
// Every project query filters by owner, so people only ever see their own projects.
import express from "express";
import { addEditRoutes } from "./edit.js";
import { MATERIALS_SCHEMA, addMaterialsRoutes, projectObjects, removeObjects } from "./materials.js";

export const SCHEMA = `
  create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    owner text not null,
    name text not null default 'Untitled brand',
    renamed boolean not null default false,
    summary jsonb not null default '{}',
    data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  create index if not exists projects_owner on projects (owner, updated_at desc);
  create table if not exists unsplash_searches (
    url text primary key,
    body text not null,
    fetched_at timestamptz not null default now()
  );
${MATERIALS_SCHEMA}`;
// shortcut: the schema is applied at startup with "if not exists", which can't change a column. Adopt a migration tool at the first schema change.

// A project's version is its updated_at in milliseconds: what the client gets back, and sends with each save.
const UPDATED_MS = "(extract(epoch from updated_at) * 1000)::bigint";
const COLS = `id, name, renamed, summary,
  (extract(epoch from created_at) * 1000)::bigint as created_ms,
  ${UPDATED_MS} as updated_ms`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// The only Unsplash calls the app makes (src/app/imageSearch.js).
const UNSPLASH = /^\/(search\/photos|photos\/[\w-]+\/download)$/;

// The shape the screens already use (see src/app/accounts.js).
const toProject = (r) => ({
  ...r.summary,
  id: r.id,
  name: r.name,
  renamed: r.renamed,
  createdAt: Number(r.created_ms),
  updatedAt: Number(r.updated_ms),
  ...(r.data ? { data: r.data } : {}),
});

function fail(status, message) {
  return Object.assign(new Error(message), { status });
}
const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);
const cleanName = (name) => (typeof name === "string" ? name.trim().slice(0, 200) : "");

function parseSave(body) {
  const { data, summary = {} } = body || {};
  if (!isObject(data) || !isObject(summary)) throw fail(400, "That project couldn't be read.");
  const { name, ...rest } = summary;
  return { data, name: cleanName(name) || null, rest };
}

// identify(req) returns the signed-in person's email, or null. unsplashKey is optional. cloud is the
// Google Cloud client from cloud.js; without it, uploads and filling from materials answer 503.
export function createApp({ pool, identify, unsplashKey, staticDir, cloud }) {
  const app = express();
  const api = express.Router();

  api.use(express.json({ limit: "1mb" }));
  api.use(async (req, res, next) => {
    const email = await identify(req).catch(() => null);
    if (!email) throw fail(401, "You're not signed in.");
    req.email = email.toLowerCase();
    next();
  });
  api.param("id", (req, res, next, id) => {
    if (!UUID.test(id)) throw fail(404, "That project no longer exists.");
    next();
  });
  const one = (result) => {
    if (!result.rows[0]) throw fail(404, "That project no longer exists.");
    return result.rows[0];
  };

  api.get("/me", (req, res) => res.json({ email: req.email }));

  api.get("/projects", async (req, res) => {
    // A New brand left by closing the tab or reloading holds nothing a person made, so it goes after a week.
    // Untouched: never edited or renamed (a save of only where you were keeps updated_at), never copied,
    // and no uploads (they don't change the project row). A week, so one still open in a tab isn't pulled away.
    await pool.query(
      `delete from projects p where owner = $1 and not renamed and created_at = updated_at
         and updated_at < now() - interval '7 days' and summary->'copied' is null
         and not exists (select 1 from project_files f where f.project_id = p.id)`,
      [req.email],
    );
    const { rows } = await pool.query(`select ${COLS} from projects where owner = $1 order by updated_at desc`, [req.email]);
    res.json(rows.map(toProject));
  });

  api.post("/projects", async (req, res) => {
    const { data, name, rest } = parseSave(req.body);
    const result = await pool.query(
      `insert into projects (owner, name, summary, data) values ($1, coalesce($2, 'Untitled brand'), $3, $4) returning ${COLS}, data`,
      [req.email, name, rest, data],
    );
    res.json(toProject(one(result)));
  });

  api.get("/projects/:id", async (req, res) => {
    const result = await pool.query(`select ${COLS}, data from projects where id = $1 and owner = $2`, [req.params.id, req.email]);
    res.json(toProject(one(result)));
  });

  api.put("/projects/:id", async (req, res) => {
    const { data, name, rest } = parseSave(req.body);
    const version = Number.isSafeInteger(req.body.updatedAt) ? req.body.updatedAt : null;
    // A name someone typed in the project list wins over the brief's working name. Only the version the
    // tab last saw is replaced, so a stale tab can't overwrite newer work. A save of only where the person
    // was (edited: false) keeps the version: its content is what that version already holds.
    const result = await pool.query(
      `update projects set name = case when renamed then name else coalesce($3, name) end,
         summary = summary || $4, data = $5, updated_at = case when $7 then now() else updated_at end
       where id = $1 and owner = $2 and ${UPDATED_MS} = $6 returning ${COLS}`,
      [req.params.id, req.email, name, rest, data, version, req.body.edited !== false],
    );
    if (!result.rows[0] && (await pool.query(`select 1 from projects where id = $1 and owner = $2`, [req.params.id, req.email])).rows[0]) {
      throw fail(409, "This project was changed in another tab or device. Reload the page to get the latest.");
    }
    res.json({ updatedAt: toProject(one(result)).updatedAt });
  });

  api.post("/projects/:id/rename", async (req, res) => {
    const result = await pool.query(
      `update projects set name = $3, renamed = true, updated_at = now() where id = $1 and owner = $2 returning ${COLS}`,
      [req.params.id, req.email, cleanName(req.body && req.body.name) || "Untitled brand"],
    );
    res.json(toProject(one(result)));
  });

  api.post("/projects/:id/duplicate", async (req, res) => {
    // The source is marked as copied, so it's never cleaned up as untouched (see GET /projects).
    const result = await pool.query(
      `with source as (update projects set summary = summary || '{"copied": true}' where id = $1 and owner = $2 returning owner, name, summary, data)
       insert into projects (owner, name, renamed, summary, data)
       select owner, left(name || ' copy', 200), true, summary, data from source
       returning ${COLS}, data`,
      [req.params.id, req.email],
    );
    res.json(toProject(one(result)));
  });

  api.delete("/projects/:id", async (req, res) => {
    // The file rows go with the project (cascade), so collect what they point at first.
    const objects = cloud ? await projectObjects(pool, req.params.id, req.email) : [];
    await pool.query(`delete from projects where id = $1 and owner = $2`, [req.params.id, req.email]);
    if (objects.length) await removeObjects(cloud, objects);
    res.json({});
  });

  addMaterialsRoutes(api, { pool, cloud });
  addEditRoutes(api, { pool, cloud });

  // /api/unsplash/... → api.unsplash.com/... with the key attached, so the key never reaches the browser.
  api.use("/unsplash", async (req, res) => {
    if (!UNSPLASH.test(req.path)) throw fail(404, "Not found.");
    if (req.method !== "GET") throw fail(405, "Not allowed.");
    if (!unsplashKey) throw fail(401, "No Unsplash key is set."); // The app falls back to Wikimedia Commons.
    // A search is remembered for a week and shared by everyone: a demo key allows 50 calls an hour,
    // and every project draws its photo keywords from the same fixed list. Only searches are kept;
    // the "photo was used" calls must always reach Unsplash.
    const search = req.path === "/search/photos" && req.url.length <= 300;
    const kept = search ? (await pool.query(`select body, fetched_at > now() - interval '7 days' as fresh from unsplash_searches where url = $1`, [req.url])).rows[0] : null;
    if (kept && kept.fresh) return res.type("application/json").send(kept.body);

    const upstream = await fetch("https://api.unsplash.com" + req.url, {
      headers: { Authorization: `Client-ID ${unsplashKey}`, "Accept-Version": "v1" },
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    if (search && upstream.status === 200) {
      await pool.query(`insert into unsplash_searches (url, body) values ($1, $2) on conflict (url) do update set body = excluded.body, fetched_at = now()`, [req.url, body.toString()]);
    } else if (kept) {
      return res.type("application/json").send(kept.body); // Unsplash is over its limit or down: an old answer beats none.
    }
    res.status(upstream.status).type(upstream.headers.get("content-type") || "application/json");
    res.send(body);
  });

  api.use((req, res) => res.status(404).json({ error: "Not found." }));

  app.use("/api", api);
  if (staticDir) app.use(express.static(staticDir));

  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    const tooLarge = /\/(files|deck-pdf)$/.test(req.path) ? "That's over the size limit (25 MB per file)." : "That's too much to save at once.";
    const message = err.type === "entity.too.large" ? tooLarge : err.message;
    res.status(status).json({ error: status >= 500 && !err.expose ? "Something went wrong on the server." : message });
  });

  return app;
}
