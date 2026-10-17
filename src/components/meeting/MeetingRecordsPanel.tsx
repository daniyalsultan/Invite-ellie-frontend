import { useEffect, useState } from 'react';
import { getMeetingRecords } from '../../services/transcriptionApi';
import type { MeetingRecord, MeetingRecordType } from '../../services/transcriptionApi';
import { loadSession } from '../../utils/authStorage';

type Props = {
  transcriptionId: string | null | undefined;
  /** Tighter padding for modals, matching MeetingInsightsPanel. */
  compact?: boolean;
};

/**
 * Commitments, decisions, blockers, promises and risks as structured rows,
 * each with its owner, deadline as spoken, status and the line of transcript
 * it came from. Action items stay in the insights panel above; they are the
 * same records, shown where people already look for them.
 */
const SECTIONS: { type: MeetingRecordType; title: string; empty: string }[] = [
  { type: 'commitment', title: 'Commitments', empty: 'No commitments picked up in this meeting.' },
  { type: 'decision', title: 'Decisions', empty: 'No decisions picked up in this meeting.' },
  { type: 'blocker', title: 'Blockers', empty: 'No blockers picked up in this meeting.' },
  { type: 'promise', title: 'Promises', empty: 'No promises picked up in this meeting.' },
  { type: 'risk', title: 'Risks', empty: 'No risks picked up in this meeting.' },
];

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-[#EFF6FF] text-[#1D4ED8]',
  resolved: 'bg-[#F0FDF4] text-[#166534]',
  dropped: 'bg-[#F1F5F9] text-[#475569]',
  superseded: 'bg-[#FEF3C7] text-[#92400E]',
};

const HISTORY_LABEL: Record<string, string> = {
  restated: 'Restated',
  progressed: 'Progressed',
  resolved: 'Resolved',
  contradicted: 'Contradicted',
  dropped: 'Dropped',
};

function RecordRow({ record }: { record: MeetingRecord }): JSX.Element {
  const [showEvidence, setShowEvidence] = useState(false);
  const hasEvidence = Boolean((record.evidence_excerpt || '').trim());

  return (
    <li className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <p className="font-nunito text-sm font-medium text-[#25324B]">{record.text}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 font-nunito text-xs">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${
            STATUS_STYLE[record.status] ?? STATUS_STYLE.open
          }`}
        >
          {record.status}
        </span>
        {record.owner ? (
          <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[#475569]">
            Owner: {record.owner}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2.5 py-1 font-semibold text-[#B91C1C]">
            No owner named
          </span>
        )}
        {record.deadline ? (
          <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[#475569]">
            Due: {record.deadline}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-1 font-semibold text-[#92400E]">
            No deadline given
          </span>
        )}
      </div>

      {record.rationale ? (
        <p className="mt-2 font-nunito text-xs text-[#475569]">
          <span className="font-semibold text-[#25324B]">Why: </span>
          {record.rationale}
        </p>
      ) : null}

      {record.history.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {record.history.map((entry) => (
            <li key={entry.id} className="font-nunito text-xs text-[#475569] flex gap-2">
              <span className="font-semibold text-[#25324B] shrink-0">
                {HISTORY_LABEL[entry.event_type] ?? entry.event_type}:
              </span>
              <span>{entry.note || entry.excerpt || '—'}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {hasEvidence ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowEvidence((v) => !v)}
            className="font-nunito text-xs font-semibold text-ellieBlue hover:underline"
          >
            {showEvidence ? 'Hide the line it came from' : 'Show the line it came from'}
          </button>
          {showEvidence ? (
            <blockquote className="mt-2 border-l-2 border-[#C7D2E4] pl-3 font-nunito text-xs italic text-[#475569]">
              {record.evidence_excerpt}
            </blockquote>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function MeetingRecordsPanel({ transcriptionId, compact = false }: Props): JSX.Element | null {
  const [records, setRecords] = useState<MeetingRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!transcriptionId) {
      setRecords(null);
      return;
    }
    const userId = loadSession()?.userId;
    if (!userId) {
      setRecords(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getMeetingRecords(transcriptionId, userId)
      .then((payload) => {
        if (!cancelled) setRecords(payload.records);
      })
      .catch((error) => {
        console.error('Failed to load meeting records:', error);
        if (!cancelled) {
          setRecords(null);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [transcriptionId]);

  if (!transcriptionId) return null;

  const pad = compact ? 'p-4' : 'p-4 md:p-4';
  const mb = compact ? 'mb-4' : 'mb-6';

  // Older meetings were recorded before records existed, and the backfill
  // runs separately, so an empty result is normal rather than an error. Say
  // nothing instead of claiming the meeting contained no commitments.
  const nothingYet = !loading && !failed && (records?.length ?? 0) === 0;
  if (nothingYet) return null;

  return (
    <div className={`${mb} ${pad} rounded-lg border border-[#E2E8F0] bg-white`}>
      <h3 className="font-nunito text-sm md:text-base font-bold text-[#25324B] mb-3">
        What was committed, decided and blocked
      </h3>

      {loading ? (
        <p className="font-nunito text-xs md:text-sm text-[#6B7A96] italic">Loading records…</p>
      ) : failed ? (
        <p className="font-nunito text-xs md:text-sm text-[#B91C1C]">
          Couldn’t load the records for this meeting.
        </p>
      ) : (
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const rows = (records ?? []).filter((r) => r.record_type === section.type);
            if (rows.length === 0) return null;
            return (
              <div key={section.type}>
                <div className="font-nunito text-xs font-semibold uppercase tracking-wide text-[#6B7A96] mb-2">
                  {section.title} ({rows.length})
                </div>
                <ul className="space-y-3">
                  {rows.map((record) => (
                    <RecordRow key={record.id} record={record} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
