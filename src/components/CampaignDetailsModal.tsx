import { useEffect, useState } from 'react';
import { X, Download, Users, Upload, Trash2, MessageSquare, UploadCloud } from 'lucide-react';
import { type Campaign, getCampaignLeads, getCampaignGroups, type WhatsAppGroup, generateCampaignCSV as generateCampaignCSVQuery, deleteCampaign } from '../lib/supabase-queries';
import { generateCampaignCSV } from '../lib/csv-utils';
import { uploadCampaignResults } from '../lib/n8n-webhook';
import Toast from './Toast';
import UploadResultsModalNew from './UploadResultsModalNew';

interface CampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onNavigateToLeads?: () => void;
  onCampaignDeleted?: () => void;
}

export default function CampaignDetailsModal({
  isOpen,
  onClose,
  campaign,
  onNavigateToLeads,
  onCampaignDeleted,
}: CampaignDetailsModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [campaignGroups, setCampaignGroups] = useState<WhatsAppGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  useEffect(() => {
    if (isOpen && campaign) {
      setIsLoadingGroups(true);
      getCampaignGroups(campaign.id)
        .then(setCampaignGroups)
        .catch((error) => {
          console.error('Error fetching campaign groups:', error);
          setCampaignGroups([]);
        })
        .finally(() => setIsLoadingGroups(false));
    }
  }, [isOpen, campaign]);

  const handleViewLeads = () => {
    if (onNavigateToLeads) {
      onNavigateToLeads();
      onClose();
    }
  };

  const handleDownloadCSV = async () => {
    if (!campaign) return;

    setIsDownloading(true);
    try {
      const csvString = await generateCampaignCSVQuery(campaign.id);

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `campaign_${campaign.campaign_name.replace(/\s+/g, '_')}_${Date.now()}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const leadCount = csvString.split('\n').length - 1;
      setToast({ message: `Downloaded ${leadCount} leads successfully`, type: 'success' });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download CSV';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadResults = async (file: File, campaignName: string) => {
    if (!campaign) return;

    setIsUploading(true);
    try {
      await uploadCampaignResults(file, campaign.id, campaignName);
      setToast({ message: 'Results uploaded successfully', type: 'success' });
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading results:', error);
      setToast({ message: 'Failed to upload results', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaign) return;

    setIsDeleting(true);
    try {
      await deleteCampaign(campaign.id);
      setToast({ message: 'Campaign deleted successfully', type: 'success' });
      setShowDeleteConfirm(false);
      setTimeout(() => {
        onClose();
        if (onCampaignDeleted) {
          onCampaignDeleted();
        }
      }, 500);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete campaign';
      setToast({ message: errorMessage, type: 'error' });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen || !campaign) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };



  const sentCount = (campaign.metrics as any)?.sent_count || 0;
  const failedCount = (campaign.metrics as any)?.failed_count || 0;
  const repliedCount = (campaign.metrics as any)?.replied_count || 0;

  const totalAttempts = sentCount + failedCount;

  const failureRate = totalAttempts > 0
    ? ((failedCount / totalAttempts) * 100).toFixed(1)
    : '0.0';

  const replyRate = sentCount > 0
    ? ((repliedCount / sentCount) * 100).toFixed(1)
    : '0.0';


  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto modal-scale-in z-[100]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {campaign.campaign_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg ml-4"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lead Count</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {campaign.leads_count.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages Sent</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {sentCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages Failed</span>
                <span className={`text-base font-semibold ${
                  parseFloat(failureRate) > 5
                    ? 'text-red-500'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {failedCount.toLocaleString()}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({failureRate}%)
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Replies</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {repliedCount.toLocaleString()}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({replyRate}%)
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">
                Reply tracking available after uploading label exports
              </span>
            </div>
          </div>

          {campaignGroups.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                <Users className="w-4 h-4 inline-block mr-2" />
                WhatsApp Groups
              </h3>
              <div className="space-y-2">
                {isLoadingGroups ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">Loading groups...</div>
                ) : (
                  campaignGroups.map(group => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-4 bg-gray-50 dark:bg-white/5 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {group.group_name}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        group.score_value > 0
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                          : group.score_value < 0
                          ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                          : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                      }`}>
                        {group.score_value > 0 ? '+' : ''}{group.score_value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mt-6 pt-4 sm:mt-8 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewLeads}
            disabled={!onNavigateToLeads}
            className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">View Leads</span>
            <span className="sm:hidden">Leads</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download CSV'}</span>
            <span className="sm:hidden">CSV</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="px-4 py-2.5 sm:px-5 sm:py-3 bg-green-500/10 dark:bg-green-500/20 border border-green-500 dark:border-green-400 text-green-600 dark:text-green-400 rounded-xl font-semibold hover:bg-green-500/20 dark:hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Results</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="px-4 py-2.5 sm:px-5 sm:py-3 bg-white dark:bg-white/5 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)]"
          >
            Close
          </button>
        </div>
      </div>

      <UploadResultsModalNew
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadResults}
        campaignName={campaign.campaign_name}
        readOnlyMode={true}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-2xl max-w-md w-full modal-scale-in z-[110]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Delete Campaign?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{campaign?.campaign_name}</span>?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
              >
                {isDeleting ? 'Deleting...' : 'Delete Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
