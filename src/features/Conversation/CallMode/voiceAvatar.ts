import { AiVoice } from "@/common/ai";
import { AvatarVideo } from "./types";
import { PlanElementMode } from "@/features/Plan/types";

const voiceAvatarMap: Record<AiVoice, AvatarVideo> = {
  ash: {
    sitVideoUrl: ["/call/ash/sit.webm"],
    talkVideoUrl: ["/call/ash/talk.webm", "/call/ash/talk2.webm"],
  },
  shimmer: {
    sitVideoUrl: ["/call/shimmer/sit.webm", "/call/shimmer/sit2.webm"],
    talkVideoUrl: ["/call/shimmer/talk.webm", "/call/shimmer/talk2.webm"],
  },
  marin: {
    sitVideoUrl: ["/call/shimmer/sit.webm", "/call/shimmer/sit2.webm"],
    talkVideoUrl: ["/call/shimmer/talk.webm", "/call/shimmer/talk2.webm"],
  },
  verse: {
    sitVideoUrl: ["/call/ash/sit.webm"],
    talkVideoUrl: ["/call/ash/talk.webm", "/call/ash/talk2.webm"],
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
