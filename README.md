# Asynthetic site

The public website for Asynthetic, an independent engineering studio focused on
human-centric interfaces and infrastructure for increasingly autonomous
systems. The site is intentionally static, content-first, and dependency-light.

## Development

Requires Node.js 22.12 or newer.

```bash
npm ci
npm run dev
```

Useful commands:

```bash
npm run check    # Astro and TypeScript validation
npm run build    # production output in dist/
npm run preview  # preview the production build
```

## Stack and deployment

- Astro and TypeScript
- Plain CSS with a small typed progressive-enhancement script
- Astro content collections for future blog and research writing
- Static output deployed to GitHub Pages at `https://asynthetic.io`

Pushes to `main` validate, build, and deploy through
`.github/workflows/deploy.yml`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
for repository boundaries and [AGENTS.md](AGENTS.md) for contribution rules.
