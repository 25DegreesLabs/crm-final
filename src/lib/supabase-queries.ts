import { supabase } from './supabase';

// Mock data toggle - set to true to use mock data instead of Supabase
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

// Mock data definitions
const MOCK_LEADS_DATA = [
  { id: '1', segment: 'HOT' },
  { id: '2', segment: 'HOT' },
  { id: '3', segment: 'HOT' },
  { id: '4', segment: 'WARM' },
  { id: '5', segment: 'WARM' },
  { id: '6', segment: 'WARM' },
  { id: '7', segment: 'COLD' },
  { id: '8', segment: 'COLD' },
  { id: '9', segment: 'COLD' },
  { id: '10', segment: 'COLD' },
];

const MOCK_SYNC_EVENT: SyncEvent = {
  id: 'mock-sync-1',
  status: 'completed',
  total_leads: 10,
  segment_breakdown: { HOT: 3, WARM: 3, COLD: 4 },
  timestamp: new Date().toISOString(),
};

let MOCK_CAMPAIGNS_DATA: Campaign[] = [
  {
    id: 'mock-campaign-1',
    campaign_name: 'Summer Photography Special',
    description: 'Targeting warm leads for summer wedding photography',
    target_segment: 'WARM',
    contact_filter: { type: 'skip_days', days: 30 },
    leads_count: 3,
    start_date: '2025-01-15',
    end_date: null,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    status: 'ACTIVE',
    metrics: {
      sent_count: 3,
      failed_count: 0,
      replied_count: 2,
      bookings_count: 1,
    },
    budget_eur: 500,
    actual_cost_eur: 350,
    metadata: {},
    tags: ['summer', 'wedding'],
    user_id: 'mock-user-1',
    webhook_status: 'SUCCESS',
    expected_reply_rate: 65,
    last_synced_date: new Date().toISOString(),
    sync_reminder_frequency: 3,
    messages_sent: 3,
    messages_failed: 0,
    messages_duplicate: 0,
  },
  {
    id: 'mock-campaign-2',
    campaign_name: 'Holiday Portrait Sessions',
    description: 'Targeting hot leads for holiday family portraits',
    target_segment: 'HOT',
    contact_filter: { type: 'skip_days', days: 14 },
    leads_count: 3,
    start_date: '2025-01-10',
    end_date: null,
    created_at: '2025-01-10T14:30:00Z',
    updated_at: '2025-01-10T14:30:00Z',
    status: 'COMPLETED',
    metrics: {
      sent_count: 3,
      failed_count: 0,
      replied_count: 3,
      bookings_count: 2,
    },
    budget_eur: 800,
    actual_cost_eur: 600,
    metadata: {},
    tags: ['holiday', 'portrait'],
    user_id: 'mock-user-1',
    webhook_status: 'SUCCESS',
    expected_reply_rate: 80,
    last_synced_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sync_reminder_frequency: 7,
    messages_sent: 3,
    messages_failed: 0,
    messages_duplicate: 0,
  },
];

const MOCK_CAMPAIGN_LEADS: Lead[] = [
  {
    id: '1',
    phone_number: '+353871234567',
    first_name: 'Sarah',
    last_name: 'Johnson',
    segment: 'HOT',
    last_contacted_date: '2025-01-14T10:00:00Z',
  },
  {
    id: '2',
    phone_number: '+353872345678',
    first_name: 'Michael',
    last_name: 'Chen',
    segment: 'HOT',
    last_contacted_date: '2025-01-13T15:30:00Z',
  },
  {
    id: '3',
    phone_number: '+353873456789',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    segment: 'WARM',
    last_contacted_date: '2025-01-12T09:15:00Z',
  },
];

const MOCK_USER_AVERAGES: UserAverages = {
  avgReplyRate: 72.5,
  avgConversionRate: 45.2,
  campaignCount: 5,
};

export interface LeadMetrics {
  total: number;
  hot: number;
  warm: number;
  cold: number;
}

export interface ActionableMetrics {
  contactableLeads: number;
  activeCampaigns: number;
  repliedCount: number;
  repliedPercentage: number;
  lastSyncTime: string | null;
}

export interface SyncEvent {
  id: string;
  status: string;
  total_leads: number;
  segment_breakdown: Record<string, number> | null;
  timestamp: string;
}

export interface Campaign {
  id: string;
  campaign_name: string;
  description?: string | null;
  target_segment: string | null;
  contact_filter?: {
    type: string;
    days: number;
  } | null;
  leads_count: number;
  start_date: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  status: string | null;
  metrics?: Record<string, any> | null;
  budget_eur?: number | null;
  actual_cost_eur?: number | null;
  metadata?: Record<string, any> | null;
  tags?: any[] | null;
  user_id: string;
  webhook_status?: string | null;
  expected_reply_rate?: number | null;
  selected_groups?: string[];
}

export async function getLeadMetrics(): Promise<LeadMetrics> {
  if (USE_MOCK_DATA) {
    const metrics: LeadMetrics = {
      total: MOCK_LEADS_DATA.length,
      hot: MOCK_LEADS_DATA.filter(lead => lead.segment === 'HOT').length,
      warm: MOCK_LEADS_DATA.filter(lead => lead.segment === 'WARM').length,
      cold: MOCK_LEADS_DATA.filter(lead => lead.segment === 'COLD').length,
    };
    return Promise.resolve(metrics);
  }

  const { data, error } = await supabase
    .from('leads')
    .select('segment');

  if (error) {
    console.error('Error fetching lead metrics:', error);
    return { total: 0, hot: 0, warm: 0, cold: 0 };
  }

  const metrics: LeadMetrics = {
    total: data.length,
    hot: 0,
    warm: 0,
    cold: 0,
  };

  data.forEach((lead) => {
    if (lead.segment === 'HOT') metrics.hot++;
    else if (lead.segment === 'WARM') metrics.warm++;
    else if (lead.segment === 'COLD') metrics.cold++;
  });

  return metrics;
}

export async function getContactableLeadsCount(userId?: string): Promise<number> {
  if (USE_MOCK_DATA) {
    return Promise.resolve(270);
  }

  let query = supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('do_not_contact', false);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error fetching contactable leads count:', error);
    return 0;
  }

  return count || 0;
}

export async function getActiveCampaignsCount(userId?: string): Promise<number> {
  if (USE_MOCK_DATA) {
    return Promise.resolve(12);
  }

  let query = supabase
    .from('campaigns')
    .select('id', { count: 'exact', head: true })
    .in('status', ['ACTIVE', 'DRAFT', 'CREATED']);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error fetching active campaigns count:', error);
    return 0;
  }

  return count || 0;
}

export async function getRepliedLeadsMetrics(userId?: string): Promise<{ count: number; percentage: number }> {
  if (USE_MOCK_DATA) {
    return Promise.resolve({ count: 45, percentage: 16 });
  }

  let contactableQuery = supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('do_not_contact', false);

  let repliedQuery = supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('do_not_contact', false)
    .eq('reply_received', true);

  if (userId) {
    contactableQuery = contactableQuery.eq('user_id', userId);
    repliedQuery = repliedQuery.eq('user_id', userId);
  }

  const [contactableResult, repliedResult] = await Promise.all([
    contactableQuery,
    repliedQuery,
  ]);

  if (contactableResult.error) {
    console.error('Error fetching contactable leads:', contactableResult.error);
    return { count: 0, percentage: 0 };
  }

  if (repliedResult.error) {
    console.error('Error fetching replied leads:', repliedResult.error);
    return { count: 0, percentage: 0 };
  }

  const contactableCount = contactableResult.count || 0;
  const repliedCount = repliedResult.count || 0;
  const percentage = contactableCount > 0 ? Math.round((repliedCount / contactableCount) * 100) : 0;

  return { count: repliedCount, percentage };
}

export function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Never';

  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

export async function getActionableMetrics(userId?: string): Promise<ActionableMetrics> {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      contactableLeads: 270,
      activeCampaigns: 12,
      repliedCount: 45,
      repliedPercentage: 16,
      lastSyncTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    });
  }

  const [contactableLeads, activeCampaigns, repliedMetrics, latestSync] = await Promise.all([
    getContactableLeadsCount(userId),
    getActiveCampaignsCount(userId),
    getRepliedLeadsMetrics(userId),
    getLatestSync(),
  ]);

  return {
    contactableLeads,
    activeCampaigns,
    repliedCount: repliedMetrics.count,
    repliedPercentage: repliedMetrics.percentage,
    lastSyncTime: latestSync?.timestamp || null,
  };
}

export async function getLatestSync(): Promise<SyncEvent | null> {
  if (USE_MOCK_DATA) {
    return Promise.resolve(MOCK_SYNC_EVENT);
  }

  const { data, error } = await supabase
    .from('sync_events')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest sync:', error);
    return null;
  }

  return data;
}

export async function getCampaigns(limit: number = 10): Promise<Campaign[]> {
  if (USE_MOCK_DATA) {
    return Promise.resolve(MOCK_CAMPAIGNS_DATA.slice(0, limit));
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  return data || [];
}

export async function createCampaign(data: {
  name: string;
  segment: string;
  budget: number | null;
  syncReminder: number;
  contactFilter?: { type: string; days: number };
  user_id: string;
  selectedGroups?: string[];
}): Promise<Campaign> {
  if (USE_MOCK_DATA) {
    const newCampaign: Campaign = {
      id: `mock-campaign-${Date.now()}`,
      campaign_name: data.name,
      description: `Mock campaign targeting ${data.segment} leads`,
      target_segment: data.segment,
      contact_filter: data.contactFilter || { type: 'skip_days', days: 30 },
      leads_count: MOCK_LEADS_DATA.filter(lead => lead.segment === data.segment).length,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'CREATED',
      metrics: {
        sent_count: 0,
        failed_count: 0,
        replied_count: 0,
        bookings_count: 0,
      },
      budget_eur: data.budget,
      actual_cost_eur: 0,
      metadata: {},
      tags: [],
      user_id: data.user_id,
      webhook_status: 'PENDING_SHEETS_SYNC',
      expected_reply_rate: null,
      last_synced_date: new Date().toISOString(),
      sync_reminder_frequency: data.syncReminder,
      messages_sent: 0,
      messages_failed: 0,
      messages_duplicate: 0,
    };
    
    MOCK_CAMPAIGNS_DATA.unshift(newCampaign);
    return Promise.resolve(newCampaign);
  }

  const contactFilter = data.contactFilter || { type: 'skip_days', days: 30 };

  const { data: campaign, error: insertError } = await supabase
    .from('campaigns')
    .insert({
      campaign_name: data.name,
      target_segment: data.segment,
      budget_eur: data.budget,
      expected_reply_rate: null,
      sync_reminder_frequency: data.syncReminder,
      contact_filter: contactFilter,
      status: 'CREATED',
      leads_count: 0,
      webhook_status: 'PENDING_SHEETS_SYNC',
      user_id: data.user_id,
      start_date: new Date().toISOString().split('T')[0],
      metrics: {},
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating campaign:', insertError);
    throw new Error(insertError.message);
  }

  let query = supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('segment', data.segment);

  if (contactFilter.type === 'skip_days' && contactFilter.days > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - contactFilter.days);

    query = query.or(`last_contacted_date.is.null,last_contacted_date.lt.${cutoffDate.toISOString()}`);
  }

  const { count, error: countError } = await query;

  if (countError) {
    console.error('Error counting eligible leads:', countError);
  }

  const eligibleCount = count || 0;

  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ leads_count: eligibleCount })
    .eq('id', campaign.id);

  if (updateError) {
    console.error('Error updating campaign leads count:', updateError);
  }

  if (data.selectedGroups && data.selectedGroups.length > 0) {
    const groupAssociations = data.selectedGroups.map(groupId => ({
      campaign_id: campaign.id,
      group_id: groupId,
    }));

    const { error: groupError } = await supabase
      .from('campaign_groups')
      .insert(groupAssociations);

    if (groupError) {
      console.error('Error associating groups with campaign:', groupError);
    }
  }

  return {
    ...campaign,
    leads_count: eligibleCount,
    selected_groups: data.selectedGroups,
  };
}

export async function updateCampaignWebhookStatus(
  campaignId: string,
  status: 'SUCCESS' | 'FAILED'
): Promise<void> {
  if (USE_MOCK_DATA) {
    const campaign = MOCK_CAMPAIGNS_DATA.find(c => c.id === campaignId);
    if (campaign) {
      campaign.webhook_status = status;
    }
    return Promise.resolve();
  }

  const { error } = await supabase
    .from('campaigns')
    .update({ webhook_status: status })
    .eq('id', campaignId);

  if (error) {
    console.error('Error updating campaign webhook status:', error);
    throw new Error(error.message);
  }
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  if (USE_MOCK_DATA) {
    const campaign = MOCK_CAMPAIGNS_DATA.find(c => c.id === campaignId);
    return Promise.resolve(campaign || null);
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }

  return data;
}

export function subscribeSyncEvents(callback: (event: SyncEvent) => void) {
  if (USE_MOCK_DATA) {
    // Return a no-op unsubscribe function for mock mode
    return () => {};
  }

  const channel = supabase
    .channel('sync_status_changes')
    .on(
      'postgres_changes',
      {
        event: '*',  // Listen for INSERT and UPDATE since RPC does UPSERT
        schema: 'public',
        table: 'sync_status',  // Changed from sync_events to sync_status
      },
      (payload) => {
        // Map sync_status structure to SyncEvent interface
        const syncStatus = payload.new as any;
        const mockEvent: SyncEvent = {
          id: syncStatus.id || '',
          status: 'success',  // sync_status doesn't have status, assume success
          total_leads: syncStatus.processed_count || 0,
          segment_breakdown: null,  // sync_status doesn't have this
          timestamp: syncStatus.last_synced_at || syncStatus.updated_at || new Date().toISOString(),
        };
        callback(mockEvent);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export interface Lead {
  id: string;
  phone_number: string;
  first_name: string | null;
  last_name: string | null;
  segment: string;
  last_contacted_date: string | null;
}

export async function getCampaignLeads(campaign: Campaign): Promise<Lead[]> {
  if (USE_MOCK_DATA) {
    const filteredLeads = MOCK_CAMPAIGN_LEADS.filter(lead => 
      lead.segment === campaign.target_segment
    );
    return Promise.resolve(filteredLeads);
  }

  let query = supabase
    .from('leads')
    .select('id, phone_number, first_name, last_name, segment, last_contacted_date')
    .eq('segment', campaign.target_segment || '');

  const contactFilter = campaign.contact_filter;
  if (contactFilter && contactFilter.type === 'skip_days' && contactFilter.days > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - contactFilter.days);
    query = query.or(`last_contacted_date.is.null,last_contacted_date.lt.${cutoffDate.toISOString()}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching campaign leads:', error);
    return [];
  }

  return data || [];
}

export interface UserAverages {
  avgReplyRate: number;
  avgConversionRate: number;
  campaignCount: number;
}

export async function getUserAverages(userId: string, excludeCampaignId?: string): Promise<UserAverages> {
  if (USE_MOCK_DATA) {
    return Promise.resolve(MOCK_USER_AVERAGES);
  }

  let query = supabase
    .from('campaigns')
    .select('metrics')
    .eq('user_id', userId)
    .not('metrics', 'is', null);

  if (excludeCampaignId) {
    query = query.neq('id', excludeCampaignId);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return { avgReplyRate: 0, avgConversionRate: 0, campaignCount: 0 };
  }

  let totalReplyRate = 0;
  let totalConversionRate = 0;
  let validReplyRateCampaigns = 0;
  let validConversionRateCampaigns = 0;

  data.forEach((campaign) => {
    const metrics = campaign.metrics as any;
    if (!metrics) return;

    const sentCount = metrics.sent_count || 0;
    const repliedCount = metrics.replied_count || 0;
    const bookingsCount = metrics.bookings_count || 0;

    if (sentCount > 0) {
      const replyRate = (repliedCount / sentCount) * 100;
      totalReplyRate += replyRate;
      validReplyRateCampaigns++;
    }

    if (repliedCount > 0) {
      const conversionRate = (bookingsCount / repliedCount) * 100;
      totalConversionRate += conversionRate;
      validConversionRateCampaigns++;
    }
  });

  return {
    avgReplyRate: validReplyRateCampaigns > 0 ? totalReplyRate / validReplyRateCampaigns : 0,
    avgConversionRate: validConversionRateCampaigns > 0 ? totalConversionRate / validConversionRateCampaigns : 0,
    campaignCount: data.length,
  };
}

export interface WhatsAppGroup {
  id: string;
  user_id: string;
  group_name: string;
  score_value: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  lead_count?: number;
}

export async function getWhatsAppGroups(userId: string): Promise<WhatsAppGroup[]> {
  const { data, error } = await supabase
    .from('user_whatsapp_groups')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching WhatsApp groups:', error);
    return [];
  }

  return data || [];
}

export async function getWhatsAppGroupsWithLeadCounts(userId: string): Promise<WhatsAppGroup[]> {
  const groups = await getWhatsAppGroups(userId);

  const groupsWithCounts = await Promise.all(
    groups.map(async (group) => {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .or(`whatsapp_groups_raw.cs.{"${group.group_name}"},positive_signal_groups.cs.{"${group.group_name}"},negative_signal_groups.cs.{"${group.group_name}"},neutral_signal_groups.cs.{"${group.group_name}"}`);

      if (error) {
        console.error(`Error counting leads for group ${group.group_name}:`, error);
        return { ...group, lead_count: 0 };
      }

      return { ...group, lead_count: count || 0 };
    })
  );

  return groupsWithCounts;
}

export async function createWhatsAppGroup(data: {
  user_id: string;
  group_name: string;
  score_value: number;
  description?: string;
}): Promise<WhatsAppGroup> {
  const { data: group, error } = await supabase
    .from('user_whatsapp_groups')
    .insert({
      user_id: data.user_id,
      group_name: data.group_name,
      score_value: data.score_value,
      description: data.description || '',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating WhatsApp group:', error);
    throw new Error(error.message);
  }

  return group;
}

export async function updateWhatsAppGroup(
  id: string,
  data: {
    group_name?: string;
    score_value?: number;
    description?: string;
  }
): Promise<WhatsAppGroup> {
  const { data: group, error } = await supabase
    .from('user_whatsapp_groups')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating WhatsApp group:', error);
    throw new Error(error.message);
  }

  return group;
}

export async function deleteWhatsAppGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_whatsapp_groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting WhatsApp group:', error);
    throw new Error(error.message);
  }
}

export async function deleteAllWhatsAppGroups(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_whatsapp_groups')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting all WhatsApp groups:', error);
    throw new Error(error.message);
  }
}

export async function bulkCreateWhatsAppGroups(
  userId: string,
  groups: Array<{
    group_name: string;
    score_value: number;
    description?: string;
  }>
): Promise<WhatsAppGroup[]> {
  const groupsToInsert = groups.map(group => ({
    user_id: userId,
    group_name: group.group_name,
    score_value: group.score_value,
    description: group.description || '',
  }));

  const { data, error } = await supabase
    .from('user_whatsapp_groups')
    .insert(groupsToInsert)
    .select();

  if (error) {
    console.error('Error bulk creating WhatsApp groups:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export interface EngagementRule {
  id: string;
  user_id: string;
  rule_name: string;
  rule_type: 'bonus' | 'penalty';
  points: number;
  trigger_condition: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getEngagementRules(userId: string): Promise<EngagementRule[]> {
  const { data, error } = await supabase
    .from('engagement_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching engagement rules:', error);
    return [];
  }

  return data || [];
}

export async function createEngagementRule(data: {
  user_id: string;
  rule_name: string;
  rule_type: 'bonus' | 'penalty';
  points: number;
  trigger_condition: string;
  description?: string;
  active?: boolean;
}): Promise<EngagementRule> {
  const { data: rule, error } = await supabase
    .from('engagement_rules')
    .insert({
      user_id: data.user_id,
      rule_name: data.rule_name,
      rule_type: data.rule_type,
      points: data.points,
      trigger_condition: data.trigger_condition,
      description: data.description || '',
      active: data.active !== undefined ? data.active : true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating engagement rule:', error);
    throw new Error(error.message);
  }

  return rule;
}

export async function updateEngagementRule(
  id: string,
  data: {
    rule_name?: string;
    rule_type?: 'bonus' | 'penalty';
    points?: number;
    trigger_condition?: string;
    description?: string;
    active?: boolean;
  }
): Promise<EngagementRule> {
  const { data: rule, error } = await supabase
    .from('engagement_rules')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating engagement rule:', error);
    throw new Error(error.message);
  }

  return rule;
}

export async function deleteEngagementRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('engagement_rules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting engagement rule:', error);
    throw new Error(error.message);
  }
}

export async function deleteAllEngagementRules(userId: string): Promise<void> {
  const { error } = await supabase
    .from('engagement_rules')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting all engagement rules:', error);
    throw new Error(error.message);
  }
}

export async function bulkCreateEngagementRules(
  userId: string,
  rules: Array<{
    rule_name: string;
    rule_type: 'bonus' | 'penalty';
    points: number;
    trigger_condition: string;
    description?: string;
    active?: boolean;
  }>
): Promise<EngagementRule[]> {
  const rulesToInsert = rules.map(rule => ({
    user_id: userId,
    rule_name: rule.rule_name,
    rule_type: rule.rule_type,
    points: rule.points,
    trigger_condition: rule.trigger_condition,
    description: rule.description || '',
    active: rule.active !== undefined ? rule.active : true,
  }));

  const { data, error } = await supabase
    .from('engagement_rules')
    .insert(rulesToInsert)
    .select();

  if (error) {
    console.error('Error bulk creating engagement rules:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export interface LeadListItem {
  id: string;
  phone_number: string;
  first_name: string | null;
  last_name: string | null;
  segment: string;
  lead_score: number;
  last_contacted_date: string | null;
  status: string | null;
  reply_received: boolean | null;
  engagement_level: string | null;
  positive_signal_groups: string[] | null;
}

export interface LeadDetail extends LeadListItem {
  email: string | null;
  nationality: string | null;
  bio_snippet: string | null;
  preferred_language: string | null;
  timezone: string | null;
  source_url: string | null;
  scrape_source: string | null;
  first_seen_date: string | null;
  last_scrape_seen_date: string | null;
  scrape_appearance_count: number;
  profile_changed: boolean;
  first_contacted_date: string | null;
  contact_count: number;
  last_reply_date: string | null;
  whatsapp_groups_raw: string[] | null;
  negative_signal_groups: string[] | null;
  neutral_signal_groups: string[] | null;
  intent_groups: string[] | null;
  custom_groups: string[] | null;
  group_net_score: number;
  primary_group: string | null;
  primary_group_category: string | null;
  total_groups_count: number;
  do_not_contact: boolean;
  do_not_contact_reason: string | null;
  notes: string | null;
  delivery_status: string | null;
  send_failures: number;
  created_at: string;
  updated_at: string;
}

export interface LeadsQueryParams {
  userId: string;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  segmentFilter?: string;
  statusFilter?: string;
  activityFilter?: string;
}

export interface LeadsQueryResult {
  leads: LeadListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getLeads(params: LeadsQueryParams): Promise<LeadsQueryResult> {
  const {
    userId,
    page = 1,
    pageSize = 50,
    searchTerm = '',
    segmentFilter = 'all',
    statusFilter = 'all',
    activityFilter = 'all',
  } = params;

  let query = supabase
    .from('leads')
    .select(
      `
      id,
      phone_number::text,
      first_name,
      last_name,
      segment,
      lead_score,
      last_contacted_date,
      status,
      reply_received,
      engagement_level,
      positive_signal_groups
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId);

  if (searchTerm) {
    const phoneDigits = searchTerm.replace(/\D/g, '');
    if (phoneDigits) {
      query = query.or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,phone_number::text.ilike.%${phoneDigits}%`
      );
    } else {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
    }
  }

  if (segmentFilter !== 'all') {
    query = query.eq('segment', segmentFilter);
  }

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (activityFilter === 'Never Contacted') {
    query = query.is('last_contacted_date', null);
  } else if (activityFilter === 'Contacted') {
    query = query
      .not('last_contacted_date', 'is', null)
      .eq('reply_received', false)
      .neq('engagement_level', 'ENGAGED');
  } else if (activityFilter === 'Replied') {
    query = query.or('(engagement_level.eq.ENGAGED),(reply_received.eq.true)');
  }

  const countQuery = query;
  const { count } = await countQuery;

  query = query
    .order('lead_score', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    throw new Error(error.message);
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    leads: data || [],
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

export async function getLeadDetail(leadId: string): Promise<LeadDetail | null> {
  const { data, error } = await supabase
    .from('leads')
    .select(
      `
      id,
      phone_number,
      first_name,
      last_name,
      email,
      nationality,
      bio_snippet,
      preferred_language,
      timezone,
      source_url,
      scrape_source,
      first_seen_date,
      last_scrape_seen_date,
      scrape_appearance_count,
      profile_changed,
      first_contacted_date,
      last_contacted_date,
      contact_count,
      reply_received,
      engagement_level,
      last_reply_date,
      status,
      segment,
      lead_score,
      whatsapp_groups_raw,
      positive_signal_groups,
      negative_signal_groups,
      neutral_signal_groups,
      intent_groups,
      custom_groups,
      group_net_score,
      primary_group,
      primary_group_category,
      total_groups_count,
      do_not_contact,
      do_not_contact_reason,
      notes,
      delivery_status,
      send_failures,
      created_at,
      updated_at
    `
    )
    .eq('id', leadId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching lead detail:', error);
    return null;
  }

  // Convert phone_number to string if it's not already
  if (data && data.phone_number) {
    data.phone_number = String(data.phone_number);
  }

  return data;
}

export interface LeadPipelineMetrics {
  totalLeads: number;
  totalActiveLeads: number;
  hotLeads: number;
  replyRate: number;
  averageScore: number;
}

export interface SegmentDistribution {
  segment: string;
  count: number;
  percentage: number;
}

export async function getLeadPipelineMetrics(userId: string): Promise<LeadPipelineMetrics> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('segment, status, reply_received, engagement_level, lead_score, do_not_contact')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching lead pipeline metrics:', error);
    return {
      totalLeads: 0,
      totalActiveLeads: 0,
      hotLeads: 0,
      replyRate: 0,
      averageScore: 0,
    };
  }

  if (!leads || leads.length === 0) {
    return {
      totalLeads: 0,
      totalActiveLeads: 0,
      hotLeads: 0,
      replyRate: 0,
      averageScore: 0,
    };
  }

  const totalLeads = leads.length;

  const activeLeads = leads.filter(
    lead => lead.status !== 'NOT_INTERESTED' && lead.do_not_contact === false
  );

  const totalActiveLeads = activeLeads.length;

  const hotLeads = activeLeads.filter(
    lead => lead.segment === 'HOT'
  ).length;

  const repliedLeads = activeLeads.filter(
    lead => lead.engagement_level === 'ENGAGED' || lead.reply_received === true
  ).length;

  const replyRate = totalActiveLeads > 0
    ? (repliedLeads / totalActiveLeads) * 100
    : 0;

  const totalScore = activeLeads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0);
  const averageScore = totalActiveLeads > 0
    ? totalScore / totalActiveLeads
    : 0;

  return {
    totalLeads,
    totalActiveLeads,
    hotLeads,
    replyRate,
    averageScore,
  };
}

export async function getCampaignGroups(campaignId: string): Promise<WhatsAppGroup[]> {
  const { data, error } = await supabase
    .from('campaign_groups')
    .select(`
      group_id,
      user_whatsapp_groups (
        id,
        user_id,
        group_name,
        score_value,
        description,
        created_at,
        updated_at
      )
    `)
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error fetching campaign groups:', error);
    return [];
  }

  if (!data) return [];

  return data
    .filter(item => item.user_whatsapp_groups)
    .map(item => item.user_whatsapp_groups as unknown as WhatsAppGroup);
}

export async function getSegmentDistribution(userId: string): Promise<SegmentDistribution[]> {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('segment, status')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching segment distribution:', error);
    return [];
  }

  if (!leads || leads.length === 0) {
    return [];
  }

  const activeLeads = leads.filter(
    lead => lead.status !== 'NOT_INTERESTED' && lead.do_not_contact === false
  );

  const totalActive = activeLeads.length;

  const segmentCounts: Record<string, number> = {
    HOT: 0,
    WARM: 0,
    COLD: 0,
    DEAD: 0,
  };

  activeLeads.forEach(lead => {
    const segment = lead.segment || 'DEAD';
    if (segmentCounts[segment] !== undefined) {
      segmentCounts[segment]++;
    }
  });

  const segmentOrder = ['HOT', 'WARM', 'COLD', 'DEAD'];

  return segmentOrder.map(segment => ({
    segment,
    count: segmentCounts[segment],
    percentage: totalActive > 0 ? Math.round((segmentCounts[segment] / totalActive) * 1000) / 10 : 0,
  }));
}

export async function generateCampaignCSV(campaignId: string): Promise<string> {
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('target_segment, contact_filter, user_id')
    .eq('id', campaignId)
    .maybeSingle();

  if (campaignError || !campaign) {
    console.error('Error fetching campaign:', campaignError);
    throw new Error('Failed to fetch campaign details');
  }

  let query = supabase
    .from('leads')
    .select('phone_number::text, first_name, last_name')
    .eq('user_id', campaign.user_id);

  if (campaign.target_segment && campaign.target_segment !== 'ALL') {
    query = query.eq('segment', campaign.target_segment);
  }

  if (campaign.contact_filter?.days && campaign.contact_filter.days > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - campaign.contact_filter.days);
    query = query.or(`last_contacted_date.is.null,last_contacted_date.lt.${cutoffDate.toISOString()}`);
  }

  const { data: leads, error: leadsError } = await query;

  if (leadsError) {
    console.error('Error fetching leads:', leadsError);
    throw new Error('Failed to fetch leads');
  }

  if (!leads || leads.length === 0) {
    throw new Error('No leads found for this campaign');
  }

  const headers = 'WhatsApp Number,First Name,Last Name,Icebreaker';
  const rows = leads.map(lead => {
    const phone = String(lead.phone_number || '');
    const firstName = String(lead.first_name || '');
    const lastName = String(lead.last_name || '');

    const phoneWithPlus = phone && !phone.startsWith('+') ? '+' + phone : phone;

    return `${phoneWithPlus},${firstName},${lastName},`;
  });

  return [headers, ...rows].join('\n');
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    const index = MOCK_CAMPAIGNS_DATA.findIndex(c => c.id === campaignId);
    if (index !== -1) {
      MOCK_CAMPAIGNS_DATA.splice(index, 1);
    }
    return Promise.resolve();
  }

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);

  if (error) {
    console.error('Error deleting campaign:', error);
    throw new Error(error.message);
  }
}

// =============================================
// LABEL MAPPING CRUD FUNCTIONS
// =============================================

export interface LabelMapping {
  id: string;
  user_id: string;
  whatsapp_label_name: string;
  crm_segment: 'COLD' | 'WARM' | 'HOT' | 'DEAD' | null;
  crm_status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null;
  engagement_level: 'NONE' | 'ENGAGED' | 'DISENGAGED' | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  lead_count?: number;
}

export async function getLabelMappings(userId: string): Promise<LabelMapping[]> {
  const { data, error } = await supabase
    .from('user_label_mappings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching label mappings:', error);
    return [];
  }

  return data || [];
}

export async function getLabelMappingsWithLeadCounts(userId: string): Promise<LabelMapping[]> {
  const labels = await getLabelMappings(userId);

  const labelsWithCounts = await Promise.all(
    labels.map(async (label) => {
      try {
        // Count leads that have this label's segment, status, and engagement level
        // This is an approximation - more accurate would be to track label assignments
        let query = supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Handle NULL values properly
        if (label.crm_segment === null) {
          query = query.is('segment', null);
        } else {
          query = query.eq('segment', label.crm_segment);
        }

        if (label.crm_status === null) {
          query = query.is('status', null);
        } else {
          query = query.eq('status', label.crm_status);
        }

        if (label.engagement_level === null) {
          query = query.is('engagement_level', null);
        } else {
          query = query.eq('engagement_level', label.engagement_level);
        }

        const { count, error } = await query;

        if (error) {
          console.error(`Error counting leads for label ${label.whatsapp_label_name}:`, error);
          return { ...label, lead_count: 0 };
        }

        return { ...label, lead_count: count || 0 };
      } catch (err) {
        console.error(`Exception counting leads for label ${label.whatsapp_label_name}:`, err);
        return { ...label, lead_count: 0 };
      }
    })
  );

  return labelsWithCounts;
}

export async function createLabelMapping(data: {
  user_id: string;
  whatsapp_label_name: string;
  crm_segment: 'COLD' | 'WARM' | 'HOT' | 'DEAD' | null;
  crm_status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null;
  engagement_level: 'NONE' | 'ENGAGED' | 'DISENGAGED' | null;
}): Promise<LabelMapping> {
  const { data: label, error } = await supabase
    .from('user_label_mappings')
    .insert({
      user_id: data.user_id,
      whatsapp_label_name: data.whatsapp_label_name,
      crm_segment: data.crm_segment,
      crm_status: data.crm_status,
      engagement_level: data.engagement_level,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating label mapping:', error);
    throw new Error(error.message);
  }

  return label;
}

export async function updateLabelMapping(
  id: string,
  data: {
    whatsapp_label_name?: string;
    crm_segment?: 'COLD' | 'WARM' | 'HOT' | 'DEAD' | null;
    crm_status?: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'NOT_INTERESTED' | null;
    engagement_level?: 'NONE' | 'ENGAGED' | 'DISENGAGED' | null;
  }
): Promise<LabelMapping> {
  const { data: label, error } = await supabase
    .from('user_label_mappings')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating label mapping:', error);
    throw new Error(error.message);
  }

  return label;
}

export async function deleteLabelMapping(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_label_mappings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting label mapping:', error);
    throw new Error(error.message);
  }
}

export async function archiveLabelMapping(id: string): Promise<LabelMapping> {
  const { data: label, error } = await supabase
    .from('user_label_mappings')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error archiving label mapping:', error);
    throw new Error(error.message);
  }

  return label;
}

export async function reactivateLabelMapping(id: string): Promise<LabelMapping> {
  const { data: label, error } = await supabase
    .from('user_label_mappings')
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error reactivating label mapping:', error);
    throw new Error(error.message);
  }

  return label;
}
