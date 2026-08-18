import { cookies } from 'next/headers';
import {
  StripeCreateInvoiceRequest,
  StripeCreateInvoiceResponse,
} from '@/features/Usage/stripe.types';
import {
  getAdvancedInvoiceAmountUsd,
  getAdvancedInvoiceMetadata,
  isValidAdvancedHoursPurchase,
} from '@/features/Usage/advancedInvoice';
import Stripe from 'stripe';
import { validateAuthToken } from '../config/firebase';
import { stripeConfig } from '../payment/config';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';
import { toStripeUnit } from 'zero-decimal-currencies';
import { getOrCreateCustomerId } from '../payment/getOrCreateCustomerId';
import { getUserInfo } from '../user/getUserInfo';

export async function POST(request: Request) {
  let draftInvoiceId: string | undefined;

  try {
    const stripeKey = stripeConfig.STRIPE_SECRET_KEY;
    const siteUrl = request.headers.get('origin');

    const userInfo = await validateAuthToken(request);
    if (!userInfo.uid) {
      throw new Error('User is not authenticated');
    }

    if (!siteUrl) {
      throw new Error('Origin header is not set');
    }
    if (!stripeKey) {
      throw new Error('Stripe API key is not set');
    }

    const stripe = new Stripe(stripeKey);
    const cookieStore = await cookies();
    const datafastVisitorId = cookieStore.get('datafast_visitor_id')?.value;
    const datafastSessionId = cookieStore.get('datafast_session_id')?.value;
    const requestData = (await request.json()) as StripeCreateInvoiceRequest;
    const amountOfHours = requestData.amountOfHours;

    if (!isValidAdvancedHoursPurchase(amountOfHours)) {
      const response: StripeCreateInvoiceResponse = {
        invoiceUrl: null,
        error: amountOfHours < 1 ? 'Amount is too small' : 'Amount is too large',
      };
      return Response.json(response);
    }

    const userId = userInfo.uid;
    const customerId = await getOrCreateCustomerId(userId, stripe);
    const profile = await getUserInfo(userId);

    if (profile.email) {
      await stripe.customers.update(customerId, { email: profile.email });
    }

    const amountUsd = getAdvancedInvoiceAmountUsd(amountOfHours);
    const stripeMoney = Number(toStripeUnit(amountUsd, 'USD'));
    const description = `Add ${amountOfHours} hour(s) of advanced AI talking`;

    const invoice = await stripe.invoices.create({
      customer: customerId,
      currency: 'usd',
      collection_method: 'send_invoice',
      days_until_due: 1,
      auto_advance: false,
      pending_invoice_items_behavior: 'exclude',
      description,
      metadata: getAdvancedInvoiceMetadata({
        userId,
        amountOfHours,
        datafastVisitorId,
        datafastSessionId,
      }),
    });
    draftInvoiceId = invoice.id;

    await stripe.invoices.addLines(invoice.id, {
      lines: [
        {
          description,
          amount: stripeMoney,
        },
      ],
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    if (!finalized.hosted_invoice_url) {
      throw new Error('Stripe did not return a hosted invoice URL');
    }

    const response: StripeCreateInvoiceResponse = {
      invoiceUrl: finalized.hosted_invoice_url,
      error: null,
    };
    return Response.json(response);
  } catch (error) {
    console.error(error);
    if (draftInvoiceId && stripeConfig.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(stripeConfig.STRIPE_SECRET_KEY);
      await stripe.invoices.del(draftInvoiceId).catch(() => undefined);
    }
    sentSupportTelegramMessage({
      message: `Error creating advanced invoice: ${error}`,
    });
    const response: StripeCreateInvoiceResponse = {
      invoiceUrl: null,
      error: `${error}`,
    };
    return Response.json(response);
  }
}
