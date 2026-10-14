# MCP tool catalog

The "Available tools" table on the [MCP integration page](../fern/pages/integrations/mcp.mdx) is generated, not hand-written. Do not edit `fern/snippets/mcp-tool-catalog.mdx` directly.

## How it works

- [`agentmail-mcp`](https://github.com/agentmail-to/agentmail-mcp) generates `mcp-manifest.json` from the live server (`pnpm generate:manifest`) and keeps it fresh in its own CI. That file is the canonical tool contract.
- `mcp-manifest.json` in this directory is a vendored copy of that manifest.
- `generate_mcp_tool_catalog.py` renders the vendored manifest into `fern/snippets/mcp-tool-catalog.mdx`, which `mcp.mdx` includes. Tool names, grouping, and counts come from the manifest; docs-facing descriptions live in the script's `DESCRIPTIONS` map (the manifest descriptions are written for LLM sessions and fall back in for tools without an entry).
- CI runs `generate_mcp_tool_catalog.py --check` on every PR. It is fully offline: it only verifies the snippet matches the vendored manifest.

## Updating the catalog

When an `agentmail-mcp` release changes the tool set (and is deployed to production):

```bash
python3 scripts/generate_mcp_tool_catalog.py --fetch
```

This refreshes the vendored manifest from the canonical repo and regenerates the snippet. Commit both files.

Docs deliberately track the vendored (released) manifest, not `agentmail-mcp` `main`, so they describe what is deployed. The manifest digest stamped in the snippet's header comment tells you which contract version the published docs reflect.

If CI fails with "MCP tool catalog is out of date", someone edited the snippet or manifest by hand — rerun the script without flags to regenerate from the vendored manifest.

# API key permission lists

The docs keep the API key permission set by hand in several places: `ApiKeyPermissions` in [`api-keys.yml`](../fern/apis/api/definition/api-keys.yml), and in [`permissions.mdx`](../fern/pages/core-concepts/permissions.mdx) the reference tables, both "Copy for Cursor / Claude" blocks, the read-only key example, and the agent verification list.

- `api-permissions.json` is a vendored copy of `agentmail-api`'s permission keys (`permissionShape` in `src/core/schemas/api-key.ts`) and `VERIFICATION_GATED_PERMISSIONS` (`src/core/utils/permissions.ts`), stamped with the commit it was read from.
- `check_permissions.py --check` fails when any of those lists disagrees with the manifest. The read-only example must hold every `*_read` permission. `owner_profile` and `owner_email` are deprecated and left out of the docs on purpose (`UNDOCUMENTED` in the script). CI runs the check on every PR, offline.

When an `agentmail-api` change adds, removes, or re-gates a permission:

```bash
python3 scripts/check_permissions.py --fetch
```

This reads both files from `agentmail-api` `main` with `gh` (the repository is private), rewrites the manifest, and lists every docs list that is now out of date. Update those lists and commit them with the manifest.
