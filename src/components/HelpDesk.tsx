import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileQuestion,
  ExternalLink,
  Play,
  Video,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { t, LANGUAGES } from '../data/translations';
import { DEFAULT_STORE_INFO } from '../data/starterData';
import { TutorialVideoPlayer, TUTORIAL_DATA } from './TutorialVideoPlayer';
import { generateFeaturesOnlyPdf } from '../utils/pdfGenerator';
import { Download } from 'lucide-react';

interface HelpDeskProps {
  lang: LanguageCode;
  onOpenPdfManual?: () => void;
}

export const HelpDesk: React.FC<HelpDeskProps> = ({ lang, onOpenPdfManual }) => {
  const [complaintText, setComplaintText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedTutorial, setSelectedTutorial] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I record a sale and bill a customer?',
      a: 'Navigate to "Quick Entry" in the navigation bar. You can select products from your catalog, adjust quantities, select an existing customer or leave it as walk-in, enter the paid amount, and click "Complete Sale". The inventory stock and customer credit will update automatically.',
    },
    {
      q: 'How does Customer Udhar Khata (Credit Ledger) work?',
      a: 'When you make a sale and the paid amount is less than the total bill, the remaining amount is automatically recorded in the selected customer’s balance. You can view all customer balances under the "Customers" tab, record partial payments, and send instant WhatsApp payment reminders.',
    },
    {
      q: 'Where is my store data stored and how do I back it up?',
      a: 'All product catalogs, transaction histories, customer ledgers, and credentials are saved locally in your browser storage. You can go to the "Reports" tab at any time to copy or download a complete JSON backup file, or restore from a previous backup.',
    },
    {
      q: 'How do I accept payments via UPI QR code?',
      a: 'Click on the UPI QR code button on the Dashboard or in the Customers tab. You can configure your UPI ID in your Profile settings. Customers can scan the QR code with Google Pay, PhonePe, Paytm, or BHIM to pay instantly.',
    },
  ];

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    setSubmitted(true);
    setComplaintText('');
    setSenderName('');
    setSenderEmail('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F8FB] flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#17D5B3]" />
            <span>{t('helpDesk', lang)}</span>
          </h2>
          <p className="text-xs text-[#A8B5C2] mt-0.5">
            {t('helpSubtitle', lang)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => generateFeaturesOnlyPdf()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-black text-xs transition-all shadow-md shadow-[#17D5B3]/20 active:scale-95 cursor-pointer"
            title="Download Step-by-Step PDF Guide for Dashboard, Account Setup, Adding Products, POS Billing, Invoices, Udhar Khata, Reports & HelpDesk"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Feature Guide (.pdf)</span>
          </button>

          {onOpenPdfManual && (
            <button
              onClick={onOpenPdfManual}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161C23] border border-[#26313B] hover:border-[#54B6FF]/50 text-[#54B6FF] font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Manual & Video Scripts</span>
            </button>
          )}
        </div>

      </div>

      {/* Support Contact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href={`tel:${DEFAULT_STORE_INFO.supportPhone}`}
          className="bg-[#101419] border border-[#26313B] hover:border-[#17D5B3]/50 rounded-xl p-4 flex items-center gap-3 transition-colors group"
        >
          <div className="p-3 rounded-lg bg-[#17D5B3]/10 text-[#17D5B3] group-hover:bg-[#17D5B3] group-hover:text-[#050608] transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A8B5C2] tracking-wider block">
              {t('callSupport', lang)}
            </span>
            <span className="text-xs font-bold text-[#F4F8FB] block mt-0.5">
              {DEFAULT_STORE_INFO.supportPhone}
            </span>
          </div>
        </a>

        <a
          href={`mailto:${DEFAULT_STORE_INFO.complaintEmail}`}
          className="bg-[#101419] border border-[#26313B] hover:border-[#54B6FF]/50 rounded-xl p-4 flex items-center gap-3 transition-colors group"
        >
          <div className="p-3 rounded-lg bg-[#54B6FF]/10 text-[#54B6FF] group-hover:bg-[#54B6FF] group-hover:text-[#050608] transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A8B5C2] tracking-wider block">
              Email Support
            </span>
            <span className="text-xs font-bold text-[#F4F8FB] block mt-0.5 truncate max-w-[150px]">
              {DEFAULT_STORE_INFO.complaintEmail}
            </span>
          </div>
        </a>

        <div className="bg-[#101419] border border-[#26313B] rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#9B7CFF]/10 text-[#9B7CFF]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#A8B5C2] tracking-wider block">
              Headquarters
            </span>
            <span className="text-xs font-bold text-[#F4F8FB] block mt-0.5">
              Guwahati, Assam, India
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Feedback / Complaint Box */}
      <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#26313B] pb-3">
          <Send className="w-5 h-5 text-[#17D5B3]" />
          <div>
            <h3 className="font-extrabold text-base text-[#F4F8FB]">
              {t('sendFeedback', lang)} / Complaint Ticket
            </h3>
            <p className="text-xs text-[#A8B5C2]">
              Need a new feature or encountering an issue? Let us know directly.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/50 text-[#17D5B3] text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{t('feedbackSent', lang)} Thank you for your feedback!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitComplaint} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Store Manager"
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                  Contact Email / Phone
                </label>
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A8B5C2] block mb-1.5">
                Issue Description or Feature Request
              </label>
              <textarea
                rows={3}
                required
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none placeholder-[#A8B5C2]/60"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-bold text-xs shadow-lg shadow-[#17D5B3]/20 transition-colors flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('submitFeedback', lang)}</span>
            </button>
          </form>
        )}
      </div>

      {/* Master Video Tutorial & Interactive Step Guides */}
      <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26313B] pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#FF6F91]" />
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB]">
                Video Tutorial & Interactive App Guide
              </h3>
              <p className="text-xs text-[#A8B5C2]">
                Watch the complete walkthrough covering POS billing, customer ledgers, and inventory management.
              </p>
            </div>
          </div>

          {onOpenPdfManual && (
            <button
              onClick={onOpenPdfManual}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161C23] border border-[#26313B] hover:border-[#17D5B3]/50 text-[#17D5B3] text-xs font-bold transition-colors self-start sm:self-center"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>PDF Video Storyboard</span>
            </button>
          )}
        </div>

        {/* Unified Master Video Showcase Card */}
        <div className="bg-[#161C23] border border-[#26313B] hover:border-[#FF6F91]/40 rounded-2xl p-5 sm:p-6 transition-all relative overflow-hidden group">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FF6F91]/10 to-[#17D5B3]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FF6F91] bg-[#FF6F91]/15 border border-[#FF6F91]/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-current" />
                  Master Video Tutorial
                </span>
                <span className="text-[10px] font-bold text-[#17D5B3] bg-[#17D5B3]/10 border border-[#17D5B3]/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Ultra-Realistic Human Voice
                </span>
                <span className="text-[10px] font-mono text-[#A8B5C2] bg-[#101419] px-2.5 py-1 rounded-full border border-[#26313B]">
                  ⏱️ 3 Mins Full Walkthrough
                </span>
              </div>

              <h4 className="text-lg sm:text-xl font-black text-[#F4F8FB] tracking-tight">
                Hisap Kitap Complete Application Tutorial
              </h4>

              <p className="text-xs sm:text-sm text-[#A8B5C2] leading-relaxed">
                Step-by-step master video demonstration with studio voice narration in English, অসমীয়া (Assamese), বাংলা (Bengali), and हिन्दी (Hindi).
              </p>

              {/* 8-Chapter Roadmap Badges */}
              <div className="pt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">1.</span> Store Setup & PIN
                </div>
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">2.</span> Live Dashboard
                </div>
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">3.</span> Product Catalog
                </div>
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">4.</span> Fast POS Billing
                </div>
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">5.</span> Invoices & Thermal
                </div>
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">6.</span> Udhar Khata
                </div>
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">7.</span> Dynamic UPI QR
                </div>
                <div className="p-2 rounded-lg bg-[#101419] border border-[#26313B] text-[11px] font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <span className="text-[#17D5B3]">8.</span> Offline Backup
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="shrink-0 flex flex-col justify-center items-center gap-3">
              <button
                onClick={() => setSelectedTutorial(0)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF6F91] to-[#FF557F] hover:from-[#FF557F] hover:to-[#E63E68] text-[#050608] text-sm font-black flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#FF6F91]/25 active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#050608] text-[#FF6F91] flex items-center justify-center">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
                <span>Play Video Tutorial</span>
              </button>

              <span className="text-[11px] text-[#A8B5C2] text-center">
                Interactive Player with Chapter Timeline & Multilingual Voice
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Playable Video Player Modal */}
        {selectedTutorial !== null && (
          <TutorialVideoPlayer
            initialTutorialIndex={0}
            lang={'en'}
            onClose={() => setSelectedTutorial(null)}
            onOpenPdfManual={onOpenPdfManual}
          />
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#26313B] pb-3">
          <FileQuestion className="w-5 h-5 text-[#54B6FF]" />
          <h3 className="font-extrabold text-base text-[#F4F8FB]">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#161C23] border border-[#26313B] rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#F4F8FB] hover:text-[#17D5B3] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#17D5B3]" /> : <ChevronDown className="w-4 h-4 text-[#A8B5C2]" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#A8B5C2] leading-relaxed border-t border-[#26313B]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
