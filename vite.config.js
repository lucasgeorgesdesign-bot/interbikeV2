import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Mock API plugin for upload endpoint
    {
      name: 'mock-upload-api',
      configureServer(server) {
        server.middlewares.use('/api/upload', (req, res, next) => {
          if (req.method === 'POST') {
            // Simulate upload delay
            setTimeout(() => {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ url: '/assets/sample-uploaded.png' }))
            }, 300)
          } else {
            next()
          }
        })
      },
    },
  ],
})
