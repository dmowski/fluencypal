import { PROJECT_PROFIT_MARGIN } from "@/common/ai";
import { GetAudioUrlRequest, GetAudioUrlResponse } from "@/common/requests";
import { validateAuthToken } from "../config/firebase";
import { getUserBalance } from "../payment/confirmPayment";
import { getPublicTextToAudioByVoiceIdUrl, voiceMap } from "./getPublicTextToAudioByVoiceIdUrl";

export async function POST(request: Request) {
  const requestData = (await request.json()) as GetAudioUrlRequest;

  const userInfo = await validateAuthToken(request);
  const userBalance = await getUserBalance(userInfo.uid || "");
  if (userBalance < 0.01) {
    throw new Error("Insufficient balance");
  }

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
