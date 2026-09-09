import jsPDF from 'jspdf';
import { LedgerEntry, Customer, Product, LanguageCode } from '../types';
import { TUTORIAL_DATA } from '../components/TutorialVideoPlayer';
import { DEFAULT_STORE_INFO } from '../data/starterData';
import { formatCurrency, formatDateTime, formatDate } from './formatters';
export { generateFeaturesOnlyPdf, FEATURE_GUIDE_DATA, sanitizeForPdf } from './featureGuideData';
import { sanitizeForPdf } from './featureGuideData';

/**
 * Robust Standalone Print Trigger that bypasses iframe sandboxes
 */
export function safePrintHtml(contentHtml: string, title: string = 'Hisap Kitap Print') {
  try {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      // Fallback if popup blocker is active
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              margin: 12mm 10mm 12mm 10mm;
              size: auto;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              padding: 20px;
              margin: 0;
              line-height: 1.5;
            }
            .header-bar {
              border-bottom: 2px solid #111827;
              padding-bottom: 12px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            h1, h2, h3, h4 {
              margin: 0 0 8px 0;
              color: #111827;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px 10px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              background: #e5e7eb;
              font-size: 11px;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9fafb;
            }
            .footer-note {
              margin-top: 30px;
              border-top: 1px solid #e5e7eb;
              padding-top: 10px;
              font-size: 11px;
              color: #6b7280;
              text-align: center;
            }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; padding: 10px; background: #e0f2fe; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #0369a1; font-weight: bold;">🖨️ Ready to Print / Save as PDF</span>
            <button onclick="window.print()" style="padding: 6px 16px; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Print Now</button>
          </div>
          ${contentHtml}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Auto trigger print after load
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } catch (err) {
    console.warn('Fallback to standard window.print()', err);
    window.print();
  }
}

/**
 * 1. Generates and downloads the Complete Comprehensive User Manual & Video Storyboard PDF
 */
export function generateUserManualPdf(): void {
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
      // Header top line
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 160);
      doc.text('HISAP KITAP • OFFICIAL OPERATIONAL MANUAL & TUTORIAL GUIDE', 14, 10);
      doc.line(14, 12, pageWidth - 14, 12);
      y = 18;
    }
  };

  // Title Page / Header
  doc.setFillColor(23, 213, 179); // Teal header banner
  doc.rect(14, y, pageWidth - 28, 22, 'F');
  doc.setFillColor(5, 6, 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(5, 6, 8);
  doc.text('HISAP KITAP - STORE BILLING & KHATA SOFTWARE', 18, y + 9);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Complete Store Ledger, POS Billing & Video Tutorial Operational Manual', 18, y + 16);

  y += 28;

  // Metadata Card
  doc.setDrawColor(220, 225, 230);
  doc.setFillColor(245, 248, 250);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 80);
  doc.text(`Version: 1.0.0 (Production)   -   Languages: English, Assamese, Hindi, Bengali`, 18, y + 6);
  doc.text(`Support Helpline: ${DEFAULT_STORE_INFO.supportPhone}   -   Email: ${DEFAULT_STORE_INFO.complaintEmail}`, 18, y + 12);

  y += 24;

  // CHAPTER 1
  checkPageOverflow(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 30, 40);
  doc.text('1. FIVE-MINUTE ONBOARDING & SETUP CHECKLIST', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 70, 80);

  const checklistItems = [
    '- Step 1: Configure Store Profile (Business Name, Mobile, UPI ID, and Address).',
    '- Step 2: Populate Product Inventory with Buy & Sell prices across 8 categories.',
    '- Step 3: Add Regular Customers who frequently purchase on credit (Udhar).',
    '- Step 4: Open "Quick Entry / POS" to create fast bills, print receipts & share WhatsApp invoices.',
    '- Step 5: Secure your ledger with 4-digit PIN lock and download offline JSON backups.',
  ];

  checklistItems.forEach((item) => {
    checkPageOverflow(8);
    doc.text(sanitizeForPdf(item), 18, y);
    y += 5.5;
  });

  y += 4;

  // CHAPTER 2
  checkPageOverflow(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 30, 40);
  doc.text('2. POINT OF SALE (POS) FAST BILLING & GST INVOICES', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 70, 80);

  const posGuide = [
    '- Instant Product Search & Barcode: Type keywords or scan with a physical USB barcode scanner.',
    '- Quantity & Discount Tweaks: Dynamically increase quantities with real-time tax calculation.',
    '- Split Payment Settlement: Accept partial Cash/UPI payments while linking the balance to Udhar.',
    '- 80mm Thermal Receipt Ready: Formatted for standard 58mm/80mm Bluetooth & USB POS printers.',
    '- 1-Click WhatsApp Invoice: Dispatches a formatted digital receipt with an online payment link.',
  ];

  posGuide.forEach((item) => {
    checkPageOverflow(8);
    doc.text(sanitizeForPdf(item), 18, y);
    y += 5.5;
  });

  y += 4;

  // CHAPTER 3
  checkPageOverflow(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 30, 40);
  doc.text('3. PRODUCT INVENTORY, MARGINS & LOW-STOCK ALERTS', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 70, 80);

  const invGuide = [
    '- 8 Store Categories: Grocery, Stationery, Beverages, Snacks, Personal Care, Household, Spices, Dairy.',
    '- Automated Profit Margins: Calculates Gross Margin % = ((Sell Price - Buy Price) / Sell Price) * 100.',
    '- Low-Stock Safety Trigger: Visual badges and dashboard alerts when stock drops below threshold.',
    '- Restock Expense Logging: Tracks Stock-In replenishment cost directly in financial cash flow.',
  ];

  invGuide.forEach((item) => {
    checkPageOverflow(8);
    doc.text(sanitizeForPdf(item), 18, y);
    y += 5.5;
  });

  y += 4;

  // CHAPTER 4
  checkPageOverflow(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 30, 40);
  doc.text('4. CUSTOMER UDHAR (CREDIT KHATA) & DYNAMIC UPI QR', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 70, 80);

  const khataGuide = [
    '- Lifetime Udhar Balance: Instant balance breakdown with full itemized purchase histories.',
    '- Dynamic UPI QR Codes: Amount pre-filled QR compatible with Google Pay, PhonePe, Paytm, and BHIM.',
    '- Polite Due Reminder System: Auto-generates WhatsApp reminder texts with balance breakdown.',
    '- Partial Due Clearances: Log repayments with one click to update customer credit in real-time.',
  ];

  khataGuide.forEach((item) => {
    checkPageOverflow(8);
    doc.text(sanitizeForPdf(item), 18, y);
    y += 5.5;
  });

  y += 4;

  // CHAPTER 5
  checkPageOverflow(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 30, 40);
  doc.text('5. AI HUMAN VOICE STUDIO (ASSAMESE, HINDI, BENGALI & ENGLISH)', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 70, 80);

  const voiceGuide = [
    '- Native Assamese Voices: Pratibha, Jonali, Rupali, and Hemanta.',
    '- Hindi Voice Personas: Ananya, Pooja, Priya, Aarav, and Rajesh.',
    '- High-Definition Audio: Synthesizes studio audio with smooth conversational cadence.',
    '- Seamless Fallback: Automatically falls back to browser voice synthesis during offline mode.',
  ];

  voiceGuide.forEach((item) => {
    checkPageOverflow(8);
    doc.text(sanitizeForPdf(item), 18, y);
    y += 5.5;
  });

  y += 6;

  // CHAPTER 6: VIDEO TUTORIAL STORYBOARDS
  checkPageOverflow(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 30, 40);
  doc.text('6. INTERACTIVE VIDEO TUTORIAL TRANSCRIPTS & SCENES', 14, y);
  y += 6;

  TUTORIAL_DATA.forEach((tut, idx) => {
    checkPageOverflow(35);
    doc.setFillColor(240, 245, 250);
    doc.setDrawColor(200, 215, 230);
    doc.rect(14, y, pageWidth - 28, 7, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(2, 132, 199);
    doc.text(`Tutorial: ${sanitizeForPdf(tut.title)} (${tut.durationSec}s) - Category: ${tut.category}`, 16, y + 5);
    y += 10;

    tut.scenes.forEach((scene, sIdx) => {
      checkPageOverflow(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 40, 50);
      doc.text(`${sanitizeForPdf(scene.title)}`, 18, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(70, 80, 90);

      const splitText = doc.splitTextToSize(`EN: "${sanitizeForPdf(scene.narration.en)}"`, pageWidth - 36);
      doc.text(splitText, 20, y);
      y += splitText.length * 3.8 + 2;
    });

    y += 3;
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 160);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 8);
    doc.text(`Hisap Kitap User Manual - All Rights Reserved (c) 2026`, 14, pageHeight - 8);
  }

  // Trigger Direct PDF Download
  doc.save(`HisapKitap_User_Manual_and_Video_Tutorials_${formatDate(new Date().toISOString()).replace(/\s+/g, '_')}.pdf`);
}

/**
 * 2. Generates and downloads a Clean Vector PDF Invoice
 */
export function generateInvoicePdf(
  entry: LedgerEntry,
  storeName: string = DEFAULT_STORE_INFO.name,
  storePhone: string = DEFAULT_STORE_INFO.supportPhone,
  storeAddress: string = DEFAULT_STORE_INFO.address
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(23, 213, 179);
  doc.rect(14, y, pageWidth - 28, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(5, 6, 8);
  doc.text(sanitizeForPdf(storeName).toUpperCase(), 18, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sanitizeForPdf(storeAddress)} - Phone: ${sanitizeForPdf(storePhone)}`, 18, y + 14);

  y += 26;

  // Invoice Meta Box
  doc.setFillColor(245, 248, 250);
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 50, 60);

  const invoiceNo = `#INV-${entry.id.replace('entry-', '').toUpperCase().slice(0, 8)}`;
  doc.text(`INVOICE: ${invoiceNo}`, 18, y + 7);
  doc.text(`DATE: ${formatDateTime(entry.createdAt)}`, 18, y + 14);

  doc.text(`CUSTOMER: ${sanitizeForPdf(entry.customerName || 'Walk-in Retail Buyer')}`, pageWidth / 2 + 10, y + 7);
  doc.text(`PHONE: ${sanitizeForPdf(entry.customerPhone || 'N/A')}`, pageWidth / 2 + 10, y + 14);

  y += 28;

  // Items Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM DESCRIPTION', 18, y + 4.8);
  doc.text('QTY', 115, y + 4.8);
  doc.text('RATE (Rs)', 140, y + 4.8);
  doc.text('TOTAL (Rs)', pageWidth - 18, y + 4.8, { align: 'right' });

  y += 8;

  const lines =
    entry.lines && entry.lines.length > 0
      ? entry.lines
      : [
          {
            productId: entry.productId || 'item',
            productName: entry.productName || 'Sale Item',
            standardQuantity: 'Units',
            quantity: entry.quantity || 1,
            unitPrice: entry.unitPrice || entry.amount,
            buyPriceAtSale: 0,
          },
        ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 50, 60);

  lines.forEach((line, i) => {
    const bg = i % 2 === 0 ? 255 : 248;
    doc.setFillColor(bg, bg, bg);
    doc.rect(14, y - 1, pageWidth - 28, 7, 'F');

    doc.text(sanitizeForPdf(line.productName), 18, y + 3.8);
    doc.text(String(line.quantity), 115, y + 3.8);
    doc.text(line.unitPrice.toFixed(2), 140, y + 3.8);
    doc.text((line.quantity * line.unitPrice).toFixed(2), pageWidth - 18, y + 3.8, { align: 'right' });

    y += 7;
  });

  y += 4;

  // Financial Breakdown Box
  doc.setDrawColor(220, 225, 230);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 80, 90);

  doc.text('Subtotal:', pageWidth - 80, y);
  doc.text(`Rs. ${entry.amount.toFixed(2)}`, pageWidth - 18, y, { align: 'right' });
  y += 5.5;

  if (entry.gstAmount > 0) {
    doc.text(`GST Included (${entry.gstRate}%):`, pageWidth - 80, y);
    doc.text(`Rs. ${entry.gstAmount.toFixed(2)}`, pageWidth - 18, y, { align: 'right' });
    y += 5.5;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 6, 8);
  doc.text('Grand Total:', pageWidth - 80, y);
  doc.text(`Rs. ${entry.amount.toFixed(2)}`, pageWidth - 18, y, { align: 'right' });
  y += 6.5;

  doc.setFontSize(9.5);
  doc.setTextColor(16, 185, 129); // Green
  doc.text('Paid Amount:', pageWidth - 80, y);
  doc.text(`Rs. ${entry.paidAmount.toFixed(2)}`, pageWidth - 18, y, { align: 'right' });
  y += 5.5;

  if (entry.dueAmount && entry.dueAmount > 0) {
    doc.setTextColor(239, 68, 68); // Red
    doc.text('Balance Due (Udhar):', pageWidth - 80, y);
    doc.text(`Rs. ${entry.dueAmount.toFixed(2)}`, pageWidth - 18, y, { align: 'right' });
    y += 6;
  }

  y += 12;

  // Footer Note
  doc.setDrawColor(220, 225, 230);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 110, 120);
  doc.text('Thank you for your business! Please visit again.', pageWidth / 2, y, { align: 'center' });
  doc.text('Generated via Hisap Kitap Smart Billing Software', pageWidth / 2, y + 4.5, { align: 'center' });

  doc.save(`HisapKitap_Invoice_${invoiceNo.replace('#', '')}.pdf`);
}

/**
 * 3. Generates and downloads a Financial & Business Report PDF
 */
export function generateFinancialReportPdf(
  period: string,
  totalSales: number,
  totalCostOfGoodsSold: number,
  grossProfit: number,
  netCash: number,
  totalCustomerDue: number,
  entries: LedgerEntry[],
  customers: Customer[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, pageWidth - 28, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('HISAP KITAP - FINANCIAL & SALES REPORT', 18, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 215, 230);
  doc.text(`Period: ${period.toUpperCase()}   -   Generated On: ${formatDate(new Date().toISOString())}`, 18, y + 14);

  y += 28;

  // Summary Metrics Grid (2x2 Cards)
  const cardW = (pageWidth - 34) / 2;
  const cardH = 18;

  // Total Sales
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136);
  doc.text('TOTAL REVENUE / SALES', 18, y + 6);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${totalSales.toLocaleString('en-IN')}`, 18, y + 14);

  // Gross Profit
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(219, 234, 254);
  doc.roundedRect(14 + cardW + 6, y, cardW, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text('GROSS PROFIT', 14 + cardW + 10, y + 6);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${grossProfit.toLocaleString('en-IN')}`, 14 + cardW + 10, y + 14);

  y += cardH + 6;

  // Net Cash Flow
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('NET CASH FLOW', 18, y + 6);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${netCash.toLocaleString('en-IN')}`, 18, y + 14);

  // Outstanding Customer Due
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(14 + cardW + 6, y, cardW, cardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(225, 29, 72);
  doc.text('OUTSTANDING UDHAR DUES', 14 + cardW + 10, y + 6);
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${totalCustomerDue.toLocaleString('en-IN')}`, 14 + cardW + 10, y + 14);

  y += cardH + 10;

  // Section: Top Customers with Pending Dues
  const dueCustomers = customers.filter((c) => c.balance > 0).slice(0, 8);
  if (dueCustomers.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TOP CUSTOMER UDHAR LEDGER ACCOUNTS', 14, y);
    y += 5;

    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('CUSTOMER NAME', 18, y + 4);
    doc.text('PHONE', 85, y + 4);
    doc.text('PENDING DUE (Rs)', pageWidth - 18, y + 4, { align: 'right' });
    y += 7;

    doc.setFont('helvetica', 'normal');
    dueCustomers.forEach((cust, i) => {
      const bg = i % 2 === 0 ? 255 : 248;
      doc.setFillColor(bg, bg, bg);
      doc.rect(14, y - 1, pageWidth - 28, 6, 'F');
      doc.text(sanitizeForPdf(cust.name), 18, y + 3.5);
      doc.text(sanitizeForPdf(cust.phone || 'N/A'), 85, y + 3.5);
      doc.text(cust.balance.toFixed(2), pageWidth - 18, y + 3.5, { align: 'right' });
      y += 6;
    });

    y += 6;
  }

  // Section: Recent Ledger Entries
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RECENT TRANSACTIONS & SALES LOG', 14, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 6, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('DATE & TIME', 18, y + 4);
  doc.text('TYPE', 65, y + 4);
  doc.text('CUSTOMER / ITEM', 95, y + 4);
  doc.text('AMOUNT (Rs)', pageWidth - 18, y + 4, { align: 'right' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  entries.slice(0, 12).forEach((entry, i) => {
    const bg = i % 2 === 0 ? 255 : 248;
    doc.setFillColor(bg, bg, bg);
    doc.rect(14, y - 1, pageWidth - 28, 6, 'F');
    doc.text(formatDateTime(entry.createdAt), 18, y + 3.5);
    doc.text(entry.type.toUpperCase(), 65, y + 3.5);
    doc.text(sanitizeForPdf(entry.customerName || entry.productName || 'Sale').slice(0, 25), 95, y + 3.5);
    doc.text(entry.amount.toFixed(2), pageWidth - 18, y + 3.5, { align: 'right' });
    y += 6;
  });

  doc.save(`HisapKitap_Report_${period}_${formatDate(new Date().toISOString()).replace(/\s+/g, '_')}.pdf`);
}
