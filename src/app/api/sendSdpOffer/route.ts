import { SendSdpOfferRequest, SendSdpOfferResponse } from '@/common/requests';
import { getEphemeralToken } from '../token/getEphemeralToken';
import { validateAuthToken } from '../config/firebase';
import { getUserBalance } from '../payment/getUserBalance';
import { getGameUsersLastVisit } from '@/features/Game/api/statsResources';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';
import dayjs from 'dayjs';

export async function POST(request: Request) {
  const body = (await request.json()) as SendSdpOfferRequest;
  const ephemeralKey = await getEphemeralToken(body.model);

  const userInfo = await validateAuthToken(request);
  const [balance, lastVisits] = await Promise.all([
    getUserBalance(userInfo.uid || ''),
    getGameUsersLastVisit(),
  ]);
  if (!balance.isFullAccess) {
    //console.error("Insufficient balance.");
  }

  const userLastVisit = lastVisits[userInfo.uid || ''];
  if (!userLastVisit) {
    console.log('User has no last visit record', userInfo.uid);
    await sentSupportTelegramMessage({
      message: 'User has no last visit record',
      userId: userInfo.uid || '',
    });
  } else {
    const diffMinutes = dayjs().diff(dayjs(userLastVisit), 'minute');
    const trashHoldMinutes = 5;
    if (diffMinutes > trashHoldMinutes) {
      console.log(`User last visit was ${diffMinutes} minutes ago`, userInfo.uid);
      await sentSupportTelegramMessage({
        message: `User last visit was ${diffMinutes} minutes ago`,
        userId: userInfo.uid || '',
      });
    }
  }

  console.log('GET TOKEN userId', userInfo.uid, userInfo.email);

  const baseUrl = 'https://api.openai.com/v1/realtime';
  const sdpResponse = await fetch(`${baseUrl}?model=${body.model}`, {
    method: 'POST',
    body: body.sdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      'Content-Type': 'application/sdp',
    },
  });

  if (!sdpResponse.ok) {
    throw new Error(`Failed to send SDP Offer: ${sdpResponse.status} ${sdpResponse.statusText}`);
  }

  const response: SendSdpOfferResponse = {
    sdpResponse: await sdpResponse.text(),
  };

  return Response.json(response);
}
