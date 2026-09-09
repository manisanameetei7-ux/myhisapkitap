import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  QrCode,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Receipt,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Customer, CustomerLedgerEntry, LanguageCode } from '../types';
import { t } from '../data/translations';
import { formatCurrency, formatDateTime, generateWhatsAppLink } from '../utils/formatters';

interface CustomersProps {
  lang: LanguageCode;
  customers: Customer[];
  customerEntries: CustomerLedgerEntry[];
  canManage: boolean;
  onAddCustomer: () => void;
  onDeleteCustomer: (id: string) => void;
  onOpenCustomerEntryModal: (customer: Customer, defaultType: 'credit' | 'debit') => void;
  onOpenPaymentQr: (customer: Customer) => void;
}

export const Customers: React.FC<CustomersProps> = ({
  lang,
  customers,
  customerEntries,
  canManage,
  onAddCustomer,
  onDeleteCustomer,
  onOpenCustomerEntryModal,
  onOpenPaymentQr,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customers.length > 0 ? customers[0].id : null
  );

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || filteredCustomers[0] || null;

  const currentCustomerEntries = customerEntries
    .filter((e) => e.customerId === selectedCustomer?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalDuesAll = customers.reduce((sum, c) => sum + c.balance, 0);

  const handleSendWhatsAppReminder = (customer: Customer) => {
    if (!customer.phone) {
      alert('This customer does not have a phone number saved.');
      return;
    }
    const message = `Hello ${customer.name}, this is a gentle reminder from hisapkitap Store that you have an outstanding balance of ${formatCurrency(customer.balance)}. Kindly settle at your convenience via UPI or cash. Thank you!`;
    const link = generateWhatsAppLink(customer.phone, message);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F8FB] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#9B7CFF]" />
            <span>{t('customers', lang)} (Udhar Khata)</span>
          </h2>
          <p className="text-xs text-[#A8B5C2] mt-0.5">
            Credit accounts, payment receipts, balance tracking, and automated reminders.
          </p>
        </div>

        <button
          onClick={onAddCustomer}
          className="flex items-center gap-2 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#17D5B3]/20 transition-all text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addCustomer', lang)}</span>
        </button>
      </div>

      {/* Main Two-Column Khata Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Total Dues Banner */}
          <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#A8B5C2] font-semibold">{t('customerDue', lang)}</span>
              <div className="text-xl font-black text-[#FF6F91] font-mono mt-0.5">
                {formatCurrency(totalDuesAll)}
              </div>
            </div>
            <span className="text-xs font-bold text-[#A8B5C2] bg-[#161C23] border border-[#26313B] px-2.5 py-1 rounded-lg">
              {customers.length} Accounts
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#A8B5C2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCustomers', lang)}
              className="w-full bg-[#101419] border border-[#26313B] focus:border-[#9B7CFF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F4F8FB] placeholder-[#A8B5C2]/60 focus:outline-none"
            />
          </div>

          {/* Customer Cards List */}
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-10 bg-[#101419] border border-dashed border-[#26313B] rounded-xl">
              <Users className="w-10 h-10 text-[#A8B5C2]/40 mx-auto mb-2" />
              <p className="text-xs text-[#A8B5C2]">{t('emptyCustomers', lang)}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#161C23] border-[#9B7CFF] shadow-md shadow-[#9B7CFF]/10'
                        : 'bg-[#101419] border-[#26313B] hover:border-[#9B7CFF]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#F4F8FB] truncate flex items-center gap-2">
                          <span>{cust.name}</span>
                          {cust.balance > 0 && (
                            <span className="w-2 h-2 rounded-full bg-[#FF6F91]" />
                          )}
                        </div>
                        <div className="text-xs text-[#A8B5C2] flex items-center gap-1.5 mt-0.5">
                          {cust.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#17D5B3]" /> {cust.phone}
                            </span>
                          ) : (
                            <span className="text-[#A8B5C2]/60">No phone</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-black font-mono ${
                            cust.balance > 0 ? 'text-[#FF6F91]' : 'text-[#17D5B3]'
                          }`}
                        >
                          {formatCurrency(cust.balance)}
                        </div>
                        <span className="text-[10px] text-[#A8B5C2]">
                          {cust.balance > 0 ? 'Pending' : 'Settled'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Customer's Full Khata Details */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 space-y-6">
              {/* Profile Card & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26313B] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-[#F4F8FB]">
                      {selectedCustomer.name}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                        selectedCustomer.balance > 0
                          ? 'bg-[#FF6F91]/20 text-[#FF6F91]'
                          : 'bg-[#17D5B3]/20 text-[#17D5B3]'
                      }`}
                    >
                      {selectedCustomer.balance > 0 ? 'Due Active' : 'Zero Balance'}
                    </span>
                  </div>

                  <div className="text-xs text-[#A8B5C2] space-y-0.5 mt-1.5">
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#17D5B3]" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#54B6FF]" />
                        <span>{selectedCustomer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance Display & Reminder */}
                <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <div>
                    <span className="text-xs text-[#A8B5C2] block">Current Balance</span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        selectedCustomer.balance > 0 ? 'text-[#FF6F91]' : 'text-[#17D5B3]'
                      }`}
                    >
                      {formatCurrency(selectedCustomer.balance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedCustomer.balance > 0 && (
                      <>
                        <button
                          onClick={() => onOpenPaymentQr(selectedCustomer)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17D5B3]/10 hover:bg-[#17D5B3]/20 border border-[#17D5B3]/30 text-[#17D5B3] rounded-lg text-xs font-bold transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>UPI QR</span>
                        </button>

                        {selectedCustomer.phone && (
                          <button
                            onClick={() => handleSendWhatsAppReminder(selectedCustomer)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] rounded-lg text-xs font-bold transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </>
                    )}

                    {canManage && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete khata for "${selectedCustomer.name}"?`)) {
                            onDeleteCustomer(selectedCustomer.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#161C23] hover:bg-[#FF6F91]/20 text-[#A8B5C2] hover:text-[#FF6F91] border border-[#26313B] transition-colors"
                        title={t('delete', lang)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Transaction Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onOpenCustomerEntryModal(selectedCustomer, 'credit')}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF6F91]/15 hover:bg-[#FF6F91]/25 border border-[#FF6F91]/40 text-[#FF6F91] font-bold text-xs transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{t('gaveCredit', lang)} (+ Due)</span>
                </button>

                <button
                  onClick={() => onOpenCustomerEntryModal(selectedCustomer, 'debit')}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#17D5B3]/15 hover:bg-[#17D5B3]/25 border border-[#17D5B3]/40 text-[#17D5B3] font-bold text-xs transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{t('receivedPayment', lang)} (- Settle)</span>
                </button>
              </div>

              {/* Ledger Statement Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#F4F8FB] uppercase tracking-wider flex items-center justify-between">
                  <span>Ledger Statement & Transactions</span>
                  <span className="text-[#A8B5C2] font-mono text-[11px]">
                    {currentCustomerEntries.length} Records
                  </span>
                </h4>

                {currentCustomerEntries.length === 0 ? (
                  <div className="text-center py-8 bg-[#161C23]/60 border border-dashed border-[#26313B] rounded-xl text-xs text-[#A8B5C2]">
                    No custom credit/debit records yet for this customer.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {currentCustomerEntries.map((item) => {
                      const isCredit = item.type === 'credit';
                      return (
                        <div
                          key={item.id}
                          className="bg-[#161C23] border border-[#26313B] rounded-xl p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                isCredit
                                  ? 'bg-[#FF6F91]/20 text-[#FF6F91]'
                                  : 'bg-[#17D5B3]/20 text-[#17D5B3]'
                              }`}
                            >
                              {isCredit ? '+' : '-'}
                            </div>

                            <div>
                              <div className="font-semibold text-xs text-[#F4F8FB]">
                                {isCredit ? t('gaveCredit', lang) : t('receivedPayment', lang)}
                              </div>
                              <div className="text-[11px] text-[#A8B5C2] flex items-center gap-2">
                                <span>{formatDateTime(item.createdAt)}</span>
                                {item.paymentMethod && (
                                  <span className="uppercase text-[9px] bg-[#101419] border border-[#26313B] px-1 rounded">
                                    {item.paymentMethod}
                                  </span>
                                )}
                              </div>
                              {item.note && (
                                <p className="text-[11px] text-[#A8B5C2]/80 mt-0.5">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`text-sm font-black font-mono ${
                                isCredit ? 'text-[#FF6F91]' : 'text-[#17D5B3]'
                              }`}
                            >
                              {isCredit ? '+' : '-'}
                              {formatCurrency(item.amount)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-[#101419] border border-dashed border-[#26313B] rounded-2xl">
              <Users className="w-12 h-12 text-[#A8B5C2]/40 mx-auto mb-3" />
              <p className="text-sm text-[#A8B5C2]">Select a customer to view ledger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
