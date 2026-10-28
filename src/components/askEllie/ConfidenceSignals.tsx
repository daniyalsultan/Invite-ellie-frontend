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
  /** Which meeting the quote is from. A timestamp alone says 0:00 of what? */
  meeting_id?: string | null;
  meeting_name?: string | null;
  /** ISO date (YYYY-MM-DD) of the meeting. */
  meeting_date?: string | null;
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

/** "Kestrel Rollout · 14 Aug 2026", or whichever half we actually know.
 *  A meeting with no calendar event has no title, and inventing one would be
 *  worse than showing the date alone. */
export function segmentMeeting(segment: GroundedSegment): string | null {
  const name = segment.meeting_name?.trim() || null;
  let date: string | null = null;
  if (segment.meeting_date) {
    const parsed = new Date(segment.meeting_date);
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  if (name && date) return `${name} · ${date}`;
  return name ?? date;
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
                title={segments
                  ? [segments[i].speaker, segmentOrigin(segments[i]), segmentMeeting(segments[i])]
                      .filter(Boolean).join(' — ')
                  : undefined}
                className="ml-0.5 align-super text-[10px] font-nunito font-semibold text-ellieBlue hover:underline"
              >
                [{i + 1}]
              </button>
            ))}{' '}
            {refs.includes(open ?? -1) && segments ? (
              <span className="mt-1 mb-1 block rounded bg-gray-50 p-2 text-xs font-nunito">
                <span className="font-semibold text-ellieBlue">{segments[open as number].speaker}</span>
                <span className="text-ellieGray"> • {segmentOrigin(segments[open as number])}</span>
                {segmentMeeting(segments[open as number]) ? (
                  <span className="mt-0.5 block text-ellieGray">
                    {segmentMeeting(segments[open as number])}
                  </span>
                ) : null}
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

/**
 * How much of an answer is quoted, and how much is Ellie's own reading.
 *
 * A marked sentence is quoting; an unmarked one is concluding. That
 * distinction was already in the payload and visible only to someone who
 * knew that a missing [1] meant "my own words" rather than "we failed to
 * find the quote". Stating it once, in a sentence, is what makes it a
 * signal rather than a convention.
 *
 * Only sentences that claim something about the meetings are counted.
 * "Let me know if you want the detail" is neither quoting nor concluding,
 * and counting it would make every answer look badly sourced.
 *
 * Returns null when there is nothing honest to say: no claims, or nothing
 * quoted (the evidence notice covers that case). A server old enough not to
 * send `is_claim` reports no claims and so says nothing, which is the right
 * answer rather than a guess.
 */
export function quotingBreakdown(
  citations?: SentenceCitation[],
): { quoted: number; claims: number } | null {
  const claims = (citations ?? []).filter((c) => c.is_claim);
  const quoted = claims.filter((c) => c.segments && c.segments.length > 0).length;
  // Nothing quoted, nothing to say. This covers the empty cases too: no
  // claims at all, and a server old enough not to send `is_claim`, both of
  // which quote nothing and so get silence rather than a guess.
  if (quoted === 0) {
    return null;
  }
  return { quoted, claims: claims.length };
}

interface QuotingSummaryProps {
  citations?: SentenceCitation[];
}

/** One line saying which parts of the answer came from a transcript. */
export function QuotingSummary({ citations }: QuotingSummaryProps): JSX.Element | null {
  const breakdown = quotingBreakdown(citations);
  if (!breakdown) {
    return null;
  }
  const { quoted, claims } = breakdown;
  const statement = claims === 1 ? 'statement' : 'statements';
  return (
    <p className="mt-2 font-nunito text-xs text-ellieGray">
      {quoted === claims ? (
        <>
          {/* "Every" takes the singular however many there are. */}
          Every statement above is linked to a transcript quote — open a{' '}
          <span className="align-super text-[10px] font-semibold text-ellieBlue">[1]</span>{' '}
          to read it.
        </>
      ) : (
        <>
          {quoted} of {claims} {statement} above {claims === 1 ? 'is' : 'are'} linked to a
          transcript quote — open a{' '}
          <span className="align-super text-[10px] font-semibold text-ellieBlue">[1]</span>{' '}
          to read it. The rest {claims - quoted === 1 ? 'is' : 'are'} Ellie&rsquo;s own reading
          of the meetings.
        </>
      )}
    </p>
  );
}

/** Whether anything in the transcripts actually backs the answer up. */
export type EvidenceState = 'supported' | 'none';

interface TranscriptReferencesProps {
  segments?: GroundedSegment[];
  // Collapsed behind a toggle, for surfaces too small to show every quote.
  collapsible?: boolean;
  /** 'none' when the answer is not linked to any retrieved quote. */
  evidenceState?: EvidenceState;
  /** How many segments the server weighed before withholding them. */
  segmentsConsidered?: number;
  /** Lets us tell "it answered, uncited" from "it had nothing to answer with". */
  responseState?: ResponseState;
}

export function TranscriptReferences({
  segments,
  collapsible = false,
  evidenceState,
  segmentsConsidered = 0,
  responseState,
}: TranscriptReferencesProps): JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  // Material was retrieved and the answer cited none of it, so there is
  // nothing we can honestly attach to it. Which of two different things that
  // means depends on whether an answer was given at all:
  //
  //   no_answer  the assistant said it had nothing. Then there genuinely is
  //              no evidence, and that is worth stating.
  //   otherwise  it answered but cited nothing. The answer may be perfectly
  //              well grounded -- measured in production, a real answer about
  //              a client's data-residency concerns cited nothing on four
  //              calls in five. Telling that reader "no evidence supports
  //              this" is a false statement about a true answer, so the line
  //              says what is actually known: it is not linked to quotes.
  //
  // A question that retrieved nothing at all (a greeting) gets no line.
  if (evidenceState === 'none' && segmentsConsidered > 0) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs font-nunito text-ellieGray">
          {responseState === 'no_answer'
            ? 'No transcript evidence supports this answer.'
            : 'This answer is not linked to specific transcript quotes.'}
        </span>
      </div>
    );
  }

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
              <div className="flex flex-wrap items-center gap-x-2 mb-1">
                <span className="font-semibold text-ellieBlue">[{idx + 1}]</span>
                <span className="font-semibold text-ellieBlue">{segment.speaker}</span>
                <span className="text-ellieGray">•</span>
                <span className="text-ellieGray">{segmentOrigin(segment)}</span>
              </div>
              {segmentMeeting(segment) ? (
                <div className="mb-1 text-ellieGray">{segmentMeeting(segment)}</div>
              ) : null}
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
