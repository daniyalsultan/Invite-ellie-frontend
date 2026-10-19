import { useEffect, useState } from 'react';
import { getWorkspaceUnresolved } from '../../services/transcriptionApi';
import type { MeetingRecord, MeetingRecordsResponse } from '../../services/transcriptionApi';
import { CorrectedMark, RecordActions } from '../meeting/RecordActions';

type Props = {
  workspaceId: string | null | undefined;
  userId: string | null | undefined;
};

const TYPE_LABEL: Record<string, string> = {
  commitment: 'Commitment',
  action_item: 'Action item',
  promise: 'Promise',
  blocker: 'Blocker',
  risk: 'Risk',
};

const HEARD_LABEL: Record<string, string> = {
  restated: 'Raised again',
  progressed: 'Moved forward',
  resolved: 'Reported done',
  contradicted: 'Contradicted',
  dropped: 'Dropped',
};

/** "3 weeks" reads better than "21 days" and is no less precise here. */
function howLong(days: number | null | undefined): string {
  if (days === null || days === undefined) return 'unknown age';
  if (days < 1) return 'today';
  if (days === 1) return '1 day';
  if (days < 14) return `${days} days`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

function Row({
  record,
  userId,
  onChanged,
}: {
  record: MeetingRecord;
  userId: string | null | undefined;
  onChanged: (updated: MeetingRecord) => void;
}): JSX.Element {
  const heard = record.last_heard;
  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2 font-nunito text-xs">
        <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 font-semibold text-[#1D4ED8]">
          {TYPE_LABEL[record.record_type] ?? record.record_type}
        </span>
        <span className="text-[#6B7A96]">Open {howLong(record.age_days)}</span>
        {record.owner ? (
          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[#475569]">{record.owner}</span>
        ) : (
          <span className="rounded-full bg-[#FEE2E2] px-2.5 py-1 font-semibold text-[#B91C1C]">
            No owner named
          </span>
        )}
        {record.deadline ? (
          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[#475569]">
            Said: {record.deadline}
          </span>
        ) : null}
        <CorrectedMark record={record} />
      </div>

      <p className="font-nunito text-sm font-medium text-[#25324B]">{record.text}</p>

      <div className="mt-2 font-nunito text-xs text-[#6B7A96]">
        {record.meeting_title ? <span>From “{record.meeting_title}”. </span> : null}
        {heard ? (
          <span>
            <span className="font-semibold text-[#25324B]">
              {HEARD_LABEL[heard.event_type] ?? heard.event_type}
            </span>
            {heard.excerpt ? <span> — “{heard.excerpt}”</span> : null}
          </span>
        ) : (
          <span className="italic">Not mentioned in any meeting since.</span>
        )}
      </div>

      <RecordActions record={record} userId={userId} onChanged={onChanged} />
    </li>
  );
}

/**
 * What the workspace is still waiting on.
 *
 * Sorted by how long each item has been open, not by deadline. Deadlines are
 * kept as they were spoken — "end of the quarter" — and never parsed into
 * dates, so this cannot say what is overdue without inventing one. It says
 * how old a thing is, which is true.
 */
export function UnresolvedPanel({ workspaceId, userId }: Props): JSX.Element | null {
  const [data, setData] = useState<MeetingRecordsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!workspaceId || !userId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getWorkspaceUnresolved(workspaceId, userId)
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((error) => {
        console.error('Failed to load unresolved items:', error);
        if (!cancelled) {
          setData(null);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, userId]);

  if (!workspaceId) return null;

  const records = (data?.records ?? []).filter((r) => r.status === 'open');
  const visible = showAll ? records : records.slice(0, 5);

  return (
    <section>
      <h4 className="font-nunito text-sm font-bold uppercase tracking-wide text-[#6B7A96] mb-3">
        Still outstanding{records.length > 0 ? ` (${records.length})` : ''}
      </h4>

      {loading ? (
        <p className="font-nunito text-sm text-[#6B7A96] rounded-2xl border border-gray-200 bg-white p-5">
          Loading…
        </p>
      ) : failed ? (
        <p className="font-nunito text-sm text-[#B91C1C] rounded-2xl border border-gray-200 bg-white p-5">
          Couldn’t load what’s outstanding.
        </p>
      ) : records.length === 0 ? (
        <p className="font-nunito text-sm text-[#94A3C1] italic rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
          Nothing outstanding — every commitment from these meetings has been closed.
        </p>
      ) : (
        <div className="space-y-3">
          {(data?.unowned || data?.never_mentioned_again) ? (
            <div className="flex flex-wrap gap-2 font-nunito text-xs">
              {data?.unowned ? (
                <span className="rounded-full bg-[#FEE2E2] px-3 py-1 font-semibold text-[#B91C1C]">
                  {data.unowned} with no owner
                </span>
              ) : null}
              {data?.never_mentioned_again ? (
                <span className="rounded-full bg-[#FEF3C7] px-3 py-1 font-semibold text-[#92400E]">
                  {data.never_mentioned_again} never raised again
                </span>
              ) : null}
            </div>
          ) : null}

          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {visible.map((record) => (
              <Row
                key={record.id}
                record={record}
                userId={userId}
                onChanged={(updated) =>
                  setData((current) =>
                    current
                      ? {
                          ...current,
                          records: current.records.map((r) =>
                            r.id === updated.id ? updated : r,
                          ),
                        }
                      : current,
                  )
                }
              />
            ))}
          </ul>

          {records.length > 5 ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="font-nunito text-sm font-semibold text-ellieBlue hover:underline"
            >
              {showAll ? 'Show fewer' : `Show all ${records.length}`}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
