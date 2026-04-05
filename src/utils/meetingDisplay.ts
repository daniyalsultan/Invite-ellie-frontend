/** Treats JSON/LLM literal "null", empty, etc. as missing (avoids showing "Owner: null"). */
export function isAbsentScalar(value: unknown): boolean {
  if (value == null) return true;
  const s = String(value).trim();
  if (s === '') return true;
  const lower = s.toLowerCase();
  return lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'none';
}

export function displayOwner(value: unknown): string {
  return isAbsentScalar(value) ? 'Unassigned' : String(value).trim();
}

export function displayDeadline(value: unknown): string {
  return isAbsentScalar(value) ? 'Not defined' : String(value).trim();
}

export function displayBlocker(value: unknown): string {
  return isAbsentScalar(value) ? 'No blocker' : String(value).trim();
}
