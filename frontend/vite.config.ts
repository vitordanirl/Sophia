import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Bibliotecas em chunks próprios: mudam pouco e ficam em cache entre deploys
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client', 'react-router'],
          ui: ['radix-ui', 'cmdk', 'lucide-react', 'sonner'],
          data: ['@tanstack/react-query', 'axios', 'react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
})
