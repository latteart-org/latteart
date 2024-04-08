import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'build-history-viewer-template',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => {
          return html.replace(
            `\
    <div id="app"></div>
    <script type="module" src="/src/entries/default/main.ts"></script>`,
            `\
    <script src="./testResult/log.js"></script>
    <script src="./testResult/sequence-view.js"></script>
    <script src="./testResult/graph-view.js"></script>
    <script src="../../latteart.config.js"></script>
    <div id="app"></div>
    <script type="module" src="/src/entries/historyViewer/main.ts"></script>`
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
    outDir: 'dist/package/latteart/latteart-repository/history-viewer'
  }
})
