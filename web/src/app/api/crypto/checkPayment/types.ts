export interface CheckPaymentRequest {
  userId: string;
}

export interface CheckPaymentResponse {
  error?: { code: string; message: string };

  isPaymentPending: boolean;
  isRecentlyPaid: boolean;
}
