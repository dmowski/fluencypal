import { AiVoice } from '@/common/ai';
import { AiVoiceSpeed } from '@/common/userSettings';
import { getAiVoiceByVoice } from '../CallMode/voiceAvatar';
import { getVoiceSpeedInstruction } from '../CallMode/voiceSpeed';

export const getVoiceInstructions = (voice: AiVoice, voiceSpeed: AiVoiceSpeed): string => {
  const voiceAvatar = getAiVoiceByVoice(voice);
  const speedInstruction = getVoiceSpeedInstruction(voiceSpeed);
  const voiceInstructions = `## AI Voice
${voiceAvatar.voiceInstruction} ${speedInstruction}`;
  return voiceInstructions;
};
