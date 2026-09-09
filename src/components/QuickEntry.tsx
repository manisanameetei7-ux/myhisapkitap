import React, { useState } from 'react';
import {
  ShoppingCart,
  ArrowDownLeft,
  DollarSign,
  Plus,
  Trash2,
  Receipt,
  User,
  AlertCircle,
  CheckCircle2,
  Package,
  Calculator,
  Barcode,
  Camera,
  Zap,
} from 'lucide-react';
import { Product, Customer, EntryType, SaleLine, LanguageCode, LedgerEntry } from '../types';
import { t } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_FALLBACK_IMAGES, getMatchingProductImage } from '../data/productImagePresets';
import { BarcodeScannerModal } from './modals/BarcodeScannerModal';

interface QuickEntryProps {
  lang: LanguageCode;
  products: Product[];
  customers: Customer[];
  onAddEntry: (entry: Omit<LedgerEntry, 'id' | 'createdAt'>) => void;
  onNavigateTab: (tab: string) => void;
}

export const QuickEntry: React.FC<QuickEntryProps> = ({
  lang,
  products,
  customers,
  onAddEntry,
  onNavigateTab,
}) => {
  const [activeType, setActiveType] = useState<EntryType>('saleOut');

  // Sale Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [basket, setBasket] = useState<SaleLine[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      standardQuantity: products[0]?.standardQuantity || '',
      quantity: 1,
      unitPrice: products[0]?.sellPrice || 0,
      buyPriceAtSale: products[0]?.buyPrice || 0,
    },
  ]);
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [saleNote, setSaleNote] = useState<string>('');
  const [isGstApplied, setIsGstApplied] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Stock In Form State
  const [stockProductId, setStockProductId] = useState<string>(products[0]?.id || '');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [stockBuyPrice, setStockBuyPrice] = useState<number>(products[0]?.buyPrice || 0);
  const [stockNote, setStockNote] = useState<string>('');

  // Investment Form State
  const [investAmount, setInvestAmount] = useState<number | ''>('');
  const [investCategory, setInvestCategory] = useState<string>('Shop Rent / Utilities');
  const [investNote, setInvestNote] = useState<string>('');

  // Barcode Scanner State
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [quickScanInput, setQuickScanInput] = useState('');
  const [lastScannedToast, setLastScannedToast] = useState<{ name: string; time: number } | null>(null);

  // Basket Calculation helpers
  const totalSaleAmount = basket.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const totalCostAmount = basket.reduce((sum, line) => sum + line.quantity * line.buyPriceAtSale, 0);

  // Overall GST estimation (weighted or standard)
  const gstRateAvg = isGstApplied
    ? basket.reduce((acc, line) => {
        const p = products.find((prod) => prod.id === line.productId);
        return acc + (p?.gstRate || 0);
      }, 0) / (basket.length || 1)
    : 0;

  const gstAmount = isGstApplied && totalSaleAmount > 0
    ? (totalSaleAmount * gstRateAvg) / (100 + gstRateAvg)
    : 0;

  const currentPaid = paidAmount === '' ? totalSaleAmount : Number(paidAmount);
  const dueBalance = Math.max(0, totalSaleAmount - currentPaid);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Basket Handlers
  const handleAddBasketLine = () => {
    const firstProduct = products[0];
    if (!firstProduct) return;
    setBasket([
      ...basket,
      {
        productId: firstProduct.id,
        productName: firstProduct.name,
        standardQuantity: firstProduct.standardQuantity,
        quantity: 1,
        unitPrice: firstProduct.sellPrice,
        buyPriceAtSale: firstProduct.buyPrice,
      },
    ]);
  };

  const handleUpdateBasketLine = (index: number, updates: Partial<SaleLine>) => {
    const next = [...basket];
    const item = { ...next[index], ...updates };

    if (updates.productId) {
      const prod = products.find((p) => p.id === updates.productId);
      if (prod) {
        item.productName = prod.name;
        item.standardQuantity = prod.standardQuantity;
        item.unitPrice = prod.sellPrice;
        item.buyPriceAtSale = prod.buyPrice;
      }
    }
    next[index] = item;
    setBasket(next);
  };

  const handleRemoveBasketLine = (index: number) => {
    if (basket.length === 1) return;
    setBasket(basket.filter((_, i) => i !== index));
  };

  // Handle scanned barcode for billing basket
  const handleBarcodeScanned = (scannedCode: string, matchedProduct?: Product) => {
    const targetProduct =
      matchedProduct ||
      products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === scannedCode.toLowerCase()) ||
          p.id.toLowerCase() === scannedCode.toLowerCase() ||
          (p.barcode && p.barcode.replace(/\D/g, '') === scannedCode.replace(/\D/g, ''))
      );

    if (!targetProduct) {
      setErrorMessage(`No product found for barcode SKU "${scannedCode}".`);
      return;
    }

    setErrorMessage('');
    setLastScannedToast({ name: targetProduct.name, time: Date.now() });

    if (activeType === 'stockIn') {
      setStockProductId(targetProduct.id);
      setStockBuyPrice(targetProduct.buyPrice);
      setSuccessMessage(`Selected ${targetProduct.name} for restocking.`);
      return;
    }

    // Check if item is already in basket
    const existingIndex = basket.findIndex((l) => l.productId === targetProduct.id);
    if (existingIndex >= 0) {
      const next = [...basket];
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + 1,
      };
      setBasket(next);
    } else {
      // If basket only contains empty/default unedited first item and user scans, replace or append
      if (basket.length === 1 && basket[0].quantity === 1 && basket[0].productId === products[0]?.id && basket[0].productId !== targetProduct.id) {
        setBasket([
          {
            productId: targetProduct.id,
            productName: targetProduct.name,
            standardQuantity: targetProduct.standardQuantity,
            quantity: 1,
            unitPrice: targetProduct.sellPrice,
            buyPriceAtSale: targetProduct.buyPrice,
          },
        ]);
      } else {
        setBasket([
          ...basket,
          {
            productId: targetProduct.id,
            productName: targetProduct.name,
            standardQuantity: targetProduct.standardQuantity,
            quantity: 1,
            unitPrice: targetProduct.sellPrice,
            buyPriceAtSale: targetProduct.buyPrice,
          },
        ]);
      }
    }
  };

  const handleQuickScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScanInput.trim()) return;
    handleBarcodeScanned(quickScanInput.trim());
    setQuickScanInput('');
  };

  // Submit Sale Out
  const handleSubmitSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (basket.length === 0 || totalSaleAmount <= 0) {
      setErrorMessage('Please add at least one item with a valid price.');
      return;
    }

    // Stock check
    for (const line of basket) {
      const p = products.find((prod) => prod.id === line.productId);
      if (p && line.quantity > p.stock) {
        setErrorMessage(`Not enough stock for "${p.name}". Available: ${p.stock}, Requested: ${line.quantity}`);
        return;
      }
    }

    const firstLine = basket[0];
    onAddEntry({
      type: 'saleOut',
      productId: basket.length === 1 ? firstLine.productId : undefined,
      productName: basket.length === 1 ? firstLine.productName : undefined,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      quantity: basket.reduce((s, l) => s + l.quantity, 0),
      unitPrice: basket.length === 1 ? firstLine.unitPrice : 0,
      amount: totalSaleAmount,
      paidAmount: currentPaid,
      gstRate: gstRateAvg,
      gstAmount: Number(gstAmount.toFixed(2)),
      costAmount: totalCostAmount,
      lines: basket,
      note: saleNote.trim(),
    });

    setSuccessMessage(t('recorded', lang));
    // Reset form
    if (products[0]) {
      setBasket([
        {
          productId: products[0].id,
          productName: products[0].name,
          standardQuantity: products[0].standardQuantity,
          quantity: 1,
          unitPrice: products[0].sellPrice,
          buyPriceAtSale: products[0].buyPrice,
        },
      ]);
    }
    setPaidAmount('');
    setSaleNote('');
    setSelectedCustomerId('');
  };

  // Submit Stock In
  const handleSubmitStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetProduct = products.find((p) => p.id === stockProductId);
    if (!targetProduct) {
      setErrorMessage(t('selectProduct', lang));
      return;
    }

    if (stockQuantity <= 0 || stockBuyPrice < 0) {
      setErrorMessage(t('invalidNumber', lang));
      return;
    }

    const totalCost = stockQuantity * stockBuyPrice;

    onAddEntry({
      type: 'stockIn',
      productId: targetProduct.id,
      productName: targetProduct.name,
      quantity: stockQuantity,
      unitPrice: stockBuyPrice,
      amount: totalCost,
      paidAmount: totalCost,
      gstRate: targetProduct.gstRate,
      gstAmount: 0,
      costAmount: totalCost,
      lines: [
        {
          productId: targetProduct.id,
          productName: targetProduct.name,
          standardQuantity: targetProduct.standardQuantity,
          quantity: stockQuantity,
          unitPrice: targetProduct.sellPrice,
          buyPriceAtSale: stockBuyPrice,
        },
      ],
      note: stockNote.trim() || `Restocked ${stockQuantity} units`,
    });

    setSuccessMessage(`Restocked ${stockQuantity} units of ${targetProduct.name}`);
    setStockNote('');
  };

  // Submit Investment
  const handleSubmitInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const amt = Number(investAmount);
    if (!amt || amt <= 0) {
      setErrorMessage(t('invalidNumber', lang));
      return;
    }

    onAddEntry({
      type: 'investment',
      quantity: 0,
      unitPrice: 0,
      amount: amt,
      paidAmount: amt,
      gstRate: 0,
      gstAmount: 0,
      costAmount: amt,
      lines: [],
      note: investNote.trim() ? `${investCategory}: ${investNote.trim()}` : investCategory,
    });

    setSuccessMessage(`Expense of ${formatCurrency(amt)} recorded.`);
    setInvestAmount('');
    setInvestNote('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F8FB] flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#17D5B3]" />
            <span>{t('quickEntry', lang)}</span>
          </h2>
          <p className="text-xs text-[#A8B5C2] mt-0.5">
            Real-time shop billing terminal, stock replenishment, and expenses.
          </p>
        </div>

        {/* Transaction Type Selector */}
        <div className="flex bg-[#101419] p-1 border border-[#26313B] rounded-xl gap-1">
          <button
            onClick={() => {
              setActiveType('saleOut');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeType === 'saleOut'
                ? 'bg-[#17D5B3] text-[#050608] shadow-md shadow-[#17D5B3]/20'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t('saleOut', lang)}</span>
          </button>

          <button
            onClick={() => {
              setActiveType('stockIn');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeType === 'stockIn'
                ? 'bg-[#54B6FF] text-[#050608] shadow-md shadow-[#54B6FF]/20'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t('stockIn', lang)}</span>
          </button>

          <button
            onClick={() => {
              setActiveType('investment');
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeType === 'investment'
                ? 'bg-[#FF6F91] text-[#050608] shadow-md shadow-[#FF6F91]/20'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{t('investment', lang)}</span>
          </button>
        </div>
      </div>

      {/* Barcode Quick-Scan Bar */}
      <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] flex items-center justify-center shrink-0">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#F4F8FB] flex items-center gap-1.5">
              <span>Fast Barcode Scanner</span>
              <span className="text-[10px] bg-[#17D5B3]/15 text-[#17D5B3] px-1.5 py-0.5 rounded font-mono font-bold">
                Camera + Gun
              </span>
            </div>
            <p className="text-[11px] text-[#A8B5C2]">
              Scan product barcode to instantly add to bill or adjust quantity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:justify-end">
          {/* Quick Input Box for USB Barcode Gun / Manual SKU */}
          <form onSubmit={handleQuickScanSubmit} className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={quickScanInput}
              onChange={(e) => setQuickScanInput(e.target.value)}
              placeholder="Scan/type SKU & press Enter..."
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl pl-3 pr-8 py-2 text-xs text-[#F4F8FB] font-mono focus:outline-none placeholder-[#A8B5C2]/60"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#17D5B3] hover:text-[#15C2A3] font-bold"
              title="Submit SKU"
            >
              ↵
            </button>
          </form>

          {/* Open Camera Scanner Modal Button */}
          <button
            type="button"
            onClick={() => setIsBarcodeScannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-black rounded-xl text-xs shadow-md shadow-[#17D5B3]/20 transition-all shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>Scan with Camera</span>
          </button>
        </div>
      </div>

      {/* Last Scanned Item Toast Pill */}
      {lastScannedToast && Date.now() - lastScannedToast.time < 4000 && (
        <div className="p-2.5 bg-[#17D5B3]/15 border border-[#17D5B3]/50 rounded-xl flex items-center justify-between text-xs text-[#17D5B3] animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold">Scanned & Added: {lastScannedToast.name}</span>
          </div>
          <span className="text-[10px] text-[#A8B5C2]">Basket updated</span>
        </div>
      )}

      {/* Status Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-[#17D5B3]/15 border border-[#17D5B3]/40 flex items-center justify-between text-[#17D5B3] text-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-bold underline hover:opacity-80"
          >
            View in History →
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FF6F91]/15 border border-[#FF6F91]/40 flex items-center gap-2.5 text-[#FF6F91] text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: SALE OUT (POS BASKET BILLING) */}
      {activeType === 'saleOut' && (
        <form onSubmit={handleSubmitSale} className="space-y-5">
          {/* Customer Selection Card */}
          <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F4F8FB] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#17D5B3]" />
                <span>{t('chooseCustomer', lang)}</span>
              </label>
              {selectedCustomer && (
                <span className="text-xs font-mono font-bold text-[#FF6F91]">
                  Current Due: {formatCurrency(selectedCustomer.balance)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
              >
                <option value="">{t('customerOptional', lang)}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || 'No phone'}) - Balance: ₹{c.balance}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('note', lang)}
                  value={saleNote}
                  onChange={(e) => setSaleNote(e.target.value)}
                  className="flex-1 bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none placeholder-[#A8B5C2]/60"
                />
              </div>
            </div>
          </div>

          {/* POS Bill Items Table / Basket */}
          <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#17D5B3]" />
                <h3 className="text-sm font-extrabold text-[#F4F8FB]">
                  {t('saleItems', lang)} ({basket.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddBasketLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17D5B3]/10 hover:bg-[#17D5B3]/20 border border-[#17D5B3]/30 text-[#17D5B3] rounded-lg text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addItem', lang)}</span>
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {basket.map((line, idx) => {
                const prod = products.find((p) => p.id === line.productId);
                const lineTotal = line.quantity * line.unitPrice;
                const lineImage = prod?.imageUrl || (prod ? getMatchingProductImage(prod.name, prod.category) : CATEGORY_FALLBACK_IMAGES.grocery);

                return (
                  <div
                    key={idx}
                    className="bg-[#161C23] border border-[#26313B] rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    {/* Product Selector with Photo Thumbnail */}
                    <div className="sm:col-span-5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#101419] border border-[#26313B] shrink-0">
                        <img
                          src={lineImage}
                          alt={line.productName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CATEGORY_FALLBACK_IMAGES.grocery;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] text-[#A8B5C2] font-semibold mb-1 block">
                          Product #{idx + 1}
                        </label>
                        <select
                          value={line.productId}
                          onChange={(e) => handleUpdateBasketLine(idx, { productId: e.target.value })}
                          className="w-full bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#F4F8FB] focus:outline-none truncate"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quantity Input */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-[#A8B5C2] font-semibold mb-1 block">
                        Qty ({prod?.standardQuantity || 'Units'})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          handleUpdateBasketLine(idx, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className="w-full bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm text-[#F4F8FB] font-mono focus:outline-none"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-[#A8B5C2] font-semibold mb-1 block">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={line.unitPrice}
                        onChange={(e) =>
                          handleUpdateBasketLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm text-[#F4F8FB] font-mono focus:outline-none"
                      />
                    </div>

                    {/* Line Total & Remove Action */}
                    <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <label className="text-[10px] text-[#A8B5C2] font-semibold block sm:hidden">
                          Subtotal
                        </label>
                        <span className="font-mono font-bold text-[#17D5B3] text-sm">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>

                      {basket.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBasketLine(idx)}
                          className="p-2 rounded-lg bg-[#101419] hover:bg-[#FF6F91]/20 text-[#A8B5C2] hover:text-[#FF6F91] border border-[#26313B] transition-colors"
                          title={t('removeItem', lang)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bill Summary & Payment Splitting */}
            <div className="border-t border-[#26313B] pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <span className="text-[#A8B5C2]">{t('totalBill', lang)}</span>
                <span className="text-xl sm:text-2xl font-black text-[#F4F8FB] font-mono">
                  {formatCurrency(totalSaleAmount)}
                </span>
              </div>

              {/* Paid Amount vs Customer Due */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#161C23] border border-[#26313B] rounded-xl p-4">
                <div>
                  <label className="text-xs font-bold text-[#17D5B3] block mb-1.5">
                    {t('paidAmount', lang)}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#A8B5C2]">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={totalSaleAmount}
                      value={paidAmount}
                      placeholder={totalSaleAmount.toString()}
                      onChange={(e) =>
                        setPaidAmount(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-lg pl-8 pr-3.5 py-2 text-sm font-mono text-[#F4F8FB] focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#A8B5C2] mt-1 block">
                    Leave blank if paid in full (₹{totalSaleAmount})
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#FF6F91] block mb-1.5">
                    {t('dueAmount', lang)} (Udhar Khata)
                  </label>
                  <div className="px-3.5 py-2 rounded-lg bg-[#101419] border border-[#26313B] text-base font-black font-mono text-[#FF6F91]">
                    {formatCurrency(dueBalance)}
                  </div>
                  <span className="text-[10px] text-[#A8B5C2] mt-1 block">
                    {dueBalance > 0
                      ? selectedCustomer
                        ? `Will be added to ${selectedCustomer.name}'s ledger`
                        : 'Select a customer to record credit ledger'
                      : 'No pending due balance'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#17D5B3] to-[#10B981] text-[#050608] font-black text-base shadow-xl shadow-[#17D5B3]/25 hover:opacity-95 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Receipt className="w-5 h-5" />
              <span>Complete Sale & Save Bill ({formatCurrency(totalSaleAmount)})</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: STOCK IN */}
      {activeType === 'stockIn' && (
        <form onSubmit={handleSubmitStockIn} className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#26313B] pb-3">
            <ArrowDownLeft className="w-5 h-5 text-[#54B6FF]" />
            <h3 className="font-extrabold text-base text-[#F4F8FB]">
              {t('stockIn', lang)} (Purchases & Restocking)
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                {t('selectProduct', lang)}
              </label>
              <div className="flex items-center gap-3">
                {(() => {
                  const currStockProd = products.find((p) => p.id === stockProductId);
                  const currImg = currStockProd?.imageUrl || (currStockProd ? getMatchingProductImage(currStockProd.name, currStockProd.category) : CATEGORY_FALLBACK_IMAGES.grocery);
                  return (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#161C23] border border-[#26313B] shrink-0">
                      <img
                        src={currImg}
                        alt={currStockProd?.name || 'Stock item'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = CATEGORY_FALLBACK_IMAGES.grocery;
                        }}
                      />
                    </div>
                  );
                })()}
                <select
                  value={stockProductId}
                  onChange={(e) => {
                    setStockProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setStockBuyPrice(p.buyPrice);
                  }}
                  className="flex-1 bg-[#161C23] border border-[#26313B] focus:border-[#54B6FF] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Current Stock: {p.stock} ({p.standardQuantity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                  Restock Quantity (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#54B6FF] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F4F8FB] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                  Purchase Unit Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockBuyPrice}
                  onChange={(e) => setStockBuyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#54B6FF] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F4F8FB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                Vendor / Invoice Note
              </label>
              <input
                type="text"
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
                placeholder="e.g. Wholesaler purchase order #412"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#54B6FF] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none placeholder-[#A8B5C2]/60"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#161C23] border border-[#26313B] flex items-center justify-between">
              <span className="text-xs text-[#A8B5C2]">Total Purchase Expense:</span>
              <span className="text-xl font-black font-mono text-[#54B6FF]">
                {formatCurrency(stockQuantity * stockBuyPrice)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#54B6FF] hover:bg-[#439ee0] text-[#050608] font-black text-base shadow-xl shadow-[#54B6FF]/20 transition-all"
            >
              Record Stock In & Update Inventory
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: INVESTMENT / EXPENSE */}
      {activeType === 'investment' && (
        <form onSubmit={handleSubmitInvestment} className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#26313B] pb-3">
            <DollarSign className="w-5 h-5 text-[#FF6F91]" />
            <h3 className="font-extrabold text-base text-[#F4F8FB]">
              {t('investment', lang)} & Operating Expenses
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                  Expense Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#A8B5C2]">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#FF6F91] rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-[#F4F8FB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                  Category
                </label>
                <select
                  value={investCategory}
                  onChange={(e) => setInvestCategory(e.target.value)}
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#FF6F91] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
                >
                  <option value="Shop Rent / Utilities">Shop Rent / Electricity</option>
                  <option value="Packaging & Bags">Packaging & Carry Bags</option>
                  <option value="Store Repairs / Furniture">Store Repairs / Shelves</option>
                  <option value="Staff Salary">Staff Wages / Allowance</option>
                  <option value="Tea & Refreshments">Tea & Daily Refreshments</option>
                  <option value="Transport / Delivery">Transport / Auto Fare</option>
                  <option value="Owner Capital Infusion">Owner Capital / Deposit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                Remarks / Details
              </label>
              <textarea
                rows={3}
                value={investNote}
                onChange={(e) => setInvestNote(e.target.value)}
                placeholder="Additional notes about this expense..."
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#FF6F91] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none placeholder-[#A8B5C2]/60"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#FF6F91] hover:bg-[#ff577f] text-[#050608] font-black text-base shadow-xl shadow-[#FF6F91]/20 transition-all"
            >
              Record Expense
            </button>
          </div>
        </form>
      )}

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScanSuccess={(scannedCode, matchedProduct) => {
          handleBarcodeScanned(scannedCode, matchedProduct);
        }}
        products={products}
        lang={lang}
        continuousMode={true}
        title="POS Barcode Scanner"
        subtitle="Point camera at product barcode or scan with gun to add to bill"
      />
    </div>
  );
};
