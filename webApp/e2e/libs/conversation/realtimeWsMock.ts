import type { Page } from '@playwright/test';

const MOCK_ASSISTANT_TEXT = 'Hello from e2e custom realtime mock';

/**
 * Replaces WebSocket connections to `/v1/session` so Experimental Lab custom
 * realtime can run without a live realtime server or OpenAI.
 */
export const installExperimentalRealtimeWsMock = async (page: Page): Promise<void> => {
  await page.addInitScript((assistantText: string) => {
    const RealWebSocket = window.WebSocket;
    const OPEN = 1;

    type Listener = (event: { data: string | ArrayBuffer }) => void;

    const createMockSocket = (url: string): WebSocket => {
      const listeners = new Map<string, Set<Listener>>();
      let readyState = 0;

      const emit = (payload: object) => {
        const data = JSON.stringify(payload);
        const event = new MessageEvent('message', { data });
        socket.onmessage?.(event);
        listeners.get('message')?.forEach((listener) => listener({ data }));
      };

      const socket = {
        url,
        readyState: 0,
        bufferedAmount: 0,
        extensions: '',
        protocol: '',
        binaryType: 'arraybuffer' as BinaryType,
        onopen: null as ((event: Event) => void) | null,
        onmessage: null as ((event: MessageEvent) => void) | null,
        onerror: null as ((event: Event) => void) | null,
        onclose: null as ((event: CloseEvent) => void) | null,
        addEventListener(type: string, listener: Listener) {
          if (!listeners.has(type)) {
            listeners.set(type, new Set());
          }
          listeners.get(type)?.add(listener);
        },
        removeEventListener(type: string, listener: Listener) {
          listeners.get(type)?.delete(listener);
        },
        dispatchEvent(event: Event) {
          const typeListeners = listeners.get(event.type);
          typeListeners?.forEach((listener) => {
            if (event.type === 'message') {
              listener({ data: (event as MessageEvent).data });
            } else {
              listener({ data: '' });
            }
          });

          if (event.type === 'open') {
            socket.onopen?.(event);
          } else if (event.type === 'message') {
            socket.onmessage?.(event as MessageEvent);
          }
          return true;
        },
        send(raw: string | ArrayBuffer) {
          if (typeof raw !== 'string') {
            return;
          }

          let message: { type?: string };
          try {
            message = JSON.parse(raw) as { type?: string };
          } catch {
            return;
          }

          const emitAssistantGreeting = () => {
            const messageId = 'e2e-assistant-1';
            emit({
              type: 'transcript.delta',
              messageId,
              role: 'assistant',
              delta: assistantText,
            });
            emit({
              type: 'transcript.done',
              messageId,
              role: 'assistant',
              text: assistantText,
            });
            emit({ type: 'assistant.speaking', active: false });
          };

          if (message.type === 'session.start') {
            emit({ type: 'session.ready', sessionId: 'e2e-mock-session' });
            // Greeting after onOpen sleeps (~1.9s) without relying on assistant.trigger in e2e.
            window.setTimeout(() => emitAssistantGreeting(), 2100);
            return;
          }

          if (message.type === 'assistant.trigger') {
            emitAssistantGreeting();
          }
        },
        close() {
          readyState = 3;
          Object.defineProperty(socket, 'readyState', { value: 3, configurable: true });
          socket.onclose?.(new CloseEvent('close'));
        },
      } as unknown as WebSocket;

      queueMicrotask(() => {
        readyState = OPEN;
        Object.defineProperty(socket, 'readyState', { value: OPEN, configurable: true });
        socket.dispatchEvent(new Event('open'));
      });

      return socket;
    };

    const WebSocketMock = function (
      url: string | URL,
      protocols?: string | string[],
    ): WebSocket {
      const urlString = String(url);
      if (urlString.includes('/v1/session')) {
        return createMockSocket(urlString);
      }

      return new RealWebSocket(url, protocols);
    } as unknown as typeof WebSocket;

    WebSocketMock.prototype = RealWebSocket.prototype;
    window.WebSocket = WebSocketMock;
  }, MOCK_ASSISTANT_TEXT);

  await page.addInitScript(() => {
    const stream = {
      getTracks: () => [{ stop: () => undefined, enabled: true }],
      getAudioTracks: () => [{ stop: () => undefined, enabled: true }],
    } as MediaStream;

    navigator.mediaDevices.getUserMedia = async () => stream;
  });
};

export const MOCK_EXPERIMENTAL_REALTIME_ASSISTANT_TEXT = MOCK_ASSISTANT_TEXT;
