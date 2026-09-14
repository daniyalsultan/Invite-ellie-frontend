import { useState } from 'react';

// How well grounded an Ellie answer is, shared by the Ask Ellie page and the
// floating chat widget. Both read the same /api/chat response, so both must
// qualify an answer the same way.

export type ResponseState = 'confident' | 'tentative' | 'no_answer';

export interface GroundedSegment {
  text: string;
  speaker: string;
  timestamp: string;
  start_time: number;
  relevance_score?: number;
}

export function ResponseStateBadge({ state }: { state?: ResponseState }): JSX.Element | null {
  if (state === 'tentative') {
    return (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-nunito font-medium">
        Tentative
      </span>
    );
  }
  if (state === 'no_answer') {
    return (
      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-nunito font-medium">
        Insufficient Context
      </span>
    );
  }
  return null;
}

interface TranscriptReferencesProps {
  segments?: GroundedSegment[];
  // Collapsed behind a toggle, for surfaces too small to show every quote.
  collapsible?: boolean;
}

export function TranscriptReferences({ segments, collapsible = false }: TranscriptReferencesProps): JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  if (!segments || segments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="mb-2">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            className="flex items-center gap-1 text-xs font-nunito font-semibold text-ellieGray hover:text-ellieBlack"
          >
            <svg
              className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Referenced from transcript ({segments.length})
          </button>
        ) : (
          <span className="text-xs font-nunito font-semibold text-ellieGray">
            Referenced from transcript:
          </span>
        )}
      </div>
      {isExpanded && (
        <div className="space-y-2">
          {segments.map((segment, idx) => (
            <div key={idx} className="bg-gray-50 rounded p-2 text-xs font-nunito">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-ellieBlue">{segment.speaker}</span>
                <span className="text-ellieGray">•</span>
                <span className="text-ellieGray">{segment.timestamp}</span>
              </div>
              <div className="text-ellieBlack italic">
                "{segment.text}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
