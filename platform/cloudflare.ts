import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export function getRuntimeSecrets() {
  return env as unknown as {
    DIARY_LOGIN?: string;
    DIARY_PASSWORD?: string;
    DIARY_ACTION_SECRET?: string;
  };
}

export function getDatabase() {
  if (!env.DB) throw new Error('Configure the Cloudflare D1 database binding named DB.');
  return drizzle(env.DB, { schema });
}
