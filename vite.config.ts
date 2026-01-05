import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // NO uses 'process.env': process.env -> Esto causa el error de seguridad.
    // Vite ya maneja las variables VITE_ automáticamente.
    'process.env': {} 
  },
  build: {
    rollupOptions: {
      // Aseguramos que no intente procesar cosas innecesarias
    }
  }
});
