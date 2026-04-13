import { NextRequest } from 'next/server';
import { CheckPaymentRequest, CheckPaymentResponse } from './types';
import { validateAuthToken } from '../../config/firebase';
import { getOrders, updateOrder } from '../../payment/order';
import { isCryptoPaid } from '../isCryptoPaid';
import { addPaymentLog } from '../../payment/addPaymentLog';

export async function POST(request: NextRequest) {
  try {
    // 1) Auth check
    const user = await validateAuthToken(request);
    if (!user?.uid) {
      const response: CheckPaymentResponse = {
        isPaymentPending: false,
        isRecentlyPaid: false,
        error: { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
      };
      return Response.json(response);
    }
    // 2) Parse input
    const body = (await request.json()) as CheckPaymentRequest;
    console.log('CHECK CRYPTO PAYMENT', body);
    const userId = user.uid;
    let isRecentlyPaid = false;
    let isPaymentPending = false;

    const userOrders = await getOrders({ userId, status: 'pending' });

    for (const order of userOrders) {
      const comment = order.comment;

      const createdAtIso = order.createdAtIso;
      const orderCreatedAt = new Date(createdAtIso);
      const oldDuration = 2 * 24 * 60 * 60 * 1000; // 2 days in ms
      const isOldPayment = orderCreatedAt < new Date(Date.now() - oldDuration);
      if (isOldPayment) {
        console.log(`ORDER:${order.id} = isOldPayment`, isOldPayment);
        await updateOrder(order.id, {
          status: 'outdated',
          updatedAtIso: new Date().toISOString(),
        });
        continue;
      }

      isPaymentPending = true;

      const isPaid = await isCryptoPaid(comment);
      console.log(`ORDER:${order.id} = isPaid`, isPaid);
      if (isPaid) {
        await updateOrder(order.id, {
          status: 'paid',
          updatedAtIso: new Date().toISOString(),
        });
        await addPaymentLog({
          amount: order.amount,
          userId,
          paymentId: order.id,
          currency: order.currency,
          amountOfHours: 0,
          type: 'subscription-full-v1',
          receiptUrl: '',
          monthsCount: order.monthCount || undefined,
        });
        isRecentlyPaid = true;
      }
    }

    // 4) Success
    const response: CheckPaymentResponse = {
      isPaymentPending,
      isRecentlyPaid,
    };
    return Response.json(response);
  } catch (e: any) {
    // 5) Safe error
    const errorResponse: CheckPaymentResponse = {
      isPaymentPending: false,
      isRecentlyPaid: false,
      error: {
        code: 'SERVER_ERROR',
        message: e?.message || 'Unexpected server error',
      },
    };
    return Response.json(errorResponse);
  }
}
