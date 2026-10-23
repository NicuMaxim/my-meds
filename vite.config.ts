import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '#platform': fileURLToPath(new URL('./platform/cloudflare.ts', import.meta.url)) } },
  plugins: [
    vinext(),
    cloudflare({
      configPath: './wrangler.cloudflare.jsonc',
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      inspectorPort: false,
    }),
  ],
});
