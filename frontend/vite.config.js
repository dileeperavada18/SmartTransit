import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173
  }
})
// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), '')

//   return {
//     plugins: [
//       react(),
//       tailwindcss()
//     ],

//     server: {
//       port: 5173,
//       proxy: {
//         '/api': {
//           target: env.VITE_API_URL || 'http://127.0.0.1:5000',
//           changeOrigin: true,
//           secure: false
//         }
//       }
//     }
//   }
// })
