import { CURRENT_USER_ID } from './constants';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const N8N_CAMPAIGN_WEBHOOK_URL = import.meta.env.VITE_N8N_CAMPAIGN_WEBHOOK_URL;
const DEFAULT_FILE_PATH = '/path/to/mock_data_generator/outputs/MAIN_LEADS.csv';
const WEBHOOK_TIMEOUT = 60000;

// Mock data toggle - should match the one in supabase-queries.ts
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

export interface SyncResponse {
  success: boolean;
  total_leads?: number;
  message?: string;
  error?: string;
}

export interface CampaignWebhookPayload {
  campaign_name: string;
  target_segment: string;
  budget_eur: number;
  expected_reply_rate: number;
  contact_filter: {
    type: string;
    days: number;
  };
  user_id: string;
  timestamp: string;
  start_date: string;
}

export interface CampaignWebhookResponse {
  success: boolean;
  campaign_id?: string;
  eligible_leads?: number;
  message?: string;
  error?: string;
}

export async function triggerDatabaseSync(
  filePath: string = DEFAULT_FILE_PATH
): Promise<SyncResponse> {
  if (USE_MOCK_DATA) {
    // Simulate a successful sync with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          total_leads: 10,
          message: 'Mock sync completed successfully',
        });
      }, 1000); // Simulate network delay
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_path: filePath,
        action: 'sync_from_dashboard',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      total_leads: data.total_leads || data.totalLeads || 0,
      message: data.message,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Sync taking longer than expected. Please check back in a moment.',
        };
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Connection failed. Please check your internet connection and try again.',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function triggerCampaignWebhook(
  campaignData: Omit<CampaignWebhookPayload, 'user_id' | 'timestamp' | 'start_date'>,
  userId: string
): Promise<CampaignWebhookResponse> {
  if (USE_MOCK_DATA) {
    // Simulate a successful campaign webhook response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          campaign_id: `mock-campaign-${Date.now()}`,
          eligible_leads: Math.floor(Math.random() * 50) + 10,
          message: 'Mock campaign webhook completed successfully',
        });
      }, 1500); // Simulate network delay
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  const payload: CampaignWebhookPayload = {
    ...campaignData,
    user_id: userId,
    timestamp: new Date().toISOString(),
    start_date: new Date().toISOString().split('T')[0],
  };

  try {
    const response = await fetch(N8N_CAMPAIGN_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      campaign_id: data.campaign_id || data.campaignId,
      eligible_leads: data.eligible_leads || data.eligibleLeads || 0,
      message: data.message,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Campaign sync taking longer than expected. Please check back in a moment.',
        };
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Connection failed. Please check your internet connection and try again.',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export interface UploadResultsResponse {
  success: boolean;
  processed_count?: number;
  message?: string;
  error?: string;
}

export async function uploadCampaignResults(
  file: File,
  campaignId: string,
  campaignName: string
): Promise<UploadResultsResponse> {
  if (USE_MOCK_DATA) {
    // Simulate a successful upload with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          processed_count: Math.floor(Math.random() * 20) + 5,
          message: 'Mock upload completed successfully',
        });
      }, 2000); // Simulate file upload delay
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', 'results');
    formData.append('campaign_id', campaignId);
    formData.append('campaign_name', campaignName);
    formData.append('user_id', CURRENT_USER_ID);
    formData.append('file_name', file.name);

    if (!N8N_WEBHOOK_URL) {
      return {
        success: false,
        error: 'Webhook not configured. Please check environment variables.',
      };
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: true };
    } catch (e) {
      console.warn('Response not JSON:', text);
      data = { success: true, message: 'Upload completed' };
    }
    return {
      success: true,
      processed_count: data.processed_count || data.processedCount || 0,
      message: data.message,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Upload taking longer than expected. Please check back in a moment.',
        };
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Connection failed. Please check your internet connection and try again.',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export interface UploadNewScrapesResponse {
  success: boolean;
  processed_count?: number;
  message?: string;
  error?: string;
}

export async function uploadNewScrapes(
  file: File,
  source: string,
  userId: string = CURRENT_USER_ID
): Promise<UploadNewScrapesResponse> {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          processed_count: Math.floor(Math.random() * 50) + 10,
          message: `Mock upload completed successfully from ${source}`,
        });
      }, 2000);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', 'new_scrapes');
    formData.append('source', source);
    formData.append('user_id', userId);
    formData.append('file_name', file.name);

    if (!N8N_WEBHOOK_URL) {
      return {
        success: false,
        error: 'Webhook not configured. Please check environment variables.',
      };
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      processed_count: data.processed_count || data.processedCount || 0,
      message: data.message || `Successfully uploaded leads from ${source}`,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Upload taking longer than expected. Please check back in a moment.',
        };
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Connection failed. Please check your internet connection and try again.',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export interface UploadLabelsResponse {
  success: boolean;
  processed_count?: number;
  message?: string;
  error?: string;
}

export async function uploadLabels(
  file: File,
  userId: string = CURRENT_USER_ID
): Promise<UploadLabelsResponse> {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          processed_count: Math.floor(Math.random() * 30) + 5,
          message: 'Mock labels upload completed successfully',
        });
      }, 2000);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

  try {
    if (!N8N_WEBHOOK_URL) {
      return {
        success: false,
        error: 'Webhook not configured. Please check environment variables.',
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_type', 'labels');
    formData.append('user_id', userId);
    formData.append('file_name', file.name);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: true };
    } catch (e) {
      console.warn('Response not JSON:', text);
      data = { success: true, message: 'Upload completed' };
    }
    return {
      success: true,
      processed_count: data.processed_count || data.processedCount || 0,
      message: data.message || 'Successfully uploaded labels',
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Upload taking longer than expected. Please check back in a moment.',
        };
      }

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Connection failed. Please check your internet connection and try again.',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
