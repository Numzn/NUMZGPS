import test from 'node:test';
import assert from 'node:assert/strict';
import { canJoinRoom } from './socketHandler.js';

test('canJoinRoom allows administrators and managers into manager room', () => {
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, 'managers'), true);
  assert.equal(canJoinRoom({ userId: 7, isManager: false }, 'managers'), false);
  assert.equal(canJoinRoom({ userId: null, isManager: false }, 'managers'), false);
});

test('canJoinRoom allows users only into their own driver room', () => {
  assert.equal(canJoinRoom({ userId: 7, isManager: false }, 'driver-7'), true);
  assert.equal(canJoinRoom({ userId: 7, isManager: false }, 'driver-8'), false);
  assert.equal(canJoinRoom({ userId: null, isManager: false }, 'driver-7'), false);
});

test('canJoinRoom rejects unsupported or malformed room names', () => {
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, 'admin'), false);
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, 'driver-admin'), false);
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, ''), false);
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, null), false);
});
