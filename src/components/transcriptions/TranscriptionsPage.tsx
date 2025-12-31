import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import { getTranscriptions, getTranscription, type Transcription } from '../../services/transcriptionApi';
import { getSlackStatus } from '../../services/slackApi';
import { getNotionStatus } from '../../services/notionApi';
import { getHubSpotStatus } from '../../services/hubspotApi';
// import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import searchIcon from '../../assets/Vector.png';

// Helper functions
function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'N/A';
  }
}

function formatTime(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
}


export function TranscriptionsPage(): JSX.Element {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<any>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptionSearchQuery, setTranscriptionSearchQuery] = useState('');
  const [exporting, setExporting] = useState<{ [key: string]: boolean }>({});
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  // Fetch transcriptions on mount
  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTranscriptions(profile.id || '');
        setTranscriptions(data);
        
        // Update selectedTranscription if it's still selected
        if (selectedTranscription) {
          const updated = data.find(t => t.id === selectedTranscription.id);
          if (updated) {
            setSelectedTranscription(updated);
          }
        }
      } catch (err) {
        console.error('Error fetching transcriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transcriptions');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [profile?.id]);

  // Filter transcriptions based on search
  const filteredTranscriptions = useMemo(() => {
    if (!searchQuery.trim()) return transcriptions;
    const query = searchQuery.toLowerCase();
    return transcriptions.filter(
      (t) =>
        t.meeting_title?.toLowerCase().includes(query) ||
        t.meeting_url?.toLowerCase().includes(query) ||
        t.bot_id?.toLowerCase().includes(query)
    );
  }, [transcriptions, searchQuery]);

  // Auto-select first transcription if none selected
  useEffect(() => {
    if (!selectedTranscription && filteredTranscriptions.length > 0) {
      setSelectedTranscription(filteredTranscriptions[0]);
    }
  }, [filteredTranscriptions, selectedTranscription]);

  // Load transcript content when transcription is selected
  useEffect(() => {
    if (!selectedTranscription?.id || !profile?.id) {
      setTranscriptContent(null);
      return;
    }

    const loadTranscript = async () => {
      try {
        setLoadingTranscript(true);
        const fullTranscription = await getTranscription(selectedTranscription.id, profile.id || '');
        // Update selectedTranscription with latest data (including summary)
        setSelectedTranscription(fullTranscription);
        // Use utterances if available, otherwise use words
        setTranscriptContent(fullTranscription.utterances || fullTranscription.words || []);
      } catch (err) {
        console.error('Error loading transcript:', err);
        setTranscriptContent(null);
      } finally {
        setLoadingTranscript(false);
      }
    };

    void loadTranscript();
  }, [selectedTranscription?.id, profile?.id]);

  // Filter transcript content based on search
  const filteredTranscriptContent = useMemo(() => {
    if (!transcriptContent || !transcriptionSearchQuery.trim()) {
      return transcriptContent;
    }

    const query = transcriptionSearchQuery.toLowerCase();
    
    // Handle array of utterances or words
    if (Array.isArray(transcriptContent)) {
      return transcriptContent.filter((item: any) => {
        const text = item.text || item.words?.map((w: any) => w.text).join(' ') || '';
        const speaker = item.speaker || '';
        return text.toLowerCase().includes(query) || speaker.toLowerCase().includes(query);
      });
    }

    return transcriptContent;
  }, [transcriptContent, transcriptionSearchQuery]);

  const handleCopyLink = (link: string): void => {
    navigator.clipboard.writeText(link);
  };

  const handleDeleteMeeting = async (transcriptionId: string): Promise<void> => {
    if (!profile?.id) {
      setError('Please log in to delete meetings');
      return;
    }

    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }

    const deleteKey = transcriptionId;
    
    try {
      setDeleting(prev => ({ ...prev, [deleteKey]: true }));
      setError(null);
      setExportMessage(null);

      // Build recall server URL
      function getRecallaiBaseUrl(): string | null {
        const raw = import.meta.env.VITE_RECALLAI_BASE_URL;
        if (typeof raw !== 'string' || !raw.trim()) {
          return null;
        }
        return raw.trim().replace(/\/$/, '');
      }

      function buildRecallaiUrl(path: string): string | null {
        const baseUrl = getRecallaiBaseUrl();
        if (!baseUrl) {
          return null;
        }
        return `${baseUrl}${path}`;
      }

      // Delete transcription from recall server
      const deleteUrl = buildRecallaiUrl(`/api/transcriptions/${transcriptionId}?userId=${profile.id}`);
      if (!deleteUrl) {
        throw new Error('Recall server URL is not configured');
      }

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete meeting: ${errorText || response.statusText}`);
      }

      // Remove from local state
      setTranscriptions(prev => prev.filter(t => t.id !== transcriptionId));
      
      // Clear selection if deleted meeting was selected
      if (selectedTranscription?.id === transcriptionId) {
        setSelectedTranscription(null);
        setTranscriptContent(null);
      }

      setExportMessage({
        type: 'success',
        text: 'Meeting deleted successfully!'
      });
      setTimeout(() => setExportMessage(null), 3000);
      
    } catch (error) {
      console.error('[Delete Meeting] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete meeting';
      setError(errorMessage);
    } finally {
      setDeleting(prev => ({ ...prev, [deleteKey]: false }));
    }
  };

  const handleExport = async (transcriptionId: string, exportType: 'slack' | 'notion' | 'hubspot'): Promise<void> => {
    if (!profile?.id) {
      setError('Please log in to export transcriptions');
      return;
    }
  
    const exportKey = `${transcriptionId}-${exportType}`;
    
    try {
      setExporting(prev => ({ ...prev, [exportKey]: true }));
      setError(null);
      setExportMessage(null);
  
      // Check connection status first - if not connected, redirect to connect page
      let isConnected = false;
      
      if (exportType === 'slack') {
        const slackStatus = await getSlackStatus(profile.id);
        isConnected = slackStatus.connected;
        
        if (!isConnected) {
          setExporting(prev => ({ ...prev, [exportKey]: false }));
          setError('You need to connect your Slack account first to export transcriptions. Redirecting to connection page...');
          setTimeout(() => {
            navigate('/integrations');
          }, 1500);
          return;
        }
      } else if (exportType === 'notion') {
        const notionStatus = await getNotionStatus(profile.id);
        isConnected = notionStatus.connected;
        
        if (!isConnected) {
          setExporting(prev => ({ ...prev, [exportKey]: false }));
          setError('You need to connect your Notion account first to export transcriptions. Redirecting to connection page...');
          setTimeout(() => {
            navigate('/integrations');
          }, 1500);
          return;
        }
      } else if (exportType === 'hubspot') {
        const hubspotStatus = await getHubSpotStatus(profile.id);
        isConnected = hubspotStatus.connected;
        
        if (!isConnected) {
          setExporting(prev => ({ ...prev, [exportKey]: false }));
          setError('You need to connect your HubSpot account first to export transcriptions. Redirecting to connection page...');
          setTimeout(() => {
            navigate('/integrations');
          }, 1500);
          return;
        }
      }
  
      // Fetch full transcription data
      const fullTranscription = await getTranscription(transcriptionId, profile.id);
      
      // Prepare transcript text
      let transcriptText = '';
      if (fullTranscription.transcript_text) {
        transcriptText = fullTranscription.transcript_text;
      } else if (fullTranscription.utterances && fullTranscription.utterances.length > 0) {
        transcriptText = fullTranscription.utterances
          .map((u: any) => `${u.speaker || 'Unknown'}: ${u.text || ''}`)
          .join('\n');
      }
  
      // Prepare action items
      const actionItems = fullTranscription.action_items || [];
  
      // Prepare export data
      const exportData = {
        user_id: profile.id,
        transcription_id: transcriptionId,
        meeting_title: fullTranscription.meeting_title || 'Untitled Meeting',
        transcript: transcriptText,
        summary: fullTranscription.summary || '',
        action_items: actionItems,
        channel: '#general', // Default Slack channel
      };
  
      // ✅ FIXED: Always use direct Railway backend URL (bypasses getApiBaseUrl() proxy issues)
      const exportUrl = `https://web-production-07092.up.railway.app/api/${exportType}/export`;
      
      console.log('Exporting to:', exportUrl);
      console.log('[FIXED] Using direct Railway backend URL - no proxy confusion');
  
      // Call export endpoint
      const response = await fetch(exportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(exportData),
      });
  
      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      let result: any;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('Export response:', result);
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        
        if (response.status === 404) {
          throw new Error('Backend /api/slack/export endpoint not deployed. Check Railway deployment.');
        }
        throw new Error(`Server error ${response.status}. Backend may not be running.`);
      }
  
      if (!response.ok) {
        throw new Error(result.error || `Export failed: ${response.status}`);
      }
  
      if (result.success) {
        const platformName = exportType === 'slack' ? 'Slack' : exportType === 'notion' ? 'Notion' : 'HubSpot';
        setExportMessage({
          type: 'success',
          text: `Successfully exported to ${platformName}!`
        });
        setTimeout(() => setExportMessage(null), 6000);
      } else {
        throw new Error(result.error || `Export failed`);
      }
      
    } catch (error) {
      console.error(`[Export ${exportType.toUpperCase()}] Error:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to export to ${exportType}`;
      setError(errorMessage);
    } finally {
      setExporting(prev => ({ ...prev, [exportKey]: false }));
    }
  };
  

  return (
    <DashboardLayout activeTab="/transcriptions">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-2 md:mb-3 lg:mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
                  DASHBOARD
                </a>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">TRANSCRIPTIONS</li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="mb-4 md:mb-6 lg:mb-8">
            <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-2">
              Transcriptions
            </h1>
            <p className="font-nunito text-sm text-ellieGray">
              All your meeting transcriptions, summaries, and action items - including those from disconnected calendars
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {exportMessage && (
            <div className={`mb-4 p-4 rounded-lg border ${
              exportMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {exportMessage.text}
            </div>
          )}

          {/* Two Panel Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Panel: All Transcriptions List */}
            <div className="flex-1 w-full lg:max-w-[65%] xl:max-w-[60%]">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                {/* Subtitle and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
                  <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B]">
                    All Transcriptions
                  </h2>
                  {/* Search Bar */}
                  <div className="relative flex-shrink-0 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search by meeting title/link"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:min-w-[200px] md:min-w-[250px] pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 lg:py-3 rounded-lg border border-[#7964A0] bg-white text-ellieBlack placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-xs md:text-sm lg:text-base"
                    />
                    <img
                      src={searchIcon}
                      alt="Search"
                      className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 object-contain"
                    />
                  </div>
                </div>

                {/* Mobile: Transcriptions Cards */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {loading ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">Loading transcriptions...</div>
                  ) : filteredTranscriptions.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">No transcriptions found</div>
                  ) : (
                    filteredTranscriptions.map((transcription) => (
                      <div
                        key={transcription.event_id}
                        onClick={() => setSelectedTranscription(transcription)}
                        className={`
                          bg-white rounded-lg p-4 md:p-6 cursor-pointer transition-all hover:shadow-md border-2
                          ${selectedTranscription?.event_id === transcription.event_id ? 'border-ellieBlue shadow-md' : 'border-transparent'}
                        `}
                      >
                        <div className="mb-3 md:mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider block">
                              Meeting Title
                            </label>
                            {transcription.calendar_status === 'disconnected' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-nunito font-semibold bg-yellow-100 text-yellow-800">
                                Disconnected
                              </span>
                            )}
                          </div>
                          <p className="font-nunito text-sm md:text-base font-medium text-[#25324B] line-clamp-2">
                            {transcription.meeting_title || 'Untitled Meeting'}
                          </p>
                          {transcription.calendar_email && (
                            <p className="font-nunito text-xs text-ellieGray mt-1">
                              {transcription.calendar_email}
                            </p>
                          )}
                        </div>

                        {/* Delete Button - Mobile */}
                        <div className="mb-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDeleteMeeting(transcription.id);
                            }}
                            disabled={deleting[transcription.id]}
                            className="w-full px-3 py-2 rounded-lg bg-red-500 text-white font-nunito text-xs font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleting[transcription.id] ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Meeting
                              </>
                            )}
                          </button>
                        </div>

                        <div className="pb-3 md:pb-4 border-b border-[#DEE1E6]">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                                Date/Time
                              </label>
                              <div className="flex flex-col gap-1">
                                <span className="font-nunito text-xs md:text-sm font-medium text-[#25324B]">
                                  {formatDate(transcription.start_time)}
                                </span>
                                <span className="font-nunito text-xs md:text-sm font-medium text-ellieGray">
                                  {formatTime(transcription.start_time)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                                Platform
                              </label>
                              <span className="font-nunito text-xs md:text-sm font-medium text-ellieGray capitalize">
                                {transcription.platform?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop: Transcriptions Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#DEE1E6]">
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] min-w-[250px]">
                          Meeting Title
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Date/Time
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Platform
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Export
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            Loading transcriptions...
                          </td>
                        </tr>
                      ) : filteredTranscriptions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No transcriptions found
                          </td>
                        </tr>
                      ) : (
                        filteredTranscriptions.map((transcription) => (
                          <tr
                            key={transcription.event_id}
                            onClick={() => setSelectedTranscription(transcription)}
                            className={`
                              border-b border-[#DEE1E6] cursor-pointer transition-colors
                              ${selectedTranscription?.event_id === transcription.event_id ? 'bg-[rgba(50,122,173,0.1)]' : 'hover:bg-gray-50'}
                            `}
                          >
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-nunito text-base font-semibold text-[#25324B]">
                                    {transcription.meeting_title || 'Untitled Meeting'}
                                  </span>
                                  {transcription.calendar_status === 'disconnected' && (
                                    <span className="px-2 py-0.5 rounded text-xs font-nunito font-semibold bg-yellow-100 text-yellow-800">
                                      Disconnected
                                    </span>
                                  )}
                                  {transcription.meeting_url && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyLink(transcription.meeting_url!);
                                      }}
                                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                      aria-label="Copy link"
                                    >
                                      <svg
                                        className="w-4 h-4 text-ellieGray"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                                {transcription.calendar_email && (
                                  <span className="font-nunito text-xs text-ellieGray">
                                    {transcription.calendar_email}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="font-nunito text-base font-medium text-[#25324B]">
                                  {formatDate(transcription.start_time)}
                                </span>
                                <span className="font-nunito text-base font-medium text-ellieGray">
                                  {formatTime(transcription.start_time)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="font-nunito text-base font-medium text-ellieGray capitalize">
                                {transcription.platform?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={`font-nunito text-base font-medium capitalize ${
                                transcription.status === 'completed' ? 'text-green-600' :
                                transcription.status === 'processing' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {transcription.status || 'unknown'}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleExport(transcription.id, 'slack');
                                  }}
                                  disabled={exporting[`${transcription.id}-slack`]}
                                  className="px-3 py-1.5 rounded-lg bg-[#4A154B] text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Export to Slack"
                                >
                                  {exporting[`${transcription.id}-slack`] ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Exporting...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 5.042a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 18.956 0a2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522zM18.956 6.313a2.528 2.528 0 0 1 2.522 2.521 2.528 2.528 0 0 1-2.522 2.521h-6.313A2.528 2.528 0 0 1 10.121 8.834a2.528 2.528 0 0 1 2.522-2.521h6.313zM15.165 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522zM13.894 18.956a2.528 2.528 0 0 1-2.522-2.521 2.528 2.528 0 0 1 2.522-2.521h6.313A2.528 2.528 0 0 1 22.729 16.435a2.528 2.528 0 0 1-2.522 2.521h-6.313z"/>
                                      </svg>
                                      Slack
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleExport(transcription.id, 'notion');
                                  }}
                                  disabled={exporting[`${transcription.id}-notion`]}
                                  className="px-3 py-1.5 rounded-lg bg-black text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Export to Notion"
                                >
                                  {exporting[`${transcription.id}-notion`] ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Exporting...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .841-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .841-1.168.841l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z"/>
                                      </svg>
                                      Notion
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleExport(transcription.id, 'hubspot');
                                  }}
                                  disabled={exporting[`${transcription.id}-hubspot`]}
                                  className="px-3 py-1.5 rounded-lg text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: '#FF7A59' }}
                                  title="Export to HubSpot"
                                >
                                  {exporting[`${transcription.id}-hubspot`] ? (
                                    <>
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Exporting...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.1 8.6V2.4h-4.8v6.2h4.8zm-.5-7.1h5.3c.3 0 .5.2.5.5v7.1c0 .3-.2.5-.5.5h-5.3c-.3 0-.5-.2-.5-.5V2c0-.3.2-.5.5-.5zm-6.1 14.3c0-2.9-2.4-5.3-5.3-5.3S0 12.9 0 15.8s2.4 5.3 5.3 5.3 5.3-2.4 5.3-5.3zm-5.3 3.8c-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8 3.8 1.7 3.8 3.8-1.7 3.8-3.8 3.8zm14.4-3.8c0-2.9-2.4-5.3-5.3-5.3s-5.3 2.4-5.3 5.3 2.4 5.3 5.3 5.3 5.3-2.4 5.3-5.3zm-5.3 3.8c-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8 3.8 1.7 3.8 3.8-1.7 3.8-3.8 3.8zm-2.7-6.1V2.4H6.4v6.2h4.8zm-5.3 0H1.8c-.3 0-.5-.2-.5-.5V2c0-.3.2-.5.5-.5h5.3c.3 0 .5.2.5.5v6.1c0 .3-.2.5-.5.5z"/>
                                      </svg>
                                      HubSpot
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleDeleteMeeting(transcription.id);
                                }}
                                disabled={deleting[transcription.id]}
                                className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-nunito text-xs font-semibold hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Meeting (Testing)"
                              >
                                {deleting[transcription.id] ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel: Transcription Details */}
            <div className="flex-1 w-full lg:max-w-[35%] xl:max-w-[40%]">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8 h-full flex flex-col max-h-[calc(100vh-8rem)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6 gap-2 flex-shrink-0">
                  <h2 className="font-nunito text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[#25324B] truncate">
                    {selectedTranscription ? selectedTranscription.meeting_title : 'Select a transcription'}
                  </h2>
                </div>

                {/* Search Bar */}
                {selectedTranscription && (
                  <div className="relative mb-4 md:mb-6 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Search by keyword or speaker"
                      value={transcriptionSearchQuery}
                      onChange={(e) => setTranscriptionSearchQuery(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 lg:py-3 rounded-lg border border-[#7964A0] bg-white text-ellieBlack placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-xs md:text-sm lg:text-base"
                    />
                    <img
                      src={searchIcon}
                      alt="Search"
                      className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 object-contain"
                    />
                  </div>
                )}

                {/* Transcription Content - Scrollable Container */}
                <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 lg:space-y-6 pr-1 md:pr-2 min-h-0">
                  {!selectedTranscription ? (
                    <div className="text-center py-8 text-gray-500">Select a transcription to view details</div>
                  ) : loadingTranscript ? (
                    <div className="text-center py-8 text-gray-500">Loading transcript...</div>
                  ) : !transcriptContent || (Array.isArray(transcriptContent) && transcriptContent.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                      {selectedTranscription.status === 'processing'
                        ? 'Transcript is still being processed...'
                        : 'No transcript content available for this meeting'}
                    </div>
                  ) : (
                    <>
                      {/* Show impact score section - always visible */}
                      {selectedTranscription.impact_score !== null && selectedTranscription.impact_score !== undefined && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-nunito text-sm md:text-base font-bold text-[#25324B]">Meeting Impact Score</h3>
                            <div className="flex items-center gap-2">
                              <span className="font-nunito text-2xl md:text-3xl font-extrabold text-ellieBlue">
                                {Math.round(selectedTranscription.impact_score)}
                              </span>
                              <span className="font-nunito text-xs text-ellieGray">/ 100</span>
                            </div>
                          </div>
                          {/* Impact score bar */}
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                selectedTranscription.impact_score >= 75
                                  ? 'bg-green-500'
                                  : selectedTranscription.impact_score >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedTranscription.impact_score}%` }}
                            />
                          </div>
                          {/* Impact breakdown */}
                          {selectedTranscription.impact_breakdown && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {selectedTranscription.impact_breakdown.decision_making !== undefined && (
                                <div className="text-xs">
                                  <span className="font-nunito text-ellieGray">Decision Making:</span>
                                  <span className="font-nunito font-semibold text-[#25324B] ml-1">
                                    {Math.round(selectedTranscription.impact_breakdown.decision_making)}/25
                                  </span>
                                </div>
                              )}
                              {selectedTranscription.impact_breakdown.action_clarity !== undefined && (
                                <div className="text-xs">
                                  <span className="font-nunito text-ellieGray">Action Clarity:</span>
                                  <span className="font-nunito font-semibold text-[#25324B] ml-1">
                                    {Math.round(selectedTranscription.impact_breakdown.action_clarity)}/25
                                  </span>
                                </div>
                              )}
                              {selectedTranscription.impact_breakdown.stakeholder_engagement !== undefined && (
                                <div className="text-xs">
                                  <span className="font-nunito text-ellieGray">Stakeholder Engagement:</span>
                                  <span className="font-nunito font-semibold text-[#25324B] ml-1">
                                    {Math.round(selectedTranscription.impact_breakdown.stakeholder_engagement)}/25
                                  </span>
                                </div>
                              )}
                              {selectedTranscription.impact_breakdown.productivity !== undefined && (
                                <div className="text-xs">
                                  <span className="font-nunito text-ellieGray">Productivity:</span>
                                  <span className="font-nunito font-semibold text-[#25324B] ml-1">
                                    {Math.round(selectedTranscription.impact_breakdown.productivity)}/25
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show summary section - always visible */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-nunito text-sm md:text-base font-bold text-ellieBlue mb-2">Summary</h3>
                        {selectedTranscription.summary && selectedTranscription.summary.trim() ? (
                          <p className="font-nunito text-xs md:text-sm text-[#25324B] leading-relaxed whitespace-pre-wrap">
                            {selectedTranscription.summary}
                          </p>
                        ) : (
                          <div className="text-gray-500 italic">
                            {selectedTranscription.status === 'processing' ? (
                              <span className="font-nunito text-xs md:text-sm">
                                Summary is being generated... This may take a few minutes after the meeting ends.
                              </span>
                            ) : (
                              <span className="font-nunito text-xs md:text-sm">
                                No summary available for this meeting.
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Show action items section */}
                      {selectedTranscription.action_items && selectedTranscription.action_items.length > 0 && (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                          <h3 className="font-nunito text-sm md:text-base font-bold text-green-700 mb-3">Action Items</h3>
                          <ul className="space-y-2">
                            {selectedTranscription.action_items.map((actionItem: any, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-1">•</span>
                                <div className="flex-1">
                                  <p className="font-nunito text-xs md:text-sm text-[#25324B] leading-relaxed">
                                    {typeof actionItem === 'string' ? actionItem : actionItem.text || actionItem}
                                  </p>
                                  {actionItem.speaker && (
                                    <p className="font-nunito text-xs text-ellieGray mt-1">
                                      - {actionItem.speaker}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Show transcript utterances */}
                      {Array.isArray(filteredTranscriptContent) && filteredTranscriptContent.length > 0 ? (
                        filteredTranscriptContent.map((item: any, index: number) => (
                          <div key={index} className="flex flex-col gap-1 md:gap-2">
                            <div className="flex items-center justify-between mb-1 md:mb-1.5">
                              <span className="font-nunito text-xs md:text-sm lg:text-base font-semibold text-ellieBlue">
                                {item.speaker || 'Unknown Speaker'}
                              </span>
                              {item.start && (
                                <span className="text-xs text-gray-400 font-nunito">
                                  {Math.floor(item.start / 60)}:{(item.start % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                            <p className="font-nunito text-xs md:text-sm lg:text-base text-[#25324B] leading-relaxed">
                              {item.text || item.words?.map((w: any) => w.text).join(' ') || ''}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No transcript content available
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
