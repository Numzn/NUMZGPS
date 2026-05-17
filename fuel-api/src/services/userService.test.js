import test from 'node:test';
import assert from 'node:assert/strict';
import { getTraccarUserIdBySessionToken } from './userService.js';

test('numeric JSESSIONID values are validated through Traccar sessions', async () => {
  const calls = [];
  const pool = {
    async execute(sql, params) {
      calls.push({ sql, params });
      return [[{ userid: 42 }]];
    },
  };

  const userId = await getTraccarUserIdBySessionToken(pool, '1');

  assert.equal(userId, 42);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /tc_user_sessions/);
  assert.deepEqual(calls[0].params, ['1']);
});

test('unknown JSESSIONID values do not resolve a user id', async () => {
  const pool = {
    async execute() {
      return [[]];
    },
  };

  const userId = await getTraccarUserIdBySessionToken(pool, 'missing-session');

  assert.equal(userId, null);
});
