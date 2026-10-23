import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function openSqlite(filename: string) {
  const path = filename === ':memory:' ? filename : resolve(filename);
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(path);
  database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  return database;
}

// Drizzle's asynchronous SQLite proxy keeps the API identical to the D1 adapter.
export function sqliteQuery(database: DatabaseSync) {
  return async (sql: string, params: unknown[], method: 'run' | 'all' | 'get' | 'values') => {
    const statement = database.prepare(sql);
    const values = params as SQLInputValue[];
    if (method === 'run') {
      statement.run(...values);
      return { rows: [] };
    }
    statement.setReturnArrays(true);
    if (method === 'get') return { rows: statement.get(...values) as unknown as unknown[] };
    return { rows: statement.all(...values) as unknown as unknown[][] };
  };
}
