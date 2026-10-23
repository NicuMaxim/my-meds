import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { eq } from 'drizzle-orm';
import { openSqlite, sqliteQuery } from '../platform/node-sqlite.ts';
import { doses, preferences } from '../db/schema.ts';
import { migrate } from '../scripts/migrate-sqlite.mjs';

test('SQLite migrations and shared Drizzle queries preserve diary data across restarts', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'my-meds-sqlite-'));
  const filename = join(directory, 'diary.sqlite');
  let connection;
  try {
    migrate(filename);
    connection = openSqlite(filename);
    let db = drizzle(sqliteQuery(connection));
    const settings = JSON.stringify({ night: 'sedoxil', showPackageImages: false, courses: {} });
    await db.insert(preferences).values({ userId: 'test-diary', data: settings });
    await db.insert(doses).values({ userId: 'test-diary', date: '2026-10-23', slot: 'sedoxil-night', taken: 1, dose: '0.5' });
    // The real API uses this same upsert when the user changes or undoes a dose.
    await db.insert(doses).values({ userId: 'test-diary', date: '2026-10-23', slot: 'sedoxil-night', taken: 1, dose: '1' })
      .onConflictDoUpdate({ target: [doses.userId, doses.date, doses.slot], set: { dose: '1' } });
    connection.close();
    connection = undefined;
    migrate(filename); // Applying the same migrations again must leave records intact.
    connection = openSqlite(filename);
    db = drizzle(sqliteQuery(connection));
    assert.equal((await db.select().from(preferences))[0].data, settings);
    assert.deepEqual(await db.select().from(doses), [{ userId: 'test-diary', date: '2026-10-23', slot: 'sedoxil-night', taken: 1, dose: '1' }]);
    await db.update(doses).set({ taken: 0, dose: null }).where(eq(doses.userId, 'test-diary'));
    assert.equal((await db.select().from(doses))[0].taken, 0);
    assert.equal(connection.prepare('SELECT count(*) AS count FROM __my_meds_migrations').get().count, 2);
  } finally {
    connection?.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
