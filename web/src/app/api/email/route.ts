import { appName } from '@/features/SEO/appInfo';
import { sendEmail } from './sendEmail';
import { getConfirmEmailTemplate } from '../webhooks/stripe/getConfirmEmailTemplate';
import { getWelcomeEmailTemplate } from './getWelcomeEmailTemplate';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const isSendTest = query.get('isSendTest') === 'true';
  const type = query.get('type');
  const confirmSend = true;

  const confirmEmailUi = getConfirmEmailTemplate({
    receiptUrl: 'https://example.com/receipt.pdf',
    receiptId: '1234567890',
  });

  const emailUi = type === 'welcome' ? getWelcomeEmailTemplate() : confirmEmailUi;

  if (isSendTest && confirmSend) {
    const randomId = Math.floor(Math.random() * 10000);
    console.log('SEND REAL EMAIL');
    await sendEmail({
      emailTo: 'dmowski.alex@gmail.com',
      messageText: emailUi.text,
      messageHtml: emailUi.html,
      title:
        type === 'welcome'
          ? `Welcome to ${appName} #${randomId} - test`
          : `Your receipt from ${appName} #${randomId} - test`,
    });
  }

  return new Response(emailUi.html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
