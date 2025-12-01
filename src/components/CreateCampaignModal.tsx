import { useState, useEffect } from 'react';
import { X, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { Campaign, WhatsAppGroup, LabelMapping } from '../lib/supabase-queries';
import { getWhatsAppGroupsWithLeadCounts, getLabelMappings } from '../lib/supabase-queries';
import { supabase } from '../lib/supabase';
import { CURRENT_USER_ID } from '../lib/constants';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignData) => void;
  campaigns?: Campaign[];
}

export interface CampaignData {
  name: string;
  segment: 'HOT' | 'WARM' | 'COLD';
  budget: number | null;
  syncReminder: number;
  contactFilter?: {
    type: string;
    days: number;
  };
  selectedGroups?: string[];
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSubmit,
  campaigns = [],
}: CreateCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignData>({
    name: '',
    segment: 'WARM',
    budget: null,
    syncReminder: 3,
  });
  const [skipDays, setSkipDays] = useState(30);
  const [enableSkip, setEnableSkip] = useState(true);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSegmentOpen, setIsSegmentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [labels, setLabels] = useState<LabelMapping[]>([]);
  const [targetingMode, setTargetingMode] = useState<'segment' | 'label'>('segment');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      loadGroups();
      loadLabels();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      }

      const data = await getWhatsAppGroupsWithLeadCounts(userId);
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const loadLabels = async () => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      }

      const data = await getLabelMappings(userId);
      setLabels(data.filter(l => l.is_active));
    } catch (error) {
      console.error('Error loading labels:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetSegment = formData.segment;

    // If label mode, map label to segment
    if (targetingMode === 'label' && selectedLabel) {
      const label = labels.find(l => l.whatsapp_label_name === selectedLabel);
      if (label?.crm_segment) {
        targetSegment = label.crm_segment as 'HOT' | 'WARM' | 'COLD';
      }
    }

    const campaignData: CampaignData = {
      ...formData,
      segment: targetSegment,
      contactFilter: enableSkip ? { type: 'skip_days', days: skipDays } : undefined,
      selectedGroups: selectedGroups.length > 0 ? selectedGroups : undefined,
    };
    onSubmit(campaignData);
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const calculateAverageReplyRate = (segment: string): string | null => {
    const segmentCampaigns = campaigns.filter(
      (c) =>
        c.target_segment === segment &&
        c.metrics?.replied !== undefined &&
        c.metrics?.sent !== undefined &&
        c.metrics.sent > 0
    );

    if (segmentCampaigns.length === 0) return null;

    const avgRate =
      segmentCampaigns.reduce((acc, campaign) => {
        return acc + (campaign.metrics.replied / campaign.metrics.sent) * 100;
      }, 0) / segmentCampaigns.length;

    return avgRate.toFixed(0);
  };

  const averageReplyRate = calculateAverageReplyRate(formData.segment);
  const showInsight = campaigns.length >= 2 && averageReplyRate !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1E1E20]/95 dark:bg-[#1E1E20]/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-[600px] w-full max-h-[90vh] flex flex-col modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 px-8 pt-6">
          <h2 className="text-xl font-semibold text-white">
            Create New Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-6">
          <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-[#007AFF] transition-colors"
              placeholder="e.g., Summer Promo 2024"
              required
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsSegmentOpen(!isSegmentOpen)}
              className="w-full flex items-center justify-between text-sm font-medium text-white/90 mb-2 hover:text-white transition-colors"
            >
              <span>Target By</span>
              {isSegmentOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isSegmentOpen && (
              <div className="space-y-3">
                {/* Targeting Mode Toggle */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTargetingMode('segment')}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                      targetingMode === 'segment'
                        ? 'bg-[#007AFF] text-white'
                        : 'text-white/60 hover:text-white/90'
                    }`}
                  >
                    Segment
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetingMode('label')}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                      targetingMode === 'label'
                        ? 'bg-[#007AFF] text-white'
                        : 'text-white/60 hover:text-white/90'
                    }`}
                  >
                    WhatsApp Label
                  </button>
                </div>

                {/* Segment Mode */}
                {targetingMode === 'segment' && (
                  <>
                    <select
                      value={formData.segment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          segment: e.target.value as 'HOT' | 'WARM' | 'COLD',
                        })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#007AFF] transition-colors"
                    >
                      <option value="HOT" className="bg-[#1E1E20] text-white">
                        HOT Leads
                      </option>
                      <option value="WARM" className="bg-[#1E1E20] text-white">
                        WARM Leads
                      </option>
                      <option value="COLD" className="bg-[#1E1E20] text-white">
                        COLD Leads
                      </option>
                    </select>
                    {showInsight && (
                      <div className="px-4 py-3 bg-[#007AFF]/10 border border-[#007AFF]/30 rounded-lg">
                        <p className="text-sm text-[#007AFF] italic">
                          💡 Note: Based on your past campaigns, {formData.segment} leads average{' '}
                          {averageReplyRate}% reply rate
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Label Mode */}
                {targetingMode === 'label' && (
                  <>
                    <select
                      value={selectedLabel || ''}
                      onChange={(e) => setSelectedLabel(e.target.value || null)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#007AFF] transition-colors"
                    >
                      <option value="" className="bg-[#1E1E20] text-white/50">
                        Select a WhatsApp label...
                      </option>
                      {labels.map(label => (
                        <option
                          key={label.id}
                          value={label.whatsapp_label_name}
                          className="bg-[#1E1E20] text-white"
                        >
                          {label.whatsapp_label_name} → {label.crm_segment} / {label.lead_status}
                        </option>
                      ))}
                    </select>
                    {selectedLabel && (
                      <div className="px-4 py-3 bg-[#007AFF]/10 border border-[#007AFF]/30 rounded-lg">
                        <p className="text-sm text-[#007AFF]">
                          This label maps to: <strong>{labels.find(l => l.whatsapp_label_name === selectedLabel)?.crm_segment}</strong>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between text-sm font-medium text-white/90 mb-2 hover:text-white transition-colors"
            >
              <span>Contact Filter</span>
              {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isFilterOpen && (
              <div className="px-4 py-4 bg-white/5 border border-white/20 rounded-lg space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enableSkip}
                    onChange={(e) => setEnableSkip(e.target.checked)}
                    className="w-4 h-4 text-[#007AFF] bg-white/10 border-white/30 rounded focus:ring-[#007AFF] focus:ring-2"
                  />
                  <span className="text-sm text-white/90 group-hover:text-white transition-colors">
                    Skip leads contacted in last
                    <input
                      type="number"
                      value={skipDays}
                      onChange={(e) => setSkipDays(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={!enableSkip}
                      className="mx-2 w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:border-[#007AFF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      min="1"
                    />
                    days
                  </span>
                </label>
                <p className="text-xs text-white/50 ml-7">
                  {enableSkip
                    ? `Leads contacted within the last ${skipDays} day${skipDays !== 1 ? 's' : ''} will be excluded from this campaign`
                    : 'All leads in the selected segment will be included'}
                </p>
              </div>
            )}
          </div>

          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                <Users className="w-4 h-4 inline-block mr-2" />
                Filter by Groups (Optional)
              </label>
              <div className="px-4 py-4 bg-white/5 border border-white/20 rounded-lg space-y-2 max-h-48 overflow-y-auto">
                {isLoadingGroups ? (
                  <div className="text-sm text-white/50 text-center py-2">Loading groups...</div>
                ) : groups.length === 0 ? (
                  <div className="text-sm text-white/50 text-center py-2">No WhatsApp groups configured</div>
                ) : (
                  groups.map(group => (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer group transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => toggleGroupSelection(group.id)}
                        className="w-4 h-4 text-[#007AFF] bg-white/10 border-white/30 rounded focus:ring-[#007AFF] focus:ring-2"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white/90 truncate">
                            {group.group_name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#007AFF]/20 text-[#007AFF]">
                              {group.lead_count || 0} lead{(group.lead_count || 0) !== 1 ? 's' : ''}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              group.score_value > 0
                                ? 'bg-green-500/20 text-green-400'
                                : group.score_value < 0
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {group.score_value > 0 ? '+' : ''}{group.score_value}
                            </span>
                          </div>
                        </div>
                        {group.description && (
                          <p className="text-xs text-white/50 mt-0.5 truncate">{group.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedGroups.length > 0 && (
                <p className="mt-2 text-xs text-white/50">
                  {selectedGroups.length} group{selectedGroups.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setIsBudgetOpen(!isBudgetOpen)}
              className="w-full flex items-center justify-between text-sm font-medium text-white/90 mb-2 hover:text-white transition-colors"
            >
              <span>Budget (€) - Optional</span>
              {isBudgetOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isBudgetOpen && (
              <input
                type="number"
                value={formData.budget ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value === '' ? null : Number(e.target.value) })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-[#007AFF] transition-colors"
                placeholder="Leave blank if not tracking costs"
                min="0"
                step="100"
              />
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsSyncOpen(!isSyncOpen)}
              className="w-full flex items-center justify-between text-sm font-medium text-white/90 mb-2 hover:text-white transition-colors"
            >
              <span>Sync Reminder</span>
              {isSyncOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isSyncOpen && (
              <div className="space-y-3">
                <div className="space-y-2.5">
                  <label className="flex items-center px-4 py-3 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group">
                    <input
                      type="radio"
                      name="syncReminder"
                      value={0}
                      checked={formData.syncReminder === 0}
                      onChange={() => setFormData({ ...formData, syncReminder: 0 })}
                      className="w-4 h-4 text-[#007AFF] bg-white/10 border-white/30 focus:ring-[#007AFF] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-white/90 group-hover:text-white transition-colors">
                      No reminders
                    </span>
                  </label>

                  <label className="flex items-center px-4 py-3 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group">
                    <input
                      type="radio"
                      name="syncReminder"
                      value={3}
                      checked={formData.syncReminder === 3}
                      onChange={() => setFormData({ ...formData, syncReminder: 3 })}
                      className="w-4 h-4 text-[#007AFF] bg-white/10 border-white/30 focus:ring-[#007AFF] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-white/90 group-hover:text-white transition-colors">
                      Every 3 days <span className="text-white/50">(recommended)</span>
                    </span>
                  </label>

                  <label className="flex items-center px-4 py-3 bg-white/5 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group">
                    <input
                      type="radio"
                      name="syncReminder"
                      value={7}
                      checked={formData.syncReminder === 7}
                      onChange={() => setFormData({ ...formData, syncReminder: 7 })}
                      className="w-4 h-4 text-[#007AFF] bg-white/10 border-white/30 focus:ring-[#007AFF] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-white/90 group-hover:text-white transition-colors">
                      Every 7 days
                    </span>
                  </label>
                </div>
                <p className="text-xs text-white/50">
                  Get notified when it's time to upload campaign results
                </p>
              </div>
            )}
          </div>

          </div>
        </form>

        <div className="flex gap-3 px-8 pb-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-3 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:scale-[1.02] hover:brightness-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)]"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
