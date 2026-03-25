export interface CurrencyRequest {
  currency: string;
}

export interface CurrencyResponse {
  currencyFrom: string;
  currencyTo: string;
  rate: number;
}
