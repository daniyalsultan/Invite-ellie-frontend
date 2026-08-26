import type { SlackChannel } from '../../services/slackApi';

export type ExportType = 'slack' | 'notion' | 'hubspot';

/** An export the user has asked for but not yet confirmed.
 *
 * `duplicateWarning` is set when the server reported this meeting has already
 * been delivered to that destination; confirming past it means "send anyway",
 * which is what `force` means to the server.
 */
export interface PendingExport {
  transcriptionId: string;
  exportType: ExportType;
  meetingTitle: string;
  /** Human-readable destination, e.g. `the Webring workspace`. */
  destination: string;
  channel: string;
  duplicateWarning?: string;
}

interface ExportConfirmDialogProps {
  pending: PendingExport | null;
  slackChannels: SlackChannel[] | null;
  slackChannelsError: string | null;
  onChannelChange: (channel: string) => void;
  onCancel: () => void;
  onConfirm: (request: PendingExport) => void;
}

/** Confirmation step shared by every screen that can export a meeting.
 *
 * This lived twice — once on the meetings list and once, in a thinner and
 * subtly different form, in the workspace meeting modal. The copies drifted:
 * the workspace one sent to Slack without asking which channel, which is how
 * exports silently went to #general, and it had no duplicate confirmation at
 * all. One component means a fix lands everywhere.
 */
export function ExportConfirmDialog({
  pending,
  slackChannels,
  slackChannelsError,
  onChannelChange,
  onCancel,
  onConfirm,
}: ExportConfirmDialogProps) {
  if (!pending) return null;

  const needsChannel = pending.exportType === 'slack' && !pending.duplicateWarning;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-confirm-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-5 md:p-6 shadow-xl">
        <h2 id="export-confirm-title" className="font-nunito text-lg font-bold text-ellieBlack">
          {pending.duplicateWarning ? 'Export again?' : 'Confirm export'}
        </h2>

        {pending.duplicateWarning ? (
          <p className="mt-2 font-nunito text-sm text-ellieBlack">{pending.duplicateWarning}</p>
        ) : (
          <p className="mt-2 font-nunito text-sm text-ellieBlack">
            Send <span className="font-semibold">{pending.meetingTitle}</span> to{' '}
            <span className="font-semibold">
              {pending.exportType === 'slack' && pending.channel
                ? `${pending.channel} in ${pending.destination}`
                : pending.destination}
            </span>
            ?
          </p>
        )}

        {needsChannel && (
          <div className="mt-4">
            <label
              htmlFor="export-slack-channel"
              className="block font-nunito text-xs font-semibold uppercase tracking-wide text-ellieGray"
            >
              Channel
            </label>

            {slackChannels === null ? (
              <p className="mt-2 font-nunito text-sm text-ellieGray">Loading channels…</p>
            ) : slackChannels.length > 0 ? (
              <>
                <select
                  id="export-slack-channel"
                  value={pending.channel}
                  onChange={(e) => onChannelChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-nunito text-sm text-ellieBlack focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/30"
                >
                  <option value="">Choose a channel…</option>
                  {slackChannels.map((c) => (
                    <option key={c.id} value={`#${c.name}`}>
                      #{c.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 font-nunito text-xs text-ellieGray">
                  Private channels aren&rsquo;t listed. To use one, run{' '}
                  <code className="rounded bg-gray-100 px-1">/invite @Ellie</code> in that channel,
                  then type its name below.
                </p>
                <input
                  type="text"
                  value={pending.channel}
                  onChange={(e) => onChannelChange(e.target.value)}
                  placeholder="#private-channel"
                  aria-label="Or type a channel name"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 font-nunito text-sm text-ellieBlack focus:border-ellieBlue focus:outline-none focus:ring-2 focus:ring-ellieBlue/30"
                />
              </>
            ) : (
              <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                <p className="font-nunito text-xs text-amber-900">
                  {slackChannelsError
                    ? `Ellie couldn't read your channel list (${slackChannelsError}).`
                    : 'Ellie can’t see any channels in this workspace yet.'}{' '}
                  Create a public channel, or run{' '}
                  <code className="rounded bg-amber-100 px-1">/invite @Ellie</code> in the channel
                  you want to use, then reopen this dialog.
                </p>
              </div>
            )}
          </div>
        )}

        {pending.exportType === 'hubspot' && !pending.duplicateWarning && (
          <p className="mt-3 font-nunito text-xs text-ellieGray">
            The summary is attached as a note to every HubSpot contact matching this
            meeting&rsquo;s attendees.
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 font-nunito text-sm font-semibold text-ellieGray hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={needsChannel && !pending.channel.trim()}
            onClick={() => onConfirm(pending)}
            className="rounded-lg bg-ellieBlue px-4 py-2 font-nunito text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending.duplicateWarning ? 'Send again' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
