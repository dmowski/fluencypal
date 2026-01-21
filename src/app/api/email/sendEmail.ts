import { Resend } from 'resend';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';

const resendKey = process.env.RESEND_API || '';

interface SendEmailProps {
  emailTo: string;
  messageText: string;
  messageHtml: string;
  title: string;
}

export const sendEmail = async ({
  emailTo,
  messageText,
  messageHtml,
  title,
}: SendEmailProps): Promise<void> => {
  if (!resendKey) {
    throw new Error('Resend key not found');
  }
  const resend = new Resend(resendKey);
  try {
    const sendResult = await resend.emails.send({
      to: emailTo,
      from: 'contact@fluencypal.com',
      subject: title,
      text: messageText,
      html: messageHtml,
    });
    console.log(`Send email to: ${emailTo}. ${messageText}`);
    console.log('result', JSON.stringify(sendResult));
  } catch (e) {
    console.error(`Error sending email: ${e}`);
    sentSupportTelegramMessage({
      message: `Error sending email to ${emailTo}`,
    });
    sentSupportTelegramMessage({
      message: `Email error: ${e}`,
    });
  }
};
