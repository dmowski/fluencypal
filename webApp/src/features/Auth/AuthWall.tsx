'use client';

import { ReactNode } from 'react';
import { useLingui } from '@lingui/react';
import { AuthWallBasic } from './AuthWallBasic';
import { getLandingUrlStart, getUrlStart } from '../Lang/getUrlStart';

export const AuthWall = ({
  children,
  signInTitle,
  singInSubTitle,
  featuresTitle,
  featuresSubTitle,
  width,
  startOnAuth,
}: {
  children: ReactNode;
  signInTitle?: string;
  singInSubTitle?: string;
  featuresTitle?: string;
  featuresSubTitle?: string;
  width?: string;
  startOnAuth?: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <AuthWallBasic
      width={width}
      startOnAuth={startOnAuth}
      featuresTitle={featuresTitle || 'FluencyPal'}
      featuresSubTitle={featuresSubTitle || i18n._('Your AI speaking partner')}
      featuresList={[
        {
          title: i18n._('Conversations with Artificial Intelligence'),
          iconName: 'speech',
        },
        {
          title: i18n._('Progress tracking to see your improvement'),
          iconName: 'bar-chart',
        },
        {
          title: i18n._('Grammar rules based on your level'),
          iconName: 'graduation-cap',
        },
        {
          title: i18n._('Community support to keep you motivated'),
          iconName: 'users-round',
        },
      ]}
      authTitle={signInTitle || i18n._("Let's create an account")}
      authSubTitle={singInSubTitle || i18n._('So you can keep your progress')}
      authList={[
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
