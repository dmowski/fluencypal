export type TranscriptLine = {
  id: number;
  role: "you" | "qwen";
  text: string;
};

export type TranscriptState = {
  lines: TranscriptLine[];
  nextId: number;
  partialKey: string;
  partialId: number | null;
  finalized: string[];
  /** Indexes reserved when the user starts speaking, before their transcript arrives. */
  userInserts: number[];
};

export function emptyTranscript(): TranscriptState {
  return { lines: [], nextId: 1, partialKey: "", partialId: null, finalized: [], userInserts: [] };
}

/** Hold a slot so a late user transcript stays ahead of the reply it caused. */
export function beginUserTurn(state: TranscriptState): TranscriptState {
  const at = state.lines.length;
  if (state.userInserts.at(-1) === at) return state;
  return { ...state, userInserts: [...state.userInserts, at] };
}

export function appendTranscriptDelta(
  state: TranscriptState,
  role: TranscriptLine["role"],
  key: string,
  delta: string,
): TranscriptState {
  if (!delta || state.finalized.includes(key)) return state;
  return writeTranscript(state, role, key, delta, "delta");
}

export function finishTranscript(
  state: TranscriptState,
  role: TranscriptLine["role"],
  key: string,
  text: string,
): TranscriptState {
  if (state.finalized.includes(key)) return state;
  const trimmed = text.trim();
  const hasPartial = state.partialKey === key;
  if (!trimmed && !hasPartial) return state;
  const next = writeTranscript(state, role, key, trimmed, "replace");
  return { ...next, partialKey: "", partialId: null, finalized: [...next.finalized, key] };
}

function writeTranscript(
  state: TranscriptState,
  role: TranscriptLine["role"],
  key: string,
  text: string,
  mode: "delta" | "replace",
): TranscriptState {
  if (state.partialKey === key && state.partialId != null) {
    return {
      ...state,
      lines: state.lines.map((line) => {
        if (line.id !== state.partialId) return line;
        return { ...line, text: mode === "delta" ? line.text + text : text || line.text };
      }),
    };
  }
  if (!text) return state;
  if (role === "qwen" && state.lines.some((line) => line.role === "qwen" && line.text === text)) return state;

  const lines = [...state.lines];
  let userInserts = state.userInserts;
  let insertAt = lines.length;
  if (role === "you" && userInserts.length > 0) {
    insertAt = Math.min(userInserts[0] ?? lines.length, lines.length);
    userInserts = userInserts.slice(1).map((index) => (index >= insertAt ? index + 1 : index));
  }
  lines.splice(insertAt, 0, { id: state.nextId, role, text });
  return {
    ...state,
    nextId: state.nextId + 1,
    partialKey: key,
    partialId: state.nextId,
    userInserts,
    lines: lines.slice(-80),
  };
}
