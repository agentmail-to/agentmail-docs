#!/usr/bin/env python3
"""Add dual-auth `security` blocks to the CLI OpenAPI overrides.

Sibling to gen-cli-overrides.py (which handles x-fern-sdk-* command nesting);
this script does not touch that one's behavior. It injects, for every operation
that declares `security` in the source spec (openapi/openapi.yml), a two-scheme
security block into the matching entry in
fern/apis/cli/openapi-overrides.yml:

    security:
    - BearerAuth: []
    - TokenAuth: []

and adds the TokenAuth definition under the overrides file's existing
`components:` block (as a sibling of the pre-existing `schemas:`):

    components:
      securitySchemes:
        TokenAuth:
          type: http
          scheme: bearer

POST /v0/agent/sign-up is public (it declares no `security` in the source spec)
and is skipped so new-user signup keeps working without a credential. The
script asserts exactly 121 operations are targeted -- the 122 total minus the
one public signup endpoint -- and aborts if that invariant does not hold.

Idempotent: re-running does not duplicate the per-operation security blocks or
the TokenAuth scheme. No third-party dependencies (line-wise parsing, matching
gen-cli-overrides.py's approach and the machine-generated file layout).

Usage:
  python3 bin/gen-cli-security-overrides.py            # dry-run: report only
  python3 bin/gen-cli-security-overrides.py --write    # modify the overrides file
"""
import argparse
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(REPO, "openapi", "openapi.yml")
OVERRIDES = os.path.join(REPO, "fern", "apis", "cli", "openapi-overrides.yml")
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options"}

# Signup is intentionally credential-free; adding auth would break new users.
PUBLIC = ("/v0/agent/sign-up", "post")
EXPECTED = 121  # 122 operations minus the one public signup endpoint

# 6-space indent matches the overrides file's convention (sequence dashes sit at
# the same column as their parent key, e.g. x-fern-sdk-group-name above).
SECURITY_BLOCK = [
    "      security:",
    "      - BearerAuth: []",
    "      - TokenAuth: []",
]
SCHEME_BLOCK = [
    "  securitySchemes:",
    "    TokenAuth:",
    "      type: http",
    "      scheme: bearer",
]


def _iter_path_method(lines):
    """Yield (index, line, cur_path, cur_method) walking the `paths:` section,
    where cur_method is set only on/after a method line within a path."""
    in_paths = False
    cur_path = cur_method = None
    for i, raw in enumerate(lines):
        line = raw.rstrip("\n")
        if re.match(r"^paths:\s*$", line):
            in_paths = True
            yield i, line, cur_path, cur_method, in_paths
            continue
        if in_paths and re.match(r"^\S", line):
            in_paths = False
            cur_path = cur_method = None
            yield i, line, cur_path, cur_method, in_paths
            continue
        if in_paths:
            mp = re.match(r"^  (/\S+):\s*$", line)
            if mp:
                cur_path, cur_method = mp.group(1), None
                yield i, line, cur_path, cur_method, in_paths
                continue
            mm = re.match(r"^    ([a-z]+):\s*$", line)
            if mm and mm.group(1) in HTTP_METHODS:
                cur_method = mm.group(1)
                yield i, line, cur_path, cur_method, in_paths
                continue
        yield i, line, cur_path, cur_method, in_paths


def spec_ops_with_security(path):
    """Return {(path, method)} for operations that declare `security:` in the spec."""
    have = set()
    for _, line, cur_path, cur_method, in_paths in _iter_path_method(list(open(path))):
        if in_paths and cur_path and cur_method and re.match(r"^      security:\s*$", line):
            have.add((cur_path, cur_method))
    return have


def overrides_ops(lines):
    """Return {(path, method)} for method blocks present in the overrides file."""
    ops = set()
    for _, line, cur_path, cur_method, in_paths in _iter_path_method(lines):
        if in_paths and cur_path and cur_method and re.match(r"^    [a-z]+:\s*$", line):
            ops.add((cur_path, cur_method))
    return ops


def add_security(lines, targets):
    """Insert the dual security block at the end of every targeted method block
    that lacks one. Returns (new_lines, inserted, already_present)."""
    out = []
    cur_path = open_key = None
    open_has_sec = False
    inserted = present = 0
    in_paths = False

    def close():
        nonlocal inserted, present, open_key, open_has_sec
        if open_key in targets:
            if open_has_sec:
                present += 1
            else:
                out.extend(l + "\n" for l in SECURITY_BLOCK)
                inserted += 1

    for raw in lines:
        line = raw.rstrip("\n")
        if re.match(r"^paths:\s*$", line):
            in_paths = True
            out.append(raw)
            continue
        if in_paths and re.match(r"^\S", line):
            close()
            open_key = None
            open_has_sec = False
            in_paths = False
            out.append(raw)
            continue
        if not in_paths:
            out.append(raw)
            continue
        mp = re.match(r"^  (/\S+):\s*$", line)
        if mp:
            close()
            cur_path = mp.group(1)
            open_key = None
            open_has_sec = False
            out.append(raw)
            continue
        mm = re.match(r"^    ([a-z]+):\s*$", line)
        if mm and mm.group(1) in HTTP_METHODS:
            close()
            open_key = (cur_path, mm.group(1))
            open_has_sec = False
            out.append(raw)
            continue
        if re.match(r"^      security:\s*$", line):
            open_has_sec = True
        out.append(raw)

    if in_paths:
        close()
    return out, inserted, present


def add_scheme(lines):
    """Insert the TokenAuth securitySchemes block as the first child of the
    existing top-level `components:` key. Returns (new_lines, inserted?)."""
    if any(re.match(r"^  securitySchemes:\s*$", l.rstrip("\n")) for l in lines):
        return lines, False
    if not any(re.match(r"^components:\s*$", l.rstrip("\n")) for l in lines):
        sys.exit("ERROR: no top-level `components:` block found in overrides; "
                 "refusing to guess placement for securitySchemes.")
    out, done = [], False
    for raw in lines:
        out.append(raw)
        if not done and re.match(r"^components:\s*$", raw.rstrip("\n")):
            out.extend(l + "\n" for l in SCHEME_BLOCK)
            done = True
    return out, done


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="modify the overrides file")
    args = ap.parse_args()

    targets = spec_ops_with_security(SPEC)

    # --- invariants: signup public, exactly 121 secured ---------------------
    if PUBLIC in targets:
        sys.exit(f"ERROR: {PUBLIC[1].upper()} {PUBLIC[0]} declares security in the "
                 "spec but must stay public; aborting.")
    print(f"spec operations declaring security: {len(targets)}")
    print(f"public (skipped): {PUBLIC[1].upper()} {PUBLIC[0]}")
    if len(targets) != EXPECTED:
        sys.exit(f"ERROR: expected exactly {EXPECTED} secured operations, found "
                 f"{len(targets)}; aborting so nothing is silently mis-scoped.")

    lines = list(open(OVERRIDES))

    # every target must exist as a block in the overrides, or we'd miss it
    present_ops = overrides_ops(lines)
    missing = sorted(targets - present_ops)
    if missing:
        sys.exit("ERROR: targets absent from overrides (run gen-cli-overrides.py "
                 "first): " + ", ".join(f"{m.upper()} {p}" for p, m in missing))

    new_lines, inserted, already = add_security(lines, targets)
    covered = inserted + already
    print(f"security blocks now present on targeted ops: {covered} "
          f"(inserted {inserted}, already present {already})")
    if covered != EXPECTED:
        sys.exit(f"ERROR: expected {EXPECTED} secured overrides entries, got {covered}.")

    new_lines, scheme_added = add_scheme(new_lines)
    print(f"TokenAuth scheme: {'inserted' if scheme_added else 'already present'}")

    if not args.write:
        print("\n(dry-run) re-run with --write to apply. Preview of first inserted block:")
        for l in SECURITY_BLOCK:
            print(l)
        return

    with open(OVERRIDES, "w") as f:
        f.writelines(new_lines)
    print(f"wrote {OVERRIDES}")


if __name__ == "__main__":
    main()
