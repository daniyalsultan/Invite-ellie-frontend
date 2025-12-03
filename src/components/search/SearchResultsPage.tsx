import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import workspaceIcon from '../../assets/workspace.png';
import transcriptionIcon from '../../assets/transcription.png';
import manageRecordingsIcon from '../../assets/manage recordings.png';

interface SearchResult {
  id: string;
  type: 'workspace' | 'recording' | 'transcription';
  title: string;
  workspaceId?: string;
  link?: string;
  thumbnail?: string;
}

const SEARCH_RESULTS: SearchResult[] = [
  {
    id: '1',
    type: 'workspace',
    title: 'Workspace',
    workspaceId: '123456',
  },
  {
    id: '2',
    type: 'recording',
    title: 'Recorded Meeting',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtlflXx2Kfam6tFh-1',
  },
  {
    id: '3',
    type: 'transcription',
    title: 'Transcription',
    link: 'https://www.figma.com/proto/pflejRyGUKnFHsWlyCYzws/Invite-Ellie?node-id=37-5569&t=wtlflXx2Kfam6tFh-1',
  },
  {
    id: '4',
    type: 'workspace',
    title: 'Workspace',
    workspaceId: '123456',
  },
];

type ContentType = 'all' | 'workspace' | 'transcription' | 'recording';

export function SearchResultsPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('all');
  const [showDateRange, setShowDateRange] = useState(true);

  const handleCopyLink = (link: string): void => {
    navigator.clipboard.writeText(link);
  };

  const filteredResults = SEARCH_RESULTS.filter((result) => {
    if (selectedContentType === 'all') return true;
    return result.type === selectedContentType;
  });

  return (
    <DashboardLayout activeTab="/dashboard">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-2 md:mb-3 lg:mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 md:gap-2 font-nunito text-[10px] md:text-xs lg:text-sm font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <Link to="/dashboard" className="hover:text-ellieBlack transition-colors">
                  DASHBOARD
                </Link>
              </li>
              <li className="text-ellieGray">›</li>
              <li className="text-ellieBlue">SEARCH RESULTS</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-nunito text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#1F2A44] mb-4 md:mb-6">
            Search Results
          </h1>

          {/* Subtitle and Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <p className="font-nunito text-base md:text-lg lg:text-xl font-medium text-[#25324B]">
              {searchQuery ? (
                <>Search results for &quot;{searchQuery}&quot;</>
              ) : (
                'Search results'
              )}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {showDateRange && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#7964A0] rounded-[5px]">
                  <span className="font-nunito text-sm md:text-base font-semibold text-[#25324B]">
                    Date Range: Oct 25, 2025 - Oct 27, 2025
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDateRange(false)}
                    className="flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                    aria-label="Clear date range"
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
              )}
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#7964A0] rounded-[5px] font-nunito text-sm md:text-base font-semibold text-[#25324B] hover:bg-gray-50 transition-colors"
              >
                Sort Results
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
                </svg>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#7964A0] rounded-[5px] font-nunito text-sm md:text-base font-semibold text-[#25324B] hover:bg-gray-50 transition-colors"
              >
                Filters
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content Type Filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {(
              [
                { id: 'all', label: 'All', icon: workspaceIcon },
                { id: 'workspace', label: 'Work Spaces', icon: workspaceIcon },
                { id: 'transcription', label: 'Transcriptions', icon: transcriptionIcon },
                { id: 'recording', label: 'Meeting Recordings', icon: manageRecordingsIcon },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedContentType(filter.id as ContentType)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-nunito text-sm md:text-base font-semibold transition-colors ${
                  selectedContentType === filter.id
                    ? 'bg-[#327AAD] text-white'
                    : 'bg-white border border-[#7964A0] text-[#25324B] hover:bg-gray-50'
                }`}
              >
                <img
                  src={filter.icon}
                  alt=""
                  className={`w-4 h-4 object-contain ${
                    selectedContentType === filter.id ? 'brightness-0 invert' : ''
                  }`}
                />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Search Results List */}
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-lg shadow-[0px_18px_30px_rgba(15,23,42,0.05)] p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {result.type === 'workspace' ? (
                      <div
                        className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center text-white"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,215,210,1) 0%, rgba(134,223,250,1) 100%)',
                        }}
                      >
                        <svg
                          className="w-8 h-8 md:w-10 md:h-10"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    ) : result.type === 'recording' ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-900 grid grid-cols-3 gap-1 p-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-white text-[6px] md:text-[8px] font-nunito">P{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white border border-[#DEE1E6]"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-nunito text-lg md:text-xl font-bold text-[#25324B] mb-2">
                      {result.title}
                    </h3>
                    {result.workspaceId && (
                      <p className="font-nunito text-sm md:text-base text-[#545454]">
                        Workspace ID: {result.workspaceId}
                      </p>
                    )}
                    {result.link && (
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-nunito text-sm md:text-base font-semibold text-[#0B5CFF] hover:underline truncate max-w-[400px]"
                        >
                          {result.link}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(result.link!)}
                          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label="Copy link"
                        >
                          <svg
                            className="w-4 h-4 text-[#0B5CFF]"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5.00005C7.01165 5.00005 6.49359 5.00005 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.49359 5 7.01165 5 8.00005V16C5 16.9885 5 17.5065 5.21799 17.908C5.40973 18.2843 5.71569 18.5903 6.09202 18.782C6.49359 19 7.01165 19 8 19H16C16.9885 19 17.5065 19 17.908 18.782C18.2843 18.5903 18.5903 18.2843 18.782 17.908C19 17.5065 19 16.9885 19 16V8.00005C19 7.01165 19 6.49359 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.5065 5.00005 16.9885 5.00005 16 5.00005H8Z" />
                            <path d="M8 14.0001H7.8C6.11984 14.0001 5.27976 14.0001 4.63803 13.5641C4.07354 13.1806 3.65338 12.6788 3.41421 12.1213C3 11.3804 3 10.5203 3 8.80005V8.00005C3 6.11441 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H12C13.8856 4 14.8284 4 15.4142 4.58579C16 5.17157 16 6.11441 16 8.00005" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

