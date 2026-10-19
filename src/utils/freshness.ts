/**
 * How long ago something was computed, in words.
 *
 * Meeting intelligence is cached, sometimes for weeks, and a stale summary
 * looks exactly like a current one. Saying when it was written is the
 * cheapest way to stop people trusting it more than they should.
 *
 * Deliberately coarse. "3 weeks ago" is as much precision as the question
 * deserves, and a timestamp to the minute invites reading significance
 * into the gap between two cache writes.
 */
export function howLongAgo(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const seconds = Math.round((Date.now() - then) / 1000);
  // Clocks disagree; a few seconds in the future is not the future.
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 9) return `${weeks} weeks ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

/** Old enough that someone should know before relying on it. */
export function isStale(iso: string | null | undefined, days = 7): boolean {
  if (!iso) return false;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return false;
  return Date.now() - then > days * 24 * 60 * 60 * 1000;
}
