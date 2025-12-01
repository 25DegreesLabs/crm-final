import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, MessageSquare, Zap, Plus, Pencil, Trash2, RotateCcw, Archive, RefreshCw } from 'lucide-react';
import {
  getWhatsAppGroups,
  createWhatsAppGroup,
  updateWhatsAppGroup,
  deleteWhatsAppGroup,
  deleteAllWhatsAppGroups,
  bulkCreateWhatsAppGroups,
  getEngagementRules,
  createEngagementRule,
  updateEngagementRule,
  deleteEngagementRule,
  deleteAllEngagementRules,
  bulkCreateEngagementRules,
  getLabelMappingsWithLeadCounts,
  createLabelMapping,
  updateLabelMapping,
  deleteLabelMapping,
  archiveLabelMapping,
  reactivateLabelMapping,
  type WhatsAppGroup,
  type EngagementRule,
  type LabelMapping
} from '../lib/supabase-queries';
import { supabase } from '../lib/supabase';
import AddGroupModal from '../components/AddGroupModal';
import EditGroupModal from '../components/EditGroupModal';
import ResetGroupsModal from '../components/ResetGroupsModal';
import EditRulesModal from '../components/EditRulesModal';
import ResetRulesModal from '../components/ResetRulesModal';
import AddLabelMappingModal from '../components/AddLabelMappingModal';
import EditLabelMappingModal from '../components/EditLabelMappingModal';
import ConfirmLabelNameChangeModal from '../components/ConfirmLabelNameChangeModal';
import ConfirmLabelDeleteModal from '../components/ConfirmLabelDeleteModal';
import Toast from '../components/Toast';
import { CURRENT_USER_ID } from '../lib/constants';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'groups' | 'labels' | 'rules'>('groups');
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([]);
  const [engagementRules, setEngagementRules] = useState<EngagementRule[]>([]);
  const [labelMappings, setLabelMappings] = useState<LabelMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showResetGroupsModal, setShowResetGroupsModal] = useState(false);
  const [showEditRulesModal, setShowEditRulesModal] = useState(false);
  const [showResetRulesModal, setShowResetRulesModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<WhatsAppGroup | null>(null);
  const [showAddLabelModal, setShowAddLabelModal] = useState(false);
  const [showEditLabelModal, setShowEditLabelModal] = useState(false);
  const [showConfirmNameChangeModal, setShowConfirmNameChangeModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<LabelMapping | null>(null);
  const [pendingLabelUpdate, setPendingLabelUpdate] = useState<LabelMapping | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const loadWhatsAppGroups = async () => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      }

      const groups = await getWhatsAppGroups(userId);
      setWhatsappGroups(groups);
    } catch (error) {
      console.error('Error loading WhatsApp groups:', error);
      showToast('Failed to load WhatsApp groups', 'error');
    }
  };

  const loadEngagementRules = async () => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      }

      const rules = await getEngagementRules(userId);
      setEngagementRules(rules);
    } catch (error) {
      console.error('Error loading engagement rules:', error);
      showToast('Failed to load engagement rules', 'error');
    }
  };

  const loadLabelMappings = async () => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      }

      const labels = await getLabelMappingsWithLeadCounts(userId);
      setLabelMappings(labels);
    } catch (error) {
      console.error('Error loading label mappings:', error);
      showToast('Failed to load label mappings', 'error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadWhatsAppGroups(), loadEngagementRules(), loadLabelMappings()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleAddGroup = async (newGroup: Omit<WhatsAppGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showToast('You must be logged in to add groups', 'error');
          return;
        }
        userId = user.id;
      }

      await createWhatsAppGroup({
        user_id: userId,
        group_name: newGroup.group_name,
        score_value: newGroup.score_value,
        description: newGroup.description || ''
      });

      await loadWhatsAppGroups();
      setShowAddGroupModal(false);
      showToast('Group added successfully', 'success');
    } catch (error) {
      console.error('Error adding group:', error);
      showToast('Failed to add group', 'error');
    }
  };

  const handleEditGroup = async (updatedGroup: WhatsAppGroup) => {
    try {
      await updateWhatsAppGroup(updatedGroup.id, {
        group_name: updatedGroup.group_name,
        score_value: updatedGroup.score_value,
        description: updatedGroup.description || ''
      });

      await loadWhatsAppGroups();
      setShowEditGroupModal(false);
      setSelectedGroup(null);
      showToast('Group updated successfully', 'success');
    } catch (error) {
      console.error('Error updating group:', error);
      showToast('Failed to update group', 'error');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteWhatsAppGroup(groupId);
      await loadWhatsAppGroups();
      showToast('Group deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast('Failed to delete group', 'error');
    }
  };

  // FIXED: Reset to Default button handler - only inserts 3 positive groups
  const handleResetGroups = async () => {
    try {
      // Determine user ID
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showToast('You must be logged in to reset groups', 'error');
          return;
        }
        userId = user.id;
      }

      // 1. Delete ALL existing groups for the user
      await deleteAllWhatsAppGroups(userId);

      // 2. Define exactly these 3 groups (NO "do not contact" group)
      const defaultGroups = [
        {
          group_name: 'clients',
          score_value: 25,
          description: 'Active paying clients - highest priority'
        },
        {
          group_name: 'leads',
          score_value: 15,
          description: 'New potential leads - medium priority'
        },
        {
          group_name: 'old clients',
          score_value: 10,
          description: 'Previous clients to re-engage - lower priority'
        }
      ];

      // 3. Insert these 3 groups
      await bulkCreateWhatsAppGroups(userId, defaultGroups);

      // 4. Reload groups from database
      await loadWhatsAppGroups();

      // 5. Show success toast
      showToast('Reset to 3 default groups (50/50 budget)', 'success');
      
      // Close the modal
      setShowResetGroupsModal(false);

    } catch (error) {
      console.error('Error resetting groups:', error);
      showToast(
        `Failed to reset groups: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  const handleResetRules = async () => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showToast('You must be logged in to reset rules', 'error');
          return;
        }
        userId = user.id;
      }

      await deleteAllEngagementRules(userId);

      const defaultRules = [
        {
          rule_name: 'Replied to Message',
          rule_type: 'bonus' as const,
          points: 25,
          trigger_condition: 'reply_received = true',
          description: 'Lead replied to our message'
        },
        {
          rule_name: 'Recent Reply',
          rule_type: 'bonus' as const,
          points: 15,
          trigger_condition: 'last_reply_date > NOW() - INTERVAL \'7 days\'',
          description: 'Lead replied within the last 7 days'
        },
        {
          rule_name: 'Profile Complete',
          rule_type: 'bonus' as const,
          points: 10,
          trigger_condition: 'first_name IS NOT NULL AND last_name IS NOT NULL',
          description: 'Lead has complete profile information'
        },
        {
          rule_name: 'No Response After 3 Contacts',
          rule_type: 'penalty' as const,
          points: -15,
          trigger_condition: 'contact_count >= 3 AND reply_received = false',
          description: 'Lead has been contacted 3+ times without response'
        }
      ];

      await bulkCreateEngagementRules(userId, defaultRules);
      await loadEngagementRules();
      showToast('Reset to default engagement rules', 'success');
      setShowResetRulesModal(false);
    } catch (error) {
      console.error('Error resetting rules:', error);
      showToast('Failed to reset rules', 'error');
    }
  };

  const handleSaveRules = async (updatedRules: any[]) => {
    try {
      // Update each rule in the database
      for (const rule of updatedRules) {
        await updateEngagementRule(rule.id, {
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          points: rule.points,
          trigger_condition: rule.trigger_condition,
          description: rule.description,
          active: rule.active,
        });
      }
      // Reload rules to show updated data
      await loadEngagementRules();
      showToast('Engagement rules updated successfully', 'success');
      setShowEditRulesModal(false);
    } catch (error) {
      console.error('Error saving rules:', error);
      showToast('Failed to save rules', 'error');
    }
  };

  // =============================================
  // LABEL MAPPING CRUD HANDLERS
  // =============================================

  const handleAddLabel = async (newLabel: {
    whatsapp_label_name: string;
    crm_segment: 'COLD' | 'WARM' | 'HOT' | 'DEAD' | null;
    crm_status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null;
    engagement_level: 'NONE' | 'ENGAGED' | 'DISENGAGED' | null;
  }) => {
    try {
      const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
      let userId = CURRENT_USER_ID;

      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showToast('You must be logged in to add labels', 'error');
          return;
        }
        userId = user.id;
      }

      await createLabelMapping({
        user_id: userId,
        whatsapp_label_name: newLabel.whatsapp_label_name,
        crm_segment: newLabel.crm_segment,
        crm_status: newLabel.crm_status,
        engagement_level: newLabel.engagement_level,
      });

      await loadLabelMappings();
      setShowAddLabelModal(false);
      showToast('Label mapping added successfully', 'success');
    } catch (error) {
      console.error('Error adding label mapping:', error);
      showToast('Failed to add label mapping', 'error');
    }
  };

  const handleEditLabel = async (updatedLabel: LabelMapping, nameChanged: boolean) => {
    // If name changed, show confirmation modal
    if (nameChanged) {
      setPendingLabelUpdate(updatedLabel);
      setShowEditLabelModal(false);
      setShowConfirmNameChangeModal(true);
      return;
    }

    // Otherwise, save directly (set as pending first)
    setPendingLabelUpdate(updatedLabel);
    await handleConfirmLabelUpdate();
  };

  const handleConfirmLabelUpdate = async () => {
    try {
      const labelToUpdate = pendingLabelUpdate || selectedLabel;
      if (!labelToUpdate) return;

      await updateLabelMapping(labelToUpdate.id, {
        whatsapp_label_name: labelToUpdate.whatsapp_label_name,
        crm_segment: labelToUpdate.crm_segment,
        crm_status: labelToUpdate.crm_status,
        engagement_level: labelToUpdate.engagement_level,
      });

      await loadLabelMappings();
      setShowEditLabelModal(false);
      setShowConfirmNameChangeModal(false);
      setSelectedLabel(null);
      setPendingLabelUpdate(null);
      showToast('Label mapping updated successfully', 'success');
    } catch (error) {
      console.error('Error updating label mapping:', error);
      showToast('Failed to update label mapping', 'error');
    }
  };

  const handleDeleteLabel = async (label: LabelMapping) => {
    setSelectedLabel(label);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedLabel) return;

      await deleteLabelMapping(selectedLabel.id);
      await loadLabelMappings();
      setShowConfirmDeleteModal(false);
      setSelectedLabel(null);
      showToast('Label mapping deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting label mapping:', error);
      showToast('Failed to delete label mapping', 'error');
    }
  };

  const handleArchiveLabel = async () => {
    try {
      if (!selectedLabel) return;

      await archiveLabelMapping(selectedLabel.id);
      await loadLabelMappings();
      setShowConfirmDeleteModal(false);
      setSelectedLabel(null);
      showToast('Label mapping archived successfully', 'success');
    } catch (error) {
      console.error('Error archiving label mapping:', error);
      showToast('Failed to archive label mapping', 'error');
    }
  };

  const handleReactivateLabel = async (labelId: string) => {
    try {
      await reactivateLabelMapping(labelId);
      await loadLabelMappings();
      showToast('Label mapping reactivated successfully', 'success');
    } catch (error) {
      console.error('Error reactivating label mapping:', error);
      showToast('Failed to reactivate label mapping', 'error');
    }
  };

  const totalGroupScore = whatsappGroups.reduce((sum, group) => sum + group.score_value, 0);
  const maxScore = 50;
  const scorePercentage = (totalGroupScore / maxScore) * 100;

  const getScoreColor = () => {
    if (totalGroupScore <= 40) return 'text-apple-green';
    if (totalGroupScore <= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBarColor = () => {
    if (totalGroupScore <= 40) return 'bg-apple-green';
    if (totalGroupScore <= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const tabs = [
    { id: 'groups' as const, label: 'WhatsApp Groups', icon: Users },
    { id: 'labels' as const, label: 'Labels & Segments', icon: MessageSquare },
    { id: 'rules' as const, label: 'Engagement Rules', icon: Zap },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-apple-blue p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure your lead management preferences
          </p>
        </div>
      </div>

      <div className="glass dark:glass-dark rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
        <div className="border-b border-gray-200/30 dark:border-gray-700/30 overflow-x-auto">
          <nav className="flex min-w-max sm:min-w-0" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'text-apple-blue border-apple-blue bg-apple-blue/5'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-apple-blue hover:bg-apple-blue/5'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  <span className="inline xs:hidden sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6" role="tabpanel">
          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    WhatsApp Groups
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Configure scoring for different WhatsApp groups
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowResetGroupsModal(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default</span>
                  </button>
                  <button
                    onClick={() => setShowAddGroupModal(true)}
                    className="px-4 py-2 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)] text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Group</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Positive Group Score: {totalGroupScore}/{maxScore}
                  </span>
                  <span className={`text-base sm:text-lg font-bold ${getScoreColor()}`}>
                    {totalGroupScore}/{maxScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBarColor()} transition-all duration-300`}
                    style={{ width: `${Math.min(scorePercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Group Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {whatsappGroups.map((group) => (
                        <>
                          <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {group.group_name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-bold ${
                                group.score_value > 0 ? 'text-apple-green' : 'text-red-500'
                              }`}>
                                {group.score_value > 0 ? '+' : ''}{group.score_value}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedGroup(group);
                                    setShowEditGroupModal(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-apple-blue transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                                  aria-label="Edit group"
                                  title="Edit group"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                                  aria-label="Delete group"
                                  title="Delete group"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr key={`${group.id}-desc`} className="bg-gray-50/50 dark:bg-white/[0.02]">
                            <td colSpan={3} className="px-6 py-3">
                              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                {group.description || 'No description available'}
                              </p>
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                  {whatsappGroups.map((group) => (
                    <div key={group.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {group.group_name}
                        </span>
                        <span className={`text-base font-bold flex-shrink-0 ${
                          group.score_value > 0 ? 'text-apple-green' : 'text-red-500'
                        }`}>
                          {group.score_value > 0 ? '+' : ''}{group.score_value}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-3">
                        {group.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowEditGroupModal(true);
                          }}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="flex-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {whatsappGroups.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">No WhatsApp groups configured</p>
                    <button
                      onClick={() => setShowAddGroupModal(true)}
                      className="text-sm sm:text-base text-apple-blue hover:underline font-semibold"
                    >
                      Add your first group
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-apple-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-apple-blue">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      How Group Scoring Works
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Each WhatsApp group a lead belongs to contributes to their overall score.
                      Higher scores indicate more valuable leads. Keep total group scores under 50 points for balanced scoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'labels' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    Label Mappings
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Configure how WhatsApp labels map to CRM segments and engagement levels
                  </p>
                </div>
                <button
                  onClick={() => setShowAddLabelModal(true)}
                  className="px-4 py-2 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)] text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Label Mapping</span>
                </button>
              </div>

              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          WhatsApp Label
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Segment
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Engagement
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Leads
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {labelMappings.filter(l => l.is_active).map((label) => (
                        <tr key={label.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <code className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {label.whatsapp_label_name}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              label.crm_segment === 'COLD' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                              label.crm_segment === 'WARM' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                              label.crm_segment === 'HOT' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                              label.crm_segment === 'DEAD' ? 'bg-gray-500/20 text-gray-600 dark:text-gray-400' :
                              'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                            }`}>
                              {label.crm_segment || 'None'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {label.crm_status || 'None'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              label.engagement_level === 'ENGAGED' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                              label.engagement_level === 'DISENGAGED' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                              'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                            }`}>
                              {label.engagement_level || 'None'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {label.lead_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedLabel(label);
                                  setShowEditLabelModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-apple-blue transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                                aria-label="Edit label"
                                title="Edit label"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLabel(label)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                                aria-label="Delete label"
                                title="Delete label"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Archived Labels Section */}
                      {labelMappings.filter(l => !l.is_active).length > 0 && (
                        <>
                          <tr className="bg-gray-100 dark:bg-white/10">
                            <td colSpan={6} className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                  Archived Labels
                                </span>
                              </div>
                            </td>
                          </tr>
                          {labelMappings.filter(l => !l.is_active).map((label) => (
                            <tr key={label.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors opacity-60">
                              <td className="px-6 py-4">
                                <code className="text-sm font-mono font-semibold text-gray-600 dark:text-gray-400">
                                  {label.whatsapp_label_name}
                                </code>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-600 dark:text-gray-400">
                                  {label.crm_segment || 'None'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {label.crm_status || 'None'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-600 dark:text-gray-400">
                                  {label.engagement_level || 'None'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                  {label.lead_count || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleReactivateLabel(label.id)}
                                  className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-1"
                                  aria-label="Reactivate label"
                                  title="Reactivate label"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                  {labelMappings.filter(l => l.is_active).map((label) => (
                    <div key={label.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <code className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {label.whatsapp_label_name}
                        </code>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {label.lead_count || 0} leads
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          label.crm_segment === 'COLD' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                          label.crm_segment === 'WARM' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                          label.crm_segment === 'HOT' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                          label.crm_segment === 'DEAD' ? 'bg-gray-500/20 text-gray-600 dark:text-gray-400' :
                          'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {label.crm_segment || 'None'}
                        </span>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-600 dark:text-gray-400">
                          {label.crm_status || 'None'}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          label.engagement_level === 'ENGAGED' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                          label.engagement_level === 'DISENGAGED' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                          'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {label.engagement_level || 'None'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedLabel(label);
                            setShowEditLabelModal(true);
                          }}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteLabel(label)}
                          className="flex-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Archived Labels - Mobile */}
                  {labelMappings.filter(l => !l.is_active).length > 0 && (
                    <>
                      <div className="p-4 bg-gray-100 dark:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Archived Labels
                          </span>
                        </div>
                      </div>
                      {labelMappings.filter(l => !l.is_active).map((label) => (
                        <div key={label.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors opacity-60">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <code className="text-sm font-mono font-semibold text-gray-600 dark:text-gray-400">
                              {label.whatsapp_label_name}
                            </code>
                            <button
                              onClick={() => handleReactivateLabel(label.id)}
                              className="px-3 py-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {labelMappings.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">No label mappings configured</p>
                    <button
                      onClick={() => setShowAddLabelModal(true)}
                      className="text-sm sm:text-base text-apple-blue hover:underline font-semibold"
                    >
                      Add your first label mapping
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-apple-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-apple-blue">🏷️</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      How Label Mapping Works
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      When you upload WhatsApp labels, the CRM automatically updates lead records based on these mappings.
                      Set engagement level to "ENGAGED" for labels that indicate a lead has replied (like "on going" or "Past Clients").
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    Engagement Rules
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Configure scoring rules based on lead engagement behavior
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowResetRulesModal(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-white/15 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset to Default</span>
                  </button>
                  <button
                    onClick={() => setShowEditRulesModal(true)}
                    className="px-4 py-2 bg-[#007AFF] text-white rounded-xl font-semibold hover:scale-[1.02] hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 shadow-[0_4px_12px_rgba(0,122,255,0.2)] text-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit Rules</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Rule Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {engagementRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {rule.rule_name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${
                              rule.points > 0 ? 'text-apple-green' : 'text-red-500'
                            }`}>
                              {rule.points > 0 ? '+' : ''}{rule.points}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              rule.rule_type === 'bonus'
                                ? 'bg-apple-green/20 text-apple-green'
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {rule.rule_type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                  {engagementRules.map((rule) => (
                    <div key={rule.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                          {rule.rule_name}
                        </span>
                        <span className={`text-base font-bold flex-shrink-0 ${
                          rule.points > 0 ? 'text-apple-green' : 'text-red-500'
                        }`}>
                          {rule.points > 0 ? '+' : ''}{rule.points}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          rule.rule_type === 'bonus'
                            ? 'bg-apple-green/20 text-apple-green'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {rule.rule_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {engagementRules.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">No engagement rules configured</p>
                    <button
                      onClick={() => setShowResetRulesModal(true)}
                      className="text-sm sm:text-base text-apple-blue hover:underline font-semibold"
                    >
                      Load default rules
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-white/5 border-2 border-apple-blue/30 dark:border-apple-blue/40 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-apple-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-apple-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                      How Engagement Scoring Works
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      Engagement rules reward or penalize leads based on their behavior and interactions.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3">
                      THE 50/50 SCORING STRATEGY:
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      Your total lead score (0-100) comes from two equal parts:
                    </p>
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 sm:p-4 font-mono text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                      <div className="whitespace-pre leading-relaxed">
{`├─ GROUP SCORE (50 points max)
│  └─ Based on WhatsApp labels (configured in "WhatsApp Groups" tab)
│     Example: "clients" (+25) + "leads" (+15) = 40/50
│
└─ ENGAGEMENT SCORE (50 points max)
   └─ Based on behavior rules (configured below)
      Example: Replied (+15) + Profile Complete (+5) = 20/50

TOTAL SCORE = Group Score + Engagement Score
Example: 40 + 20 = 60/100 → WARM segment`}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2">
                      HOW RULES APPLY:
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-apple-green font-bold mt-0.5">•</span>
                        <span><span className="font-semibold text-gray-900 dark:text-white">Bonuses:</span> Add points when leads take positive actions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-0.5">•</span>
                        <span><span className="font-semibold text-gray-900 dark:text-white">Penalties:</span> Subtract points for unresponsive behavior</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-apple-blue font-bold mt-0.5">•</span>
                        <span><span className="font-semibold text-gray-900 dark:text-white">Cumulative:</span> Multiple rules can apply to the same lead</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-apple-blue/10 dark:bg-apple-blue/20 border border-apple-blue/30 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                      <span className="text-base sm:text-lg">💡</span>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1">
                          Pro Tip:
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          Balance your bonuses and penalties to create fair, nuanced scoring. Keep total possible bonuses around 50 points to maintain the 50/50 strategy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddGroupModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        onSave={handleAddGroup}
        currentTotal={totalGroupScore}
      />

      <EditGroupModal
        isOpen={showEditGroupModal}
        onClose={() => {
          setShowEditGroupModal(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        onSave={handleEditGroup}
        currentTotal={totalGroupScore}
      />

      <ResetGroupsModal
        isOpen={showResetGroupsModal}
        onClose={() => setShowResetGroupsModal(false)}
        onConfirm={handleResetGroups}
      />

      <EditRulesModal
        isOpen={showEditRulesModal}
        onClose={() => setShowEditRulesModal(false)}
        rules={engagementRules.map(rule => ({
          id: rule.id,
          name: rule.rule_name,
          score: rule.points,
          condition: rule.trigger_condition,
          type: rule.rule_type
        }))}
        onSave={handleSaveRules}
      />

      <ResetRulesModal
        isOpen={showResetRulesModal}
        onClose={() => setShowResetRulesModal(false)}
        onConfirm={handleResetRules}
      />

      <AddLabelMappingModal
        isOpen={showAddLabelModal}
        onClose={() => setShowAddLabelModal(false)}
        onSave={handleAddLabel}
      />

      <EditLabelMappingModal
        isOpen={showEditLabelModal}
        onClose={() => {
          setShowEditLabelModal(false);
          setSelectedLabel(null);
        }}
        label={selectedLabel}
        onSave={handleEditLabel}
      />

      <ConfirmLabelNameChangeModal
        isOpen={showConfirmNameChangeModal}
        onClose={() => {
          setShowConfirmNameChangeModal(false);
          setPendingLabelUpdate(null);
        }}
        onConfirm={handleConfirmLabelUpdate}
        oldName={selectedLabel?.whatsapp_label_name || ''}
        newName={pendingLabelUpdate?.whatsapp_label_name || ''}
      />

      <ConfirmLabelDeleteModal
        isOpen={showConfirmDeleteModal}
        onClose={() => {
          setShowConfirmDeleteModal(false);
          setSelectedLabel(null);
        }}
        onDelete={handleConfirmDelete}
        onArchive={handleArchiveLabel}
        labelName={selectedLabel?.whatsapp_label_name || ''}
        leadCount={selectedLabel?.lead_count || 0}
      />

      {/* Toast */}
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