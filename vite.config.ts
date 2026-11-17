import { defineConfig } from 'vite';

export default defineConfig({
  base: '/unwept/',
  server: {
    port: 5173,
    strictPort: true,
  },
});
