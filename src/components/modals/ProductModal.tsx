import React, { useState, useEffect, useRef } from 'react';
import { Package, X, Image as ImageIcon, Sparkles, Upload, Check, Search, RefreshCw, Barcode as BarcodeIcon, Camera } from 'lucide-react';
import { Product, ProductCategory, LanguageCode } from '../../types';
import { t } from '../../data/translations';
import { REAL_PRODUCT_PRESETS, getMatchingProductImage, CATEGORY_FALLBACK_IMAGES } from '../../data/productImagePresets';
import { BarcodeImage } from '../BarcodeImage';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  productToEdit?: Product | null;
  onSaveProduct: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  lang,
  productToEdit,
  onSaveProduct,
}) => {
  const [name, setName] = useState(productToEdit?.name || '');
  const [standardQuantity, setStandardQuantity] = useState(productToEdit?.standardQuantity || '1 kg');
  const [buyPrice, setBuyPrice] = useState<number | ''>(productToEdit ? productToEdit.buyPrice : '');
  const [sellPrice, setSellPrice] = useState<number | ''>(productToEdit ? productToEdit.sellPrice : '');
  const [stock, setStock] = useState<number | ''>(productToEdit ? productToEdit.stock : 10);
  const [category, setCategory] = useState<ProductCategory>(productToEdit?.category || 'grocery');
  const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');
  const [barcode, setBarcode] = useState(productToEdit?.barcode || '');
  const [gstRate, setGstRate] = useState<number>(productToEdit?.gstRate || 0);
  const [lowStockAlert, setLowStockAlert] = useState<number>(productToEdit?.lowStockAlert || 5);
  const [error, setError] = useState('');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [photoSearchQuery, setPhotoSearchQuery] = useState('');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<ProductCategory | 'all'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setStandardQuantity(productToEdit.standardQuantity);
      setBuyPrice(productToEdit.buyPrice);
      setSellPrice(productToEdit.sellPrice);
      setStock(productToEdit.stock);
      setCategory(productToEdit.category);
      setImageUrl(productToEdit.imageUrl || '');
      setBarcode(productToEdit.barcode || '');
      setGstRate(productToEdit.gstRate);
      setLowStockAlert(productToEdit.lowStockAlert);
    } else {
      setName('');
      setStandardQuantity('1 kg');
      setBuyPrice('');
      setSellPrice('');
      setStock(10);
      setCategory('grocery');
      setImageUrl('');
      setBarcode('');
      setGstRate(0);
      setLowStockAlert(5);
    }
    setError('');
    setShowPhotoPicker(false);
    setPhotoSearchQuery('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAutoSuggestImage = () => {
    if (name.trim()) {
      const match = getMatchingProductImage(name, category);
      setImageUrl(match);
    } else {
      setImageUrl(CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.grocery);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Selected image is too large. Please choose an image under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredPresets = REAL_PRODUCT_PRESETS.filter((preset) => {
    const matchesCategory = selectedPhotoCategory === 'all' || preset.category === selectedPhotoCategory;
    const query = photoSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      preset.name.toLowerCase().includes(query) ||
      preset.keywords.some((k) => k.includes(query));
    return matchesCategory && matchesSearch;
  });

  const displayImage = imageUrl || (name.trim() ? getMatchingProductImage(name, category) : CATEGORY_FALLBACK_IMAGES[category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('enterValidDetails', lang));
      return;
    }

    const buy = Number(buyPrice) || 0;
    const sell = Number(sellPrice) || 0;
    const stk = stock === '' ? 0 : Number(stock);

    const finalImage = imageUrl.trim() || getMatchingProductImage(name, category);

    const updated: Product = {
      id: productToEdit?.id || `prod-${Date.now()}`,
      name: name.trim(),
      standardQuantity: standardQuantity.trim(),
      buyPrice: buy,
      sellPrice: sell,
      stock: stk,
      category,
      imageUrl: finalImage,
      barcode: barcode.trim() || `890103${Math.floor(100000 + Math.random() * 900000)}`,
      gstRate,
      lowStockAlert: Number(lowStockAlert) || 5,
    };

    onSaveProduct(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26313B] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB]">
                {productToEdit ? t('editProduct', lang) : t('addProduct', lang)}
              </h3>
              <p className="text-xs text-[#A8B5C2]">Configure catalog items, real photos, and inventory pricing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FF6F91]/20 border border-[#FF6F91]/30 text-[#FF6F91] text-xs font-bold shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1">
          {/* Product Real Image Section */}
          <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F4F8FB] text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#17D5B3]" />
                Product Real Photo
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoSuggestImage}
                  className="px-2 py-1 rounded-md bg-[#17D5B3]/15 hover:bg-[#17D5B3]/25 text-[#17D5B3] text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Auto-match photo based on title"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Match
                </button>
                <button
                  type="button"
                  onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    showPhotoPicker
                      ? 'bg-[#17D5B3] text-[#050608]'
                      : 'bg-[#26313B] hover:bg-[#34424F] text-[#F4F8FB]'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  {showPhotoPicker ? 'Close Gallery' : 'Browse Presets'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#101419] border border-[#26313B] shrink-0">
                <img
                  src={displayImage}
                  alt={name || 'Product photo'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.grocery;
                  }}
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter or select real photo image URL..."
                    className="flex-1 bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F8FB] focus:outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-[#26313B] hover:bg-[#34424F] text-[#F4F8FB] rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0"
                    title="Upload image from computer or camera"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </div>
                <p className="text-[10px] text-[#A8B5C2]">
                  High-definition genuine product photo will appear on POS items, invoice cards, and catalog sheets.
                </p>
              </div>
            </div>

            {/* Expandable Real Photo Preset Picker */}
            {showPhotoPicker && (
              <div className="mt-3 pt-3 border-t border-[#26313B] space-y-2.5 animate-fadeIn">
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="text"
                    value={photoSearchQuery}
                    onChange={(e) => setPhotoSearchQuery(e.target.value)}
                    placeholder="Search preset photo (e.g. Atta, Oil, Pen, Soap)..."
                    className="flex-1 min-w-[140px] bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-2.5 py-1 text-xs text-[#F4F8FB] focus:outline-none"
                  />
                  <select
                    value={selectedPhotoCategory}
                    onChange={(e) => setSelectedPhotoCategory(e.target.value as any)}
                    className="bg-[#101419] border border-[#26313B] text-[#A8B5C2] rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="grocery">Grocery</option>
                    <option value="stationery">Stationery</option>
                    <option value="cosmetic">Cosmetics</option>
                    <option value="beverages">Beverages</option>
                    <option value="household">Household</option>
                    <option value="personalCare">Personal Care</option>
                    <option value="electronics">Electronics</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-[#101419] rounded-lg border border-[#26313B]">
                  {filteredPresets.map((preset) => {
                    const isSelected = imageUrl === preset.imageUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.imageUrl);
                          if (!name.trim()) {
                            setName(preset.name);
                            setCategory(preset.category);
                          }
                        }}
                        className={`group relative rounded-lg overflow-hidden border text-left flex flex-col transition-all ${
                          isSelected
                            ? 'border-[#17D5B3] ring-2 ring-[#17D5B3]/40'
                            : 'border-[#26313B] hover:border-[#17D5B3]/60'
                        }`}
                      >
                        <div className="h-16 w-full overflow-hidden bg-[#161C23]">
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-1 bg-[#161C23] text-[10px] font-semibold text-[#F4F8FB] truncate">
                          {preset.name}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#17D5B3] text-[#050608] flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Product Title */}
          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">
              Product Title / Brand Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!imageUrl) {
                  setImageUrl(getMatchingProductImage(e.target.value, category));
                }
              }}
              placeholder="e.g. Aashirvaad Whole Wheat Atta"
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
            />
          </div>

          {/* Category & Standard Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as ProductCategory;
                  setCategory(newCat);
                  if (!imageUrl || imageUrl.includes('unsplash')) {
                    setImageUrl(getMatchingProductImage(name, newCat));
                  }
                }}
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
              >
                <option value="grocery">{t('groceryItem', lang)}</option>
                <option value="stationery">{t('stationeryItem', lang)}</option>
                <option value="cosmetic">{t('cosmeticItem', lang)}</option>
                <option value="beverages">{t('beveragesItem', lang)}</option>
                <option value="household">{t('householdItem', lang)}</option>
                <option value="personalCare">{t('personalCareItem', lang)}</option>
                <option value="electronics">{t('electronicsItem', lang)}</option>
                <option value="other">{t('otherItem', lang)}</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">
                Standard Packing / Weight
              </label>
              <input
                type="text"
                value={standardQuantity}
                onChange={(e) => setStandardQuantity(e.target.value)}
                placeholder="e.g. 1 kg, 500 ml, Pack of 3"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F8FB] focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">
                Purchase / Buy Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                placeholder="90.00"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F4F8FB] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-[#17D5B3] block mb-1">
                Selling Retail Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                placeholder="110.00"
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#17D5B3] font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Stock, GST, Alert */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">Opening Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm font-mono text-[#F4F8FB] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">GST Rate (%)</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm text-[#F4F8FB] focus:outline-none"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#A8B5C2] block mb-1">Low Stock Alert</label>
              <input
                type="number"
                min="1"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(parseInt(e.target.value) || 5)}
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm font-mono text-[#F4F8FB] focus:outline-none"
              />
            </div>
          </div>

          {/* Barcode / SKU with Live Generator */}
          <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-[#F4F8FB] text-xs flex items-center gap-1.5">
                <BarcodeIcon className="w-4 h-4 text-[#17D5B3]" />
                <span>Barcode / SKU (Scannable Code)</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="text-[11px] text-[#17D5B3] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Camera className="w-3 h-3" /> Scan with Camera
                </button>
                <button
                  type="button"
                  onClick={() => setBarcode(`890103${Math.floor(100000 + Math.random() * 900000)}`)}
                  className="text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
            </div>

            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 890103001001"
              className="w-full bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-lg px-3 py-2 text-sm font-mono text-[#F4F8FB] focus:outline-none"
            />

            {/* Live Barcode Image Render Preview */}
            <div className="pt-1 flex flex-col items-center justify-center bg-[#050608] rounded-lg p-2 border border-[#26313B]">
              <div className="text-[10px] text-[#A8B5C2] mb-1">Live Generated Barcode Image:</div>
              <BarcodeImage
                value={barcode.trim() || '890103001001'}
                productName={name || 'Item'}
                width={1.5}
                height={36}
                fontSize={11}
                displayValue={true}
                showActions={true}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26313B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] rounded-xl font-bold"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-black rounded-xl shadow-lg shadow-[#17D5B3]/20 transition-all"
            >
              {t('save', lang)}
            </button>
          </div>
        </form>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scannedCode) => {
          setBarcode(scannedCode);
        }}
        products={[]}
        lang={lang}
        title="Scan Product Packaging Barcode"
        subtitle="Point camera at product SKU barcode to automatically fill code"
      />
    </div>
  );
};

