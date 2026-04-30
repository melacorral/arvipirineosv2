import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://arvipirineos.es",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "DM Serif Display",
      cssVariable: "--font-heading",
      weights: [400],
      styles: ["normal", "italic"],
    },
    {
      provider: fontProviders.google(),
      name: "Source Sans 3",
      cssVariable: "--font-sans",
      weights: [300, 400, 600, 700],
      styles: ["normal", "italic"],
    },
  ],
});