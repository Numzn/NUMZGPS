import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupTraccarUserIdBySessionToken } from './userService.js';

test('numeric-looking session tokens are still looked up as Traccar session ids', async () => {
  const calls = [];
  const pool = {
    execute: async (sql, params) => {
      calls.push({ sql, params });
      return [[]];
    },
  };

  const userId = await lookupTraccarUserIdBySessionToken('1', pool);

  assert.equal(userId, null);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /tc_user_sessions/);
  assert.deepEqual(calls[0].params, ['1']);
});

test('session lookup returns the Traccar user id from the session table', async () => {
  const pool = {
    execute: async () => [[{ userid: 42 }]],
  };

  const userId = await lookupTraccarUserIdBySessionToken('real-session-id', pool);

  assert.equal(userId, 42);
});
