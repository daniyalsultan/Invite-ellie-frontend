import React from 'react';
import { DashboardLayout } from '../sidebar';

interface FolderItem {
  name: string;
  id: string;
}

interface ActivityItem {
  type: string;
  link: string;
  date: string;
  time: string;
}

const FOLDERS: FolderItem[] = Array.from({ length: 6 }).map(() => ({
  name: 'Folder name',
  id: '12354566',
}));

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    type: 'Meeting Recording',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
    date: 'October 12, 2025',
    time: '05:02 PM',
  },
  {
    type: 'Meeting Recording',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
    date: 'October 12, 2025',
    time: '05:02 PM',
  },
  {
    type: 'Meeting Recording',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtIfIXx2Kfam6tFh-1',
    date: 'October 12, 2025',
    time: '05:02 PM',
  },
];

const CREATE_WORKSPACE_ILLUSTRATION = '/assets/dashboard/create-workspace-illustration.svg';
const JOIN_MEETING_ILLUSTRATION = '/assets/dashboard/join-meeting-illustration.svg';
const WORKSPACE_SELECT_ICON = '/assets/dashboard/workspace-select-icon.svg';
const WORKSPACE_HELP_ICON = '/assets/dashboard/workspace-help-icon.svg';
const FOLDER_CARD_ICON = '/assets/dashboard/folder-card-icon.svg';
export function DashboardPage(): JSX.Element {
  return (
    <React.Fragment>
      <DashboardLayout activeTab="/dashboard">
      <div className="min-h-full bg-white px-4 py-10 lg:px-6">
        <div className="mx-auto w-full max-w-[1400px] space-y-8">
          <header className="space-y-3">
            <div className="flex items-center gap-2 font-nunito text-[16px] font-semibold uppercase tracking-[0.16em] text-[#5C6780]">
              <span>DASHBOARD</span>
              <span aria-hidden>›</span>
              <span className="text-[#25324B]">SUBMENU</span>
            </div>
            <h1 className="font-nunito text-[40px] font-extrabold tracking-tight text-[#1F2A44]">
              Welcome, Mike!
            </h1>
          </header>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
            <article className="flex w-full items-center gap-6 rounded-[10px] bg-[rgba(121,100,160,0.05)] px-8 py-6 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] lg:max-w-[700px]">
              <img
                src={CREATE_WORKSPACE_ILLUSTRATION}
                alt="Illustration of a person creating a workspace"
                className="h-[77px] w-[109px]"
              />
              <div className="space-y-2">
                <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">
                  Create a Workspace
                </h2>
                <p className="max-w-[280px] font-nunito text-[20px] font-medium leading-[1.36] text-[#545454]">
                  Start with creating a workspace for office, a project or an idea.
                </p>
              </div>
            </article>

            <article className="flex w-full items-center gap-8 rounded-[10px] bg-[rgba(121,100,160,0.05)] px-8 py-6 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] lg:max-w-[700px]">
              <div className="flex items-center">
                <img
                  src={JOIN_MEETING_ILLUSTRATION}
                  alt="Illustration of people joining a meeting"
                  className="h-[87px] w-[108px]"
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">
                    Join a meeting
                  </h2>
                  <p className="font-nunito text-[20px] font-medium leading-[1.36] text-[#545454]">
                    Enter meeting ID and jump right in.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      id="meeting-id"
                      type="text"
                      placeholder="Enter meeting ID"
                      className="h-[60px] w-full rounded-[5px] border border-[#7964A0] bg-white px-6 font-nunito text-[20px] font-semibold text-[#25324B] placeholder:text-[#25324B]/40 focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-[60px] items-center justify-center rounded-[5px] bg-[#327AAD] px-12 font-nunito text-[20px] font-extrabold text-white transition hover:bg-[#286996]"
                  >
                    Join now
                  </button>
                </div>
              </div>
            </article>
          </section>

          <section className="flex flex-col gap-8 lg:flex-row lg:gap-8">
            <div className="flex flex-1 flex-col gap-6 rounded-[18px] border border-[#DEE1E6] bg-white px-8 py-8 shadow-[0px_18px_30px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-8">
                <div className="flex w-full max-w-[280px] flex-col gap-3">
                  <label htmlFor="workspace-filter" className="font-nunito text-[20px] font-semibold text-[#25324B]">
                    Workspace
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-[60px] flex-1">
                      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
                        <img src={WORKSPACE_SELECT_ICON} alt="" className="h-8 w-8" />
                      </span>
                      <select
                        id="workspace-filter"
                        className="h-full w-full appearance-none rounded-[5px] border border-[#7964A0] bg-white pl-16 pr-12 font-nunito text-[20px] font-semibold text-[#25324B] focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                      >
                        <option>Workspace Name</option>
                      </select>
                      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
                        <svg
                          aria-hidden
                          className="h-5 w-5 text-[#327AAD]"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#7964A0] bg-white"
                      aria-label="Workspace help"
                    >
                      <img src={WORKSPACE_HELP_ICON} alt="Help" className="h-8 w-8" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-[60px] items-center justify-center rounded-[5px] bg-[#327AAD] px-12 font-nunito text-[20px] font-extrabold text-white transition hover:bg-[#286996]"
                >
                  Create a folder
                </button>
                <div className="flex w-full max-w-[280px] flex-col gap-3">
                  <label htmlFor="folder-search" className="font-nunito text-[20px] font-semibold text-[#25324B]">
                    Folder name
                  </label>
                  <div className="relative h-[60px]">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#327AAD]">
                      <svg
                        aria-hidden
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
                      </svg>
                    </span>
                    <input
                      id="folder-search"
                      type="text"
                      placeholder="Search by folder name"
                      className="h-full w-full rounded-[5px] border border-[#7964A0] bg-white pl-14 pr-5 font-nunito text-[20px] font-semibold text-[#25324B] placeholder:text-[#25324B]/40 focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FOLDERS.map((folder, index) => (
                  <div
                    key={`${folder.name}-${index}`}
                    className="flex flex-col gap-4 rounded-[12px] bg-[rgba(50,122,173,0.05)] px-6 py-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#327AAD] bg-white">
                      <img src={FOLDER_CARD_ICON} alt="" className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="block font-nunito text-[20px] font-bold tracking-[-0.02em] text-[#25324B] leading-[1.36]">
                        {folder.name}
                      </span>
                      <span className="font-nunito text-[16px] text-[#545454]">{folder.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="flex w-full max-w-[420px] flex-col gap-6 rounded-[18px] border border-[#DEE1E6] bg-white px-8 py-8 shadow-[0px_18px_30px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between">
                <h2 className="font-nunito text-[25px] font-bold tracking-[-0.02em] text-[#25324B]">Recent Activity</h2>
                <button
                  type="button"
                  className="font-nunito text-[14px] font-semibold uppercase tracking-[0.18em] text-[#327AAD]"
                >
                  View all
                </button>
              </div>
              <div className="overflow-hidden rounded-[14px] border border-[#DEE1E6]">
                <table className="min-w-full table-fixed">
                  <thead className="bg-[#F4F8FB]">
                    <tr className="text-left font-nunito text-[18px] font-semibold tracking-[-0.02em] text-[#25324B]">
                      <th className="px-6 py-4">Activity Type</th>
                      <th className="px-6 py-4 min-w-[160px]">Date/Time</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-nunito text-[#25324B]">
                    {RECENT_ACTIVITY.map((item, index) => (
                      <tr key={`${item.type}-${index}`} className="border-b border-[rgba(102,0,255,0.2)] last:border-0">
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col gap-1">
                            <span className="font-nunito text-[22px] font-bold tracking-[-0.02em] text-[#25324B]">
                              {item.type}
                            </span>
                            <a
                              href={item.link}
                              className="max-w-[240px] truncate font-nunito text-[22px] font-semibold tracking-[-0.02em] text-[#0B5CFF] underline decoration-transparent transition hover:decoration-current"
                            >
                              {item.link}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col gap-1 font-nunito text-[20px] font-medium text-[#545454]">
                            <span className="tracking-[-0.02em] text-[#25324B]">{item.date}</span>
                            <span>{item.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F0FA] text-[#327AAD]"
                              aria-label="View"
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
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFEAEA] text-[#E45A5A]"
                              aria-label="Remove"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </DashboardLayout>
    </React.Fragment>
  );
}


