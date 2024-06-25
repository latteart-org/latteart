import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { transformAssetUrls } from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    {
      name: "build-history-viewer-template",
      transformIndexHtml: {
        order: "pre",
        handler: (html) => {
          return html.replace(
            `\
    <script type="module" src="/src/entries/default/main.ts"></script>`,
            `\
    <script type="module" src="/src/entries/historyViewer/main.ts"></script>`
          );
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    outDir: "dist/package/latteart/latteart-repository/history-viewer"
  }
});
