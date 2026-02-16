import { useLingui } from '@lingui/react';
import {
  Button,
  Checkbox,
  Divider,
  Stack,
  TextField,
  Typography,
  Link,
  FormControlLabel,
} from '@mui/material';
import { useSettings } from '../Settings/useSettings';
import { useAccess } from '../Usage/useAccess';
import { LanguageSwitcher } from '../Lang/LanguageSwitcher';
import { useState } from 'react';
import { useAuth } from '../Auth/useAuth';
import { createSetupIntentRequest } from '../PayWall/createSetupIntentRequest';
import { VerifyCard } from '../PayWall/CardValidator';
import { ParentConsent } from '@/common/userSettings';
import { CONTACTS } from '../Landing/Contact/data';
import { Check } from 'lucide-react';
import { getUrlStart } from '../Lang/getUrlStart';
import { CustomModal } from '../uiKit/Modal/CustomModal';

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
  const pageLang = settings.userSettings?.pageLanguageCode || 'en';

  // NOTE: consider storing consentVersion, childEmail, and ip on server-side too.
  const [consent, setConsent] = useState<ParentConsent>({
    parentEmail: '',
    parentName: '',
    consentGivenAtIso: new Date().toISOString(),
  });

  const [parentCheckboxes, setParentCheckboxes] = useState({
    isGuardian: false,
    agreesToProcessing: false,
    agreesToGuidelines: false,
  });

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

  const isEmailValid =
    consent.parentEmail.trim().includes('@') &&
    consent.parentEmail.trim().length >= 5 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consent.parentEmail.trim());

  const isNameValid = consent.parentName.trim().length >= 2;
  const isParentFormValid =
    isNameValid &&
    isEmailValid &&
    parentCheckboxes.isGuardian &&
    parentCheckboxes.agreesToProcessing &&
    parentCheckboxes.agreesToGuidelines;

  const canSubmit = isParentFormValid && isCardConfirmed && !loading;

  const submitParentalConsent = async () => {
    if (!canSubmit) {
      alert(i18n._('Please complete all steps and ensure the form is valid before submitting.'));
      return;
    }
    // Ideally: call backend endpoint that stores:
    // parentName, parentEmail, consentTextVersion, ipAddress, timestamp, userId, cardConfirmed=true
    // then backend sets account status -> active.
    settings.setParentalConsent(consent);
    alert(i18n._('Parental consent submitted!'));
  };

  if (!isBlockedByAge) return null;

  return (
    <Stack sx={{ alignItems: 'center', padding: '40px 20px', width: '100%' }}>
      <Stack sx={{ maxWidth: '680px', width: '100%' }}>
        <Stack sx={{ flexDirection: 'row', alignItems: 'flex-start', paddingBottom: '10px' }}>
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
          sx={{ gap: '28px' }}
          component={'form'}
          onSubmit={(e) => {
            e.preventDefault();
            submitParentalConsent();
          }}
        >
          <Stack>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {i18n._(`Access Blocked`)}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {i18n._(
                `This account is currently blocked due to age restrictions. A parent or legal guardian can enable access by completing the steps below.`,
              )}
            </Typography>
          </Stack>

          {/* ABOUT FLUENCYPAL */}
          <Stack
            sx={{
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '18px',
              background: 'rgba(255,255,255,0.04)',
              gap: '10px',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {i18n._('About FluencyPal')}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {i18n._(
                'FluencyPal is a language-learning app that helps learners practice speaking and improve confidence through guided exercises and AI feedback.',
              )}
            </Typography>

            <Stack sx={{ gap: '8px', paddingTop: '6px' }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                •{' '}
                {i18n._(
                  'The app can process voice recordings to generate transcripts and feedback.',
                )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                •{' '}
                {i18n._(
                  'Transcripts may be stored in the account to help track progress over time.',
                )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                • {i18n._('A parent or guardian can withdraw consent later by contacting support.')}
              </Typography>
            </Stack>

            <Typography variant="caption" sx={{ opacity: 0.8, paddingTop: '6px' }}>
              {i18n._('Learn more in our ')}
              <Link href={`${getUrlStart(pageLang)}privacy`} underline="hover" target="_blank">
                {i18n._('Privacy Policy')}
              </Link>
              {i18n._(' and ')}
              <Link href={`${getUrlStart(pageLang)}terms`} underline="hover" target="_blank">
                {i18n._('Terms of Use')}
              </Link>
              .
            </Typography>
          </Stack>

          <Stack sx={{ gap: '102px', padding: '50px 0 130px 0' }}>
            {/* STEP 1 */}
            <Stack gap="12px">
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {i18n._(`Parental Consent`)}
              </Typography>

              <Stack>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.85 }}>
                  {i18n._(`Step 1`)}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {i18n._(`Parent / Guardian Details`)}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {i18n._(
                  `A parent or legal guardian must confirm they approve using FluencyPal and understand how data is processed.`,
                )}
              </Typography>

              <Stack
                gap="22px"
                sx={{
                  paddingBottom: '20px',
                }}
              >
                <Stack>
                  <Typography
                    sx={{
                      paddingTop: '30px',
                      fontWeight: 700,
                    }}
                  >
                    {i18n._('Parent / Guardian full name')}
                  </Typography>
                  <TextField
                    value={consent.parentName}
                    onChange={(e) => setConsent((p) => ({ ...p, parentName: e.target.value }))}
                    fullWidth
                    required
                  />
                </Stack>
                <Stack>
                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {i18n._('Parent / Guardian email')}
                  </Typography>
                  <TextField
                    value={consent.parentEmail}
                    onChange={(e) => setConsent((p) => ({ ...p, parentEmail: e.target.value }))}
                    fullWidth
                    type="email"
                    error={consent.parentEmail.length > 0 && !isEmailValid}
                    required
                  />
                </Stack>
              </Stack>

              <Stack gap="8px" sx={{ paddingTop: '6px' }}>
                <Stack direction="row" alignItems="center" gap="8px">
                  <FormControlLabel
                    required
                    sx={{
                      '.MuiFormControlLabel-asterisk': {
                        color: '#f24',
                      },
                    }}
                    checked={parentCheckboxes.isGuardian}
                    onChange={(e) =>
                      setParentCheckboxes((p) => ({
                        ...p,
                        isGuardian: !parentCheckboxes.isGuardian,
                      }))
                    }
                    control={<Checkbox size="large" />}
                    label={
                      <Typography variant="body2" component={'span'}>
                        {i18n._(`I confirm I am the child’s parent or legal guardian.`)}
                      </Typography>
                    }
                  />
                </Stack>

                <Stack direction="row" alignItems="center" gap="8px">
                  <FormControlLabel
                    required
                    sx={{
                      '.MuiFormControlLabel-asterisk': {
                        color: '#f24',
                      },
                    }}
                    checked={parentCheckboxes.agreesToProcessing}
                    onChange={(e) =>
                      setParentCheckboxes((p) => ({
                        ...p,
                        agreesToProcessing: !parentCheckboxes.agreesToProcessing,
                      }))
                    }
                    control={<Checkbox size="large" />}
                    label={
                      <Typography variant="body2" component={'span'}>
                        {i18n._(
                          `I consent to processing the child’s data (voice and transcripts) to provide the service.`,
                        )}
                      </Typography>
                    }
                  />
                </Stack>

                <Stack direction="row" alignItems="center" gap="8px">
                  <FormControlLabel
                    required
                    sx={{
                      '.MuiFormControlLabel-asterisk': {
                        color: '#f24',
                      },
                    }}
                    checked={parentCheckboxes.agreesToGuidelines}
                    onChange={(e) =>
                      setParentCheckboxes((p) => ({
                        ...p,
                        agreesToGuidelines: !parentCheckboxes.agreesToGuidelines,
                      }))
                    }
                    control={<Checkbox size="large" />}
                    label={
                      <Typography variant="body2" component={'span'}>
                        {i18n._(`I agree to the Terms of Use and Privacy Policy.`)}{' '}
                        <Link
                          href={`${getUrlStart(pageLang)}privacy`}
                          underline="hover"
                          target="_blank"
                        >
                          {i18n._('Privacy Policy')}
                        </Link>
                        {i18n._(' and ')}
                        <Link
                          href={`${getUrlStart(pageLang)}terms`}
                          underline="hover"
                          target="_blank"
                        >
                          {i18n._('Terms of Use')}
                        </Link>
                        .
                      </Typography>
                    }
                  />
                </Stack>

                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {i18n._(
                    `Tip: You can withdraw consent later and request data deletion by contacting support.`,
                  )}{' '}
                  {CONTACTS.email}
                </Typography>
              </Stack>
            </Stack>

            <Stack gap="12px">
              <Stack>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.85 }}>
                  {i18n._(`Step 2`)}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    textDecoration: isCardConfirmed ? 'line-through' : 'none',
                  }}
                >
                  {i18n._(`Card Verification`)}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {i18n._(
                  `To help prevent unauthorized access, we verify the parent/guardian using a one-time card verification.`,
                )}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {i18n._(
                  `No payment will be taken. Your card will not be stored or used for charges as part of this step.`,
                )}
              </Typography>

              <Stack direction="row" alignItems="center" gap="10px" flexWrap="wrap">
                <Button
                  variant="contained"
                  type="button"
                  color="info"
                  size="large"
                  onClick={onStartValidation}
                  disabled={loading || isCardConfirmed}
                >
                  {i18n._(`Verify Card`)}
                </Button>
                {isCardConfirmed ? <Typography>{i18n._('Card verified')} ✅</Typography> : null}
              </Stack>
            </Stack>

            {/* STEP 3 */}
            <Stack gap="12px">
              <Stack>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.85 }}>
                  {i18n._(`Step 3`)}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {i18n._(`Enable Access`)}
                </Typography>
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {i18n._(
                  `After steps 1 and 2 are completed, you can submit consent to enable access for this account.`,
                )}
              </Typography>

              <Button
                variant="contained"
                size="large"
                type="submit"
                color="info"
                endIcon={<Check />}
              >
                {i18n._('Submit Parental Consent')}
              </Button>

              {!isParentFormValid ? (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {i18n._('Please fill parent details and check all boxes in Step 1.')}
                </Typography>
              ) : null}

              {isParentFormValid && !isCardConfirmed ? (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {i18n._('Please complete card verification in Step 2.')}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {isShowForm && clientSecret && !isCardConfirmed && (
        <CustomModal
          isOpen={true}
          onClose={() => {
            setIsShowForm(false);
          }}
        >
          <VerifyCard
            lang={settings.pageLanguageCode || 'en'}
            clientSecret={clientSecret}
            title={i18n._('Card Verification')}
            subtitle={i18n._('Complete verification to proceed.')}
          />
        </CustomModal>
      )}
    </Stack>
  );
};
