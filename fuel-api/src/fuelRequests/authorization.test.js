import test from 'node:test';
import assert from 'node:assert/strict';
import { canFulfillFuelRequest } from './authorization.js';

test('canFulfillFuelRequest allows the request owner', () => {
  assert.equal(canFulfillFuelRequest({ id: 42 }, { userId: 42 }), true);
});

test('canFulfillFuelRequest allows managers and administrators', () => {
  assert.equal(canFulfillFuelRequest({ id: 7, isManager: true }, { userId: 42 }), true);
  assert.equal(canFulfillFuelRequest({ id: 7, administrator: true }, { userId: 42 }), true);
});

test('canFulfillFuelRequest denies unrelated authenticated users', () => {
  assert.equal(canFulfillFuelRequest({ id: 7 }, { userId: 42 }), false);
});

test('canFulfillFuelRequest denies missing user or request context', () => {
  assert.equal(canFulfillFuelRequest(null, { userId: 42 }), false);
  assert.equal(canFulfillFuelRequest({ id: 42 }, null), false);
});
