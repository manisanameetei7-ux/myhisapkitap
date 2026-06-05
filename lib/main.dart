import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app_lock_stub.dart' if (dart.library.html) 'app_lock_web.dart';
import 'external_launcher_stub.dart'
    if (dart.library.html) 'external_launcher_web.dart';

void main() {
  runApp(const HisapKitapApp());
}

enum EntryType { stockIn, saleOut, investment }

enum CustomerEntryType { credit, payment }

enum AuthMode { signIn, signUp, forgotPassword }

enum UserRole { owner, staff }

enum CustomerPaymentMethod { cash, card, upi }

enum ProductCategory { grocery, stationery, cosmetic }

const _ink = Color(0xFF050608);
const _inkPanel = Color(0xFF101419);
const _inkPanelAlt = Color(0xFF161C23);
const _inkBorder = Color(0xFF26313B);
const _inkText = Color(0xFFF4F8FB);
const _inkMuted = Color(0xFFA8B5C2);
const _teal = Color(0xFF17D5B3);
const _violet = Color(0xFF9B7CFF);
const _amber = Color(0xFFFFC857);
const _blue = Color(0xFF54B6FF);
const _rose = Color(0xFFFF6F91);
const _defaultUpiId = 'manisanameetei7@okicici';
const _supportPhone = '+91 8721930610';
const _complaintEmail = 'hisapakitap@gmail.com';
const _storeAddress = 'hisapkitap Store, guwahati, Assam, India';

class Product {
  Product({
    required this.id,
    required this.name,
    required this.standardQuantity,
    required this.buyPrice,
    required this.sellPrice,
    required this.stock,
    this.category = ProductCategory.grocery,
    this.imageUrl = '',
    this.barcode = '',
    this.gstRate = 0,
    this.lowStockAlert = 5,
  });

  final String id;
  String name;
  String standardQuantity;
  double buyPrice;
  double sellPrice;
  int stock;
  ProductCategory category;
  String imageUrl;
  String barcode;
  double gstRate;
  int lowStockAlert;

  Map<String, Object?> toJson() => {
    'id': id,
    'name': name,
    'standardQuantity': standardQuantity,
    'buyPrice': buyPrice,
    'sellPrice': sellPrice,
    'stock': stock,
    'category': category.name,
    'imageUrl': imageUrl,
    'barcode': barcode,
    'gstRate': gstRate,
    'lowStockAlert': lowStockAlert,
  };

  factory Product.fromJson(Map<String, Object?> json) {
    final categoryName = json['category'] as String?;
    return Product(
      id: json['id'] as String? ?? _newId(),
      name: json['name'] as String? ?? '',
      standardQuantity: json['standardQuantity'] as String? ?? '',
      buyPrice: _jsonDouble(json['buyPrice']),
      sellPrice: _jsonDouble(json['sellPrice']),
      stock: _jsonInt(json['stock']),
      category: ProductCategory.values.firstWhere(
        (category) => category.name == categoryName,
        orElse: () => ProductCategory.grocery,
      ),
      imageUrl: json['imageUrl'] as String? ?? '',
      barcode: json['barcode'] as String? ?? '',
      gstRate: _jsonDouble(json['gstRate']),
      lowStockAlert: _jsonInt(json['lowStockAlert'], fallback: 5),
    );
  }
}

class SaleLine {
  SaleLine({
    required this.productId,
    required this.productName,
    required this.standardQuantity,
    required this.quantity,
    required this.unitPrice,
    required this.buyPriceAtSale,
  });

  final String productId;
  final String productName;
  final String standardQuantity;
  final int quantity;
  final double unitPrice;
  final double buyPriceAtSale;

  double get amount => quantity * unitPrice;
  double get costAmount => quantity * buyPriceAtSale;

  Map<String, Object?> toJson() => {
    'productId': productId,
    'productName': productName,
    'standardQuantity': standardQuantity,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'buyPriceAtSale': buyPriceAtSale,
  };

  factory SaleLine.fromJson(Map<String, Object?> json) {
    return SaleLine(
      productId: json['productId'] as String? ?? '',
      productName: json['productName'] as String? ?? '',
      standardQuantity: json['standardQuantity'] as String? ?? '',
      quantity: _jsonInt(json['quantity']),
      unitPrice: _jsonDouble(json['unitPrice']),
      buyPriceAtSale: _jsonDouble(json['buyPriceAtSale']),
    );
  }
}

class LedgerEntry {
  LedgerEntry({
    required this.id,
    required this.type,
    required this.createdAt,
    this.productId,
    this.productName,
    this.customerId,
    this.customerName,
    this.customerPhone,
    this.quantity = 0,
    this.unitPrice = 0,
    this.amount = 0,
    this.paidAmount = 0,
    this.gstRate = 0,
    this.gstAmount = 0,
    this.costAmount = 0,
    this.lines = const [],
    this.note = '',
  });

  final String id;
  final EntryType type;
  final DateTime createdAt;
  final String? productId;
  final String? productName;
  final String? customerId;
  final String? customerName;
  final String? customerPhone;
  final int quantity;
  final double unitPrice;
  final double amount;
  final double paidAmount;
  final double gstRate;
  final double gstAmount;
  final double costAmount;
  final List<SaleLine> lines;
  final String note;

  List<SaleLine> get displayLines {
    if (lines.isNotEmpty) return lines;
    if (productId == null || productName == null || quantity <= 0) return [];
    return [
      SaleLine(
        productId: productId!,
        productName: productName!,
        standardQuantity: '',
        quantity: quantity,
        unitPrice: unitPrice,
        buyPriceAtSale: 0,
      ),
    ];
  }

  int get totalQuantity =>
      displayLines.fold(0, (sum, line) => sum + line.quantity);
  double get dueAmount =>
      (amount - paidAmount).clamp(0, double.infinity).toDouble();

  Map<String, Object?> toJson() => {
    'id': id,
    'type': type.name,
    'createdAt': createdAt.toIso8601String(),
    'productId': productId,
    'productName': productName,
    'customerId': customerId,
    'customerName': customerName,
    'customerPhone': customerPhone,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'amount': amount,
    'paidAmount': paidAmount,
    'gstRate': gstRate,
    'gstAmount': gstAmount,
    'costAmount': costAmount,
    'lines': lines.map((line) => line.toJson()).toList(),
    'note': note,
  };

  factory LedgerEntry.fromJson(Map<String, Object?> json) {
    final lines = _decodeList(json['lines'], SaleLine.fromJson);
    return LedgerEntry(
      id: json['id'] as String? ?? _newId(),
      type: EntryType.values.firstWhere(
        (type) => type.name == json['type'],
        orElse: () => EntryType.investment,
      ),
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      productId: json['productId'] as String?,
      productName: json['productName'] as String?,
      customerId: json['customerId'] as String?,
      customerName: json['customerName'] as String?,
      customerPhone: json['customerPhone'] as String?,
      quantity: _jsonInt(json['quantity']),
      unitPrice: _jsonDouble(json['unitPrice']),
      amount: _jsonDouble(json['amount']),
      paidAmount: _jsonDouble(json['paidAmount']),
      gstRate: _jsonDouble(json['gstRate']),
      gstAmount: _jsonDouble(json['gstAmount']),
      costAmount: _jsonDouble(
        json['costAmount'],
        fallback: lines.fold(0, (sum, line) => sum + line.costAmount),
      ),
      lines: lines,
      note: json['note'] as String? ?? '',
    );
  }
}

class Customer {
  Customer({
    required this.id,
    required this.name,
    this.phone = '',
    this.address = '',
    this.openingBalance = 0,
    this.balance = 0,
  });

  final String id;
  String name;
  String phone;
  String address;
  double openingBalance;
  double balance;

  Map<String, Object?> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'address': address,
    'openingBalance': openingBalance,
    'balance': balance,
  };

  factory Customer.fromJson(Map<String, Object?> json) {
    final balance = _jsonDouble(json['balance']);
    return Customer(
      id: json['id'] as String? ?? _newId(),
      name: json['name'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      address: json['address'] as String? ?? '',
      openingBalance: _jsonDouble(json['openingBalance'], fallback: balance),
      balance: balance,
    );
  }
}

class CustomerLedgerEntry {
  CustomerLedgerEntry({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.type,
    required this.createdAt,
    required this.amount,
    this.sourceEntryId,
    this.paymentMethod,
    this.note = '',
  });

  final String id;
  final String customerId;
  final String customerName;
  final CustomerEntryType type;
  final DateTime createdAt;
  final double amount;
  final String? sourceEntryId;
  final CustomerPaymentMethod? paymentMethod;
  final String note;

  Map<String, Object?> toJson() => {
    'id': id,
    'customerId': customerId,
    'customerName': customerName,
    'type': type.name,
    'createdAt': createdAt.toIso8601String(),
    'amount': amount,
    'sourceEntryId': sourceEntryId,
    'paymentMethod': paymentMethod?.name,
    'note': note,
  };

  factory CustomerLedgerEntry.fromJson(Map<String, Object?> json) {
    final paymentMethodName = json['paymentMethod'] as String?;
    return CustomerLedgerEntry(
      id: json['id'] as String? ?? _newId(),
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? '',
      type: CustomerEntryType.values.firstWhere(
        (type) => type.name == json['type'],
        orElse: () => CustomerEntryType.credit,
      ),
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      amount: _jsonDouble(json['amount']),
      sourceEntryId: json['sourceEntryId'] as String?,
      paymentMethod: paymentMethodName == null
          ? null
          : CustomerPaymentMethod.values.firstWhere(
              (method) => method.name == paymentMethodName,
              orElse: () => CustomerPaymentMethod.cash,
            ),
      note: json['note'] as String? ?? '',
    );
  }
}

class AppUser {
  AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.phone = '',
    this.upiId = _defaultUpiId,
    this.password = '',
    this.role = UserRole.staff,
    this.appLockEnabled = false,
    this.deviceLockEnabled = false,
    this.lockPin = '',
  });

  final String id;
  String name;
  String email;
  String phone;
  String upiId;
  String password;
  UserRole role;
  bool appLockEnabled;
  bool deviceLockEnabled;
  String lockPin;

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return 'HK';
    final first = parts.first[0];
    final second = parts.length > 1 && parts[1].isNotEmpty ? parts[1][0] : '';
    return '$first$second'.toUpperCase();
  }

  Map<String, Object?> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phone': phone,
    'upiId': upiId,
    'password': password,
    'role': role.name,
    'appLockEnabled': appLockEnabled,
    'deviceLockEnabled': deviceLockEnabled,
    'lockPin': lockPin,
  };

  factory AppUser.fromJson(Map<String, Object?> json) {
    final roleName = json['role'] as String?;
    return AppUser(
      id: json['id'] as String? ?? _newId(),
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      upiId: (json['upiId'] as String?)?.trim().isNotEmpty == true
          ? (json['upiId'] as String).trim()
          : _defaultUpiId,
      password: json['password'] as String? ?? '',
      role: UserRole.values.firstWhere(
        (role) => role.name == roleName,
        orElse: () => UserRole.owner,
      ),
      appLockEnabled: json['appLockEnabled'] as bool? ?? false,
      deviceLockEnabled: json['deviceLockEnabled'] as bool? ?? false,
      lockPin: json['lockPin'] as String? ?? '',
    );
  }
}

const _dataVersion = 7;

List<Product> _starterProducts() {
  Product item(
    String name,
    String quantity,
    double price, {
    ProductCategory category = ProductCategory.grocery,
    String imageUrl = '',
  }) {
    return Product(
      id: 'starter-${name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-')}',
      name: name,
      standardQuantity: quantity,
      buyPrice: price,
      sellPrice: price,
      stock: 0,
      category: category,
      imageUrl: imageUrl,
    );
  }

  return [
    item(
      'Whole Wheat Atta',
      '5 kg',
      220,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/6/66/Whole_wheat_grain_flour_being_scooped.jpg',
    ),
    item(
      'Basmati Rice',
      '1 kg',
      110,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/1/19/Raw_Basmati_Rice.jpg',
    ),
    item(
      'Sona Masoori Rice',
      '1 kg',
      60,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/8/8a/Sona-masuri.jpg',
    ),
    item(
      'Maida (All-Purpose Flour)',
      '1 kg',
      45,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/4/49/Maida_flour.jpg',
    ),
    item(
      'Suji / Rava (Semolina)',
      '1 kg',
      50,
      imageUrl:
          'https://www.bbassets.com/media/uploads/p/l/40293342_1-bb-super-saver-premium-soojibombay-rava.jpg',
    ),
    item(
      'Besan (Gram Flour)',
      '1 kg',
      90,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/1/11/Besan_the_lapta_in_Hindi.jpg',
    ),
    item(
      'Poha (Flattened Rice)',
      '500 g',
      35,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/3/33/Poha_made_from_flattened_rice.JPG',
    ),
    item(
      'Sabudana (Sago)',
      '500 g',
      45,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/b/b2/Dried_sago_pearls.jpg',
    ),
    item(
      'Oats',
      '500 g',
      95,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/6/69/Oatmeal_%281%29.jpg',
    ),
    item(
      'Vermicelli',
      '400 g',
      40,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/4/49/Vermicelli_Upma.jpg',
    ),
    item(
      'Dalia (Broken Wheat)',
      '500 g',
      40,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/d/db/Daliya_khichdi.jpg',
    ),
    item(
      'Rice Flour',
      '500 g',
      35,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/7/73/Rice_flour.jpg',
    ),
    item(
      'Ragi Flour (Finger Millet)',
      '1 kg',
      65,
      imageUrl:
          'https://upload.wikimedia.org/wikipedia/commons/3/31/Food_grain_finger_millet.jpg',
    ),
    item(
      'Corn Flour',
      '200 g',
      35,
      imageUrl:
          'https://www.starquik.com/cdn/shop/files/star-corn-flour-200-gm-sc-sm55-0-202404081743_1024x1024.jpg',
    ),
    ..._starterStationeryProducts(),
  ];
}

List<Product> _starterStationeryProducts() {
  Product item(
    String name,
    String quantity,
    double mrp, {
    required String imageUrl,
  }) {
    return Product(
      id: 'stationery-${name.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-')}',
      name: name,
      standardQuantity: quantity,
      buyPrice: mrp,
      sellPrice: mrp,
      stock: 0,
      category: ProductCategory.stationery,
      imageUrl: imageUrl,
    );
  }

  return [
    item(
      'Classmate A4 Long Notebook (Single Line, 240 Pages)',
      '240 pages',
      100,
      imageUrl:
          'https://www.bbassets.com/media/uploads/p/l/40005747_4-classmate-notebook-a4-ruled-single-line.jpg',
    ),
    item(
      'Classmate Pulse Spiral Notebook (1-Subject, 160 Pages)',
      '160 pages',
      85,
      imageUrl:
          'https://truewholesale.in/storage/product-images/16597665563.jpg',
    ),
    item(
      'Post-it Sticky Notes (Canary Yellow, 3x3 inch Pad)',
      '3x3 inch pad',
      60,
      imageUrl: '',
    ),
    item(
      'Linc Pentonic Ball Pen',
      'Single pen',
      10,
      imageUrl:
          'https://www.seemkart.com/cdn/shop/products/BRT_open_black_150_x_671_1200x1200.png?v=1647969053',
    ),
    item(
      'Reynolds Trimax Gel Pen',
      'Single pen',
      60,
      imageUrl:
          'https://www.reynolds-pens.com/wp-content/uploads/2021/07/Reynolds-Trimax-Blue.png',
    ),
    item(
      'DOMS X1 Extra Dark Pencils',
      'Box of 10',
      60,
      imageUrl:
          'https://sitaramstationers.com/wp-content/uploads/2021/11/doms-x5.jpg',
    ),
    item('Faber-Castell Textliner Highlighter', 'Single', 25, imageUrl: ''),
    item(
      'Fevistik Glue Stick',
      '8g small stick',
      25,
      imageUrl:
          'https://www.bbassets.com/media/uploads/p/l/40006127_10-pidilite-fevistik-super-glue-stick.jpg',
    ),
    item(
      'Kangaro No.10 Pocket Stapler',
      'Single',
      99,
      imageUrl: 'https://cdn.moglix.com/p/votahTs2Sq50I-xxlarge.jpg',
    ),
    item(
      'Camlin Scholar Geometry Box',
      'Single kit',
      150,
      imageUrl:
          'https://www.kokuyocamlin.com/camlin/gallery/product-menu/geometry-box.jpg',
    ),
  ];
}

List<Product> _productsWithStationeryCatalog(List<Product> products) {
  final merged = List<Product>.of(products);
  final catalogProducts = [
    ..._starterProducts().where(
      (product) => product.category == ProductCategory.grocery,
    ),
    ..._starterStationeryProducts(),
  ];
  for (final product in catalogProducts) {
    final existingIndex = merged.indexWhere(
      (item) =>
          item.id == product.id ||
          item.name.trim().toLowerCase() == product.name.trim().toLowerCase(),
    );
    if (existingIndex == -1) {
      merged.add(product);
    } else {
      final existing = merged[existingIndex];
      existing
        ..category = product.category
        ..imageUrl = product.imageUrl;
      if (product.category == ProductCategory.stationery) {
        existing
          ..buyPrice = product.buyPrice
          ..sellPrice = product.sellPrice;
      }
    }
  }
  return merged;
}

class AppLanguage {
  const AppLanguage(this.code, this.label, this.nativeLabel);

  final String code;
  final String label;
  final String nativeLabel;
}

const _languages = [
  AppLanguage('en', 'English', 'English'),
  AppLanguage('as', 'Assamese', 'অসমীয়া'),
  AppLanguage('tr', 'Bengoli', 'বাংলা'),
  AppLanguage('hi', 'Hindi', 'Hindi'),
];

const _text = {
  'en': {
    'appName': 'hisapkitap',
    'tagline': 'Daily shop accounts',
    'dashboard': 'Dashboard',
    'products': 'Products',
    'entries': 'Entries',
    'history': 'History',
    'reports': 'Reports',
    'customers': 'Customers',
    'todayIncome': 'Today income',
    'todayInvest': 'Today investment',
    'todayProfit': 'Today profit',
    'netCash': 'Net cash',
    'inventoryValue': 'Inventory value',
    'lowStock': 'Low stock',
    'quickEntry': 'Quick entry',
    'stockIn': 'Stock in',
    'saleOut': 'Sale out',
    'investment': 'Investment',
    'product': 'Product',
    'quantity': 'Quantity',
    'unitPrice': 'Unit price',
    'amount': 'Amount',
    'gst': 'GST',
    'gstRate': 'GST %',
    'taxableAmount': 'Taxable amount',
    'gstAmount': 'GST amount',
    'cgst': 'CGST',
    'sgst': 'SGST',
    'note': 'Note',
    'addEntry': 'Add entry',
    'addProduct': 'Add product',
    'productName': 'Product name',
    'category': 'Category',
    'imageUrl': 'Image URL',
    'barcode': 'Barcode / SKU',
    'scanBarcode': 'Scan barcode',
    'mrp': 'MRP',
    'groceryItem': 'Grocery Item',
    'stationeryItem': 'Stationery Item',
    'cosmeticItem': 'Cosmetic Item',
    'standardQuantity': 'Standard quantity',
    'buyPrice': 'Buy price',
    'sellPrice': 'Sell price',
    'openingStock': 'Opening stock',
    'save': 'Save',
    'cancel': 'Cancel',
    'emptyProducts': 'Add your first product to start daily entries.',
    'emptyHistory': 'No entries yet. Add stock, sales, or investment.',
    'stock': 'Stock',
    'profit': 'Profit',
    'income': 'Income',
    'invest': 'Invest',
    'delete': 'Delete',
    'edit': 'Edit',
    'language': 'Language',
    'all': 'All',
    'today': 'Today',
    'required': 'Please fill the required fields.',
    'invalidNumber': 'Enter a valid number.',
    'notEnoughStock': 'Not enough stock available.',
    'selectProduct': 'Select a product first.',
    'recorded': 'Entry recorded.',
    'productSaved': 'Product saved.',
    'noProduct': 'No product',
    'stockAfter': 'Stock after',
    'priceHint': 'Auto-filled from product price',
    'searchProducts': 'Search products',
    'searchHistory': 'Search history',
    'reportRange': 'Report range',
    'month': 'Month',
    'sales': 'Sales',
    'stockInTotal': 'Stock in total',
    'customerDue': 'Customer due',
    'totalDue': 'Total due',
    'printReport': 'Print report',
    'copyReport': 'Copy report CSV',
    'backup': 'Backup',
    'restore': 'Restore',
    'copyBackup': 'Copy backup',
    'pasteBackup': 'Paste backup JSON',
    'backupCopied': 'Backup copied.',
    'restoreDone': 'Backup restored.',
    'restoreFailed': 'Could not restore backup.',
    'autoBackup': 'Auto backup',
    'backupSavedLocally': 'Saved locally',
    'ownerOnly': 'Owner access required.',
    'lowStockAlert': 'Low stock alert',
    'lowStockItems': 'Low-stock items',
    'noLowStock': 'No low-stock items.',
    'addCustomer': 'Add customer',
    'customerName': 'Customer name',
    'phone': 'Phone',
    'address': 'Address',
    'openingBalance': 'Opening balance',
    'closingBalance': 'Closing balance',
    'paymentDue': 'Payment due',
    'customerDetails': 'Customer details',
    'upiId': 'UPI ID',
    'paymentQr': 'Payment QR',
    'copyPaymentLink': 'Copy payment link',
    'paymentLinkCopied': 'Payment link copied.',
    'collectPayment': 'Collect payment',
    'scanToPay': 'Scan to pay',
    'setUpiId': 'Add your UPI ID in Profile first.',
    'paymentMethod': 'Payment method',
    'cashPayment': 'Cash',
    'cardPayment': 'Card',
    'upiPayment': 'UPI',
    'acceptedPayments': 'Accepted payments',
    'payTo': 'Pay to',
    'invoice': 'Invoice',
    'customerInvoice': 'Customer invoice',
    'copyInvoice': 'Copy invoice',
    'printInvoice': 'Print invoice',
    'invoiceCopied': 'Invoice copied.',
    'whatsappInvoice': 'WhatsApp invoice',
    'whatsappReminder': 'WhatsApp reminder',
    'paymentReminder': 'Payment reminder',
    'whatsappOpened': 'WhatsApp opened.',
    'whatsappLinkCopied': 'WhatsApp invoice link copied.',
    'actionFailed': 'Action failed. Please try again.',
    'helpDesk': 'Help desk',
    'supportContact': 'Customer support contact number',
    'complaintEmail': 'Complaint email ID',
    'storeAddress': 'Store address',
    'contactSupport': 'Contact support',
    'credit': 'Credit',
    'payment': 'Payment',
    'addDueEntry': 'Add due/payment',
    'customerSaved': 'Customer saved.',
    'chooseCustomer': 'Choose customer',
    'customerOptional': 'Customer optional',
    'walkInCustomer': 'Walk-in customer',
    'customerPurchase': 'Customer purchase',
    'itemWiseBill': 'Item-wise bill',
    'totalBill': 'Total bill',
    'saleItems': 'Sale items',
    'addItem': 'Add item',
    'removeItem': 'Remove item',
    'paidAmount': 'Paid amount',
    'dueAmount': 'Due amount',
    'balance': 'Balance',
    'paid': 'Paid',
    'dueAdded': 'Customer due updated.',
    'emptyCustomers': 'Add customers to track credit and payments.',
    'signIn': 'Sign in',
    'signUp': 'Sign up',
    'forgotPassword': 'Forgot password',
    'email': 'Email',
    'password': 'Password',
    'confirmPassword': 'Confirm password',
    'fullName': 'Full name',
    'createAccount': 'Create account',
    'welcomeBack': 'Welcome back',
    'authSubtitle':
        'Secure your shop records and continue managing daily sales.',
    'newHere': 'New here?',
    'haveAccount': 'Already have an account?',
    'resetPassword': 'Reset password',
    'resetHint': 'Enter your registered email ID and we will send a reset OTP.',
    'sendOtp': 'Send OTP',
    'otp': 'OTP',
    'otpReady': 'OTP: {otp}',
    'newPassword': 'New password',
    'otpSent':
        'Your OTP is {otp}. It was copied and filled below. If an email draft opens, send it from your mail app.',
    'otpEmailSubject': 'hisapkitap password reset OTP',
    'otpEmailBody':
        'Use this OTP to reset your hisapkitap password: {otp}\n\nIf you did not request this, please ignore this email.',
    'otpInvalid': 'Invalid OTP. Please check and try again.',
    'passwordResetDone': 'Password reset successfully. Please sign in.',
    'otpMailFailed': 'Your OTP is {otp}. It was copied and filled below.',
    'profile': 'Profile',
    'profileSaved': 'Profile saved.',
    'signOut': 'Sign out',
    'account': 'Account',
    'security': 'Security',
    'appLock': 'App lock',
    'appLocked': 'hisapkitap is locked',
    'appLockHint': 'Unlock with your device lock or PIN to continue.',
    'enableAppLock': 'Enable app lock',
    'deviceLock': 'Fingerprint / Face ID',
    'deviceLockHint':
        'Requires App lock. On iPhone browser, Face ID needs HTTPS or native iOS.',
    'unlockDevice': 'Unlock with fingerprint / Face ID',
    'lockPin': 'Lock PIN',
    'pinHint': 'Use at least 4 digits.',
    'unlock': 'Unlock',
    'lockNow': 'Lock now',
    'lockPinRequired': 'Set a 4 digit PIN to enable app lock.',
    'deviceLockReady': 'Device lock is ready.',
    'deviceLockUnavailable':
        'Face ID is unavailable on this link. PIN lock is saved. Use HTTPS or native iOS for Face ID.',
    'unlockFailed': 'Unlock failed. Try again.',
    'role': 'Role',
    'ownerRole': 'Owner',
    'staffRole': 'Staff',
    'passwordHint': 'Use at least 6 characters.',
    'passwordMismatch': 'Passwords do not match.',
    'accountExists': 'An account already exists for this email.',
    'accountMissing': 'No account found for this email.',
    'wrongPassword': 'Incorrect password.',
    'demoReset': 'OTP sent. Enter it below to reset your password.',
    'saveProfile': 'Save profile',
    'owner': 'Owner',
    'workspace': 'Workspace',
    'smartLedger': 'Smart shop ledger',
    'authFeatureOne':
        'Track stock, dues, sales, and profit in one clean place.',
    'authFeatureTwo': 'Back up your data and keep daily work organized.',
  },
  'as': {
    'appName': 'hisapkitap',
    'tagline': 'দৈনিক দোকানৰ হিচাপ',
    'dashboard': 'ডেশ্বব’ৰ্ড',
    'products': 'সামগ্ৰী',
    'entries': 'এন্ট্ৰী',
    'history': 'ইতিহাস',
    'reports': 'ৰিপ’ৰ্ট',
    'customers': 'গ্ৰাহক',
    'helpDesk': 'হেল্প ডেস্ক',
    'todayIncome': 'আজিৰ আয়',
    'todayInvest': 'আজিৰ বিনিয়োগ',
    'todayProfit': 'আজিৰ লাভ',
    'netCash': 'নেট নগদ',
    'inventoryValue': 'ষ্টকৰ মূল্য',
    'lowStock': 'কম ষ্টক',
    'quickEntry': 'দ্ৰুত এন্ট্ৰী',
    'stockIn': 'ষ্টক সোমোৱা',
    'saleOut': 'বিক্ৰী ওলোৱা',
    'investment': 'বিনিয়োগ',
    'product': 'সামগ্ৰী',
    'quantity': 'পৰিমাণ',
    'unitPrice': 'একক দাম',
    'amount': 'টকা',
    'note': 'টোকা',
    'addEntry': 'এন্ট্ৰী যোগ কৰক',
    'addProduct': 'সামগ্ৰী যোগ কৰক',
    'productName': 'সামগ্ৰীৰ নাম',
    'standardQuantity': 'মানক পৰিমাণ',
    'buyPrice': 'ক্ৰয় দাম',
    'sellPrice': 'বিক্ৰী দাম',
    'openingStock': 'আৰম্ভণিৰ ষ্টক',
    'save': 'ছেভ',
    'cancel': 'বাতিল',
    'emptyProducts': 'দৈনিক এন্ট্ৰী আৰম্ভ কৰিবলৈ প্ৰথম সামগ্ৰী যোগ কৰক.',
    'emptyHistory':
        'এতিয়ালৈ কোনো এন্ট্ৰী নাই. ষ্টক, বিক্ৰী বা বিনিয়োগ যোগ কৰক.',
    'stock': 'ষ্টক',
    'profit': 'লাভ',
    'income': 'আয়',
    'invest': 'বিনিয়োগ',
    'delete': 'ডিলিট',
    'edit': 'এডিট',
    'language': 'ভাষা',
    'all': 'সকলো',
    'today': 'আজি',
    'required': 'প্ৰয়োজনীয় ফিল্ডসমূহ পূৰণ কৰক.',
    'invalidNumber': 'সঠিক সংখ্যা দিয়ক.',
    'notEnoughStock': 'পৰ্যাপ্ত ষ্টক নাই.',
    'selectProduct': 'আগতে সামগ্ৰী বাছনি কৰক.',
    'recorded': 'এন্ট্ৰী ছেভ হ’ল.',
    'productSaved': 'সামগ্ৰী ছেভ হ’ল.',
    'noProduct': 'সামগ্ৰী নাই',
    'stockAfter': 'পিছৰ ষ্টক',
    'priceHint': 'সামগ্ৰীৰ দামৰ পৰা নিজে ভৰিছে',
  },
  'tr': {
    'appName': 'hisapkitap',
    'tagline': 'Gunluk dukkan hesabı',
    'dashboard': 'ডেশ্বব’ৰ্ড',
    'products': 'সামগ্ৰী',
    'entries': 'Girisler',
    'history': 'Gecmis',
    'todayIncome': 'Bugun gelir',
    'todayInvest': 'Bugun yatirim',
    'todayProfit': 'Bugun kar',
    'netCash': 'Net kasa',
    'inventoryValue': 'Stok degeri',
    'lowStock': 'Az stok',
    'quickEntry': 'Hizli giris',
    'stockIn': 'Stok giris',
    'saleOut': 'Satis cikis',
    'investment': 'Yatirim',
    'product': 'Urun',
    'quantity': 'Adet',
    'unitPrice': 'Birim fiyat',
    'amount': 'Tutar',
    'note': 'Not',
    'addEntry': 'Kaydet',
    'addProduct': 'Urun ekle',
    'productName': 'Urun adi',
    'standardQuantity': 'Standart miktar',
    'buyPrice': 'Alis fiyati',
    'sellPrice': 'Satis fiyati',
    'openingStock': 'Acilis stogu',
    'save': 'Kaydet',
    'cancel': 'Iptal',
    'emptyProducts': 'Gunluk giris icin ilk urunu ekleyin.',
    'emptyHistory': 'Henuz kayit yok. Stok, satis veya yatirim ekleyin.',
    'stock': 'Stok',
    'profit': 'Kar',
    'income': 'Gelir',
    'invest': 'Yatirim',
    'delete': 'Sil',
    'edit': 'Duzenle',
    'language': 'Dil',
    'all': 'Hepsi',
    'today': 'Bugun',
    'required': 'Zorunlu alanlari doldurun.',
    'invalidNumber': 'Gecerli bir sayi girin.',
    'notEnoughStock': 'Yeterli stok yok.',
    'selectProduct': 'Once urun secin.',
    'recorded': 'Kayit eklendi.',
    'productSaved': 'Urun kaydedildi.',
    'noProduct': 'Urun yok',
    'stockAfter': 'Son stok',
    'priceHint': 'Urun fiyatindan otomatik doldu',
  },
  'hi': {
    'appName': 'hisapkitap',
    'tagline': 'रोज का दुकान हिसाब',
    'dashboard': 'डैशबोर्ड',
    'products': 'प्रोडक्ट',
    'entries': 'एंट्री',
    'history': 'हिस्ट्री',
    'todayIncome': 'आज की आमदनी',
    'todayInvest': 'आज का निवेश',
    'todayProfit': 'आज का मुनाफा',
    'netCash': 'नेट कैश',
    'inventoryValue': 'स्टॉक वैल्यू',
    'lowStock': 'कम स्टॉक',
    'quickEntry': 'फास्ट एंट्री',
    'stockIn': 'स्टॉक इन',
    'saleOut': 'सेल आउट',
    'investment': 'निवेश',
    'product': 'प्रोडक्ट',
    'quantity': 'मात्रा',
    'unitPrice': 'एक भाव',
    'amount': 'रकम',
    'note': 'नोट',
    'addEntry': 'एंट्री जोड़ें',
    'addProduct': 'प्रोडक्ट जोड़ें',
    'productName': 'प्रोडक्ट नाम',
    'standardQuantity': 'स्टैंडर्ड मात्रा',
    'buyPrice': 'खरीद भाव',
    'sellPrice': 'सेल भाव',
    'openingStock': 'शुरू स्टॉक',
    'save': 'सेव',
    'cancel': 'कैंसल',
    'emptyProducts': 'डेली एंट्री शुरू करने के लिए पहला प्रोडक्ट जोड़ें.',
    'emptyHistory': 'अभी कोई एंट्री नहीं. स्टॉक, सेल या निवेश जोड़ें.',
    'stock': 'स्टॉक',
    'profit': 'मुनाफा',
    'income': 'आमदनी',
    'invest': 'निवेश',
    'delete': 'डिलीट',
    'edit': 'एडिट',
    'language': 'भाषा',
    'all': 'सब',
    'today': 'आज',
    'required': 'जरूरी फील्ड भरें.',
    'invalidNumber': 'सही नंबर डालें.',
    'notEnoughStock': 'इतना स्टॉक उपलब्ध नहीं है.',
    'selectProduct': 'पहले प्रोडक्ट चुनें.',
    'recorded': 'एंट्री सेव हो गई.',
    'productSaved': 'प्रोडक्ट सेव हो गया.',
    'noProduct': 'प्रोडक्ट नहीं',
    'stockAfter': 'बाद का स्टॉक',
    'priceHint': 'प्रोडक्ट भाव से अपने आप भरा',
  },
};

class HisapKitapApp extends StatefulWidget {
  const HisapKitapApp({super.key});

  @override
  State<HisapKitapApp> createState() => _HisapKitapAppState();
}

class _HisapKitapAppState extends State<HisapKitapApp> {
  late String _languageCode = _initialLanguageCode();

  String _initialLanguageCode() {
    final deviceCode = PlatformDispatcher.instance.locale.languageCode;
    return _text.containsKey(deviceCode) ? deviceCode : 'en';
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'hisapkitap',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: _teal,
          brightness: Brightness.dark,
        ),
        fontFamily: 'Segoe UI',
        scaffoldBackgroundColor: _ink,
        splashColor: _rose.withValues(alpha: 0.24),
        highlightColor: _teal.withValues(alpha: 0.18),
        hoverColor: _teal.withValues(alpha: 0.1),
        focusColor: _teal.withValues(alpha: 0.16),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: _ink,
          foregroundColor: _inkText,
          elevation: 0,
          centerTitle: false,
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: _inkPanel,
          indicatorColor: _teal.withValues(alpha: 0.22),
          overlayColor: WidgetStateProperty.resolveWith(
            (states) => _neonOverlay(states),
          ),
          labelTextStyle: WidgetStateProperty.resolveWith(
            (states) => TextStyle(
              color: states.contains(WidgetState.selected) ? _teal : _inkMuted,
              fontSize: 12,
              fontWeight: states.contains(WidgetState.selected)
                  ? FontWeight.w800
                  : FontWeight.w500,
            ),
          ),
          iconTheme: WidgetStateProperty.resolveWith(
            (states) => IconThemeData(
              color: states.contains(WidgetState.selected) ? _teal : _inkMuted,
            ),
          ),
        ),
        navigationRailTheme: const NavigationRailThemeData(
          backgroundColor: _ink,
          selectedIconTheme: IconThemeData(color: _teal),
          unselectedIconTheme: IconThemeData(color: _inkMuted),
          selectedLabelTextStyle: TextStyle(
            color: _teal,
            fontWeight: FontWeight.w800,
          ),
          unselectedLabelTextStyle: TextStyle(color: _inkMuted),
        ),
        cardTheme: CardThemeData(
          elevation: 2,
          color: _inkPanel,
          shadowColor: _teal.withValues(alpha: 0.22),
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: _inkBorder),
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: _neonButtonStyle(
            backgroundColor: _teal,
            foregroundColor: _ink,
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: _neonButtonStyle(
            foregroundColor: _teal,
            backgroundColor: Colors.transparent,
            outlined: true,
          ),
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(
          backgroundColor: _amber,
          foregroundColor: _ink,
          elevation: 8,
          focusElevation: 12,
          hoverElevation: 14,
          highlightElevation: 16,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        snackBarTheme: const SnackBarThemeData(
          backgroundColor: _inkPanelAlt,
          contentTextStyle: TextStyle(color: _inkText),
          behavior: SnackBarBehavior.floating,
        ),
        textButtonTheme: TextButtonThemeData(
          style: ButtonStyle(
            foregroundColor: const WidgetStatePropertyAll(_teal),
            overlayColor: WidgetStateProperty.resolveWith(
              (states) => _neonOverlay(states),
            ),
            textStyle: const WidgetStatePropertyAll(
              TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
        ),
        iconButtonTheme: IconButtonThemeData(
          style: ButtonStyle(
            foregroundColor: WidgetStateProperty.resolveWith(
              (states) => states.contains(WidgetState.pressed)
                  ? _rose
                  : states.contains(WidgetState.hovered) ||
                        states.contains(WidgetState.focused) ||
                        states.contains(WidgetState.selected)
                  ? _teal
                  : _inkMuted,
            ),
            backgroundColor: WidgetStateProperty.resolveWith(
              (states) => _neonOverlay(states),
            ),
          ),
        ),
        listTileTheme: ListTileThemeData(
          selectedColor: _teal,
          selectedTileColor: _teal.withValues(alpha: 0.12),
          iconColor: _inkMuted,
          textColor: _inkText,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: _inkPanelAlt,
          selectedColor: _teal.withValues(alpha: 0.2),
          checkmarkColor: _teal,
          labelStyle: const TextStyle(color: _inkText),
          secondaryLabelStyle: const TextStyle(
            color: _teal,
            fontWeight: FontWeight.w800,
          ),
          side: BorderSide(color: _teal.withValues(alpha: 0.38)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 1,
          pressElevation: 8,
          shadowColor: _teal.withValues(alpha: 0.34),
        ),
        segmentedButtonTheme: SegmentedButtonThemeData(
          style: ButtonStyle(
            foregroundColor: WidgetStateProperty.resolveWith(
              (states) => states.contains(WidgetState.selected)
                  ? _ink
                  : states.contains(WidgetState.pressed)
                  ? _rose
                  : _teal,
            ),
            backgroundColor: WidgetStateProperty.resolveWith(
              (states) =>
                  states.contains(WidgetState.selected) ? _teal : _inkPanelAlt,
            ),
            overlayColor: WidgetStateProperty.resolveWith(
              (states) => _neonOverlay(states),
            ),
            side: WidgetStateProperty.resolveWith(
              (states) => BorderSide(
                color: states.contains(WidgetState.selected)
                    ? _teal
                    : _inkBorder,
              ),
            ),
            shadowColor: WidgetStateProperty.resolveWith(
              (states) => states.contains(WidgetState.selected)
                  ? _teal.withValues(alpha: 0.45)
                  : Colors.transparent,
            ),
            elevation: WidgetStateProperty.resolveWith(
              (states) => states.contains(WidgetState.selected) ? 8 : 0,
            ),
            shape: WidgetStatePropertyAll(
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ),
        dividerTheme: const DividerThemeData(color: _inkBorder),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: _inkPanelAlt,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 14,
          ),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: _inkBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: _teal, width: 1.4),
          ),
          labelStyle: const TextStyle(color: _inkMuted),
          helperStyle: const TextStyle(color: _inkMuted),
          prefixIconColor: _inkMuted,
          suffixIconColor: _inkMuted,
        ),
      ),
      home: LedgerHome(
        languageCode: _languageCode,
        onLanguageChanged: (code) => setState(() => _languageCode = code),
      ),
    );
  }
}

Color? _neonOverlay(Set<WidgetState> states) {
  if (states.contains(WidgetState.disabled)) return null;
  if (states.contains(WidgetState.pressed)) {
    return _rose.withValues(alpha: 0.24);
  }
  if (states.contains(WidgetState.hovered) ||
      states.contains(WidgetState.focused) ||
      states.contains(WidgetState.selected)) {
    return _teal.withValues(alpha: 0.18);
  }
  return null;
}

ButtonStyle _neonButtonStyle({
  required Color foregroundColor,
  required Color backgroundColor,
  bool outlined = false,
}) {
  return ButtonStyle(
    foregroundColor: WidgetStatePropertyAll(foregroundColor),
    backgroundColor: WidgetStateProperty.resolveWith(
      (states) => states.contains(WidgetState.disabled)
          ? _inkPanelAlt
          : outlined
          ? backgroundColor
          : states.contains(WidgetState.pressed)
          ? _rose
          : backgroundColor,
    ),
    overlayColor: WidgetStateProperty.resolveWith(
      (states) => _neonOverlay(states),
    ),
    shadowColor: WidgetStateProperty.resolveWith(
      (states) => states.contains(WidgetState.disabled)
          ? Colors.transparent
          : states.contains(WidgetState.pressed)
          ? _rose.withValues(alpha: 0.62)
          : _teal.withValues(alpha: 0.5),
    ),
    elevation: WidgetStateProperty.resolveWith(
      (states) => states.contains(WidgetState.disabled)
          ? 0
          : states.contains(WidgetState.pressed)
          ? 14
          : states.contains(WidgetState.hovered) ||
                states.contains(WidgetState.focused)
          ? 10
          : 4,
    ),
    side: WidgetStateProperty.resolveWith(
      (states) => BorderSide(
        color: states.contains(WidgetState.pressed)
            ? _rose
            : states.contains(WidgetState.hovered) ||
                  states.contains(WidgetState.focused)
            ? _teal
            : outlined
            ? _inkBorder
            : Colors.transparent,
        width: outlined ? 1.2 : 0,
      ),
    ),
    shape: WidgetStatePropertyAll(
      RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
    textStyle: const WidgetStatePropertyAll(
      TextStyle(fontWeight: FontWeight.w800),
    ),
    padding: const WidgetStatePropertyAll(
      EdgeInsets.symmetric(horizontal: 18, vertical: 14),
    ),
  );
}

class LedgerHome extends StatefulWidget {
  const LedgerHome({
    super.key,
    required this.languageCode,
    required this.onLanguageChanged,
  });

  final String languageCode;
  final ValueChanged<String> onLanguageChanged;

  @override
  State<LedgerHome> createState() => _LedgerHomeState();
}

class _LedgerHomeState extends State<LedgerHome> {
  static const _storageKey = 'hisap_kitap_data_v1';
  static const _authStorageKey = 'hisap_kitap_auth_v1';

  List<Product> _products = _starterProducts();
  final List<LedgerEntry> _entries = [];
  final List<Customer> _customers = [];
  final List<CustomerLedgerEntry> _customerEntries = [];
  final List<AppUser> _users = [];
  AppUser? _currentUser;
  bool _authLoaded = false;
  bool _appUnlocked = true;
  int _selectedIndex = 0;
  bool _showTodayOnly = true;
  bool _showMonthReport = true;
  String _productSearch = '';
  ProductCategory? _productCategoryFilter;
  String _historySearch = '';
  String _customerSearch = '';
  DateTime? _lastBackupAt;

  String get _lang => widget.languageCode;
  bool get _canManage => _currentUser?.role == UserRole.owner;

  List<LedgerEntry> get _todayEntries {
    final now = DateTime.now();
    return _entries.where((entry) => _isSameDay(entry.createdAt, now)).toList();
  }

  List<LedgerEntry> get _visibleEntries =>
      _showTodayOnly ? _todayEntries : _entries;

  List<Product> get _filteredProducts {
    final query = _productSearch.trim().toLowerCase();
    return _products
        .where(
          (product) =>
              (_productCategoryFilter == null ||
                  product.category == _productCategoryFilter) &&
              (query.isEmpty ||
                  product.name.toLowerCase().contains(query) ||
                  product.barcode.toLowerCase().contains(query) ||
                  product.standardQuantity.toLowerCase().contains(query) ||
                  _productCategoryLabel(
                    product.category,
                    'en',
                  ).toLowerCase().contains(query)),
        )
        .toList();
  }

  List<LedgerEntry> get _filteredEntries {
    final query = _historySearch.trim().toLowerCase();
    final source = _visibleEntries;
    if (query.isEmpty) return source;
    return source
        .where(
          (entry) =>
              (entry.productName ?? '').toLowerCase().contains(query) ||
              entry.displayLines.any(
                (line) => line.productName.toLowerCase().contains(query),
              ) ||
              (entry.customerName ?? '').toLowerCase().contains(query) ||
              (entry.customerPhone ?? '').toLowerCase().contains(query) ||
              entry.note.toLowerCase().contains(query) ||
              _entryTypeLabel(entry.type).toLowerCase().contains(query),
        )
        .toList();
  }

  List<Customer> get _filteredCustomers {
    final query = _customerSearch.trim().toLowerCase();
    if (query.isEmpty) return _customers;
    return _customers
        .where(
          (customer) =>
              customer.name.toLowerCase().contains(query) ||
              customer.phone.toLowerCase().contains(query),
        )
        .toList();
  }

  List<Product> get _lowStockProducts => _products
      .where((product) => product.stock <= product.lowStockAlert)
      .toList();

  double get _customerDue =>
      _customers.fold(0, (sum, customer) => sum + customer.balance);

  double get _todayIncome => _todayEntries
      .where((entry) => entry.type == EntryType.saleOut)
      .fold(0, (sum, entry) => sum + entry.amount);

  double get _todayInvestment => _todayEntries
      .where((entry) => entry.type != EntryType.saleOut)
      .fold(0, (sum, entry) => sum + entry.amount);

  double get _todayProfit => _todayEntries
      .where((entry) => entry.type == EntryType.saleOut)
      .fold(0, (sum, entry) => sum + _entryProfit(entry));

  double get _inventoryValue => _products.fold(
    0,
    (sum, product) => sum + product.stock * product.buyPrice,
  );

  int get _lowStockCount => _lowStockProducts.length;

  @override
  void initState() {
    super.initState();
    _loadAuth();
    _loadData();
  }

  @override
  Widget build(BuildContext context) {
    if (!_authLoaded) {
      return const _LoadingPage();
    }
    if (_currentUser == null) {
      return _AuthPage(
        lang: _lang,
        onSignIn: _signIn,
        onSignUp: _signUp,
        onForgotPassword: _forgotPassword,
        onResetPassword: _resetPassword,
      );
    }
    if (_currentUser!.appLockEnabled && !_appUnlocked) {
      return _AppLockPage(
        lang: _lang,
        user: _currentUser!,
        onDeviceUnlock: _unlockWithDevice,
        onPinUnlock: _unlockWithPin,
        onSignOut: _signOut,
      );
    }

    final isWide = MediaQuery.sizeOf(context).width >= 850;
    final pages = [
      _DashboardPage(
        lang: _lang,
        todayIncome: _todayIncome,
        todayInvestment: _todayInvestment,
        todayProfit: _todayProfit,
        inventoryValue: _inventoryValue,
        lowStockCount: _lowStockCount,
        productCount: _products.length,
        customerDue: _customerDue,
        customers: _customers,
        lowStockProducts: _lowStockProducts,
        entries: _todayEntries,
        onAddEntry: () => setState(() => _selectedIndex = 2),
        onAddProduct: _showProductSheet,
      ),
      _ProductsPage(
        lang: _lang,
        products: _filteredProducts,
        searchText: _productSearch,
        selectedCategory: _productCategoryFilter,
        onSearchChanged: (value) => setState(() => _productSearch = value),
        onCategoryChanged: (value) =>
            setState(() => _productCategoryFilter = value),
        onAddProduct: _showProductSheet,
        onEditProduct: _showProductSheet,
        onDeleteProduct: _deleteProduct,
        canManage: _canManage,
      ),
      _EntryPage(
        lang: _lang,
        products: _products,
        customers: _customers,
        onEntryCreated: _addEntry,
      ),
      _HistoryPage(
        lang: _lang,
        entries: _filteredEntries,
        showTodayOnly: _showTodayOnly,
        searchText: _historySearch,
        onToggleFilter: (value) => setState(() => _showTodayOnly = value),
        onSearchChanged: (value) => setState(() => _historySearch = value),
        onDeleteEntry: _deleteEntry,
        canManage: _canManage,
      ),
      _ReportsPage(
        lang: _lang,
        summary: _buildReportSummary(),
        showMonth: _showMonthReport,
        onRangeChanged: (value) => setState(() => _showMonthReport = value),
        onPrintReport: _printReport,
        onCopyReport: _copyReportCsv,
        onCopyBackup: _copyBackup,
        onRestoreBackup: _showRestoreSheet,
        lastBackupAt: _lastBackupAt,
        canManage: _canManage,
      ),
      _CustomersPage(
        lang: _lang,
        customers: _filteredCustomers,
        entries: _customerEntries,
        searchText: _customerSearch,
        onSearchChanged: (value) => setState(() => _customerSearch = value),
        onAddCustomer: _showCustomerSheet,
        onEditCustomer: _showCustomerSheet,
        onDeleteCustomer: _deleteCustomer,
        onAddCustomerEntry: _showCustomerEntrySheet,
        onShowPaymentQr: _showCustomerPaymentQr,
        onShowInvoice: _showCustomerInvoice,
        onShareWhatsAppInvoice: _shareWhatsAppInvoice,
        onShareWhatsAppReminder: _shareWhatsAppDueReminder,
        canManage: _canManage,
      ),
      _HelpDeskPage(lang: _lang),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(t('appName', _lang)),
            Text(
              t('tagline', _lang),
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            tooltip: t('language', _lang),
            icon: const Icon(Icons.language),
            initialValue: _lang,
            onSelected: widget.onLanguageChanged,
            itemBuilder: (context) => [
              for (final language in _languages)
                PopupMenuItem(
                  value: language.code,
                  child: Text('${language.label} - ${language.nativeLabel}'),
                ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: PopupMenuButton<String>(
              tooltip: t('profile', _lang),
              onSelected: (value) {
                if (value == 'profile') {
                  _showProfileSheet();
                } else if (value == 'lock') {
                  setState(() => _appUnlocked = false);
                } else if (value == 'signOut') {
                  _signOut();
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'profile',
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.person_outline),
                    title: Text(t('profile', _lang)),
                    subtitle: Text(
                      '${_currentUser!.email}  |  ${_userRoleLabel(_currentUser!.role, _lang)}',
                    ),
                  ),
                ),
                if (_currentUser!.appLockEnabled)
                  PopupMenuItem(
                    value: 'lock',
                    child: ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.lock_outline),
                      title: Text(t('lockNow', _lang)),
                    ),
                  ),
                PopupMenuItem(
                  value: 'signOut',
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.logout),
                    title: Text(t('signOut', _lang)),
                  ),
                ),
              ],
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: _teal,
                    foregroundColor: _ink,
                    child: Text(
                      _currentUser!.initials,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                  if (_currentUser!.role == UserRole.owner)
                    const Positioned(
                      right: -2,
                      bottom: -2,
                      child: Icon(Icons.verified, size: 15, color: _amber),
                    ),
                ],
              ),
            ),
          ),
          Chip(
            visualDensity: VisualDensity.compact,
            avatar: Icon(
              _currentUser!.role == UserRole.owner
                  ? Icons.admin_panel_settings_outlined
                  : Icons.badge_outlined,
              size: 16,
            ),
            label: Text(
              _userRoleLabel(_currentUser!.role, _lang),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Row(
        children: [
          if (isWide)
            NavigationRail(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (index) {
                setState(() => _selectedIndex = index);
              },
              labelType: NavigationRailLabelType.all,
              destinations: _navDestinations(_lang)
                  .map(
                    (destination) => NavigationRailDestination(
                      icon: Icon(destination.icon),
                      selectedIcon: _NeonGlowIcon(
                        icon: destination.selectedIcon,
                      ),
                      label: Text(destination.label),
                    ),
                  )
                  .toList(),
            ),
          Expanded(child: pages[_selectedIndex]),
        ],
      ),
      bottomNavigationBar: isWide
          ? null
          : NavigationBar(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (index) {
                setState(() => _selectedIndex = index);
              },
              destinations: _navDestinations(_lang)
                  .map(
                    (destination) => NavigationDestination(
                      icon: Icon(destination.icon),
                      selectedIcon: _NeonGlowIcon(
                        icon: destination.selectedIcon,
                      ),
                      label: destination.label,
                    ),
                  )
                  .toList(),
            ),
      floatingActionButton: _selectedIndex == 1
          ? FloatingActionButton.extended(
              onPressed: () => _showProductSheet(),
              icon: const Icon(Icons.add_box_outlined),
              label: Text(t('addProduct', _lang)),
            )
          : _selectedIndex == 5
          ? FloatingActionButton.extended(
              onPressed: () => _showCustomerSheet(),
              icon: const Icon(Icons.person_add_alt),
              label: Text(t('addCustomer', _lang)),
            )
          : null,
    );
  }

  void _showSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  void _commit(VoidCallback update) {
    final savedAt = DateTime.now();
    setState(() {
      update();
      _lastBackupAt = savedAt;
    });
    _saveData();
  }

  Future<void> _loadAuth() async {
    final preferences = await SharedPreferences.getInstance();
    final raw = preferences.getString(_authStorageKey);
    if (raw == null || raw.isEmpty) {
      if (!mounted) return;
      setState(() => _authLoaded = true);
      return;
    }
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, Object?>) throw const FormatException();
      final users = _decodeList(decoded['users'], AppUser.fromJson);
      final currentUserId = decoded['currentUserId'] as String?;
      AppUser? currentUser;
      for (final user in users) {
        if (user.id == currentUserId) {
          currentUser = user;
          break;
        }
      }
      if (!mounted) return;
      setState(() {
        _users
          ..clear()
          ..addAll(users);
        _currentUser = currentUser;
        _appUnlocked = currentUser?.appLockEnabled != true;
        _authLoaded = true;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _authLoaded = true);
    }
  }

  Future<void> _saveAuth() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(
      _authStorageKey,
      jsonEncode({
        'users': _users.map((user) => user.toJson()).toList(),
        'currentUserId': _currentUser?.id,
      }),
    );
  }

  String? _signIn(String email, String password) {
    final normalizedEmail = email.trim().toLowerCase();
    AppUser? user;
    for (final item in _users) {
      if (item.email.toLowerCase() == normalizedEmail) {
        user = item;
        break;
      }
    }
    if (user == null) return t('accountMissing', _lang);
    if (user.password != password) return t('wrongPassword', _lang);
    setState(() {
      _currentUser = user;
      _appUnlocked = true;
    });
    _saveAuth();
    return null;
  }

  String? _signUp(String name, String email, String phone, String password) {
    final normalizedEmail = email.trim().toLowerCase();
    if (_users.any((user) => user.email.toLowerCase() == normalizedEmail)) {
      return t('accountExists', _lang);
    }
    final user = AppUser(
      id: _newId(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      upiId: _defaultUpiId,
      password: password,
      role: _users.isEmpty ? UserRole.owner : UserRole.staff,
    );
    setState(() {
      _users.add(user);
      _currentUser = user;
      _appUnlocked = true;
    });
    _saveAuth();
    return null;
  }

  Future<_OtpSendResult> _forgotPassword(String email, String otp) async {
    final normalizedEmail = email.trim().toLowerCase();
    AppUser? user;
    for (final item in _users) {
      if (item.email.toLowerCase() == normalizedEmail) {
        user = item;
        break;
      }
    }
    if (user == null) {
      return _OtpSendResult(false, t('accountMissing', _lang));
    }

    try {
      await Clipboard.setData(ClipboardData(text: otp));
    } catch (_) {
      // Clipboard can fail in some browser contexts; the OTP is still shown.
    }
    return _OtpSendResult(
      true,
      t('otpMailFailed', _lang).replaceAll('{otp}', otp),
    );
  }

  String? _resetPassword(String email, String password) {
    final normalizedEmail = email.trim().toLowerCase();
    for (final user in _users) {
      if (user.email.toLowerCase() == normalizedEmail) {
        setState(() => user.password = password);
        _saveAuth();
        return null;
      }
    }
    return t('accountMissing', _lang);
  }

  Future<void> _signOut() async {
    setState(() {
      _currentUser = null;
      _appUnlocked = true;
    });
    await _saveAuth();
  }

  Future<bool> _unlockWithDevice() async {
    final unlocked = await authenticateDeviceLock();
    if (!mounted) return false;
    if (unlocked) {
      setState(() => _appUnlocked = true);
    }
    return unlocked;
  }

  bool _unlockWithPin(String pin) {
    final user = _currentUser;
    final unlocked =
        user != null && user.lockPin.isNotEmpty && user.lockPin == pin.trim();
    if (unlocked) {
      setState(() => _appUnlocked = true);
    }
    return unlocked;
  }

  Future<void> _showProfileSheet() async {
    final user = _currentUser;
    if (user == null) return;
    final nameController = TextEditingController(text: user.name);
    final emailController = TextEditingController(text: user.email);
    final phoneController = TextEditingController(text: user.phone);
    final upiController = TextEditingController(text: user.upiId);
    final passwordController = TextEditingController(text: user.password);
    final lockPinController = TextEditingController(text: user.lockPin);
    var appLockEnabled = user.appLockEnabled;
    var deviceLockEnabled = user.deviceLockEnabled;
    try {
      final saved = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (context) {
          final bottom = MediaQuery.viewInsetsOf(context).bottom;
          return StatefulBuilder(
            builder: (context, setSheetState) {
              return Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, bottom + 16),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 26,
                            backgroundColor: _violet,
                            foregroundColor: _ink,
                            child: Text(
                              user.initials,
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  t('profile', _lang),
                                  style: Theme.of(context).textTheme.titleLarge
                                      ?.copyWith(fontWeight: FontWeight.w800),
                                ),
                                Text(
                                  t('account', _lang),
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      TextField(
                        controller: nameController,
                        decoration: InputDecoration(
                          labelText: t('fullName', _lang),
                          prefixIcon: const Icon(Icons.badge_outlined),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: t('email', _lang),
                          prefixIcon: const Icon(Icons.alternate_email),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: phoneController,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          labelText: t('phone', _lang),
                          prefixIcon: const Icon(Icons.call_outlined),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: upiController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: t('upiId', _lang),
                          prefixIcon: const Icon(Icons.qr_code_2_outlined),
                        ),
                      ),
                      const SizedBox(height: 12),
                      _NeonPanel(
                        color: user.role == UserRole.owner ? _amber : _teal,
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Icon(
                              user.role == UserRole.owner
                                  ? Icons.admin_panel_settings_outlined
                                  : Icons.badge_outlined,
                              color: user.role == UserRole.owner
                                  ? _amber
                                  : _teal,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                '${t('role', _lang)}: ${_userRoleLabel(user.role, _lang)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      _NeonPanel(
                        color: _teal,
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              value: appLockEnabled,
                              onChanged: (value) {
                                setSheetState(() {
                                  appLockEnabled = value;
                                  if (!value) deviceLockEnabled = false;
                                });
                              },
                              secondary: const Icon(Icons.lock_outline),
                              title: Text(t('enableAppLock', _lang)),
                              subtitle: Text(t('appLockHint', _lang)),
                            ),
                            const SizedBox(height: 10),
                            if (appLockEnabled) ...[
                              TextField(
                                controller: lockPinController,
                                obscureText: true,
                                keyboardType: TextInputType.number,
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                ],
                                decoration: InputDecoration(
                                  labelText: t('lockPin', _lang),
                                  helperText: t('pinHint', _lang),
                                  prefixIcon: const Icon(Icons.pin_outlined),
                                ),
                              ),
                              const SizedBox(height: 8),
                            ],
                            SwitchListTile(
                              contentPadding: EdgeInsets.zero,
                              value: appLockEnabled && deviceLockEnabled,
                              onChanged: appLockEnabled
                                  ? (value) => setSheetState(
                                      () => deviceLockEnabled = value,
                                    )
                                  : null,
                              secondary: const Icon(Icons.fingerprint),
                              title: Text(t('deviceLock', _lang)),
                              subtitle: Text(t('deviceLockHint', _lang)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      ValueListenableBuilder<TextEditingValue>(
                        valueListenable: upiController,
                        builder: (context, value, child) {
                          final upiId = value.text.trim();
                          if (upiId.isEmpty) {
                            return const SizedBox.shrink();
                          }
                          final name = nameController.text.trim().isNotEmpty
                              ? nameController.text.trim()
                              : user.name;
                          final paymentUri = Uri(
                            scheme: 'upi',
                            host: 'pay',
                            queryParameters: {
                              'pa': upiId,
                              'pn': name,
                              'cu': 'INR',
                            },
                          ).toString();
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: QrImageView(
                                      data: paymentUri,
                                      size: 110,
                                      backgroundColor: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          t('paymentQr', _lang),
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.w800,
                                              ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(t('scanToPay', _lang)),
                                        const SizedBox(height: 4),
                                        Text(
                                          upiId,
                                          style: Theme.of(
                                            context,
                                          ).textTheme.bodySmall,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          labelText: t('password', _lang),
                          helperText: t('passwordHint', _lang),
                          prefixIcon: const Icon(Icons.lock_outline),
                        ),
                      ),
                      const SizedBox(height: 18),
                      FilledButton.icon(
                        onPressed: () async {
                          final name = nameController.text.trim();
                          final email = emailController.text
                              .trim()
                              .toLowerCase();
                          final password = passwordController.text;
                          final lockPin = lockPinController.text.trim();
                          if (name.isEmpty ||
                              email.isEmpty ||
                              !email.contains('@') ||
                              password.length < 6) {
                            _showSnack(t('required', _lang));
                            return;
                          }
                          final emailTaken = _users.any(
                            (item) =>
                                item.id != user.id &&
                                item.email.toLowerCase() == email,
                          );
                          if (emailTaken) {
                            _showSnack(t('accountExists', _lang));
                            return;
                          }
                          var savedDeviceLockEnabled = deviceLockEnabled;
                          String? lockMessage;
                          if (appLockEnabled) {
                            if (lockPin.length < 4) {
                              _showSnack(t('lockPinRequired', _lang));
                              return;
                            }
                            if (deviceLockEnabled) {
                              final registered = await registerDeviceLock(
                                userId: user.id,
                                userName: name,
                              );
                              savedDeviceLockEnabled = registered;
                              lockMessage = registered
                                  ? t('deviceLockReady', _lang)
                                  : t('deviceLockUnavailable', _lang);
                            }
                          }
                          if (!context.mounted) return;
                          setState(() {
                            user
                              ..name = name
                              ..email = email
                              ..phone = phoneController.text.trim()
                              ..upiId = upiController.text.trim()
                              ..password = password
                              ..appLockEnabled = appLockEnabled
                              ..deviceLockEnabled =
                                  appLockEnabled && savedDeviceLockEnabled
                              ..lockPin = appLockEnabled ? lockPin : '';
                          });
                          _saveAuth();
                          Navigator.pop(context, true);
                          if (lockMessage != null) _showSnack(lockMessage);
                        },
                        icon: const Icon(Icons.verified_outlined),
                        label: Text(t('saveProfile', _lang)),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      );
      if (saved == true) _showSnack(t('profileSaved', _lang));
    } finally {
      nameController.dispose();
      emailController.dispose();
      phoneController.dispose();
      upiController.dispose();
      passwordController.dispose();
      lockPinController.dispose();
    }
  }

  Future<void> _loadData() async {
    final preferences = await SharedPreferences.getInstance();
    final raw = preferences.getString(_storageKey);
    if (raw == null || raw.isEmpty) return;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, Object?>) return;
      final version = _jsonInt(decoded['version']);
      final savedAt = DateTime.tryParse(decoded['savedAt'] as String? ?? '');
      final products = _decodeList(decoded['products'], Product.fromJson);
      final entries = _decodeList(decoded['entries'], LedgerEntry.fromJson);
      final customers = _decodeList(decoded['customers'], Customer.fromJson);
      final customerEntries = _decodeList(
        decoded['customerEntries'],
        CustomerLedgerEntry.fromJson,
      );
      if (!mounted) return;
      setState(() {
        _products = products.isEmpty
            ? _starterProducts()
            : version < _dataVersion
            ? _productsWithStationeryCatalog(products)
            : products;
        _entries
          ..clear()
          ..addAll(entries);
        _customers
          ..clear()
          ..addAll(customers);
        _customerEntries
          ..clear()
          ..addAll(customerEntries);
        _lastBackupAt = savedAt;
      });
    } catch (_) {
      _showSnack(t('restoreFailed', _lang));
    }
  }

  Future<void> _saveData() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_storageKey, _backupJson());
  }

  String _backupJson() {
    const encoder = JsonEncoder.withIndent('  ');
    return encoder.convert({
      'version': _dataVersion,
      'savedAt': DateTime.now().toIso8601String(),
      'products': _products.map((product) => product.toJson()).toList(),
      'entries': _entries.map((entry) => entry.toJson()).toList(),
      'customers': _customers.map((customer) => customer.toJson()).toList(),
      'customerEntries': _customerEntries
          .map((entry) => entry.toJson())
          .toList(),
    });
  }

  Product? _productById(String? id) {
    if (id == null) return null;
    for (final product in _products) {
      if (product.id == id) return product;
    }
    return null;
  }

  double _entryCost(LedgerEntry entry) {
    if (entry.costAmount > 0) return entry.costAmount;
    if (entry.lines.isNotEmpty) {
      return entry.lines.fold(0, (sum, line) => sum + line.costAmount);
    }
    final product = _productById(entry.productId);
    return (product?.buyPrice ?? 0) * entry.quantity;
  }

  double _entryProfit(LedgerEntry entry) {
    if (entry.type != EntryType.saleOut) return 0;
    return (entry.amount - entry.gstAmount) - _entryCost(entry);
  }

  Future<void> _showProductSheet([Product? product]) async {
    if (!_canManage) {
      _showSnack(t('ownerOnly', _lang));
      return;
    }
    final nameController = TextEditingController(text: product?.name ?? '');
    var selectedCategory = product?.category ?? ProductCategory.grocery;
    final imageUrlController = TextEditingController(
      text: product?.imageUrl ?? '',
    );
    final barcodeController = TextEditingController(
      text: product?.barcode ?? '',
    );
    final standardQuantityController = TextEditingController(
      text: product?.standardQuantity ?? '',
    );
    final buyController = TextEditingController(
      text: product == null ? '' : _trimNumber(product.buyPrice),
    );
    final sellController = TextEditingController(
      text: product == null ? '' : _trimNumber(product.sellPrice),
    );
    final gstController = TextEditingController(
      text: product == null ? '0' : _trimNumber(product.gstRate),
    );
    final stockController = TextEditingController(
      text: product == null ? '' : product.stock.toString(),
    );
    final lowStockController = TextEditingController(
      text: (product?.lowStockAlert ?? 5).toString(),
    );

    try {
      final saved = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (context) {
          final bottom = MediaQuery.viewInsetsOf(context).bottom;
          return Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, bottom + 16),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    t('addProduct', _lang),
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: nameController,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      labelText: t('productName', _lang),
                      prefixIcon: const Icon(Icons.inventory_2_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<ProductCategory>(
                    initialValue: selectedCategory,
                    decoration: InputDecoration(
                      labelText: t('category', _lang),
                      prefixIcon: const Icon(Icons.category_outlined),
                    ),
                    items: ProductCategory.values
                        .map(
                          (category) => DropdownMenuItem(
                            value: category,
                            child: Text(_productCategoryLabel(category, _lang)),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      if (value != null) selectedCategory = value;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: imageUrlController,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      labelText: t('imageUrl', _lang),
                      prefixIcon: const Icon(Icons.image_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: barcodeController,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      labelText: t('barcode', _lang),
                      prefixIcon: const Icon(Icons.qr_code_scanner_outlined),
                      suffixIcon: IconButton(
                        tooltip: t('scanBarcode', _lang),
                        onPressed: () => _showSnack(t('scanBarcode', _lang)),
                        icon: const Icon(Icons.center_focus_strong_outlined),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: standardQuantityController,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      labelText: t('standardQuantity', _lang),
                      prefixIcon: const Icon(Icons.scale_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: buyController,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          decoration: InputDecoration(
                            labelText: t('buyPrice', _lang),
                            prefixIcon: const Icon(Icons.shopping_cart),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: sellController,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          decoration: InputDecoration(
                            labelText: t('sellPrice', _lang),
                            prefixIcon: const Icon(Icons.sell_outlined),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: gstController,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: InputDecoration(
                      labelText: t('gstRate', _lang),
                      helperText: '0, 5, 12, 18, 28',
                      prefixIcon: const Icon(Icons.percent_outlined),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: stockController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: t('openingStock', _lang),
                      prefixIcon: const Icon(Icons.pin),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: lowStockController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: t('lowStockAlert', _lang),
                      prefixIcon: const Icon(Icons.warning_amber_outlined),
                    ),
                  ),
                  const SizedBox(height: 20),
                  FilledButton.icon(
                    onPressed: () {
                      final name = nameController.text.trim();
                      final imageUrl = imageUrlController.text.trim();
                      final barcode = barcodeController.text.trim();
                      final standardQuantity = standardQuantityController.text
                          .trim();
                      final buyPrice = _readMoney(buyController.text);
                      final sellPrice = _readMoney(sellController.text);
                      final gstRate = _readMoney(gstController.text) ?? 0;
                      final stock = int.tryParse(stockController.text.trim());
                      final lowStockAlert = int.tryParse(
                        lowStockController.text.trim(),
                      );

                      if (name.isEmpty || standardQuantity.isEmpty) {
                        _showSnack(t('required', _lang));
                        return;
                      }
                      if (buyPrice == null ||
                          sellPrice == null ||
                          gstRate < 0 ||
                          gstRate > 100 ||
                          stock == null ||
                          lowStockAlert == null ||
                          stock < 0) {
                        _showSnack(t('invalidNumber', _lang));
                        return;
                      }

                      _commit(() {
                        if (product == null) {
                          _products.add(
                            Product(
                              id: _newId(),
                              name: name,
                              standardQuantity: standardQuantity,
                              buyPrice: buyPrice,
                              sellPrice: sellPrice,
                              stock: stock,
                              category: selectedCategory,
                              imageUrl: imageUrl,
                              barcode: barcode,
                              gstRate: gstRate,
                              lowStockAlert: lowStockAlert,
                            ),
                          );
                        } else {
                          product
                            ..name = name
                            ..standardQuantity = standardQuantity
                            ..buyPrice = buyPrice
                            ..sellPrice = sellPrice
                            ..stock = stock
                            ..category = selectedCategory
                            ..imageUrl = imageUrl
                            ..barcode = barcode
                            ..gstRate = gstRate
                            ..lowStockAlert = lowStockAlert;
                        }
                      });
                      Navigator.pop(context, true);
                    },
                    icon: const Icon(Icons.check),
                    label: Text(t('save', _lang)),
                  ),
                ],
              ),
            ),
          );
        },
      );

      if (saved == true) _showSnack(t('productSaved', _lang));
    } finally {
      nameController.dispose();
      imageUrlController.dispose();
      barcodeController.dispose();
      standardQuantityController.dispose();
      buyController.dispose();
      sellController.dispose();
      gstController.dispose();
      stockController.dispose();
      lowStockController.dispose();
    }
  }

  void _addEntry(EntryDraft draft) {
    if (draft.type == EntryType.investment) {
      _commit(() {
        _entries.insert(
          0,
          LedgerEntry(
            id: _newId(),
            type: draft.type,
            createdAt: DateTime.now(),
            amount: draft.amount,
            note: draft.note,
          ),
        );
      });
      _showSnack(t('recorded', _lang));
      return;
    }

    if (draft.type == EntryType.saleOut) {
      final saleLines = draft.saleLines;
      if (saleLines.isEmpty) {
        _showSnack(t('selectProduct', _lang));
        return;
      }
      final requestedStock = <String, int>{};
      for (final line in saleLines) {
        requestedStock.update(
          line.productId,
          (quantity) => quantity + line.quantity,
          ifAbsent: () => line.quantity,
        );
      }
      for (final request in requestedStock.entries) {
        final product = _productById(request.key);
        if (product == null) {
          _showSnack(t('selectProduct', _lang));
          return;
        }
        if (product.stock < request.value) {
          _showSnack('${t('notEnoughStock', _lang)} ${product.name}');
          return;
        }
      }
      final customer = draft.customerId != null
          ? _customerById(draft.customerId!)
          : null;
      final taxableAmount = saleLines.fold(
        0.0,
        (sum, line) => sum + line.amount,
      );
      final gstAmount = _gstAmount(taxableAmount, draft.gstRate);
      final amount = taxableAmount + gstAmount;
      final paidAmount = draft.paidAmount.clamp(0, amount).toDouble();
      final dueAmount = amount - paidAmount;
      final costAmount = saleLines.fold(
        0.0,
        (sum, line) => sum + line.costAmount,
      );
      final entryId = _newId();
      final saleEntry = LedgerEntry(
        id: entryId,
        type: draft.type,
        createdAt: DateTime.now(),
        productId: saleLines.length == 1 ? saleLines.first.productId : null,
        productName: saleLines.length == 1
            ? saleLines.first.productName
            : '${saleLines.length} ${t('saleItems', _lang)}',
        customerId: customer?.id,
        customerName: customer?.name,
        customerPhone: customer?.phone,
        quantity: saleLines.fold(0, (sum, line) => sum + line.quantity),
        unitPrice: saleLines.length == 1 ? saleLines.first.unitPrice : 0,
        amount: amount,
        paidAmount: paidAmount,
        gstRate: draft.gstRate,
        gstAmount: gstAmount,
        costAmount: costAmount,
        lines: saleLines,
        note: draft.note,
      );

      _commit(() {
        for (final line in saleLines) {
          final product = _productById(line.productId)!;
          product
            ..stock -= line.quantity
            ..sellPrice = line.unitPrice;
        }
        _entries.insert(0, saleEntry);
        if (customer != null && dueAmount > 0) {
          customer.balance += dueAmount;
          _customerEntries.insert(
            0,
            CustomerLedgerEntry(
              id: _newId(),
              customerId: customer.id,
              customerName: customer.name,
              type: CustomerEntryType.credit,
              createdAt: DateTime.now(),
              amount: dueAmount,
              sourceEntryId: entryId,
              note: saleLines
                  .map((line) => '${line.productName} x ${line.quantity}')
                  .join(', '),
            ),
          );
        }
      });
      _showSnack(t('recorded', _lang));
      if (customer != null && customer.phone.trim().isNotEmpty) {
        unawaited(_shareWhatsAppSaleInvoice(customer, saleEntry));
      }
      return;
    }

    final product = _productById(draft.productId);
    if (product == null) {
      _showSnack(t('selectProduct', _lang));
      return;
    }

    _commit(() {
      product.stock += draft.quantity;
      product.buyPrice = draft.unitPrice;

      final amount = draft.quantity * draft.unitPrice;
      final entryId = _newId();
      _entries.insert(
        0,
        LedgerEntry(
          id: entryId,
          type: draft.type,
          createdAt: DateTime.now(),
          productId: product.id,
          productName: product.name,
          quantity: draft.quantity,
          unitPrice: draft.unitPrice,
          amount: amount,
          note: draft.note,
        ),
      );
    });
    _showSnack(t('recorded', _lang));
  }

  void _deleteProduct(Product product) {
    if (!_canManage) {
      _showSnack(t('ownerOnly', _lang));
      return;
    }
    _commit(() => _products.removeWhere((item) => item.id == product.id));
  }

  void _deleteEntry(LedgerEntry entry) {
    if (!_canManage) {
      _showSnack(t('ownerOnly', _lang));
      return;
    }
    _commit(() {
      _entries.removeWhere((item) => item.id == entry.id);
      if (entry.type == EntryType.saleOut && entry.lines.isNotEmpty) {
        for (final line in entry.lines) {
          final product = _productById(line.productId);
          if (product != null) product.stock += line.quantity;
        }
      } else {
        final product = _productById(entry.productId);
        if (product != null) {
          if (entry.type == EntryType.stockIn) {
            product.stock -= entry.quantity;
          } else if (entry.type == EntryType.saleOut) {
            product.stock += entry.quantity;
          }
        }
      }
      if (entry.type == EntryType.saleOut && entry.customerId != null) {
        final customer = _customerById(entry.customerId!);
        if (customer != null) customer.balance -= entry.dueAmount;
        _customerEntries.removeWhere((item) => item.sourceEntryId == entry.id);
      }
    });
  }

  ReportSummary _buildReportSummary() {
    final now = DateTime.now();
    final entries = _showMonthReport
        ? _entries
              .where(
                (entry) =>
                    entry.createdAt.year == now.year &&
                    entry.createdAt.month == now.month,
              )
              .toList()
        : _todayEntries;
    final sales = entries
        .where((entry) => entry.type == EntryType.saleOut)
        .fold(0.0, (sum, entry) => sum + entry.amount);
    final stockIn = entries
        .where((entry) => entry.type == EntryType.stockIn)
        .fold(0.0, (sum, entry) => sum + entry.amount);
    final investment = entries
        .where((entry) => entry.type == EntryType.investment)
        .fold(0.0, (sum, entry) => sum + entry.amount);
    final profit = entries
        .where((entry) => entry.type == EntryType.saleOut)
        .fold(0.0, (sum, entry) => sum + _entryProfit(entry));
    final gstCollected = entries
        .where((entry) => entry.type == EntryType.saleOut)
        .fold(0.0, (sum, entry) => sum + entry.gstAmount);
    return ReportSummary(
      title: _showMonthReport ? t('month', _lang) : t('today', _lang),
      entries: entries,
      sales: sales,
      stockIn: stockIn,
      investment: investment,
      profit: profit,
      gstCollected: gstCollected,
      inventoryValue: _inventoryValue,
      lowStockProducts: _lowStockProducts,
      customerDue: _customerDue,
    );
  }

  Future<void> _printReport() async {
    final summary = _buildReportSummary();
    await Printing.layoutPdf(
      name: 'hisap-kitab-report.pdf',
      onLayout: (format) => _buildReportPdf(summary, format),
    );
  }

  Future<void> _copyReportCsv() async {
    final summary = _buildReportSummary();
    final rows = <List<String>>[
      ['Report', summary.title],
      ['Sales', money(summary.sales)],
      ['Stock in', money(summary.stockIn)],
      ['Investment', money(summary.investment)],
      ['Profit', money(summary.profit)],
      ['GST collected', money(summary.gstCollected)],
      ['Inventory value', money(summary.inventoryValue)],
      ['Customer due', money(summary.customerDue)],
      [],
      [
        'Date',
        'Type',
        'Customer',
        'Items',
        'Taxable',
        'GST %',
        'GST',
        'Amount',
        'Paid',
        'Due',
        'Note',
      ],
      ...summary.entries.map(
        (entry) => [
          _shortDate(entry.createdAt),
          _entryTypeLabel(entry.type),
          entry.customerName ?? '',
          entry.displayLines.isEmpty
              ? (entry.productName ?? '')
              : entry.displayLines
                    .map((line) => '${line.productName} x ${line.quantity}')
                    .join('; '),
          _trimNumber(
            (entry.amount - entry.gstAmount)
                .clamp(0, double.infinity)
                .toDouble(),
          ),
          entry.gstRate == 0 ? '' : _trimNumber(entry.gstRate),
          entry.gstAmount == 0 ? '' : _trimNumber(entry.gstAmount),
          _trimNumber(entry.amount),
          _trimNumber(entry.paidAmount),
          _trimNumber(entry.dueAmount),
          entry.note,
        ],
      ),
    ];
    final csv = rows.map(_csvRow).join('\n');
    await Clipboard.setData(ClipboardData(text: csv));
    _showSnack(t('backupCopied', _lang));
  }

  Future<void> _printInvoiceText(String title, String invoice) async {
    final document = pw.Document();
    document.addPage(
      pw.MultiPage(
        pageTheme: const pw.PageTheme(margin: pw.EdgeInsets.all(28)),
        build: (context) => [
          pw.Text(
            title,
            style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold),
          ),
          pw.SizedBox(height: 12),
          pw.Text(invoice, style: const pw.TextStyle(fontSize: 10)),
        ],
      ),
    );
    await Printing.layoutPdf(
      name: 'hisap-kitab-invoice.pdf',
      onLayout: (format) async => document.save(),
    );
  }

  Future<void> _copyBackup() async {
    setState(() => _lastBackupAt = DateTime.now());
    await Clipboard.setData(ClipboardData(text: _backupJson()));
    _showSnack(t('backupCopied', _lang));
  }

  Future<void> _showRestoreSheet() async {
    if (!_canManage) {
      _showSnack(t('ownerOnly', _lang));
      return;
    }
    final controller = TextEditingController();
    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (context) {
          final bottom = MediaQuery.viewInsetsOf(context).bottom;
          return Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, bottom + 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  t('pasteBackup', _lang),
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: controller,
                  minLines: 8,
                  maxLines: 12,
                  decoration: InputDecoration(
                    labelText: t('backup', _lang),
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () {
                    if (_restoreBackup(controller.text)) {
                      Navigator.pop(context);
                    }
                  },
                  icon: const Icon(Icons.restore),
                  label: Text(t('restore', _lang)),
                ),
              ],
            ),
          );
        },
      );
    } finally {
      controller.dispose();
    }
  }

  bool _restoreBackup(String raw) {
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, Object?>) throw const FormatException();
      final version = _jsonInt(decoded['version']);
      final products = _decodeList(decoded['products'], Product.fromJson);
      final entries = _decodeList(decoded['entries'], LedgerEntry.fromJson);
      final customers = _decodeList(decoded['customers'], Customer.fromJson);
      final customerEntries = _decodeList(
        decoded['customerEntries'],
        CustomerLedgerEntry.fromJson,
      );
      _commit(() {
        _products = products.isEmpty
            ? _starterProducts()
            : version < _dataVersion
            ? _productsWithStationeryCatalog(products)
            : products;
        _entries
          ..clear()
          ..addAll(entries);
        _customers
          ..clear()
          ..addAll(customers);
        _customerEntries
          ..clear()
          ..addAll(customerEntries);
      });
      _showSnack(t('restoreDone', _lang));
      return true;
    } catch (_) {
      _showSnack(t('restoreFailed', _lang));
      return false;
    }
  }

  Future<void> _showCustomerSheet([Customer? customer]) async {
    if (!_canManage) {
      _showSnack(t('ownerOnly', _lang));
      return;
    }
    final nameController = TextEditingController(text: customer?.name ?? '');
    final phoneController = TextEditingController(text: customer?.phone ?? '');
    final addressController = TextEditingController(
      text: customer?.address ?? '',
    );
    final openingBalanceController = TextEditingController(
      text: customer == null ? '' : _trimNumber(customer.openingBalance),
    );
    try {
      final saved = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (context) {
          final bottom = MediaQuery.viewInsetsOf(context).bottom;
          return Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, bottom + 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  t('addCustomer', _lang),
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: t('customerName', _lang),
                    prefixIcon: const Icon(Icons.person_outline),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: t('phone', _lang),
                    prefixIcon: const Icon(Icons.call_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: addressController,
                  minLines: 2,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: t('address', _lang),
                    prefixIcon: const Icon(Icons.location_on_outlined),
                    alignLabelWithHint: true,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: openingBalanceController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(
                    labelText: t('openingBalance', _lang),
                    prefixIcon: const Icon(
                      Icons.account_balance_wallet_outlined,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () {
                    final name = nameController.text.trim();
                    final openingBalance =
                        openingBalanceController.text.trim().isEmpty
                        ? 0.0
                        : _readMoney(openingBalanceController.text);
                    if (name.isEmpty) {
                      _showSnack(t('required', _lang));
                      return;
                    }
                    if (openingBalance == null) {
                      _showSnack(t('invalidNumber', _lang));
                      return;
                    }
                    _commit(() {
                      if (customer == null) {
                        _customers.add(
                          Customer(
                            id: _newId(),
                            name: name,
                            phone: phoneController.text.trim(),
                            address: addressController.text.trim(),
                            openingBalance: openingBalance,
                            balance: openingBalance,
                          ),
                        );
                      } else {
                        final delta = openingBalance - customer.openingBalance;
                        customer
                          ..name = name
                          ..phone = phoneController.text.trim()
                          ..address = addressController.text.trim()
                          ..openingBalance = openingBalance
                          ..balance += delta;
                      }
                    });
                    Navigator.pop(context, true);
                  },
                  icon: const Icon(Icons.check),
                  label: Text(t('save', _lang)),
                ),
              ],
            ),
          );
        },
      );
      if (saved == true) _showSnack(t('customerSaved', _lang));
    } finally {
      nameController.dispose();
      phoneController.dispose();
      addressController.dispose();
      openingBalanceController.dispose();
    }
  }

  Future<void> _showCustomerEntrySheet([Customer? initialCustomer]) async {
    if (_customers.isEmpty) {
      _showSnack(t('emptyCustomers', _lang));
      return;
    }
    final amountController = TextEditingController();
    final noteController = TextEditingController();
    var type = CustomerEntryType.credit;
    var paymentMethod = CustomerPaymentMethod.cash;
    var customerId = initialCustomer?.id ?? _customers.first.id;
    try {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        showDragHandle: true,
        builder: (context) {
          final bottom = MediaQuery.viewInsetsOf(context).bottom;
          return StatefulBuilder(
            builder: (context, setModalState) {
              return Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, bottom + 16),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        t('addDueEntry', _lang),
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 12),
                      SegmentedButton<CustomerEntryType>(
                        segments: [
                          ButtonSegment(
                            value: CustomerEntryType.credit,
                            icon: const Icon(Icons.add_card_outlined),
                            label: Text(t('credit', _lang)),
                          ),
                          ButtonSegment(
                            value: CustomerEntryType.payment,
                            icon: const Icon(Icons.payments_outlined),
                            label: Text(t('payment', _lang)),
                          ),
                        ],
                        selected: {type},
                        onSelectionChanged: (selection) =>
                            setModalState(() => type = selection.first),
                      ),
                      if (type == CustomerEntryType.payment) ...[
                        const SizedBox(height: 12),
                        SegmentedButton<CustomerPaymentMethod>(
                          segments: [
                            ButtonSegment(
                              value: CustomerPaymentMethod.cash,
                              icon: const Icon(Icons.payments_outlined),
                              label: Text(t('cashPayment', _lang)),
                            ),
                            ButtonSegment(
                              value: CustomerPaymentMethod.card,
                              icon: const Icon(Icons.credit_card_outlined),
                              label: Text(t('cardPayment', _lang)),
                            ),
                            ButtonSegment(
                              value: CustomerPaymentMethod.upi,
                              icon: const Icon(Icons.qr_code_2_outlined),
                              label: Text(t('upiPayment', _lang)),
                            ),
                          ],
                          selected: {paymentMethod},
                          onSelectionChanged: (selection) => setModalState(
                            () => paymentMethod = selection.first,
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        initialValue: customerId,
                        decoration: InputDecoration(
                          labelText: t('chooseCustomer', _lang),
                          prefixIcon: const Icon(Icons.person_outline),
                        ),
                        items: _customers
                            .map(
                              (customer) => DropdownMenuItem(
                                value: customer.id,
                                child: Text(customer.name),
                              ),
                            )
                            .toList(),
                        onChanged: (value) {
                          if (value != null) {
                            setModalState(() => customerId = value);
                          }
                        },
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: amountController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: InputDecoration(
                          labelText: t('amount', _lang),
                          prefixIcon: const Icon(Icons.currency_rupee),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: noteController,
                        decoration: InputDecoration(
                          labelText: t('note', _lang),
                          prefixIcon: const Icon(Icons.notes_outlined),
                        ),
                      ),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: () {
                          final amount = _readMoney(amountController.text);
                          final customer = _customerById(customerId);
                          if (amount == null ||
                              amount <= 0 ||
                              customer == null) {
                            _showSnack(t('invalidNumber', _lang));
                            return;
                          }
                          _commit(() {
                            customer.balance += type == CustomerEntryType.credit
                                ? amount
                                : -amount;
                            _customerEntries.insert(
                              0,
                              CustomerLedgerEntry(
                                id: _newId(),
                                customerId: customer.id,
                                customerName: customer.name,
                                type: type,
                                createdAt: DateTime.now(),
                                amount: amount,
                                paymentMethod: type == CustomerEntryType.payment
                                    ? paymentMethod
                                    : null,
                                note: noteController.text.trim(),
                              ),
                            );
                          });
                          _showSnack(t('dueAdded', _lang));
                          Navigator.pop(context);
                        },
                        icon: const Icon(Icons.save_outlined),
                        label: Text(t('save', _lang)),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      );
    } finally {
      amountController.dispose();
      noteController.dispose();
    }
  }

  Future<void> _showCustomerPaymentQr(Customer customer) async {
    final user = _currentUser;
    final upiId = user?.upiId.trim().isNotEmpty == true
        ? user!.upiId.trim()
        : _defaultUpiId;
    if (upiId.isEmpty) {
      _showSnack(t('setUpiId', _lang));
      await _showProfileSheet();
      return;
    }

    final amount = customer.balance > 0 ? customer.balance : 0.0;
    final paymentUri = _customerPaymentUri(customer, upiId: upiId);

    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t('paymentQr', _lang)),
        content: SizedBox(
          width: 340,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  customer.name,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text('${t('paymentDue', _lang)} ${money(amount)}'),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: QrImageView(
                    data: paymentUri,
                    version: QrVersions.auto,
                    size: 220,
                    backgroundColor: Colors.white,
                    errorCorrectionLevel: QrErrorCorrectLevel.M,
                  ),
                ),
                const SizedBox(height: 12),
                SelectableText(
                  '${t('scanToPay', _lang)}\n$upiId',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                SelectableText(
                  paymentUri,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton.icon(
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: paymentUri));
              if (!context.mounted) return;
              _showSnack(t('paymentLinkCopied', _lang));
            },
            icon: const Icon(Icons.copy_all_outlined),
            label: Text(t('copyPaymentLink', _lang)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(t('cancel', _lang)),
          ),
        ],
      ),
    );
  }

  String _customerInvoiceText(Customer customer) {
    final user = _currentUser;
    final upiId = user?.upiId.trim().isNotEmpty == true
        ? user!.upiId.trim()
        : _defaultUpiId;
    return [
      'hisapkitap - ${t('customerInvoice', _lang)}',
      'Date: ${_shortDate(DateTime.now())}',
      '',
      '${t('customerName', _lang)}: ${customer.name}',
      if (customer.phone.isNotEmpty) '${t('phone', _lang)}: ${customer.phone}',
      if (customer.address.isNotEmpty)
        '${t('address', _lang)}: ${customer.address}',
      '',
      '${t('openingBalance', _lang)}: ${money(customer.openingBalance)}',
      '${t('paymentDue', _lang)}: ${money(customer.balance > 0 ? customer.balance : 0)}',
      '${t('closingBalance', _lang)}: ${money(customer.balance)}',
      '',
      '${t('acceptedPayments', _lang)}: ${t('cashPayment', _lang)}, ${t('cardPayment', _lang)}, ${t('upiPayment', _lang)}',
      '${t('upiId', _lang)}: $upiId',
      '${t('scanToPay', _lang)}: $upiId',
      '',
      '${t('supportContact', _lang)}: $_supportPhone',
      '${t('complaintEmail', _lang)}: $_complaintEmail',
      '${t('storeAddress', _lang)}: $_storeAddress',
    ].join('\n');
  }

  String _saleInvoiceText(Customer customer, LedgerEntry entry) {
    final user = _currentUser;
    final upiId = user?.upiId.trim().isNotEmpty == true
        ? user!.upiId.trim()
        : _defaultUpiId;
    final lines = entry.displayLines;
    return [
      'hisapkitap - ${t('invoice', _lang)}',
      'Bill No: ${entry.id}',
      'Date: ${_shortDate(entry.createdAt)}',
      '',
      '${t('customerName', _lang)}: ${customer.name}',
      if (customer.phone.isNotEmpty) '${t('phone', _lang)}: ${customer.phone}',
      if (customer.address.isNotEmpty)
        '${t('address', _lang)}: ${customer.address}',
      '',
      t('saleItems', _lang),
      if (lines.isEmpty)
        entry.productName ?? t('saleOut', _lang)
      else
        ...lines.map(
          (line) =>
              '${line.productName} (${line.standardQuantity}) x ${line.quantity} = ${money(line.amount)}',
        ),
      '',
      '${t('taxableAmount', _lang)}: ${money((entry.amount - entry.gstAmount).clamp(0, double.infinity).toDouble())}',
      if (entry.gstAmount > 0)
        '${t('gstRate', _lang)}: ${_trimNumber(entry.gstRate)}%',
      if (entry.gstAmount > 0)
        '${t('cgst', _lang)}: ${money(entry.gstAmount / 2)}',
      if (entry.gstAmount > 0)
        '${t('sgst', _lang)}: ${money(entry.gstAmount / 2)}',
      if (entry.gstAmount > 0)
        '${t('gstAmount', _lang)}: ${money(entry.gstAmount)}',
      '${t('totalBill', _lang)}: ${money(entry.amount)}',
      '${t('paidAmount', _lang)}: ${money(entry.paidAmount)}',
      '${t('dueAmount', _lang)}: ${money(entry.dueAmount)}',
      '${t('closingBalance', _lang)}: ${money(customer.balance)}',
      if (entry.note.isNotEmpty) '${t('note', _lang)}: ${entry.note}',
      '',
      '${t('acceptedPayments', _lang)}: ${t('cashPayment', _lang)}, ${t('cardPayment', _lang)}, ${t('upiPayment', _lang)}',
      '${t('upiId', _lang)}: $upiId',
      '',
      '${t('supportContact', _lang)}: $_supportPhone',
      '${t('complaintEmail', _lang)}: $_complaintEmail',
      '${t('storeAddress', _lang)}: $_storeAddress',
    ].join('\n');
  }

  String _customerPaymentUri(Customer customer, {String? upiId}) {
    final user = _currentUser;
    final resolvedUpiId = (upiId ?? user?.upiId.trim() ?? '').trim();
    final amount = customer.balance > 0 ? customer.balance : 0.0;
    final query = <String, String>{
      'pa': resolvedUpiId,
      'pn': user?.name.trim().isNotEmpty == true
          ? user!.name.trim()
          : 'hisapkitap',
      'cu': 'INR',
      'tn': 'Payment from ${customer.name}',
      if (amount > 0) 'am': amount.toStringAsFixed(2),
    };
    return Uri(scheme: 'upi', host: 'pay', queryParameters: query).toString();
  }

  Future<void> _showCustomerInvoice(Customer customer) async {
    final invoice = _customerInvoiceText(customer);
    final user = _currentUser;
    final upiId = user?.upiId.trim().isNotEmpty == true
        ? user!.upiId.trim()
        : _defaultUpiId;
    final paymentUri = _customerPaymentUri(customer, upiId: upiId);
    final paymentDue = customer.balance > 0 ? customer.balance : 0.0;
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(t('customerInvoice', _lang)),
        content: SizedBox(
          width: 420,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SelectableText(invoice),
                const SizedBox(height: 16),
                Text(
                  t('paymentQr', _lang),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    Chip(
                      avatar: const Icon(Icons.payments_outlined, size: 18),
                      label: Text(t('cashPayment', _lang)),
                    ),
                    Chip(
                      avatar: const Icon(Icons.credit_card_outlined, size: 18),
                      label: Text(t('cardPayment', _lang)),
                    ),
                    Chip(
                      avatar: const Icon(Icons.qr_code_2_outlined, size: 18),
                      label: Text(t('upiPayment', _lang)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _inkPanelAlt,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _inkBorder),
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: QrImageView(
                          data: paymentUri,
                          size: 190,
                          backgroundColor: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '${t('payTo', _lang)} $upiId',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      Text(
                        '${t('paymentDue', _lang)} ${money(paymentDue)}',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton.icon(
            onPressed: () async {
              final copied = await _copyInvoiceText(invoice);
              if (!context.mounted) return;
              if (copied) Navigator.pop(context);
            },
            icon: const Icon(Icons.copy_all_outlined),
            label: Text(t('copyInvoice', _lang)),
          ),
          TextButton.icon(
            onPressed: () async {
              await _printInvoiceText(t('customerInvoice', _lang), invoice);
              if (!context.mounted) return;
              Navigator.pop(context);
            },
            icon: const Icon(Icons.print_outlined),
            label: Text(t('printInvoice', _lang)),
          ),
          TextButton.icon(
            onPressed: () async {
              final shared = await _shareWhatsAppInvoice(customer);
              if (!context.mounted) return;
              if (shared) Navigator.pop(context);
            },
            icon: const Icon(Icons.chat_outlined),
            label: Text(t('whatsappInvoice', _lang)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(t('cancel', _lang)),
          ),
        ],
      ),
    );
  }

  Future<bool> _copyInvoiceText(String invoice) async {
    try {
      await Clipboard.setData(ClipboardData(text: invoice));
      _showSnack(t('invoiceCopied', _lang));
      return true;
    } catch (_) {
      _showSnack(t('actionFailed', _lang));
      return false;
    }
  }

  Future<bool> _shareWhatsAppInvoice(Customer customer) async {
    final invoice = _customerInvoiceText(customer);
    return _openWhatsAppInvoice(customer.phone, invoice);
  }

  Future<bool> _shareWhatsAppDueReminder(Customer customer) async {
    final reminder = _customerReminderText(customer);
    return _openWhatsAppInvoice(customer.phone, reminder);
  }

  Future<bool> _shareWhatsAppSaleInvoice(
    Customer customer,
    LedgerEntry entry,
  ) async {
    final invoice = _saleInvoiceText(customer, entry);
    return _openWhatsAppInvoice(customer.phone, invoice);
  }

  Future<bool> _openWhatsAppInvoice(String phoneText, String invoice) async {
    final digits = phoneText.replaceAll(RegExp(r'\D'), '');
    final phone = digits.length == 10 ? '91$digits' : digits;
    final link = phone.isEmpty
        ? Uri.https('wa.me', '/', {'text': invoice}).toString()
        : Uri.https('wa.me', '/$phone', {'text': invoice}).toString();
    try {
      if (await openExternalUrl(link)) {
        _showSnack(t('whatsappOpened', _lang));
        return true;
      }
      await Clipboard.setData(ClipboardData(text: link));
      _showSnack(t('whatsappLinkCopied', _lang));
      return true;
    } catch (_) {
      try {
        await Clipboard.setData(ClipboardData(text: link));
        _showSnack(t('whatsappLinkCopied', _lang));
        return true;
      } catch (_) {
        _showSnack(t('actionFailed', _lang));
        return false;
      }
    }
  }

  String _customerReminderText(Customer customer) {
    final due = customer.balance > 0 ? customer.balance : 0.0;
    return [
      'hisapkitap - ${t('paymentReminder', _lang)}',
      '',
      'Customer: ${customer.name}',
      if (customer.phone.isNotEmpty) 'Phone: ${customer.phone}',
      'Pending amount: ${money(due)}',
      '',
      'Kindly clear the pending amount when convenient. Thank you.',
      if ((_currentUser?.upiId ?? '').trim().isNotEmpty)
        'UPI: ${_currentUser!.upiId.trim()}',
    ].join('\n');
  }

  Customer? _customerById(String id) {
    for (final customer in _customers) {
      if (customer.id == id) return customer;
    }
    return null;
  }

  void _deleteCustomer(Customer customer) {
    if (!_canManage) {
      _showSnack(t('ownerOnly', _lang));
      return;
    }
    _commit(() {
      _customers.removeWhere((item) => item.id == customer.id);
      _customerEntries.removeWhere((entry) => entry.customerId == customer.id);
    });
  }
}

class _LoadingPage extends StatelessWidget {
  const _LoadingPage();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}

class _OtpSendResult {
  const _OtpSendResult(this.success, this.message);

  final bool success;
  final String message;
}

class _NeonGlowIcon extends StatelessWidget {
  const _NeonGlowIcon({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: _teal.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _teal.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: _teal.withValues(alpha: 0.42),
            blurRadius: 16,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Icon(icon, color: _teal, size: 22),
    );
  }
}

class _NeonPanel extends StatelessWidget {
  const _NeonPanel({
    required this.child,
    this.color = _teal,
    this.padding = EdgeInsets.zero,
  });

  final Widget child;
  final Color color;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: _inkPanel,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.28)),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.18),
            blurRadius: 18,
            spreadRadius: -2,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _AppLockPage extends StatefulWidget {
  const _AppLockPage({
    required this.lang,
    required this.user,
    required this.onDeviceUnlock,
    required this.onPinUnlock,
    required this.onSignOut,
  });

  final String lang;
  final AppUser user;
  final Future<bool> Function() onDeviceUnlock;
  final bool Function(String pin) onPinUnlock;
  final Future<void> Function() onSignOut;

  @override
  State<_AppLockPage> createState() => _AppLockPageState();
}

class _AppLockPageState extends State<_AppLockPage> {
  final _pinController = TextEditingController();
  bool _unlocking = false;

  String get _lang => widget.lang;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(18),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: _NeonPanel(
                color: _teal,
                padding: const EdgeInsets.all(22),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(
                      Icons.lock_person_outlined,
                      color: _teal,
                      size: 54,
                    ),
                    const SizedBox(height: 14),
                    Text(
                      t('appLocked', _lang),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      t('appLockHint', _lang),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 22),
                    if (widget.user.deviceLockEnabled) ...[
                      FilledButton.icon(
                        onPressed: _unlocking ? null : _unlockDevice,
                        icon: const Icon(Icons.fingerprint),
                        label: Text(t('unlockDevice', _lang)),
                      ),
                      const SizedBox(height: 12),
                    ],
                    TextField(
                      controller: _pinController,
                      obscureText: true,
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _unlockPin(),
                      decoration: InputDecoration(
                        labelText: t('lockPin', _lang),
                        prefixIcon: const Icon(Icons.pin_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: _unlockPin,
                      icon: const Icon(Icons.lock_open_outlined),
                      label: Text(t('unlock', _lang)),
                    ),
                    const SizedBox(height: 8),
                    TextButton.icon(
                      onPressed: _unlocking ? null : widget.onSignOut,
                      icon: const Icon(Icons.logout),
                      label: Text(t('signOut', _lang)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _unlockDevice() async {
    setState(() => _unlocking = true);
    final unlocked = await widget.onDeviceUnlock();
    if (!mounted) return;
    setState(() => _unlocking = false);
    if (!unlocked) _showMessage(t('unlockFailed', _lang));
  }

  void _unlockPin() {
    final unlocked = widget.onPinUnlock(_pinController.text);
    if (!unlocked) _showMessage(t('unlockFailed', _lang));
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }
}

class _AuthPage extends StatefulWidget {
  const _AuthPage({
    required this.lang,
    required this.onSignIn,
    required this.onSignUp,
    required this.onForgotPassword,
    required this.onResetPassword,
  });

  final String lang;
  final String? Function(String email, String password) onSignIn;
  final String? Function(
    String name,
    String email,
    String phone,
    String password,
  )
  onSignUp;
  final Future<_OtpSendResult> Function(String email, String otp)
  onForgotPassword;
  final String? Function(String email, String password) onResetPassword;

  @override
  State<_AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<_AuthPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _newPasswordConfirmController = TextEditingController();
  AuthMode _mode = AuthMode.signIn;
  bool _hidePassword = true;
  bool _resetOtpSent = false;
  bool _sendingOtp = false;
  String? _pendingResetEmail;
  String? _pendingResetOtp;

  String get _lang => widget.lang;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _newPasswordConfirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width >= 760;
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - 32,
                ),
                child: IntrinsicHeight(
                  child: Flex(
                    direction: isWide ? Axis.horizontal : Axis.vertical,
                    children: [
                      if (isWide)
                        Expanded(flex: 5, child: _AuthBrandPanel(lang: _lang))
                      else
                        _AuthBrandPanel(lang: _lang),
                      SizedBox(width: isWide ? 16 : 0, height: isWide ? 0 : 16),
                      if (isWide)
                        Expanded(flex: 4, child: _buildFormCard(context))
                      else
                        _buildFormCard(context),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildFormCard(BuildContext context) {
    final isSignUp = _mode == AuthMode.signUp;
    final isForgot = _mode == AuthMode.forgotPassword;
    final title = switch (_mode) {
      AuthMode.signIn => t('welcomeBack', _lang),
      AuthMode.signUp => t('createAccount', _lang),
      AuthMode.forgotPassword => t('resetPassword', _lang),
    };
    final actionLabel = switch (_mode) {
      AuthMode.signIn => t('signIn', _lang),
      AuthMode.signUp => t('signUp', _lang),
      AuthMode.forgotPassword =>
        _resetOtpSent ? t('resetPassword', _lang) : t('sendOtp', _lang),
    };

    return _MovingNeonBorder(
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: _teal.withValues(alpha: 0.14),
                  foregroundColor: _teal,
                  child: Icon(Icons.lock_person_outlined),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              isForgot ? t('resetHint', _lang) : t('authSubtitle', _lang),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            if (isSignUp) ...[
              TextField(
                controller: _nameController,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: t('fullName', _lang),
                  prefixIcon: const Icon(Icons.badge_outlined),
                ),
              ),
              const SizedBox(height: 12),
            ],
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              textInputAction: isForgot && !_resetOtpSent
                  ? TextInputAction.done
                  : TextInputAction.next,
              readOnly: isForgot && _resetOtpSent,
              onSubmitted: (_) {
                if (isForgot && !_resetOtpSent) _submit();
              },
              decoration: InputDecoration(
                labelText: t('email', _lang),
                prefixIcon: const Icon(Icons.alternate_email),
              ),
            ),
            if (isForgot && _resetOtpSent && _pendingResetOtp != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _teal.withValues(alpha: 0.12),
                  border: Border.all(color: _teal.withValues(alpha: 0.45)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: SelectableText(
                  t('otpReady', _lang).replaceAll('{otp}', _pendingResetOtp!),
                  style: const TextStyle(
                    color: _teal,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
            if (isSignUp) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: t('phone', _lang),
                  prefixIcon: const Icon(Icons.call_outlined),
                ),
              ),
            ],
            if (!isForgot) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                obscureText: _hidePassword,
                textInputAction: isSignUp
                    ? TextInputAction.next
                    : TextInputAction.done,
                onSubmitted: (_) => _submit(),
                decoration: InputDecoration(
                  labelText: t('password', _lang),
                  helperText: isSignUp ? t('passwordHint', _lang) : null,
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    tooltip: t('password', _lang),
                    onPressed: () =>
                        setState(() => _hidePassword = !_hidePassword),
                    icon: Icon(
                      _hidePassword
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                    ),
                  ),
                ),
              ),
            ],
            if (isForgot && _resetOtpSent) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.next,
                maxLength: 6,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: InputDecoration(
                  labelText: t('otp', _lang),
                  prefixIcon: const Icon(Icons.password_outlined),
                  counterText: '',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _newPasswordController,
                obscureText: _hidePassword,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: t('newPassword', _lang),
                  helperText: t('passwordHint', _lang),
                  prefixIcon: const Icon(Icons.lock_reset),
                  suffixIcon: IconButton(
                    tooltip: t('password', _lang),
                    onPressed: () =>
                        setState(() => _hidePassword = !_hidePassword),
                    icon: Icon(
                      _hidePassword
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _newPasswordConfirmController,
                obscureText: _hidePassword,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _submit(),
                decoration: InputDecoration(
                  labelText: t('confirmPassword', _lang),
                  prefixIcon: const Icon(Icons.lock_outline),
                ),
              ),
            ],
            if (isSignUp) ...[
              const SizedBox(height: 12),
              TextField(
                controller: _confirmPasswordController,
                obscureText: _hidePassword,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _submit(),
                decoration: InputDecoration(
                  labelText: t('confirmPassword', _lang),
                  prefixIcon: const Icon(Icons.lock_reset),
                ),
              ),
            ],
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: _sendingOtp ? null : _submit,
              icon: Icon(
                isForgot
                    ? (_resetOtpSent
                          ? Icons.lock_reset
                          : Icons.mark_email_read_outlined)
                    : Icons.login,
              ),
              label: Text(actionLabel),
            ),
            const SizedBox(height: 10),
            if (_mode == AuthMode.signIn)
              TextButton(
                onPressed: () => _changeMode(AuthMode.forgotPassword),
                child: Text(t('forgotPassword', _lang)),
              ),
            const SizedBox(height: 8),
            _AuthSwitchBar(
              lang: _lang,
              mode: _mode,
              onModeChanged: _changeMode,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      _showMessage(t('required', _lang));
      return;
    }

    String? message;
    if (_mode == AuthMode.forgotPassword) {
      if (!_resetOtpSent) {
        final otp = _generateOtp();
        setState(() => _sendingOtp = true);
        late final _OtpSendResult result;
        try {
          result = await widget.onForgotPassword(email, otp);
        } catch (_) {
          result = _OtpSendResult(
            true,
            t('otpMailFailed', _lang).replaceAll('{otp}', otp),
          );
        }
        if (!mounted) return;
        setState(() => _sendingOtp = false);
        _showMessage(result.message);
        if (result.success) {
          setState(() {
            _resetOtpSent = true;
            _pendingResetEmail = email.trim().toLowerCase();
            _pendingResetOtp = otp;
            _otpController.text = otp;
            _newPasswordController.clear();
            _newPasswordConfirmController.clear();
          });
        }
        return;
      }

      if (_otpController.text.trim() != _pendingResetOtp) {
        _showMessage(t('otpInvalid', _lang));
        return;
      }
      final newPassword = _newPasswordController.text;
      if (newPassword.length < 6) {
        _showMessage(t('passwordHint', _lang));
        return;
      }
      if (newPassword != _newPasswordConfirmController.text) {
        _showMessage(t('passwordMismatch', _lang));
        return;
      }
      message = widget.onResetPassword(
        _pendingResetEmail ?? email,
        newPassword,
      );
      if (message != null) {
        _showMessage(message);
      } else {
        _showMessage(t('passwordResetDone', _lang));
        _changeMode(AuthMode.signIn);
      }
      return;
    }

    final password = _passwordController.text;
    if (password.length < 6) {
      _showMessage(t('passwordHint', _lang));
      return;
    }

    if (_mode == AuthMode.signIn) {
      message = widget.onSignIn(email, password);
    } else {
      if (_nameController.text.trim().isEmpty) {
        _showMessage(t('required', _lang));
        return;
      }
      if (password != _confirmPasswordController.text) {
        _showMessage(t('passwordMismatch', _lang));
        return;
      }
      message = widget.onSignUp(
        _nameController.text,
        email,
        _phoneController.text,
        password,
      );
    }

    if (message != null) _showMessage(message);
  }

  String _generateOtp() {
    final random = Random.secure();
    return List.generate(6, (_) => random.nextInt(10).toString()).join();
  }

  void _changeMode(AuthMode mode) {
    setState(() {
      _mode = mode;
      _resetOtpSent = false;
      _sendingOtp = false;
      _pendingResetEmail = null;
      _pendingResetOtp = null;
      _otpController.clear();
      _newPasswordController.clear();
      _newPasswordConfirmController.clear();
    });
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }
}

class _MovingNeonBorder extends StatefulWidget {
  const _MovingNeonBorder({required this.child});

  final Widget child;

  @override
  State<_MovingNeonBorder> createState() => _MovingNeonBorderState();
}

class _MovingNeonBorderState extends State<_MovingNeonBorder>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2800),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          foregroundPainter: _MovingNeonBorderPainter(_controller.value),
          child: child,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: _inkPanel,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.35),
              blurRadius: 18,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: widget.child,
      ),
    );
  }
}

class _MovingNeonBorderPainter extends CustomPainter {
  const _MovingNeonBorderPainter(this.progress);

  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final rrect = RRect.fromRectAndRadius(
      rect.deflate(2),
      const Radius.circular(8),
    );
    final path = Path()..addRRect(rrect);
    final metrics = path.computeMetrics().toList();
    if (metrics.isEmpty) return;
    final metric = metrics.first;
    final length = metric.length;

    final basePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..color = _inkBorder;
    canvas.drawRRect(rrect, basePaint);

    _drawMovingSegment(canvas, metric, length, progress, _teal, 0.24);
    _drawMovingSegment(
      canvas,
      metric,
      length,
      (progress + 0.52) % 1,
      _rose,
      0.2,
    );
  }

  void _drawMovingSegment(
    Canvas canvas,
    PathMetric metric,
    double length,
    double position,
    Color color,
    double segmentPortion,
  ) {
    final start = position * length;
    final segmentLength = length * segmentPortion;
    final end = start + segmentLength;
    final glowPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round
      ..color = color.withValues(alpha: 0.38)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5);
    final linePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.4
      ..strokeCap = StrokeCap.round
      ..color = color;

    void drawRange(double from, double to) {
      final segment = metric.extractPath(from, to);
      canvas.drawPath(segment, glowPaint);
      canvas.drawPath(segment, linePaint);
    }

    if (end <= length) {
      drawRange(start, end);
    } else {
      drawRange(start, length);
      drawRange(0, end - length);
    }
  }

  @override
  bool shouldRepaint(covariant _MovingNeonBorderPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

class _AuthBrandPanel extends StatelessWidget {
  const _AuthBrandPanel({required this.lang});

  final String lang;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 360),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: _inkPanel,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _inkBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: _amber,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.storefront_outlined, color: _ink),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      t('appName', lang),
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      t('smartLedger', lang),
                      style: const TextStyle(color: _inkMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t('authSubtitle', lang),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 18),
                _AuthFeature(
                  icon: Icons.query_stats,
                  text: t('authFeatureOne', lang),
                ),
                const SizedBox(height: 10),
                _AuthFeature(
                  icon: Icons.cloud_done_outlined,
                  text: t('authFeatureTwo', lang),
                ),
              ],
            ),
          ),
          Row(
            children: [
              _BrandStat(label: t('products', lang), value: '14'),
              const SizedBox(width: 10),
              _BrandStat(label: t('reports', lang), value: 'PDF'),
              const SizedBox(width: 10),
              _BrandStat(label: t('customers', lang), value: 'Due'),
            ],
          ),
        ],
      ),
    );
  }
}

class _AuthFeature extends StatelessWidget {
  const _AuthFeature({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: _amber),
        const SizedBox(width: 10),
        Expanded(
          child: Text(text, style: const TextStyle(color: _inkText)),
        ),
      ],
    );
  }
}

class _BrandStat extends StatelessWidget {
  const _BrandStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: _inkPanelAlt,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: _inkBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 18,
              ),
            ),
            Text(label, style: const TextStyle(color: _inkMuted)),
          ],
        ),
      ),
    );
  }
}

class _AuthSwitchBar extends StatelessWidget {
  const _AuthSwitchBar({
    required this.lang,
    required this.mode,
    required this.onModeChanged,
  });

  final String lang;
  final AuthMode mode;
  final ValueChanged<AuthMode> onModeChanged;

  @override
  Widget build(BuildContext context) {
    final showSignUp = mode != AuthMode.signUp;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _inkPanelAlt,
        border: Border.all(color: _inkBorder),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              showSignUp ? t('newHere', lang) : t('haveAccount', lang),
            ),
          ),
          TextButton(
            onPressed: () =>
                onModeChanged(showSignUp ? AuthMode.signUp : AuthMode.signIn),
            child: Text(showSignUp ? t('signUp', lang) : t('signIn', lang)),
          ),
        ],
      ),
    );
  }
}

class _DashboardPage extends StatelessWidget {
  const _DashboardPage({
    required this.lang,
    required this.todayIncome,
    required this.todayInvestment,
    required this.todayProfit,
    required this.inventoryValue,
    required this.lowStockCount,
    required this.productCount,
    required this.customerDue,
    required this.customers,
    required this.lowStockProducts,
    required this.entries,
    required this.onAddEntry,
    required this.onAddProduct,
  });

  final String lang;
  final double todayIncome;
  final double todayInvestment;
  final double todayProfit;
  final double inventoryValue;
  final int lowStockCount;
  final int productCount;
  final double customerDue;
  final List<Customer> customers;
  final List<Product> lowStockProducts;
  final List<LedgerEntry> entries;
  final VoidCallback onAddEntry;
  final VoidCallback onAddProduct;

  @override
  Widget build(BuildContext context) {
    return _PageShell(
      child: ListView(
        children: [
          _DashboardHero(
            lang: lang,
            netCash: todayIncome - todayInvestment,
            productCount: productCount,
            lowStockCount: lowStockCount,
          ),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth > 900
                  ? 4
                  : constraints.maxWidth > 560
                  ? 2
                  : 1;
              return GridView.count(
                crossAxisCount: columns,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: columns == 1 ? 3.6 : 2.2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _MetricCard(
                    icon: Icons.payments_outlined,
                    label: t('todayIncome', lang),
                    value: money(todayIncome),
                    color: _blue,
                  ),
                  _MetricCard(
                    icon: Icons.savings_outlined,
                    label: t('todayInvest', lang),
                    value: money(todayInvestment),
                    color: _amber,
                  ),
                  _MetricCard(
                    icon: Icons.trending_up,
                    label: t('todayProfit', lang),
                    value: money(todayProfit),
                    color: _teal,
                  ),
                  _MetricCard(
                    icon: Icons.warehouse_outlined,
                    label: t('inventoryValue', lang),
                    value: money(inventoryValue),
                    color: _violet,
                  ),
                  _MetricCard(
                    icon: Icons.account_balance_outlined,
                    label: t('customerDue', lang),
                    value: money(customerDue),
                    color: _rose,
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: onAddEntry,
                  icon: const Icon(Icons.add_chart),
                  label: Text(t('addEntry', lang)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onAddProduct,
                  icon: const Icon(Icons.add_box_outlined),
                  label: Text(t('addProduct', lang)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  _MiniStat(
                    icon: Icons.inventory,
                    label: t('products', lang),
                    value: productCount.toString(),
                  ),
                  const SizedBox(width: 16),
                  _MiniStat(
                    icon: Icons.warning_amber,
                    label: t('lowStock', lang),
                    value: lowStockCount.toString(),
                  ),
                  const SizedBox(width: 16),
                  _MiniStat(
                    icon: Icons.account_balance_wallet_outlined,
                    label: t('netCash', lang),
                    value: money(todayIncome - todayInvestment),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _SectionHeader(label: t('customerDetails', lang)),
          if (customers.isEmpty)
            _EmptyState(
              icon: Icons.people_outline,
              message: t('emptyCustomers', lang),
            )
          else
            ...customers
                .where((customer) => customer.balance != 0)
                .take(4)
                .map(
                  (customer) =>
                      _CustomerSummaryCard(lang: lang, customer: customer),
                ),
          const SizedBox(height: 16),
          _SectionHeader(label: t('lowStockItems', lang)),
          if (lowStockProducts.isEmpty)
            _EmptyState(
              icon: Icons.verified_outlined,
              message: t('noLowStock', lang),
            )
          else
            ...lowStockProducts
                .take(4)
                .map(
                  (product) => Card(
                    child: ListTile(
                      leading: const Icon(Icons.warning_amber_outlined),
                      title: Text(product.name),
                      subtitle: Text(
                        '${t('stock', lang)} ${product.stock}  |  '
                        '${t('lowStockAlert', lang)} ${product.lowStockAlert}',
                      ),
                      trailing: Text(money(product.stock * product.buyPrice)),
                    ),
                  ),
                ),
          const SizedBox(height: 16),
          _SectionHeader(label: t('today', lang)),
          if (entries.isEmpty)
            _EmptyState(
              icon: Icons.receipt_long_outlined,
              message: t('emptyHistory', lang),
            )
          else
            ...entries.take(5).map((entry) => _EntryTile(entry: entry)),
        ],
      ),
    );
  }
}

class _DashboardHero extends StatelessWidget {
  const _DashboardHero({
    required this.lang,
    required this.netCash,
    required this.productCount,
    required this.lowStockCount,
  });

  final String lang;
  final double netCash;
  final int productCount;
  final int lowStockCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: _inkPanel,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _inkBorder),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth < 560;
          return Flex(
            direction: compact ? Axis.vertical : Axis.horizontal,
            crossAxisAlignment: compact
                ? CrossAxisAlignment.start
                : CrossAxisAlignment.center,
            children: [
              if (compact)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      t('workspace', lang),
                      style: const TextStyle(color: _amber),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      t('smartLedger', lang),
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      t('authFeatureOne', lang),
                      style: const TextStyle(color: _inkMuted),
                    ),
                  ],
                )
              else
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        t('workspace', lang),
                        style: const TextStyle(color: _amber),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        t('smartLedger', lang),
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        t('authFeatureOne', lang),
                        style: const TextStyle(color: _inkMuted),
                      ),
                    ],
                  ),
                ),
              SizedBox(width: compact ? 0 : 16, height: compact ? 16 : 0),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _HeroPill(
                    icon: Icons.account_balance_wallet_outlined,
                    label: t('netCash', lang),
                    value: money(netCash),
                  ),
                  _HeroPill(
                    icon: Icons.inventory_2_outlined,
                    label: t('products', lang),
                    value: productCount.toString(),
                  ),
                  _HeroPill(
                    icon: Icons.warning_amber_outlined,
                    label: t('lowStock', lang),
                    value: lowStockCount.toString(),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 150,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _inkPanelAlt,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _inkBorder),
      ),
      child: Row(
        children: [
          Icon(icon, color: _amber, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: _inkMuted, fontSize: 12),
                ),
                Text(
                  value,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CustomerSummaryCard extends StatelessWidget {
  const _CustomerSummaryCard({required this.lang, required this.customer});

  final String lang;
  final Customer customer;

  @override
  Widget build(BuildContext context) {
    final paymentDue = customer.balance > 0 ? customer.balance : 0.0;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: customer.balance > 0
                        ? _amber.withValues(alpha: 0.16)
                        : _teal.withValues(alpha: 0.14),
                    foregroundColor: customer.balance > 0 ? _amber : _teal,
                    child: const Icon(Icons.person_outline),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          customer.name,
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        if (customer.phone.isNotEmpty)
                          Text('${t('phone', lang)}: ${customer.phone}'),
                        if (customer.address.isNotEmpty)
                          Text('${t('address', lang)}: ${customer.address}'),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _BalanceChip(
                    label: t('openingBalance', lang),
                    value: money(customer.openingBalance),
                    color: _blue,
                  ),
                  _BalanceChip(
                    label: t('paymentDue', lang),
                    value: money(paymentDue),
                    color: _amber,
                  ),
                  _BalanceChip(
                    label: t('closingBalance', lang),
                    value: money(customer.balance),
                    color: customer.balance > 0 ? _rose : _teal,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BalanceChip extends StatelessWidget {
  const _BalanceChip({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.labelMedium,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductsPage extends StatelessWidget {
  const _ProductsPage({
    required this.lang,
    required this.products,
    required this.searchText,
    required this.selectedCategory,
    required this.onSearchChanged,
    required this.onCategoryChanged,
    required this.onAddProduct,
    required this.onEditProduct,
    required this.onDeleteProduct,
    required this.canManage,
  });

  final String lang;
  final List<Product> products;
  final String searchText;
  final ProductCategory? selectedCategory;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<ProductCategory?> onCategoryChanged;
  final VoidCallback onAddProduct;
  final ValueChanged<Product> onEditProduct;
  final ValueChanged<Product> onDeleteProduct;
  final bool canManage;

  @override
  Widget build(BuildContext context) {
    return _PageShell(
      child: Column(
        children: [
          TextFormField(
            initialValue: searchText,
            onChanged: onSearchChanged,
            decoration: InputDecoration(
              labelText: t('searchProducts', lang),
              prefixIcon: const Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilterChip(
                  selected: selectedCategory == null,
                  label: Text(t('all', lang)),
                  onSelected: (_) => onCategoryChanged(null),
                ),
                ...ProductCategory.values.map(
                  (category) => FilterChip(
                    selected: selectedCategory == category,
                    avatar: Icon(_productCategoryIcon(category), size: 18),
                    label: Text(_productCategoryLabel(category, lang)),
                    onSelected: (_) => onCategoryChanged(category),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: products.isEmpty
                ? _EmptyState(
                    icon: Icons.inventory_2_outlined,
                    message: t('emptyProducts', lang),
                    action: FilledButton.icon(
                      onPressed: canManage ? onAddProduct : null,
                      icon: const Icon(Icons.add),
                      label: Text(t('addProduct', lang)),
                    ),
                  )
                : ListView.separated(
                    itemCount: products.length,
                    separatorBuilder: (_, index) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      final isLow = product.stock <= product.lowStockAlert;
                      return Card(
                        child: ListTile(
                          leading: _ProductImageThumb(
                            product: product,
                            isLow: isLow,
                          ),
                          title: Text(product.name),
                          subtitle: Text(
                            [
                              '${t('category', lang)} ${_productCategoryLabel(product.category, lang)}',
                              if (product.barcode.isNotEmpty)
                                '${t('barcode', lang)} ${product.barcode}',
                              '${t('standardQuantity', lang)} ${product.standardQuantity}',
                              '${t('gstRate', lang)} ${_trimNumber(product.gstRate)}%',
                              '${t('mrp', lang)} ${money(product.sellPrice)}',
                              '${t('lowStockAlert', lang)} ${product.lowStockAlert}',
                            ].join('  |  '),
                          ),
                          trailing: Wrap(
                            spacing: 4,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Chip(
                                visualDensity: VisualDensity.compact,
                                label: Text(
                                  '${t('stock', lang)} ${product.stock}',
                                ),
                              ),
                              IconButton(
                                tooltip: t('edit', lang),
                                onPressed: canManage
                                    ? () => onEditProduct(product)
                                    : null,
                                icon: const Icon(Icons.edit_outlined),
                              ),
                              IconButton(
                                tooltip: t('delete', lang),
                                onPressed: canManage
                                    ? () => onDeleteProduct(product)
                                    : null,
                                icon: const Icon(Icons.delete_outline),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _ProductImageThumb extends StatelessWidget {
  const _ProductImageThumb({required this.product, required this.isLow});

  final Product product;
  final bool isLow;

  @override
  Widget build(BuildContext context) {
    final fallback = CircleAvatar(
      backgroundColor: isLow
          ? _amber.withValues(alpha: 0.16)
          : _teal.withValues(alpha: 0.14),
      foregroundColor: isLow ? _amber : _teal,
      child: Icon(
        isLow
            ? Icons.warning_amber_outlined
            : _productCategoryIcon(product.category),
      ),
    );
    if (product.imageUrl.trim().isEmpty) return fallback;

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 48,
        height: 48,
        color: Colors.white,
        child: Image.network(
          product.imageUrl,
          fit: BoxFit.contain,
          errorBuilder: (_, _, _) => fallback,
        ),
      ),
    );
  }
}

class _EntryPage extends StatelessWidget {
  const _EntryPage({
    required this.lang,
    required this.products,
    required this.customers,
    required this.onEntryCreated,
  });

  final String lang;
  final List<Product> products;
  final List<Customer> customers;
  final ValueChanged<EntryDraft> onEntryCreated;

  @override
  Widget build(BuildContext context) {
    return _PageShell(
      child: ListView(
        children: [
          _SectionHeader(label: t('quickEntry', lang)),
          _EntryComposer(
            lang: lang,
            products: products,
            customers: customers,
            onEntryCreated: onEntryCreated,
          ),
        ],
      ),
    );
  }
}

class _EntryComposer extends StatefulWidget {
  const _EntryComposer({
    required this.lang,
    required this.products,
    required this.customers,
    required this.onEntryCreated,
  });

  final String lang;
  final List<Product> products;
  final List<Customer> customers;
  final ValueChanged<EntryDraft> onEntryCreated;

  @override
  State<_EntryComposer> createState() => _EntryComposerState();
}

class _EntryComposerState extends State<_EntryComposer> {
  final _quantityController = TextEditingController(text: '1');
  final _priceController = TextEditingController();
  final _amountController = TextEditingController();
  final _paidController = TextEditingController();
  final _gstController = TextEditingController(text: '0');
  final _noteController = TextEditingController();
  final List<SaleLine> _saleLines = [];
  EntryType _type = EntryType.saleOut;
  String? _productId;
  String? _customerId;
  bool _suppressControllerSync = false;

  Product? get _selectedProduct {
    for (final product in widget.products) {
      if (product.id == _productId) return product;
    }
    return null;
  }

  Customer? get _selectedCustomer {
    for (final customer in widget.customers) {
      if (customer.id == _customerId) return customer;
    }
    return null;
  }

  @override
  void initState() {
    super.initState();
    _quantityController.addListener(_syncAmountFromQuantity);
    _priceController.addListener(_syncAmountFromQuantity);
    _selectFirstAvailableProduct(updateUi: false);
  }

  @override
  void didUpdateWidget(covariant _EntryComposer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.products.isNotEmpty &&
        !widget.products.any((product) => product.id == _productId)) {
      _selectFirstAvailableProduct();
    }
    if (_customerId != null &&
        !widget.customers.any((customer) => customer.id == _customerId)) {
      setState(() => _customerId = null);
    }
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _priceController.dispose();
    _amountController.dispose();
    _paidController.dispose();
    _gstController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.lang;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SegmentedButton<EntryType>(
              segments: [
                ButtonSegment(
                  value: EntryType.stockIn,
                  icon: const Icon(Icons.input),
                  label: Text(t('stockIn', lang)),
                ),
                ButtonSegment(
                  value: EntryType.saleOut,
                  icon: const Icon(Icons.output),
                  label: Text(t('saleOut', lang)),
                ),
                ButtonSegment(
                  value: EntryType.investment,
                  icon: const Icon(Icons.savings_outlined),
                  label: Text(t('investment', lang)),
                ),
              ],
              selected: {_type},
              onSelectionChanged: (selection) {
                setState(() {
                  _type = selection.first;
                  if (_type != EntryType.saleOut) {
                    _saleLines.clear();
                    _paidController.clear();
                  }
                  _fillPrice();
                });
              },
            ),
            const SizedBox(height: 16),
            if (_type != EntryType.investment) ...[
              DropdownButtonFormField<String>(
                initialValue: _productId,
                isExpanded: true,
                decoration: InputDecoration(
                  labelText: t('product', lang),
                  prefixIcon: const Icon(Icons.inventory_2_outlined),
                ),
                items: widget.products
                    .map(
                      (product) => DropdownMenuItem(
                        value: product.id,
                        child: Text(
                          [
                            _productCategoryLabel(product.category, lang),
                            product.name,
                            product.standardQuantity,
                            if (product.barcode.isNotEmpty)
                              '${t('barcode', lang)} ${product.barcode}',
                            '${t('gstRate', lang)} ${_trimNumber(product.gstRate)}%',
                            '${t('stock', lang)} ${product.stock}',
                          ].join(' - '),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  setState(() {
                    _productId = value;
                    _fillPrice();
                  });
                },
              ),
              if (_type == EntryType.saleOut) ...[
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _customerId,
                  decoration: InputDecoration(
                    labelText: t('chooseCustomer', lang),
                    helperText: t('customerOptional', lang),
                    prefixIcon: const Icon(Icons.person_outline),
                  ),
                  items: [
                    DropdownMenuItem(
                      value: '',
                      child: Text(t('walkInCustomer', lang)),
                    ),
                    ...widget.customers.map(
                      (customer) => DropdownMenuItem(
                        value: customer.id,
                        child: Text(
                          [
                            customer.name,
                            if (customer.phone.isNotEmpty) customer.phone,
                          ].join(' - '),
                        ),
                      ),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _customerId = value == null || value.isEmpty
                          ? null
                          : value;
                    });
                  },
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _quantityController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: t('quantity', lang),
                        prefixIcon: const Icon(Icons.numbers),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _priceController,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: InputDecoration(
                        labelText: t('unitPrice', lang),
                        helperText: t('priceHint', lang),
                        prefixIcon: const Icon(Icons.currency_rupee),
                      ),
                    ),
                  ),
                ],
              ),
              if (_type == EntryType.saleOut) ...[
                const SizedBox(height: 12),
                TextField(
                  controller: _gstController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  onChanged: (_) {
                    _syncPaidDefault(force: true);
                    setState(() {});
                  },
                  decoration: InputDecoration(
                    labelText: t('gstRate', lang),
                    helperText: 'Enter 0, 5, 12, 18 or 28',
                    prefixIcon: const Icon(Icons.percent_outlined),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final rate in const [0, 5, 12, 18, 28])
                      ChoiceChip(
                        label: Text('$rate%'),
                        selected:
                            (_readMoney(_gstController.text) ?? 0) == rate,
                        onSelected: (_) {
                          setState(() {
                            _gstController.text = rate.toString();
                            _syncPaidDefault(force: true);
                          });
                        },
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _addSaleLine,
                  icon: const Icon(Icons.playlist_add),
                  label: Text(t('addItem', lang)),
                ),
                if (_saleLines.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _SaleLinesList(
                    lang: lang,
                    lines: _saleLines,
                    onRemove: (index) {
                      setState(() {
                        _saleLines.removeAt(index);
                        _syncPaidDefault();
                      });
                    },
                  ),
                ],
                const SizedBox(height: 12),
                TextField(
                  controller: _paidController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(
                    labelText: t('paidAmount', lang),
                    prefixIcon: const Icon(Icons.payments_outlined),
                  ),
                ),
              ],
            ] else
              TextField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: InputDecoration(
                  labelText: t('amount', lang),
                  prefixIcon: const Icon(Icons.currency_rupee),
                ),
              ),
            const SizedBox(height: 12),
            TextField(
              controller: _noteController,
              decoration: InputDecoration(
                labelText: t('note', lang),
                prefixIcon: const Icon(Icons.notes_outlined),
              ),
            ),
            const SizedBox(height: 16),
            _LivePreview(
              lang: lang,
              type: _type,
              product: _selectedProduct,
              customer: _selectedCustomer,
              quantityText: _quantityController.text,
              priceText: _priceController.text,
              amountText: _amountController.text,
              paidText: _paidController.text,
              gstRateText: _gstController.text,
              lines: _saleLines,
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _submit,
              icon: const Icon(Icons.save_outlined),
              label: Text(t('addEntry', lang)),
            ),
          ],
        ),
      ),
    );
  }

  void _selectFirstAvailableProduct({bool updateUi = true}) {
    if (widget.products.isEmpty) return;
    void update() {
      _productId = widget.products.first.id;
      _fillPrice(updateUi: false);
    }

    if (updateUi && mounted) {
      setState(update);
    } else {
      update();
    }
  }

  void _fillPrice({bool updateUi = true}) {
    final product = _selectedProduct;
    if (_type == EntryType.investment) return;
    final price = _type == EntryType.stockIn
        ? product?.buyPrice ?? 0
        : product?.sellPrice ?? 0;
    _suppressControllerSync = true;
    _priceController.text = price == 0 ? '' : _trimNumber(price);
    if (_type == EntryType.saleOut) {
      _gstController.text = _trimNumber(product?.gstRate ?? 0);
    }
    _suppressControllerSync = false;
    _syncAmountFromQuantity(updateUi: updateUi);
  }

  void _syncAmountFromQuantity({bool updateUi = true}) {
    if (_suppressControllerSync) return;
    if (_type == EntryType.investment) return;
    final quantity = int.tryParse(_quantityController.text.trim()) ?? 0;
    final unitPrice = _readMoney(_priceController.text) ?? 0;
    final total = quantity * unitPrice;
    _amountController.text = total == 0 ? '' : _trimNumber(total);
    if (updateUi && mounted) setState(() {});
  }

  SaleLine? _currentSaleLine() {
    final product = _selectedProduct;
    final quantity = int.tryParse(_quantityController.text.trim());
    final unitPrice = _readMoney(_priceController.text);
    if (product == null || quantity == null || quantity <= 0) return null;
    if (unitPrice == null || unitPrice <= 0) return null;
    return SaleLine(
      productId: product.id,
      productName: product.name,
      standardQuantity: product.standardQuantity,
      quantity: quantity,
      unitPrice: unitPrice,
      buyPriceAtSale: product.buyPrice,
    );
  }

  void _addSaleLine() {
    final line = _currentSaleLine();
    if (line == null) {
      _showComposerSnack(context, t('invalidNumber', widget.lang));
      return;
    }
    final product = _selectedProduct;
    final alreadyQueued = _saleLines
        .where((item) => item.productId == line.productId)
        .fold(0, (sum, item) => sum + item.quantity);
    if (product != null && product.stock < alreadyQueued + line.quantity) {
      _showComposerSnack(context, t('notEnoughStock', widget.lang));
      return;
    }
    setState(() {
      final existingIndex = _saleLines.indexWhere(
        (item) =>
            item.productId == line.productId &&
            item.unitPrice == line.unitPrice &&
            item.buyPriceAtSale == line.buyPriceAtSale,
      );
      if (existingIndex == -1) {
        _saleLines.add(line);
      } else {
        final existing = _saleLines[existingIndex];
        _saleLines[existingIndex] = SaleLine(
          productId: existing.productId,
          productName: existing.productName,
          standardQuantity: existing.standardQuantity,
          quantity: existing.quantity + line.quantity,
          unitPrice: existing.unitPrice,
          buyPriceAtSale: existing.buyPriceAtSale,
        );
      }
      _quantityController.text = '1';
      _syncPaidDefault();
    });
  }

  List<SaleLine>? _saleLinesForSubmit() {
    if (_saleLines.isNotEmpty) return List<SaleLine>.of(_saleLines);
    final line = _currentSaleLine();
    return line == null ? null : [line];
  }

  void _syncPaidDefault({bool force = false}) {
    if (!force && _paidController.text.trim().isNotEmpty) return;
    final taxable = _saleLines.fold(0.0, (sum, line) => sum + line.amount);
    final total =
        taxable + _gstAmount(taxable, _readMoney(_gstController.text) ?? 0);
    if (total > 0) _paidController.text = _trimNumber(total);
  }

  void _submit() {
    final lang = widget.lang;

    if (_type == EntryType.investment) {
      final amount = _readMoney(_amountController.text);
      if (amount == null || amount <= 0) {
        _showComposerSnack(context, t('invalidNumber', lang));
        return;
      }
      widget.onEntryCreated(
        EntryDraft(
          type: _type,
          amount: amount,
          note: _noteController.text.trim(),
        ),
      );
      _amountController.clear();
      _noteController.clear();
      return;
    }

    if (_type == EntryType.saleOut) {
      final lines = _saleLinesForSubmit();
      if (lines == null || lines.isEmpty) {
        _showComposerSnack(context, t('selectProduct', lang));
        return;
      }
      for (final line in lines) {
        Product? product;
        for (final item in widget.products) {
          if (item.id == line.productId) {
            product = item;
            break;
          }
        }
        if (product != null && product.stock < line.quantity) {
          _showComposerSnack(context, t('notEnoughStock', lang));
          return;
        }
      }
      final gstRate = _readMoney(_gstController.text) ?? 0;
      if (gstRate < 0 || gstRate > 100) {
        _showComposerSnack(context, t('invalidNumber', lang));
        return;
      }
      final taxable = lines.fold(0.0, (sum, line) => sum + line.amount);
      final total = taxable + _gstAmount(taxable, gstRate);
      final paidAmount = _paidController.text.trim().isEmpty
          ? total
          : _readMoney(_paidController.text);
      if (paidAmount == null || paidAmount < 0 || paidAmount > total) {
        _showComposerSnack(context, t('invalidNumber', lang));
        return;
      }
      widget.onEntryCreated(
        EntryDraft(
          type: _type,
          customerId: _customerId,
          saleLines: lines,
          paidAmount: paidAmount,
          gstRate: gstRate,
          note: _noteController.text.trim(),
        ),
      );
      setState(() {
        _saleLines.clear();
        _paidController.clear();
        _gstController.text = '0';
      });
      _quantityController.text = '1';
      _noteController.clear();
      _fillPrice();
      return;
    }

    if (_productId == null) {
      _showComposerSnack(context, t('selectProduct', lang));
      return;
    }

    final quantity = int.tryParse(_quantityController.text.trim());
    final unitPrice = _readMoney(_priceController.text);
    if (quantity == null ||
        quantity <= 0 ||
        unitPrice == null ||
        unitPrice <= 0) {
      _showComposerSnack(context, t('invalidNumber', lang));
      return;
    }

    widget.onEntryCreated(
      EntryDraft(
        type: _type,
        productId: _productId,
        customerId: _type == EntryType.saleOut ? _customerId : null,
        quantity: quantity,
        unitPrice: unitPrice,
        note: _noteController.text.trim(),
      ),
    );
    _quantityController.text = '1';
    _noteController.clear();
    _fillPrice();
  }
}

class EntryDraft {
  EntryDraft({
    required this.type,
    this.productId,
    this.customerId,
    this.quantity = 0,
    this.unitPrice = 0,
    this.amount = 0,
    this.paidAmount = 0,
    this.gstRate = 0,
    this.saleLines = const [],
    this.note = '',
  });

  final EntryType type;
  final String? productId;
  final String? customerId;
  final int quantity;
  final double unitPrice;
  final double amount;
  final double paidAmount;
  final double gstRate;
  final List<SaleLine> saleLines;
  final String note;
}

class ReportSummary {
  const ReportSummary({
    required this.title,
    required this.entries,
    required this.sales,
    required this.stockIn,
    required this.investment,
    required this.profit,
    required this.gstCollected,
    required this.inventoryValue,
    required this.lowStockProducts,
    required this.customerDue,
  });

  final String title;
  final List<LedgerEntry> entries;
  final double sales;
  final double stockIn;
  final double investment;
  final double profit;
  final double gstCollected;
  final double inventoryValue;
  final List<Product> lowStockProducts;
  final double customerDue;
}

class _HistoryPage extends StatelessWidget {
  const _HistoryPage({
    required this.lang,
    required this.entries,
    required this.showTodayOnly,
    required this.searchText,
    required this.onToggleFilter,
    required this.onSearchChanged,
    required this.onDeleteEntry,
    required this.canManage,
  });

  final String lang;
  final List<LedgerEntry> entries;
  final bool showTodayOnly;
  final String searchText;
  final ValueChanged<bool> onToggleFilter;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<LedgerEntry> onDeleteEntry;
  final bool canManage;

  @override
  Widget build(BuildContext context) {
    return _PageShell(
      child: Column(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: SegmentedButton<bool>(
              segments: [
                ButtonSegment(
                  value: true,
                  icon: const Icon(Icons.today),
                  label: Text(t('today', lang)),
                ),
                ButtonSegment(
                  value: false,
                  icon: const Icon(Icons.list_alt),
                  label: Text(t('all', lang)),
                ),
              ],
              selected: {showTodayOnly},
              onSelectionChanged: (selection) =>
                  onToggleFilter(selection.first),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            initialValue: searchText,
            onChanged: onSearchChanged,
            decoration: InputDecoration(
              labelText: t('searchHistory', lang),
              prefixIcon: const Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: entries.isEmpty
                ? _EmptyState(
                    icon: Icons.receipt_long_outlined,
                    message: t('emptyHistory', lang),
                  )
                : ListView.separated(
                    itemCount: entries.length,
                    separatorBuilder: (_, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final entry = entries[index];
                      return _EntryTile(
                        entry: entry,
                        trailing: IconButton(
                          tooltip: t('delete', lang),
                          onPressed: canManage
                              ? () => onDeleteEntry(entry)
                              : null,
                          icon: const Icon(Icons.delete_outline),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _ReportsPage extends StatelessWidget {
  const _ReportsPage({
    required this.lang,
    required this.summary,
    required this.showMonth,
    required this.onRangeChanged,
    required this.onPrintReport,
    required this.onCopyReport,
    required this.onCopyBackup,
    required this.onRestoreBackup,
    required this.lastBackupAt,
    required this.canManage,
  });

  final String lang;
  final ReportSummary summary;
  final bool showMonth;
  final ValueChanged<bool> onRangeChanged;
  final VoidCallback onPrintReport;
  final VoidCallback onCopyReport;
  final VoidCallback onCopyBackup;
  final VoidCallback onRestoreBackup;
  final DateTime? lastBackupAt;
  final bool canManage;

  @override
  Widget build(BuildContext context) {
    return _PageShell(
      child: ListView(
        children: [
          SegmentedButton<bool>(
            segments: [
              ButtonSegment(
                value: false,
                icon: const Icon(Icons.today),
                label: Text(t('today', lang)),
              ),
              ButtonSegment(
                value: true,
                icon: const Icon(Icons.calendar_month_outlined),
                label: Text(t('month', lang)),
              ),
            ],
            selected: {showMonth},
            onSelectionChanged: (selection) => onRangeChanged(selection.first),
          ),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth > 760 ? 3 : 2;
              final cardRatio = columns == 3
                  ? 2.2
                  : constraints.maxWidth < 430
                  ? 1.35
                  : 1.65;
              return GridView.count(
                crossAxisCount: columns,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: cardRatio,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _MetricCard(
                    icon: Icons.point_of_sale_outlined,
                    label: t('sales', lang),
                    value: money(summary.sales),
                    color: _blue,
                  ),
                  _MetricCard(
                    icon: Icons.input,
                    label: t('stockInTotal', lang),
                    value: money(summary.stockIn),
                    color: _amber,
                  ),
                  _MetricCard(
                    icon: Icons.trending_up,
                    label: t('profit', lang),
                    value: money(summary.profit),
                    color: _teal,
                  ),
                  _MetricCard(
                    icon: Icons.percent_outlined,
                    label: t('gstAmount', lang),
                    value: money(summary.gstCollected),
                    color: _amber,
                  ),
                  _MetricCard(
                    icon: Icons.savings_outlined,
                    label: t('invest', lang),
                    value: money(summary.investment),
                    color: _violet,
                  ),
                  _MetricCard(
                    icon: Icons.warehouse_outlined,
                    label: t('inventoryValue', lang),
                    value: money(summary.inventoryValue),
                    color: _blue,
                  ),
                  _MetricCard(
                    icon: Icons.account_balance_outlined,
                    label: t('totalDue', lang),
                    value: money(summary.customerDue),
                    color: _rose,
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          _NeonPanel(
            color: _teal,
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                const Icon(Icons.cloud_done_outlined, color: _teal),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '${t('autoBackup', lang)}: ${t('backupSavedLocally', lang)}'
                    '${lastBackupAt == null ? '' : ' - ${_shortDateTime(lastBackupAt!)}'}',
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              FilledButton.icon(
                onPressed: onPrintReport,
                icon: const Icon(Icons.print_outlined),
                label: Text(t('printReport', lang)),
              ),
              OutlinedButton.icon(
                onPressed: onCopyReport,
                icon: const Icon(Icons.table_chart_outlined),
                label: Text(t('copyReport', lang)),
              ),
              OutlinedButton.icon(
                onPressed: onCopyBackup,
                icon: const Icon(Icons.copy_all_outlined),
                label: Text(t('copyBackup', lang)),
              ),
              OutlinedButton.icon(
                onPressed: canManage ? onRestoreBackup : null,
                icon: const Icon(Icons.restore_outlined),
                label: Text(t('restore', lang)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SectionHeader(label: t('lowStockItems', lang)),
          if (summary.lowStockProducts.isEmpty)
            _EmptyState(
              icon: Icons.verified_outlined,
              message: t('noLowStock', lang),
            )
          else
            ...summary.lowStockProducts.map(
              (product) => Card(
                child: ListTile(
                  leading: const Icon(Icons.warning_amber_outlined),
                  title: Text(product.name),
                  subtitle: Text(
                    '${t('stock', lang)} ${product.stock}  |  '
                    '${t('lowStockAlert', lang)} ${product.lowStockAlert}',
                  ),
                  trailing: Text(money(product.stock * product.buyPrice)),
                ),
              ),
            ),
          const SizedBox(height: 16),
          _SectionHeader(label: t('history', lang)),
          if (summary.entries.isEmpty)
            _EmptyState(
              icon: Icons.receipt_long_outlined,
              message: t('emptyHistory', lang),
            )
          else
            ...summary.entries.take(8).map((entry) => _EntryTile(entry: entry)),
        ],
      ),
    );
  }
}

class _CustomersPage extends StatelessWidget {
  const _CustomersPage({
    required this.lang,
    required this.customers,
    required this.entries,
    required this.searchText,
    required this.onSearchChanged,
    required this.onAddCustomer,
    required this.onEditCustomer,
    required this.onDeleteCustomer,
    required this.onAddCustomerEntry,
    required this.onShowPaymentQr,
    required this.onShowInvoice,
    required this.onShareWhatsAppInvoice,
    required this.onShareWhatsAppReminder,
    required this.canManage,
  });

  final String lang;
  final List<Customer> customers;
  final List<CustomerLedgerEntry> entries;
  final String searchText;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onAddCustomer;
  final ValueChanged<Customer> onEditCustomer;
  final ValueChanged<Customer> onDeleteCustomer;
  final ValueChanged<Customer?> onAddCustomerEntry;
  final ValueChanged<Customer> onShowPaymentQr;
  final ValueChanged<Customer> onShowInvoice;
  final ValueChanged<Customer> onShareWhatsAppInvoice;
  final ValueChanged<Customer> onShareWhatsAppReminder;
  final bool canManage;

  @override
  Widget build(BuildContext context) {
    return _PageShell(
      child: Column(
        children: [
          TextFormField(
            initialValue: searchText,
            onChanged: onSearchChanged,
            decoration: InputDecoration(
              labelText: t('customers', lang),
              prefixIcon: const Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: canManage ? onAddCustomer : null,
                  icon: const Icon(Icons.person_add_alt),
                  label: Text(t('addCustomer', lang)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => onAddCustomerEntry(null),
                  icon: const Icon(Icons.add_card_outlined),
                  label: Text(t('addDueEntry', lang)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: customers.isEmpty
                ? _EmptyState(
                    icon: Icons.people_outline,
                    message: t('emptyCustomers', lang),
                  )
                : ListView(
                    children: [
                      ...customers.map(
                        (customer) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Card(
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: customer.balance > 0
                                    ? _amber.withValues(alpha: 0.16)
                                    : _teal.withValues(alpha: 0.14),
                                foregroundColor: customer.balance > 0
                                    ? _amber
                                    : _teal,
                                child: const Icon(Icons.person_outline),
                              ),
                              title: Text(customer.name),
                              subtitle: Text(
                                [
                                  if (customer.phone.isNotEmpty) customer.phone,
                                  if (customer.address.isNotEmpty)
                                    customer.address,
                                  '${t('openingBalance', lang)} ${money(customer.openingBalance)}',
                                  '${t('paymentDue', lang)} ${money(customer.balance > 0 ? customer.balance : 0)}',
                                  '${t('closingBalance', lang)} ${money(customer.balance)}',
                                ].join('  |  '),
                              ),
                              trailing: Wrap(
                                spacing: 4,
                                children: [
                                  IconButton(
                                    tooltip: t('addDueEntry', lang),
                                    onPressed: () =>
                                        onAddCustomerEntry(customer),
                                    icon: const Icon(Icons.add_card_outlined),
                                  ),
                                  IconButton(
                                    tooltip: t('paymentQr', lang),
                                    onPressed: () => onShowPaymentQr(customer),
                                    icon: const Icon(Icons.qr_code_2_outlined),
                                  ),
                                  IconButton(
                                    tooltip: t('invoice', lang),
                                    onPressed: () => onShowInvoice(customer),
                                    icon: const Icon(
                                      Icons.receipt_long_outlined,
                                    ),
                                  ),
                                  IconButton(
                                    tooltip: t('whatsappInvoice', lang),
                                    onPressed: () =>
                                        onShareWhatsAppInvoice(customer),
                                    icon: const Icon(Icons.chat_outlined),
                                  ),
                                  IconButton(
                                    tooltip: t('whatsappReminder', lang),
                                    onPressed: customer.balance > 0
                                        ? () =>
                                              onShareWhatsAppReminder(customer)
                                        : null,
                                    icon: const Icon(
                                      Icons.notification_important_outlined,
                                    ),
                                  ),
                                  IconButton(
                                    tooltip: t('edit', lang),
                                    onPressed: canManage
                                        ? () => onEditCustomer(customer)
                                        : null,
                                    icon: const Icon(Icons.edit_outlined),
                                  ),
                                  IconButton(
                                    tooltip: t('delete', lang),
                                    onPressed: canManage
                                        ? () => onDeleteCustomer(customer)
                                        : null,
                                    icon: const Icon(Icons.delete_outline),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      if (entries.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        _SectionHeader(label: t('history', lang)),
                        ...entries
                            .take(8)
                            .map(
                              (entry) => Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: _CustomerEntryTile(entry: entry),
                              ),
                            ),
                      ],
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _CustomerEntryTile extends StatelessWidget {
  const _CustomerEntryTile({required this.entry});

  final CustomerLedgerEntry entry;

  @override
  Widget build(BuildContext context) {
    final isCredit = entry.type == CustomerEntryType.credit;
    return _NeonPanel(
      color: isCredit ? _amber : _teal,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isCredit
              ? _amber.withValues(alpha: 0.16)
              : _teal.withValues(alpha: 0.14),
          foregroundColor: isCredit ? _amber : _teal,
          child: Icon(isCredit ? Icons.add_card_outlined : Icons.payments),
        ),
        title: Text(entry.customerName),
        subtitle: Text(
          [
            isCredit ? 'Credit' : 'Payment',
            if (entry.paymentMethod != null)
              _paymentMethodLabel(entry.paymentMethod!),
            _shortDate(entry.createdAt),
            if (entry.note.isNotEmpty) entry.note,
          ].join('  |  '),
        ),
        trailing: Text(
          money(entry.amount),
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}

class _HelpDeskPage extends StatelessWidget {
  const _HelpDeskPage({required this.lang});

  final String lang;

  @override
  Widget build(BuildContext context) {
    return _PageShell(
      child: ListView(
        children: [
          _SectionHeader(label: t('helpDesk', lang)),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'hisapkitap ${t('contactSupport', lang)}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _SupportTile(
                    icon: Icons.support_agent_outlined,
                    label: t('supportContact', lang),
                    value: _supportPhone,
                  ),
                  _SupportTile(
                    icon: Icons.mail_outline,
                    label: t('complaintEmail', lang),
                    value: _complaintEmail,
                  ),
                  _SupportTile(
                    icon: Icons.storefront_outlined,
                    label: t('storeAddress', lang),
                    value: _storeAddress,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Example',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'For payment or invoice issues, send the customer name, phone number, due amount, and a screenshot of the problem to the complaint email ID.',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SupportTile extends StatelessWidget {
  const _SupportTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: _teal),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: Theme.of(context).textTheme.labelLarge),
                SelectableText(
                  value,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SaleLinesList extends StatelessWidget {
  const _SaleLinesList({
    required this.lang,
    required this.lines,
    required this.onRemove,
  });

  final String lang;
  final List<SaleLine> lines;
  final ValueChanged<int> onRemove;

  @override
  Widget build(BuildContext context) {
    final total = lines.fold(0.0, (sum, line) => sum + line.amount);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _inkPanelAlt,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _inkBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  t('saleItems', lang),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Text(
                money(total),
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...lines.indexed.map((item) {
            final index = item.$1;
            final line = item.$2;
            return ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              title: Text(line.productName),
              subtitle: Text(
                [
                  if (line.standardQuantity.isNotEmpty) line.standardQuantity,
                  '${line.quantity} x ${money(line.unitPrice)}',
                ].join('  |  '),
              ),
              trailing: Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 4,
                children: [
                  Text(
                    money(line.amount),
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  IconButton(
                    tooltip: t('removeItem', lang),
                    onPressed: () => onRemove(index),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _LivePreview extends StatelessWidget {
  const _LivePreview({
    required this.lang,
    required this.type,
    required this.product,
    required this.customer,
    required this.quantityText,
    required this.priceText,
    required this.amountText,
    required this.paidText,
    required this.gstRateText,
    required this.lines,
  });

  final String lang;
  final EntryType type;
  final Product? product;
  final Customer? customer;
  final String quantityText;
  final String priceText;
  final String amountText;
  final String paidText;
  final String gstRateText;
  final List<SaleLine> lines;

  @override
  Widget build(BuildContext context) {
    final quantity = int.tryParse(quantityText.trim()) ?? 0;
    final price = _readMoney(priceText) ?? 0;
    final draftAmount = quantity * price;
    final double taxableAmount = type == EntryType.investment
        ? (_readMoney(amountText) ?? 0)
        : type == EntryType.saleOut && lines.isNotEmpty
        ? lines.fold(0.0, (sum, line) => sum + line.amount)
        : draftAmount;
    final double gstRate = type == EntryType.saleOut
        ? (_readMoney(gstRateText) ?? 0)
        : 0.0;
    final gstAmount = _gstAmount(taxableAmount, gstRate);
    final amount = taxableAmount + gstAmount;
    final paid =
        _readMoney(paidText) ?? (type == EntryType.saleOut ? amount : 0);
    final stockAfter = product == null
        ? null
        : type == EntryType.stockIn
        ? product!.stock + quantity
        : product!.stock - quantity;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _teal.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _teal.withValues(alpha: 0.22)),
      ),
      child: Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          if (type == EntryType.saleOut && customer != null)
            _PreviewItem(label: t('customerName', lang), value: customer!.name),
          if (type != EntryType.investment && product != null)
            _PreviewItem(label: t('product', lang), value: product!.name),
          if (type != EntryType.investment)
            _PreviewItem(
              label: t('itemWiseBill', lang),
              value: type == EntryType.saleOut && lines.isNotEmpty
                  ? '${lines.length} ${t('saleItems', lang)}'
                  : '$quantity x ${money(price)}',
            ),
          _PreviewItem(
            label: type == EntryType.saleOut
                ? t('taxableAmount', lang)
                : t('amount', lang),
            value: money(taxableAmount),
          ),
          if (type == EntryType.saleOut) ...[
            _PreviewItem(
              label: t('gst', lang),
              value: '${_trimNumber(gstRate)}% = ${money(gstAmount)}',
            ),
            _PreviewItem(label: t('cgst', lang), value: money(gstAmount / 2)),
            _PreviewItem(label: t('sgst', lang), value: money(gstAmount / 2)),
            _PreviewItem(label: t('totalBill', lang), value: money(amount)),
            _PreviewItem(label: t('paidAmount', lang), value: money(paid)),
            _PreviewItem(
              label: t('dueAmount', lang),
              value: money(
                (amount - paid).clamp(0, double.infinity).toDouble(),
              ),
            ),
          ],
          if (stockAfter != null)
            _PreviewItem(
              label: t('stockAfter', lang),
              value: stockAfter.toString(),
            ),
        ],
      ),
    );
  }
}

class _PreviewItem extends StatelessWidget {
  const _PreviewItem({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 120, maxWidth: 210),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelMedium),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

class _EntryTile extends StatelessWidget {
  const _EntryTile({required this.entry, this.trailing});

  final LedgerEntry entry;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final color = switch (entry.type) {
      EntryType.stockIn => _amber,
      EntryType.saleOut => _blue,
      EntryType.investment => _violet,
    };
    final icon = switch (entry.type) {
      EntryType.stockIn => Icons.input,
      EntryType.saleOut => Icons.output,
      EntryType.investment => Icons.savings_outlined,
    };
    final typeLabel = _entryTypeLabel(entry.type);
    final lines = entry.displayLines;
    final productLabel = entry.type == EntryType.saleOut && lines.length > 1
        ? '${lines.length} ${t('saleItems', 'en')}'
        : entry.productName ?? typeLabel;
    final itemLabel = lines.length > 1
        ? lines
              .map((line) => '${line.productName} x ${line.quantity}')
              .join(', ')
        : null;

    return _NeonPanel(
      color: color,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.12),
          foregroundColor: color,
          child: Icon(icon),
        ),
        title: Text(productLabel),
        subtitle: Text(
          [
            typeLabel,
            if ((entry.customerName ?? '').isNotEmpty)
              'Customer ${entry.customerName}',
            if ((entry.customerPhone ?? '').isNotEmpty)
              'Phone ${entry.customerPhone}',
            ?itemLabel,
            if (entry.quantity > 0) 'Qty ${entry.totalQuantity}',
            if (entry.unitPrice > 0) 'Price ${money(entry.unitPrice)}',
            if (entry.type == EntryType.saleOut)
              'Paid ${money(entry.paidAmount)}',
            if (entry.type == EntryType.saleOut && entry.dueAmount > 0)
              'Due ${money(entry.dueAmount)}',
            if (entry.note.isNotEmpty) entry.note,
          ].join('  |  '),
        ),
        trailing:
            trailing ??
            Text(
              money(entry.amount),
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return _NeonPanel(
      color: color,
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: color.withValues(alpha: 0.12),
            foregroundColor: color,
            child: Icon(icon),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelLarge,
                ),
                const SizedBox(height: 4),
                SizedBox(
                  height: 32,
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      value,
                      maxLines: 1,
                      style: Theme.of(context).textTheme.headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: Theme.of(context).textTheme.labelMedium),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    value,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.message, this.action});

  final IconData icon;
  final String message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 44, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            if (action != null) ...[const SizedBox(height: 16), action!],
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        label,
        style: Theme.of(
          context,
        ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
      ),
    );
  }
}

class _PageShell extends StatelessWidget {
  const _PageShell({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(padding: const EdgeInsets.all(16), child: child),
    );
  }
}

class _NavItem {
  const _NavItem(this.icon, this.selectedIcon, this.label);

  final IconData icon;
  final IconData selectedIcon;
  final String label;
}

List<_NavItem> _navDestinations(String lang) => [
  _NavItem(Icons.dashboard_outlined, Icons.dashboard, t('dashboard', lang)),
  _NavItem(Icons.inventory_2_outlined, Icons.inventory_2, t('products', lang)),
  _NavItem(Icons.add_chart_outlined, Icons.add_chart, t('entries', lang)),
  _NavItem(Icons.receipt_long_outlined, Icons.receipt_long, t('history', lang)),
  _NavItem(Icons.assessment_outlined, Icons.assessment, t('reports', lang)),
  _NavItem(Icons.people_outline, Icons.people, t('customers', lang)),
  _NavItem(
    Icons.support_agent_outlined,
    Icons.support_agent,
    t('helpDesk', lang),
  ),
];

String t(String key, String languageCode) {
  return _text[languageCode]?[key] ?? _text['en']![key] ?? key;
}

String money(double value) {
  final sign = value < 0 ? '-' : '';
  final number = value.abs();
  final fixed = number.toStringAsFixed(number % 1 == 0 ? 0 : 2);
  return '$sign₹$fixed';
}

double _gstAmount(double taxableAmount, double gstRate) {
  if (taxableAmount <= 0 || gstRate <= 0) return 0;
  return taxableAmount * gstRate / 100;
}

String _trimNumber(double value) {
  return value % 1 == 0 ? value.toStringAsFixed(0) : value.toStringAsFixed(2);
}

double? _readMoney(String value) {
  return double.tryParse(value.trim().replaceAll(',', ''));
}

String _newId() => DateTime.now().microsecondsSinceEpoch.toString();

bool _isSameDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}

String _entryTypeLabel(EntryType type) {
  return switch (type) {
    EntryType.stockIn => 'Stock in',
    EntryType.saleOut => 'Sale out',
    EntryType.investment => 'Investment',
  };
}

String _paymentMethodLabel(CustomerPaymentMethod method) {
  return switch (method) {
    CustomerPaymentMethod.cash => 'Cash',
    CustomerPaymentMethod.card => 'Card',
    CustomerPaymentMethod.upi => 'UPI',
  };
}

String _productCategoryLabel(ProductCategory category, String languageCode) {
  return switch (category) {
    ProductCategory.grocery => t('groceryItem', languageCode),
    ProductCategory.stationery => t('stationeryItem', languageCode),
    ProductCategory.cosmetic => t('cosmeticItem', languageCode),
  };
}

IconData _productCategoryIcon(ProductCategory category) {
  return switch (category) {
    ProductCategory.grocery => Icons.shopping_basket_outlined,
    ProductCategory.stationery => Icons.edit_note_outlined,
    ProductCategory.cosmetic => Icons.spa_outlined,
  };
}

String _shortDate(DateTime value) {
  return '${value.day.toString().padLeft(2, '0')}/'
      '${value.month.toString().padLeft(2, '0')}/${value.year}';
}

String _shortDateTime(DateTime value) {
  final hour = value.hour.toString().padLeft(2, '0');
  final minute = value.minute.toString().padLeft(2, '0');
  return '${_shortDate(value)} $hour:$minute';
}

String _userRoleLabel(UserRole role, String languageCode) {
  return role == UserRole.owner
      ? t('ownerRole', languageCode)
      : t('staffRole', languageCode);
}

String _csvRow(List<String> cells) {
  return cells
      .map((cell) => '"${cell.replaceAll('"', '""').replaceAll('\n', ' ')}"')
      .join(',');
}

int _jsonInt(Object? value, {int fallback = 0}) {
  if (value is int) return value;
  if (value is num) return value.round();
  if (value is String) return int.tryParse(value) ?? fallback;
  return fallback;
}

double _jsonDouble(Object? value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? fallback;
  return fallback;
}

List<T> _decodeList<T>(
  Object? value,
  T Function(Map<String, Object?> json) fromJson,
) {
  if (value is! List) return [];
  return [
    for (final item in value)
      if (item is Map)
        fromJson(Map<String, Object?>.from(item.cast<String, Object?>())),
  ];
}

Future<Uint8List> _buildReportPdf(
  ReportSummary summary,
  PdfPageFormat format,
) async {
  final document = pw.Document();
  document.addPage(
    pw.MultiPage(
      pageFormat: format,
      build: (context) => [
        pw.Text(
          'hisapkitap - ${summary.title} Report',
          style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold),
        ),
        pw.SizedBox(height: 16),
        pw.Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            _pdfMetric('Sales', money(summary.sales)),
            _pdfMetric('Stock in', money(summary.stockIn)),
            _pdfMetric('Investment', money(summary.investment)),
            _pdfMetric('Profit', money(summary.profit)),
            _pdfMetric('GST', money(summary.gstCollected)),
            _pdfMetric('Inventory', money(summary.inventoryValue)),
            _pdfMetric('Customer due', money(summary.customerDue)),
          ],
        ),
        pw.SizedBox(height: 20),
        pw.Text(
          'Low stock',
          style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold),
        ),
        pw.SizedBox(height: 8),
        if (summary.lowStockProducts.isEmpty)
          pw.Text('No low-stock items.')
        else
          pw.TableHelper.fromTextArray(
            headers: ['Product', 'Stock', 'Alert', 'Value'],
            data: summary.lowStockProducts
                .map(
                  (product) => [
                    product.name,
                    product.stock.toString(),
                    product.lowStockAlert.toString(),
                    money(product.stock * product.buyPrice),
                  ],
                )
                .toList(),
          ),
        pw.SizedBox(height: 20),
        pw.Text(
          'Recent entries',
          style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold),
        ),
        pw.SizedBox(height: 8),
        if (summary.entries.isEmpty)
          pw.Text('No entries.')
        else
          pw.TableHelper.fromTextArray(
            headers: [
              'Date',
              'Type',
              'Customer',
              'Product',
              'Qty',
              'Price',
              'GST',
              'Amount',
              'Paid',
              'Due',
              'Note',
            ],
            data: summary.entries
                .take(30)
                .map(
                  (entry) => [
                    _shortDate(entry.createdAt),
                    _entryTypeLabel(entry.type),
                    [
                      if ((entry.customerName ?? '').isNotEmpty)
                        entry.customerName,
                      if ((entry.customerPhone ?? '').isNotEmpty)
                        entry.customerPhone,
                    ].join(' / '),
                    entry.displayLines.length > 1
                        ? entry.displayLines
                              .map(
                                (line) =>
                                    '${line.productName} x ${line.quantity}',
                              )
                              .join(', ')
                        : entry.productName ?? '',
                    entry.totalQuantity == 0
                        ? ''
                        : entry.totalQuantity.toString(),
                    entry.unitPrice == 0 ? '' : money(entry.unitPrice),
                    entry.gstAmount == 0
                        ? ''
                        : '${_trimNumber(entry.gstRate)}% ${money(entry.gstAmount)}',
                    money(entry.amount),
                    entry.paidAmount == 0 ? '' : money(entry.paidAmount),
                    entry.dueAmount == 0 ? '' : money(entry.dueAmount),
                    entry.note,
                  ],
                )
                .toList(),
          ),
      ],
    ),
  );
  return document.save();
}

pw.Widget _pdfMetric(String label, String value) {
  return pw.Container(
    width: 150,
    padding: const pw.EdgeInsets.all(10),
    decoration: pw.BoxDecoration(border: pw.Border.all(color: PdfColors.grey)),
    child: pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(label, style: const pw.TextStyle(fontSize: 10)),
        pw.SizedBox(height: 4),
        pw.Text(
          value,
          style: pw.TextStyle(fontSize: 15, fontWeight: pw.FontWeight.bold),
        ),
      ],
    ),
  );
}

void _showComposerSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
  );
}
