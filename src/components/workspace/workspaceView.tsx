import {
  // FormEvent, // Hidden - workspace edit form
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, /* useNavigate, */ useParams } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import searchIcon from '../../assets/Vector.png';
import folderIcon from '../../assets/folder.png';
import threeDotIcon from '../../assets/three-dot.png';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import {
  // WORKSPACE_CATEGORY_OPTIONS, // Hidden - workspace edit form
  // WorkspaceCategory, // Hidden - workspace edit form
  WorkspaceRecord,
  // deleteWorkspace, // Hidden - delete workspace button
  getWorkspace,
  listFolders,
  getFolder,
  // getWorkspaceCategoryLabel, // Hidden - workspace edit form
  // updateWorkspace, // Hidden - workspace edit form
  MeetingRecord,
  MeetingStatus,
  FolderRecord,
  patchFolder,
  deleteFolder,
} from './workspaceApi';
import {
  getTranscriptions,
  getTranscription,
  getFolderWorkspaceInsights,
  normalizeStringArray,
  type Transcription,
  type ActionItem,
  type WorkspaceFolderInsightsResponse,
} from '../../services/transcriptionApi';
import deleteIllustration from '../../assets/delete.png';
import { FolderDetailView } from '../folder/FolderDetailView';
import { FolderMeetingsModal } from '../folder/FolderMeetingsModal';
import { MeetingInsightsPanel } from '../meeting/MeetingInsightsPanel';
type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

type MeetingWithFolder = MeetingRecord & {
  folderName: string;
  key_outcomes_signals?: string[];
  meeting_gaps?: string[];
  open_questions?: string[];
  /** Structured action items for execution clarity (Recall / Groq) */
  action_items_detail?: ActionItem[] | null;
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

function sortMeetings(meetings: MeetingWithFolder[]): MeetingWithFolder[] {
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

export function WorkspaceViewPage(): JSX.Element {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  // const navigate = useNavigate(); // Hidden - delete workspace button is hidden
  const { ensureFreshAccessToken } = useAuth();
  const { profile } = useProfile();

  const [workspace, setWorkspace] = useState<WorkspaceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  // Workspace edit form state - hidden
  // const [editName, setEditName] = useState('');
  // const [editCategory, setEditCategory] = useState<WorkspaceCategory>('PROJECT');
  // const [isSaving, setIsSaving] = useState(false);
  // const [isDeleting, setIsDeleting] = useState(false); // Hidden - delete workspace button is hidden
  const [folderSearch, setFolderSearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameModalFolder, setRenameModalFolder] = useState<FolderRecord | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [deleteModalFolder, setDeleteModalFolder] = useState<FolderRecord | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  // const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] = useState(false); // Hidden - delete workspace button is hidden
  const [selectedFolder, setSelectedFolder] = useState<FolderRecord | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isFolderMeetingsModalOpen, setIsFolderMeetingsModalOpen] = useState(false);
  const [selectedFolderForModal, setSelectedFolderForModal] = useState<FolderRecord | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [workspaceInsights, setWorkspaceInsights] = useState<WorkspaceFolderInsightsResponse | null>(null);
  const [workspaceInsightsLoading, setWorkspaceInsightsLoading] = useState(false);
  const [workspaceInsightsError, setWorkspaceInsightsError] = useState<string | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedMeetingForModal, setSelectedMeetingForModal] = useState<MeetingWithFolder | null>(null);
  const [fullModalTranscription, setFullModalTranscription] = useState<Transcription | null>(null);
  const [modalTranscriptContent, setModalTranscriptContent] = useState<any>(null);
  const [loadingModalTranscript, setLoadingModalTranscript] = useState(false);
  const [modalTranscriptionSearch, setModalTranscriptionSearch] = useState('');

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
      // Fetch workspace data
      const data = await getWorkspace(token, workspaceId);
      
      // Fetch folders for this workspace
      const foldersResponse = await listFolders(token, {
        workspace: workspaceId,
        pageSize: 1000, // Get all folders
      });
      
      // Fetch each folder individually to ensure meetings are included
      // Some APIs only return meetings when fetching individual folders
      const foldersWithMeetings = await Promise.all(
        foldersResponse.results.map(async (folder) => {
          try {
            // Try to get folder with meetings
            const folderWithMeetings = await getFolder(token, folder.id);
            return folderWithMeetings;
          } catch {
            // If individual fetch fails, return the folder from list
            return folder;
          }
        })
      );
      
      // Update workspace with folders that include meetings
      const workspaceWithFolders = {
        ...data,
        folders: foldersWithMeetings,
      };
      
      setWorkspace(workspaceWithFolders);
      // Workspace edit form state - hidden
      // setEditName(data.name);
      // setEditCategory(data.category ?? 'PROJECT');
      const firstMeeting =
        foldersWithMeetings.flatMap((folder) => folder.meetings ?? []).find(Boolean)?.id ?? null;
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

  // Fetch transcriptions (meetings) for this workspace
  useEffect(() => {
    if (!profile?.id || !workspaceId || !folders.length) {
      setTranscriptions([]);
      return;
    }

    const fetchTranscriptions = async () => {
      try {
        const allTranscriptions = await getTranscriptions(profile.id || '');
        
        // Get folder IDs for this workspace
        const folderIds = folders.map((folder) => folder.id);
        
        // Filter transcriptions that belong to folders in this workspace
        // Check both folder_id and workspace_id to match
        const workspaceTranscriptions = allTranscriptions.filter((t: Transcription) => {
          return (
            (t.folder_id && folderIds.includes(t.folder_id)) ||
            (t.workspace_id === workspaceId)
          );
        });
        
        setTranscriptions(workspaceTranscriptions);
      } catch (err) {
        console.error('Error fetching transcriptions:', err);
        setTranscriptions([]);
      }
    };

    void fetchTranscriptions();
  }, [profile?.id, workspaceId, folders]);

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

  // Create a map of folder_id to folder name for quick lookup
  const folderNameMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((folder) => {
      map.set(folder.id, folder.name);
    });
    return map;
  }, [folders]);

  const allMeetings = useMemo(() => {
    // Convert transcriptions to MeetingRecord format with folder names
    const meetings: MeetingWithFolder[] = transcriptions.map((transcription) => {
      const folderName = transcription.folder_id
        ? folderNameMap.get(transcription.folder_id) || 'Unassigned'
        : 'Unassigned';
      
      // Map transcription status to MeetingStatus
      const mapStatus = (status: string | null | undefined): MeetingStatus => {
        if (!status) return 'PENDING';
        const upperStatus = status.toUpperCase();
        // Map common status values
        if (upperStatus === 'COMPLETE' || upperStatus === 'DONE') return 'COMPLETED';
        if (upperStatus === 'TRANSCRIBE' || upperStatus === 'TRANSCRIBING') return 'TRANSCRIBING';
        if (upperStatus === 'SUMMARIZE' || upperStatus === 'SUMMARIZING') return 'SUMMARIZING';
        if (upperStatus === 'ERROR' || upperStatus === 'FAIL') return 'FAILED';
        // Check if it's a valid MeetingStatus
        if (['PENDING', 'TRANSCRIBING', 'SUMMARIZING', 'COMPLETED', 'FAILED'].includes(upperStatus)) {
          return upperStatus as MeetingStatus;
        }
        return 'PENDING';
      };
      
      // Map transcription to MeetingRecord format
      const meeting: MeetingWithFolder = {
        id: transcription.id,
        folder: transcription.folder_id || '',
        title: transcription.meeting_title || 'Untitled Meeting',
        platform: transcription.platform || transcription.calendar_platform || 'Unknown',
        duration: transcription.duration ? String(transcription.duration) : null,
        paticipants: null, // Not available in transcription
        status: mapStatus(transcription.status),
        audio_url: transcription.meeting_url,
        transcript: transcription.transcript_text,
        summary: transcription.summary,
        highlights: null,
        action_items: transcription.action_items?.map((item) => 
          typeof item === 'string' ? item : item.text
        ) || null,
        action_items_detail: transcription.action_items ?? null,
        key_outcomes_signals: normalizeStringArray(transcription.key_outcomes_signals),
        meeting_gaps: normalizeStringArray(transcription.meeting_gaps),
        open_questions: normalizeStringArray(transcription.open_questions),
        held_at: transcription.start_time,
        created_at: transcription.created_at || undefined,
        updated_at: transcription.updated_at || transcription.created_at || new Date().toISOString(),
        folderName: folderName,
      };
      return meeting;
    });
    return sortMeetings(meetings);
  }, [transcriptions, folderNameMap]);

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
    const byFolder = activeFolderId
      ? allMeetings.filter((meeting) => meeting.folder === activeFolderId)
      : allMeetings;
    if (!query) {
      return byFolder;
    }
    return byFolder.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.folderName.toLowerCase().includes(query) ||
        meeting.status.toLowerCase().includes(query) ||
        (meeting.summary ?? '').toLowerCase().includes(query),
    );
  }, [allMeetings, meetingSearch, activeFolderId]);

  useEffect(() => {
    if (!activeFolderId && filteredFolders.length > 0) {
      setActiveFolderId(filteredFolders[0].id);
    }
  }, [activeFolderId, filteredFolders]);

  useEffect(() => {
    if (!activeFolderId || !profile?.id) {
      setWorkspaceInsights(null);
      setWorkspaceInsightsLoading(false);
      setWorkspaceInsightsError(null);
      return;
    }
    let cancelled = false;
    setWorkspaceInsightsLoading(true);
    setWorkspaceInsightsError(null);
    void getFolderWorkspaceInsights(activeFolderId, profile.id)
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
    return () => {
      cancelled = true;
    };
  }, [activeFolderId, profile?.id]);

  useEffect(() => {
    if (!isMeetingModalOpen || !selectedMeetingForModal?.id || !profile?.id) {
      return;
    }
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
    return () => {
      cancelled = true;
    };
  }, [isMeetingModalOpen, selectedMeetingForModal?.id, profile?.id]);

  const activeFolder = useMemo(
    () => (activeFolderId ? folders.find((f) => f.id === activeFolderId) ?? null : null),
    [activeFolderId, folders],
  );

  const folderMeetingsForOverview = useMemo(
    () => (activeFolderId ? allMeetings.filter((m) => m.folder === activeFolderId) : []),
    [allMeetings, activeFolderId],
  );

  const folderOverviewStats = useMemo(() => {
    const withSummary = folderMeetingsForOverview.filter((m) => (m.summary || '').trim().length > 0).length;
    const totalActions = folderMeetingsForOverview.reduce(
      (acc, m) => acc + (m.action_items?.length ?? 0),
      0,
    );
    return { withSummary, totalActions, total: folderMeetingsForOverview.length };
  }, [folderMeetingsForOverview]);

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

  // Workspace edit form handlers - hidden
  // const handleUpdateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   if (!workspaceId) {
  //     return;
  //   }
  //   if (!editName.trim()) {
  //     setStatusMessage({ type: 'error', text: 'Workspace name cannot be empty.' });
  //     return;
  //   }
  //   setIsSaving(true);
  //   setStatusMessage(null);
  //   try {
  //     const token = await ensureFreshAccessToken();
  //     if (!token) {
  //       throw new Error('Unable to authenticate. Please login again.');
  //     }
  //     const updated = await updateWorkspace(token, workspaceId, {
  //       name: editName.trim(),
  //       category: editCategory,
  //     });
  //     setWorkspace(updated);
  //     setStatusMessage({ type: 'success', text: 'Workspace updated successfully.' });
  //   } catch (err) {
  //     const message =
  //       err instanceof Error ? err.message : 'Unable to update workspace. Please try again.';
  //     setStatusMessage({ type: 'error', text: message });
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // const handleDeleteWorkspace = () => {
  //   setShowDeleteWorkspaceModal(true);
  // };

  // Delete workspace handler - hidden (button is hidden)
  // const handleDeleteWorkspaceConfirm = async () => {
  //   if (!workspaceId || !workspace) {
  //     return;
  //   }
  //   setIsDeleting(true);
  //   try {
  //     const token = await ensureFreshAccessToken();
  //     if (!token) {
  //       throw new Error('Unable to authenticate. Please login again.');
  //     }
  //     await deleteWorkspace(token, workspaceId);
  //     navigate('/workspaces', { replace: true });
  //   } catch (err) {
  //     const message =
  //       err instanceof Error ? err.message : 'Unable to delete workspace. Please try again.';
  //     setStatusMessage({ type: 'error', text: message });
  //     setShowDeleteWorkspaceModal(false);
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  // const closeDeleteWorkspaceModal = () => {
  //   setShowDeleteWorkspaceModal(false);
  // };

  // const handleResetForm = () => {
  //   if (!workspace) {
  //     return;
  //   }
  //   setEditName(workspace.name);
  //   setEditCategory(workspace.category ?? 'PROJECT');
  // };

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
      await patchFolder(token, folder.id, {
        is_pinned: !folder.is_pinned,
      });
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

  const handleFolderClick = (folder: FolderRecord): void => {
    setActiveFolderId(folder.id);
  };

  const handleFolderDoubleClick = (folder: FolderRecord): void => {
    setSelectedFolder(folder);
    setIsDetailViewOpen(true);
  };

  const handleMeetingClick = (meeting: MeetingWithFolder): void => {
    setSelectedMeetingId(meeting.id);
    setSelectedMeetingForModal(meeting);
    setModalTranscriptionSearch('');
    setIsMeetingModalOpen(true);
  };

  const handleCloseDetailView = (): void => {
    setIsDetailViewOpen(false);
    // Small delay to allow animation to complete before clearing selected folder
    setTimeout(() => {
      setSelectedFolder(null);
    }, 300);
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
                  Workspace
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
              {/* Workspace edit section - hidden */}
              {/*
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
              */}

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
                <div className="relative space-y-4 overflow-hidden lg:pr-3">
                  {!isDetailViewOpen && (
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
                  )}
                  {filteredFolders.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center font-nunito text-sm text-[#6B7A96]">
                      No folders found
                    </p>
                  ) : (
              <div
                className={`transition-transform duration-300 ease-in-out ${
                  isDetailViewOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                }`}
              >
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {filteredFolders.map((folder) => (
                        <div
                          key={folder.id}
                          onClick={() => handleFolderClick(folder)}
                          onDoubleClick={() => handleFolderDoubleClick(folder)}
                          className="relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-[#E3E7F2] bg-[#F7F9FC] px-4 py-5 shadow-[0_12px_24px_rgba(39,62,99,0.06)] transition hover:bg-[#E6EDFF]"
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
                          </div>
                          {/* Three dots button for grid view */}
                          <div className="absolute bottom-3 right-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuClick(folder.id, e);
                              }}
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
                          onClick={() => handleFolderClick(folder)}
                          onDoubleClick={() => handleFolderDoubleClick(folder)}
                          className="relative flex cursor-pointer items-center justify-between gap-4 rounded-[10px] bg-[rgba(50,122,173,0.05)] px-5 py-[10px] transition hover:bg-[rgba(50,122,173,0.08)]"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={folderIcon}
                              alt=""
                              className="h-[32.67px] w-[35.23px] object-contain opacity-40"
                            />
                            <div className="flex flex-col gap-0">
                              <div className="flex items-center gap-2">
                                <span className="font-nunito text-[20px] font-bold tracking-[-0.025em] text-[#000000] leading-[1.3639999389648438em]">
                                  {folder.name}
                                </span>
                                {/* Pin indicator */}
                                {folder.is_pinned && (
                                  <svg
                                    className="h-4 w-4 text-amber-600 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="relative flex items-center gap-[10px]">
                            {/* Three dots button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuClick(folder.id, e);
                                }}
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
                  )}
                  
                  {/* Folder Detail View */}
                  {selectedFolder && (
                    <FolderDetailView
                      folder={selectedFolder}
                      onClose={handleCloseDetailView}
                      isOpen={isDetailViewOpen}
                    />
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
                              <th className="w-[35%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                                Folder
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
                    <div className="mb-4">
                      <h3 className="font-nunito text-xl font-bold text-[#25324B]">Folder status &amp; actions</h3>
                      <p className="font-nunito text-sm text-[#6B7A96] mt-1">
                        Status, gaps, and follow-ups across{' '}
                        <span className="font-semibold text-[#4B5674]">{activeFolder?.name ?? 'selected folder'}</span>.
                      </p>
                      {folderOverviewStats.total > 0 && (
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
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">Status</h4>
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          {workspaceInsightsLoading ? (
                            <p className="font-nunito text-sm text-[#6B7A96]">Loading folder insights…</p>
                          ) : workspaceInsights ? (
                            <>
                              <p className="font-nunito text-sm font-semibold text-[#25324B]">
                                {workspaceInsights.status_label}
                              </p>
                              {workspaceInsights.reasons.length > 0 ? (
                                <ul className="mt-3 space-y-2">
                                  {workspaceInsights.reasons.slice(0, 3).map((line, idx) => (
                                    <li
                                      key={idx}
                                      className="font-nunito text-sm text-[#4B5674] flex gap-2 leading-snug"
                                    >
                                      <span className="text-[#327AAD] font-bold shrink-0">•</span>
                                      <span>{line}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="font-nunito text-sm text-[#6B7A96] mt-2">No blockers flagged for this folder.</p>
                              )}
                            </>
                          ) : (
                            <p className="font-nunito text-sm text-[#94A3C1] italic">
                              Select a folder with meetings to see status.
                            </p>
                          )}
                          {workspaceInsightsError && !workspaceInsightsLoading ? (
                            <p className="font-nunito text-xs text-amber-800 mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              Could not load folder insights ({workspaceInsightsError}).
                            </p>
                          ) : null}
                        </article>
                      </section>

                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                          Gaps across meetings
                        </h4>
                        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                          {!workspaceInsights || workspaceInsightsLoading ? (
                            <p className="font-nunito text-sm text-[#6B7A96]">—</p>
                          ) : workspaceInsights.gaps_across_meetings.length === 0 ? (
                            <p className="font-nunito text-sm text-[#94A3C1] italic">No aggregated gaps for this folder.</p>
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

                      <section>
                        <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
                          Action items (aggregated)
                        </h4>
                        {!workspaceInsights || workspaceInsightsLoading ? (
                          <p className="font-nunito text-sm text-[#6B7A96] rounded-2xl border border-gray-200 bg-white p-5">Loading…</p>
                        ) : workspaceInsights.action_items.length === 0 ? (
                          <p className="font-nunito text-sm text-[#94A3C1] italic rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
                            No action items extracted yet.
                          </p>
                        ) : (
                          <ul className="max-h-96 space-y-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4">
                            {workspaceInsights.action_items.map((row, idx) => (
                              <li
                                key={`${row.meeting_id}-${idx}`}
                                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                              >
                                <p className="font-nunito text-sm font-medium text-[#25324B]">{row.text}</p>
                                <p className="font-nunito text-xs text-[#6B7A96] mt-1">
                                  Owner: {row.owner_display} · Deadline: {row.deadline_display}
                                </p>
                                <p className="font-nunito text-xs text-[#94A3C1] mt-0.5">From: {row.meeting_title}</p>
                                {row.flags.length > 0 ? (
                                  <div className="mt-2 space-y-0.5 font-nunito text-xs text-[#4B5674]">
                                    {row.flags.map((f) => (
                                      <p key={f}>{workspaceInsightFlagLine(f, row.blocked_by)}</p>
                                    ))}
                                  </div>
                                ) : null}
                              </li>
                            ))}
                          </ul>
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
                {/*
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
                    </div>
                  </div>
                */}
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
      {/* Delete Workspace Modal - hidden */}
      {/*
      {showDeleteWorkspaceModal && workspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-start justify-end">
              <button
                type="button"
                onClick={closeDeleteWorkspaceModal}
                className="rounded-full p-2 transition bg-white text-red-500 hover:bg-red-50"
                aria-label="Close dialog"
                disabled={isDeleting}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <img src={deleteIllustration} alt="Delete workspace illustration" className="h-28 w-auto object-contain" />
            </div>
            <h4 className="font-nunito text-2xl font-extrabold text-[#111928]">Confirm Delete?</h4>
            <p className="font-nunito text-sm text-[#5F6B7A] mt-2">
              Are you sure you want to delete "{workspace.name}"? All folders and meetings will be removed. This action can't be undone.
            </p>
            <div className="my-4 border-t border-[#DDE1EE]" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <button
                type="button"
                onClick={closeDeleteWorkspaceModal}
                className="rounded-[10px] border border-[#B7C0D6] px-5 py-2 font-nunito text-sm font-semibold text-[#1F2A44] transition hover:bg-[#F7F8FC]"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorkspaceConfirm}
                className="rounded-[10px] bg-[#327AAD] px-5 py-2 font-nunito text-sm font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete!'}
              </button>
            </div>
          </div>
        </div>
      )}
      */}
      
      {/* Folder Meetings Modal */}
      {selectedFolderForModal && (
        <FolderMeetingsModal
          folderId={selectedFolderForModal.id}
          folderName={selectedFolderForModal.name}
          isOpen={isFolderMeetingsModalOpen}
          onClose={() => {
            setIsFolderMeetingsModalOpen(false);
            setTimeout(() => setSelectedFolderForModal(null), 300);
          }}
        />
      )}

      {isMeetingModalOpen && selectedMeetingForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="font-nunito text-xl font-bold text-[#25324B]">
                  {selectedMeetingForModal.title}
                </h3>
                <p className="font-nunito text-sm text-[#6B7A96]">
                  {selectedMeetingForModal.folderName} •{' '}
                  {formatDateTime(selectedMeetingForModal.held_at ?? selectedMeetingForModal.updated_at).date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(false)}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
                aria-label="Close meeting details"
              >
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
              <div className="min-h-0 flex-1 overflow-y-auto border-b border-gray-200 p-4 lg:border-b-0 lg:border-r lg:p-6">
                <MeetingInsightsPanel
                  transcription={(fullModalTranscription as Transcription | null) ?? (selectedMeetingForModal as unknown as Transcription)}
                  loading={loadingModalTranscript}
                  compact
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
    </DashboardLayout>
  );
}
