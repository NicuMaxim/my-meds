import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from '../db/schema';
import { openSqlite, sqliteQuery } from './node-sqlite.ts';

export function getRuntimeSecrets() {
  return {
    DIARY_LOGIN: process.env.DIARY_LOGIN,
    DIARY_PASSWORD: process.env.DIARY_PASSWORD,
    DIARY_ACTION_SECRET: process.env.DIARY_ACTION_SECRET,
  };
}

function createDatabase() {
  return drizzle(sqliteQuery(openSqlite(process.env.DATABASE_PATH || './data/my-meds.sqlite')), { schema });
}
let database: ReturnType<typeof createDatabase> | undefined;
export function getDatabase() {
  return database ??= createDatabase();
}
