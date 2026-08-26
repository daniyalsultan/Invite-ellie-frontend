import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import searchIcon from '../../assets/Vector.png';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import {
  WorkspaceRecord,
  getWorkspace,
  MeetingStatus,
} from './workspaceApi';
import {
  getTranscriptions,
  getTranscription,
  getFolderMeetingsOverview,
  getFolderWorkspaceInsights,
  normalizeStringArray,
  type Transcription,
  type ActionItem,
  type WorkspaceFolderInsightsResponse,
  type FolderMeetingsOverviewActionItem,
} from '../../services/transcriptionApi';
import { MeetingInsightsPanel } from '../meeting/MeetingInsightsPanel';
import { getSlackStatus, slackExport, getSlackChannels, type SlackChannel } from '../../services/slackApi';
import { getNotionStatus, notionExport } from '../../services/notionApi';
import { getHubSpotStatus, hubspotExport } from '../../services/hubspotApi';
import { splitOverviewSummaryToBullets } from '../../utils/overviewSummaryBullets';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

type MeetingWithWorkspace = {
  id: string;
  title: string;
  platform: string;
  duration: string | null;
  paticipants: number | null;
  status: MeetingStatus;
  audio_url: string | null;
  transcript: string | null;
  summary: string | null;
  highlights: string[] | null;
  action_items: string[] | null;
  action_items_detail?: ActionItem[] | null;
  key_outcomes_signals?: string[];
  meeting_gaps?: string[];
  open_questions?: string[];
  held_at: string | null;
  created_at?: string;
  updated_at: string;
  folder: string;
};

const MEETING_STATUS_STYLES: Record<MeetingStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  TRANSCRIBING: 'bg-blue-50 text-blue-700',
  SUMMARIZING: 'bg-indigo-50 text-indigo-700',
  COMPLETED: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return { date: '—', time: '' };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: value, time: '' };
  }
  return {
    date: date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function sortMeetings(meetings: MeetingWithWorkspace[]): MeetingWithWorkspace[] {
  return [...meetings].sort((a, b) => {
    const dateA = new Date(a.held_at ?? a.updated_at ?? 0).getTime();
    const dateB = new Date(b.held_at ?? b.updated_at ?? 0).getTime();
    return dateB - dateA;
  });
}

function workspaceInsightFlagLine(flag: string, blockedBy: string | null): string {
  if (flag === 'assign_owner') return '❌ Assign owner';
  if (flag === 'define_deadline') return '⚠️ Define deadline';
  if (flag === 'blocked') return blockedBy?.trim() ? `⚠️ Blocked by ${blockedBy.trim()}` : '⚠️ Blocked';
  return flag;
}

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

function mapTranscriptionStatus(status: string | null | undefined): MeetingStatus {
  if (!status) return 'PENDING';
  const upper = status.toUpperCase();
  if (upper === 'COMPLETE' || upper === 'DONE') return 'COMPLETED';
  if (upper === 'TRANSCRIBE' || upper === 'TRANSCRIBING') return 'TRANSCRIBING';
  if (upper === 'SUMMARIZE' || upper === 'SUMMARIZING') return 'SUMMARIZING';
  if (upper === 'ERROR' || upper === 'FAIL') return 'FAILED';
  if (['PENDING', 'TRANSCRIBING', 'SUMMARIZING', 'COMPLETED', 'FAILED'].includes(upper)) {
    return upper as MeetingStatus;
  }
  return 'PENDING';
}

export function WorkspaceViewPage(): JSX.Element {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { ensureFreshAccessToken } = useAuth();
  const { profile } = useProfile();

  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [meetingSearch, setMeetingSearch] = useState('');
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

  // Workspace intelligence
  const [workspaceInsights, setWorkspaceInsights] = useState<WorkspaceFolderInsightsResponse | null>(null);
  const [workspaceInsightsLoading, setWorkspaceInsightsLoading] = useState(false);
  const [workspaceInsightsError, setWorkspaceInsightsError] = useState<string | null>(null);

  // Overview (AI summary across all workspace meetings)
  const [overviewBackendSummary, setOverviewBackendSummary] = useState<string | null>(null);
  const [, setOverviewBackendActions] = useState<FolderMeetingsOverviewActionItem[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewCached, setOverviewCached] = useState(false);

  // Meeting detail modal
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedMeetingForModal, setSelectedMeetingForModal] = useState<MeetingWithWorkspace | null>(null);
  const [fullModalTranscription, setFullModalTranscription] = useState<Transcription | null>(null);
  const [modalTranscriptContent, setModalTranscriptContent] = useState<any>(null);
  const [loadingModalTranscript, setLoadingModalTranscript] = useState(false);
  const [modalTranscriptionSearch, setModalTranscriptionSearch] = useState('');

  // Export state
  const [exporting, setExporting] = useState<{ [key: string]: boolean }>({});
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Slack needs a destination channel from the user. This modal used to send
  // without asking, which meant the export silently went to #general — a
  // channel nobody picked and which need not even exist.
  const [pendingSlackExport, setPendingSlackExport] = useState<{
    transcriptionId: string;
    meetingTitle: string;
    channel: string;
  } | null>(null);
  const [slackChannels, setSlackChannels] = useState<SlackChannel[] | null>(null);
  const [slackChannelsError, setSlackChannelsError] = useState<string | null>(null);

  // Detail panel view: overview or single meeting
  const [, setDetailPanel] = useState<'overview' | 'meeting'>('overview');

  const refreshWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) throw new Error('Unable to authenticate. Please login again.');
      const data = await getWorkspace(token, workspaceId);
      setWorkspace(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load workspace. Please try again.';
      setError(message);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  }, [ensureFreshAccessToken, workspaceId]);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  // Fetch transcriptions for this workspace
  useEffect(() => {
    if (!profile?.id || !workspaceId) {
      setTranscriptions([]);
      return;
    }
    const fetchTranscriptions = async () => {
      try {
        const allTranscriptions = await getTranscriptions(profile.id || '');
        const workspaceTranscriptions = allTranscriptions.filter(
          (t: Transcription) => t.workspace_id === workspaceId,
        );
        setTranscriptions(workspaceTranscriptions);
      } catch (err) {
        console.error('Error fetching transcriptions:', err);
        setTranscriptions([]);
      }
    };
    void fetchTranscriptions();
  }, [profile?.id, workspaceId]);

  const allMeetings = useMemo(() => {
    const meetings: MeetingWithWorkspace[] = transcriptions.map((t) => ({
      id: t.id,
      title: t.meeting_title || 'Untitled Meeting',
      platform: t.platform || t.calendar_platform || 'Unknown',
      duration: t.duration ? String(t.duration) : null,
      paticipants: null,
      status: mapTranscriptionStatus(t.status),
      audio_url: t.meeting_url,
      // The list endpoint omits transcript bodies; the meeting modal loads
      // them on demand via getTranscription().
      transcript: null,
      summary: t.summary,
      highlights: null,
      action_items: t.action_items?.map((item) => (typeof item === 'string' ? item : item.text)) || null,
      action_items_detail: t.action_items ?? null,
      key_outcomes_signals: normalizeStringArray(t.key_outcomes_signals),
      meeting_gaps: normalizeStringArray(t.meeting_gaps),
      open_questions: normalizeStringArray(t.open_questions),
      held_at: t.start_time,
      created_at: t.created_at || undefined,
      updated_at: t.updated_at || t.created_at || new Date().toISOString(),
      folder: '',
    }));
    return sortMeetings(meetings);
  }, [transcriptions]);

  const filteredMeetings = useMemo(() => {
    const query = meetingSearch.trim().toLowerCase();
    if (!query) return allMeetings;
    return allMeetings.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.status.toLowerCase().includes(query) ||
        (m.summary ?? '').toLowerCase().includes(query),
    );
  }, [allMeetings, meetingSearch]);

  // Workspace insights (status, gaps, repeated issues, action items)
  useEffect(() => {
    if (!workspaceId || !profile?.id) {
      setWorkspaceInsights(null);
      return;
    }
    let cancelled = false;
    setWorkspaceInsightsLoading(true);
    setWorkspaceInsightsError(null);
    void getFolderWorkspaceInsights(workspaceId, profile.id)
      .then((data) => {
        if (cancelled) return;
        setWorkspaceInsights(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setWorkspaceInsightsError(err instanceof Error ? err.message : 'Workspace insights request failed');
        setWorkspaceInsights(null);
      })
      .finally(() => {
        if (!cancelled) setWorkspaceInsightsLoading(false);
      });
    return () => { cancelled = true; };
  }, [workspaceId, profile?.id]);

  // Workspace meetings overview (AI summary)
  const meetingsFingerprint = useMemo(
    () => transcriptions.map((m) => `${m.id}:${m.updated_at || ''}`).sort().join('|'),
    [transcriptions],
  );

  useEffect(() => {
    if (!workspaceId || !profile?.id || transcriptions.length === 0) {
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
    void getFolderMeetingsOverview(workspaceId, profile.id)
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
    return () => { cancelled = true; };
  }, [workspaceId, profile?.id, meetingsFingerprint]);

  const meetingsNewestFirst = useMemo(() => {
    return [...transcriptions].sort((a, b) => {
      const ta = new Date(a.start_time || a.created_at || 0).getTime();
      const tb = new Date(b.start_time || b.created_at || 0).getTime();
      return tb - ta;
    });
  }, [transcriptions]);

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

  const displayOverviewSummary = useMemo(() => {
    const backend = (overviewBackendSummary || '').trim();
    if (backend) return overviewBackendSummary as string;
    return combinedMeetingsSummary;
  }, [overviewBackendSummary, combinedMeetingsSummary]);

  const overviewSummaryBullets = useMemo(
    () => splitOverviewSummaryToBullets(displayOverviewSummary || ''),
    [displayOverviewSummary],
  );

  const workspaceActionItemGroups = useMemo(() => {
    if (!workspaceInsights) return { attention: [], ready: [] };
    const attention = workspaceInsights.action_items.filter((row) => row.flags.length > 0);
    const ready = workspaceInsights.action_items.filter((row) => row.flags.length === 0);
    return { attention, ready };
  }, [workspaceInsights]);

  const workspaceOverviewStats = useMemo(() => {
    const withSummary = allMeetings.filter((m) => (m.summary || '').trim().length > 0).length;
    const totalActions = allMeetings.reduce((acc, m) => acc + (m.action_items?.length ?? 0), 0);
    return { withSummary, totalActions, total: allMeetings.length };
  }, [allMeetings]);

  // Load full transcription for meeting modal
  useEffect(() => {
    if (!isMeetingModalOpen || !selectedMeetingForModal?.id || !profile?.id) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingModalTranscript(true);
        const full = await getTranscription(selectedMeetingForModal.id, profile.id || '');
        if (!cancelled) {
          setFullModalTranscription(full);
          setModalTranscriptContent(full.utterances || full.words || []);
        }
      } catch {
        if (!cancelled) {
          setFullModalTranscription(null);
          setModalTranscriptContent(null);
        }
      } finally {
        if (!cancelled) setLoadingModalTranscript(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [isMeetingModalOpen, selectedMeetingForModal?.id, profile?.id]);

  const filteredModalTranscriptSegments = useMemo(() => {
    if (!modalTranscriptContent || !modalTranscriptionSearch.trim()) return modalTranscriptContent || [];
    const query = modalTranscriptionSearch.toLowerCase();
    if (Array.isArray(modalTranscriptContent)) {
      return modalTranscriptContent.filter((item: any) => {
        const text = item.text || item.words?.map((w: any) => w.text).join(' ') || '';
        const speaker = item.speaker || '';
        return text.toLowerCase().includes(query) || speaker.toLowerCase().includes(query);
      });
    }
    return modalTranscriptContent;
  }, [modalTranscriptContent, modalTranscriptionSearch]);

  const handleMeetingClick = (meeting: MeetingWithWorkspace): void => {
    setSelectedMeetingForModal(meeting);
    setModalTranscriptionSearch('');
    setDetailPanel('meeting');
    setIsMeetingModalOpen(true);
  };

  // Handle export
  const handleExport = async (
    transcriptionId: string,
    exportType: 'slack' | 'notion' | 'hubspot',
    channel?: string,
  ): Promise<void> => {
    if (!profile?.id) {
      setStatusMessage({ type: 'error', text: 'Please log in to export.' });
      return;
    }
    const exportKey = `${transcriptionId}-${exportType}`;
    try {
      setExporting((prev) => ({ ...prev, [exportKey]: true }));
      setExportMessage(null);

      let isConnected = false;
      if (exportType === 'slack') {
        const s = await getSlackStatus(profile.id);
        isConnected = s.connected;
      } else if (exportType === 'notion') {
        const s = await getNotionStatus(profile.id);
        isConnected = s.connected;
      } else {
        const s = await getHubSpotStatus(profile.id);
        isConnected = s.connected;
      }

      if (!isConnected) {
        setExporting((prev) => ({ ...prev, [exportKey]: false }));
        setStatusMessage({ type: 'error', text: `Connect your ${exportType} account first. Redirecting...` });
        setTimeout(() => navigate('/integrations'), 1500);
        return;
      }

      // Slack: ask which channel before sending anything.
      if (exportType === 'slack' && !channel) {
        setExporting((prev) => ({ ...prev, [exportKey]: false }));
        const meeting = transcriptions.find((t) => t.id === transcriptionId);
        setPendingSlackExport({
          transcriptionId,
          meetingTitle: meeting?.meeting_title || 'this meeting',
          channel: '',
        });
        setSlackChannels(null);
        setSlackChannelsError(null);
        void getSlackChannels(profile.id).then((res) => {
          setSlackChannels(res.channels);
          setSlackChannelsError(res.error || null);
          // Pre-select the first reachable channel so the confirm button is
          // never enabled with nothing chosen.
          if (res.channels && res.channels.length > 0) {
            setPendingSlackExport((prev) => (prev ? { ...prev, channel: res.channels[0].name } : prev));
          }
        });
        return;
      }

      let fullData = fullModalTranscription;
      if (!fullData || fullData.id !== transcriptionId) {
        fullData = await getTranscription(transcriptionId, profile.id);
      }

      let transcriptText = '';
      if (fullData.transcript_text) {
        transcriptText = fullData.transcript_text;
      } else if (fullData.utterances && fullData.utterances.length > 0) {
        transcriptText = fullData.utterances.map((u: any) => `${u.speaker || 'Unknown'}: ${u.text || ''}`).join('\n');
      }

      const actionItems = fullData.action_items || [];
      const meetingTitle = fullData.meeting_title || 'Untitled Meeting';
      const summaryText = fullData.summary || '';

      let result: { success: boolean; message?: string; error?: string };
      if (exportType === 'slack') {
        result = await slackExport(
          profile.id,
          transcriptionId,
          meetingTitle,
          transcriptText,
          summaryText,
          actionItems,
          channel as string,
        );
      } else if (exportType === 'notion') {
        result = await notionExport(profile.id, transcriptionId, meetingTitle, summaryText, actionItems);
      } else {
        result = await hubspotExport(profile.id, transcriptionId, meetingTitle, summaryText, actionItems, fullData.event_id);
      }

      if (result.success) {
        const platformName = exportType === 'slack' ? 'Slack' : exportType === 'notion' ? 'Notion' : 'HubSpot';
        setExportMessage({ type: 'success', text: `Successfully exported to ${platformName}!` });
        setTimeout(() => setExportMessage(null), 6000);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (err) {
      console.error(`[Export ${exportType.toUpperCase()}] Error:`, err);
      setExportMessage({ type: 'error', text: err instanceof Error ? err.message : `Failed to export to ${exportType}` });
    } finally {
      setExporting((prev) => ({ ...prev, [exportKey]: false }));
    }
  };

  if (!workspaceId) {
    return (
      <DashboardLayout activeTab="/workspaces">
        <div className="flex min-h-full items-center justify-center bg-white p-8">
          <p className="font-nunito text-lg text-[#E45A5A]">Workspace ID is missing.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="/workspaces">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <nav className="mb-3 md:mb-4 lg:mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <Link to="/dashboard" className="transition-colors hover:text-ellieBlack">
                  Dashboard
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li>
                <Link to="/workspaces" className="transition-colors hover:text-ellieBlack">
                  Workspaces
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">{workspace?.name ?? 'Workspace'}</li>
            </ol>
          </nav>

          {error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center">
              <p className="font-nunito text-base text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => refreshWorkspace()}
                className="mt-4 rounded-lg bg-ellieBlue px-4 py-2 font-nunito text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : isLoading && !workspace ? (
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white px-6 py-10 shadow-sm">
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          ) : workspace ? (
            <>
              {statusMessage && (
                <div
                  role="status"
                  className={`mb-6 rounded-lg px-4 py-3 font-nunito text-sm ${
                    statusMessage.type === 'success'
                      ? 'border border-green-200 bg-green-50 text-green-700'
                      : 'border border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span>{statusMessage.text}</span>
                    <button
                      type="button"
                      onClick={() => setStatusMessage(null)}
                      className="text-xs font-semibold uppercase tracking-wide text-current underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {exportMessage && (
                <div
                  className={`mb-6 rounded-lg px-4 py-3 font-nunito text-sm ${
                    exportMessage.type === 'success'
                      ? 'border border-green-200 bg-green-50 text-green-700'
                      : 'border border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {exportMessage.text}
                </div>
              )}

              <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[55%_45%] lg:gap-4">
                {/* Meetings list */}
                <div className="flex flex-col rounded-[12px] bg-white p-4 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] md:rounded-[18px] md:p-6 lg:px-4 lg:py-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 md:mb-6">
                    <h2 className="font-nunito text-lg font-bold text-[#25324B] md:text-xl">
                      Meetings
                    </h2>
                    <div className="relative w-full sm:w-auto sm:min-w-[220px]">
                      <input
                        type="text"
                        value={meetingSearch}
                        onChange={(event) => setMeetingSearch(event.target.value)}
                        placeholder="Search meetings"
                        className="w-full rounded-lg border border-[#CBD3E3] bg-white px-9 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                      />
                      <img
                        src={searchIcon}
                        alt="Search meetings"
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                      />
                    </div>
                  </div>

                  {filteredMeetings.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center font-nunito text-sm text-[#6B7A96]">
                      No meetings found for this workspace.
                    </p>
                  ) : (
                    <>
                      <div className="hidden lg:block">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr className="border-b border-[#E6E9F2]">
                              <th className="w-[55%] px-4 py-3 text-left font-nunito text-base font-semibold text-[#25324B]">
                                Details
                              </th>
                              <th className="w-[25%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                                Date/Time
                              </th>
                              <th className="w-[20%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMeetings.map((meeting) => {
                              const formatted = formatDateTime(meeting.held_at ?? meeting.updated_at);
                              const statusClass = MEETING_STATUS_STYLES[meeting.status];
                              return (
                                <tr
                                  key={meeting.id}
                                  onClick={() => handleMeetingClick(meeting)}
                                  className="cursor-pointer border-b border-[#EEE9FE] transition hover:bg-[#F6F7FB]"
                                >
                                  <td className="px-4 py-4">
                                    <span className="font-nunito text-base font-semibold text-[#25324B]">
                                      {meeting.title}
                                    </span>
                                  </td>
                                  <td className="px-2 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                      <span className="font-nunito text-base font-semibold text-[#25324B]">
                                        {formatted.date}
                                      </span>
                                      <span className="font-nunito text-sm text-[#6B7A96]">
                                        {formatted.time}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-4 text-right">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}
                                    >
                                      {meeting.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col gap-4 lg:hidden">
                        {filteredMeetings.map((meeting) => {
                          const formatted = formatDateTime(meeting.held_at ?? meeting.updated_at);
                          const statusClass = MEETING_STATUS_STYLES[meeting.status];
                          return (
                            <div
                              key={`${meeting.id}-mobile`}
                              onClick={() => handleMeetingClick(meeting)}
                              className="cursor-pointer rounded-2xl border border-[#E6E9F2] p-4 shadow-[0_12px_24px_rgba(39,62,99,0.05)]"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="flex-1 font-nunito text-base font-semibold text-[#25324B]">
                                  {meeting.title}
                                </h3>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusClass}`}
                                >
                                  {meeting.status}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-[#6B7A96]">
                                <span className="font-semibold text-[#25324B]">{formatted.date}</span>
                                <span className="ml-1">{formatted.time}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Workspace Intelligence */}
                <div className="space-y-6 lg:pl-3">
                  <div className="rounded-[12px] bg-white p-4 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] md:rounded-[18px] md:p-6 lg:p-8">
                    <div className="mb-4">
                      <h3 className="font-nunito text-xl font-bold text-[#25324B]">Workspace Intelligence</h3>
                      <p className="font-nunito text-sm text-[#6B7A96] mt-1">
                        Status, gaps, and follow-ups across meetings.
                      </p>
                      {workspaceOverviewStats.total > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-[#327AAD]/10 px-3 py-1 font-nunito text-xs font-semibold text-[#327AAD]">
                            {workspaceOverviewStats.total} meeting{workspaceOverviewStats.total === 1 ? '' : 's'}
                          </span>
                          {workspaceOverviewStats.withSummary > 0 && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-nunito text-xs font-semibold text-emerald-800">
                              {workspaceOverviewStats.withSummary} with summary
                            </span>
                          )}
                          {workspaceOverviewStats.totalActions > 0 && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 font-nunito text-xs font-semibold text-amber-900">
                              {workspaceOverviewStats.totalActions} action item{workspaceOverviewStats.totalActions === 1 ? '' : 's'}
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
                    <div className="space-y-6">
                      {/* Overview Summary */}
                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">Summary</h4>
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          {overviewLoading ? (
                            <p className="font-nunito text-sm text-[#6B7A96]">Generating AI overview...</p>
                          ) : displayOverviewSummary ? (
                            <>
                              {(overviewBackendSummary || '').trim() && (
                                <p className="font-nunito text-xs text-[#94A3C1] mb-2">Synthesized across all meetings</p>
                              )}
                              {overviewSummaryBullets.length > 0 ? (
                                <ul className="space-y-2.5">
                                  {overviewSummaryBullets.map((line, idx) => (
                                    <li key={idx} className="flex gap-3 font-nunito text-sm text-[#4B5674] leading-relaxed">
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
                              No summaries yet. They will appear once meeting processing completes.
                            </p>
                          )}
                          {overviewError && !overviewLoading && (
                            <p className="font-nunito text-xs text-amber-800 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              AI overview unavailable ({overviewError}).
                            </p>
                          )}
                        </article>
                      </section>

                      {/* Status */}
                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">Status</h4>
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          {workspaceInsightsLoading ? (
                            <p className="font-nunito text-sm text-[#6B7A96]">Loading insights...</p>
                          ) : workspaceInsights ? (
                            <>
                              <p className="font-nunito text-sm font-semibold text-[#25324B]">
                                {workspaceInsights.status_label}
                              </p>
                              {workspaceInsights.reasons.length > 0 ? (
                                <ul className="mt-3 space-y-2">
                                  {workspaceInsights.reasons.slice(0, 3).map((line, idx) => (
                                    <li key={idx} className="font-nunito text-sm text-[#4B5674] flex gap-2 leading-snug">
                                      <span className="text-[#327AAD] font-bold shrink-0">•</span>
                                      <span>{line}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="font-nunito text-sm text-[#6B7A96] mt-2">No blockers flagged.</p>
                              )}
                            </>
                          ) : (
                            <p className="font-nunito text-sm text-[#94A3C1] italic">
                              Add meetings to see status.
                            </p>
                          )}
                          {workspaceInsightsError && !workspaceInsightsLoading && (
                            <p className="font-nunito text-xs text-amber-800 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              Could not load insights ({workspaceInsightsError}).
                            </p>
                          )}
                        </article>
                      </section>

                      {/* Gaps */}
                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                          Gaps across meetings
                        </h4>
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          {!workspaceInsights || workspaceInsightsLoading ? (
                            <p className="font-nunito text-sm text-[#6B7A96]">—</p>
                          ) : workspaceInsights.gaps_across_meetings.length === 0 ? (
                            <p className="font-nunito text-sm text-[#94A3C1] italic">No aggregated gaps.</p>
                          ) : (
                            <ul className="space-y-2">
                              {workspaceInsights.gaps_across_meetings.slice(0, 5).map((g, idx) => (
                                <li key={idx} className="font-nunito text-sm text-[#4B5674] flex gap-2 leading-snug">
                                  <span className="shrink-0">{g.icon}</span>
                                  <span>{g.text}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      </section>

                      {/* Repeated issues */}
                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                          Repeated issues
                        </h4>
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          {!workspaceInsights || workspaceInsightsLoading ? (
                            <p className="font-nunito text-sm text-[#6B7A96]">—</p>
                          ) : workspaceInsights.repeated_issues.length === 0 ? (
                            <p className="font-nunito text-sm text-[#94A3C1] italic">
                              No cross-meeting patterns detected yet.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {workspaceInsights.repeated_issues.map((line, idx) => (
                                <li key={idx} className="font-nunito text-sm text-[#4B5674] flex gap-2 leading-snug">
                                  <span className="text-[#327AAD] font-bold shrink-0">•</span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </article>
                      </section>

                      {/* Action items */}
                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                          Action items (aggregated)
                        </h4>
                        {!workspaceInsights || workspaceInsightsLoading ? (
                          <p className="font-nunito text-sm text-[#6B7A96] rounded-2xl border border-gray-200 bg-white p-5">Loading...</p>
                        ) : workspaceInsights.action_items.length === 0 ? (
                          <p className="font-nunito text-sm text-[#94A3C1] italic rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
                            No action items extracted yet.
                          </p>
                        ) : (
                          <div className="space-y-4 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4">
                            {workspaceActionItemGroups.attention.length > 0 && (
                              <div className="space-y-3">
                                <div className="rounded-2xl bg-[#FFF5F5] border border-[#F3C6C6] px-3 py-2 text-sm font-semibold text-[#B12D2D]">
                                  Needs Attention
                                </div>
                                <ul className="space-y-3">
                                  {workspaceActionItemGroups.attention.map((row, idx) => (
                                    <li key={`attention-${row.meeting_id}-${idx}`} className="rounded-2xl border border-[#F3C6C6] bg-[#FFFBFA] p-4">
                                      <p className="font-nunito text-sm font-medium text-[#25324B]">{row.text}</p>
                                      <p className="font-nunito text-xs text-[#6B7A96] mt-1">
                                        Owner: {row.owner_display} · Deadline: {row.deadline_display}
                                      </p>
                                      <p className="font-nunito text-xs text-[#94A3C1] mt-0.5">From: {row.meeting_title}</p>
                                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                        {row.flags.map((f) => (
                                          <span
                                            key={f}
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 ${
                                              f === 'assign_owner'
                                                ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                                : f === 'define_deadline'
                                                  ? 'bg-[#FEF9C3] text-[#92400E]'
                                                  : 'bg-[#E0F2FE] text-[#0369A1]'
                                            }`}
                                          >
                                            {workspaceInsightFlagLine(f, row.blocked_by)}
                                          </span>
                                        ))}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {workspaceActionItemGroups.ready.length > 0 && (
                              <div className="space-y-3">
                                <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-2 text-sm font-semibold text-[#166534]">
                                  Ready
                                </div>
                                <ul className="space-y-3">
                                  {workspaceActionItemGroups.ready.map((row, idx) => (
                                    <li key={`ready-${row.meeting_id}-${idx}`} className="rounded-2xl border border-[#D1FAE5] bg-[#F7FEF6] p-4">
                                      <p className="font-nunito text-sm font-medium text-[#25324B]">{row.text}</p>
                                      <p className="font-nunito text-xs text-[#6B7A96] mt-1">
                                        Owner: {row.owner_display} · Deadline: {row.deadline_display}
                                      </p>
                                      <p className="font-nunito text-xs text-[#94A3C1] mt-0.5">From: {row.meeting_title}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </section>

                      {workspaceInsights &&
                        !workspaceInsightsLoading &&
                        workspaceInsights.short_summary_bullets.length > 0 && (
                          <section>
                            <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                              Short summary
                            </h4>
                            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                              <ul className="space-y-2">
                                {workspaceInsights.short_summary_bullets.slice(0, 4).map((line, idx) => (
                                  <li key={idx} className="font-nunito text-sm text-[#4B5674] flex gap-2 leading-snug">
                                    <span className="text-slate-500 font-bold shrink-0">•</span>
                                    <span>{line}</span>
                                  </li>
                                ))}
                              </ul>
                            </article>
                          </section>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Meeting Detail Modal */}
      {isMeetingModalOpen && selectedMeetingForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="font-nunito text-xl font-bold text-[#25324B]">
                  {selectedMeetingForModal.title}
                </h3>
                <p className="font-nunito text-sm text-[#6B7A96]">
                  {formatDateTime(selectedMeetingForModal.held_at ?? selectedMeetingForModal.updated_at).date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Export buttons */}
                <button
                  type="button"
                  onClick={() => void handleExport(selectedMeetingForModal.id, 'slack')}
                  disabled={exporting[`${selectedMeetingForModal.id}-slack`]}
                  className="px-3 py-1.5 rounded-lg bg-[#4A154B] text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export to Slack"
                >
                  {exporting[`${selectedMeetingForModal.id}-slack`] ? 'Exporting...' : 'Slack'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleExport(selectedMeetingForModal.id, 'notion')}
                  disabled={exporting[`${selectedMeetingForModal.id}-notion`]}
                  className="px-3 py-1.5 rounded-lg bg-black text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export to Notion"
                >
                  {exporting[`${selectedMeetingForModal.id}-notion`] ? 'Exporting...' : 'Notion'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleExport(selectedMeetingForModal.id, 'hubspot')}
                  disabled={exporting[`${selectedMeetingForModal.id}-hubspot`]}
                  className="px-3 py-1.5 rounded-lg text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FF7A59' }}
                  title="Export to HubSpot"
                >
                  {exporting[`${selectedMeetingForModal.id}-hubspot`] ? 'Exporting...' : 'HubSpot'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="ml-2 rounded-full p-2 transition-colors hover:bg-gray-100"
                  aria-label="Close meeting details"
                >
                  <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {exportMessage && (
              <div
                className={`mx-6 mt-4 flex-shrink-0 rounded-lg border p-3 font-nunito text-sm ${
                  exportMessage.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {exportMessage.text}
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
              <div className="min-h-0 flex-1 overflow-y-auto border-b border-gray-200 p-4 lg:border-b-0 lg:border-r lg:p-6">
                <MeetingInsightsPanel
                  transcription={(fullModalTranscription as Transcription | null) ?? (selectedMeetingForModal as unknown as Transcription)}
                  loading={loadingModalTranscript}
                  compact
                  isFirstMeetingInWorkspace={false}
                />
              </div>
              <div className="flex min-h-0 flex-[0.9] flex-col overflow-hidden">
                <div className="border-b border-gray-200 p-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={modalTranscriptionSearch}
                      onChange={(e) => setModalTranscriptionSearch(e.target.value)}
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
                <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
                  {loadingModalTranscript ? (
                    <div className="py-8 text-center font-nunito text-sm text-gray-500">Loading transcript...</div>
                  ) : !filteredModalTranscriptSegments || (Array.isArray(filteredModalTranscriptSegments) && filteredModalTranscriptSegments.length === 0) ? (
                    <div className="py-8 text-center font-nunito text-sm text-gray-500">
                      {modalTranscriptionSearch ? 'No transcript segments match your search' : 'No transcript available'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(filteredModalTranscriptSegments) &&
                        filteredModalTranscriptSegments.map((segment: any, index: number) => (
                          <div key={segment.id || index} className="flex gap-3">
                            <div className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-[#327AAD]/10 text-center font-nunito text-xs font-semibold leading-8 text-[#327AAD]">
                              {segment.speaker?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-nunito text-sm font-semibold text-[#25324B]">
                                {segment.speaker || 'Unknown Speaker'}
                              </p>
                              <p className="font-nunito text-sm leading-relaxed text-[#4B5674]">
                                {segment.text || segment.words?.map((w: any) => w.text).join(' ') || ''}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingSlackExport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-nunito text-lg font-bold text-ellieBlack">Confirm export</h3>
            <p className="mt-2 font-nunito text-sm text-ellieGray">
              Send <span className="font-semibold">{pendingSlackExport.meetingTitle}</span> to Slack.
            </p>

            <label className="mt-4 block font-nunito text-xs font-semibold uppercase tracking-wider text-ellieGray">
              Channel
            </label>
            {slackChannels === null ? (
              <p className="mt-2 font-nunito text-sm text-ellieGray">Loading your channels...</p>
            ) : slackChannels.length > 0 ? (
              <select
                value={pendingSlackExport.channel}
                onChange={(e) =>
                  setPendingSlackExport((prev) => (prev ? { ...prev, channel: e.target.value } : prev))
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-nunito text-sm"
              >
                {slackChannels.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-2 font-nunito text-sm text-[#E45A5A]">
                {slackChannelsError
                  ? `Ellie couldn't read your channel list (${slackChannelsError}).`
                  : 'No public channels found. Create one in Slack, or invite Ellie to a private channel with /invite @Ellie.'}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingSlackExport(null)}
                className="rounded-lg px-4 py-2 font-nunito text-sm font-semibold text-ellieGray hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={!pendingSlackExport.channel}
                onClick={() => {
                  const target = pendingSlackExport;
                  setPendingSlackExport(null);
                  void handleExport(target.transcriptionId, 'slack', target.channel);
                }}
                className="rounded-lg bg-ellieBlue px-4 py-2 font-nunito text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
