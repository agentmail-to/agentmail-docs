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

## Triggering Fern Writer (API changelog)

The workflow does **not** post to Slack. It comments on the PR with the diff and uploads the `api-changelog-diff` artifact. To get a changelog draft:

- In **#github-prs** (or wherever @Fern Writer is), post or reply with the PR link and **@Fern Writer produce a changelog for this** (or "for PR <url> per AGENTS.md"). Fern Writer uses the PR link as context and can read the diff from the PR comment or artifact.
