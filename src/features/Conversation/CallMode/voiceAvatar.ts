import { AiVoice } from "@/common/ai";
import { AiAvatar } from "./types";
import { PlanElementMode } from "@/features/Plan/types";

const voiceAvatarMap: Record<AiVoice, AiAvatar> = {
  // man. young man
  ash: {
    sitVideoUrl: ["/call/ash/sit.webm"],
    talkVideoUrl: ["/call/ash/talk.webm", "/call/ash/talk2.webm"],
    voiceInstruction: `Your voice is youthful and energetic, with a friendly and approachable tone. Your speech is clear and articulate, with natural pauses that make you easy to understand.`,
  },
  // girl
  shimmer: {
    sitVideoUrl: ["/call/shimmer/sit.webm", "/call/shimmer/sit2.webm"],
    talkVideoUrl: ["/call/shimmer/talk.webm", "/call/shimmer/talk2.webm"],
    voiceInstruction: `Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking  These pauses should feel natural and reflective, as if you're savoring the moment.`,
  },

  // girl
  marin: {
    sitVideoUrl: ["/call/marin/sit.webm"],
    talkVideoUrl: ["/call/marin/talk.webm"],
    voiceInstruction: `Your voice is soft and gentle, with a calming presence that puts others at ease. Your speech is clear and deliberate, with thoughtful pauses that convey empathy and understanding.`,
  },

  // man
  verse: {
    sitVideoUrl: ["/call/ash/sit.webm"],
    talkVideoUrl: ["/call/ash/talk.webm"],
    voiceInstruction: `Your voice is confident and clear, with a steady tone that commands attention. Your speech is articulate and purposeful, with natural pauses that emphasize your points.`,
  },
};

export const getAiVoiceByVoice = (voice?: AiVoice): AiAvatar => {
  return voice ? voiceAvatarMap[voice] : voiceAvatarMap.ash;
};

export const voiceLearningPlanMap: Record<PlanElementMode, AiVoice> = {
  conversation: "shimmer",
  words: "ash",
  play: "shimmer",
  rule: "ash",
};

export const getAiVoiceByPlanPlanElementMode = (mode: PlanElementMode): AiAvatar => {
  const voice = voiceLearningPlanMap[mode];
  return getAiVoiceByVoice(voice);
};
