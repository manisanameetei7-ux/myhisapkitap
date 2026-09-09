import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, X, Download, Copy, Check, Printer } from 'lucide-react';
import { Customer, LanguageCode } from '../../types';
import { t } from '../../data/translations';
import { formatCurrency, generateUpiLink } from '../../utils/formatters';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  customer?: Customer | null;
  upiId: string;
  storeName: string;
  customAmount?: number;
}

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  lang,
  customer,
  upiId,
  storeName,
  customAmount,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  const amountToPay = customAmount !== undefined ? customAmount : customer ? customer.balance : 0;
  const upiLink = generateUpiLink(
    upiId,
    storeName,
    amountToPay,
    customer ? `Payment from ${customer.name}` : 'Shop payment'
  );

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        upiLink,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#050608',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code error:', error);
        }
      );
    }
  }, [isOpen, upiLink]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center space-y-4 printable-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26313B] pb-3 no-print">
          <div className="flex items-center gap-2 text-left">
            <QrIcon className="w-5 h-5 text-[#17D5B3]" />
            <h3 className="font-extrabold text-sm text-[#F4F8FB]">{t('paymentQr', lang)}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Store & Customer Info */}
        <div>
          <h4 className="font-extrabold text-base text-[#F4F8FB]">{storeName}</h4>
          {customer ? (
            <p className="text-xs text-[#A8B5C2]">
              Customer: <span className="font-bold text-[#17D5B3]">{customer.name}</span>
            </p>
          ) : (
            <p className="text-xs text-[#A8B5C2]">Scan & Pay via any UPI App</p>
          )}
        </div>

        {/* Amount Badge */}
        <div className="py-2 px-4 rounded-xl bg-[#161C23] border border-[#26313B] inline-block mx-auto">
          <span className="text-xs text-[#A8B5C2] block">Requested Amount</span>
          <span className="text-2xl font-black font-mono text-[#17D5B3]">
            {formatCurrency(amountToPay)}
          </span>
        </div>

        {/* QR Code Canvas */}
        <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-xl">
          <canvas ref={canvasRef} className="mx-auto rounded" />
        </div>

        {/* UPI ID pill with copy */}
        <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-2.5 flex items-center justify-between text-xs">
          <span className="font-mono text-[#A8B5C2] truncate">{upiId}</span>
          <button
            onClick={handleCopyUpi}
            className="flex items-center gap-1 text-[#17D5B3] hover:underline font-bold"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#A8B5C2]">
          Accepts Google Pay, PhonePe, Paytm, BHIM, Amazon Pay & All UPI Banks.
        </p>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-2 pt-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[#F4F8FB] rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#17D5B3]" />
            <span>Print QR Slip</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
