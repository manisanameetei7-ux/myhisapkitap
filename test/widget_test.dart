import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hisapkitap/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<void> pumpAppFrame(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 100));
}

void main() {
  testWidgets('hisapkitap starts with auth and signs up into dashboard', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const HisapKitapApp());
    await pumpAppFrame(tester);

    expect(find.text('hisapkitap'), findsWidgets);
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.byIcon(Icons.lock_person_outlined), findsOneWidget);

    await tester.tap(find.widgetWithText(TextButton, 'Sign up'));
    await pumpAppFrame(tester);

    await tester.enterText(find.byType(TextField).at(0), 'Asha Store');
    await tester.enterText(find.byType(TextField).at(1), 'asha@example.com');
    await tester.enterText(find.byType(TextField).at(2), '9999999999');
    await tester.enterText(find.byType(TextField).at(3), 'secret1');
    await tester.enterText(find.byType(TextField).at(4), 'secret1');
    await tester.tap(find.widgetWithText(FilledButton, 'Sign up'));
    await pumpAppFrame(tester);

    expect(find.text('Smart shop ledger'), findsOneWidget);
    expect(find.byIcon(Icons.payments_outlined), findsOneWidget);
    expect(find.byIcon(Icons.inventory_2_outlined), findsWidgets);
    expect(find.byIcon(Icons.language), findsOneWidget);

    await tester.tap(find.text('Entries').last);
    await pumpAppFrame(tester);

    expect(find.text('Quick entry'), findsOneWidget);
    expect(find.text('Choose customer'), findsOneWidget);
    expect(find.text('Customer optional'), findsOneWidget);
    expect(find.text('Item-wise bill'), findsOneWidget);
    expect(find.text('Total bill'), findsOneWidget);
  });
}
