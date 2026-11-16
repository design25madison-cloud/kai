// Where accounts and saved projects live: this browser (the default, so `npm run dev` needs no server),
// or the hosted server when the app is built with VITE_API=1 (the Dockerfile does that).
import * as local from "./accounts.js";
import * as remote from "./accountsRemote.js";

export default import.meta.env.VITE_API ? remote : local;
