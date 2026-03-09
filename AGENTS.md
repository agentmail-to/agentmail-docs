# AgentMail Changelog Guidelines

Instructions for creating changelog entries (e.g. when asked in #github-prs with a PR link or writing manually). One source of truth for process and style.

## When you're invoked

- **API changes:** A PR that touches `fern/definition/**` triggers a GitHub Action. It posts an oasdiff (technical diff) on the PR and uploads it as the `api-changelog-diff` artifact. Someone may tag you with that PR or paste the diff.
- **Manual:** For non-API changes, create `fern/changelog/YYYY-MM-DD.mdx` and follow the structure below. Use `fern/changelog/TEMPLATE.mdx` as reference.
- **Output:** Create or edit files in `fern/changelog/`. File name: `YYYY-MM-DD.mdx` (same day = add suffix e.g. `2026-01-30-metrics.mdx`).

## Required structure

1. **Summary** (2–3 sentences): What changed and **user benefit**. Not "New GET /foo" — e.g. "Monitor X in real-time so agents can…"
2. **What's new?** Bullets: new endpoints, features, or capabilities (with paths/params).
3. **Breaking changes** (if any): ⚠️ header, clear explanation, before/after code, timeline if deprecated.
4. **Use cases** (2–4): "Build agents that…" — what users can do with this.
5. **SDK Updates:** Links to Python and Node SDK releases (include when documenting an SDK release).
6. **Code block:** When it helps (bar is low), include **both Python and TypeScript** in a single toggle. Use `<CodeBlocks>` (plural) with two fenced blocks: ` ```python title="Python" ` and ` ```typescript title="TypeScript" `. When included: runnable (imports + client), &lt; 15 lines per language. Use realistic IDs. **Code comments: use lowercase** (e.g. `# create a draft` not `# Create a draft`).
7. **Note:** One call-to-action link to API reference or a guide.

## Voice and terms

- User-focused, action-oriented, specific. Use "agents" (not "bots"), "inboxes" (not "mailboxes"), "deliverability", "bounce rate."
- Tags: 2–4 total. API area: `inboxes-api`, `messages-api`, `drafts-api`, `domains-api`, `webhooks`, `websockets`, `pods-api`, `metrics-api`, etc. Change type: `new-feature`, `breaking-change`, `enhancement`, `bug-fix`. Deliverable: `sdk`, `docs`.

## Format (for predictable output)

- **Frontmatter:** Exactly `---` then `tags: ["tag1", "tag2", ...]` then `---`. Tags are a YAML array of strings.
- **Section headers:** Use `## Summary`, `### What's new?`, `### Use cases`. Add `### Breaking changes` only when needed.
- **Components:** Use `<CodeBlocks>` (plural) with two fenced blocks: ` ```python title="Python" ` … ` ``` ` and ` ```typescript title="TypeScript" ` … ` ``` ` so readers get a Python | TypeScript tab toggle. Use `<Note>` with a single paragraph and optional link inside. No other custom components.
- **Links:** Use `https://docs.agentmail.to/...` (e.g. `/api-reference/metrics`, `/core-concepts/pods`, `/webhooks/webhooks-overview`). No relative links.
- **Date:** Use today's date for new entries (`YYYY-MM-DD.mdx`) unless the user specifies a date.
- **Don't:** Invent endpoints or params — only document what's in the diff/API. Avoid raw `<` in prose (e.g. write "under 100ms" not "<100ms") so MDX doesn't break.

## Minimal example (mirror this structure)

- Frontmatter: `---` then `tags: ["webhooks", "new-feature", "sdk"]` then `---`
- Sections in order: `## Summary` → `### What's new?` → `### Use cases` → `<CodeBlocks>` with ` ```python title="Python" ` and ` ```typescript title="TypeScript" ` (same example in both; runnable, imports + client) → `<Note>` with one sentence and link to `https://docs.agentmail.to/...`
- Add `### Breaking changes` only when applicable (⚠️ + before/after code). Add SDK Updates section when documenting an SDK release.

## Checklist before finalizing

- Summary states user benefit. Code is runnable. Links valid. Breaking changes have before/after. Tags accurate. Technical accuracy matches API definition.

---

# AgentMail Knowledge Base Writing Guidelines

Instructions for creating Knowledge Base articles in `fern/pages/knowledge-base/`. These are standalone, crawlable FAQ-style articles aimed at developers and LLMs.

## General rules

- **No em dashes or en dashes.** Use colons, commas, or "to" instead. Dashes are easily identified as AI-generated.
- **No Documentation Index blocks.** Never include the `llms.txt` pointer block.
- **No broken internal links.** Before adding a link to another docs page, verify the target page actually exists. If it doesn't, don't add the link.
- **Verify correctness.** After finishing each article, re-read it. Search online if needed to confirm provider-specific details (e.g., DNS propagation times, UI field names).
- **Don't invent features.** Only document what AgentMail actually supports. If unsure whether a feature works a certain way, leave it out rather than guess.

## File structure

- Articles live in `fern/pages/knowledge-base/`
- Format: `.mdx` with frontmatter (`title`, `subtitle`, `slug`)
- Slugs follow pattern: `knowledge-base/article-name`
- Navigation: `docs.yml` > Knowledge Base section (between Examples and Resources)
- Comment out unfinished entries in `docs.yml` so `fern docs dev` doesn't break

## Frontmatter template

```yaml
---
title: "Article title as a question or topic"
subtitle: One-line description.
slug: knowledge-base/article-slug
---
```

## Article structure

Match Resend KB quality. Articles should include:

- **Tables** for DNS record fields, comparison matrices, etc.
- **Code examples** using the actual AgentMail SDK (Python primary, verify API signatures against `fern/definition/` or existing docs)
- **Warnings/Notes** using `<Warning>` and `<Note>` Fern components for provider-specific gotchas
- **Troubleshooting section** ("Common Issues") for DNS guides and similar
- **Verification section** for setup guides (propagation times, how to confirm success)

## Code accuracy

- Always verify SDK method signatures against `fern/pages/core-concepts/` docs or `fern/definition/` YAML
- `to`, `cc`, `bcc` are `list<string>` on messages
- Webhook payloads use `payload["message"]` for `message.received` events (not `payload["data"]`)
- WebSocket SDK uses `client.websockets.connect()` with typed events (`Subscribe`, `Subscribed`, `MessageReceivedEvent`)
- Reply API: `client.inboxes.messages.reply(inbox_id=..., message_id=..., text=..., html=...)`
- Labels: `client.inboxes.messages.update(..., add_labels=[...], remove_labels=[...])`
- Lists: `client.lists.create(direction, type, entry=...)` where direction is "send"/"receive" and type is "allow"/"block"
- Drafts: `client.inboxes.drafts.create(inbox_id=..., to=[...], ...)` then `client.inboxes.drafts.send(inbox_id=..., draft_id=...)`

## Reference

- Linear ENG-323 has 24 KB article drafts. Use as reference but write the best version independently.
- Introduction page (`introduction.mdx`) uses `<Cards>` components to link to all articles by category.
- Categories: Getting Started (4), Agent Patterns (6), Domains & Deliverability (5), Troubleshooting (4), DNS Guides (4)

## Triggering Fern Writer (API changelog)

The workflow does **not** post to Slack. It comments on the PR with the diff and uploads the `api-changelog-diff` artifact. To get a changelog draft:

- In **#github-prs** (or wherever @Fern Writer is), post or reply with the PR link and **@Fern Writer produce a changelog for this** (or "for PR <url> per AGENTS.md"). Fern Writer uses the PR link as context and can read the diff from the PR comment or artifact.
