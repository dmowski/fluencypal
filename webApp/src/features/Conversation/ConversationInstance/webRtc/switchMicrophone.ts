import { createMediaAudioStream, setCachedAudioStream } from '@/features/webCam/mediaStream';
import { writePreferredMicrophoneId } from '@/libs/mic';
import { toggleMute } from './toggleMute';
import { WebRtcState } from './types';

export const switchMicrophone = async (deviceId: string | null, state: WebRtcState) => {
  writePreferredMicrophoneId(deviceId);

  const newStream = await createMediaAudioStream(deviceId);
  const newTrack = newStream?.getAudioTracks()[0];
  if (!newStream || !newTrack) {
    newStream?.getTracks().forEach((track) => track.stop());
    return;
  }

  const sender = state.peerConnection.getSenders().find((item) => item.track?.kind === 'audio');
  if (sender) {
    await sender.replaceTrack(newTrack);
  }

  const previousStream = state.userMedia;
  state.userMedia = newStream;
  setCachedAudioStream(newStream);

  if (previousStream && previousStream !== newStream) {
    previousStream.getTracks().forEach((track) => {
      if (track !== newTrack) {
        track.stop();
      }
    });
  }

  toggleMute(state.currentMuted, state);
};
