import { appName } from '@/features/SEO/appInfo';
import { sendEmail } from './sendEmail';
import { getConfirmEmailTemplate } from '../webhooks/stripe/getConfirmEmailTemplate';
import { getWelcomeEmailTemplate } from './getWelcomeEmailTemplate';

const IS_SEND_REAL_EMAIL = false;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const isSendEmailFromUrl = query.get('isSendTest') === 'true';
  const type = query.get('type');

  const confirmEmailUi = getConfirmEmailTemplate({
    receiptUrl: 'https://example.com/receipt.pdf',
    receiptId: '1234567890',
  });

  const emailUi = type === 'welcome' ? getWelcomeEmailTemplate() : confirmEmailUi;

  if (isSendEmailFromUrl && IS_SEND_REAL_EMAIL) {
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
