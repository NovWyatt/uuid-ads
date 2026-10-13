import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // write-excel-file zips through fflate's Worker-based async API; use the sync zip instead.
    alias: [{ find: /^\.\.\/zip\/zipToArrayBuffer\.js$/, replacement: resolve(__dirname, 'src/zip-sync.ts') }],
  },
  optimizeDeps: {
    include: ['browser-scraping-utils'],
  },
  build: {
    lib: {
      formats: ['es'],
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'fb-group-scraper',
      fileName: 'main',
    },
    commonjsOptions: {
      include: [/browser-scraping-utils/, /node_modules/],
    }
  }
})