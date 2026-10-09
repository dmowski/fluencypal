'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { isTMA } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { SupportedLanguage, fullLanguageName, supportedLanguages } from '@/features/Lang/lang';
import { LanguageButton } from '@/features/Lang/LangSelector';
import { getLandingUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { replaceUrlToLang } from '@/features/Lang/replaceLangInUrl';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import { useUrlState } from '@/features/Url/useUrlState';
import { QuizPasswordAccountForm } from '@/features/Goal/Quiz/QuizPasswordAccount';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import { QuizProgressBar } from '@/features/Goal/Quiz/components/QuizProgressBar';
import { NativeLangCode } from '@/libs/language/type';
import { scrollTopFast } from '@/libs/scroll';
import { fluencyCallLanguageCode } from './callLanguage';
import { communityCallChosenTitle } from './callTime';
import { CommunityCallNativeStep } from './CommunityCallNativeStep';
import { CommunityCallScheduleStep } from './CommunityCallScheduleStep';
import { useListedFluencyCalls } from './useFluencyCalls';
import { useNow } from './useNow';
import {
  CommunityCallStep,
  communityCallPath,
  needsCommunityCallPageLanguage,
  nextCommunityCallStep,
  previousCommunityCallStep,
  resolveCommunityCallStep,
} from './communityCallSteps';

const stepAfter = (
  current: CommunityCallStep,
  options: {
    includePageLanguage: boolean;
    includeAccount: boolean;
  },
): CommunityCallStep | null => nextCommunityCallStep(current, communityCallPath(options));

export const CommunityCallOnboarding = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const router = useRouter();
  const auth = useAuth();
  const settings = useSettings();
  const [nativeParam, setNativeParam] = useUrlState('native', '', false);
  const [stepParam, setStepParam] = useUrlState('step', 'calls', true);
  const [callParam] = useUrlState('call', '', false);
  const now = useNow(15_000);
  const { calls } = useListedFluencyCalls(now);
  const [pageLanguage, setPageLanguage] = useState<SupportedLanguage>(lang);

  const learn = fluencyCallLanguageCode('en');
  const includePageLanguage = needsCommunityCallPageLanguage(nativeParam);
  const includeAccount = auth.loading || !auth.isIdentified;
  const path = useMemo(
    () => communityCallPath({ includePageLanguage, includeAccount }),
    [includeAccount, includePageLanguage],
  );
  const destination = resolveCommunityCallStep(stepParam, path);
  const step: CommunityCallStep = destination === 'practice' ? 'calls' : destination;
  const stepIndex = Math.max(path.indexOf(step), 0);
  const progress = (stepIndex + 1) / path.length;
  const isTelegramApp = useMemo(() => isTMA(), []);
  const redirectStarted = useRef(false);

  const persistLearn = async () => {
    if (settings.languageCode !== learn) {
      await settings.setLanguage(learn);
    }
  };

  const openNative = async (callId: string | null) => {
    await persistLearn();
    const params = new URLSearchParams(window.location.search);
    params.set('step', 'native');
    if (callId) params.set('call', callId);
    else params.delete('call');
    router.push(`${window.location.pathname}?${params.toString()}`);
    scrollTopFast();
  };

  const chosenCall = calls.find((call) => call.id === callParam) ?? null;
  const chosenTitle = chosenCall
    ? communityCallChosenTitle(chosenCall.startsAtIso, now, i18n.locale || 'en', {
        today: i18n._('Today'),
        tomorrow: i18n._('Tomorrow'),
        now: i18n._('Now'),
      })
    : null;

  const openPractice = async (pageLang: SupportedLanguage = lang) => {
    await persistLearn();
    if (nativeParam) {
      await settings.setNativeLanguage(nativeParam as NativeLangCode);
    }
    router.push(`${getUrlStart(pageLang)}practice?communityCall=ready#fluency-call`);
  };

  useEffect(() => {
    if (auth.loading) return;
    if (destination === 'practice') {
      if (redirectStarted.current) return;
      redirectStarted.current = true;
      void openPractice();
      return;
    }
    if (destination !== stepParam) {
      void setStepParam(destination);
    }
  }, [auth.loading, destination, setStepParam, stepParam]);

  const continueFromNative = async () => {
    if (!nativeParam) return;
    await settings.setNativeLanguage(nativeParam as NativeLangCode);
    const siteLanguage = supportedLanguages.find((code) => code === nativeParam);
    if (siteLanguage && siteLanguage !== lang) {
      await settings.setPageLanguage(siteLanguage);
      const next = stepAfter('native', {
        includePageLanguage: false,
        includeAccount,
      });
      if (!next) {
        await openPractice(siteLanguage);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      params.set('step', next);
      params.set('native', nativeParam);
      router.push(
        replaceUrlToLang(siteLanguage, `${window.location.pathname}?${params.toString()}`),
      );
      return;
    }
    const next = stepAfter('native', {
      includePageLanguage: !siteLanguage,
      includeAccount,
    });
    if (!next) {
      await openPractice();
      return;
    }
    await setStepParam(next);
  };

  const continueFromPageLanguage = async () => {
    await settings.setPageLanguage(pageLanguage);
    const next = stepAfter('pageLanguage', {
      includePageLanguage: true,
      includeAccount,
    });
    if (!next) {
      await openPractice(pageLanguage);
      return;
    }
    if (pageLanguage === lang) {
      await setStepParam(next);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set('step', next);
    params.set('native', nativeParam);
    router.push(replaceUrlToLang(pageLanguage, `${window.location.pathname}?${params.toString()}`));
  };

  if (destination === 'practice') {
    return (
      <Stack
        component="main"
        data-testid="community-call-onboarding"
        data-analytics-screen="communityCall.practice"
        sx={{ width: '100%', alignItems: 'center', padding: '40px 0' }}
      >
        <QuizPageLoader />
      </Stack>
    );
  }

  return (
    <Stack
      component="main"
      data-testid="community-call-onboarding"
      data-analytics-screen={`communityCall.${step}`}
      sx={{ width: '100%', alignItems: 'center', padding: '10px 0 40px' }}
    >
      <QuizProgressBar
        navigateToMainPage={() => {
          window.location.assign(`${getLandingUrlStart(lang)}features/group-conversations`);
        }}
        isCanGoToMainPage={!isTelegramApp}
        isFirstStep={stepIndex === 0}
        prevStep={() => {
          const previous = previousCommunityCallStep(step, path);
          if (previous) void setStepParam(previous);
        }}
        progress={progress}
        width="600px"
      />
      <Stack sx={{ width: '100%', maxWidth: '600px', padding: '0 10px' }}>
        {step === 'calls' ? (
          <CommunityCallScheduleStep
            language={learn}
            onChoose={(callId) => {
              void openNative(callId);
            }}
            onContinue={() => {
              void openNative(null);
            }}
          />
        ) : null}

        {step === 'native' ? (
          <CommunityCallNativeStep
            value={nativeParam}
            callTitle={chosenTitle}
            onChange={(language) => {
              void setNativeParam(language);
            }}
            onContinue={() => {
              void continueFromNative();
            }}
          />
        ) : null}

        {step === 'pageLanguage' ? (
          <Stack data-testid="community-call-page-language" sx={{ gap: '16px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('Which language should we use?')}
            </Typography>
            <Typography sx={{ opacity: 0.75 }}>
              {i18n._('We will show FluencyPal in this language.')}
            </Typography>
            <Stack sx={{ gap: '10px', maxHeight: '46vh', overflow: 'auto' }}>
              {supportedLanguages.map((code) => (
                <LanguageButton
                  key={code}
                  onClick={() => setPageLanguage(code)}
                  label={fullLanguageName[code]}
                  langCode={code}
                  englishFullName={fullLanguageName[code]}
                  isSystemLang={code === lang}
                  fullName={fullLanguageName[code]}
                  isShowFullName={false}
                  isSelected={pageLanguage === code}
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              size="large"
              data-testid="community-call-next"
              data-analytics="community-call-page-language-continue"
              onClick={() => {
                void continueFromPageLanguage();
              }}
              sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
            >
              {i18n._('Continue')}
            </Button>
          </Stack>
        ) : null}

        {step === 'account' ? (
          auth.loading || auth.isIdentified ? (
            <QuizPageLoader />
          ) : (
            <Stack data-testid="community-call-account">
              <QuizPasswordAccountForm />
            </Stack>
          )
        ) : null}
      </Stack>
    </Stack>
  );
};
