import { useState } from 'react';
import { DashboardLayout } from '../sidebar';
import zoomLogo from '../../assets/logos_zoom.png';
import searchIcon from '../../assets/Vector.png';

interface MeetingRecording {
  title: string;
  meetingLink: string;
  date: string;
  time: string;
  platform: string;
  platformIcon: string;
  duration: string;
  participants: number;
}

const MEETING_RECORDINGS: MeetingRecording[] = Array.from({ length: 5 }).map(() => ({
  title: 'Meeting title',
  meetingLink: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
  date: 'October 12, 2025',
  time: '05:02 PM',
  platform: 'zoom',
  platformIcon: zoomLogo,
  duration: '1 H 25 M',
  participants: 9,
}));

const SELECTED_MEETING: MeetingRecording = {
  title: 'Invite Ellie UX/UI Design Discussion & Project Timeline',
  meetingLink: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
  date: 'October 12, 2025',
  time: '05:02 PM',
  platform: 'zoom',
  platformIcon: zoomLogo,
  duration: '1 H 25 M',
  participants: 9,
};

export function MeetingRecordingsPage(): JSX.Element {
  const [selectedRecording, setSelectedRecording] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

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
              <li className="text-ellieBlue">MEETING RECORDINGS</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
            Meeting Recordings
          </h1>

          {/* Two Panel Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Panel: All Recordings List */}
            <div className="flex-1 w-full lg:max-w-[65%] xl:max-w-[60%]">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                {/* Subtitle and Search Bar in Same Row */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-4 md:mb-6">
                  <h2 className="font-nunito text-lg md:text-xl lg:text-2xl font-bold text-[#25324B]">
                    All Recordings
                  </h2>
                  {/* Search Bar */}
                  <div className="relative flex-shrink-0 w-full lg:w-auto">
                    <input
                      type="text"
                      placeholder="Search by meeting id/link"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full lg:min-w-[200px] xl:min-w-[250px] pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 lg:py-3 rounded-lg border border-[#7964A0] bg-white text-ellieBlack placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent font-nunito text-xs md:text-sm lg:text-base"
                    />
                    <img
                      src={searchIcon}
                      alt="Search"
                      className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 object-contain"
                    />
                  </div>
                </div>

                {/* Mobile: Recordings Cards */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {MEETING_RECORDINGS.map((recording, index) => (
                    <div
                      key={`${recording.title}-${index}`}
                      onClick={() => setSelectedRecording(index)}
                      className={`
                        bg-white p-4 md:p-6 cursor-pointer transition-all
                        ${selectedRecording === index ? 'bg-blue-50' : ''}
                      `}
                    >
                      {/* Details with Actions */}
                      <div className="mb-3 md:mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider">
                            Details
                          </label>
                          <div className="flex items-center gap-1 flex-shrink-0">
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
                        <div className="flex-1">
                          <p className="font-nunito text-xs md:text-sm font-bold text-[#25324B] mb-1">
                            {recording.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={recording.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-nunito text-xs md:text-sm font-semibold text-[#0B5CFF] hover:underline flex-1 truncate"
                              title={recording.meetingLink}
                            >
                              {recording.meetingLink.length > 20
                                ? `${recording.meetingLink.substring(0, 20)}...`
                                : recording.meetingLink}
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink(recording.meetingLink);
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
                        </div>
                      </div>

                      {/* Date/Time and Platform in One Row */}
                      <div className="pb-3 md:pb-4 border-b border-[#DEE1E6]">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                              Date/Time
                            </label>
                            <div className="flex flex-col gap-1">
                              <span className="font-nunito text-xs md:text-sm font-bold text-[#25324B]">
                                {recording.date}
                              </span>
                              <span className="font-nunito text-xs md:text-sm font-bold text-[#25324B]">
                                {recording.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <label className="font-nunito text-[10px] md:text-xs text-ellieGray uppercase tracking-wider mb-1 block">
                              Platform
                            </label>
                            <img
                              src={recording.platformIcon}
                              alt={recording.platform}
                              className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain flex-shrink-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Recordings Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#DEE1E6]">
                        <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] max-w-[300px]">
                          Details
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
                      {MEETING_RECORDINGS.map((recording, index) => (
                        <tr
                          key={`${recording.title}-${index}`}
                          onClick={() => setSelectedRecording(index)}
                          className={`
                            border-b border-[#DEE1E6] cursor-pointer transition-colors
                            ${selectedRecording === index ? 'bg-[rgba(50,122,173,0.1)]' : 'hover:bg-gray-50'}
                          `}
                        >
                          <td className="py-4 px-4 max-w-[300px]">
                            <div className="flex flex-col gap-1">
                              <p className="font-nunito text-base font-bold text-[#25324B]">
                                {recording.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <a
                                  href={recording.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-nunito text-base font-semibold text-[#0B5CFF] hover:underline truncate"
                                  title={recording.meetingLink}
                                >
                                  {recording.meetingLink.length > 18
                                    ? `${recording.meetingLink.substring(0, 18)}...`
                                    : recording.meetingLink}
                                </a>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyLink(recording.meetingLink);
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
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="font-nunito text-base font-bold text-[#25324B]">
                                {recording.date}
                              </span>
                              <span className="font-nunito text-base font-bold text-[#25324B]">
                                {recording.time}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={recording.platformIcon}
                                alt={recording.platform}
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

            {/* Right Panel: Video Player and Meeting Details */}
            <div className="flex-1 w-full lg:max-w-[35%] xl:max-w-[40%]">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8">
                {/* Video Player */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#101828] border border-[#E2E8F3] shadow-[0_18px_36px_rgba(16,24,40,0.28)]">
                  {/* Video Grid with Participants */}
                  <div className="absolute inset-0 grid grid-cols-3 gap-1 p-2">
                    {[
                      'Danielle Mendoza',
                      'Kristin Watson',
                      'Mady Warren',
                      'Cameron Williamson',
                      'Ralph Edwards',
                      'Jenna Davis',
                      'Floyd Miles',
                      'Jerome Bell',
                      'Savannah Nguyen',
                    ].map((name, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 rounded flex flex-col items-center justify-center text-white text-[10px] md:text-xs font-nunito relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
                        <span className="relative z-10 px-1 text-center truncate w-full">{name}</span>
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
                        {SELECTED_MEETING.title}
                      </p>
                    </div>

                    {/* Meeting Recording Link */}
                    <div>
                      <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                        Meeting Recording Link (Sharable)
                      </label>
                      <div className="flex items-center gap-2">
                        <a
                          href={SELECTED_MEETING.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-nunito text-sm md:text-base font-semibold text-[#0B5CFF] hover:underline flex-1 truncate"
                          title={SELECTED_MEETING.meetingLink}
                        >
                          {SELECTED_MEETING.meetingLink.length > 40
                            ? `${SELECTED_MEETING.meetingLink.substring(0, 40)}...`
                            : SELECTED_MEETING.meetingLink}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(SELECTED_MEETING.meetingLink)}
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

                    {/* Meeting Date and Total Duration in One Row */}
                    <div className="flex flex-row items-start justify-between gap-4 sm:gap-6">
                      {/* Meeting Date */}
                      <div className="flex-1">
                        <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                          Meeting Date
                        </label>
                        <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
                          {SELECTED_MEETING.date} | {SELECTED_MEETING.time}
                        </p>
                      </div>

                      {/* Total Duration */}
                      <div className="flex-1">
                        <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                          Total Duration
                        </label>
                        <p className="font-nunito text-sm md:text-base lg:text-lg font-bold text-[#25324B]">
                          {SELECTED_MEETING.duration}
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
                          {SELECTED_MEETING.participants}
                        </p>
                      </div>

                      {/* Platform */}
                      <div className="flex-1">
                        <label className="font-nunito text-xs md:text-sm text-ellieGray mb-1 block">
                          Platform
                        </label>
                        <div className="flex items-center">
                          <img
                            src={SELECTED_MEETING.platformIcon}
                            alt={SELECTED_MEETING.platform}
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
        </div>
      </div>
    </DashboardLayout>
  );
}

