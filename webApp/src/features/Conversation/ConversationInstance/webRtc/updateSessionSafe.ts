import { sleep } from '@/libs/sleep';
import { ConversationConfig } from '../types';
import { getInstruction } from './getInstruction';
import { getRealtimeTruncationSessionPatch } from './realtimeSessionTruncation';
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
      type: 'realtime',
      instructions: partialInstructionOverride ?? getInstruction(state),
      output_modalities: state.currentVolumeOn ? ['audio'] : ['text'],
      audio: {
        input: {
          transcription: {
            model: 'gpt-4o-mini-transcribe',
            language: config.languageCode,
          },
          turn_detection: { type: 'semantic_vad', eagerness: 'auto' },
        },
        output: {
          voice: config.voice,
        },
      },
      ...getRealtimeTruncationSessionPatch(),
    },
  };

  await sleep(100);
  state.dataChannel.send(JSON.stringify(event));
  await sleep(100);
};
