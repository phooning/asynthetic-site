# Content guide

## Projects

Update shared names, summaries, status, links, technology labels, and media paths
in `src/data/projects.ts`. Keep a project's long-form, page-specific narrative
in its route under `src/pages/products/`.

## Blog and research

Entries are Markdown (`.md`) or MDX (`.mdx`) under `src/content/blog/` or
`src/content/research/`. Frontmatter is described in `docs/ARCHITECTURE.md`.
The file or folder name becomes the URL id, so prefer stable lowercase
kebab-case names. No placeholder articles are checked in.

Set `draft: true` while writing. Drafts are listed and marked in development
and excluded from production builds. The "Blog" navigation link appears only
once the blog has a published entry.

### Text only

A single file is enough:

```text
src/content/blog/field-notes.md   ->  /blog/field-notes/
```

### Images and video

Give the post a folder and keep its media beside it. Use `.mdx` when the post
needs captions or video.

```text
src/content/blog/canvas-tour/
  index.mdx       ->  /blog/canvas-tour/
  cover.jpg
  toolbar.png
  pan.mp4
  pan-poster.jpg
```

```mdx
---
title: A tour of the canvas
description: One-sentence summary used for listings and social previews.
date: 2026-11-06
tags: [sigma, interfaces]
draft: true
cover:
  src: ./cover.jpg
  alt: Describe the image for someone who cannot see it.
---

import pan from "./pan.mp4";
import panPoster from "./pan-poster.jpg";
import toolbar from "./toolbar.png";

Ordinary Markdown works throughout.

![Plain image, optimized automatically.](./toolbar.png)

<Figure src={toolbar} alt="Required description." caption="Optional caption." credit="Optional credit" />

<Video src={pan} poster={panPoster} caption="Optional caption." />

<Video src={pan} poster={panPoster} ambient />
```

- Relative images (in Markdown syntax, `<Figure>`, or `cover`) are resized
  and converted to WebP at build time. Always write alt text.
- `<Figure>` and `<Video>` are available in every `.mdx` entry without an
  import. Import the media files they display.
- `<Video>` always shows controls. `ambient` makes a muted loop that plays
  while in view and never autoplays for reduced-motion visitors. Use a poster
  taken from the clip so the frame size is reserved before it loads.
- Imported video is copied into the build with a hashed filename, not
  re-encoded. Export web-ready H.264 MP4 (or WebM) at a sensible bitrate first.
- For large clips that should not live in `src/`, put them under
  `public/assets/blog/<post>/` and pass root-relative paths instead:
  `<Video src="/assets/blog/canvas-tour/pan.mp4" poster="/assets/blog/canvas-tour/pan.jpg" width={1280} height={720} />`.
- `cover` leads the article, illustrates its index card, and becomes its
  social preview image.

## Voice and presentation

Use direct, technically grounded language. Distinguish shipped capabilities
from work in progress and plans. Preserve the site's restrained visual system;
new content should not require custom JavaScript or a client framework.
