#!/usr/bin/env python3
"""Generate x-fern-sdk-group-name / x-fern-sdk-method-name annotations for every
CLI operation missing from fern/apis/cli/openapi-overrides.yml.

Idempotent: reads the committed OpenAPI spec (openapi/openapi.yml) and the
existing overrides file, computes the unannotated (path, method) pairs, and
appends entries for them. Re-run after every spec re-export so new endpoints
(e.g. batchUpdate) pick up annotations in seconds.

Naming:
  - group-name array: operationId prefix segments verbatim (matches the
    convention of the hand-written entries, e.g. [inboxes, apiKeys] -- group
    names are kebab-normalized by the generator, method names are NOT).
  - method-name: operationId tail segment, kebab-cased (batchGet -> batch-get,
    getZoneFile -> get-zone-file). Plain CRUD stays list/get/create/update/delete.
  - Where the retired demo overlay (agentmail-cli/cli/agentmail/overlay.yaml)
    hand-curated a name for the same path+method, its group names are ported
    verbatim and its method name is kebab-normalized.

Usage:
  python3 bin/gen-cli-overrides.py            # report what would be appended
  python3 bin/gen-cli-overrides.py --write    # append to the overrides file
  python3 bin/gen-cli-overrides.py --table /tmp/cli-command-map.md

No third-party dependencies: both inputs are machine-generated YAML with a
fixed layout, parsed line-wise.
"""
import argparse
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(REPO, "openapi", "openapi.yml")
OVERRIDES = os.path.join(REPO, "fern", "apis", "cli", "openapi-overrides.yml")
OLD_OVERLAY = os.path.expanduser(
    "~/Desktop/AgentMail_Workplace/agentmail-cli/cli/agentmail/overlay.yaml"
)
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options"}


def kebab(name: str) -> str:
    """batchGet -> batch-get, getZoneFile -> get-zone-file, reply-all unchanged."""
    return re.sub(r"(?<=[a-z0-9])([A-Z])", r"-\1", name).lower()


def parse_spec(path):
    """Yield (path, method, operationId) from the generated OpenAPI YAML."""
    ops, cur_path, cur_method, in_paths = [], None, None, False
    for line in open(path):
        if re.match(r"^paths:\s*$", line):
            in_paths = True
            continue
        if in_paths and re.match(r"^\S", line):  # next top-level key
            in_paths = False
        if not in_paths:
            continue
        m = re.match(r"^  (/\S+):\s*$", line)
        if m:
            cur_path = m.group(1)
            continue
        m = re.match(r"^    ([a-z]+):\s*$", line)
        if m and m.group(1) in HTTP_METHODS:
            cur_method = m.group(1)
            continue
        m = re.match(r"^      operationId:\s*(\S+)\s*$", line)
        if m and cur_path and cur_method:
            ops.append((cur_path, cur_method, m.group(1)))
    return ops


def parse_existing(path):
    """Return {(path, method)} pairs already annotated in the overrides file."""
    annotated, cur_path, cur_method, in_paths = set(), None, None, False
    for line in open(path):
        if re.match(r"^paths:\s*$", line):
            in_paths = True
            continue
        if in_paths and re.match(r"^\S", line):
            in_paths = False
        if not in_paths:
            continue
        m = re.match(r"^  (/\S+):\s*$", line)
        if m:
            cur_path = m.group(1)
            continue
        m = re.match(r"^    ([a-z]+):\s*$", line)
        if m and m.group(1) in HTTP_METHODS:
            cur_method = m.group(1)
            continue
        if "x-fern-sdk-method-name:" in line and cur_path and cur_method:
            annotated.add((cur_path, cur_method))
    return annotated


def parse_existing_full(path):
    """Return {(path, method): (groups, method_name)} from the overrides file
    (used for the collision check and the review table)."""
    out, cur_path, cur_method, in_paths = {}, None, None, False
    groups, collecting = [], False
    for line in open(path):
        if re.match(r"^paths:\s*$", line):
            in_paths = True
            continue
        if in_paths and re.match(r"^\S", line):
            in_paths = False
        if not in_paths:
            continue
        m = re.match(r"^  (/\S+):\s*$", line)
        if m:
            cur_path = m.group(1)
            continue
        m = re.match(r"^    ([a-z]+):\s*$", line)
        if m and m.group(1) in HTTP_METHODS:
            cur_method = m.group(1)
            continue
        if "x-fern-sdk-group-name:" in line:
            groups, collecting = [], True
            continue
        m = re.match(r"^      - (\S+)\s*$", line)
        if m and collecting:
            groups.append(m.group(1))
            continue
        m = re.match(r"^      x-fern-sdk-method-name:\s*(\S+)\s*$", line)
        if m:
            collecting = False
            out[(cur_path, cur_method)] = (list(groups), m.group(1))
    return out


def parse_old_overlay(path):
    """Return {(path, method): (groups, method_name)} from the retired demo
    overlay (OpenAPI Overlay 1.0 format with JSONPath targets)."""
    if not os.path.exists(path):
        return {}
    out, key, groups, collecting = {}, None, [], False
    for line in open(path):
        m = re.match(r"^- target: \$\.paths\['([^']+)'\]\.([a-z]+)\s*$", line)
        if m:
            key, groups, collecting = (m.group(1), m.group(2)), [], False
            continue
        if "x-fern-sdk-group-name:" in line:
            collecting = True
            continue
        m = re.match(r"^    - (\S+)\s*$", line)
        if m and collecting:
            groups.append(m.group(1))
            continue
        m = re.match(r"^    x-fern-sdk-method-name:\s*(\S+)\s*$", line)
        if m and key:
            out[key] = (list(groups), m.group(1))
            collecting = False
    return out


def derive(operation_id, url_path):
    """Derive (groups, method, ambiguous?) from an operationId like
    inboxes_apiKeys_create, cross-checked against the URL's resource segments."""
    segments = operation_id.split("_")
    groups, method = segments[:-1], kebab(segments[-1])
    # cross-check: every group segment should appear as a path resource segment
    path_resources = {
        s.replace("-", "").lower()
        for s in url_path.split("/")
        if s and not s.startswith("{") and s != "v0"
    }
    ambiguous = [
        g for g in groups if kebab(g).replace("-", "").lower() not in path_resources
    ]
    return groups, method, ambiguous


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="append to the overrides file")
    ap.add_argument("--table", help="write a human-review markdown table here")
    args = ap.parse_args()

    spec_ops = parse_spec(SPEC)
    existing = parse_existing(OVERRIDES)
    existing_full = parse_existing_full(OVERRIDES)
    overlay = parse_old_overlay(OLD_OVERLAY)

    rows = []  # (groups, method, path, http, source, ambiguous)
    missing = []
    for url_path, http, op_id in spec_ops:
        if (url_path, http) in existing:
            g, m = existing_full[(url_path, http)]
            rows.append((g, m, url_path, http, "existing", []))
            continue
        if (url_path, http) in overlay:
            g, old_m = overlay[(url_path, http)]
            m = kebab(old_m)
            src = "ported" if m == old_m else f"ported (kebabbed {old_m})"
            rows.append((g, m, url_path, http, src, []))
        else:
            g, m, amb = derive(op_id, url_path)
            rows.append((g, m, url_path, http, "derived", amb))
        missing.append((url_path, http, rows[-1][0], rows[-1][1]))

    # ---- validations -------------------------------------------------------
    print(f"spec operations: {len(spec_ops)}")
    print(f"already annotated: {len(spec_ops) - len(missing)}")
    print(f"to append: {len(missing)}")
    covered = len(spec_ops)
    print(f"coverage after append: {covered}/{len(spec_ops)}")

    seen, collisions = {}, []
    for g, m, p, h, *_ in rows:
        key = (tuple(kebab(x) for x in g), m)
        if key in seen:
            collisions.append((key, seen[key], (p, h)))
        seen[key] = (p, h)
    if collisions:
        print("COLLISIONS:")
        for key, a, b in collisions:
            print("  ", " ".join(key[0]), key[1], "<-", a, "AND", b)
        sys.exit(1)
    print("collisions: none")

    ambiguous_rows = [r for r in rows if r[5]]
    if ambiguous_rows:
        print("AMBIGUOUS derivations (group segment not found in path):")
        for g, m, p, h, s, amb in ambiguous_rows:
            print(f"  {' '.join(g)} {m}  ({h.upper()} {p})  unmatched: {amb}")

    # ---- review table ------------------------------------------------------
    if args.table:
        with open(args.table, "w") as f:
            f.write("# CLI command map (agentmail <group...> <method>)\n\n")
            f.write("| command | http | path | source |\n|---|---|---|---|\n")
            for g, m, p, h, s, amb in sorted(rows, key=lambda r: (r[0], r[1])):
                cmd = "agentmail " + " ".join(kebab(x) for x in g) + " " + m
                star = " ⚠AMBIGUOUS" if amb else ""
                f.write(f"| `{cmd}` | {h.upper()} | `{p}` | {s}{star} |\n")
        print(f"review table -> {args.table}")

    # ---- emit --------------------------------------------------------------
    if not missing:
        print("nothing to append")
        return
    # group consecutive methods under one path key, preserving spec order
    by_path, order = {}, []
    for url_path, http, g, m in missing:
        if url_path not in by_path:
            by_path[url_path] = []
            order.append(url_path)
        by_path[url_path].append((http, g, m))

    chunk = []
    for url_path in order:
        chunk.append(f"  {url_path}:")
        for http, g, m in by_path[url_path]:
            chunk.append(f"    {http}:")
            chunk.append("      x-fern-sdk-group-name:")
            for seg in g:
                chunk.append(f"      - {seg}")
            chunk.append(f"      x-fern-sdk-method-name: {m}")
    text = "\n".join(chunk) + "\n"

    if args.write:
        with open(OVERRIDES, "a") as f:
            f.write(text)
        print(f"appended {len(missing)} operations to {OVERRIDES}")
    else:
        print("--- would append (run with --write) ---")
        print(text)


if __name__ == "__main__":
    main()
