# Agent guide

This repository is Asynthetic's static public website. Keep its architecture
explicit, content-first, and easy to inspect.

## Find the right owner

- Map unfamiliar code with `sb digest`, then use `sb map`, `sb show`, or
  `sb context` before opening large files.
- Page composition and unique copy: `src/pages/`
- Shared document chrome: `src/layouts/` and `src/components/layout/`
- Reusable project metadata: `src/data/projects.ts`
- Blog and research Markdown: `src/content/`
- Design tokens and global behavior: `src/styles/global.css`
- Reusable visual patterns: `src/styles/components.css`
- Page-specific layout: `src/styles/pages.css`
- Progressive enhancement only: `src/scripts/site.ts`

## Invariants

- Prefer Astro components for static UI and normal routes for navigation.
- Add a client framework only for an isolated component with real browser state.
- Do not add a backend, database, authentication, CMS, or SPA router here.
- Preserve the design system before inventing new patterns.
- Use root-relative public asset paths and keep `public/CNAME` intact.
- Prefer explicit files and browser capabilities over utilities and dependencies.
- Components should represent recognizable interface concepts, not generic
  wrappers.
- Keep project facts canonical in `src/data/`; do not duplicate shared metadata.

## Before finishing

Run `npm run check` and `npm run build`. Confirm both live routes, assets,
canonical metadata, sitemap output, and GitHub Pages assumptions remain valid.
