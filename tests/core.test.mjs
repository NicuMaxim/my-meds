import test from 'node:test';
import assert from 'node:assert/strict';
import { issueTicket, verifyTicket } from '../app/write-ticket.ts';
import { validDate, shift, active } from '../app/model.ts';
import { sessionCookieOptions } from '../app/session-cookie.ts';

test('write tickets reject tampering, a different secret and expired signatures', async () => {
  const ticket = await issueTicket('test-signing-secret');
  assert.equal(await verifyTicket('test-signing-secret', ticket), true);
  assert.equal(await verifyTicket('another-secret', ticket), false);
  const [expiry, signature] = ticket.split('.');
  assert.equal(await verifyTicket('test-signing-secret', `${Number(expiry) + 1}.${signature}`), false);
  assert.equal(await verifyTicket('test-signing-secret', `1.${signature}`), false);
  assert.equal(await verifyTicket('test-signing-secret', 'invalid'), false);
});

test('calendar validation handles leap days and course boundaries', () => {
  assert.equal(validDate('2028-02-29'), true);
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2026-02-31'), false);
  assert.equal(shift('2028-02-28', 2), '2028-03-01');
  const settings = { courses: { example: { start: '2026-12-30', days: 3 } } };
  assert.equal(active(settings, 'example', '2026-12-29'), false);
  assert.equal(active(settings, 'example', '2027-01-01'), true);
  assert.equal(active(settings, 'example', '2027-01-02'), false);
});

test('public hosts always receive secure cookies; only loopback permits HTTP', () => {
  assert.match(sessionCookieOptions('meds.example.com').attributes, /Secure/);
  assert.equal(sessionCookieOptions('meds.example.com').name, '__Host-diary-session');
  assert.doesNotMatch(sessionCookieOptions('localhost:5173').attributes, /Secure/);
  assert.doesNotMatch(sessionCookieOptions('127.0.0.1:5173').attributes, /Secure/);
  assert.match(sessionCookieOptions('localhost.evil.example').attributes, /Secure/);
});
