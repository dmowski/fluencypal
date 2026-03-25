export interface CurrencyRequest {
  currencyFrom: string;
  currencyTo: string;
}

export interface CurrencyResponse {
  currencyFrom: string;
  currencyTo: string;
  rate: number;
}
