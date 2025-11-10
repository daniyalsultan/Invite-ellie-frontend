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
        'linear-gradient(135deg, rgba(255,215,210,1) 0%, rgba(221,173,250,1) 100%)',
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
        'linear-gradient(135deg, rgba(255,206,160,1) 0%, rgba(249,84,110,1) 100%)',
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
        'linear-gradient(135deg, rgba(134,223,250,1) 0%, rgba(137,142,255,1) 100%)',
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
        'linear-gradient(135deg, rgba(255,235,170,1) 0%, rgba(241,108,142,1) 60%, rgba(142,103,255,1) 100%)',
      label: 'MR',
    },
  },
];

export function WorkspacePage(): JSX.Element {
  return (
    <DashboardLayout
      activeTab="/workspaces"
      userName="Mike Volkin"
      userEmail="mikevolkin@email.com"
    >
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav
            className="mb-3 md:mb-4 lg:mb-6"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <Link to="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">Workspaces</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 lg:mb-8">
            <div>
              <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44]">
                Workspaces
              </h1>
            </div>
            <Link
              to="/create-workspace"
              className="inline-flex items-center justify-center rounded-[2px] bg-[#1F6FB5] px-3 md:px-4 py-2 font-nunito text-sm font-bold text-white shadow-[0_10px_20px_rgba(31,111,181,0.2)] transition hover:bg-[#185c96] ml-auto"
            >
              Create a workspace
            </Link>
          </div>

          <div className="bg-white rounded-[12px] md:rounded-[18px] shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 lg:p-8">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-[#E6E9F2]">
                    <th className="text-left py-3 px-4 font-nunito text-base font-semibold text-[#25324B] w-[55%]">
                      Workspace
                    </th>
                    <th className="text-right py-3 px-2 font-nunito text-base font-semibold text-[#25324B] w-[15%]">
                      Type
                    </th>
                    <th className="text-right py-3 px-2 font-nunito text-base font-semibold text-[#25324B] w-[20%]">
                      Create Date
                    </th>
                    <th className="text-right py-3 px-2 font-nunito text-base font-semibold text-[#25324B] w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {WORKSPACES.map((workspace, index) => (
                    <tr
                      key={`${workspace.id}-${index}`}
                      className="border-b border-[#EEE9FE] last:border-b-0 hover:bg-[#F6F7FB]"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-[0_10px_20px_rgba(39,62,99,0.15)]"
                            style={{ background: workspace.thumbnail.background }}
                          >
                            {workspace.thumbnail.label}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-nunito text-base font-bold text-[#25324B]">
                              {workspace.name}
                            </span>
                            <span className="font-nunito text-sm text-[#6B7A96]">
                              ID: {workspace.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="inline-flex rounded-full bg-[#E6EDFF] px-3 py-1 font-nunito text-sm font-semibold text-[#1F6FB5]">
                          {workspace.type}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col items-end">
                          <span className="font-nunito text-base font-semibold text-[#25324B] text-right">
                            {workspace.createdDate}
                          </span>
                          <span className="font-nunito text-sm text-[#6B7A96] text-right">
                            {workspace.createdTime}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/workspaces/workspace-view"
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-[#1F6FB5]"
                            aria-label={`View ${workspace.name}`}
                          >
                            <svg
                              className="w-5 h-5"
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
                          </Link>
                          <button
                            type="button"
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-[#E45A5A]"
                            aria-label={`Delete ${workspace.name}`}
                          >
                            <svg
                              className="w-5 h-5"
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

            {/* Mobile Cards */}
            <div className="lg:hidden flex flex-col gap-4">
              {WORKSPACES.map((workspace, index) => (
                <div
                  key={`${workspace.id}-mobile-${index}`}
                  className="rounded-2xl border border-[#E6E9F2] p-4 shadow-[0_12px_24px_rgba(39,62,99,0.05)]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-[0_10px_20px_rgba(39,62,99,0.15)]"
                      style={{ background: workspace.thumbnail.background }}
                    >
                      {workspace.thumbnail.label}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-nunito text-base font-bold text-[#25324B]">
                            {workspace.name}
                          </h2>
                          <p className="font-nunito text-xs text-[#6B7A96]">ID: {workspace.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to="/workspaces/workspace-view"
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-[#1F6FB5]"
                            aria-label={`View ${workspace.name}`}
                          >
                            <svg
                              className="w-4 h-4"
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
                          </Link>
                          <button
                            type="button"
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-[#E45A5A]"
                            aria-label={`Delete ${workspace.name}`}
                          >
                            <svg
                              className="w-4 h-4"
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
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-nunito text-[11px] font-semibold text-[#6B7A96] uppercase tracking-wide">
                        Type
                      </span>
                      <span className="inline-flex rounded-full bg-[#E6EDFF] px-3 py-1 font-nunito text-sm font-semibold text-[#1F6FB5]">
                        {workspace.type}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-nunito text-[11px] font-semibold text-[#6B7A96] uppercase tracking-wide">
                        Create Date
                      </span>
                      <span className="font-nunito text-sm font-semibold text-[#25324B]">
                        {workspace.createdDate}
                      </span>
                      <span className="font-nunito text-xs text-[#6B7A96]">{workspace.createdTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


