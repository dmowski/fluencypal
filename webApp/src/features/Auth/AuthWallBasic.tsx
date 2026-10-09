import { ReactNode, useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Check } from 'lucide-react';
import { scrollTopFast } from '@/libs/scroll';
import { InfoStep } from '../Survey/InfoStep';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';
import { ListItem } from '../Survey/IconTextList';
import { getLandingUrlStart } from '../Lang/getUrlStart';
import { useAuth } from './useAuth';
import { normalizeEmail } from './normalizeEmail';
import { resolveAuthWallStartStep } from './practiceAuthWall';
import { AuthEmailSentStep, AuthSignInStep } from './AuthSignInStep';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const AUTH_WALL_LAST_METHOD_KEY = 'authWall:lastMethod';

type AuthMethod = 'google' | 'email';

const getStoredAuthMethod = (): AuthMethod | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(AUTH_WALL_LAST_METHOD_KEY);
  if (value === 'google' || value === 'email') {
    return value;
  }

  return null;
};

const setStoredAuthMethod = (method: AuthMethod) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_WALL_LAST_METHOD_KEY, method);
};

const isPolicyLink = (item: ListItem) => {
  const href = item.href ?? '';
  return href.endsWith('privacy') || href.endsWith('terms');
};

const policyHref = (items: ListItem[], page: 'privacy' | 'terms') =>
  items.find((item) => item.href?.endsWith(page))?.href;

interface AuthWallBasicProps {
  children: ReactNode;
  featuresTitle: string;
  featuresSubTitle: string;
  featuresList: ListItem[];
  authTitle: string;
  authSubTitle: string;
  authList: ListItem[];
  featuresImageUrl?: string;
  agreementImageUrl?: string;
  authImageUrl?: string;
  width?: string;
  startOnAuth?: boolean;
  authSubComponent?: ReactNode;
  authActionTitle?: string;
  authListAfterActions?: boolean;
  authActionsQuiet?: boolean;
  hideAuthActions?: boolean;
}

export const AuthWallBasic = ({
  children,
  featuresTitle,
  featuresSubTitle,
  featuresList,
  authTitle,
  authSubTitle,
  authList,
  featuresImageUrl,
  agreementImageUrl,
  width,
  startOnAuth = false,
  authSubComponent,
  authActionTitle,
  authActionsQuiet = false,
  hideAuthActions = false,
}: AuthWallBasicProps) => {
  const auth = useAuth();
  const { i18n } = useLingui();
  const isShowAuthWall = !auth.isIdentified && !auth.loading;

  const [isValidEmailError, setIsValidEmailError] = useState(false);
  const [emailSignInError, setEmailSignInError] = useState('');
  const [isEmailSignInLoading, setIsEmailSignInLoading] = useState(false);
  const [googleSignInError, setGoogleSignInError] = useState('');
  const [isGoogleSignInLoading, setIsGoogleSignInLoading] = useState(false);

  const [email, setEmail] = useState('');

  const isValidEmailAddress = isValidEmail(email);
  const [lastAuthMethod, setLastAuthMethod] = useState<AuthMethod | null>(getStoredAuthMethod);

  useEffect(() => {
    if (isValidEmailError && isValidEmailAddress) {
      setIsValidEmailError(false);
    }
  }, [email, isValidEmailAddress, isValidEmailError]);

  const steps = ['features', 'agreement', 'auth', 'email-send'] as const;
  const [step, setStep] = useState<(typeof steps)[number]>(() =>
    resolveAuthWallStartStep({
      startOnAuth,
      lastAuthMethod: getStoredAuthMethod(),
    }),
  );

  const nextStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const signInWithGoogle = async () => {
    setGoogleSignInError('');
    setIsGoogleSignInLoading(true);
    onSelectAuthMethod('google');
    const signInResult = await auth.signInWithGoogle();
    if (signInResult.isRedirecting) {
      return;
    }
    setIsGoogleSignInLoading(false);
    if (!signInResult.isDone && signInResult.error) {
      setGoogleSignInError(signInResult.error);
    }
  };

  const signInWithEmail = async () => {
    if (!isValidEmailAddress) {
      setIsValidEmailError(true);
      return;
    }
    setEmailSignInError('');
    setIsEmailSignInLoading(true);
    onSelectAuthMethod('email');
    const signInResult = await auth.signInWithEmail(email);
    setIsEmailSignInLoading(false);
    if (!signInResult.isDone) {
      setEmailSignInError(signInResult.error || 'Unknown error');
      return;
    }

    setStep('email-send');
  };

  useEffect(() => {
    if (isShowAuthWall) {
      const isWindow = typeof window !== 'undefined';
      if (isWindow) {
        scrollTopFast();
      }
    }
  }, [isShowAuthWall]);

  const onSelectAuthMethod = (method: AuthMethod) => {
    setStoredAuthMethod(method);
    setLastAuthMethod(method);
  };

  if (auth.loading) {
    return (
      <Stack
        sx={{
          paddingTop: '50px',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <LoadingShapes sizes={['120px', '30px', '40px']} />
      </Stack>
    );
  }

  if (!isShowAuthWall) {
    return children;
  }

  return (
    <Stack
      component={'main'}
      sx={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          maxWidth: width || '600px',
          width: '100%',
        }}
      >
        {step === 'email-send' && (
          <AuthEmailSentStep email={email} onSendAgain={() => setStep('auth')} />
        )}

        {step === 'features' && (
          <InfoStep
            imageUrl={featuresImageUrl}
            actionButtonTitle={i18n._('Next')}
            title={featuresTitle}
            subTitle={featuresSubTitle}
            listItems={featuresList}
            onClick={nextStep}
            width={width}
            actionButtonAnalyticsId="auth-continue"
          />
        )}

        {step === 'agreement' && (
          <InfoStep
            actionButtonTitle={i18n._('I agree')}
            actionButtonEndIcon={<Check />}
            imageUrl={agreementImageUrl}
            width={width}
            title={i18n._('We will speak freely')}
            subTitle={i18n._('So we need your agreement with that and our policies')}
            listItems={[
              {
                title: i18n._('We process your voice using AI'),
                iconName: 'shield-check',
              },
              {
                title: i18n._('You confirm that you are at least 13 years old'),
                iconName: 'shield-check',
              },

              {
                title: i18n._('Your transcripts are securely stored in our service'),
                iconName: 'shield-check',
              },
              {
                title: i18n._('You can delete your personal data anytime'),
                iconName: 'shield-check',
              },
              {
                title: i18n._('We can send you marketing emails'),
                iconName: 'mail',
              },
              {
                title: i18n._('We use cookies to enhance your experience'),
                iconName: 'cookie',
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
            onClick={nextStep}
            actionButtonAnalyticsId="auth-continue"
          />
        )}

        {step === 'auth' && (
          <AuthSignInStep
            title={authTitle}
            subTitle={authSubTitle}
            subComponent={authSubComponent}
            reassuranceItems={authList.filter((item) => !isPolicyLink(item))}
            email={email}
            onEmailChange={(value) => setEmail(normalizeEmail(value))}
            emailError={
              isValidEmailError ? i18n._('Please enter a valid email address') : emailSignInError
            }
            onSendLink={() => void signInWithEmail()}
            isSendingLink={isEmailSignInLoading}
            sendDisabled={isValidEmailError || isEmailSignInLoading}
            googleTitle={authActionTitle || i18n._('Sign in with Google')}
            onGoogle={() => void signInWithGoogle()}
            isGoogleLoading={isGoogleSignInLoading}
            googleError={googleSignInError}
            lastUsedMethod={lastAuthMethod}
            privacyHref={policyHref(authList, 'privacy')}
            termsHref={policyHref(authList, 'terms')}
            hideActions={hideAuthActions}
            quiet={authActionsQuiet}
          />
        )}
      </Stack>
    </Stack>
  );
};
