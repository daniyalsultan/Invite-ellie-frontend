import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import zoomLogo from '../../assets/logos_zoom.png';
import searchIcon from '../../assets/Vector.png';
import setupProfileAvatar from '../../assets/setup-profile-avatar.png';
import threeDotsIcon from '../../assets/3dotsinrow.png';
import { useMeetings, useTranscripts } from '../../hooks/useMeetings';

// Helper functions
function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getPlatformIcon(platform?: string): string {
  if (platform?.toLowerCase().includes('zoom')) return zoomLogo;
  return zoomLogo;
}

export function TranscriptionsPage(): JSX.Element {
  const navigate = useNavigate();
  const { meetings, loading: meetingsLoading, error: meetingsError } = useMeetings();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptionSearchQuery, setTranscriptionSearchQuery] = useState('');
  
  // Get transcripts for selected meeting
  const { transcripts, loading: transcriptsLoading, error: transcriptsError } = useTranscripts(selectedMeetingId);

  // Filter meetings based on search
  const filteredMeetings = useMemo(() => {
    if (!searchQuery.trim()) return meetings;
    const query = searchQuery.toLowerCase();
    return meetings.filter(
      (m) =>
        m.id?.toLowerCase().includes(query) ||
        m.title?.toLowerCase().includes(query) ||
        m.meeting_link?.toLowerCase().includes(query)
    );
  }, [meetings, searchQuery]);

  // Filter transcripts based on search
  const filteredTranscripts = useMemo(() => {
    if (!transcriptionSearchQuery.trim()) return transcripts;
    const query = transcriptionSearchQuery.toLowerCase();
    return transcripts.filter(
      (t) => t.speaker?.toLowerCase().includes(query) || t.message?.toLowerCase().includes(query)
    );
  }, [transcripts, transcriptionSearchQuery]);

  // Auto-select first meeting if none selected
  useMemo(() => {
    if (!selectedMeetingId && filteredMeetings.length > 0) {
      setSelectedMeetingId(filteredMeetings[0].id || null);
    }
  }, [filteredMeetings, selectedMeetingId]);

  const selectedMeeting = filteredMeetings.find((m) => m.id === selectedMeetingId);

  const handleCopyLink = (link: string): void => {
    navigator.clipboard.writeText(link);
  };

  // Update header title to show selected meeting
  const headerTitle = selectedMeeting 
    ? `Meeting transcription (${selectedMeeting.title || selectedMeeting.id})`
    : 'Meeting transcription (Live/Post Meeting)';

  return (
    <DashboardLayout activeTab="/transcriptions" userName="Mike Volkin" userEmail="mikevolkin@email.com">
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
              <li className="text-ellieBlue">TRANSCRIPTIONS</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
            Transcriptions
          </h1>

          {/* Two Panel Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Panel: All Transcriptions List */}
            <div className="flex-1 w-full lg:max-w-[65%] xl:max-w-[60%]">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                {/* Subtitle and Search Bar in Same Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
                  <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B]">
                    All Transcriptions
                  </h2>
                  {/* Search Bar */}
                  <div className="relative flex-shrink-0 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search by meeting id/link"
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

                {/* Mobile: Transcriptions Cards */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {meetingsLoading ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">Loading meetings...</div>
                  ) : meetingsError ? (
                    <div className="col-span-2 text-center py-8 text-red-500">Error loading meetings: {meetingsError}</div>
                  ) : filteredMeetings.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">No meetings found</div>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        onClick={() => setSelectedMeetingId(meeting.id || null)}
                        className={`
                          bg-white rounded-lg p-4 md:p-6 cursor-pointer transition-all hover:shadow-md
                          ${selectedMeetingId === meeting.id ? 'bg-blue-50 shadow-md' : ''}
                        `}
                      >
                        {/* Meeting ID with Actions */}
                        <div className="mb-3 md:mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                                Meeting ID
                              </label>
                              <p className="font-nunito text-sm md:text-base font-medium text-[#25324B]">
                                {meeting.id || 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 md:gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (meeting.id) {
                                    navigate(`/meeting-view?id=${meeting.id}`);
                                  }
                                }}
                                className="p-1.5 md:p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                aria-label="View"
                              >
                                <svg
                                  className="w-4 h-4 md:w-5 md:h-5 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Meeting Title */}
                        <div className="mb-2 md:mb-3">
                          <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                            Title
                          </label>
                          <p className="font-nunito text-xs md:text-sm font-medium text-[#25324B] line-clamp-2">
                            {meeting.title || 'Untitled Meeting'}
                          </p>
                        </div>

                        {/* Date/Time with Platform */}
                        <div className="pb-3 md:pb-4 border-b border-[#DEE1E6]">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                                Date/Time
                              </label>
                              <div className="flex flex-col gap-1">
                                <span className="font-nunito text-xs md:text-sm font-medium text-[#25324B]">
                                  {formatDate(meeting.started_at)}
                                </span>
                                <span className="font-nunito text-xs md:text-sm font-medium text-ellieGray">
                                  {formatTime(meeting.started_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                                Platform
                              </label>
                              <img
                                src={getPlatformIcon(meeting.platform)}
                                alt={meeting.platform || 'Unknown'}
                                className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain flex-shrink-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop: Transcriptions Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#DEE1E6]">
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Meeting ID
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] min-w-[250px]">
                          Title
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Date/Time
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Platform
                        </th>
                        <th className="text-center py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMeetings.map((meeting) => (
                        <tr
                          key={meeting.id}
                          onClick={() => setSelectedMeetingId(meeting.id || null)}
                          className={`
                            border-b border-[#DEE1E6] cursor-pointer transition-colors
                            ${selectedMeetingId === meeting.id ? 'bg-[rgba(50,122,173,0.1)]' : 'hover:bg-gray-50'}
                          `}
                        >
                          <td className="py-4 px-4 font-nunito text-base font-medium text-[#25324B] whitespace-nowrap">
                            {meeting.id || 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {meeting.meeting_link && (
                                  <>
                                    <a
                                      href={meeting.meeting_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-nunito text-base font-semibold text-[#0B5CFF] hover:underline truncate"
                                      title={meeting.meeting_link}
                                    >
                                      {meeting.meeting_link.length > 25
                                        ? `${meeting.meeting_link.substring(0, 25)}...`
                                        : meeting.meeting_link}
                                    </a>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyLink(meeting.meeting_link || '');
                                      }}
                                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                      aria-label="Copy link"
                                    >
                                      <svg
                                        className="w-4 h-4 text-ellieGray"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </button>
                                  </>
                                )}
                                {!meeting.meeting_link && (
                                  <span className="font-nunito text-base font-medium text-ellieGray">
                                    {meeting.title || 'No link'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="font-nunito text-base font-medium text-[#25324B]">
                                {formatDate(meeting.started_at)}
                              </span>
                              <span className="font-nunito text-base font-medium text-ellieGray">
                                {formatTime(meeting.started_at)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={getPlatformIcon(meeting.platform)}
                                alt={meeting.platform || 'Unknown'}
                                className="w-10 h-10 object-contain flex-shrink-0"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (meeting.id) {
                                    navigate(`/meeting-view?id=${meeting.id}`);
                                  }
                                }}
                                className="p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                aria-label="View"
                              >
                                <svg
                                  className="w-5 h-5 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel: Meeting Transcription Details */}
            <div className="flex-1 w-full lg:max-w-[35%] xl:max-w-[40%]">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8 h-full flex flex-col">
                {/* Header with Actions */}
                <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6 gap-2">
                  <h2 className="font-nunito text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[#25324B] truncate">
                    {headerTitle}
                  </h2>
                  <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0">
                    <button
                      type="button"
                      className="p-1.5 md:p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      aria-label="Download"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-ellieBlue"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-1.5 md:p-2 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                      aria-label="Share"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4 md:mb-6">
                  <input
                    type="text"
                    placeholder="Search by keyword or speaker"
                    value={transcriptionSearchQuery}
                    onChange={(e) => setTranscriptionSearchQuery(e.target.value)}
                    className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 lg:py-3 rounded-lg border border-[#7964A0] bg-white text-ellieBlack placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-xs md:text-sm lg:text-base"
                  />
                  <img
                    src={searchIcon}
                    alt="Search"
                    className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 object-contain"
                  />
                </div>

                {/* Transcription Dialogue */}
                <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 lg:space-y-6 pr-1 md:pr-2">
                  {!selectedMeetingId ? (
                    <div className="text-center py-8 text-gray-500">Select a meeting to view transcripts</div>
                  ) : transcriptsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading transcripts...</div>
                  ) : transcriptsError ? (
                    <div className="text-center py-8 text-red-500">Error loading transcripts: {transcriptsError}</div>
                  ) : filteredTranscripts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {transcripts.length === 0 
                        ? 'No transcripts available for this meeting'
                        : 'No transcripts match your search'}
                    </div>
                  ) : (
                    filteredTranscripts.map((transcript, index) => (
                      <div key={transcript.id || index} className="flex gap-2 md:gap-3 lg:gap-4">
                        <img
                          src={setupProfileAvatar}
                          alt={transcript.speaker || 'Speaker'}
                          className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5 md:mb-2">
                            <span className="font-nunito text-xs md:text-sm lg:text-base font-semibold text-ellieBlue">
                              {transcript.speaker || 'Unknown Speaker'}
                            </span>
                            <button
                              type="button"
                              className="p-0.5 md:p-1 hover:bg-gray-100 rounded transition-colors"
                              aria-label="More options"
                            >
                              <img
                                src={threeDotsIcon}
                                alt="More options"
                                className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 object-contain"
                              />
                            </button>
                          </div>
                          <p className="font-nunito text-xs md:text-sm lg:text-base text-[#25324B] leading-relaxed">
                            {transcript.message || ''}
                          </p>
                          {transcript.timestamp_seconds !== undefined && (
                            <span className="text-xs text-gray-400 mt-1 block">
                              {Math.floor(transcript.timestamp_seconds / 60)}:{(transcript.timestamp_seconds % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

