const MANAGER_ROOM = 'managers';
const DRIVER_ROOM_PREFIX = 'driver-';

export function canJoinRoom(socketData, roomName) {
  if (!socketData || typeof roomName !== 'string' || roomName.length === 0) {
    return false;
  }

  if (roomName === MANAGER_ROOM) {
    return Boolean(socketData.administrator);
  }

  if (roomName.startsWith(DRIVER_ROOM_PREFIX)) {
    if (socketData.userId == null || socketData.userId === '') {
      return false;
    }
    return roomName === `${DRIVER_ROOM_PREFIX}${socketData.userId}`;
  }

  return false;
}
