import { sleep } from '@/libs/sleep';
import { closeAudioMediaStream, getMediaAudioStreams } from '../webCam/mediaStream';
import type { SupportedLanguage } from '../Lang/lang';
import type { TranscriptRefs, TranscriptSdpResponse, TranscriptStateHandlers } from './types';

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

  if (!res.ok) {
    throw new Error(`SDP exchange failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as TranscriptSdpResponse;
  return data.sdpResponse;
};

export const cleanupOpenAiRealtimeTranscript = ({ dcRef, pcRef }: TranscriptRefs) => {
  if (dcRef.current) {
    if (dcRef.current.readyState !== 'closed') {
      dcRef.current.close();
    }
    dcRef.current = null;
  }

  if (pcRef.current) {
    if (pcRef.current.signalingState !== 'closed') {
      pcRef.current.getSenders().forEach((sender) => sender.track?.stop());
      pcRef.current.close();
    }
    pcRef.current = null;
  }

  closeAudioMediaStream();
};

export const startOpenAiRealtimeTranscript = async ({
  language,
  getAuthToken,
  refs,
  state,
}: {
  language: SupportedLanguage;
  getAuthToken: () => Promise<string>;
  refs: TranscriptRefs;
  state: TranscriptStateHandlers;
}) => {
  if (refs.pcRef.current) return;

  state.setActiveMode('ai');
  refs.stopRequestedRef.current = false;

  const peerConnection = new RTCPeerConnection();
  refs.pcRef.current = peerConnection;

  try {
    const stream =
      (await getMediaAudioStreams()) ??
      (await navigator.mediaDevices.getUserMedia({ audio: true }));
    const audioTrack = stream.getTracks()[0];

    if (!audioTrack) {
      throw new Error('Audio track is not available');
    }

    peerConnection.addTrack(audioTrack);

    const dataChannel = peerConnection.createDataChannel('oai-events');
    refs.dcRef.current = dataChannel;

    dataChannel.addEventListener('open', async () => {
      await sleep(100);
      dataChannel.send(
        JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text'],
            instructions: '',
            input_audio_transcription: {
              model: 'gpt-4o-mini-transcribe',
              language,
            },
            turn_detection: { type: 'semantic_vad', eagerness: 'auto' },
          },
        }),
      );
      state.setIsActive(true);
      state.setIsActivating(false);
    });

    dataChannel.addEventListener('message', (event: MessageEvent) => {
      const payload = JSON.parse(event.data as string) as Record<string, unknown>;
      const type = payload.type as string;

      if (type === 'conversation.item.input_audio_transcription.delta') {
        const id = payload.item_id as string;
        const delta = payload.delta as string;

        if (id && delta) {
          state.setPartialTranscriptMap((prev) => ({ ...prev, [id]: (prev[id] ?? '') + delta }));
        }
      }

      if (type === 'conversation.item.input_audio_transcription.completed') {
        const id = payload.item_id as string;
        const transcript = payload.transcript as string;

        if (transcript) {
          state.setCompletedTranscripts((prev) => [...prev, transcript]);

          if (id) {
            state.setPartialTranscriptMap((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          }
        }
      }
    });

    dataChannel.addEventListener('close', () => {
      state.setIsActive(false);
      state.setActiveMode(null);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
      if (
        peerConnection.connectionState === 'failed' ||
        peerConnection.connectionState === 'disconnected'
      ) {
        state.setIsActive(false);
        state.setActiveMode(null);
        cleanupOpenAiRealtimeTranscript(refs);
      }
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const authToken = await getAuthToken();
    const sdpAnswer = await exchangeSdp(offer, authToken);
    await peerConnection.setRemoteDescription({ type: 'answer', sdp: sdpAnswer });
  } catch (error) {
    cleanupOpenAiRealtimeTranscript(refs);
    state.setActiveMode(null);
    state.setIsActivating(false);
    throw error;
  }
};
