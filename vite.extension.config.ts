import { resolve } from 'path'
import { defineConfig } from 'vite'

// Content scripts cannot be ES modules, so the extension gets a single IIFE bundle.
// `extension/` (manifest + icons) is copied as-is next to it.
export default defineConfig({
  resolve: {
    // write-excel-file zips through fflate's Worker-based async API; use the sync zip instead.
    alias: [{ find: /^\.\.\/zip\/zipToArrayBuffer\.js$/, replacement: resolve(__dirname, 'src/zip-sync.ts') }],
  },
  publicDir: 'extension',
  build: {
    outDir: 'dist/extension',
    emptyOutDir: true,
    lib: {
      formats: ['iife'],
      entry: resolve(__dirname, 'src/extension.ts'),
      name: 'fbGroupScraper',
      fileName: () => 'content.js',
    },
    commonjsOptions: {
      include: [/browser-scraping-utils/, /node_modules/],
    },
  },
})
