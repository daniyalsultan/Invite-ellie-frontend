import { useState, useEffect, useMemo } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { getTranscriptions, type Transcription } from '../../services/transcriptionApi';
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

type FolderMeetingsModalProps = {
  folderId: string;
  folderName: string;
  isOpen: boolean;
  onClose: () => void;
};

export function FolderMeetingsModal({ folderId, folderName, isOpen, onClose }: FolderMeetingsModalProps): JSX.Element | null {
  const { profile } = useProfile();
  const { ensureFreshAccessToken } = useAuth();
  const [meetings, setMeetings] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Transcription | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<any>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptionSearchQuery, setTranscriptionSearchQuery] = useState('');

  // Fetch meetings for this folder
  useEffect(() => {
    if (!isOpen || !profile?.id || !folderId) {
      return;
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all transcriptions and filter by folder_id
        const allTranscriptions = await getTranscriptions(profile.id || '');
        
        // Filter transcriptions by folder_id
        // Note: The folder_id should be in the transcription data from Recall server
        const folderMeetings = allTranscriptions.filter((t: any) => {
          // Check if folder_id matches (could be in different places in the response)
          return t.folder_id === folderId || t.folderId === folderId;
        });
        
        setMeetings(folderMeetings);
        
        // Auto-select first meeting if available
        if (folderMeetings.length > 0 && !selectedMeeting) {
          setSelectedMeeting(folderMeetings[0]);
        }
      } catch (err) {
        console.error('Error fetching folder meetings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meetings');
      } finally {
        setLoading(false);
      }
    };

    void fetchMeetings();
  }, [isOpen, profile?.id, folderId]);

  // Filter meetings based on search
  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const query = searchQuery.toLowerCase();
    return meetings.filter(
      (m) =>
        m.meeting_title?.toLowerCase().includes(query) ||
        m.meeting_url?.toLowerCase().includes(query) ||
        m.bot_id?.toLowerCase().includes(query)
    );
  }, [meetings, searchQuery]);

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
  }, [selectedMeeting, profile?.id]);

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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-7xl h-[90vh] bg-white rounded-[30px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-nunito text-2xl font-extrabold text-[#25324B]">
              {folderName}
            </h2>
            <p className="font-nunito text-sm text-[#6B7A96] mt-1">
              {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Meetings List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meetings..."
                  className="w-full rounded-lg border border-[#CBD3E3] bg-white px-9 py-2.5 font-nunito text-sm text-[#25324B] placeholder-[#94A3C1] focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                />
                <img
                  src={searchIcon}
                  alt="Search"
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 object-contain"
                />
              </div>
            </div>

            {/* Meetings List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading meetings...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : filteredMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No meetings match your search' : 'No meetings in this folder'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedMeeting?.id === meeting.id
                          ? 'border-[#327AAD] bg-[#327AAD]/5'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-nunito text-base font-bold text-[#25324B] line-clamp-2">
                        {meeting.meeting_title || 'Untitled Meeting'}
                      </h3>
                      <p className="font-nunito text-xs text-[#6B7A96] mt-1">
                        {formatDate(meeting.created_at)} • {formatTime(meeting.created_at)}
                      </p>
                      {meeting.summary && (
                        <p className="font-nunito text-xs text-[#4B5674] mt-2 line-clamp-2">
                          {meeting.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Meeting Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedMeeting ? (
              <>
                {/* Meeting Header */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-nunito text-xl font-bold text-[#25324B]">
                    {selectedMeeting.meeting_title || 'Untitled Meeting'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 font-nunito text-sm text-[#6B7A96]">
                    <span>{formatDate(selectedMeeting.created_at)}</span>
                    <span>•</span>
                    <span>{formatTime(selectedMeeting.created_at)}</span>
                  </div>
                </div>

                {/* Summary and Action Items */}
                <div className="p-6 border-b border-gray-200 space-y-4 max-h-48 overflow-y-auto">
                  {selectedMeeting.summary && (
                    <div>
                      <h4 className="font-nunito text-sm font-semibold text-[#25324B] mb-2">Summary</h4>
                      <p className="font-nunito text-sm text-[#4B5674]">{selectedMeeting.summary}</p>
                    </div>
                  )}
                  {selectedMeeting.action_items && selectedMeeting.action_items.length > 0 && (
                    <div>
                      <h4 className="font-nunito text-sm font-semibold text-[#25324B] mb-2">Action Items</h4>
                      <ul className="space-y-1">
                        {selectedMeeting.action_items.map((item: any, index: number) => (
                          <li key={index} className="font-nunito text-sm text-[#4B5674] flex gap-2">
                            <span>•</span>
                            <span>{typeof item === 'string' ? item : item.text || item.item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Transcription */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        value={transcriptionSearchQuery}
                        onChange={(e) => setTranscriptionSearchQuery(e.target.value)}
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

                  <div className="flex-1 overflow-y-auto p-6">
                    {loadingTranscript ? (
                      <div className="text-center py-8 text-gray-500">Loading transcript...</div>
                    ) : filteredTranscriptSegments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {transcriptionSearchQuery ? 'No transcript segments match your search' : 'No transcript available'}
                      </div>
                    ) : (
                      <div className="space-y-4">
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-nunito text-sm text-[#6B7A96]">Select a meeting to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

