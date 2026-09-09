import React, { useState } from 'react';
import { Receipt, Printer, X, Download, Share2, Check } from 'lucide-react';
import { LedgerEntry, LanguageCode } from '../../types';
import { t } from '../../data/translations';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { DEFAULT_STORE_INFO } from '../../data/starterData';
import { generateInvoicePdf, safePrintHtml } from '../../utils/pdfGenerator';
import { BarcodeImage } from '../BarcodeImage';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  entry: LedgerEntry | null;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  lang,
  entry,
  storeName = DEFAULT_STORE_INFO.name,
  storePhone = DEFAULT_STORE_INFO.supportPhone,
  storeAddress = DEFAULT_STORE_INFO.address,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen || !entry) return null;

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      generateInvoicePdf(entry, storeName, storePhone, storeAddress);
    } catch (err) {
      console.error('Invoice PDF error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    const printableElement = document.getElementById('printable-invoice-sheet');
    if (printableElement) {
      safePrintHtml(printableElement.innerHTML, `Invoice #${entry.id.replace('entry-', '').toUpperCase().slice(0, 8)}`);
    } else {
      window.print();
    }
  };

  const lines =
    entry.lines && entry.lines.length > 0
      ? entry.lines
      : [
          {
            productId: entry.productId || 'item',
            productName: entry.productName || 'Sale Item',
            standardQuantity: 'Units',
            quantity: entry.quantity || 1,
            unitPrice: entry.unitPrice || entry.amount,
            buyPriceAtSale: 0,
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 printable-card">
        {/* Header & Controls */}
        <div className="flex items-center justify-between border-b border-[#26313B] pb-4 no-print">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#17D5B3]" />
            <h3 className="font-extrabold text-base text-[#F4F8FB]">{t('invoice', lang)}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] rounded-lg text-xs font-black transition-all cursor-pointer disabled:opacity-50"
              title="Download Invoice as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'PDF...' : 'Save PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[#F4F8FB] rounded-lg text-xs font-bold transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-[#17D5B3]" />
              <span>{t('printInvoice', lang)}</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice-sheet" className="space-y-4 text-xs">
          {/* Store Branding Header */}
          <div className="text-center border-b border-[#26313B] pb-3">
            <h2 className="text-lg font-black text-[#F4F8FB]">{storeName}</h2>
            <p className="text-[11px] text-[#A8B5C2]">{storeAddress}</p>
            <p className="text-[11px] text-[#A8B5C2]">Phone: {storePhone}</p>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 bg-[#161C23] p-3 rounded-xl border border-[#26313B]">
            <div>
              <span className="text-[#A8B5C2] block text-[10px]">Invoice Ref</span>
              <span className="font-mono font-bold text-[#F4F8FB] text-xs">
                #{entry.id.replace('entry-', '').toUpperCase().slice(0, 8)}
              </span>
              <span className="text-[#A8B5C2] block text-[10px] mt-1">Date & Time</span>
              <span className="text-[#F4F8FB] text-xs">{formatDateTime(entry.createdAt)}</span>
            </div>

            <div className="text-right">
              <span className="text-[#A8B5C2] block text-[10px]">Billed Customer</span>
              <span className="font-bold text-[#17D5B3] text-xs block">
                {entry.customerName || 'Walk-in Retail Buyer'}
              </span>
              {entry.customerPhone && (
                <span className="text-[#A8B5C2] text-[11px]">{entry.customerPhone}</span>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-[#26313B] rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#161C23] text-[#A8B5C2] text-[10px] uppercase font-bold border-b border-[#26313B]">
                <tr>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26313B] text-xs">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-[#161C23]/40">
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#F4F8FB] block">{line.productName}</span>
                      <span className="text-[10px] text-[#A8B5C2]">{line.standardQuantity}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">{line.quantity}</td>
                    <td className="py-2.5 px-2 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#F4F8FB]">
                      {formatCurrency(line.quantity * line.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#A8B5C2]">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-[#F4F8FB]">{formatCurrency(entry.amount)}</span>
            </div>
            {entry.gstAmount > 0 && (
              <div className="flex justify-between text-[#A8B5C2]">
                <span>GST ({entry.gstRate}% included):</span>
                <span className="font-mono text-[#F4F8FB]">{formatCurrency(entry.gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#F4F8FB] font-black text-sm border-t border-[#26313B] pt-1.5">
              <span>Grand Total:</span>
              <span className="font-mono text-[#17D5B3]">{formatCurrency(entry.amount)}</span>
            </div>
            <div className="flex justify-between text-[#A8B5C2] pt-1">
              <span>Paid Amount:</span>
              <span className="font-mono text-[#17D5B3] font-bold">{formatCurrency(entry.paidAmount)}</span>
            </div>
            {Boolean(entry.dueAmount && entry.dueAmount > 0) && (
              <div className="flex justify-between text-[#FF6F91] font-bold">
                <span>Remaining Due:</span>
                <span className="font-mono">{formatCurrency(entry.dueAmount || 0)}</span>
              </div>
            )}
          </div>

          {/* Invoice Barcode & Footer Note */}
          <div className="flex flex-col items-center justify-center pt-2 border-t border-[#26313B] space-y-1 text-center">
            <div className="bg-white p-1.5 rounded-lg border border-[#E2E8F0] shadow-sm">
              <BarcodeImage
                value={entry.id.replace('entry-', '').toUpperCase().slice(0, 10)}
                productName={`Invoice-${entry.id.slice(-6)}`}
                width={1.2}
                height={26}
                fontSize={9}
                displayValue={true}
                showActions={false}
              />
            </div>
            <p className="text-[10px] text-[#A8B5C2]">Thank you for shopping with us! Please visit again.</p>
            <p className="text-[9px] text-[#A8B5C2]/70">Powered by hisapkitap • Smart Shop Ledger & POS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
