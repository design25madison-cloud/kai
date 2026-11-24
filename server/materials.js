// Materials for a project: uploaded files, and filling the brief from them with Gemini.
// Like the project routes, every query filters by owner.
import { randomUUID } from "node:crypto";
import express from "express";
import { SCHEMA as FILL_SCHEMA, SYSTEM, SYSTEM_GAPS, sanitizeFill } from "./fill.js";

export const MATERIALS_SCHEMA = `
  create table if not exists project_files (
    id uuid primary key,
    project_id uuid not null references projects (id) on delete cascade,
    owner text not null,
    name text not null,
    kind text not null,
    size integer not null,
    object text not null,
    pdf_object text,
    created_at timestamptz not null default now()
  );
  create index if not exists project_files_project on project_files (project_id);
  create table if not exists fills (
    owner text not null,
    created_at timestamptz not null default now()
  );
  create index if not exists fills_owner on fills (owner, created_at);
  alter table fills add column if not exists kind text not null default 'fill';
`;

export const MAX_FILES = 10;
export const MAX_BYTES = 25 * 1024 * 1024;
export const MAX_TEXT = 100000;
export const FILLS_PER_DAY = 20;
export const PDFS_PER_DAY = 50;

// Accepted file types: what Gemini reads directly, plus the two the converter turns into PDF.
// The first bytes are checked too, so a renamed file is refused.
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const KINDS = {
  pdf: { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  png: { mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  jpg: { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  jpeg: { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", magic: ZIP, convert: true },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", magic: ZIP, convert: true },
};

// expose: the message is written for the person, so it is shown even for a 5xx (see app.js).
export function fail(status, message) {
  return Object.assign(new Error(message), { status, expose: true });
}

// Counts one AI call against the person's daily limit for that kind ("fill" or "edit"), or refuses it.
export async function spend(pool, owner, kind, limit, what) {
  const used = await pool.query(`select count(*)::int as n from fills where owner = $1 and kind = $2 and created_at > now() - interval '1 day'`, [owner, kind]);
  if (used.rows[0].n >= limit) throw fail(429, `You've reached today's limit of ${limit} ${what}. Try again tomorrow.`);
  // shortcut: the count and the insert are two queries, so parallel requests can pass the limit by a
  // few. Count inside one transaction with an advisory lock if the limit ever has to be exact.
  await pool.query(`insert into fills (owner, kind) values ($1, $2)`, [owner, kind]);
}

// Gives the use back when the AI call failed, so errors don't eat into the day's limit.
export function refund(pool, owner, kind) {
  return pool.query(`delete from fills where ctid in (select ctid from fills where owner = $1 and kind = $2 order by created_at desc limit 1)`, [owner, kind]);
}
const toFile = (r) => ({ id: r.id, name: r.name, kind: r.kind, size: r.size });

function fileName(header) {
  let name = "";
  try {
    name = decodeURIComponent(String(header || ""));
  } catch {
    // A name that isn't valid encoding is treated as missing.
  }
  // Keep the last path segment and drop control characters; the name is only ever shown, never used as a path.
  return name.split(/[\\/]/).pop().replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 120);
}

// Objects a project's files occupy in the bucket, for deleting them with the project.
export async function projectObjects(pool, projectId, owner) {
  const { rows } = await pool.query(`select object, pdf_object from project_files where project_id = $1 and owner = $2`, [projectId, owner]);
  return rows.flatMap((r) => [r.object, r.pdf_object]).filter(Boolean);
}

export function removeObjects(cloud, objects) {
  // A failed delete leaves an orphan in the private bucket, which is better than failing the request.
  return Promise.all(objects.map((o) => cloud.remove(o).catch((err) => console.error("Could not delete", o, err.message))));
}

export function addMaterialsRoutes(api, { pool, cloud }) {
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  api.param("fileId", (req, res, next, id) => {
    if (!UUID.test(id)) throw fail(404, "That file no longer exists.");
    next();
  });
  api.use("/projects/:id/files", (req, res, next) => {
    if (!cloud) throw fail(503, "File uploads aren't set up on this server.");
    next();
  });

  async function ownProject(req) {
    const { rows } = await pool.query(`select 1 from projects where id = $1 and owner = $2`, [req.params.id, req.email]);
    if (!rows[0]) throw fail(404, "That project no longer exists.");
  }
  const filesOf = (req) => pool.query(`select * from project_files where project_id = $1 and owner = $2 order by created_at`, [req.params.id, req.email]);

  api.get("/projects/:id/files", async (req, res) => {
    await ownProject(req);
    res.json((await filesOf(req)).rows.map(toFile));
  });

  // The file is the request body; its name comes in the X-File-Name header (URL-encoded).
  api.post("/projects/:id/files", express.raw({ type: () => true, limit: MAX_BYTES }), async (req, res) => {
    await ownProject(req);
    const bytes = req.body;
    const name = fileName(req.get("x-file-name"));
    const kind = (name.split(".").pop() || "").toLowerCase();
    const type = KINDS[kind];
    if (!type || !name.includes(".")) throw fail(415, "That file type isn't supported. Add a PDF, PNG, JPG, PowerPoint (.pptx) or Word (.docx) file.");
    if (!Buffer.isBuffer(bytes) || !bytes.length) throw fail(400, "That file is empty.");
    if (!type.magic.every((b, i) => bytes[i] === b)) throw fail(415, `${name} doesn't look like a .${kind} file.`);
    if ((await filesOf(req)).rows.length >= MAX_FILES) throw fail(409, `A project can hold ${MAX_FILES} files. Remove one to add another.`);

    const id = randomUUID();
    const object = `projects/${req.params.id}/${id}.${kind}`;
    const stored = [];
    try {
      await cloud.put(object, bytes, type.mime);
      stored.push(object);
      let pdfObject = null;
      if (type.convert) {
        let pdf;
        try {
          pdf = await cloud.toPdf(bytes, kind);
        } catch (err) {
          console.error("Conversion failed", err.message);
          throw fail(422, `${name} couldn't be converted. Export it to PDF and add that instead.`);
        }
        pdfObject = `projects/${req.params.id}/${id}.pdf`;
        await cloud.put(pdfObject, pdf, "application/pdf");
        stored.push(pdfObject);
      }
      const { rows } = await pool.query(
        `insert into project_files (id, project_id, owner, name, kind, size, object, pdf_object) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
        [id, req.params.id, req.email, name, kind, bytes.length, object, pdfObject],
      );
      res.json(toFile(rows[0]));
    } catch (err) {
      await removeObjects(cloud, stored);
      throw err;
    }
  });

  api.delete("/projects/:id/files/:fileId", async (req, res) => {
    const { rows } = await pool.query(`delete from project_files where id = $1 and project_id = $2 and owner = $3 returning object, pdf_object`, [
      req.params.fileId,
      req.params.id,
      req.email,
    ]);
    if (rows[0]) await removeObjects(cloud, [rows[0].object, rows[0].pdf_object].filter(Boolean));
    res.json({});
  });

  // The PDF export: the browser builds the brand's deck (src/app/deck.js) and sends it here, and the
  // converter turns it into a PDF with the brand fonts it has installed. Nothing is stored.
  api.post("/deck-pdf", express.raw({ type: () => true, limit: MAX_BYTES }), async (req, res) => {
    if (!cloud) throw fail(503, "PDF export isn't set up on this server.");
    if (!Buffer.isBuffer(req.body) || !KINDS.pptx.magic.every((b, i) => req.body[i] === b)) throw fail(400, "That isn't a deck.");
    await spend(pool, req.email, "pdf", PDFS_PER_DAY, "PDF exports");
    let pdf;
    try {
      pdf = await cloud.toPdf(req.body, "pptx");
    } catch (err) {
      console.error("Deck PDF failed", err.message);
      await refund(pool, req.email, "pdf");
      throw fail(502, "The PDF couldn't be made. Try again, or export the PowerPoint instead.");
    }
    res.type("application/pdf").send(pdf);
  });

  // Reads the project's files and the pasted notes, and returns suggested brief answers.
  // With `brief` (the answers given so far), it drafts the unanswered ones instead: "Suggest
  // answers for the gaps" on the brief's review step.
  api.post("/projects/:id/fill", async (req, res) => {
    if (!cloud) throw fail(503, "Filling from materials isn't set up on this server.");
    await ownProject(req);
    const text = typeof (req.body && req.body.text) === "string" ? req.body.text.trim() : "";
    if (text.length > MAX_TEXT) throw fail(413, `Pasted notes can be up to ${MAX_TEXT.toLocaleString("en-US")} characters.`);
    const files = (await filesOf(req)).rows;
    const gaps = !!(req.body && req.body.brief);
    // The same checks the model's answers get, so the brief can't carry anything oversized.
    const given = gaps ? sanitizeFill(req.body.brief).fill : null;
    if (gaps && !(given.f && given.f.desc)) throw fail(400, "Add a company description first, so there's something to go on.");
    if (!gaps && !files.length && !text) throw fail(400, "Add a file or paste some notes first.");

    await spend(pool, req.email, "fill", FILLS_PER_DAY, "fills");

    let answer;
    try {
      answer = await cloud.generate({
        system: gaps ? SYSTEM_GAPS : SYSTEM,
        schema: FILL_SCHEMA,
        text,
        ask: gaps ? `The team's answers so far: ${JSON.stringify(given)}\n\nDraft answers for the questions they have not answered.` : "Fill in the brief from this material.",
        files: files.map((f) => ({ uri: cloud.uri(f.pdf_object || f.object), mimeType: f.pdf_object ? "application/pdf" : KINDS[f.kind].mime })),
      });
    } catch (err) {
      console.error("Fill failed", err.message);
      await refund(pool, req.email, "fill");
      throw fail(502, "The AI service didn't answer. Your files and notes are still here, so try again.");
    }
    res.json(sanitizeFill(answer));
  });
}
