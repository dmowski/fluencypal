import { IncreaseGamePointsRequest } from '@/features/Game/types';
import { validateAuthToken } from '../../config/firebase';
import { increaseGamePoints } from '@/features/Game/api/increaseGamePoints';

export async function POST(request: Request) {
  const user = await validateAuthToken(request);

  const data = (await request.json()) as IncreaseGamePointsRequest;
  const response = await increaseGamePoints(data, user.uid);
  return Response.json(response);
}
