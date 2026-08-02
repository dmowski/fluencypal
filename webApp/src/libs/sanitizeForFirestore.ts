/** Firestore rejects `undefined` anywhere in a document — omit those fields. */
export const sanitizeForFirestore = <T>(value: T): T => {
  if (value === undefined || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as T;
  }

  if (typeof value !== 'object') {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) {
      result[key] = sanitizeForFirestore(entry);
    }
  }
  return result as T;
};
