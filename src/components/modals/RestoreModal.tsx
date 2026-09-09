import React, { useState } from 'react';
import { UploadCloud, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../../types';
import { t } from '../../data/translations';
import { importFullBackup } from '../../utils/storage';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  onRestoreSuccess: () => void;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({
  isOpen,
  onClose,
  lang,
  onRestoreSuccess,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setJsonText('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!jsonText.trim()) {
      setError('Please paste valid JSON backup content.');
      return;
    }

    const res = importFullBackup(jsonText.trim());
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onRestoreSuccess();
        onClose();
      }, 1000);
    } else {
      setError(res.message || t('invalidNumber', lang));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101419] border border-[#26313B] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#26313B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC857]/20 border border-[#FFC857]/40 text-[#FFC857] flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#F4F8FB]">{t('restore', lang)} Database</h3>
              <p className="text-xs text-[#A8B5C2]">Import products, entries, customers from backup</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#FF6F91]/20 text-[#FF6F91] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-[#17D5B3]/20 text-[#17D5B3] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Database restored successfully! Reloading store state...</span>
          </div>
        )}

        <form onSubmit={handleRestore} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">
              Select JSON Backup File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full bg-[#161C23] border border-[#26313B] rounded-lg px-3 py-2 text-xs text-[#F4F8FB] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#17D5B3] file:text-[#050608]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#A8B5C2] block mb-1">
              Or Paste JSON Content
            </label>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{ "version": 7, "products": [...], "entries": [...] }'
              className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#FFC857] rounded-xl p-3 text-xs font-mono text-[#F4F8FB] focus:outline-none placeholder-[#A8B5C2]/40"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#161C23] hover:bg-[#26313B] text-[#A8B5C2] rounded-xl font-bold"
            >
              {t('cancel', lang)}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#FFC857] hover:bg-[#ffbe3b] text-[#050608] font-black rounded-xl shadow-lg shadow-[#FFC857]/20"
            >
              Restore Store Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
