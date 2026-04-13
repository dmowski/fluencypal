import { sleep } from '@/libs/sleep';
import { ConversationConfig } from '../types';
import { getInstruction } from './getInstruction';
import { WebRtcState } from './types';

export const updateSessionSafe = async ({
  partialInstructionOverride,
  state,
  config,
}: {
  partialInstructionOverride?: string;
  state: WebRtcState;
  config: ConversationConfig;
}) => {
  if (!state.dataChannel || state.dataChannel.readyState !== 'open') return;

  const event = {
    type: 'session.update',
    session: {
      instructions: partialInstructionOverride ?? getInstruction(state),
      input_audio_transcription: {
        model: 'gpt-4o-mini-transcribe',
        language: config.languageCode,
      },
      voice: config.voice,
      modalities: state.currentVolumeOn ? ['audio', 'text'] : ['text'],
      turn_detection: { type: 'semantic_vad', eagerness: 'auto' },
    },
  };

  await sleep(100);
  state.dataChannel.send(JSON.stringify(event));
  await sleep(100);
};
