# Architecture

## Why this shape

The original site had a strong, restrained visual system, clear SIGMA product
story, good responsive behavior, reduced-motion support, and a small amount of
progressive enhancement. Those qualities remain intact.

The static implementation was fragile at its seams: full navigation, footer,
metadata, and scene markup were duplicated between pages; asset URLs depended
on route depth; the sitemap and copyright year were manual; and no install,
typecheck, or production-build gate existed. The migration addresses those
issues without turning the site into an application.

## Repository map

```text
public/                 Files served unchanged, including CNAME and media
src/components/layout/ Shared site chrome and ambient background
src/components/project/Project-level presentation
src/components/ui/     Small, named interface concepts
src/content/            Markdown blog and research entries
src/data/               Canonical site, navigation, and project metadata
src/layouts/            Shared document and article shells
src/pages/              Explicit static routes
src/scripts/            Optional browser behavior
src/styles/             Tokens/global rules, components, and page layout
```

`src/data/projects.ts` is the canonical source for reusable project metadata.
Detailed project narratives remain in their page because they are unique page
content, not shared records.

## Static and interactive boundary

Astro renders the entire site to HTML. The browser script owns only mobile
navigation, ambient pointer/scroll effects, reveal transitions, and in-view
video playback. All behavior is progressive enhancement and respects reduced
motion.

Do not add React preemptively. A future stateful product demo may use an Astro
island and a client framework, but static content and navigation must remain
Astro. No backend, database, authentication, or client router belongs here
without a concrete product requirement.

## Content flow

Blog and research entries are Markdown files in their respective directories.
Frontmatter is validated by `src/content.config.ts`:

```yaml
title: Required title
description: Required summary
date: 2026-09-25
updated: 2026-09-26 # optional
tags: [interfaces, autonomy]
draft: false
```

Entries generate `/blog/<id>/` or `/research/<id>/`. Production builds omit
drafts. No placeholder articles are checked in.

## Deployment

Astro builds a static `dist/` directory. GitHub Actions installs from the lock
file, runs `astro check`, builds, uploads the Pages artifact, and deploys it.
`public/CNAME` preserves the `asynthetic.io` custom domain; the configured
`site` URL keeps canonical and asset URLs correct.
