// Accounts and saved projects, kept in this browser's localStorage.
//
// PROTOTYPE ONLY. Anyone using this browser can read what's stored here, and nothing syncs
// between devices. Every function returns a promise and takes plain data, the way calls to a
// real server would, so a backend can replace this file without changing the screens.

const USERS = "kai.users";
const SESSION = "kai.session";
const projectsKey = (userId) => `kai.projects.${userId}`;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("This browser's storage is full or blocked, so your work couldn't be saved.");
  }
}
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const normalize = (email) => email.trim().toLowerCase();

// Stores a salted hash, never the password itself.
async function hash(password, salt) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + password));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

// The signed-in user, read synchronously so the app knows where to start.
export function currentUser() {
  const session = read(SESSION, null);
  if (!session) return null;
  const user = read(USERS, {})[session.email];
  return user ? { id: user.id, email: user.email } : null;
}

export async function signUp(email, password) {
  const key = normalize(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
  const users = read(USERS, {});
  if (users[key]) throw new Error("There's already an account with that email. Log in instead.");
  const salt = newId();
  users[key] = { id: newId(), email: key, salt, hash: await hash(password, salt), createdAt: Date.now() };
  write(USERS, users);
  write(SESSION, { email: key });
  return { id: users[key].id, email: key };
}

export async function logIn(email, password) {
  const key = normalize(email);
  const user = read(USERS, {})[key];
  // One message for both cases, so the form doesn't reveal which emails have accounts.
  if (!user || (await hash(password, user.salt)) !== user.hash) throw new Error("That email and password don't match.");
  write(SESSION, { email: key });
  return { id: user.id, email: key };
}

export async function logOut() {
  localStorage.removeItem(SESSION);
}

export async function listProjects(userId) {
  return read(projectsKey(userId), [])
    .map(({ data, ...summary }) => summary)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function loadProject(userId, id) {
  const project = read(projectsKey(userId), []).find((p) => p.id === id);
  if (!project) throw new Error("That project no longer exists.");
  return project;
}

export async function createProject(userId, data, summary = {}) {
  const now = Date.now();
  const project = { id: newId(), name: "Untitled brand", swatches: null, where: "", createdAt: now, updatedAt: now, ...summary, data };
  write(projectsKey(userId), read(projectsKey(userId), []).concat(project));
  return project;
}

// Writes synchronously before returning, so it also works while the page is closing.
export function saveProject(userId, id, data, summary = {}) {
  const projects = read(projectsKey(userId), []);
  const k = projects.findIndex((p) => p.id === id);
  if (k < 0) return Promise.reject(new Error("That project no longer exists."));
  // A name someone typed in the project list wins over the brief's working name.
  const name = projects[k].renamed ? projects[k].name : summary.name || projects[k].name;
  projects[k] = { ...projects[k], ...summary, name, data, updatedAt: Date.now() };
  try {
    write(projectsKey(userId), projects);
  } catch (err) {
    return Promise.reject(err);
  }
  return Promise.resolve(projects[k].updatedAt);
}

export async function renameProject(userId, id, name) {
  const projects = read(projectsKey(userId), []);
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error("That project no longer exists.");
  project.name = name.trim() || "Untitled brand";
  project.renamed = true;
  project.updatedAt = Date.now();
  write(projectsKey(userId), projects);
}

export async function duplicateProject(userId, id) {
  const projects = read(projectsKey(userId), []);
  const source = projects.find((p) => p.id === id);
  if (!source) throw new Error("That project no longer exists.");
  const now = Date.now();
  const copy = { ...structuredClone(source), id: newId(), name: `${source.name} copy`, renamed: true, createdAt: now, updatedAt: now };
  write(projectsKey(userId), projects.concat(copy));
  return copy;
}

export async function deleteProject(userId, id) {
  write(projectsKey(userId), read(projectsKey(userId), []).filter((p) => p.id !== id));
}
