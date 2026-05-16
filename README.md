# AgentMail Documentation

The source for [docs.agentmail.to](https://docs.agentmail.to) — API documentation for AgentMail, the email API for AI agents.

Built with [Fern](https://buildwithfern.com).

## Structure

```
fern/
├── definition/      # API definition (Fern format)
├── pages/           # Documentation pages (MDX)
├── changelog/       # Changelog entries
├── generators.yml   # SDK generation config (Python, TypeScript, Go)
├── docs.yml         # Documentation site config
└── fern.config.json # Fern project config
```

## SDK Generation

This repo also configures SDK generation via Fern:

| SDK | Package | Repo |
|---|---|---|
| Python | [`agentmail`](https://pypi.org/project/agentmail) | [agentmail-python](https://github.com/agentmail-to/agentmail-python) |
| TypeScript | [`agentmail`](https://www.npmjs.com/package/agentmail) | [agentmail-node](https://github.com/agentmail-to/agentmail-node) |
| Go | [`agentmail-go`](https://pkg.go.dev/github.com/agentmail-to/agentmail-go) | [agentmail-go](https://github.com/agentmail-to/agentmail-go) |

## Links

- [AgentMail](https://agentmail.to) — The email API for AI agents
- [API Documentation](https://docs.agentmail.to)
- [Console](https://console.agentmail.to)
- [GitHub](https://github.com/agentmail-to)
