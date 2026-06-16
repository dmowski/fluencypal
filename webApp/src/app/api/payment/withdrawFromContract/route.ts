import { NextRequest } from 'next/server';
import { validateAuthToken } from '../../config/firebase';
import { getDB } from '../../config/firebase';
import { getUserInfo } from '../../user/getUserInfo';
import { PaymentLog } from '@/features/Usage/usage';
import {
  WithdrawFromContractRequest,
  WithdrawFromContractResponse,
  WithdrawalRecord,
} from '@/features/Usage/withdrawal.types';
import { getChargeIdFromPayment } from '../getChargeIdFromPayment';
import { reversePaymentBalance } from '../reversePaymentBalance';
import { getPaymentContractSubject } from '@/features/Usage/getPaymentContractSubject';
import { getWithdrawalConfirmationEmailTemplate } from '../getWithdrawalConfirmationEmailTemplate';
import { sendEmail } from '../../email/sendEmail';
import { refundPayment } from '../refund';
import { sentSupportTelegramMessage } from '../../telegram/sendTelegramMessage';
import { appName } from '@/features/SEO/appInfo';

const WITHDRAWABLE_TYPES = new Set<PaymentLog['type']>(['user', 'subscription-full-v1']);

export async function POST(request: NextRequest) {
  const user = await validateAuthToken(request);
  const userId = user.uid;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await request.json()) as WithdrawFromContractRequest;
  const customerName = body.customerName?.trim();
  const paymentId = body.paymentId?.trim();
  const optionalNote = body.optionalNote?.trim() || '';

  if (!customerName || customerName.length < 2) {
    const response: WithdrawFromContractResponse = {
      success: false,
      error: 'Customer name is required',
      withdrawalId: null,
      refundProcessed: false,
    };
    return Response.json(response, { status: 400 });
  }

  if (!paymentId) {
    const response: WithdrawFromContractResponse = {
      success: false,
      error: 'Payment selection is required',
      withdrawalId: null,
      refundProcessed: false,
    };
    return Response.json(response, { status: 400 });
  }

  const db = getDB();
  const paymentRef = db.collection('users').doc(userId).collection('payments').doc(paymentId);
  const paymentDoc = await paymentRef.get();

  if (!paymentDoc.exists) {
    const response: WithdrawFromContractResponse = {
      success: false,
      error: 'Payment not found',
      withdrawalId: null,
      refundProcessed: false,
    };
    return Response.json(response, { status: 404 });
  }

  const payment = paymentDoc.data() as PaymentLog;

  if (!WITHDRAWABLE_TYPES.has(payment.type)) {
    const response: WithdrawFromContractResponse = {
      success: false,
      error: 'This payment cannot be withdrawn online',
      withdrawalId: null,
      refundProcessed: false,
    };
    return Response.json(response, { status: 400 });
  }

  if (payment.withdrawnAtIso) {
    const response: WithdrawFromContractResponse = {
      success: false,
      error: 'Withdrawal for this payment was already submitted',
      withdrawalId: null,
      refundProcessed: false,
    };
    return Response.json(response, { status: 409 });
  }

  const userInfo = await getUserInfo(userId);
  const customerEmail = userInfo.email || user.email || '';
  if (!customerEmail) {
    const response: WithdrawFromContractResponse = {
      success: false,
      error: 'Account email is required for withdrawal confirmation',
      withdrawalId: null,
      refundProcessed: false,
    };
    return Response.json(response, { status: 400 });
  }

  const submittedAtIso = new Date().toISOString();
  const withdrawalId = `wd_${Date.now()}_${paymentId.slice(-8)}`;
  const contractSubject = getPaymentContractSubject(payment);
  const contractDate = new Date(payment.createdAt).toLocaleDateString('en-GB', {
    dateStyle: 'long',
  });

  const chargeId = (await getChargeIdFromPayment(payment)) || '';
  let refundProcessed = false;

  if (chargeId) {
    try {
      refundProcessed = await refundPayment(chargeId);
    } catch {
      refundProcessed = false;
    }
    if (!refundProcessed) {
      await sentSupportTelegramMessage({
        message: `⚠️ Withdrawal confirmed but Stripe refund failed for user ${customerEmail}, payment ${paymentId}, charge ${chargeId}. Manual refund needed.`,
        userId,
      });
    }
  } else {
    await sentSupportTelegramMessage({
      message: `⚠️ Withdrawal confirmed but no Stripe charge found for user ${customerEmail}, payment ${paymentId}. Manual refund needed.`,
      userId,
    });
  }

  const withdrawalRecord: WithdrawalRecord = {
    id: withdrawalId,
    paymentId,
    customerName,
    customerEmail,
    contractDateIso: new Date(payment.createdAt).toISOString(),
    contractAmount: payment.amountAdded,
    contractCurrency: payment.currency,
    contractSubject,
    optionalNote,
    submittedAtIso,
    stripeChargeId: chargeId,
    refundProcessed,
  };

  await db
    .collection('users')
    .doc(userId)
    .collection('withdrawals')
    .doc(withdrawalId)
    .set(withdrawalRecord);

  await paymentRef.update({
    withdrawnAtIso: submittedAtIso,
    ...(chargeId && !payment.chargeId ? { chargeId } : {}),
  });

  await reversePaymentBalance(userId, payment);

  const emailContent = getWithdrawalConfirmationEmailTemplate({
    customerName,
    contractDate,
    paymentId,
    contractSubject,
    contractAmount: payment.amountAdded,
    contractCurrency: payment.currency,
    optionalNote,
    submittedAtIso,
  });

  try {
    await sendEmail({
      emailTo: customerEmail,
      messageText: emailContent.text,
      messageHtml: emailContent.html,
      title: `Withdrawal confirmation – ${appName}`,
    });
  } catch {
    await sentSupportTelegramMessage({
      message: `⚠️ Withdrawal processed but confirmation email failed for ${customerEmail}, withdrawal ${withdrawalId}`,
      userId,
    });
  }

  await sentSupportTelegramMessage({
    message: `📋 Contract withdrawal confirmed\nUser: ${customerEmail}\nPayment: ${paymentId}\nAmount: ${payment.amountAdded} ${payment.currency}\nRefund: ${refundProcessed ? 'processed via Stripe' : 'manual follow-up needed'}`,
    userId,
  });

  const response: WithdrawFromContractResponse = {
    success: true,
    error: null,
    withdrawalId,
    refundProcessed,
  };

  return Response.json(response);
}
