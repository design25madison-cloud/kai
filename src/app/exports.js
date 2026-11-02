// Builds export files from a direction, limited to the chosen sections.
// Pure functions apart from downloadFile: no app state.

export const ALL_SECTIONS = ["mood", "word", "palette", "ui", "type", "refs", "preview", "voice"];

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
function families(d, sections) {
  const list = [];
  if (sections.includes("word")) list.push(d.wordFont);
  if (sections.includes("type")) list.push(d.display, d.body);
  return [...new Set(list)];
}

function colorTokens(d) {
  return d.colors.map((c) => ({ token: "--brand-" + slug(c.role), name: c.name, role: c.role, hex: c.show, usage: c.ratio }));
}

export function tokensCss(d, sections = ALL_SECTIONS) {
  const has = (id) => sections.includes(id);
  const blocks = [];
  if (has("palette")) blocks.push(colorTokens(d).map((c) => `  ${c.token}: ${c.hex}; /* ${c.name}, ${c.usage}% of the layout */`).join("\n"));
  if (has("ui")) blocks.push(`  /* Buttons and links. White text: ${d.uiRatio}:1 */\n  --ui-primary: ${d.ui};\n  --ui-primary-hover: ${d.uiHover};`);
  const fonts = [];
  if (has("word")) fonts.push(`  --font-wordmark: ${stack(d.wordFont)};`);
  if (has("type")) fonts.push(`  --font-display: ${stack(d.display)};`, `  --font-body: ${stack(d.body)};`);
  if (fonts.length) blocks.push(fonts.join("\n"));
  return `/* ${d.name}: direction tokens from LightBrand */\n:root {\n${blocks.join("\n\n")}\n}\n`;
}

export function tokensJson(d, sections = ALL_SECTIONS) {
  const has = (id) => sections.includes(id);
  const out = { direction: d.name };
  if (has("palette")) {
    out.color = {};
    colorTokens(d).forEach((c) => {
      out.color[slug(c.role)] = { $value: c.hex, $type: "color", name: c.name, usagePercent: c.usage };
    });
  }
  if (has("ui")) {
    out.ui = {
      primary: { $value: d.ui, $type: "color", contrastOnWhite: Number(d.uiRatio) },
      primaryHover: { $value: d.uiHover, $type: "color" },
    };
  }
  if (has("word") || has("type")) out.font = {};
  if (has("word")) out.font.wordmark = { $value: d.wordFont, package: pkg(d.wordFont), trackingPx: d.track };
  if (has("type")) {
    out.font.display = { $value: d.display, package: pkg(d.display) };
    out.font.body = { $value: d.body, package: pkg(d.body) };
    out.typeScale = typeScaleOf(d).map((t) => ({ level: t.level, font: t.face, sizePx: t.px, lineHeight: t.lh }));
  }
  return JSON.stringify(out, null, 2) + "\n";
}

export function fontsGuide(d, sections = ALL_SECTIONS) {
  const list = families(d, sections);
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

export function claudeMd({ d, f, avoidC, avoidT, domains, agreedRound, sections = ALL_SECTIONS }) {
  const has = (id) => sections.includes(id);
  const name = f.name || "Brand";
  const about = [];
  if (!isPlaceholder(f.desc)) about.push(f.desc);
  if (!isPlaceholder(f.meaning)) about.push("Name meaning: " + f.meaning);
  if (domains && domains[0]) about.push("Domain: " + domains[0]);
  const contrast =
    Number(d.uiRatio) >= 4.5
      ? `White text on it is ${d.uiRatio}:1, which passes AA.`
      : `White text on it is only ${d.uiRatio}:1, which fails AA. Fix this before shipping.`;
  const status = agreedRound ? `Agreed in alignment round ${agreedRound}.` : "Not yet agreed in an alignment meeting.";
  const blocks = [`# ${name} brand rules\n\nDirection: ${d.name}. ${status} This is a starting direction, not a finished brand. The designer owns the final system.`];
  if (about.length) blocks.push(about.join("\n"));

  const color = [];
  if (has("palette")) {
    color.push(`| Token | Name | Role | Hex | Usage |\n|---|---|---|---|---|\n${colorTokens(d).map((c) => `| \`${c.token}\` | ${c.name} | ${c.role} | ${c.hex} | ${c.usage}% |`).join("\n")}`);
  }
  const rules = [];
  if (has("ui")) rules.push(`Use the UI primary (\`--ui-primary\`, ${d.ui}) for buttons and links. ${contrast}`, `Use ${d.uiHover} for the hover state of the UI primary.`);
  if (has("palette")) {
    rules.push(`Keep ${d.accentName} (${d.accent}) to accents. Don't use it for buttons or links.`);
    rules.push("Don't use brand colors for status. Success, warning, and error colors aren't part of this direction, so ask the designer before adding them.");
  }
  if (rules.length) color.push(rules.map((r) => "- " + r).join("\n"));
  if (color.length) blocks.push("## Color\n\n" + color.join("\n\n"));

  const type = [];
  if (has("word")) type.push(`- Wordmark: ${d.wordFont}, uppercase, ${d.track}px letter spacing. Install \`${pkg(d.wordFont)}\`.`);
  if (has("type")) type.push(`- Headings: ${d.display}. Install \`${pkg(d.display)}\`.`, `- Body and interface text: ${d.body}. Install \`${pkg(d.body)}\`.`);
  if (type.length) {
    let text = "## Type\n\n" + type.join("\n");
    if (has("type")) {
      text += `\n\n| Level | Font | Size | Line height |\n|---|---|---|---|\n${typeScaleOf(d).map((t) => `| ${t.level} | ${t.face} | ${t.size} | ${t.lh} |`).join("\n")}\n\nUse only these families. Don't substitute another font.`;
    }
    blocks.push(text);
  }

  if (has("voice")) {
    blocks.push(`## Voice\n\n${d.tone.map((t) => `- Be ${t.yes.toLowerCase()}, not ${t.no.toLowerCase()}.`).join("\n")}\n\n- Sample headline: "${d.headline}"\n- Sample interface line: "${d.micro}"`);
  }
  if (has("palette")) {
    const avoid = [...(avoidT || []).map((t) => "Don't use " + t.toLowerCase() + "."), ...(avoidC || []).map((h) => `Don't use ${h}.`)];
    if (avoid.length) blocks.push("## Avoid\n\n" + avoid.map((a) => "- " + a).join("\n"));
  }
  if (has("refs")) {
    blocks.push(`## Imagery\n\nReference images set direction only. They aren't licensed for use, so don't ship them.\n\n${d.imgs.map((im) => `- ${im[0]} (${im[1]})`).join("\n")}`);
  }
  return blocks.join("\n\n") + "\n";
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
