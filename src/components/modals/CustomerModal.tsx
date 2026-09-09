import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { Customer, LanguageCode } from '../../types';
import { t } from '../../data/translations';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  onSaveCustomer: (customer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSaveCustomer,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setAddress('');
      setOpeningBalance('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('enterValidDetails', lang));
      return;
    }
    const balance = openingBalance === '' ? 0 : Number(openingBalance);
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      openingBalance: balance,
      balance: balance,
    };
    onSaveCustomer(newCust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#26313B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9B7CFF]/20 border border-[#9B7CFF]/40 text-[#9B7CFF] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB]">{t('addCustomer', lang)}</h3>
              <p className="text-xs text-[#A8B5C2]">New debtor credit account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FF6F91]/20 text-[#FF6F91] text-xs font-bold">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#9B7CFF] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">Phone Number (For WhatsApp / SMS)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#9B7CFF] rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F4F8FB] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">Address / Location</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Shop Address"
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#9B7CFF] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-[#FF6F91] block mb-1">Opening Credit Due Balance (₹)</label>
            <input
              type="number"
              min="0"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#FF6F91] rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F4F8FB] focus:outline-none"
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
              className="px-6 py-2 bg-[#9B7CFF] hover:bg-[#8762fa] text-[#050608] font-black rounded-xl shadow-lg shadow-[#9B7CFF]/20"
            >
              {t('save', lang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
