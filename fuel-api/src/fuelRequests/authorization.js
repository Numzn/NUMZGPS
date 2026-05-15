export function canFulfillFuelRequest(user, request) {
  if (!user || !request) {
    return false;
  }

  if (user.administrator || user.isManager) {
    return true;
  }

  if (user.id == null || request.userId == null) {
    return false;
  }

  return String(user.id) === String(request.userId);
}
