'use client';

import { ReactNode } from 'react';
import { useLingui } from '@lingui/react';
import { AuthWallBasic } from '@/features/Auth/AuthWallBasic';
import { getLandingUrlStart } from '@/features/Lang/getUrlStart';

export const TalkWithAlexAuthWall = ({ children }: { children: ReactNode }) => {
  const { i18n } = useLingui();

  return (
    <AuthWallBasic
      width="600px"
      featuresTitle={i18n._('A call with Alex')}
      featuresSubTitle={i18n._(
        'A short call to get to know each other. Alex writes you after this, and you pick a time.',
      )}
      featuresList={[
        {
          title: i18n._('Talk with Alex before a group call'),
          iconName: 'speech',
        },
        {
          title: i18n._('You set the pace. Ask him to speak slowly'),
          iconName: 'timer',
        },
        {
          title: i18n._('He writes you to choose a time'),
          iconName: 'mail',
        },
        {
          title: i18n._('The call is free'),
          iconName: 'sparkles',
        },
      ]}
      authTitle={i18n._('Create an account')}
      authSubTitle={i18n._('So Alex knows who wants to talk')}
      authList={[
        {
          title: i18n._('No ads, no spam'),
          iconName: 'between-horizontal-start',
        },
        {
          title: i18n._('Privacy Policy'),
          iconName: 'scroll-text',
          href: `${getLandingUrlStart('en')}privacy`,
        },
        {
          title: i18n._('Terms of Use'),
          iconName: 'pencil-ruler',
          href: `${getLandingUrlStart('en')}terms`,
        },
      ]}
    >
      {children}
    </AuthWallBasic>
  );
};
