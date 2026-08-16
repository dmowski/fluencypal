import { SupportedLanguage } from '../../features/Lang/lang';

export interface StripeCreateCheckoutRequestBase {
  languageCode: SupportedLanguage;
  currency: string;
  userId: string;
}

export type StripeCheckoutProduct = 'hours' | 'advanced-hours';

export interface StripeCreateCheckoutRequestHours extends StripeCreateCheckoutRequestBase {
  amountOfHours: number;
  product?: StripeCheckoutProduct;
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
