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

- **"I have some materials to start" is real.** People upload decks, notes and logos (or paste text), and Gemini fills in the brief from them. Suggested answers are tinted until confirmed. See `server/materials.js`, `server/fill.js` and `src/app/materials.js`. In local mode the screen says it needs the hosted version.
- **Precise editing uses Gemini.** Pick a piece, say what to change, and the server proposes one change to accept or reject. See `server/edit.js` and `src/app/edits.js`. In local mode it falls back to keyword rules.
- **"Suggest answers for the gaps" on the review step is real.** Gemini drafts the unanswered questions from the answers so far, and leaves facts only the team knows (such as domains) empty. In local mode the button inserts sample answers.
- **Daily limits per person:** 20 fills (materials and gap suggestions together) and 200 edits.

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
