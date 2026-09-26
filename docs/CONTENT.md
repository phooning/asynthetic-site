# Content guide

## Projects

Update shared names, summaries, status, links, technology labels, and media paths
in `src/data/projects.ts`. Keep a project's long-form, page-specific narrative
in its route under `src/pages/products/`.

## Blog and research

Create ordinary Markdown in `src/content/blog/` or `src/content/research/` and
use the frontmatter described in `docs/ARCHITECTURE.md`. Filenames become URL
IDs, so prefer stable lowercase kebab-case names.

Set `draft: true` while writing. Drafts are available during development and
excluded from production builds. Put static downloadable or social media files
under `public/assets/` and reference them with root-relative URLs.

## Voice and presentation

Use direct, technically grounded language. Distinguish shipped capabilities
from work in progress and plans. Preserve the site's restrained visual system;
new content should not require custom JavaScript or a client framework.
