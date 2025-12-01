import { useState, useEffect, useRef } from 'react';
import { Users, MessageSquare, CheckCircle, Clock, Upload as UploadIcon, File } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import CampaignTable from '../components/CampaignTable';
import Toast from '../components/Toast';
import { getActionableMetrics, subscribeSyncEvents, formatRelativeTime, getCampaigns, type ActionableMetrics, type SyncEvent, type Campaign } from '../lib/supabase-queries';
import { uploadNewScrapes, uploadCampaignResults, uploadLabels } from '../lib/n8n-webhook';
import { CURRENT_USER_ID } from '../lib/constants';

interface UploadCardProps {
  title: string;
  subtitle?: string;
  accept: string;
  type: 'groups' | 'results' | 'labels';
  onUpload?: (file: File, type: string, additionalData?: any) => void;
  showSourceSelector?: boolean;
  showCampaignSelector?: boolean;
  campaigns?: Campaign[];
  selectedCampaignId?: string;
  onCampaignChange?: (campaignId: string) => void;
  isUploading?: boolean;
}

const UploadCard = ({ title, subtitle, accept, type, onUpload, showSourceSelector = false, showCampaignSelector = false, campaigns = [], selectedCampaignId = '', onCampaignChange, isUploading = false }: UploadCardProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceCategory, setSourceCategory] = useState('');
  const [sourceName, setSourceName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (file && onUpload) {
      if (showSourceSelector) {
        const finalSource = sourceCategory === 'whatsapp'
          ? 'WhatsApp Groups'
          : `${sourceCategory === 'social' ? 'Social Media' : 'Other'}: ${sourceName}`;
        onUpload(file, type, { source: finalSource });
      } else if (showCampaignSelector) {
        const campaignId = selectedCampaignId === 'none' ? null : selectedCampaignId;
        onUpload(file, type, { campaign_id: campaignId });
      } else {
        onUpload(file, type);
      }
      setFile(null);
      setSourceCategory('');
      setSourceName('');
    }
  };

  const isUploadDisabled = () => {
    if (!file) return true;
    if (showSourceSelector) {
      if (!sourceCategory) return true;
      if ((sourceCategory === 'social' || sourceCategory === 'other') && !sourceName.trim()) return true;
    }
    if (showCampaignSelector && !selectedCampaignId) return true;
    return false;
  };

  return (
    <div className="glass dark:glass-dark rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
          {subtitle}
        </p>
      )}
      
      {showSourceSelector && (
        <div className="mb-3 space-y-2">
          <select
            value={sourceCategory}
            onChange={(e) => {
              setSourceCategory(e.target.value);
              if (e.target.value === 'whatsapp') {
                setSourceName('WhatsApp Groups');
              } else {
                setSourceName('');
              }
            }}
            className="w-full px-4 py-2 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-700 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#007AFF] transition-colors"
          >
            <option value="">Select source type...</option>
            <option value="whatsapp">WhatsApp Groups</option>
            <option value="social">Social Media Scrape</option>
            <option value="other">Other Source</option>
          </select>

          {(sourceCategory === 'social' || sourceCategory === 'other') && (
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder={
                sourceCategory === 'social'
                  ? "e.g., LinkedIn, Instagram, TikTok"
                  : "e.g., Email scrape, Manual import"
              }
              className="w-full px-4 py-2 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-700 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#007AFF] transition-colors"
            />
          )}
        </div>
      )}

      {showCampaignSelector && (
        <div className="mb-3">
          <select
            value={selectedCampaignId}
            onChange={(e) => onCampaignChange?.(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-700 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#007AFF] transition-colors"
          >
            <option value="">Select campaign...</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.campaign_name} (created {formatRelativeTime(c.created_at)})
              </option>
            ))}
            <option value="none">No campaign (just update leads)</option>
          </select>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-300 mb-3 ${
          isDragging
            ? 'border-[#007AFF] bg-[#007AFF]/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <File className="w-6 h-6 text-[#007AFF]" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        ) : (
          <>
            <UploadIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop or click to browse
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300"
            >
              Choose File
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {accept}
            </p>
          </>
        )}
      </div>

      {file && (
        <div className="flex gap-2">
          <button
            onClick={() => setFile(null)}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300"
          >
            Clear
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploadDisabled() || isUploading}
            className="flex-1 px-3 py-2 text-sm bg-[#007AFF] text-white rounded-lg font-semibold hover:brightness-110 transition-all duration-300 shadow-[0_2px_8px_rgba(0,122,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

interface HomePageProps {
  onNavigateToLeads?: () => void;
}

export default function HomePage({ onNavigateToLeads }: HomePageProps) {
  const [metrics, setMetrics] = useState<ActionableMetrics>({
    contactableLeads: 0,
    activeCampaigns: 0,
    repliedCount: 0,
    repliedPercentage: 0,
    lastSyncTime: null,
  });
  const [latestSync, setLatestSync] = useState<SyncEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [isUploadingNewScrapes, setIsUploadingNewScrapes] = useState(false);
  const [isUploadingResults, setIsUploadingResults] = useState(false);
  const [isUploadingLabels, setIsUploadingLabels] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const metricsData = await getActionableMetrics();
    setMetrics(metricsData);
    setIsLoading(false);
  };

  const handleUpload = async (file: File, type: string, additionalData?: any) => {
    if (type === 'groups' && additionalData?.source) {
      try {
        setIsUploadingNewScrapes(true);

        const result = await uploadNewScrapes(file, additionalData.source, CURRENT_USER_ID);

        if (result.success) {
          setToast({
            show: true,
            message: result.message || `Successfully uploaded ${result.processed_count || 0} leads from ${additionalData.source}`,
            type: 'success'
          });
          await loadData();
        } else {
          setToast({
            show: true,
            message: result.error || 'Upload failed. Please try again.',
            type: 'error'
          });
        }
      } catch (error) {
        setToast({
          show: true,
          message: 'Upload failed. Please try again.',
          type: 'error'
        });
      } finally {
        setIsUploadingNewScrapes(false);
      }
    } else if (type === 'results' && additionalData?.campaign_id !== undefined) {
      try {
        setIsUploadingResults(true);
        const campaign = campaigns.find(c => c.id === additionalData.campaign_id);
        const campaignName = campaign?.campaign_name || 'selected campaign';

        const result = await uploadCampaignResults(file, additionalData.campaign_id, campaignName);

        if (result.success) {
          setToast({
            show: true,
            message: result.message || `Successfully uploaded ${result.processed_count || 0} campaign results`,
            type: 'success'
          });
          await loadData();
        } else {
          setToast({
            show: true,
            message: result.error || 'Upload failed. Please try again.',
            type: 'error'
          });
        }
      } catch (error) {
        setToast({
          show: true,
          message: 'Upload failed. Please try again.',
          type: 'error'
        });
      } finally {
        setIsUploadingResults(false);
      }
    } else if (type === 'labels') {
      try {
        setIsUploadingLabels(true);

        const result = await uploadLabels(file, CURRENT_USER_ID);

        if (result.success) {
          setToast({
            show: true,
            message: result.message || `Successfully uploaded ${result.processed_count || 0} labels`,
            type: 'success'
          });
          await loadData();
        } else {
          setToast({
            show: true,
            message: result.error || 'Upload failed. Please try again.',
            type: 'error'
          });
        }
      } catch (error) {
        setToast({
          show: true,
          message: 'Upload failed. Please try again.',
          type: 'error'
        });
      } finally {
        setIsUploadingLabels(false);
      }
    }
  };

  useEffect(() => {
    loadData();

    const fetchCampaigns = async () => {
      const data = await getCampaigns(10);
      setCampaigns(data);
    };
    fetchCampaigns();

    const unsubscribe = subscribeSyncEvents((event: SyncEvent) => {
      setLatestSync(event);
      setMetrics(prev => ({
        ...prev,
        lastSyncTime: event.timestamp,
      }));
      loadData();
      setToast({
        show: true,
        message: `Database synced: ${event.total_leads} leads`,
        type: 'success',
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Contactable Leads"
          value={isLoading ? 0 : metrics.contactableLeads}
          icon={Users}
          color="blue"
          subtitle="Ready to message"
        />
        <MetricCard
          title="Active Campaigns"
          value={isLoading ? 0 : metrics.activeCampaigns}
          icon={MessageSquare}
          color="green"
          subtitle="In progress"
        />
        <MetricCard
          title="Replied"
          value={isLoading ? '0 (0%)' : `${metrics.repliedCount} (${metrics.repliedPercentage}%)`}
          icon={CheckCircle}
          color="amber"
          subtitle="Engagement rate"
        />
        <MetricCard
          title="Last Sync"
          value={isLoading ? 'Never' : formatRelativeTime(metrics.lastSyncTime)}
          icon={Clock}
          color="slate"
          subtitle="Data freshness"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Sync Data
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Upload files to update your CRM
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UploadCard
            title="📊 New Scrapes"
            subtitle="Import leads from any source"
            accept=".xlsx, .csv"
            type="groups"
            onUpload={handleUpload}
            showSourceSelector={true}
            isUploading={isUploadingNewScrapes}
          />
          <UploadCard
            title="📨 Campaign Results"
            accept=".xlsx"
            type="results"
            onUpload={handleUpload}
            showCampaignSelector={true}
            campaigns={campaigns}
            selectedCampaignId={selectedCampaignId}
            onCampaignChange={setSelectedCampaignId}
            isUploading={isUploadingResults}
          />
          <UploadCard
            title="🏷️ Labels"
            accept=".xlsx"
            type="labels"
            onUpload={handleUpload}
            isUploading={isUploadingLabels}
          />
        </div>
      </div>

      <CampaignTable onNavigateToLeads={onNavigateToLeads} />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
