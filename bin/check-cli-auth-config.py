#!/usr/bin/env python3
"""Guard the `api.auth` key in the CLI generator config.

WHY THIS EXISTS
    `auth-schemes.<name>.token.env` is silently ignored unless `api.auth`
    names the scheme. Without it the generated CLI reads the generator's
    default variable name instead of ours, with no warning and a clean
    `fern check`. Verified across eight local generations on 0.38.6 and
    0.38.10, every variant declaring `env: AGENTMAIL_API_KEY`:

        api.auth              generated env
        BearerAuth            AGENTMAIL_API_KEY
        (absent)              AGENTMAIL_TOKEN     <- silently wrong

    That is not a hypothetical. It is how this repo ended up carrying a
    fictional second auth scheme, 136 per-operation security blocks and a
    generator script for a month (2f8cf66, reverted in the 0.38.10 bump).
    The failure is quiet and remote: nothing breaks until a user reports
    that the CLI cannot see the key they exported.

    `api.auth` looks redundant when only one scheme is declared, which is
    exactly why it needs a test rather than a comment. Reported to Fern;
    delete this check once a generator release warns or errors on its own.

Usage:
  python3 bin/check-cli-auth-config.py        # exit 0 = config is safe
"""
import re
import sys
from pathlib import Path

CONFIG = Path(__file__).resolve().parent.parent / "fern/apis/cli/generators.yml"

# Line-wise parsing, no third-party dependencies -- matching gen-cli-overrides.py
# and the small, machine-maintained shape of generators.yml.


def top_level_block(lines, key):
    """Lines belonging to a top-level `key:` mapping, excluding the key line."""
    out, inside = [], False
    for line in lines:
        if not line.strip() or line.lstrip().startswith("#"):
            if inside:
                out.append(line)
            continue
        if inside and not line.startswith((" ", "\t")):
            break
        if inside:
            out.append(line)
        elif line.rstrip() == f"{key}:":
            inside = True
    return out


def env_overriding_schemes(lines):
    """{scheme: env} for every auth-scheme declaring token.env."""
    found, current = {}, None
    for line in top_level_block(lines, "auth-schemes"):
        if m := re.match(r"^ {2}([A-Za-z0-9_-]+):\s*$", line):
            current = m.group(1)
        elif current and (m := re.search(r"\benv:\s*([A-Za-z0-9_]+)", line)):
            found[current] = m.group(1)
    return found


def declared_auth(lines):
    """None if `api.auth` is absent; else the set of scheme names it names."""
    block = top_level_block(lines, "api")
    for i, line in enumerate(block):
        if m := re.match(r"^ {2}auth:\s*(\S.*)?$", line):
            if inline := (m.group(1) or "").strip():
                return {inline}
            names = set()
            for nxt in block[i + 1:]:
                if nxt.strip() and not nxt.startswith("    "):
                    break
                if m2 := re.search(r"^\s*(?:any|all):\s*\[(.*?)\]", nxt):
                    names |= {n.strip() for n in m2.group(1).split(",") if n.strip()}
                elif m2 := re.match(r"^\s*-\s*([A-Za-z0-9_-]+)\s*$", nxt):
                    names.add(m2.group(1))
            return names
    return None


def main():
    if not CONFIG.exists():
        sys.exit(f"ABORT: {CONFIG} not found.")
    lines = CONFIG.read_text().splitlines()

    overriding = env_overriding_schemes(lines)
    if not overriding:
        print("check-cli-auth-config: no env overrides declared; nothing to guard.")
        return

    shown = ", ".join(f"{k}={v}" for k, v in sorted(overriding.items()))
    named = declared_auth(lines)
    if named is None:
        sys.exit(
            f"FAIL: auth-schemes declares an env override ({shown}) but `api.auth` "
            "is absent.\n"
            "      The override will be SILENTLY IGNORED and the generated CLI will "
            "read the generator's default variable name instead.\n"
            "      Fix: add `auth: <scheme>` under `api:` in "
            "fern/apis/cli/generators.yml, naming every scheme above."
        )

    if missing := sorted(set(overriding) - named):
        sys.exit(
            f"FAIL: `api.auth` does not name {', '.join(missing)}, whose env "
            "override will be silently ignored.\n"
            f"      api.auth currently names: {', '.join(sorted(named)) or '(nothing)'}"
        )

    print(
        f"check-cli-auth-config: OK -- api.auth names {', '.join(sorted(named))}; "
        f"env overrides ({shown}) will apply."
    )


if __name__ == "__main__":
    main()
