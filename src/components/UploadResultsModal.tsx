import { X, Upload, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface UploadResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadResultsModal({ isOpen, onClose }: UploadResultsModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div
        className="glass dark:glass-dark rounded-3xl max-w-2xl w-full shadow-2xl modal-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="px-4 sm:px-6 py-5 flex items-center justify-between border-b border-gray-200/30 dark:border-gray-700/30">
          <h2 id="upload-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Upload Campaign Results</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-apple-blue"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label htmlFor="upload-campaign-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Campaign Name
            </label>
            <input
              id="upload-campaign-name"
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Spring Wedding Special Results"
              className="w-full px-4 py-3 glass dark:glass-dark rounded-xl focus:ring-2 focus:ring-apple-blue outline-none transition-smooth text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upload Excel File
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative glass dark:glass-dark rounded-2xl p-10 text-center transition-smooth ${
                dragActive
                  ? 'ring-2 ring-apple-blue scale-[1.01]'
                  : selectedFile
                  ? 'ring-2 ring-apple-green'
                  : ''
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <FileSpreadsheet className="w-10 h-10 text-apple-green" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-4 p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Remove selected file"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-14 h-14 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Drop your .xlsx file here
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">or click to browse</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload Excel file"
                  />
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Supported format: Excel (.xlsx, .xls)
            </p>
          </div>
        </div>

        <div className="glass dark:glass-dark px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-gray-200/30 dark:border-gray-700/30 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 glass dark:glass-dark rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:scale-[1.02] transition-smooth shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => alert('Results uploaded!')}
            disabled={!selectedFile || !campaignName}
            className="px-5 py-2.5 bg-apple-blue rounded-xl font-semibold text-white hover:scale-[1.02] hover:opacity-90 transition-smooth flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2"
            aria-disabled={!selectedFile || !campaignName}
          >
            <Upload className="w-4 h-4" />
            Upload Results
          </button>
        </div>
      </div>
    </div>
  );
}
