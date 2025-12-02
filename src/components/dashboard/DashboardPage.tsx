import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import d1Icon from '../../assets/d1.jpg';
import folderIcon from '../../assets/folder.png';
import createFolderIllustration from '../../assets/folder-create.png';
import threeDotIcon from '../../assets/three-dot.png';
import deleteIllustration from '../../assets/delete.png';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import {
  FolderRecord,
  WorkspaceRecord,
  createFolder,
  listFolders,
  listWorkspaces,
  patchFolder,
  deleteFolder,
} from '../workspace/workspaceApi';
import { DemoTour } from '../demo';
import { FolderDetailView } from '../folder/FolderDetailView';

interface ActivityItem {
  type: string;
  link: string;
  date: string;
  time: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    type: 'Meeting Recording',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
    date: 'October 12, 2025',
    time: '05:02 PM',
  },
  {
    type: 'Meeting Recording',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
    date: 'October 12, 2025',
    time: '05:02 PM',
  },
  {
    type: 'Meeting Recording',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
    date: 'October 12, 2025',
    time: '05:02 PM',
  },
];

const CREATE_WORKSPACE_ILLUSTRATION = '/assets/dashboard/create-workspace-illustration.svg';
const JOIN_MEETING_ILLUSTRATION = '/assets/dashboard/join-meeting-illustration.svg';
const WORKSPACE_HELP_ICON = '/assets/dashboard/workspace-help-icon.svg';

export function DashboardPage(): JSX.Element {
  const location = useLocation();
  const { ensureFreshAccessToken } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const apiBaseUrl = getApiBaseUrl();
  
  // Determine first-time tour state based on API flag
  const firstTimeTourOpen = profile?.show_tour === true;
  
  // Get display name for welcome message
  const displayName = useMemo(() => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.email) {
      // Extract name from email (part before @)
      return profile.email.split('@')[0];
    }
    return 'there';
  }, [profile]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(true);
  const [foldersError, setFoldersError] = useState<string | null>(null);
  const [folderSearch, setFolderSearch] = useState('');
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
  const [isWorkspacesLoading, setIsWorkspacesLoading] = useState(true);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderStatusMessage, setFolderStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameModalFolder, setRenameModalFolder] = useState<FolderRecord | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [deleteModalFolder, setDeleteModalFolder] = useState<FolderRecord | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderRecord | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchWorkspaces = async (): Promise<void> => {
      setIsWorkspacesLoading(true);
      setWorkspacesError(null);
      try {
        const token = await ensureFreshAccessToken();
        if (!token) {
          throw new Error('Unable to authenticate. Please login again.');
        }
        const response = await listWorkspaces(token, { pageSize: 50, ordering: 'name' });
        if (isMounted) {
          setWorkspaces(response.results);
          if (!selectedWorkspaceId && response.results.length > 0) {
            setSelectedWorkspaceId(response.results[0].id);
          }
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : 'Unable to load workspaces. Please try again.';
          setWorkspacesError(message);
        }
      } finally {
        if (isMounted) {
          setIsWorkspacesLoading(false);
        }
      }
    };

    void fetchWorkspaces();

    return () => {
      isMounted = false;
    };
  }, [ensureFreshAccessToken]);

  const fetchFolders = useCallback(async (): Promise<void> => {
    if (!selectedWorkspaceId) {
      setFolders([]);
      return;
    }
    setIsFoldersLoading(true);
    setFoldersError(null);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      const response = await listFolders(token, {
        pageSize: 12,
        ordering: '-created_at',
        workspace: selectedWorkspaceId,
      });
      setFolders(response.results);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load folders. Please try again.';
      setFoldersError(message);
    } finally {
      setIsFoldersLoading(false);
    }
  }, [ensureFreshAccessToken, selectedWorkspaceId]);

  useEffect(() => {
    void fetchFolders();
  }, [fetchFolders]);

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null,
    [selectedWorkspaceId, workspaces],
  );

  const filteredFolders = useMemo(() => {
    const query = folderSearch.trim().toLowerCase();
    let sorted = [...folders].sort((a, b) => {
      // Sort pinned folders to the top
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
        folder.name.toLowerCase().includes(query) || folder.id.toLowerCase().includes(query),
    );
  }, [folderSearch, folders]);

  const displayedFolders = filteredFolders.slice(0, 6);

  const closeCreateModal = (): void => {
    setIsCreateModalOpen(false);
    setNewFolderName('');
    setModalError(null);
  };

  const openCreateModal = (): void => {
    if (!selectedWorkspaceId) {
      setFolderStatusMessage({ type: 'error', text: 'Please select a workspace first.' });
      return;
    }
    setFolderStatusMessage(null);
    setModalError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateFolder = async (): Promise<void> => {
    if (!selectedWorkspaceId) {
      setFolderStatusMessage({ type: 'error', text: 'Please select a workspace first.' });
      return;
    }
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      setModalError('Folder name is required.');
      return;
    }

    setFolderStatusMessage(null);
    setIsCreatingFolder(true);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      await createFolder(token, {
        name: trimmed,
        workspace: selectedWorkspaceId,
      });
      setNewFolderName('');
      setFolderStatusMessage({ type: 'success', text: 'Folder created successfully.' });
      setModalError(null);
      closeCreateModal();
      await fetchFolders();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create folder. Please try again.';
      setFolderStatusMessage({ type: 'error', text: message });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleCopyLink = (link: string): void => {
    navigator.clipboard.writeText(link);
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
      await patchFolder(token, folder.id, {
        is_pinned: !folder.is_pinned,
      });
      await fetchFolders();
      setFolderStatusMessage({
        type: 'success',
        text: `Folder ${folder.is_pinned ? 'unpinned' : 'pinned'} successfully.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to pin/unpin folder. Please try again.';
      setFolderStatusMessage({ type: 'error', text: message });
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
      await fetchFolders();
      setFolderStatusMessage({ type: 'success', text: 'Folder renamed successfully.' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to rename folder. Please try again.';
      setFolderStatusMessage({ type: 'error', text: message });
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
      await fetchFolders();
      setFolderStatusMessage({ type: 'success', text: 'Folder deleted successfully.' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete folder. Please try again.';
      setFolderStatusMessage({ type: 'error', text: message });
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
    setSelectedFolder(folder);
    setIsDetailViewOpen(true);
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

  // Demo query handling: /dashboard?demo1, ?demo2 ... or ?demo=1..4
  const { demoOpen, demoStep } = useMemo(() => {
    const search = location.search || '';
    let step: number | null = null;
    // handle ?demo=1..4
    const params = new URLSearchParams(search);
    const paramDemo = params.get('demo');
    if (paramDemo) {
      const n = Number(paramDemo);
      if (!Number.isNaN(n)) step = Math.min(Math.max(n, 1), 4);
    }
    // handle ?demo1 style (no '=' key/value)
    if (step == null) {
      const m = search.match(/[\?&]demo([1-4])\b/i);
      if (m) step = Number(m[1]);
    }
    return {
      demoOpen: step != null,
      demoStep: step != null ? step - 1 : 0, // convert to 0-based
    };
  }, [location.search]);
  return (
    <React.Fragment>
      <DashboardLayout activeTab="/dashboard">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-3 md:mb-4 lg:mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <Link to="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">SUBMENU</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
            Welcome, {displayName}!
          </h1>

          <section className="flex flex-col lg:flex-row gap-6 mb-6 lg:mb-8">
            <article className="flex w-full lg:w-[40%] items-center gap-6 rounded-[10px] bg-white px-8 py-6 shadow-[0px_18px_30px_rgba(15,23,42,0.05)]">
              <img
                src={CREATE_WORKSPACE_ILLUSTRATION}
                alt="Illustration of a person creating a workspace"
                className="h-[77px] w-[109px]"
              />
              <div className="space-y-2">
                <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">
                  Create a Workspace
                </h2>
                <p className="max-w-[280px] font-nunito text-[20px] font-medium leading-[1.36] text-[#545454]">
                  Start with creating a workspace for office, a project or an idea.
                </p>
              </div>
            </article>

            <article className="flex w-full lg:w-[60%] items-center gap-8 rounded-[10px] bg-white px-8 py-6 shadow-[0px_18px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center">
                <img
                  src={JOIN_MEETING_ILLUSTRATION}
                  alt="Illustration of people joining a meeting"
                  className="h-[87px] w-[108px]"
                />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">
                  Join a meeting.
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      id="meeting-id"
                      type="text"
                      placeholder="Enter meeting ID"
                      className="h-[60px] w-full rounded-[5px] border border-[#7964A0] bg-white px-6 font-nunito text-[20px] font-semibold text-[#25324B] placeholder:text-[#25324B]/40 focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-[60px] items-center justify-center rounded-[5px] bg-[#327AAD] px-12 font-nunito text-[20px] font-extrabold text-white transition hover:bg-[#286996]"
                  >
                    Join now
                  </button>
                </div>
              </div>
            </article>
          </section>

          <section className="flex flex-col gap-8 lg:flex-row lg:gap-4">
            <div className="relative flex flex-col gap-6 rounded-[18px] bg-white px-8 py-8 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] lg:w-[55%] overflow-hidden">
              {!isDetailViewOpen && (
                <>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative h-[45px] min-w-[220px] flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                              <img src={d1Icon} alt="" className="h-5 w-5 object-contain" />
                            </span>
                            <select
                              id="workspace-filter"
                              className="h-full w-full appearance-none rounded-[5px] border border-[#7964A0] bg-white pl-10 pr-8 font-nunito text-sm font-semibold text-[#25324B] focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                              value={selectedWorkspaceId ?? ''}
                              onChange={(event) => setSelectedWorkspaceId(event.target.value || null)}
                              disabled={isWorkspacesLoading || !!workspacesError}
                            >
                              {isWorkspacesLoading ? (
                                <option value="">Loading workspaces...</option>
                              ) : workspacesError ? (
                                <option value="">{workspacesError}</option>
                              ) : workspaces.length === 0 ? (
                                <option value="">No workspaces available</option>
                              ) : (
                                workspaces.map((workspace) => (
                                  <option key={workspace.id} value={workspace.id}>
                                    {workspace.name}
                                  </option>
                                ))
                              )}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                              <svg
                                aria-hidden
                                className="h-4 w-4 text-[#327AAD]"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </span>
                          </div>
                          <button
                            type="button"
                            className="flex flex-shrink-0 items-center justify-center"
                            aria-label="Workspace help"
                          >
                            <img src={WORKSPACE_HELP_ICON} alt="Help" className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex flex-1 items-center justify-end">
                          <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex h-[40px] items-center justify-center rounded-[5px] bg-[#327AAD] px-6 font-nunito text-sm font-extrabold text-white transition hover:bg-[#286996] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isWorkspacesLoading || !!workspacesError || workspaces.length === 0}
                          >
                            Create a folder
                          </button>
                        </div>
                      </div>
                      {folderStatusMessage && (
                        <div
                          className={`rounded-[8px] px-3 py-2 font-nunito text-sm ${
                            folderStatusMessage.type === 'success'
                              ? 'border border-green-200 bg-green-50 text-green-700'
                              : 'border border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          {folderStatusMessage.text}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label htmlFor="folder-search" className="font-nunito text-[20px] font-semibold text-[#25324B] whitespace-nowrap">
                        Folder name
                      </label>
                      <div className="flex items-center gap-3 ml-auto">
                        <div className="relative h-[60px] w-full max-w-[300px]">
                          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#327AAD]">
                            <svg
                              aria-hidden
                              className="h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                            </svg>
                          </span>
                          <input
                            id="folder-search"
                            type="text"
                            placeholder="Search by folder name"
                            value={folderSearch}
                            onChange={(event) => setFolderSearch(event.target.value)}
                            className="h-full w-full rounded-[5px] border border-[#7964A0] bg-white pl-14 pr-5 font-nunito text-[20px] font-semibold text-[#25324B] placeholder:text-[#25324B]/40 focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
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
                    </div>
                  </div>

                  {selectedWorkspace && (
                    <p className="text-sm font-nunito text-[#6B7A96]">
                      Showing folders for <span className="font-semibold text-[#25324B]">{selectedWorkspace.name}</span>
                    </p>
                  )}
                </>
              )}
              <div
                className={`transition-transform duration-300 ease-in-out ${
                  isDetailViewOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                }`}
              >
              {viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {isFoldersLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`folder-skeleton-${index}`}
                        className="flex animate-pulse flex-col gap-4 rounded-[12px] bg-[rgba(50,122,173,0.05)] px-6 py-6 text-center"
                      >
                        <div className="mx-auto h-16 w-16 rounded-full bg-white/60" />
                        <div className="space-y-2">
                          <div className="mx-auto h-4 w-24 rounded bg-white/70" />
                          <div className="mx-auto h-3 w-20 rounded bg-white/60" />
                        </div>
                      </div>
                    ))
                  ) : foldersError ? (
                    <div className="col-span-full rounded-[12px] border border-red-100 bg-red-50 px-4 py-6 text-center font-nunito text-sm text-red-600">
                      {foldersError}
                    </div>
                  ) : displayedFolders.length === 0 ? (
                    <div className="col-span-full rounded-[12px] border border-dashed border-[#327AAD]/30 px-4 py-6 text-center font-nunito text-sm text-[#25324B]">
                      No folders found. Try a different search.
                    </div>
                  ) : (
                    displayedFolders.map((folder) => (
                      <div
                        key={folder.id}
                        onClick={() => handleFolderClick(folder)}
                        className="relative flex cursor-pointer flex-col items-center gap-4 rounded-[12px] bg-[rgba(50,122,173,0.05)] px-6 py-6 text-center transition hover:bg-[rgba(50,122,173,0.1)]"
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
                        <img src={folderIcon} alt="" className="h-16 w-16 object-contain" />
                        <div className="space-y-1">
                          <span className="block font-nunito text-[20px] font-bold tracking-[-0.02em] text-[#25324B] leading-[1.36]">
                            {folder.name}
                          </span>
                          <span className="font-nunito text-[16px] text-[#545454]">{folder.id}</span>
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
                    ))
                  )}
                </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {isFoldersLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={`folder-list-skeleton-${index}`}
                            className="flex animate-pulse items-center gap-4 rounded-[10px] bg-[rgba(50,122,173,0.05)] px-5 py-3"
                          >
                            <div className="h-8 w-8 rounded bg-white/60" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-32 rounded bg-white/70" />
                              <div className="h-3 w-24 rounded bg-white/60" />
                            </div>
                          </div>
                        ))
                      ) : foldersError ? (
                        <div className="rounded-[10px] border border-red-100 bg-red-50 px-5 py-4 font-nunito text-sm text-red-600">
                          {foldersError}
                        </div>
                      ) : displayedFolders.length === 0 ? (
                        <div className="rounded-[10px] border border-dashed border-[#327AAD]/30 px-5 py-4 text-center font-nunito text-sm text-[#25324B]">
                          No folders found. Try a different search.
                        </div>
                      ) : (
                        displayedFolders.map((folder) => (
                          <div
                            key={folder.id}
                            onClick={() => handleFolderClick(folder)}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder);
                              }}
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
                    ))
                  )}
                </div>
              )}
              </div>
              
              {/* Folder Detail View */}
              {selectedFolder && (
                <FolderDetailView
                  folder={selectedFolder}
                  onClose={handleCloseDetailView}
                  isOpen={isDetailViewOpen}
                />
              )}
            </div>

            <aside className="flex w-full flex-col gap-6 rounded-[18px] bg-white px-8 py-8 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] lg:w-[45%]">
              <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">Recent Activity</h2>
              <div className="overflow-hidden rounded-[14px]">
                <table className="min-w-full table-fixed text-sm">
                  <thead className="bg-[#F4F8FB]">
                    <tr className="text-left font-nunito text-sm font-semibold tracking-[-0.02em] text-[#25324B]">
                      <th className="px-3 py-2 w-[40%]">Activity Type</th>
                      <th className="px-3 py-2 w-[30%]">Date/Time</th>
                      <th className="px-3 py-2 w-[30%] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-nunito text-[#25324B]">
                    {RECENT_ACTIVITY.map((item, index) => (
                      <tr key={`${item.type}-${index}`} className="border-b border-[rgba(102,0,255,0.2)] last:border-0">
                        <td className="px-3 py-3 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-nunito text-sm font-bold tracking-[-0.02em] text-[#25324B]">
                              {item.type}
                            </span>
                            <div className="flex items-center gap-1">
                              <a
                                href={item.link}
                                className="max-w-[180px] truncate font-nunito text-xs font-semibold tracking-[-0.02em] text-[#0B5CFF] underline decoration-transparent transition hover:decoration-current"
                              >
                                {item.link}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(item.link)}
                                className="flex h-4 w-4 flex-shrink-0 items-center justify-center text-[#0B5CFF]"
                                aria-label="Copy link"
                              >
                                <svg
                                  aria-hidden
                                  className="h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5.00005C7.01165 5.00005 6.49359 5.00005 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.49359 5 7.01165 5 8.00005V16C5 16.9885 5 17.5065 5.21799 17.908C5.40973 18.2843 5.71569 18.5903 6.09202 18.782C6.49359 19 7.01165 19 8 19H16C16.9885 19 17.5065 19 17.908 18.782C18.2843 18.5903 18.5903 18.2843 18.782 17.908C19 17.5065 19 16.9885 19 16V8.00005C19 7.01165 19 6.49359 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5065 5.00005 16.9885 5.00005 16 5.00005H8Z" />
                                  <path d="M8 14.0001H7.8C6.11984 14.0001 5.27976 14.0001 4.63803 13.5641C4.07354 13.1806 3.65338 12.6788 3.41421 12.1213C3 11.3804 3 10.5203 3 8.80005V8.00005C3 6.11441 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H12C13.8856 4 14.8284 4 15.4142 4.58579C16 5.17157 16 6.11441 16 8.00005" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <div className="flex flex-col gap-1 font-nunito text-xs font-medium text-[#545454]">
                            <span className="tracking-[-0.02em] text-[#25324B]">{item.date}</span>
                            <span>{item.time}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F0FA] text-[#327AAD]"
                              aria-label="View"
                            >
                              <svg
                                aria-hidden
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFEAEA] text-[#E45A5A]"
                              aria-label="Remove"
                            >
                              <svg
                                aria-hidden
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </aside>
          </section>
        </div>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-sm rounded-[30px] bg-white p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
            <div className="mb-4 flex items-start justify-end">
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-red-500 transition hover:scale-105 disabled:opacity-60"
                aria-label="Close dialog"
                disabled={isCreatingFolder}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={createFolderIllustration}
              alt="Folder illustration"
              className="mx-auto mb-4 h-28 w-auto object-contain"
            />
            <h3 className="font-nunito text-2xl font-extrabold text-[#111928]">Create a folder</h3>
            <p className="mt-2 font-nunito text-sm text-[#5F6B7A]">
              Give your folder a name so you can easily organize your files and meetings.
            </p>
            <div className="my-5 border-t border-[#E6E9F2]" />
            {selectedWorkspace && (
              <p className="mb-3 font-nunito text-xs font-semibold uppercase tracking-wide text-[#6B7A96]">
                Workspace: <span className="text-[#1F2A44]">{selectedWorkspace.name}</span>
              </p>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateFolder();
              }}
              className="space-y-4 text-left"
            >
              <label className="flex flex-col gap-2 font-nunito text-sm font-semibold text-[#25324B]">
                Folder name
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  className="rounded-[10px] border border-[#A3AED0] px-4 py-3 font-normal text-[#25324B] placeholder:text-[#A3AED0] focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/30"
                  autoFocus
                  disabled={isCreatingFolder}
                  placeholder="Folder Name"
                />
              </label>
              {modalError && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 font-nunito text-sm text-red-600">
                  {modalError}
                </p>
              )}
              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center rounded-[10px] bg-[#327AAD] px-5 py-3 font-nunito text-base font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60"
                disabled={isCreatingFolder}
              >
                {isCreatingFolder ? 'Creating...' : 'Create folder'}
              </button>
            </form>
          </div>
        </div>
      )}
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
      <DemoTour
        defaultOpen={demoOpen || firstTimeTourOpen}
        initialStep={demoStep}
        onClose={async () => {
          // Update show_tour flag to false when tour is closed
          if (apiBaseUrl && profile?.show_tour === true) {
            try {
              const token = await ensureFreshAccessToken();
              if (token) {
                const formData = new FormData();
                formData.append('show_tour', 'false');
                await fetch(`${apiBaseUrl}/accounts/me/`, {
                  method: 'PATCH',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: formData,
                });
                await refreshProfile();
              }
            } catch {
              // Ignore errors - tour will still close
            }
          }
        }}
      />
      </DashboardLayout>
    </React.Fragment>
  );
}


