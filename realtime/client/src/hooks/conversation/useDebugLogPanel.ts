import { useCallback, useEffect, useRef, useState } from 'react';
import {
  bindDebugLogPanel,
  clearDebugLog,
  copyDebugLogToClipboard,
  debugLog,
  exposeRealtimeE2eHooks,
} from '../../lib/debugLog.js';

export const useDebugLogPanel = (syncDebugContext: () => void) => {
  const debugLogElRef = useRef<HTMLPreElement | null>(null);
  const [debugLogStatus, setDebugLogStatus] = useState<{ message: string; isError: boolean } | null>(
    null,
  );

  const handleCopyDebugLog = useCallback(async () => {
    syncDebugContext();
    const copied = await copyDebugLogToClipboard();
    if (copied) {
      setDebugLogStatus({ message: 'Logs copied to clipboard.', isError: false });
      debugLog('client', 'logs_copied');
    } else {
      setDebugLogStatus({
        message: 'Could not copy logs. Select and copy from the panel manually.',
        isError: true,
      });
    }
  }, [syncDebugContext]);

  const handleClearDebugLog = useCallback(() => {
    clearDebugLog();
    debugLog('client', 'logs_cleared');
  }, []);

  const bindDebugLogElement = useCallback((element: HTMLPreElement | null) => {
    debugLogElRef.current = element;
    if (element) {
      bindDebugLogPanel(element);
    }
  }, []);

  useEffect(() => {
    exposeRealtimeE2eHooks();
  }, []);

  useEffect(() => {
    syncDebugContext();
  }, [syncDebugContext]);

  return {
    debugLogStatus,
    handleCopyDebugLog,
    handleClearDebugLog,
    bindDebugLogElement,
  };
};
