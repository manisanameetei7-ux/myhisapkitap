import 'dart:js_interop';
import 'dart:typed_data';

import 'package:web/web.dart' as web;

Future<bool> deviceLockAvailable() async {
  try {
    final available =
        await web
                .PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
            .toDart;
    return available.toDart;
  } catch (_) {
    return false;
  }
}

Future<bool> registerDeviceLock({
  required String userId,
  required String userName,
}) async {
  try {
    if (!await deviceLockAvailable()) return false;
    final credential = await web.window.navigator.credentials
        .create(
          web.CredentialCreationOptions(
            publicKey: web.PublicKeyCredentialCreationOptions(
              rp: web.PublicKeyCredentialRpEntity(name: 'Hisap Kitap'),
              user: web.PublicKeyCredentialUserEntity(
                name: userId,
                id: _bytes(userId),
                displayName: userName,
              ),
              challenge: _challenge(),
              pubKeyCredParams: [
                web.PublicKeyCredentialParameters(type: 'public-key', alg: -7),
                web.PublicKeyCredentialParameters(
                  type: 'public-key',
                  alg: -257,
                ),
              ].toJS,
              authenticatorSelection: web.AuthenticatorSelectionCriteria(
                authenticatorAttachment: 'platform',
                userVerification: 'required',
              ),
              timeout: 60000,
              attestation: 'none',
            ),
          ),
        )
        .toDart;
    return credential != null;
  } catch (_) {
    return false;
  }
}

Future<bool> authenticateDeviceLock() async {
  try {
    if (!await deviceLockAvailable()) return false;
    final credential = await web.window.navigator.credentials
        .get(
          web.CredentialRequestOptions(
            publicKey: web.PublicKeyCredentialRequestOptions(
              challenge: _challenge(),
              timeout: 60000,
              userVerification: 'required',
            ),
          ),
        )
        .toDart;
    return credential != null;
  } catch (_) {
    return false;
  }
}

web.BufferSource _challenge() {
  final micros = DateTime.now().microsecondsSinceEpoch;
  return _bytes('hisap-kitab-$micros');
}

web.BufferSource _bytes(String value) {
  return Uint8List.fromList(value.codeUnits).toJS;
}
