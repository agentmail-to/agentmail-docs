import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const MIN_DESCRIPTION_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 160;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fern = join(root, "fern");
const errors = [];
const descriptions = new Map();

function checkDescription(label, value) {
  if (value == null || value === "") {
    errors.push(`${label}: missing description`);
    return;
  }

  const length = [...value].length;
  if (length < MIN_DESCRIPTION_LENGTH || length > MAX_DESCRIPTION_LENGTH) {
    errors.push(
      `${label}: description is ${length} characters; expected ${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH}`,
    );
  }

  const matches = descriptions.get(value) ?? [];
  matches.push(label);
  descriptions.set(value, matches);
}

function frontmatterDescription(file) {
  const source = readFileSync(file, "utf8");
  if (!source.startsWith("---\n")) return undefined;
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return undefined;
  const match = source.slice(4, end).match(/^description:\s*(.+)$/m);
  if (!match) return undefined;
  const raw = match[1].trim();
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw.replace(/^['"]|['"]$/g, "");
}

function walkYaml(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const file = join(directory, entry);
    return statSync(file).isDirectory()
      ? walkYaml(file)
      : file.endsWith(".yml")
        ? [file]
        : [];
  });
}

function followingDocs(lines, start, itemIndent) {
  const nextItem = new RegExp(`^ {${itemIndent}}[A-Za-z0-9_-]+:$`);
  const docs = new RegExp(`^ {${itemIndent + 2}}docs:(?:\\s+(.*))?$`);
  for (let index = start + 1; index < lines.length; index += 1) {
    if (nextItem.test(lines[index])) return undefined;
    const match = lines[index].match(docs);
    if (!match) continue;
    if (match[1] && match[1] !== "|") return match[1].trim();
    for (let content = index + 1; content < lines.length; content += 1) {
      const value = lines[content].trim();
      if (value) return value;
    }
    return undefined;
  }
  return undefined;
}

const docsPath = join(fern, "docs.yml");
const docsSource = readFileSync(docsPath, "utf8");
const activeMdx = [
  ...docsSource.matchAll(/^\s+(?:path|summary): (.+\.mdx)$/gm),
].map((match) => match[1]);

for (const mdx of activeMdx) {
  checkDescription(mdx, frontmatterDescription(join(fern, mdx)));
}

const globalDescription = docsSource.match(
  /^\s+og:description:\s*"([^"]+)"$/m,
)?.[1];
checkDescription("docs.yml metadata.og:description", globalDescription);
checkDescription(
  "changelog/overview.mdx",
  frontmatterDescription(join(fern, "changelog", "overview.mdx")),
);

for (const file of walkYaml(join(fern, "definition"))) {
  const lines = readFileSync(file, "utf8").split("\n");
  const label = relative(root, file);
  for (let index = 0; index < lines.length; index += 1) {
    const endpoint = lines[index].match(/^ {6}display-name:\s*(.+)$/);
    if (endpoint) {
      checkDescription(
        `${label}: ${endpoint[1]}`,
        followingDocs(lines, index, 4),
      );
      continue;
    }

    const webhook = lines[index].match(/^ {4}display-name:\s*(.+)$/);
    if (file.endsWith("/webhooks/events.yml") && webhook) {
      checkDescription(
        `${label}: ${webhook[1]}`,
        followingDocs(lines, index, 2),
      );
    }
  }
}

const channelSource = readFileSync(
  join(fern, "definition", "websockets.yml"),
  "utf8",
);
checkDescription(
  "fern/definition/websockets.yml: Connect",
  channelSource.match(/^\s{2}docs:\s*(.+)$/m)?.[1],
);

for (const [description, labels] of descriptions) {
  if (labels.length > 1) {
    errors.push(
      `duplicate description for ${labels.join(", ")}: ${description}`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `SEO metadata check passed: ${activeMdx.length} MDX pages, ` +
    `${descriptions.size - activeMdx.length - 2} generated API pages, and site defaults.`,
);
