import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // REACT_APP_ 접두사도 클라이언트에 노출되도록 허용
  envPrefix: ["VITE_", "REACT_APP_"],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
