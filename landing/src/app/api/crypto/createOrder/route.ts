import { NextRequest } from 'next/server';
import { envConfig } from '../../config/envConfig';
import crypto from 'node:crypto';
import { CreateCryptoOrderRequest, CreateCryptoOrderResponse } from './types';
import { validateAuthToken } from '../../config/firebase';
import { CRYPTO_MONTHLY_PRICE_TON } from '@/features/Telegram/cryptoPrice';
import { Order } from '../../payment/type';
import { createOrder } from '../../payment/order';

function clampMonthCount(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.min(12, Math.max(1, Math.floor(n)));
}

export async function POST(request: NextRequest) {
  // Base response we’ll always return (HTTP 200)
  const base: CreateCryptoOrderResponse = {
    ok: false,

    orderId: null,
    merchantAddress: envConfig.merchantTonAddress || null,
    monthCount: 0,
    amountNano: '',
    comment: '',
  };

  try {
    // 1) Auth check
    const user = await validateAuthToken(request);
    if (!user?.uid) {
      const response: CreateCryptoOrderResponse = {
        ...base,
        error: { code: 'UNAUTHORIZED', message: 'User is not authenticated' },
      };
      return Response.json(response);
    }
    // 2) Parse input
    const body = (await request.json()) as CreateCryptoOrderRequest;
    const monthCount = clampMonthCount(body?.monthCount);

    const orderId = crypto.randomBytes(6).toString('hex');
    console.log('CREATE CRYPTO orderId', orderId);
    const comment = `order:${orderId}`;

    const currency = 'TON';

    const order: Order = {
      id: orderId,
      userId: user.uid,
      monthCount,
      comment,
      amount: CRYPTO_MONTHLY_PRICE_TON,
      currency,
      status: 'pending',
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    };

    await createOrder(order);

    // 4) Success
    const response: CreateCryptoOrderResponse = {
      ok: true,
      orderId,
      merchantAddress: envConfig.merchantTonAddress,
      monthCount,
      amountNano: `${CRYPTO_MONTHLY_PRICE_TON * 1_000_000_000}`,
      comment,
    };
    return Response.json(response);
  } catch (e: any) {
    // 5) Safe error
    const errorResponse: CreateCryptoOrderResponse = {
      ...base,
      error: {
        code: 'SERVER_ERROR',
        message: e?.message || 'Unexpected server error',
      },
    };
    return Response.json(errorResponse);
  }
}
