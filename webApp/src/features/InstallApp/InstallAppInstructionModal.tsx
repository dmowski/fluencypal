'use client';

import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { Share, Smartphone, MoreVertical } from 'lucide-react';

import { appName } from '../SEO/appInfo';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import type { MobilePlatform } from './types';

interface InstallAppInstructionModalProps {
  platform: MobilePlatform;
  onClose: () => void;
}

const InstructionStep = ({
  step,
  title,
  icon,
}: {
  step: number;
  title: string;
  icon?: React.ReactNode;
}) => (
  <Stack
    direction="row"
    sx={{
      gap: '14px',
      alignItems: 'flex-start',
    }}
  >
    <Stack
      sx={{
        minWidth: '28px',
        height: '28px',
        borderRadius: '999px',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      {step}
    </Stack>
    <Stack sx={{ gap: '6px', flex: 1 }}>
      <Typography sx={{ color: '#fff', lineHeight: 1.45 }}>{title}</Typography>
      {icon}
    </Stack>
  </Stack>
);

export const InstallAppInstructionModal = ({ platform, onClose }: InstallAppInstructionModalProps) => {
  const { i18n } = useLingui();

  const iosSteps = [
    i18n._('Tap the Share button at the bottom of Safari.'),
    i18n._('Scroll down and tap "Add to Home Screen".'),
    i18n._('Tap "Add" in the top-right corner.'),
  ];

  const androidSteps = [
    i18n._('Tap the menu button in the top-right corner of Chrome.'),
    i18n._('Tap "Install app" or "Add to Home screen".'),
    i18n._('Confirm the installation.'),
  ];

  const otherSteps = [
    i18n._('Open your browser menu.'),
    i18n._('Look for "Install app" or "Add to Home screen".'),
    i18n._('Follow the prompts to add {appName} to your home screen.', { appName }),
  ];

  const steps = platform === 'ios' ? iosSteps : platform === 'android' ? androidSteps : otherSteps;
  const platformLabel =
    platform === 'ios'
      ? i18n._('iPhone / iPad')
      : platform === 'android'
        ? i18n._('Android')
        : i18n._('Mobile browser');

  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="80px 16px 24px" desktopPadding="80px 16px 24px">
      <Stack
        sx={{
          width: '100%',
          maxWidth: '560px',
          margin: '0 auto',
          gap: '24px',
          padding: '0 8px 24px',
        }}
      >
        <Stack sx={{ gap: '8px' }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>
            {i18n._('Install {appName}', { appName })}
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            {i18n._('Add the app to your home screen for quick access. Instructions for {platformLabel}:', {
              platformLabel,
            })}
          </Typography>
        </Stack>

        <Stack sx={{ gap: '18px' }}>
          {steps.map((step, index) => (
            <InstructionStep
              key={step}
              step={index + 1}
              title={step}
              icon={
                index === 0 && platform === 'ios' ? (
                  <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
                    <Share size={18} />
                    <Typography variant="caption">{i18n._('Share')}</Typography>
                  </Stack>
                ) : index === 0 && platform === 'android' ? (
                  <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
                    <MoreVertical size={18} />
                    <Typography variant="caption">{i18n._('Menu')}</Typography>
                  </Stack>
                ) : index === 1 ? (
                  <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
                    <Smartphone size={18} />
                    <Typography variant="caption">{i18n._('Home screen')}</Typography>
                  </Stack>
                ) : undefined
              }
            />
          ))}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
