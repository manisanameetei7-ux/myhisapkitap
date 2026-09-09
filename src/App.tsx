import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Products } from './components/Products';
import { QuickEntry } from './components/QuickEntry';
import { History } from './components/History';
import { Reports } from './components/Reports';
import { Customers } from './components/Customers';
import { HelpDesk } from './components/HelpDesk';

// Modals
import { AuthModal, AppLockModal } from './components/modals/AuthModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { ProductModal } from './components/modals/ProductModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { CustomerEntryModal } from './components/modals/CustomerEntryModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { PaymentQrModal } from './components/modals/PaymentQrModal';
import { RestoreModal } from './components/modals/RestoreModal';
import { PublishModal } from './components/modals/PublishModal';
import { TutorialManualPdfModal } from './components/modals/TutorialManualPdfModal';

// Types & Data
import {
  Product,
  LedgerEntry,
  Customer,
  CustomerLedgerEntry,
  AppUser,
  LanguageCode,
} from './types';
import {
  getStoredLanguage,
  saveStoredLanguage,
  getStoredProducts,
  saveStoredProducts,
  getStoredEntries,
  saveStoredEntries,
  getStoredCustomers,
  saveStoredCustomers,
  getStoredCustomerEntries,
  saveStoredCustomerEntries,
  getStoredUsers,
  saveStoredUsers,
  getStoredCurrentUser,
  saveStoredCurrentUser,
} from './utils/storage';
import { isSameDay } from './utils/formatters';
import { DEFAULT_STORE_INFO } from './data/starterData';

export const App: React.FC = () => {
  // Global State
  const [lang, setLang] = useState<LanguageCode>(() => getStoredLanguage());
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [entries, setEntries] = useState<LedgerEntry[]>(() => getStoredEntries());
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredCustomers());
  const [customerEntries, setCustomerEntries] = useState<CustomerLedgerEntry[]>(() =>
    getStoredCustomerEntries()
  );
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getStoredCurrentUser());

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // App Security Lock
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const user = getStoredCurrentUser();
    return Boolean(user?.appLockEnabled);
  });

  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCustomerEntryModalOpen, setIsCustomerEntryModalOpen] = useState(false);
  const [selectedCustomerForEntry, setSelectedCustomerForEntry] = useState<Customer | null>(null);
  const [customerEntryDefaultType, setCustomerEntryDefaultType] = useState<'credit' | 'debit'>('credit');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceEntry, setInvoiceEntry] = useState<LedgerEntry | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrCustomer, setQrCustomer] = useState<Customer | null>(null);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isPdfManualOpen, setIsPdfManualOpen] = useState(false);

  // Sync Language
  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    saveStoredLanguage(newLang);
  };

  // Sync User Changes
  const handleUpdateUser = (updated: AppUser) => {
    const nextUsers = users.map((u) => (u.id === updated.id ? updated : u));
    setUsers(nextUsers);
    saveStoredUsers(nextUsers);
    setCurrentUser(updated);
    saveStoredCurrentUser(updated);
  };

  const handleCreateUser = (newUser: AppUser) => {
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveStoredUsers(nextUsers);
  };

  const handleSignIn = (user: AppUser) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    setIsLocked(false);
  };

  const handleSignOut = () => {
    setIsAuthOpen(true);
  };

  // Computed Financials
  const today = new Date();

  const todayEntries = useMemo(() => {
    return entries.filter((e) => isSameDay(e.createdAt, today));
  }, [entries]);

  const todayIncome = useMemo(() => {
    return todayEntries
      .filter((e) => e.type === 'saleOut')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [todayEntries]);

  const todayProfit = useMemo(() => {
    return todayEntries
      .filter((e) => e.type === 'saleOut')
      .reduce((sum, e) => sum + (e.amount - e.costAmount), 0);
  }, [todayEntries]);

  const todayInvestment = useMemo(() => {
    return todayEntries
      .filter((e) => e.type === 'stockIn' || e.type === 'investment')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [todayEntries]);

  const netCash = todayIncome - todayInvestment;

  const inventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock * p.buyPrice, 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= p.lowStockAlert);
  }, [products]);

  // Operations: Products
  const handleSaveProduct = (product: Product) => {
    const exists = products.some((p) => p.id === product.id);
    let next: Product[];
    if (exists) {
      next = products.map((p) => (p.id === product.id ? product : p));
    } else {
      next = [product, ...products];
    }
    setProducts(next);
    saveStoredProducts(next);
  };

  const handleDeleteProduct = (productId: string) => {
    const next = products.filter((p) => p.id !== productId);
    setProducts(next);
    saveStoredProducts(next);
  };

  // Operations: Ledger Entries (Sale Out, Stock In, Expense)
  const handleAddEntry = (entryData: Omit<LedgerEntry, 'id' | 'createdAt'>) => {
    const newEntryId = `entry-${Date.now()}`;
    const newEntry: LedgerEntry = {
      ...entryData,
      id: newEntryId,
      createdAt: new Date().toISOString(),
    };

    const nextEntries = [newEntry, ...entries];
    setEntries(nextEntries);
    saveStoredEntries(nextEntries);

    // If Sale Out: Deduct stock from products & auto-update customer due khata
    if (newEntry.type === 'saleOut') {
      let updatedProducts = [...products];

      if (newEntry.lines.length > 0) {
        newEntry.lines.forEach((line) => {
          updatedProducts = updatedProducts.map((p) =>
            p.id === line.productId ? { ...p, stock: Math.max(0, p.stock - line.quantity) } : p
          );
        });
      } else if (newEntry.productId) {
        updatedProducts = updatedProducts.map((p) =>
          p.id === newEntry.productId ? { ...p, stock: Math.max(0, p.stock - newEntry.quantity) } : p
        );
      }
      setProducts(updatedProducts);
      saveStoredProducts(updatedProducts);

      // Check for partial payment / customer credit
      const due = Math.max(0, newEntry.amount - (newEntry.paidAmount || 0));
      if (due > 0 && newEntry.customerId) {
        const nextCustomers = customers.map((c) =>
          c.id === newEntry.customerId ? { ...c, balance: c.balance + due } : c
        );
        setCustomers(nextCustomers);
        saveStoredCustomers(nextCustomers);

        const newCustEntry: CustomerLedgerEntry = {
          id: `cust-entry-${Date.now()}`,
          customerId: newEntry.customerId,
          customerName: newEntry.customerName || 'Customer',
          type: 'credit',
          createdAt: newEntry.createdAt,
          amount: due,
          sourceEntryId: newEntryId,
          note: newEntry.note || `Bill balance due #${newEntryId.slice(-6)}`,
        };
        const nextCustEntries = [newCustEntry, ...customerEntries];
        setCustomerEntries(nextCustEntries);
        saveStoredCustomerEntries(nextCustEntries);
      }
    }

    // If Stock In: Add stock to product
    if (newEntry.type === 'stockIn') {
      const updatedProducts = products.map((p) => {
        if (p.id === newEntry.productId) {
          return {
            ...p,
            stock: p.stock + newEntry.quantity,
            buyPrice: newEntry.unitPrice > 0 ? newEntry.unitPrice : p.buyPrice,
          };
        }
        return p;
      });
      setProducts(updatedProducts);
      saveStoredProducts(updatedProducts);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const entryToDelete = entries.find((e) => e.id === id);
    if (!entryToDelete) return;

    // Rollback stock changes
    if (entryToDelete.type === 'saleOut') {
      let updatedProducts = [...products];
      if (entryToDelete.lines.length > 0) {
        entryToDelete.lines.forEach((line) => {
          updatedProducts = updatedProducts.map((p) =>
            p.id === line.productId ? { ...p, stock: p.stock + line.quantity } : p
          );
        });
      } else if (entryToDelete.productId) {
        updatedProducts = updatedProducts.map((p) =>
          p.id === entryToDelete.productId ? { ...p, stock: p.stock + entryToDelete.quantity } : p
        );
      }
      setProducts(updatedProducts);
      saveStoredProducts(updatedProducts);

      // Rollback customer credit if any
      const due = Math.max(0, entryToDelete.amount - (entryToDelete.paidAmount || 0));
      if (due > 0 && entryToDelete.customerId) {
        const nextCustomers = customers.map((c) =>
          c.id === entryToDelete.customerId ? { ...c, balance: Math.max(0, c.balance - due) } : c
        );
        setCustomers(nextCustomers);
        saveStoredCustomers(nextCustomers);

        const nextCustEntries = customerEntries.filter((ce) => ce.sourceEntryId !== id);
        setCustomerEntries(nextCustEntries);
        saveStoredCustomerEntries(nextCustEntries);
      }
    } else if (entryToDelete.type === 'stockIn') {
      const updatedProducts = products.map((p) =>
        p.id === entryToDelete.productId
          ? { ...p, stock: Math.max(0, p.stock - entryToDelete.quantity) }
          : p
      );
      setProducts(updatedProducts);
      saveStoredProducts(updatedProducts);
    }

    const nextEntries = entries.filter((e) => e.id !== id);
    setEntries(nextEntries);
    saveStoredEntries(nextEntries);
  };

  // Operations: Customers
  const handleSaveCustomer = (customer: Customer) => {
    const next = [customer, ...customers];
    setCustomers(next);
    saveStoredCustomers(next);
    if (customer.openingBalance > 0) {
      const openingEntry: CustomerLedgerEntry = {
        id: `cust-open-${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        type: 'credit',
        createdAt: new Date().toISOString(),
        amount: customer.openingBalance,
        note: 'Opening ledger balance',
      };
      const nextCustEntries = [openingEntry, ...customerEntries];
      setCustomerEntries(nextCustEntries);
      saveStoredCustomerEntries(nextCustEntries);
    }
  };

  const handleDeleteCustomer = (id: string) => {
    const next = customers.filter((c) => c.id !== id);
    setCustomers(next);
    saveStoredCustomers(next);
    const nextEntries = customerEntries.filter((e) => e.customerId !== id);
    setCustomerEntries(nextEntries);
    saveStoredCustomerEntries(nextEntries);
  };

  const handleSaveCustomerEntry = (entryData: Omit<CustomerLedgerEntry, 'id' | 'createdAt'>) => {
    const newEntry: CustomerLedgerEntry = {
      ...entryData,
      id: `cust-entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const nextEntries = [newEntry, ...customerEntries];
    setCustomerEntries(nextEntries);
    saveStoredCustomerEntries(nextEntries);

    // Update customer balance: credit adds to balance, debit subtracts
    const nextCustomers = customers.map((c) => {
      if (c.id === entryData.customerId) {
        const diff = entryData.type === 'credit' ? entryData.amount : -entryData.amount;
        return { ...c, balance: Math.max(0, c.balance + diff) };
      }
      return c;
    });
    setCustomers(nextCustomers);
    saveStoredCustomers(nextCustomers);
  };

  const handleRestoreSuccess = () => {
    setProducts(getStoredProducts());
    setEntries(getStoredEntries());
    setCustomers(getStoredCustomers());
    setCustomerEntries(getStoredCustomerEntries());
    setUsers(getStoredUsers());
    setCurrentUser(getStoredCurrentUser());
  };

  const canManage = currentUser?.role === 'owner';

  return (
    <div className="min-h-screen bg-[#050608] text-[#F4F8FB] flex flex-col selection:bg-[#17D5B3]/30 selection:text-[#17D5B3]">
      {/* Security PIN Lock Overlay */}
      {isLocked && (
        <AppLockModal
          isOpen={isLocked}
          currentUser={currentUser}
          lang={lang}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLockApp={() => setIsLocked(true)}
        onSignOut={handleSignOut}
        onOpenPublish={() => setIsPublishOpen(true)}
        onOpenPdfManual={() => setIsPdfManualOpen(true)}
        lowStockCount={lowStockProducts.length}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            lang={lang}
            todayIncome={todayIncome}
            todayInvestment={todayInvestment}
            todayProfit={todayProfit}
            netCash={netCash}
            inventoryValue={inventoryValue}
            lowStockProducts={lowStockProducts}
            todayEntries={todayEntries}
            customers={customers}
            onNavigateTab={setActiveTab}
            onOpenAddProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onOpenPaymentQr={(customer) => {
              setQrCustomer(customer);
              setIsQrOpen(true);
            }}
            onOpenInvoice={(entry) => {
              setInvoiceEntry(entry);
              setIsInvoiceOpen(true);
            }}
            onOpenPdfManual={() => setIsPdfManualOpen(true)}
          />
        )}

        {activeTab === 'products' && (
          <Products
            lang={lang}
            products={products}
            canManage={canManage}
            storeInfo={{
              ...DEFAULT_STORE_INFO,
              name: currentUser?.storeName || DEFAULT_STORE_INFO.name,
              supportPhone: currentUser?.phone || DEFAULT_STORE_INFO.supportPhone,
            }}
            onAddProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === 'entry' && (
          <QuickEntry
            lang={lang}
            products={products}
            customers={customers}
            onAddEntry={handleAddEntry}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <History
            lang={lang}
            entries={entries}
            canManage={canManage}
            onDeleteEntry={handleDeleteEntry}
            onOpenInvoice={(entry) => {
              setInvoiceEntry(entry);
              setIsInvoiceOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <Reports
            lang={lang}
            entries={entries}
            customers={customers}
            products={products}
            canManage={canManage}
            onOpenRestoreModal={() => setIsRestoreOpen(true)}
          />
        )}

        {activeTab === 'customers' && (
          <Customers
            lang={lang}
            customers={customers}
            customerEntries={customerEntries}
            canManage={canManage}
            onAddCustomer={() => setIsCustomerModalOpen(true)}
            onDeleteCustomer={handleDeleteCustomer}
            onOpenCustomerEntryModal={(customer, defaultType) => {
              setSelectedCustomerForEntry(customer);
              setCustomerEntryDefaultType(defaultType);
              setIsCustomerEntryModalOpen(true);
            }}
            onOpenPaymentQr={(customer) => {
              setQrCustomer(customer);
              setIsQrOpen(true);
            }}
          />
        )}

        {activeTab === 'help' && (
          <HelpDesk
            lang={lang}
            onOpenPdfManual={() => setIsPdfManualOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#26313B]/60 bg-[#101419] py-4 px-4 sm:px-6 text-center text-xs text-[#A8B5C2] no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-extrabold text-[#F4F8FB]">hisapkitap</span> • Daily shop accounts & smart billing
          </div>
          <div>
            Support: {DEFAULT_STORE_INFO.supportPhone} | Developed for small business owners
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        lang={lang}
        users={users}
        onSignIn={handleSignIn}
        onCreateUser={handleCreateUser}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        lang={lang}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onSignOut={() => {
          setIsProfileOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        lang={lang}
        productToEdit={editingProduct}
        onSaveProduct={handleSaveProduct}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        lang={lang}
        onSaveCustomer={handleSaveCustomer}
      />

      <CustomerEntryModal
        isOpen={isCustomerEntryModalOpen}
        onClose={() => {
          setIsCustomerEntryModalOpen(false);
          setSelectedCustomerForEntry(null);
        }}
        lang={lang}
        customer={selectedCustomerForEntry}
        defaultType={customerEntryDefaultType}
        onSaveEntry={handleSaveCustomerEntry}
      />

      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceEntry(null);
        }}
        lang={lang}
        entry={invoiceEntry}
        storeName={DEFAULT_STORE_INFO.name}
        storePhone={DEFAULT_STORE_INFO.supportPhone}
        storeAddress={DEFAULT_STORE_INFO.address}
      />

      <PaymentQrModal
        isOpen={isQrOpen}
        onClose={() => {
          setIsQrOpen(false);
          setQrCustomer(null);
        }}
        lang={lang}
        customer={qrCustomer}
        upiId={currentUser?.upiId || DEFAULT_STORE_INFO.defaultUpiId}
        storeName={DEFAULT_STORE_INFO.name}
      />

      <RestoreModal
        isOpen={isRestoreOpen}
        onClose={() => setIsRestoreOpen(false)}
        lang={lang}
        onRestoreSuccess={handleRestoreSuccess}
      />

      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        lang={lang}
      />

      <TutorialManualPdfModal
        isOpen={isPdfManualOpen}
        onClose={() => setIsPdfManualOpen(false)}
        lang={lang}
        onPlayVideo={() => {
          setActiveTab('help');
        }}
      />
    </div>
  );
};
