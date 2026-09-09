import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Clock,
  BarChart3,
  Users,
  HelpCircle,
  Lock,
  User as UserIcon,
  Globe,
  Sparkles,
  GitBranch,
  BookOpen,
} from 'lucide-react';
import { AppUser, LanguageCode } from '../types';
import { LANGUAGES, t } from '../data/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentUser: AppUser | null;
  onOpenProfile: () => void;
  onLockApp: () => void;
  onSignOut: () => void;
  onOpenPublish: () => void;
  onOpenPdfManual?: () => void;
  lowStockCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  onLanguageChange,
  currentUser,
  onOpenProfile,
  onLockApp,
  onOpenPublish,
  onOpenPdfManual,
  lowStockCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: t('dashboard', lang), icon: LayoutDashboard },
    { id: 'products', label: t('products', lang), icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'entry', label: t('entries', lang), icon: PlusCircle, highlight: true },
    { id: 'history', label: t('history', lang), icon: Clock },
    { id: 'reports', label: t('reports', lang), icon: BarChart3 },
    { id: 'customers', label: t('customers', lang), icon: Users },
    { id: 'help', label: t('helpDesk', lang), icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#101419]/95 backdrop-blur-md border-b border-[#26313B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#17D5B3] via-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#17D5B3]/20 group-hover:scale-105 transition-transform">
                <span className="font-mono font-extrabold text-[#050608] text-lg tracking-tight">HK</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-extrabold tracking-tight text-[#F4F8FB] group-hover:text-[#17D5B3] transition-colors">
                    {t('appName', lang)}
                  </h1>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#161C23] border border-[#26313B] text-[#17D5B3] px-1.5 py-0.5 rounded">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-[#A8B5C2] hidden sm:block">
                  {t('tagline', lang)}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#17D5B3]/15 text-[#17D5B3] border border-[#17D5B3]/40 shadow-sm'
                      : item.highlight
                      ? 'text-[#FFC857] hover:bg-[#FFC857]/10'
                      : 'text-[#A8B5C2] hover:text-[#F4F8FB] hover:bg-[#161C23]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#17D5B3]' : item.highlight ? 'text-[#FFC857]' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 bg-[#FF6F91] text-[#050608] text-[10px] font-extrabold rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Language, App Lock, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 bg-[#161C23] border border-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                <Globe className="w-3.5 h-3.5 text-[#17D5B3]" />
                <select
                  value={lang}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="bg-transparent border-none text-[#F4F8FB] text-xs font-semibold cursor-pointer focus:outline-none pr-1"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#101419] text-[#F4F8FB]">
                      {l.nativeLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PDF Guide Button */}
            {onOpenPdfManual && (
              <button
                onClick={onOpenPdfManual}
                title="Download App Understanding & Tutorial PDF Guide"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161C23] border border-[#26313B] hover:border-[#54B6FF]/50 text-[#54B6FF] text-xs font-bold transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">PDF Guide</span>
              </button>
            )}

            {/* Publish Button */}
            <button
              onClick={onOpenPublish}
              title="Publish to GitHub / GitLab"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161C23] border border-[#26313B] hover:border-[#17D5B3]/50 text-[#17D5B3] text-xs font-bold transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">Publish</span>
            </button>

            {/* Quick Lock Button */}
            {currentUser?.appLockEnabled && (
              <button
                onClick={onLockApp}
                title={t('lockNow', lang)}
                className="p-2 rounded-lg bg-[#161C23] border border-[#26313B] text-[#FFC857] hover:bg-[#FFC857]/10 hover:border-[#FFC857]/50 transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* User Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] hover:border-[#17D5B3]/50 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-[#17D5B3]/20 border border-[#17D5B3]/40 flex items-center justify-center text-[#17D5B3] text-xs font-bold font-mono">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-[#F4F8FB] max-w-[100px] truncate leading-tight">
                  {currentUser?.name || 'Owner'}
                </div>
                <div className="text-[10px] font-semibold text-[#17D5B3] capitalize leading-none">
                  {currentUser?.role === 'owner' ? t('ownerRole', lang).split(' ')[0] : t('staffRole', lang).split(' ')[0]}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-1.5 no-scrollbar border-t border-[#26313B]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#17D5B3] text-[#050608] font-bold shadow-md shadow-[#17D5B3]/20'
                    : 'bg-[#161C23] text-[#A8B5C2] hover:text-[#F4F8FB] border border-[#26313B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1 py-0.2 text-[9px] font-black rounded-full ${isActive ? 'bg-[#050608] text-[#17D5B3]' : 'bg-[#FF6F91] text-[#050608]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
