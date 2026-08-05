import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'

// The dev server's static middleware (sirv) auto-detects the ".gz" extension and serves
// these files with Content-Encoding: gzip, so the browser transparently decompresses them
// before kuromoji's own zlib.js gets to — it then fails trying to gunzip already-raw bytes.
// Serve the raw compressed bytes with no Content-Encoding so kuromoji can decompress them itself.
function kuromojiDictRaw(): Plugin {
  return {
    name: 'kuromoji-dict-raw',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/kuromoji-dict/')) return next()
        const filePath = path.join(process.cwd(), 'public', req.url.split('?')[0])
        fs.readFile(filePath, (err, data) => {
          if (err) return next()
          res.setHeader('Content-Type', 'application/octet-stream')
          res.end(data)
        })
      })
    },
  }
}

export default defineConfig({
  base: './',
  build: {
    commonjsOptions: {
      // zlibjs (a kuromoji dependency) is a minified Closure-Compiler UMD bundle that
      // self-registers onto the wrong root object under Rollup's default CJS interop,
      // leaving Zlib.Gunzip undefined at runtime — this makes Rollup handle it correctly.
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      // kuromoji's dictionary loader calls Node's path.join internally;
      // Vite externalizes "path" to a no-op stub in the browser, so it needs a real polyfill.
      path: 'path-browserify',
    },
  },
  plugins: [
    react(),
    kuromojiDictRaw(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: '日本語先生 — Nihongo Sensei',
        short_name: 'Nihongo',
        description: 'Japanese learning app with SRS, kana drills, and AI conversation',
        theme_color: '#c94b4b',
        background_color: '#faf9f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
