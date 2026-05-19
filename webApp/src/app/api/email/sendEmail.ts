import { Resend } from 'resend';
import { sentSupportTelegramMessage } from '../telegram/sendTelegramMessage';

const resendKey = process.env.RESEND_API || '';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendEmailProps {
  emailTo: string;
  messageText: string;
  messageHtml: string;
  title: string;
  attachments?: EmailAttachment[];
}

export const sendEmail = async ({
  emailTo,
  messageText,
  messageHtml,
  title,
  attachments,
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
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });
    console.log(`Send email to: ${emailTo}. ${messageText}`);
    console.log('result', JSON.stringify(sendResult));
  } catch (e) {
    console.error(`Error sending email: ${e}`);
    sentSupportTelegramMessage({
      message: `Error sending email to ${emailTo}: ${e}`,
    });
    sentSupportTelegramMessage({
      message: `Email error: ${e}`,
    });
  }
};
