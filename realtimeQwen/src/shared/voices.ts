export type VoiceOption = {
  id: string;
  name: string;
  detail: string;
  /** Official preview clip. Absent for the default voice, which is generated on demand. */
  sampleUrl: string | null;
};

/** Every system voice `qwen-audio-3.0-realtime-flash` accepts. */
export const VOICES: VoiceOption[] = [
  {
    id: "longanqian",
    name: "Long An Qian",
    detail: "Default",
    sampleUrl: null,
  },
  {
    id: "longanlingxin",
    name: "Long An Ling Xin",
    detail: "Warm and empathetic · Female",
    sampleUrl: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20260706/fadenx/01_longanlingxin.wav",
  },
  {
    id: "longanlingxi",
    name: "Long An Ling Xi",
    detail: "Cute and sweet · Female",
    sampleUrl: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20260706/nawogi/05_longanlingxi.wav",
  },
  {
    id: "longanxiaoxin",
    name: "Long An Xiao Xin",
    detail: "Friendly and lively · Female",
    sampleUrl: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20260706/utekvx/07_longanxiaoxin.wav",
  },
  {
    id: "longanlufeng",
    name: "Long An Lu Feng",
    detail: "Bright and cheerful · Male",
    sampleUrl: "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/en-US/20260706/elkvlj/02_longanlufeng.wav",
  },
];

export const VOICE_IDS = VOICES.map((voice) => voice.id);

export function voiceById(id: string): VoiceOption | undefined {
  return VOICES.find((voice) => voice.id === id);
}
