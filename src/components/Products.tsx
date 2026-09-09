import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode as BarcodeIcon,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Printer,
  Grid,
  Tag,
  Download,
  Copy,
  Check,
  Camera,
} from 'lucide-react';
import { Product, ProductCategory, LanguageCode, StoreInfo } from '../types';
import { t } from '../data/translations';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_FALLBACK_IMAGES, getMatchingProductImage } from '../data/productImagePresets';
import { BarcodeImage } from './BarcodeImage';
import { BarcodeLabelModal } from './modals/BarcodeLabelModal';
import { BatchBarcodeModal } from './modals/BatchBarcodeModal';
import { BarcodeScannerModal } from './modals/BarcodeScannerModal';
import { DEFAULT_STORE_INFO } from '../data/starterData';

interface ProductsProps {
  lang: LanguageCode;
  products: Product[];
  canManage: boolean;
  storeInfo?: StoreInfo;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const Products: React.FC<ProductsProps> = ({
  lang,
  products,
  canManage,
  storeInfo = DEFAULT_STORE_INFO,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'standard' | 'barcodes'>('standard');
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
  const [isBatchBarcodeOpen, setIsBatchBarcodeOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: t('all', lang) },
    { id: 'grocery', label: t('groceryItem', lang) },
    { id: 'stationery', label: t('stationeryItem', lang) },
    { id: 'cosmetic', label: t('cosmeticItem', lang) },
    { id: 'beverages', label: t('beveragesItem', lang) },
    { id: 'household', label: t('householdItem', lang) },
    { id: 'personalCare', label: t('personalCareItem', lang) },
    { id: 'electronics', label: t('electronicsItem', lang) },
    { id: 'other', label: t('otherItem', lang) },
  ];

  const filtered = products.filter((product) => {
    const matchesCat = selectedCategory === 'all' || product.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.barcode && product.barcode.toLowerCase().includes(q)) ||
      product.standardQuantity.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleCopyBarcode = (bcode: string, prodId: string) => {
    navigator.clipboard.writeText(bcode);
    setCopiedId(prodId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F8FB] flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#17D5B3]" />
            <span>{t('products', lang)}</span>
            <span className="text-xs bg-[#161C23] border border-[#26313B] text-[#A8B5C2] px-2 py-0.5 rounded-full font-mono">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs text-[#A8B5C2] mt-0.5">
            Manage your shop inventory with matching product photos, scannable barcodes, and barcode label printing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Batch Barcode Button */}
          <button
            onClick={() => setIsBatchBarcodeOpen(true)}
            className="flex items-center gap-2 bg-[#161C23] hover:bg-[#26313B] text-[#17D5B3] border border-[#17D5B3]/40 font-bold px-3.5 py-2.5 rounded-xl transition-all text-xs"
            title="Generate batch barcode labels sheet for inventory printing"
          >
            <Printer className="w-4 h-4" />
            <span>Batch Barcodes</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={onAddProduct}
            className="flex items-center justify-center gap-2 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#17D5B3]/20 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProduct', lang)}</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="bg-[#101419] border border-[#26313B] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input & Camera Scanner Button */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8B5C2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchProducts', lang) + ' or SKU...'}
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg pl-10 pr-14 py-2 text-sm text-[#F4F8FB] placeholder-[#A8B5C2]/60 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A8B5C2] hover:text-[#F4F8FB]"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#17D5B3] border border-[#17D5B3]/40 rounded-lg text-xs font-bold transition-all shrink-0"
            title="Scan barcode with camera to find product"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan SKU</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#161C23] p-1 border border-[#26313B] rounded-lg shrink-0 gap-1">
          <button
            onClick={() => setViewMode('standard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'standard'
                ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Catalog & Barcodes</span>
          </button>
          <button
            onClick={() => setViewMode('barcodes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'barcodes'
                ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <BarcodeIcon className="w-3.5 h-3.5" />
            <span>Barcode Shelf Tags</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                  : 'bg-[#161C23] text-[#A8B5C2] hover:text-[#F4F8FB] border border-[#26313B]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#101419] border border-dashed border-[#26313B] rounded-2xl">
          <Package className="w-12 h-12 text-[#A8B5C2]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#F4F8FB]">No products found</h3>
          <p className="text-xs text-[#A8B5C2] mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No product matches your search keyword.' : t('emptyProducts', lang)}
          </p>
          <button
            onClick={onAddProduct}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#17D5B3] text-[#050608] font-bold text-xs rounded-lg hover:bg-[#15C2A3] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addProduct', lang)}</span>
          </button>
        </div>
      ) : viewMode === 'barcodes' ? (
        /* BARCODE SHELF TAGS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const bcode = product.barcode || `890103${product.id.slice(-6)}`;
            const isLowStock = product.stock <= product.lowStockAlert;

            return (
              <div
                key={product.id}
                className="bg-[#101419] border border-[#26313B] hover:border-[#17D5B3]/50 rounded-xl p-4 flex flex-col justify-between space-y-3 group transition-all"
              >
                <div>
                  {/* Store & Header */}
                  <div className="flex items-center justify-between text-[10px] text-[#A8B5C2] mb-1">
                    <span className="uppercase tracking-wider font-bold text-[#17D5B3]">
                      {product.category}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isLowStock ? 'bg-[#FF6F91]/20 text-[#FF6F91]' : 'text-[#A8B5C2]'
                      }`}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#F4F8FB] line-clamp-2 min-h-[2.5rem]" title={product.name}>
                    {product.name}
                  </h4>

                  {/* Scannable Barcode Image Container */}
                  <div className="my-2 p-2 bg-white rounded-lg flex flex-col items-center justify-center border border-[#E2E8F0] shadow-sm">
                    <BarcodeImage
                      value={bcode}
                      productName={product.name}
                      width={1.5}
                      height={40}
                      fontSize={11}
                      displayValue={true}
                      showActions={true}
                      onOpenLabelModal={() => setSelectedProductForBarcode(product)}
                    />
                  </div>

                  {/* Price & Specs */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#A8B5C2]">
                      {product.standardQuantity || '1 Unit'}
                    </span>
                    <span className="text-base font-extrabold text-[#17D5B3] font-mono">
                      {formatCurrency(product.sellPrice)}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-[#26313B] flex items-center justify-between gap-1 text-xs">
                  <button
                    onClick={() => handleCopyBarcode(bcode, product.id)}
                    className="p-1.5 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] flex items-center gap-1 font-mono text-[11px]"
                    title="Copy Barcode SKU"
                  >
                    {copiedId === product.id ? (
                      <Check className="w-3.5 h-3.5 text-[#17D5B3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === product.id ? 'Copied' : bcode}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedProductForBarcode(product)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#17D5B3]/15 hover:bg-[#17D5B3]/25 text-[#17D5B3] font-bold text-xs flex items-center gap-1"
                      title="Print Barcode Tag"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Tag</span>
                    </button>

                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-1.5 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STANDARD VIEW (PHOTO + SCANNABLE BARCODE) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const isLowStock = product.stock <= product.lowStockAlert;
            const unitMargin = product.sellPrice - product.buyPrice;
            const marginPct = product.buyPrice > 0 ? ((unitMargin / product.buyPrice) * 100).toFixed(0) : 0;
            const itemImage = product.imageUrl || getMatchingProductImage(product.name, product.category);
            const bcode = product.barcode || `890103${product.id.slice(-6)}`;

            return (
              <div
                key={product.id}
                className="bg-[#101419] border border-[#26313B] hover:border-[#17D5B3]/50 rounded-xl overflow-hidden flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* Image & Badges Header */}
                  <div className="relative h-44 bg-[#161C23] overflow-hidden border-b border-[#26313B]">
                    <img
                      src={itemImage}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          CATEGORY_FALLBACK_IMAGES[product.category] || CATEGORY_FALLBACK_IMAGES.grocery;
                      }}
                    />

                    {/* Category Chip */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#050608]/85 backdrop-blur-md text-[#17D5B3] border border-[#17D5B3]/30">
                        {product.category}
                      </span>
                    </div>

                    {/* Stock Alert Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md ${
                          isLowStock
                            ? 'bg-[#FF6F91]/95 text-[#050608] shadow-md shadow-[#FF6F91]/30'
                            : 'bg-[#050608]/85 text-[#F4F8FB] border border-[#26313B]'
                        }`}
                      >
                        {isLowStock && <AlertTriangle className="w-3 h-3" />}
                        <span>Stock: {product.stock}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#F4F8FB] line-clamp-2 min-h-[2.5rem]" title={product.name}>
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-[#A8B5C2] mt-1">
                        <span>{product.standardQuantity || 'Single unit'}</span>
                        <span className="text-[#FFC857] font-semibold text-[11px]">
                          +{formatCurrency(unitMargin)} ({marginPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Barcode Image Render Panel */}
                    <div className="bg-[#050608] border border-[#26313B] rounded-lg p-2 flex flex-col items-center justify-center">
                      <BarcodeImage
                        value={bcode}
                        productName={product.name}
                        width={1.4}
                        height={34}
                        fontSize={10}
                        displayValue={true}
                        showActions={true}
                        onOpenLabelModal={() => setSelectedProductForBarcode(product)}
                      />
                    </div>

                    {/* Pricing Matrix */}
                    <div className="bg-[#161C23] border border-[#26313B] rounded-lg p-2.5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[#A8B5C2] text-[10px]">Buy Price</div>
                        <div className="font-bold font-mono text-[#F4F8FB]">
                          {formatCurrency(product.buyPrice)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#A8B5C2] text-[10px]">Sell Price</div>
                        <div className="font-extrabold font-mono text-[#17D5B3]">
                          {formatCurrency(product.sellPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-[#161C23]/60 border-t border-[#26313B] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProductForBarcode(product)}
                    className="p-1.5 rounded-lg bg-[#101419] hover:bg-[#26313B] text-[#17D5B3] hover:text-[#15C2A3] border border-[#17D5B3]/30 transition-colors text-xs font-bold flex items-center gap-1"
                    title="Print Barcode Tag"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Tag</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-1.5 rounded-lg bg-[#101419] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#17D5B3] border border-[#26313B] transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t('edit', lang)}</span>
                    </button>

                    {canManage && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#101419] hover:bg-[#FF6F91]/20 text-[#A8B5C2] hover:text-[#FF6F91] border border-[#26313B] hover:border-[#FF6F91]/40 transition-colors"
                        title={t('delete', lang)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barcode Sticker Print Modal */}
      <BarcodeLabelModal
        isOpen={!!selectedProductForBarcode}
        onClose={() => setSelectedProductForBarcode(null)}
        product={selectedProductForBarcode}
        storeInfo={storeInfo}
        lang={lang}
      />

      {/* Batch Barcode Labels Sheet Generator Modal */}
      <BatchBarcodeModal
        isOpen={isBatchBarcodeOpen}
        onClose={() => setIsBatchBarcodeOpen(false)}
        products={filtered}
        storeInfo={storeInfo}
      />

      {/* Barcode Search Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedCode, matchedProduct) => {
          if (matchedProduct) {
            setSearchQuery(matchedProduct.name);
          } else {
            setSearchQuery(scannedCode);
          }
        }}
        products={products}
        lang={lang}
        title="Find Product by Barcode"
        subtitle="Point camera at product SKU barcode to filter inventory"
      />
    </div>
  );
};
