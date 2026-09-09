import React, { useState } from 'react';
import { Lock, User, KeyRound, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { AppUser, UserRole, LanguageCode } from '../../types';
import { t } from '../../data/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  users: AppUser[];
  onSignIn: (user: AppUser) => void;
  onCreateUser: (user: AppUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  users,
  onSignIn,
  onCreateUser,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [enteredPin, setEnteredPin] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('owner');
  const [newPin, setNewPin] = useState('1234');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find((u) => u.id === selectedUserId);
    if (!user) {
      setError('User not found.');
      return;
    }
    if (user.appLockEnabled && user.lockPin && user.lockPin !== enteredPin) {
      setError(t('pinIncorrect', lang));
      return;
    }
    onSignIn(user);
    onClose();
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please provide a name.');
      return;
    }
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      role,
      appLockEnabled: Boolean(newPin),
      lockPin: newPin.trim() || '1234',
    };
    onCreateUser(newUser);
    onSignIn(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#F4F8FB]">
            {mode === 'signin' ? t('login', lang) : t('createAccount', lang)}
          </h3>
          <p className="text-xs text-[#A8B5C2]">
            {t('authSubtitle', lang)}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FF6F91]/15 border border-[#FF6F91]/40 flex items-center gap-2 text-xs font-bold text-[#FF6F91]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex bg-[#161C23] p-1 border border-[#26313B] rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signin' ? 'bg-[#17D5B3] text-[#050608]' : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            {t('login', lang)}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signup' ? 'bg-[#17D5B3] text-[#050608]' : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            New Staff / Owner
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1.5">
                Select User Profile
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {users.find((u) => u.id === selectedUserId)?.appLockEnabled && (
              <div>
                <label className="font-semibold text-[#A8B5C2] block mb-1.5">
                  Enter 4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-[#F4F8FB] focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-black text-sm shadow-lg shadow-[#17D5B3]/20 transition-all"
            >
              Sign In to Store
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm text-[#F4F8FB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-[#A8B5C2] block mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm text-[#F4F8FB] focus:outline-none"
                >
                  <option value="owner">{t('ownerRole', lang)}</option>
                  <option value="staff">{t('staffRole', lang)}</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#A8B5C2] block mb-1">
                  App PIN Code
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm font-mono text-[#F4F8FB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@store.com"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm text-[#F4F8FB] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-black text-sm shadow-lg shadow-[#17D5B3]/20 transition-all mt-2"
            >
              Create & Login
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-xs text-[#A8B5C2] hover:text-[#F4F8FB]"
        >
          {t('cancel', lang)}
        </button>
      </div>
    </div>
  );
};

interface AppLockModalProps {
  isOpen: boolean;
  currentUser: AppUser | null;
  lang: LanguageCode;
  onUnlock: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isOpen,
  currentUser,
  lang,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.lockPin && currentUser.lockPin !== pin) {
      setError(t('pinIncorrect', lang));
      setPin('');
      return;
    }
    setError('');
    setPin('');
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/95 backdrop-blur-md">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#FFC857]/20 border border-[#FFC857]/40 text-[#FFC857] flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-[#F4F8FB]">
            {t('appLocked', lang)}
          </h3>
          <p className="text-xs text-[#A8B5C2] mt-1">
            Enter PIN for <span className="text-[#17D5B3] font-bold">{currentUser?.name || 'Owner'}</span>
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-[#FF6F91]/20 text-[#FF6F91] text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            autoFocus
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#FFC857] rounded-xl py-3 text-center text-2xl font-mono tracking-widest text-[#F4F8FB] focus:outline-none"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#FFC857] hover:bg-[#ffbe3b] text-[#050608] font-black text-sm shadow-lg shadow-[#FFC857]/20 transition-all"
          >
            {t('unlockApp', lang)}
          </button>
        </form>
      </div>
    </div>
  );
};
