import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  X,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Zap,
  Barcode as BarcodeIcon,
  Search,
  Keyboard,
} from 'lucide-react';
import { Product, LanguageCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string, matchedProduct?: Product) => void;
  products: Product[];
  lang?: LanguageCode;
  title?: string;
  subtitle?: string;
  continuousMode?: boolean;
}

// Audio beep generator using Web Audio API
const playBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz A5 note
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Audio might be blocked until user interaction
  }
};

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  products,
  title = 'Scan Product Barcode',
  subtitle = 'Point camera at any barcode label or SKU to scan instantly',
  continuousMode = false,
}) => {
  const [scannerMode, setScannerMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [lastScanned, setLastScanned] = useState<{ code: string; product?: Product; timestamp: number } | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'barcode-scanner-viewport';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Initialize available cameras
  useEffect(() => {
    if (!isOpen) return;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera if available
          const backCam = devices.find(
            (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setErrorMsg('No cameras found on this device. You can type the barcode or upload an image.');
          setScannerMode('manual');
        }
      })
      .catch((err) => {
        console.warn('Camera access error:', err);
        setErrorMsg('Camera permission denied or camera not accessible in this browser. You can type SKU or upload photo.');
      });

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Start / Stop camera when mode or camera changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (scannerMode === 'camera' && selectedCameraId) {
      startCamera(selectedCameraId);
    } else {
      stopCamera();
    }

    if (scannerMode === 'manual') {
      setTimeout(() => manualInputRef.current?.focus(), 150);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, scannerMode, selectedCameraId]);

  const startCamera = async (cameraId: string) => {
    setErrorMsg('');
    try {
      if (html5QrCodeRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.5,
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          handleDecodedBarcode(decodedText);
        },
        (errorMessage) => {
          // Frame decode pass (silent)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Failed to start camera:', err);
      setIsScanning(false);
      setErrorMsg(
        err?.message ||
          'Could not start camera stream. Please ensure camera permissions are allowed in your browser settings.'
      );
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      try {
        html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
      setIsScanning(false);
    }
  };

  const handleDecodedBarcode = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // Prevent immediate duplicate scans within 1.2s
    if (lastScanned && lastScanned.code === code && Date.now() - lastScanned.timestamp < 1200) {
      return;
    }

    if (soundEnabled) {
      playBeep();
    }

    // Match with existing products by barcode or SKU or ID
    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
        p.id.toLowerCase() === code.toLowerCase() ||
        (p.barcode && p.barcode.replace(/\D/g, '') === code.replace(/\D/g, ''))
    );

    setLastScanned({
      code,
      product: matched,
      timestamp: Date.now(),
    });

    onScanSuccess(code, matched);

    if (!continuousMode) {
      // Auto close after brief visual feedback
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setErrorMsg('');

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleDecodedBarcode(decodedText);
      html5QrCode.clear();
    } catch (err: any) {
      setErrorMsg('Could not detect a clear barcode in this photo. Please try a sharper picture or enter SKU manually.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDecodedBarcode(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#26313B] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17D5B3]/20 border border-[#17D5B3]/40 text-[#17D5B3] flex items-center justify-center">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB] flex items-center gap-2">
                <span>{title}</span>
                {continuousMode && (
                  <span className="text-[10px] bg-[#17D5B3]/20 text-[#17D5B3] px-2 py-0.5 rounded-full font-bold border border-[#17D5B3]/40">
                    Continuous POS
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#A8B5C2]">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-[#17D5B3]/15 text-[#17D5B3] border-[#17D5B3]/30'
                  : 'bg-[#161C23] text-[#A8B5C2] border-[#26313B]'
              }`}
              title={soundEnabled ? 'Beep sound enabled' : 'Mute beep sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#161C23] p-1 border border-[#26313B] rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setScannerMode('camera')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              scannerMode === 'camera'
                ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>

          <button
            onClick={() => setScannerMode('manual')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              scannerMode === 'manual'
                ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Type / USB Gun</span>
          </button>

          <button
            onClick={() => setScannerMode('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              scannerMode === 'upload'
                ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* Scan Status / Match Feedback */}
        {lastScanned && (
          <div className="p-3 bg-[#17D5B3]/15 border border-[#17D5B3]/50 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#17D5B3] shrink-0" />
              <div>
                <div className="font-extrabold text-[#F4F8FB]">
                  {lastScanned.product ? lastScanned.product.name : 'Scanned Code'}
                </div>
                <div className="text-[11px] text-[#17D5B3] font-mono">
                  SKU: {lastScanned.code} {lastScanned.product && `• ${formatCurrency(lastScanned.product.sellPrice)}`}
                </div>
              </div>
            </div>
            {lastScanned.product && (
              <span className="px-2 py-0.5 bg-[#17D5B3] text-[#050608] font-bold rounded text-[10px]">
                Matched Stock: {lastScanned.product.stock}
              </span>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-[#FF6F91]/15 border border-[#FF6F91]/40 rounded-xl flex items-start gap-2.5 text-xs text-[#FF6F91]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* TAB 1: LIVE CAMERA SCANNER */}
        {scannerMode === 'camera' && (
          <div className="space-y-3">
            {/* Viewfinder Container */}
            <div className="relative rounded-2xl overflow-hidden bg-[#050608] border-2 border-[#26313B] min-h-[220px] flex items-center justify-center">
              <div id={scannerContainerId} className="w-full h-full" />

              {/* Scanning Crosshair Overlay */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-[260px] h-32 border-2 border-[#17D5B3] rounded-xl relative shadow-[0_0_20px_rgba(23,213,179,0.3)]">
                    {/* Animated Scanning Laser Line */}
                    <div className="absolute left-1 right-1 h-0.5 bg-[#17D5B3] shadow-[0_0_8px_#17D5B3] animate-pulse top-1/2 -translate-y-1/2" />
                    <div className="absolute top-1 left-2 text-[9px] font-mono text-[#17D5B3] uppercase tracking-wider font-bold bg-[#050608]/70 px-1 rounded">
                      Align Barcode
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls & Selector */}
            {cameras.length > 1 && (
              <div className="flex items-center justify-between text-xs bg-[#161C23] p-2.5 rounded-xl border border-[#26313B]">
                <span className="text-[#A8B5C2] font-semibold">Select Camera:</span>
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="bg-[#101419] border border-[#26313B] rounded-lg px-2.5 py-1 text-[#F4F8FB] text-xs focus:outline-none"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label || `Camera ${c.id.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANUAL / USB BARCODE GUN INPUT */}
        {scannerMode === 'manual' && (
          <div className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="bg-[#161C23] border border-[#26313B] rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-[#F4F8FB] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#17D5B3]" />
                  <span>Enter or Scan with USB/Bluetooth Barcode Gun</span>
                </label>
                <div className="flex gap-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Type barcode or scan with gun (e.g. 890103001001)"
                    className="flex-1 bg-[#101419] border border-[#26313B] focus:border-[#17D5B3] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F4F8FB] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] font-bold rounded-xl text-xs transition-colors shrink-0"
                  >
                    Submit
                  </button>
                </div>
                <p className="text-[11px] text-[#A8B5C2]">
                  Handheld USB and Bluetooth barcode scanners act as keyboard input. Just aim and pull the trigger!
                </p>
              </div>
            </form>

            {/* Quick 1-Click Sample Products from Inventory */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#A8B5C2] uppercase tracking-wider flex items-center justify-between">
                <span>Quick Test: Select from shop inventory ({products.length})</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {products.slice(0, 10).map((prod) => {
                  const bcode = prod.barcode || `890103${prod.id.slice(-6)}`;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleDecodedBarcode(bcode)}
                      className="w-full text-left p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] hover:border-[#17D5B3]/40 flex items-center justify-between transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs text-[#F4F8FB] truncate">{prod.name}</div>
                        <div className="text-[10px] text-[#A8B5C2] font-mono">SKU: {bcode}</div>
                      </div>
                      <div className="text-xs font-bold text-[#17D5B3] font-mono shrink-0">
                        {formatCurrency(prod.sellPrice)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD PHOTO CONTAINING BARCODE */}
        {scannerMode === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#26313B] hover:border-[#17D5B3] rounded-2xl p-6 text-center bg-[#161C23]/50 cursor-pointer transition-colors space-y-2 flex flex-col items-center justify-center"
            >
              <Upload className="w-8 h-8 text-[#17D5B3] mx-auto" />
              <div className="font-bold text-sm text-[#F4F8FB]">Click to upload product barcode image</div>
              <div className="text-xs text-[#A8B5C2]">Supports PNG, JPG, JPEG with clear barcode label</div>
              {uploadedFileName && (
                <div className="mt-2 text-xs font-mono text-[#17D5B3] bg-[#101419] px-2.5 py-1 rounded-lg border border-[#26313B]">
                  {uploadedFileName}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div id="file-scanner-temp" className="hidden" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#26313B] shrink-0">
          <div className="text-[11px] text-[#A8B5C2]">
            Ready for GS1, EAN-13, CODE-128 & QR Codes
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] rounded-xl text-xs font-bold transition-colors"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
