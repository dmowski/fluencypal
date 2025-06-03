import { TranslateRequest, TranslateResponse } from "./types";

export async function POST(request: Request) {
  const data = (await request.json()) as TranslateRequest;

  // todo: Integrate with actual translation service

  const response: TranslateResponse = {
    translatedText: `Translated "${data.text}" from ${data.sourceLanguage} to ${data.targetLanguage}`,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
  };
  return Response.json(response);
}
