export interface WithdrawFromContractRequest {
  paymentId: string;
  customerName: string;
  optionalNote?: string;
}

export interface WithdrawFromContractResponse {
  success: boolean;
  error: string | null;
  withdrawalId: string | null;
  refundProcessed: boolean;
}

export interface WithdrawalRecord {
  id: string;
  paymentId: string;
  customerName: string;
  customerEmail: string;
  contractDateIso: string;
  contractAmount: number;
  contractCurrency: string;
  contractSubject: string;
  optionalNote: string;
  submittedAtIso: string;
  stripeChargeId: string;
  refundProcessed: boolean;
}
