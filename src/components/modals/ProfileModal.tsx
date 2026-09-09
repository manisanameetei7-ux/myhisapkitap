import React, { useState } from 'react';
import { User, Lock, QrCode, Shield, Check, X, LogOut } from 'lucide-react';
import { AppUser, UserRole, LanguageCode } from '../../types';
import { t } from '../../data/translations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  currentUser: AppUser | null;
  onUpdateUser: (updated: AppUser) => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUser,
  onUpdateUser,
  onSignOut,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [upiId, setUpiId] = useState(currentUser?.upiId || 'manisanameetei7@okicici');
  const [appLockEnabled, setAppLockEnabled] = useState(currentUser?.appLockEnabled || false);
  const [lockPin, setLockPin] = useState(currentUser?.lockPin || '1234');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setUpiId(currentUser.upiId || 'manisanameetei7@okicici');
      setAppLockEnabled(currentUser.appLockEnabled || false);
      setLockPin(currentUser.lockPin || '1234');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      upiId: upiId.trim(),
      appLockEnabled,
      lockPin: lockPin.trim() || '1234',
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26313B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB]">{t('profile', lang)} & Store Settings</h3>
              <p className="text-xs text-[#A8B5C2]">Role: {currentUser.role.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {saved && (
          <div className="p-3 rounded-lg bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile and UPI settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@domain.com"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#17D5B3]" />
              <span>UPI Payment ID (for Customer QR Codes)</span>
            </label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#17D5B3] focus:outline-none"
            />
          </div>

          {/* App PIN Lock Settings */}
          <div className="p-3.5 bg-[#161C23] border border-[#26313B] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FFC857]" />
                <span className="font-bold text-[#F4F8FB]">{t('enableAppLock', lang)}</span>
              </div>
              <input
                type="checkbox"
                checked={appLockEnabled}
                onChange={(e) => setAppLockEnabled(e.target.checked)}
                className="w-4 h-4 text-[#17D5B3] bg-[#101419] border-[#26313B] rounded cursor-pointer"
              />
            </div>

            {appLockEnabled && (
              <div>
                <label className="font-semibold text-[#A8B5C2] block mb-1">{t('setPin', lang)}</label>
                <input
                  type="password"
                  maxLength={6}
                  value={lockPin}
                  onChange={(e) => setLockPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-[#101419] border border-[#26313B] focus:border-[#FFC857] rounded-lg px-3 py-2 text-sm font-mono text-[#F4F8FB] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="flex items-center gap-1.5 text-[#FF6F91] hover:underline font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('switchUser', lang)}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] rounded-xl font-bold"
              >
                {t('cancel', lang)}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] rounded-xl font-black shadow-lg shadow-[#17D5B3]/20"
              >
                {t('save', lang)}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
