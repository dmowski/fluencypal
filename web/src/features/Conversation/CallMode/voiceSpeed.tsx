import { AiVoiceSpeed } from '@/common/userSettings';

const voiceSpeedInstructionsMap: Record<AiVoiceSpeed, string> = {
  'extremely-slow': 'Speak very slowly, with clear pronunciation and longer pauses between words.',
  slow: 'Speak slowly and clearly, with noticeable pauses between sentences.',
  normal: '',
  fast: 'Speak quickly but clearly, maintaining good pronunciation and energy.',
};

export const getVoiceSpeedInstruction = (speed: AiVoiceSpeed): string => {
  return voiceSpeedInstructionsMap[speed];
};
