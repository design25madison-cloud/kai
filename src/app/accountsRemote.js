// Accounts and saved projects on the hosted version, kept on the server (see server/app.js).
//
// Same functions as accounts.js, so the screens don't change. Google sign-in happens before the page
// loads, so there's no log in screen here: the server already knows who is asking, and the userId
// that the screens pass in is ignored.

let user = null;
// Reloading would lose unsaved work, so the advice is a new tab: autosave retries once sign-in works again.
const UNREACHABLE = "Couldn't reach the server. If your sign-in expired, sign in again in a new tab, then come back here.";

async function api(path, options = {}) {
  let res;
  try {
    res = await fetch("/api" + path, { ...options, headers: options.headers || (options.body ? { "Content-Type": "application/json" } : undefined) });
  } catch {
    // An expired Google sign-in answers with a redirect that fetch can't follow, which lands here too.
    throw new Error(UNREACHABLE);
  }
  if (res.status === 401) throw new Error("Your sign-in expired. Sign in again in a new tab, then come back here.");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || "Something went wrong on the server."), { status: res.status });
  return body;
}
const send = (method, body) => ({ method, body: JSON.stringify(body || {}) });

// Called once before the app renders, so currentUser() can stay synchronous.
export async function init() {
  const { email } = await api("/me");
  user = { id: email, email };
}

export const currentUser = () => user;
export const logIn = async () => user;

// Clears the Google sign-in for this site and returns to the sign-in page. Never resolves: the page is leaving.
export function logOut() {
  window.location.href = "/?gcp-iap-mode=CLEAR_LOGIN_COOKIE";
  return new Promise(() => {});
}

export const listProjects = () => api("/projects");
export const loadProject = (userId, id) => api(`/projects/${id}`);
export const createProject = (userId, data, summary = {}) => api("/projects", send("POST", { data, summary }));

// updatedAt is the version this tab last saw: the server answers 409 if the project changed since.
// projects.js sends one save at a time, so each carries the version the one before got back.
export function saveProject(userId, id, data, summary = {}, updatedAt, closing = false) {
  const options = send("PUT", { data, summary, updatedAt });
  // keepalive lets the closing save finish after the page is gone. Browsers cap keepalive bodies at 64 KiB in total.
  options.keepalive = closing && new TextEncoder().encode(options.body).length < 60000;
  return api(`/projects/${id}`, options).then((saved) => saved.updatedAt);
}

export const renameProject = (userId, id, name) => api(`/projects/${id}/rename`, send("POST", { name }));
export const duplicateProject = (userId, id) => api(`/projects/${id}/duplicate`, send("POST"));
export const deleteProject = (userId, id) => api(`/projects/${id}`, { method: "DELETE" });

// Materials: uploaded files, and filling the brief from them (server/materials.js).
export const canFill = true;
export const listFiles = (id) => api(`/projects/${id}/files`);
export const uploadFile = (id, file) =>
  api(`/projects/${id}/files`, { method: "POST", body: file, headers: { "Content-Type": "application/octet-stream", "X-File-Name": encodeURIComponent(file.name) } });
export const deleteFile = (id, fileId) => api(`/projects/${id}/files/${fileId}`, { method: "DELETE" });
// With `brief` (the answers so far), the server drafts the unanswered ones instead.
export const fillBrief = (id, text, brief) => api(`/projects/${id}/fill`, send("POST", { text, brief }));
// The PDF export: sends the finished deck, gets the same slides back as a PDF (a Blob).
export async function deckPdf(deck) {
  const res = await fetch("/api/deck-pdf", { method: "POST", body: deck, headers: { "Content-Type": "application/octet-stream" } }).catch(() => null);
  if (!res) throw new Error(UNREACHABLE);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "The PDF couldn't be made. Try again.");
  return res.blob();
}
// Precise editing: one piece, one request, one proposed change (server/edit.js).
export const editPiece = (id, edit) => api(`/projects/${id}/edit`, send("POST", edit));
