import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Change this to your backend server URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
