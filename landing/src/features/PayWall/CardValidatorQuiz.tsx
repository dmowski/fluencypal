'use client';

import { CircularProgress, Stack } from '@mui/material';
import { useSettings } from '../Settings/useSettings';
import { useLingui } from '@lingui/react';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../Auth/useAuth';
import { SupportedLanguage } from '../Lang/lang';
import { InfoStep } from '../Survey/InfoStep';
import { createSetupIntentRequest } from './createSetupIntentRequest';
import { VerifyCard } from './CardValidator';

export const CardValidatorQuiz = ({
  lang,
  onNextStep,
}: {
  lang: SupportedLanguage;
  onNextStep: () => void;
}) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const auth = useAuth();
  const isLoadingSettings = settings.loading;
  const isCreditCardConfirmed = settings.userSettings?.isCreditCardConfirmed;
  const [isShowForm, setIsShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isVerificationStarted, setIsVerificationStarted] = useState(false);

  const onStartValidation = async () => {
    setIsLoading(true);
    setIsVerificationStarted(true);
    try {
      const authToken = await auth.getToken();
      const { clientSecret } = await createSetupIntentRequest({}, authToken);
      setClientSecret(clientSecret);
      setIsShowForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCreditCardConfirmed && isVerificationStarted) {
      setTimeout(() => {
        onNextStep();
      }, 100);
    }
  }, [isCreditCardConfirmed]);

  if (isLoadingSettings) return null;

  if (isCreditCardConfirmed)
    return (
      <InfoStep
        title={i18n._('Credit Card Already Confirmed')}
        subTitle={i18n._(
          'Your credit card has already been confirmed. You can proceed to the next step.',
        )}
        onClick={() => onNextStep()}
      />
    );

  if (!isShowForm && !isLoading) {
    return (
      <InfoStep
        title={i18n._('Unlock full interview preparation')}
        subTitle={i18n._(
          'Get full access to all features. Practice real interviews, get AI feedback, and see your full analysis. We use a card to prevent abuse and give you uninterrupted access to all features.',
        )}
        actionButtonTitle={i18n._('Continue to free access')}
        width={'700px'}
        listItems={[
          {
            iconName: 'shield-check',
            title: i18n._('No automatic payment'),
            iconColor: 'rgb(96, 165, 250)',
          },
        ]}
        onClick={onStartValidation}
        actionButtonEndIcon={<ArrowRight />}
      />
    );
  }
  return (
    <Stack
      sx={{
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          maxWidth: '720px',
          width: '100%',
          alignItems: 'flex-start',
          gap: '30px',
          padding: '20px 20px',
        }}
      >
        {isLoading && <CircularProgress />}
        {isShowForm && clientSecret && <VerifyCard lang={lang} clientSecret={clientSecret} />}
      </Stack>
    </Stack>
  );
};
