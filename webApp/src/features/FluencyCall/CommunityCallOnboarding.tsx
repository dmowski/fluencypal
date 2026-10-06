'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { isTMA } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import {
  SupportedLanguage,
  fullLanguageName,
  supportedLanguages,
  supportedLanguagesToLearn,
} from '@/features/Lang/lang';
import { LangSelector, LanguageButton } from '@/features/Lang/LangSelector';
import { getLandingUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { replaceUrlToLang } from '@/features/Lang/replaceLangInUrl';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import { useUrlState } from '@/features/Url/useUrlState';
import { QuizPasswordAccountForm } from '@/features/Goal/Quiz/QuizPasswordAccount';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import { QuizProgressBar } from '@/features/Goal/Quiz/components/QuizProgressBar';
import { NativeLangCode } from '@/libs/language/type';
import { fluencyCallLanguageCode } from './callLanguage';
import { CommunityCallNativeStep } from './CommunityCallNativeStep';
import { CommunityCallScheduleStep } from './CommunityCallScheduleStep';
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
): CommunityCallStep => {
  const path = communityCallPath(options);
  return nextCommunityCallStep(current, path) ?? 'waiting';
};

export const CommunityCallOnboarding = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const router = useRouter();
  const auth = useAuth();
  const settings = useSettings();
  const fallbackLearn = fluencyCallLanguageCode(lang);
  const [learnParam, setLearnParam] = useUrlState('learn', fallbackLearn, false);
  const [nativeParam, setNativeParam] = useUrlState('native', '', false);
  const [stepParam, setStepParam] = useUrlState('step', 'language', true);
  const [pageLanguage, setPageLanguage] = useState<SupportedLanguage>(lang);

  const learn = fluencyCallLanguageCode(learnParam);
  const includePageLanguage = needsCommunityCallPageLanguage(nativeParam);
  const includeAccount = auth.loading || !auth.isIdentified;
  const path = useMemo(
    () => communityCallPath({ includePageLanguage, includeAccount }),
    [includeAccount, includePageLanguage],
  );
  const step = resolveCommunityCallStep(stepParam, path);
  const stepIndex = Math.max(path.indexOf(step), 0);
  const progress = (stepIndex + 1) / path.length;
  const isTelegramApp = useMemo(() => isTMA(), []);

  useEffect(() => {
    if (auth.loading) return;
    if (step !== stepParam) {
      void setStepParam(step);
    }
  }, [auth.loading, setStepParam, step, stepParam]);

  const persistLearn = async () => {
    if (settings.languageCode !== learn) {
      await settings.setLanguage(learn);
    }
  };

  const goToPractice = async () => {
    await persistLearn();
    if (nativeParam) {
      await settings.setNativeLanguage(nativeParam as NativeLangCode);
    }
    router.push(`${getUrlStart(lang)}practice?communityCall=ready#fluency-call`);
  };

  const continueFromLanguage = async () => {
    await persistLearn();
    await setStepParam('calls');
  };

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
      const params = new URLSearchParams(window.location.search);
      params.set('step', next);
      params.set('native', nativeParam);
      params.set('learn', learn);
      router.push(
        replaceUrlToLang(siteLanguage, `${window.location.pathname}?${params.toString()}`),
      );
      return;
    }
    const next = stepAfter('native', {
      includePageLanguage: !siteLanguage,
      includeAccount,
    });
    await setStepParam(next);
  };

  const continueFromPageLanguage = async () => {
    await settings.setPageLanguage(pageLanguage);
    const next = stepAfter('pageLanguage', {
      includePageLanguage: true,
      includeAccount,
    });
    if (pageLanguage === lang) {
      await setStepParam(next);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set('step', next);
    params.set('native', nativeParam);
    params.set('learn', learn);
    router.push(replaceUrlToLang(pageLanguage, `${window.location.pathname}?${params.toString()}`));
  };

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
        {step === 'language' ? (
          <Stack data-testid="community-call-language" sx={{ gap: '16px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('I want to learn:')}
            </Typography>
            <LangSelector
              value={learn}
              availableList={supportedLanguagesToLearn}
              onChange={(next) => {
                void setLearnParam(next);
              }}
            />
            <Button
              variant="contained"
              size="large"
              data-testid="community-call-next"
              data-analytics="community-call-language-continue"
              onClick={() => {
                void continueFromLanguage();
              }}
              sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
            >
              {i18n._('Next')}
            </Button>
          </Stack>
        ) : null}

        {step === 'calls' ? (
          <CommunityCallScheduleStep
            language={learn}
            onContinue={() => {
              void setStepParam('native');
            }}
          />
        ) : null}

        {step === 'native' ? (
          <CommunityCallNativeStep
            value={nativeParam}
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

        {step === 'waiting' ? (
          <Stack data-testid="community-call-waiting" sx={{ gap: '16px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('Talk with AI until the call')}
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              {i18n._('You will see the calls next. Talk with AI until one starts.')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              data-testid="community-call-practice"
              data-analytics="community-call-practice"
              onClick={() => {
                void goToPractice();
              }}
              sx={{ alignSelf: 'flex-start', borderRadius: '30px', fontWeight: 700 }}
            >
              {i18n._('Talk with AI')}
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
};
