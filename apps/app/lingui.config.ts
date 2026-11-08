import { defineConfig } from "@lingui/conf";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "ru"],
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}/messages",
      include: ["<rootDir>/src"],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"],
    },
  ],
  format: "po",
});
