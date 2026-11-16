#!/usr/bin/env python3
"""Tag every console link in the docs with docs attribution UTMs.

Each Markdown link or JSX href to https://console.agentmail.to gets
utm_source=docs, utm_medium=docs and utm_campaign=<page slug>, where the slug
comes from the page's frontmatter (falling back to its path under fern/pages).
Links inside fenced code blocks are left alone. Re-running is safe: links that
already carry the three parameters are rewritten to the same values.

Usage:
    python3 scripts/tag_console_links.py           # rewrite files in place
    python3 scripts/tag_console_links.py --check   # exit 1 if any link is untagged
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "fern" / "pages"
DOCS_DIRS = [PAGES, ROOT / "fern" / "changelog", ROOT / "fern" / "snippets"]
CONSOLE = "https://console.agentmail.to"
FENCE = re.compile(r"^\s*(```|~~~)")
SLUG = re.compile(r"^slug:\s*['\"]?([^'\"\n]+?)['\"]?\s*$", re.MULTILINE)
# A Markdown link target or a JSX href that points at the console.
LINK = re.compile(r"(\]\(|href=\")(" + re.escape(CONSOLE) + r"[^)\"\s]*)([)\"])")


def page_slug(path: Path, text: str) -> str:
    head = text.split("\n---", 1)[0] if text.startswith("---") else ""
    match = SLUG.search(head)
    if match:
        return match.group(1).strip().strip("/")
    try:
        return path.relative_to(PAGES).with_suffix("").as_posix()
    except ValueError:
        return path.stem


def tag(url: str, slug: str) -> str:
    parts = urlsplit(url)
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if not k.startswith("utm_")]
    query += [("utm_source", "docs"), ("utm_medium", "docs"), ("utm_campaign", slug)]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query, safe="/"), parts.fragment))


def process(path: Path, check: bool) -> tuple[int, int]:
    text = path.read_text(encoding="utf-8")
    slug = page_slug(path, text)
    lines = text.split("\n")
    in_fence = False
    tagged = untagged = 0
    for index, line in enumerate(lines):
        if FENCE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue

        def replace(match: re.Match[str]) -> str:
            nonlocal tagged, untagged
            url = match.group(2)
            wanted = tag(url, slug)
            if url == wanted:
                tagged += 1
                return match.group(0)
            untagged += 1
            return match.group(1) + wanted + match.group(3)

        lines[index] = LINK.sub(replace, line)
    if untagged and not check:
        path.write_text("\n".join(lines), encoding="utf-8")
    return tagged, untagged


def main(argv: list[str]) -> int:
    check = "--check" in argv
    total_tagged = total_untagged = 0
    for directory in DOCS_DIRS:
        for path in sorted(directory.rglob("*.md*")):
            tagged, untagged = process(path, check)
            if untagged:
                verb = "untagged" if check else "tagged"
                print(f"{path.relative_to(ROOT)}: {untagged} {verb}")
            total_tagged += tagged
            total_untagged += untagged
    if check:
        print(f"{total_tagged} console links tagged, {total_untagged} untagged")
        return 1 if total_untagged else 0
    print(f"{total_untagged} console links tagged this run, {total_tagged} already tagged")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
