import { PROJECT_PROFIT_MARGIN } from "@/common/ai";
import { GetAudioUrlRequest, GetAudioUrlResponse } from "@/common/requests";
interface AudioGenerationInfo {
  audioUrl: string;
  duration: number;
}

const REMOTE_URL = "https://astra-deploy-2-507232057233.europe-central2.run.app/";
const BASE_URL = REMOTE_URL;

const audioCacheInfo: Record<string, Promise<AudioGenerationInfo> | null> = {};
const voiceMap = {
  scald: "NefqYoitPGnQ0PrYF9mR",
  odin: "sklxFQLHQQ27RLc9UNCO",
  f: "EXSa4VKVXE6jh5cy4xlb",
  v: "YBjRGZmgHNayFCxPjn9r",
  dragon: "5ajunU1iRFyDs7MdHMcn",
  loki: "INDKfphIpZiLCUiXae4o", //- Evil Jack Man
  freyr: "FvNyzynnZk9gkWCSiR79", // fertility god
  tyr: "qNkzaJoHLLdpvgh5tISm", // KillOdinQuestion | Carter the Mountain King
} as const;

const getPublicTextToAudioByVoiceIdUrl = async (
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

export async function POST(request: Request) {
  const requestData = (await request.json()) as GetAudioUrlRequest;

  const audioInfo = await getPublicTextToAudioByVoiceIdUrl(requestData.text, voiceMap.f, 0.5, "en");
  // eleven_turbo_v2_5 Model
  // 100,000 characters = 30$
  // 1 character = 0.0003$
  // https://elevenlabs.io/app/subscription
  const sourcePricePerCharacter = 30 / 100_000;
  const sourcePrice = sourcePricePerCharacter * requestData.text.length;

  const priceWithMargin = sourcePrice + sourcePrice * PROJECT_PROFIT_MARGIN;

  const answer: GetAudioUrlResponse = {
    url: audioInfo.audioUrl,
    duration: audioInfo.duration,
    price: priceWithMargin,
    text: requestData.text,
  };

  return Response.json(answer);
}
