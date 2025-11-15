// API service for communicating with backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Meeting {
  id?: string;
  recall_bot_id?: string;
  recall_meeting_id?: string;
  title?: string;
  meeting_link?: string;
  platform?: string;
  status?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  participant_count?: number;
  recording_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transcript {
  id?: string;
  meeting_id?: string;
  speaker?: string;
  message?: string;
  timestamp_seconds?: number;
  created_at?: string;
}

export interface AINote {
  id?: string;
  meeting_id?: string;
  type?: string;
  content?: any;
  created_at?: string;
  updated_at?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Meetings
  async getMeetings(): Promise<Meeting[]> {
    return this.request<Meeting[]>('/meetings');
  }

  async getMeeting(id: string): Promise<Meeting> {
    return this.request<Meeting>(`/meetings/${id}`);
  }

  // Transcripts
  async getTranscripts(meetingId: string): Promise<Transcript[]> {
    return this.request<Transcript[]>(`/meetings/${meetingId}/transcripts`);
  }

  // AI Notes
  async getAINotes(meetingId: string): Promise<AINote[]> {
    return this.request<AINote[]>(`/meetings/${meetingId}/ai-notes`);
  }

  // Summarization
  async summarizeMeeting(meetingId: string): Promise<{
    success: boolean;
    message: string;
    summary: {
      summary: string;
      highlights: string[];
      action_items: Array<{
        text: string;
        owner: string;
        due: string;
      }>;
    };
  }> {
    return this.request<{
      success: boolean;
      message: string;
      summary: {
        summary: string;
        highlights: string[];
        action_items: Array<{
          text: string;
          owner: string;
          due: string;
        }>;
      };
    }>(`/meetings/${meetingId}/summarize`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiService = new ApiService();

