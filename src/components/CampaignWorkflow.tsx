import { useState } from 'react';
import { Database, RefreshCw, Plus, FileDown, Send, Upload, BarChart3, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import CreateCampaignModal, { CampaignData } from './CreateCampaignModal';
import UploadResultsModalNew from './UploadResultsModalNew';
import Toast from './Toast';
import { triggerDatabaseSync, uploadCampaignResults } from '../lib/n8n-webhook';

interface Phase {
  id: number;
  icon: typeof Database;
  title: string;
  badge: string;
  badgeColor: 'green' | 'blue' | 'gray' | 'orange';
  description: string;
  type: 'sync' | 'create' | 'export' | 'instructions' | 'upload' | 'analytics';
  locked: boolean;
}

interface CampaignWorkflowProps {
  onViewAnalytics: () => void;
  latestSync: { id: string; status: string; total_leads: number; timestamp: string } | null;
  totalLeads: number;
  onRefreshData: () => Promise<void>;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function CampaignWorkflow({
  onViewAnalytics,
  latestSync,
  totalLeads,
  onRefreshData,
}: CampaignWorkflowProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(4);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [campaignName, setCampaignName] = useState('');
  const [campaignId, setCampaignId] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch('https://n8n-self-host-hql5.onrender.com/webhook-test/44fb0515-fae6-4e16-9e2e-bc65610a17c9', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action: 'trigger_sync',
          source: 'dashboard_button'
        })
      });

      if (!response.ok) {
        throw new Error(`Sync trigger failed: ${response.status}`);
      }

      showToast('Database sync triggered successfully!', 'success');
      
      setTimeout(() => {
        onRefreshData();
      }, 5000);

    } catch (error) {
      console.error('Sync trigger error:', error);
      showToast('Failed to trigger sync. Please try again.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateCampaign = (data: CampaignData) => {
    setCampaignName(data.name);
    const generatedId = `campaign_${Date.now()}`;
    setCampaignId(generatedId);
    setShowCreateModal(false);
    showToast('Campaign created successfully!', 'success');
  };

  const handleUploadResults = async (file: File, name: string) => {
    showToast('Uploading results to webhook...', 'success');
    setShowUploadModal(false);

    try {
      const result = await uploadCampaignResults(file, campaignId, name);

      if (result.success) {
        showToast(
          `✓ Results uploaded successfully${result.processed_count ? ` (${result.processed_count} records processed)` : ''}`,
          'success'
        );
      } else {
        showToast(
          `Upload failed: ${result.error || 'Unknown error'}`,
          'error'
        );
      }
    } catch (error) {
      showToast(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  const handleDownloadCSV = () => {
    const filename = campaignName
      ? `wasender_${campaignName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`
      : 'wasender_campaign.csv';
    showToast(`File ready: ${filename}`, 'success');
  };

  const phases: Phase[] = [
    {
      id: 1,
      icon: Database,
      title: 'DATABASE SYNCED',
      badge: latestSync ? 'Active' : 'Inactive',
      badgeColor: latestSync ? 'green' : 'gray',
      description: latestSync ? `${totalLeads} leads ready` : 'No sync data',
      type: 'sync',
      locked: false,
    },
    {
      id: 2,
      icon: Send,
      title: 'CREATE CAMPAIGN',
      badge: 'Ready',
      badgeColor: 'blue',
      description: 'Define campaign name, segment, budget',
      type: 'create',
      locked: false,
    },
    {
      id: 3,
      icon: FileDown,
      title: 'EXPORT & DOWNLOAD',
      badge: 'Ready',
      badgeColor: 'green',
      description: 'CSV ready for WAbulk',
      type: 'export',
      locked: false,
    },
    {
      id: 4,
      icon: Send,
      title: 'SEND VIA WABULK',
      badge: 'Manual',
      badgeColor: 'orange',
      description: 'Upload to WAbulk, add template, send',
      type: 'instructions',
      locked: false,
    },
    {
      id: 5,
      icon: Upload,
      title: 'UPLOAD RESULTS',
      badge: 'Ready',
      badgeColor: 'blue',
      description: 'Upload Send Result.xlsx',
      type: 'upload',
      locked: false,
    },
    {
      id: 6,
      icon: BarChart3,
      title: 'VIEW ANALYTICS',
      badge: 'Ready',
      badgeColor: 'blue',
      description: 'Results updated in Analytics tab',
      type: 'analytics',
      locked: false,
    },
  ];

  const togglePhase = (id: number, locked: boolean) => {
    if (locked) return;
    setExpandedPhase(expandedPhase === id ? null : id);
  };

  const getBadgeStyle = (color: Phase['badgeColor']) => {
    switch (color) {
      case 'green':
        return 'bg-[#30D158]/20 text-[#30D158]';
      case 'blue':
        return 'bg-[#007AFF]/20 text-[#007AFF]';
      case 'gray':
        return 'bg-[#A3A3A7]/20 text-[#8E8E93]';
      case 'orange':
        return 'bg-[#FF9500]/20 text-[#FF9500]';
    }
  };

  const getIconBgColor = (color: Phase['badgeColor']) => {
    switch (color) {
      case 'green':
        return 'bg-[#30D158] shadow-[0_0_20px_rgba(48,209,88,0.3)]';
      case 'blue':
        return 'bg-[#007AFF] shadow-[0_0_20px_rgba(0,122,255,0.3)]';
      case 'gray':
        return 'bg-[#A3A3A7] shadow-[0_0_10px_rgba(163,163,167,0.2)]';
      case 'orange':
        return 'bg-[#FF9500] shadow-[0_0_20px_rgba(255,149,0,0.3)]';
    }
  };

  const getBorderColor = (color: Phase['badgeColor']) => {
    switch (color) {
      case 'green':
        return 'border-l-[#30D158]';
      case 'blue':
        return 'border-l-[#007AFF]';
      case 'gray':
        return 'border-l-[#A3A3A7]';
      case 'orange':
        return 'border-l-[#FF9500]';
    }
  };

  const renderPhaseAction = (phase: Phase) => {
    switch (phase.type) {
      case 'sync':
        return (
          <button
            disabled={isSyncing}
            className="px-3 py-2 sm:px-5 sm:py-2.5 bg-white/10 dark:bg-white/10 border border-white/30 dark:border-white/30 text-white rounded-lg font-semibold hover:bg-white/15 dark:hover:bg-white/15 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-wait"
            onClick={handleSync}
            aria-label="Re-sync database"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Re-sync Database'}</span>
            <span className="sm:hidden">{isSyncing ? 'Sync...' : 'Re-sync'}</span>
          </button>
        );

      case 'create':
        return (
          <button
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)]"
            onClick={() => setShowCreateModal(true)}
            aria-label="Start new campaign"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Start Campaign</span>
            <span className="sm:hidden">Start</span>
          </button>
        );

      case 'export':
        return (
          <button
            className="px-2 py-1.5 sm:px-5 sm:py-2.5 text-[#007AFF] dark:text-[#007AFF] rounded-lg font-semibold hover:underline transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm focus:outline-none group"
            onClick={handleDownloadCSV}
            aria-label="Download campaign CSV"
          >
            <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-105 transition-transform duration-300" />
            <span className="hidden sm:inline">
              {campaignName
                ? `wasender_${campaignName.replace(/\s+/g, '_')}.csv`
                : 'wasender_campaign.csv'}
            </span>
            <span className="sm:hidden truncate max-w-[120px]">
              {campaignName ? `${campaignName.slice(0, 10)}...csv` : 'Download'}
            </span>
          </button>
        );

      case 'instructions':
        return null;

      case 'upload':
        return (
          <button
            className="px-3 py-2 sm:px-5 sm:py-2.5 bg-white/10 dark:bg-white/10 border border-white/30 dark:border-white/30 text-white rounded-lg font-semibold hover:bg-white/15 dark:hover:bg-white/15 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            onClick={() => setShowUploadModal(true)}
            aria-label="Upload campaign results"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Upload Results</span>
            <span className="sm:hidden">Upload</span>
          </button>
        );

      case 'analytics':
        return (
          <button
            className="px-2 py-1.5 sm:px-5 sm:py-2.5 text-[#007AFF] dark:text-[#007AFF] rounded-lg font-semibold hover:underline transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm focus:outline-none group"
            onClick={onViewAnalytics}
            aria-label="Go to Analytics tab"
          >
            <span className="hidden sm:inline">Go to Analytics</span>
            <span className="sm:hidden">Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
        );
    }
  };

  const renderPhaseContent = (phase: Phase) => {
    if (phase.type === 'instructions') {
      return (
        <div className="pt-6 mt-6 border-t border-white/20 dark:border-white/10">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl p-5 text-sm space-y-3">
            <p className="font-semibold text-white text-base mb-3">
              Instructions:
            </p>
            <ol className="list-decimal list-inside space-y-2.5 text-white/90">
              <li>Log in to your WAbulk account at <span className="font-mono text-[#007AFF]">wabulk.com</span></li>
              <li>Navigate to <strong>Campaigns</strong> → <strong>New Campaign</strong></li>
              <li>Upload the downloaded CSV file (<code className="font-mono bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded">wasender_campaign.csv</code>)</li>
              <li>Select your pre-approved WhatsApp message template</li>
              <li>Review contact list and template preview</li>
              <li>Click <strong>Send Campaign</strong> and monitor progress</li>
              <li>After completion, download <code className="font-mono bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded">Send Result.xlsx</code> from WAbulk</li>
            </ol>
            <div className="mt-4 p-3 bg-[#FF9500]/20 border border-[#FF9500]/30 rounded-lg">
              <p className="text-[#FF9500] text-xs font-semibold flex items-center gap-2">
                <Send className="w-4 h-4" />
                Remember to download the Send Result file after your campaign completes
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 mt-8">
          Campaign Workflow
        </h2>

        <div className="space-y-3">
          {phases.map((phase) => {
            const isExpanded = expandedPhase === phase.id;
            const Icon = phase.icon;
            const canExpand = phase.type === 'instructions';

            return (
              <div
                key={phase.id}
                className={`bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-md border border-white/40 dark:border-white/10 border-l-4 ${getBorderColor(
                  phase.badgeColor
                )} rounded-2xl transition-all duration-300 ${
                  canExpand
                    ? 'hover:bg-white/80 dark:hover:bg-[#1C1C1E]/80 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:scale-[1.01] cursor-pointer'
                    : ''
                }`}
                onClick={() => canExpand && togglePhase(phase.id, phase.locked)}
                role={canExpand ? 'button' : undefined}
                tabIndex={canExpand && !phase.locked ? 0 : undefined}
                onKeyDown={(e) => {
                  if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    togglePhase(phase.id, phase.locked);
                  }
                }}
              >
                <div className="px-6 py-5">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(
                        phase.badgeColor
                      )} transition-all duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-sm tracking-wide uppercase text-gray-900 dark:text-white">
                          {phase.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${getBadgeStyle(
                            phase.badgeColor
                          )}`}
                        >
                          {phase.badge}
                        </span>
                        {canExpand && !phase.locked && (
                          <div className="ml-auto">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-[#A3A3A7]">
                        {phase.description}
                      </p>
                    </div>

                    {!canExpand && (
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {renderPhaseAction(phase)}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="overflow-hidden transition-all duration-300">
                      {renderPhaseContent(phase)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCampaign}
      />

      <UploadResultsModalNew
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadResults}
        campaignName={campaignName}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}
