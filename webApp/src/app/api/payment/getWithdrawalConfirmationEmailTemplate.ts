import { getCommonMessageTemplate } from '../email/templates/commonMessage';

export const getWithdrawalConfirmationEmailTemplate = ({
  customerName,
  contractDate,
  paymentId,
  contractSubject,
  contractAmount,
  contractCurrency,
  optionalNote,
  submittedAtIso,
}: {
  customerName: string;
  contractDate: string;
  paymentId: string;
  contractSubject: string;
  contractAmount: number;
  contractCurrency: string;
  optionalNote: string;
  submittedAtIso: string;
}) => {
  const submittedAt = new Date(submittedAtIso).toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Europe/Warsaw',
  });

  const statementHtml = `
<p style="margin: 0 0 12px; color: #222222; font-size: 16px; line-height: 22px;">
<strong>WITHDRAWAL FROM CONTRACT</strong>
</p>
<p style="margin: 0 0 8px; color: #222222; font-size: 15px; line-height: 20px;">
I, ${customerName}, hereby withdraw from the following contract:
</p>
<ul style="margin: 0 0 12px; padding-left: 20px; color: #222222; font-size: 15px; line-height: 20px;">
  <li><strong>Contract date:</strong> ${contractDate}</li>
  <li><strong>Order / contract number:</strong> ${paymentId}</li>
  <li><strong>Subject of contract:</strong> ${contractSubject}</li>
  <li><strong>Amount paid:</strong> ${contractAmount} ${contractCurrency.toUpperCase()}</li>
  ${optionalNote ? `<li><strong>Additional note:</strong> ${optionalNote}</li>` : ''}
</ul>
<p style="margin: 0 0 12px; color: #222222; font-size: 15px; line-height: 20px;">
<strong>Date and time of submission:</strong> ${submittedAt}
</p>
<p style="margin: 0; color: #222222; font-size: 15px; line-height: 20px;">
Your refund will be processed within 1–5 business days using the same payment method you used for the purchase.
</p>`;

  const statementText = [
    'WITHDRAWAL FROM CONTRACT',
    '',
    `I, ${customerName}, hereby withdraw from the following contract:`,
    `Contract date: ${contractDate}`,
    `Order / contract number: ${paymentId}`,
    `Subject of contract: ${contractSubject}`,
    `Amount paid: ${contractAmount} ${contractCurrency.toUpperCase()}`,
    optionalNote ? `Additional note: ${optionalNote}` : '',
    `Date and time of submission: ${submittedAt}`,
    '',
    'Your refund will be processed within 1–5 business days using the same payment method you used for the purchase.',
  ]
    .filter(Boolean)
    .join('\n');

  const template = getCommonMessageTemplate({
    title: 'Withdrawal confirmation',
    subtitle: 'Hello,<br/>We confirm receipt of your withdrawal from contract at <b>FluencyPal</b>.',
    messageContent: statementHtml,
    callToAction: 'Go to FluencyPal',
    callbackUrl: 'https://app.fluencypal.com/practice',
    afterButtonContent: `<p style="margin: 16px 0 0; color: #666666; font-size: 13px; line-height: 18px;">
This message is sent on a durable medium as confirmation of your withdrawal statement, including its content and the date and time of submission, in accordance with our Terms and Conditions.
</p>`,
  });

  return {
    html: template.html,
    text: statementText + '\n\n' + template.text,
  };
};
