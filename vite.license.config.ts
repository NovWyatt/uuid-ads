import { resolve } from 'path'
import { defineConfig } from 'vite'

// The extension's license pieces, built next to content.js (so it runs after
// vite.extension.config.ts and must not empty the folder):
//   background.js - module service worker that talks to the license server
//   popup.js      - module script of popup.html (copied from extension/)
//   bridge.js     - classic content script; imports nothing, so its chunk has no import statements
export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'dist/extension',
    emptyOutDir: false,
    lib: {
      formats: ['es'],
      entry: {
        background: resolve(__dirname, 'src/license/background.ts'),
        popup: resolve(__dirname, 'src/license/popup.ts'),
        bridge: resolve(__dirname, 'src/license/bridge.ts'),
      },
      fileName: (_format, name) => `${name}.js`,
    },
  },
})
