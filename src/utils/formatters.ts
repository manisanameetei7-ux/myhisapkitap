import { LedgerEntry } from '../types';

export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  const date1 = typeof d1 === 'string' ? new Date(d1) : d1;
  const date2 = typeof d2 === 'string' ? new Date(d2) : d2;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isSameMonth(d1: Date | string, d2: Date | string): boolean {
  const date1 = typeof d1 === 'string' ? new Date(d1) : d1;
  const date2 = typeof d2 === 'string' ? new Date(d2) : d2;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

export function generateUpiLink(
  upiId: string,
  payeeName: string,
  amount: number,
  note = 'Shop payment'
): string {
  const cleanUpi = encodeURIComponent(upiId.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note.trim());
  const amt = amount > 0 ? `&am=${amount.toFixed(2)}` : '';
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}${amt}&tn=${cleanNote}&cu=INR`;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

export function generateEntriesCsv(entries: LedgerEntry[]): string {
  const headers = [
    'Date & Time',
    'Type',
    'Product / Note',
    'Customer Name',
    'Quantity',
    'Unit Price (₹)',
    'Amount (₹)',
    'Paid (₹)',
    'GST %',
    'GST Amount (₹)',
    'Cost (₹)',
  ];

  const rows = entries.map((entry) => {
    const items =
      entry.lines.length > 0
        ? entry.lines.map((l) => `${l.productName} (x${l.quantity})`).join('; ')
        : entry.productName || entry.note || '-';

    return [
      `"${formatDateTime(entry.createdAt)}"`,
      `"${entry.type}"`,
      `"${items.replace(/"/g, '""')}"`,
      `"${(entry.customerName || '-').replace(/"/g, '""')}"`,
      entry.quantity || (entry.lines.reduce((s, l) => s + l.quantity, 0) || 0),
      entry.unitPrice || 0,
      entry.amount || 0,
      entry.paidAmount || 0,
      entry.gstRate || 0,
      entry.gstAmount || 0,
      entry.costAmount || 0,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(filename: string, content: string, contentType = 'text/plain'): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
