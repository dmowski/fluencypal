import { getCommonMessageTemplate } from '../../email/templates/commonMessage';

export const getConfirmEmailTemplate = ({
  receiptUrl,
  receiptId,
}: {
  receiptUrl: string;
  receiptId?: string;
}) => {
  return getCommonMessageTemplate({
    title: 'Payment Confirmation',
    subtitle: 'Hello,<br/>Thank you for your purchase at <b>FluencyPal</b>.',
    messageContent: `
<p style="margin: 0; padding-bottom: 12px; color: #222222; font-size: 16px; line-height: 18px;">
We are pleased to confirm that your payment has been successfully processed. You can now start using our services to enhance your language learning experience.
</p>

`,
    callToAction: 'Start Learning',
    callbackUrl: 'https://www.fluencypal.com/practice',

    afterButtonContent: `<p style="margin: 0; padding-bottom: 12px; color: #111111; font-size: 13px; line-height: 16px;">
Due to your request for immediate service from Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" within 14 days of contract conclusion, you do not have the right to terminate the contract.
</p>

<p style="margin:0; font-size: 16px">Please find attached:</p>
<a href="${receiptUrl}" style="font-size:13px; line-height: 12px">Your receipt ${receiptId ? ` (${receiptId})` : ''}</a><br/>
<a href="https://www.fluencypal.com/terms" style="font-size:13px; line-height: 12px">Our Terms and Conditions</a><br/>
<a href="https://www.fluencypal.com/terms" style="color: #555; font-size:13px; line-height: 12px">Termination form</a>
`,
  });
};
