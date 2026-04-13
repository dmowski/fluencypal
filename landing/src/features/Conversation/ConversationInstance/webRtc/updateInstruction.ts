import { ConversationConfig } from '../types';
import { getInstruction } from './getInstruction';
import { InstructionState, WebRtcState } from './types';
import { updateSessionSafe } from './updateSessionSafe';

export const updateInstruction = async (
  partial: Partial<InstructionState>,
  state: WebRtcState,
  config: ConversationConfig,
): Promise<void> => {
  Object.assign(state.instructionState, partial);
  const updatedInstruction = getInstruction(state);
  console.log('RTC updatedInstruction:', updatedInstruction);
  await updateSessionSafe({ partialInstructionOverride: updatedInstruction, state, config });
};
