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
import { useCurrency } from '@/features/User/useCurrency';
import { useUrlState } from '@/features/Url/useUrlState';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { QuizPasswordAccountForm } from '@/features/Goal/Quiz/QuizPasswordAccount';
import { QuizPageLoader } from '@/features/Case/quiz/QuizPageLoader';
import { QuizProgressBar } from '@/features/Goal/Quiz/components/QuizProgressBar';
import { ConfirmPaymentForm } from '@/features/Usage/HoursPaymentModal/ConfirmPaymentForm';
import { NativeLangCode } from '@/libs/language/type';
import { FluencyCallApiError, requestFluencyCallCheckout } from './api';
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
import { FLUENCY_CALL_PRICE_USD } from './pricing';
import { useFluencyCallAccess } from './useFluencyCallAccess';
import { useNow } from './useNow';

const stepAfter = (
  current: CommunityCallStep,
  options: {
    includePageLanguage: boolean;
    includeAccount: boolean;
    includeMembership: boolean;
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
  const currency = useCurrency();
  const now = useNow(15_000);
  const access = useFluencyCallAccess(now);
  const fallbackLearn = fluencyCallLanguageCode(lang);
  const [learnParam, setLearnParam] = useUrlState('learn', fallbackLearn, false);
  const [nativeParam, setNativeParam] = useUrlState('native', '', false);
  const [stepParam, setStepParam] = useUrlState('step', 'language', true);
  const [pageLanguage, setPageLanguage] = useState<SupportedLanguage>(lang);
  const [buying, setBuying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const learn = fluencyCallLanguageCode(learnParam);
  const includePageLanguage = needsCommunityCallPageLanguage(nativeParam);
  const includeAccount = auth.loading || !auth.isIdentified;
  const includeMembership = !access.ready || !access.canJoin;
  const path = useMemo(
    () => communityCallPath({ includePageLanguage, includeAccount, includeMembership }),
    [includeAccount, includeMembership, includePageLanguage],
  );
  const step = resolveCommunityCallStep(stepParam, path);
  const stepIndex = Math.max(path.indexOf(step), 0);
  const progress = (stepIndex + 1) / path.length;
  const isTelegramApp = useMemo(() => isTMA(), []);

  useEffect(() => {
    if (auth.loading) return;
    if (stepParam === 'membership' && !access.ready) return;
    if (step !== stepParam) {
      void setStepParam(step);
    }
  }, [access.ready, auth.loading, setStepParam, step, stepParam]);

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
        includeMembership,
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
      includeMembership,
    });
    await setStepParam(next);
  };

  const continueFromPageLanguage = async () => {
    await settings.setPageLanguage(pageLanguage);
    const next = stepAfter('pageLanguage', {
      includePageLanguage: true,
      includeAccount,
      includeMembership,
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

  useEffect(() => {
    if (step !== 'membership') return;
    sendAnalyticsEvent({ name: 'paywall_view', ctaId: 'fluency-call' });
  }, [step]);

  const buy = async () => {
    setBuying(true);
    setPayError(null);
    sendAnalyticsEvent({ name: 'checkout_start', ctaId: 'fluency-call' });
    try {
      await persistLearn();
      const result = await requestFluencyCallCheckout(await auth.getToken(), {
        currency: currency.currency,
        languageCode: learn,
      });
      if (!result.sessionUrl) throw new Error(result.error || 'Checkout did not start');
      window.location.href = result.sessionUrl;
    } catch (checkoutError) {
      const message =
        checkoutError instanceof FluencyCallApiError || checkoutError instanceof Error
          ? checkoutError.message
          : 'Could not start checkout';
      setPayError(message);
      setBuying(false);
    }
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

        {step === 'membership' ? (
          <Stack data-testid="community-call-membership" sx={{ gap: '18px' }}>
            <Stack sx={{ gap: '6px' }}>
              <Typography variant="h5">{i18n._('Group conversations')}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {i18n._('$2 per month')}
              </Typography>
              <Typography sx={{ opacity: 0.75 }}>
                {i18n._(
                  'A month of live calls with other learners on Google Meet. Pay now, or later. You will need it before you join a call.',
                )}
              </Typography>
            </Stack>
            <ConfirmPaymentForm
              isRedirecting={buying}
              amountInUsd={FLUENCY_CALL_PRICE_USD}
              analyticsId="community-call-checkout"
              onConfirmRequest={() => {
                void buy();
              }}
            />
            {payError ? <Typography sx={{ color: '#ffb4b4' }}>{payError}</Typography> : null}
            <Button
              data-testid="community-call-not-now"
              data-analytics="community-call-not-now"
              onClick={() => {
                void setStepParam('waiting');
              }}
              sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700 }}
            >
              {i18n._('Not now')}
            </Button>
          </Stack>
        ) : null}

        {step === 'waiting' ? (
          <Stack data-testid="community-call-waiting" sx={{ gap: '16px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {access.canJoin ? i18n._('Talk with AI until the call') : i18n._('You can pay later')}
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              {access.canJoin
                ? i18n._('You will see the calls next. Talk with AI until one starts.')
                : i18n._(
                    'You will need the $2 month before you join a call. Until then, talk with AI.',
                  )}
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
