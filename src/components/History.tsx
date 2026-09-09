import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Trash2,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LedgerEntry, EntryType, LanguageCode } from '../types';
import { t } from '../data/translations';
import { formatCurrency, formatDateTime, isSameDay } from '../utils/formatters';

interface HistoryProps {
  lang: LanguageCode;
  entries: LedgerEntry[];
  canManage: boolean;
  onDeleteEntry: (id: string) => void;
  onOpenInvoice: (entry: LedgerEntry) => void;
}

export const History: React.FC<HistoryProps> = ({
  lang,
  entries,
  canManage,
  onDeleteEntry,
  onOpenInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EntryType | 'all'>('all');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const today = new Date();

  const filteredEntries = entries.filter((entry) => {
    if (showTodayOnly && !isSameDay(entry.createdAt, today)) {
      return false;
    }
    if (filterType !== 'all' && entry.type !== filterType) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      (entry.productName && entry.productName.toLowerCase().includes(q)) ||
      (entry.customerName && entry.customerName.toLowerCase().includes(q)) ||
      (entry.note && entry.note.toLowerCase().includes(q)) ||
      entry.lines.some((l) => l.productName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F8FB] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#17D5B3]" />
            <span>{t('history', lang)}</span>
            <span className="text-xs bg-[#161C23] border border-[#26313B] text-[#A8B5C2] px-2 py-0.5 rounded-full font-mono">
              {filteredEntries.length}
            </span>
          </h2>
          <p className="text-xs text-[#A8B5C2] mt-0.5">
            Audit log of all sales, stock purchases, expenses, and dues.
          </p>
        </div>

        {/* Today vs All Toggle */}
        <div className="flex bg-[#101419] p-1 border border-[#26313B] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setShowTodayOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !showTodayOnly
                ? 'bg-[#17D5B3] text-[#050608]'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            {t('all', lang)}
          </button>
          <button
            onClick={() => setShowTodayOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showTodayOnly
                ? 'bg-[#17D5B3] text-[#050608]'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            {t('today', lang)}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#101419] border border-[#26313B] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A8B5C2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchHistory', lang)}
            className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F4F8FB] placeholder-[#A8B5C2]/60 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A8B5C2] hover:text-[#F4F8FB]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {(
            [
              { id: 'all', label: t('all', lang) },
              { id: 'saleOut', label: t('saleOut', lang) },
              { id: 'stockIn', label: t('stockIn', lang) },
              { id: 'investment', label: t('investment', lang) },
            ] as const
          ).map((tBtn) => (
            <button
              key={tBtn.id}
              onClick={() => setFilterType(tBtn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tBtn.id
                  ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                  : 'bg-[#161C23] text-[#A8B5C2] hover:text-[#F4F8FB] border border-[#26313B]'
              }`}
            >
              {tBtn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table / List */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-[#101419] border border-dashed border-[#26313B] rounded-2xl">
          <Clock className="w-12 h-12 text-[#A8B5C2]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#F4F8FB]">{t('emptyHistory', lang)}</h3>
          <p className="text-xs text-[#A8B5C2] mt-1">Try changing your search keywords or filter settings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const isSale = entry.type === 'saleOut';
            const isStockIn = entry.type === 'stockIn';
            const isInvest = entry.type === 'investment';
            const isExpanded = expandedId === entry.id;

            const title =
              entry.productName ||
              (entry.lines.length > 0
                ? entry.lines.map((l) => l.productName).join(', ')
                : entry.note || (isInvest ? 'General Expense' : 'Transaction'));

            const profit = isSale ? entry.amount - entry.costAmount : 0;

            return (
              <div
                key={entry.id}
                className="bg-[#101419] border border-[#26313B] hover:border-[#17D5B3]/40 rounded-xl overflow-hidden transition-all"
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isSale
                          ? 'bg-[#17D5B3]/20 text-[#17D5B3] border border-[#17D5B3]/40'
                          : isStockIn
                          ? 'bg-[#54B6FF]/20 text-[#54B6FF] border border-[#54B6FF]/40'
                          : 'bg-[#FF6F91]/20 text-[#FF6F91] border border-[#FF6F91]/40'
                      }`}
                    >
                      {isSale ? <ArrowUpRight className="w-5 h-5" /> : isStockIn ? <ArrowDownLeft className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#F4F8FB] truncate max-w-md">
                          {title}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isSale
                              ? 'bg-[#17D5B3]/10 text-[#17D5B3]'
                              : isStockIn
                              ? 'bg-[#54B6FF]/10 text-[#54B6FF]'
                              : 'bg-[#FF6F91]/10 text-[#FF6F91]'
                          }`}
                        >
                          {isSale ? 'Sale Out' : isStockIn ? 'Stock In' : 'Investment'}
                        </span>
                      </div>

                      <div className="text-xs text-[#A8B5C2] mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{formatDateTime(entry.createdAt)}</span>
                        {entry.customerName && (
                          <span className="text-[#17D5B3] font-medium">
                            • Customer: {entry.customerName}
                          </span>
                        )}
                        {entry.note && (
                          <span className="text-[#A8B5C2]/80 italic truncate max-w-xs">
                            • "{entry.note}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Values & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#26313B]">
                    <div className="text-left sm:text-right">
                      <div className={`text-base font-black font-mono ${isSale ? 'text-[#17D5B3]' : 'text-[#F4F8FB]'}`}>
                        {formatCurrency(entry.amount)}
                      </div>
                      {isSale && (
                        <div className="text-[11px] text-[#FFC857] font-semibold">
                          Profit: +{formatCurrency(profit)}
                        </div>
                      )}
                      {Boolean(entry.dueAmount && entry.dueAmount > 0) && (
                        <div className="text-[10px] text-[#FF6F91] font-bold">
                          Due: {formatCurrency(entry.dueAmount || 0)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSale && (
                        <button
                          onClick={() => onOpenInvoice(entry)}
                          title="View Invoice"
                          className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#17D5B3] border border-[#26313B] transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      )}

                      {entry.lines.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                          className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] border border-[#26313B] transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      {canManage && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this transaction? Stock will be reversed.')) {
                              onDeleteEntry(entry.id);
                            }
                          }}
                          title={t('delete', lang)}
                          className="p-2 rounded-lg bg-[#161C23] hover:bg-[#FF6F91]/20 text-[#A8B5C2] hover:text-[#FF6F91] border border-[#26313B] hover:border-[#FF6F91]/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details / Item Breakdown */}
                {isExpanded && entry.lines.length > 0 && (
                  <div className="bg-[#161C23] border-t border-[#26313B] p-4 text-xs">
                    <h5 className="font-bold text-[#F4F8FB] mb-2">Item Breakdown</h5>
                    <div className="space-y-1.5">
                      {entry.lines.map((l, i) => (
                        <div key={i} className="flex items-center justify-between text-[#A8B5C2]">
                          <span>
                            {l.productName} ({l.standardQuantity || 'Units'}) × {l.quantity}
                          </span>
                          <span className="font-mono font-semibold text-[#F4F8FB]">
                            {formatCurrency(l.quantity * l.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
