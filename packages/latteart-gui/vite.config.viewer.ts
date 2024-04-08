import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'build-test-management-viewer-template',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => {
          return html.replace(
            `\
    <div id="app"></div>
    <script type="module" src="/src/entries/default/main.ts"></script>`,
            `\
    <script src="./data/project.js"></script>
    <script src="./data/progress.js"></script>
    <script src="./data/latteart.config.js"></script>
    <div id="app"></div>
    <script type="module" src="/src/entries/testManagementViewer/main.ts"></script>`
          )
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist/package/latteart/latteart-repository/snapshot-viewer'
  }
})
