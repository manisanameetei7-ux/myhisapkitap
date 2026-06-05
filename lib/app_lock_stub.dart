Future<bool> deviceLockAvailable() async => false;

Future<bool> registerDeviceLock({
  required String userId,
  required String userName,
}) async {
  return false;
}

Future<bool> authenticateDeviceLock() async => false;
