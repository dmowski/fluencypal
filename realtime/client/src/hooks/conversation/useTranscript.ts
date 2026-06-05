import { useCallback, useState } from "react";
import type { TranscriptMessage } from "./types.js";

export const useTranscript = () => {
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);

  const upsertTranscript = useCallback(
    (messageId: string, role: "user" | "assistant", text: string) => {
      setTranscriptMessages((prev) => {
        const index = prev.findIndex((m) => m.messageId === messageId);
        if (index >= 0) {
          const next = [...prev];
          next[index] = { messageId, role, text };
          return next;
        }
        return [...prev, { messageId, role, text }];
      });
    },
    [],
  );

  const appendTranscriptDelta = useCallback(
    (messageId: string, role: "user" | "assistant", delta: string) => {
      setTranscriptMessages((prev) => {
        const index = prev.findIndex((m) => m.messageId === messageId);
        if (index >= 0) {
          const next = [...prev];
          next[index] = { ...next[index], text: `${next[index].text}${delta}` };
          return next;
        }
        return [...prev, { messageId, role, text: delta }];
      });
    },
    [],
  );

  return { transcriptMessages, upsertTranscript, appendTranscriptDelta };
};
