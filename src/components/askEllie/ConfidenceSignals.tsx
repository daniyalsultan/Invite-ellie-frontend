import { useState } from 'react';

// How well grounded an Ellie answer is, shared by the Ask Ellie page and the
// floating chat widget. Both read the same /api/chat response, so both must
// qualify an answer the same way.

export type ResponseState = 'confident' | 'tentative' | 'no_answer';

/** Which retrieved segments a single sentence of the answer drew on. */
export interface SentenceCitation {
  sentence: string;
  /** Indexes into the grounded segments array. Empty when unmarked. */
  segments: number[];
  is_claim?: boolean;
}

export interface GroundedSegment {
  text: string;
  speaker: string;
  timestamp: string;
  start_time: number;
  relevance_score?: number;
  /** 'record' when the quote came from a structured record, which has no time. */
  source?: 'record' | 'transcript';
  record_type?: string | null;
  /** The record's own statement, when the quote is its evidence line. */
  statement?: string | null;
}

const RECORD_LABEL: Record<string, string> = {
  commitment: 'Commitment',
  decision: 'Decision',
  blocker: 'Blocker',
  promise: 'Promise',
  risk: 'Risk',
  action_item: 'Action item',
};

/** What to show where a timestamp would go. A record has no time, and
 *  printing 0:00 for one would be a wrong answer rather than a missing one. */
export function segmentOrigin(segment: GroundedSegment): string {
  if (segment.source === 'record') {
    return RECORD_LABEL[segment.record_type ?? ''] ?? 'Record';
  }
  return segment.timestamp;
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

interface CitedAnswerProps {
  citations?: SentenceCitation[];
  segments?: GroundedSegment[];
  /** The plain answer, shown as-is when nothing was cited. */
  fallback: string;
}

/**
 * The answer with each sentence carrying the segment it came from.
 *
 * A sentence the model did not mark is shown plainly rather than flagged:
 * plenty of sentences legitimately make no claim about the transcript, and
 * marking those would train people to ignore the markers. When nothing at
 * all is cited — an older server, or a model that ignored the instruction —
 * this renders the answer exactly as before.
 */
export function CitedAnswer({ citations, segments, fallback }: CitedAnswerProps): JSX.Element {
  const [open, setOpen] = useState<number | null>(null);
  const cited = (citations ?? []).filter((c) => c.segments && c.segments.length > 0);

  if (cited.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <>
      {(citations ?? []).map((citation, idx) => {
        const refs = (citation.segments ?? []).filter(
          (i) => segments && i >= 0 && i < segments.length,
        );
        return (
          <span key={idx}>
            {citation.sentence}
            {refs.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                title={segments ? `${segments[i].speaker} — ${segmentOrigin(segments[i])}` : undefined}
                className="ml-0.5 align-super text-[10px] font-nunito font-semibold text-ellieBlue hover:underline"
              >
                [{i + 1}]
              </button>
            ))}{' '}
            {refs.includes(open ?? -1) && segments ? (
              <span className="mt-1 mb-1 block rounded bg-gray-50 p-2 text-xs font-nunito">
                <span className="font-semibold text-ellieBlue">{segments[open as number].speaker}</span>
                <span className="text-ellieGray"> • {segmentOrigin(segments[open as number])}</span>
                <span className="mt-1 block italic text-ellieBlack">
                  "{segments[open as number].text}"
                </span>
              </span>
            ) : null}
          </span>
        );
      })}
    </>
  );
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
                <span className="font-semibold text-ellieBlue">[{idx + 1}]</span>
                <span className="font-semibold text-ellieBlue">{segment.speaker}</span>
                <span className="text-ellieGray">•</span>
                <span className="text-ellieGray">{segmentOrigin(segment)}</span>
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
