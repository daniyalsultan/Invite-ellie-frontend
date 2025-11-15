import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import searchIcon from '../../assets/Vector.png';
import folderIcon from '../../assets/folder.png';
import { useAuth } from '../../context/AuthContext';
import {
  WORKSPACE_CATEGORY_OPTIONS,
  WorkspaceCategory,
  WorkspaceRecord,
  deleteWorkspace,
  getWorkspace,
  getWorkspaceCategoryLabel,
  updateWorkspace,
  MeetingRecord,
  MeetingStatus,
} from './workspaceApi';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

type MeetingWithFolder = MeetingRecord & { folderName: string };

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

function sortMeetings(meetings: MeetingWithFolder[]): MeetingWithFolder[] {
  return [...meetings].sort((a, b) => {
    const dateA = new Date(a.held_at ?? a.updated_at ?? 0).getTime();
    const dateB = new Date(b.held_at ?? b.updated_at ?? 0).getTime();
    return dateB - dateA;
  });
}

export function WorkspaceViewPage(): JSX.Element {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { ensureFreshAccessToken } = useAuth();

  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<WorkspaceCategory>('PROJECT');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [folderSearch, setFolderSearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [transcriptionSearch, setTranscriptionSearch] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const refreshWorkspace = useCallback(async () => {
    if (!workspaceId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      const data = await getWorkspace(token, workspaceId);
      setWorkspace(data);
      setEditName(data.name);
      setEditCategory(data.category ?? 'PROJECT');
      const firstMeeting =
        data.folders?.flatMap((folder) => folder.meetings ?? []).find(Boolean)?.id ?? null;
      setSelectedMeetingId(firstMeeting);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load workspace. Please try again.';
      setError(message);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  }, [ensureFreshAccessToken, workspaceId]);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  const folders = useMemo(() => workspace?.folders ?? [], [workspace]);

  const filteredFolders = useMemo(() => {
    const query = folderSearch.trim().toLowerCase();
    const sorted = [...folders].sort((a, b) => {
      if (a.is_pinned === b.is_pinned) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.is_pinned ? -1 : 1;
    });
    if (!query) {
      return sorted;
    }
    return sorted.filter(
      (folder) =>
        folder.name.toLowerCase().includes(query) ||
        folder.id.toLowerCase().includes(query.toLowerCase()),
    );
  }, [folderSearch, folders]);

  const allMeetings = useMemo(() => {
    if (!folders.length) {
      return [];
    }
    const meetings: MeetingWithFolder[] = folders.flatMap((folder) =>
      (folder.meetings ?? []).map((meeting) => ({
        ...meeting,
        folderName: folder.name,
      })),
    );
    return sortMeetings(meetings);
  }, [folders]);

  useEffect(() => {
    if (!allMeetings.length) {
      setSelectedMeetingId(null);
      return;
    }
    if (!selectedMeetingId || !allMeetings.some((meeting) => meeting.id === selectedMeetingId)) {
      setSelectedMeetingId(allMeetings[0].id);
    }
  }, [allMeetings, selectedMeetingId]);

  const filteredMeetings = useMemo(() => {
    const query = meetingSearch.trim().toLowerCase();
    if (!query) {
      return allMeetings;
    }
    return allMeetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.folderName.toLowerCase().includes(query) ||
        meeting.status.toLowerCase().includes(query) ||
        (meeting.summary ?? '').toLowerCase().includes(query),
    );
  }, [allMeetings, meetingSearch]);

  const selectedMeeting = useMemo(
    () => filteredMeetings.find((meeting) => meeting.id === selectedMeetingId) ?? allMeetings[0],
    [allMeetings, filteredMeetings, selectedMeetingId],
  );

  const transcriptSegments = useMemo(() => {
    if (!selectedMeeting?.transcript) {
      return [];
    }
    return selectedMeeting.transcript
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => ({
        id: `${selectedMeeting.id}-${index}`,
        text: line,
      }));
  }, [selectedMeeting]);

  const filteredTranscriptSegments = useMemo(() => {
    const query = transcriptionSearch.trim().toLowerCase();
    if (!query) {
      return transcriptSegments;
    }
    return transcriptSegments.filter((segment) => segment.text.toLowerCase().includes(query));
  }, [transcriptSegments, transcriptionSearch]);

  const handleUpdateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceId) {
      return;
    }
    if (!editName.trim()) {
      setStatusMessage({ type: 'error', text: 'Workspace name cannot be empty.' });
      return;
    }
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      const updated = await updateWorkspace(token, workspaceId, {
        name: editName.trim(),
        category: editCategory,
      });
      setWorkspace(updated);
      setStatusMessage({ type: 'success', text: 'Workspace updated successfully.' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to update workspace. Please try again.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId || !workspace) {
      return;
    }
    const confirmation = window.confirm(
      `Delete "${workspace.name}"? All folders and meetings will be removed.`,
    );
    if (!confirmation) {
      return;
    }
    setIsDeleting(true);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      await deleteWorkspace(token, workspaceId);
      navigate('/workspaces', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to delete workspace. Please try again.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetForm = () => {
    if (!workspace) {
      return;
    }
    setEditName(workspace.name);
    setEditCategory(workspace.category ?? 'PROJECT');
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
              <div className="mb-6 rounded-[18px] border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1">
                    <h1 className="font-nunito text-2xl font-extrabold text-[#1F2A44] md:text-3xl">
                      {workspace.name}
                    </h1>
                    <p className="font-nunito text-sm text-[#6B7A96]">
                      ID: {workspace.id} • {getWorkspaceCategoryLabel(workspace.category)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => refreshWorkspace()}
                      className="rounded-lg border border-gray-200 px-4 py-2 font-nunito text-sm font-semibold text-[#25324B]"
                      disabled={isLoading}
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteWorkspace}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-nunito text-sm font-semibold text-[#E45A5A]"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete workspace'}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdateWorkspace} className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
                  <div className="flex flex-col gap-2">
                    <label className="font-nunito text-sm font-semibold text-[#25324B]">
                      Workspace name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="rounded-lg border border-gray-300 px-4 py-2.5 font-nunito text-sm text-[#25324B] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-nunito text-sm font-semibold text-[#25324B]">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(event) => setEditCategory(event.target.value as WorkspaceCategory)}
                      className="rounded-lg border border-gray-300 px-4 py-2.5 font-nunito text-sm text-[#25324B] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                      disabled={isSaving}
                    >
                      {WORKSPACE_CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-ellieBlue px-5 py-2 font-nunito text-sm font-semibold text-white disabled:opacity-60"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="rounded-lg border border-gray-200 px-4 py-2 font-nunito text-sm font-semibold text-[#25324B]"
                      disabled={isSaving}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

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

              <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[30%_35%_35%] lg:gap-4">
                <div className="space-y-4 lg:pr-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={folderSearch}
                      onChange={(event) => setFolderSearch(event.target.value)}
                      placeholder="Search by folder name"
                      className="w-full rounded-lg border border-[#CBD3E3] bg-white px-9 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                    />
                    <img
                      src={searchIcon}
                      alt="Search folders"
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                    />
                  </div>
                  {filteredFolders.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center font-nunito text-sm text-[#6B7A96]">
                      No folders found
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder.id}
                          className="flex flex-col gap-3 rounded-2xl border border-[#E3E7F2] bg-[#F7F9FC] px-4 py-5 shadow-[0_12px_24px_rgba(39,62,99,0.06)]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#D9E2F5]">
                              <img src={folderIcon} alt="" className="h-8 w-8 object-contain" />
                            </div>
                            {folder.is_pinned && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 font-nunito text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                                Pinned
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-nunito text-sm font-semibold text-[#25324B] md:text-base">
                              {folder.name}
                            </p>
                            <p className="font-nunito text-xs text-[#6B7A96]">{folder.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                              <th className="w-[45%] px-4 py-3 text-left font-nunito text-base font-semibold text-[#25324B]">
                                Details
                              </th>
                              <th className="w-[20%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                                Date/Time
                              </th>
                              <th className="w-[20%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                                Folder
                              </th>
                              <th className="w-[15%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                                Actions
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
                                  className="border-b border-[#EEE9FE] transition hover:bg-[#F6F7FB]"
                                >
                                  <td className="px-4 py-4">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-nunito text-base font-semibold text-[#25324B]">
                                        {meeting.title}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass}`}
                                        >
                                          {meeting.status}
                                        </span>
                                        {meeting.audio_url && (
                                          <button
                                            type="button"
                                            onClick={() => navigator.clipboard.writeText(meeting.audio_url ?? '')}
                                            className="text-xs font-semibold text-ellieBlue underline"
                                          >
                                            Copy link
                                          </button>
                                        )}
                                      </div>
                                    </div>
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
                                    <span className="font-nunito text-sm text-[#25324B]">
                                      {meeting.folderName}
                                    </span>
                                  </td>
                                  <td className="px-2 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedMeetingId(meeting.id)}
                                        className={`rounded-lg px-3 py-2 font-nunito text-sm font-semibold ${
                                          selectedMeeting?.id === meeting.id
                                            ? 'bg-ellieBlue text-white'
                                            : 'bg-blue-50 text-[#1F6FB5]'
                                        }`}
                                      >
                                        View
                                      </button>
                                    </div>
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
                              className="rounded-2xl border border-[#E6E9F2] p-4 shadow-[0_12px_24px_rgba(39,62,99,0.05)]"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                  <h3 className="font-nunito text-base font-semibold text-[#25324B]">
                                    {meeting.title}
                                  </h3>
                                  <p className="font-nunito text-xs text-[#6B7A96]">{meeting.folderName}</p>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${statusClass}`}
                                >
                                  {meeting.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-[#6B7A96]">
                                <div>
                                  <span className="font-semibold text-[#25324B]">{formatted.date}</span>
                                  <span className="ml-1">{formatted.time}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedMeetingId(meeting.id)}
                                  className={`rounded-lg px-3 py-1.5 font-nunito text-sm font-semibold ${
                                    selectedMeeting?.id === meeting.id
                                      ? 'bg-ellieBlue text-white'
                                      : 'bg-blue-50 text-[#1F6FB5]'
                                  }`}
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-6 lg:pl-3">
                  <div className="rounded-[12px] bg-white p-4 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] md:rounded-[18px] md:p-6 lg:p-8">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="font-nunito text-lg font-bold text-[#25324B] md:text-xl">
                          {selectedMeeting?.title ?? 'Select a meeting'}
                        </h2>
                        {selectedMeeting && (
                          <p className="font-nunito text-sm text-[#6B7A96]">
                            {selectedMeeting.folderName} • {selectedMeeting.platform}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedMeeting?.audio_url && (
                          <a
                            href={selectedMeeting.audio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-50 p-2 text-[#1F6FB5]"
                          >
                            Download
                          </a>
                        )}
                        {selectedMeeting?.audio_url && (
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(selectedMeeting.audio_url ?? '')}
                            className="rounded-lg bg-purple-50 p-2 text-[#7C3AED]"
                          >
                            Share
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedMeeting ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 font-nunito text-sm text-[#25324B]">
                          <div>
                            <p className="text-xs uppercase text-[#6B7A96]">Status</p>
                            <p>{selectedMeeting.status}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[#6B7A96]">Held at</p>
                            <p>
                              {formatDateTime(selectedMeeting.held_at ?? selectedMeeting.updated_at).date}{' '}
                              {formatDateTime(selectedMeeting.held_at ?? selectedMeeting.updated_at).time}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[#6B7A96]">Duration</p>
                            <p>{selectedMeeting.duration ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-[#6B7A96]">Participants</p>
                            <p>{selectedMeeting.paticipants ?? '—'}</p>
                          </div>
                        </div>

                        {selectedMeeting.summary ? (
                          <div className="rounded-xl border border-gray-100 bg-white p-4">
                            <h3 className="font-nunito text-sm font-semibold text-[#25324B]">Summary</h3>
                            <p className="mt-2 font-nunito text-sm text-[#4B5674]">
                              {selectedMeeting.summary}
                            </p>
                          </div>
                        ) : (
                          <p className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-[#6B7A96]">
                            No summary available yet.
                          </p>
                        )}

                        {selectedMeeting.action_items && selectedMeeting.action_items.length > 0 && (
                          <div className="rounded-xl border border-gray-100 bg-white p-4">
                            <h3 className="font-nunito text-sm font-semibold text-[#25324B]">
                              Action items
                            </h3>
                            <ul className="mt-3 space-y-2 text-sm text-[#4B5674]">
                              {selectedMeeting.action_items.map((item, index) => (
                                <li key={`${selectedMeeting.id}-action-${index}`} className="flex gap-2">
                                  <span>•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center font-nunito text-sm text-[#6B7A96]">
                        Select a meeting to view details.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col rounded-[12px] bg-white p-4 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] md:rounded-[18px] md:p-6 lg:p-8">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-nunito text-lg font-bold text-[#25324B] md:text-xl">
                        Meeting transcription
                      </h2>
                      {selectedMeeting?.transcript && (
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(selectedMeeting?.transcript ?? '')
                          }
                          className="rounded-lg border border-gray-200 px-3 py-1.5 font-nunito text-xs font-semibold text-[#25324B]"
                        >
                          Copy all
                        </button>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <input
                        type="text"
                        value={transcriptionSearch}
                        onChange={(event) => setTranscriptionSearch(event.target.value)}
                        placeholder="Search transcript"
                        className="w-full rounded-lg border border-[#CBD3E3] bg-white px-9 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                      />
                      <img
                        src={searchIcon}
                        alt="Search transcription"
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                      />
                    </div>

                    {selectedMeeting?.transcript ? (
                      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                        {filteredTranscriptSegments.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center font-nunito text-sm text-[#6B7A96]">
                            No transcript segments match your search.
                          </p>
                        ) : (
                          filteredTranscriptSegments.map((segment) => (
                            <div
                              key={segment.id}
                              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-nunito text-sm text-[#25324B]"
                            >
                              {segment.text}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center font-nunito text-sm text-[#6B7A96]">
                        No transcript available yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
