import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from /<repo-name>/, so assets must be loaded from there.
  base: '/RepVault/',
  plugins: [react()],
})
