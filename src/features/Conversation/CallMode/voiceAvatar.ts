import { AiVoice } from "@/common/ai";
import { AvatarVideo } from "./types";
import { PlanElementMode } from "@/features/Plan/types";

const voiceAvatarMap: Record<AiVoice, AvatarVideo> = {
  ash: {
    sitVideoUrl: ["/call/boy_1/sit.webm"],
    talkVideoUrl: ["/call/boy_1/talk.webm", "/call/boy_1/talk2.webm"],
  },
  shimmer: {
    sitVideoUrl: ["/call/girl_2/sit.webm", "/call/girl_2/sit2.webm"],
    talkVideoUrl: ["/call/girl_2/talk.webm", "/call/girl_2/talk2.webm"],
  },
  marin: {
    sitVideoUrl: ["/call/girl_2/sit.webm", "/call/girl_2/sit2.webm"],
    talkVideoUrl: ["/call/girl_2/talk.webm", "/call/girl_2/talk2.webm"],
  },
  verse: {
    sitVideoUrl: ["/call/boy_1/sit.webm"],
    talkVideoUrl: ["/call/boy_1/talk.webm", "/call/boy_1/talk2.webm"],
  },
};

export const getAiVoiceByVoice = (voice?: AiVoice): AvatarVideo => {
  return voice ? voiceAvatarMap[voice] : voiceAvatarMap.ash;
};

export const voiceLearningPlanMap: Record<PlanElementMode, AiVoice> = {
  conversation: "shimmer",
  words: "ash",
  play: "shimmer",
  rule: "ash",
};

export const getAiVoiceByPlanPlanElementMode = (mode: PlanElementMode): AvatarVideo => {
  const voice = voiceLearningPlanMap[mode];
  return getAiVoiceByVoice(voice);
};
