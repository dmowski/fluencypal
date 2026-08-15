/**
 * Normalize AI word-list payloads into lowercase strings.
 * Models sometimes return objects (`{ word: "..." }`) or mixed types.
 */
export function normalizeWordsToLearn(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const words: string[] = [];
  for (const item of raw) {
    let value: string | null = null;
    if (typeof item === 'string') {
      value = item;
    } else if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const candidate = record.word ?? record.text ?? record.value;
      if (typeof candidate === 'string') value = candidate;
    } else if (typeof item === 'number' || typeof item === 'boolean') {
      value = String(item);
    }

    const normalized = value?.trim().toLowerCase();
    if (normalized) words.push(normalized);
  }
  return words;
}
