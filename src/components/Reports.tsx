import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  Database,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { LedgerEntry, Customer, Product, LanguageCode, ReportSummary } from '../types';
import { t } from '../data/translations';
import { formatCurrency, generateEntriesCsv, downloadFile, isSameDay, isSameMonth, formatDate } from '../utils/formatters';
import { exportFullBackup, getLastBackupDate } from '../utils/storage';
import { generateFinancialReportPdf, safePrintHtml } from '../utils/pdfGenerator';

interface ReportsProps {
  lang: LanguageCode;
  entries: LedgerEntry[];
  customers: Customer[];
  products: Product[];
  canManage: boolean;
  onOpenRestoreModal: () => void;
}

export const Reports: React.FC<ReportsProps> = ({
  lang,
  entries,
  customers,
  products,
  canManage,
  onOpenRestoreModal,
}) => {
  const [period, setPeriod] = useState<'today' | 'month' | 'all'>('month');
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const now = new Date();

  const filteredEntries = entries.filter((e) => {
    if (period === 'today') return isSameDay(e.createdAt, now);
    if (period === 'month') return isSameMonth(e.createdAt, now);
    return true;
  });

  const totalSales = filteredEntries
    .filter((e) => e.type === 'saleOut')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCostOfGoodsSold = filteredEntries
    .filter((e) => e.type === 'saleOut')
    .reduce((sum, e) => sum + e.costAmount, 0);

  const grossProfit = totalSales - totalCostOfGoodsSold;

  const totalStockInCost = filteredEntries
    .filter((e) => e.type === 'stockIn')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = filteredEntries
    .filter((e) => e.type === 'investment')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCustomerDue = customers.reduce((sum, c) => sum + c.balance, 0);
  const netCash = totalSales - totalStockInCost - totalExpenses;

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateFinancialReportPdf(
        period,
        totalSales,
        totalCostOfGoodsSold,
        grossProfit,
        netCash,
        totalCustomerDue,
        filteredEntries,
        customers
      );
    } catch (err) {
      console.error('Report PDF error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    const printableElement = document.getElementById('financial-report-container');
    if (printableElement) {
      safePrintHtml(printableElement.innerHTML, `Hisap Kitap - Business Report (${period.toUpperCase()})`);
    } else {
      window.print();
    }
  };

  const handleExportCsv = () => {
    const csv = generateEntriesCsv(filteredEntries);
    downloadFile(`hisapkitap_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv');
  };

  const handleCopyBackupJson = () => {
    const backup = exportFullBackup();
    navigator.clipboard.writeText(backup);
    setCopiedBackup(true);
    setBackupMessage(t('backupCopied', lang));
    setTimeout(() => {
      setCopiedBackup(false);
      setBackupMessage('');
    }, 3000);
  };

  const handleDownloadBackupFile = () => {
    const backup = exportFullBackup();
    downloadFile(`hisapkitap_backup_${new Date().toISOString().slice(0, 10)}.json`, backup, 'application/json');
  };

  const lastBackup = getLastBackupDate();

  return (
    <div className="space-y-6">
      {/* Header & Print/Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F8FB] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#17D5B3]" />
            <span>{t('reports', lang)}</span>
          </h2>
          <p className="text-xs text-[#A8B5C2] mt-0.5">
            Profit & Loss statements, sales performance, CSV exports, and data backups.
          </p>
        </div>

        {/* Period Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#101419] p-1 border border-[#26313B] rounded-xl">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'today' ? 'bg-[#17D5B3] text-[#050608]' : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
              }`}
            >
              {t('today', lang)}
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'month' ? 'bg-[#17D5B3] text-[#050608]' : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
              }`}
            >
              {t('month', lang)}
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'all' ? 'bg-[#17D5B3] text-[#050608]' : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
              }`}
            >
              {t('all', lang)}
            </button>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] rounded-xl text-xs font-black transition-all shadow-md shadow-[#17D5B3]/20 cursor-pointer disabled:opacity-50"
            title="Download PDF Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF (.pdf)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] rounded-xl text-xs font-bold text-[#F4F8FB] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#17D5B3]" />
            <span>{t('printReport', lang)}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] rounded-xl text-xs font-bold text-[#F4F8FB] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#54B6FF]" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Printable Report Content Container */}
      <div id="financial-report-container" className="space-y-6">
        {/* Financial Matrix Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-[#A8B5C2]">{t('sales', lang)}</span>
          <div className="text-xl sm:text-2xl font-black text-[#17D5B3] font-mono mt-1">
            {formatCurrency(totalSales)}
          </div>
          <span className="text-[10px] text-[#A8B5C2] block mt-1">
            From {filteredEntries.filter((e) => e.type === 'saleOut').length} sales bills
          </span>
        </div>

        {/* Gross Profit */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-[#A8B5C2]">{t('profit', lang)}</span>
          <div className="text-xl sm:text-2xl font-black text-[#FFC857] font-mono mt-1">
            {formatCurrency(grossProfit)}
          </div>
          <span className="text-[10px] text-[#A8B5C2] block mt-1">
            Margin: {totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(1) : 0}%
          </span>
        </div>

        {/* Total Stock In / Purchases */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-[#A8B5C2]">{t('stockInTotal', lang)}</span>
          <div className="text-xl sm:text-2xl font-black text-[#54B6FF] font-mono mt-1">
            {formatCurrency(totalStockInCost)}
          </div>
          <span className="text-[10px] text-[#A8B5C2] block mt-1">
            Inventory additions
          </span>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 sm:p-5">
          <span className="text-xs font-semibold text-[#A8B5C2]">{t('netCash', lang)}</span>
          <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${netCash >= 0 ? 'text-[#17D5B3]' : 'text-[#FF6F91]'}`}>
            {formatCurrency(netCash)}
          </div>
          <span className="text-[10px] text-[#A8B5C2] block mt-1">
            Sales minus purchases & expenses
          </span>
        </div>
      </div>

      {/* Printable Report Layout Card */}
      <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-6 space-y-6 printable-card">
        <div className="flex items-center justify-between border-b border-[#26313B] pb-4">
          <div>
            <h3 className="text-lg font-black text-[#F4F8FB]">
              Financial Performance Summary ({period.toUpperCase()})
            </h3>
            <p className="text-xs text-[#A8B5C2]">
              Generated on {formatDate(new Date().toISOString())} • hisapkitap Ledger
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-[#17D5B3]/20 text-[#17D5B3] rounded-lg">
            Store Certified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F4F8FB] uppercase tracking-wider">
              Revenue & Margin Breakdown
            </h4>
            <div className="bg-[#161C23] border border-[#26313B] rounded-xl divide-y divide-[#26313B] text-xs">
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#A8B5C2]">Total Customer Sales</span>
                <span className="font-mono font-bold text-[#F4F8FB]">{formatCurrency(totalSales)}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#A8B5C2]">Cost of Goods Sold (COGS)</span>
                <span className="font-mono font-bold text-[#FF6F91]">-{formatCurrency(totalCostOfGoodsSold)}</span>
              </div>
              <div className="p-3 flex items-center justify-between bg-[#17D5B3]/5">
                <span className="font-bold text-[#17D5B3]">Gross Trading Profit</span>
                <span className="font-mono font-black text-[#17D5B3]">{formatCurrency(grossProfit)}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#A8B5C2]">Operating Expenses & Rent</span>
                <span className="font-mono font-bold text-[#FF6F91]">-{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet / Liquidity Snapshot */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F4F8FB] uppercase tracking-wider">
              Asset & Liquidity Snapshot
            </h4>
            <div className="bg-[#161C23] border border-[#26313B] rounded-xl divide-y divide-[#26313B] text-xs">
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#A8B5C2]">{t('customerDue', lang)}</span>
                <span className="font-mono font-bold text-[#9B7CFF]">{formatCurrency(totalCustomerDue)}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#A8B5C2]">Current Stock Inventory Value</span>
                <span className="font-mono font-bold text-[#54B6FF]">
                  {formatCurrency(products.reduce((s, p) => s + p.stock * p.buyPrice, 0))}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#A8B5C2]">Active Catalog Items</span>
                <span className="font-mono font-bold text-[#F4F8FB]">{products.length} products</span>
              </div>
              <div className="p-3 flex items-center justify-between bg-[#101419]">
                <span className="font-bold text-[#F4F8FB]">Net Operating Cash Flow</span>
                <span className={`font-mono font-black ${netCash >= 0 ? 'text-[#17D5B3]' : 'text-[#FF6F91]'}`}>
                  {formatCurrency(netCash)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#26313B] pb-3">
          <Database className="w-5 h-5 text-[#17D5B3]" />
          <div>
            <h3 className="font-extrabold text-base text-[#F4F8FB]">
              Data Backup & Restoration
            </h3>
            <p className="text-xs text-[#A8B5C2]">
              Export or restore your complete store database safely in JSON format.
            </p>
          </div>
        </div>

        {backupMessage && (
          <div className="p-3 rounded-lg bg-[#17D5B3]/20 border border-[#17D5B3]/50 text-[#17D5B3] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{backupMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyBackupJson}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] hover:border-[#17D5B3]/50 rounded-xl text-xs font-bold text-[#F4F8FB] transition-all"
          >
            {copiedBackup ? <Check className="w-4 h-4 text-[#17D5B3]" /> : <Copy className="w-4 h-4 text-[#17D5B3]" />}
            <span>{t('copyBackup', lang)}</span>
          </button>

          <button
            onClick={handleDownloadBackupFile}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] hover:border-[#54B6FF]/50 rounded-xl text-xs font-bold text-[#F4F8FB] transition-all"
          >
            <Download className="w-4 h-4 text-[#54B6FF]" />
            <span>Download Backup (.json)</span>
          </button>

          {canManage && (
            <button
              onClick={onOpenRestoreModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] hover:border-[#FFC857]/50 rounded-xl text-xs font-bold text-[#FFC857] transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t('restore', lang)}</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-[#A8B5C2] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#17D5B3]" />
          <span>{t('autoBackup', lang)} active • {t('backupSavedLocally', lang)}</span>
          {lastBackup && <span>• Last export: {formatDate(lastBackup)}</span>}
        </div>
      </div>
    </div>
  );
};
