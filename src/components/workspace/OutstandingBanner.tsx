import { useEffect, useState } from 'react';
import { getWorkspaceUnresolved } from '../../services/transcriptionApi';
import type { OutstandingItem } from '../../services/transcriptionApi';

// Commitments that are past a deadline somebody actually stated, shown in the
// workspace summary without anyone opening the unresolved panel. That panel
// exists and nobody opens it, so a missed commitment stays missed.
//
// The server decides what belongs here (app/logic/outstanding.py): only a
// deadline that resolved to a real date, duplicates removed, capped. Nothing
// is called late on a guess — a commitment due "before the next meeting" has
// no date and is never shown here.

// On since 2026-10-30, after the audit cleared both bars on real meetings.
//
// This is the only place Ellie raises a commitment nobody asked her about,
// so it is the one place extraction precision is not merely untidy: a
// closed or misread item pushed into the summary is Ellie telling someone
// they owe something they do not. It stayed off through four measurements
// that did not clear the bar.
//
// What cleared it was narrowing the view to what somebody owes -- a risk is
// a standing condition, not a debt -- and then measuring on real meetings
// rather than on the `test 1` and `test 2` recordings, which were inflating
// the miss rate. Population 36, sample 30, seed 20261029: genuinely open
// 70.0%, never-a-commitment 20.0%.
//
// If either number moves the wrong way, this is the switch.
const SURFACE_UNPROMPTED = true;

function overdueFor(days: number): string {
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} overdue`;
  if (days < 60) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? '' : 's'} overdue`;
  return `${Math.round(days / 30)} months overdue`;
}

type Props = {
  workspaceId: string | null | undefined;
  userId: string | null | undefined;
};

export function OutstandingBanner({ workspaceId, userId }: Props): JSX.Element | null {
  const [items, setItems] = useState<OutstandingItem[]>([]);

  useEffect(() => {
    if (!SURFACE_UNPROMPTED || !workspaceId || !userId) {
      setItems([]);
      return;
    }
    let cancelled = false;
    getWorkspaceUnresolved(workspaceId, userId)
      .then((payload) => {
        if (!cancelled) setItems(payload.outstanding ?? []);
      })
      .catch(() => {
        // Nothing to show rather than an error: this is a prompt nobody
        // asked for, and it must never be the thing that breaks the page.
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, userId]);

  if (!SURFACE_UNPROMPTED || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 rounded-[12px] border border-amber-200 bg-amber-50 p-4">
      <h4 className="font-nunito text-sm font-bold text-[#25324B]">
        Past their deadline ({items.length})
      </h4>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="font-nunito text-sm text-[#25324B]">
            <span>{item.text}</span>
            <span className="mt-0.5 block text-xs text-[#6B7A96]">
              {item.owner ? `${item.owner} · ` : ''}
              said {item.deadline ? `“${item.deadline}”` : 'with a deadline'}
              {' · '}
              {overdueFor(item.days_overdue)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
