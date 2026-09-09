import jsPDF from 'jspdf';
import { DEFAULT_STORE_INFO } from '../data/starterData';
import { formatDate } from './formatters';

export interface FeatureGuideSection {
  id: string;
  title: string;
  subTitle: string;
  iconName: string;
  steps: {
    title: string;
    description: string;
    tip?: string;
  }[];
  keyBenefits: string[];
}

/**
 * Sanitizes any string to ensure 100% clean ASCII output for PDF rendering,
 * removing any non-ASCII characters, smart quotes, or unrenderable symbols.
 */
export function sanitizeForPdf(text: string): string {
  if (!text) return '';
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[•]/g, '-')
    .replace(/[₹]/g, 'Rs. ')
    .replace(/[©]/g, '(c)')
    .replace(/[^\x20-\x7E\t\n\r]/g, '') // Strips all non-printable/non-ASCII characters like Devanagari/Assamese/emojis
    .replace(/\s+/g, ' ')
    .trim();
}

export const FEATURE_GUIDE_DATA: FeatureGuideSection[] = [
  {
    id: 'account-creation',
    title: '1. Account & Store Setup',
    subTitle: 'How to create and configure your store profile, PIN lock, and business details',
    iconName: 'Building',
    steps: [
      {
        title: 'Step 1: Open Store Profile & Authentication',
        description: 'Click on the Profile avatar icon in the top navigation bar or select "Store Profile" from the menu.',
      },
      {
        title: 'Step 2: Enter Store Details',
        description: 'Fill in your Store Business Name, Contact Phone number, Official Email, and Physical Store Address.',
        tip: 'These details automatically appear on all generated invoices, receipts, and PDF reports.',
      },
      {
        title: 'Step 3: Configure UPI Payment ID (VPA)',
        description: 'Input your store UPI ID (e.g., storename@upi or yourphone@paytm) to enable dynamic instant QR code generation.',
      },
      {
        title: 'Step 4: Enable 4-Digit Security PIN',
        description: 'Set a master 4-digit PIN to lock sensitive reports, customer balance changes, and ledger deletion.',
      },
    ],
    keyBenefits: [
      'Personalized branded receipts with shop name and address',
      'Instant UPI QR payments deposited directly to your bank account',
      'PIN security prevents unauthorized staff edits to financial numbers',
    ],
  },
  {
    id: 'dashboard',
    title: '2. Dashboard & Store Analytics',
    subTitle: 'How to monitor real-time sales, net cash, customer dues, and low stock warnings',
    iconName: 'LayoutDashboard',
    steps: [
      {
        title: 'Step 1: Financial Matrix Cards',
        description: 'Check today\'s Total Sales, Gross Profit, Net Cash Flow, and Total Customer Udhar (Credit) at a glance.',
      },
      {
        title: 'Step 2: Low-Stock Inventory Alerts',
        description: 'Inspect highlighted orange warning cards showing products whose quantities are at or below reorder threshold.',
      },
      {
        title: 'Step 3: Quick Action Launchpad',
        description: 'Use the fast buttons to initiate New Sale (+ POS), Add Product, Add Customer, or Show QR Code with 1 click.',
      },
      {
        title: 'Step 4: Recent Activity Stream',
        description: 'Review recent cash and credit transactions with instantaneous customer balance updates.',
      },
    ],
    keyBenefits: [
      'Complete financial visibility in less than 5 seconds',
      'Zero risk of running out of high-demand items due to stock alerts',
      'Accurate real-time tracking of cash in register vs pending dues',
    ],
  },
  {
    id: 'add-product',
    title: '3. How to Add & Manage Products',
    subTitle: 'How to register inventory items, cost vs selling prices, categories, and barcodes',
    iconName: 'Package',
    steps: [
      {
        title: 'Step 1: Open Products Management',
        description: 'Click on the "Products" tab from the top navigation bar, then click the "+ Add Product" button.',
      },
      {
        title: 'Step 2: Enter Product Name & 8-Category Selection',
        description: 'Type the item name and pick the matching category (Grocery, Stationery, Beverages, Snacks, Personal Care, Household, Spices, or Dairy).',
      },
      {
        title: 'Step 3: Enter Buying Cost (Buy Price) & Selling Price',
        description: 'Input how much you pay the supplier (Buy Price) and your customer retail price (Sell Price).',
        tip: 'Hisap Kitap automatically calculates and shows your exact Profit Margin % in real time.',
      },
      {
        title: 'Step 4: Set Current Stock Count & Low Stock Alert Level',
        description: 'Enter initial stock quantity (e.g. 50 units) and set the threshold level (e.g. 5 units) for automatic alert badges.',
      },
      {
        title: 'Step 5: Optional Barcode & Restock Logging',
        description: 'Scan or type the barcode for ultra-fast POS barcode scanner lookup. Record Stock-In restock cost when purchasing batches.',
      },
    ],
    keyBenefits: [
      'Automated profit margin calculations prevent selling at a loss',
      'Instant barcode search capability in POS terminal',
      'Multi-category filtering for large inventory management',
    ],
  },
  {
    id: 'sell-product',
    title: '4. How to Sell Products / Quick POS Billing',
    subTitle: 'How to create quick customer bills, scan barcodes, and handle cash + credit splits',
    iconName: 'ShoppingCart',
    steps: [
      {
        title: 'Step 1: Open Quick Entry / POS Billing',
        description: 'Click "Quick Entry" in navigation or press the "+ New Sale" shortcut button on the Dashboard.',
      },
      {
        title: 'Step 2: Add Items to Cart',
        description: 'Type product names or scan with a USB/Bluetooth barcode scanner. Click items to increment quantities dynamically.',
      },
      {
        title: 'Step 3: Select or Add Customer',
        description: 'Choose an existing customer or leave as "Walk-in Retail Buyer". Selecting a customer links unpaid sums directly to their Udhar ledger.',
      },
      {
        title: 'Step 4: Enter Paid Amount (Partial Payment / Udhar)',
        description: 'Enter the cash/UPI amount received from the customer. If paid amount is less than the total bill, the balance automatically becomes customer Udhar.',
      },
      {
        title: 'Step 5: Complete Sale & Print / Share',
        description: 'Click "Complete Sale". The inventory stock count automatically reduces, profit logs to reports, and the invoice popup appears.',
      },
    ],
    keyBenefits: [
      'Complete high-speed checkout in under 10 seconds per customer',
      'Automatic inventory deduction with real-time stock sync',
      'Seamless split billing between cash, UPI, and store credit',
    ],
  },
  {
    id: 'generate-invoice',
    title: '5. How to Generate & Print Invoices',
    subTitle: 'How to download vector PDF bills, print 80mm thermal receipts, and share WhatsApp invoices',
    iconName: 'Receipt',
    steps: [
      {
        title: 'Step 1: Automatic Pop-up or History Access',
        description: 'The Invoice window pops up immediately after completing a POS sale. You can also click "Invoice" on any past transaction in the History tab.',
      },
      {
        title: 'Step 2: Download Vector PDF Invoice (.pdf)',
        description: 'Click the "Save PDF" button to immediately download a crisp, clean A4 vector PDF bill to your device.',
      },
      {
        title: 'Step 3: Print Thermal / POS Receipt',
        description: 'Click "Print Invoice" to send the formatted receipt to standard 58mm or 80mm Bluetooth/USB thermal receipt printers or office printers.',
      },
      {
        title: 'Step 4: 1-Click WhatsApp Invoice Dispatch',
        description: 'Click "Share WhatsApp" to automatically open WhatsApp with an itemized bill, total amount, store name, and UPI payment link ready to send.',
      },
    ],
    keyBenefits: [
      'Zero paper waste with direct WhatsApp digital invoicing',
      'Professional retail compliant receipts with your store branding',
      'Offline vector PDF creation with no external server delay',
    ],
  },
  {
    id: 'add-customer',
    title: '6. How to Add Customers & Manage Udhar Khata',
    subTitle: 'How to register customers, view debit histories, create dynamic UPI QRs, and send reminders',
    iconName: 'Users',
    steps: [
      {
        title: 'Step 1: Open Customers Tab',
        description: 'Click "Customers" in the top navigation bar to see your full directory of regular buyers and their credit balance.',
      },
      {
        title: 'Step 2: Click "+ Add Customer"',
        description: 'Enter Customer Full Name, Mobile Phone Number (required for WhatsApp receipts), and optional Address / Note.',
      },
      {
        title: 'Step 3: Record Customer Repayments (Clear Udhar)',
        description: 'When a customer brings cash or sends UPI, click "Record Payment", enter amount, and their pending due drops instantly.',
      },
      {
        title: 'Step 4: Generate Dynamic Customer UPI QR Code',
        description: 'Click the QR icon on any customer card to generate a custom UPI QR code pre-filled with their exact outstanding balance.',
      },
      {
        title: 'Step 5: Send WhatsApp Payment Reminder',
        description: 'Click the WhatsApp button to send a polite, formatted reminder with exact pending amount and payment link directly to their phone.',
      },
    ],
    keyBenefits: [
      'Recover pending payments 3x faster with instant WhatsApp reminders',
      'Precise timestamped ledger preventing credit calculation disputes',
      'Customer-specific pre-filled UPI QR codes for rapid settlement',
    ],
  },
  {
    id: 'export-report',
    title: '7. How to Export Financial Reports & Backups',
    subTitle: 'How to download P&L PDF reports, CSV spreadsheets, and secure offline JSON backups',
    iconName: 'FileSpreadsheet',
    steps: [
      {
        title: 'Step 1: Navigate to Reports Tab',
        description: 'Click "Reports" in the top navigation bar to view your store\'s financial performance matrix.',
      },
      {
        title: 'Step 2: Select Date Range',
        description: 'Filter calculations by "Today", "This Month", or "All Time".',
      },
      {
        title: 'Step 3: Download Complete Business Report PDF (.pdf)',
        description: 'Click "Download PDF" to generate a comprehensive financial report featuring revenue, gross profit, cash flow, top debtor accounts, and recent sales.',
      },
      {
        title: 'Step 4: Export Transactions as CSV Excel Sheet',
        description: 'Click "CSV Export" to download all ledger records into an Excel-ready spreadsheet for tax filing or accounting.',
      },
      {
        title: 'Step 5: Download Offline JSON Backup Snapshot',
        description: 'Scroll to the Backup section and click "Download Backup JSON" to save your entire store database locally on your PC or phone.',
      },
    ],
    keyBenefits: [
      'Tax & CA ready Excel/CSV and PDF financial statements with 1 click',
      '100% data safety with offline JSON file exports',
      'Zero dependency on third-party cloud servers; full merchant data privacy',
    ],
  },
  {
    id: 'helpdesk',
    title: '8. HelpDesk, Support & Audio Voice Studio',
    subTitle: 'How to contact support, submit tickets, listen to audio guides, and learn via interactive video',
    iconName: 'HelpCircle',
    steps: [
      {
        title: 'Step 1: Access HelpDesk',
        description: 'Click "HelpDesk" in the navigation bar to access direct customer service channels, FAQs, and video tutorials.',
      },
      {
        title: 'Step 2: Direct Phone & Email Support',
        description: `Call ${DEFAULT_STORE_INFO.supportPhone} or email ${DEFAULT_STORE_INFO.complaintEmail} for fast merchant assistance.`,
      },
      {
        title: 'Step 3: Submit Instant Support / Feature Ticket',
        description: 'Fill out the in-app feedback box with your name and issue description to log a ticket directly.',
      },
      {
        title: 'Step 4: Watch Interactive Video Tutorials',
        description: 'Click "Play Video" on any tutorial card (POS billing, Inventory, Customer Khata, Offline Backup) to see step-by-step interactive simulated screens.',
      },
      {
        title: 'Step 5: Audio Voice Studio Guidance',
        description: 'Listen to clear voice narrations and audio instructions designed to guide cashiers and shop staff.',
      },
    ],
    keyBenefits: [
      'Immediate helpline access for rapid troubleshooting',
      'Multi-language audio guidance for retail staff',
      'On-demand simulated video training for new store cashiers',
    ],
  },
];

/**
 * Generates the Clean, Dedicated "Feature by Feature Operations Handbook" PDF
 * Guaranteed 100% clean standard ASCII text with zero garbled symbols.
 */
export function generateFeaturesOnlyPdf(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  // Helper for adding page breaks & headers
  const checkPageOverflow = (neededSpace = 25) => {
    if (y + neededSpace > pageHeight - 18) {
      doc.addPage();
      y = 18;
      // Header top banner on subsequent pages
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 160);
      doc.text('HISAP KITAP - COMPLETE FEATURE OPERATIONS HANDBOOK', 14, 10);
      doc.setDrawColor(220, 225, 230);
      doc.line(14, 12, pageWidth - 14, 12);
      y = 18;
    }
  };

  // Title Page Header
  doc.setFillColor(23, 213, 179); // Teal header banner
  doc.rect(14, y, pageWidth - 28, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(5, 6, 8);
  doc.text('HISAP KITAP - COMPLETE FEATURE OPERATIONS MANUAL', 18, y + 8.5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Step-by-Step Practical Guide for Store Owners, Cashiers & Managers', 18, y + 15.5);

  y += 28;

  // Quick Index Box
  doc.setFillColor(245, 248, 250);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 40, 50);
  doc.text('TABLE OF KEY APP FEATURES INCLUDED IN THIS MANUAL:', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 90);
  doc.text('1. Account & Store Setup', 18, y + 12);
  doc.text('2. Dashboard & Store Analytics', 105, y + 12);
  doc.text('3. How to Add Products', 18, y + 17);
  doc.text('4. How to Sell / POS Billing', 105, y + 17);
  doc.text('5. How to Generate Invoices', 18, y + 22);
  doc.text('6. How to Add Customers (Udhar)', 105, y + 22);

  y += 30;

  // Render each feature section sequentially
  FEATURE_GUIDE_DATA.forEach((feature) => {
    checkPageOverflow(40);

    // Feature Header Box
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, pageWidth - 28, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(sanitizeForPdf(feature.title).toUpperCase(), 18, y + 5.5);

    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 115, 130);
    doc.text(sanitizeForPdf(feature.subTitle), 14, y);
    y += 6;

    // Steps
    feature.steps.forEach((step) => {
      checkPageOverflow(20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(sanitizeForPdf(step.title), 16, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 65, 80);

      const cleanDescription = sanitizeForPdf(step.description);
      const splitDesc = doc.splitTextToSize(cleanDescription, pageWidth - 36);
      doc.text(splitDesc, 18, y);
      y += splitDesc.length * 4;

      if (step.tip) {
        checkPageOverflow(12);
        doc.setFillColor(240, 253, 250);
        doc.setDrawColor(204, 251, 241);
        doc.roundedRect(18, y - 1, pageWidth - 38, 7, 1, 1, 'FD');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(13, 148, 136);
        doc.text(`Pro Tip: ${sanitizeForPdf(step.tip)}`, 21, y + 3.8);
        y += 9;
      } else {
        y += 2;
      }
    });

    // Key Benefits
    checkPageOverflow(18);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 14, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Key Advantage:', 18, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const benefitsText = feature.keyBenefits.map(b => sanitizeForPdf(b)).join('   -   ');
    const splitBenefits = doc.splitTextToSize(benefitsText, pageWidth - 36);
    doc.text(splitBenefits, 18, y + 8.5);

    y += 20;
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 160);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 8);
    doc.text(`Hisap Kitap Features Guide - Support: ${DEFAULT_STORE_INFO.supportPhone}`, 14, pageHeight - 8);
  }

  // Trigger Direct Download
  doc.save(`HisapKitap_Feature_Operations_Guide_${formatDate(new Date().toISOString()).replace(/\s+/g, '_')}.pdf`);
}
