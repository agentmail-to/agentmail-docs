#!/usr/bin/env python3

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


API_REPO = "agentmail-to/agentmail-api"
SCHEMA_PATH = "src/core/schemas/api-key.ts"
GATES_PATH = "src/core/utils/permissions.ts"
MANIFEST = Path(__file__).resolve().parent / "api-permissions.json"
ROOT = Path(__file__).resolve().parents[1]
DEFINITION = ROOT / "fern/apis/api/definition/api-keys.yml"
PAGE = ROOT / "fern/pages/core-concepts/permissions.mdx"
PERMISSION = re.compile(r"^[a-z]+(_[a-z]+)*$")

# Deprecated per-scope owner grants. Bearer keys set app_share_owner instead, so the docs
# describe only that.
UNDOCUMENTED = {"owner_profile", "owner_email"}


def gh(*args):
    return subprocess.run(["gh", "api", *args], check=True, capture_output=True, text=True).stdout


def section(text, start, end):
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if re.search(start, line):
            for j in range(i + 1, len(lines)):
                if re.search(end, lines[j]):
                    return "\n".join(lines[i + 1 : j])
    raise ValueError(f"no section from {start!r} to {end!r}")


def fetch_manifest():
    commit = gh(f"repos/{API_REPO}/commits/main", "--jq", ".sha").strip()
    raw = ("-H", "Accept: application/vnd.github.raw")
    schema = gh(*raw, f"repos/{API_REPO}/contents/{SCHEMA_PATH}?ref={commit}")
    gates = gh(*raw, f"repos/{API_REPO}/contents/{GATES_PATH}?ref={commit}")
    manifest = {
        "source": f"{API_REPO}@{commit}",
        "permissions": re.findall(
            r"^    ([a-z_]+): z\.boolean\(\)",
            section(schema, r"^const permissionShape = z\.object\(\{$", r"^\}\)$"),
            re.M,
        ),
        "verification_gated": re.findall(
            r"'([a-z_]+)'",
            section(gates, r"^export const VERIFICATION_GATED_PERMISSIONS\b", r"^\]$"),
        ),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Fetched permissions from {manifest['source']} -> {MANIFEST}.")


def load_manifest():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    permissions = manifest.get("permissions")
    gated = manifest.get("verification_gated")
    if not isinstance(permissions, list) or not permissions:
        raise ValueError("manifest permissions must be a non-empty list")
    if len(set(permissions)) != len(permissions) or not all(PERMISSION.fullmatch(p) for p in permissions):
        raise ValueError("manifest permissions must be unique snake_case names")
    if not isinstance(gated, list) or not gated or not set(gated) <= set(permissions):
        raise ValueError("manifest verification_gated must be a non-empty subset of permissions")
    stale = UNDOCUMENTED - set(permissions)
    if stale:
        raise ValueError(f"UNDOCUMENTED names permissions the API no longer has: {', '.join(sorted(stale))}")
    return manifest


def snake(name):
    return re.sub(r"[A-Z]", lambda m: "_" + m.group().lower(), name)


def copy_block_fields(block):
    fields = []
    for line in block.splitlines():
        _, _, names = line.partition(": ")
        fields += [name.strip() for name in re.sub(r"\(.*\)", "", names).split(",")]
    return {snake(field) for field in fields}


def doc_lists(manifest):
    definition = DEFINITION.read_text(encoding="utf-8")
    page = PAGE.read_text(encoding="utf-8")
    documented = set(manifest["permissions"]) - UNDOCUMENTED
    reads = {p for p in documented if p.endswith("_read")}
    verification = section(page, r"^### Agent verification$", r"^#")
    read_only = section(page, r"^### Read-only key$", r"^### ")
    return [
        (
            f"{DEFINITION.relative_to(ROOT)} ApiKeyPermissions",
            set(re.findall(r"^      ([a-z_]+):$", section(definition, r"^  ApiKeyPermissions:$", r"^  \S"), re.M)),
            documented,
        ),
        (
            f"{PAGE.relative_to(ROOT)} reference tables",
            set(re.findall(r"^\| `([a-z_]+)` \|", section(page, r"^## Permissions Reference$", r"^## "), re.M)),
            documented,
        ),
        (
            f"{PAGE.relative_to(ROOT)} Copy for Cursor / Claude (Python)",
            copy_block_fields(section(page, r"Permission fields \(all optional<bool>", r"^\s*$")),
            documented,
        ),
        (
            f"{PAGE.relative_to(ROOT)} Copy for Cursor / Claude (TypeScript)",
            copy_block_fields(section(page, r"Permission fields \(all optional boolean", r"^\s*\*\s*$")),
            documented,
        ),
        (
            f"{PAGE.relative_to(ROOT)} Agent verification list",
            set(re.findall(r"`([a-z_]+)`", "\n".join(re.findall(r"^- .*$", verification, re.M)))),
            set(manifest["verification_gated"]),
        ),
        (
            f"{PAGE.relative_to(ROOT)} read-only key example (Python)",
            set(re.findall(r'"([a-z_]+)": True', read_only)),
            reads,
        ),
        (
            f"{PAGE.relative_to(ROOT)} read-only key example (TypeScript)",
            {snake(name) for name in re.findall(r"^\s+([a-zA-Z]+): true,?$", read_only, re.M)},
            reads,
        ),
        (
            f"{PAGE.relative_to(ROOT)} read-only key example (CLI)",
            set(re.findall(r'"([a-z_]+)": true', read_only)),
            reads,
        ),
    ]


def main():
    parser = argparse.ArgumentParser(
        description="Check the docs' hand-kept API key permission lists against agentmail-api's permission set."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Compare the docs with the vendored manifest.")
    mode.add_argument("--fetch", action="store_true", help=f"Refresh the vendored manifest from {API_REPO} main (needs gh), then compare.")
    args = parser.parse_args()

    try:
        if args.fetch:
            fetch_manifest()
        manifest = load_manifest()
        lists = doc_lists(manifest)
    except (OSError, ValueError, json.JSONDecodeError, subprocess.CalledProcessError) as error:
        print(f"Unable to check permissions: {error}", file=sys.stderr)
        return 2

    failed = False
    for name, actual, expected in lists:
        for label, names in (("missing", expected - actual), ("not in agentmail-api", actual - expected)):
            if names:
                failed = True
                print(f"{name}: {label}: {', '.join(sorted(names))}", file=sys.stderr)
    if failed:
        print(f"Permission docs disagree with {manifest['source']}. Fix the docs, or rerun with --fetch if the API changed.", file=sys.stderr)
        return 1
    print(f"Permission docs match {manifest['source']}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
