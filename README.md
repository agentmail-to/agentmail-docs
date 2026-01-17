# AgentMail Documentation



## 📚 Documentation Site

Visit [docs.agentmail.to](https://docs.agentmail.to) to view the live documentation. 
Official documentation for [AgentMail](https://agentmail.to)

## 🛠️ Development

This documentation is built using [Fern](https://buildwithfern.com/).

### Local Development Setup

#### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

#### Installation

1. Clone the repository:
```bash
git clone https://github.com/agentmail-to/agentmail-docs.git
cd agentmail-docs
```

2. Install dependencies:
```bash
npm install
```

3. Install Fern CLI globally:
```bash
npm install -g fern-api
```

#### Running Locally

To preview the documentation locally with hot-reload:

```bash
fern docs dev
```

This will start a local development server (usually at `http://localhost:3000`) where you can see your changes in real-time.

#### Building Documentation

To build the documentation:

```bash
fern generate --docs
```

#### Common Commands

| Command | Description |
|---------|-------------|
| `fern docs dev` | Start local development server with hot-reload |
| `fern generate --docs` | Build the documentation |
| `fern check` | Validate your API definition and docs configuration |
| `npm run generate-sitemap` | Generate sitemap.xml from docs.yml |

#### Project Structure

```
agentmail-docs/
├── fern/
│   ├── docs.yml              # Main documentation configuration
│   ├── pages/                # Documentation pages (MDX files)
│   │   ├── get-started/
│   │   ├── core-concepts/
│   │   ├── guides/
│   │   └── ...
│   ├── definition/           # API definitions
│   └── assets/              # Images and static files
├── generate-sitemap.js       # Dynamic sitemap generator
├── robots.txt               # SEO configuration
└── sitemap.xml              # Auto-generated sitemap
```

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
