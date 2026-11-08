import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Entries are Markdown (.md) or MDX (.mdx). A post may be a single file
// (`my-post.md`) or a folder (`my-post/index.mdx`) holding its own images and
// video. Either shape produces the URL id `my-post`.
const articlePattern = "**/*.{md,mdx}";

const articleSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Optional lead image, relative to the entry file. Also used as the
    // social preview image.
    cover: z
      .object({
        src: image(),
        alt: z.string(),
      })
      .optional(),
  });

const blog = defineCollection({
  loader: glob({ pattern: articlePattern, base: "./src/content/blog" }),
  schema: articleSchema,
});

const research = defineCollection({
  loader: glob({ pattern: articlePattern, base: "./src/content/research" }),
  schema: articleSchema,
});

export const collections = { blog, research };
