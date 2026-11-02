// Builds the handoff files from a direction. Pure functions: no app state, no DOM.

const SINGLE_WEIGHT = new Set(["Anta", "Archivo Black"]);
const TYPE_SCALE = [
  ["Display", "display", 64, "110%", "22px"],
  ["Heading 1", "display", 48, "110%", "20px"],
  ["Heading 2", "display", 32, "120%", "18px"],
  ["Subheading", "body", 24, "120%", "16px"],
  ["Body", "body", 16, "150%", "14px"],
  ["Label", "body", 12, "140%", "12px"],
];

export function typeScaleOf(d) {
  return TYPE_SCALE.map(([level, role, size, lh, preview]) => ({ level, role, face: d[role], px: size, size: size + "px", lh, preview }));
}

const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");
const isPlaceholder = (s) => !s || /^\[.*\]$/.test(s.trim());
const pkg = (name) => "@fontsource/" + slug(name);
const weights = (name) => (SINGLE_WEIGHT.has(name) ? [400] : [400, 600]);
const stack = (name) => `'${name}', system-ui, sans-serif`;
const families = (d) => [...new Set([d.wordFont, d.display, d.body])];

function colorTokens(d) {
  return d.colors.map((c) => ({ token: "--brand-" + slug(c.role), name: c.name, role: c.role, hex: c.show, usage: c.ratio }));
}

export function tokensCss(d) {
  const colors = colorTokens(d).map((c) => `  ${c.token}: ${c.hex}; /* ${c.name}, ${c.usage}% of the layout */`);
  return `/* ${d.name}: direction tokens from LightBrand */
:root {
${colors.join("\n")}

  /* Buttons and links. White text: ${d.uiRatio}:1 */
  --ui-primary: ${d.ui};
  --ui-primary-hover: ${d.uiHover};

  --font-wordmark: ${stack(d.wordFont)};
  --font-display: ${stack(d.display)};
  --font-body: ${stack(d.body)};
}
`;
}

export function fontsCss(d) {
  return `:root {
  --font-wordmark: ${stack(d.wordFont)};
  --font-display: ${stack(d.display)};
  --font-body: ${stack(d.body)};
}
`;
}

export function tokensJson(d) {
  const color = {};
  colorTokens(d).forEach((c) => {
    color[slug(c.role)] = { $value: c.hex, $type: "color", name: c.name, usagePercent: c.usage };
  });
  return (
    JSON.stringify(
      {
        direction: d.name,
        color,
        ui: {
          primary: { $value: d.ui, $type: "color", contrastOnWhite: Number(d.uiRatio) },
          primaryHover: { $value: d.uiHover, $type: "color" },
        },
        font: {
          wordmark: { $value: d.wordFont, package: pkg(d.wordFont), trackingPx: d.track },
          display: { $value: d.display, package: pkg(d.display) },
          body: { $value: d.body, package: pkg(d.body) },
        },
        typeScale: typeScaleOf(d).map((t) => ({ level: t.level, font: t.face, sizePx: t.px, lineHeight: t.lh })),
      },
      null,
      2,
    ) + "\n"
  );
}

export function fontsGuide(d) {
  const list = families(d);
  const embed = list.map((n) => `family=${n.replace(/ /g, "+")}:wght@${weights(n).join(";")}`).join("&");
  const imports = list.flatMap((n) => weights(n).map((w) => `import "${pkg(n)}/${w}.css";`));
  const rows = list.map((n) => `| ${n} | \`${pkg(n)}\` | ${weights(n).join(", ")} | \`${stack(n)}\` |`);
  return `# Fonts: ${d.name}

All of these are open-license families from the LightBrand allowlist.

| Family | Install name | Weights | CSS stack |
|---|---|---|---|
${rows.join("\n")}

## Install with Fontsource

\`\`\`bash
npm install ${list.map(pkg).join(" ")}
\`\`\`

\`\`\`js
${imports.join("\n")}
\`\`\`

## Or embed from Google Fonts

\`\`\`html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${embed}&display=swap">
\`\`\`
`;
}

export function voiceMd(d) {
  return `## Voice

${d.tone.map((t) => `- ${t.yes}, not ${t.no}`).join("\n")}

Sample headline: "${d.headline}"
Sample interface line: "${d.micro}"
`;
}

export function imageCsv(d) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = d.imgs.map((im) => [im[0], im[1], "Moodboard only, not licensed for use"].map(esc).join(","));
  return ["image,source,license", ...rows].join("\n") + "\n";
}

export function claudeMd({ d, f, avoidC, avoidT, domains, agreedRound }) {
  const name = f.name || "Brand";
  const about = [];
  if (!isPlaceholder(f.desc)) about.push(f.desc);
  if (!isPlaceholder(f.meaning)) about.push("Name meaning: " + f.meaning);
  if (domains && domains[0]) about.push("Domain: " + domains[0]);
  const contrast =
    Number(d.uiRatio) >= 4.5
      ? `White text on it is ${d.uiRatio}:1, which passes AA.`
      : `White text on it is only ${d.uiRatio}:1, which fails AA. Fix this before shipping.`;
  const avoid = [...(avoidT || []).map((t) => "Don't use " + t.toLowerCase() + "."), ...(avoidC || []).map((h) => `Don't use ${h}.`)];
  const status = agreedRound ? `Agreed in alignment round ${agreedRound}.` : "Not yet agreed in an alignment meeting.";

  return `# ${name} brand rules

Direction: ${d.name}. ${status} This is a starting direction, not a finished brand. The designer owns the final system.
${about.length ? "\n" + about.join("\n") + "\n" : ""}
## Color

| Token | Name | Role | Hex | Usage |
|---|---|---|---|---|
${colorTokens(d)
  .map((c) => `| \`${c.token}\` | ${c.name} | ${c.role} | ${c.hex} | ${c.usage}% |`)
  .join("\n")}
| \`--ui-primary\` | UI primary | Buttons and links | ${d.ui} | As needed |

- Use the UI primary (${d.ui}) for buttons and links. ${contrast}
- Use ${d.uiHover} for the hover state of the UI primary.
- Keep ${d.accentName} (${d.accent}) to accents. Don't use it for buttons or links.
- Don't use brand colors for status. Success, warning, and error colors aren't part of this direction, so ask the designer before adding them.

## Type

- Wordmark: ${d.wordFont}, uppercase, ${d.track}px letter spacing. Install \`${pkg(d.wordFont)}\`.
- Headings: ${d.display}. Install \`${pkg(d.display)}\`.
- Body and interface text: ${d.body}. Install \`${pkg(d.body)}\`.

| Level | Font | Size | Line height |
|---|---|---|---|
${typeScaleOf(d)
  .map((t) => `| ${t.level} | ${t.face} | ${t.size} | ${t.lh} |`)
  .join("\n")}

Use only these families. Don't substitute another font.

## Voice

${d.tone.map((t) => `- Be ${t.yes.toLowerCase()}, not ${t.no.toLowerCase()}.`).join("\n")}

- Sample headline: "${d.headline}"
- Sample interface line: "${d.micro}"
${avoid.length ? "\n## Avoid\n\n" + avoid.map((a) => "- " + a).join("\n") + "\n" : ""}
## Imagery

Reference images set direction only. They aren't licensed for use, so don't ship them.
`;
}

export function handoffFiles(input) {
  const { d } = input;
  return [
    { id: "claude", name: "CLAUDE.md", desc: "Brand rules that AI coding tools read from a project folder", mime: "text/markdown", content: claudeMd(input) },
    { id: "css", name: "tokens.css", desc: "Color, UI primary, and font variables", mime: "text/css", content: tokensCss(d) },
    { id: "json", name: "tokens.json", desc: "The same tokens as structured data, plus the type scale", mime: "application/json", content: tokensJson(d) },
    { id: "fonts", name: "fonts.md", desc: "Install commands, embed link, and CSS stacks", mime: "text/markdown", content: fontsGuide(d) },
  ];
}

export function downloadFile(name, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime + ";charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
