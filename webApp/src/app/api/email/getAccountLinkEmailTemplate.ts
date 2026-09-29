import { appName, siteUrlWithoutSlash } from '@/features/SEO/appInfo';
import { getCommonMessageTemplate } from './templates/commonMessage';

export const accountLinkEmailSubject = `Your ${appName} account is created`;

export const accountLinkUrl = `${siteUrlWithoutSlash}/practice`;

export const getAccountLinkEmailTemplate = () => {
  const message = `Don't forget that growth depends on daily practice. Good luck!`;

  return getCommonMessageTemplate({
    title: 'Account created',
    subtitle: '',
    messageContent: message.split('\n').join('<br/>') + '<br/>',
    callToAction: `Open ${appName}`,
    callbackUrl: accountLinkUrl,
    afterButtonContent: '',
  });
};
