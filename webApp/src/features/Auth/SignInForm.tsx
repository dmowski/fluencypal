'use client';
import { Stack } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useLingui } from '@lingui/react';
import { useEffect, useState } from 'react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayScenariosInfo } from '../RolePlay/rolePlayData';
import { WebViewWall } from './WebViewWall';
import { AuthWall } from './AuthWall';
import { isAliasGameRolePlay, trackAliasEvent } from '@/features/RolePlay/aliasAnalytics';
import { shouldStartPracticeAuthOnGoogle } from './practiceAuthWall';
import { getRolePlayOpeningLine } from './rolePlayOpeningLine';
import { RolePlayOpeningPreview } from './RolePlayOpeningPreview';
import { RolePlayGuestReply } from './RolePlayGuestReply';
import { hasGuestReply } from './rolePlayGuestReplyStorage';

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

  const startOnAuth = shouldStartPracticeAuthOnGoogle(rolePlayId);
  const openingLine = getRolePlayOpeningLine(scenario);
  const [isGuestRecording, setIsGuestRecording] = useState(false);
  const [hasGuestReplied, setHasGuestReplied] = useState(() =>
    Boolean(rolePlayId && hasGuestReply(rolePlayId)),
  );

  const pageTitle = goalId
    ? i18n._(`Open personal plan`)
    : scenario
      ? scenario.shortTitle
      : i18n._(`Let's create an account`);

  const singInSubTitle = goalId
    ? i18n._(`So you can keep your progress`)
    : openingLine
      ? ''
      : scenario
        ? scenario.subTitle
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
          startOnAuth={startOnAuth}
          featuresTitle={scenario ? scenario.title : undefined}
          featuresSubTitle={scenario ? scenario.subTitle : undefined}
          signInTitle={pageTitle}
          singInSubTitle={singInSubTitle}
          authActionTitle={startOnAuth ? i18n._('Continue to talk') : undefined}
          authListAfterActions={startOnAuth}
          hideAuthActions={startOnAuth && !hasGuestReplied}
          authSubComponent={
            openingLine && rolePlayId ? (
              <Stack
                data-testid="roleplay-guest-start"
                sx={{
                  gap: '16px',
                  marginTop: '8px',
                }}
              >
                <RolePlayOpeningPreview
                  text={openingLine.text}
                  audioSrc={openingLine.audioSrc}
                  pausePlayback={isGuestRecording}
                />
                <RolePlayGuestReply
                  rolePlayId={rolePlayId}
                  onRecordingChange={setIsGuestRecording}
                  onHasReplied={setHasGuestReplied}
                />
              </Stack>
            ) : undefined
          }
        >
          <></>
        </AuthWall>
      </Stack>
    </WebViewWall>
  );
};
