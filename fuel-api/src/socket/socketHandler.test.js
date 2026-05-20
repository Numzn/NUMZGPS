import test from 'node:test';
import assert from 'node:assert/strict';
import { canJoinSocketRoom } from './socketHandler.js';

test('canJoinSocketRoom only allows managers into managers room', () => {
  assert.equal(canJoinSocketRoom({ userId: 7 }, 'managers'), false);
  assert.equal(canJoinSocketRoom({ userId: 7, isManager: true }, 'managers'), true);
  assert.equal(canJoinSocketRoom({ userId: 7, administrator: true }, 'managers'), true);
});

test('canJoinSocketRoom only allows a driver into their own driver room', () => {
  assert.equal(canJoinSocketRoom({ userId: 7 }, 'driver-7'), true);
  assert.equal(canJoinSocketRoom({ userId: 7 }, 'driver-8'), false);
  assert.equal(canJoinSocketRoom({ userId: null }, 'driver-7'), false);
});

test('canJoinSocketRoom rejects arbitrary or invalid rooms', () => {
  assert.equal(canJoinSocketRoom({ userId: 7 }, 'fuel-requests'), false);
  assert.equal(canJoinSocketRoom({ userId: 7 }, ''), false);
  assert.equal(canJoinSocketRoom({ userId: 7 }, null), false);
});
