import test from 'node:test';
import assert from 'node:assert/strict';
import { canJoinRoom } from './roomAuthorization.js';

test('canJoinRoom allows administrators to join the managers room', () => {
  assert.equal(canJoinRoom({ userId: 1, administrator: true }, 'managers'), true);
});

test('canJoinRoom denies non-administrators from the managers room', () => {
  assert.equal(canJoinRoom({ userId: 1, administrator: false }, 'managers'), false);
  assert.equal(canJoinRoom({ userId: 1 }, 'managers'), false);
});

test('canJoinRoom allows a user to join only their own driver room', () => {
  assert.equal(canJoinRoom({ userId: 42, administrator: false }, 'driver-42'), true);
  assert.equal(canJoinRoom({ userId: 42, administrator: false }, 'driver-7'), false);
});

test('canJoinRoom denies unauthenticated or unknown room joins', () => {
  assert.equal(canJoinRoom({ administrator: false }, 'driver-42'), false);
  assert.equal(canJoinRoom(null, 'driver-42'), false);
  assert.equal(canJoinRoom({ userId: 42, administrator: true }, 'all'), false);
  assert.equal(canJoinRoom({ userId: 42, administrator: true }, ''), false);
});
