import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getTranscriptions, type Transcription } from '../../services/transcriptionApi';
import { listFolders, createFolder, type FolderRecord, listWorkspaces } from '../workspace/workspaceApi';
import { getUserWorkspaceByEmail, extractEmailDomain, getWorkspaceNameFromDomain } from '../../utils/workspaceAutoCreate';
import searchIcon from '../../assets/Vector.png';

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

interface WorkspaceInfo {
  id: string;
  name: string;
}

export function UnresolvedMeetingsPage(): JSX.Element {
  const { profile } = useProfile();
  const { ensureFreshAccessToken } = useAuth();
  
  const [unresolvedMeetings, setUnresolvedMeetings] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Transcription | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<any>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptionSearchQuery, setTranscriptionSearchQuery] = useState('');
  
  // Folder assignment state
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAssigningFolder, setIsAssigningFolder] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolderForm, setShowCreateFolderForm] = useState(false);

  // Fetch unresolved meetings (folder_id is null)
  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    const fetchUnresolvedMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        const allTranscriptions = await getTranscriptions(profile.id || '');
        
        // Filter for unresolved meetings (folder_id is null or undefined)
        const unresolved = allTranscriptions.filter((t: any) => {
          const folderId = t.folder_id || t.folderId || (t as any).folder?.id;
          return !folderId; // Unresolved if no folder_id
        });
        
        setUnresolvedMeetings(unresolved);
        
        // Auto-select first meeting if available
        if (unresolved.length > 0 && !selectedMeeting) {
          setSelectedMeeting(unresolved[0]);
        }
      } catch (err) {
        console.error('Error fetching unresolved meetings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load unresolved meetings');
      } finally {
        setLoading(false);
      }
    };

    void fetchUnresolvedMeetings();
  }, [profile?.id]);

  // Fetch all workspaces and folders when component mounts
  useEffect(() => {
    const fetchWorkspacesAndFolders = async () => {
      if (!profile?.id || !profile?.email) return;
      
      try {
        const token = await ensureFreshAccessToken();
        if (!token) return;

        // Fetch all user workspaces (not just one)
        const workspacesResponse = await listWorkspaces(token, {
          page: 1,
          pageSize: 100,
          ordering: '-created_at',
        });
        setWorkspaces(workspacesResponse.results.map(w => ({ id: w.id, name: w.name })));

        // Get user's primary workspace (based on email) for default selection
        const userWorkspace = await getUserWorkspaceByEmail(token, profile.email);
        if (userWorkspace) {
          setSelectedWorkspaceId(userWorkspace.id);
          
          // Fetch folders for this workspace
          const foldersResponse = await listFolders(token, {
            workspace: userWorkspace.id,
            pageSize: 100,
            ordering: '-created_at',
          });
          setFolders(foldersResponse.results);
        } else if (workspacesResponse.results.length > 0) {
          // Fallback to first workspace if user workspace not found
          const firstWorkspace = workspacesResponse.results[0];
          setSelectedWorkspaceId(firstWorkspace.id);
          
          const foldersResponse = await listFolders(token, {
            workspace: firstWorkspace.id,
            pageSize: 100,
            ordering: '-created_at',
          });
          setFolders(foldersResponse.results);
        }
      } catch (err) {
        console.error('Error fetching workspaces/folders:', err);
      }
    };

    void fetchWorkspacesAndFolders();
  }, [profile?.id, profile?.email, ensureFreshAccessToken]);

  // Auto-set workspace when meeting is selected (for old meetings without workspace_id)
  useEffect(() => {
    if (!selectedMeeting || workspaces.length === 0) return;
    
    const workspaceId = getWorkspaceIdForMeeting(selectedMeeting);
    if (workspaceId && workspaceId !== selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaceId);
      
      // Also fetch folders for this workspace
      const fetchFoldersForWorkspace = async () => {
        try {
          const token = await ensureFreshAccessToken();
          if (!token) return;
          
          const foldersResponse = await listFolders(token, {
            workspace: workspaceId,
            pageSize: 100,
            ordering: '-created_at',
          });
          setFolders(foldersResponse.results);
        } catch (err) {
          console.error('Error fetching folders for workspace:', err);
        }
      };
      
      void fetchFoldersForWorkspace();
    }
  }, [selectedMeeting, workspaces, selectedWorkspaceId, ensureFreshAccessToken]);

  // Load transcript content when meeting is selected
  useEffect(() => {
    if (!selectedMeeting || !profile?.id) {
      setTranscriptContent(null);
      return;
    }

    const fetchTranscript = async () => {
      try {
        setLoadingTranscript(true);
        const token = await ensureFreshAccessToken();
        if (!token) {
          throw new Error('Unable to authenticate');
        }

        const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${selectedMeeting.id}?userId=${profile.id}`);
        if (!recallaiUrl) {
          throw new Error('Recall server URL is not configured');
        }

        const response = await fetch(recallaiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transcript');
        }

        const data = await response.json();
        setTranscriptContent(data);
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setTranscriptContent(null);
      } finally {
        setLoadingTranscript(false);
      }
    };

    void fetchTranscript();
  }, [selectedMeeting, profile?.id, ensureFreshAccessToken]);

  // Filter meetings based on search
  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return unresolvedMeetings;
    const query = searchQuery.toLowerCase();
    return unresolvedMeetings.filter(
      (m) =>
        m.meeting_title?.toLowerCase().includes(query) ||
        m.meeting_url?.toLowerCase().includes(query) ||
        m.bot_id?.toLowerCase().includes(query)
    );
  }, [unresolvedMeetings, searchQuery]);

  // Filter transcript segments based on search
  const filteredTranscriptSegments = useMemo(() => {
    if (!transcriptContent || !transcriptionSearchQuery.trim()) {
      return transcriptContent?.transcript_data?.utterances || [];
    }
    const query = transcriptionSearchQuery.toLowerCase();
    const utterances = transcriptContent.transcript_data?.utterances || [];
    return utterances.filter(
      (u: any) =>
        u.speaker?.toLowerCase().includes(query) ||
        u.text?.toLowerCase().includes(query)
    );
  }, [transcriptContent, transcriptionSearchQuery]);

  // Get workspace name for a meeting (with fallback for old meetings without workspace_id)
  const getWorkspaceName = (meeting: Transcription): string => {
    // First, check if meeting has workspace_id
    const workspaceId = (meeting as any).workspace_id || (meeting as any).workspaceId;
    if (workspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        return workspace.name;
      }
    }
    
    // If no workspace_id, try to determine workspace from calendar_email
    const calendarEmail = (meeting as any).calendar_email || (meeting as any).calendarEmail;
    if (calendarEmail) {
      const domain = extractEmailDomain(calendarEmail);
      if (domain) {
        const expectedWorkspaceName = getWorkspaceNameFromDomain(domain);
        // Try to find matching workspace
        const matchingWorkspace = workspaces.find(
          w => w.name.toLowerCase() === expectedWorkspaceName.toLowerCase()
        );
        if (matchingWorkspace) {
          return matchingWorkspace.name;
        }
        // If workspace doesn't exist yet, return the expected name
        return expectedWorkspaceName;
      }
    }
    
    // Fallback to user's email domain
    if (profile?.email) {
      const domain = extractEmailDomain(profile.email);
      if (domain) {
        const expectedWorkspaceName = getWorkspaceNameFromDomain(domain);
        const matchingWorkspace = workspaces.find(
          w => w.name.toLowerCase() === expectedWorkspaceName.toLowerCase()
        );
        if (matchingWorkspace) {
          return matchingWorkspace.name;
        }
        return expectedWorkspaceName;
      }
    }
    
    return 'Unknown Workspace';
  };

  // Get workspace ID for a meeting (with fallback for old meetings)
  const getWorkspaceIdForMeeting = (meeting: Transcription): string | null => {
    // First, check if meeting has workspace_id
    const workspaceId = (meeting as any).workspace_id || (meeting as any).workspaceId;
    if (workspaceId) {
      return workspaceId;
    }
    
    // If no workspace_id, try to determine workspace from calendar_email
    const calendarEmail = (meeting as any).calendar_email || (meeting as any).calendarEmail;
    if (calendarEmail) {
      const domain = extractEmailDomain(calendarEmail);
      if (domain) {
        const expectedWorkspaceName = getWorkspaceNameFromDomain(domain);
        const matchingWorkspace = workspaces.find(
          w => w.name.toLowerCase() === expectedWorkspaceName.toLowerCase()
        );
        if (matchingWorkspace) {
          return matchingWorkspace.id;
        }
      }
    }
    
    // Fallback to user's email domain
    if (profile?.email) {
      const domain = extractEmailDomain(profile.email);
      if (domain) {
        const expectedWorkspaceName = getWorkspaceNameFromDomain(domain);
        const matchingWorkspace = workspaces.find(
          w => w.name.toLowerCase() === expectedWorkspaceName.toLowerCase()
        );
        if (matchingWorkspace) {
          return matchingWorkspace.id;
        }
      }
    }
    
    return null;
  };

  // Handle folder assignment
  const handleAssignFolder = async () => {
    if (!selectedMeeting || !selectedFolderId) {
      setAssignmentError('Please select a folder');
      return;
    }

    try {
      setIsAssigningFolder(true);
      setAssignmentError(null);
      setAssignmentSuccess(null);

      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      // Determine workspace_id: use selected workspace, or try to determine from meeting
      let workspaceIdToUse = selectedWorkspaceId;
      if (!workspaceIdToUse) {
        workspaceIdToUse = getWorkspaceIdForMeeting(selectedMeeting);
      }
      
      // If still no workspace, try to get/create from user email
      if (!workspaceIdToUse && profile?.email) {
        const userWorkspace = await getUserWorkspaceByEmail(token, profile.email);
        if (userWorkspace) {
          workspaceIdToUse = userWorkspace.id;
        }
      }

      if (!workspaceIdToUse) {
        throw new Error('Unable to determine workspace for this meeting. Please ensure you have a workspace.');
      }

      // Call API to assign folder to meeting
      const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${selectedMeeting.id}/assign-folder`);
      if (!recallaiUrl) {
        throw new Error('Recall server URL is not configured');
      }

      const response = await fetch(recallaiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          folder_id: selectedFolderId,
          workspace_id: workspaceIdToUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to assign folder' }));
        throw new Error(errorData.error || 'Failed to assign folder');
      }

      setAssignmentSuccess('Folder assigned successfully!');
      
      // Remove meeting from unresolved list
      setUnresolvedMeetings(prev => prev.filter(m => m.id !== selectedMeeting.id));
      
      // Clear selection after a delay
      setTimeout(() => {
        setSelectedMeeting(null);
        setSelectedFolderId(null);
        setAssignmentSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error assigning folder:', err);
      setAssignmentError(err instanceof Error ? err.message : 'Failed to assign folder');
    } finally {
      setIsAssigningFolder(false);
    }
  };

  // Handle create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedWorkspaceId) {
      setAssignmentError('Please enter a folder name');
      return;
    }

    try {
      setIsCreatingFolder(true);
      setAssignmentError(null);

      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      const newFolder = await createFolder(token, {
        name: newFolderName.trim(),
        workspace: selectedWorkspaceId,
      });

      // Add to folders list
      setFolders(prev => [newFolder, ...prev]);
      setSelectedFolderId(newFolder.id);
      setNewFolderName('');
      setShowCreateFolderForm(false);
    } catch (err) {
      console.error('Error creating folder:', err);
      setAssignmentError(err instanceof Error ? err.message : 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  return (
    <DashboardLayout activeTab="/unresolved-meetings">
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
              <li className="text-ellieBlue">UNRESOLVED MEETINGS</li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="mb-4 md:mb-6 lg:mb-8">
            <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-2">
              Unresolved Meetings
            </h1>
            <p className="font-nunito text-sm text-ellieGray">
              Meetings that need to be assigned to a folder. Assign them to organize your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Two Panel Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Panel: Unresolved Meetings List */}
            <div className="flex-1 w-full lg:max-w-[65%] xl:max-w-[60%]">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                {/* Subtitle and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
                  <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B]">
                    Unresolved Meetings ({filteredMeetings.length})
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

                {/* Mobile: Meetings Cards */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {loading ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">Loading unresolved meetings...</div>
                  ) : filteredMeetings.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      {searchQuery ? 'No meetings match your search' : 'No unresolved meetings. All meetings are organized!'}
                    </div>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        onClick={() => setSelectedMeeting(meeting)}
                        className={`
                          bg-white rounded-lg p-4 md:p-6 cursor-pointer transition-all hover:shadow-md border-2
                          ${selectedMeeting?.id === meeting.id ? 'border-ellieBlue shadow-md' : 'border-transparent'}
                        `}
                      >
                        <div className="mb-3 md:mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider block">
                              Meeting Title
                            </label>
                            <span className="px-2 py-0.5 rounded text-[10px] font-nunito font-semibold bg-orange-100 text-orange-800">
                              Unresolved
                            </span>
                          </div>
                          <p className="font-nunito text-sm md:text-base font-medium text-[#25324B] line-clamp-2">
                            {meeting.meeting_title || 'Untitled Meeting'}
                          </p>
                          <p className="font-nunito text-xs text-ellieGray mt-1">
                            Workspace: {getWorkspaceName(meeting)}
                          </p>
                        </div>

                        <div className="pb-3 md:pb-4 border-b border-[#DEE1E6]">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                                Date/Time
                              </label>
                              <div className="flex flex-col gap-1">
                                <span className="font-nunito text-xs md:text-sm font-medium text-[#25324B]">
                                  {formatDate(meeting.start_time)}
                                </span>
                                <span className="font-nunito text-xs md:text-sm font-medium text-ellieGray">
                                  {formatTime(meeting.start_time)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                                Platform
                              </label>
                              <span className="font-nunito text-xs md:text-sm font-medium text-ellieGray capitalize">
                                {meeting.platform?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop: Meetings Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#DEE1E6]">
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] min-w-[250px]">
                          Meeting Title
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Workspace
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Date/Time
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Platform
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            Loading unresolved meetings...
                          </td>
                        </tr>
                      ) : filteredMeetings.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500">
                            {searchQuery ? 'No meetings match your search' : 'No unresolved meetings. All meetings are organized!'}
                          </td>
                        </tr>
                      ) : (
                        filteredMeetings.map((meeting) => (
                          <tr
                            key={meeting.id}
                            onClick={() => setSelectedMeeting(meeting)}
                            className={`
                              border-b border-[#DEE1E6] cursor-pointer transition-colors
                              ${selectedMeeting?.id === meeting.id ? 'bg-[rgba(50,122,173,0.1)]' : 'hover:bg-gray-50'}
                            `}
                          >
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-nunito text-base font-semibold text-[#25324B]">
                                    {meeting.meeting_title || 'Untitled Meeting'}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-xs font-nunito font-semibold bg-orange-100 text-orange-800">
                                    Unresolved
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-nunito text-sm text-[#25324B]">
                                {getWorkspaceName(meeting)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-nunito text-sm font-medium text-[#25324B]">
                                  {formatDate(meeting.start_time)}
                                </span>
                                <span className="font-nunito text-xs text-ellieGray">
                                  {formatTime(meeting.start_time)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-nunito text-sm text-ellieGray capitalize">
                                {meeting.platform?.replace('_', ' ') || 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel: Meeting Details & Folder Assignment */}
            <div className="flex-1 w-full lg:max-w-[35%] xl:max-w-[40%]">
              {selectedMeeting ? (
                <div className="space-y-6">
                  {/* Meeting Details */}
                  <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                    <h2 className="font-nunito text-lg md:text-xl font-bold text-[#25324B] mb-4">
                      {selectedMeeting.meeting_title || 'Untitled Meeting'}
                    </h2>
                    
                    {/* Workspace Info */}
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <label className="font-nunito text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                        Workspace
                      </label>
                      <p className="font-nunito text-sm font-semibold text-[#25324B]">
                        {getWorkspaceName(selectedMeeting)}
                      </p>
                    </div>

                    {/* Meeting Info */}
                    <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 font-nunito text-sm text-[#25324B] mb-4">
                      <div>
                        <p className="text-xs uppercase text-[#6B7A96]">Date</p>
                        <p>{formatDate(selectedMeeting.start_time)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-[#6B7A96]">Time</p>
                        <p>{formatTime(selectedMeeting.start_time)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-[#6B7A96]">Platform</p>
                        <p className="capitalize">{selectedMeeting.platform?.replace('_', ' ') || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-[#6B7A96]">Status</p>
                        <p>{selectedMeeting.status || '—'}</p>
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedMeeting.summary && (
                      <div className="rounded-xl border border-gray-100 bg-white p-4 mb-4">
                        <h3 className="font-nunito text-sm font-semibold text-[#25324B] mb-2">Summary</h3>
                        <p className="font-nunito text-sm text-[#4B5674]">
                          {selectedMeeting.summary}
                        </p>
                      </div>
                    )}

                    {/* Action Items */}
                    {selectedMeeting.action_items && selectedMeeting.action_items.length > 0 && (
                      <div className="rounded-xl border border-gray-100 bg-white p-4 mb-4">
                        <h3 className="font-nunito text-sm font-semibold text-[#25324B] mb-2">
                          Action Items
                        </h3>
                        <ul className="space-y-2 text-sm text-[#4B5674]">
                          {selectedMeeting.action_items.map((item: any, index: number) => (
                            <li key={index} className="flex gap-2">
                              <span>•</span>
                              <span>{typeof item === 'string' ? item : item.text || item.item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Folder Assignment */}
                  <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                    <h2 className="font-nunito text-lg md:text-xl font-bold text-[#25324B] mb-4">
                      Assign to Folder
                    </h2>
                    
                    {assignmentSuccess && (
                      <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                        {assignmentSuccess}
                      </div>
                    )}
                    
                    {assignmentError && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                        {assignmentError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="flex flex-col gap-2 font-nunito text-sm font-semibold text-[#25324B]">
                          Select Folder
                          <select
                            value={selectedFolderId || ''}
                            onChange={(e) => setSelectedFolderId(e.target.value || null)}
                            className="rounded-[10px] border border-[#A3AED0] px-4 py-3 font-normal text-[#25324B] focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/30"
                            disabled={isAssigningFolder || isCreatingFolder}
                          >
                            <option value="">Select a folder</option>
                            {folders.map((folder) => (
                              <option key={folder.id} value={folder.id}>
                                {folder.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {!showCreateFolderForm ? (
                        <button
                          type="button"
                          onClick={() => setShowCreateFolderForm(true)}
                          className="w-full rounded-[10px] border border-[#327AAD] bg-white px-4 py-2 font-nunito text-sm font-semibold text-[#327AAD] transition hover:bg-[#327AAD]/5"
                          disabled={isAssigningFolder || isCreatingFolder}
                        >
                          + Create New Folder
                        </button>
                      ) : (
                        <div className="space-y-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <label className="flex flex-col gap-2 font-nunito text-sm font-semibold text-[#25324B]">
                            New Folder Name
                            <input
                              type="text"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              className="rounded-[10px] border border-[#A3AED0] px-4 py-3 font-normal text-[#25324B] placeholder:text-[#A3AED0] focus:border-[#7C5CFF] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/30"
                              placeholder="Enter folder name"
                              disabled={isCreatingFolder}
                              autoFocus
                            />
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleCreateFolder}
                              disabled={isCreatingFolder || !newFolderName.trim()}
                              className="flex-1 rounded-[10px] bg-[#327AAD] px-4 py-2 font-nunito text-sm font-semibold text-white transition hover:bg-[#286996] disabled:opacity-60"
                            >
                              {isCreatingFolder ? 'Creating...' : 'Create'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCreateFolderForm(false);
                                setNewFolderName('');
                              }}
                              className="rounded-[10px] border border-[#B7C0D6] px-4 py-2 font-nunito text-sm font-semibold text-[#1F2A44] transition hover:bg-[#F7F8FC]"
                              disabled={isCreatingFolder}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleAssignFolder}
                        disabled={isAssigningFolder || !selectedFolderId || isCreatingFolder}
                        className="w-full rounded-[10px] bg-[#327AAD] px-5 py-3 font-nunito text-base font-extrabold text-white transition hover:bg-[#286996] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isAssigningFolder ? 'Assigning...' : 'Assign to Folder'}
                      </button>
                    </div>
                  </div>

                  {/* Transcription */}
                  <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-nunito text-lg md:text-xl font-bold text-[#25324B]">
                        Meeting Transcription
                      </h2>
                    </div>

                    <div className="relative mb-4">
                      <input
                        type="text"
                        value={transcriptionSearchQuery}
                        onChange={(e) => setTranscriptionSearchQuery(e.target.value)}
                        placeholder="Search transcript"
                        className="w-full rounded-lg border border-[#CBD3E3] bg-white px-9 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/20"
                      />
                      <img
                        src={searchIcon}
                        alt="Search transcription"
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                      />
                    </div>

                    {loadingTranscript ? (
                      <div className="text-center py-8 text-gray-500">Loading transcript...</div>
                    ) : filteredTranscriptSegments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {transcriptionSearchQuery ? 'No transcript segments match your search' : 'No transcript available'}
                      </div>
                    ) : (
                      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                        {filteredTranscriptSegments.map((segment: any, index: number) => (
                          <div key={segment.id || index} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-[#327AAD]/10 flex items-center justify-center">
                                <span className="font-nunito text-sm font-semibold text-[#327AAD]">
                                  {segment.speaker?.charAt(0) || '?'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-nunito text-sm font-semibold text-[#25324B] mb-1">
                                {segment.speaker || 'Unknown Speaker'}
                              </div>
                              <div className="font-nunito text-sm text-[#4B5674]">
                                {segment.text}
                              </div>
                              {segment.start && (
                                <div className="font-nunito text-xs text-[#6B7A96] mt-1">
                                  {new Date(segment.start * 1000).toLocaleTimeString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                  <p className="text-center py-8 font-nunito text-sm text-[#6B7A96]">
                    Select a meeting to view details and assign to a folder
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

