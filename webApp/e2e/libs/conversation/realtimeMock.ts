import type { Page } from '@playwright/test';

const MOCK_SDP_ANSWER =
  'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=setup:active\r\na=mid:0\r\na=sctp-port:5000\r\n';

/**
 * Avoids live OpenAI Realtime negotiation in e2e while still exercising the
 * dashboard -> Just Talk -> conversation canvas startup path.
 */
export const installRealtimeConversationMock = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const RealRTCPeerConnection = window.RTCPeerConnection;

    window.RTCPeerConnection = class MockRTCPeerConnection extends RealRTCPeerConnection {
      createDataChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel {
        const listeners = new Map<string, Set<EventListener>>();

        const channel = {
          label,
          ordered: options?.ordered ?? true,
          readyState: 'open',
          bufferedAmount: 0,
          binaryType: 'arraybuffer' as BinaryType,
          send: () => undefined,
          close: () => undefined,
          addEventListener(type: string, listener: EventListener) {
            if (!listeners.has(type)) {
              listeners.set(type, new Set());
            }
            listeners.get(type)?.add(listener);
          },
          removeEventListener(type: string, listener: EventListener) {
            listeners.get(type)?.delete(listener);
          },
          dispatchEvent(event: Event) {
            listeners.get(event.type)?.forEach((listener) => listener(event));
            return true;
          },
        } as unknown as RTCDataChannel;

        queueMicrotask(() => {
          channel.dispatchEvent(new Event('open'));
        });

        return channel;
      }

      async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
        try {
          await super.setRemoteDescription(description);
        } catch {
          // Mock SDP is not negotiated with a real peer in e2e.
        }
      }
    };
  });

  await page.route('**/api/sendSdpOffer', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sdpResponse: MOCK_SDP_ANSWER }),
    });
  });
};
