export type LocalAudience = 'team' | 'personal';

const PROFILE_SETUP_FLAG_PREFIX = 'ellie_profile_setup_';
const canUseBrowserStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function apiAudienceToLocal(value?: string | null): LocalAudience {
  const normalized = value?.toString().toUpperCase();
  return normalized === 'PERSONAL' ? 'personal' : 'team';
}

export function localAudienceToApi(value: LocalAudience): 'COMPANY' | 'PERSONAL' {
  return value === 'personal' ? 'PERSONAL' : 'COMPANY';
}

export function encodeMultiSelect(values: string[]): string {
  return values.filter(Boolean).join(',');
}

export function decodeMultiSelect(raw: unknown, allowedValues: string[]): string[] {
  if (typeof raw !== 'string') {
    return [];
  }

  const lookup = new Set(allowedValues);
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && lookup.has(value));
}

export function hasCompletedProfileSetup(userId: string | null | undefined): boolean {
  if (!canUseBrowserStorage || !userId) {
    return false;
  }
  return window.localStorage.getItem(`${PROFILE_SETUP_FLAG_PREFIX}${userId}`) === 'true';
}

export function markProfileSetupComplete(userId: string | null | undefined): void {
  if (!canUseBrowserStorage || !userId) {
    return;
  }
  window.localStorage.setItem(`${PROFILE_SETUP_FLAG_PREFIX}${userId}`, 'true');
}

export function clearProfileSetupFlag(userId: string | null | undefined): void {
  if (!canUseBrowserStorage || !userId) {
    return;
  }
  window.localStorage.removeItem(`${PROFILE_SETUP_FLAG_PREFIX}${userId}`);
}

