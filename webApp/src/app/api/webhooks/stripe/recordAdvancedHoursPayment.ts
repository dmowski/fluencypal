import { appName } from '@/features/SEO/appInfo';
import { addPaymentLog } from '../../payment/addPaymentLog';
import { sendEmail } from '../../email/sendEmail';
import { getUserInfo, updateUserInfo } from '../../user/getUserInfo';
import { sentSupportTelegramMessage } from '../../telegram/sendTelegramMessage';
import { stripeConfig } from '../../payment/config';
import { getConfirmEmailTemplate } from './getConfirmEmailTemplate';

export const recordAdvancedHoursPayment = async ({
  userId,
  amountPaid,
  paymentId,
  currency,
  amountOfHours,
  receiptUrl,
  chargeId,
  receiptId,
}: {
  userId: string;
  amountPaid: number;
  paymentId: string;
  currency: string;
  amountOfHours: number;
  receiptUrl: string;
  chargeId: string;
  receiptId: string;
}) => {
  const userInfo = await getUserInfo(userId);
  const userEmail = userInfo.email;

  sentSupportTelegramMessage({
    message: `🤑 User ${userEmail} purchased ${amountOfHours} advanced AI hours.`,
    userId,
  });

  await addPaymentLog({
    amount: amountPaid,
    userId,
    paymentId,
    currency,
    amountOfHours,
    type: 'advanced-hours',
    receiptUrl,
    chargeId,
  });

  await updateUserInfo(userId, { isCreditCardConfirmed: true });

  if (stripeConfig.isStripeLive && userInfo.email) {
    const shortId = receiptId || paymentId.slice(paymentId.length - 8);
    const emailUi = getConfirmEmailTemplate({
      receiptUrl,
      receiptId,
      callbackUrl: 'https://app.fluencypal.com/advanced',
      callToAction: 'Start talking',
    });

    await sendEmail({
      emailTo: userInfo.email,
      messageText: emailUi.text,
      messageHtml: emailUi.html,
      title: `Your invoice from ${appName}. #${shortId}`,
    });
  }
};
