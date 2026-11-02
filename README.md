# LightBrand prototype

Interactive prototype of the LightBrand happy path: start → brief → generate → review → alignment meeting → handoff.
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
