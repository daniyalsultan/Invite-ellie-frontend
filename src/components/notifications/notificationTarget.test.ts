import { describe, expect, it } from 'vitest';
import { NOT_RECORDED, targetFor } from './notificationTarget';

/**
 * Both the bell and the notifications page used to send every notification
 * to /unresolved-meetings regardless of what it was about.
 */
describe('targetFor', () => {
  it('opens the meeting an unresolved notification is about', () => {
    expect(targetFor({ id: 'n1', meeting_id: 'm1', read: false }))
      .toBe('/unresolved-meetings?meeting=m1');
  });

  it('falls back to the list when it names no meeting', () => {
    expect(targetFor({ id: 'n1', meeting_id: null, read: false }))
      .toBe('/unresolved-meetings');
  });

  it('goes nowhere for a meeting that was never recorded', () => {
    // There is no transcript, no summary and no workspace decision to make,
    // so the message is the whole story.
    expect(targetFor({ id: 'n1', type: NOT_RECORDED, meeting_id: null, read: false }))
      .toBeNull();
  });

  it('goes nowhere even if such a notification carries a meeting id', () => {
    expect(targetFor({ id: 'n1', type: NOT_RECORDED, meeting_id: 'm1', read: false }))
      .toBeNull();
  });
});
