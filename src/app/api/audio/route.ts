import { convertUsdToHours, PROJECT_PROFIT_MARGIN } from "@/common/ai";
import { GetAudioUrlRequest, GetAudioUrlResponse } from "@/common/requests";
import { validateAuthToken } from "../config/firebase";
import {
  getPublicTextToAudioByVoiceIdUrl,
  voiceMap,
} from "./getPublicTextToAudioByVoiceIdUrl";
import { AudioUsageLog } from "@/common/usage";
import { addUsage } from "../payment/addUsage";
import { getUserBalance } from "../payment/getUserBalance";

export async function POST(request: Request) {
  const requestData = (await request.json()) as GetAudioUrlRequest;
  const languageCode = requestData.languageCode;

  const userInfo = await validateAuthToken(request);
  const balance = await getUserBalance(userInfo.uid || "");
  if (!balance.isFullAccess) {
    console.error("Insufficient balance.");
  }

  const audioInfo = await getPublicTextToAudioByVoiceIdUrl(
    requestData.text,
    voiceMap.f,
    0.5,
    "en",
  );
  // eleven_turbo_v2_5 Model
  // 100,000 characters = 30$
  // 1 character = 0.0003$
  // https://elevenlabs.io/app/subscription
  const sourcePricePerCharacter = 30 / 100_000;
  const sourcePrice = sourcePricePerCharacter * requestData.text.length;

  const priceWithMargin = sourcePrice + sourcePrice * PROJECT_PROFIT_MARGIN;

  const priceUsd = priceWithMargin;
  const priceHours = convertUsdToHours(priceUsd);

  const usageLog: AudioUsageLog = {
    usageId: `${Date.now()}`,
    languageCode,
    createdAt: Date.now(),
    priceUsd,
    priceHours,
    type: "audio",
    size: requestData.text.length,
    duration: audioInfo.duration,
  };

  if (!balance.isGameWinner) {
    await addUsage(userInfo.uid, usageLog);
  }

  const answer: GetAudioUrlResponse = {
    url: audioInfo.audioUrl,
    duration: audioInfo.duration,
    price: priceWithMargin,
    text: requestData.text,
  };

  return Response.json(answer);
}
