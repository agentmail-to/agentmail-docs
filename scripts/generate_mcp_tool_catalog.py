#!/usr/bin/env python3

import argparse
import difflib
import json
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen


MANIFEST_URL = "https://raw.githubusercontent.com/agentmail-to/agentmail-mcp/main/mcp-manifest.json"
MANIFEST = Path(__file__).resolve().parent / "mcp-manifest.json"
OUTPUT = Path(__file__).resolve().parents[1] / "fern/snippets/mcp-tool-catalog.mdx"
TOOL_NAME = re.compile(r"^[a-z][a-z0-9_]*$")


def fetch_manifest():
    request = Request(MANIFEST_URL, headers={"User-Agent": "agentmail-docs-tool-catalog"})
    with urlopen(request, timeout=30) as response:
        MANIFEST.write_bytes(response.read())
    print(f"Fetched {MANIFEST_URL} -> {MANIFEST}.")


def load_manifest():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    if not isinstance(manifest, dict):
        raise ValueError("manifest must be an object")
    if manifest.get("server") != "to.agentmail/agentmail":
        raise ValueError("manifest has an unexpected server identity")
    if manifest.get("endpoint") != "https://mcp.agentmail.to/mcp":
        raise ValueError("manifest has an unexpected endpoint")

    tools = manifest.get("tools")
    if not isinstance(tools, list) or not tools:
        raise ValueError("manifest tools must be a non-empty list")

    names = set()
    for tool in tools:
        if not isinstance(tool, dict):
            raise ValueError("each manifest tool must be an object")
        name = tool.get("name")
        if not isinstance(name, str) or not TOOL_NAME.fullmatch(name):
            raise ValueError(f"invalid tool name: {name!r}")
        if name in names:
            raise ValueError(f"duplicate tool name: {name}")
        names.add(name)
        if not isinstance(tool.get("description"), str) or not tool["description"].strip():
            raise ValueError(f"tool {name} has no description")
        if not isinstance(tool.get("oauthOnly"), bool):
            raise ValueError(f"tool {name} has no oauthOnly flag")
    return manifest


GROUPS = [
    ("Inboxes", "inbox"),
    ("Threads", "thread"),
    ("Messages", "message"),
    ("Drafts", "draft"),
    ("Attachments", "attachment"),
    ("Auth", "auth"),
    ("Organizations (OAuth sessions only)", "organization"),
]


# Docs-facing copy. The manifest descriptions are written for LLM sessions
# (schema detail, prompt-injection warnings); these are the human-readable
# versions. Tools without an entry fall back to the manifest description.
DESCRIPTIONS = {
    "list_inboxes": "List email inboxes, paginated.",
    "get_inbox": "Get an inbox by ID.",
    "create_inbox": "Create a new email inbox. Optionally specify username, domain, display name, and metadata.",
    "update_inbox": "Update an inbox's display name or metadata (metadata keys merge; null removes).",
    "delete_inbox": "Delete an inbox by ID.",
    "list_threads": "List email threads in an inbox. Filter by labels, sender, recipient, subject, or before/after datetime, paginated.",
    "search_threads": "Full-text search threads in an inbox, ranked by relevance (spam/trash excluded).",
    "get_thread": "Get a thread by ID, including its messages.",
    "update_thread": "Update a thread's labels (add or remove). System labels cannot be modified.",
    "delete_thread": "Delete a thread from an inbox.",
    "list_messages": "List messages in an inbox. Filter by labels, sender, recipient, subject, or before/after datetime, paginated.",
    "search_messages": "Full-text search messages in an inbox, ranked by relevance (spam/trash excluded).",
    "send_message": "Send an email from an inbox to one or more recipients.",
    "reply_to_message": "Reply to a message in its thread (replyAll to include all original recipients).",
    "forward_message": "Forward a message to new recipients.",
    "update_message": "Update a message's labels (add or remove).",
    "create_draft": "Create a draft email. Use `sendAt` (ISO 8601) to schedule it.",
    "list_drafts": "List drafts in an inbox. Filter by labels (e.g. `scheduled`).",
    "get_draft": "Get a draft by ID, including content, status, and scheduled send time.",
    "update_draft": "Update a draft. Use `sendAt` to reschedule.",
    "send_draft": "Send a draft immediately (converted to a sent message and deleted).",
    "delete_draft": "Delete a draft. Also cancels a scheduled send.",
    "get_attachment": "Get an attachment from a thread. Returns metadata and a download URL, plus extracted text for PDF/DOCX.",
    "auth_me": "Get the identity and scope of the authenticated credential (organization, pod, inbox IDs).",
    "list_organizations": "List the organizations you belong to and show which is currently selected.",
    "select_organization": "Choose which organization your operations target, by name or ID. Persists across sessions.",
}


def group_for(name):
    for title, keyword in GROUPS:
        if keyword in name:
            return title
    raise ValueError(f"tool {name} matches no resource group; update GROUPS")


def table_cell(value):
    return " ".join(value.split()).replace("|", r"\|")


def render(manifest):
    tools = manifest["tools"]
    shared_count = sum(not tool["oauthOnly"] for tool in tools)
    oauth_count = len(tools) - shared_count
    names = {tool["name"] for tool in tools}
    stale = sorted(set(DESCRIPTIONS) - names)
    if stale:
        raise ValueError(f"DESCRIPTIONS has entries for unknown tools: {', '.join(stale)}")
    grouped = {}
    for tool in tools:
        grouped.setdefault(group_for(tool["name"]), []).append(tool)
    lines = [
        f"{{/* Generated by scripts/generate_mcp_tool_catalog.py from manifest {manifest.get('digest', 'unknown')}. Do not edit. */}}",
        "",
        f"The server exposes **{shared_count} tools**, grouped by resource. OAuth sessions also receive **{oauth_count} organization-selection tools**.",
    ]
    for title, _ in GROUPS:
        if title not in grouped:
            continue
        lines += ["", f"### {title}", "", "| Tool | Description |", "| --- | --- |"]
        for tool in grouped[title]:
            description = DESCRIPTIONS.get(tool["name"], tool["description"])
            lines.append(f"| `{tool['name']}` | {table_cell(description)} |")
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Generate the MCP tool catalog from the vendored runtime manifest.")
    parser.add_argument("--check", action="store_true", help="Fail if the checked-in catalog does not match the vendored manifest.")
    parser.add_argument("--fetch", action="store_true", help="Refresh the vendored manifest from the canonical repository first.")
    args = parser.parse_args()

    try:
        if args.fetch:
            fetch_manifest()
        generated = render(load_manifest())
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Unable to generate MCP tool catalog: {error}", file=sys.stderr)
        return 2

    current = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
    if args.check:
        if current == generated:
            print("MCP tool catalog is current.")
            return 0
        print("MCP tool catalog is out of date. Run scripts/generate_mcp_tool_catalog.py.", file=sys.stderr)
        sys.stderr.writelines(
            difflib.unified_diff(
                current.splitlines(keepends=True),
                generated.splitlines(keepends=True),
                fromfile=str(OUTPUT),
                tofile=f"{OUTPUT} (generated)",
            )
        )
        return 1

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(generated, encoding="utf-8")
    print(f"Generated {OUTPUT}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
