import React, { useState } from 'react';
import { X, Printer, CheckSquare, Square, Barcode as BarcodeIcon, Filter } from 'lucide-react';
import { Product, StoreInfo, ProductCategory } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BatchBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  storeInfo?: StoreInfo;
}

export const BatchBarcodeModal: React.FC<BatchBarcodeModalProps> = ({
  isOpen,
  onClose,
  products,
  storeInfo,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(products.map((p) => p.id))
  );
  const [copiesPerItem, setCopiesPerItem] = useState<number>(1);
  const [useStockQuantity, setUseStockQuantity] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');

  if (!isOpen) return null;

  const storeDisplayName = storeInfo?.name || 'hisapkitap Store';

  const filteredProducts = products.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredProducts.forEach((p) => next.add(p.id));
    setSelectedIds(next);
  };

  const deselectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredProducts.forEach((p) => next.delete(p.id));
    setSelectedIds(next);
  };

  const handlePrintBatch = () => {
    const selectedProducts = products.filter((p) => selectedIds.has(p.id));
    if (selectedProducts.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let stickersHtml = '';
    selectedProducts.forEach((prod) => {
      const copies = useStockQuantity ? Math.max(1, prod.stock) : copiesPerItem;
      const bcode = prod.barcode || `890103${prod.id.slice(-6)}`;
      for (let i = 0; i < copies; i++) {
        stickersHtml += `
          <div class="barcode-sticker">
            <div class="store-title">${storeDisplayName}</div>
            <div class="product-title">${prod.name}</div>
            <div class="barcode-wrapper">
              <svg class="barcode-render" data-val="${bcode}"></svg>
            </div>
            <div class="bottom-row">
              <span class="weight-tag">${prod.standardQuantity || '1 Unit'}</span>
              <span class="price-tag">MRP: ₹${prod.sellPrice.toFixed(2)}</span>
            </div>
          </div>
        `;
      }
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Barcode Print - ${storeDisplayName}</title>
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
              width: 185px;
              height: 115px;
              border: 1px dashed #ccc;
              padding: 5px;
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
            .store-title {
              font-size: 8.5px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #444;
            }
            .product-title {
              font-size: 10.5px;
              font-weight: 800;
              line-height: 1.15;
              max-height: 24px;
              overflow: hidden;
              color: #000;
            }
            .bottom-row {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9.5px;
              font-weight: bold;
              border-top: 1px solid #eee;
              padding-top: 2px;
            }
            .price-tag {
              font-size: 11px;
              font-weight: 900;
            }
            .weight-tag {
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="labels-grid">
            ${stickersHtml}
          </div>
          <script>
            window.onload = function() {
              var svgs = document.querySelectorAll('svg[data-val]');
              svgs.forEach(function(s) {
                var val = s.getAttribute('data-val');
                JsBarcode(s, val, {
                  format: "CODE128",
                  width: 1.4,
                  height: 34,
                  displayValue: true,
                  fontSize: 10,
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

  const totalLabelsToPrint = products
    .filter((p) => selectedIds.has(p.id))
    .reduce((sum, p) => sum + (useStockQuantity ? Math.max(1, p.stock) : copiesPerItem), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26313B] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] flex items-center justify-center">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB]">Batch Barcode Label Generator</h3>
              <p className="text-xs text-[#A8B5C2]">
                Generate printable barcode sticker sheets for multiple catalog products
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-3.5 space-y-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-[#A8B5C2] block mb-1">Copies per product</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  disabled={useStockQuantity}
                  value={copiesPerItem}
                  onChange={(e) => setCopiesPerItem(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-[#101419] border border-[#26313B] rounded-lg px-2.5 py-1.5 text-[#F4F8FB] font-mono disabled:opacity-40"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4 text-[#A8B5C2] hover:text-[#F4F8FB]">
                <input
                  type="checkbox"
                  checked={useStockQuantity}
                  onChange={(e) => setUseStockQuantity(e.target.checked)}
                  className="accent-[#17D5B3] rounded"
                />
                <span>Match in-stock quantity</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={selectAllFiltered}
                className="px-2.5 py-1.5 bg-[#101419] hover:bg-[#26313B] text-[#17D5B3] border border-[#26313B] rounded-lg text-xs font-semibold"
              >
                Select All
              </button>
              <button
                onClick={deselectAllFiltered}
                className="px-2.5 py-1.5 bg-[#101419] hover:bg-[#26313B] text-[#A8B5C2] border border-[#26313B] rounded-lg text-xs font-semibold"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Products Checklist */}
        <div className="overflow-y-auto space-y-2 max-h-72 pr-1">
          {filteredProducts.map((product) => {
            const isSelected = selectedIds.has(product.id);
            const bcode = product.barcode || `890103${product.id.slice(-6)}`;
            return (
              <div
                key={product.id}
                onClick={() => toggleSelect(product.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#17D5B3]/10 border-[#17D5B3]/50 text-[#F4F8FB]'
                    : 'bg-[#101419] border-[#26313B] text-[#A8B5C2] hover:border-[#3A4A59]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#17D5B3] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#A8B5C2] shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs text-[#F4F8FB] line-clamp-1">{product.name}</div>
                    <div className="text-[11px] text-[#A8B5C2] flex items-center gap-2 font-mono mt-0.5">
                      <span>SKU: {bcode}</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                      <span>•</span>
                      <span className="text-[#17D5B3] font-bold">MRP: {formatCurrency(product.sellPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold font-mono text-[#A8B5C2] shrink-0">
                  {useStockQuantity ? `${Math.max(1, product.stock)} labels` : `${copiesPerItem} label(s)`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#26313B] shrink-0">
          <div className="text-xs text-[#A8B5C2]">
            Selected <span className="font-bold text-[#17D5B3]">{selectedIds.size}</span> items (Total{' '}
            <span className="font-bold text-[#F4F8FB]">{totalLabelsToPrint}</span> labels)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={handlePrintBatch}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#17D5B3] hover:bg-[#15C2A3] disabled:opacity-40 disabled:cursor-not-allowed text-[#050608] font-black rounded-xl text-xs shadow-lg shadow-[#17D5B3]/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Barcode Sheets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
