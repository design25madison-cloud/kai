// Accounts and saved projects on the hosted version, kept on the server (see server/app.js).
//
// Same functions as accounts.js, so the screens don't change. Google sign-in happens before the page
// loads, so there's no log in screen here: the server already knows who is asking, and the userId
// that the screens pass in is ignored.

let user = null;

async function api(path, options = {}) {
  let res;
  try {
    res = await fetch("/api" + path, { ...options, headers: options.body ? { "Content-Type": "application/json" } : undefined });
  } catch {
    // An expired Google sign-in answers with a redirect that fetch can't follow, which lands here too.
    throw new Error("Couldn't reach the server. Reload the page to sign in again.");
  }
  if (res.status === 401) throw new Error("Your sign-in expired. Reload the page to sign in again.");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong on the server.");
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

// shortcut: saves aren't queued, so a slow save could land after a newer one. Autosave waits 700 ms between
// saves, which makes that unlikely. Queue them if lost edits are ever reported.
export function saveProject(userId, id, data, summary = {}) {
  const options = send("PUT", { data, summary });
  // keepalive lets the save finish while the page is closing. Browsers cap it at 64 KB.
  options.keepalive = options.body.length < 60000;
  return api(`/projects/${id}`, options).then((saved) => saved.updatedAt);
}

export const renameProject = (userId, id, name) => api(`/projects/${id}/rename`, send("POST", { name }));
export const duplicateProject = (userId, id) => api(`/projects/${id}/duplicate`, send("POST"));
export const deleteProject = (userId, id) => api(`/projects/${id}`, { method: "DELETE" });
