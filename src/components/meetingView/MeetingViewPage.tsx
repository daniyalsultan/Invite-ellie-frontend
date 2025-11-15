import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import zoomLogo from '../../assets/logos_zoom.png';
import searchIcon from '../../assets/Vector.png';
import setupProfileAvatar from '../../assets/setup-profile-avatar.png';
import threeDotsIcon from '../../assets/3dotsinrow.png';
import twoStarsIcon from '../../assets/twostars.png';
import { useMeeting, useTranscripts, useAINotes } from '../../hooks/useMeetings';
import { apiService } from '../../services/api';

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

function formatDuration(seconds?: number): string {
  if (!seconds) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} H ${minutes} M`;
  }
  return `${minutes} M`;
}

function getPlatformIcon(platform?: string): string {
  if (platform?.toLowerCase().includes('zoom')) return zoomLogo;
  return zoomLogo;
}

export function MeetingViewPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get('id') || 'test-meeting-1';
  const [transcriptionSearchQuery, setTranscriptionSearchQuery] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Fetch data from backend
  const { meeting, loading: meetingLoading, error: meetingError } = useMeeting(meetingId);
  const { transcripts, loading: transcriptsLoading, error: transcriptsError } = useTranscripts(meetingId);
  const { notes, loading: notesLoading, error: notesError, refresh: refreshNotes } = useAINotes(meetingId);

  // Extract summary, highlights, and action items from AI notes
  const summaryNote = useMemo(() => {
    return notes.find(n => n.type === 'summary');
  }, [notes]);

  const highlightsNote = useMemo(() => {
    return notes.find(n => n.type === 'highlights');
  }, [notes]);

  const actionItemsNote = useMemo(() => {
    return notes.find(n => n.type === 'action_items');
  }, [notes]);

  const meetingSummary = summaryNote?.content?.summary || '';
  const highlights = highlightsNote?.content?.highlights || summaryNote?.content?.highlights || [];
  const actionItems = actionItemsNote?.content?.items || [];

  // Filter transcripts based on search
  const filteredTranscripts = useMemo(() => {
    if (!transcriptionSearchQuery.trim()) return transcripts;
    const query = transcriptionSearchQuery.toLowerCase();
    return transcripts.filter(
      t => t.speaker?.toLowerCase().includes(query) || t.message?.toLowerCase().includes(query)
    );
  }, [transcripts, transcriptionSearchQuery]);

  // Handle summarization
  const handleSummarize = async () => {
    if (!meetingId) return;
    setIsSummarizing(true);
    try {
      await apiService.summarizeMeeting(meetingId);
      // Refresh notes after summarization
      setTimeout(() => {
        refreshNotes();
      }, 1000);
    } catch (error) {
      console.error('Failed to summarize meeting:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyLink = (link: string): void => {
    navigator.clipboard.writeText(link);
  };

  return (
    <DashboardLayout activeTab="/meeting-recordings" userName="Mike Volkin" userEmail="mikevolkin@email.com">
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
              <li className="text-ellieBlue">MEETING ID # {meetingId}</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
            {meetingLoading ? 'Loading...' : meeting?.title || `Meeting ID # ${meetingId}`}
          </h1>

          {/* Error Messages */}
          {meetingError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">Error loading meeting: {meetingError}</p>
            </div>
          )}

          {/* Three Column Layout for Desktop */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Column 1: Video Player and Meeting Details */}
            <div className="w-full lg:col-span-1">
              <div className="space-y-6 md:space-y-8">
                {/* Video Player */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#101828] border border-[#E2E8F3] shadow-[0_18px_36px_rgba(16,24,40,0.28)]">
                  {/* Video Grid with Participants */}
                  <div className="absolute inset-0 grid grid-cols-3 gap-1 p-2">
                    {Array.from({ length: Math.max(1, meeting?.participant_count || 3) }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 rounded flex flex-col items-center justify-center text-white text-[10px] md:text-xs font-nunito relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
                        <span className="relative z-10 px-1 text-center truncate w-full">Participant {i + 1}</span>
                      </div>
                    ))}
                  </div>
                  {/* Play Button */}
                  <button
                    type="button"
                    className="absolute left-1/2 top-1/2 flex h-14 w-14 md:h-16 md:w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F04438] text-white shadow-[0_18px_38px_rgba(240,68,56,0.35)] transition hover:scale-105 z-10"
                    aria-label="Play meeting recording"
                  >
                    <svg
                      aria-hidden
                      className="ml-1 h-6 w-6 md:h-7 md:w-7"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  {/* Video Controls Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-2 md:p-3">
                    <div className="flex items-center justify-between text-white text-[10px] md:text-xs font-nunito">
                      <span className="font-semibold">QA Planning</span>
                      <div className="flex items-center gap-1 md:gap-2">
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Microphone">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                          </svg>
                        </button>
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Camera">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                          </svg>
                        </button>
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Share">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                          </svg>
                        </button>
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Chat">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                          </svg>
                        </button>
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Participants">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                        </button>
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Settings">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                          </svg>
                        </button>
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors" aria-label="Fullscreen">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                          </svg>
                        </button>
                        <button className="p-1 md:p-1.5 hover:bg-white/20 rounded transition-colors text-red-400" aria-label="Leave">
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting Details */}
                <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                  <div className="space-y-4 md:space-y-5">
                    <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B] pb-3 md:pb-4 border-b border-[#DEE1E6]">
                      Meeting Details
                    </h2>
                    
                    <div className="space-y-4 md:space-y-5">
                      {/* Meeting Title */}
                      <div>
                        <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                          Meeting title
                        </label>
                        <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
                          {meeting?.title || 'Loading...'}
                        </p>
                      </div>

                      {/* Meeting Recording Link */}
                      {meeting?.recording_url && (
                        <div>
                          <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                            Meeting Recording Link (Sharable)
                          </label>
                          <div className="flex items-center gap-2">
                            <a
                              href={meeting.recording_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-nunito text-sm md:text-base font-semibold text-[#0B5CFF] hover:underline flex-1 truncate"
                              title={meeting.recording_url}
                            >
                              {meeting.recording_url.length > 40
                                ? `${meeting.recording_url.substring(0, 40)}...`
                                : meeting.recording_url}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyLink(meeting.recording_url || '')}
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
                          </div>
                        </div>
                      )}

                      {/* Meeting Date and Total Duration in One Row */}
                      <div className="flex flex-row items-start justify-between gap-4 sm:gap-6">
                        {/* Meeting Date */}
                        <div className="flex-1">
                          <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                            Meeting Date
                          </label>
                          <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
                            {meeting?.started_at ? `${formatDate(meeting.started_at)} | ${formatTime(meeting.started_at)}` : 'N/A'}
                          </p>
                        </div>

                        {/* Total Duration */}
                        <div className="flex-1">
                          <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                            Total Duration
                          </label>
                          <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
                            {formatDuration(meeting?.duration_seconds)}
                          </p>
                        </div>
                      </div>

                      {/* Total Participants and Platform in One Row */}
                      <div className="flex flex-row items-start justify-between gap-4 sm:gap-6">
                        {/* Total Participants */}
                        <div className="flex-1">
                          <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                            Total Participants
                          </label>
                          <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
                            {meeting?.participant_count || 'N/A'}
                          </p>
                        </div>

                        {/* Platform */}
                        <div className="flex-1">
                          <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                            Platform
                          </label>
                          <div className="flex items-center">
                            <img
                              src={getPlatformIcon(meeting?.platform)}
                              alt={meeting?.platform || 'Unknown'}
                              className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Meeting Transcription */}
            <div className="w-full lg:col-span-1">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8 h-full flex flex-col">
                {/* Header with Actions */}
                <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6 gap-2">
                  <h2 className="font-nunito text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[#25324B] truncate">
                    Meeting transcription (Live/Post...
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
                <div className="flex-1 space-y-3 md:space-y-4 lg:space-y-6 pr-1 md:pr-2 overflow-y-auto">
                  {transcriptsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading transcripts...</div>
                  ) : transcriptsError ? (
                    <div className="text-center py-8 text-red-500">Error loading transcripts: {transcriptsError}</div>
                  ) : filteredTranscripts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No transcripts available</div>
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

            {/* Column 3: AI Notes & Suggestions */}
            <div className="w-full lg:col-span-1">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                <div className="space-y-4 md:space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B]">
                        AI Notes & Suggestions
                      </h2>
                      <img
                        src={twoStarsIcon}
                        alt="AI Notes"
                        className="w-5 h-5 md:w-6 md:h-6 object-contain"
                      />
                    </div>
                    {transcripts.length > 0 && !summaryNote && (
                      <button
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="px-3 py-1.5 bg-purple-600 text-white text-xs md:text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSummarizing ? 'Generating...' : 'Generate Summary'}
                      </button>
                    )}
                  </div>

                  {notesLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading AI notes...</div>
                  ) : notesError ? (
                    <div className="text-center py-8 text-red-500">Error loading notes: {notesError}</div>
                  ) : (
                    <>
                      {/* Meeting Conclusion / Summary */}
                      {meetingSummary && (
                        <div className="bg-purple-50 rounded-lg p-4 md:p-5">
                          <h3 className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B] mb-2 md:mb-3">
                            Meeting Conclusion
                          </h3>
                          <p className="font-nunito text-xs md:text-sm lg:text-base text-[#25324B] leading-relaxed">
                            {meetingSummary}
                          </p>
                        </div>
                      )}

                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4 md:p-5">
                          <h3 className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B] mb-3 md:mb-4">
                            Highlights
                          </h3>
                          <ul className="space-y-2 md:space-y-3 list-disc list-inside">
                            {highlights.map((highlight, index) => (
                              <li key={index} className="font-nunito text-xs md:text-sm lg:text-base text-[#25324B] leading-relaxed">
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Items */}
                      {actionItems.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4 md:p-5">
                          <h3 className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B] mb-3 md:mb-4">
                            Action Items
                          </h3>
                          <ol className="space-y-3 md:space-y-4 list-decimal list-inside">
                            {actionItems.map((item: any, index: number) => (
                              <li key={index} className="font-nunito text-xs md:text-sm lg:text-base text-[#25324B] leading-relaxed">
                                <span className="font-semibold">{item.text || item}</span>
                                {item.owner && (
                                  <span className="text-ellieGray"> (Owner: {item.owner}{item.due ? `, Due: ${item.due}` : ''})</span>
                                )}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {!meetingSummary && highlights.length === 0 && actionItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          {transcripts.length > 0 
                            ? 'No AI notes yet. Click "Generate Summary" to create one.'
                            : 'No transcripts available. Transcripts are needed to generate summaries.'}
                        </div>
                      )}
                    </>
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

