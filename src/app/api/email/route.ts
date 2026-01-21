import { appName } from '@/common/metadata';
import { sendEmail } from './sendEmail';
import { getConfirmEmailTemplate } from '../webhooks/stripe/getConfirmEmailTemplate';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const isSendTest = query.get('isSendTest') === 'true';
  const confirmSend = false;

  const emailUi = getConfirmEmailTemplate({
    receiptUrl: 'https://example.com/receipt.pdf',
    receiptId: '1234567890',
  });

  if (isSendTest && confirmSend) {
    const randomId = Math.floor(Math.random() * 10000);
    console.log('SEND REAL EMAIL');
    await sendEmail({
      emailTo: 'dmowski.alex@gmail.com',
      messageText: emailUi.text,
      messageHtml: emailUi.html,
      title: `Your receipt from ${appName} #${randomId} - test`,
    });
  }

  return new Response(emailUi.html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
