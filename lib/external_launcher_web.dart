import 'package:web/web.dart' as web;

Future<bool> openExternalUrl(String url) async {
  web.window.open(url, '_blank');
  return true;
}
