import { useState } from 'react';
import { correctRecord } from '../../services/transcriptionApi';
import type { MeetingRecord, RecordCorrection } from '../../services/transcriptionApi';

type Props = {
  record: MeetingRecord;
  userId: string | null | undefined;
  /** Called with the record as the server returned it. */
  onChanged: (updated: MeetingRecord) => void;
};

/**
 * Put right what Ellie got wrong about one record.
 *
 * Three acts, deliberately distinct. Closing says it was real and is now
 * done. Dismissing says it was never a commitment at all — Ellie misread
 * the conversation. Reopening undoes either. Collapsing dismiss into close
 * would hide how often the extraction is wrong, which is the thing most
 * worth knowing.
 *
 * The record's wording is not editable here. It is Ellie's account of what
 * was said, and editing it would shade into rewriting the meeting.
 */
export function RecordActions({ record, userId, onChanged }: Props): JSX.Element | null {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [editingOwner, setEditingOwner] = useState(false);
  const [owner, setOwner] = useState(record.owner ?? '');

  if (!userId) return null;

  const send = async (change: RecordCorrection) => {
    setBusy(true);
    setFailed(false);
    try {
      const result = await correctRecord(record.id, userId, change);
      onChanged(result.record);
      setEditingOwner(false);
    } catch (error) {
      console.error('Correction failed:', error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const closed = record.status !== 'open';

  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <div className="flex flex-wrap items-center gap-3 font-nunito text-xs">
        {closed ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void send({ status: 'open' })}
            className="font-semibold text-ellieBlue hover:underline disabled:opacity-50"
          >
            Reopen
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void send({ status: 'resolved' })}
              className="font-semibold text-[#166534] hover:underline disabled:opacity-50"
            >
              Mark done
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void send({ dismiss: true })}
              title="Ellie misread this — it was never a commitment"
              className="font-semibold text-[#B91C1C] hover:underline disabled:opacity-50"
            >
              Not a real item
            </button>
            {editingOwner ? null : (
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditingOwner(true)}
                className="font-semibold text-ellieBlue hover:underline disabled:opacity-50"
              >
                {record.owner ? 'Change owner' : 'Set owner'}
              </button>
            )}
          </>
        )}
        {busy ? <span className="text-[#6B7A96]">Saving…</span> : null}
        {failed ? <span className="text-[#B91C1C]">Couldn’t save that.</span> : null}
      </div>

      {editingOwner ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Who owns this?"
            className="rounded-lg border border-gray-200 px-2 py-1 font-nunito text-xs"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void send({ owner })}
            className="font-nunito text-xs font-semibold text-ellieBlue hover:underline disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingOwner(false);
              setOwner(record.owner ?? '');
            }}
            className="font-nunito text-xs text-[#6B7A96] hover:underline"
          >
            Cancel
          </button>
          {record.owner ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void send({ owner: '' })}
              title="A wrongly attributed owner is worse than none"
              className="font-nunito text-xs text-[#B91C1C] hover:underline disabled:opacity-50"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Says a person decided this, so nobody mistakes it for Ellie's reading. */
export function CorrectedMark({ record }: { record: MeetingRecord }): JSX.Element | null {
  if (!record.corrected) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-[#EDE9FE] px-2.5 py-1 font-nunito text-xs font-semibold text-[#5B21B6]">
      Set by a person
    </span>
  );
}
