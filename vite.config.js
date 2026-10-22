import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { brandColors } from './scripts/palette.js'
import { APP_DESCRIPTION, APP_NAME } from './src/constants/app.js'

// GitHub Pages serves the app from /<repo-name>/, so assets must be loaded from there.
const BASE = '/RepVault/'

const { background } = brandColors()

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    // Makes the app installable ("Add to Home Screen") and work offline.
    VitePWA({
      // A new version activates right away and the page reloads into it (see `main.jsx`),
      // so nobody gets stuck on a stale cache. Saved data (and a workout in progress) survives it.
      registerType: 'autoUpdate',
      // Registered in `main.jsx` with `virtual:pwa-register`.
      injectRegister: false,
      // The workbox glob below already precaches the icons.
      includeManifestIcons: false,
      manifest: {
        id: BASE,
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_DESCRIPTION,
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        theme_color: background,
        background_color: background,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Everything the app needs offline, icons included.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // Lets every module write `@use 'styles/mixins' as *;` instead of `../../styles/…`.
        loadPaths: [fileURLToPath(new URL('./src', import.meta.url))],
      },
    },
  },
})
