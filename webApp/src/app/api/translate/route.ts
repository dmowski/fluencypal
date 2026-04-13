import { getTranslatedResponse } from './translateText';
import { TranslateRequest } from './types';

export async function POST(request: Request) {
  const data = (await request.json()) as TranslateRequest;

  const response = await getTranslatedResponse(data);
  return Response.json(response);
}
