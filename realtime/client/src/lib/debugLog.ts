const MAX_LINES = 200;

let logEl: HTMLPreElement | null = null;
const lines: string[] = [];
const context: Record<string, string> = {};

/** High-frequency events (mic chunks, transcript deltas) — console only when enabled. */
let verboseConsole = false;

export const setVerboseDebugConsole = (enabled: boolean): void => {
  verboseConsole = enabled;
};

const formatData = (data: unknown): string => {
  if (data === undefined) {
    return '';
  }

  try {
    return ` ${JSON.stringify(data)}`;
  } catch {
    return ' [unserializable]';
  }
};

const pushLine = (line: string): void => {
  console.log(`[realtime-client] ${line}`);
  lines.unshift(line);
  if (lines.length > MAX_LINES) {
    lines.length = MAX_LINES;
  }

  if (logEl) {
    logEl.textContent = lines.join('\n');
  }
};

export const bindDebugLogPanel = (element: HTMLPreElement): void => {
  logEl = element;
  if (lines.length === 0) {
    debugLog('client', 'ready', { href: window.location.href });
  } else {
    logEl.textContent = lines.join('\n');
  }
};

export const setDebugLogContext = (patch: Record<string, string | boolean | undefined>): void => {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      delete context[key];
    } else {
      context[key] = String(value);
    }
  }
};

export const getDebugLogText = (): string => {
  const header = [
    'FluencyPal Realtime client — debug log',
    `Copied: ${new Date().toISOString()}`,
    `URL: ${window.location.href}`,
    `User agent: ${navigator.userAgent}`,
    `Lines: ${lines.length}`,
    ...Object.entries(context).map(([key, value]) => `${key}: ${value}`),
    '---',
  ];

  const chronological = [...lines].reverse();
  return `${header.join('\n')}\n${chronological.join('\n')}`;
};

export const copyDebugLogToClipboard = async (): Promise<boolean> => {
  const text = getDebugLogText();

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();

    try {
      return document.execCommand('copy');
    } finally {
      textarea.remove();
    }
  }
};

/** Panel + console — use for session, errors, playback, connection. */
export const debugLog = (category: string, message: string, data?: unknown): void => {
  const ts = new Date().toISOString().slice(11, 23);
  pushLine(`[${ts}] [${category}] ${message}${formatData(data)}`);
};

/** Console only (mic chunk stream, etc.) unless verbose mode is on. */
export const debugLogVerbose = (category: string, message: string, data?: unknown): void => {
  const ts = new Date().toISOString().slice(11, 23);
  const line = `[${ts}] [${category}] ${message}${formatData(data)}`;
  if (verboseConsole) {
    console.log(`[realtime-client] ${line}`);
  }
};

export const clearDebugLog = (): void => {
  lines.length = 0;
  if (logEl) {
    logEl.textContent = '';
  }
};

export const getDebugLogLines = (): string[] => [...lines].reverse();

export type RealtimeE2eHooks = {
  getDebugLogLines: () => string[];
  getDebugLogText: () => string;
  getDebugLogContext: () => Record<string, string>;
};

declare global {
  interface Window {
    __realtimeE2e?: RealtimeE2eHooks;
  }
}

export const exposeRealtimeE2eHooks = (): void => {
  window.__realtimeE2e = {
    getDebugLogLines,
    getDebugLogText,
    getDebugLogContext: () => ({ ...context }),
  };
};
