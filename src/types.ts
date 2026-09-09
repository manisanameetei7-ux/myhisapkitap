export type EntryType = 'stockIn' | 'saleOut' | 'investment';
export type CustomerEntryType = 'credit' | 'debit' | 'payment';
export type CustomerPaymentMethod = 'cash' | 'card' | 'upi' | 'bank';
export type ProductCategory =
  | 'grocery'
  | 'stationery'
  | 'cosmetic'
  | 'beverages'
  | 'household'
  | 'personalCare'
  | 'electronics'
  | 'other';
export type UserRole = 'owner' | 'staff';
export type LanguageCode = 'en' | 'as' | 'bn' | 'hi';

export interface Product {
  id: string;
  name: string;
  standardQuantity: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  category: ProductCategory;
  imageUrl?: string;
  barcode?: string;
  gstRate: number;
  lowStockAlert: number;
}

export interface SaleLine {
  productId: string;
  productName: string;
  standardQuantity: string;
  quantity: number;
  unitPrice: number;
  buyPriceAtSale: number;
}

export interface LedgerEntry {
  id: string;
  type: EntryType;
  createdAt: string; // ISO date string
  productId?: string;
  productName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  paidAmount: number;
  dueAmount?: number;
  gstRate: number;
  gstAmount: number;
  costAmount: number;
  lines: SaleLine[];
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  openingBalance: number;
  balance: number;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  type: CustomerEntryType;
  createdAt: string; // ISO date string
  amount: number;
  sourceEntryId?: string;
  paymentMethod?: CustomerPaymentMethod;
  note?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  storeName?: string;
  upiId?: string;
  password?: string;
  role: UserRole;
  appLockEnabled: boolean;
  lockPin: string;
}

export interface StoreInfo {
  name: string;
  tagline?: string;
  address?: string;
  supportPhone?: string;
  complaintEmail?: string;
  defaultUpiId?: string;
}

export interface ReportSummary {
  periodLabel: string;
  totalSales: number;
  totalInvestment: number;
  totalStockInCost: number;
  grossProfit: number;
  customerDue: number;
  netCash: number;
  totalEntriesCount: number;
  salesCount: number;
}
