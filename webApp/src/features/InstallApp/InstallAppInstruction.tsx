'use client';

import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { Smartphone } from 'lucide-react';
import { useState } from 'react';

import { appName } from '../SEO/appInfo';
import { GradientCard } from '../uiKit/Card/GradientCard';
import { StoreButton } from '../uiKit/Card/StoreCard/StoreButton';
import { InstallAppInstructionModal } from './InstallAppInstructionModal';
import { usePwaInstall } from './usePwaInstall';
import { useAuth } from '../Auth/useAuth';

export const InstallAppInstruction = () => {
  const { i18n } = useLingui();
  const install = usePwaInstall();
  const auth = useAuth();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  if (!install.shouldShowCard) {
    return null;
  }

  const handleInstallClick = async () => {
    if (install.canNativePrompt) {
      const installed = await install.promptInstall();
      if (installed) {
        return;
      }
    }

    setIsInstructionsOpen(true);
  };

  if (!auth.isFounder) {
    return null;
  }

  return (
    <>
      <Stack data-testid="install-app-instruction-card">
        <GradientCard
          padding="16px 18px"
          strokeWidth="1px"
          startColor="rgba(85, 141, 219, 0.55)"
          endColor="rgba(5, 172, 255, 0.55)"
          backgroundColor="rgba(10, 18, 30, 0.88)"
        >
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
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Smartphone size={22} color="#9ec5ff" />
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
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.68)',
                  lineHeight: 1.35,
                }}
              >
                {i18n._('Open the app from your home screen for a faster, app-like experience.')}
              </Typography>
            </Stack>

            <StoreButton title={i18n._('Install App')} onClick={handleInstallClick} />
          </Stack>
        </GradientCard>
      </Stack>

      {isInstructionsOpen && (
        <InstallAppInstructionModal
          platform={install.platform}
          onClose={() => setIsInstructionsOpen(false)}
        />
      )}
    </>
  );
};
