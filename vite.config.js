import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('axios')) return 'vendor-axios'
          if (id.includes('@dnd-kit')) return 'vendor-dnd'
          return 'vendor'
        },
      },
    },
  },
  server: {
    host: true,
  },
})
