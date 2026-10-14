#!/usr/bin/env python3

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


API_REPO = "agentmail-to/agentmail-api"
DEPLOY_WORKFLOW = "deploy-production.yml"
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
    result = subprocess.run(["gh", "api", *args], capture_output=True, text=True)
    if result.returncode:
        raise ValueError(f"gh api {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout


def section(text, start, end):
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if re.search(start, line):
            for j in range(i + 1, len(lines)):
                if re.search(end, lines[j]):
                    return "\n".join(lines[i + 1 : j])
    raise ValueError(f"no section from {start!r} to {end!r}")


def string_array(source, name):
    match = re.search(rf"^export const {name}\b[^=]*=\s*\[(.*?)\]", source, re.M | re.S)
    if not match:
        raise ValueError(f"no {name} array")
    return re.findall(r"['\"]([a-z_]+)['\"]", re.sub(r"//[^\n]*|/\*.*?\*/", "", match.group(1), flags=re.S))


def fetch_manifest():
    # The docs describe what is live, so read the commit the last successful production deploy shipped, not main.
    commit = gh(
        f"repos/{API_REPO}/actions/workflows/{DEPLOY_WORKFLOW}/runs?branch=main&status=success&per_page=1",
        "--jq",
        ".workflow_runs[0].head_sha",
    ).strip()
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError(f"no successful {DEPLOY_WORKFLOW} run found in {API_REPO}")
    raw = ("-H", "Accept: application/vnd.github.raw")
    schema = gh(*raw, f"repos/{API_REPO}/contents/{SCHEMA_PATH}?ref={commit}")
    gates = gh(*raw, f"repos/{API_REPO}/contents/{GATES_PATH}?ref={commit}")
    manifest = validate(
        {
            "source": f"{API_REPO}@{commit}",
            "permissions": re.findall(
                r"^[ \t]+([a-z_]+): z\.boolean\(\)",
                section(schema, r"^const permissionShape = z\.object\(\{$", r"^\}\)$"),
                re.M,
            ),
            "verification_gated": string_array(gates, "VERIFICATION_GATED_PERMISSIONS"),
            "opt_in": string_array(gates, "OPT_IN_PERMISSIONS"),
        }
    )
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Fetched permissions from {manifest['source']} -> {MANIFEST}.")


def validate(manifest):
    permissions = manifest.get("permissions")
    if not isinstance(permissions, list) or not permissions:
        raise ValueError("manifest permissions must be a non-empty list")
    if len(set(permissions)) != len(permissions) or not all(PERMISSION.fullmatch(p) for p in permissions):
        raise ValueError("manifest permissions must be unique snake_case names")
    for key in ("verification_gated", "opt_in"):
        names = manifest.get(key)
        if not isinstance(names, list) or not names or not set(names) <= set(permissions):
            raise ValueError(f"manifest {key} must be a non-empty subset of permissions")
    stale = UNDOCUMENTED - set(permissions)
    if stale:
        raise ValueError(f"UNDOCUMENTED names permissions the API no longer has: {', '.join(sorted(stale))}")
    return manifest


def load_manifest():
    return validate(json.loads(MANIFEST.read_text(encoding="utf-8")))


def camel(names):
    return {re.sub(r"_([a-z])", lambda m: m.group(1).upper(), name) for name in names}


def copy_block_fields(block):
    fields = []
    for line in block.splitlines():
        head, sep, names = line.partition(": ")
        # A line with no "Group: " prefix continues the previous group's list.
        fields += re.findall(r"\w+", re.sub(r"\(.*?\)", "", names if sep else head))
    return set(fields)


def opt_in_notes(block):
    return set(re.findall(r"(\w+) \(opt-in\b", block))


def doc_lists(manifest):
    definition = DEFINITION.read_text(encoding="utf-8")
    page = PAGE.read_text(encoding="utf-8")
    documented = set(manifest["permissions"]) - UNDOCUMENTED
    opt_in = set(manifest["opt_in"])
    full_access = documented - opt_in
    reads = {p for p in full_access if p.endswith("_read")}
    no_spam = full_access - {p for p in documented if p.startswith("label_")}
    python_copy = section(page, r"Permission fields \(all optional<bool>", r"^\s*$")
    typescript_copy = section(page, r"Permission fields \(all optional boolean", r"^\s*\*\s*$")
    verification = section(page, r"^### Agent verification$", r"^#")
    read_only = section(page, r"^### Read-only key$", r"^### ")
    no_spam_example = section(page, r"^### No-spam key$", r"^## ")
    page_name = PAGE.relative_to(ROOT)
    every = "every documented permission"
    reads_rule = "every *_read permission except opt-in ones"
    no_spam_rule = "every permission except opt-in and label_* ones"
    lists = [
        (
            f"{DEFINITION.relative_to(ROOT)} ApiKeyPermissions",
            every,
            set(re.findall(r"^      ([a-z_]+):$", section(definition, r"^  ApiKeyPermissions:$", r"^  \S"), re.M)),
            documented,
        ),
        (
            f"{page_name} reference tables",
            every,
            set(re.findall(r"^\| `([a-z_]+)` \|", section(page, r"^## Permissions Reference$", r"^## "), re.M)),
            documented,
        ),
        (f"{page_name} Copy for Cursor / Claude (Python)", f"{every}, snake_case", copy_block_fields(python_copy), documented),
        (f"{page_name} Copy for Cursor / Claude (Python) opt-in notes", "opt-in permissions", opt_in_notes(python_copy), opt_in),
        (
            f"{page_name} Copy for Cursor / Claude (TypeScript)",
            f"{every}, camelCase",
            copy_block_fields(typescript_copy),
            camel(documented),
        ),
        (
            f"{page_name} Copy for Cursor / Claude (TypeScript) opt-in notes",
            "opt-in permissions",
            opt_in_notes(typescript_copy),
            camel(opt_in),
        ),
        (
            f"{page_name} Agent verification list",
            "verification-gated permissions",
            set(re.findall(r"`([a-z_]+)`", "\n".join(re.findall(r"^- .*$", verification, re.M)))),
            set(manifest["verification_gated"]),
        ),
    ]
    for key, example, rule, expected in (
        ("read-only", read_only, reads_rule, reads),
        ("No-spam", no_spam_example, no_spam_rule, no_spam),
    ):
        name = f"{page_name} {key} key example"
        lists += [
            (f"{name} (Python)", rule, set(re.findall(r'"(\w+)": True\b', example)), expected),
            (f"{name} (TypeScript)", rule, set(re.findall(r"^[ \t]+(\w+): true\b", example, re.M)), camel(expected)),
            (f"{name} (CLI)", rule, set(re.findall(r'"(\w+)": true\b', example)), expected),
        ]
    return lists


def main():
    parser = argparse.ArgumentParser(
        description="Check the docs' hand-kept API key permission lists against agentmail-api's permission set."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Compare the docs with the vendored manifest.")
    mode.add_argument(
        "--fetch",
        action="store_true",
        help=f"Refresh the vendored manifest from the {API_REPO} commit in production (needs gh), then compare.",
    )
    args = parser.parse_args()

    try:
        if args.fetch:
            fetch_manifest()
        manifest = load_manifest()
        lists = doc_lists(manifest)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Unable to check permissions: {error}", file=sys.stderr)
        return 2

    failed = False
    for name, rule, actual, expected in lists:
        for label, names in (("missing", expected - actual), ("unexpected", actual - expected)):
            if names:
                failed = True
                print(f"{name} ({rule}): {label}: {', '.join(sorted(names))}", file=sys.stderr)
    if failed:
        print(
            f"Permission docs disagree with {manifest['source']}. Fix the docs, or rerun with --fetch if a production deploy changed the permissions.",
            file=sys.stderr,
        )
        return 1
    print(f"Permission docs match {manifest['source']}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
