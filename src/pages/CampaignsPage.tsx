import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { getCampaigns, type Campaign } from '../lib/supabase-queries';
import CreateCampaignModal, { type CampaignData } from '../components/CreateCampaignModal';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import Toast from '../components/Toast';
import { createCampaign } from '../lib/supabase-queries';
import { supabase } from '../lib/supabase';
import { CURRENT_USER_ID } from '../lib/constants';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'recent' | 'budget' | 'replyRate';

interface CampaignsPageProps {
  onNavigateToLeads?: () => void;
}

export default function CampaignsPage({ onNavigateToLeads }: CampaignsPageProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');

  const loadCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns(50);
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleCreateCampaign = async (data: CampaignData) => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';

      let userId = null;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showToast('You must be logged in to create a campaign', 'error');
          return;
        }
        userId = user.id;
      } else {
        userId = CURRENT_USER_ID;
      }

      await createCampaign({
        name: data.name,
        segment: data.segment,
        budget: data.budget,
        syncReminder: data.syncReminder,
        contactFilter: data.contactFilter,
        selectedGroups: data.selectedGroups,
        user_id: userId,
      });

      setShowCreateModal(false);
      showToast('Campaign created successfully!', 'success');
      await loadCampaigns();
    } catch (error) {
      showToast(
        `Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCampaignAge = (createdAt: string | null) => {
    if (!createdAt) return 'Created date unknown';

    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const diffMs = now - created;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      if (diffHours === 0) {
        return 'Created today';
      }
      return `Created ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    return `Created ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCampaign(null);
  };

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns;

    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(campaign => {
        const status = campaign.status?.toUpperCase();
        if (filterStatus === 'active') {
          return status === 'ACTIVE';
        }
        if (filterStatus === 'completed') {
          return status === 'COMPLETED';
        }
        return true;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'budget') {
        return (b.budget_eur || 0) - (a.budget_eur || 0);
      }
      if (sortBy === 'replyRate') {
        const aSent = (a.metrics as any)?.sent_count || 0;
        const aReplied = (a.metrics as any)?.replied_count || 0;
        const bSent = (b.metrics as any)?.sent_count || 0;
        const bReplied = (b.metrics as any)?.replied_count || 0;
        const aRate = aSent > 0 ? aReplied / aSent : 0;
        const bRate = bSent > 0 ? bReplied / bSent : 0;
        return bRate - aRate;
      }
      return 0;
    });

    return sorted;
  }, [campaigns, searchQuery, filterStatus, sortBy]);

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your marketing campaigns
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-[0_4px_12px_rgba(0,122,255,0.2)] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterType)}
                  className="w-full sm:w-auto appearance-none pl-9 pr-10 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="w-full sm:w-auto appearance-none pl-9 pr-10 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="recent">Sort by Recent</option>
                  <option value="budget">Sort by Budget</option>
                  <option value="replyRate">Sort by Reply Rate</option>
                </select>
              </div>
            </div>
          </div>

          {filteredAndSortedCampaigns.length !== campaigns.length && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredAndSortedCampaigns.length} of {campaigns.length} campaigns
            </div>
          )}
        </div>
      </div>

      <div className="glass dark:glass-dark rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-gray-500 dark:text-gray-400">Loading campaigns...</div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-gray-500 dark:text-gray-400 text-center mb-4">
                No campaigns yet
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm text-[#007AFF] hover:underline font-semibold"
              >
                Create your first campaign
              </button>
            </div>
          ) : filteredAndSortedCampaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No campaigns match your filters
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 text-sm text-[#007AFF] hover:underline font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Leads
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                {filteredAndSortedCampaigns.map((campaign, index) => {
                  return (
                    <tr
                      key={campaign.id}
                      className={`hover:bg-apple-blue/5 dark:hover:bg-apple-blue/10 transition-smooth ${
                        index % 2 === 0 ? 'bg-gray-50/20 dark:bg-gray-800/10' : ''
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleCampaignClick(campaign)}
                          className="text-left hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2 rounded-lg p-1 -m-1"
                        >
                          <div className="text-sm font-semibold text-apple-blue hover:underline">
                            {campaign.campaign_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {getCampaignAge(campaign.created_at)}
                          </div>
                          {campaign.target_segment && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Target: {campaign.target_segment}
                            </div>
                          )}
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(campaign.created_at)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {campaign.leads_count.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCampaign}
        campaigns={campaigns}
      />

      <CampaignDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        campaign={selectedCampaign}
        onNavigateToLeads={onNavigateToLeads}
        onCampaignDeleted={loadCampaigns}
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
