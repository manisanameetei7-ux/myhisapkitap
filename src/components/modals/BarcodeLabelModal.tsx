import React, { useRef, useState } from 'react';
import { X, Printer, Download, Copy, Check, Barcode as BarcodeIcon, Tag, Sparkles } from 'lucide-react';
import { Product, StoreInfo, LanguageCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { BarcodeImage } from '../BarcodeImage';

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  storeInfo?: StoreInfo;
  lang: LanguageCode;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  product,
  storeInfo,
  lang,
}) => {
  const [labelCopies, setLabelCopies] = useState<number>(1);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showWeight, setShowWeight] = useState<boolean>(true);
  const [labelSize, setLabelSize] = useState<'standard' | 'compact' | 'large'>('standard');
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const barcodeValue = product.barcode || `890103${product.id.slice(-6)}`;
  const storeDisplayName = storeInfo?.name || 'hisapkitap Store';

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const labelsHtml = Array.from({ length: labelCopies })
      .map(
        () => `
        <div class="barcode-sticker ${labelSize}">
          ${showStoreName ? `<div class="store-title">${storeDisplayName}</div>` : ''}
          <div class="product-title">${product.name}</div>
          <div class="barcode-wrapper">
            <svg id="barcode-svg" class="barcode-render" data-val="${barcodeValue}"></svg>
          </div>
          <div class="bottom-row">
            ${showWeight ? `<span class="weight-tag">${product.standardQuantity || '1 Unit'}</span>` : ''}
            ${showPrice ? `<span class="price-tag">MRP: ₹${product.sellPrice.toFixed(2)}</span>` : ''}
          </div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${product.name}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page {
              margin: 4mm;
              size: auto;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 10px;
              background: #fff;
              color: #000;
            }
            .labels-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              justify-content: flex-start;
            }
            .barcode-sticker {
              border: 1px dashed #bbb;
              padding: 6px;
              text-align: center;
              background: #fff;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              page-break-inside: avoid;
              border-radius: 4px;
            }
            .barcode-sticker.compact {
              width: 150px;
              height: 95px;
              padding: 4px;
            }
            .barcode-sticker.standard {
              width: 190px;
              height: 120px;
            }
            .barcode-sticker.large {
              width: 240px;
              height: 145px;
            }
            .store-title {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #444;
              margin-bottom: 2px;
            }
            .product-title {
              font-size: 11px;
              font-weight: 800;
              line-height: 1.15;
              max-height: 24px;
              overflow: hidden;
              color: #000;
              margin-bottom: 2px;
            }
            .compact .product-title {
              font-size: 9.5px;
            }
            .large .product-title {
              font-size: 13px;
            }
            .barcode-wrapper {
              margin: 2px 0;
            }
            .bottom-row {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              font-weight: bold;
              border-top: 1px solid #eee;
              padding-top: 2px;
            }
            .price-tag {
              font-size: 12px;
              font-weight: 900;
            }
            .weight-tag {
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="labels-grid">
            ${labelsHtml}
          </div>
          <script>
            window.onload = function() {
              var svgs = document.querySelectorAll('svg[data-val]');
              svgs.forEach(function(s) {
                var val = s.getAttribute('data-val');
                JsBarcode(s, val, {
                  format: "CODE128",
                  width: ${labelSize === 'compact' ? 1.3 : labelSize === 'large' ? 1.8 : 1.5},
                  height: ${labelSize === 'compact' ? 28 : labelSize === 'large' ? 45 : 36},
                  displayValue: true,
                  fontSize: ${labelSize === 'compact' ? 9 : 11},
                  font: "monospace",
                  margin: 2
                });
              });
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 my-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26313B] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] flex items-center justify-center">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB] flex items-center gap-2">
                <span>Product Barcode Label</span>
              </h3>
              <p className="text-xs text-[#A8B5C2]">Scannable retail shelf tag & inventory barcode image</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Sticker Preview Card */}
        <div className="bg-[#050608] border border-[#26313B] rounded-xl p-5 flex flex-col items-center justify-center">
          <div className="text-[11px] font-bold text-[#A8B5C2] uppercase tracking-wider mb-2 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#17D5B3]" /> Shelf Tag Preview
          </div>

          {/* Physical Sticker Mockup */}
          <div className="w-full max-w-[280px] bg-white text-[#000000] p-3.5 rounded-lg border-2 border-dashed border-[#CBD5E1] shadow-xl flex flex-col items-center text-center space-y-1.5 transition-all">
            {showStoreName && (
              <div className="text-[10px] font-extrabold tracking-widest text-[#475569] uppercase">
                {storeDisplayName}
              </div>
            )}

            <div className="text-xs font-black text-[#0F172A] leading-tight line-clamp-2 px-1">
              {product.name}
            </div>

            {/* Generated Barcode Component */}
            <div className="py-1">
              <BarcodeImage
                value={barcodeValue}
                productName={product.name}
                width={labelSize === 'compact' ? 1.3 : labelSize === 'large' ? 1.8 : 1.5}
                height={labelSize === 'compact' ? 32 : labelSize === 'large' ? 46 : 38}
                fontSize={labelSize === 'compact' ? 10 : 12}
                displayValue={true}
                showActions={false}
              />
            </div>

            <div className="w-full flex items-center justify-between border-t border-[#E2E8F0] pt-1.5 px-1">
              {showWeight && (
                <span className="text-[11px] font-semibold text-[#64748B]">
                  {product.standardQuantity || '1 Unit'}
                </span>
              )}
              {showPrice && (
                <span className="text-xs font-black text-[#000000] tracking-tight">
                  MRP: {formatCurrency(product.sellPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-3.5 space-y-3 text-xs">
          <div className="font-bold text-[#F4F8FB] mb-1">Sticker Label Configuration</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#A8B5C2] block mb-1">Label Tag Size</label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as any)}
                className="w-full bg-[#101419] border border-[#26313B] rounded-lg p-2 text-[#F4F8FB]"
              >
                <option value="compact">Compact (38mm x 25mm)</option>
                <option value="standard">Standard Shelf (50mm x 30mm)</option>
                <option value="large">Large Tag (65mm x 40mm)</option>
              </select>
            </div>

            <div>
              <label className="text-[#A8B5C2] block mb-1">Copies to Print</label>
              <input
                type="number"
                min="1"
                max="100"
                value={labelCopies}
                onChange={(e) => setLabelCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#101419] border border-[#26313B] rounded-lg p-2 text-[#F4F8FB] font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#A8B5C2] hover:text-[#F4F8FB]">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="accent-[#17D5B3] rounded"
              />
              <span>Include Retail Price</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[#A8B5C2] hover:text-[#F4F8FB]">
              <input
                type="checkbox"
                checked={showStoreName}
                onChange={(e) => setShowStoreName(e.target.checked)}
                className="accent-[#17D5B3] rounded"
              />
              <span>Include Store Name</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[#A8B5C2] hover:text-[#F4F8FB]">
              <input
                type="checkbox"
                checked={showWeight}
                onChange={(e) => setShowWeight(e.target.checked)}
                className="accent-[#17D5B3] rounded"
              />
              <span>Include Packaging / Weight</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#26313B]">
          <button
            onClick={handleCopyBarcode}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] rounded-xl text-xs font-semibold transition-colors border border-[#26313B]"
          >
            {copied ? <Check className="w-4 h-4 text-[#17D5B3]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied SKU' : 'Copy SKU: ' + barcodeValue}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] rounded-xl text-xs font-bold"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-black rounded-xl text-xs shadow-lg shadow-[#17D5B3]/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Labels ({labelCopies})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
