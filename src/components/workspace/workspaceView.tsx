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
import threeDotIcon from '../../assets/three-dot.png';
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
  FolderRecord,
  patchFolder,
  deleteFolder,
  pinFolder,
  unpinFolder,
} from './workspaceApi';
import deleteIllustration from '../../assets/delete.png';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameModalFolder, setRenameModalFolder] = useState<FolderRecord | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [deleteModalFolder, setDeleteModalFolder] = useState<FolderRecord | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

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

  const handleMenuClick = (folderId: string, event: React.MouseEvent): void => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === folderId ? null : folderId);
  };

  const handleRenameFolder = (folder: FolderRecord): void => {
    setOpenMenuId(null);
    setRenameModalFolder(folder);
    setRenameFolderName(folder.name);
  };

  const handleDeleteFolder = (folder: FolderRecord): void => {
    setOpenMenuId(null);
    setDeleteModalFolder(folder);
  };

  const handlePinFolder = async (folder: FolderRecord): Promise<void> => {
    setOpenMenuId(null);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      if (folder.is_pinned) {
        await unpinFolder(token, folder.id);
      } else {
        await pinFolder(token, folder.id);
      }
      await refreshWorkspace();
      setStatusMessage({
        type: 'success',
        text: `Folder ${folder.is_pinned ? 'unpinned' : 'pinned'} successfully.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to pin/unpin folder. Please try again.';
      setStatusMessage({ type: 'error', text: message });
    }
  };

  const handleRenameSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!renameModalFolder) {
      return;
    }
    const trimmed = renameFolderName.trim();
    if (!trimmed) {
      return;
    }
    setIsRenamingFolder(true);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      await patchFolder(token, renameModalFolder.id, { name: trimmed });
      setRenameModalFolder(null);
      setRenameFolderName('');
      await refreshWorkspace();
      setStatusMessage({ type: 'success', text: 'Folder renamed successfully.' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to rename folder. Please try again.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsRenamingFolder(false);
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteModalFolder) {
      return;
    }
    setIsDeletingFolder(true);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      await deleteFolder(token, deleteModalFolder.id);
      setDeleteModalFolder(null);
      await refreshWorkspace();
      setStatusMessage({ type: 'success', text: 'Folder deleted successfully.' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete folder. Please try again.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const closeRenameModal = (): void => {
    setRenameModalFolder(null);
    setRenameFolderName('');
  };

  const closeDeleteModal = (): void => {
    setDeleteModalFolder(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (): void => {
      setOpenMenuId(null);
    };
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openMenuId]);

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
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
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
                    {/* View Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'))}
                      className="flex h-[39px] w-[79px] flex-shrink-0 items-center overflow-hidden rounded-[3.58px] border-none p-0 focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                      aria-label={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
                    >
                      {/* List/Hamburger Button */}
                      <div
                        className={`flex h-full w-1/2 items-center justify-center transition-colors ${
                          viewMode === 'list'
                            ? 'bg-[#327AAD]'
                            : 'bg-[rgba(217,217,217,0.3)]'
                        }`}
                      >
                        <svg
                          className={`h-[17.64px] w-[18.13px] ${
                            viewMode === 'list' ? 'text-[#D9D9D9]' : 'text-[#327AAD]'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                      </div>
                      {/* Grid/Box Button */}
                      <div
                        className={`flex h-full w-1/2 items-center justify-center transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-[#327AAD]'
                            : 'bg-[rgba(217,217,217,0.3)]'
                        }`}
                      >
                        <svg
                          className={`h-[16.13px] w-[20.94px] ${
                            viewMode === 'grid' ? 'text-[#D9D9D9]' : 'text-[#327AAD]'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                      </div>
                    </button>
                  </div>
                  {filteredFolders.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center font-nunito text-sm text-[#6B7A96]">
                      No folders found
                    </p>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder.id}
                          className="relative flex flex-col gap-3 rounded-2xl border border-[#E3E7F2] bg-[#F7F9FC] px-4 py-5 shadow-[0_12px_24px_rgba(39,62,99,0.06)]"
                        >
                          {/* Pin indicator in top right */}
                          {folder.is_pinned && (
                            <div className="absolute top-3 right-3">
                              <svg
                                className="h-4 w-4 text-amber-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" />
                              </svg>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#D9E2F5]">
                              <img src={folderIcon} alt="" className="h-8 w-8 object-contain" />
                            </div>
                          </div>
                          <div>
                            <p className="font-nunito text-sm font-semibold text-[#25324B] md:text-base">
                              {folder.name}
                            </p>
                            <p className="font-nunito text-xs text-[#6B7A96]">{folder.id}</p>
                          </div>
                          {/* Three dots button for grid view */}
                          <div className="absolute bottom-3 right-3">
                            <button
                              type="button"
                              onClick={(e) => handleMenuClick(folder.id, e)}
                              className="flex items-center justify-center border-none bg-transparent p-0 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                              aria-label={`More options for ${folder.name}`}
                            >
                              <img src={threeDotIcon} alt="" className="h-6 w-6 object-contain" />
                            </button>
                            {/* Context Menu for grid view - shows Rename, Delete, Pin */}
                            {openMenuId === folder.id && (
                              <div className="absolute right-0 bottom-full mb-2 min-w-[160px] rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameFolder(folder);
                                  }}
                                  className="w-full px-4 py-2 text-left font-nunito text-sm text-[#25324B] hover:bg-gray-50 transition"
                                >
                                  Rename folder
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder(folder);
                                  }}
                                  className="w-full px-4 py-2 text-left font-nunito text-sm text-[#25324B] hover:bg-gray-50 transition"
                                >
                                  Delete folder
                                </button>
                                <button
                                  type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handlePinFolder(folder);
                                }}
                                className="w-full px-4 py-2 text-left font-nunito text-sm text-[#25324B] hover:bg-gray-50 transition"
                              >
                                {folder.is_pinned ? 'Unpin' : 'Pin'}
                              </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder.id}
                          className="flex items-center justify-between gap-4 rounded-[10px] bg-[rgba(50,122,173,0.05)] px-5 py-[10px] transition hover:bg-[rgba(50,122,173,0.08)]"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={folderIcon}
                              alt=""
                              className="h-[32.67px] w-[35.23px] object-contain opacity-40"
                            />
                            <div className="flex flex-col gap-0">
                              <span className="font-nunito text-[20px] font-bold tracking-[-0.025em] text-[#000000] leading-[1.3639999389648438em]">
                                {folder.name}
                              </span>
                              <span className="font-nunito text-[16px] font-medium text-[#545454] leading-[1.3639999628067017em]">
                                {folder.id}
                              </span>
                            </div>
                          </div>
                          <div className="relative flex items-center gap-[10px]">
                            {/* Three dots button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => handleMenuClick(folder.id, e)}
                                className="flex items-center justify-center border-none bg-transparent p-0 transition-opacity hover:opacity-80 focus:outline-none"
                                aria-label={`More options for ${folder.name}`}
                              >
                                <img src={threeDotIcon} alt="" className="h-6 w-6 object-contain" />
                              </button>
                              {/* Context Menu for list view - shows Rename, Pin (no Delete since X button exists) */}
                              {openMenuId === folder.id && (
                                <div className="absolute right-0 top-full mt-2 min-w-[160px] rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRenameFolder(folder);
                                    }}
                                    className="w-full px-4 py-2 text-left font-nunito text-sm text-[#25324B] hover:bg-gray-50 transition"
                                  >
                                    Rename folder
                                  </button>
                                  <button
                                    type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handlePinFolder(folder);
                                }}
                                className="w-full px-4 py-2 text-left font-nunito text-sm text-[#25324B] hover:bg-gray-50 transition"
                              >
                                {folder.is_pinned ? 'Unpin' : 'Pin'}
                              </button>
                                </div>
                              )}
                            </div>
                            {/* X/Delete button */}
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-[#FF0000] transition hover:bg-[rgba(255,0,0,0.1)]"
                              aria-label={`Delete ${folder.name}`}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
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
      {/* Rename Folder Modal */}
      {renameModalFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-sm rounded-[30px] bg-white p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
            <div className="mb-4 flex items-start justify-end">
              <button
                type="button"
                onClick={closeRenameModal}
                className="text-red-500 transition hover:scale-105 disabled:opacity-60"
                aria-label="Close dialog"
                disabled={isRenamingFolder}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h3 className="font-nunito text-2xl font-extrabold text-[#111928]">Rename folder</h3>
            <div className="my-5 border-t border-[#E6E9F2]" />
            <form
              onSubmit={handleRenameSubmit}
              className="space-y-4 text-left"
            >
              <label className="flex flex-col gap-2 font-nunito text-sm font-semibold text-[#25324B]">
                Folder name
                <input
                  type="text"
                  value={renameFolderName}
                  onChange={(event) => setRenameFolderName(event.target.value)}
                  className="rounded-[10px] border border-[#7964A0] px-4 py-3 font-normal text-[#25324B] placeholder:text-[#A3AED0] focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/30"
                  autoFocus
                  disabled={isRenamingFolder}
                  placeholder="Folder Name"
                />
              </label>
              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-[10px] bg-[#327AAD] px-5 py-3 font-nunito text-base font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60"
                disabled={isRenamingFolder || !renameFolderName.trim()}
              >
                {isRenamingFolder ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Folder Modal */}
      {deleteModalFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-start justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-full p-2 transition bg-white text-red-500 hover:bg-red-50"
                aria-label="Close dialog"
                disabled={isDeletingFolder}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <img src={deleteIllustration} alt="Delete folder illustration" className="h-28 w-auto object-contain" />
            </div>
            <h4 className="font-nunito text-2xl font-extrabold text-[#111928]">Confirm Delete?</h4>
            <p className="font-nunito text-sm text-[#5F6B7A] mt-2">
              Are you sure you want to delete "{deleteModalFolder.name}"? This action can't be undone.
            </p>
            <div className="my-4 border-t border-[#DDE1EE]" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-[10px] border border-[#B7C0D6] px-5 py-2 font-nunito text-sm font-semibold text-[#1F2A44] transition hover:bg-[#F7F8FC]"
                disabled={isDeletingFolder}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-[10px] bg-[#327AAD] px-5 py-2 font-nunito text-sm font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60"
                disabled={isDeletingFolder}
              >
                {isDeletingFolder ? 'Deleting...' : 'Yes, delete!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
