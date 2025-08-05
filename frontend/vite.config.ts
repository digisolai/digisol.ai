// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Make sure this is imported if you're using React

export default defineConfig({
  plugins: [react()], // Ensure this line is present if using @vitejs/plugin-react
  base: '/', // Base public path when served in production
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',   // Crucial: Forces Vite to listen on all network interfaces (IPv4 and IPv6)
    port: 5173,        // Explicitly set the port to 5173
    strictPort: true,  // Optional: Fail if port 5173 is already in use
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
