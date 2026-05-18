import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { canJoinRoom } from './socketHandler.js';

describe('canJoinRoom', () => {
  it('denies unauthenticated sockets access to privileged rooms', () => {
    assert.equal(canJoinRoom({}, 'managers'), false);
    assert.equal(canJoinRoom({ userId: null }, 'driver-12'), false);
  });

  it('allows managers and administrators into the managers room', () => {
    assert.equal(canJoinRoom({ userId: 1, administrator: true }, 'managers'), true);
    assert.equal(canJoinRoom({ userId: 2, isManager: true }, 'managers'), true);
  });

  it('only allows users into their own driver room', () => {
    assert.equal(canJoinRoom({ userId: 12 }, 'driver-12'), true);
    assert.equal(canJoinRoom({ userId: 12 }, 'driver-13'), false);
  });

  it('denies arbitrary room names', () => {
    assert.equal(canJoinRoom({ userId: 12, administrator: true }, 'driver-12-extra'), false);
    assert.equal(canJoinRoom({ userId: 12, administrator: true }, 'public'), false);
  });
});
