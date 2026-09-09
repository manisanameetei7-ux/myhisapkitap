import { Product, LedgerEntry, Customer, CustomerLedgerEntry, AppUser, LanguageCode } from '../types';
import { STARTER_PRODUCTS, STARTER_CUSTOMERS, DEFAULT_USER, INITIAL_ENTRIES, INITIAL_CUSTOMER_ENTRIES } from '../data/starterData';
import { getMatchingProductImage } from '../data/productImagePresets';

const KEYS = {
  PRODUCTS: 'hisap_kitap_products_v1',
  ENTRIES: 'hisap_kitap_entries_v1',
  CUSTOMERS: 'hisap_kitap_customers_v1',
  CUSTOMER_ENTRIES: 'hisap_kitap_customer_entries_v1',
  USERS: 'hisap_kitap_users_v1',
  CURRENT_USER: 'hisap_kitap_current_user_v1',
  LANGUAGE: 'hisap_kitap_lang_v1',
  LAST_BACKUP: 'hisap_kitap_last_backup_v1',
};

export function getStoredLanguage(): LanguageCode {
  const lang = localStorage.getItem(KEYS.LANGUAGE);
  if (lang === 'en' || lang === 'as' || lang === 'bn' || lang === 'hi') {
    return lang;
  }
  return 'en';
}

export function saveStoredLanguage(lang: LanguageCode): void {
  localStorage.setItem(KEYS.LANGUAGE, lang);
}

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    if (!raw) {
      saveStoredProducts(STARTER_PRODUCTS);
      return STARTER_PRODUCTS;
    }
    const stored: Product[] = JSON.parse(raw);
    const starterMap = new Map<string, Product>(STARTER_PRODUCTS.map((p) => [p.id, p]));

    // Upgrade existing stored products with updated authentic images
    let hasChanges = false;
    const upgraded = stored.map((p) => {
      const starterMatch = starterMap.get(p.id);
      if (starterMatch && starterMatch.imageUrl && p.imageUrl !== starterMatch.imageUrl) {
        hasChanges = true;
        return {
          ...p,
          imageUrl: starterMatch.imageUrl,
          name: p.name || starterMatch.name,
        };
      }
      
      const matchedImg = getMatchingProductImage(p.name, p.category);
      if (!p.imageUrl || (matchedImg && p.imageUrl.startsWith('https://images.unsplash.com/photo-') && p.imageUrl !== matchedImg)) {
        // If it was matching a key staple or had no image, apply the accurate asset image
        const query = p.name.toLowerCase();
        if (
          query.includes('poha') ||
          query.includes('besan') ||
          query.includes('sabudana') ||
          query.includes('suji') ||
          query.includes('rava') ||
          query.includes('vermicelli') ||
          query.includes('sevai') ||
          query.includes('oats') ||
          query.includes('atta') ||
          query.includes('basmati')
        ) {
          hasChanges = true;
          return {
            ...p,
            imageUrl: matchedImg,
          };
        }
      }

      if (!p.imageUrl) {
        hasChanges = true;
        return {
          ...p,
          imageUrl: getMatchingProductImage(p.name, p.category),
        };
      }
      return p;
    });

    // Merge any new starter items
    const existingIds = new Set(upgraded.map((p) => p.id));
    const newStarterItems = STARTER_PRODUCTS.filter((p) => !existingIds.has(p.id));
    if (newStarterItems.length > 0) {
      const merged = [...upgraded, ...newStarterItems];
      saveStoredProducts(merged);
      return merged;
    }

    if (hasChanges) {
      saveStoredProducts(upgraded);
    }
    return upgraded;
  } catch (e) {
    console.error('Error loading products from storage:', e);
    return STARTER_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

export function getStoredEntries(): LedgerEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.ENTRIES);
    if (!raw) {
      saveStoredEntries(INITIAL_ENTRIES);
      return INITIAL_ENTRIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading entries:', e);
    return INITIAL_ENTRIES;
  }
}

export function saveStoredEntries(entries: LedgerEntry[]): void {
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
}

export function getStoredCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOMERS);
    if (!raw) {
      saveStoredCustomers(STARTER_CUSTOMERS);
      return STARTER_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading customers:', e);
    return STARTER_CUSTOMERS;
  }
}

export function saveStoredCustomers(customers: Customer[]): void {
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
}

export function getStoredCustomerEntries(): CustomerLedgerEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOMER_ENTRIES);
    if (!raw) {
      saveStoredCustomerEntries(INITIAL_CUSTOMER_ENTRIES);
      return INITIAL_CUSTOMER_ENTRIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading customer entries:', e);
    return INITIAL_CUSTOMER_ENTRIES;
  }
}

export function saveStoredCustomerEntries(entries: CustomerLedgerEntry[]): void {
  localStorage.setItem(KEYS.CUSTOMER_ENTRIES, JSON.stringify(entries));
}

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) {
      saveStoredUsers([DEFAULT_USER]);
      return [DEFAULT_USER];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading users:', e);
    return [DEFAULT_USER];
  }
}

export function saveStoredUsers(users: AppUser[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export function getStoredCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) {
      saveStoredCurrentUser(DEFAULT_USER);
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading current user:', e);
    return DEFAULT_USER;
  }
}

export function saveStoredCurrentUser(user: AppUser | null): void {
  if (!user) {
    localStorage.removeItem(KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

export function getLastBackupDate(): string | null {
  return localStorage.getItem(KEYS.LAST_BACKUP);
}

export function setLastBackupDate(): void {
  localStorage.setItem(KEYS.LAST_BACKUP, new Date().toISOString());
}

export interface FullBackupPayload {
  version: number;
  exportDate: string;
  appName: string;
  products: Product[];
  entries: LedgerEntry[];
  customers: Customer[];
  customerEntries: CustomerLedgerEntry[];
  users: AppUser[];
}

export function exportFullBackup(): string {
  const payload: FullBackupPayload = {
    version: 7,
    exportDate: new Date().toISOString(),
    appName: 'hisapkitap',
    products: getStoredProducts(),
    entries: getStoredEntries(),
    customers: getStoredCustomers(),
    customerEntries: getStoredCustomerEntries(),
    users: getStoredUsers(),
  };
  setLastBackupDate();
  return JSON.stringify(payload, null, 2);
}

export function importFullBackup(jsonString: string): { success: boolean; message?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || (!data.products && !data.entries && !data.customers)) {
      return { success: false, message: 'Invalid backup structure. Missing core collections.' };
    }
    if (Array.isArray(data.products)) {
      saveStoredProducts(data.products);
    }
    if (Array.isArray(data.entries)) {
      saveStoredEntries(data.entries);
    }
    if (Array.isArray(data.customers)) {
      saveStoredCustomers(data.customers);
    }
    if (Array.isArray(data.customerEntries)) {
      saveStoredCustomerEntries(data.customerEntries);
    }
    if (Array.isArray(data.users) && data.users.length > 0) {
      saveStoredUsers(data.users);
      saveStoredCurrentUser(data.users[0]);
    }
    setLastBackupDate();
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Invalid JSON file' };
  }
}
