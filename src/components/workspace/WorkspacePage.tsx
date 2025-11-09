import { Link } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';

interface WorkspaceItem {
  name: string;
  id: string;
  type: 'Office' | 'Project' | 'Team';
  createdDate: string;
  createdTime: string;
  thumbnail: {
    background: string;
    foreground?: string;
    label: string;
  };
}

const WORKSPACES: WorkspaceItem[] = [
  {
    name: 'Team Hub',
    id: '70668',
    type: 'Office',
    createdDate: 'October 12, 2025',
    createdTime: '05:02 PM',
    thumbnail: {
      background:
        'linear-gradient(138deg, rgba(255,202,164,1) 0%, rgba(245,117,195,1) 100%)',
      label: 'TH',
    },
  },
  {
    name: 'Strategy Room',
    id: '70668',
    type: 'Project',
    createdDate: 'October 12, 2025',
    createdTime: '05:02 PM',
    thumbnail: {
      background:
        'linear-gradient(135deg, rgba(255,160,122,1) 0%, rgba(247,49,93,1) 100%)',
      label: 'SR',
    },
  },
  {
    name: 'Operations HQ',
    id: '70668',
    type: 'Team',
    createdDate: 'October 12, 2025',
    createdTime: '05:02 PM',
    thumbnail: {
      background:
        'linear-gradient(132deg, rgba(88,238,253,1) 0%, rgba(124,92,255,1) 100%)',
      label: 'OH',
    },
  },
  {
    name: 'Marketing Room',
    id: '70668',
    type: 'Office',
    createdDate: 'October 12, 2025',
    createdTime: '05:02 PM',
    thumbnail: {
      background:
        'linear-gradient(140deg, rgba(255,229,167,1) 0%, rgba(247,73,108,1) 48%, rgba(120,57,239,1) 100%)',
      label: 'MR',
    },
  },
];

export function WorkspacePage(): JSX.Element {
  return (
    <DashboardLayout activeTab="/workspaces">
      <section className="min-h-full bg-[#F7F9FC] px-4 py-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
          <header className="flex flex-col gap-5">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-nunito text-[12px] font-semibold uppercase tracking-[0.18em] text-[#5E6A81]"
            >
              <Link to="/dashboard" className="text-[#5E6A81] transition hover:text-[#1F6FB5]">
                Dashboard
              </Link>
              <span aria-hidden>›</span>
              <span className="text-[#2F3C58]">Workspaces</span>
            </nav>

            <div className="flex flex-col gap-5 rounded-2xl border border-[#E2E8F3] bg-white px-5 py-5 shadow-[0_18px_38px_rgba(39,62,99,0.08)] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-9 lg:py-7">
              <div className="flex flex-col gap-2">
                <h1 className="font-nunito text-[34px] font-extrabold leading-tight text-[#1C2A4A] lg:text-[40px]">
                  Workspaces
                </h1>

              </div>

              <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row lg:items-center lg:gap-5">
                

                <Link
                  to="/create-workspace"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1F6FB5] px-6 py-3 font-nunito text-[15px] font-extrabold text-white shadow-[0_14px_24px_rgba(31,111,181,0.35)] transition hover:opacity-90 lg:w-auto"
                >
                  Create a workspace
                </Link>
              </div>
            </div>
          </header>

          <div className="rounded-2xl border border-[#E2E8F3] bg-white px-4 py-5 shadow-[0_18px_38px_rgba(39,62,99,0.08)] sm:px-6 lg:px-8 lg:py-7">
            <div className="flex flex-col gap-4">
              <div className="hidden items-center rounded-xl bg-[#F5F7FB] px-5 py-3 font-nunito text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7A96] lg:flex lg:gap-6">
                <span className="lg:w-[320px] text-left">Workspace</span>
                <div className="ml-auto flex w-full max-w-[480px] items-center justify-between">
                  <span className="w-[140px] text-center">Type</span>
                  <span className="w-[200px] text-center">Create Date</span>
                  <span className="w-[120px] text-center">Actions</span>
                </div>
              </div>

              {WORKSPACES.map((workspace) => (
                <article
                  key={workspace.name}
                  className="flex flex-col gap-4 rounded-2xl border border-[#E7ECF5] bg-[#FBFDFF] px-5 py-5 shadow-[0_12px_24px_rgba(39,62,99,0.05)] transition hover:shadow-[0_18px_36px_rgba(39,62,99,0.08)] lg:flex-row lg:items-center lg:gap-6"
                >
                  <div className="flex items-start justify-between gap-4 lg:w-[320px] lg:items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-[20px] font-extrabold text-white"
                        style={{ background: workspace.thumbnail.background }}
                      >
                        {workspace.thumbnail.label}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h2 className="font-nunito text-[18px] font-extrabold text-[#18233F]">
                          {workspace.name}
                        </h2>
                        <p className="font-nunito text-[13px] text-[#7A8CB0]">
                          ID: {workspace.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 lg:hidden">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F1FF] text-[#1F6FB5] shadow-[0_8px_16px_rgba(31,111,181,0.2)] transition hover:opacity-90"
                        aria-label={`View ${workspace.name}`}
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
                        aria-label={`Delete ${workspace.name}`}
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
                    <div className="flex flex-col gap-1 sm:gap-2 lg:w-[140px] lg:items-end">
                      <span className="font-nunito text-[11px] font-semibold text-[#6B7A96] sm:text-[12px] lg:hidden">
                        Type
                      </span>
                      <span className="font-nunito text-[14px] font-semibold text-[#1F6FB5] lg:hidden">
                        {workspace.type}
                      </span>
                      <span className="hidden self-end rounded-full bg-[#ECF3FF] px-4 py-1 font-nunito text-[13px] font-semibold text-[#1F6FB5] lg:inline-flex">
                        {workspace.type}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2 lg:w-[200px] lg:items-end">
                      <span className="font-nunito text-[11px] font-semibold text-[#6B7A96] sm:text-[12px] lg:hidden">
                        Create Date
                      </span>
                      <div className="flex flex-col text-[13px] text-[#5F6F8C] lg:text-right">
                        <span className="font-nunito text-[14px] font-semibold text-[#273755]">
                          {workspace.createdDate}
                        </span>
                        <span className="font-nunito text-[12px] text-[#5F6F8C]">
                          {workspace.createdTime}
                        </span>
                      </div>
                    </div>
                    <div className="hidden w-[120px] items-center justify-end gap-3 lg:flex">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E7F1FF] text-[#1F6FB5] shadow-[0_8px_16px_rgba(31,111,181,0.2)] transition hover:opacity-90"
                        aria-label={`View ${workspace.name}`}
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
                        aria-label={`Delete ${workspace.name}`}
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
        </div>
      </section>
    </DashboardLayout>
  );
}


