import { getWelcomeEmailText } from '@/features/Email/welcomeEmail';
import { getCommonMessageTemplate } from './templates/commonMessage';

export const getWelcomeEmailTemplate = () => {
  return getCommonMessageTemplate({
    title: '',
    subtitle: '',
    messageContent: getWelcomeEmailText({}).split('\n').join('<br/>') + '<br/><br/>',
    callToAction: 'Start Practice',
    callbackUrl: 'https://www.fluencypal.com/practice',
    afterButtonContent: ``,
  });
};
