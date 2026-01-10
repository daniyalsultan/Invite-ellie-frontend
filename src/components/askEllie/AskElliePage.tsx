import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getContextualNudges, type ContextualNudge } from '../../services/contextualNudgesApi';
import { listWorkspaces, listFolders, type FolderRecord, type WorkspaceRecord } from '../workspace/workspaceApi';
import { getUserWorkspaceByEmail } from '../../utils/workspaceAutoCreate';
import { buildRecallaiUrl } from '../../services/transcriptionApi';
import logo from '../../assets/logo.svg';

interface GroundedSegment {
  text: string;
  speaker: string;
  timestamp: string;
  start_time: number;
  relevance_score?: number;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ellie';
  responseState?: 'confident' | 'tentative' | 'no_answer';
  confidenceScore?: number;
  groundedSegments?: GroundedSegment[];
  hasSufficientContext?: boolean;
}

type TabType = 'assistant' | 'nudges';

export function AskElliePage(): JSX.Element {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<TabType>('assistant');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Ellie. I can help you with questions about all your previous meetings and the current meeting. What would you like to know?",
      sender: 'ellie',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLiveMeetings, setHasLiveMeetings] = useState(false);
  const [liveMeetingCount, setLiveMeetingCount] = useState(0);
  const [liveBotId, setLiveBotId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Contextual nudges state
  const [contextualNudges, setContextualNudges] = useState<ContextualNudge[]>([]);
  const [nudgesLoading, setNudgesLoading] = useState(false);
  const [nudgesError, setNudgesError] = useState<string | null>(null);
  const [currentParticipants, setCurrentParticipants] = useState<string[]>([]);
  const [previousParticipantCount, setPreviousParticipantCount] = useState<number>(0);

  // Folder state for contextual nudges
  const [liveMeetingFolderId, setLiveMeetingFolderId] = useState<string | null>(null);
  const [liveMeetingFolderName, setLiveMeetingFolderName] = useState<string | null>(null);
  const [liveMeetingId, setLiveMeetingId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isAssigningFolder, setIsAssigningFolder] = useState(false);
  const [folderAssignmentError, setFolderAssignmentError] = useState<string | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  const { ensureFreshAccessToken } = useAuth();

  // Get chat API URL from recallai
  const CHAT_API_URL = useMemo(() => {
    return buildRecallaiUrl('/api/chat');
  }, []);

  const formatMessageText = (text: string): JSX.Element => {
    const lines = text.split('\n');
    return (
      <>
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          // Check if line starts with bullet point
          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            return (
              <div key={index} className="ml-4 mt-1 first:mt-0">
                {trimmedLine}
              </div>
            );
          }
          // Regular text line
          if (trimmedLine) {
            return (
              <div key={index} className="mt-1 first:mt-0">
                {trimmedLine}
              </div>
            );
          }
          // Empty line - add spacing
          return <div key={index} className="h-2" />;
        })}
      </>
    );
  };

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reset textarea height when input is cleared
  useEffect(() => {
    if (inputRef.current && !inputValue) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputValue]);

  // Fetch contextual nudges - API will check if meeting is live
  // IMPORTANT: Nudges are ONLY fetched when folder is assigned to scope search to that folder only
  const fetchContextualNudges = useCallback(async (): Promise<void> => {
    if (!profile?.id) {
      setContextualNudges([]);
      setCurrentParticipants([]);
      setHasLiveMeetings(false);
      return;
    }

    // CRITICAL: Do not fetch nudges if no folder is assigned
    // This ensures backend only searches within the assigned folder, not all meetings
    if (!liveMeetingFolderId) {
      setContextualNudges([]);
      setNudgesLoading(false);
      return;
    }

    setNudgesLoading(true);
    setNudgesError(null);

    try {
      // Fetch nudges scoped to the assigned folder only
      // Backend will search for matching participants ONLY within this folder's meetings
      const response = await getContextualNudges(
        profile.id,
        liveBotId || undefined,
        liveMeetingFolderId // Always pass folderId to scope the search
      );

      if (response.success) {
        // Update live meeting status based on API response
        // The API checks for live meetings independently
        const hasLive = response.has_live_meeting ?? false;
        setHasLiveMeetings(hasLive);

        if (hasLive) {
          const newParticipants = response.current_participants || [];
          const newParticipantCount = newParticipants.length;

          // Update folder information from response
          if (response.live_meeting_folder_id) {
            setLiveMeetingFolderId(response.live_meeting_folder_id);
          }
          if (response.live_meeting_folder_name) {
            setLiveMeetingFolderName(response.live_meeting_folder_name);
          }
          if (response.live_meeting_id) {
            setLiveMeetingId(response.live_meeting_id);
          }

          // Nudges are already scoped to folder (folderId was passed to API)
          // Backend searched only within the assigned folder's meetings
          setContextualNudges(response.nudges || []);

          setCurrentParticipants(newParticipants);
          setPreviousParticipantCount(newParticipantCount);

          // Update bot_id if provided in response
          if (response.live_meeting_bot_id) {
            setLiveBotId(response.live_meeting_bot_id);
          }
        } else {
          // No live meeting - clear nudges and bot_id
          setContextualNudges([]);
          setCurrentParticipants([]);
          setPreviousParticipantCount(0);
          setLiveBotId(null);
          setLiveMeetingFolderId(null);
          setLiveMeetingFolderName(null);
          setLiveMeetingId(null);
        }
      } else {
        setNudgesError(response.error || 'Failed to fetch contextual nudges');
        setContextualNudges([]);
        setCurrentParticipants([]);
        setPreviousParticipantCount(0);
        setHasLiveMeetings(false);
      }
    } catch (error) {
      console.error('Error fetching contextual nudges:', error);
      setNudgesError(error instanceof Error ? error.message : 'Failed to fetch contextual nudges');
      setContextualNudges([]);
      setCurrentParticipants([]);
      setPreviousParticipantCount(0);
      setHasLiveMeetings(false);
    } finally {
      setNudgesLoading(false);
    }
  }, [profile?.id, liveBotId, liveMeetingFolderId]);

  // Check for live meetings periodically (regardless of tab)
  // This ensures live meetings are detected even when user is on assistant tab
  const checkLiveMeetingStatus = useCallback(async (): Promise<void> => {
    if (!profile?.id) {
      setHasLiveMeetings(false);
      setLiveBotId(null);
      return;
    }

    try {
      // Check for live meetings without requiring bot_id
      // This will find the most recent live meeting
      const response = await getContextualNudges(profile.id, undefined);

      if (response.success) {
        const hasLive = response.has_live_meeting ?? false;
        setHasLiveMeetings(hasLive);

        if (hasLive) {
          // Update bot_id if provided in response
          if (response.live_meeting_bot_id) {
            setLiveBotId(response.live_meeting_bot_id);
          }
          // Update folder information
          if (response.live_meeting_folder_id) {
            setLiveMeetingFolderId(response.live_meeting_folder_id);
          }
          if (response.live_meeting_folder_name) {
            setLiveMeetingFolderName(response.live_meeting_folder_name);
          }
          if (response.live_meeting_id) {
            setLiveMeetingId(response.live_meeting_id);
          }
        } else {
          // No live meeting - clear bot_id and folder info
          setLiveBotId(null);
          setLiveMeetingFolderId(null);
          setLiveMeetingFolderName(null);
          setLiveMeetingId(null);
        }
      } else {
        setHasLiveMeetings(false);
        setLiveBotId(null);
      }
    } catch (error) {
      console.error('Error checking live meeting status:', error);
      // Don't set to false on error, keep current state to avoid flickering
    }
  }, [profile?.id]);

  // Load workspaces and folders for folder selection
  const loadWorkspacesAndFolders = useCallback(async (): Promise<void> => {
    if (!profile?.id || !profile?.email) {
      return;
    }

    try {
      setIsLoadingFolders(true);
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      // Fetch all workspaces
      const workspacesResponse = await listWorkspaces(token, {
        page: 1,
        pageSize: 100,
        ordering: '-created_at',
      });
      setWorkspaces(workspacesResponse.results);

      // Get user's primary workspace
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
        // Fallback to first workspace
        const firstWorkspace = workspacesResponse.results[0];
        setSelectedWorkspaceId(firstWorkspace.id);

        const foldersResponse = await listFolders(token, {
          workspace: firstWorkspace.id,
          pageSize: 100,
          ordering: '-created_at',
        });
        setFolders(foldersResponse.results);
      }
    } catch (error) {
      console.error('Error loading workspaces/folders:', error);
      setFolderAssignmentError(error instanceof Error ? error.message : 'Failed to load folders');
    } finally {
      setIsLoadingFolders(false);
    }
  }, [profile?.id, profile?.email, ensureFreshAccessToken]);

  // Load folders when workspace changes
  useEffect(() => {
    const loadFolders = async () => {
      if (!selectedWorkspaceId) {
        setFolders([]);
        return;
      }

      try {
        setIsLoadingFolders(true);
        const token = await ensureFreshAccessToken();
        if (!token) {
          throw new Error('Unable to authenticate');
        }

        const foldersResponse = await listFolders(token, {
          workspace: selectedWorkspaceId,
          pageSize: 100,
          ordering: '-created_at',
        });
        setFolders(foldersResponse.results);
      } catch (error) {
        console.error('Error loading folders:', error);
        setFolders([]);
      } finally {
        setIsLoadingFolders(false);
      }
    };

    void loadFolders();
  }, [selectedWorkspaceId, ensureFreshAccessToken]);

  // Assign folder to live meeting
  const handleAssignFolder = useCallback(async (): Promise<void> => {
    if (!selectedFolderId || !liveMeetingId || !profile?.id) {
      setFolderAssignmentError('Please select a folder');
      return;
    }

    try {
      setIsAssigningFolder(true);
      setFolderAssignmentError(null);

      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      // Determine workspace_id
      let workspaceIdToUse = selectedWorkspaceId;
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
      const recallaiUrl = buildRecallaiUrl(`/api/transcriptions/${liveMeetingId}/assign-folder`);
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

      // Update folder state
      const selectedFolder = folders.find(f => f.id === selectedFolderId);
      if (selectedFolder) {
        setLiveMeetingFolderId(selectedFolderId);
        setLiveMeetingFolderName(selectedFolder.name);
      }

      // Fetch nudges after folder assignment
      await fetchContextualNudges();
    } catch (error) {
      console.error('Error assigning folder:', error);
      setFolderAssignmentError(error instanceof Error ? error.message : 'Failed to assign folder');
    } finally {
      setIsAssigningFolder(false);
    }
  }, [selectedFolderId, liveMeetingId, profile?.id, profile?.email, selectedWorkspaceId, folders, ensureFreshAccessToken, fetchContextualNudges]);

  // Poll for live meeting status every 30 seconds (works on any tab)
  // This ensures new meetings are detected automatically
  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    // Initial check
    void checkLiveMeetingStatus();

    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      void checkLiveMeetingStatus();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [profile?.id, checkLiveMeetingStatus]);

  // Fetch nudges when switching to nudges tab (API will check if meeting is live)
  useEffect(() => {
    if (activeTab === 'nudges' && profile?.id) {
      void fetchContextualNudges();
      // Load workspaces and folders if no folder is assigned
      if (hasLiveMeetings && !liveMeetingFolderId) {
        void loadWorkspacesAndFolders();
      }
    } else if (activeTab !== 'nudges') {
      // Clear nudges when switching away from nudges tab
      setContextualNudges([]);
      setCurrentParticipants([]);
    }
  }, [activeTab, profile?.id, hasLiveMeetings, liveMeetingFolderId, fetchContextualNudges, loadWorkspacesAndFolders]);

  // Smart polling for nudges when on nudges tab
  // - Poll every 30 seconds ONLY when meeting is live AND no nudges are available yet
  // - Once nudges are shown, stop polling (to reduce API calls)
  // - When new participant joins, trigger one-time fetch (detected via participant count change)
  useEffect(() => {
    if (activeTab !== 'nudges' || !profile?.id || !hasLiveMeetings) {
      return;
    }

    // Only set up polling if no nudges are available yet
    // This reduces API calls - once nudges appear, we stop polling
    if (contextualNudges.length > 0) {
      // Nudges are already available, no need to poll
      return;
    }

    // Set up polling every 30 seconds only when no nudges yet
    // This helps detect when participants join and matching meetings become available
    const intervalId = setInterval(() => {
      void fetchContextualNudges();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [activeTab, profile?.id, hasLiveMeetings, contextualNudges.length, fetchContextualNudges]);

  // Detect when new participant joins and trigger one-time fetch
  // This happens when participant count changes (new person joined the meeting)
  useEffect(() => {
    if (activeTab !== 'nudges' || !profile?.id || !hasLiveMeetings) {
      return;
    }

    // Skip if this is the initial load (previousParticipantCount is 0)
    if (previousParticipantCount === 0) {
      return;
    }

    // If participant count changed (increased), fetch nudges (might have new matching meetings)
    if (currentParticipants.length > previousParticipantCount) {
      console.log(`[AskEllie] New participant joined! Count: ${previousParticipantCount} → ${currentParticipants.length}. Fetching nudges...`);
      void fetchContextualNudges();
    }
  }, [currentParticipants.length, previousParticipantCount, activeTab, profile?.id, hasLiveMeetings, fetchContextualNudges]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history (excluding the initial greeting)
      const conversationHistory = messages
        .filter((msg) => msg.id !== 1) // Exclude initial greeting
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      // Check if API URL is configured
      if (!CHAT_API_URL) {
        throw new Error('Chat API URL is not configured. Please set VITE_RECALLAI_BASE_URL');
      }

      if (!profile?.id) {
        throw new Error('Please login to chat with Ellie');
      }

      // Call the chatbot API
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          message: currentInput,
          history: conversationHistory,
          userId: profile.id,  // Add userId for authentication
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get response' }));
        throw new Error(errorData.error || 'Failed to get response from Ellie');
      }

      const data = await response.json();

      // Update live meeting status from response
      if (data.has_live_meetings !== undefined) {
        setHasLiveMeetings(data.has_live_meetings);
        setLiveMeetingCount(data.live_meeting_count || 0);
      }

      // Store bot_id if provided in response (for contextual nudges)
      if (data.bot_id) {
        setLiveBotId(data.bot_id);
      }

      const ellieResponse: Message = {
        id: messages.length + 2,
        text: data.response || "I'm sorry, I couldn't process that. Could you please try again?",
        sender: 'ellie',
        responseState: data.response_state || 'confident',
        confidenceScore: data.confidence_score,
        groundedSegments: data.grounded_segments || [],
        hasSufficientContext: data.has_sufficient_context,
      };

      setMessages((prev) => [...prev, ellieResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: messages.length + 2,
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        sender: 'ellie',
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout activeTab="/ask-ellie">
      <div className="w-full h-full flex flex-col bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-2 md:mb-3 lg:mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </a>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">Ellie Meeting Assistant</li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="mb-4 md:mb-6 lg:mb-8">
            <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6">
              Ellie Meeting Assistant
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className={`px-4 md:px-6 py-2 md:py-3 font-nunito text-sm md:text-base font-semibold transition-colors border-b-2 ${activeTab === 'assistant'
                    ? 'border-ellieBlue text-ellieBlue'
                    : 'border-transparent text-ellieGray hover:text-ellieBlack'
                  }`}
              >
                Live Meeting Assistant
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('nudges')}
                className={`px-4 md:px-6 py-2 md:py-3 font-nunito text-sm md:text-base font-semibold transition-colors border-b-2 ${activeTab === 'nudges'
                    ? 'border-ellieBlue text-ellieBlue'
                    : 'border-transparent text-ellieGray hover:text-ellieBlack'
                  }`}
              >
                Contextual Nudges
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col min-h-0 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
          {activeTab === 'assistant' ? (
            /* Live Meeting Assistant Tab */
            <div className="flex-1 flex flex-col rounded-xl bg-gradient-to-b from-[#FAFBFC] to-[#F4F7FA] border border-gray-200 shadow-sm overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
                <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 md:px-5 md:py-4 ${message.sender === 'user'
                            ? 'bg-ellieBlue text-white'
                            : 'bg-white text-ellieBlack shadow-sm border border-gray-100'
                          }`}
                      >
                        {message.sender === 'ellie' && (
                          <div className="mb-2 flex items-center gap-2">
                            <img src={logo} alt="Ellie" className="h-6 w-6 md:h-7 md:w-7" />
                            <span className="font-spaceGrotesk text-sm md:text-base font-semibold text-ellieBlue">
                              Ellie
                            </span>
                            {message.responseState === 'tentative' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-nunito font-medium">
                                Tentative
                              </span>
                            )}
                            {message.responseState === 'no_answer' && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-nunito font-medium">
                                Insufficient Context
                              </span>
                            )}
                          </div>
                        )}
                        <div
                          className={`font-nunito text-sm md:text-base leading-relaxed ${message.sender === 'user' ? 'text-white' : 'text-ellieBlack'
                            }`}
                        >
                          {formatMessageText(message.text)}
                        </div>
                        
                        {/* Show grounded segments if available */}
                        {message.sender === 'ellie' && message.groundedSegments && message.groundedSegments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="mb-2">
                              <span className="text-xs font-nunito font-semibold text-ellieGray">
                                Referenced from transcript:
                              </span>
                            </div>
                            <div className="space-y-2">
                              {message.groundedSegments.map((segment, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gray-50 rounded p-2 text-xs font-nunito"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-ellieBlue">{segment.speaker}</span>
                                    <span className="text-ellieGray">•</span>
                                    <span className="text-ellieGray">{segment.timestamp}</span>
                                  </div>
                                  <div className="text-ellieBlack italic">
                                    "{segment.text}"
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] md:max-w-[75%] rounded-lg px-4 py-3 md:px-5 md:py-4 bg-white text-ellieBlack shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2">
                          <img src={logo} alt="Ellie" className="h-6 w-6 md:h-7 md:w-7 animate-pulse" />
                          <span className="font-spaceGrotesk text-sm md:text-base font-semibold text-ellieBlue">
                            Ellie
                          </span>
                          <span className="text-ellieGray text-sm md:text-base">is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Live Meeting Indicator */}
              {hasLiveMeetings && (
                <div className="border-b border-gray-200 bg-green-50 px-4 py-3 md:px-6 md:py-4">
                  <div className="max-w-4xl mx-auto flex items-center gap-2">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="font-nunito text-sm md:text-base text-green-700">
                      {liveMeetingCount > 1
                        ? `Ellie is listening to ${liveMeetingCount} live meetings`
                        : 'Ellie is listening to your live meeting'}
                    </p>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-gray-200 bg-white px-4 py-4 md:px-6 md:py-5">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        // Auto-resize textarea
                        const target = e.target;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your meetings..."
                      rows={1}
                      className="w-full rounded-lg border border-gray-200 bg-ellieSurface px-4 py-3 font-nunito text-sm md:text-base text-ellieBlack placeholder:text-ellieGray focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/30 resize-none min-h-[48px] max-h-32"
                      style={{ minHeight: '48px', height: 'auto' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-lg bg-ellieBlue text-white transition-colors hover:bg-ellieBlue/90 disabled:cursor-not-allowed disabled:opacity-50 flex-shrink-0"
                    aria-label="Send message"
                  >
                    <svg
                      className="h-5 w-5 md:h-6 md:w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-ellieGray text-center mt-3 font-nunito">
                  Ellie has access to all your previous meetings and current meeting data
                </p>
              </div>
            </div>
          ) : (
            /* Contextual Nudges Tab */
            <div className="flex-1 flex flex-col rounded-xl bg-gradient-to-b from-[#FAFBFC] to-[#F4F7FA] border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
                <div className="max-w-4xl mx-auto">
                  {!hasLiveMeetings ? (
                    /* No Live Meeting State */
                    <div className="text-center py-12 md:py-16">
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 md:h-16 md:w-16 text-ellieGray"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <h2 className="font-nunito text-xl md:text-2xl font-bold text-ellieBlack mb-2">
                        Contextual Nudges
                      </h2>
                      <p className="font-nunito text-sm md:text-base text-ellieGray max-w-md mx-auto">
                        Contextual nudges are only available during live meetings. Start or join a meeting to see relevant insights from previous meetings with the same participants.
                      </p>
                    </div>
                  ) : nudgesLoading ? (
                    /* Loading State */
                    <div className="text-center py-12 md:py-16">
                      <div className="mb-4">
                        <img src={logo} alt="Ellie" className="mx-auto h-12 w-12 md:h-16 md:w-16 animate-pulse" />
                      </div>
                      <p className="font-nunito text-sm md:text-base text-ellieGray">
                        Loading contextual nudges...
                      </p>
                    </div>
                  ) : nudgesError ? (
                    /* Error State */
                    <div className="text-center py-12 md:py-16">
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 md:h-16 md:w-16 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="font-nunito text-xl md:text-2xl font-bold text-ellieBlack mb-2">
                        Error Loading Nudges
                      </h2>
                      <p className="font-nunito text-sm md:text-base text-red-600 mb-4">
                        {nudgesError}
                      </p>
                      <button
                        onClick={() => void fetchContextualNudges()}
                        className="px-4 py-2 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:bg-ellieBlue/90 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : !liveMeetingFolderId ? (
                    /* No Folder Assigned - Show Folder Selection */
                    <div className="text-center py-12 md:py-16">
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 md:h-16 md:w-16 text-ellieGray"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                      </div>
                      <h2 className="font-nunito text-xl md:text-2xl font-bold text-ellieBlack mb-2">
                        Select a Folder to Enable Nudges
                      </h2>
                      <p className="font-nunito text-sm md:text-base text-ellieGray max-w-md mx-auto mb-6">
                        Contextual nudges are only available after a meeting is associated with a folder. This helps Ellie understand the project context and provide relevant insights.
                      </p>

                      {/* Folder Selection Form */}
                      <div className="max-w-lg mx-auto bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-sm">
                        {folderAssignmentError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-nunito text-sm">
                            {folderAssignmentError}
                          </div>
                        )}

                        {/* Workspace Selection */}
                        {workspaces.length > 0 && (
                          <div className="mb-4">
                            <label className="block font-nunito text-sm font-semibold text-ellieBlack mb-2">
                              Workspace
                            </label>
                            <select
                              value={selectedWorkspaceId || ''}
                              onChange={(e) => {
                                setSelectedWorkspaceId(e.target.value);
                                setSelectedFolderId(null); // Reset folder when workspace changes
                              }}
                              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-nunito text-sm text-ellieBlack focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/30"
                            >
                              <option value="">Select a workspace...</option>
                              {workspaces.map((workspace) => (
                                <option key={workspace.id} value={workspace.id}>
                                  {workspace.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Folder Selection */}
                        <div className="mb-6">
                          <label className="block font-nunito text-sm font-semibold text-ellieBlack mb-2">
                            Folder
                          </label>
                          {isLoadingFolders ? (
                            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 font-nunito text-sm text-ellieGray">
                              Loading folders...
                            </div>
                          ) : (
                            <select
                              value={selectedFolderId || ''}
                              onChange={(e) => setSelectedFolderId(e.target.value)}
                              disabled={!selectedWorkspaceId || folders.length === 0}
                              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-nunito text-sm text-ellieBlack focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/30 disabled:bg-gray-50 disabled:text-ellieGray disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {!selectedWorkspaceId
                                  ? 'Select a workspace first...'
                                  : folders.length === 0
                                    ? 'No folders available'
                                    : 'Select a folder...'}
                              </option>
                              {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                  {folder.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Assign Button */}
                        <button
                          onClick={() => void handleAssignFolder()}
                          disabled={!selectedFolderId || isAssigningFolder || !liveMeetingId}
                          className="w-full px-4 py-3 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:bg-ellieBlue/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isAssigningFolder ? 'Assigning...' : 'Enable Nudges for This Meeting'}
                        </button>
                      </div>
                    </div>
                  ) : contextualNudges.length === 0 ? (
                    /* Empty State - No Nudges (but folder is assigned) */
                    <div className="text-center py-12 md:py-16">
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 md:h-16 md:w-16 text-ellieGray"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <h2 className="font-nunito text-xl md:text-2xl font-bold text-ellieBlack mb-2">
                        No Contextual Nudges Yet
                      </h2>
                      {liveMeetingFolderName && (
                        <p className="font-nunito text-sm md:text-base text-ellieGray mb-3">
                          Folder: <span className="font-semibold text-ellieBlack">{liveMeetingFolderName}</span>
                        </p>
                      )}
                      {currentParticipants.length > 0 ? (
                        <>
                          <p className="font-nunito text-sm md:text-base text-ellieGray mb-3">
                            No previous meetings found with matching participants in this folder.
                          </p>
                          <div className="inline-flex flex-wrap gap-2 justify-center">
                            <span className="font-nunito text-xs text-ellieGray">Current participants:</span>
                            {currentParticipants.map((participant, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-ellieBlue/10 text-ellieBlue rounded-full text-xs font-nunito font-semibold"
                              >
                                {participant}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="font-nunito text-sm md:text-base text-ellieGray">
                          Waiting for participants to join the meeting...
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Nudges List */
                    <div className="space-y-4 md:space-y-6">
                      {/* Current Participants Info */}
                      {currentParticipants.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <svg
                              className="h-5 w-5 text-ellieBlue"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <h3 className="font-nunito text-sm md:text-base font-semibold text-ellieBlack">
                              Current Meeting Participants
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentParticipants.map((participant, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-ellieBlue/10 text-ellieBlue rounded-full text-xs font-nunito font-semibold"
                              >
                                {participant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Nudges Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h2 className="font-nunito text-lg md:text-xl font-bold text-ellieBlack">
                            Contextual Nudges ({contextualNudges.length})
                          </h2>
                          {liveMeetingFolderName && (
                            <div className="flex items-center gap-2 mt-1">
                              <svg
                                className="h-4 w-4 text-ellieGray"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                              </svg>
                              <span className="font-nunito text-xs text-ellieGray">
                                Context: <span className="font-semibold text-ellieBlack">{liveMeetingFolderName}</span>
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => void fetchContextualNudges()}
                          disabled={nudgesLoading}
                          className="px-3 py-1.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs font-semibold hover:bg-ellieBlue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Refresh
                        </button>
                      </div>

                      {/* Nudges List */}
                      <div className="space-y-3 md:space-y-4">
                        {contextualNudges.map((nudge) => (
                          <div
                            key={nudge.id}
                            className="bg-white rounded-lg border border-amber-200 shadow-sm p-4 md:p-5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="flex-shrink-0 mt-1">
                                <svg
                                  className="w-5 h-5 text-amber-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className="font-nunito text-sm md:text-base font-semibold text-ellieBlack mb-2">
                                  {nudge.text}
                                </p>

                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-ellieGray mb-2">
                                  {nudge.timestamp && (
                                    <span className="font-nunito">
                                      <svg className="inline h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {nudge.timestamp}
                                    </span>
                                  )}
                                  {nudge.speaker && (
                                    <span className="font-nunito">
                                      <svg className="inline h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {nudge.speaker}
                                    </span>
                                  )}
                                  {nudge.type && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-nunito font-medium">
                                      {nudge.type.replace('_', ' ')}
                                    </span>
                                  )}
                                </div>

                                {/* Explanation */}
                                {nudge.explanation && (
                                  <p className="font-nunito text-xs text-ellieGray italic mb-3">
                                    {nudge.explanation}
                                  </p>
                                )}

                                {/* Meeting Context */}
                                {nudge.meeting_context && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-start gap-2">
                                      <svg
                                        className="w-4 h-4 text-ellieGray mt-0.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-nunito text-xs font-semibold text-ellieBlack">
                                          {nudge.meeting_context.meeting_title}
                                        </p>
                                        <p className="font-nunito text-xs text-ellieGray mt-1">
                                          {nudge.meeting_context.meeting_date
                                            ? new Date(nudge.meeting_context.meeting_date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                            })
                                            : 'Date not available'}
                                        </p>
                                        {nudge.meeting_context.participants && nudge.meeting_context.participants.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                            {nudge.meeting_context.participants.map((participant, idx) => (
                                              <span
                                                key={idx}
                                                className="px-2 py-0.5 bg-gray-100 text-ellieGray rounded text-xs font-nunito"
                                              >
                                                {participant}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

