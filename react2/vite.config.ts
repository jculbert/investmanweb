import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['linux1'],
    proxy: {
      // Proxy dev requests from the front-end to the backend service to avoid CORS.
      // Rewrites paths like /investmanbackend/api/v1/... -> http://localhost:3001/api/...
//      '^/investmanbackend/api/v1': {
//        target: 'http://linux1/investmanbackend',
//        changeOrigin: true,
//        rewrite: (path) => path.replace(/^\/investmanbackend\/api\/v1/, '/api'),
//      },
      '/api': {
        target: 'http://localhost/investmanbackend',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/backend': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/backend\//, '/'),
      },
    },
  },
})
