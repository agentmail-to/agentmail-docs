import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const fernDir = join(dirname(fileURLToPath(import.meta.url)), "..", "fern");
const instances = [
  "https://agentmail-production.docs.buildwithfern.com",
  "https://agentmail-production.docs.buildwithfern.com/docs",
] as const;

function fern(args: string[]) {
  const r = spawnSync("fern", args, {
    cwd: fernDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.error) {
    console.error(r.error.message);
    process.exit(1);
  }
  if (r.status) process.exit(r.status ?? 1);
}

const [, , cmd, ...rest] = process.argv;
if (cmd === "publish") {
  for (const url of instances)
    fern(["generate", "--docs", "--instance", url, ...rest]);
} else if (cmd === "preview") {
  fern([
    "generate",
    "--docs",
    "--preview",
    "--instance",
    instances[0],
    ...rest,
  ]);
} else {
  console.error("usage: agentmail-docs preview|publish");
  process.exit(1);
}
