'use client';
import { Stack, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { useEffect } from 'react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayScenariosInfo } from '../RolePlay/rolePlayData';
import { WebViewWall } from './WebViewWall';
import { AuthWall } from './AuthWall';
import { useIsWebView } from './useIsWebView';
import { isAliasGameRolePlay, trackAliasEvent } from '@/features/RolePlay/aliasAnalytics';

interface SignInFormProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}
export const SignInForm = ({ rolePlayInfo, lang }: SignInFormProps) => {
  const searchParams = useSearchParams();
  const goalId = searchParams.get('goalId');
  const { i18n } = useLingui();
  const rolePlayId = searchParams.get('rolePlayId');

  const scenario = rolePlayId
    ? rolePlayInfo.rolePlayScenarios.find((scenario) => scenario.id === rolePlayId)
    : null;

  useEffect(() => {
    if (isAliasGameRolePlay(rolePlayId)) {
      trackAliasEvent('alias_signup_started');
    }
  }, [rolePlayId]);

  const pageTitle = goalId
    ? i18n._(`Open personal plan`)
    : scenario
      ? i18n._(`Sing in`)
      : i18n._(`Sing in`);

  const singInSubTitle = goalId
    ? i18n._(`So you can keep your progress`)
    : scenario
      ? i18n._(`So you can save your progress`)
      : i18n._(`So you can save your progress`);

  return (
    <WebViewWall>
      <Stack
        sx={{
          width: '100%',
          paddingTop: `20px`,
          paddingBottom: `10px`,
          alignItems: 'center',
        }}
      >
        <AuthWall
          featuresTitle={scenario ? scenario.title : undefined}
          featuresSubTitle={scenario ? scenario.subTitle : undefined}
          signInTitle={pageTitle}
          singInSubTitle={singInSubTitle}
        >
          <></>
        </AuthWall>
      </Stack>
    </WebViewWall>
  );
};
