import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { Customer, CustomerLedgerEntry, LanguageCode } from '../../types';
import { t } from '../../data/translations';
import { formatCurrency } from '../../utils/formatters';

interface CustomerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  customer: Customer | null;
  defaultType: 'credit' | 'debit';
  onSaveEntry: (entry: Omit<CustomerLedgerEntry, 'id' | 'createdAt'>) => void;
}

export const CustomerEntryModal: React.FC<CustomerEntryModalProps> = ({
  isOpen,
  onClose,
  lang,
  customer,
  defaultType,
  onSaveEntry,
}) => {
  const [type, setType] = useState<'credit' | 'debit'>(defaultType);
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setAmount('');
      setPaymentMethod('cash');
      setNote('');
      setError('');
    }
  }, [isOpen, defaultType, customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError(t('invalidNumber', lang));
      return;
    }

    onSaveEntry({
      customerId: customer.id,
      customerName: customer.name,
      type,
      amount: amt,
      paymentMethod: type === 'debit' ? paymentMethod : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#26313B] pb-4">
          <div>
            <h3 className="font-extrabold text-base text-[#F4F8FB]">
              {type === 'credit' ? t('gaveCredit', lang) : t('receivedPayment', lang)}
            </h3>
            <p className="text-xs text-[#A8B5C2]">
              Customer: <span className="font-bold text-[#F4F8FB]">{customer.name}</span> (Balance: {formatCurrency(customer.balance)})
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FF6F91]/20 text-[#FF6F91] text-xs font-bold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type switcher */}
          <div className="flex bg-[#161C23] p-1 border border-[#26313B] rounded-xl font-bold">
            <button
              type="button"
              onClick={() => setType('credit')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'credit' ? 'bg-[#FF6F91] text-[#050608]' : 'text-[#A8B5C2]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Gave Credit (+ Due)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('debit')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'debit' ? 'bg-[#17D5B3] text-[#050608]' : 'text-[#A8B5C2]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Received Pay (- Due)</span>
            </button>
          </div>

          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#A8B5C2]">₹</span>
              <input
                type="number"
                min="1"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl pl-8 pr-3.5 py-2.5 text-base font-mono text-[#F4F8FB] focus:outline-none"
              />
            </div>
          </div>

          {type === 'debit' && (
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2 text-sm text-[#F4F8FB] focus:outline-none"
              >
                <option value="cash">Cash in hand</option>
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="bank">Bank Transfer / Cheque</option>
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">Remarks / Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cleared part balance / Goods on credit"
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2 text-sm text-[#F4F8FB] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] rounded-xl font-bold"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-xl font-black text-[#050608] shadow-lg ${
                type === 'credit'
                  ? 'bg-[#FF6F91] hover:bg-[#ff577f]'
                  : 'bg-[#17D5B3] hover:bg-[#15C2A3]'
              }`}
            >
              Record Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
