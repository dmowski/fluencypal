import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { useSettings } from '../Settings/useSettings';
import { useAccess } from '../Usage/useAccess';
import { LanguageSwitcher } from '../Lang/LanguageSwitcher';
import { CardValidatorWall } from '../PayWall/CardValidatorWall';
import { useState } from 'react';
import { useAuth } from '../Auth/useAuth';
import { createSetupIntentRequest } from '../PayWall/createSetupIntentRequest';
import { VerifyCard } from '../PayWall/CardValidator';

export const BlockedAccess = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const access = useAccess();
  const auth = useAuth();
  const [isShowForm, setIsShowForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isBlockedByAge = access.isBlockedByAge;

  const isCardConfirmed = !!settings.userSettings?.isCreditCardConfirmed;

  const onStartValidation = async () => {
    setLoading(true);
    try {
      const authToken = await auth.getToken();
      const { clientSecret } = await createSetupIntentRequest({}, authToken);
      setClientSecret(clientSecret);
      setIsShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      sx={{
        alignItems: 'center',
        padding: '40px 20px',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          maxWidth: '680px',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingBottom: '10px',
          }}
        >
          <LanguageSwitcher
            isAuth={true}
            langToLearn={settings.languageCode || 'en'}
            setLanguageToLearn={settings.appMode === 'learning' ? settings.setLanguage : undefined}
            setPageLanguage={settings.setPageLanguage}
            nativeLang={settings.userSettings?.nativeLanguageCode || 'en'}
            setNativeLanguage={settings.setNativeLanguage}
          />
        </Stack>

        <Stack
          sx={{
            gap: '40px',
          }}
        >
          <Stack>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {i18n._(`Access Blocked`)}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {i18n._(
                `Your account is blocked due to age restrictions. Please ask your parent or guardian to provide consent to access the app.`,
              )}
            </Typography>
          </Stack>

          <Stack
            sx={{
              alignItems: 'flex-start',
              gap: '40px',
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 800 }}>
              {i18n._(`Parental Consent`)}
            </Typography>

            <Stack gap={'20px'}>
              <Stack>
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: 'uppercase',
                  }}
                >
                  {i18n._(`Step 1`)}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    padding: '0px 0 10px 0',
                    textDecoration: isCardConfirmed ? 'line-through' : 'none',
                  }}
                >
                  {i18n._(`Card Validation`)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {i18n._(
                    `To ensure the safety of our younger users, we require parental consent through a secure credit card validation process. This step is crucial in preventing unauthorized access and ensuring that our platform remains a safe space for everyone.`,
                  )}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    paddingTop: '10px',
                  }}
                >
                  {i18n._(
                    `Card won't be used for any payments. It's just a one-time validation to confirm parental consent.`,
                  )}
                </Typography>
              </Stack>
              <Stack
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Button
                  variant="contained"
                  color="info"
                  size="large"
                  onClick={onStartValidation}
                  disabled={loading || !!isCardConfirmed}
                >
                  {i18n._(`Validate Card`)}
                </Button>
                {isCardConfirmed ? <Typography>{i18n._('Card Confirmed')} ✅</Typography> : null}
              </Stack>

              {isShowForm && clientSecret && !isCardConfirmed && (
                <VerifyCard
                  lang={settings.pageLanguageCode || 'en'}
                  clientSecret={clientSecret}
                  title={i18n._('Credit Card Confirmation')}
                  subtitle={i18n._(
                    'Please complete the card verification to access features of the app.',
                  )}
                />
              )}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
