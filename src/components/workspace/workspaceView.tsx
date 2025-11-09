import { Link } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import searchIcon from '../../assets/Vector.png';
import zoomIcon from '../../assets/integration-zoom.svg';
import videoPreview from '../../assets/manage recordings.png';

const meetingAvatar = '/assets/dashboard/meeting-id-avatar.svg';
const shareIcon = '/assets/dashboard/workspace-help-icon.svg';
const copyLinkIcon = '/assets/dashboard/meeting-id-question.svg';

interface FolderItem {
  name: string;
  id: string;
}

interface MeetingItem {
  title: string;
  link: string;
  date: string;
  time: string;
  platform: string;
}

interface TranscriptItem {
  speaker: string;
  message: string;
  time: string;
}

const FOLDERS: FolderItem[] = [
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
  { name: 'Folder name', id: '12354566' },
];

const MEETINGS: MeetingItem[] = [
  {
    title: 'Meeting title',
    link: 'https://www.figma.com/design/InviteEllie',
    date: 'October 12, 2025',
    time: '05:02 PM',
    platform: 'Zoom',
  },
  {
    title: 'Meeting title',
    link: 'https://www.figma.com/design/InviteEllie',
    date: 'October 12, 2025',
    time: '05:02 PM',
    platform: 'Zoom',
  },
  {
    title: 'Meeting title',
    link: 'https://www.figma.com/design/InviteEllie',
    date: 'October 12, 2025',
    time: '05:02 PM',
    platform: 'Zoom',
  },
  {
    title: 'Meeting title',
    link: 'https://www.figma.com/design/InviteEllie',
    date: 'October 12, 2025',
    time: '05:02 PM',
    platform: 'Zoom',
  },
  {
    title: 'Meeting title',
    link: 'https://www.figma.com/design/InviteEllie',
    date: 'October 12, 2025',
    time: '05:02 PM',
    platform: 'Zoom',
  },
];

const TRANSCRIPTS: TranscriptItem[] = [
  {
    speaker: 'Alicia Chen',
    message:
      'We need final UI changes by Thursday so we can hand off to development on Friday.',
    time: '04:58 PM',
  },
  {
    speaker: 'Mark Stevens',
    message: "I\'ll update the Figma file and send it in Slack once the revisions are ready.",
    time: '04:54 PM',
  },
  {
    speaker: 'David Patel',
    message: 'Can we schedule a follow-up meeting to review the integration checklist?',
    time: '04:50 PM',
  },
];

export function WorkspaceViewPage(): JSX.Element {
  return (
    <DashboardLayout activeTab="/workspaces">
      <section className="min-h-full bg-[#F7F9FC] px-4 py-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1344px] flex-col gap-6">
          <header className="flex flex-col gap-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-nunito text-[12px] font-semibold uppercase tracking-[0.18em] text-[#5E6A81]"
            >
              <Link to="/dashboard" className="text-[#5E6A81] transition hover:text-[#1F6FB5]">
                Dashboard
              </Link>
              <span aria-hidden>›</span>
              <span className="text-[#2F3C58]">Workspace # 123456</span>
            </nav>

            <div className="flex flex-col gap-2">
              <h1 className="font-nunito text-[34px] font-extrabold leading-tight text-[#1C2A4A] lg:text-[40px]">
                Workspace # 123456
              </h1>
              <p className="font-nunito text-[14px] text-[#6B7A96]">
                Access folders, meeting records, and live transcripts tailored for this workspace.
              </p>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
            <div className="flex flex-col gap-6">
              <section className="rounded-3xl border border-[#E2E8F3] bg-white px-5 py-6 shadow-[0_22px_48px_rgba(39,62,99,0.08)] sm:px-6 lg:px-8 lg:py-7">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="font-nunito text-[18px] font-extrabold text-[#1F2E4D]">
                      Workspace folders
                    </h2>
                    <div className="relative w-full max-w-[320px]">
                      <img
                        src={searchIcon}
                        alt=""
                        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-70"
                      />
                      <input
                        type="search"
                        placeholder="Search by folder name"
                        className="w-full rounded-2xl border border-[#D9E2F2] bg-[#F7F9FC] px-11 py-3 font-nunito text-[14px] text-[#1F2E4D] placeholder:text-[#7C8BA6] focus:border-[#1F6FB5] focus:outline-none focus:ring-4 focus:ring-[#1F6FB510]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {FOLDERS.map((folder, index) => (
                      <article
                        key={`${folder.name}-${index}`}
                        className="flex flex-col gap-4 rounded-2xl border border-[#E5ECF8] bg-[#F9FBFF] p-5 shadow-[0_16px_32px_rgba(39,62,99,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(39,62,99,0.08)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl bg-[#E5EEFF]">
                            <svg
                              aria-hidden
                              className="h-7 w-7 text-[#3F6ACA]"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M4 5h6l2 3h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2v11h16V10H11.236l-2-3H4z" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-nunito text-[16px] font-extrabold text-[#1B2B4A]">
                              {folder.name}
                            </h3>
                            <p className="font-nunito text-[13px] text-[#7A8CB0]">{folder.id}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#E2E8F3] bg-white px-5 py-6 shadow-[0_22px_48px_rgba(39,62,99,0.08)] sm:px-6 lg:px-8 lg:py-7">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="font-nunito text-[18px] font-extrabold text-[#1F2E4D]">
                        Recent Meetings
                      </h2>
                      <p className="font-nunito text-[13px] text-[#7A8CB0]">
                        Overview of latest sessions organized in this workspace.
                      </p>
                    </div>
                    <div className="relative w-full max-w-[340px]">
                      <img
                        src={searchIcon}
                        alt=""
                        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-70"
                      />
                      <input
                        type="search"
                        placeholder="Search by meeting id/link"
                        className="w-full rounded-2xl border border-[#D9E2F2] bg-[#F7F9FC] px-11 py-3 font-nunito text-[14px] text-[#1F2E4D] placeholder:text-[#7C8BA6] focus:border-[#1F6FB5] focus:outline-none focus:ring-4 focus:ring-[#1F6FB510]"
                      />
                    </div>
                  </div>

                  <div className="hidden items-center rounded-xl bg-[#F5F7FB] px-5 py-3 font-nunito text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7A96] lg:flex lg:gap-6">
                    <span className="lg:w-[320px] text-left">Details</span>
                    <div className="ml-auto flex w-full max-w-[480px] items-center justify-between">
                      <span className="w-[160px] text-center">Date/Time</span>
                      <span className="w-[120px] text-center">Platform</span>
                      <span className="w-[120px] text-center">Actions</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {MEETINGS.map((meeting, index) => (
                      <article
                        key={`${meeting.title}-${index}`}
                        className="flex flex-col gap-4 rounded-2xl border border-[#E7ECF5] bg-[#FBFDFF] px-5 py-5 shadow-[0_16px_32px_rgba(39,62,99,0.06)] transition hover:shadow-[0_20px_40px_rgba(39,62,99,0.08)] lg:flex-row lg:items-center lg:gap-6"
                      >
                        <div className="flex items-start justify-between gap-4 lg:w-[320px] lg:items-center">
                          <div className="flex flex-col gap-3">
                            <h3 className="font-nunito text-[18px] font-extrabold text-[#18233F]">
                              {meeting.title}
                            </h3>
                            <a
                              href={meeting.link}
                              target="_blank"
                              rel="noreferrer"
                              className="group inline-flex items-center gap-2 font-nunito text-[14px] font-semibold text-[#1F6FB5]"
                            >
                              {meeting.link}
                              <img
                                src={copyLinkIcon}
                                alt=""
                                className="h-4 w-4 transition group-hover:scale-105"
                              />
                            </a>
                          </div>
                          <div className="flex items-center gap-3 lg:hidden">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F1FF] text-[#1F6FB5] shadow-[0_8px_16px_rgba(31,111,181,0.2)] transition hover:opacity-90"
                              aria-label={`View ${meeting.title}`}
                            >
                              <svg
                                aria-hidden
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFE6E6] text-[#E45A5A] shadow-[0_8px_16px_rgba(228,90,90,0.2)] transition hover:opacity-90"
                              aria-label={`Delete ${meeting.title}`}
                            >
                              <svg
                                aria-hidden
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 border-t border-[#EEF2F8] pt-4 sm:grid-cols-2 lg:ml-auto lg:w-full lg:max-w-[480px] lg:flex lg:flex-row lg:items-center lg:justify-between lg:border-none lg:pt-0">
                          <div className="flex flex-col gap-1 sm:gap-2 lg:w-[160px] lg:items-end">
                            <span className="font-nunito text-[11px] font-semibold text-[#6B7A96] sm:text-[12px] lg:hidden">
                              Date/Time
                            </span>
                            <div className="flex flex-col text-[13px] text-[#5F6F8C] lg:text-right">
                              <span className="font-nunito text-[14px] font-semibold text-[#273755]">
                                {meeting.date}
                              </span>
                              <span className="font-nunito text-[12px] text-[#5F6F8C]">
                                {meeting.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-start gap-2 sm:justify-end lg:w-[120px]">
                            <img src={zoomIcon} alt="" className="h-6 w-6" />
                            <span className="font-nunito text-[14px] font-semibold text-[#1F6FB5]">
                              {meeting.platform}
                            </span>
                          </div>
                          <div className="hidden w-[120px] items-center justify-end gap-3 lg:flex">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F1FF] text-[#1F6FB5] shadow-[0_8px_16px_rgba(31,111,181,0.2)] transition hover:opacity-90"
                              aria-label={`View ${meeting.title}`}
                            >
                              <svg
                                aria-hidden
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFE6E6] text-[#E45A5A] shadow-[0_8px_16px_rgba(228,90,90,0.2)] transition hover:opacity-90"
                              aria-label={`Delete ${meeting.title}`}
                            >
                              <svg
                                aria-hidden
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <aside className="flex w-full flex-col gap-6 xl:w-[360px]">
              <section className="rounded-3xl border border-[#E2E8F3] bg-white px-5 pb-6 pt-6 shadow-[0_22px_48px_rgba(39,62,99,0.08)] sm:px-6">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-nunito text-[18px] font-extrabold text-[#1F2E4D]">
                      Meeting title
                    </h2>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DADFEA] bg-white text-[#5E6A81] transition hover:bg-[#F3F5FA]"
                      aria-label="Share meeting"
                    >
                      <img src={shareIcon} alt="" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F3] bg-[#101828] shadow-[0_18px_36px_rgba(16,24,40,0.28)]">
                    <img
                      src={videoPreview}
                      alt="Meeting preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Play meeting recording"
                      className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F04438] text-white shadow-[0_18px_38px_rgba(240,68,56,0.35)] transition hover:scale-105"
                    >
                      <svg
                        aria-hidden
                        className="ml-1 h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#E2E8F3] bg-white px-5 py-6 shadow-[0_22px_48px_rgba(39,62,99,0.08)] sm:px-6">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-nunito text-[18px] font-extrabold text-[#1F2E4D]">
                        Meeting transcription (Live/…)
                      </h2>
                      <p className="font-nunito text-[13px] text-[#7A8CB0]">
                        Real-time highlights captured during the call.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF3FF] text-[#1F6FB5] transition hover:bg-[#E2EBFF]"
                      aria-label="Copy transcription link"
                    >
                      <img src={copyLinkIcon} alt="" className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <img
                      src={searchIcon}
                      alt=""
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-70"
                    />
                    <input
                      type="search"
                      placeholder="Search by keyword or speaker"
                      className="w-full rounded-2xl border border-[#D9E2F2] bg-[#F7F9FC] px-11 py-3 font-nunito text-[14px] text-[#1F2E4D] placeholder:text-[#7C8BA6] focus:border-[#1F6FB5] focus:outline-none focus:ring-4 focus:ring-[#1F6FB510]"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    {TRANSCRIPTS.map((item, index) => (
                      <article
                        key={`${item.speaker}-${index}`}
                        className="flex gap-3 rounded-2xl border border-[#E4EBF8] bg-[#F8FAFF] p-4 shadow-[0_12px_24px_rgba(39,62,99,0.05)]"
                      >
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6EDFF]">
                          <img src={meetingAvatar} alt={item.speaker} className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-nunito text-[14px] font-extrabold text-[#1B2B4A]">
                              {item.speaker}
                            </h3>
                            <span className="font-nunito text-[12px] font-semibold text-[#6B7A96]">
                              {item.time}
                            </span>
                          </div>
                          <p className="font-nunito text-[13px] leading-relaxed text-[#4B5B7C]">
                            {item.message}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}