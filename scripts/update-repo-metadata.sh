#!/usr/bin/env bash
# Update GitHub repo descriptions, homepage URLs, and topics for all agentmail-to public repos.
# Requires a GitHub token with admin access to the agentmail-to org.
#
# Usage:
#   GITHUB_TOKEN=ghp_xxx ./scripts/update-repo-metadata.sh
#
# Or pass as argument:
#   ./scripts/update-repo-metadata.sh ghp_xxx

set -euo pipefail

TOKEN="${1:-${GITHUB_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  echo "Error: Pass a GitHub token as argument or set GITHUB_TOKEN env var"
  exit 1
fi

API="https://api.github.com"
ORG="agentmail-to"
AUTH=(-H "Authorization: token $TOKEN" -H "Accept: application/vnd.github+json")

patch_repo() {
  local repo="$1" desc="$2" homepage="$3"
  echo "→ $repo"
  curl -sf -X PATCH "${AUTH[@]}" "$API/repos/$ORG/$repo" \
    -d "{\"description\":$(jq -n --arg d "$desc" '$d'),\"homepage\":$(jq -n --arg h "$homepage" '$h')}" \
    | jq '{name, description, homepage}' || echo "  ✗ FAILED (need admin?)"
}

set_topics() {
  local repo="$1"
  shift
  local topics
  topics=$(printf '"%s",' "$@" | sed 's/,$//')
  curl -sf -X PUT "${AUTH[@]}" "$API/repos/$ORG/$repo/topics" \
    -d "{\"names\":[$topics]}" \
    | jq '.names' || echo "  ✗ FAILED (need admin?)"
}

echo "=== Updating descriptions & homepage URLs ==="

patch_repo "agentmail-python" \
  "Official Python SDK for AgentMail — the email API for AI agents" \
  "https://pypi.org/project/agentmail"

patch_repo "agentmail-node" \
  "Official TypeScript/Node SDK for AgentMail — the email API for AI agents" \
  "https://www.npmjs.com/package/agentmail"

patch_repo "agentmail-go" \
  "Official Go SDK for AgentMail — the email API for AI agents" \
  "https://pkg.go.dev/github.com/agentmail-to/agentmail-go"

patch_repo "agentmail-toolkit" \
  "AgentMail integrations for OpenAI Agents SDK, Vercel AI SDK, and MCP" \
  "https://agentmail.to"

patch_repo "agentmail-mcp" \
  "AgentMail MCP Server — connect AI clients (Claude, Cursor, Windsurf) to email" \
  "https://mcp.agentmail.to"

patch_repo "agentmail-cli" \
  "Official CLI for AgentMail — manage inboxes, send and receive email from the terminal" \
  "https://docs.agentmail.to"

patch_repo "agentmail-docs" \
  "AgentMail API documentation" \
  "https://docs.agentmail.to"

patch_repo "agentmail-examples" \
  "Example agents built with AgentMail — email agents, sales outreach, and more" \
  "https://agentmail.to"

patch_repo "agentmail-skills" \
  "AgentMail skills for Claude Code and other AI coding agents" \
  "https://agentmail.to"

patch_repo "agentmail-schemas" \
  "AgentMail API schemas and type definitions" \
  "https://docs.agentmail.to"

patch_repo "agentmail-claude-skill" \
  "Claude Skill that teaches Claude how to build email agents with AgentMail" \
  "https://agentmail.to"

patch_repo "agentmail-smithery-mcp" \
  "AgentMail MCP Server for Smithery" \
  "https://smithery.ai"

patch_repo "homebrew-tap" \
  "Homebrew tap for AgentMail CLI" \
  "https://agentmail.to"

patch_repo "ai-email-agent-template" \
  "AI Email Agent template — built with AgentMail + OpenAI. Fork on Replit to get started." \
  "https://agentmail.to"

echo ""
echo "=== Updating topics ==="

set_topics "agentmail-python" \
  python sdk email ai-agents email-api agentmail

set_topics "agentmail-node" \
  typescript nodejs sdk email ai-agents email-api agentmail

set_topics "agentmail-go" \
  go golang sdk email ai-agents email-api agentmail

set_topics "agentmail-toolkit" \
  openai vercel-ai mcp ai-agents email agentmail langchain

set_topics "agentmail-mcp" \
  mcp model-context-protocol claude cursor ai-agents email agentmail

set_topics "agentmail-cli" \
  cli email ai-agents agentmail terminal

set_topics "agentmail-docs" \
  documentation api-docs email-api agentmail

set_topics "agentmail-examples" \
  examples email-agent ai-agents agentmail python

set_topics "agentmail-skills" \
  claude-code ai-coding-agent skills agentmail

set_topics "agentmail-schemas" \
  schemas typescript zod email-api agentmail

set_topics "agentmail-claude-skill" \
  claude claude-skill ai-agents email agentmail

set_topics "agentmail-mcp" \
  mcp model-context-protocol claude cursor ai-agents email agentmail

set_topics "homebrew-tap" \
  homebrew cli agentmail

set_topics "ai-email-agent-template" \
  template email-agent ai-agents openai replit agentmail

echo ""
echo "✓ Done! Check https://github.com/agentmail-to to verify."
