import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/group_user_map/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
});
