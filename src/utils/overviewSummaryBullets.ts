/**
 * Turn folder meeting overview summary text into bullet lines for display.
 * Handles blank-line paragraphs, single newlines, leading "-", "•", or "1." markers,
 * and backend fallback blocks separated by horizontal rules.
 */
export function splitOverviewSummaryToBullets(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const strip = (s: string) =>
    s
      .replace(/^[-•*]\s+/, '')
      .replace(/^\d+\.\s+/, '')
      .trim();

  // Deterministic fallback joins meetings with a dashed rule line
  const ruleSplit = /\n\s*─{3,}[^\n]*\n\s*/;
  if (ruleSplit.test(normalized)) {
    const chunks = normalized.split(ruleSplit).map((s) => s.trim()).filter(Boolean);
    if (chunks.length > 0) return chunks.map(strip).filter(Boolean);
  }

  let chunks: string[];
  if (/\n\n/.test(normalized)) {
    chunks = normalized.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  } else {
    chunks = normalized.split(/\n/).map((s) => s.trim()).filter(Boolean);
  }

  return chunks.map(strip).filter(Boolean);
}
