import { useRef, useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { useAuth } from '../Auth/useAuth';
import { closeAudioMediaStream, getMediaAudioStreams } from '../webCam/mediaStream';
import { sleep } from '@/libs/sleep';

const exchangeSdp = async (
  offer: RTCSessionDescriptionInit,
  authToken: string,
): Promise<string> => {
  if (!offer.sdp) throw new Error('SDP offer is missing');
  const res = await fetch('/api/realtimeTranscript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ sdp: offer.sdp }),
  });
  if (!res.ok) throw new Error(`SDP exchange failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as { sdpResponse: string };
  return data.sdpResponse;
};

export const useRealtimeTranscript = () => {
  const [completedTranscripts, setCompletedTranscripts] = useState<string[]>([]);
  const [partialTranscriptMap, setPartialTranscriptMap] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const settings = useSettings();
  const auth = useAuth();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  const partialTranscript = Object.values(partialTranscriptMap).join(' ');

  const cleanup = () => {
    if (dcRef.current) {
      if (dcRef.current.readyState !== 'closed') dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      if (pcRef.current.signalingState !== 'closed') {
        pcRef.current.getSenders().forEach((s) => s.track?.stop());
        pcRef.current.close();
      }
      pcRef.current = null;
    }
    closeAudioMediaStream();
  };

  const start = async () => {
    if (pcRef.current) return;

    setIsActive(false);
    setIsActivating(true);
    setCompletedTranscripts([]);
    setPartialTranscriptMap({});

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    try {
      const stream =
        (await getMediaAudioStreams()) ??
        (await navigator.mediaDevices.getUserMedia({ audio: true }));

      pc.addTrack(stream.getTracks()[0]);

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.addEventListener('open', async () => {
        await sleep(100);
        dc.send(
          JSON.stringify({
            type: 'session.update',
            session: {
              modalities: ['text'],
              instructions: '',
              input_audio_transcription: {
                model: 'gpt-4o-mini-transcribe',
                language: settings.languageCode || 'en',
              },
              turn_detection: { type: 'semantic_vad', eagerness: 'auto' },
            },
          }),
        );
        setIsActive(true);
        setIsActivating(false);
      });

      dc.addEventListener('message', (e: MessageEvent) => {
        const event = JSON.parse(e.data as string) as Record<string, unknown>;
        const type = event.type as string;

        if (type === 'conversation.item.input_audio_transcription.delta') {
          const id = event.item_id as string;
          const delta = event.delta as string;
          if (id && delta) {
            setPartialTranscriptMap((prev) => ({ ...prev, [id]: (prev[id] ?? '') + delta }));
          }
        }

        if (type === 'conversation.item.input_audio_transcription.completed') {
          const id = event.item_id as string;
          const transcript = event.transcript as string;
          if (transcript) {
            setCompletedTranscripts((prev) => [...prev, transcript]);
            if (id) {
              setPartialTranscriptMap((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
              });
            }
          }
        }
      });

      dc.addEventListener('close', () => setIsActive(false));

      pc.addEventListener('connectionstatechange', () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setIsActive(false);
          cleanup();
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const authToken = await auth.getToken();
      const sdpAnswer = await exchangeSdp(offer, authToken);
      await pc.setRemoteDescription({ type: 'answer', sdp: sdpAnswer });
    } catch (err) {
      cleanup();
      setIsActivating(false);
      throw err;
    }
  };

  const stop = () => {
    setIsActive(false);
    setIsActivating(false);
    cleanup();
  };

  const clear = () => {
    setCompletedTranscripts([]);
    setPartialTranscriptMap({});
  };

  return {
    partialTranscript,
    completedTranscripts,
    transcript: partialTranscript
      ? [...completedTranscripts, partialTranscript]
      : completedTranscripts,
    start,
    stop,
    clear,
    isActivating,
    isActive,
  };
};
