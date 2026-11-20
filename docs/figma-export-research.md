# Figma export research

How can a web app put generated brand artifacts into a Figma file as editable layers, and who has already shipped this?

- Research date: 2026-11-18. Every source below was read on that date. Where a page carries its own date or version, it is noted next to the link.
- Scope requirement (quoted from the scope doc): "KAI connects to Figma and places the artifacts it created into a file, as editable layers, so associates can keep working on them."
- Method note: pages were read through a fetch tool that summarises and returns short quotes. Plan, seat and legal details should be re-read at the linked source before anyone commits money or signs anything.

## 1. Short answer

Build a small Figma plugin that takes a KAI export (a pasted code block or a dropped `.json` file) and draws native nodes: variables, text styles, swatch frames, the wordmark as live text, image fills and copy.
The Plugin API is the only documented way for a third party to create layers without an AI agent in the loop, and it runs on every plan ([compare APIs][compare], [use plugins][help-use-plugins]).
The REST API cannot create layers ([compare APIs][compare]), and Figma's MCP server, which can, only accepts clients listed in Figma's catalog ([remote server setup][mcp-remote]).
Ship it first as a development plugin, then as a private organization plugin if the company is on Organization or Enterprise (no review), otherwise through Community review ([dev plugin][help-dev-plugin], [private plugins][help-private-plugin], [publishing][help-publish-plugin]).
The two HTML mockups are the hard part; decide them with a short spike (section 5).

## 2. Options table

"Each time" assumes any one-time setup is done. Plans: Starter / Professional / Organization / Enterprise. Seats: Full / Dev / Collab / View.

| Path | What ends up editable | What the user does each time | What we would build | Plan / seat | Main risks |
|---|---|---|---|---|---|
| **A. Our own Figma plugin (recommended)** | Everything we choose to draw: frames with auto layout, text, vectors from SVG, image fills, paint and text styles, variables ([Plugin API][plugin-api], [variables][plugin-vars]) | In KAI: click "Export for Figma". In Figma: open a file, run the plugin, paste or drop the export, click Import. Plugins are started by hand and cannot run in the background ([use plugins][help-use-plugins]) | A plugin (manifest, main code, small UI) plus one export function in the app that emits the JSON payload | Running plugins in Figma Design files: Starter plan or Full seat, with edit access ([use plugins][help-use-plugins]). Development plugins: all plans, desktop app needed to import ([dev plugin][help-dev-plugin]). Private org plugins: Organization, Enterprise, Education K-12 ([private plugins][help-private-plugin]). Community: all plans, reviewed ([publishing][help-publish-plugin]) | We own the mapping code. Font names must match what Figma has. Mockup fidelity is our problem. Org admins can restrict plugins to an approved list ([use plugins][help-use-plugins]) |
| **B. "Copy to Figma" clipboard button** (write Figma's own clipboard format) | Frames, text with fonts, images, vectors, auto layout, per the tools that do this ([html.to.design][h2d-copy], [Magic Patterns library][npm-mp]). No styles or variables via clipboard in html.to.design's own description ([html.to.design][h2d-copy]) | Click Copy in KAI, press paste in Figma. No plugin | Either call a vendor API from our server ([code.to.design clipboard mode][c2d-clip]) or adopt a library that encodes the format | Any user who can edit the target file. No Figma auth needed ([code.to.design clipboard mode][c2d-clip]) | The format is undocumented and proprietary and can change without notice ([Grida notes][grida-fig]). Vendor path costs credits and sends our HTML to a third party ([pricing][c2d-pricing]). The one current open library is marked `UNLICENSED` ([npm][npm-mp]). Figma's terms prohibit reverse engineering the Services ([ToS][tos]); whether this applies is a legal question |
| **C. Figma's own capture tools** (Chrome extension, Code to canvas) | Frames, text, images, shapes; existing variables in the target file are bound on paste. No link to library components or styles ([coded screens][help-coded-screens], [Chrome extension][help-chrome-ext]) | Open the KAI screen in Chrome, click the Figma extension, capture a page or element, paste in Figma ([Chrome extension][help-chrome-ext]) | Nothing. Possibly a cleaner "print" view of each artifact to capture | Paid plans for code capture; the two help articles disagree on whether Starter is included ([Chrome extension][help-chrome-ext], [coded screens][help-coded-screens]). Edit access to the file | "KAI connects to Figma" is not really met: the user drives a Figma tool. Open beta, gradual rollout ([Chrome extension][help-chrome-ext]). Chrome only |
| **D. Figma MCP server via an agent** (`use_figma`, `html_to_figma`, `generate_figma_design`) | Native content: frames, components, variables, styles, text, auto layout ([write to canvas][mcp-write], [tools][mcp-tools]) | Prompt an approved MCP client (for example a coding agent) with the KAI export and a Figma file link | Nothing in the app. Possibly a prompt or skill file shipped with the existing handoff export | Write to canvas: Professional, Education, Organization, Enterprise, with edit access ([write to canvas][mcp-write]). Full seat to write outside drafts; Dev seats can write to drafts ([MCP FAQ][help-mcp-faq]) | Our server cannot call it: only catalog-listed clients connect ([remote server setup][mcp-remote]). Free only during beta, then usage-based pricing ([write to canvas][mcp-write]). Output is "beta quality" ([write to canvas][mcp-write]). Non-deterministic |
| **E. Native variables import (DTCG JSON)** | Variables only: color, number, string ([modes for variables][help-var-modes]) | Download tokens from KAI, drag the file into the Variables view of a collection ([modes for variables][help-var-modes]) | Make the existing JSON token export DTCG-compliant | Professional, Education, Organization, Government, Enterprise ([modes for variables][help-var-modes]) | Palette and numbers only. No layers |
| **F. REST Variables API** | Variables only ([Variables endpoints][rest-vars]) | Nothing after connecting an account | OAuth app plus a server call to `POST /v1/files/:file_key/variables` | Full members of Enterprise orgs with edit access; scope `file_variables:write` ([Variables endpoints][rest-vars]) | Enterprise only. No layers |
| **G. PowerPoint import** (deck KAI already exports) | A Figma Slides deck you can modify; all text is reset to Inter; tables, diagrams, videos and animations are dropped ([PPTX import][help-pptx]) | Import the `.pptx` from the file browser ([PPTX import][help-pptx]) | Nothing | All plans ([PPTX import][help-pptx]) | Lands in Figma Slides, not a Design file. Fonts lost. Whether shapes and text stay individually editable is not stated |
| Ruled out: REST API for layers | Nothing | n/a | n/a | n/a | No endpoint creates frames, text, vectors or images. Figma describes the REST API as "largely read-only" ([compare APIs][compare]) |
| Ruled out: our server as an MCP client | n/a | n/a | n/a | n/a | "Only clients listed in the Figma MCP catalog ... can connect"; new clients join a waitlist or go through an account team ([remote server setup][mcp-remote], [catalog][mcp-catalog]) |
| Ruled out: generating a `.fig` file | Would be everything | Import a file | A `.fig` writer | n/a | Format is proprietary with no public spec ([Grida notes][grida-fig]). No maintained open-source writer found (section 3.5) |
| Ruled out: SVG as the main path | Vector shapes; text behaviour not confirmed | Paste or drop SVG | SVG renderers per artifact | Edit access | Flat geometry, no auto layout, no styles or variables. Markers and patterns are dropped ([copy assets][help-copy-assets]). Useful only as a helper inside the plugin (`createNodeFromSvg`) |

## 3. Detail per path

### 3.1 REST API

The belief that the REST API cannot create layers is correct as of the changelog entry dated 2026-10-22.

- Figma's own comparison page says the REST API "is largely read-only, with the exception of" comments, comment reactions, variables and dev resources, and points to the Plugin API for changing canvas content ([compare APIs][compare]).
- The REST introduction lists reading files and layers, getting and posting comments, creating and managing webhooks, and managing dev resources ([REST intro][rest-intro]).
- Variables: three endpoints. `POST /v1/files/:file_key/variables` creates, updates and deletes collections, modes and variables. It is limited to full members of Enterprise orgs, needs edit access to the file and the `file_variables:write` scope, and the body must be 4 MB or less ([Variables endpoints][rest-vars]).
- Newest write endpoints (changelog entry 2026-10-22): create a team, create top-level folders, duplicate files and invite team members, for Enterprise plans, each with its own write scope. None of them creates nodes ([REST changelog][rest-changelog]).
- No changelog entry in 2025 or 2026 adds node or layer creation; node changes in that period are new read-only properties ([REST changelog][rest-changelog]).
- Figma's sample token pipeline uses the Variables REST API and states the same limits: Enterprise full member, editor seat to write ([variables GitHub Action example][vars-action]).

### 3.2 Plugin API

What it can create:

- "Allows editing almost any aspect of a Figma design or FigJam file", but only in the file the user has open ([compare APIs][compare]).
- `createFrame`, `createText`, `createVector`, `createPage`, `createPaintStyle`, `createTextStyle` exist; the two style functions are Figma Design only ([Plugin API][plugin-api]).
- `createNodeFromSvg(svg: string): FrameNode` "is equivalent to the SVG import feature in the editor" ([Plugin API][plugin-api]).
- Images: `createImageAsync(src)` builds an image from a URL and `createImage(bytes)` from raw bytes. Supported formats are PNG, JPG and GIF, at most 4096 x 4096 px. An image is shown by using it as a fill on a node ([working with images][plugin-images]).
- Text: a font must be loaded with `figma.loadFontAsync` before any property that changes rendered text is set, or the plugin throws ([working with text][plugin-text]). `loadFontAsync` only loads fonts already available in the Figma editor; it does not load fonts from the internet ([loadFontAsync][plugin-loadfont]). `listAvailableFontsAsync` returns the fonts in the font picker ([Plugin API][plugin-api]).
- Variables: `figma.variables.createVariableCollection`, `createVariable`, `collection.addMode`, `setValueForMode`; bind with `setBoundVariable` on nodes and `setBoundVariableForPaint` for fills and strokes ([working with variables][plugin-vars]).

Getting data from an outside web app:

- A plugin can only reach domains listed in `networkAccess.allowedDomains` in its manifest; other requests are blocked with a CSP error. `["none"]` blocks everything, `["*"]` allows everything and requires a `reasoning` string. The list is displayed on the plugin's Community page ([manifest][plugin-manifest], [network requests][plugin-network]).
- "Plugin iframes have a `null` origin", so they can only call APIs that send `Access-Control-Allow-Origin: *` ([network requests][plugin-network]).
- Figma's documented OAuth pattern for plugins: the plugin UI opens a browser window to your server, your server issues a read key and a write key, the user signs in, the plugin polls with the read key, and the token is kept in `figma.clientStorage`, which is local to the user and plugin ([OAuth with plugins][plugin-oauth]).
- No documented deep link opens a file and runs a plugin with parameters. Plugin parameters are typed into the quick actions UI ([plugin parameters][help-param]); a forum question asking for URL parameters has no answer ([forum thread][forum-deeplink]). Unverified as a negative.
- For this app specifically: the service sits behind Google Identity-Aware Proxy. IAP rejects cross-origin preflight requests by default because they carry no credentials ([IAP customization][iap-cors]). Combined with the null origin above, a plugin cannot simply `fetch` a project from the app. This is an inference from the two sources, not something tested. The cheapest way around it is to move the data by hand: a pasted code block or a dropped file, the same pattern Builder (`builder.json`) and html.to.design (`.h2d`) use ([Builder extension][builder-ext], [html.to.design routes][h2d-claude]).

Distribution:

- Development plugin: all plans. Needs the Figma desktop app for macOS or Windows. Created or imported through Plugins > Development > "Import plugin from manifest" ([dev plugin][help-dev-plugin]). Each person imports the manifest on their own machine; the article describes no sharing short of publishing ([dev plugin][help-dev-plugin]).
- Private organization plugin: Organization, Enterprise and Education K-12. "Any member of an organization can make and share a private plugin", there is no review, and a published update reaches everyone who has it ([private plugins][help-private-plugin]).
- Public Community plugin: reviewed before listing with no fixed timeline; two-factor authentication is required; submission happens from the desktop app; the network-access label comes from the manifest ([publishing][help-publish-plugin]).

Who can run it and what they do each time:

- Running a plugin needs edit access to the file. In Figma Design files that means the Starter plan or a Full seat; Dev seats can run plugins in Dev Mode, FigJam and Slides but not in Design files; Collab seats in FigJam and Slides only; View seats cannot run plugins ([use plugins][help-use-plugins]).
- Full is the only paid seat that can edit Figma Design files ([seats][help-seats]).
- Organization admins can limit usage to approved plugins ([use plugins][help-use-plugins]).

### 3.3 Figma MCP server

- Two servers. The remote server at `https://mcp.figma.com/mcp` has the broadest feature set and needs no desktop app. The desktop server runs through the Figma desktop app and needs a Dev or Full seat on a paid plan ([MCP intro][mcp-intro]).
- Write tools are remote only. `use_figma` is "the general-purpose tool for writing to Figma files" and works by running code through the Plugin API ([tools][mcp-tools], [write to canvas][mcp-write]). `create_new_file` makes a blank file in drafts. `upload_assets` adds PNG, JPG, GIF, WebP or SVG (10 MB each, 60 per call), and SVGs arrive as editable vector layers. `html_to_figma` converts a self-contained HTML document (up to 50 MB, no external links) into plain layers without components or variables. `generate_figma_design` sends the live UI of a running web app to a new file, an existing file or the clipboard ([tools][mcp-tools]).
- Code to canvas (`generate_figma_design`) works by the agent adding a capture script to the running app and opening a browser window; output is flat layers with matching variables bound, no library links ([code to canvas][mcp-c2c], [help: code to canvas][help-c2c]).
- Can a third-party server-side app call it? Not self-serve. "Only clients listed in the Figma MCP catalog, such as VS Code, Cursor, and Claude Code, can connect to the Figma MCP server", and a developer with a new client is told to join a waitlist ([remote server setup][mcp-remote]). The catalog page says to apply to register a client for remote access through an account team ([catalog][mcp-catalog]). The catalog listed 30 clients on the research date, all AI assistants, IDEs or agent products ([catalog][mcp-catalog]).
- Auth: the user signs in with their Figma account in a browser and clicks "Allow access" ([remote server setup][mcp-remote]). On Organization and Enterprise, admins may have to approve a client first ([MCP FAQ][help-mcp-faq]). The server only reaches files the signed-in user can already access ([rate limits and access][mcp-rate]).
- Plans and seats: write to canvas is for Professional, Education, Organization and Enterprise, with edit access to the file ([write to canvas][mcp-write]). A Full seat is needed to write outside drafts; Dev seats write to drafts only ([MCP FAQ][help-mcp-faq]). Code to canvas lists Starter as well ([code to canvas][mcp-c2c]).
- Rate limits (tool calls that read from Figma): the Starter plan and View or Collab seats on any plan, 20 per month. Full or Dev seats: Professional 200 per day and 10 per minute, Organization 200 per day and 15 per minute, Enterprise 600 per day and 20 per minute. Write tools such as `create_new_file` and `generate_figma_design` are exempt. "Figma may change rate limits at any time" ([rate limits and access][mcp-rate], [MCP FAQ][help-mcp-faq]).
- Limits of `use_figma`: each call returns at most 48,000 UTF-8 bytes; it cannot add new images itself; fonts must be uploaded to the Figma account, locally installed fonts are not available ([write to canvas][mcp-write]).
- Pricing: writing to the canvas "is currently in beta and free to use during the beta period" and "will eventually become a usage-based paid feature" ([write to canvas][mcp-write]).
- Terms (Developer Terms, effective 2026-05-05): MCP servers are part of the Developer Resources; integrations must use the credential type Figma designates; Figma may suspend access at any time and may change fees or rate limits on thirty days' notice ([developer terms][dev-terms]).

### 3.4 Clipboard paths

SVG:

- Figma's supported route for moving vectors between tools is to copy as SVG and use "Paste here"; `marker` and `pattern` elements are not imported ([copy assets][help-copy-assets]).
- The help articles read do not say whether SVG `<text>` arrives as an editable text layer or how fonts are matched. Unverified; needs a five-minute test.
- Result is geometry only: no auto layout, styles or variables are described ([copy assets][help-copy-assets]).

Figma's own clipboard format:

- When you copy layers in Figma, the clipboard gets a `text/html` payload. Third-party tools write the same payload so that a normal paste creates real nodes. html.to.design says its copy feature "converts the capture into Figma's own clipboard format" ([html.to.design][h2d-copy]).
- The payload is a binary envelope in the Kiwi encoding, wrapped in HTML. One library describes its job as "Reads/writes the figma file format for .fig files or text/html pasteboard data" ([fig-kiwi on npm][npm-fig-kiwi], single release 0.0.1 dated 2022-07-05). Another builds a node tree, "encodes the `fig-kiwi` binary envelope" and returns a `text/html` string to write with `navigator.clipboard.write` ([Magic Patterns library][npm-mp], version 1.0.5 dated 2026-06-18).
- Documented or supported? No. Figma's copy and paste article does not describe any clipboard format ([copy and paste][help-copy-paste]). An independent implementer's notes say the format is "non-standard and proprietary, with no public specification" and that "Figma may change the format at any time without notice" ([Grida notes][grida-fig]).
- Figma does use the clipboard for its own tools: the Chrome extension and Code to canvas both put captures on the clipboard for pasting ([Chrome extension][help-chrome-ext], [code to canvas][mcp-c2c]). That is Figma writing its own format, not a published interface.
- Terms risk: the Terms of Service (effective 2026-03-11) bar customers from attempting to "reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code" or underlying structure of the Services ([ToS][tos]). Using a vendor API moves the engineering risk to the vendor but not the stability risk. Not legal advice; the clause was read as a short excerpt.
- Vendor option: code.to.design exposes `POST https://api.to.design/html` with `clip: true`; the response is clipboard data to set as `text/html` inside a `copy` event. The API key must stay on a backend, the copy must happen within about five seconds of a user click, and only Google Fonts should be used ([clipboard mode][c2d-clip]). Pricing: 10 free credits, then packs from 250 credits for USD 20 up to 200,000 for USD 5,000; credits per call are not stated ([pricing][c2d-pricing]).

### 3.5 File import

- The file browser imports `.fig`, `.sketch`, `.jam`, `.deck`, `.buzz`, `.site`, `.make`, PNG, JPG and `.pptx`. PDF and SVG are not on that list. Anyone can import into their drafts ([import to file browser][help-import-browser]).
- Images, vectors, videos and GIFs are added inside a Design file instead, with edit access ([guide to imports][help-import-guide]).
- `.fig` is importable but not documented. The format is described by implementers as proprietary with no public specification ([Grida notes][grida-fig]).
- Open-source `.fig` code found: `fig-kiwi` (read and write per its description, one release in 2022, [npm][npm-fig-kiwi]); `openfig-core` (a parser, MIT, 0.4.1, [npm][npm-openfig]); Grida's importer, which states "We will not generate native Figma files" ([Grida notes][grida-fig]). No maintained writer was found.
- Sketch files convert to a Figma Design file: artboards become frames, symbols become components, styles are not retained, and missing fonts prompt a replacement ([Sketch import][help-sketch]). Generating `.sketch` just to import it was not explored further; it loses styles and adds a second format to maintain.
- PowerPoint imports into Figma Slides on all plans. All text is switched to Inter, and videos, tables, diagrams and animations are not imported ([PPTX import][help-pptx]).

### 3.6 Other first-party features

- Figma Chrome extension: captures a page or a selected element, including parts scrolled out of view, and copies it to the clipboard as editable layers (frames, text, images, shapes). Certain auto layout settings, font properties and variables can carry over. Code capture is "gradually rolling out in open beta" ([Chrome extension][help-chrome-ext]).
- Plan conflict: the extension article lists Starter through Enterprise but also says code capture needs a paid plan; the "coded screens" article lists Professional and up for the extension ([Chrome extension][help-chrome-ext], [coded screens][help-coded-screens]).
- On paste, Figma tries to bind existing color, number and string variables (fills, strokes, radius, padding, gap, font family, size, weight, line height, letter spacing). There is no mapping to library components or styles yet ([coded screens][help-coded-screens]).
- Code layers (open beta, all plans): running code on the canvas. "Extract designs" turns a code layer into editable design layers. Code layers use AI credits; MCP import needs a Full seat ([code layers][help-code-layers]).
- Native variables import: drag DTCG-format JSON into a collection; supported types are color (sRGB or HSL), dimension in px, font family, duration in s, number and string ([modes for variables][help-var-modes]).
- Figma's agent has a "logo to brand kit" feature that builds palettes, type scales and graphics as editable objects on the canvas, on paid plans ([Figma: brand kit][help-brandkit]). It overlaps with this product rather than helping the export.
- Generative plugins: plugins authored through the MCP server as `code.ts` plus `ui.html`. The manifest cannot be edited through the MCP server and source must not contain secrets ([generative plugins][mcp-genplugins]). Whether they can call outside domains was not found. Not a fit for v1.
- Code Connect maps Figma components to code components (`add_code_connect_map`); it does not create layers ([tools][mcp-tools]).

## 4. Prior art

| Product | Mechanism | What the user does | What ends up editable | Source |
|---|---|---|---|---|
| html.to.design | Figma plugin plus browser extension. Also clipboard, `.h2d` file, pasted HTML, and its own MCP server that relays to the open plugin | Paste a URL in the plugin; or capture in the extension then paste, send to plugin, or drop a file | Frames, text with fonts, images, vectors, auto layout. Styles and variables through the plugin only | [docs][h2d-docs], [copy to Figma][h2d-copy], [routes, updated 2026-11-05][h2d-claude], [MCP tab][h2d-mcp] |
| code.to.design (same vendor) | Paid API. Clipboard mode returns Figma clipboard data; plugin mode returns data for your own plugin through an SDK | Click a copy button in the host product, paste in Figma | "Fully editable" designs per the vendor | [site][c2d], [docs][c2d-docs], [clipboard mode][c2d-clip] |
| Google Stitch | Clipboard, powered by code.to.design | One-click export, then paste | "Editable layers" per the vendor post. Google's own announcement was not found | [vendor post, 2026-02-26][divriots-stitch] |
| Banani | Clipboard, powered by code.to.design ("Copy to Figma") | One click, then paste | Not stated in the post | [vendor post, 2026-02-17][divriots-banani] |
| Magic Patterns | Clipboard. Publishes a library that encodes the Figma clipboard payload in the browser | Export > Export to Figma > Copy, then paste | Frames, text, vectors, images | [docs][mp-docs], [library][npm-mp] |
| UX Pilot | "Copy to Figma" from the web app (paste), plus a Figma plugin | Copy in the app, paste in Figma; or work in the plugin | "Editable layers with auto layout" | [product page][uxpilot] |
| Builder.io | Figma plugin. URL import in the plugin; Chrome extension copies a section which is pasted into the plugin, or downloads `builder.json` to upload | Paste URL, or Copy Layout in the extension then paste into the plugin | Editable layers; vendor claims 80 to 90 percent accuracy, auto layout in beta | [extension docs][builder-ext], [blog, 2025-08-06][builder-blog] |
| Builder.io `figma-html` (open source) | Original extension plus plugin. README now says "This project has moved". Not archived; last push 2025-08-19. The npm package `@builder.io/html-to-figma` last published in 2022 | n/a | n/a | [repo][builder-repo] |
| Tokens Studio | Figma plugin. Pulls token JSON from GitHub, GitLab, a URL and other providers, then creates or updates variables and styles in the open file | Open the plugin, pull, export to Figma | Variables (color, string, number, boolean) and styles (color, typography, effect) | [export guide][ts-export], [sync providers][ts-sync], [URL provider][ts-url] |
| Figma variables GitHub Action example | REST Variables API | Run a workflow | Variables only. Enterprise only | [repo][vars-action] |
| Style Dictionary | Build tool that turns token files into platform outputs; forward-compatible with the DTCG format. Its token docs mention no Figma writer | n/a | n/a | [docs][sd] |
| Relume | Figma plugin with sign-in. Requires a duplicated Relume Figma Kit in the file | Open plugin, sign in, pick a project, import style guide, wireframes or sitemap | Kit components recoloured, variables synced, generated copy filled in | [docs][relume] |
| Figma Chrome extension | First-party capture to clipboard | Capture, paste | Frames, text, images, shapes, bound variables | [help][help-chrome-ext] |
| Figma MCP server | First-party, agent-driven (`use_figma`, `html_to_figma`, `generate_figma_design`) | Prompt an approved client | Native content including components and variables | [tools][mcp-tools] |
| v0 | Import from Figma only. No export to Figma found in its docs | n/a | n/a | [docs][v0-figma] (redirect target not opened; unverified) |
| Lovable | Import from Figma only (plugin, MCP read, `.fig` upload) | n/a | n/a | [docs][lovable-figma] |

Pattern: token tools use a plugin, and AI UI generators have moved to the clipboard, mostly through one vendor. No brand-kit generator with a verified export-to-Figma mechanism was found; vendor pages that claim one did not explain how.

## 5. Recommended path: mapping and hard parts

### Shape of the build

- App side: one new export, "Export for Figma", that produces a single JSON document (copied to the clipboard and offered as a `.json` download). It reuses the data behind the existing token export and adds the wordmark, image URLs with attribution, and voice copy.
- Plugin side: a `manifest.json`, a UI with a paste box and a file drop, and main code that builds nodes. Nothing calls the app's server, so the sign-in proxy is untouched.
- Manifest essentials: `editorType: ["figma"]`, `documentAccess: "dynamic-page"`, and `networkAccess.allowedDomains` listing only the two image hosts ([manifest][plugin-manifest]).

### Artifact to node mapping

| Artifact | Figma result | API |
|---|---|---|
| Palette roles | One variable collection, one color variable per role (`color/primary`, `color/surface`, neutrals, accents) | `createVariableCollection`, `createVariable`, `setValueForMode` ([variables][plugin-vars]) |
| Palette swatches | Auto layout frame per swatch: a rectangle whose fill is bound to the variable, plus text for role and hex | `createFrame`, `setBoundVariableForPaint` ([variables][plugin-vars]) |
| Type scale | One text style per step (family, size, line height, letter spacing), plus a specimen frame using them | `createTextStyle`, `loadFontAsync` ([Plugin API][plugin-api]) |
| Wordmark | A live text node in the brand font with letter spacing, fill bound to the primary color | `createText` ([Plugin API][plugin-api]) |
| Imagery | A rectangle per photo with an image fill, sized from the image, with an attribution text layer beneath | `createImageAsync`, `getSizeAsync` ([images][plugin-images]) |
| Voice copy | Text nodes in an auto layout frame, using the text styles | `createText` |
| Icons and sparkline in mockups | Vector frames from the same inline SVG the app renders | `createNodeFromSvg` ([Plugin API][plugin-api]) |
| Landing and dashboard mockups | See "Mockups" below | |

Everything goes on a new page named for the brand (`createPage`, [Plugin API][plugin-api]) so a re-import never overwrites the associate's edits.

### What is hard

Fonts.

- Figma includes Google Fonts by default ([add a font][help-fonts]), and the app only uses Google Fonts, so most families should resolve.
- `loadFontAsync` cannot fetch a font Figma does not already have ([loadFontAsync][plugin-loadfont]). A family added to Google Fonts recently, or a weight Figma names differently, will fail.
- Mitigation: call `listAvailableFontsAsync` first, match family and style against the list, fall back to Inter, and report the substitutions in the plugin UI. Whether every family in the app's archetype list is present in Figma needs a one-off check; not verified here.

Images.

- Only PNG, JPG and GIF, at most 4096 x 4096 px ([images][plugin-images]). Wikimedia originals can be larger or in other formats, so the export should carry a sized JPG or PNG URL.
- Both hosts must be in `allowedDomains` and must allow cross-origin reads. On the research date `images.unsplash.com` and `upload.wikimedia.org` both returned `Access-Control-Allow-Origin: *` (direct header check, not a documented guarantee).
- Attribution lives only as a text layer next to the image. Whether each source's licence terms are met by that was not researched.

Mockups (auto layout fidelity).

- The two mockups are React templates styled with roughly 1,200 lines of CSS, mostly flexbox with some CSS grid. Flexbox maps to auto layout; grid, absolute positioning, pseudo-elements and responsive rules do not map one to one.
- General HTML converters do not reach full fidelity. One vendor states 80 to 90 percent accuracy with auto layout still in beta ([Builder blog][builder-blog]). Figma says pages with heavy script-driven rendering may capture imperfectly ([coded screens][help-coded-screens]).
- Options, cheapest first:
  1. Do not build it. Tell associates to capture the two mockup screens with Figma's Chrome extension and paste them next to the plugin output. Variables the plugin created are bound on paste if they match ([coded screens][help-coded-screens]). Depends on plan and beta rollout.
  2. Add a "Copy mockup to Figma" button backed by a clipboard vendor API ([clipboard mode][c2d-clip]). Small build, per-use cost, undocumented format underneath.
  3. Rebuild the two templates by hand in the plugin as auto layout frames bound to the variables and text styles. Best result and fully ours, but it is a second implementation of each mockup that must be kept in step with the React one.
- Recommendation: ship the plugin without mockups, test option 1 on the real screens, and only then choose between 1 and 3.

### Rollout

1. Development plugin, imported from the manifest by a few people on the desktop app ([dev plugin][help-dev-plugin]).
2. If the company is on Organization or Enterprise: publish privately, no review ([private plugins][help-private-plugin]).
3. Otherwise: keep distributing the manifest (workable for tens of people) or publish to Community and accept review ([publishing][help-publish-plugin]).

## 6. Open questions and unverified items

Needs an answer from the company:

- Which Figma plan, and which seats do the associates hold? Dev, Collab and View seats cannot run plugins in Design files ([use plugins][help-use-plugins]).
- Does the org restrict plugins to an approved list ([use plugins][help-use-plugins])?
- Do associates use the desktop app? Development plugins need it ([dev plugin][help-dev-plugin]).
- Is driving a Figma-made tool (Chrome extension) acceptable for the mockups, or must the export be one action from KAI?

Unverified:

- Whether pasted or imported SVG `<text>` becomes an editable text layer, and how fonts are matched.
- Whether there is any way to launch a plugin with data from a URL. None documented was found; only an unanswered forum thread.
- That a plugin cannot fetch through the sign-in proxy. Inferred from the null-origin rule and the proxy's default handling of preflight requests; not tested.
- Variable mode limits per plan, and whether creating variables from a plugin is limited on Starter. The docs read say only that mode counts depend on plan ([modes for variables][help-var-modes]).
- Which plans get the Chrome extension's capture feature; Figma's two articles disagree.
- Whether PowerPoint import keeps shapes and text as separate editable objects; the article only says slides can be modified.
- Whether PDF can be imported anywhere other than FigJam. It is not on the file browser list; the FigJam claim came from a search summary and was not opened.
- Google's own description of the Stitch export. Mechanism is taken from the vendor that powers it.
- v0's lack of an export to Figma: its docs page redirected and the target was not opened.
- Whether generative plugins can make network requests.
- How the Terms of Service clause on reverse engineering applies to writing the clipboard format. Only excerpts were read.
- What the MCP waitlist or account-team route requires, and how long it takes.
- Font coverage: that every Google Font the app can pick exists in Figma under a matching style name.
- Licence compliance for Unsplash and Wikimedia images once they are embedded in a Figma file.

[compare]: https://developers.figma.com/compare-apis/
[rest-intro]: https://developers.figma.com/docs/rest-api/
[rest-vars]: https://developers.figma.com/docs/rest-api/variables-endpoints/
[rest-changelog]: https://developers.figma.com/docs/rest-api/changelog/
[vars-action]: https://github.com/figma/variables-github-action-example
[plugin-api]: https://developers.figma.com/docs/plugins/api/figma/
[plugin-text]: https://developers.figma.com/docs/plugins/working-with-text/
[plugin-loadfont]: https://developers.figma.com/docs/plugins/api/properties/figma-loadfontasync/
[plugin-images]: https://developers.figma.com/docs/plugins/working-with-images/
[plugin-vars]: https://developers.figma.com/docs/plugins/working-with-variables/
[plugin-manifest]: https://developers.figma.com/docs/plugins/manifest/
[plugin-network]: https://developers.figma.com/docs/plugins/making-network-requests/
[plugin-oauth]: https://developers.figma.com/docs/plugins/oauth-with-plugins/
[help-dev-plugin]: https://help.figma.com/hc/en-us/articles/360042786733-Register-a-plugin-for-development
[help-private-plugin]: https://help.figma.com/hc/en-us/articles/4404228629655-Create-private-plugins-for-an-organization
[help-publish-plugin]: https://help.figma.com/hc/en-us/articles/360042293394-Publish-classic-plugins-to-the-Figma-Community
[help-use-plugins]: https://help.figma.com/hc/en-us/articles/360042532714-Use-plugins-in-files
[help-seats]: https://help.figma.com/hc/en-us/articles/360039960434-Compare-and-manage-seats-in-Figma
[help-param]: https://help.figma.com/hc/en-us/articles/4406468726167-Plugin-parameters
[forum-deeplink]: https://forum.figma.com/ask-the-community-7/deep-link-into-figma-plugin-15309
[iap-cors]: https://docs.cloud.google.com/iap/docs/customizing
[mcp-intro]: https://developers.figma.com/docs/figma-mcp-server/
[mcp-remote]: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
[mcp-tools]: https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
[mcp-write]: https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/
[mcp-c2c]: https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/
[mcp-rate]: https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
[mcp-genplugins]: https://developers.figma.com/docs/figma-mcp-server/generative-plugins-and-shaders/
[mcp-catalog]: https://www.figma.com/mcp-catalog/
[help-mcp-faq]: https://help.figma.com/hc/en-us/articles/39252411778583-Figma-MCP-server-FAQs
[dev-terms]: https://www.figma.com/legal/developer-terms/
[tos]: https://www.figma.com/legal/tos/
[help-c2c]: https://help.figma.com/hc/en-us/articles/42495237955095-Code-to-canvas
[help-coded-screens]: https://help.figma.com/hc/en-us/articles/40826832449303-Turn-coded-screens-into-editable-design-layers
[help-chrome-ext]: https://help.figma.com/hc/en-us/articles/9067379354135-Figma-Chrome-extension
[help-code-layers]: https://help.figma.com/hc/en-us/articles/44193259600535-Code-layers-in-Figma-Design
[help-copy-paste]: https://help.figma.com/hc/en-us/articles/4409078832791-Copy-and-paste-objects
[help-copy-assets]: https://help.figma.com/hc/en-us/articles/360040030374-Copy-assets-between-design-tools
[help-import-browser]: https://help.figma.com/hc/en-us/articles/360041003114-Import-files-to-the-file-browser
[help-import-guide]: https://help.figma.com/hc/en-us/articles/360040027794-Guide-to-imports-in-Figma-Design
[help-sketch]: https://help.figma.com/hc/en-us/articles/360040514273-Import-Sketch-Files
[help-pptx]: https://help.figma.com/hc/en-us/articles/30601628883607-Import-PowerPoint-files-to-Figma-Slides
[help-var-modes]: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
[help-fonts]: https://help.figma.com/hc/en-us/articles/360039956894-Add-a-font-to-Figma
[help-brandkit]: https://www.figma.com/solutions/logo-to-brand-kit-generator/
[grida-fig]: https://grida.co/docs/wg/feat-fig/
[npm-fig-kiwi]: https://www.npmjs.com/package/fig-kiwi
[npm-mp]: https://www.npmjs.com/package/@magicpatterns/html-to-figma
[npm-openfig]: https://www.npmjs.com/package/openfig-core
[h2d-docs]: https://html.to.design/docs/
[h2d-copy]: https://html.to.design/docs/extension-copy-to-figma/
[h2d-claude]: https://html.to.design/docs/from-claude-ai-to-figma
[h2d-mcp]: https://html.to.design/docs/mcp-tab/
[c2d]: https://code.to.design/
[c2d-docs]: https://docs-code.to.design/
[c2d-clip]: https://docs-code.to.design/clipboard-mode
[c2d-pricing]: https://docs-code.to.design/pricing
[divriots-stitch]: https://divriots.com/blog/divriots-powers-google-stitch-export-feature
[divriots-banani]: https://divriots.com/blog/banani-uses-code-to-design
[mp-docs]: https://www.magicpatterns.com/docs/documentation/exporting/overview.md
[uxpilot]: https://uxpilot.ai/figma-ai
[builder-ext]: https://www.builder.io/c/docs/chrome-extension
[builder-blog]: https://www.builder.io/blog/html-to-design
[builder-repo]: https://github.com/BuilderIO/figma-html
[ts-export]: https://docs.tokens.studio/figma/export/
[ts-sync]: https://docs.tokens.studio/token-storage/manage-sync-provider/
[ts-url]: https://docs.tokens.studio/token-storage/remote/sync-server-url
[relume]: https://www.relume.ai/resources/docs/using-the-relume-figma-plugin
[sd]: https://styledictionary.com/info/tokens/
[v0-figma]: https://v0.app/docs/figma
[lovable-figma]: https://docs.lovable.dev/integrations/figma
