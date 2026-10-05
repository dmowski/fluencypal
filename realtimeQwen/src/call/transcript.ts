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
};

export function emptyTranscript(): TranscriptState {
  return { lines: [], nextId: 1, partialKey: "", partialId: null, finalized: [] };
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
  const id = state.nextId;
  return {
    ...state,
    nextId: id + 1,
    partialKey: key,
    partialId: id,
    lines: [...state.lines, { id, role, text }].slice(-80),
  };
}
