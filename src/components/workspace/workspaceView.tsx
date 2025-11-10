import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import searchIcon from '../../assets/Vector.png';
import zoomLogo from '../../assets/logos_zoom.png';
import setupProfileAvatar from '../../assets/setup-profile-avatar.png';
import threeDotsIcon from '../../assets/3dotsinrow.png';

interface WorkspaceFolder {
  name: string;
  id: string;
}

interface MeetingItem {
  title: string;
  link: string;
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

const WORKSPACE_ID = '123456';

const FOLDERS: WorkspaceFolder[] = Array.from({ length: 8 }).map((_, index) => ({
  name: `Folder name`,
  id: `12354${index + 566}`,
}));

const RECENT_MEETINGS: MeetingItem[] = Array.from({ length: 5 }).map(() => ({
  title: 'Meeting title',
  link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie',
  date: 'October 12, 2025',
  time: '05:02 PM',
  platform: 'zoom',
  platformIcon: zoomLogo,
}));

const TRANSCRIPTION_MESSAGES: TranscriptionMessage[] = [
  {
    speaker: 'Alicia Chen',
    avatar: setupProfileAvatar,
    message: 'We need final UI changes by Thursday so we can hand off to development on Friday.',
  },
  {
    speaker: 'Mark Stevens',
    avatar: setupProfileAvatar,
    message: "I'll update the Figma file and send it in Slack once the revisions are ready.",
  },
  {
    speaker: 'David Patel',
    avatar: setupProfileAvatar,
    message: 'Can we clarify the analytics tracking requirements before the next sprint?',
  },
  {
    speaker: 'Alicia Chen',
    avatar: setupProfileAvatar,
    message: 'Great — let’s lock in the copy updates tomorrow morning.',
  },
];

export function WorkspaceViewPage(): JSX.Element {
  const [folderSearch, setFolderSearch] = useState('');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [transcriptionSearch, setTranscriptionSearch] = useState('');

  const filteredFolders = useMemo(() => {
    const query = folderSearch.trim().toLowerCase();
    if (!query) return FOLDERS;
    return FOLDERS.filter((folder) => folder.name.toLowerCase().includes(query) || folder.id.includes(query));
  }, [folderSearch]);

  const filteredMeetings = useMemo(() => {
    const query = meetingSearch.trim().toLowerCase();
    if (!query) return RECENT_MEETINGS;
    return RECENT_MEETINGS.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.link.toLowerCase().includes(query) ||
        meeting.platform.toLowerCase().includes(query),
    );
  }, [meetingSearch]);

  const filteredMessages = useMemo(() => {
    const query = transcriptionSearch.trim().toLowerCase();
    if (!query) return TRANSCRIPTION_MESSAGES;
    return TRANSCRIPTION_MESSAGES.filter(
      (msg) =>
        msg.speaker.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query),
    );
  }, [transcriptionSearch]);

  return (
    <DashboardLayout
      activeTab="/workspaces"
      userName="Mike Volkin"
      userEmail="mikevolkin@email.com"
    >
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-3 md:mb-4 lg:mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <Link to="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li>
                <Link to="/workspaces" className="hover:text-ellieBlack transition-colors">
                  Workspaces
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">Workspace # {WORKSPACE_ID}</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6 lg:mb-8">
            Workspace # {WORKSPACE_ID}
          </h1>

          <div className="flex flex-col lg:grid lg:grid-cols-[30%_35%_35%] gap-6 lg:gap-3">
            {/* Column 1: Folders */}
            <div className="space-y-4 lg:pr-3">
              <div className="relative">
                <input
                  type="text"
                  value={folderSearch}
                  onChange={(event) => setFolderSearch(event.target.value)}
                  placeholder="Search by folder name"
                  className="w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2.5 md:py-3 rounded-lg border border-[#CBD3E3] bg-white text-sm md:text-base font-nunito text-[#25324B] placeholder-[#94A3C1] focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent"
                />
                <img
                  src={searchIcon}
                  alt="Search folders"
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {filteredFolders.map((folder, index) => (
                  <div
                    key={`${folder.id}-${index}`}
                    className="rounded-2xl border border-[#E3E7F2] bg-[#F7F9FC] px-4 py-5 flex flex-col gap-3 items-start shadow-[0_12px_24px_rgba(39,62,99,0.06)]"
                  >
                    <div className="flex h-10 w-12 items-center justify-center rounded-md bg-[#D9E2F5] text-[#6B7A96]">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-nunito text-sm md:text-base font-semibold text-[#25324B]">
                        {folder.name}
                      </p>
                      <p className="font-nunito text-xs text-[#6B7A96]">{folder.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Recent Meetings */}
            <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:px-4 lg:py-6 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                <h2 className="font-nunito text-lg md:text-xl font-bold text-[#25324B]">Recent Meetings</h2>
                <div className="relative w-full sm:w-auto sm:min-w-[220px]">
                  <input
                    type="text"
                    value={meetingSearch}
                    onChange={(event) => setMeetingSearch(event.target.value)}
                    placeholder="Search by meeting id/link"
                    className="w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2.5 md:py-3 rounded-lg border border-[#CBD3E3] bg-white text-sm md:text-base font-nunito text-[#25324B] placeholder-[#94A3C1] focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent"
                  />
                  <img
                    src={searchIcon}
                    alt="Search meetings"
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 object-contain"
                  />
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-[#E6E9F2]">
                      <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] w-[50%]">
                        Details
                      </th>
                      <th className="text-right py-3 px-2 font-nunito text-base font-semibold text-[#25324B] w-[20%]">
                        Date/Time
                      </th>
                      <th className="text-right py-3 px-2 font-nunito text-base font-semibold text-[#25324B] w-[16%]">
                        Platform
                      </th>
                      <th className="text-right py-3 px-2 font-nunito text-base font-semibold text-[#25324B] w-[16%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeetings.map((meeting, index) => (
                      <tr
                        key={`${meeting.title}-${index}`}
                        className="border-b border-[#EEE9FE] last:border-b-0 hover:bg-[#F6F7FB]"
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-nunito text-base font-semibold text-[#25324B]">
                              {meeting.title}
                            </span>
                            <div className="flex items-center gap-2 min-w-0">
                              <a
                                href={meeting.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-nunito text-sm font-semibold text-[#0B5CFF] hover:underline truncate"
                              >
                                {meeting.link.length > 20 ? `${meeting.link.slice(0, 20)}...` : meeting.link}
                              </a>
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                aria-label="Copy meeting link"
                                onClick={() => navigator.clipboard.writeText(meeting.link)}
                              >
                                <svg
                                  className="w-4 h-4 text-[#6B7A96]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
                                  <path d="M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-nunito text-base font-semibold text-[#25324B]">
                              {meeting.date}
                            </span>
                            <span className="font-nunito text-sm text-[#6B7A96]">{meeting.time}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <img
                            src={meeting.platformIcon}
                            alt={meeting.platform}
                            className="w-8 h-8 ml-auto"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-[#1F6FB5]"
                              aria-label="View meeting"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-[#E45A5A]"
                              aria-label="Delete meeting"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <div className="lg:hidden flex flex-col gap-4">
                {filteredMeetings.map((meeting, index) => (
                  <div
                    key={`${meeting.title}-mobile-${index}`}
                    className="rounded-2xl border border-[#E6E9F2] p-4 shadow-[0_12px_24px_rgba(39,62,99,0.05)]"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-nunito text-base font-semibold text-[#25324B]">{meeting.title}</h3>
                        <a
                          href={meeting.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-nunito text-sm font-semibold text-[#0B5CFF] hover:underline truncate"
                        >
                          {meeting.link.length > 32 ? `${meeting.link.slice(0, 32)}...` : meeting.link}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-[#1F6FB5]"
                          aria-label="View meeting"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-[#E45A5A]"
                          aria-label="Delete meeting"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[#6B7A96]">
                      <div>
                        <span className="font-semibold text-[#25324B]">{meeting.date}</span>
                        <span className="ml-1">{meeting.time}</span>
                      </div>
                      <img src={meeting.platformIcon} alt={meeting.platform} className="w-8 h-8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Meeting Details + Transcription */}
            <div className="space-y-6 md:space-y-8 lg:pl-3">
              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-5">
                  <h2 className="font-nunito text-lg md:text-xl font-bold text-[#25324B]">Meeting title</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-[#1F6FB5]"
                      aria-label="Download recording"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-[#7C3AED]"
                      aria-label="Share recording"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#101828] border border-[#E2E8F3] shadow-[0_18px_36px_rgba(16,24,40,0.28)]">
                  <div className="absolute inset-0 grid grid-cols-3 gap-1 p-2">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 rounded flex items-center justify-center text-white text-xs font-nunito"
                      >
                        P{index + 1}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="absolute left-1/2 top-1/2 flex h-14 w-14 md:h-16 md:w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F04438] text-white shadow-[0_18px_38px_rgba(240,68,56,0.35)] transition hover:scale-105"
                    aria-label="Play meeting recording"
                  >
                    <svg className="h-6 w-6 md:h-7 md:w-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="font-nunito text-lg md:text-xl font-bold text-[#25324B]">
                    Meeting transcription (Live/Post Meetings)
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-[#1F6FB5]"
                      aria-label="Download transcription"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-[#7C3AED]"
                      aria-label="Share transcription"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="relative mb-4">
                  <input
                    type="text"
                    value={transcriptionSearch}
                    onChange={(event) => setTranscriptionSearch(event.target.value)}
                    placeholder="Search by keyword or speaker"
                    className="w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2.5 md:py-3 rounded-lg border border-[#CBD3E3] bg-white text-sm md:text-base font-nunito text-[#25324B] placeholder-[#94A3C1] focus:outline-none focus:ring-2 focus:ring-ellieBlue focus:border-transparent"
                  />
                  <img
                    src={searchIcon}
                    alt="Search transcription"
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 object-contain"
                  />
                </div>

                <div className="space-y-3 md:space-y-4 lg:space-y-5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredMessages.map((msg, index) => (
                    <div key={`${msg.speaker}-${index}`} className="flex gap-3">
                      <img
                        src={msg.avatar}
                        alt={msg.speaker}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-nunito text-sm md:text-base font-semibold text-ellieBlue">
                            {msg.speaker}
                          </span>
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            aria-label="More options"
                          >
                            <img
                              src={threeDotsIcon}
                              alt="More options"
                              className="w-4 h-4 md:w-5 md:h-5 object-contain"
                            />
                          </button>
                        </div>
                        <p className="font-nunito text-sm md:text-base text-[#25324B] leading-relaxed">
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

