import { GetEphemeralTokenRequest, GetEphemeralTokenResponse } from '@/common/requests';
import { getEphemeralToken } from './getEphemeralToken';

export async function exampleOfPost(request: Request) {
  const aiRequest = (await request.json()) as GetEphemeralTokenRequest;

  const model = aiRequest.model;
  if (!model) {
    throw new Error('model Get param is required');
  }

  const ephemeralToken = await getEphemeralToken(model);

  const responseData: GetEphemeralTokenResponse = {
    ephemeralKey: ephemeralToken,
  };

  return Response.json(responseData);
}
