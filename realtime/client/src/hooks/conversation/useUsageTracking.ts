import { useCallback, useRef, useState } from 'react';
import { SessionUsageTracker } from '../../lib/sessionUsage.js';
import { parseUsageStage } from './types.js';

export const useUsageTracking = () => {
  const trackerRef = useRef(new SessionUsageTracker());
  const [usageLogText, setUsageLogText] = useState('No usage yet.');
  const [usageSummary, setUsageSummary] = useState('Session total: $0.0000 (0 usage events)');

  const renderUsagePanel = useCallback(() => {
    const tracker = trackerRef.current;
    setUsageSummary(tracker.formatSummaryLine());
    setUsageLogText(
      tracker.allEntries.length === 0
        ? 'No usage yet.'
        : tracker.allEntries.map((entry) => tracker.formatEntryLine(entry)).join('\n'),
    );
  }, []);

  const resetUsage = useCallback(() => {
    trackerRef.current.reset();
    renderUsagePanel();
  }, [renderUsagePanel]);

  const recordUsage = useCallback(
    (params: {
      stage: string;
      model: string;
      usageEvent: {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
        audioDurationSeconds?: number;
      } | null;
      createdAt?: number;
    }) => {
      const parsedStage = parseUsageStage(params.stage);
      if (!parsedStage || !params.usageEvent) {
        return;
      }

      trackerRef.current.record(
        parsedStage,
        params.model,
        {
          input_tokens: params.usageEvent.input_tokens ?? 0,
          output_tokens: params.usageEvent.output_tokens ?? 0,
          total_tokens: params.usageEvent.total_tokens,
          audioDurationSeconds: params.usageEvent.audioDurationSeconds,
        },
        params.createdAt ?? Date.now(),
      );
      renderUsagePanel();
    },
    [renderUsagePanel],
  );

  return { usageLogText, usageSummary, renderUsagePanel, resetUsage, recordUsage };
};
