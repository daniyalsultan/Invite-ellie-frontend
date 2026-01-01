import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { listFolders, createFolder, type FolderRecord } from '../workspace/workspaceApi';
import { getUserWorkspaceByEmail } from '../../utils/workspaceAutoCreate';
import { buildRecallaiUrl } from '../../services/transcriptionApi';

export function AssignFolderFromEmailPage(): JSX.Element {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { ensureFreshAccessToken } = useAuth();

  const [token] = useState<string | null>(searchParams.get('token'));
  const [folderId] = useState<string | null>(searchParams.get('folder_id'));
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>('');

  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderId);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolderForm, setShowCreateFolderForm] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Verify token and get meeting info
  useEffect(() => {
    const verifyToken = async () => {
      if (!meetingId || !token) {
        setError('Missing meeting ID or token');
        setIsVerifying(false);
        return;
      }

      try {
        const verifyUrl = buildRecallaiUrl(`/api/assign-folder/verify-token?token=${encodeURIComponent(token)}&meeting_id=${meetingId}`);
        if (!verifyUrl) {
          throw new Error('Recall server URL is not configured');
        }

        const response = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Token verification failed' }));
          throw new Error(errorData.error || 'Invalid or expired token');
        }

        const data = await response.json();
        setIsValid(true);
        setMeetingTitle(data.meeting_title || 'Untitled Meeting');
        setIsVerifying(false);
      } catch (err) {
        console.error('[AssignFolder] Token verification error:', err);
        setError(err instanceof Error ? err.message : 'Token verification failed');
        setIsValid(false);
        setIsVerifying(false);
      }
    };

    void verifyToken();
  }, [meetingId, token]);

  // Load workspaces and folders
  useEffect(() => {
    const loadWorkspacesAndFolders = async () => {
      if (!profile?.id || !profile?.email || !isValid) return;

      try {
        const token = await ensureFreshAccessToken();
        if (!token) {
          throw new Error('Unable to authenticate');
        }

        // Get user's workspace
        const userWorkspace = await getUserWorkspaceByEmail(token, profile.email);
        if (userWorkspace) {
          setSelectedWorkspaceId(userWorkspace.id);

          // Load folders
          const foldersResponse = await listFolders(token, {
            workspace: userWorkspace.id,
            pageSize: 100,
            ordering: '-created_at',
          });
          setFolders(foldersResponse.results);
        }
      } catch (err) {
        console.error('[AssignFolder] Error loading workspaces/folders:', err);
      }
    };

    void loadWorkspacesAndFolders();
  }, [profile?.id, profile?.email, isValid, ensureFreshAccessToken]);

  // If folder_id is in URL, auto-assign
  useEffect(() => {
    const autoAssign = async () => {
      if (!folderId || !meetingId || !isValid || isAssigning) return;

      try {
        setIsAssigning(true);
        setError(null);

        const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${meetingId}/assign-folder`);
        if (!recallaiUrl) {
          throw new Error('Recall server URL is not configured');
        }

        const token = await ensureFreshAccessToken();
        if (!token) {
          throw new Error('Unable to authenticate');
        }

        // Get workspace ID
        let workspaceId = selectedWorkspaceId;
        if (!workspaceId && profile?.email) {
          const userWorkspace = await getUserWorkspaceByEmail(token, profile.email);
          workspaceId = userWorkspace?.id || null;
        }

        if (!workspaceId) {
          throw new Error('Could not determine workspace');
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
            folder_id: folderId,
            workspace_id: workspaceId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to assign folder' }));
          throw new Error(errorData.error || 'Failed to assign folder');
        }

        setAssignmentSuccess(true);
        setTimeout(() => {
          navigate('/unresolved-meetings');
        }, 2000);
      } catch (err) {
        console.error('[AssignFolder] Auto-assign error:', err);
        setError(err instanceof Error ? err.message : 'Failed to assign folder');
      } finally {
        setIsAssigning(false);
      }
    };

    void autoAssign();
  }, [folderId, meetingId, isValid, selectedWorkspaceId, profile?.email, ensureFreshAccessToken, navigate, isAssigning]);

  const handleAssignFolder = async () => {
    if (!meetingId || !selectedFolderId) {
      setError('Please select a folder');
      return;
    }

    try {
      setIsAssigning(true);
      setError(null);

      const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${meetingId}/assign-folder`);
      if (!recallaiUrl) {
        throw new Error('Recall server URL is not configured');
      }

      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      let workspaceId = selectedWorkspaceId;
      if (!workspaceId && profile?.email) {
        const userWorkspace = await getUserWorkspaceByEmail(token, profile.email);
        workspaceId = userWorkspace?.id || null;
      }

      if (!workspaceId) {
        throw new Error('Could not determine workspace');
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
          workspace_id: workspaceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to assign folder' }));
        throw new Error(errorData.error || 'Failed to assign folder');
      }

      setAssignmentSuccess(true);
      setTimeout(() => {
        navigate('/unresolved-meetings');
      }, 2000);
    } catch (err) {
      console.error('[AssignFolder] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign folder');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedWorkspaceId) {
      setError('Please enter a folder name');
      return;
    }

    try {
      setIsCreatingFolder(true);
      setError(null);

      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      const newFolder = await createFolder(token, {
        name: newFolderName.trim(),
        workspace: selectedWorkspaceId,
      });

      setFolders((prev) => [newFolder, ...prev]);
      setSelectedFolderId(newFolder.id);
      setNewFolderName('');
      setShowCreateFolderForm(false);
    } catch (err) {
      console.error('[AssignFolder] Error creating folder:', err);
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ellieBlue mx-auto mb-4"></div>
          <p className="font-nunito text-gray-600">Verifying token...</p>
        </div>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="font-nunito text-xl font-bold text-red-800 mb-2">Invalid Link</h2>
            <p className="font-nunito text-red-600 mb-4">{error || 'This link is invalid or has expired.'}</p>
            <button
              onClick={() => navigate('/unresolved-meetings')}
              className="font-nunito px-4 py-2 bg-ellieBlue text-white rounded-lg hover:opacity-90"
            >
              Go to Unresolved Meetings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (assignmentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h2 className="font-nunito text-xl font-bold text-green-800 mb-2">Success!</h2>
            <p className="font-nunito text-green-600 mb-4">Folder assigned successfully. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-nunito text-2xl font-bold text-ellieBlack mb-2">Assign Folder to Meeting</h1>
        <p className="font-nunito text-gray-600 mb-6">
          Meeting: <span className="font-semibold">{meetingTitle}</span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="font-nunito text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <label className="block font-nunito text-sm font-semibold text-ellieBlack mb-2">
              Select Folder
            </label>
            <select
              value={selectedFolderId || ''}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-nunito text-sm focus:outline-none focus:ring-2 focus:ring-ellieBlue"
              disabled={isAssigning}
            >
              <option value="">-- Select a folder --</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {!showCreateFolderForm ? (
            <button
              type="button"
              onClick={() => setShowCreateFolderForm(true)}
              className="font-nunito text-sm text-ellieBlue hover:underline mb-6"
            >
              + Create New Folder
            </button>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block font-nunito text-sm font-semibold text-ellieBlack mb-2">
                New Folder Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-nunito text-sm focus:outline-none focus:ring-2 focus:ring-ellieBlue"
                  disabled={isCreatingFolder}
                />
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="px-4 py-2 bg-ellieBlue text-white rounded-lg font-nunito text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {isCreatingFolder ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFolderForm(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-nunito text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAssignFolder}
            disabled={!selectedFolderId || isAssigning}
            className="w-full px-6 py-3 bg-ellieBlue text-white rounded-lg font-nunito font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? 'Assigning...' : 'Assign Folder'}
          </button>
        </div>
      </div>
    </div>
  );
}

