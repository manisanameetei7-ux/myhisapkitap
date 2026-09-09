import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  ShoppingCart,
  QrCode,
  ChevronRight,
  Send,
  Video,
  Play,
  BookOpen,
} from 'lucide-react';
import { Product, LedgerEntry, Customer, LanguageCode } from '../types';
import { t } from '../data/translations';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { generateFeaturesOnlyPdf } from '../utils/pdfGenerator';
import { Download } from 'lucide-react';

interface DashboardProps {
  lang: LanguageCode;
  todayIncome: number;
  todayInvestment: number;
  todayProfit: number;
  netCash: number;
  inventoryValue: number;
  lowStockProducts: Product[];
  todayEntries: LedgerEntry[];
  customers: Customer[];
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct: () => void;
  onOpenPaymentQr: (customer: Customer) => void;
  onOpenInvoice: (entry: LedgerEntry) => void;
  onOpenPdfManual?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  lang,
  todayIncome,
  todayInvestment,
  todayProfit,
  netCash,
  inventoryValue,
  lowStockProducts,
  todayEntries,
  customers,
  onNavigateTab,
  onOpenAddProduct,
  onOpenPaymentQr,
  onOpenInvoice,
  onOpenPdfManual,
}) => {
  const topDues = [...customers]
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const totalCustomerDue = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Summary */}
      <div className="bg-gradient-to-r from-[#101419] via-[#161C23] to-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#17D5B3]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#17D5B3] animate-pulse" />
              <span className="text-xs font-semibold text-[#17D5B3] uppercase tracking-wider">
                Store Pulse
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F8FB]">
              {t('dashboard', lang)}
            </h2>
            <p className="text-sm text-[#A8B5C2] mt-1">
              {t('authSubtitle', lang)}
            </p>
          </div>

          {/* Quick Action Hub */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigateTab('entry')}
              className="flex items-center gap-2 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#17D5B3]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('quickEntry', lang)}</span>
            </button>

            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-2 bg-[#161C23] hover:bg-[#26313B] text-[#F4F8FB] border border-[#26313B] hover:border-[#17D5B3]/50 font-semibold px-3.5 py-2.5 rounded-xl transition-all text-sm"
            >
              <Plus className="w-4 h-4 text-[#17D5B3]" />
              <span>{t('addProduct', lang)}</span>
            </button>

            <button
              onClick={() => generateFeaturesOnlyPdf()}
              className="flex items-center gap-2 bg-[#161C23] hover:bg-[#26313B] text-[#17D5B3] border border-[#17D5B3]/40 hover:border-[#17D5B3] font-bold px-3.5 py-2.5 rounded-xl transition-all text-sm shadow-md"
              title="Download PDF Guide: Dashboard, Account, Products, Billing, Invoices, Khata, Reports & HelpDesk"
            >
              <Download className="w-4 h-4" />
              <span>Feature Guide (.pdf)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Financial Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Income */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5 relative group hover:border-[#17D5B3]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A8B5C2]">{t('todayIncome', lang)}</span>
            <div className="p-2 rounded-lg bg-[#17D5B3]/10 text-[#17D5B3]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#F4F8FB] mt-2 font-mono">
            {formatCurrency(todayIncome)}
          </div>
          <div className="text-[11px] text-[#17D5B3] font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Daily Sales Realized</span>
          </div>
        </div>

        {/* Today's Profit */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5 relative group hover:border-[#FFC857]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A8B5C2]">{t('todayProfit', lang)}</span>
            <div className="p-2 rounded-lg bg-[#FFC857]/10 text-[#FFC857]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#FFC857] mt-2 font-mono">
            {formatCurrency(todayProfit)}
          </div>
          <div className="text-[11px] text-[#A8B5C2] font-medium mt-1">
            Margin: {todayIncome > 0 ? ((todayProfit / todayIncome) * 100).toFixed(1) : 0}%
          </div>
        </div>

        {/* Today's Investment / Expense */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5 relative group hover:border-[#FF6F91]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A8B5C2]">{t('todayInvest', lang)}</span>
            <div className="p-2 rounded-lg bg-[#FF6F91]/10 text-[#FF6F91]">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#F4F8FB] mt-2 font-mono">
            {formatCurrency(todayInvestment)}
          </div>
          <div className="text-[11px] text-[#FF6F91] font-medium mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>Stock In & Expenses</span>
          </div>
        </div>

        {/* Total Outstanding Due */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5 relative group hover:border-[#9B7CFF]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#A8B5C2]">{t('customerDue', lang)}</span>
            <div className="p-2 rounded-lg bg-[#9B7CFF]/10 text-[#9B7CFF]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#9B7CFF] mt-2 font-mono">
            {formatCurrency(totalCustomerDue)}
          </div>
          <div className="text-[11px] text-[#A8B5C2] font-medium mt-1">
            {topDues.length} Active debtor accounts
          </div>
        </div>
      </div>

      {/* Secondary Quick Stats (Inventory Value & Net Cash) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#54B6FF]/10 text-[#54B6FF]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#A8B5C2] font-medium">{t('inventoryValue', lang)}</div>
              <div className="text-lg font-black text-[#F4F8FB] font-mono">{formatCurrency(inventoryValue)}</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-semibold text-[#17D5B3] hover:underline flex items-center gap-1"
          >
            <span>{t('products', lang)}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${netCash >= 0 ? 'bg-[#17D5B3]/10 text-[#17D5B3]' : 'bg-[#FF6F91]/10 text-[#FF6F91]'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#A8B5C2] font-medium">{t('netCash', lang)}</div>
              <div className={`text-lg font-black font-mono ${netCash >= 0 ? 'text-[#17D5B3]' : 'text-[#FF6F91]'}`}>
                {formatCurrency(netCash)}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs font-semibold text-[#17D5B3] hover:underline flex items-center gap-1"
          >
            <span>{t('reports', lang)}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#FF6F91]/10 border border-[#FF6F91]/30 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FF6F91]/20 text-[#FF6F91]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F4F8FB]">
                  {t('lowStockAlert', lang)}: {lowStockProducts.length} {t('lowStockItems', lang)}
                </h4>
                <p className="text-xs text-[#A8B5C2]">
                  {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-[#FF6F91] text-[#050608] text-xs font-extrabold hover:bg-[#ff577f] transition-colors whitespace-nowrap"
            >
              Restock Products
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Today's Transactions & Top Customer Dues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Transactions */}
        <div className="lg:col-span-2 bg-[#101419] border border-[#26313B] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#17D5B3]" />
              <h3 className="font-bold text-[#F4F8FB] text-base">
                Today's Entries ({todayEntries.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-semibold text-[#17D5B3] hover:underline"
            >
              View Full History →
            </button>
          </div>

          {todayEntries.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#26313B] rounded-xl bg-[#161C23]/40">
              <Receipt className="w-10 h-10 text-[#A8B5C2]/40 mx-auto mb-2" />
              <p className="text-sm text-[#A8B5C2]">{t('emptyHistory', lang)}</p>
              <button
                onClick={() => onNavigateTab('entry')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17D5B3]/20 text-[#17D5B3] hover:bg-[#17D5B3]/30 rounded-lg text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Sale Today</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayEntries.slice(0, 6).map((entry) => {
                const isSale = entry.type === 'saleOut';
                const isStockIn = entry.type === 'stockIn';
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#161C23] border border-[#26313B] hover:border-[#17D5B3]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSale
                            ? 'bg-[#17D5B3]/20 text-[#17D5B3]'
                            : isStockIn
                            ? 'bg-[#54B6FF]/20 text-[#54B6FF]'
                            : 'bg-[#FF6F91]/20 text-[#FF6F91]'
                        }`}
                      >
                        {isSale ? 'S' : isStockIn ? 'IN' : 'EXP'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#F4F8FB] truncate">
                          {entry.productName || entry.lines.map((l) => l.productName).join(', ') || entry.note || 'Expense'}
                        </div>
                        <div className="text-xs text-[#A8B5C2] flex items-center gap-2">
                          <span>{formatDateTime(entry.createdAt)}</span>
                          {entry.customerName && (
                            <span className="text-[#17D5B3] font-medium truncate">
                              • {entry.customerName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className={`text-sm font-bold font-mono ${isSale ? 'text-[#17D5B3]' : 'text-[#F4F8FB]'}`}>
                          {formatCurrency(entry.amount)}
                        </div>
                        {Boolean(entry.dueAmount && entry.dueAmount > 0) && (
                          <div className="text-[10px] text-[#FF6F91] font-semibold">
                            Due: {formatCurrency(entry.dueAmount || 0)}
                          </div>
                        )}
                      </div>

                      {isSale && (
                        <button
                          onClick={() => onOpenInvoice(entry)}
                          title={t('invoice', lang)}
                          className="p-1.5 rounded bg-[#101419] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#17D5B3] transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Customer Due Khata Snapshot */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9B7CFF]" />
              <h3 className="font-bold text-[#F4F8FB] text-base">
                Pending Customer Dues
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-semibold text-[#9B7CFF] hover:underline"
            >
              All Khata →
            </button>
          </div>

          {topDues.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#26313B] rounded-xl bg-[#161C23]/40">
              <p className="text-sm text-[#A8B5C2]">All customer dues are settled! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topDues.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 rounded-lg bg-[#161C23] border border-[#26313B] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#F4F8FB] truncate">
                      {customer.name}
                    </div>
                    <div className="text-xs text-[#A8B5C2]">
                      {customer.phone || 'No phone'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-black text-[#FF6F91] font-mono">
                        {formatCurrency(customer.balance)}
                      </div>
                      <div className="text-[10px] text-[#A8B5C2]">Balance</div>
                    </div>

                    <button
                      onClick={() => onOpenPaymentQr(customer)}
                      title={t('paymentQr', lang)}
                      className="p-2 rounded-lg bg-[#17D5B3]/10 hover:bg-[#17D5B3]/20 text-[#17D5B3] transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Guides Quick Banner */}
      <div className="bg-gradient-to-r from-[#101419] via-[#161C23] to-[#101419] border border-[#26313B] hover:border-[#FF6F91]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FF6F91]/20 text-[#FF6F91] flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-[#F4F8FB] flex items-center gap-2">
              <span>Interactive Shop Owner Video Tutorials</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] border border-[#17D5B3]/30">
                4 Guides
              </span>
            </h4>
            <p className="text-xs text-[#A8B5C2] mt-0.5">
              Watch step-by-step interactive video demos on POS Fast Billing, Stock Tracking, Customer Udhar Khata & WhatsApp Invoices.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenPdfManual && (
            <button
              onClick={onOpenPdfManual}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-[#161C23] border border-[#54B6FF]/40 hover:bg-[#54B6FF]/15 text-[#54B6FF] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>PDF User Manual</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('help')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FF6F91] hover:bg-[#FF557F] text-[#050608] text-xs font-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Watch Video Tutorials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
