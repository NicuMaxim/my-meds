import vinext from 'vinext';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vinext()],
  resolve: { alias: { '#platform': fileURLToPath(new URL('./platform/node.ts', import.meta.url)) } },
});
