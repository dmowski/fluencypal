export interface ConvertPriceRequest {
  amountInUsd: number;
}

export interface ConvertPriceResponse {
  convertedAmount: number;
  currency: string;
  formattedAmount: string;
}
