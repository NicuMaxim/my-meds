import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('built self-hosted server authenticates, persists settings and doses, and handles HTTPS proxy headers', { timeout: 60000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'my-meds-http-'));
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const env = { ...process.env, PORT: String(port), APP_HOST: '127.0.0.1', DATABASE_PATH: join(directory, 'test.sqlite'),
    DIARY_LOGIN: 'test-user', DIARY_PASSWORD: crypto.randomUUID(), DIARY_ACTION_SECRET: crypto.randomUUID(), VINEXT_TRUSTED_HOSTS: 'meds.example.test' };
  let processHandle;
  let logs = '';
  async function start() {
    processHandle = spawn(process.execPath, ['scripts/start-selfhost.mjs'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    for (const stream of [processHandle.stdout, processHandle.stderr]) stream.on('data', data => { logs += data.toString(); });
    for (let tries = 0; tries < 150; tries++) {
      if (processHandle.exitCode !== null) throw new Error('Server exited: ' + logs);
      try { if ((await fetch(base + '/api/tracker')).status === 401) return; } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Server did not start: ' + logs);
  }
  async function stop() {
    if (!processHandle || processHandle.exitCode !== null) return;
    const exited = once(processHandle, 'exit');
    processHandle.kill('SIGTERM');
    await exited;
  }
  const form = password => new URLSearchParams({ login: env.DIARY_LOGIN, password });
  try {
    await start();
    assert.equal((await fetch(base + '/', { redirect: 'manual' })).status, 307);
    let response = await fetch(base + '/api/login', { method: 'POST', headers: { Origin: base }, body: form('wrong'), redirect: 'manual' });
    assert.equal(response.headers.get('location'), '/login?error=1');
    response = await fetch(base + '/api/login', { method: 'POST', headers: { Origin: base }, body: form(env.DIARY_PASSWORD), redirect: 'manual' });
    assert.equal(response.status, 303);
    const cookie = response.headers.get('set-cookie').split(';')[0];
    const read = async () => {
      const result = await fetch(base + '/api/tracker', { headers: { Cookie: cookie } });
      assert.equal(result.status, 200);
      return result.json();
    };
    const initial = await read();
    const write = (body, extraHeaders = {}) => fetch(base + '/api/tracker', {
      method: 'POST', headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json', Authorization: 'Bearer ' + initial.writeTicket, ...extraHeaders }, body: JSON.stringify(body),
    });
    const mark = { type: 'mark', date: '2026-10-23', slot: 'sedoxil-night', taken: true, dose: '0.5' };
    assert.equal((await write(mark, { Origin: 'https://other.example' })).status, 403);
    assert.equal((await write(mark, { Authorization: 'Bearer invalid' })).status, 403);
    assert.equal((await write(mark)).status, 200);
    assert.equal((await write({ ...mark, taken: false })).status, 200);
    assert.equal((await read()).marks[0].taken, 0);
    assert.equal((await write({ ...mark, dose: '1' })).status, 200);
    const settings = { ...initial.settings, showPackageImages: false };
    assert.equal((await write({ type: 'settings', settings })).status, 200);
    await stop();
    await start();
    const restored = await read();
    assert.equal(restored.settings.showPackageImages, false);
    assert.equal(restored.marks[0].taken, 1);
    assert.equal(restored.marks[0].dose, '1');
    response = await fetch(base + '/api/login', {
      method: 'POST', headers: { Host: 'meds.example.test', 'X-Forwarded-Host': 'meds.example.test', 'X-Forwarded-Proto': 'https', Origin: 'https://meds.example.test' },
      body: form(env.DIARY_PASSWORD), redirect: 'manual',
    });
    assert.equal(response.status, 303);
    assert.match(response.headers.get('set-cookie'), /__Host-diary-session=.*Secure/);
    response = await fetch(base + '/api/logout', { method: 'POST', headers: { Cookie: cookie, Origin: base }, redirect: 'manual' });
    assert.equal(response.status, 303);
    assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
    assert.equal((await fetch(base + '/api/tracker')).status, 401);
  } finally {
    await stop();
    rmSync(directory, { recursive: true, force: true });
  }
});
