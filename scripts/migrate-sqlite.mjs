import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { openSqlite } from '../platform/node-sqlite.ts';

export function migrate(filename = process.env.DATABASE_PATH || './data/my-meds.sqlite') {
  const db = openSqlite(filename);
  try {
    db.exec('CREATE TABLE IF NOT EXISTS __my_meds_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL)');
    const directory = fileURLToPath(new URL('../drizzle/', import.meta.url));
    for (const name of readdirSync(directory).filter(name => name.endsWith('.sql')).sort()) {
      const sql = readFileSync(resolve(directory, name), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      db.exec('BEGIN IMMEDIATE');
      try {
        const existing = db.prepare('SELECT checksum FROM __my_meds_migrations WHERE name = ?').get(name);
        if (existing && existing.checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
        if (!existing) {
          db.exec(sql);
          db.prepare('INSERT INTO __my_meds_migrations (name, checksum) VALUES (?, ?)').run(name, checksum);
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    }
  } finally {
    db.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrate();
  console.log('SQLite migrations applied.');
}
