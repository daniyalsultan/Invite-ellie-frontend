import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import { useAuth } from '../../context/AuthContext';
import {
  WorkspaceRecord,
  deleteWorkspace,
  listWorkspaces,
  patchWorkspace,
} from './workspaceApi';
import deleteIllustration from '../../assets/delete.png';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

const GRADIENTS = [
  'linear-gradient(135deg, rgba(255,215,210,1) 0%, rgba(221,173,250,1) 100%)',
  'linear-gradient(135deg, rgba(255,206,160,1) 0%, rgba(249,84,110,1) 100%)',
  'linear-gradient(135deg, rgba(134,223,250,1) 0%, rgba(137,142,255,1) 100%)',
  'linear-gradient(135deg, rgba(255,235,170,1) 0%, rgba(241,108,142,1) 60%, rgba(142,103,255,1) 100%)',
  'linear-gradient(135deg, rgba(164,231,192,1) 0%, rgba(93,199,221,1) 100%)',
];

const PAGE_SIZE = 10;

function getInitials(name: string): string {
  if (!name.trim()) {
    return 'WS';
  }
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts.map((part) => part[0]).join('');
  return initials.toUpperCase();
}

function getGradient(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

function formatDate(value: string | null | undefined) {
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

export function WorkspacePage(): JSX.Element {
  const { ensureFreshAccessToken } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // Search functionality - hidden
  const activeSearch = '';
  const [mutatingWorkspaceId, setMutatingWorkspaceId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ type: 'rename' | 'delete'; workspace: WorkspaceRecord } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const modalWorkspaceId = modalState?.workspace.id ?? null;
  const isModalBusy = Boolean(modalWorkspaceId && mutatingWorkspaceId === modalWorkspaceId);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      const response = await listWorkspaces(token, {
        page,
        pageSize: PAGE_SIZE,
        search: activeSearch || undefined,
        ordering: '-created_at',
      });
      setWorkspaces(response.results);
      setTotal(response.count);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load workspaces. Please try again.';
      setError(message);
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSearch, ensureFreshAccessToken, page]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  // Search functionality - hidden
  // const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setPage(1);
  //   setActiveSearch(searchInput.trim());
  // };


  const deleteWorkspaceEntry = async (workspace: WorkspaceRecord) => {
    try {
      setMutatingWorkspaceId(workspace.id);
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      await deleteWorkspace(token, workspace.id);
      setStatusMessage({ type: 'success', text: 'Workspace deleted successfully.' });
      await loadWorkspaces();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete workspace.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setMutatingWorkspaceId(null);
    }
  };

  const renameWorkspaceEntry = async (workspace: WorkspaceRecord, nextName: string) => {
    try {
      setMutatingWorkspaceId(workspace.id);
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate. Please login again.');
      }
      await patchWorkspace(token, workspace.id, { name: nextName });
      setStatusMessage({ type: 'success', text: 'Workspace renamed successfully.' });
      await loadWorkspaces();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to rename workspace.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setMutatingWorkspaceId(null);
    }
  };

  const openRenameModal = (workspace: WorkspaceRecord) => {
    setModalState({ type: 'rename', workspace });
    setRenameValue(workspace.name);
    setModalError(null);
  };

  const openDeleteModal = (workspace: WorkspaceRecord) => {
    setModalState({ type: 'delete', workspace });
    setModalError(null);
  };

  const closeModal = () => {
    setModalState(null);
    setRenameValue('');
    setModalError(null);
  };

  const handleRenameConfirm = async () => {
    if (!modalState || modalState.type !== 'rename') {
      return;
    }
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setModalError('Workspace name is required.');
      return;
    }
    if (trimmed === modalState.workspace.name) {
      setModalError('Please enter a different name.');
      return;
    }
    await renameWorkspaceEntry(modalState.workspace, trimmed);
    closeModal();
  };

  const handleDeleteConfirm = async () => {
    if (!modalState || modalState.type !== 'delete') {
      return;
    }
    await deleteWorkspaceEntry(modalState.workspace);
    closeModal();
  };

  const isEmpty = !isLoading && workspaces.length === 0;

  const paginationSummary = useMemo(() => {
    if (total === 0) {
      return 'Showing 0 results';
    }
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `Showing ${start}-${end} of ${total}`;
  }, [page, total]);

  const modalContent = (() => {
    if (!modalState) {
      return null;
    }
    const { workspace, type } = modalState;
    const isDelete = type === 'delete';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
        <div
          className={`w-full rounded-2xl bg-white p-6 shadow-2xl ${
            isDelete ? 'max-w-sm text-center' : 'max-w-md'
          }`}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className={isDelete ? 'text-left' : ''}>
              <h3 className="font-nunito text-xl font-bold text-[#1F2A44]">
                {type === 'rename' ? 'Rename workspace' : 'Delete workspace'}
              </h3>
              <p className="font-nunito text-sm text-[#6B7A96]">{workspace.name}</p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className={`rounded-full p-2 transition ${
                isDelete
                  ? 'bg-white text-red-500 hover:bg-red-50'
                  : 'bg-gray-100 text-[#6B7A96] hover:bg-gray-200'
              }`}
              aria-label="Close dialog"
              disabled={isModalBusy}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {type === 'rename' ? (
            <div className="space-y-4">
              <label className="flex flex-col gap-2 font-nunito text-sm font-semibold text-[#25324B]">
                New workspace name
                <input
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 font-normal text-[#25324B] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                  disabled={isModalBusy}
                  autoFocus
                />
              </label>
              {modalError && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 font-nunito text-sm text-red-600">
                  {modalError}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-nunito text-sm font-semibold text-[#25324B]"
                  disabled={isModalBusy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRenameConfirm}
                  className="rounded-lg bg-ellieBlue px-5 py-2 font-nunito text-sm font-semibold text-white disabled:opacity-60"
                  disabled={isModalBusy}
                >
                  {isModalBusy ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <img src={deleteIllustration} alt="Delete workspace illustration" className="h-28 w-auto object-contain" />
              </div>
              <h4 className="font-nunito text-2xl font-extrabold text-[#111928]">Confirm Delete?</h4>
              <p className="font-nunito text-sm text-[#5F6B7A]">
                Are you sure you want to delete this? This action can’t be undone.
              </p>
              <div className="my-4 border-t border-[#DDE1EE]" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[10px] border border-[#B7C0D6] px-5 py-2 font-nunito text-sm font-semibold text-[#1F2A44] transition hover:bg-[#F7F8FC]"
                  disabled={isModalBusy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="rounded-[10px] bg-[#327AAD] px-5 py-2 font-nunito text-sm font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60"
                  disabled={isModalBusy}
                >
                  {isModalBusy ? 'Deleting...' : 'Yes, delete!'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  })();

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
              <li className="text-ellieBlue">Workspace</li>
            </ol>
          </nav>

          <div className="mb-4 flex flex-col gap-4 lg:mb-6">
            <div className="flex flex-col">
              <h1 className="font-nunito text-xl font-extrabold text-[#1F2A44] md:text-2xl lg:text-3xl xl:text-4xl">
                Workspace
              </h1>
              <p className="font-nunito text-sm text-[#6B7A96]">{paginationSummary}</p>
            </div>
            {/* Search and create button section - hidden */}
            {/*
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3 lg:flex-1"
              >
                <div className="relative w-full lg:flex-1 lg:max-w-xs">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by workspace name"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-ellieBlue px-4 py-2 font-nunito text-sm font-semibold text-white transition hover:bg-[#185c96]"
                    disabled={isLoading}
                  >
                    Search
                  </button>
                </div>
              </form>
              <Link
                to="/create-workspace"
                className="inline-flex w-full items-center justify-center rounded-[2px] bg-[#1F6FB5] px-3 py-2 font-nunito text-sm font-bold text-white shadow-[0_10px_20px_rgba(31,111,181,0.2)] transition hover:bg-[#185c96] lg:w-auto"
              >
                Create a workspace
              </Link>
            </div>
            */}
          </div>

          {statusMessage && (
            <div
              role="status"
              className={`mb-4 rounded-lg px-4 py-3 font-nunito text-sm ${
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

          <div className="rounded-[12px] bg-white p-4 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] md:rounded-[18px] md:p-6 lg:p-8">
            {error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <p className="font-nunito text-base text-[#E45A5A]">{error}</p>
                <button
                  type="button"
                  onClick={() => loadWorkspaces()}
                  className="rounded-lg bg-ellieBlue px-4 py-2 font-nunito text-sm font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            ) : isLoading && workspaces.length === 0 ? (
              <div className="flex flex-col gap-3 py-12">
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <p className="font-nunito text-lg font-semibold text-[#25324B]">
                  No workspaces yet
                </p>
                <p className="font-nunito text-sm text-[#6B7A96]">
                  Create your first workspace to start organizing your meetings.
                </p>
                <Link
                  to="/create-workspace"
                  className="inline-flex items-center justify-center rounded-lg bg-ellieBlue px-5 py-2 font-nunito text-sm font-semibold text-white"
                >
                  Create workspace
                </Link>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-[#E6E9F2]">
                        <th className="w-[45%] px-4 py-3 text-left font-nunito text-base font-semibold text-[#25324B]">
                          Workspace
                        </th>
                        {/* Workspace type column header - hidden */}
                        {/*
                        <th className="w-[15%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                          Type
                        </th>
                        */}
                        <th className="w-[25%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                          Created
                        </th>
                        <th className="w-[15%] px-2 py-3 text-right font-nunito text-base font-semibold text-[#25324B]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaces.map((workspace) => {
                        const initials = getInitials(workspace.name);
                        const gradient = getGradient(workspace.id);
                        const formatted = formatDate(workspace.created_at);

                        return (
                          <tr
                            key={workspace.id}
                            className="border-b border-[#EEE9FE] transition hover:bg-[#F6F7FB]"
                          >
                            <td className="px-4 py-4">
                              <Link
                                to={`/workspaces/${workspace.id}`}
                                className="flex items-center gap-4 transition-opacity hover:opacity-80"
                              >
                                <div
                                  className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-[0_10px_20px_rgba(39,62,99,0.15)]"
                                  style={{ background: gradient }}
                                >
                                  {initials}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-nunito text-base font-bold text-[#25324B]">
                                    {workspace.name}
                                  </span>
                                  {/* Workspace ID - hidden */}
                                  {/*
                                  <span className="font-nunito text-sm text-[#6B7A96]">
                                    ID: {workspace.id}
                                  </span>
                                  */}
                                </div>
                              </Link>
                            </td>
                            {/* Workspace type column - hidden */}
                            {/*
                            <td className="px-2 py-4 text-right">
                              <span className="inline-flex w-fit max-w-full flex-wrap break-words rounded-full bg-[#E6EDFF] px-3 py-1 text-center font-nunito text-sm font-semibold text-[#1F6FB5]">
                                {getWorkspaceCategoryLabel(workspace.category)}
                              </span>
                            </td>
                            */}
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
                            <td className="px-2 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/workspaces/${workspace.id}`}
                                  className="rounded-lg bg-blue-50 p-2 text-[#1F6FB5] transition-colors hover:bg-blue-100"
                                  aria-label={`View ${workspace.name}`}
                                >
                                  <svg
                                    className="h-5 w-5"
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
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openRenameModal(workspace)}
                                  className="rounded-lg bg-gray-100 p-2 text-[#25324B] transition-colors hover:bg-gray-200"
                                  aria-label={`Rename ${workspace.name}`}
                                  disabled={mutatingWorkspaceId === workspace.id}
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M15.232 5.232l3.536 3.536M4 20h4l11-11-4-4L4 16v4z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(workspace)}
                                  className="rounded-lg bg-red-50 p-2 text-[#E45A5A] transition-colors hover:bg-red-100"
                                  aria-label={`Delete ${workspace.name}`}
                                  disabled={mutatingWorkspaceId === workspace.id}
                                >
                                  <svg
                                    className="h-5 w-5"
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 lg:hidden">
                  {workspaces.map((workspace) => {
                    const initials = getInitials(workspace.name);
                    const gradient = getGradient(workspace.id);
                    const formatted = formatDate(workspace.created_at);

                    return (
                      <div
                        key={`${workspace.id}-mobile`}
                        className="rounded-2xl border border-[#E6E9F2] p-4 shadow-[0_12px_24px_rgba(39,62,99,0.05)]"
                      >
                        <div className="mb-4 flex items-center gap-4">
                          <Link
                            to={`/workspaces/${workspace.id}`}
                            className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-[0_10px_20px_rgba(39,62,99,0.15)] transition-opacity hover:opacity-80"
                            style={{ background: gradient }}
                          >
                            {initials}
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/workspaces/${workspace.id}`}
                                className="transition-opacity hover:opacity-80"
                              >
                                <h2 className="font-nunito text-base font-bold text-[#25324B]">
                                  {workspace.name}
                                </h2>
                                {/* Workspace ID - hidden */}
                                {/*
                                <p className="font-nunito text-xs text-[#6B7A96]">
                                  ID: {workspace.id}
                                </p>
                                */}
                              </Link>
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/workspaces/${workspace.id}`}
                                  className="rounded-lg bg-blue-50 p-2 text-[#1F6FB5] transition-colors hover:bg-blue-100"
                                  aria-label={`View ${workspace.name}`}
                                >
                                  <svg
                                    className="h-4 w-4"
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
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openRenameModal(workspace)}
                                  className="rounded-lg bg-gray-100 p-2 text-[#25324B] transition-colors hover:bg-gray-200"
                                  aria-label={`Rename ${workspace.name}`}
                                  disabled={mutatingWorkspaceId === workspace.id}
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M15.232 5.232l3.536 3.536M4 20h4l11-11-4-4L4 16v4z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(workspace)}
                                  className="rounded-lg bg-red-50 p-2 text-[#E45A5A] transition-colors hover:bg-red-100"
                                  aria-label={`Delete ${workspace.name}`}
                                  disabled={mutatingWorkspaceId === workspace.id}
                                >
                                  <svg
                                    className="h-4 w-4"
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
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Workspace type block - hidden */}
                          {/*
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-nunito text-[11px] font-semibold uppercase tracking-wide text-[#6B7A96]">
                                Type
                              </span>
                              <span className="inline-flex w-fit max-w-full flex-wrap break-words rounded-full bg-[#E6EDFF] px-3 py-1 text-center font-nunito text-sm font-semibold text-[#1F6FB5]">
                                {getWorkspaceCategoryLabel(workspace.category)}
                              </span>
                            </div>
                          */}
                          <div className="flex flex-col gap-1">
                            <span className="font-nunito text-[11px] font-semibold uppercase tracking-wide text-[#6B7A96]">
                              Created
                            </span>
                            <span className="font-nunito text-sm font-semibold text-[#25324B]">
                              {formatted.date}
                            </span>
                            <span className="font-nunito text-xs text-[#6B7A96]">{formatted.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <p className="font-nunito text-xs text-[#6B7A96]">{paginationSummary}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 font-nunito text-sm font-semibold text-[#25324B] disabled:opacity-50"
                      disabled={page === 1 || isLoading}
                    >
                      Previous
                    </button>
                    <span className="font-nunito text-sm text-[#6B7A96]">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 font-nunito text-sm font-semibold text-[#25324B] disabled:opacity-50"
                      disabled={page === totalPages || isLoading}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {modalContent}
    </DashboardLayout>
  );
}
