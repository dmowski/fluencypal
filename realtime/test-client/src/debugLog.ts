const MAX_LINES = 300;

let logEl: HTMLPreElement | null = null;
const lines: string[] = [];
const context: Record<string, string> = {};

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
    'FluencyPal Realtime test client — debug log',
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

export const debugLog = (category: string, message: string, data?: unknown): void => {
  const ts = new Date().toISOString().slice(11, 23);
  const line = `[${ts}] [${category}] ${message}${formatData(data)}`;

  console.log(`[realtime-client] ${line}`);

  lines.unshift(line);
  if (lines.length > MAX_LINES) {
    lines.length = MAX_LINES;
  }

  if (logEl) {
    logEl.textContent = lines.join('\n');
  }
};

export const clearDebugLog = (): void => {
  lines.length = 0;
  if (logEl) {
    logEl.textContent = '';
  }
};
