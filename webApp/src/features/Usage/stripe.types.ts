import { SupportedLanguage } from '../../features/Lang/lang';
import { PaidAccessPlanId } from '@/features/Price/paidAccessPlans';

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
  plan?: PaidAccessPlanId;
}

export type StripeCreateCheckoutRequest =
  | StripeCreateCheckoutSubscription
  | StripeCreateCheckoutRequestHours;

export interface StripeCreateCheckoutResponse {
  sessionUrl: string | null;
  error: string | null;
}

export interface StripeCreateInvoiceRequest {
  languageCode: SupportedLanguage;
  userId: string;
  amountOfHours: number;
}

export interface StripeCreateInvoiceResponse {
  invoiceUrl: string | null;
  error: string | null;
}
