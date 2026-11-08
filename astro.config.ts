import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

const site = "https://asynthetic.io";

// A section index with no entries is built `noindex`, so keep it out of the
// sitemap too. This only looks for entry files; a section that holds nothing
// but drafts is not detected.
const hasEntries = (section: string) => {
  const dir = fileURLToPath(new URL(`./src/content/${section}/`, import.meta.url));
  return (
    existsSync(dir) &&
    readdirSync(dir, { recursive: true }).some((file) => /\.mdx?$/.test(String(file)))
  );
};
const emptySectionIndexes = ["blog", "research"]
  .filter((section) => !hasEntries(section))
  .map((section) => `${site}/${section}/`);

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !emptySectionIndexes.includes(page) }),
  ],
});
