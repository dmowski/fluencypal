import { ConversationConfig } from '../types';
import { WebRtcState } from './types';
import { updateInstruction } from './updateInstruction';

export const sendWebCamDescription = async (
  description: string,
  state: WebRtcState,
  config: ConversationConfig,
) => {
  const isCorrectionExistsBefore = Boolean(state.instructionState.correction);
  if (isCorrectionExistsBefore) {
    console.log('Ignoring webcam description update due to existing correction.');
    return;
  }
  updateInstruction({ webCamDescription: description }, state, config);
};
