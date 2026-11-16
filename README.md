# KAI prototype

Interactive prototype of the KAI happy path: onboarding → brief → generate → review → alignment meeting → handoff.
Generation is simulated, so no backend or API key is needed.

```bash
npm install
npm run dev
```

## Where things live

- `src/app/BrandApp.jsx`: app state and the logic ported from the original prototype
- `src/app/flow.js`: alignment meeting and handoff
- `src/app/exports.js`: builds `CLAUDE.md`, tokens, and the font guide
- `src/screens/`: one component per screen or section
- `src/styles/tokens.css`: color, type size, and radius tokens
- `src/styles/utilities.css`: single-purpose classes generated from the prototype's inline styles
- `src/styles/flow.css`: meeting, handoff, and print styles

## Hosted version

`npm run dev` is unchanged: it saves projects in the browser and needs no server.

The hosted version (Google Cloud Run) is built from the `Dockerfile`. It differs in two ways:

- **Projects are saved in Postgres,** through `server/app.js`. Each person only sees their own.
- **There's no log in screen.** Google sign-in (IAP) happens before the page loads, and the server reads who is signed in from it.

`src/app/store.js` picks between the two: `accounts.js` (browser) by default, `accountsRemote.js` (server) when built with `VITE_API=1`.

### Running the server locally

```bash
docker run -d --name kai-pg -e POSTGRES_HOST_AUTH_METHOD=trust -p 127.0.0.1:54329:5432 postgres:16
```

Put this in `.env.local` (git ignores it):

```
DEV_USER_EMAIL=you@example.com
PGHOST=localhost
PGPORT=54329
PGUSER=postgres
PGDATABASE=postgres
```

```bash
VITE_API=1 npm run build
npm start          # http://localhost:8080
npm test           # server tests, against the same Postgres
```
