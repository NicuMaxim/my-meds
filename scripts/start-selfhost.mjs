import { resolve } from 'node:path';
import { startProdServer } from 'vinext/server/prod-server';
import { migrate } from './migrate-sqlite.mjs';

for (const name of ['DIARY_LOGIN', 'DIARY_PASSWORD', 'DIARY_ACTION_SECRET']) {
  if (!process.env[name]) throw new Error(`Set ${name} in .env or the process environment.`);
}
migrate();
const { server } = await startProdServer({
  port: Number(process.env.PORT || 3000),
  host: process.env.APP_HOST || '127.0.0.1',
  outDir: resolve('dist'),
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
});
