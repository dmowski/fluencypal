import { IncreaseGamePointsRequest } from '@/features/Game/types';
import { validateAuthToken } from '../../config/firebase';
import { increaseGamePoints } from '@/features/Game/api/increaseGamePoints';

export async function POST(request: Request) {
  await validateAuthToken(request);

  const data = (await request.json()) as IncreaseGamePointsRequest;
  const response = await increaseGamePoints(data);
  return Response.json(response);
}
