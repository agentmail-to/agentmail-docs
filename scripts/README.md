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
