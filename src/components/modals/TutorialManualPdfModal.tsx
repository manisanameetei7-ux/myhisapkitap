import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  BookOpen,
  CheckCircle,
  Video,
  ShoppingCart,
  Package,
  Users,
  Database,
  QrCode,
  Volume2,
  Sparkles,
  HelpCircle,
  Share2,
  Check,
  Search,
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { TUTORIAL_DATA } from '../TutorialVideoPlayer';
import { DEFAULT_STORE_INFO } from '../../data/starterData';
import { generateUserManualPdf, generateFeaturesOnlyPdf, FEATURE_GUIDE_DATA, safePrintHtml } from '../../utils/pdfGenerator';

interface TutorialManualPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  onPlayVideo?: (index: number) => void;
}

export const TutorialManualPdfModal: React.FC<TutorialManualPdfModalProps> = ({
  isOpen,
  onClose,
  lang,
  onPlayVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'features' | 'all' | 'pos' | 'inventory' | 'khata' | 'backup' | 'videos'>('features');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingFeaturePdf, setIsGeneratingFeaturePdf] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFeaturesPdf = () => {
    setIsGeneratingFeaturePdf(true);
    try {
      generateFeaturesOnlyPdf();
    } catch (err) {
      console.error('Feature PDF error:', err);
    } finally {
      setIsGeneratingFeaturePdf(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateUserManualPdf();
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    const printableElement = document.getElementById('tutorial-manual-content');
    if (printableElement) {
      safePrintHtml(printableElement.innerHTML, 'Hisap Kitap - User Manual & Tutorial Guide');
    } else {
      window.print();
    }
  };

  const handleDownloadText = () => {
    const textContent = `
===================================================================
HISAP KITAP - SMART STORE LEDGER & BILLING APP
COMPREHENSIVE USER MANUAL & VIDEO TUTORIAL GUIDE
===================================================================

Version: 1.0.0
Published: 2026
App Architecture: Full-stack React + Vite + Express + Local/Cloud Storage
Platform: Web & Mobile Progressive Web App (PWA)

-------------------------------------------------------------------
TABLE OF CONTENTS
-------------------------------------------------------------------
1. Quick Start & Setup (5-Minute Onboarding)
2. Point of Sale (POS) Fast Billing & GST Invoices
3. Inventory & Low Stock Management
4. Customer Udhar (Credit Khata) & Dynamic UPI QR
5. Financial Reports, Margins & Cashflow
6. AI Human Voice Studio (Assamese, Bengali, Hindi, English)
7. 100% Offline-First Data Privacy, JSON Backup & Restore
8. Video Tutorial Transcripts & Scene Guides
9. Frequently Asked Questions & Support

-------------------------------------------------------------------
1. QUICK START & SETUP (5-MINUTE ONBOARDING)
-------------------------------------------------------------------
Step 1: Set up your Store Profile (Store Name, Phone, UPI ID, Address).
Step 2: Review or add items to your Product Catalog with Buy and Sell prices.
Step 3: Add regular Customers who purchase on credit (Udhar).
Step 4: Go to "Quick Entry / POS" to start billing customers.
Step 5: Backup your shop data regularly via the "Reports" or "Backup" menu.

-------------------------------------------------------------------
2. POINT OF SALE (POS) FAST BILLING & GST INVOICES
-------------------------------------------------------------------
- Fast Search & Barcode Scan: Search items by name, barcode, or category.
- Custom Quantity & Pricing: Adjust quantities on the fly with live subtotal.
- Split Payment Support: Log partial cash payment + remaining customer Udhar balance.
- Multiple Invoice Formats:
  * 80mm Thermal Receipt (Ideal for Bluetooth/Thermal printers)
  * Standard A4 Tax Invoice
  * Instant WhatsApp Bill Dispatch with direct payment link

-------------------------------------------------------------------
3. INVENTORY & STOCK MANAGEMENT
-------------------------------------------------------------------
- 8 Product Categories: Groceries, Stationery, Beverages, Snacks, Personal Care, Household, Spices, Dairy.
- Auto Profit Margin Calculation: (Sell Price - Buy Price) / Sell Price * 100%.
- Low Stock Safety Thresholds: Visual orange alerts on Dashboard when stock drops below safety levels.
- Restock Logging: Stock-In entries with investment expense tracking.

-------------------------------------------------------------------
4. CUSTOMER UDHAR (CREDIT KHATA) & DYNAMIC UPI QR
-------------------------------------------------------------------
- Real-Time Balance Tracking: Instant calculation of lifetime credit dues.
- Dynamic UPI QR Codes: Generate pre-filled UPI QR codes for GPay, PhonePe, Paytm, and BHIM.
- 1-Click WhatsApp Reminders: Send courteous automated billing notices with itemized due amounts.

-------------------------------------------------------------------
5. 100% OFFLINE DATA PRIVACY & BACKUP
-------------------------------------------------------------------
- Zero Data Loss: All ledgers, stock, and customer entries stored securely.
- Offline Export: Download full JSON snapshots anytime.
- Cross-Device Restore: Restore your entire shop on a new phone or computer in seconds.

-------------------------------------------------------------------
VIDEO TUTORIAL SUMMARIES
-------------------------------------------------------------------
${TUTORIAL_DATA.map(
  (t, i) => `
Video #${i + 1}: ${t.title} (${t.durationSec}s)
Category: ${t.category}
Description: ${t.description}
Scenes:
${t.scenes.map((s, si) => `  [Scene ${si + 1}] ${s.title}: ${s.narration.en}`).join('\n')}
`
).join('\n')}

===================================================================
SUPPORT & HELP
Phone: ${DEFAULT_STORE_INFO.supportPhone}
Email: ${DEFAULT_STORE_INFO.complaintEmail}
Headquarters: Guwahati, Assam, India
===================================================================
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HisapKitap_User_Manual_and_Video_Tutorials.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Hisap Kitap Store Ledger - User Manual & Video Tutorials Guide. Support: ${DEFAULT_STORE_INFO.supportPhone}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#050608]/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header (No Print) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#26313B] bg-[#161C23] no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#54B6FF]/10 border border-[#54B6FF]/30 text-[#54B6FF]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB] flex items-center gap-2">
                <span>App Understanding & Video Tutorial PDF Manual</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] border border-[#17D5B3]/30">
                  PDF & Print Ready
                </span>
              </h3>
              <p className="text-xs text-[#A8B5C2]">
                Complete illustrated handbook for POS billing, stock inventory, customer credit khata, and video guides
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFeaturesPdf}
              disabled={isGeneratingFeaturePdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] text-xs font-extrabold transition-all shadow-md shadow-[#17D5B3]/20 cursor-pointer disabled:opacity-50"
              title="Download Feature-by-Feature Guide PDF (Dashboard, Account, Products, Selling, Invoice, Customers, Reports, Helpdesk)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingFeaturePdf ? 'Creating PDF...' : 'Download Feature PDF (.pdf)'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C23] border border-[#26313B] hover:border-[#54B6FF]/50 text-[#54B6FF] text-xs font-bold transition-all disabled:opacity-50"
              title="Download Full Manual with Video Storyboards"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'PDF...' : 'Full Manual PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161C23] border border-[#26313B] hover:border-[#17D5B3]/50 text-[#F4F8FB] text-xs font-bold transition-all"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5 text-[#17D5B3]" />
              <span className="hidden sm:inline">Print Manual</span>
            </button>

            <button
              onClick={handleDownloadText}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#161C23] border border-[#26313B] hover:border-[#54B6FF]/50 text-[#54B6FF] text-xs font-bold transition-colors"
              title="Download Text Manual"
            >
              <span>.txt</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (No Print) */}
        <div className="px-5 py-2.5 bg-[#101419] border-b border-[#26313B] flex items-center gap-2 overflow-x-auto no-print">
          {[
            { id: 'features', label: '⭐ Feature Guide (Step-by-Step)', icon: Sparkles },
            { id: 'all', label: '📖 Full Manual', icon: BookOpen },
            { id: 'pos', label: '🛒 POS & Billing', icon: ShoppingCart },
            { id: 'inventory', label: '📦 Stock & Products', icon: Package },
            { id: 'khata', label: '👥 Customer Khata', icon: Users },
            { id: 'backup', label: '💾 Backup & Safety', icon: Database },
            { id: 'videos', label: '🎬 Video Transcripts', icon: Video },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#17D5B3]/20 text-[#17D5B3] border border-[#17D5B3]/40'
                  : 'text-[#A8B5C2] hover:text-[#F4F8FB] hover:bg-[#161C23]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>


        {/* Printable & Scrollable Document Body */}
        <div id="tutorial-manual-content" className="p-6 sm:p-8 overflow-y-auto space-y-8 printable-card text-[#F4F8FB] bg-[#050608]">
          {/* Document Title Header */}
          <div className="border-b border-[#26313B] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#17D5B3]">
                  Official User Guide & Video Tutorial Handbook
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161C23] border border-[#26313B] text-[#A8B5C2]">
                  v1.0 Edition
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F4F8FB]">
                {DEFAULT_STORE_INFO.name} — Store Ledger & Billing Manual
              </h1>
              <p className="text-xs sm:text-sm text-[#A8B5C2] mt-1 max-w-2xl">
                A complete operational reference manual and video tutorial storyboard designed for retail shop owners, store managers, and cashiers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161C23] border border-[#26313B] text-right shrink-0">
              <span className="text-[10px] text-[#A8B5C2] block uppercase font-bold">Helpline & Support</span>
              <span className="text-xs font-bold text-[#17D5B3] block">{DEFAULT_STORE_INFO.supportPhone}</span>
              <span className="text-[10px] text-[#A8B5C2] block mt-0.5">{DEFAULT_STORE_INFO.complaintEmail}</span>
            </div>
          </div>

          {/* Dedicated Feature-by-Feature Operational Guide */}
          {(activeTab === 'features' || activeTab === 'all') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#161C23] border border-[#26313B] p-4 rounded-2xl">
                <div>
                  <h2 className="text-lg font-black text-[#17D5B3] flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Complete Feature-by-Feature Operational Handbook</span>
                  </h2>
                  <p className="text-xs text-[#A8B5C2] mt-0.5">
                    Clear step-by-step guidance for Dashboard, Store Account, Adding Products, Selling & POS, Generating Invoices, Customer Udhar Khata, Exporting Reports, and HelpDesk.
                  </p>
                </div>
                <button
                  onClick={handleDownloadFeaturesPdf}
                  disabled={isGeneratingFeaturePdf}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] text-xs font-black transition-all shadow-md shadow-[#17D5B3]/20 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingFeaturePdf ? 'Exporting...' : 'Save Features PDF (.pdf)'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {FEATURE_GUIDE_DATA.map((feature, fIdx) => (
                  <div key={feature.id} className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#26313B] pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#17D5B3] tracking-wider block">
                          Feature #{fIdx + 1}
                        </span>
                        <h3 className="font-extrabold text-base text-[#F4F8FB]">{feature.title}</h3>
                        <p className="text-xs text-[#A8B5C2] mt-0.5">{feature.subTitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {feature.steps.map((step, sIdx) => (
                        <div key={sIdx} className="p-3.5 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1.5">
                          <div className="font-bold text-[#F4F8FB] flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] flex items-center justify-center font-mono text-[10px] shrink-0">
                              {sIdx + 1}
                            </span>
                            <span>{step.title}</span>
                          </div>
                          <p className="text-[#A8B5C2] text-[11px] pl-7 leading-relaxed">
                            {step.description}
                          </p>
                          {step.tip && (
                            <div className="ml-7 p-2 rounded-lg bg-[#050608] border border-[#17D5B3]/30 text-[10px] text-[#17D5B3] font-medium">
                              💡 Pro Tip: {step.tip}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Key Benefits */}
                    <div className="p-3 rounded-xl bg-[#050608] border border-[#26313B] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                      <span className="text-[11px] font-bold text-[#54B6FF] uppercase tracking-wide">Key Advantages:</span>
                      {feature.keyBenefits.map((b, bIdx) => (
                        <span key={bIdx} className="text-[#F4F8FB] text-[11px] flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#17D5B3]" />
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Start 5-Minute Checklist */}
          {activeTab === 'all' && (

            <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#26313B] pb-3">
                <h3 className="font-black text-base text-[#17D5B3] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>5-Minute Quick Start Onboarding Checklist</span>
                </h3>
                <span className="text-[10px] font-bold uppercase text-[#A8B5C2] bg-[#161C23] px-2 py-0.5 rounded">
                  Get Started Fast
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                  <div className="font-bold text-[#F4F8FB] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] flex items-center justify-center font-mono text-[10px]">1</span>
                    Configure Store Profile
                  </div>
                  <p className="text-[#A8B5C2] text-[11px] pl-7">
                    Click your Profile icon in the top right to set your Store Name, Address, Contact Phone, and UPI VPA ID.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                  <div className="font-bold text-[#F4F8FB] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] flex items-center justify-center font-mono text-[10px]">2</span>
                    Add Products to Catalog
                  </div>
                  <p className="text-[#A8B5C2] text-[11px] pl-7">
                    Go to Products tab or click "+ Add Product". Enter item name, category, buy price, sell price, and initial stock.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                  <div className="font-bold text-[#F4F8FB] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] flex items-center justify-center font-mono text-[10px]">3</span>
                    Register Credit Customers
                  </div>
                  <p className="text-[#A8B5C2] text-[11px] pl-7">
                    Open Customers tab to add local regulars and track their ongoing credit (Udhar) and payment ledger balances.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                  <div className="font-bold text-[#F4F8FB] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] flex items-center justify-center font-mono text-[10px]">4</span>
                    POS Quick Billing & Invoicing
                  </div>
                  <p className="text-[#A8B5C2] text-[11px] pl-7">
                    Click Quick Entry, select items, specify amount paid, and generate instant 80mm thermal receipts or WhatsApp bills.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Module 1: POS Billing */}
          {(activeTab === 'all' || activeTab === 'pos') && (
            <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#26313B] pb-3">
                <div className="p-2 rounded-xl bg-[#17D5B3]/10 text-[#17D5B3]">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#F4F8FB]">
                    Chapter 1: Point of Sale (POS) Billing & Invoicing
                  </h3>
                  <p className="text-xs text-[#A8B5C2]">
                    High-speed checkout terminal, barcode support, split payments, and tax receipts
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#A8B5C2] leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B]">
                    <span className="font-bold text-[#F4F8FB] block mb-1">1. Item Search & Selection</span>
                    Type product keywords or scan barcodes. Click items to append to active cart with auto unit-price computation.
                  </div>
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B]">
                    <span className="font-bold text-[#F4F8FB] block mb-1">2. Split Cash + Udhar</span>
                    If a customer pays partial cash, enter the paid sum. The system automatically computes and credits the remaining balance.
                  </div>
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B]">
                    <span className="font-bold text-[#F4F8FB] block mb-1">3. Instant Printing & Sharing</span>
                    Print 80mm thermal slips or send pre-formatted WhatsApp receipts directly to the buyer's phone.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#050608] border border-[#26313B] font-mono text-[11px] text-[#17D5B3]">
                  💡 Pro Tip: Press "Complete Sale" to automatically deduct inventory counts and update the daily revenue ledger simultaneously.
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Products & Inventory */}
          {(activeTab === 'all' || activeTab === 'inventory') && (
            <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#26313B] pb-3">
                <div className="p-2 rounded-xl bg-[#FF6F91]/10 text-[#FF6F91]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#F4F8FB]">
                    Chapter 2: Inventory, Categories & Low Stock Alerts
                  </h3>
                  <p className="text-xs text-[#A8B5C2]">
                    Catalog management, purchase vs sale margins, and auto safety thresholds
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#A8B5C2] leading-relaxed">
                <p>
                  Hisap Kitap organizes your catalog into 8 specialized retail categories: <strong className="text-[#F4F8FB]">Groceries, Stationery, Beverages, Snacks, Personal Care, Household, Spices, and Dairy</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                    <span className="font-bold text-[#F4F8FB] block">Margin & Profit Calculation</span>
                    <p className="text-[11px]">
                      The system calculates exact profit percentages: <code className="text-[#17D5B3]">Margin % = ((Sell - Buy) / Sell) * 100</code> so you always maintain healthy profit spreads.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                    <span className="font-bold text-[#F4F8FB] block">Low Stock Threshold Warnings</span>
                    <p className="text-[11px]">
                      When product quantities drop below the defined alert threshold, high-visibility orange warning cards appear on your Dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 3: Customer Udhar Khata */}
          {(activeTab === 'all' || activeTab === 'khata') && (
            <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#26313B] pb-3">
                <div className="p-2 rounded-xl bg-[#9B7CFF]/10 text-[#9B7CFF]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#F4F8FB]">
                    Chapter 3: Customer Credit Khata & Dynamic UPI QR
                  </h3>
                  <p className="text-xs text-[#A8B5C2]">
                    Accurate credit ledgering, payment logs, UPI QR generation, and WhatsApp reminders
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#A8B5C2] leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B]">
                    <span className="font-bold text-[#F4F8FB] block mb-1">1. Customer Credit Log</span>
                    Maintain individual balance accounts for each customer with full timestamped debit and payment history.
                  </div>
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B]">
                    <span className="font-bold text-[#F4F8FB] block mb-1">2. Dynamic UPI QR Codes</span>
                    Click the QR code button on any customer card to generate a dynamic UPI QR code with their exact pending due amount.
                  </div>
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B]">
                    <span className="font-bold text-[#F4F8FB] block mb-1">3. WhatsApp Payment Link</span>
                    Send polite automated reminders over WhatsApp with one click, including deep-link UPI intents for instant recovery.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 4: 100% Offline Data Privacy & Backup */}
          {(activeTab === 'all' || activeTab === 'backup') && (
            <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#26313B] pb-3">
                <div className="p-2 rounded-xl bg-[#54B6FF]/10 text-[#54B6FF]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#F4F8FB]">
                    Chapter 4: Offline Security, JSON Backup & Device Migration
                  </h3>
                  <p className="text-xs text-[#A8B5C2]">
                    Local data persistence, automated offline backups, and effortless restore
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#A8B5C2] leading-relaxed">
                <p>
                  Hisap Kitap operates 100% offline-first. Your customer accounts, sales numbers, and profit metrics never leak to unauthorized servers.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                    <span className="font-bold text-[#17D5B3] block">Export Backup JSON</span>
                    <p className="text-[11px]">
                      Go to Reports or Backup to download your store snapshot file (<code className="text-[#F4F8FB]">hisapkitap_backup.json</code>).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161C23] border border-[#26313B] space-y-1">
                    <span className="font-bold text-[#54B6FF] block">Restore on New Device</span>
                    <p className="text-[11px]">
                      When switching phones or tablets, simply click "Restore from Backup" and upload your JSON file to restore all data instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Tutorial Transcripts & Scene Storyboards */}
          {(activeTab === 'all' || activeTab === 'videos') && (
            <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#26313B] pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FF6F91]/10 text-[#FF6F91]">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#F4F8FB]">
                      Chapter 5: Video Tutorial Transcripts & Scene Storyboards
                    </h3>
                    <p className="text-xs text-[#A8B5C2]">
                      Step-by-step interactive scripts and voice narration transcripts for the master app video tutorial
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {TUTORIAL_DATA.map((tut, idx) => (
                  <div key={tut.id} className="bg-[#161C23] border border-[#26313B] rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#26313B] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-[#FF6F91] bg-[#FF6F91]/10 px-2 py-0.5 rounded">
                          Complete Video
                        </span>
                        <h4 className="font-bold text-sm text-[#F4F8FB]">{tut.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#A8B5C2]">
                          Duration: {tut.durationSec}s
                        </span>
                        {onPlayVideo && (
                          <button
                            onClick={() => {
                              onClose();
                              onPlayVideo(idx);
                            }}
                            className="no-print px-2 py-1 rounded bg-[#FF6F91] text-[#050608] font-bold text-[10px] hover:bg-[#FF557F] transition-colors"
                          >
                            Play Video
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#A8B5C2] italic">
                      "{tut.description}"
                    </p>

                    <div className="space-y-2 pt-1">
                      {tut.scenes.map((scene, sIdx) => (
                        <div key={sIdx} className="bg-[#101419] p-3 rounded-lg border border-[#26313B] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#17D5B3] flex items-center gap-1.5">
                              <span>Scene {sIdx + 1}: {scene.title}</span>
                            </span>
                            <span className="text-[10px] text-[#A8B5C2] uppercase font-mono">
                              Type: {scene.screenType}
                            </span>
                          </div>
                          <p className="text-[#F4F8FB] text-[11px] leading-relaxed">
                            <strong className="text-[#A8B5C2]">Voice Narration:</strong> "{scene.narration.en}"
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {scene.highlights.map((hl, hIdx) => (
                              <span key={hIdx} className="text-[10px] bg-[#161C23] px-2 py-0.5 rounded text-[#A8B5C2] border border-[#26313B]">
                                ✓ {hl}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-6 border-t border-[#26313B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A8B5C2]">
            <div>
              <p className="font-bold text-[#F4F8FB]">Hisap Kitap Store Ledger Application</p>
              <p className="text-[11px] text-[#A8B5C2]">Designed for Retail, Wholesale & General Stores across India</p>
            </div>
            <div className="text-right text-[11px]">
              <p>Supports English, অসমীয়া, বাংলা, हिन्दी</p>
              <p className="text-[#17D5B3] font-semibold">100% Offline Safe & Secure</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (No Print) */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#26313B] bg-[#161C23] no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101419] border border-[#26313B] hover:border-[#17D5B3]/40 text-xs text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#17D5B3]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied Link' : 'Copy Summary'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFeaturesPdf}
              disabled={isGeneratingFeaturePdf}
              className="px-4 py-2 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingFeaturePdf ? 'Exporting...' : 'Download Feature PDF (.pdf)'}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="hidden sm:flex px-3.5 py-2 rounded-xl bg-[#161C23] border border-[#26313B] hover:border-[#54B6FF]/40 text-[#54B6FF] text-xs font-bold transition-all items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Manual (.pdf)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#101419] border border-[#26313B] hover:border-[#17D5B3]/40 text-[#F4F8FB] text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#17D5B3]" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#101419] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
