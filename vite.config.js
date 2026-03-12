import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { groqApiPlugin } from './server/groqProxy.mjs'

function manualChunks(id) {
  if (!id.includes('node_modules')) {
    return undefined
  }

  if (id.includes('recharts') || id.includes('d3-')) {
    return 'charts'
  }

  if (id.includes('framer-motion') || id.includes('motion-dom')) {
    return 'motion'
  }

  if (id.includes('react-router')) {
    return 'router'
  }

  if (id.includes('@phosphor-icons')) {
    return 'icons'
  }

  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), groqApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
