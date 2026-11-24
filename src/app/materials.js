// The "I have some materials to start" screen: uploads, pasted notes, and filling the brief from
// them. The reading happens on the hosted server (server/materials.js), so in local mode
// (`npm run dev`, no server) the screen explains that instead.
import accounts from "./store.js";
import { applyFill, suggestedKeys } from "./fill.js";

const MAX_FILES = 10;
const MAX_BYTES = 25 * 1024 * 1024;
export const ACCEPT = ".pdf,.png,.jpg,.jpeg,.pptx,.docx";

// What the "Copy a prompt for Claude" link copies. It follows the brief's four steps, so the
// summary lines up with the fields.
export const CLAUDE_PROMPT = `I'm starting a brand project in KAI and need one summary of everything we know about this company. Use the files, notes and conversations you have here. Write plain text under the four headings below. Where we have nothing, write "Not known". Don't guess.

1. The company: working name, legal name, what it does and for whom, industry, domains owned, other names being considered.
2. Branding: where the name comes from, how it should look, color direction, colors or visuals to keep or avoid, brands we admire and why.
3. Customer and problem: the buyer (role, motivation, how they define success), the day-to-day user (role, team, what they care about), the end customer, the problem today and who feels it most, why current solutions fall short, competitors (names and websites), workarounds, what makes us different and why it matters, the outcomes users want, what would make them switch.
4. Tone and product: tone words, words we can't use, the main value and the emotional value, the feature that gets people to try it and why it beats the alternatives, how the product should feel to use, where users start, the "aha" moment, what success looks like, how users react, the current website.`;

// Called when the screen opens, so files added earlier show up again.
export function loadMaterials(app) {
  if (!accounts.canFill || !app.state.projectId) return;
  accounts
    .listFiles(app.state.projectId)
    .then((files) => app.setState({ files }))
    .catch((err) => app.setState({ fillError: err.message }));
}

async function addFiles(app, picked) {
  const projectId = app.state.projectId;
  let files = app.state.files || [];
  const problems = [];
  for (const file of Array.from(picked)) {
    if (app.state.projectId !== projectId) return; // They opened another project; stop adding to this one.
    if (files.length >= MAX_FILES) {
      problems.push(`A project can hold ${MAX_FILES} files.`);
      break;
    }
    if (file.size > MAX_BYTES) {
      problems.push(`${file.name} is over 25 MB.`);
      continue;
    }
    app.setState({ uploading: file.name });
    try {
      files = files.concat(await accounts.uploadFile(projectId, file));
      if (app.state.projectId === projectId) app.setState({ files });
    } catch (err) {
      problems.push(err.message);
    }
  }
  if (app.state.projectId === projectId) app.setState({ uploading: "", fillError: problems.join(" ") });
}

// An answer that arrives after the person opened another project must not land in that one.
const stillOn = (app, projectId) => app.state.projectId === projectId;

function fill(app) {
  const projectId = app.state.projectId;
  app.setState({ fillBusy: true, fillError: "" });
  accounts
    .fillBrief(projectId, app.state.material || "")
    .then(({ fill: answers, count }) => {
      if (!stillOn(app, projectId)) return;
      if (!count) {
        app.setState({ fillBusy: false, fillError: "We couldn't find any brief answers in that material. Add more, or fill in the brief yourself." });
        return;
      }
      const { patch, filled } = applyFill(app.state, answers);
      app.setState({ ...patch, fillBusy: false, screen: "brief", step: 1 });
      app.showToast(filled ? `${filled} answers suggested from your materials.` : "Nothing new to add. Your own answers were kept.");
    })
    .catch((err) => stillOn(app, projectId) && app.setState({ fillBusy: false, fillError: err.message }));
}

// "Suggest answers for the gaps" on the review step: the server drafts the unanswered questions
// from the answers given so far, plus any files and notes the project has.
function fillGaps(app) {
  const s = app.state;
  if (s.fillBusy) return;
  const brief = { ...s.f, tone: s.tone, banned: s.banned, alts: s.alts, buyerCares: s.buyerCares, avoidT: s.avoidT, keepC: s.keepC, avoidC: s.avoidC, comps: s.comps, brandsA: s.brandsA, domains: s.domains, votes: s.votes, taglines: s.taglines };
  app.setState({ fillBusy: true, fillError: "" });
  accounts
    .fillBrief(s.projectId, s.material || "", brief)
    .then(({ fill: answers }) => {
      if (!stillOn(app, s.projectId)) return;
      const { patch, filled } = applyFill(app.state, answers);
      app.setState({ ...patch, fillBusy: false });
      app.showToast(filled ? `${filled} answers suggested. They're tinted in the brief, so check each one.` : "Nothing to suggest. The open questions need facts only you know.");
    })
    .catch((err) => stillOn(app, s.projectId) && app.setState({ fillBusy: false, fillError: err.message }));
}

export function materialVals(app) {
  const s = app.state;
  const files = s.files || [];
  const working = !!s.uploading || !!s.fillBusy;
  const suggested = suggestedKeys(s);
  const textKeys = suggested.filter((k) => k.startsWith("f.")).map((k) => k.slice(2));

  return {
    mat: {
      canFill: accounts.canFill,
      accept: ACCEPT,
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        removeAria: `Remove ${file.name}`,
        remove: () =>
          accounts
            .deleteFile(s.projectId, file.id)
            .then(() => app.setState({ files: (app.state.files || []).filter((x) => x.id !== file.id) }))
            .catch((err) => app.setState({ fillError: err.message })),
      })),
      hasFiles: files.length > 0,
      working,
      status: s.uploading ? `Adding ${s.uploading}…` : s.fillBusy ? "Reading your materials. This can take a minute." : "",
      error: s.fillError || "",
      text: s.material || "",
      setText: (e) => app.setState({ material: e.target.value.slice(0, 100000) }),
      onPick: (e) => {
        addFiles(app, e.target.files);
        e.target.value = ""; // So picking the same file again still fires.
      },
      onDrop: (e) => {
        e.preventDefault();
        if (!working) addFiles(app, e.dataTransfer.files);
      },
      onDragOver: (e) => e.preventDefault(),
      copyPrompt: () =>
        navigator.clipboard.writeText(CLAUDE_PROMPT).then(
          () => app.showToast("Prompt copied. Paste it into Claude."),
          () => app.showToast("Couldn't copy the prompt in this browser."),
        ),
      canRun: accounts.canFill && !working && (files.length > 0 || !!(s.material || "").trim()),
      fill: () => fill(app),
    },

    // The brief's review pattern: a banner with "Confirm all", a pill on the main labels, and a
    // tint on every suggested text field (BriefScreen turns sugCss into a style rule).
    sug: Object.fromEntries(textKeys.map((k) => [k, true])),
    sugCss: textKeys.length ? `${textKeys.map((k) => `[name="${k}"]`).join(",")}{background:var(--color-tint)}` : "",
    badgeText: "Suggested",
    imported: suggested.length > 0,
    importName: "Suggested answers",
    importText: `${suggested.length} ${suggested.length === 1 ? "answer" : "answers"} suggested. Suggested fields are tinted, so check each one.`,
    confirmLabel: "Confirm all",
    confirmAll: () => app.setState({ sugg: {} }),

    // The review step's gap button. Without a server (`npm run dev`) it keeps the sample answers.
    gapLabel: !accounts.canFill ? "Fill the gaps with sample answers" : s.fillBusy ? "Suggesting answers…" : "Suggest answers for the gaps",
    gapBusy: !!s.fillBusy,
    ...(accounts.canFill ? { fillSample: () => fillGaps(app) } : {}),
  };
}
