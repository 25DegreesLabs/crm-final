import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmLabelNameChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  oldName: string;
  newName: string;
}

export default function ConfirmLabelNameChangeModal({
  isOpen,
  onClose,
  onConfirm,
  oldName,
  newName
}: ConfirmLabelNameChangeModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-md w-full modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Confirm Label Name Change
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              You are changing the label name. This has important implications for future label uploads.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg -mt-1 -mr-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Old Name:</span>
              <code className="text-sm font-mono text-red-600 dark:text-red-400 font-semibold">
                {oldName}
              </code>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Name:</span>
              <code className="text-sm font-mono text-green-600 dark:text-green-400 font-semibold">
                {newName}
              </code>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-2">
              What This Means:
            </h3>
            <ul className="space-y-2 text-xs text-amber-800 dark:text-amber-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                <span>Future label uploads will only match <strong>"{newName}"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                <span>Uploads with <strong>"{oldName}"</strong> will be skipped</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">•</span>
                <span>You must update your WhatsApp label to match the new name</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-base">💡</span>
              <div>
                <h3 className="text-xs font-bold text-blue-900 dark:text-blue-400 mb-1">
                  Pro Tip:
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Label names are case-sensitive and must match exactly. Double-check your WhatsApp
                  label before saving.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-5 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
}
