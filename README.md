# AgentMail Documentation

Official documentation for [AgentMail](https://agentmail.to) - Email infrastructure for AI agents.

## 📚 Documentation Site

Visit [docs.agentmail.to](https://docs.agentmail.to) to view the live documentation.

## 🛠️ Development

This documentation is built using [Fern](https://buildwithfern.com/).

### Generating Sitemap

The sitemap is automatically generated from the `fern/docs.yml` file. You can generate it manually using:

```bash
npm install
npm run generate-sitemap
```

### Automated Sitemap Updates

The sitemap is automatically regenerated via GitHub Actions whenever:
- Changes are pushed to `fern/docs.yml`
- New pages are added in `fern/pages/`
- Manually triggered via workflow dispatch

See `.github/workflows/generate-sitemap.yml` for details.

## 📝 Adding New Pages

1. Create your `.mdx` file in the appropriate `fern/pages/` subdirectory
2. Add the page to the navigation in `fern/docs.yml`
3. Push your changes
4. The sitemap will automatically update via GitHub Actions

## 🔗 Links

- [AgentMail Website](https://agentmail.to)
- [Discord Community](https://discord.gg/hTYatWYWBc)
- [Contact](mailto:contact@agentmail.cc)

## 📄 License

Copyright © 2024 AgentMail
