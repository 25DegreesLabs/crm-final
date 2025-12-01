import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideInRight">
      <div className="bg-white/90 dark:bg-white/90 backdrop-blur-md border border-white/40 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] px-5 py-4 flex items-center gap-3 min-w-[300px]">
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-[#30D158] flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-[#FF3B30] flex-shrink-0" />
        )}
        <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
