import React from 'react';
import { FolderRecord } from '../workspace/workspaceApi';
import downloadIcon from '../../assets/icon-download.png';
import shareIcon from '../../assets/icon-share.png';
import deleteIcon from '../../assets/icon-delete.png';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image' | 'video';
}

interface FolderDetailViewProps {
  folder: FolderRecord;
  onClose: () => void;
  isOpen: boolean;
}

// Dummy file data
const DUMMY_FILES: FileItem[] = [
  { id: '1', name: 'Meeting_Notes_2024.pdf', size: '2.4 MB', type: 'pdf' },
  { id: '2', name: 'Project_Proposal.docx', size: '1.8 MB', type: 'doc' },
  { id: '3', name: 'Presentation_Slides.pdf', size: '5.2 MB', type: 'pdf' },
  { id: '4', name: 'Team_Photo.jpg', size: '3.1 MB', type: 'image' },
  { id: '5', name: 'Recording_2024.mp4', size: '45.6 MB', type: 'video' },
  { id: '6', name: 'Budget_Report.xlsx', size: '892 KB', type: 'doc' },
];

export function FolderDetailView({ folder, onClose, isOpen }: FolderDetailViewProps): JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return DUMMY_FILES;
    }
    return DUMMY_FILES.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-red-500">
            <span className="text-lg font-bold text-white">A</span>
          </div>
        );
      case 'doc':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500">
            <span className="text-lg font-bold text-white">D</span>
          </div>
        );
      case 'image':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-green-500">
            <span className="text-lg font-bold text-white">I</span>
          </div>
        );
      case 'video':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-purple-500">
            <span className="text-lg font-bold text-white">V</span>
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-500">
            <span className="text-lg font-bold text-white">F</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute inset-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-4 md:px-6 md:py-6">
          <div className="mb-4 flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#25324B] transition hover:bg-gray-100"
              aria-label="Go back"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h1 className="font-nunito text-xl font-bold text-[#25324B] md:text-2xl">
                {folder.name}
              </h1>
              <p className="font-nunito text-sm text-[#6B7A96]">Folders navigation</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-5 w-5 text-[#327AAD]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by folder name"
              className="h-[50px] w-full rounded-[5px] border border-[#7964A0] bg-white pl-10 pr-4 font-nunito text-base font-semibold text-[#25324B] placeholder:text-[#25324B]/40 focus:border-[#327AAD] focus:outline-none focus:ring-2 focus:ring-[#327AAD]/20"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col gap-2">
            {filteredFiles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center font-nunito text-sm text-[#6B7A96]">
                No files found
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-4 rounded-[10px] bg-[#F7F9FC] px-4 py-3 transition hover:bg-[#E6EDFF]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                      <span className="font-nunito text-base font-semibold text-[#25324B] truncate">
                        {file.name}
                      </span>
                      <span className="font-nunito text-sm text-[#6B7A96]">{file.size}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {/* Download Button */}
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded text-white transition hover:bg-[#ababab]"
                      aria-label={`Download ${file.name}`}
                    >
                      <img src={downloadIcon} alt="Download" className="h-6 w-6 object-contain" />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded text-white transition hover:bg-[#ababab]"
                      aria-label={`Share ${file.name}`}
                    >
                      <img src={shareIcon} alt="Share" className="h-6 w-6 object-contain" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded text-white transition hover:bg-[#ababab]"
                      aria-label={`Delete ${file.name}`}
                    >
                      <img src={deleteIcon} alt="Delete" className="h-6 w-6 object-contain" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

