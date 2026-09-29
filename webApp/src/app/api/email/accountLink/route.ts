import { jsonIfAuthTokenError } from '@/app/api/config/authTokenError';
import { validateAuthToken } from '@/app/api/config/firebase';
import { getEmailLogs, setEmailLogs } from '@/app/api/user/getUserInfo';
import {
  getAccountLinkEmailTemplate,
  accountLinkEmailSubject,
} from '../getAccountLinkEmailTemplate';
import { sendEmail } from '../sendEmail';

export async function POST(request: Request): Promise<Response> {
  let userInfo: Awaited<ReturnType<typeof validateAuthToken>>;
  try {
    userInfo = await validateAuthToken(request);
  } catch (error) {
    const unauthorized = jsonIfAuthTokenError(error);
    if (unauthorized) return unauthorized;
    throw error;
  }

  if (!userInfo.uid || userInfo.isAnonymous || !userInfo.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const emailLogs = await getEmailLogs(userInfo.uid);
  if (emailLogs?.isAccountLinkSent) {
    return Response.json({ status: 'already_sent' });
  }

  const emailTemplate = getAccountLinkEmailTemplate();
  await sendEmail({
    emailTo: userInfo.email,
    messageText: emailTemplate.text,
    messageHtml: emailTemplate.html,
    title: accountLinkEmailSubject,
  });
  await setEmailLogs(userInfo.uid, { isAccountLinkSent: true });

  return Response.json({ status: 'sent' });
}
