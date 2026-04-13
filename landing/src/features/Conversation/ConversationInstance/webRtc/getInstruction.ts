import { WebRtcState } from './types';

export const getInstruction = (state: WebRtcState): string => {
  if (state.instructionState.correction) {
    return state.instructionState.correction;
  }

  return [
    state.instructionState.correction,
    state.instructionState.baseInitInstruction,
    state.instructionState.webCamDescription,
  ]
    .filter((part) => part && part.length > 0)
    .join('\n');
};
