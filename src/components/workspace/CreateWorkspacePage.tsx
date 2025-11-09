import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import illustrationUrl from '../../assets/create-workspace/create-workspace-illustration.svg';

type WorkspaceType = 'project' | 'office' | 'team' | 'other';

interface WorkspaceTypeOption {
  id: WorkspaceType;
  label: string;
}

const WORKSPACE_TYPE_OPTIONS: WorkspaceTypeOption[] = [
  {
    id: 'project',
    label: 'Project',
  },
  {
    id: 'office',
    label: 'Office',
  },
  {
    id: 'team',
    label: 'Team',
  },
  {
    id: 'other',
    label: 'Other',
  },
];

export function CreateWorkspacePage(): JSX.Element {
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedType, setSelectedType] = useState<WorkspaceType>('project');

  return (
    <DashboardLayout activeTab="/workspaces">
      <section className="min-h-full bg-white px-4 py-10 lg:px-12">
        <div className="flex w-full flex-col gap-10">
          <div className="flex w-full max-w-[700px] flex-col gap-2">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-nunito text-xs font-semibold uppercase tracking-[0.18em] text-black/60 sm:text-sm"
            >
              <Link to="/dashboard" className="transition hover:text-black">
                Dashboard
              </Link>
              <span aria-hidden>›</span>
              <Link to="/workspaces" className="transition hover:text-black">
                Workspaces
              </Link>
              <span aria-hidden>›</span>
              <span className="text-black">Create</span>
            </nav>

            <h1 className="font-nunito text-[28px] font-extrabold leading-[1.18] text-black sm:text-[40px]">
              Create a workspace
            </h1>
          </div>

          <div className="mx-auto flex w-full max-w-[700px] flex-col items-center gap-10 text-center">
            <div className="flex flex-col items-center gap-6 text-center">
              <img
                src={illustrationUrl}
                alt="Illustration of teammates collaborating"
                className="h-[96px] w-auto sm:h-[120px]"
              />

              <div className="flex flex-col items-center gap-4">
                <h2 className="font-nunito text-[28px] font-extrabold leading-[1.18] text-black sm:text-[40px]">
                  Let’s create a workspace
                </h2>
                <p className="max-w-[577px] font-nunito text-[16px] font-medium leading-[1.36] text-[#545454] sm:text-[20px]">
                  Workspace helps you setup Ellie for a project, office, team or project.
                </p>
              </div>

              <div className="flex w-full max-w-[577px] flex-col items-center gap-3">
                <span className="font-nunito text-[20px] font-bold leading-[1.17] text-black sm:text-[25px]">
                  Give your workspace a name
                </span>
                <input
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="Enter a workspace name"
                  className="w-full rounded-[5px] border border-[#7964A0] bg-white px-4 py-3 font-nunito text-[16px] font-semibold text-black placeholder:text-black/30 focus:outline-none focus:ring-0 sm:text-[20px]"
                />
              </div>

              <div className="flex w-full max-w-[577px] flex-col items-center gap-3">
                <span className="font-nunito text-[20px] font-bold leading-[1.17] text-black sm:text-[25px]">
                  Workspace type
                </span>
                <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
                  {WORKSPACE_TYPE_OPTIONS.map((option) => {
                    const isSelected = selectedType === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedType(option.id)}
                        className={`flex flex-col items-center gap-3 rounded-[5px] border px-4 py-3 text-center font-nunito text-[18px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#327AAD] sm:flex-row sm:justify-center sm:text-[20px] ${
                          isSelected
                            ? 'border-[#7964A0] bg-white'
                            : 'border-white bg-[rgba(121,100,160,0.05)]'
                        }`}
                      >
                        <span
                          className={`flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-[#327AAD]' : 'border-[#7964A0]'
                          } sm:h-[26px] sm:w-[26px]`}
                        >
                          <span
                            className={`h-[10px] w-[10px] rounded-full ${
                              isSelected ? 'bg-[#327AAD]' : 'bg-transparent'
                            } sm:h-[12px] sm:w-[12px]`}
                          />
                        </span>
                        <span className={`${isSelected ? 'text-black' : 'text-black'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-[5px] bg-[#327AAD] px-10 py-3 font-nunito text-[18px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:opacity-95 sm:px-12 sm:py-4 sm:text-[20px]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

