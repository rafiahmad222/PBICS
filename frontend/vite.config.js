import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : (process.env.VITE_BASE_PATH || '/personalb-react-app/'),
  server: {
    proxy: {
      '/api': {
        target: 'https://314b-112-78-133-197.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}))
