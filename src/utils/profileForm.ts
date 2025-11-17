export type LocalAudience = 'team' | 'personal';

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

