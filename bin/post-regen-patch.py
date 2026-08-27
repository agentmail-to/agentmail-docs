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
    2. launcher      signal deaths must exit 128+signum, not 0
    3. publishing    any SemVer prerelease gets its own dist-tag, never latest
    4. windows       defer the win32-x64 npm package (npm has the name
                     spam-flagged; support ticket open). REMOVE THIS PATCH
                     once npm clears it — cargo-dist still ships the Windows
                     binary via the GitHub Release either way.

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


# ── 2. launcher exit codes ────────────────────────────────────────────────────
LAUNCHER_OLD = """          try {
            execFileSync(binPath, process.argv.slice(2), { stdio: "inherit" });
          } catch (e) {
            if (e && typeof e === "object" && "status" in e) {
              process.exit(e.status);
            }
            throw e;
          }"""

LAUNCHER_NEW = """          try {
            execFileSync(binPath, process.argv.slice(2), { stdio: "inherit" });
          } catch (e) {
            if (e && typeof e === "object") {
              // Normal non-zero exit: pass the code through.
              if (typeof e.status === "number") {
                process.exit(e.status);
              }
              // Signal death (SIGTERM/SIGSEGV/...): execFileSync reports
              // status: null + signal. Exiting with e.status here becomes
              // process.exit(null) -> 0, turning a killed process into
              // "success" for any caller checking $?. Use the shell
              // convention 128+signal instead (SIGTERM -> 143).
              if (e.signal) {
                const signum = (os.constants && os.constants.signals && os.constants.signals[e.signal]) || 0;
                process.exit(signum ? 128 + signum : 1);
              }
            }
            throw e;
          }"""

# ── 3. prerelease dist-tags ───────────────────────────────────────────────────
PRERELEASE_OLD = """          if [[ "${VERSION}" == *-alpha* ]]; then
            npm publish --access public --tag alpha
          elif [[ "${VERSION}" == *-beta* ]]; then
            npm publish --access public --tag beta
          else"""

PRERELEASE_NEW = """          # Any SemVer prerelease (identifier after the first "-") publishes
          # under its own dist-tag, never "latest": alpha/beta/rc/next/... A
          # tag like v1.1.0-rc.1 previously fell through to a bare publish and
          # would have moved "latest" to a prerelease.
          PRERELEASE="${VERSION#*-}"
          if [[ "${PRERELEASE}" != "${VERSION}" ]]; then
            DIST_TAG="${PRERELEASE%%.*}"        # 1.0.0-rc.1  -> rc
            DIST_TAG="${DIST_TAG%%+*}"          # strip build metadata
            DIST_TAG="$(printf '%s' "${DIST_TAG}" | tr -cd '[:alnum:]-')"
            [[ -z "${DIST_TAG}" ]] && DIST_TAG="prerelease"
            echo "Publishing prerelease ${VERSION} with --tag ${DIST_TAG}"
            npm publish --access public --tag "${DIST_TAG}"
          else"""

# ── 4. windows deferral ───────────────────────────────────────────────────────
WIN_MATRIX = """          - rust-target: x86_64-pc-windows-msvc
            runner: windows-latest
            npm-platform-suffix: win32-x64
"""
WIN_PLATFORMS = '            "win32-x64": "agentmail-cli-win32-x64",\n'
WIN_DEPS = re.compile(
    r'(          OPTIONAL_DEPS="\$\{OPTIONAL_DEPS\}\\"agentmail-cli-darwin-arm64\\": \\"\$\{VERSION\}\\)",("\n)'
    r'          OPTIONAL_DEPS="\$\{OPTIONAL_DEPS\}\\"agentmail-cli-win32-x64\\": \\"\$\{VERSION\}\\""\n'
)


def patch_windows(root):
    ci = root / ".github/workflows/ci.yml"
    s = ci.read_text()
    if "win32-x64" not in s.replace('os.platform() === "win32"', ""):
        SKIPPED.append("windows deferral (already applied)")
        return
    for label, frag in (("matrix entry", WIN_MATRIX), ("PLATFORMS entry", WIN_PLATFORMS)):
        if s.count(frag) != 1:
            sys.exit(f"ABORT [windows]: {label} anchor matched {s.count(frag)} times.")
        s = s.replace(frag, "", 1)
    s, n = WIN_DEPS.subn(r'\1"\2', s)
    if n != 1:
        sys.exit(f"ABORT [windows]: optionalDependencies anchor matched {n} times.")
    ci.write_text(s)
    APPLIED.append("windows deferral")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", help="path to an agentmail-cli checkout")
    ap.add_argument("--skip", action="append", default=[],
                    choices=["assets", "launcher", "prerelease", "windows"],
                    help="skip a patch (e.g. --skip windows once npm unblocks the name)")
    args = ap.parse_args()

    root = pathlib.Path(args.repo).resolve()
    ci = root / ".github/workflows/ci.yml"
    if not ci.exists():
        sys.exit(f"ABORT: {ci} not found — is {root} an agentmail-cli checkout?")

    if "assets" not in args.skip:
        patch_assets(root)
    if "launcher" not in args.skip:
        patch("launcher exit codes", ci, LAUNCHER_OLD, LAUNCHER_NEW)
    if "prerelease" not in args.skip:
        patch("prerelease dist-tags", ci, PRERELEASE_OLD, PRERELEASE_NEW, count=2)
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
