/// <reference types="vitest/config" />

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages では https://<org>.github.io/terminarai/ に配信されるため
  // build 時のみ /terminarai/ をサブパスとして埋め込む。dev は従来通り /
  base: command === 'build' ? '/terminarai/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
}))
