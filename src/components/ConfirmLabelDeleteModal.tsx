import { useEffect } from 'react';
import { Trash2, AlertTriangle, Archive, X } from 'lucide-react';

interface ConfirmLabelDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onArchive: () => void;
  labelName: string;
  leadCount: number;
}

export default function ConfirmLabelDeleteModal({
  isOpen,
  onClose,
  onDelete,
  onArchive,
  labelName,
  leadCount
}: ConfirmLabelDeleteModalProps) {
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

  const canDelete = leadCount === 0;

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
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            canDelete ? 'bg-red-500/20' : 'bg-amber-500/20'
          }`}>
            {canDelete ? (
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {canDelete ? 'Delete Label Mapping?' : 'Cannot Delete Label'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {canDelete
                ? 'This action will permanently delete this label mapping.'
                : 'This label is currently assigned to leads and cannot be deleted.'}
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
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Label Name:</span>
              <code className="text-sm font-mono text-gray-900 dark:text-white font-semibold">
                {labelName}
              </code>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leads Using Label:</span>
              <span className={`text-sm font-bold ${leadCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {leadCount}
              </span>
            </div>
          </div>

          {canDelete ? (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
              <h3 className="text-sm font-bold text-red-900 dark:text-red-500 mb-2">
                This Will:
              </h3>
              <ul className="space-y-2 text-xs text-red-800 dark:text-red-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-500 font-bold mt-0.5">•</span>
                  <span>Permanently remove this label mapping from the database</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-500 font-bold mt-0.5">•</span>
                  <span>Future uploads with this label will be skipped</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-500 font-bold mt-0.5">•</span>
                  <span>This action cannot be undone</span>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-2">
                  Why You Can't Delete:
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                  This label mapping is assigned to <strong>{leadCount} lead{leadCount !== 1 ? 's' : ''}</strong>.
                  Deleting it would leave those leads without proper segment/status information.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Archive className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-blue-900 dark:text-blue-400 mb-1">
                      Recommended: Archive Instead
                    </h3>
                    <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed mb-3">
                      Archiving will preserve historical data while preventing new label uploads
                      from using this mapping. You can reactivate it later if needed.
                    </p>
                    <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                        <span>Existing leads keep their segment/status</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                        <span>New uploads skip this label</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                        <span>Can be reactivated later</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 px-5 py-3 bg-red-500 text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-[0_4px_12px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Permanently</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onArchive}
              className="flex-1 px-5 py-3 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)] flex items-center justify-center gap-2"
            >
              <Archive className="w-4 h-4" />
              <span>Archive Label</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
