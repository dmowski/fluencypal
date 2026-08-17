import { getCommonMessageTemplate } from '../../email/templates/commonMessage';

export const getConfirmEmailTemplate = ({
  receiptUrl,
  receiptId,
  callbackUrl = 'https://app.fluencypal.com/practice',
  callToAction = 'Start Learning',
}: {
  receiptUrl: string;
  receiptId?: string;
  callbackUrl?: string;
  callToAction?: string;
}) => {
  return getCommonMessageTemplate({
    title: 'Payment Confirmation',
    subtitle: 'Hello,<br/>Thank you for your purchase at <b>FluencyPal</b>.',
    messageContent: `
<p style="margin: 0; padding-bottom: 12px; color: #222222; font-size: 16px; line-height: 18px;">
We are pleased to confirm that your payment has been successfully processed. You can now start using our services to enhance your language learning experience.
</p>

`,
    callToAction,
    callbackUrl,

    afterButtonContent: `<p style="margin: 0; padding-bottom: 12px; color: #111111; font-size: 13px; line-height: 16px;">
Due to your request for immediate service from Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" within 14 days of contract conclusion, you do not have the right to terminate the contract.
</p>

<p style="margin: 30px 0 0 0; font-size: 18px; font-weight: 700;">Please find attached:</p>

<a href="${receiptUrl}" style="font-size: 15px; line-height: 12px;">Your receipt ${receiptId ? ` (${receiptId})` : ''}</a><br/>

<a href="https://www.fluencypal.com/terms" style="font-size: 15px; line-height: 12px;">Our Terms and Conditions</a><br/>

<a href="https://app.fluencypal.com/practice?page=profile&paymentHistory=true&withdraw=true" style="font-size: 15px; line-height: 12px;">Withdraw from contract here</a><br/>

`,
  });
};
