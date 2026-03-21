import { SupportedLanguage } from '../../features/Lang/lang';

export interface StripeCreateCheckoutRequestBase {
  languageCode: SupportedLanguage;
  currency: string;
  userId: string;
}

export interface StripeCreateCheckoutRequestHours extends StripeCreateCheckoutRequestBase {
  amountOfHours: number;
}

export interface StripeCreateCheckoutSubscription extends StripeCreateCheckoutRequestBase {
  months: number;
  days: number;
}

export type StripeCreateCheckoutRequest =
  | StripeCreateCheckoutSubscription
  | StripeCreateCheckoutRequestHours;

export interface StripeCreateCheckoutResponse {
  sessionUrl: string | null;
  error: string | null;
}
