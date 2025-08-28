import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default ({ mode } : any) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return defineConfig({
    plugins: [react()],
    envPrefix: ['VITE_', 'REACT_APP_'],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '#': path.resolve(__dirname, './public'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_TARGET_URL || 'http://localhost:3000', // Next dev 서버 주소
          changeOrigin: true,
          secure: false,
        },
      },
    },
  });
};
