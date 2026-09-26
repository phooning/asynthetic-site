import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://asynthetic.io",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
});
