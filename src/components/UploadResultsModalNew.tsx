import { useState, useEffect, useRef } from 'react';
import { X, Upload as UploadIcon, File } from 'lucide-react';

interface UploadResultsModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, campaignName: string) => void;
  campaignName?: string;
  readOnlyMode?: boolean;
}

export default function UploadResultsModalNew({
  isOpen,
  onClose,
  onUpload,
  campaignName = '',
  readOnlyMode = false,
}: UploadResultsModalNewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [name, setName] = useState(campaignName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(campaignName);
  }, [campaignName]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile, name);
      setSelectedFile(null);
      setName('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1E1E20]/95 dark:bg-[#1E1E20]/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-[600px] w-full modal-scale-in z-[105]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Upload Campaign Results
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={readOnlyMode}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors ${
                readOnlyMode
                  ? 'bg-white/5 text-white/60 cursor-not-allowed border-white/10'
                  : 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#007AFF]'
              }`}
              placeholder={readOnlyMode ? '' : 'Enter campaign name'}
              required
            />
            {readOnlyMode && (
              <p className="mt-2 text-sm text-white/60">
                Results will be uploaded to this campaign
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Upload File
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-[#007AFF] bg-[#007AFF]/10'
                  : 'border-white/30 hover:border-white/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <File className="w-8 h-8 text-[#007AFF]" />
                  <div className="text-left">
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-white/60 text-sm">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <UploadIcon className="w-12 h-12 text-white/50 mx-auto mb-3" />
                  <p className="text-white/90 mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-white/60 text-sm mb-4">or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-white/10 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/15 transition-all duration-300"
                  >
                    Browse Files
                  </button>
                  <p className="text-white/50 text-xs mt-3">
                    Accepts .xlsx and .csv files
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-white/10 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="flex-1 px-5 py-3 bg-[#007AFF] text-white rounded-lg font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Upload & Process
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
