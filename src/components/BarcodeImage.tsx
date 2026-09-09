import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Printer, Copy, Check, Barcode as BarcodeIcon, ZoomIn } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface BarcodeImageProps {
  value: string;
  productName?: string;
  price?: number;
  quantity?: string;
  storeName?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  background?: string;
  lineColor?: string;
  showActions?: boolean;
  onOpenLabelModal?: () => void;
}

export const BarcodeImage: React.FC<BarcodeImageProps> = ({
  value,
  productName,
  price,
  quantity,
  storeName = 'hisapkitap Store',
  width = 1.6,
  height = 42,
  displayValue = true,
  fontSize = 11,
  className = '',
  background = '#FFFFFF',
  lineColor = '#000000',
  showActions = false,
  onOpenLabelModal,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const cleanValue = value ? value.trim() : '890103001001';

  useEffect(() => {
    if (svgRef.current && cleanValue) {
      try {
        setError(false);
        JsBarcode(svgRef.current, cleanValue, {
          format: 'CODE128',
          lineColor: lineColor,
          width: width,
          height: height,
          displayValue: displayValue,
          font: 'monospace',
          fontSize: fontSize,
          textMargin: 3,
          margin: 6,
          background: background,
        });
      } catch (err) {
        console.warn('Barcode generation fallback:', err);
        try {
          // Fallback auto format
          JsBarcode(svgRef.current, cleanValue, {
            format: 'auto',
            lineColor: lineColor,
            width: width,
            height: height,
            displayValue: displayValue,
            font: 'monospace',
            fontSize: fontSize,
            margin: 6,
            background: background,
          });
        } catch (fallbackErr) {
          setError(true);
        }
      }
    }
  }, [cleanValue, width, height, displayValue, fontSize, background, lineColor]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width || 300;
      canvas.height = img.height || 120;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `barcode_${cleanValue}_${productName ? productName.replace(/\s+/g, '_') : 'item'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }
    };
    img.src = url;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative group bg-white rounded-lg p-1.5 shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col items-center">
        {error ? (
          <div className="text-[10px] text-red-500 font-mono py-2 px-3 text-center">
            Invalid Barcode ({cleanValue})
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="max-w-full h-auto block select-none"
            style={{ shapeRendering: 'crispEdges' }}
          />
        )}

        {showActions && (
          <div className="absolute inset-0 bg-[#050608]/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 rounded-lg">
            <button
              onClick={handleCopy}
              className="p-1.5 bg-[#161C23] hover:bg-[#26313B] text-[#F4F8FB] rounded-md text-xs border border-[#26313B]"
              title="Copy Barcode SKU"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#17D5B3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 bg-[#161C23] hover:bg-[#26313B] text-[#17D5B3] rounded-md text-xs border border-[#26313B]"
              title="Download Barcode PNG"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            {onOpenLabelModal && (
              <button
                onClick={onOpenLabelModal}
                className="p-1.5 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-bold rounded-md text-xs"
                title="Print Sticker Label"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
