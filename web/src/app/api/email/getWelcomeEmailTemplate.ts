import { getCommonMessageTemplate } from './templates/commonMessage';

export const getWelcomeEmailTemplate = () => {
  return getCommonMessageTemplate({
    title: 'Welcome to FluencyPal',
    subtitle: 'Hello,<br/>Welcome to <b>FluencyPal</b>!',
    messageContent: `
<p style="margin: 0; padding-bottom: 12px; color: #222222; font-size: 16px; line-height: 18px;">
Your account is ready and you can start practicing English right away.
</p>

<p style="margin: 0; padding-bottom: 12px; color: #222222; font-size: 16px; line-height: 18px;">
Explore lessons, build your daily routine, and improve step by step.
</p>
`,
    callToAction: 'Start Practice',
    callbackUrl: 'https://www.fluencypal.com/practice',
    afterButtonContent: ``,
  });
};
