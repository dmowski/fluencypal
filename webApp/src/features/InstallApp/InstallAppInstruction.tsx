'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { appName } from '../SEO/appInfo';
import { GradientCard } from '../uiKit/Card/GradientCard';
import { StoreButton } from '../uiKit/Card/StoreCard/StoreButton';
import { InstallAppInstructionSteps } from './InstallAppInstructionSteps';
import { usePwaInstall } from './usePwaInstall';
import { useAuth } from '../Auth/useAuth';

export const InstallAppInstruction = () => {
  const { i18n } = useLingui();
  const install = usePwaInstall();
  const auth = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!install.shouldShowCard) {
    return null;
  }

  const handleActionClick = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (install.canNativePrompt) {
      const installed = await install.promptInstall();
      if (installed) {
        return;
      }
    }

    setIsExpanded(true);
  };

  return (
    <Stack data-testid="install-app-instruction-card">
      <GradientCard
        padding="16px 18px"
        strokeWidth="1px"
        startColor="rgba(85, 141, 219, 0.55)"
        endColor="rgba(5, 172, 255, 0.55)"
        backgroundColor="rgba(28, 37, 49, 0.88)"
      >
        <Stack sx={{ width: '100%', gap: isExpanded ? '16px' : 0 }}>
          <Stack
            direction="row"
            sx={{
              width: '100%',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <Stack
              sx={{
                minWidth: '42px',
                height: '42px',
                borderRadius: '12px',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Stack
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  borderRadius: '12px',
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.041) 100%)',
                }}
              />
              <Stack
                sx={{
                  position: 'absolute',
                  top: '1px',
                  left: '1px',
                  borderRadius: '11px',
                  width: 'calc(100% - 2px)',
                  height: 'calc(100% - 2px)',
                  background: '#0D1521',
                }}
              />
              <img
                src="/favicon.svg"
                alt="App Icon"
                width={35}
                height={35}
                style={{ borderRadius: '12px', position: 'relative', zIndex: 1 }}
              />
            </Stack>

            <Stack sx={{ flex: 1, gap: '4px', minWidth: 0 }}>
              <Typography
                sx={{
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {i18n._('Install {appName} on your phone', { appName })}
              </Typography>
            </Stack>

            <StoreButton
              title={isExpanded ? i18n._('Hide') : i18n._('Install')}
              onClick={handleActionClick}
            />
          </Stack>

          {isExpanded ? (
            <>
              <InstallAppInstructionSteps platform={install.platform} />
              <Button
                data-testid="install-app-hide-forever"
                onClick={install.dismissForever}
                sx={{
                  alignSelf: 'center',
                  marginTop: '4px',
                  color: 'rgba(255, 255, 255, 0.55)',
                  fontSize: '13px',
                  fontWeight: 500,
                  textTransform: 'none',
                  ':hover': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  },
                }}
              >
                {i18n._('Hide forever')}
              </Button>
            </>
          ) : null}
        </Stack>
      </GradientCard>
    </Stack>
  );
};
