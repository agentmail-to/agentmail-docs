# AgentMail Changelog Guidelines

Instructions for creating changelog entries (e.g. when tagged in Slack or writing manually). One source of truth for process and style.

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

## Slack flow (API changelog)

When the API Changelog workflow detects changes, it posts to your changelog Slack channel (if `SLACK_BOT_TOKEN` and `SLACK_CHANGELOG_CHANNEL` are set):

- **Message:** `@here` + “Please @fern-writer to generate a changelog for this PR” + link. It tells people to reply with “produce a changelog for this” (and @fern-writer).
- **Your move:** Reply to that message with “produce a changelog for this” and @fern-writer. The bot uses the PR link in the parent message as context (and can use the PR’s `api-changelog-diff` artifact or the bot comment on the PR for the diff).
- **To actually ping the bot in Slack:** If “@fern-writer” in the message doesn’t notify the bot, replace it in the workflow with the bot’s Slack user ID, e.g. `<@U01234ABCD>` (use a secret like `SLACK_FERN_WRITER_USER_ID` and put `<@${{ secrets.SLACK_FERN_WRITER_USER_ID }}>` in the payload).
