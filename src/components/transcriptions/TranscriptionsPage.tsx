import { useState } from 'react';
import { DashboardLayout } from '../sidebar';
import zoomLogo from '../../assets/logos_zoom.png';
import searchIcon from '../../assets/Vector.png';
import setupProfileAvatar from '../../assets/setup-profile-avatar.png';
import threeDotsIcon from '../../assets/3dotsinrow.png';

interface Transcription {
  id: string;
  meetingLink: string;
  date: string;
  time: string;
  platform: string;
  platformIcon: string;
}

interface TranscriptionMessage {
  speaker: string;
  avatar: string;
  message: string;
}

const TRANSCRIPTIONS: Transcription[] = Array.from({ length: 5 }).map(() => ({
  id: '123456789',
  meetingLink: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
  date: 'October 12, 2025',
  time: '05:02 PM',
  platform: 'zoom',
  platformIcon: zoomLogo,
}));

const TRANSCRIPTION_MESSAGES: TranscriptionMessage[] = [
  {
    speaker: 'Theresa Webb',
    avatar: setupProfileAvatar,
    message: "Yes, I'll share the updated designs by tomorrow so we can finalize the review before Friday.",
  },
  {
    speaker: 'Theresa Webb',
    avatar: setupProfileAvatar,
    message: "Let's make sure we address the feedback from the last sprint during our next check-in.",
  },
  {
    speaker: 'Theresa Webb',
    avatar: setupProfileAvatar,
    message: 'I think we should confirm the final color palette today so development can move forward.',
  },
  {
    speaker: 'Theresa Webb',
    avatar: setupProfileAvatar,
    message: "I'll prepare a quick summary of the tasks and assign owners after this meeting.",
  },
];

export function TranscriptionsPage(): JSX.Element {
  const [selectedTranscription, setSelectedTranscription] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [transcriptionSearchQuery, setTranscriptionSearchQuery] = useState('');

  const handleCopyLink = (link: string): void => {
    navigator.clipboard.writeText(link);
  };

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
                  {TRANSCRIPTIONS.map((transcription, index) => (
                    <div
                      key={`${transcription.id}-${index}`}
                      onClick={() => setSelectedTranscription(index)}
                      className={`
                        bg-white rounded-lg p-4 md:p-6 cursor-pointer transition-all hover:shadow-md
                        ${selectedTranscription === index ? 'bg-blue-50 shadow-md' : ''}
                      `}
                    >
                      {/* Transcription ID with Actions */}
                      <div className="mb-3 md:mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                              Transcription ID
                            </label>
                            <p className="font-nunito text-sm md:text-base font-medium text-[#25324B]">
                              {transcription.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 md:gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
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
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
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
                              onClick={(e) => e.stopPropagation()}
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
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 md:p-2 bg-red-50 hover:bg-red-100 rounded transition-colors"
                              aria-label="Delete"
                            >
                              <svg
                                className="w-4 h-4 md:w-5 md:h-5 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Meeting Link */}
                      <div className="mb-3 md:mb-4">
                        <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                          Meeting Link
                        </label>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <a
                              href={transcription.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-nunito text-xs md:text-sm font-semibold text-[#0B5CFF] hover:underline flex-1 truncate"
                              title={transcription.meetingLink}
                            >
                              {transcription.meetingLink.length > 20
                                ? `${transcription.meetingLink.substring(0, 20)}...`
                                : transcription.meetingLink}
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink(transcription.meetingLink);
                              }}
                              className="flex-shrink-0 p-0.5 md:p-1 hover:bg-gray-100 rounded transition-colors"
                              aria-label="Copy link"
                            >
                              <svg
                                className="w-3 h-3 md:w-4 md:h-4 text-ellieGray"
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
                          <span className="font-nunito text-[10px] md:text-xs text-ellieGray">Start with</span>
                        </div>
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
                                {transcription.date}
                              </span>
                              <span className="font-nunito text-xs md:text-sm font-medium text-ellieGray">
                                {transcription.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                              Platform
                            </label>
                            <img
                              src={transcription.platformIcon}
                              alt={transcription.platform}
                              className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain flex-shrink-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Transcriptions Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#DEE1E6]">
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] whitespace-nowrap">
                          Transcription ID
                        </th>
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] min-w-[250px]">
                          Meeting Link
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
                      {TRANSCRIPTIONS.map((transcription, index) => (
                        <tr
                          key={`${transcription.id}-${index}`}
                          onClick={() => setSelectedTranscription(index)}
                          className={`
                            border-b border-[#DEE1E6] cursor-pointer transition-colors
                            ${selectedTranscription === index ? 'bg-[rgba(50,122,173,0.1)]' : 'hover:bg-gray-50'}
                          `}
                        >
                          <td className="py-4 px-4 font-nunito text-base font-medium text-[#25324B] whitespace-nowrap">
                            {transcription.id}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <a
                                  href={transcription.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-nunito text-base font-semibold text-[#0B5CFF] hover:underline"
                                  title={transcription.meetingLink}
                                >
                                  {transcription.meetingLink.length > 25
                                    ? `${transcription.meetingLink.substring(0, 25)}...`
                                    : transcription.meetingLink}
                                </a>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyLink(transcription.meetingLink);
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
                              </div>
                              <span className="font-nunito text-sm text-ellieGray">Start with</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="font-nunito text-base font-medium text-[#25324B]">
                                {transcription.date}
                              </span>
                              <span className="font-nunito text-base font-medium text-ellieGray">
                                {transcription.time}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={transcription.platformIcon}
                                alt={transcription.platform}
                                className="w-10 h-10 object-contain flex-shrink-0"
                              />
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
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
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                aria-label="Download"
                              >
                                <svg
                                  className="w-5 h-5 text-ellieBlue"
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
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                                aria-label="Share"
                              >
                                <svg
                                  className="w-5 h-5 text-purple-600"
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
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                aria-label="Delete"
                              >
                                <svg
                                  className="w-5 h-5 text-red-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
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
                    Meeting transcription (Live/Post Meeti...
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
                  {TRANSCRIPTION_MESSAGES.map((msg, index) => (
                    <div key={index} className="flex gap-2 md:gap-3 lg:gap-4">
                      <img
                        src={msg.avatar}
                        alt={msg.speaker}
                        className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5 md:mb-2">
                          <span className="font-nunito text-xs md:text-sm lg:text-base font-semibold text-ellieBlue">
                            {msg.speaker}
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
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

