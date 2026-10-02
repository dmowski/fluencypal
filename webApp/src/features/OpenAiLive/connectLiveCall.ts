import { buildOpenAiLiveGreeting } from './instructions';
import { playTeacherStream, stopTeacherAudio, unlockTeacherAudio } from './teacherPlayback';
import { OpenAiLiveMode } from './types';

export type LiveSocket = {
  sessionId: string;
  send: (event: Record<string, unknown>) => void;
  setMuted: (muted: boolean) => void;
  requestClose: () => void;
  destroy: () => void;
  playAudio: () => Promise<void>;
};

const audioContext = (): AudioContext => {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) throw new Error('This browser cannot play the teacher');
  return new Ctor();
};

const silentMicTrack = (context: AudioContext): MediaStreamTrack | null => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const destination = context.createMediaStreamDestination();
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start();
  return destination.stream.getAudioTracks()[0] ?? null;
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
  let silenceContext: AudioContext | null = null;
  let silence: MediaStreamTrack | null = null;
  let microphone: MediaStream | null = null;
  let micTrack: MediaStreamTrack | null = null;
  let remoteStream: MediaStream | null = null;
  let events: RTCDataChannel | null = null;
  let destroyed = false;
  let started = false;

  unlockTeacherAudio();

  const silenceTrack = (): MediaStreamTrack | null => {
    if (silence) return silence;
    silenceContext = audioContext();
    silence = silentMicTrack(silenceContext);
    void silenceContext.resume();
    return silence;
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    microphone?.getTracks().forEach((track) => track.stop());
    silence?.stop();
    stopTeacherAudio();
    if (events && events.readyState !== 'closed') events.close();
    connection.close();
    void silenceContext?.close();
  };

  const send = (event: Record<string, unknown>) => {
    if (!events || events.readyState !== 'open') return;
    events.send(JSON.stringify(event));
  };

  const socket: LiveSocket = {
    sessionId: '',
    send,
    setMuted: (muted: boolean) => {
      const sender = connection.getSenders().find((item) => item.track?.kind === 'audio');
      const nextTrack = muted ? silenceTrack() : micTrack;
      if (sender && nextTrack) void sender.replaceTrack(nextTrack);
      if (micTrack) micTrack.enabled = true;
      if (remoteStream) void playTeacherStream(remoteStream).catch(() => undefined);
      send({
        type: muted ? 'session.input_audio.mute' : 'session.input_audio.unmute',
        event_id: crypto.randomUUID(),
      });
    },
    requestClose: () => {
      send({ type: 'session.close', event_id: 'close' });
    },
    destroy,
    playAudio: async () => {
      if (!remoteStream) {
        unlockTeacherAudio();
        return;
      }
      await playTeacherStream(remoteStream);
    },
  };

  try {
    connection.addEventListener('track', (event) => {
      remoteStream = new MediaStream([event.track]);
      void playTeacherStream(remoteStream).catch(() => onNeedsUnlock());
    });

    microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
    micTrack = microphone.getAudioTracks()[0] ?? null;
    if (micTrack) connection.addTrack(micTrack, microphone);

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
