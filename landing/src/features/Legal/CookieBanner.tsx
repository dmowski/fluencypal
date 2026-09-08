'use client';

import { Button, Link, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { usePathname } from 'next/navigation';
import { Cookie } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useSyncExternalStore } from 'react';
import { parseLangFromUrl } from '@/features/Lang/parseLangFromUrl';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { buttonStyle } from '@/features/Landing/landingSettings';
import { type CookieConsentChoice, useCookieConsent, writeCookieConsent } from './cookieConsent';

const subscribeToNothing = () => () => {};

const getClientBody = () => document.body;

export const CookieBanner = () => {
  const { i18n } = useLingui();
  const pathname = usePathname() || '/';
  const lang = parseLangFromUrl(pathname);
  const consent = useCookieConsent();
  const mountNode = useSyncExternalStore(subscribeToNothing, getClientBody, () => null);

  if (!mountNode || consent !== null) return null;

  const saveChoice = (choice: CookieConsentChoice) => {
    writeCookieConsent(choice);
  };

  return createPortal(
    <Stack
      component="section"
      role="region"
      aria-label={i18n._('Cookie consent')}
      data-testid="cookie-banner"
      sx={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100000,
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))',
        backgroundColor: 'rgba(10, 18, 30, 0.96)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.28)',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '16px',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          '@media (max-width: 700px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '12px',
            minWidth: 0,
          }}
        >
          <Cookie
            size={22}
            color="#05acff"
            aria-hidden="true"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <Typography
            sx={{
              color: '#eaf3f7',
              fontSize: '0.95rem',
              lineHeight: 1.45,
            }}
          >
            {i18n._('We use cookies to enhance your experience.')}{' '}
            <Link
              href={`${getUrlStart(lang)}cookies`}
              sx={{
                color: '#3dbeff',
                textUnderlineOffset: '3px',
              }}
            >
              {i18n._('Cookies Policy')}
            </Link>
          </Typography>
        </Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            gap: '10px',
            flexShrink: 0,
            '@media (max-width: 700px)': {
              width: '100%',
              '& > button': {
                flex: 1,
              },
            },
          }}
        >
          <Button
            variant="outlined"
            data-testid="cookie-banner-decline"
            onClick={() => saveChoice('declined')}
            sx={{
              ...buttonStyle,
              color: '#fff',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.35)',
              padding: '6px 22px',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
              },
            }}
          >
            {i18n._('Decline')}
          </Button>
          <Button
            variant="contained"
            data-testid="cookie-banner-accept"
            onClick={() => saveChoice('accepted')}
            sx={{
              ...buttonStyle,
              backgroundColor: '#05acff',
              color: '#111',
              padding: '6px 22px',
              '&:hover': {
                backgroundColor: '#3dbeff',
              },
            }}
          >
            {i18n._('Accept')}
          </Button>
        </Stack>
      </Stack>
    </Stack>,
    mountNode,
  );
};
