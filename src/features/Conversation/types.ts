export interface GuessGameStat {
  wordsUserToDescribe: string[];
  wordsAiToDescribe: string[];
}

export type RecordingUserMessageMode = "VAD" | "PushToTalk" | "RealTimeConversation";
