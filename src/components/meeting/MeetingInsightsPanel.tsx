import type { Transcription, ActionItem } from '../../services/transcriptionApi';
import {
  normalizeStringArray,
  normalizeActionItems,
} from '../../services/transcriptionApi';

type Props = {
  transcription: Transcription | null;
  /** When true, show loading placeholders inside insight cards */
  loading?: boolean;
  /** Slightly tighter padding for modals */
  compact?: boolean;
};

/**
 * Meeting intelligence blocks in the same visual slot as the legacy “Meeting Impact Score”
 * (gradient hero card + sections). Works even when utterances are missing or empty.
 */
export function MeetingInsightsPanel({
  transcription,
  loading = false,
  compact = false,
}: Props): JSX.Element | null {
  if (!transcription) return null;

  const pad = compact ? 'p-4' : 'p-4 md:p-4';
  const mb = compact ? 'mb-4' : 'mb-6';

  const signals = normalizeStringArray(transcription.key_outcomes_signals);
  const gaps = normalizeStringArray(transcription.meeting_gaps);
  const openQs = normalizeStringArray(transcription.open_questions);
  const rawActions =
    (transcription as Transcription & { action_items_detail?: ActionItem[] | null }).action_items_detail ??
    transcription.action_items;
  const actions =
    normalizeActionItems(rawActions as unknown) ??
    (Array.isArray(rawActions) ? (rawActions as ActionItem[]) : null);

  const processing = transcription.status === 'processing';

  return (
    <div className={`space-y-3 md:space-y-4 ${compact ? '' : 'lg:space-y-6'}`}>
      {/* Same placement + shell as former Meeting Impact Score */}
      <div
        className={`${mb} ${pad} bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 relative overflow-visible`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-nunito text-sm md:text-base font-bold text-[#25324B]">
            Key Outcomes &amp; Signals
          </h3>
        </div>
        {loading ? (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96] italic">
            Loading meeting insights…
          </p>
        ) : signals.length > 0 ? (
          <ul className="space-y-2">
            {signals.map((line, idx) => (
              <li
                key={idx}
                className="font-nunito text-xs md:text-sm text-[#25324B] flex gap-2 leading-relaxed"
              >
                <span className="text-ellieBlue font-bold shrink-0">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96]">
            {processing
              ? 'Generating key outcomes and signals… This may take a minute after the meeting ends.'
              : 'No key signals extracted for this meeting yet.'}
          </p>
        )}
      </div>

      <div className={`${mb} ${pad} bg-blue-50 rounded-lg border border-blue-200`}>
        <h3 className="font-nunito text-sm md:text-base font-bold text-ellieBlue mb-2">
          What Changed in This Meeting
        </h3>
        {loading ? (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96] italic">Loading…</p>
        ) : transcription.summary && transcription.summary.trim() ? (
          <p className="font-nunito text-xs md:text-sm text-[#25324B] leading-relaxed whitespace-pre-wrap">
            {transcription.summary}
          </p>
        ) : (
          <div className="text-gray-500 italic font-nunito text-xs md:text-sm">
            {processing
              ? 'Summary is being generated…'
              : 'No summary available for this meeting.'}
          </div>
        )}
      </div>

      <div className={`${mb} ${pad} bg-amber-50 rounded-lg border border-amber-200`}>
        <h3 className="font-nunito text-sm md:text-base font-bold text-amber-900 mb-2">
          Gaps Identified in This Meeting
        </h3>
        {loading ? (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96] italic">Loading…</p>
        ) : gaps.length > 0 ? (
          <ul className="space-y-2">
            {gaps.map((line, idx) => (
              <li
                key={idx}
                className="font-nunito text-xs md:text-sm text-[#25324B] flex gap-2 leading-relaxed"
              >
                <span className="text-amber-700 font-bold shrink-0">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96]">
            {processing ? 'Identifying gaps…' : 'No gaps flagged for this meeting.'}
          </p>
        )}
      </div>

      <div className={`${mb} ${pad} bg-slate-50 rounded-lg border border-slate-200`}>
        <h3 className="font-nunito text-sm md:text-base font-bold text-slate-800 mb-2">
          Still Unclear
        </h3>
        {loading ? (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96] italic">Loading…</p>
        ) : openQs.length > 0 ? (
          <ul className="space-y-2">
            {openQs.map((line, idx) => (
              <li
                key={idx}
                className="font-nunito text-xs md:text-sm text-[#25324B] flex gap-2 leading-relaxed"
              >
                <span className="text-slate-500 font-bold shrink-0">?</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96]">
            {processing ? 'Capturing open questions…' : 'No open questions flagged.'}
          </p>
        )}
      </div>

      <div className={`${mb} ${pad} bg-green-50 rounded-lg border border-green-200`}>
        <h3 className="font-nunito text-sm md:text-base font-bold text-green-700 mb-3">
          Action Items
        </h3>
        {loading ? (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96] italic">Loading…</p>
        ) : actions && actions.length > 0 ? (
            <ul className="space-y-4">
              {actions.map((actionItem, index) => {
                const text =
                  typeof actionItem === 'string'
                    ? actionItem
                    : actionItem?.text || (actionItem as { item?: string })?.item || '';
                const owner =
                  typeof actionItem === 'object' && actionItem
                    ? actionItem.owner ?? actionItem.speaker
                    : undefined;
                const deadline =
                  typeof actionItem === 'object' && actionItem ? actionItem.deadline : undefined;
                const clarity =
                  typeof actionItem === 'object' && actionItem ? actionItem.clarity : undefined;
                const blockers =
                  typeof actionItem === 'object' && actionItem ? actionItem.blockers : undefined;
                return (
                  <li
                    key={index}
                    className="flex items-start gap-2 border-b border-green-100/80 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <div className="flex-1 space-y-1">
                      <p className="font-nunito text-xs md:text-sm text-[#25324B] leading-relaxed font-medium">
                        {text}
                      </p>
                      <div className="font-nunito text-[11px] md:text-xs text-ellieGray space-y-0.5">
                        {owner != null && String(owner).trim() !== '' && (
                          <p>
                            <span className="text-[#6B7A96]">Owner:</span> {String(owner)}
                          </p>
                        )}
                        <p>
                          <span className="text-[#6B7A96]">Deadline:</span>{' '}
                          {deadline != null && String(deadline).trim() !== ''
                            ? String(deadline)
                            : 'Not defined'}
                        </p>
                        {clarity && (
                          <p>
                            <span className="text-[#6B7A96]">Clarity:</span>{' '}
                            {clarity === 'vague' ? 'Vague timeline / scope' : 'Clear'}
                          </p>
                        )}
                        {blockers != null && String(blockers).trim() !== '' && (
                          <p>
                            <span className="text-[#6B7A96]">Blocker:</span> {String(blockers)}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
        ) : (
          <p className="font-nunito text-xs md:text-sm text-[#6B7A96]">
            {processing ? 'Extracting action items…' : 'No action items for this meeting.'}
          </p>
        )}
      </div>
    </div>
  );
}
