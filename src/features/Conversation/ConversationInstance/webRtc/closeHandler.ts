import { WebRtcState } from './types';

export const closeHandler = (
  state: WebRtcState,
  {
    messageHandler,
    openHandler,
    closeEvent,
    errorEvent,
  }: {
    messageHandler: (event: MessageEvent) => void;
    openHandler: () => void;
    closeEvent: () => void;
    errorEvent: (error: any) => void;
  },
) => {
  if (state.dataChannel) {
    state.dataChannel.removeEventListener('message', messageHandler);
    state.dataChannel.removeEventListener('open', openHandler);
    state.dataChannel.removeEventListener('close', closeEvent);
    state.dataChannel.removeEventListener('error', errorEvent);

    if (state.dataChannel.readyState !== 'closed') {
      state.dataChannel.close();
      console.log('Data channel closed');
    }
  }

  if (state.peerConnection && state.peerConnection.signalingState !== 'closed') {
    state.peerConnection.getSenders().forEach((sender, index) => {
      if (sender.track) {
        sender.track.stop();
        console.log('Track stopped - #', index);
      }
    });

    state.peerConnection.close();
    console.log('Peer connection closed');
  }
};
