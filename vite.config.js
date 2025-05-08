import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ec2-44-211-91-81.compute-1.amazonaws.com',
        changeOrigin: true,
        secure: false, // Disable certificate validation
      }
    }
  }
})
