import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
    env: loadEnv('test', process.cwd(), ''),
  },
})
