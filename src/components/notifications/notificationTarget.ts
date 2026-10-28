/**
 * Where a notification should take you, if anywhere.
 *
 * Both the bell and the notifications page used to send every notification
 * to /unresolved-meetings regardless of what it was about. That was right
 * for the only type that existed and wrong for the next one.
 */

export interface NotificationTarget {
  id: string;
  type?: string;
  meeting_id: string | null;
  read: boolean;
}

export const NOT_RECORDED = 'meeting_not_recorded';

/**
 * The route to open, or null to stay put.
 *
 * A meeting Ellie was never admitted to has nothing to open: there is no
 * transcript, no summary and no workspace decision to make. The message
 * itself is the whole story, so sending someone to an unrelated page would
 * only lose them.
 */
export function targetFor(notification: NotificationTarget): string | null {
  if (notification.type === NOT_RECORDED) {
    return null;
  }
  if (notification.meeting_id) {
    return `/unresolved-meetings?meeting=${notification.meeting_id}`;
  }
  return '/unresolved-meetings';
}
