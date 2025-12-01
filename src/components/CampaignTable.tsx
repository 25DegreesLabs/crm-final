import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCampaigns, type Campaign as DBCampaign } from '../lib/supabase-queries';
import CampaignDetailsModal from './CampaignDetailsModal';

interface CampaignTableProps {
  onNavigateToLeads?: () => void;
}

export default function CampaignTable({ onNavigateToLeads }: CampaignTableProps) {
  const [campaigns, setCampaigns] = useState<DBCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<DBCampaign | null>(null);

  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoading(true);
      const data = await getCampaigns(10);
      setCampaigns(data);
      setIsLoading(false);
    };

    loadCampaigns();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };


  return (
    <div className="glass dark:glass-dark rounded-2xl overflow-hidden shadow-lg" role="region" aria-label="Campaign history table">
      <div className="px-4 sm:px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign History</h2>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading campaigns...</div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">No campaigns found</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Campaign Name
                </th>
                <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Sent
                </th>
                <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
              {campaigns.map((campaign, index) => {
                return (
                  <tr
                    key={campaign.id}
                    className={`hover:bg-apple-blue/5 dark:hover:bg-apple-blue/10 transition-smooth ${
                      index % 2 === 0 ? 'bg-gray-50/20 dark:bg-gray-800/10' : ''
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{campaign.campaign_name}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400">{formatDate(campaign.start_date)}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-white">{(campaign.metrics as any)?.sent_count || 0}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="text-apple-blue hover:opacity-70 font-semibold transition-smooth focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2 rounded-lg px-2 py-1"
                        aria-label={`View details for ${campaign.campaign_name}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {selectedCampaign && createPortal(
        <CampaignDetailsModal
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          campaign={selectedCampaign}
          onNavigateToLeads={onNavigateToLeads}
        />,
        document.body
      )}
    </div>
  );
}
