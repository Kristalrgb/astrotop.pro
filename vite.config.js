import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600, // Увеличиваем лимит предупреждения до 600 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделяем большие библиотеки на отдельные чанки
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['react-icons'],
          'utils': ['axios', 'date-fns']
        }
      }
    }
  }
})
