import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Matches MSW handlers and api client default in Storybook. */
const STORYBOOK_VITE_API_ORIGIN =
  process.env.VITE_BASE_URL ?? "http://127.0.0.1:8000";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook/react-vite",

  viteFinal: async (viteCfg) => {
    const envDir = path.resolve(__dirname, "..");
    const parentDefine =
      viteCfg.define && typeof viteCfg.define === "object" && viteCfg.define !== null
        ? viteCfg.define
        : {};

    return mergeConfig(viteCfg, {
      base: "/",
      envDir,
      envPrefix: "VITE_",
      plugins: [nodePolyfills()],
      define: {
        ...parentDefine,
        "import.meta.env.VITE_BASE_URL": JSON.stringify(STORYBOOK_VITE_API_ORIGIN),
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
        },
      },
      optimizeDeps: {
        exclude: [],
      },
    });
  },
};

export default config;
