// Turns a PowerPoint or Word file into a PDF with LibreOffice, so Gemini can read it with its
// layout and pictures. Modelled on Squire's converter service.
//
// POST /convert?ext=pptx|docx with the file as the body answers with the PDF. The service holds no
// data and has no access to anything else: it runs as its own service account with no roles, and
// only the app's service account may call it (see infra/run.tf).
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const PORT = Number(process.env.PORT || 8080);
const MAX_BYTES = 26 * 1024 * 1024; // The app accepts 25 MB.
const EXTS = new Set(["pptx", "docx"]);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BYTES) {
        reject(Object.assign(new Error("File too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function runSoffice(workdir, inputFile) {
  return new Promise((resolve, reject) => {
    // HOME is the work folder, so each conversion gets a fresh LibreOffice profile.
    const child = spawn("soffice", ["--headless", "--norestore", "--nolockcheck", "--nologo", "--convert-to", "pdf", "--outdir", workdir, inputFile], {
      stdio: "ignore",
      env: { ...process.env, HOME: workdir },
      detached: true, // Its own process group, so the timeout can stop soffice.bin too, not only the wrapper.
    });
    const timer = setTimeout(() => {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
      reject(new Error("conversion timed out"));
    }, 120000);
    child.on("error", reject);
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`soffice exited ${code}`));
    });
  });
}

http
  .createServer(async (req, res) => {
    const send = (status, body, type = "application/json") => {
      res.writeHead(status, { "Content-Type": type });
      res.end(type === "application/json" ? JSON.stringify(body) : body);
    };
    const url = new URL(req.url, "http://converter");
    if (req.method === "GET" && url.pathname === "/health") return send(200, { status: "ok" });
    if (req.method !== "POST" || url.pathname !== "/convert") return send(404, { error: "Not found" });
    const ext = url.searchParams.get("ext");
    if (!EXTS.has(ext)) return send(400, { error: "ext must be pptx or docx" });

    let work;
    try {
      const bytes = await readBody(req);
      work = await mkdtemp(path.join(tmpdir(), "kai-convert-"));
      const inputFile = path.join(work, `input.${ext}`);
      await writeFile(inputFile, bytes);
      await runSoffice(work, inputFile);
      send(200, await readFile(path.join(work, "input.pdf")), "application/pdf");
    } catch (err) {
      console.error("[converter] failed:", err.message);
      send(err.status || 500, { error: "Conversion failed" });
    } finally {
      if (work) await rm(work, { recursive: true, force: true });
    }
  })
  .listen(PORT, () => console.log(`converter listening on ${PORT}`));
