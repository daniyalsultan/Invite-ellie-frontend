import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patchWorkspace, type WorkspaceRecord } from './workspaceApi';

// How long this workspace keeps meeting recordings. Only recordings expire:
// transcripts, summaries and the records drawn from them are kept, which is
// what the privacy policy lists as separate controls — so the copy here says
// "recordings" everywhere and never "data".

const CHOICES: { label: string; value: number | null }[] = [
  { label: 'Keep for the life of the workspace', value: null },
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '1 year', value: 365 },
];

interface RetentionPanelProps {
  workspace: WorkspaceRecord;
  onSaved?: (updated: WorkspaceRecord) => void;
}

export function RetentionPanel({ workspace, onSaved }: RetentionPanelProps): JSX.Element {
  const { ensureFreshAccessToken } = useAuth();
  const [value, setValue] = useState<number | null>(workspace.recording_retention_days ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const isOwner = workspace.my_role === 'owner';

  async function save(next: number | null): Promise<void> {
    const previous = value;
    setValue(next);
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const token = await ensureFreshAccessToken();
      if (!token) throw new Error('Unable to authenticate. Please login again.');
      const updated = await patchWorkspace(token, workspace.id, { recording_retention_days: next });
      setSaved(true);
      onSaved?.(updated);
    } catch (err) {
      // Put the control back to what the server still holds, so the screen
      // never shows a period that was not actually saved.
      setValue(previous);
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[12px] bg-white p-4 shadow-[0px_18px_30px_rgba(15,23,42,0.05)] md:rounded-[18px] md:p-6 lg:p-8">
      <h3 className="font-nunito text-xl font-bold text-[#25324B]">Recording retention</h3>
      <p className="mt-1 font-nunito text-sm text-[#6B7A96]">
        How long video and audio recordings are kept for meetings in this workspace.
        Transcripts, summaries and commitments are always kept.
      </p>

      <label className="mt-4 block font-nunito text-sm font-semibold text-[#25324B]" htmlFor="retention">
        Keep recordings for
      </label>
      <select
        id="retention"
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-nunito text-sm text-[#25324B] disabled:bg-gray-50 disabled:text-[#6B7A96]"
        value={value === null ? '' : String(value)}
        disabled={!isOwner || saving}
        onChange={(event) => save(event.target.value === '' ? null : Number(event.target.value))}
      >
        {CHOICES.map((choice) => (
          <option key={String(choice.value)} value={choice.value === null ? '' : String(choice.value)}>
            {choice.label}
          </option>
        ))}
      </select>

      <p className="mt-2 font-nunito text-xs text-[#6B7A96]">
        Unset, nothing expires: a recording is kept for the life of the workspace
        unless the person who recorded it has set their own period.
      </p>

      {!isOwner && (
        <p className="mt-2 font-nunito text-xs text-[#6B7A96]">
          Only a workspace owner can change this.
        </p>
      )}
      {saving && <p className="mt-2 font-nunito text-xs text-[#6B7A96]">Saving…</p>}
      {saved && !saving && !error && (
        <p className="mt-2 font-nunito text-xs text-green-600">Saved.</p>
      )}
      {error && <p className="mt-2 font-nunito text-xs text-red-600">{error}</p>}
    </div>
  );
}
