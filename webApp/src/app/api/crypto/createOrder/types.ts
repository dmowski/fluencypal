export interface CreateCryptoOrderRequest {
  monthCount: number;
}

export interface CreateCryptoOrderResponse {
  ok: boolean;
  error?: { code: string; message: string };

  orderId: string | null;

  merchantAddress: string | null;
  monthCount: number | null;

  amountNano: string | null;
  comment: string | null;
}
