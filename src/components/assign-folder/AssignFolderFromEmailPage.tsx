import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { listWorkspaces } from '../workspace/workspaceApi';
import { buildRecallaiUrl } from '../../services/transcriptionApi';

interface WorkspaceInfo {
  id: string;
  name: string;
}

export function AssignFolderFromEmailPage(): JSX.Element {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { ensureFreshAccessToken } = useAuth();

  const [token] = useState<string | null>(searchParams.get('token'));
  const [workspaceIdFromUrl] = useState<string | null>(searchParams.get('workspace_id'));
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>('');

  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(workspaceIdFromUrl);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

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
        setError(err instanceof Error ? err.message : 'Token verification failed');
        setIsValid(false);
        setIsVerifying(false);
      }
    };

    void verifyToken();
  }, [meetingId, token]);

  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!profile?.id || !isValid) return;

      try {
        const authToken = await ensureFreshAccessToken();
        if (!authToken) return;

        const response = await listWorkspaces(authToken, {
          page: 1,
          pageSize: 100,
          ordering: '-created_at',
        });
        setWorkspaces(response.results.map(w => ({ id: w.id, name: w.name })));

        if (!selectedWorkspaceId && response.results.length > 0) {
          setSelectedWorkspaceId(response.results[0].id);
        }
      } catch (err) {
        console.error('Error loading workspaces:', err);
      }
    };

    void loadWorkspaces();
  }, [profile?.id, isValid, ensureFreshAccessToken]);

  useEffect(() => {
    const autoAssign = async () => {
      if (!workspaceIdFromUrl || !meetingId || !isValid || isAssigning) return;

      try {
        setIsAssigning(true);
        setError(null);

        const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${meetingId}/assign-workspace`);
        if (!recallaiUrl) {
          throw new Error('Recall server URL is not configured');
        }

        const authToken = await ensureFreshAccessToken();
        if (!authToken) {
          throw new Error('Unable to authenticate');
        }

        const response = await fetch(recallaiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            workspace_id: workspaceIdFromUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to assign workspace' }));
          throw new Error(errorData.error || 'Failed to assign workspace');
        }

        setAssignmentSuccess(true);
        setTimeout(() => {
          navigate('/unresolved-meetings');
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign workspace');
      } finally {
        setIsAssigning(false);
      }
    };

    void autoAssign();
  }, [workspaceIdFromUrl, meetingId, isValid, ensureFreshAccessToken, navigate, isAssigning]);

  const handleAssignWorkspace = async () => {
    if (!meetingId || !selectedWorkspaceId) {
      setError('Please select a workspace');
      return;
    }

    try {
      setIsAssigning(true);
      setError(null);

      const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${meetingId}/assign-workspace`);
      if (!recallaiUrl) {
        throw new Error('Recall server URL is not configured');
      }

      const authToken = await ensureFreshAccessToken();
      if (!authToken) {
        throw new Error('Unable to authenticate');
      }

      const response = await fetch(recallaiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          workspace_id: selectedWorkspaceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to assign workspace' }));
        throw new Error(errorData.error || 'Failed to assign workspace');
      }

      setAssignmentSuccess(true);
      setTimeout(() => {
        navigate('/unresolved-meetings');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign workspace');
    } finally {
      setIsAssigning(false);
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
              Go to Unassigned Meetings
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
            <p className="font-nunito text-green-600 mb-4">Workspace assigned successfully. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-nunito text-2xl font-bold text-ellieBlack mb-2">Assign Workspace to Meeting</h1>
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
              Select Workspace
            </label>
            <select
              value={selectedWorkspaceId || ''}
              onChange={(e) => setSelectedWorkspaceId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-nunito text-sm focus:outline-none focus:ring-2 focus:ring-ellieBlue"
              disabled={isAssigning}
            >
              <option value="">-- Select a workspace --</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAssignWorkspace}
            disabled={!selectedWorkspaceId || isAssigning}
            className="w-full px-6 py-3 bg-ellieBlue text-white rounded-lg font-nunito font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? 'Assigning...' : 'Assign Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
}
