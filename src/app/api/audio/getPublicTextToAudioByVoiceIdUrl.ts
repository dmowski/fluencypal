interface AudioGenerationInfo {
  audioUrl: string;
  duration: number;
}

const REMOTE_URL = "https://astra-deploy-2-507232057233.europe-central2.run.app/";
const BASE_URL = REMOTE_URL;

const audioCacheInfo: Record<string, Promise<AudioGenerationInfo> | null> = {};
export const voiceMap = {
  scald: "NefqYoitPGnQ0PrYF9mR",
  odin: "sklxFQLHQQ27RLc9UNCO",
  f: "EXSa4VKVXE6jh5cy4xlb",
  v: "YBjRGZmgHNayFCxPjn9r",
  dragon: "5ajunU1iRFyDs7MdHMcn",
  loki: "INDKfphIpZiLCUiXae4o", //- Evil Jack Man
  freyr: "FvNyzynnZk9gkWCSiR79", // fertility god
  tyr: "qNkzaJoHLLdpvgh5tISm", // KillOdinQuestion | Carter the Mountain King
} as const;

export const getPublicTextToAudioByVoiceIdUrl = async (
  text: string,
  voiceId: string,
  stability: number = 0.5,
  lang: string
): Promise<AudioGenerationInfo> => {
  const cacheKey = `${text}_${voiceId}`;

  let cacheValue = audioCacheInfo[cacheKey];
  if (cacheValue) {
    return cacheValue;
  }

  cacheValue = new Promise(async (resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const urlToRequest = [
      BASE_URL,
      "api/v5/getPublicTextToVoiceUrl",
      `?voiceId=${voiceId}`,
      `&stability=${stability}`,
      `&lang=${lang}`,
      "&text=",
      encodedText,
    ].join("");

    const response = await fetch(urlToRequest);
    const audioInfo = (await response.json()) as AudioGenerationInfo;

    return resolve(audioInfo);
  });

  audioCacheInfo[cacheKey] = cacheValue;

  return cacheValue;
};
