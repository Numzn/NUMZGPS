import test from 'node:test';
import assert from 'node:assert/strict';
import { canJoinRoom } from './socketHandler.js';

test('manager room requires manager or administrator privileges', () => {
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, 'managers'), true);
  assert.equal(canJoinRoom({ userId: 7, administrator: true }, 'managers'), true);
  assert.equal(canJoinRoom({ userId: 7 }, 'managers'), false);
  assert.equal(canJoinRoom(null, 'managers'), false);
});

test('driver rooms are limited to the authenticated user id', () => {
  assert.equal(canJoinRoom({ userId: 7 }, 'driver-7'), true);
  assert.equal(canJoinRoom({ userId: '7' }, 'driver-7'), true);
  assert.equal(canJoinRoom({ userId: 7 }, 'driver-8'), false);
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, 'driver-8'), false);
});

test('arbitrary socket rooms are denied', () => {
  assert.equal(canJoinRoom({ userId: 7, isManager: true }, 'fuel-requests'), false);
  assert.equal(canJoinRoom({ userId: 7 }, ''), false);
  assert.equal(canJoinRoom({ userId: 7 }, null), false);
});
