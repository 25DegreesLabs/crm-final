import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ResetGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetGroupsModal({ isOpen, onClose, onConfirm }: ResetGroupsModalProps) {
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

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-md w-full modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Reset to Default?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This will reset all WhatsApp groups to their default values. Current groups will be replaced with the default WaBulkSender labels.
          </p>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Default Groups:</h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>clients:</span>
                <span className="font-mono text-apple-green">+25</span>
              </div>
              <div className="flex justify-between">
                <span>leads:</span>
                <span className="font-mono text-apple-green">+15</span>
              </div>
              <div className="flex justify-between">
                <span>old clients:</span>
                <span className="font-mono text-apple-green">+10</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between font-semibold">
                  <span>Total Budget:</span>
                  <span className="font-mono text-apple-green">50/50</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
