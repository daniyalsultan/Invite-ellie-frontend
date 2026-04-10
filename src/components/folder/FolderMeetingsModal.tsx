import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import {
  getTranscriptions,
  getTranscription,
  getFolderMeetingsOverview,
  type Transcription,
  type FolderMeetingsOverviewActionItem,
} from '../../services/transcriptionApi';
import { displayDeadline, displayOwner, isAbsentScalar } from '../../utils/meetingDisplay';
import { MeetingInsightsPanel } from '../meeting/MeetingInsightsPanel';
import { getSlackStatus } from '../../services/slackApi';
import { getNotionStatus } from '../../services/notionApi';
import { getHubSpotStatus } from '../../services/hubspotApi';
import searchIcon from '../../assets/Vector.png';
import { splitOverviewSummaryToBullets } from '../../utils/overviewSummaryBullets';

type FolderMeetingsModalProps = {
  folderId: string;
  folderName: string;
  isOpen: boolean;
  onClose: () => void;
};

type DetailPanel = 'folder_overview' | 'meeting';

function formatActionItemText(item: unknown): string {
  if (typeof item === 'string') return item.trim();
  if (item && typeof item === 'object' && 'text' in item && typeof (item as { text: string }).text === 'string') {
    return (item as { text: string }).text.trim();
  }
  if (item && typeof item === 'object' && 'item' in item && typeof (item as { item: string }).item === 'string') {
    return (item as { item: string }).item.trim();
  }
  return '';
}

function extractActionItemMeta(item: unknown) {
  if (!item || typeof item !== 'object') {
    return { owner: undefined, deadline: undefined, blockers: undefined, hasMeta: false };
  }
  const hasMeta =
    'owner' in item ||
    'speaker' in item ||
    'deadline' in item ||
    'due' in item ||
    'blockers' in item;
  if (!hasMeta) {
    return { owner: undefined, deadline: undefined, blockers: undefined, hasMeta: false };
  }
  return {
    owner: (item as any).owner ?? (item as any).speaker,
    deadline: (item as any).deadline ?? (item as any).due,
    blockers: (item as any).blockers,
    hasMeta: true,
  };
}

/** Date · time for overview summary merge (module-level for useMemo). */
function formatMeetingDateTimeLine(m: { start_time: string | null; created_at: string | null }): string {
  const raw = m.start_time || m.created_at;
  if (!raw) return 'Date unknown';
  try {
    const date = new Date(raw);
    return `${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return 'Date unknown';
  }
}

export function FolderMeetingsModal({ folderId, folderName, isOpen, onClose }: FolderMeetingsModalProps): JSX.Element | null {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailPanel, setDetailPanel] = useState<DetailPanel>('folder_overview');
  const [selectedMeeting, setSelectedMeeting] = useState<Transcription | null>(null);
  const [fullTranscription, setFullTranscription] = useState<Transcription | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<any>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptionSearchQuery, setTranscriptionSearchQuery] = useState('');
  const [exporting, setExporting] = useState<{ [key: string]: boolean }>({});
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [overviewBackendSummary, setOverviewBackendSummary] = useState<string | null>(null);
  const [overviewBackendActions, setOverviewBackendActions] = useState<FolderMeetingsOverviewActionItem[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewCached, setOverviewCached] = useState(false);

  // Reset to meetings overview when opening or switching folders
  useEffect(() => {
    if (!isOpen) return;
    setDetailPanel('folder_overview');
    setSelectedMeeting(null);
    setFullTranscription(null);
    setTranscriptContent(null);
    setTranscriptionSearchQuery('');
  }, [isOpen, folderId]);

  // Fetch meetings for this folder
  useEffect(() => {
    if (!isOpen || !profile?.id || !folderId) {
      return;
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all transcriptions and filter by folder_id
        const allTranscriptions = await getTranscriptions(profile.id || '');

        // Filter transcriptions by folder_id
        // Note: The folder_id should be in the transcription data from Recall server
        const folderMeetings = allTranscriptions.filter((t: any) => {
          // Check if folder_id matches (could be in different places in the response)
          return t.folder_id === folderId || t.folderId === folderId;
        });

        setMeetings(folderMeetings);
      } catch (err) {
        console.error('Error fetching folder meetings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    void fetchMeetings();
  }, [isOpen, profile?.id, folderId]);

  const meetingsNewestFirst = useMemo(() => {
    return [...meetings].sort((a, b) => {
      const ta = new Date(a.start_time || a.created_at || 0).getTime();
      const tb = new Date(b.start_time || b.created_at || 0).getTime();
      return tb - ta;
    });
  }, [meetings]);

  const folderOverviewStats = useMemo(() => {
    const withSummary = meetings.filter((m) => (m.summary || '').trim().length > 0).length;
    const totalActions = meetings.reduce((acc, m) => acc + (m.action_items?.length ?? 0), 0);
    const withSignals = meetings.filter(
      (m) => Array.isArray(m.key_outcomes_signals) && m.key_outcomes_signals.length > 0,
    ).length;
    return { withSummary, totalActions, withSignals, total: meetings.length };
  }, [meetings]);

  const allFolderActionItems = useMemo(() => {
    const rows: { meetingTitle: string; meetingId: string; text: string }[] = [];
    for (const m of meetingsNewestFirst) {
      const items = m.action_items || [];
      for (const item of items) {
        const text = formatActionItemText(item);
        if (text) {
          rows.push({
            meetingTitle: m.meeting_title || 'Untitled Meeting',
            meetingId: m.id,
            text,
          });
        }
      }
    }
    return rows;
  }, [meetingsNewestFirst]);

  /** Single merged summary text for all meetings (newest first), for Meetings Overview only. */
  const combinedMeetingsSummary = useMemo(() => {
    const parts: string[] = [];
    for (const m of meetingsNewestFirst) {
      const body = (m.summary || '').trim();
      if (!body) continue;
      const title = m.meeting_title || 'Untitled Meeting';
      const when = formatMeetingDateTimeLine(m);
      parts.push(`${title} (${when})\n\n${body}`);
    }
    return parts.join('\n\n────────────────────\n\n');
  }, [meetingsNewestFirst]);

  const meetingsFingerprint = useMemo(
    () => meetings.map((m) => `${m.id}:${m.updated_at || ''}`).sort().join('|'),
    [meetings],
  );

  useEffect(() => {
    if (!isOpen || !profile?.id || !folderId || meetings.length === 0) {
      setOverviewBackendSummary(null);
      setOverviewBackendActions([]);
      setOverviewLoading(false);
      setOverviewError(null);
      setOverviewCached(false);
      return;
    }

    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError(null);

    void getFolderMeetingsOverview(folderId, profile.id)
      .then((data) => {
        if (cancelled) return;
        setOverviewBackendSummary(typeof data.summary === 'string' ? data.summary : '');
        setOverviewBackendActions(Array.isArray(data.action_items) ? data.action_items : []);
        setOverviewCached(Boolean(data.cached));
      })
      .catch((err) => {
        if (cancelled) return;
        setOverviewError(err instanceof Error ? err.message : 'Overview request failed');
        setOverviewBackendSummary(null);
        setOverviewBackendActions([]);
        setOverviewCached(false);
      })
      .finally(() => {
        if (!cancelled) setOverviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, folderId, profile?.id, meetingsFingerprint]);

  const displayOverviewSummary = useMemo(() => {
    const backend = (overviewBackendSummary || '').trim();
    if (backend) return overviewBackendSummary as string;
    return combinedMeetingsSummary;
  }, [overviewBackendSummary, combinedMeetingsSummary]);

  const overviewSummaryBullets = useMemo(
    () => splitOverviewSummaryToBullets(displayOverviewSummary || ''),
    [displayOverviewSummary],
  );

  const displayOverviewActionRows = useMemo(() => {
    const normalized = overviewBackendActions
      .map((row) => ({
        text: (row.text || '').trim(),
        meetingTitle: (row.meeting_title || 'General').trim() || 'General',
        original: row,
      }))
      .filter((row) => row.text.length > 0);

    if (normalized.length > 0) {
      return normalized.map((row, idx) => ({
        meetingId: `overview-${idx}`,
        meetingTitle: row.meetingTitle,
        text: row.text,
        original: row.original,
      }));
    }
    return allFolderActionItems.map((row) => ({
      meetingId: row.meetingId,
      meetingTitle: row.meetingTitle,
      text: row.text,
      original: null,
    }));
  }, [overviewBackendActions, allFolderActionItems]);

  // Filter meetings based on search
  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const query = searchQuery.toLowerCase();
    return meetings.filter(
      (m) =>
        m.meeting_title?.toLowerCase().includes(query) ||
        m.meeting_url?.toLowerCase().includes(query) ||
        m.bot_id?.toLowerCase().includes(query)
    );
  }, [meetings, searchQuery]);

  // Load full transcription when meeting is selected
  useEffect(() => {
    if (!selectedMeeting || !profile?.id) {
      setFullTranscription(null);
      setTranscriptContent(null);
      return;
    }

    const fetchFullTranscription = async () => {
      try {
        setLoadingTranscript(true);
        const fullData = await getTranscription(selectedMeeting.id, profile.id || '');
        setFullTranscription(fullData);
        // Update selectedMeeting with latest data
        setSelectedMeeting(fullData);
        // Use utterances if available, otherwise use words
        setTranscriptContent(fullData.utterances || fullData.words || []);
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setFullTranscription(null);
        setTranscriptContent(null);
      } finally {
        setLoadingTranscript(false);
      }
    };

    void fetchFullTranscription();
  }, [selectedMeeting?.id, profile?.id]);

  // Filter transcript segments based on search
  const filteredTranscriptSegments = useMemo(() => {
    if (!transcriptContent || !transcriptionSearchQuery.trim()) {
      return transcriptContent || [];
    }
    const query = transcriptionSearchQuery.toLowerCase();
    if (Array.isArray(transcriptContent)) {
      return transcriptContent.filter((item: any) => {
        const text = item.text || item.words?.map((w: any) => w.text).join(' ') || '';
        const speaker = item.speaker || '';
        return text.toLowerCase().includes(query) || speaker.toLowerCase().includes(query);
      });
    }
    return transcriptContent;
  }, [transcriptContent, transcriptionSearchQuery]);

  // Handle export functionality
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

      // Fetch full transcription data if not already loaded
      let fullTranscriptionData = fullTranscription;
      if (!fullTranscriptionData || fullTranscriptionData.id !== transcriptionId) {
        fullTranscriptionData = await getTranscription(transcriptionId, profile.id);
      }

      // Prepare transcript text
      let transcriptText = '';
      if (fullTranscriptionData.transcript_text) {
        transcriptText = fullTranscriptionData.transcript_text;
      } else if (fullTranscriptionData.utterances && fullTranscriptionData.utterances.length > 0) {
        transcriptText = fullTranscriptionData.utterances
          .map((u: any) => `${u.speaker || 'Unknown'}: ${u.text || ''}`)
          .join('\n');
      }

      // Prepare action items
      const actionItems = fullTranscriptionData.action_items || [];

      // Prepare export data
      const exportData = {
        user_id: profile.id,
        transcription_id: transcriptionId,
        meeting_title: fullTranscriptionData.meeting_title || 'Untitled Meeting',
        transcript: transcriptText,
        summary: fullTranscriptionData.summary || '',
        action_items: actionItems,
        channel: '#general', // Default Slack channel
      };

      // Use direct Railway backend URL
      const exportUrl = `https://web-production-07092.up.railway.app/api/${exportType}/export`;

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
      } else {
        await response.text(); // Read response but don't use it
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-[30px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-nunito text-2xl font-extrabold text-[#25324B]">
              {folderName}
            </h2>
            <p className="font-nunito text-sm text-[#6B7A96] mt-1">
              {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left Panel - Meetings List */}
          <div className="flex min-h-0 w-1/3 flex-col border-r border-gray-200">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meetings..."
                  className="w-full rounded-lg border border-[#CBD3E3] bg-white px-9 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                />
                <img
                  src={searchIcon}
                  alt="Search"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                />
              </div>
            </div>

            {/* Meetings List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading meetings...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No meetings in this folder</div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailPanel('folder_overview');
                      setSelectedMeeting(null);
                      setFullTranscription(null);
                      setTranscriptContent(null);
                    }}
                    className={`w-full text-left p-4 rounded-lg border cursor-pointer transition-colors ${detailPanel === 'folder_overview'
                        ? 'border-[#327AAD] bg-[#327AAD]/5'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <h3 className="font-nunito text-base font-bold text-[#25324B]">Meetings Overview</h3>
                    <p className="font-nunito text-xs text-[#6B7A96] mt-1">
                      Summaries and actions across all {meetings.length} meeting{meetings.length === 1 ? '' : 's'}
                    </p>
                  </button>
                  {filteredMeetings.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 font-nunito text-sm">
                      No meetings match your search
                    </div>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setDetailPanel('meeting');
                            setSelectedMeeting(meeting);
                          }
                        }}
                        onClick={() => {
                          setDetailPanel('meeting');
                          setSelectedMeeting(meeting);
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${detailPanel === 'meeting' && selectedMeeting?.id === meeting.id
                            ? 'border-[#327AAD] bg-[#327AAD]/5'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <h3 className="font-nunito text-base font-bold text-[#25324B] line-clamp-2">
                          {meeting.meeting_title || 'Untitled Meeting'}
                        </h3>
                        <p className="font-nunito text-xs text-[#6B7A96] mt-1">
                          {formatDate(meeting.created_at)} • {formatTime(meeting.created_at)}
                        </p>
                        {meeting.summary && (
                          <p className="font-nunito text-xs text-[#4B5674] mt-2 line-clamp-2">
                            {meeting.summary}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel — meetings overview or meeting details */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {detailPanel === 'folder_overview' ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white">
                <div className="p-6 border-b border-gray-200 bg-white/80">
                  <h3 className="font-nunito text-xl font-bold text-[#25324B]">Meetings Overview</h3>
                  <p className="font-nunito text-sm text-[#6B7A96] mt-1">
                    Everything Ellie has captured for <span className="font-semibold text-[#4B5674]">{folderName}</span> — in one place.
                  </p>
                  {meetings.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#327AAD]/10 px-3 py-1 font-nunito text-xs font-semibold text-[#327AAD]">
                        {folderOverviewStats.total} meeting{folderOverviewStats.total === 1 ? '' : 's'}
                      </span>
                      {folderOverviewStats.withSummary > 0 && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-nunito text-xs font-semibold text-emerald-800">
                          {folderOverviewStats.withSummary} with summary
                        </span>
                      )}
                      {folderOverviewStats.totalActions > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 font-nunito text-xs font-semibold text-amber-900">
                          {folderOverviewStats.totalActions} action item{folderOverviewStats.totalActions === 1 ? '' : 's'}
                        </span>
                      )}
                      {folderOverviewStats.withSignals > 0 && (
                        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 font-nunito text-xs font-semibold text-violet-800">
                          {folderOverviewStats.withSignals} with key signals
                        </span>
                      )}
                      {overviewCached && (overviewBackendSummary || '').trim() && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-nunito text-xs font-semibold text-slate-600">
                          AI overview cached
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {loading ? (
                    <p className="font-nunito text-sm text-[#6B7A96] text-center py-12">Loading folder…</p>
                  ) : meetings.length === 0 ? (
                    <p className="font-nunito text-sm text-[#6B7A96] text-center py-12">
                      No meetings in this folder yet. When recordings finish, summaries and actions will appear here.
                    </p>
                  ) : (
                    <>
                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                          Summary
                        </h4>
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          {overviewLoading ? (
                            <p className="font-nunito text-sm text-[#6B7A96]">Generating AI overview…</p>
                          ) : displayOverviewSummary ? (
                            <>
                              {(overviewBackendSummary || '').trim() ? (
                                <p className="font-nunito text-xs text-[#94A3C1] mb-2">Synthesized across all meetings</p>
                              ) : null}
                              {overviewSummaryBullets.length > 0 ? (
                                <ul className="space-y-2.5">
                                  {overviewSummaryBullets.map((line, idx) => (
                                    <li
                                      key={idx}
                                      className="flex gap-3 font-nunito text-sm text-[#4B5674] leading-relaxed"
                                    >
                                      <span className="text-[#327AAD] font-bold shrink-0 pt-0.5">•</span>
                                      <span className="min-w-0">{line}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="font-nunito text-sm text-[#4B5674] whitespace-pre-wrap leading-relaxed">
                                  {displayOverviewSummary}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="font-nunito text-sm text-[#94A3C1] italic">
                              No summaries yet for meetings in this folder. They will appear here once processing
                              completes.
                            </p>
                          )}
                          {overviewError && !overviewLoading ? (
                            <p className="font-nunito text-xs text-amber-800 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              AI overview unavailable ({overviewError}). Showing combined text from meetings when
                              available.
                            </p>
                          ) : null}
                        </article>
                      </section>

                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                          Action items across meetings
                        </h4>
                        {displayOverviewActionRows.length === 0 ? (
                          <p className="font-nunito text-sm text-[#94A3C1] italic rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
                            No action items extracted yet. Open a meeting to see details after processing completes.
                          </p>
                        ) : (
                          <ul className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
                            {displayOverviewActionRows.map((row, idx) => {
                              const meta = extractActionItemMeta(row.original);
                              const badges = [] as string[];
                              if (meta.hasMeta && isAbsentScalar(meta.owner)) badges.push('❌ Assign owner');
                              if (meta.hasMeta && isAbsentScalar(meta.deadline)) badges.push('⚠️ Define deadline');
                              if (meta.hasMeta && !isAbsentScalar(meta.blockers)) badges.push(`⚠️ Blocked by ${String(meta.blockers).trim()}`);
                              return (
                                <li
                                  key={`${row.meetingId}-${idx}`}
                                  className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFB] p-4"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="text-[#327AAD] font-bold shrink-0">•</span>
                                    <div className="min-w-0">
                                      <p className="font-nunito text-sm font-medium text-[#25324B]">{row.text}</p>
                                      <p className="text-xs text-[#94A3C1] mt-1">From: {row.meetingTitle}</p>
                                      {meta.hasMeta && (
                                        <div className="mt-2 space-y-1 text-xs text-[#4B5674]">
                                          <p><span className="text-[#6B7A96]">Owner:</span> {displayOwner(meta.owner)}</p>
                                          <p><span className="text-[#6B7A96]">Deadline:</span> {displayDeadline(meta.deadline)}</p>
                                        </div>
                                      )}
                                      {badges.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                          {badges.map((badge) => (
                                            <span key={badge} className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[#92400E]">
                                              {badge}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </section>
                    </>
                  )}
                </div>
              </div>
            ) : selectedMeeting ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {/* Meeting Header */}
                <div className="flex-shrink-0 border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-nunito text-xl font-bold text-[#25324B]">
                        {selectedMeeting.meeting_title || 'Untitled Meeting'}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 font-nunito text-sm text-[#6B7A96]">
                        <span>{formatDate(selectedMeeting.start_time || selectedMeeting.created_at)}</span>
                        <span>•</span>
                        <span>{formatTime(selectedMeeting.start_time || selectedMeeting.created_at)}</span>
                      </div>
                    </div>
                    {/* Export Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleExport(selectedMeeting.id, 'slack')}
                        disabled={exporting[`${selectedMeeting.id}-slack`]}
                        className="px-3 py-1.5 rounded-lg bg-[#4A154B] text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export to Slack"
                      >
                        {exporting[`${selectedMeeting.id}-slack`] ? (
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
                              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 5.042a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 18.956 0a2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522zM18.956 6.313a2.528 2.528 0 0 1 2.522 2.521 2.528 2.528 0 0 1-2.522 2.521h-6.313A2.528 2.528 0 0 1 10.121 8.834a2.528 2.528 0 0 1 2.522-2.521h6.313zM15.165 18.956a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.522-2.522v-2.52h2.522zM13.894 18.956a2.528 2.528 0 0 1-2.522-2.521 2.528 2.528 0 0 1 2.522-2.521h6.313A2.528 2.528 0 0 1 22.729 16.435a2.528 2.528 0 0 1-2.522 2.521h-6.313z" />
                            </svg>
                            Slack
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleExport(selectedMeeting.id, 'notion')}
                        disabled={exporting[`${selectedMeeting.id}-notion`]}
                        className="px-3 py-1.5 rounded-lg bg-black text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export to Notion"
                      >
                        {exporting[`${selectedMeeting.id}-notion`] ? (
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
                              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .841-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .841-1.168.841l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z" />
                            </svg>
                            Notion
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleExport(selectedMeeting.id, 'hubspot')}
                        disabled={exporting[`${selectedMeeting.id}-hubspot`]}
                        className="px-3 py-1.5 rounded-lg text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#FF7A59' }}
                        title="Export to HubSpot"
                      >
                        {exporting[`${selectedMeeting.id}-hubspot`] ? (
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
                              <path d="M17.1 8.6V2.4h-4.8v6.2h4.8zm-.5-7.1h5.3c.3 0 .5.2.5.5v7.1c0 .3-.2.5-.5.5h-5.3c-.3 0-.5-.2-.5-.5V2c0-.3.2-.5.5-.5zm-6.1 14.3c0-2.9-2.4-5.3-5.3-5.3S0 12.9 0 15.8s2.4 5.3 5.3 5.3 5.3-2.4 5.3-5.3zm-5.3 3.8c-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8 3.8 1.7 3.8 3.8-1.7 3.8-3.8 3.8zm14.4-3.8c0-2.9-2.4-5.3-5.3-5.3s-5.3 2.4-5.3 5.3 2.4 5.3 5.3 5.3 5.3-2.4 5.3-5.3zm-5.3 3.8c-2.1 0-3.8-1.7-3.8-3.8s1.7-3.8 3.8-3.8 3.8 1.7 3.8 3.8-1.7 3.8-3.8 3.8zm-2.7-6.1V2.4H6.4v6.2h4.8zm-5.3 0H1.8c-.3 0-.5-.2-.5-.5V2c0-.3.2-.5.5-.5h5.3c.3 0 .5.2.5.5v6.1c0 .3-.2.5-.5.5z" />
                            </svg>
                            HubSpot
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="mx-6 mt-4 flex-shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 font-nunito text-sm text-red-700">
                    {error}
                  </div>
                )}

                {exportMessage && (
                  <div
                    className={`mx-6 mt-4 flex-shrink-0 rounded-lg border p-3 font-nunito text-sm ${exportMessage.type === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                  >
                    {exportMessage.text}
                  </div>
                )}

                {/* ~60% insights (scroll) / ~40% transcript (scroll) — transcript ~10% taller than before */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="flex min-h-0 flex-[6] flex-col overflow-hidden border-b border-gray-200">
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                      <MeetingInsightsPanel
                        transcription={fullTranscription ?? selectedMeeting}
                        loading={loadingTranscript}
                        compact
                        isFirstMeetingInFolder={
                          meetingsNewestFirst.length > 0 &&
                          meetingsNewestFirst[meetingsNewestFirst.length - 1].id === selectedMeeting?.id
                        }
                      />
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-[4] flex-col overflow-hidden bg-[#FAFBFC]">
                    <div className="flex-shrink-0 border-b border-gray-200 p-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={transcriptionSearchQuery}
                          onChange={(e) => setTranscriptionSearchQuery(e.target.value)}
                          placeholder="Search transcript..."
                          className="w-full rounded-lg border border-[#CBD3E3] bg-white px-9 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                        />
                        <img
                          src={searchIcon}
                          alt="Search transcript"
                          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                        />
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                      {loadingTranscript ? (
                        <div className="text-center py-8 text-gray-500 font-nunito text-sm">Loading transcript...</div>
                      ) : !filteredTranscriptSegments || (Array.isArray(filteredTranscriptSegments) && filteredTranscriptSegments.length === 0) ? (
                        <div className="text-center py-8 text-gray-500 font-nunito text-sm">
                          {transcriptionSearchQuery ? 'No transcript segments match your search' : 'No transcript available'}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Array.isArray(filteredTranscriptSegments) && filteredTranscriptSegments.map((segment: any, index: number) => (
                            <div key={segment.id || index} className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#327AAD]/10 flex items-center justify-center">
                                  <span className="font-nunito text-sm font-semibold text-[#327AAD]">
                                    {segment.speaker?.charAt(0) || '?'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-nunito text-sm font-semibold text-[#25324B]">
                                    {segment.speaker || 'Unknown Speaker'}
                                  </div>
                                  {segment.start && (
                                    <span className="text-xs text-gray-400 font-nunito">
                                      {Math.floor(segment.start / 60)}:{(segment.start % 60).toString().padStart(2, '0')}
                                    </span>
                                  )}
                                </div>
                                <div className="font-nunito text-sm text-[#4B5674] leading-relaxed">
                                  {segment.text || segment.words?.map((w: any) => w.text).join(' ') || ''}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-nunito text-sm text-[#6B7A96]">Select a meeting from the list or open Meetings Overview.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

