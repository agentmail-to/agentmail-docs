#!/usr/bin/env python3
"""
Re-apply AgentMail's hand-patches to a freshly generated agentmail-cli checkout.

WHY THIS EXISTS
    `agentmail-to/agentmail-cli` is generated output. Every regeneration
    overwrites it wholesale, wiping fixes we carry for defects that live in
    Fern's templates. Until Fern ships them upstream, each regen must be
    re-patched — this script makes that one command instead of a checklist
    nobody remembers.

    Each patch below is filed with Fern (reported 2026-08-26). Delete the
    corresponding block here once a generator release makes it unnecessary,
    and confirm by regenerating and running this script: a patch whose
    anchor no longer matches fails loudly rather than silently skipping.

WHAT IT PATCHES
    1. repo assets   restore CHANGELOG.md + SECURITY.md and protect them,
                     plus cli/agentmail/custom.rs, via .fernignore
    2. windows       defer the win32-x64 npm package (npm has the name
                     spam-flagged; support ticket open). REMOVE THIS PATCH
                     once npm clears it — cargo-dist still ships the Windows
                     binary via the GitHub Release either way.

    Dropped on 2026-08-27, fixed upstream in generator 0.38.6 and verified:
      - launcher signal exit codes (128+signum) — now native
      - prerelease dist-tags (any SemVer prerelease, never latest) — now
        native, and handles all-numeric identifiers, which our patch did not

USAGE
    python3 bin/post-regen-patch.py <path-to-agentmail-cli-checkout>
    python3 bin/post-regen-patch.py <path> --skip windows      # after npm unblocks

Idempotent: re-running on an already-patched tree reports "already applied".
"""
import argparse
import pathlib
import re
import subprocess
import sys

APPLIED, SKIPPED = [], []


def patch(name, path, old, new, *, count=1):
    """Replace `old` with `new` in `path`. Fail loudly if the anchor is gone."""
    p = pathlib.Path(path)
    s = p.read_text()
    if new in s:
        SKIPPED.append(f"{name} (already applied)")
        return
    found = s.count(old)
    if found != count:
        sys.exit(
            f"ABORT [{name}]: expected {count} occurrence(s) of the anchor in "
            f"{p.name}, found {found}.\nThe generator template likely changed. "
            f"Re-read the generated file and update this patch rather than "
            f"forcing it through."
        )
    p.write_text(s.replace(old, new))
    APPLIED.append(name)


# ── 1. repo assets ────────────────────────────────────────────────────────────
FERNIGNORE = """# Specify files that shouldn't be modified by Fern

# Repo assets that predate the Fern generator — release history of the
# 0.7.x (Stainless-era) CLI and the security disclosure policy. The
# generator treats unknown files as stale output and deletes them, so
# they must be listed here to survive regeneration.
CHANGELOG.md
SECURITY.md

# Hand-authored custom command bindings. The scaffold and its docs say
# this file is protected; without this entry a regeneration overwrites it.
cli/agentmail/custom.rs
"""


def patch_assets(root):
    restored = []
    for f in ("CHANGELOG.md", "SECURITY.md"):
        if not (root / f).exists():
            r = subprocess.run(
                ["git", "checkout", "origin/main", "--", f],
                cwd=root, capture_output=True, text=True,
            )
            if r.returncode:
                sys.exit(f"ABORT [assets]: could not restore {f} from origin/main:\n{r.stderr}")
            restored.append(f)
    fi = root / ".fernignore"
    if fi.read_text() != FERNIGNORE:
        fi.write_text(FERNIGNORE)
        restored.append(".fernignore")
    (APPLIED if restored else SKIPPED).append(
        f"repo assets ({', '.join(restored)})" if restored else "repo assets (already applied)"
    )


# ── 2. windows deferral ───────────────────────────────────────────────────────
# Anchors are package-name agnostic: the same script has to work whether the
# generator is pointed at the production package or a validation one.
WIN_MATRIX = """          - rust-target: x86_64-pc-windows-msvc
            runner: windows-latest
            npm-platform-suffix: win32-x64
"""
WIN_PLATFORMS = re.compile(r'^ *"win32-x64": "[a-z0-9-]+-win32-x64",\n', re.M)
WIN_DEPS = re.compile(
    r'(          OPTIONAL_DEPS="\$\{OPTIONAL_DEPS\}\\"[a-z0-9-]+-darwin-arm64\\": \\"\$\{VERSION\}\\)",("\n)'
    r'          OPTIONAL_DEPS="\$\{OPTIONAL_DEPS\}\\"[a-z0-9-]+-win32-x64\\": \\"\$\{VERSION\}\\""\n'
)


def patch_windows(root):
    ci = root / ".github/workflows/ci.yml"
    s = ci.read_text()
    # The binName ternary legitimately mentions win32 and must survive.
    if "win32" not in s.replace('os.platform() === "win32"', ""):
        SKIPPED.append("windows deferral (already applied)")
        return
    if s.count(WIN_MATRIX) != 1:
        sys.exit(f"ABORT [windows]: matrix anchor matched {s.count(WIN_MATRIX)} times.")
    s = s.replace(WIN_MATRIX, "", 1)
    s, n = WIN_PLATFORMS.subn("", s)
    if n != 1:
        sys.exit(f"ABORT [windows]: PLATFORMS anchor matched {n} times.")
    s, n = WIN_DEPS.subn(r'\1"\2', s)
    if n != 1:
        sys.exit(f"ABORT [windows]: optionalDependencies anchor matched {n} times.")
    ci.write_text(s)
    APPLIED.append("windows deferral")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", help="path to an agentmail-cli checkout")
    ap.add_argument("--skip", action="append", default=[],
                    choices=["assets", "windows"],
                    help="skip a patch (e.g. --skip windows once npm unblocks the name)")
    args = ap.parse_args()

    root = pathlib.Path(args.repo).resolve()
    ci = root / ".github/workflows/ci.yml"
    if not ci.exists():
        sys.exit(f"ABORT: {ci} not found — is {root} an agentmail-cli checkout?")

    if "assets" not in args.skip:
        patch_assets(root)
    if "windows" not in args.skip:
        patch_windows(root)

    print("applied:")
    for a in APPLIED:
        print(f"  ✓ {a}")
    for s_ in SKIPPED:
        print(f"  – {s_}")
    if not APPLIED:
        print("  (nothing to do)")
    print("\nNext: review `git diff`, commit, and open a PR on agentmail-cli.")


if __name__ == "__main__":
    main()
