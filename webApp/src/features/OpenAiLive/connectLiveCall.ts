import { buildOpenAiLiveGreeting } from './instructions';
import { OpenAiLiveMode } from './types';

export type LiveSocket = {
  sessionId: string;
  send: (event: Record<string, unknown>) => void;
  setMuted: (muted: boolean) => void;
  requestClose: () => void;
  destroy: () => void;
  playAudio: () => Promise<void>;
};

const waitForIce = (connection: RTCPeerConnection) =>
  new Promise<void>((resolve, reject) => {
    if (connection.iceGatheringState === 'complete') {
      resolve();
      return;
    }
    const timeout = window.setTimeout(() => {
      connection.removeEventListener('icegatheringstatechange', onState);
      reject(new Error('Timed out while gathering ICE candidates'));
    }, 10_000);
    function onState() {
      if (connection.iceGatheringState !== 'complete') return;
      window.clearTimeout(timeout);
      connection.removeEventListener('icegatheringstatechange', onState);
      resolve();
    }
    connection.addEventListener('icegatheringstatechange', onState);
  });

export const connectOpenAiLiveCall = async ({
  mode,
  offer,
  onEvent,
  onBind,
  onStarted,
  onRemoteClosed,
  onNeedsUnlock,
}: {
  mode: OpenAiLiveMode;
  offer: (sdp: string) => Promise<{ sessionId: string; sdp: string }>;
  onEvent: (event: Record<string, unknown>) => void;
  onBind: (socket: LiveSocket) => void;
  onStarted: () => void;
  onRemoteClosed: () => void;
  onNeedsUnlock: () => void;
}): Promise<LiveSocket> => {
  const connection = new RTCPeerConnection();
  const audio = new Audio();
  audio.autoplay = true;
  let microphone: MediaStream | null = null;
  let events: RTCDataChannel | null = null;
  let destroyed = false;
  let started = false;

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    microphone?.getTracks().forEach((track) => track.stop());
    if (events && events.readyState !== 'closed') events.close();
    connection.close();
    audio.srcObject = null;
  };

  const send = (event: Record<string, unknown>) => {
    if (!events || events.readyState !== 'open') return;
    events.send(JSON.stringify(event));
  };

  const socket: LiveSocket = {
    sessionId: '',
    send,
    setMuted: (muted: boolean) => {
      microphone?.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
      send({
        type: muted ? 'session.input_audio.mute' : 'session.input_audio.unmute',
        event_id: crypto.randomUUID(),
      });
    },
    requestClose: () => {
      send({ type: 'session.close', event_id: 'close' });
    },
    destroy,
    playAudio: () => audio.play(),
  };

  try {
    connection.addEventListener('track', (event) => {
      audio.srcObject = new MediaStream([event.track]);
      void audio.play().catch(() => onNeedsUnlock());
    });

    microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of microphone.getAudioTracks()) {
      connection.addTrack(track, microphone);
    }

    events = connection.createDataChannel('oai-events');
    events.addEventListener('message', (message) => {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(String(message.data)) as Record<string, unknown>;
      } catch {
        return;
      }
      onEvent(payload);
      if (payload.type === 'session.started' && !started) {
        started = true;
        send({
          type: 'session.commentary.append',
          event_id: 'greet',
          delegation_id: null,
          content: buildOpenAiLiveGreeting(mode),
        });
        onStarted();
      }
      if (payload.type === 'session.closed') onRemoteClosed();
    });
    events.addEventListener('close', () => {
      if (!destroyed) onRemoteClosed();
    });

    const description = await connection.createOffer();
    await connection.setLocalDescription(description);
    await waitForIce(connection);
    const sdp = connection.localDescription?.sdp;
    if (!sdp) throw new Error('Missing local SDP offer');

    const created = await offer(sdp);
    socket.sessionId = created.sessionId;
    onBind(socket);
    await connection.setRemoteDescription({ type: 'answer', sdp: created.sdp });
    return socket;
  } catch (error) {
    destroy();
    throw error;
  }
};
