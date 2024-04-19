import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { transformAssetUrls } from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls } })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    outDir: "dist/package/latteart/latteart/public"
  },
  server: {
    port: 3000
  }
});
