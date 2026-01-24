import { AiVoice } from '@/common/ai';
import { AiAvatar } from './types';

export const voiceAvatarMap: Record<AiVoice, AiAvatar> = {
  // man. Confident voice
  ash: {
    sitVideoUrl: ['/call/ash/sit2.webm', '/call/ash/sit.webm'],
    talkVideoUrl: ['/call/ash/talk1.webm', '/call/ash/talk3.webm', '/call/ash/talk2.webm'],
    photoUrls: ['/call/ash/photo.webp', '/call/ash/photo2.webp'],

    voiceInstruction: `Your voice is deep, with a steady tone that commands attention. Your speech is articulate and purposeful, with natural pauses that emphasize your points.`,
    helloPhrases: ['Hello, I’m Ash. I’ll help you speak clearly and with confidence.'],
  },

  // girl
  shimmer: {
    sitVideoUrl: ['/call/shimmer/sit.webm', '/call/shimmer/sit2.webm'],
    talkVideoUrl: ['/call/shimmer/talk.webm', '/call/shimmer/talk2.webm'],
    voiceInstruction: `Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking  These pauses should feel natural and reflective, as if you're savoring the moment.`,
    helloPhrases: [
      'Hello, I’m Shimmer. Let’s take it slow and make your speech sound smooth and natural.',
    ],
  },

  // girl
  marin: {
    sitVideoUrl: ['/call/marin/sit.webm'],
    talkVideoUrl: ['/call/marin/talk.webm'],
    voiceInstruction: `Your voice is soft and gentle, with a calming presence that puts others at ease. Your speech is clear and deliberate, with thoughtful pauses that convey empathy and understanding.`,
    helloPhrases: ['Hi, I’m Marin. Don’t worry about mistakes — I’ll guide you gently.'],
  },

  // man
  verse: {
    sitVideoUrl: ['/call/verse/sit1.webm', '/call/verse/sit2.webm'],
    photoUrls: ['/call/verse/photo1.webp', '/call/verse/photo2.webp'],
    talkVideoUrl: ['/call/verse/talk1.webm', '/call/verse/talk2.webm'],
    voiceInstruction: `Your voice is deep, with a friendly and approachable tone. Your speech is clear and articulate, with natural pauses that make you easy to understand.`,
    helloPhrases: ['Hey! I’m Verse. I’m here to keep things light and motivating.'],
  },
};

export const getAiVoiceByVoice = (voice?: AiVoice): AiAvatar => {
  return voice ? voiceAvatarMap[voice] : voiceAvatarMap.ash;
};
