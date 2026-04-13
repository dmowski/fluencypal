import { appName } from '@/features/SEO/appInfo';
import {
  getEmailLogs,
  getRecentCreatedUsers,
  isEmailNotificationsEnabled,
  setEmailLogs,
} from '../../user/getUserInfo';
import { getWelcomeEmailTemplate } from '../getWelcomeEmailTemplate';
import { sendEmail } from '../sendEmail';

export async function GET(request: Request) {
  const recentUsers = await getRecentCreatedUsers(10);

  let emailsSentCount = 0;

  for (const user of recentUsers) {
    try {
      if (!user.email) {
        continue;
      }

      const canSendEmail = await isEmailNotificationsEnabled(user.id);
      if (!canSendEmail) {
        continue;
      }

      const emailLogs = await getEmailLogs(user.id);
      if (emailLogs?.isWelcomeMessageSent) {
        continue;
      }

      try {
        const emailTemplate = getWelcomeEmailTemplate();
        await sendEmail({
          emailTo: user.email,
          messageText: emailTemplate.text,
          messageHtml: emailTemplate.html,
          title: `Welcome to ${appName}`,
        });
        emailsSentCount++;
      } catch (error) {
        console.log(`Error sending email to user ${user.id}:`, error);
      }

      await setEmailLogs(user.id, { isWelcomeMessageSent: true });
    } catch (error) {
      console.error(`Error processing user ${user.id}:`, error);
      continue;
    }
  }

  // get

  return new Response(`Done. Emails sent: ${emailsSentCount}`, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
